/**
 * SICORA - Sistema de Manejo de Errores
 *
 * Implementación basada en la guía MANEJO_DE_ERRORES.md
 * Proporciona:
 * - Tipos de error categorizados
 * - Códigos de error estructurados
 * - Mensajes amigables para usuarios
 * - Retry logic con backoff exponencial
 * - Helpers para manejo de errores
 *
 * @fileoverview Error handling system
 * @module lib/errors
 */

// ============================================================================
// TIPOS DE ERROR
// ============================================================================

/**
 * Dominios de error según la guía
 * [DOMINIO]_[TIPO]_[NÚMERO]
 */
export type ErrorDomain =
  | 'USER' // Gestión de usuarios
  | 'AUTH' // Autenticación/Autorización
  | 'DB' // Base de datos
  | 'CACHE' // Redis/Cache
  | 'VALID' // Validación
  | 'BIZ' // Reglas de negocio
  | 'EXT' // Servicios externos
  | 'SYS' // Sistema
  | 'NET'; // Red/Conexión

/**
 * Categorías de error HTTP
 */
export type ErrorCategory =
  | 'VALIDATION' // 400 - Datos inválidos
  | 'UNAUTHORIZED' // 401 - Sin autenticación
  | 'FORBIDDEN' // 403 - Sin permisos
  | 'NOT_FOUND' // 404 - No encontrado
  | 'CONFLICT' // 409 - Conflicto de estado
  | 'UNPROCESSABLE' // 422 - Reglas de negocio
  | 'RATE_LIMITED' // 429 - Demasiadas peticiones
  | 'SERVER_ERROR' // 500 - Error interno
  | 'UNAVAILABLE' // 503 - Servicio no disponible
  | 'TIMEOUT' // 504 - Timeout
  | 'NETWORK'; // 0 - Error de red

/**
 * Estructura de error del API según la guía
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    errors?: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    timestamp?: string;
    path?: string;
    requestId?: string;
  };
}

/**
 * Estructura de error normalizada para el frontend
 */
export interface NormalizedError {
  /** Código único del error */
  code: string;
  /** Mensaje técnico para logs */
  message: string;
  /** Mensaje amigable para el usuario */
  userMessage: string;
  /** Código HTTP */
  status: number;
  /** Categoría del error */
  category: ErrorCategory;
  /** Detalles adicionales */
  details?: Record<string, unknown>;
  /** Errores de validación por campo */
  fieldErrors?: Record<string, string>;
  /** Si se puede reintentar */
  retryable: boolean;
  /** Tiempo sugerido para reintentar (ms) */
  retryAfter?: number;
  /** ID de la petición para trazabilidad */
  requestId?: string;
  /** Timestamp del error */
  timestamp: string;
}

// ============================================================================
// CLASE DE ERROR PERSONALIZADA
// ============================================================================

/**
 * Error personalizado de la aplicación
 * Extiende Error nativo con propiedades adicionales
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly category: ErrorCategory;
  public readonly userMessage: string;
  public readonly details?: Record<string, unknown>;
  public readonly fieldErrors?: Record<string, string>;
  public readonly retryable: boolean;
  public readonly retryAfter?: number;
  public readonly requestId?: string;
  public readonly timestamp: string;

  constructor(normalized: NormalizedError) {
    super(normalized.message);
    this.name = 'AppError';
    this.code = normalized.code;
    this.status = normalized.status;
    this.category = normalized.category;
    this.userMessage = normalized.userMessage;
    this.details = normalized.details;
    this.fieldErrors = normalized.fieldErrors;
    this.retryable = normalized.retryable;
    this.retryAfter = normalized.retryAfter;
    this.requestId = normalized.requestId;
    this.timestamp = normalized.timestamp;
  }

  /**
   * Convertir a objeto plano para serialización
   */
  toJSON(): NormalizedError {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      status: this.status,
      category: this.category,
      details: this.details,
      fieldErrors: this.fieldErrors,
      retryable: this.retryable,
      retryAfter: this.retryAfter,
      requestId: this.requestId,
      timestamp: this.timestamp,
    };
  }
}

// ============================================================================
// MENSAJES AMIGABLES POR CATEGORÍA
// ============================================================================

/**
 * Mensajes de usuario por defecto según categoría
 */
const DEFAULT_USER_MESSAGES: Record<ErrorCategory, string> = {
  VALIDATION: 'Por favor verifica los datos ingresados',
  UNAUTHORIZED: 'Debes iniciar sesión para continuar',
  FORBIDDEN: 'No tienes permisos para realizar esta acción',
  NOT_FOUND: 'No encontramos lo que buscas',
  CONFLICT:
    'Hubo un conflicto con los datos. Por favor actualiza e intenta de nuevo',
  UNPROCESSABLE: 'No podemos procesar esta operación',
  RATE_LIMITED: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo',
  SERVER_ERROR: 'Ocurrió un error inesperado. Intenta nuevamente',
  UNAVAILABLE:
    'El servicio no está disponible temporalmente. Intenta en unos minutos',
  TIMEOUT: 'La operación tardó demasiado. Intenta nuevamente',
  NETWORK: 'Verifica tu conexión a internet e intenta de nuevo',
};

