import protobuf from 'protobufjs';
import type { DataPoint } from '../types';

// ─── Schema Protobuf — MQTT only ──────────────────────────────────────────────
// O histórico REST agora retorna JSON. Apenas mensagens MQTT usam Protobuf.

const MQTT_PROTO = `
  syntax = "proto3";
  message SensorReading {
    int32 delta_ms = 1;
    float value    = 2;
  }
  message SensorReadingBatch {
    int64                 base_timestamp = 1;
    repeated SensorReading readings      = 2;
  }
`;

// ─── Cache do tipo compilado ──────────────────────────────────────────────────

let _mqttBatchType: protobuf.Type | null = null;

async function getMqttBatchType(): Promise<protobuf.Type> {
    if (_mqttBatchType) return _mqttBatchType;
    const root = protobuf.parse(MQTT_PROTO).root;
    _mqttBatchType = root.lookupType('SensorReadingBatch');
    return _mqttBatchType;
}

// ─── Decodificador MQTT ───────────────────────────────────────────────────────

/**
 * Decodifica um SensorReadingBatch vindo do MQTT (binário Protobuf).
 * Retorna DataPoints com timestamp absoluto em ms.
 */
export async function decodeMqttBatch(raw: Uint8Array): Promise<DataPoint[]> {
    const type = await getMqttBatchType();
    const msg  = type.decode(raw) as any;

    const baseMs: number =
        typeof msg.baseTimestamp === 'object'
            ? msg.baseTimestamp.toNumber()
            : Number(msg.baseTimestamp);

    return (msg.readings ?? []).map((r: any) => ({
        time:  baseMs + r.deltaMs,
        value: r.value,
    }));
}