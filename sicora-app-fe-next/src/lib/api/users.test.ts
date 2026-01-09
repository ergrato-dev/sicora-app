/**
 * SICORA - Users API Client Tests
 *
 * Tests unitarios para el cliente API de usuarios.
 * Testea las funciones exportadas por usersApi.
 *
 * @fileoverview Users API tests
 * @module lib/api/users.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersApi } from './users';
import { httpClient } from '../api-client';

// Mock del httpClient
vi.mock('../api-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('usersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ==========================================================================
     CRUD OPERATIONS
     ========================================================================== */

  describe('CRUD Operations', () => {
    describe('list', () => {
      it('should call httpClient.get for listing users', async () => {
        const mockResponse = {
          data: { users: [], total: 0, page: 1, page_size: 10 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await usersApi.list();

        expect(httpClient.get).toHaveBeenCalled();
      });

      it('should pass filter parameters', async () => {
        const mockResponse = {
          data: { users: [], total: 0, page: 1, page_size: 10 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await usersApi.list({ rol: 'instructor', page: 1, page_size: 10 });

        expect(httpClient.get).toHaveBeenCalled();
      });
    });

    describe('get', () => {
      it('should call httpClient.get with user ID', async () => {
        const mockResponse = {
          data: {
            data: {
              id: 'user-1',
              email: 'test@test.com',
              nombre: 'Test',
              apellido: 'User',
              rol: 'instructor',
            },
          },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await usersApi.get('user-1');

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/users/user-1');
      });
    });

    describe('create', () => {
      it('should call httpClient.post with user data', async () => {
        const mockResponse = {
          data: { message: 'Usuario creado', data: { id: 'user-new' } },
          status: 201,
          message: 'Created',
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@test.com',
          documento: '12345678',
          rol: 'aprendiz' as const,
          password: 'password123',
        };

        await usersApi.create(request);

        expect(httpClient.post).toHaveBeenCalledWith('/api/v1/users', request);
      });
    });

    describe('update', () => {
      it('should call httpClient.put with user ID and updates', async () => {
        const mockResponse = {
          data: { message: 'Usuario actualizado', data: { id: 'user-1' } },
          status: 200,
          message: 'Updated',
        };
        vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

        const updates = { nombre: 'Juan Carlos' };

        await usersApi.update('user-1', updates);

        expect(httpClient.put).toHaveBeenCalledWith('/api/v1/users/user-1', updates);
      });
    });

    describe('delete', () => {
      it('should call httpClient.delete with user ID', async () => {
        const mockResponse = {
          data: null,
          status: 204,
          message: 'Deleted',
        };
        vi.mocked(httpClient.delete).mockResolvedValue(mockResponse);

        await usersApi.delete('user-1');

        expect(httpClient.delete).toHaveBeenCalledWith('/api/v1/users/user-1');
      });
    });
  });

  /* ==========================================================================
     ADMIN OPERATIONS
     ========================================================================== */

  describe('Admin Operations', () => {
    describe('assignRole', () => {
      it('should call httpClient.put with role assignment', async () => {
        const mockResponse = {
          data: { message: 'Rol asignado' },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

        await usersApi.assignRole('user-1', { rol: 'coordinador' });

        expect(httpClient.put).toHaveBeenCalledWith(
          '/api/v1/users/user-1/role',
          { rol: 'coordinador' }
        );
      });
    });

    describe('resetPassword', () => {
      it('should call httpClient.post to reset user password', async () => {
        const mockResponse = {
          data: { message: 'Contraseña reseteada', temporary_password: 'temp123' },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        await usersApi.resetPassword('user-1', { send_email: true });

        expect(httpClient.post).toHaveBeenCalledWith(
          '/api/v1/users/user-1/reset-password',
          { send_email: true }
        );
      });
    });
  });

  /* ==========================================================================
     PROFILE OPERATIONS
     ========================================================================== */

  describe('Profile Operations', () => {
    describe('getProfile', () => {
      it('should call httpClient.get for user profile', async () => {
        const mockResponse = {
          data: { id: 'user-1', nombre: 'Test User' },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await usersApi.getProfile();

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/users/profile');
      });
    });

    describe('updateProfile', () => {
      it('should call httpClient.put to update profile', async () => {
        const mockResponse = {
          data: { message: 'Perfil actualizado' },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

        const updates = { telefono: '3001234567' };

        await usersApi.updateProfile(updates);

        expect(httpClient.put).toHaveBeenCalledWith('/api/v1/users/profile', updates);
      });
    });

    describe('getCurrentUser', () => {
      it('should call httpClient.get for current user', async () => {
        const mockResponse = {
          data: { data: { id: 'user-1', nombre: 'Current User' } },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await usersApi.getCurrentUser();

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/users/me');
      });
    });
  });

  /* ==========================================================================
     STATS
     ========================================================================== */

  describe('Stats', () => {
    describe('getStats', () => {
      it('should call httpClient.get for user stats', async () => {
        const mockResponse = {
          data: {
            total_usuarios: 100,
            usuarios_activos: 90,
            por_rol: { aprendiz: 70, instructor: 15 },
          },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await usersApi.getStats();

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/users/stats');
      });
    });
  });
});
