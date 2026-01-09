/**
 * Tests para useAuth hook
 * @module hooks/__tests__/useAuth.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Hoisted mocks - estas variables se definen antes de que los mocks se ejecuten
const { mockPush, mockLogin, mockLogout, mockSetUser, mockStoreState, mockAuthApi } = vi.hoisted(() => {
  const mockPush = vi.fn();
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  const mockSetUser = vi.fn();
  const mockStoreState = {
    user: null as null | object,
    token: null as null | string,
    isAuthenticated: false,
    login: mockLogin,
    logout: mockLogout,
    setUser: mockSetUser,
  };
  const mockAuthApi = {
    login: vi.fn(),
    logout: vi.fn(),
    verifyToken: vi.fn(),
    changePassword: vi.fn(),
    updateProfile: vi.fn(),
  };
  return { mockPush, mockLogin, mockLogout, mockSetUser, mockStoreState, mockAuthApi };
});

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock del auth store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(() => mockStoreState),
}));

// Mock del auth API
vi.mock('@/lib/api/auth', () => ({
  authApi: mockAuthApi,
}));

// Import después de los mocks
import { useAuth } from '../useAuth';

// Mock document.cookie
const originalCookie = document.cookie;
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = '';
    
    // Reset store state
    mockStoreState.user = null;
    mockStoreState.token = null;
    mockStoreState.isAuthenticated = false;
  });

  afterEach(() => {
    document.cookie = originalCookie;
  });

  describe('Estado inicial', () => {
    it('debe retornar estado no autenticado por defecto', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe proveer todas las acciones requeridas', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.verifySession).toBe('function');
      expect(typeof result.current.changePassword).toBe('function');
      expect(typeof result.current.updateProfile).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('debe realizar login exitoso', async () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'mock-token-123',
          user: {
            id: '1',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            role: 'instructor',
          },
        },
      };
      mockAuthApi.login.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.login(validCredentials);
      });

      expect(success).toBe(true);
      expect(mockAuthApi.login).toHaveBeenCalledWith(validCredentials);
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'instructor',
        }),
        'mock-token-123'
      );
    });

    it('debe manejar error de login - credenciales inválidas', async () => {
      mockAuthApi.login.mockResolvedValueOnce({
        success: false,
        message: 'Credenciales inválidas',
      });

      const { result } = renderHook(() => useAuth());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.login(validCredentials);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Credenciales inválidas');
    });

    it('debe manejar error de conexión', async () => {
      mockAuthApi.login.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.login(validCredentials);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('debe establecer isLoading durante el login', async () => {
      let resolveLogin: Function;
      mockAuthApi.login.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
      );

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.login(validCredentials);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveLogin!({ success: false });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('debe guardar cookie después de login exitoso', async () => {
      mockAuthApi.login.mockResolvedValueOnce({
        success: true,
        data: {
          access_token: 'mock-token',
          user: {
            id: '1',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            role: 'admin',
          },
        },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(validCredentials);
      });

      expect(document.cookie).toContain('auth-storage=');
    });
  });

  describe('logout', () => {
    it('debe realizar logout y redirigir a login', async () => {
      mockAuthApi.logout.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('debe realizar logout local aunque el backend falle', async () => {
      mockAuthApi.logout.mockRejectedValueOnce(new Error('Server error'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('debe limpiar cookies después del logout', async () => {
      document.cookie = 'auth-storage=some-value; path=/';
      document.cookie = 'auth-token=some-token; path=/';
      mockAuthApi.logout.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(document.cookie).toContain('max-age=0');
    });
  });

  describe('verifySession', () => {
    it('debe retornar false si no hay token', async () => {
      mockStoreState.token = null;

      const { result } = renderHook(() => useAuth());

      let isValid: boolean = true;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      expect(isValid).toBe(false);
      expect(mockAuthApi.verifyToken).not.toHaveBeenCalled();
    });

    it('debe verificar token si existe', async () => {
      mockStoreState.token = 'valid-token';
      mockAuthApi.verifyToken.mockResolvedValueOnce(true);

      const { result } = renderHook(() => useAuth());

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      expect(isValid).toBe(true);
      expect(mockAuthApi.verifyToken).toHaveBeenCalled();
    });

    it('debe cerrar sesión si el token es inválido', async () => {
      mockStoreState.token = 'invalid-token';
      mockAuthApi.verifyToken.mockResolvedValueOnce(false);

      const { result } = renderHook(() => useAuth());

      let isValid: boolean = true;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      expect(isValid).toBe(false);
      expect(mockLogout).toHaveBeenCalled();
    });

    it('debe manejar error de verificación', async () => {
      mockStoreState.token = 'some-token';
      mockAuthApi.verifyToken.mockRejectedValueOnce(new Error('Error'));

      const { result } = renderHook(() => useAuth());

      let isValid: boolean = true;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      expect(isValid).toBe(false);
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      current_password: 'oldpass123',
      new_password: 'newpass456',
    };

    it('debe cambiar contraseña exitosamente', async () => {
      mockAuthApi.changePassword.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useAuth());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.changePassword(passwordData);
      });

      expect(success).toBe(true);
      expect(mockAuthApi.changePassword).toHaveBeenCalledWith(passwordData);
    });

    it('debe manejar error de cambio de contraseña', async () => {
      mockAuthApi.changePassword.mockResolvedValueOnce({
        success: false,
        message: 'Contraseña actual incorrecta',
      });

      const { result } = renderHook(() => useAuth());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.changePassword(passwordData);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Contraseña actual incorrecta');
    });

    it('debe manejar error de conexión', async () => {
      mockAuthApi.changePassword.mockRejectedValueOnce(new Error('Connection failed'));

      const { result } = renderHook(() => useAuth());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.changePassword(passwordData);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Connection failed');
    });
  });

  describe('updateProfile', () => {
    const profileData = {
      first_name: 'Updated',
      last_name: 'Name',
      phone: '+1234567890',
    };

    it('debe actualizar perfil exitosamente', async () => {
      mockAuthApi.updateProfile.mockResolvedValueOnce({
        success: true,
        data: {
          id: '1',
          first_name: 'Updated',
          last_name: 'Name',
          email: 'test@example.com',
          role: 'instructor',
        },
      });

      const { result } = renderHook(() => useAuth());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.updateProfile(profileData);
      });

      expect(success).toBe(true);
      expect(mockAuthApi.updateProfile).toHaveBeenCalledWith(profileData);
      expect(mockSetUser).toHaveBeenCalled();
    });

    it('debe manejar error de actualización', async () => {
      mockAuthApi.updateProfile.mockResolvedValueOnce({
        success: false,
        message: 'Error al actualizar perfil',
      });

      const { result } = renderHook(() => useAuth());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.updateProfile(profileData);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Error al actualizar perfil');
    });
  });

  describe('clearError', () => {
    it('debe limpiar el error', async () => {
      mockAuthApi.login.mockResolvedValueOnce({
        success: false,
        message: 'Some error',
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ email: 'test@test.com', password: 'pass' });
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Estado autenticado', () => {
    it('debe reflejar usuario autenticado del store', () => {
      mockStoreState.user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        status: 'online',
      };
      mockStoreState.token = 'valid-token';
      mockStoreState.isAuthenticated = true;

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockStoreState.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('valid-token');
    });
  });

  describe('Roles de usuario', () => {
    it.each([
      ['admin'],
      ['instructor'],
      ['aprendiz'],
      ['coordinador'],
      ['administrativo'],
    ])('debe mapear correctamente el rol %s', async (role) => {
      mockAuthApi.login.mockResolvedValueOnce({
        success: true,
        data: {
          access_token: 'token',
          user: {
            id: '1',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            role: role,
          },
        },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ email: 'test@test.com', password: 'pass' });
      });

      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          role: role,
        }),
        'token'
      );
    });
  });
});
