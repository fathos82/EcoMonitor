import axios from 'axios';
import { API_URL } from '../config/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request: injeta o accessToken em toda requisição ───────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response: tenta refresh antes de redirecionar para /login ──────────────
let isRefreshing = false;
// Fila de requisições que falharam enquanto o refresh estava em andamento
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve(token!);
    });
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Ignora erros que não sejam 401, ou que já foram retentados,
        // ou que vieram da própria chamada de refresh (evita loop)
        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            originalRequest.skipAuthRefresh
        ) {
            return Promise.reject(error);
        }

        const storedRefreshToken = localStorage.getItem('refreshToken');

        // Sem refreshToken salvo — vai direto para o login
        if (!storedRefreshToken) {
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Se já existe um refresh em andamento, enfileira a requisição atual
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    },
                    reject,
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Importação dinâmica para evitar dependência circular
            const { authService } = await import('./authService');
            const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(storedRefreshToken);

            // Atualiza tokens no storage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Atualiza o header default para próximas requisições
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            processQueue(null, accessToken);

            // Reexecuta a requisição original com o novo token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            // Refresh falhou (token expirado/inválido) — desloga
            processQueue(refreshError, null);
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);