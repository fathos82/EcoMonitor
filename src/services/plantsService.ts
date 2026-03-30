import { api } from './api';
import type { Plant, PlantStatus } from '../types';

// ─── Tipos do contrato do Spring Boot ───────────────────────────────────────

export interface ApiPlant {
    id: number;
    userId: number;
    commonName: string;
    specieName: string;
    measurements: null | {
        humidity?: number;
        status?: string;
    };
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
export function toPlant(api: ApiPlant): Plant {
    const humidity = api.measurements?.humidity ?? 0;
    const status = (api.measurements?.status as PlantStatus) ?? deriveStatus(humidity);

    return {
        id: api.id,
        name: api.commonName,
        species: api.specieName,
        image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=400',
        status,
        lastHumidity: humidity,
        location: '',
        hardwareId: 0,
        sensorsMapping: { soil: null, env: null, light: null },
        settings: {
            humidity: { min: 40, max: 80, alert: true },
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

function deriveStatus(humidity: number): PlantStatus {
    if (humidity === 0)   return 'unknown' as PlantStatus;
    if (humidity < 30)    return 'critical';
    if (humidity < 50)    return 'warning';
    return 'healthy';
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