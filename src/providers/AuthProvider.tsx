import { useEffect } from 'react';
import { authService } from '../services/authService';
import { useAppStore } from '../stores/AppContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser } = useAppStore();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Valida o token com o backend e restaura o usuário no estado global.
        // Se o accessToken expirou, o interceptor do api.ts já tentará o refresh
        // automaticamente antes de retornar erro aqui.
        authService.me()
            .then((user) => setUser(user))
            .catch(() => {
                // Refresh também falhou — limpa tudo (o interceptor já faz localStorage.clear)
                setUser(null);
            });
    }, [setUser]);

    return <>{children}</>;
}