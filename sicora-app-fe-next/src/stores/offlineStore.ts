/**
 * Store Offline - Gestión de estado offline con IndexedDB
 * Sprint 15-16: PWA y sincronización
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type {
  OfflineStore,
  OfflineState,
  SyncQueueItem,
  SyncConflict,
  OfflineStudent,
  OfflineAttendance,
  OfflineSchedule,
  OfflinePreferences,
  ConnectionState,
  SyncStats,
  ServiceWorkerMessage,
  SyncResult,
} from '@/types/offline.types';
import {
  ConnectionStatus,
  SyncStatus,
  SyncPriority,
  IndexedDBStore,
  SYNC_CONFIG,
} from '@/types/offline.types';

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialConnection: ConnectionState = {
  status: typeof navigator !== 'undefined' && navigator.onLine ? ConnectionStatus.ONLINE : ConnectionStatus.OFFLINE,
};

const initialSyncStats: SyncStats = {
  pendingItems: 0,
  failedItems: 0,
  totalSynced: 0,
  totalFailed: 0,
  averageSyncTimeMs: 0,
};

const initialPreferences: OfflinePreferences = {
  autoSync: true,
  syncOnWifiOnly: false,
  cachePriority: [IndexedDBStore.ATTENDANCE, IndexedDBStore.STUDENTS, IndexedDBStore.SCHEDULES],
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  notifyOnSync: true,
  notifyOnConflict: true,
};

const initialState: OfflineState = {
  connection: initialConnection,
  syncQueue: [],
  syncStats: initialSyncStats,
  conflicts: [],
  students: [],
  attendance: [],
  schedules: [],
  preferences: initialPreferences,
  isInitializing: false,
  isSyncing: false,
  isLoadingCache: false,
  swRegistration: null,
  swUpdateAvailable: false,
};

// ============================================================================
// UTILIDADES
// ============================================================================

function generateId(): string {
  return crypto.randomUUID();
}

function getTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// STORE
// ============================================================================

export const useOfflineStore = create<OfflineStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ============================================================
        // CONEXIÓN
        // ============================================================

        setConnectionStatus: (status) => {
          const now = getTimestamp();
          set((state) => ({
            connection: {
              ...state.connection,
              status,
              ...(status === ConnectionStatus.ONLINE ? { lastOnlineAt: now } : {}),
              ...(status === ConnectionStatus.OFFLINE ? { lastOfflineAt: now } : {}),
            },
          }));

          // Auto-sync cuando vuelve a estar online
          if (status === ConnectionStatus.ONLINE && get().preferences.autoSync) {
            get().processSyncQueue();
          }
        },

        updateConnectionInfo: (info) => {
          set((state) => ({
            connection: { ...state.connection, ...info },
          }));
        },

        // ============================================================
        // COLA DE SINCRONIZACIÓN
        // ============================================================

        addToSyncQueue: (item) => {
          const newItem: SyncQueueItem = {
            ...item,
            id: generateId(),
            status: SyncStatus.PENDING,
            retries: 0,
            createdAt: getTimestamp(),
          };

          set((state) => ({
            syncQueue: [...state.syncQueue, newItem],
            syncStats: {
              ...state.syncStats,
              pendingItems: state.syncStats.pendingItems + 1,
            },
          }));
        },

        processSyncQueue: async () => {
          const { syncQueue, connection, isSyncing, preferences } = get();

          if (isSyncing || connection.status !== ConnectionStatus.ONLINE) {
            return;
          }

          // Verificar conexión WiFi si es requerido
          if (preferences.syncOnWifiOnly && connection.effectiveType !== '4g') {
            return;
          }

          const pendingItems = syncQueue.filter(
            (item) => item.status === SyncStatus.PENDING || item.status === SyncStatus.FAILED
          );

          if (pendingItems.length === 0) {
            return;
          }

          set({ isSyncing: true });

          const startTime = Date.now();
          const results: SyncResult = {
            success: true,
            syncedItems: [],
            failedItems: [],
            conflicts: [],
            duration: 0,
          };

          // Procesar en batches
          const batches = [];
          for (let i = 0; i < pendingItems.length; i += SYNC_CONFIG.batchSize) {
            batches.push(pendingItems.slice(i, i + SYNC_CONFIG.batchSize));
          }

          for (const batch of batches) {
            await Promise.all(
              batch.map(async (item) => {
                try {
                  // Marcar como sincronizando
                  set((state) => ({
                    syncQueue: state.syncQueue.map((i) =>
                      i.id === item.id ? { ...i, status: SyncStatus.SYNCING } : i
                    ),
                  }));

                  // Simular llamada API (en producción usar httpClient)
                  await new Promise((resolve) => setTimeout(resolve, 500));

                  // Marcar como sincronizado
                  set((state) => ({
                    syncQueue: state.syncQueue.map((i) =>
                      i.id === item.id ? { ...i, status: SyncStatus.SYNCED } : i
                    ),
                  }));

                  results.syncedItems.push(item.id);
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                  
                  if (item.retries >= SYNC_CONFIG.maxRetries) {
                    set((state) => ({
                      syncQueue: state.syncQueue.map((i) =>
                        i.id === item.id
                          ? { ...i, status: SyncStatus.FAILED, error: errorMessage, lastAttemptAt: getTimestamp() }
                          : i
                      ),
                    }));
                    results.failedItems.push({ id: item.id, error: errorMessage });
                  } else {
                    set((state) => ({
                      syncQueue: state.syncQueue.map((i) =>
                        i.id === item.id
                          ? { ...i, status: SyncStatus.PENDING, retries: i.retries + 1, lastAttemptAt: getTimestamp() }
                          : i
                      ),
                    }));
                  }
                }
              })
            );
          }

          results.duration = Date.now() - startTime;

          // Actualizar estadísticas
          set((state) => {
            const syncedCount = results.syncedItems.length;
            const failedCount = results.failedItems.length;
            const newTotalSynced = state.syncStats.totalSynced + syncedCount;
            const newAverageTime =
              syncedCount > 0
                ? (state.syncStats.averageSyncTimeMs * state.syncStats.totalSynced + results.duration) /
                  (newTotalSynced || 1)
                : state.syncStats.averageSyncTimeMs;

            return {
              isSyncing: false,
              syncStats: {
                ...state.syncStats,
                pendingItems: state.syncQueue.filter((i) => i.status === SyncStatus.PENDING).length,
                failedItems: state.syncQueue.filter((i) => i.status === SyncStatus.FAILED).length,
                lastSyncAt: getTimestamp(),
                lastSuccessfulSyncAt: syncedCount > 0 ? getTimestamp() : state.syncStats.lastSuccessfulSyncAt,
                totalSynced: newTotalSynced,
                totalFailed: state.syncStats.totalFailed + failedCount,
                averageSyncTimeMs: newAverageTime,
              },
            };
          });

          // Limpiar items sincronizados después de un tiempo
          setTimeout(() => {
            set((state) => ({
              syncQueue: state.syncQueue.filter((i) => i.status !== SyncStatus.SYNCED),
            }));
          }, 5000);
        },

        retrySyncItem: async (itemId) => {
          set((state) => ({
            syncQueue: state.syncQueue.map((i) =>
              i.id === itemId ? { ...i, status: SyncStatus.PENDING, retries: 0, error: undefined } : i
            ),
          }));
          await get().processSyncQueue();
        },

        removeSyncItem: (itemId) => {
          set((state) => ({
            syncQueue: state.syncQueue.filter((i) => i.id !== itemId),
            syncStats: {
              ...state.syncStats,
              pendingItems: state.syncQueue.filter((i) => i.status === SyncStatus.PENDING && i.id !== itemId).length,
            },
          }));
        },

        clearSyncQueue: () => {
          set({
            syncQueue: [],
            syncStats: { ...initialSyncStats },
          });
        },

        // ============================================================
        // CONFLICTOS
        // ============================================================

        resolveConflict: (conflictId, resolution, mergedData) => {
          set((state) => ({
            conflicts: state.conflicts.map((c) =>
              c.id === conflictId
                ? {
                    ...c,
                    resolvedAt: getTimestamp(),
                    resolution,
                    resolvedData: mergedData || (resolution === 'local' ? c.localData : c.serverData),
                  }
                : c
            ),
          }));

          // Aplicar resolución a la cola de sincronización
          const conflict = get().conflicts.find((c) => c.id === conflictId);
          if (conflict) {
            set((state) => ({
              syncQueue: state.syncQueue.map((i) =>
                i.id === conflict.syncQueueItemId
                  ? {
                      ...i,
                      data: conflict.resolvedData || {},
                      status: SyncStatus.PENDING,
                      retries: 0,
                    }
                  : i
              ),
            }));
          }
        },

        dismissConflict: (conflictId) => {
          set((state) => ({
            conflicts: state.conflicts.filter((c) => c.id !== conflictId),
          }));
        },

        // ============================================================
        // CACHE DE DATOS
        // ============================================================

        cacheStudents: (students) => {
          const now = getTimestamp();
          const cachedStudents = students.map((s) => ({
            ...s,
            cachedAt: now,
            isStale: false,
          }));

          set((state) => {
            // Merge con estudiantes existentes
            const existingIds = new Set(state.students.map((s) => s.id));
            const newStudents = cachedStudents.filter((s) => !existingIds.has(s.id));
            const updatedStudents = state.students.map((existing) => {
              const updated = cachedStudents.find((s) => s.id === existing.id);
              return updated || existing;
            });

            return {
              students: [...updatedStudents, ...newStudents],
            };
          });
        },

        cacheAttendance: (attendance) => {
          const now = getTimestamp();
          const cachedAttendance = attendance.map((a) => ({
            ...a,
            cachedAt: now,
            syncStatus: SyncStatus.SYNCED,
          }));

          set((state) => {
            const existingIds = new Set(state.attendance.map((a) => a.id));
            const newAttendance = cachedAttendance.filter((a) => !existingIds.has(a.id));
            const updatedAttendance = state.attendance.map((existing) => {
              const updated = cachedAttendance.find((a) => a.id === existing.id);
              return updated || existing;
            });

            return {
              attendance: [...updatedAttendance, ...newAttendance],
            };
          });
        },

        cacheSchedules: (schedules) => {
          const now = getTimestamp();
          const cachedSchedules = schedules.map((s) => ({
            ...s,
            cachedAt: now,
            isStale: false,
          }));

          set((state) => {
            const existingIds = new Set(state.schedules.map((s) => s.id));
            const newSchedules = cachedSchedules.filter((s) => !existingIds.has(s.id));
            const updatedSchedules = state.schedules.map((existing) => {
              const updated = cachedSchedules.find((s) => s.id === existing.id);
              return updated || existing;
            });

            return {
              schedules: [...updatedSchedules, ...newSchedules],
            };
          });
        },

        updateCachedAttendance: (id, changes) => {
          set((state) => ({
            attendance: state.attendance.map((a) =>
              a.id === id
                ? {
                    ...a,
                    ...changes,
                    syncStatus: SyncStatus.PENDING,
                    localChanges: {
                      ...changes,
                      modifiedAt: getTimestamp(),
                    },
                  }
                : a
            ),
          }));

          // Añadir a cola de sincronización
          const attendance = get().attendance.find((a) => a.id === id);
          if (attendance) {
            get().addToSyncQueue({
              operationType: 'attendance_update' as any,
              storeName: IndexedDBStore.ATTENDANCE,
              entityId: id,
              data: { ...attendance, ...changes } as Record<string, unknown>,
              priority: SyncPriority.HIGH,
            });
          }
        },

        clearCache: (storeName) => {
          if (storeName) {
            switch (storeName) {
              case IndexedDBStore.STUDENTS:
                set({ students: [] });
                break;
              case IndexedDBStore.ATTENDANCE:
                set({ attendance: [] });
                break;
              case IndexedDBStore.SCHEDULES:
                set({ schedules: [] });
                break;
            }
          } else {
            set({
              students: [],
              attendance: [],
              schedules: [],
            });
          }
        },

        // ============================================================
        // PREFERENCIAS
        // ============================================================

        updatePreferences: (prefs) => {
          set((state) => ({
            preferences: { ...state.preferences, ...prefs },
          }));
        },

        // ============================================================
        // SERVICE WORKER
        // ============================================================

        registerServiceWorker: async () => {
          if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
          }

          try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
            });

            set({ swRegistration: registration });

            // Escuchar actualizaciones
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    set({ swUpdateAvailable: true });
                  }
                });
              }
            });

            // Escuchar mensajes del SW
            navigator.serviceWorker.addEventListener('message', (event) => {
              get().handleSWMessage(event.data);
            });
          } catch (error) {
            console.error('Error registering service worker:', error);
          }
        },

        updateServiceWorker: async () => {
          const { swRegistration } = get();
          if (!swRegistration) return;

          const waitingWorker = swRegistration.waiting;
          if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            set({ swUpdateAvailable: false });
            window.location.reload();
          }
        },

        handleSWMessage: (message) => {
          switch (message.type) {
            case 'SYNC_COMPLETE':
              if (message.payload) {
                set((state) => ({
                  syncStats: {
                    ...state.syncStats,
                    lastSyncAt: message.timestamp,
                  },
                }));
              }
              break;
            case 'SYNC_ERROR':
              set({ lastError: message.payload?.error });
              break;
            case 'UPDATE_AVAILABLE':
              set({ swUpdateAvailable: true });
              break;
          }
        },

        // ============================================================
        // INICIALIZACIÓN
        // ============================================================

        initialize: async () => {
          if (get().isInitializing) return;

          set({ isInitializing: true });

          try {
            // Registrar Service Worker
            await get().registerServiceWorker();

            // Configurar listeners de conexión
            if (typeof window !== 'undefined') {
              window.addEventListener('online', () => {
                get().setConnectionStatus(ConnectionStatus.ONLINE);
              });

              window.addEventListener('offline', () => {
                get().setConnectionStatus(ConnectionStatus.OFFLINE);
              });

              // Network Information API
              const connection = (navigator as any).connection;
              if (connection) {
                const updateConnectionInfo = () => {
                  get().updateConnectionInfo({
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData,
                  });

                  // Detectar conexión lenta
                  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    get().setConnectionStatus(ConnectionStatus.SLOW);
                  }
                };

                connection.addEventListener('change', updateConnectionInfo);
                updateConnectionInfo();
              }
            }

            // Inicializar estado de conexión
            get().setConnectionStatus(
              typeof navigator !== 'undefined' && navigator.onLine
                ? ConnectionStatus.ONLINE
                : ConnectionStatus.OFFLINE
            );
          } catch (error) {
            console.error('Error initializing offline store:', error);
            set({ lastError: error instanceof Error ? error.message : 'Error de inicialización' });
          } finally {
            set({ isInitializing: false });
          }
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'sicora-offline-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          syncQueue: state.syncQueue.filter((i) => i.status !== SyncStatus.SYNCED),
          syncStats: state.syncStats,
          preferences: state.preferences,
          students: state.students.slice(0, 100), // Limitar para localStorage
          attendance: state.attendance.slice(0, 500),
          schedules: state.schedules.slice(0, 100),
        }),
      }
    ),
    { name: 'OfflineStore' }
  )
);

// ============================================================================
// SELECTORES
// ============================================================================

export const selectIsOnline = (state: OfflineState) =>
  state.connection.status === ConnectionStatus.ONLINE;

export const selectHasPendingSync = (state: OfflineState) =>
  state.syncQueue.some((i) => i.status === SyncStatus.PENDING);

export const selectPendingSyncCount = (state: OfflineState) =>
  state.syncQueue.filter((i) => i.status === SyncStatus.PENDING).length;

export const selectFailedSyncCount = (state: OfflineState) =>
  state.syncQueue.filter((i) => i.status === SyncStatus.FAILED).length;

export const selectHasConflicts = (state: OfflineState) =>
  state.conflicts.some((c) => !c.resolvedAt);

export const selectUnresolvedConflicts = (state: OfflineState) =>
  state.conflicts.filter((c) => !c.resolvedAt);

export const selectCachedStudentsByProgram = (programaId: string) => (state: OfflineState) =>
  state.students.filter((s) => s.programaId === programaId && !s.isStale);

export const selectCachedAttendanceByDate = (fecha: string) => (state: OfflineState) =>
  state.attendance.filter((a) => a.fecha === fecha);

export const selectUnsyncedAttendance = (state: OfflineState) =>
  state.attendance.filter((a) => a.syncStatus !== SyncStatus.SYNCED);

export const selectConnectionQuality = (state: OfflineState) => {
  const { effectiveType, downlink, rtt } = state.connection;
  if (!effectiveType) return 'unknown';
  if (effectiveType === '4g' && downlink && downlink > 5) return 'excellent';
  if (effectiveType === '4g' || effectiveType === '3g') return 'good';
  return 'poor';
};
