import { useCallback, useEffect, useRef, useState } from 'react';
import mqtt, { type MqttClient } from 'mqtt';
import type { Plant, DataPoint, MeasurementType } from '../types';
import { MQTT_BROKER_URL, buildTopic } from '../config/mqtt';
import { TELEMETRY_CONFIG } from '../config/telemetry';
import { decodeMqttBatch } from '../services/telemetryService';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type TelemetryMap = Partial<Record<MeasurementType, DataPoint[]>>;

export interface UseTelemetryResult {
    /** Todos os pontos acumulados na janela (windowPoints). */
    data:      TelemetryMap;
    connected: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTelemetry(plant: Plant | null): UseTelemetryResult {
    const { windowPoints, drainIntervalMs, maxQueueSize } = TELEMETRY_CONFIG;

    const [data,      setData]      = useState<TelemetryMap>({});
    const [connected, setConnected] = useState(false);

    const clientRef      = useRef<MqttClient | null>(null);
    const mountedRef     = useRef(true);
    const outputQueueRef = useRef<Map<MeasurementType, DataPoint[]>>(new Map());
    const drainTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Drain: libera 1 ponto por tipo a cada tick ────────────────────────────

    const startDrain = useCallback(() => {
        if (drainTimerRef.current) return;

        drainTimerRef.current = setInterval(() => {
            if (!mountedRef.current) return;

            const queue = outputQueueRef.current;
            let hasWork = false;
            queue.forEach((pts) => { if (pts.length > 0) hasWork = true; });
            if (!hasWork) return;

            setData((prev) => {
                const next = { ...prev };

                queue.forEach((pts, type) => {
                    if (pts.length === 0) return;

                    const trimmed = pts.length > maxQueueSize
                        ? pts.slice(pts.length - maxQueueSize)
                        : pts;

                    const [point, ...rest] = trimmed;
                    outputQueueRef.current.set(type, rest);

                    const existing = next[type] ?? [];
                    next[type] = [...existing, point].slice(-windowPoints);
                });

                return next;
            });
        }, drainIntervalMs);
    }, []);

    const stopDrain = useCallback(() => {
        if (drainTimerRef.current) {
            clearInterval(drainTimerRef.current);
            drainTimerRef.current = null;
        }
    }, []);

    // ── MQTT ──────────────────────────────────────────────────────────────────

    const connectMqtt = useCallback((p: Plant) => {
        if (!p.measurementsMapping) return;

        if (clientRef.current) {
            clientRef.current.end(true);
            clientRef.current = null;
        }

        const entries = Object.entries(p.measurementsMapping) as
            [MeasurementType, { sensorId: number } | null][];
        const active = entries.filter(([, v]) => v !== null) as
            [MeasurementType, { sensorId: number }][];
        if (active.length === 0) return;

        const topicMap: Record<string, MeasurementType> = {};
        const topics: string[] = [];

        active.forEach(([type, { sensorId }]) => {
            const topic = buildTopic(sensorId, type);
            topicMap[topic] = type;
            topics.push(topic);
        });

        const client = mqtt.connect(MQTT_BROKER_URL, {
            clean: true,
            reconnectPeriod: 3_000,
        });

        client.on('connect', () => {
            if (!mountedRef.current) return;
            setConnected(true);
            client.subscribe(topics, { qos: 0 });
        });

        client.on('reconnect', () => { if (mountedRef.current) setConnected(false); });
        client.on('disconnect', () => { if (mountedRef.current) setConnected(false); });

        client.on('message', async (topic, payload) => {
            const type = topicMap[topic];
            if (!type || !mountedRef.current) return;
            try {
                const newPoints = await decodeMqttBatch(payload);
                if (!mountedRef.current || newPoints.length === 0) return;
                const current = outputQueueRef.current.get(type) ?? [];
                outputQueueRef.current.set(type, [...current, ...newPoints]);
            } catch (e) {
                console.warn('[MQTT] Erro ao decodificar batch:', e);
            }
        });

        clientRef.current = client;
    }, []);

    // ── Efeito principal ──────────────────────────────────────────────────────

    useEffect(() => {
        mountedRef.current = true;
        if (!plant) return;

        setData({});
        setConnected(false);
        outputQueueRef.current.clear();

        startDrain();

        const timer = setTimeout(() => {
            if (mountedRef.current) connectMqtt(plant);
        }, 100);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
            stopDrain();
            if (clientRef.current) {
                clientRef.current.end(true);
                clientRef.current = null;
            }
            outputQueueRef.current.clear();
        };
    }, [plant?.id]);

    return { data, connected };
}