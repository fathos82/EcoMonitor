import { api } from './api';
import type { Hardware } from '../types';

// ─── Tipos do contrato do Spring Boot ───────────────────────────────────────

export interface ApiDevice {
    id: number;
    name: string;
    isOnline: boolean;
    hostname: string | null;
    deviceType: string;
    firstSeenAt: string;
    lastSeenAt: string;
}

export interface ClaimDeviceRequest {
    deviceUuid: string;
    name?: string;
    hostname?: string;
}

// ─── Conversor API → Frontend ────────────────────────────────────────────────

export function toHardware(device: ApiDevice): Hardware {
    return {
        id: device.id,
        name: device.name === 'Sem Nome' ? device.hostname ?? device.deviceType : device.name,
        model: device.deviceType,
        ip: device.hostname ?? '—',
        status: device.isOnline ? 'online' : 'offline',
        uptime: formatUptime(device.firstSeenAt),
        sensors: [],
    };
}

function formatUptime(firstSeenAt: string): string {
    const diff = Date.now() - new Date(firstSeenAt).getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
}

// ─── Chamadas HTTP ────────────────────────────────────────────────────────────

export const deviceService = {
    /**
     * POST /api/devices/me/
     * Vincula o device à conta do usuário pelo UUID.
     * Também envia name e hostname (fingidos por ora — backend ignora se não suportar).
     */
    async claim(uuid: string, name: string, hostname: string): Promise<Hardware> {
        const body: ClaimDeviceRequest = {
            deviceUuid: uuid,
            name,
            hostname,
        };
        const res = await api.post<ApiDevice>('/devices/me/', body);
        return toHardware(res.data);
    },

    /** GET /api/devices/me/ — lista os devices vinculados à conta */
    async getAll(): Promise<Hardware[]> {
        const res = await api.get<ApiDevice[]>('/devices/me/');
        return res.data.map(toHardware);
    },
};