import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '../lib/api/auth';
import { tokenStorage, getErrorMessage } from '../lib/api/client';
import type {
  User,
  LoginCredentials,
  ChangePasswordRequest,
  ProfileUpdateRequest,
} from '../types/auth.types';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Iniciar sesión
       */
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);

          // Guardar tokens
          tokenStorage.setTokens(response.access_token, response.refresh_token);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error),
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      /**
       * Cerrar sesión
       */
      logout: () => {
        // Intentar logout en el servidor (no esperamos respuesta)
        authApi.logout().catch(() => {});

        // Limpiar estado local
        tokenStorage.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      /**
       * Refrescar sesión (obtener usuario actual)
       */
      refreshSession: async () => {
        const token = tokenStorage.getAccessToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token inválido, limpiar
          get().logout();
          set({ isLoading: false });
        }
      },

      /**
       * Cambiar contraseña
       */
      changePassword: async (data: ChangePasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword(data);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error),
          });
          throw error;
        }
      },

      /**
       * Actualizar perfil
       */
      updateProfile: async (data: ProfileUpdateRequest) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.updateProfile(data);
          set({
            user,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error),
          });
          throw error;
        }
      },

      /**
       * Limpiar error
       */
      clearError: () => set({ error: null }),

      /**
       * Establecer estado de carga
       */
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      /**
       * Verificar autenticación al iniciar
       */
      checkAuth: async () => {
        const token = tokenStorage.getAccessToken();
        if (token) {
          await get().refreshSession();
        }
      },
    }),
    {
      name: 'sicora-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Listener para logout forzado (cuando falla el refresh token)
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}
