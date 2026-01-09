/**
 * Tipos para funcionalidad Offline - IndexedDB y Service Worker
 * Sprint 15-16: PWA y sincronización offline
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Estados de sincronización
 */
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

/**
 * Tipos de operación pendiente
 */
export enum OfflineOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ATTENDANCE_MARK = 'attendance_mark',
  ATTENDANCE_UPDATE = 'attendance_update',
}

/**
 * Nombres de stores en IndexedDB
 */
export enum IndexedDBStore {
  STUDENTS = 'students',
  ATTENDANCE = 'attendance',
  SCHEDULES = 'schedules',
  PROGRAMS = 'programs',
  GROUPS = 'groups',
  SYNC_QUEUE = 'syncQueue',
  CACHED_RESPONSES = 'cachedResponses',
  USER_PREFERENCES = 'userPreferences',
}

/**
 * Estados de conexión
 */
export enum ConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SLOW = 'slow',
  RECONNECTING = 'reconnecting',
}

/**
 * Prioridades de sincronización
 */
export enum SyncPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export const INDEXED_DB_CONFIG = {
  name: 'sicora-offline-db',
  version: 1,
  stores: {
    [IndexedDBStore.STUDENTS]: { keyPath: 'id', indexes: ['programaId', 'grupoId', 'estado'] },
    [IndexedDBStore.ATTENDANCE]: { keyPath: 'id', indexes: ['studentId', 'fecha', 'programaId'] },
    [IndexedDBStore.SCHEDULES]: { keyPath: 'id', indexes: ['programaId', 'grupoId', 'diaSemana'] },
    [IndexedDBStore.PROGRAMS]: { keyPath: 'id', indexes: ['estado'] },
    [IndexedDBStore.GROUPS]: { keyPath: 'id', indexes: ['programaId', 'estado'] },
    [IndexedDBStore.SYNC_QUEUE]: { keyPath: 'id', indexes: ['status', 'priority', 'createdAt'] },
    [IndexedDBStore.CACHED_RESPONSES]: { keyPath: 'key', indexes: ['expiresAt'] },
    [IndexedDBStore.USER_PREFERENCES]: { keyPath: 'key' },
  },
} as const;

export const SYNC_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 5000,
  batchSize: 10,
  syncIntervalMs: 30000, // 30 segundos
  staleDataThresholdMs: 300000, // 5 minutos
} as const;

export const CACHE_CONFIG = {
  defaultTTLMs: 3600000, // 1 hora
  maxEntries: 500,
  criticalDataTTLMs: 86400000, // 24 horas
} as const;

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Operación pendiente de sincronización
 */
export interface SyncQueueItem {
  id: string;
  operationType: OfflineOperationType;
  storeName: IndexedDBStore;
  entityId: string;
  data: Record<string, unknown>;
  status: SyncStatus;
  priority: SyncPriority;
  retries: number;
  createdAt: string;
  lastAttemptAt?: string;
  error?: string;
  conflictData?: Record<string, unknown>;
}

/**
 * Respuesta cacheada
 */
export interface CachedResponse {
  key: string;
  url: string;
  method: string;
  data: unknown;
  headers?: Record<string, string>;
  cachedAt: string;
  expiresAt: string;
  isStale: boolean;
}

/**
 * Preferencias de usuario para offline
 */
export interface OfflinePreferences {
  autoSync: boolean;
  syncOnWifiOnly: boolean;
  cachePriority: IndexedDBStore[];
  maxCacheSize: number;
  notifyOnSync: boolean;
  notifyOnConflict: boolean;
}

/**
 * Estado de conexión detallado
 */
export interface ConnectionState {
  status: ConnectionStatus;
  lastOnlineAt?: string;
  lastOfflineAt?: string;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Estadísticas de sincronización
 */
export interface SyncStats {
  pendingItems: number;
  failedItems: number;
  lastSyncAt?: string;
  lastSuccessfulSyncAt?: string;
  totalSynced: number;
  totalFailed: number;
  averageSyncTimeMs: number;
}

/**
 * Conflicto de sincronización
 */
export interface SyncConflict {
  id: string;
  syncQueueItemId: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  detectedAt: string;
  resolvedAt?: string;
  resolution?: 'local' | 'server' | 'merged';
  resolvedData?: Record<string, unknown>;
}

// ============================================================================
// INTERFACES PARA DATOS OFFLINE
// ============================================================================

/**
 * Estudiante en cache offline
 */
export interface OfflineStudent {
  id: string;
  documento: string;
  nombre: string;
  apellido: string;
  email?: string;
  programaId: string;
  programaNombre: string;
  grupoId: string;
  grupoNombre: string;
  estado: string;
  cachedAt: string;
  isStale: boolean;
}

/**
 * Registro de asistencia offline
 */
export interface OfflineAttendance {
  id: string;
  studentId: string;
  studentNombre: string;
  fecha: string;
  horaEntrada?: string;
  horaSalida?: string;
  estado: 'presente' | 'ausente' | 'tardanza' | 'excusa';
  observaciones?: string;
  programaId: string;
  grupoId: string;
  registradoPor: string;
  cachedAt: string;
  syncStatus: SyncStatus;
  localChanges?: {
    estado?: string;
    observaciones?: string;
    modifiedAt: string;
  };
}

/**
 * Horario en cache offline
 */
export interface OfflineSchedule {
  id: string;
  programaId: string;
  grupoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  ambiente?: string;
  instructor?: string;
  cachedAt: string;
  isStale: boolean;
}

// ============================================================================
// INTERFACES SERVICE WORKER
// ============================================================================

/**
 * Mensaje del Service Worker
 */
export interface ServiceWorkerMessage {
  type: 'SYNC_COMPLETE' | 'SYNC_ERROR' | 'CACHE_UPDATED' | 'OFFLINE_READY' | 'UPDATE_AVAILABLE';
  payload?: {
    syncedItems?: number;
    failedItems?: number;
    error?: string;
    cacheSize?: number;
  };
  timestamp: string;
}

/**
 * Evento de sincronización background
 */
export interface BackgroundSyncEvent {
  tag: string;
  lastChance: boolean;
}

/**
 * Configuración de cache del SW
 */
export interface ServiceWorkerCacheConfig {
  staticAssets: string[];
  apiRoutes: {
    pattern: RegExp;
    strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    ttlMs?: number;
  }[];
  offlineFallback: string;
}

// ============================================================================
// INTERFACES STORE
// ============================================================================

/**
 * Estado del store offline
 */
export interface OfflineState {
  // Estado de conexión
  connection: ConnectionState;
  
