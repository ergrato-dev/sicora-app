/**
 * SICORA - Store de Alertas (Zustand)
 *
 * Estado global para gestión de alertas y notificaciones.
 * Maneja la lista, contadores, filtros y acciones de lectura/archivado.
 *
 * @fileoverview Alerts state management
 * @module stores/alertsStore
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Alert,
  AlertType,
  AlertPriority,
  AlertStatus,
  AlertSummary,
  AlertCounts,
  ListAlertsParams,
} from '@/types/alert.types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Filtros activos para alertas
 */
interface AlertFilters {
  search: string;
  status: AlertStatus | 'all';
  type: AlertType | 'all';
  priority: AlertPriority | 'all';
  groupId: string | null;
  studentId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  includeExpired: boolean;
}

/**
 * Preferencias de visualización
 */
interface AlertViewPreferences {
  showArchived: boolean;
  showDismissed: boolean;
  groupByType: boolean;
  sortBy: 'createdAt' | 'priority' | 'type';
  sortOrder: 'asc' | 'desc';
}

/**
 * Estado del store de alertas
 */
interface AlertsState {
  // Datos
  alerts: Alert[];
  selectedAlert: Alert | null;
  summary: AlertSummary | null;
  counts: AlertCounts | null;
  
  // Contador de no leídas (para badge en header)
  unreadCount: number;
  
  // Paginación
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Filtros
  filters: AlertFilters;
  
  // Preferencias
  viewPreferences: AlertViewPreferences;
  
  // Estados de UI
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  isDetailOpen: boolean;
  
  // Selección múltiple
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  
  // Errores
  error: string | null;
  
  // Polling
  lastFetchTime: number | null;
}

/**
 * Acciones del store
 */
interface AlertsActions {
  // Datos
  setAlerts: (alerts: Alert[]) => void;
  appendAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  setSelectedAlert: (alert: Alert | null) => void;
  setSummary: (summary: AlertSummary | null) => void;
  setCounts: (counts: AlertCounts | null) => void;
  setUnreadCount: (count: number) => void;
  decrementUnread: (amount?: number) => void;
  
  // Acciones de lectura
  markAsRead: (id: string) => void;
  markMultipleAsRead: (ids: string[]) => void;
  markAllAsRead: () => void;
  
  // Acciones de archivado
  archiveAlert: (id: string) => void;
  archiveMultiple: (ids: string[]) => void;
  dismissAlert: (id: string) => void;
  
  // Paginación
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setPagination: (total: number, totalPages: number) => void;
  loadMore: () => void;
  
  // Filtros
  setFilter: <K extends keyof AlertFilters>(
    key: K,
    value: AlertFilters[K]
  ) => void;
  setFilters: (filters: Partial<AlertFilters>) => void;
  resetFilters: () => void;
  getQueryParams: () => ListAlertsParams;
  
  // Preferencias
  setViewPreference: <K extends keyof AlertViewPreferences>(
    key: K,
    value: AlertViewPreferences[K]
  ) => void;
  
  // Selección múltiple
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelectionMode: (enabled: boolean) => void;
  
  // Estados de UI
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  openDetail: (alert: Alert) => void;
  closeDetail: () => void;
  
