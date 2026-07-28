import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '../services/deviceService';
import { useAppStore } from '../stores/AppContext';

const DEVICES_KEY = ['devices'];

export function useDevices() {
    const { setHardwareList } = useAppStore();
    const queryClient = useQueryClient();

    // ── Listagem ──────────────────────────────────────────────────────────────
    const query = useQuery({
        queryKey: DEVICES_KEY,
        queryFn: deviceService.getAll,
        staleTime: 10_000,
        refetchInterval: 3_000,        // polling a cada 10s
        refetchIntervalInBackground: false, // pausa quando aba está em background
    });

    // Mantém o Zustand sincronizado
    useEffect(() => {
        if (query.data) setHardwareList(query.data);
    }, [query.data, setHardwareList]);

    // ── Vincular device por UUID ──────────────────────────────────────────────
    const claimMutation = useMutation({
        mutationFn: ({ uuid, name, hostname }: { uuid: string; name: string; hostname: string }) =>
            deviceService.claim(uuid, name, hostname),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY }),
    });

    return {
        devices:  query.data ?? [],
        loading:  query.isLoading,
        error:    query.error,

        claimDevice: claimMutation.mutateAsync,
        isClaiming:  claimMutation.isPending,
        claimError:  claimMutation.error,
    };
}