import { api } from './api';
import type { MeasurementType } from '../types';

// ─── Tipos do contrato ───────────────────────────────────────────────────────

export interface CreateMeasurementRequest {
    plantId: number;
    measurementType: MeasurementType;
    sensorId: number;
}

export interface ApiMeasurement {
    id: number;
    plantId: number;
    measurementType: MeasurementType;
    sensorId: number;
}

// ─── Chamadas HTTP ────────────────────────────────────────────────────────────

export const measurementService = {
    /**
     * POST /measurements/
     * Associa uma medida (tipo + sensor) a uma planta.
     */
    async create(data: CreateMeasurementRequest): Promise<ApiMeasurement> {
        const res = await api.post<ApiMeasurement>('/measurements/', data);
        return res.data;
    },

    /**
     * Cria em paralelo todas as medidas selecionadas para uma planta.
     * Ignora entradas onde sensorId é null (usuário optou por "não monitorar").
     */
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
};