/**
 * SICORA - Hook para gestión de usuarios
 *
 * Hook personalizado que encapsula toda la lógica de estado
 * y comunicación con la API de usuarios.
 *
 * @fileoverview Users management hook
 * @module hooks/useUsers
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { usersApi } from '@/lib/api/users';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ListUsersParams,
  UsersListResponse,
  UserStats,
  UserFilters,
  AssignRoleRequest,
} from '@/types/user.types';

// ============================================================================
// TIPOS
// ============================================================================

interface UseUsersState {
  users: User[];
  selectedUser: User | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: UserFilters;
  sorting: {
    field: ListUsersParams['sort_by'];
    direction: ListUsersParams['sort_direction'];
  };
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  stats: UserStats | null;
}

interface UseUsersActions {
  // Listado
  fetchUsers: (params?: ListUsersParams) => Promise<void>;
  refreshUsers: () => Promise<void>;
  
  // CRUD
  createUser: (data: CreateUserRequest) => Promise<User | null>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  
  // Selección
  selectUser: (user: User | null) => void;
  fetchUser: (id: string) => Promise<User | null>;
  
  // Filtros y paginación
  setFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (field: ListUsersParams['sort_by'], direction: ListUsersParams['sort_direction']) => void;
  
  // Admin
  assignRole: (id: string, data: AssignRoleRequest) => Promise<boolean>;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<boolean>;
  
  // Stats
  fetchStats: () => Promise<void>;
  
  // Utilidades
  clearError: () => void;
}

export type UseUsersReturn = UseUsersState & UseUsersActions;

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialFilters: UserFilters = {
  search: '',
  rol: '',
  is_active: null,
  ficha_id: '',
};

const initialPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useUsers(autoFetch: boolean = false): UseUsersReturn {
  // Estado
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFiltersState] = useState<UserFilters>(initialFilters);
  const [sorting, setSortingState] = useState<UseUsersState['sorting']>({
    field: 'created_at',
    direction: 'desc',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  // ============================================================================
  // FUNCIONES DE LISTADO
  // ============================================================================

  const fetchUsers = useCallback(async (params?: ListUsersParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams: ListUsersParams = {
        page: params?.page ?? pagination.page,
        page_size: params?.page_size ?? pagination.pageSize,
        sort_by: params?.sort_by ?? sorting.field,
        sort_direction: params?.sort_direction ?? sorting.direction,
        ...(filters.search && { search: filters.search }),
        ...(filters.rol && { rol: filters.rol }),
        ...(filters.is_active !== null && { is_active: filters.is_active }),
        ...(filters.ficha_id && { ficha_id: filters.ficha_id }),
        ...params,
      };

      const response = await usersApi.list(queryParams);

      if (response.data) {
        const data = response.data as UsersListResponse;
        setUsers(data.users || []);
        setPagination({
          page: data.page,
          pageSize: data.page_size,
          total: data.total,
          totalPages: data.total_pages,
          hasNext: data.has_next,
          hasPrevious: data.has_previous,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setError(message);
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, sorting, filters]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // ============================================================================
  // FUNCIONES CRUD
  // ============================================================================

  const createUser = useCallback(async (data: CreateUserRequest): Promise<User | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await usersApi.create(data);
      
      if (response.data?.data) {
        // Refrescar lista después de crear
        await refreshUsers();
        return response.data.data;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(message);
      console.error('Error creating user:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [refreshUsers]);

  const updateUser = useCallback(async (
    id: string,
    data: UpdateUserRequest
  ): Promise<User | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await usersApi.update(id, data);
      
      if (response.data?.data) {
        // Actualizar en la lista local
        setUsers(prev => prev.map(u => u.id === id ? response.data!.data : u));
        
        // Actualizar seleccionado si es el mismo
        if (selectedUser?.id === id) {
          setSelectedUser(response.data.data);
        }
        
        return response.data.data;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(message);
      console.error('Error updating user:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedUser]);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      await usersApi.delete(id);
      
      // Remover de la lista local
      setUsers(prev => prev.filter(u => u.id !== id));
      
      // Limpiar selección si es el mismo
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      
      // Actualizar paginación
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
      }));
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(message);
      console.error('Error deleting user:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedUser]);

  // ============================================================================
  // FUNCIONES DE SELECCIÓN
  // ============================================================================

  const selectUser = useCallback((user: User | null) => {
    setSelectedUser(user);
  }, []);

  const fetchUser = useCallback(async (id: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await usersApi.get(id);
      
      if (response.data?.data) {
        setSelectedUser(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuario';
      setError(message);
      console.error('Error fetching user:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // FUNCIONES DE FILTROS Y PAGINACIÓN
  // ============================================================================

  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    // Reset a página 1 cuando cambian filtros
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setSorting = useCallback((
    field: ListUsersParams['sort_by'],
    direction: ListUsersParams['sort_direction']
  ) => {
    setSortingState({ field, direction });
  }, []);

  // ============================================================================
  // FUNCIONES DE ADMIN
  // ============================================================================

  const assignRole = useCallback(async (
    id: string,
    data: AssignRoleRequest
  ): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await usersApi.assignRole(id, data);
      
      if (response.data?.data) {
        // Actualizar en la lista local
        setUsers(prev => prev.map(u => u.id === id ? response.data!.data : u));
        
        if (selectedUser?.id === id) {
          setSelectedUser(response.data.data);
        }
        
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al asignar rol';
      setError(message);
      console.error('Error assigning role:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedUser]);

  const toggleUserStatus = useCallback(async (
    id: string,
    isActive: boolean
  ): Promise<boolean> => {
    const result = await updateUser(id, { is_active: isActive });
    return result !== null;
  }, [updateUser]);

  // ============================================================================
  // FUNCIONES DE ESTADÍSTICAS
  // ============================================================================

  const fetchStats = useCallback(async () => {
    try {
      const response = await usersApi.getStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Auto-fetch inicial
  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch cuando cambian filtros/paginación/sorting
  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [filters, pagination.page, pagination.pageSize, sorting]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // RETURN
  // ============================================================================

  return useMemo(() => ({
    // Estado
    users,
    selectedUser,
    pagination,
    filters,
    sorting,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    stats,

    // Acciones
    fetchUsers,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    selectUser,
    fetchUser,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    setSorting,
    assignRole,
    toggleUserStatus,
    fetchStats,
    clearError,
  }), [
    users,
    selectedUser,
    pagination,
    filters,
    sorting,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    stats,
    fetchUsers,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    selectUser,
    fetchUser,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    setSorting,
    assignRole,
    toggleUserStatus,
    fetchStats,
    clearError,
  ]);
}

// ============================================================================
// HOOK PARA PERFIL PROPIO
// ============================================================================

interface UseProfileReturn {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await usersApi.getProfile();
      if (response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar perfil';
      setError(message);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await usersApi.updateProfile(data);
      if (response.data?.data) {
        setProfile(response.data.data);
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(message);
      console.error('Error updating profile:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  };
}

export default useUsers;
