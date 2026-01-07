/**
 * API Client para gestión de usuarios
 * Integración con Backend Go - UserService
 */

import { apiClient } from './client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  AdminChangePasswordRequest,
  UserFilters,
  PaginationParams,
  UsersListResponse,
} from '../../types/user.types';

const BASE_PATH = '/api/v1/users';

/**
 * API de Usuarios
 */
export const usersApi = {
  /**
   * Obtener lista de usuarios con paginación y filtros
   */
  getUsers: async (
    filters?: UserFilters,
    pagination?: PaginationParams
  ): Promise<UsersListResponse> => {
    const params = new URLSearchParams();

    // Filtros
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.coordination) params.append('coordination', filters.coordination);
    if (filters?.program) params.append('program', filters.program);
    if (filters?.ficha) params.append('ficha', filters.ficha);

    // Paginación
    if (pagination?.page) params.append('page', String(pagination.page));
    if (pagination?.limit) params.append('limit', String(pagination.limit));
    if (pagination?.sort_by) params.append('sort_by', pagination.sort_by);
    if (pagination?.sort_order) params.append('sort_order', pagination.sort_order);

    const response = await apiClient.get<UsersListResponse>(`${BASE_PATH}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener usuario por ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo usuario
   */
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualizar usuario
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<User>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar usuario (soft delete)
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Cambiar contraseña de usuario (admin)
   */
  adminChangePassword: async (data: AdminChangePasswordRequest): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/${data.user_id}/change-password`, {
      new_password: data.new_password,
    });
  },

  /**
   * Activar usuario
   */
  activateUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`${BASE_PATH}/${id}/activate`);
    return response.data;
  },

  /**
   * Desactivar usuario
   */
  deactivateUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`${BASE_PATH}/${id}/deactivate`);
    return response.data;
  },

  /**
   * Suspender usuario
   */
  suspendUser: async (id: string, reason?: string): Promise<User> => {
    const response = await apiClient.post<User>(`${BASE_PATH}/${id}/suspend`, { reason });
    return response.data;
  },

  /**
   * Buscar usuarios por término
   */
  searchUsers: async (query: string, limit = 10): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`${BASE_PATH}/search`, {
      params: { q: query, limit },
    });
    return response.data;
  },

  /**
   * Obtener usuarios por rol
   */
  getUsersByRole: async (role: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`${BASE_PATH}/by-role/${role}`);
    return response.data;
  },

  /**
   * Exportar usuarios a CSV/Excel
   */
  exportUsers: async (filters?: UserFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`${BASE_PATH}/export`, {
      params: { ...Object.fromEntries(params), format },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Importar usuarios desde CSV
   */
  importUsers: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ imported: number; errors: string[] }>(
      `${BASE_PATH}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Obtener estadísticas de usuarios
   */
  getStats: async (): Promise<{
    total: number;
    by_role: Record<string, number>;
    by_status: Record<string, number>;
    recent_registrations: number;
  }> => {
    const response = await apiClient.get(`${BASE_PATH}/stats`);
    return response.data;
  },
};
