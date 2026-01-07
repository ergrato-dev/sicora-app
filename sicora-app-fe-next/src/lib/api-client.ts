import type { ApiResponse } from '../types/auth.types';

// Configuración de la API (adaptado para Next.js)
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001',
  USER_SERVICE_URL:
    process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8001',
  TIMEOUT: 30000, // 30 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// Clase para manejar errores de API
export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Cliente HTTP base
class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = { ...API_CONFIG.HEADERS };
  }

  /**
   * Obtener el token de autenticación del localStorage
   */
  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('sicora-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.state?.access_token || null;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el token de autenticación:', error);
      return null;
    }
  }

  /**
   * Preparar headers para la petición
   */
  private getHeaders(
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    // Agregar token de autenticación si está disponible
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Agregar headers personalizados
    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Manejar la respuesta de la API
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    let data: unknown;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === 'object' && data !== null && 'message' in data
          ? String(data.message)
          : `HTTP Error: ${response.status} ${response.statusText}`;

      throw new ApiClientError(
        errorMessage,
        response.status,
        response.status.toString(),
        typeof data === 'object' ? (data as Record<string, unknown>) : undefined
      );
    }

    return {
      data: data as T,
      status: response.status,
      message: 'Success',
    };
  }

  /**
   * Realizar petición GET
   */
  async get<T>(
    url: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'GET',
        headers: this.getHeaders(customHeaders),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Error desconocido',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Realizar petición POST
   */
  async post<T>(
    url: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers: this.getHeaders(customHeaders),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Error desconocido',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Realizar petición PUT
   */
  async put<T>(
    url: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'PUT',
        headers: this.getHeaders(customHeaders),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Error desconocido',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Realizar petición DELETE
   */
  async delete<T>(
    url: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'DELETE',
        headers: this.getHeaders(customHeaders),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Error desconocido',
        0,
        'NETWORK_ERROR'
      );
    }
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();

// Funciones de conveniencia para usar en la aplicación
export const apiClient = {
  get: <T>(url: string, headers?: Record<string, string>) =>
    httpClient.get<T>(url, headers),
  post: <T>(url: string, data?: unknown, headers?: Record<string, string>) =>
    httpClient.post<T>(url, data, headers),
  put: <T>(url: string, data?: unknown, headers?: Record<string, string>) =>
    httpClient.put<T>(url, data, headers),
  delete: <T>(url: string, headers?: Record<string, string>) =>
    httpClient.delete<T>(url, headers),
};

export default apiClient;
