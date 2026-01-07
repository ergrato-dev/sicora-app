import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Configuración base del API client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

/**
 * Cliente Axios configurado para el API Gateway de Go
 * Incluye interceptors para autenticación y refresh de tokens
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Storage keys
const ACCESS_TOKEN_KEY = 'sicora_access_token';
const REFRESH_TOKEN_KEY = 'sicora_refresh_token';

/**
 * Funciones de utilidad para manejo de tokens
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Variable para controlar el refresh en progreso
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Interceptor de request: agrega token de autorización
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response: maneja errores 401 y refresh de token
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si no es un error 401 o ya se intentó retry, rechazar
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Marcar como retry
    originalRequest._retry = true;

    // Si ya está refreshing, agregar a la cola
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject: (err: Error) => {
            reject(err);
          },
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Llamar al endpoint de refresh
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token } = response.data;
      tokenStorage.setTokens(access_token, refreshToken);

      // Procesar cola de peticiones fallidas
      processQueue(null, access_token);

      // Reintentar petición original
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh falló, limpiar tokens y redirigir a login
      processQueue(refreshError as Error);
      tokenStorage.clearTokens();

      // Disparar evento para que la app maneje el logout
      window.dispatchEvent(new CustomEvent('auth:logout'));

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Tipos de error de API
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Helper para extraer mensaje de error
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.message || error.message || 'Error de conexión con el servidor';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido';
};

// Export default
export default apiClient;
