/**
 * SICORA - API Client para Autenticación
 *
 * Funciones para comunicación con el backend Go (UserService)
 * para operaciones de autenticación y gestión de sesión.
 *
 * Endpoints manejados:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/logout
 * - POST /api/v1/auth/refresh
 * - POST /api/v1/auth/forgot-password
 * - POST /api/v1/auth/reset-password
 * - PUT /api/v1/auth/change-password
 * - PUT /api/v1/auth/profile
 *
 * @fileoverview Auth API client
 * @module lib/api/auth
 */

import { httpClient } from '../api-client';
import type {
  LoginCredentials,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ProfileUpdateRequest,
  User,
  ApiResponse,
} from '@/types/auth.types';

/**
 * Endpoints de autenticación
 */
const AUTH_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  CHANGE_PASSWORD: '/api/v1/auth/change-password',
  PROFILE: '/api/v1/auth/profile',
  ME: '/api/v1/users/me',
} as const;

/**
 * Iniciar sesión con credenciales
 *
 * @param credentials - Email y contraseña del usuario
 * @returns Respuesta con tokens y datos del usuario
 * @throws ApiClientError si las credenciales son inválidas
 *
 * @example
 * ```ts
 * const response = await authApi.login({
 *   email: 'usuario@onevision.edu.co',
 *   password: 'contraseña123'
 * });
 * console.log(response.data?.user.name);
 * ```
 */
export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<AuthResponse>> {
  return httpClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
}

/**
 * Cerrar sesión del usuario actual
 *
 * @returns Confirmación de cierre de sesión
 *
 * @example
 * ```ts
 * await authApi.logout();
 * // Limpiar estado local después
 * ```
 */
export async function logout(): Promise<ApiResponse<void>> {
  return httpClient.post<void>(AUTH_ENDPOINTS.LOGOUT);
}

/**
 * Refrescar token de acceso
 *
 * @param refreshToken - Token de refresco actual
 * @returns Nuevo token de acceso
 *
 * @example
 * ```ts
 * const response = await authApi.refreshToken({
 *   refresh_token: currentRefreshToken
 * });
 * // Actualizar token en storage
 * ```
 */
export async function refreshToken(
  request: RefreshTokenRequest
): Promise<ApiResponse<RefreshTokenResponse>> {
  return httpClient.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, request);
}

/**
 * Solicitar recuperación de contraseña
 *
 * Envía un email al usuario con un enlace para restablecer
 * su contraseña. El enlace es válido por 24 horas.
 *
 * @param email - Email del usuario
 * @returns Confirmación de envío (siempre exitoso por seguridad)
 *
 * @example
 * ```ts
 * await authApi.forgotPassword({ email: 'usuario@onevision.edu.co' });
 * // Mostrar mensaje de éxito sin revelar si el email existe
 * ```
 */
export async function forgotPassword(
  request: ForgotPasswordRequest
): Promise<ApiResponse<{ message: string }>> {
  return httpClient.post<{ message: string }>(
    AUTH_ENDPOINTS.FORGOT_PASSWORD,
    request
  );
}

/**
 * Restablecer contraseña con token
 *
 * @param request - Token de reset y nueva contraseña
 * @returns Confirmación de cambio exitoso
 * @throws ApiClientError si el token es inválido o expirado
 *
 * @example
 * ```ts
 * await authApi.resetPassword({
 *   token: 'token-from-email',
 *   new_password: 'NuevaContraseña123!',
 *   confirm_password: 'NuevaContraseña123!'
 * });
 * ```
 */
export async function resetPassword(
  request: ResetPasswordRequest
): Promise<ApiResponse<{ message: string }>> {
  return httpClient.post<{ message: string }>(
    AUTH_ENDPOINTS.RESET_PASSWORD,
    request
  );
}

/**
 * Cambiar contraseña del usuario autenticado
 *
 * Requiere autenticación. Usado para:
 * - Cambio voluntario de contraseña
 * - Cambio obligatorio en primer login
 * - Cambio después de reset por admin
 *
 * @param request - Contraseña actual y nueva
 * @returns Confirmación de cambio exitoso
 * @throws ApiClientError si la contraseña actual es incorrecta
 *
 * @example
 * ```ts
 * await authApi.changePassword({
 *   current_password: 'contraseñaActual',
 *   new_password: 'NuevaContraseña123!',
 *   confirm_password: 'NuevaContraseña123!'
 * });
 * ```
 */
export async function changePassword(
  request: ChangePasswordRequest
): Promise<ApiResponse<{ message: string }>> {
  return httpClient.put<{ message: string }>(
    AUTH_ENDPOINTS.CHANGE_PASSWORD,
    request
  );
}

/**
 * Actualizar perfil del usuario autenticado
 *
 * @param updates - Campos a actualizar
 * @returns Usuario actualizado
 *
 * @example
 * ```ts
 * const response = await authApi.updateProfile({
 *   first_name: 'Nuevo Nombre',
 *   last_name: 'Nuevo Apellido'
 * });
 * ```
 */
export async function updateProfile(
  updates: ProfileUpdateRequest
): Promise<ApiResponse<User>> {
  return httpClient.put<User>(AUTH_ENDPOINTS.PROFILE, updates);
}

/**
 * Obtener datos del usuario actual
 *
 * @returns Datos completos del usuario autenticado
 *
 * @example
 * ```ts
 * const response = await authApi.getCurrentUser();
 * console.log(response.data?.role);
 * ```
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return httpClient.get<User>(AUTH_ENDPOINTS.ME);
}

/**
 * Verificar si el token es válido
 *
 * Hace una petición ligera al backend para verificar
 * que el token actual sigue siendo válido.
 *
 * @returns true si el token es válido
 *
 * @example
 * ```ts
 * const isValid = await authApi.verifyToken();
 * if (!isValid) {
 *   // Redirigir a login
 * }
 * ```
 */
export async function verifyToken(): Promise<boolean> {
  try {
    const response = await getCurrentUser();
    return response.success === true;
  } catch {
    return false;
  }
}

/**
 * Objeto con todas las funciones de API de autenticación
 */
export const authApi = {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getCurrentUser,
  verifyToken,
} as const;

export default authApi;
