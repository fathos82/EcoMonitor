import { api } from './api';
import type { ApiSensor, Sensor, SensorTemplate } from '../types';

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateSensorRequest {
    device: number;
    sensorTemplateId: number;
    parameters: Record<string, string>;
}

export interface UpdateSensorRequest {
    parameters: Record<string, string>;
}

// ─── Converter ────────────────────────────────────────────────────────────────

export function toSensor(raw: ApiSensor): Sensor {
    return {
        id: raw.id,
        deviceId: raw.deviceId,
        name: raw.sensorName,
        model: raw.model,
        capabilities: raw.capabilities,
        isWorking: raw.isWorking,
        parameters: raw.parameters ?? {},
    };
}

// ─── Chamadas HTTP ────────────────────────────────────────────────────────────

export const sensorService = {
    /** GET /sensors/templates/ — lista os modelos disponíveis */
    async getTemplates(): Promise<SensorTemplate[]> {
        const res = await api.get<SensorTemplate[]>('/sensors/templates/');
        return res.data;
    },

    /** GET /sensors/?deviceId={id} — lista os sensores de um device */
    async getByDevice(deviceId: number): Promise<Sensor[]> {
        const res = await api.get<ApiSensor[]>('/sensors/', { params: { deviceId } });
        return res.data.map(toSensor);
    },

    /**
     * POST /sensors/
     * Registra um sensor a partir de um template.
     * Se `parameters` estiver vazio, o backend usa os defaultParameters do template.
     */
    async create(data: CreateSensorRequest): Promise<Sensor> {
        const res = await api.post<ApiSensor>('/sensors/', data);
        return toSensor(res.data);
    },

    /** PATCH /sensors/{id}/ — atualiza apenas os parâmetros */
    async update(sensorId: number, data: UpdateSensorRequest): Promise<Sensor> {
        const res = await api.patch<ApiSensor>(`/sensors/${sensorId}/`, data);
        return toSensor(res.data);
    },

    /** DELETE /sensors/{id}/ */
    async delete(sensorId: number): Promise<void> {
        await api.delete(`/sensors/${sensorId}/`);
    },
};