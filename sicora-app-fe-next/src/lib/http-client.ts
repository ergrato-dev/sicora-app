/**
 * SICORA - Cliente HTTP Mejorado
 *
 * Cliente HTTP centralizado con manejo robusto de errores
 * basado en la guía MANEJO_DE_ERRORES.md
 *
 * Características:
 * - Manejo de errores normalizado
 * - Retry con backoff exponencial
 * - Request ID para trazabilidad
 * - Interceptores de request/response
 * - Timeout configurable
 * - Soporte para cancelación
 *
 * @fileoverview HTTP client with error handling
 * @module lib/api-client
 */

import {
  AppError,
  normalizeApiError,
  normalizeNetworkError,
  withRetry,
  logError,
  type RetryConfig,
  type NormalizedError,
} from './errors';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001',
  USER_SERVICE_URL:
    process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8001',
  SCHEDULE_SERVICE_URL:
    process.env.NEXT_PUBLIC_SCHEDULE_SERVICE_URL || 'http://localhost:8003',
  ATTENDANCE_SERVICE_URL:
    process.env.NEXT_PUBLIC_ATTENDANCE_SERVICE_URL || 'http://localhost:8004',
  TIMEOUT: 30000, // 30 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Respuesta genérica del API
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Opciones de request
 */
export interface RequestOptions {
  /** Headers adicionales */
  headers?: Record<string, string>;
  /** Timeout en ms (override del default) */
  timeout?: number;
  /** Configuración de retry */
  retry?: Partial<RetryConfig> | false;
  /** AbortSignal para cancelación */
  signal?: AbortSignal;
  /** Si debe incluir credenciales */
  withCredentials?: boolean;
}

/**
 * Interceptor de request
 */
type RequestInterceptor = (
  url: string,
  init: RequestInit
) => Promise<{ url: string; init: RequestInit }>;

/**
 * Interceptor de response
 */
type ResponseInterceptor = <T>(
  response: ApiResponse<T>,
  url: string
) => Promise<ApiResponse<T>>;

/**
 * Interceptor de error
 */