  // Errores
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Polling
  setLastFetchTime: (time: number) => void;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultFilters: AlertFilters = {
  search: '',
  status: 'all',
  type: 'all',
  priority: 'all',
  groupId: null,
  studentId: null,
  dateFrom: null,
  dateTo: null,
  includeExpired: false,
};

const defaultViewPreferences: AlertViewPreferences = {
  showArchived: false,
  showDismissed: false,
  groupByType: false,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const initialState: AlertsState = {
  alerts: [],
  selectedAlert: null,
  summary: null,
  counts: null,
  unreadCount: 0,
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0,
  filters: defaultFilters,
  viewPreferences: defaultViewPreferences,
  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  isDetailOpen: false,
  selectedIds: new Set(),
  isSelectionMode: false,
  error: null,
  lastFetchTime: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useAlertsStore = create<AlertsState & AlertsActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // DATOS
        // ====================================================================

        setAlerts: (alerts) =>
          set({ alerts, lastFetchTime: Date.now() }, false, 'setAlerts'),

        appendAlerts: (newAlerts) =>
          set(
            (state) => ({
              alerts: [...state.alerts, ...newAlerts],
            }),
            false,
            'appendAlerts'
          ),

        addAlert: (alert) =>
          set(
            (state) => ({
              alerts: [alert, ...state.alerts],
              totalItems: state.totalItems + 1,
              unreadCount: alert.status === 'unread' 
                ? state.unreadCount + 1 
                : state.unreadCount,
            }),
            false,
            'addAlert'
          ),

        updateAlert: (id, updates) =>
          set(
            (state) => ({
              alerts: state.alerts.map((a) =>
                a.id === id ? { ...a, ...updates } : a
              ),
              selectedAlert:
                state.selectedAlert?.id === id
                  ? { ...state.selectedAlert, ...updates }
                  : state.selectedAlert,
            }),
            false,
            'updateAlert'
          ),

        removeAlert: (id) =>
          set(
            (state) => {
              const alert = state.alerts.find((a) => a.id === id);
              return {
                alerts: state.alerts.filter((a) => a.id !== id),
                totalItems: Math.max(0, state.totalItems - 1),
                unreadCount: alert?.status === 'unread'
                  ? Math.max(0, state.unreadCount - 1)
                  : state.unreadCount,
                selectedAlert:
                  state.selectedAlert?.id === id ? null : state.selectedAlert,
              };
            },
            false,
            'removeAlert'
          ),

        setSelectedAlert: (alert) =>
          set({ selectedAlert: alert }, false, 'setSelectedAlert'),

        setSummary: (summary) => set({ summary }, false, 'setSummary'),

        setCounts: (counts) => set({ counts }, false, 'setCounts'),

        setUnreadCount: (count) =>
          set({ unreadCount: count }, false, 'setUnreadCount'),

        decrementUnread: (amount = 1) =>
          set(
            (state) => ({
              unreadCount: Math.max(0, state.unreadCount - amount),
            }),
            false,
            'decrementUnread'
          ),

        // ====================================================================
        // ACCIONES DE LECTURA
        // ====================================================================

        markAsRead: (id) =>
          set(
            (state) => {
              const alert = state.alerts.find((a) => a.id === id);
              if (!alert || alert.status !== 'unread') return state;

              return {
                alerts: state.alerts.map((a) =>
                  a.id === id
                    ? { ...a, status: 'read' as AlertStatus, readAt: new Date().toISOString() }
                    : a
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
                selectedAlert:
                  state.selectedAlert?.id === id
                    ? { ...state.selectedAlert, status: 'read' as AlertStatus }
                    : state.selectedAlert,
              };
            },
            false,
            'markAsRead'
          ),

        markMultipleAsRead: (ids) =>
          set(
            (state) => {
              const unreadIds = ids.filter(
                (id) => state.alerts.find((a) => a.id === id)?.status === 'unread'
              );

              return {
                alerts: state.alerts.map((a) =>
                  ids.includes(a.id) && a.status === 'unread'
                    ? { ...a, status: 'read' as AlertStatus, readAt: new Date().toISOString() }
                    : a
                ),
                unreadCount: Math.max(0, state.unreadCount - unreadIds.length),
              };
            },
            false,
            'markMultipleAsRead'
          ),

        markAllAsRead: () =>
          set(
            (state) => ({
              alerts: state.alerts.map((a) =>
                a.status === 'unread'
                  ? { ...a, status: 'read' as AlertStatus, readAt: new Date().toISOString() }
                  : a
              ),
              unreadCount: 0,
            }),
            false,
            'markAllAsRead'
          ),

        // ====================================================================
        // ACCIONES DE ARCHIVADO
        // ====================================================================

        archiveAlert: (id) =>
          set(
            (state) => ({
              alerts: state.alerts.map((a) =>
                a.id === id ? { ...a, status: 'archived' as AlertStatus } : a
              ),
            }),
            false,
            'archiveAlert'
          ),

        archiveMultiple: (ids) =>
          set(
            (state) => ({
              alerts: state.alerts.map((a) =>
                ids.includes(a.id) ? { ...a, status: 'archived' as AlertStatus } : a
              ),
              selectedIds: new Set(),
            }),
            false,
            'archiveMultiple'
          ),

        dismissAlert: (id) =>
          set(
            (state) => ({
              alerts: state.alerts.map((a) =>
                a.id === id ? { ...a, status: 'dismissed' as AlertStatus } : a
              ),
            }),
            false,
            'dismissAlert'
          ),

        // ====================================================================
        // PAGINACIÓN
        // ====================================================================

        setPage: (page) => set({ currentPage: page }, false, 'setPage'),

        setPageSize: (size) =>
          set({ pageSize: size, currentPage: 1 }, false, 'setPageSize'),

        setPagination: (total, totalPages) =>
          set({ totalItems: total, totalPages }, false, 'setPagination'),

        loadMore: () =>
          set(
            (state) => ({
              currentPage: state.currentPage + 1,
            }),
            false,
            'loadMore'
          ),

        // ====================================================================
        // FILTROS
        // ====================================================================

        setFilter: (key, value) =>
          set(
            (state) => ({
              filters: { ...state.filters, [key]: value },
              currentPage: 1,
            }),
            false,
            `setFilter:${key}`
          ),

        setFilters: (filters) =>
          set(
            (state) => ({
              filters: { ...state.filters, ...filters },
              currentPage: 1,
            }),
            false,
            'setFilters'
          ),

        resetFilters: () =>
          set(
            { filters: defaultFilters, currentPage: 1 },
            false,
            'resetFilters'
          ),

        getQueryParams: () => {
          const { filters, viewPreferences, currentPage, pageSize } = get();
          const params: ListAlertsParams = {
            page: currentPage,
            pageSize,
            sortBy: viewPreferences.sortBy,
            sortOrder: viewPreferences.sortOrder,
          };

          if (filters.search) params.search = filters.search;
          if (filters.status !== 'all') params.status = filters.status;
          if (filters.type !== 'all') params.type = filters.type;
          if (filters.priority !== 'all') params.priority = filters.priority;
          if (filters.groupId) params.groupId = filters.groupId;
          if (filters.studentId) params.studentId = filters.studentId;
          if (filters.dateFrom) params.fromDate = filters.dateFrom;
          if (filters.dateTo) params.toDate = filters.dateTo;
          if (filters.includeExpired) params.includeExpired = true;

          return params;
        },

        // ====================================================================
        // PREFERENCIAS
        // ====================================================================

        setViewPreference: (key, value) =>
          set(
            (state) => ({
              viewPreferences: { ...state.viewPreferences, [key]: value },
            }),
            false,
            `setViewPreference:${key}`
          ),

        // ====================================================================
        // SELECCIÓN MÚLTIPLE
        // ====================================================================

        toggleSelection: (id) =>
          set(
            (state) => {
              const newSelected = new Set(state.selectedIds);
              if (newSelected.has(id)) {
                newSelected.delete(id);
              } else {
                newSelected.add(id);
              }
              return { selectedIds: newSelected };
            },
            false,
            'toggleSelection'
          ),

        selectAll: () =>
          set(
            (state) => ({
              selectedIds: new Set(state.alerts.map((a) => a.id)),
            }),
            false,
            'selectAll'
          ),

        clearSelection: () =>
          set({ selectedIds: new Set(), isSelectionMode: false }, false, 'clearSelection'),

        setSelectionMode: (enabled) =>
          set(
            { 
              isSelectionMode: enabled,
              selectedIds: enabled ? get().selectedIds : new Set(),
            },
            false,
            'setSelectionMode'
          ),

        // ====================================================================
        // ESTADOS DE UI
        // ====================================================================

        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),

        setLoadingMore: (loading) =>
          set({ isLoadingMore: loading }, false, 'setLoadingMore'),

        setRefreshing: (refreshing) =>
          set({ isRefreshing: refreshing }, false, 'setRefreshing'),

        openDetail: (alert) =>
          set(
            { selectedAlert: alert, isDetailOpen: true },
            false,
            'openDetail'
          ),

        closeDetail: () =>
          set(
            { selectedAlert: null, isDetailOpen: false },
            false,
            'closeDetail'
          ),

        // ====================================================================
        // ERRORES
        // ====================================================================

        setError: (error) => set({ error }, false, 'setError'),

        clearError: () => set({ error: null }, false, 'clearError'),

        // ====================================================================
        // POLLING
        // ====================================================================

        setLastFetchTime: (time) =>
          set({ lastFetchTime: time }, false, 'setLastFetchTime'),

        // ====================================================================
        // RESET
        // ====================================================================

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'sicora-alerts-store',
        partialize: (state) => ({
          // Solo persistir preferencias y filtros
          filters: state.filters,
          viewPreferences: state.viewPreferences,
          pageSize: state.pageSize,
        }),
      }
    ),
    { name: 'AlertsStore' }
  )
);