/**
 * Mensajes específicos por código de error
 */
const SPECIFIC_ERROR_MESSAGES: Record<string, string> = {
  // Autenticación
  AUTH_INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  AUTH_TOKEN_EXPIRED:
    'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  AUTH_TOKEN_INVALID: 'Sesión inválida. Por favor inicia sesión nuevamente',
  AUTH_ACCOUNT_LOCKED: 'Tu cuenta ha sido bloqueada. Contacta al administrador',
  AUTH_PASSWORD_EXPIRED: 'Tu contraseña ha expirado. Debes cambiarla',

  // Usuarios
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_EMAIL_EXISTS: 'Este email ya está registrado',
  USER_INACTIVE: 'Esta cuenta está desactivada',

  // Validación
  VALID_EMAIL_FORMAT: 'El formato del email no es válido',
  VALID_PASSWORD_WEAK:
    'La contraseña no cumple con los requisitos de seguridad',
  VALID_REQUIRED_FIELD: 'Este campo es obligatorio',

  // Sistema
  SYS_MAINTENANCE: 'El sistema está en mantenimiento. Intenta en unos minutos',
  SYS_RATE_LIMIT: 'Has realizado muchas solicitudes. Espera un momento',

  // Red
  NET_OFFLINE: 'Sin conexión a internet',
  NET_TIMEOUT: 'La conexión tardó demasiado',
  NET_ABORT: 'La solicitud fue cancelada',
};

// ============================================================================
// FUNCIONES DE NORMALIZACIÓN
// ============================================================================

/**
 * Determinar categoría de error basada en status HTTP
 */
function getCategoryFromStatus(status: number): ErrorCategory {
  if (status === 0) return 'NETWORK';
  if (status === 400) return 'VALIDATION';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422) return 'UNPROCESSABLE';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 503) return 'UNAVAILABLE';
  if (status === 504) return 'TIMEOUT';
  if (status >= 500) return 'SERVER_ERROR';
  return 'SERVER_ERROR';
}

/**
 * Determinar si el error es reintentable
 */
function isRetryable(status: number, code?: string): boolean {
  // Errores de red son reintentables
  if (status === 0) return true;

  // Errores 5xx temporales son reintentables
  if (status === 502 || status === 503 || status === 504) return true;

  // Rate limiting es reintentable después del delay
  if (status === 429) return true;

  // Algunos códigos específicos son reintentables
  const retryableCodes = [
    'NET_TIMEOUT',
    'NET_OFFLINE',
    'DB_CONNECTION',
    'CACHE_TIMEOUT',
  ];
  if (code && retryableCodes.includes(code)) return true;

  return false;
}

/**
 * Obtener mensaje amigable para el usuario
 */
function getUserMessage(
  code: string | undefined,
  category: ErrorCategory,
  serverMessage?: string
): string {
  // Primero buscar mensaje específico por código
  if (code && SPECIFIC_ERROR_MESSAGES[code]) {
    return SPECIFIC_ERROR_MESSAGES[code];
  }

  // Si el servidor envió un mensaje amigable, usarlo
  if (
    serverMessage &&
    !serverMessage.includes('Error:') &&
    serverMessage.length < 200
  ) {
    return serverMessage;
  }

  // Usar mensaje por defecto de la categoría
  return DEFAULT_USER_MESSAGES[category];
}

/**
 * Extraer errores de campo de la respuesta del API
 */
