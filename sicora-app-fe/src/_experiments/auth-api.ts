import type {
  ApiResponse,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginCredentials,
  ProfileUpdateRequest,
  RefreshTokenResponse,
  ResetPasswordRequest,
  User,
} from '../types/auth.types';
import { get, post, put } from './api-client-new';

/**
 * Servicio de autenticación para SICORA
 * Maneja todas las operaciones relacionadas con autenticación y usuarios
 */
class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/api/v1/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    if (!response.data) {
      throw new Error('Respuesta de login inválida');
    }

    return response.data;
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await post('/api/v1/users', userData);
    return response.data ?? response;
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await post<RefreshTokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });

    if (!response.data) {
      throw new Error('Respuesta de refresh token inválida');
    }

    return response.data;
  }

  /**
   * Obtener perfil de usuario actual
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return await get<User>('/api/v1/users/profile');
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userData: ProfileUpdateRequest): Promise<Record<string, unknown> | object> {
    const response = await put('/api/v1/users/profile', userData);
    return response.data ?? response;
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    await post('/api/v1/auth/logout', {});
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await post('/api/v1/users/profile/change-password', {
      current_password: data.current_password,
      new_password: data.new_password,
    });
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(data: ForgotPasswordRequest): Promise<void> {
    await post('/api/v1/auth/forgot-password', data);
  }

  /**
   * Resetear contraseña con token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await post('/api/v1/auth/reset-password', {
      token: data.token,
      new_password: data.new_password,
    });
  }

  /**
   * Verificar si el token es válido
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      console.warn('Token inválido:', error);
      return false;
    }
  }
}

// Exportar instancia única del servicio
export default new AuthService();
