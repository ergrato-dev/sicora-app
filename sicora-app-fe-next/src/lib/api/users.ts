/**
 * SICORA - API Client para Usuarios
 *
 * Funciones para comunicación con el backend Go (UserService)
 * para operaciones CRUD de usuarios.
 *
 * Endpoints manejados:
 * - GET    /api/v1/users           - Listar usuarios
 * - GET    /api/v1/users/:id       - Obtener usuario por ID
 * - POST   /api/v1/users           - Crear usuario
 * - PUT    /api/v1/users/:id       - Actualizar usuario
 * - DELETE /api/v1/users/:id       - Eliminar usuario
 * - PUT    /api/v1/users/:id/role  - Asignar rol
 * - GET    /api/v1/users/profile   - Obtener perfil propio
 * - PUT    /api/v1/users/profile   - Actualizar perfil propio
 * - GET    /api/v1/users/stats     - Estadísticas de usuarios
 *
 * @fileoverview Users API client
 * @module lib/api/users
 */

import { httpClient } from '../api-client';
import type { ApiResponse } from '@/types/auth.types';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateProfileRequest,
  AssignRoleRequest,
  ListUsersParams,
  UsersListResponse,
  UserStats,
  AdminResetPasswordRequest,
  AdminResetPasswordResponse,
} from '@/types/user.types';

/**
 * Endpoints de usuarios
 */
const USER_ENDPOINTS = {
  LIST: '/api/v1/users',
  DETAIL: (id: string) => `/api/v1/users/${id}`,
  CREATE: '/api/v1/users',
  UPDATE: (id: string) => `/api/v1/users/${id}`,
  DELETE: (id: string) => `/api/v1/users/${id}`,
  ASSIGN_ROLE: (id: string) => `/api/v1/users/${id}/role`,
  RESET_PASSWORD: (id: string) => `/api/v1/users/${id}/reset-password`,
  PROFILE: '/api/v1/users/profile',
  STATS: '/api/v1/users/stats',
  ME: '/api/v1/users/me',
} as const;

/**
 * Construir query string desde parámetros
 */
function buildQueryString(params: ListUsersParams): string {
  const searchParams = new URLSearchParams();

  if (params.rol) searchParams.append('rol', params.rol);
  if (params.ficha_id) searchParams.append('ficha_id', params.ficha_id);
  if (params.programa) searchParams.append('programa', params.programa);
  if (params.is_active !== undefined) searchParams.append('is_active', String(params.is_active));
  if (params.search) searchParams.append('search', params.search);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.page_size) searchParams.append('page_size', String(params.page_size));
  if (params.sort_by) searchParams.append('sort_by', params.sort_by);
  if (params.sort_direction) searchParams.append('sort_direction', params.sort_direction);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// FUNCIONES DE API
// ============================================================================

/**
 * Listar usuarios con paginación y filtros
 *
 * @param params - Parámetros de búsqueda, filtrado y paginación
 * @returns Lista paginada de usuarios
 *
 * @example
 * ```ts
 * const response = await usersApi.listUsers({
 *   page: 1,
 *   page_size: 10,
 *   rol: 'aprendiz',
 *   search: 'María'
 * });
 * console.log(response.data?.users);
 * ```
 */
export async function listUsers(
  params: ListUsersParams = {}
): Promise<ApiResponse<UsersListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<UsersListResponse>(`${USER_ENDPOINTS.LIST}${queryString}`);
}

/**
 * Obtener usuario por ID
 *
 * @param id - ID único del usuario (UUID)
 * @returns Datos del usuario
 *
 * @example
 * ```ts
 * const response = await usersApi.getUser('550e8400-e29b-41d4-a716-446655440000');
 * console.log(response.data?.full_name);
 * ```
 */
export async function getUser(id: string): Promise<ApiResponse<{ data: User }>> {
  return httpClient.get<{ data: User }>(USER_ENDPOINTS.DETAIL(id));
}

/**
 * Crear nuevo usuario (solo admin)
 *
 * @param data - Datos del nuevo usuario
 * @returns Usuario creado
 *
 * @example
 * ```ts
 * const response = await usersApi.createUser({
 *   nombre: 'Juan',
 *   apellido: 'Pérez',
 *   email: 'juan.perez@onevision.edu.co',
 *   documento: '1234567890',
 *   rol: 'aprendiz',
 *   password: 'contraseñaSegura123',
 *   programa_formacion: 'Desarrollo de Software'
 * });
 * ```
 */
