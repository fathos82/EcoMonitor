import { useCallback, useEffect, useRef, useState } from 'react';
import mqtt, { type MqttClient } from 'mqtt';
import type { Plant, DataPoint, MeasurementType } from '../types';
import { MQTT_BROKER_URL, buildTopic } from '../config/mqtt';
import { decodeMqttBatch, decodeRestHistory } from '../services/telemetryService';
import { API_URL } from '../config/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TelemetryMap = Partial<Record<MeasurementType, DataPoint[]>>;

interface UseTelemetryResult {
    data:       TelemetryMap;
    loading:    boolean;
    connected:  boolean;
    refresh:    () => void;
}

// ─── Mapeamento MeasurementType → chave do DataPoint ─────────────────────────

const  VALUE_KEY: Record<MeasurementType, string> = {
    SOIL_MOISTURE: 'humidity',
    TEMPERATURE:   'temp',
    AIR_QUALITY:   'aqi',
    MOCK: 'mock'
};

// ─── Helpers de data ──────────────────────────────────────────────────────────

function startOfDayUTC(): string {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
}

function nowISO(): string {
    return new Date().toISOString();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Gerencia toda a telemetria de uma planta:
 * 1. Busca histórico do dia via REST ao montar (e ao chamar refresh())
 * 2. Abre conexão MQTT e faz subscribe nos tópicos dos sensores ativos
 * 3. Appenda novos pontos em tempo real conforme chegam
 * 4. Fecha a conexão e limpa subscriptions ao desmontar
 */
export function useTelemetry(plant: Plant | null): UseTelemetryResult {
    const [data, setData]           = useState<TelemetryMap>({});
    const [loading, setLoading]     = useState(false);
    const [connected, setConnected] = useState(false);

    const clientRef    = useRef<MqttClient | null>(null);
    const mountedRef   = useRef(true);

    // ── Carrega histórico REST ─────────────────────────────────────────────────

    const loadHistory = useCallback(async (p: Plant) => {
        if (!p.measurementsMapping) return;
        setLoading(true);

        const entries = Object.entries(p.measurementsMapping) as [MeasurementType, { measurementId: number; sensorId: number } | null][];
        const active  = entries.filter(([, v]) => v !== null) as [MeasurementType, { measurementId: number; sensorId: number }][];

        const results = await Promise.allSettled(
            active.map(async ([type, { measurementId }]) => {
                const valueKey = VALUE_KEY[type];
                const url = `${API_URL}measurements/${measurementId}/history/newprotobuf/`
                    + `?start=${encodeURIComponent(startOfDayUTC())}`
                    + `&end=${encodeURIComponent(nowISO())}`;

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        Accept: 'application/x-protobuf',
                    },
                });

                if (!res.ok) throw new Error(`HTTP ${res.status} para ${type}`);
                const buffer = await res.arrayBuffer();
                const points = await decodeRestHistory(buffer, valueKey);
                return { type, points };
            })
        );

        if (!mountedRef.current) return;

        const next: TelemetryMap = {};
        for (const result of results) {
            if (result.status === 'fulfilled') {
                next[result.value.type] = result.value.points;
            } else {
                console.warn('[Telemetry] Erro ao carregar histórico:', result.reason);
            }
        }

        setData(next);
        setLoading(false);
    }, []);

    // ── Gerencia conexão MQTT ──────────────────────────────────────────────────

    const connectMqtt = useCallback((p: Plant) => {
        if (!p.measurementsMapping) return;

        // Encerra conexão anterior se existir
        if (clientRef.current) {
            clientRef.current.end(true);
            clientRef.current = null;
        }

        const entries = Object.entries(p.measurementsMapping) as [MeasurementType, { measurementId: number; sensorId: number } | null][];
        const active  = entries.filter(([, v]) => v !== null) as [MeasurementType, { measurementId: number; sensorId: number }][];

        if (active.length === 0) return;

        // Monta mapa tópico → { type, valueKey } para lookup rápido no onMessage
        const topicMap: Record<string, { type: MeasurementType; valueKey: string }> = {};
        const topics: string[] = [];

        for (const [type, { sensorId }] of active) {
            const topic = buildTopic(sensorId, type);
            topicMap[topic] = { type, valueKey: VALUE_KEY[type] };
            topics.push(topic);
        }

        const client = mqtt.connect(MQTT_BROKER_URL, {
            clean:         true,
            reconnectPeriod: 3000,
        });

        client.on('connect', () => {
            if (!mountedRef.current) return;
            setConnected(true);
            client.subscribe(topics, { qos: 0 }, (err) => {
                if (err) console.warn('[MQTT] Erro ao subscrever:', err);
            });
        });

        client.on('disconnect', () => { if (mountedRef.current) setConnected(false); });
        client.on('error',      (e) => console.warn('[MQTT] Erro:', e));

        client.on('message', async (topic, payload) => {
            const meta = topicMap[topic];
            if (!meta || !mountedRef.current) return;

            try {
                const newPoints = await decodeMqttBatch(payload, meta.valueKey);
                if (!mountedRef.current || newPoints.length === 0) return;

                setData((prev) => {
                    const existing = prev[meta.type] ?? [];
                    // Evita duplicatas por timestamp
                    const lastTime = existing.at(-1)?.time ?? 0;
                    const fresh    = newPoints.filter((p) => p.time > lastTime);
                    if (fresh.length === 0) return prev;
                    return { ...prev, [meta.type]: [...existing, ...fresh] };
                });
            } catch (e) {
                console.warn('[MQTT] Erro ao decodificar batch:', e);
            }
        });

        clientRef.current = client;
    }, []);

    // ── Efeito principal: inicializa ao mudar de planta ───────────────────────

    useEffect(() => {
        mountedRef.current = true;

        if (!plant) return;

        setData({});
        setConnected(false);

        loadHistory(plant);
        connectMqtt(plant);

        return () => {
            mountedRef.current = false;
            if (clientRef.current) {
                clientRef.current.end(true);
                clientRef.current = null;
            }
            setConnected(false);
        };
    }, [plant?.id]); // re-executa só ao trocar de planta

    // ── Refresh manual ────────────────────────────────────────────────────────

    const refresh = useCallback(() => {
        if (!plant) return;
        loadHistory(plant);
    }, [plant, loadHistory]);

    return { data, loading, connected, refresh };
}