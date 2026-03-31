import { api } from './api';
import type { Plant } from '../types';

// ─── Tipos do contrato do Spring Boot ───────────────────────────────────────

export interface ApiMeasurement {
    id: number;
    virtualSensorId: number;
    measurementType: string;
    plantMonitoringId: number;
    updatedAt: string;
}

export interface ApiPlant {
    id: number;
    userId: number;
    commonName: string;
    specieName: string;
    measurements: ApiMeasurement[] | null;
}

export interface CreatePlantRequest {
    commonName: string;
    specieName: string;
}

export interface UpdatePlantRequest {
    commonName?: string;
    specieName?: string;
}

// ─── Conversores API ↔ Frontend ─────────────────────────────────────────────

/** Transforma o objeto do Spring no formato que o frontend usa */
export function toPlant(raw: ApiPlant): Plant {
    // Constrói measurementsMapping com os dois IDs necessários:
    // measurementId → REST /measurements/{id}/history/
    // sensorId      → tópico MQTT plant_monitor/{sensorId}/{capability}
    const measurementsMapping: Plant['measurementsMapping'] = {};
    for (const m of raw.measurements ?? []) {
        const type = m.measurementType as keyof Plant['measurementsMapping'];
        measurementsMapping[type] = {
            measurementId: m.id,
            sensorId:      m.virtualSensorId,
        };
    }

    return {
        id: raw.id,
        name: raw.commonName,
        species: raw.specieName,
        image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=400',
        status: 'unknown',
        lastHumidity: 0,
        location: '',
        hardwareId: 0,
        sensorsMapping:      { soil: null, env: null, light: null },
        measurementsMapping,
        settings: {
            humidity: { min: 40, max: 80, alert: true  },
            temp:     { min: 18, max: 28, alert: false },
            air:      { min: 0,  max: 50, alert: true  },
            light:    { min: 200,max: 1000,alert: false },
        },
    };
}

/** Transforma o objeto do frontend no formato que o Spring espera */
export function toApiPlant(plant: Partial<Plant>): CreatePlantRequest {
    return {
        commonName: plant.name ?? '',
        specieName: plant.species ?? '',
    };
}

// ─── Chamadas HTTP ───────────────────────────────────────────────────────────

export const plantService = {
    /** GET /plants — lista todas as plantas */
    async getAll(): Promise<Plant[]> {
        const res = await api.get<ApiPlant[]>('/plants/');
        return res.data.map(toPlant);
    },

    /** POST /plants — cria uma nova planta */
    async create(plant: Partial<Plant>): Promise<Plant> {
        const res = await api.post<ApiPlant>('/plants/', toApiPlant(plant));
        return toPlant(res.data);
    },

    /** PUT /plants/{id} — atualiza uma planta */
    async update(id: number, plant: Partial<Plant>): Promise<Plant> {
        const body: UpdatePlantRequest = {
            commonName: plant.name,
            specieName: plant.species,
        };
        const res = await api.put<ApiPlant>(`/plants/${id}/`, body);
        return toPlant(res.data);
    },

    /** DELETE /plants/{id} */
    async remove(id: number): Promise<void> {
        await api.delete(`/plants/${id}`);
    },
};