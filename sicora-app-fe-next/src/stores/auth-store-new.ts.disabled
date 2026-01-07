import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AuthService from '../lib/auth-api';
import {
  User,
  LoginCredentials,
  AuthResponse,
  ProfileUpdateRequest,
  ChangePasswordRequest,
} from '../types/auth.types';

interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (userData: ProfileUpdateRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  verifyToken: () => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        user: null,
        access_token: null,
        refresh_token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Acciones
        login: async (credentials: LoginCredentials) => {
          try {
            set({ isLoading: true, error: null });

            const response: AuthResponse = await AuthService.login(credentials);

            set({
              user: response.user,
              access_token: response.access_token,
              refresh_token: response.refresh_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            console.log('✅ Login exitoso:', response.user.email);
          } catch (error: any) {
            const errorMessage = error.message || 'Error de autenticación';

            set({
              error: errorMessage,
              isLoading: false,
              user: null,
              access_token: null,
              refresh_token: null,
              isAuthenticated: false,
            });

            console.error('❌ Error de login:', errorMessage);
            throw new Error(errorMessage);
          }
        },

        logout: async () => {
          try {
            const { access_token } = get();

            if (access_token) {
              await AuthService.logout();
            }
          } catch (error) {
            console.warn('Error al cerrar sesión en el servidor:', error);
          } finally {
            set({
              user: null,
              access_token: null,
              refresh_token: null,
              isAuthenticated: false,
              error: null,
              isLoading: false,
            });

            console.log('✅ Sesión cerrada');
          }
        },

        register: async (userData: any) => {
          try {
            set({ isLoading: true, error: null });

            const response = await AuthService.register(userData);

            set({
              isLoading: false,
              error: null,
            });

            console.log('✅ Registro exitoso:', response);
          } catch (error: any) {
            const errorMessage = error.message || 'Error en el registro';

            set({
              error: errorMessage,
              isLoading: false,
            });

            console.error('❌ Error de registro:', errorMessage);
            throw new Error(errorMessage);
          }
        },

        refreshToken: async () => {
          try {
            const { refresh_token } = get();

            if (!refresh_token) {
              throw new Error('No hay token de refresco disponible');
            }

            const response = await AuthService.refreshToken(refresh_token);

            set({
              access_token: response.access_token,
              error: null,
            });

            console.log('✅ Token refrescado exitosamente');
          } catch (error: any) {
            const errorMessage = error.message || 'Error al refrescar token';

            set({
              error: errorMessage,
              user: null,
              access_token: null,
              refresh_token: null,
              isAuthenticated: false,
            });

            console.error('❌ Error al refrescar token:', errorMessage);
            throw new Error(errorMessage);
          }
        },

        updateProfile: async (userData: ProfileUpdateRequest) => {
          try {
            set({ isLoading: true, error: null });

            const response = await AuthService.updateProfile(userData);
            const { user } = get();

            if (user) {
              const updatedUser = { ...user, ...userData };
              set({
                user: updatedUser,
                isLoading: false,
                error: null,
              });
            }

            console.log('✅ Perfil actualizado:', response);
          } catch (error: any) {
            const errorMessage = error.message || 'Error al actualizar perfil';

            set({
              error: errorMessage,
              isLoading: false,
            });

            console.error('❌ Error al actualizar perfil:', errorMessage);
            throw new Error(errorMessage);
          }
        },

        changePassword: async (data: ChangePasswordRequest) => {
          try {
            set({ isLoading: true, error: null });

            await AuthService.changePassword(data);

            set({
              isLoading: false,
              error: null,
            });

            console.log('✅ Contraseña cambiada exitosamente');
          } catch (error: any) {
            const errorMessage = error.message || 'Error al cambiar contraseña';

            set({
              error: errorMessage,
              isLoading: false,
            });

            console.error('❌ Error al cambiar contraseña:', errorMessage);
            throw new Error(errorMessage);
          }
        },

        verifyToken: async () => {
          try {
            const isValid = await AuthService.verifyToken();

            if (!isValid) {
              set({
                user: null,
                access_token: null,
                refresh_token: null,
                isAuthenticated: false,
              });
            }

            return isValid;
          } catch (error) {
            set({
              user: null,
              access_token: null,
              refresh_token: null,
              isAuthenticated: false,
            });
            return false;
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'sicora-auth',
        partialize: (state) => ({
          user: state.user,
          access_token: state.access_token,
          refresh_token: state.refresh_token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);

// Hook para verificar autenticación al cargar la app
export const useAuthInitialization = () => {
  const { verifyToken, isAuthenticated, access_token } = useAuthStore();

  const initializeAuth = async () => {
    if (access_token && !isAuthenticated) {
      await verifyToken();
    }
  };

  return { initializeAuth };
};
