/**
 * Store de usuarios con Zustand
 * Gestión de estado para el módulo de usuarios
 */

import { create } from 'zustand';
import { usersApi } from '../lib/api/users';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  PaginationParams,
} from '../types/user.types';

interface UsersState {
  // Data
  users: User[];
  selectedUser: User | null;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;

  // Filters
  filters: UserFilters;
  pagination: PaginationParams;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: CreateUserRequest) => Promise<User>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  setFilters: (filters: UserFilters) => void;
  setPagination: (pagination: Partial<PaginationParams>) => void;
  setPage: (page: number) => void;
  clearSelectedUser: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialFilters: UserFilters = {};
const initialPagination: PaginationParams = {
  page: 1,
  limit: 10,
  sort_by: 'created_at',
  sort_order: 'desc',
};

export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial State
  users: [],
  selectedUser: null,
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,

  filters: initialFilters,
  pagination: initialPagination,

  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  // Actions
  fetchUsers: async () => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const response = await usersApi.getUsers(filters, pagination);
      set({
        users: response.data,
        totalUsers: response.meta.total,
        currentPage: response.meta.page,
        totalPages: response.meta.total_pages,
        hasNextPage: response.meta.has_next,
        hasPrevPage: response.meta.has_prev,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar usuarios';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchUserById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const user = await usersApi.getUserById(id);
      set({ selectedUser: user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar usuario';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createUser: async (data: CreateUserRequest) => {
    set({ isCreating: true, error: null });

    try {
      const newUser = await usersApi.createUser(data);
      const { users } = get();
      set({
        users: [newUser, ...users],
        totalUsers: get().totalUsers + 1,
        isCreating: false,
      });
      return newUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear usuario';
      set({ error: message, isCreating: false });
      throw error;
    }
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    set({ isUpdating: true, error: null });

    try {
      const updatedUser = await usersApi.updateUser(id, data);
      const { users, selectedUser } = get();

      set({
        users: users.map((u) => (u.id === id ? updatedUser : u)),
        selectedUser: selectedUser?.id === id ? updatedUser : selectedUser,
        isUpdating: false,
      });
      return updatedUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
      set({ error: message, isUpdating: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isDeleting: true, error: null });

    try {
      await usersApi.deleteUser(id);
      const { users, selectedUser } = get();

      set({
        users: users.filter((u) => u.id !== id),
        selectedUser: selectedUser?.id === id ? null : selectedUser,
        totalUsers: get().totalUsers - 1,
        isDeleting: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
      set({ error: message, isDeleting: false });
      throw error;
    }
  },

  setFilters: (filters: UserFilters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
    get().fetchUsers();
  },

  setPagination: (pagination: Partial<PaginationParams>) => {
    set({ pagination: { ...get().pagination, ...pagination } });
    get().fetchUsers();
  },

  setPage: (page: number) => {
    set({ pagination: { ...get().pagination, page } });
    get().fetchUsers();
  },

  clearSelectedUser: () => set({ selectedUser: null }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      users: [],
      selectedUser: null,
      totalUsers: 0,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      filters: initialFilters,
      pagination: initialPagination,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
    }),
}));
