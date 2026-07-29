import { useQuery } from '@tanstack/react-query';
import { sensorService } from '../services/sensorService';

// ─── Chave de cache ───────────────────────────────────────────────────────────

export const sensorErrorsKey = (sensorId: number) => ['sensor-errors', sensorId] as const;

// ─── Hook: histórico de erros de um sensor ────────────────────────────────────

/**
 * Busca o histórico de erros reportados pelo device para um sensor (GET /sensors/{id}/errors/).
 * `enabled` evita disparar a chamada para sensores que já estão funcionando normalmente.
 */
export function useSensorErrors(sensorId: number, enabled = true) {
    const query = useQuery({
        queryKey: sensorErrorsKey(sensorId),
        queryFn: () => sensorService.getErrors(sensorId),
        enabled: enabled && sensorId > 0,
        staleTime: 30_000,
    });

    return {
        errors:       query.data ?? [],
        latestError:  query.data?.[0] ?? null,
        loading:      query.isLoading,
        error:        query.error,
    };
}