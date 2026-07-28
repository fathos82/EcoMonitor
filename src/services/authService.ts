import { api } from './api';
import type {User} from "../types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateMeRequest {
  name?:  string;
  phone?: string;
}

// Contrato real do Spring Boot
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string; // Spring pode rotacionar o refreshToken — salvamos sempre
}

export const authService = {
  /** POST /auth/login */
  async login(data: LoginRequest): Promise<AuthResponse> {

    const response = await api.post<AuthResponse>('/auth/login/', data);
    return response.data;
  },

  /** POST /auth/register */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  /**
   * POST /auth/refresh
   * Envia o refreshToken e recebe novos tokens.
   * Usa axios puro (sem interceptor) para evitar loop infinito.
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>(
        '/auth/refresh/',
        { refreshToken },
        { skipAuthRefresh: true } as never  // flag para o interceptor ignorar esta chamada
    );
    return response.data;
  },

  /** GET /auth/me — valida sessão e retorna dados do usuário */
  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me/');
    return response.data;
  },

  /** PATCH /auth/me — atualiza nome e/ou telefone */
  async updateMe(data: UpdateMeRequest): Promise<User> {
    console.log(data);
    const response = await api.patch<User>('/auth/me/', data);
    return response.data;
  },
};