function extractFieldErrors(
  apiError: ApiErrorResponse['error']
): Record<string, string> | undefined {
  if (!apiError.errors || apiError.errors.length === 0) {
    return undefined;
  }

  const fieldErrors: Record<string, string> = {};
  for (const err of apiError.errors) {
    if (err.field) {
      fieldErrors[err.field] = err.message;
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

/**
 * Normalizar respuesta de error del API
 */
export function normalizeApiError(
  status: number,
  data: unknown,
  requestId?: string
): NormalizedError {
  const timestamp = new Date().toISOString();
  const category = getCategoryFromStatus(status);

  // Intentar parsear como ApiErrorResponse
  if (data && typeof data === 'object' && 'error' in data) {
    const apiError = (data as ApiErrorResponse).error;
    const code = apiError.code || `HTTP_${status}`;

    return {
      code,
      message: apiError.message || `HTTP Error ${status}`,
      userMessage: getUserMessage(code, category, apiError.message),
      status,
      category,
      details: apiError.details,
      fieldErrors: extractFieldErrors(apiError),
      retryable: isRetryable(status, code),
      retryAfter: status === 429 ? 60000 : undefined, // 1 minuto por defecto
      requestId: apiError.requestId || requestId,
      timestamp: apiError.timestamp || timestamp,
    };
  }

  // Error genérico
  const message = typeof data === 'string' ? data : `HTTP Error ${status}`;
  return {
    code: `HTTP_${status}`,
    message,
    userMessage: getUserMessage(undefined, category),
    status,
    category,
    retryable: isRetryable(status),
    requestId,
    timestamp,
  };
}

/**
 * Normalizar error de red/fetch
 */
export function normalizeNetworkError(
  error: Error,
  requestId?: string
): NormalizedError {
  const timestamp = new Date().toISOString();

  // Timeout
  if (error.name === 'AbortError' || error.message.includes('abort')) {
    return {
      code: 'NET_TIMEOUT',
      message: error.message,
      userMessage: SPECIFIC_ERROR_MESSAGES['NET_TIMEOUT'],
      status: 0,
      category: 'TIMEOUT',
      retryable: true,
      retryAfter: 5000,
      requestId,
      timestamp,
    };
  }

  // Offline
  if (!navigator.onLine) {
    return {
      code: 'NET_OFFLINE',
      message: 'No network connection',
      userMessage: SPECIFIC_ERROR_MESSAGES['NET_OFFLINE'],
      status: 0,
      category: 'NETWORK',
      retryable: true,
      requestId,
      timestamp,
    };
  }

  // Error genérico de red
  return {
    code: 'NET_ERROR',
    message: error.message,
    userMessage: DEFAULT_USER_MESSAGES['NETWORK'],
    status: 0,
    category: 'NETWORK',
    retryable: true,
    retryAfter: 5000,
    requestId,
    timestamp,
  };
}

// ============================================================================
// RETRY LOGIC CON BACKOFF EXPONENCIAL
// ============================================================================

export interface RetryConfig {
  /** Número máximo de reintentos */
  maxRetries: number;
  /** Delay inicial en ms */
  initialDelay: number;
  /** Factor de multiplicación */
  backoffFactor: number;
  /** Delay máximo en ms */
  maxDelay: number;
  /** Jitter aleatorio (0-1) */
  jitter: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 30000,
  jitter: 0.25,
};

/**
 * Calcular delay con backoff exponencial y jitter
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const baseDelay =
    config.initialDelay * Math.pow(config.backoffFactor, attempt);
  const cappedDelay = Math.min(baseDelay, config.maxDelay);

  // Agregar jitter aleatorio para evitar thundering herd
  const jitterRange = cappedDelay * config.jitter;
  const jitter = (Math.random() * 2 - 1) * jitterRange;

  return Math.floor(cappedDelay + jitter);
}

/**
 * Ejecutar función con retry automático
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Verificar si es reintentable
      const isRetryableError =
        error instanceof AppError ? error.retryable : true;

      if (!isRetryableError || attempt >= finalConfig.maxRetries) {
        throw error;
      }

      // Calcular delay y esperar
      const delay = calculateRetryDelay(attempt, finalConfig);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================================================
// HELPERS PARA COMPONENTES
// ============================================================================

/**
 * Verificar si un error es de tipo específico
 */
export function isErrorCategory(
  error: unknown,
  category: ErrorCategory
): boolean {
  if (error instanceof AppError) {
    return error.category === category;
  }
  return false;
}

/**
 * Verificar si es error de autenticación
 */
export function isAuthError(error: unknown): boolean {
  return (
    isErrorCategory(error, 'UNAUTHORIZED') ||
    isErrorCategory(error, 'FORBIDDEN')
  );
}

/**
 * Verificar si es error de validación
 */
export function isValidationError(error: unknown): boolean {
  return (
    isErrorCategory(error, 'VALIDATION') ||
    isErrorCategory(error, 'UNPROCESSABLE')
  );
}

/**
 * Verificar si es error de red
 */
export function isNetworkError(error: unknown): boolean {
  return isErrorCategory(error, 'NETWORK') || isErrorCategory(error, 'TIMEOUT');
}

/**
 * Obtener mensaje de usuario de cualquier error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    // No mostrar mensajes técnicos al usuario
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return DEFAULT_USER_MESSAGES['NETWORK'];
    }
    return error.message;
  }

  return 'Ocurrió un error inesperado';
}

/**
 * Obtener errores de campo de cualquier error
 */
export function getFieldErrors(
  error: unknown
): Record<string, string> | undefined {
  if (error instanceof AppError) {
    return error.fieldErrors;
  }
  return undefined;
}

// ============================================================================
// LOGGING (Solo en desarrollo)
// ============================================================================

/**
 * Loggear error con contexto
 * En producción esto iría a Sentry/Datadog
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error');
    if (error instanceof AppError) {
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('User Message:', error.userMessage);
      console.error('Status:', error.status);
      console.error('Category:', error.category);
      console.error('Retryable:', error.retryable);
      if (error.details) console.error('Details:', error.details);
      if (error.fieldErrors) console.error('Field Errors:', error.fieldErrors);
    } else {
      console.error(error);
    }
    if (context) {
      console.error('Context:', context);
    }
    console.groupEnd();
  }

  // TODO: En producción, enviar a servicio de monitoreo
  // Sentry.captureException(error, { extra: context });
}
