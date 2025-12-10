import { ApiResponse } from '../types/auth.types';

// Configuración de la API
const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:8002',
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

  constructor(message: string, status: number, code: string, details?: Record<string, unknown>) {
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
      console.warn('Error al obtener token de autenticación:', error);
      return null;
    }
  }

  /**
   * Preparar headers con autenticación si está disponible
   */
  private prepareHeaders(customHeaders?: Record<string, string>): Record<string, string> {
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
   * Procesar respuesta de la API
   */
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: unknown;

    // Intentar parsear JSON si es posible
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        console.warn('Error al parsear JSON:', error);
        data = null;
      }
    } else {
      data = await response.text();
    }

    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      const errorMessage =
        data?.error?.message || data?.message || `HTTP ${response.status}: ${response.statusText}`;
      const errorCode = data?.error?.code || data?.code || 'HTTP_ERROR';
      const errorDetails = data?.error?.details || data?.details;

      throw new ApiClientError(errorMessage, response.status, errorCode, errorDetails);
    }

    // Retornar respuesta estructurada
    return {
      success: true,
      data: data?.data || data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Realizar petición HTTP
   */
  private async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseURL}${url}`;
    const headers = this.prepareHeaders(options.headers as Record<string, string>);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.processResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiClientError('Timeout de la petición', 408, 'TIMEOUT');
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : 'Error desconocido',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Métodos HTTP públicos
   */
  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      queryString = searchParams.toString();
      if (queryString) {
        queryString = `?${queryString}`;
      }
    }

    return this.request<T>(`${url}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'DELETE',
    });
  }
}

// Instancia única del cliente HTTP
const httpClient = new HttpClient();

// Exportar métodos de conveniencia
export const { get, post, put, patch, delete: del } = httpClient;

// Exportar clase para casos avanzados
export { HttpClient };

// Exportar configuración para testing/desarrollo
export { API_CONFIG };
