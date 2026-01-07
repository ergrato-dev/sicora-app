/**
 * Hook para gestión de usuarios
 * Proporciona una interfaz simplificada para operaciones CRUD
 */

import { useCallback, useEffect } from 'react';
import { useUsersStore } from '../stores/users.store';
import { usersApi } from '../lib/api/users';
import type {
  User,
  UserRole,
  UserStatus,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user.types';

/**
 * Hook principal para gestión de usuarios
 */
export function useUsers() {
  const store = useUsersStore();

  // Cargar usuarios al montar
  useEffect(() => {
    if (store.users.length === 0 && !store.isLoading) {
      store.fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => {
    return store.fetchUsers();
  }, [store]);

  const search = useCallback(
    (query: string) => {
      store.setFilters({ ...store.filters, search: query });
    },
    [store]
  );

  const filterByRole = useCallback(
    (role?: UserRole) => {
      store.setFilters({ ...store.filters, role });
    },
    [store]
  );

  const filterByStatus = useCallback(
    (status?: UserStatus) => {
      store.setFilters({ ...store.filters, status });
    },
    [store]
  );

  const clearFilters = useCallback(() => {
    store.setFilters({});
  }, [store]);

  return {
    // Data
    users: store.users,
    totalUsers: store.totalUsers,
    currentPage: store.currentPage,
    totalPages: store.totalPages,
    hasNextPage: store.hasNextPage,
    hasPrevPage: store.hasPrevPage,

    // Filters
    filters: store.filters,

    // State
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    refresh,
    search,
    filterByRole,
    filterByStatus,
    clearFilters,
    setPage: store.setPage,
    clearError: store.clearError,
  };
}

/**
 * Hook para un usuario específico
 */
export function useUser(id?: string) {
  const store = useUsersStore();

  useEffect(() => {
    if (id) {
      store.fetchUserById(id);
    }
    return () => {
      store.clearSelectedUser();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = useCallback(
    async (data: UpdateUserRequest) => {
      if (!id) throw new Error('No user ID provided');
      return store.updateUser(id, data);
    },
    [id, store]
  );

  const remove = useCallback(async () => {
    if (!id) throw new Error('No user ID provided');
    return store.deleteUser(id);
  }, [id, store]);

  return {
    user: store.selectedUser,
    isLoading: store.isLoading,
    isUpdating: store.isUpdating,
    isDeleting: store.isDeleting,
    error: store.error,

    update,
    remove,
    refresh: () => id && store.fetchUserById(id),
    clearError: store.clearError,
  };
}

/**
 * Hook para crear usuarios
 */
export function useCreateUser() {
  const store = useUsersStore();

  const create = useCallback(
    async (data: CreateUserRequest) => {
      return store.createUser(data);
    },
    [store]
  );

  return {
    create,
    isCreating: store.isCreating,
    error: store.error,
    clearError: store.clearError,
  };
}

/**
 * Hook para búsqueda rápida de usuarios
 */
export function useUserSearch() {
  const searchUsers = useCallback(async (query: string, limit = 10): Promise<User[]> => {
    if (!query || query.length < 2) return [];
    return usersApi.searchUsers(query, limit);
  }, []);

  return { searchUsers };
}

/**
 * Hook para estadísticas de usuarios
 */
export function useUserStats() {
  const getStats = useCallback(async () => {
    return usersApi.getStats();
  }, []);

  return { getStats };
}

/**
 * Hook para acciones de estado de usuario
 */
export function useUserActions() {
  const store = useUsersStore();

  const activate = useCallback(async (id: string) => {
    const user = await usersApi.activateUser(id);
    // Actualizar en el store si existe
    const users = useUsersStore.getState().users;
    useUsersStore.setState({
      users: users.map((u) => (u.id === id ? user : u)),
    });
    return user;
  }, []);

  const deactivate = useCallback(async (id: string) => {
    const user = await usersApi.deactivateUser(id);
    const users = useUsersStore.getState().users;
    useUsersStore.setState({
      users: users.map((u) => (u.id === id ? user : u)),
    });
    return user;
  }, []);

  const suspend = useCallback(async (id: string, reason?: string) => {
    const user = await usersApi.suspendUser(id, reason);
    const users = useUsersStore.getState().users;
    useUsersStore.setState({
      users: users.map((u) => (u.id === id ? user : u)),
    });
    return user;
  }, []);

  const changePassword = useCallback(async (userId: string, newPassword: string) => {
    await usersApi.adminChangePassword({ user_id: userId, new_password: newPassword });
  }, []);

  return {
    activate,
    deactivate,
    suspend,
    changePassword,
    isUpdating: store.isUpdating,
    error: store.error,
  };
}
