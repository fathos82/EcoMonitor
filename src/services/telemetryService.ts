import protobuf from 'protobufjs';
import type { DataPoint } from '../types';

// ─── Schemas Protobuf inline ──────────────────────────────────────────────────
//
// Mantidos como string para evitar o passo de compilação do protoc.
// Se o schema mudar, basta editar aqui.

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

const REST_PROTO = `
  syntax = "proto3";
  message SensorReadingResponse {
    int64 timestamp = 1;
    float value     = 2;
  }
  message SensorReadingsResponse {
    repeated SensorReadingResponse readings = 1;
  }
`;

// ─── Cache de tipos compilados (evita reparse a cada mensagem) ────────────────

let _mqttBatchType:    protobuf.Type | null = null;
let _restResponseType: protobuf.Type | null = null;

async function getMqttBatchType(): Promise<protobuf.Type> {
    if (_mqttBatchType) return _mqttBatchType;
    const root = protobuf.parse(MQTT_PROTO).root;
    _mqttBatchType = root.lookupType('SensorReadingBatch');
    return _mqttBatchType;
}

async function getRestResponseType(): Promise<protobuf.Type> {
    if (_restResponseType) return _restResponseType;
    const root = protobuf.parse(REST_PROTO).root;
    _restResponseType = root.lookupType('SensorReadingsResponse');
    return _restResponseType;
}

// ─── Decodificadores ──────────────────────────────────────────────────────────

/**
 * Decodifica um SensorReadingBatch vindo do MQTT (binário).
 * Retorna um array de DataPoints com timestamp absoluto em ms.
 */
export async function decodeMqttBatch(
    raw: Uint8Array,
    valueKey: string,          // ex: 'humidity', 'temp', 'aqi'
): Promise<DataPoint[]> {
    const type = await getMqttBatchType();
    const msg  = type.decode(raw) as any;

    const baseMs: number =
        typeof msg.baseTimestamp === 'object'
            ? msg.baseTimestamp.toNumber()   // Long
            : Number(msg.baseTimestamp);

    return (msg.readings ?? []).map((r: any) => ({
        time:       baseMs + r.deltaMs,
        [valueKey]: r.value,
    }));
}

/**
 * Decodifica um SensorReadingsResponse vindo da API REST (binário).
 * Retorna um array de DataPoints ordenado por timestamp.
 */
export async function decodeRestHistory(
    raw: ArrayBuffer,
    valueKey: string,
): Promise<DataPoint[]> {
    const type  = await getRestResponseType();
    const bytes = new Uint8Array(raw);
    const msg   = type.decode(bytes) as any;

    return (msg.readings ?? [])
        .map((r: any) => ({
            time:       typeof r.timestamp === 'object'
                            ? r.timestamp.toNumber()
                            : Number(r.timestamp),
            [valueKey]: r.value,
        }))
        .sort((a: DataPoint, b: DataPoint) => a.time - b.time);
}