// ============================================================================
// SELECTORES
// ============================================================================

/**
 * Obtener alertas no leídas
 */
export const selectUnreadAlerts = (state: AlertsState) =>
  state.alerts.filter((a) => a.status === 'unread');

/**
 * Obtener alertas por prioridad
 */
export const selectAlertsByPriority = (priority: AlertPriority) => (state: AlertsState) =>
  state.alerts.filter((a) => a.priority === priority);

/**
 * Obtener alertas críticas no leídas
 */
export const selectCriticalUnread = (state: AlertsState) =>
  state.alerts.filter(
    (a) => a.status === 'unread' && (a.priority === 'critical' || a.priority === 'high')
  );

/**
 * Obtener alertas agrupadas por tipo
 */
export const selectAlertsGroupedByType = (state: AlertsState) => {
  const grouped: Record<AlertType, Alert[]> = {} as Record<AlertType, Alert[]>;
  state.alerts.forEach((alert) => {
    if (!grouped[alert.type]) {
      grouped[alert.type] = [];
    }
    grouped[alert.type].push(alert);
  });
  return grouped;
};

/**
 * Verificar si hay filtros activos
 */
export const selectHasActiveFilters = (state: AlertsState) => {
  const { filters } = state;
  return (
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.type !== 'all' ||
    filters.priority !== 'all' ||
    filters.groupId !== null ||
    filters.studentId !== null ||
    filters.dateFrom !== null ||
    filters.dateTo !== null
  );
};

/**
 * Verificar si hay selección activa
 */
export const selectHasSelection = (state: AlertsState) =>
  state.selectedIds.size > 0;

/**
 * Obtener cantidad seleccionada
 */
export const selectSelectionCount = (state: AlertsState) =>
  state.selectedIds.size;

export default useAlertsStore;
