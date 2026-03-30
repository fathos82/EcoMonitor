import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    sensorService,
    type CreateSensorRequest,
    type UpdateSensorRequest,
} from '../services/sensorService';

// ─── Chaves de cache ──────────────────────────────────────────────────────────

export const TEMPLATES_KEY = ['sensor-templates'] as const;
export const sensorKey = (deviceId: number) => ['sensors', deviceId] as const;

// ─── Hook: templates (compartilhado entre todos os devices) ───────────────────

export function useSensorTemplates() {
    return useQuery({
        queryKey: TEMPLATES_KEY,
        queryFn: sensorService.getTemplates,
        staleTime: 5 * 60_000, // templates mudam raramente
    });
}

// ─── Hook: CRUD de sensores de um device ─────────────────────────────────────

export function useSensors(deviceId: number) {
    const queryClient = useQueryClient();
    const key = sensorKey(deviceId);

    const query = useQuery({
        queryKey: key,
        queryFn: () => sensorService.getByDevice(deviceId),
        staleTime: 30_000,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateSensorRequest) => sensorService.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateSensorRequest }) =>
            sensorService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    });

    const deleteMutation = useMutation({
        mutationFn: (sensorId: number) => sensorService.delete(sensorId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    });

    return {
        sensors:  query.data ?? [],
        loading:  query.isLoading,
        error:    query.error,

        createSensor: createMutation.mutateAsync,
        isCreating:   createMutation.isPending,
        createError:  createMutation.error,

        updateSensor: updateMutation.mutateAsync,
        isUpdating:   updateMutation.isPending,
        updateError:  updateMutation.error,

        deleteSensor: deleteMutation.mutateAsync,
        isDeleting:   deleteMutation.isPending,
    };
}
