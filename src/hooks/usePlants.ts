import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../stores/AppContext';
import type { Plant } from '../types';
import {plantService} from "../services/plantsService.ts";

const PLANTS_KEY = ['plants'];

export function usePlants() {
    const { setPlants } = useAppStore();
    const queryClient = useQueryClient();

    // ── Listagem ──────────────────────────────────────────────────────────────
    const query = useQuery({
        queryKey: PLANTS_KEY,
        queryFn: plantService.getAll,
        staleTime: 30_000, // 30s antes de refetch automático
    });

    // Mantém o Zustand sincronizado com o React Query
    useEffect(() => {
        if (query.data) setPlants(query.data);
    }, [query.data, setPlants]);

    // ── Criar ─────────────────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (plant: Partial<Plant>) => plantService.create(plant),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANTS_KEY }),
    });

    // ── Atualizar ─────────────────────────────────────────────────────────────
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Plant> }) =>
            plantService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANTS_KEY }),
    });

    // ── Deletar ───────────────────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (id: number) => plantService.remove(id),
        // Optimistic update: remove da UI antes da resposta do servidor
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: PLANTS_KEY });
            const previous = queryClient.getQueryData<Plant[]>(PLANTS_KEY);
            queryClient.setQueryData<Plant[]>(PLANTS_KEY, (old) =>
                old?.filter((p) => p.id !== id) ?? []
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            // Reverte em caso de erro
            if (context?.previous) {
                queryClient.setQueryData(PLANTS_KEY, context.previous);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: PLANTS_KEY }),
    });

    return {
        plants:   query.data ?? [],
        loading:  query.isLoading,
        error:    query.error,

        createPlant: createMutation.mutateAsync,
        updatePlant: updateMutation.mutateAsync,
        deletePlant: deleteMutation.mutate,

        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}