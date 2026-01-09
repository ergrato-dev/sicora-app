/**
 * SICORA - HTTP Client Tests
 *
 * Tests unitarios para el cliente HTTP base.
 *
 * @fileoverview HTTP Client tests
 * @module lib/api-client.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { httpClient, ApiClientError, API_CONFIG } from './api-client';

// Mock de fetch global
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock de localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', mockLocalStorage);

describe('HttpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET requests', () => {
    it('should make GET request with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: 'test' }),
      });

      const result = await httpClient.get('/api/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/api/v1/test`,
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result.data).toEqual({ data: 'test' });
    });

    it('should include query params in GET request URL', async () => {
      // Note: httpClient.get expects query params to be included in the URL
      // The API consumer is responsible for building the query string
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await httpClient.get('/api/v1/test?page=1&limit=10');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
    });

    it('should include auth token in headers', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ state: { access_token: 'test-token' } })
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await httpClient.get('/api/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 'new-id' }),
      });

      const body = { name: 'Test', value: 123 };
      const result = await httpClient.post('/api/v1/test', body);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/api/v1/test`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result.data).toEqual({ id: 'new-id' });
    });

    it('should handle POST without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await httpClient.post('/api/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ updated: true }),
      });

      const body = { name: 'Updated' };
      await httpClient.put('/api/v1/test/1', body);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/api/v1/test/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await httpClient.delete('/api/v1/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/api/v1/test/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw ApiClientError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Validation error' }),
      });

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(
        ApiClientError
      );
    });

    it('should include error details in ApiClientError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Resource not found', code: 'NOT_FOUND' }),
      });

      try {
        await httpClient.get('/api/v1/test/999');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).status).toBe(404);
        expect((error as ApiClientError).message).toBe('Resource not found');
      }
    });

    it('should handle 401 unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Token expired' }),
      });

      try {
        await httpClient.get('/api/v1/test');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as ApiClientError).status).toBe(401);
      }
    });

    it('should handle 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Internal error' }),
      });

      await expect(httpClient.post('/api/v1/test', {})).rejects.toThrow(
        ApiClientError
      );
    });

    it('should handle non-JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html>Error</html>',
      });

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(httpClient.get('/api/v1/test')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Headers', () => {
    it('should include default content-type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await httpClient.get('/api/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
    });

    it('should allow custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      // httpClient.get expects customHeaders directly as second parameter
      await httpClient.get('/api/v1/test', { 'X-Custom-Header': 'custom-value' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });
});

describe('ApiClientError', () => {
  it('should create error with all properties', () => {
    const error = new ApiClientError('Test error', 400, 'VALIDATION_ERROR', {
      field: 'email',
    });

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual({ field: 'email' });
    expect(error.name).toBe('ApiClientError');
  });

  it('should be instanceof Error', () => {
    const error = new ApiClientError('Test', 500, 'SERVER_ERROR');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiClientError);
  });
});
