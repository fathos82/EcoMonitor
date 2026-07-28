import { api } from './api';
import type { DataPoint, MeasurementType } from '../types';
import { TELEMETRY_CONFIG } from '../config/telemetry';

// ─── Tipos do contrato ────────────────────────────────────────────────────────

export interface CreateMeasurementRequest {
    plantId:         number;
    measurementType: MeasurementType;
    sensorId:        number;
}

export interface ApiMeasurement {
    id:              number;
    plantId:         number;
    measurementType: MeasurementType;
    sensorId:        number;
}

export interface MeasurementHistoryPoint {
    value:     number;
    timestamp: string;   // ISO string (Instant serializado pelo Spring)
}

export interface MeasurementHistoryResponse {
    min:   number;
    max:   number;
    avg:   number;
    value: MeasurementHistoryPoint[];
}

export interface HistoryResult {
    min:    number;
    max:    number;
    avg:    number;
    points: DataPoint[];
}

// ─── Chamadas HTTP ────────────────────────────────────────────────────────────

export const measurementService = {
    /** POST /measurements/ — associa uma medida a uma planta */
    async create(data: CreateMeasurementRequest): Promise<ApiMeasurement> {
        const res = await api.post<ApiMeasurement>('/measurements/', data);
        return res.data;
    },

    /** Cria em paralelo todas as medidas selecionadas para uma planta */
    async createMany(
        plantId: number,
        mapping: Partial<Record<MeasurementType, number | null>>
    ): Promise<void> {
        const entries = (Object.entries(mapping) as [MeasurementType, number | null][])
            .filter((entry): entry is [MeasurementType, number] => entry[1] !== null);

        await Promise.all(
            entries.map(([measurementType, sensorId]) =>
                measurementService.create({ plantId, measurementType, sensorId })
            )
        );
    },

    /**
     * GET /api/measurements/{id}/history/
     * Retorna estatísticas globais + pontos LTTB prontos para plotar.
     * targetPoints alinhado com TELEMETRY_CONFIG para consistência com o gráfico.
     */
    async getHistory(
        measurementId: number,
        start: string,
        end:   string,
        targetPoints: number = TELEMETRY_CONFIG.targetPoints,
    ): Promise<HistoryResult> {
        const res = await api.get<MeasurementHistoryResponse>(
            `/measurements/${measurementId}/history/`,
            { params: { start, end, targetPoints } }
        );

        const points: DataPoint[] = (res.data.value ?? []).map((p) => ({
            time:  new Date(p.timestamp).getTime(),
            value: p.value,
        }));

        return {
            min:    res.data.min,
            max:    res.data.max,
            avg:    res.data.avg,
            points,
        };
    },
};