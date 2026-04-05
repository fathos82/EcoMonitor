import { useCallback, useEffect, useRef, useState } from 'react';
import mqtt, { type MqttClient } from 'mqtt';
import type { Plant, DataPoint, MeasurementType } from '../types';
import { MQTT_BROKER_URL, buildTopic } from '../config/mqtt';
import { decodeMqttBatch, decodeRestHistory } from '../services/telemetryService';
import { API_URL } from '../config/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TelemetryMap = Partial<Record<MeasurementType, DataPoint[]>>;

interface UseTelemetryResult {
    rawData: TelemetryMap;   // todos os pontos — usado para stats
    chartData: TelemetryMap; // LTTB + sliding window — usado no gráfico
    loading: boolean;
    connected: boolean;
    refresh: () => void;
}

// ─── LTTB e Helpers ──────────────────────────────────────────────────────────

const POINTS_LIMIT: Record<string, number> = {
    '1H': 120,
    '24H': 300,
    '7D': 500,
};

function lttb(data: DataPoint[], threshold: number): DataPoint[] {
    if (data.length <= threshold) return data;
    const sampled: DataPoint[] = [data[0]];
    const bucketSize = (data.length - 2) / (threshold - 2);
    let a = 0;

    for (let i = 0; i < threshold - 2; i++) {
        const nextStart = Math.floor((i + 1) * bucketSize) + 1;
        const nextEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);
        let avgTime = 0, avgValue = 0;
        const len = nextEnd - nextStart;
        for (let j = nextStart; j < nextEnd; j++) {
            avgTime += data[j].time;
            avgValue += data[j].value;
        }
        avgTime /= len; avgValue /= len;
        const bucketStart = Math.floor(i * bucketSize) + 1;
        const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;
        let maxArea = -1, maxIdx = bucketStart;
        const pa = data[a];
        for (let j = bucketStart; j < bucketEnd; j++) {
            const area = Math.abs((pa.time - avgTime) * (data[j].value - pa.value) - (pa.time - data[j].time) * (avgValue - pa.value)) * 0.5;
            if (area > maxArea) { maxArea = area; maxIdx = j; }
        }
        sampled.push(data[maxIdx]);
        a = maxIdx;
    }
    sampled.push(data[data.length - 1]);
    return sampled;
}

function startOfDayUTC(): string {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
}

function nowISO(): string {
    return new Date().toISOString();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTelemetry(plant: Plant | null, timeRange = '24H'): UseTelemetryResult {
    const [rawData, setRawData] = useState<TelemetryMap>({});
    const [chartData, setChartData] = useState<TelemetryMap>({});
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    const clientRef = useRef<MqttClient | null>(null);
    const mountedRef = useRef(true);

    // Refs para o sistema de buffer/throttling
    const bufferRef = useRef<Map<MeasurementType, DataPoint[]>>(new Map());
    const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadHistory = useCallback(async (p: Plant) => {
        if (!p.measurementsMapping) return;
        setLoading(true);

        const entries = Object.entries(p.measurementsMapping) as [MeasurementType, { measurementId: number; sensorId: number } | null][];
        const active = entries.filter(([, v]) => v !== null) as [MeasurementType, { measurementId: number; sensorId: number }][];

        const results = await Promise.allSettled(
            active.map(async ([type, { measurementId }]) => {
                const url = `${API_URL}measurements/${measurementId}/history/newprotobuf/?start=${encodeURIComponent(startOfDayUTC())}&end=${encodeURIComponent(nowISO())}`;
                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        Accept: 'application/x-protobuf',
                    },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status} para ${type}`);
                const buffer = await res.arrayBuffer();
                const points = await decodeRestHistory(buffer);
                return { type, points };
            })
        );

        if (!mountedRef.current) return;

        const nextRaw: TelemetryMap = {};
        const nextChart: TelemetryMap = {};
        const limit = POINTS_LIMIT[timeRange] ?? 300;

        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                const { type, points } = result.value;
                nextRaw[type] = points;
                nextChart[type] = lttb(points, limit);
            }
        });

        setRawData(nextRaw);
        setChartData(nextChart);
        setLoading(false);
    }, [timeRange]);

    const flush = useCallback(() => {
        if (!mountedRef.current || bufferRef.current.size === 0) return;

        const snapshot = new Map(bufferRef.current);
        bufferRef.current.clear();
        flushTimerRef.current = null;

        setRawData((prev) => {
            const next = { ...prev };
            snapshot.forEach((pts, type) => {
                const existing = next[type] ?? [];
                const lastTime = existing.at(-1)?.time ?? 0;
                const fresh = pts.filter((pt) => pt.time > lastTime);
                if (fresh.length > 0) next[type] = [...existing, ...fresh];
            });
            return next;
        });

        setChartData((prev) => {
            const next = { ...prev };
            snapshot.forEach((pts, type) => {
                const existing = next[type] ?? [];
                const lastTime = existing.at(-1)?.time ?? 0;
                const fresh = pts.filter((pt) => pt.time > lastTime);
                if (fresh.length === 0) return;

                const combined = [...existing, ...fresh];
                // Mantém o tamanho do array estável (Sliding Window)
                next[type] = combined.slice(-(existing.length || combined.length));
            });
            return next;
        });
    }, []);

    const connectMqtt = useCallback((p: Plant) => {
        if (!p.measurementsMapping) return;

        if (clientRef.current) {
            clientRef.current.end(true);
        }

        const entries = Object.entries(p.measurementsMapping) as [MeasurementType, { sensorId: number } | null][];
        const active = entries.filter(([, v]) => v !== null) as [MeasurementType, { sensorId: number }][];
        if (active.length === 0) return;

        const topicMap: Record<string, MeasurementType> = {};
        const topics: string[] = [];

        active.forEach(([type, { sensorId }]) => {
            const topic = buildTopic(sensorId, type);
            topicMap[topic] = type;
            topics.push(topic);
        });

        const client = mqtt.connect(MQTT_BROKER_URL, { clean: true, reconnectPeriod: 3000 });

        client.on('connect', () => {
            if (!mountedRef.current) return;
            setConnected(true);
            client.subscribe(topics, { qos: 0 });
        });

        client.on('disconnect', () => { if (mountedRef.current) setConnected(false); });

        client.on('message', async (topic, payload) => {
            const type = topicMap[topic];
            if (!type || !mountedRef.current) return;

            try {
                const newPoints = await decodeMqttBatch(payload);
                if (!mountedRef.current || newPoints.length === 0) return;

                // Acumula no buffer via Ref
                const current = bufferRef.current.get(type) ?? [];
                bufferRef.current.set(type, [...current, ...newPoints]);

                // Throttle: agenda o flush para 500ms se não houver um pendente
                if (!flushTimerRef.current) {
                    flushTimerRef.current = setTimeout(flush, 500);
                }
            } catch (e) {
                console.warn('[MQTT] Erro ao decodificar batch:', e);
            }
        });

        clientRef.current = client;
    }, [flush]);

    useEffect(() => {
        mountedRef.current = true;
        if (!plant) return;

        setRawData({});
        setChartData({});
        setConnected(false);

        loadHistory(plant);

        const timer = setTimeout(() => {
            if (mountedRef.current) connectMqtt(plant);
        }, 100);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
            if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
            if (clientRef.current) {
                clientRef.current.end(true);
                clientRef.current = null;
            }
            bufferRef.current.clear();
        };
    }, [plant?.id, timeRange, loadHistory, connectMqtt]);

    const refresh = useCallback(() => {
        if (plant) loadHistory(plant);
    }, [plant, loadHistory]);

    return { rawData, chartData, loading, connected, refresh };
}