export async function createUser(
  data: CreateUserRequest
): Promise<ApiResponse<{ message: string; data: User }>> {
  return httpClient.post<{ message: string; data: User }>(USER_ENDPOINTS.CREATE, data);
}

/**
 * Actualizar usuario existente (solo admin)
 *
 * @param id - ID del usuario a actualizar
 * @param data - Campos a actualizar
 * @returns Usuario actualizado
 *
 * @example
 * ```ts
 * const response = await usersApi.updateUser('550e8400-e29b-41d4-a716-446655440000', {
 *   is_active: false
 * });
 * ```
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<ApiResponse<{ message: string; data: User }>> {
  return httpClient.put<{ message: string; data: User }>(USER_ENDPOINTS.UPDATE(id), data);
}

/**
 * Eliminar usuario (solo admin)
 *
 * @param id - ID del usuario a eliminar
 * @returns Confirmación de eliminación
 *
 * @example
 * ```ts
 * await usersApi.deleteUser('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(USER_ENDPOINTS.DELETE(id));
}

/**
 * Asignar rol a usuario (solo admin)
 *
 * @param id - ID del usuario
 * @param data - Nuevo rol y ficha opcional
 * @returns Usuario actualizado
 *
 * @example
 * ```ts
 * const response = await usersApi.assignRole('550e8400-e29b-41d4-a716-446655440000', {
 *   new_role: 'instructor'
 * });
 * ```
 */
export async function assignRole(
  id: string,
  data: AssignRoleRequest
): Promise<ApiResponse<{ message: string; data: User }>> {
  return httpClient.put<{ message: string; data: User }>(USER_ENDPOINTS.ASSIGN_ROLE(id), data);
}

/**
 * Resetear contraseña de usuario (solo admin)
 *
 * @param id - ID del usuario
 * @param data - Nueva contraseña (opcional, genera temporal si no se proporciona)
 * @returns Contraseña temporal si no se especificó una
 */
export async function resetPassword(
  id: string,
  data?: AdminResetPasswordRequest
): Promise<ApiResponse<AdminResetPasswordResponse>> {
  return httpClient.post<AdminResetPasswordResponse>(
    USER_ENDPOINTS.RESET_PASSWORD(id),
    data || {}
  );
}

/**
 * Obtener perfil del usuario autenticado
 *
 * @returns Datos del perfil propio
 *
 * @example
 * ```ts
 * const response = await usersApi.getProfile();
 * console.log(response.data?.full_name);
 * ```
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  return httpClient.get<User>(USER_ENDPOINTS.PROFILE);
}

/**
 * Actualizar perfil propio
 *
 * @param data - Campos a actualizar del perfil
 * @returns Perfil actualizado
 *
 * @example
 * ```ts
 * const response = await usersApi.updateProfile({
 *   nombre: 'María José'
 * });
 * ```
 */
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ApiResponse<{ message: string; data: User }>> {
  return httpClient.put<{ message: string; data: User }>(USER_ENDPOINTS.PROFILE, data);
}

/**
 * Obtener información del usuario actual (alternativo a profile)
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return httpClient.get<User>(USER_ENDPOINTS.ME);
}

/**
 * Obtener estadísticas de usuarios
 *
 * @returns Estadísticas globales de usuarios
 *
 * @example
 * ```ts
 * const response = await usersApi.getStats();
 * console.log(`Total: ${response.data?.total_users}`);
 * ```
 */
export async function getStats(): Promise<ApiResponse<UserStats>> {
  return httpClient.get<UserStats>(USER_ENDPOINTS.STATS);
}

// ============================================================================
// EXPORTACIÓN AGRUPADA
// ============================================================================

export const usersApi = {
  // CRUD
  list: listUsers,
  get: getUser,
  create: createUser,
  update: updateUser,
  delete: deleteUser,
  
  // Admin
  assignRole,
  resetPassword,
  
  // Perfil
  getProfile,
  updateProfile,
  getCurrentUser,
  
  // Stats
  getStats,
};

export default usersApi;
