/**
 * SICORA - Hook de Autenticación
 *
 * Hook personalizado que integra el store de autenticación
 * con el API client para manejar todo el flujo de auth.
 *
 * Funcionalidades:
 * - Login/Logout
 * - Refresh automático de token
 * - Verificación de sesión
 * - Gestión de perfil
 * - Estados de carga y error
 *
 * @fileoverview Auth hook
 * @module hooks/useAuth
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type User as StoreUser } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';
import type {
  LoginCredentials,
  ChangePasswordRequest,
  ProfileUpdateRequest,
} from '@/types/auth.types';

/**
 * Estado del hook de autenticación
 */
interface UseAuthState {
  /** Usuario autenticado */
  user: StoreUser | null;
  /** Si el usuario está autenticado */
  isAuthenticated: boolean;
  /** Token de acceso actual */
  token: string | null;
  /** Si hay una operación en curso */
  isLoading: boolean;
  /** Mensaje de error si hay uno */
  error: string | null;
}

/**
 * Acciones del hook de autenticación
 */
interface UseAuthActions {
  /** Iniciar sesión */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  /** Cerrar sesión */
  logout: () => Promise<void>;
  /** Verificar token actual */
  verifySession: () => Promise<boolean>;
  /** Cambiar contraseña */
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
  /** Actualizar perfil */
  updateProfile: (data: ProfileUpdateRequest) => Promise<boolean>;
  /** Limpiar error */
  clearError: () => void;
}

/**
 * Retorno del hook useAuth
 */
export type UseAuthReturn = UseAuthState & UseAuthActions;

/**
 * Hook de autenticación
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error } = useAuth();
 *
 *   const handleSubmit = async (credentials) => {
 *     const success = await login(credentials);
 *     if (success) {
 *       router.push('/dashboard');
 *     }
 *   };
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const store = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Iniciar sesión
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login(credentials);

        if (response.success && response.data) {
          const { access_token, user } = response.data;

          // Adaptar usuario del backend al formato del store
          const storeUser = {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role as
              | 'admin'
              | 'instructor'
              | 'aprendiz'
              | 'coordinador'
              | 'administrativo',
            status: 'online' as const,
          };

          store.login(storeUser, access_token);

          // Guardar token en cookie para el middleware
          document.cookie = `auth-storage=${JSON.stringify({
            state: { isAuthenticated: true, user: storeUser },
          })}; path=/; max-age=86400; SameSite=Strict`;

          return true;
        } else {
          setError(response.message || 'Error al iniciar sesión');
          return false;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error de conexión';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [store]
  );

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Intentar cerrar sesión en el backend
      await authApi.logout();
    } catch {
      // Ignorar errores del backend, cerrar sesión localmente de todos modos
      console.warn('Error al cerrar sesión en el servidor');
    } finally {
      // Limpiar estado local
      store.logout();

      // Limpiar cookie
      document.cookie = 'auth-storage=; path=/; max-age=0';
      document.cookie = 'auth-token=; path=/; max-age=0';

      setIsLoading(false);

      // Redirigir a login
      router.push('/login');
    }
  }, [store, router]);

  /**
   * Verificar sesión actual
   */
  const verifySession = useCallback(async (): Promise<boolean> => {
    if (!store.token) return false;

    try {
      const isValid = await authApi.verifyToken();

      if (!isValid) {
        // Token inválido, cerrar sesión
        store.logout();
        document.cookie = 'auth-storage=; path=/; max-age=0';
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }, [store]);

  /**
   * Cambiar contraseña
   */
  const changePassword = useCallback(
    async (data: ChangePasswordRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.changePassword(data);

        if (response.success) {
          return true;
        } else {
          setError(response.message || 'Error al cambiar contraseña');
          return false;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error de conexión';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Actualizar perfil
   */
  const updateProfile = useCallback(
    async (data: ProfileUpdateRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.updateProfile(data);

        if (response.success && response.data) {
          // Actualizar usuario en el store
          const updatedUser = response.data;
          store.setUser({
            id: updatedUser.id,
            name: `${updatedUser.first_name} ${updatedUser.last_name}`,
            email: updatedUser.email,
            role: updatedUser.role as
              | 'admin'
              | 'instructor'
              | 'aprendiz'
              | 'coordinador'
              | 'administrativo',
            status: store.user?.status || 'online',
          });

          return true;
        } else {
          setError(response.message || 'Error al actualizar perfil');
          return false;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error de conexión';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [store]
  );

  /**
   * Verificar sesión al montar el componente
   */
  useEffect(() => {
    if (store.isAuthenticated && store.token) {
      verifySession();
    }
  }, [store.isAuthenticated, store.token, verifySession]);

  return {
    // Estado
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    token: store.token,
    isLoading,
    error,
    // Acciones
    login,
    logout,
    verifySession,
    changePassword,
    updateProfile,
    clearError,
  };
}

/**
 * Hook para proteger componentes que requieren autenticación
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { isReady, isAuthenticated } = useRequireAuth();
 *
 *   if (!isReady) return <Loading />;
 *   if (!isAuthenticated) return null; // Ya redirigido
 *
 *   return <Content />;
 * }
 * ```
 */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Calcular isReady directamente sin useEffect
  const isReady = isAuthenticated;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return { isReady, isAuthenticated };
}

/**
 * Hook para verificar rol del usuario
 *
 * @example
 * ```tsx
 * function AdminPage() {
 *   const { hasAccess, userRole } = useRequireRole(['admin', 'coordinador']);
 *
 *   if (!hasAccess) return <AccessDenied />;
 *
 *   return <AdminContent />;
 * }
 * ```
 */
export function useRequireRole(allowedRoles: string[]) {
  const { user, isAuthenticated } = useAuthStore();

  // Calcular hasAccess directamente sin useEffect
  const hasAccess = isAuthenticated && user?.role ? allowedRoles.includes(user.role) : false;

  return {
    hasAccess,
    userRole: user?.role || null,
    isAuthenticated,
  };
}

export default useAuth;
