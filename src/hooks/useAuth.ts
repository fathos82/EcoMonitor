import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAppStore } from '../stores/AppContext';
import type { LoginRequest, RegisterRequest } from '../services/authService';

function saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

export function useAuth() {
    const { setUser } = useAppStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const afterAuth = async (accessToken: string, refreshToken: string) => {
        saveTokens(accessToken, refreshToken);
        // Busca o usuário ANTES de navegar — Sidebar já terá os dados ao renderizar
        const user = await authService.me();
        setUser(user);
        navigate('/');
    };

    const login = async (data: LoginRequest) => {
        setLoading(true);
        setError(null);
        try {
            const { accessToken, refreshToken } = await authService.login(data);
            await afterAuth(accessToken, refreshToken);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'E-mail ou senha inválidos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setLoading(true);
        setError(null);
        try {
            const { accessToken, refreshToken } = await authService.register(data);
            await afterAuth(accessToken, refreshToken);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearTokens();
        setUser(null);
        navigate('/login');
    };

    return { login, register, logout, loading, error };
}