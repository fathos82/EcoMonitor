import { useState } from 'react';
import { authService, type UpdateMeRequest } from '../services/authService';
import { useAppStore } from '../stores/AppContext';

interface UseProfileResult {
    saving:   boolean;
    error:    string | null;
    success:  boolean;
    update:   (data: UpdateMeRequest) => Promise<void>;
}

export function useProfile(): UseProfileResult {
    const { setUser } = useAppStore();
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const update = async (data: UpdateMeRequest) => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const updated = await authService.updateMe(data);
            setUser(updated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e: any) {
            setError(e.response?.data?.message ?? 'Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    return { saving, error, success, update };
}
