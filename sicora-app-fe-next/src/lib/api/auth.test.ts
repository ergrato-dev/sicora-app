/**
 * SICORA - Auth API Client Tests
 *
 * Tests unitarios para el cliente API de autenticación.
 *
 * @fileoverview Auth API tests
 * @module lib/api/auth.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authApi from './auth';
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

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call httpClient.post with correct endpoint and credentials', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          refresh_token: 'refresh-token',
          user: { id: 'user-1', email: 'test@test.com' },
        },
        status: 200,
        message: 'Success',
      };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const credentials = {
        email: 'test@test.com',
        password: 'password123',
      };

      const result = await authApi.login(credentials);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        credentials
      );
      expect(result.data?.access_token).toBe('test-token');
    });

    it('should handle login error', async () => {
      vi.mocked(httpClient.post).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const credentials = {
        email: 'test@test.com',
        password: 'wrong-password',
      };

      await expect(authApi.login(credentials)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('logout', () => {
    it('should call httpClient.post with logout endpoint', async () => {
      const mockResponse = { data: undefined, status: 200, message: 'Success' };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await authApi.logout();

      expect(httpClient.post).toHaveBeenCalledWith('/api/v1/auth/logout');
    });
  });

  describe('refreshToken', () => {
    it('should call httpClient.post with refresh endpoint and token', async () => {
      const mockResponse = {
        data: { access_token: 'new-token', expires_in: 3600 },
        status: 200,
        message: 'Success',
      };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const request = { refresh_token: 'old-refresh-token' };

      const result = await authApi.refreshToken(request);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/refresh',
        request
      );
      expect(result.data?.access_token).toBe('new-token');
    });
  });

  describe('forgotPassword', () => {
    it('should call httpClient.post with forgot-password endpoint', async () => {
      const mockResponse = { data: undefined, status: 200, message: 'Success' };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const request = { email: 'test@test.com' };

      await authApi.forgotPassword(request);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/forgot-password',
        request
      );
    });
  });

  describe('resetPassword', () => {
    it('should call httpClient.post with reset-password endpoint', async () => {
      const mockResponse = { data: undefined, status: 200, message: 'Success' };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const request = {
        token: 'reset-token',
        password: 'new-password',
        password_confirmation: 'new-password',
      };

      await authApi.resetPassword(request);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/reset-password',
        request
      );
    });
  });

  describe('changePassword', () => {
    it('should call httpClient.put with change-password endpoint', async () => {
      const mockResponse = { data: undefined, status: 200, message: 'Success' };
      vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

      const request = {
        current_password: 'old-password',
        new_password: 'new-password',
        confirm_password: 'new-password',
      };

      await authApi.changePassword(request);

      expect(httpClient.put).toHaveBeenCalledWith(
        '/api/v1/auth/change-password',
        request
      );
    });
  });

  describe('updateProfile', () => {
    it('should call httpClient.put with profile endpoint', async () => {
      const mockResponse = {
        data: { id: 'user-1', name: 'Updated Name' },
        status: 200,
        message: 'Success',
      };
      vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

      const request = { name: 'Updated Name' };

      const result = await authApi.updateProfile(request);

      expect(httpClient.put).toHaveBeenCalledWith(
        '/api/v1/auth/profile',
        request
      );
      expect(result.data?.name).toBe('Updated Name');
    });
  });

  describe('getCurrentUser', () => {
    it('should call httpClient.get with me endpoint', async () => {
      const mockResponse = {
        data: { id: 'user-1', email: 'test@test.com', name: 'Test User' },
        status: 200,
        message: 'Success',
      };
      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await authApi.getCurrentUser();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/users/me');
      expect(result.data?.email).toBe('test@test.com');
    });
  });
});
