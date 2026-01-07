import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import type {
  LoginCredentials,
  ChangePasswordRequest,
  ProfileUpdateRequest,
} from '../types/auth.types';

/**
 * Hook personalizado para acceder al estado de autenticación
 * Proporciona una interfaz simplificada para las operaciones de auth
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    changePassword: storeChangePassword,
    updateProfile: storeUpdateProfile,
    clearError,
    checkAuth,
  } = useAuthStore();

  // Verificar autenticación al montar (solo una vez)
  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await storeLogin(credentials);
    },
    [storeLogin]
  );

  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  const changePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      await storeChangePassword(data);
    },
    [storeChangePassword]
  );

  const updateProfile = useCallback(
    async (data: ProfileUpdateRequest) => {
      await storeUpdateProfile(data);
    },
    [storeUpdateProfile]
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    logout,
    changePassword,
    updateProfile,
    clearError,

    // Computed
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor',
    isAprendiz: user?.role === 'aprendiz',
    isCoordinador: user?.role === 'coordinador',
    needsPasswordChange: user?.status === 'pending',
  };
}

/**
 * Hook para verificar permisos del usuario
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return permissions.some((p) => user.permissions.includes(p));
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return permissions.every((p) => user.permissions.includes(p));
    },
    [user]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions: user?.permissions || [],
    role: user?.role,
  };
}