type ErrorInterceptor = (
  error: AppError,
  url: string
) => Promise<AppError | void>;

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Generar ID único de request para trazabilidad
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Obtener token de autenticación
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Intentar desde el store de Zustand
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.state?.token || null;
    }

    // Fallback a cookie (para SSR/middleware)
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find((c) =>
      c.trim().startsWith('auth-storage=')
    );
    if (authCookie) {
      const value = authCookie.split('=')[1];
      const parsed = JSON.parse(decodeURIComponent(value));
      return parsed?.state?.token || null;
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// CLASE HTTP CLIENT
// ============================================================================

class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = { ...API_CONFIG.HEADERS };

    // Agregar interceptor de auth por defecto
    this.addRequestInterceptor(async (url, init) => {
      const token = getAuthToken();
      if (token) {
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return { url, init };
    });

    // Agregar interceptor para manejar 401 (token expirado)
    this.addErrorInterceptor(async (error) => {
      if (error.category === 'UNAUTHORIZED') {
        // Limpiar auth y redirigir a login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          // No redirigir automáticamente, dejar que el componente lo maneje
        }
      }
      return error;
    });
  }

  // ==========================================================================
  // INTERCEPTORES
  // ==========================================================================

  /**
   * Agregar interceptor de request
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Agregar interceptor de response
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Agregar interceptor de error
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // ==========================================================================
  // MÉTODOS PRIVADOS
  // ==========================================================================

  /**
   * Preparar headers para la petición
   */
  private prepareHeaders(
    customHeaders?: Record<string, string>,
    requestId?: string
  ): Record<string, string> {
    return {
      ...this.defaultHeaders,
      'X-Request-ID': requestId || generateRequestId(),
      ...customHeaders,
    };
  }

  /**
   * Ejecutar interceptores de request
   */
  private async runRequestInterceptors(
    url: string,
    init: RequestInit
  ): Promise<{ url: string; init: RequestInit }> {
    let result = { url, init };
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result.url, result.init);
    }
    return result;
  }

  /**
   * Ejecutar interceptores de response
   */
  private async runResponseInterceptors<T>(
    response: ApiResponse<T>,
    url: string
  ): Promise<ApiResponse<T>> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result, url);
    }
    return result;
  }

  /**
   * Ejecutar interceptores de error
   */
  private async runErrorInterceptors(
    error: AppError,
    url: string
  ): Promise<AppError> {
    let result = error;
    for (const interceptor of this.errorInterceptors) {
      const modified = await interceptor(result, url);
      if (modified) {
        result = modified;
      }
    }
    return result;
  }

  /**
   * Procesar respuesta del fetch
   */
  private async handleResponse<T>(
    response: Response,
    requestId: string,
    url: string
  ): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const normalized = normalizeApiError(response.status, data, requestId);
      const error = new AppError(normalized);

      // Loggear error
      logError(error, { url, requestId });

      // Ejecutar interceptores de error
      const processedError = await this.runErrorInterceptors(error, url);
      throw processedError;
    }

    // Construir respuesta exitosa
    const apiResponse: ApiResponse<T> = {
      data: data as T,
      status: response.status,
      message: 'Success',
    };

    // Extraer metadata de paginación si existe
    if (data && typeof data === 'object' && 'meta' in data) {
      apiResponse.meta = (data as { meta: ApiResponse<T>['meta'] }).meta;
    }

    return this.runResponseInterceptors(apiResponse, url);
  }

  /**
   * Realizar petición HTTP
   */
  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const requestId = generateRequestId();
    const fullUrl = `${this.baseURL}${url}`;
    const timeout = options.timeout ?? this.timeout;

    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combinar signals si se proporciona uno externo
    const signal = options.signal
      ? AbortSignal.any([controller.signal, options.signal])
      : controller.signal;

    // Preparar init
    let init: RequestInit = {
      method,
      headers: this.prepareHeaders(options.headers, requestId),
      signal,
      credentials: options.withCredentials ? 'include' : 'same-origin',
    };

    // Agregar body si existe
    if (data !== undefined) {
      init.body = JSON.stringify(data);
    }

    // Función de fetch
    const doFetch = async (): Promise<ApiResponse<T>> => {
      try {
        // Ejecutar interceptores de request
        const intercepted = await this.runRequestInterceptors(fullUrl, init);

        const response = await fetch(intercepted.url, intercepted.init);
        clearTimeout(timeoutId);

        return await this.handleResponse<T>(response, requestId, url);
      } catch (error) {
        clearTimeout(timeoutId);

        // Si ya es AppError, re-lanzar
        if (error instanceof AppError) {
          throw error;
        }

        // Normalizar error de red
        const normalized = normalizeNetworkError(
          error instanceof Error ? error : new Error(String(error)),
          requestId
        );
        const appError = new AppError(normalized);

        // Loggear error
        logError(appError, { url, requestId, method });

        // Ejecutar interceptores de error
        const processedError = await this.runErrorInterceptors(appError, url);
        throw processedError;
      }
    };

    // Ejecutar con o sin retry
    if (options.retry === false) {
      return doFetch();
    }

    return withRetry(doFetch, options.retry);
  }

  // ==========================================================================
  // MÉTODOS PÚBLICOS
  // ==========================================================================

  /**
   * GET request
   */
  async get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, options);
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T>(
    url: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  /**
   * Cambiar URL base (para diferentes servicios)
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * Obtener URL base actual
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// ============================================================================
// INSTANCIAS Y EXPORTS
// ============================================================================

/**
 * Cliente HTTP principal (API Gateway)
 */
export const httpClient = new HttpClient(API_CONFIG.BASE_URL);

/**
 * Cliente para User Service
 */
export const userServiceClient = new HttpClient(API_CONFIG.USER_SERVICE_URL);

/**
 * Cliente para Schedule Service
 */
export const scheduleServiceClient = new HttpClient(
  API_CONFIG.SCHEDULE_SERVICE_URL
);

/**
 * Cliente para Attendance Service
 */
export const attendanceServiceClient = new HttpClient(
  API_CONFIG.ATTENDANCE_SERVICE_URL
);

/**
 * API client de conveniencia (usa el cliente principal)
 */
export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) =>
    httpClient.get<T>(url, options),
  post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    httpClient.post<T>(url, data, options),
  put: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    httpClient.put<T>(url, data, options),
  patch: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    httpClient.patch<T>(url, data, options),
  delete: <T>(url: string, options?: RequestOptions) =>
    httpClient.delete<T>(url, options),
};

// Re-exportar tipos útiles
export type { NormalizedError };
export { AppError, API_CONFIG as ApiConfig };

export default apiClient;
