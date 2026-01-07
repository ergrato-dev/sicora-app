import { apiClient } from './client';
import type {
  LoginCredentials,
  AuthResponse,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ProfileUpdateRequest,
  User,
} from '../../types/auth.types';

const AUTH_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  ME: '/api/v1/auth/me',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  CHANGE_PASSWORD: '/api/v1/auth/change-password',
  PROFILE: '/api/v1/auth/profile',
};

/**
 * API de autenticación para el backend Go
 */
export const authApi = {
  /**
   * Iniciar sesión con credenciales
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  },

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(AUTH_ENDPOINTS.ME);
    return response.data;
  },

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
  },

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
  },

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
  },

  /**
   * Actualizar perfil
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    const response = await apiClient.put<User>(AUTH_ENDPOINTS.PROFILE, data);
    return response.data;
  },
};