  // Cola de sincronización
  syncQueue: SyncQueueItem[];
  syncStats: SyncStats;
  
  // Conflictos
  conflicts: SyncConflict[];
  
  // Datos cacheados
  students: OfflineStudent[];
  attendance: OfflineAttendance[];
  schedules: OfflineSchedule[];
  
  // Preferencias
  preferences: OfflinePreferences;
  
  // Estados de carga
  isInitializing: boolean;
  isSyncing: boolean;
  isLoadingCache: boolean;
  
  // Errores
  lastError?: string;
  
  // Service Worker
  swRegistration: ServiceWorkerRegistration | null;
  swUpdateAvailable: boolean;
}

/**
 * Acciones del store offline
 */
export interface OfflineActions {
  // Conexión
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateConnectionInfo: (info: Partial<ConnectionState>) => void;
  
  // Sincronización
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'status' | 'retries'>) => void;
  processSyncQueue: () => Promise<void>;
  retrySyncItem: (itemId: string) => Promise<void>;
  removeSyncItem: (itemId: string) => void;
  clearSyncQueue: () => void;
  
  // Conflictos
  resolveConflict: (conflictId: string, resolution: 'local' | 'server' | 'merged', mergedData?: Record<string, unknown>) => void;
  dismissConflict: (conflictId: string) => void;
  
  // Cache de datos
  cacheStudents: (students: OfflineStudent[]) => void;
  cacheAttendance: (attendance: OfflineAttendance[]) => void;
  cacheSchedules: (schedules: OfflineSchedule[]) => void;
  updateCachedAttendance: (id: string, changes: Partial<OfflineAttendance>) => void;
  clearCache: (storeName?: IndexedDBStore) => void;
  
  // Preferencias
  updatePreferences: (prefs: Partial<OfflinePreferences>) => void;
  
  // Service Worker
  registerServiceWorker: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
  handleSWMessage: (message: ServiceWorkerMessage) => void;
  
  // Inicialización
  initialize: () => Promise<void>;
  reset: () => void;
}

// ============================================================================
// TIPOS UTILITARIOS
// ============================================================================

/**
 * Resultado de operación de sincronización
 */
export interface SyncResult {
  success: boolean;
  syncedItems: string[];
  failedItems: { id: string; error: string }[];
  conflicts: SyncConflict[];
  duration: number;
}

/**
 * Opciones de cache
 */
export interface CacheOptions {
  ttlMs?: number;
  priority?: SyncPriority;
  forceRefresh?: boolean;
}

/**
 * Query para datos offline
 */
export interface OfflineQuery<T> {
  store: IndexedDBStore;
  filters?: Partial<T>;
  orderBy?: keyof T;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Resultado de query offline
 */
export interface OfflineQueryResult<T> {
  data: T[];
  total: number;
  isStale: boolean;
  cachedAt?: string;
  fromCache: boolean;
}

// ============================================================================
// CONSTANTES UI
// ============================================================================

export const CONNECTION_STATUS_CONFIG: Record<ConnectionStatus, {
  label: string;
  color: string;
  icon: string;
  description: string;
}> = {
  [ConnectionStatus.ONLINE]: {
    label: 'En línea',
    color: 'green',
    icon: 'wifi',
    description: 'Conectado a internet',
  },
  [ConnectionStatus.OFFLINE]: {
    label: 'Sin conexión',
    color: 'red',
    icon: 'wifi-off',
    description: 'Trabajando en modo offline',
  },
  [ConnectionStatus.SLOW]: {
    label: 'Conexión lenta',
    color: 'yellow',
    icon: 'signal-low',
    description: 'Conexión inestable',
  },
  [ConnectionStatus.RECONNECTING]: {
    label: 'Reconectando',
    color: 'blue',
    icon: 'refresh',
    description: 'Intentando reconectar...',
  },
};

export const SYNC_STATUS_CONFIG: Record<SyncStatus, {
  label: string;
  color: string;
  canRetry: boolean;
}> = {
  [SyncStatus.PENDING]: {
    label: 'Pendiente',
    color: 'gray',
    canRetry: false,
  },
  [SyncStatus.SYNCING]: {
    label: 'Sincronizando',
    color: 'blue',
    canRetry: false,
  },
  [SyncStatus.SYNCED]: {
    label: 'Sincronizado',
    color: 'green',
    canRetry: false,
  },
  [SyncStatus.FAILED]: {
    label: 'Error',
    color: 'red',
    canRetry: true,
  },
  [SyncStatus.CONFLICT]: {
    label: 'Conflicto',
    color: 'orange',
    canRetry: false,
  },
};

// ============================================================================
// TIPOS DE EXPORTACIÓN
// ============================================================================

export type OfflineStore = OfflineState & OfflineActions;
