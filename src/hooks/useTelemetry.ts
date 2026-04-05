import { useCallback, useEffect, useRef, useState } from 'react';
import mqtt, { type MqttClient } from 'mqtt';
import type { Plant, DataPoint, MeasurementType } from '../types';
import { MQTT_BROKER_URL, buildTopic } from '../config/mqtt';
import { decodeMqttBatch, decodeRestHistory } from '../services/telemetryService';
import { API_URL } from '../config/api';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type TelemetryMap = Partial<Record<MeasurementType, DataPoint[]>>;

export interface TelemetryConfig {
    /**
     * Quantos pontos manter visíveis no gráfico (janela deslizante).
     * @default 120
     */
    windowPoints?: number;

    /**
     * Intervalo (ms) entre cada ponto liberado da fila de saída.
     * Fórmula: intervalo_batch_ms / tamanho_batch
     * Ex: broker envia 10 pts a cada 2s → 2000 / 10 = 200ms
     * @default 200
     */
    drainIntervalMs?: number;

    /**
     * Tamanho máximo da fila de saída por tipo.
     * Descarta os mais antigos se acumular além desse limite.
     * @default 50
     */
    maxQueueSize?: number;
}

interface UseTelemetryResult {
    rawData:   TelemetryMap;
    chartData: TelemetryMap;
    loading:   boolean;
    connected: boolean;
    refresh:   () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: Required<TelemetryConfig> = {
    windowPoints:    520,
    drainIntervalMs: 200,
    maxQueueSize:    50,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDayUTC(): string {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
}

function nowISO(): string {
    return new Date().toISOString();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTelemetry(
    plant:  Plant | null,
    config: TelemetryConfig = {},
): UseTelemetryResult {
    const { windowPoints, drainIntervalMs, maxQueueSize } = {
        ...DEFAULT_CONFIG,
        ...config,
    };

    const [rawData,   setRawData]   = useState<TelemetryMap>({});
    const [chartData, setChartData] = useState<TelemetryMap>({});
    const [loading,   setLoading]   = useState(false);
    const [connected, setConnected] = useState(false);

    const clientRef     = useRef<MqttClient | null>(null);
    const mountedRef    = useRef(true);

    /**
     * Fila de saída: pontos vindos do MQTT aguardam aqui.
     * O drain consome 1 por tick → chartData avança suavemente.
     * Não há filtro de duplicatas aqui — o broker é a fonte da verdade.
     */
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

            setChartData((prev) => {
                const next = { ...prev };

                queue.forEach((pts, type) => {
                    if (pts.length === 0) return;

                    // Descarte se a fila acumulou demais
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

            // rawData acompanha o que foi liberado para o gráfico
            setRawData((prev) => {
                const next = { ...prev };
                queue.forEach((_, type) => {
                    next[type] = chartData[type] ?? prev[type] ?? [];
                });
                return next;
            });

        }, drainIntervalMs);
    }, [drainIntervalMs, maxQueueSize, windowPoints]);

    const stopDrain = useCallback(() => {
        if (drainTimerRef.current) {
            clearInterval(drainTimerRef.current);
            drainTimerRef.current = null;
        }
    }, []);

    // ── Histórico: seed inicial do gráfico ────────────────────────────────────

    const loadHistory = useCallback(async (p: Plant) => {
        if (!p.measurementsMapping) return;
        setLoading(true);

        const entries = Object.entries(p.measurementsMapping) as
            [MeasurementType, { measurementId: number; sensorId: number } | null][];
        const active = entries.filter(([, v]) => v !== null) as
            [MeasurementType, { measurementId: number; sensorId: number }][];

        const results = await Promise.allSettled(
            active.map(async ([type, { measurementId }]) => {
                const url =
                    `${API_URL}measurements/${measurementId}/history/newprotobuf/` +
                    `?start=${encodeURIComponent(startOfDayUTC())}` +
                    `&end=${encodeURIComponent(nowISO())}`;

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        Accept: 'application/x-protobuf',
                    },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const buf    = await res.arrayBuffer();
                const points = await decodeRestHistory(buf);
                return { type, points };
            })
        );

        if (!mountedRef.current) return;

        const nextRaw:   TelemetryMap = {};
        const nextChart: TelemetryMap = {};

        results.forEach((r) => {
            if (r.status === 'fulfilled') {
                const { type, points } = r.value;
                nextRaw[type]   = points;
                nextChart[type] = points.slice(-windowPoints);
            }
        });

        setRawData(nextRaw);
        setChartData(nextChart);
        setLoading(false);
    }, [windowPoints]);

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

        client.on('reconnect', () => {
            if (mountedRef.current) setConnected(false);
        });

        client.on('disconnect', () => {
            if (mountedRef.current) setConnected(false);
        });

        client.on('message', async (topic, payload) => {
            const type = topicMap[topic];
            if (!type || !mountedRef.current) return;

            try {
                const newPoints = await decodeMqttBatch(payload);
                if (!mountedRef.current || newPoints.length === 0) return;

                // ─────────────────────────────────────────────────────────────
                // Sem filtro de duplicatas aqui.
                //
                // O filtro antigo (pt.time > lastTime) lia rawDataRef que só
                // existia no momento da criação do handler — depois que o
                // histórico carregava, todos os pontos novos eram descartados
                // como "duplicatas" (closure stale).
                //
                // O broker é a fonte da verdade: qualquer ponto que chegou
                // pelo MQTT vai direto para a fila de saída.
                // ─────────────────────────────────────────────────────────────
                const current = outputQueueRef.current.get(type) ?? [];
                outputQueueRef.current.set(type, [...current, ...newPoints]);

            } catch (e) {
                console.warn('[MQTT] Erro ao decodificar batch:', e);
            }
        });

        clientRef.current = client;
    }, []); // sem dependências — não lê state nem refs de state

    // ── Efeito principal ─────────────────────────────────────────────────────

    useEffect(() => {
        mountedRef.current = true;
        if (!plant) return;

        setRawData({});
        setChartData({});
        setConnected(false);
        outputQueueRef.current.clear();

        loadHistory(plant);
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

    const refresh = useCallback(() => {
        if (!plant) return;
        outputQueueRef.current.clear();
        loadHistory(plant);
    }, [plant, loadHistory]);

    return { rawData, chartData, loading, connected, refresh };
}