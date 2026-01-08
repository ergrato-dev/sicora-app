/**
 * SICORA - Store de Justificaciones (Zustand)
 *
 * Estado global para gestión de justificaciones de ausencias.
 * Maneja la lista, selección, filtros y operaciones de aprobación/rechazo.
 *
 * @fileoverview Justifications state management
 * @module stores/justificationsStore
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Justification,
  JustificationType,
  JustificationStatus,
  JustificationSummary,
  ListJustificationsParams,
} from '@/types/justification.types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Filtros activos para justificaciones
 */
interface JustificationFilters {
  search: string;
  status: JustificationStatus | 'all';
  type: JustificationType | 'all';
  groupId: string | null;
  studentId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

/**
 * Estado de la vista de justificaciones
 */
interface JustificationViewState {
  view: 'list' | 'detail' | 'create' | 'review';
  selectedJustificationId: string | null;
  isFormOpen: boolean;
  isReviewOpen: boolean;
}

/**
 * Estado del store de justificaciones
 */
interface JustificationsState {
  // Datos
  justifications: Justification[];
  selectedJustification: Justification | null;
  summary: JustificationSummary | null;
  
  // Paginación
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Filtros
  filters: JustificationFilters;
  
  // Vista
  viewState: JustificationViewState;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  isLoadingDetail: boolean;
  
  // Errores
  error: string | null;
}

/**
 * Acciones del store
 */
interface JustificationsActions {
  // Datos
  setJustifications: (justifications: Justification[]) => void;
  addJustification: (justification: Justification) => void;
  updateJustification: (id: string, updates: Partial<Justification>) => void;
  removeJustification: (id: string) => void;
  setSelectedJustification: (justification: Justification | null) => void;
  setSummary: (summary: JustificationSummary | null) => void;
  
  // Paginación
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setPagination: (total: number, totalPages: number) => void;
  
  // Filtros
  setFilter: <K extends keyof JustificationFilters>(
    key: K,
    value: JustificationFilters[K]
  ) => void;
  setFilters: (filters: Partial<JustificationFilters>) => void;
  resetFilters: () => void;
  getQueryParams: () => ListJustificationsParams;
  
  // Vista
  setView: (view: JustificationViewState['view']) => void;
  openCreate: () => void;
  openDetail: (id: string) => void;
  openReview: (id: string) => void;
  closeModals: () => void;
  
  // Loading
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setLoadingDetail: (loading: boolean) => void;
  
  // Errores
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultFilters: JustificationFilters = {
  search: '',
  status: 'all',
  type: 'all',
  groupId: null,
  studentId: null,
  dateFrom: null,
  dateTo: null,
};

const defaultViewState: JustificationViewState = {
  view: 'list',
  selectedJustificationId: null,
  isFormOpen: false,
  isReviewOpen: false,
};

const initialState: JustificationsState = {
  justifications: [],
  selectedJustification: null,
  summary: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  filters: defaultFilters,
  viewState: defaultViewState,
  isLoading: false,
  isSubmitting: false,
  isLoadingDetail: false,
  error: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useJustificationsStore = create<JustificationsState & JustificationsActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // DATOS
        // ====================================================================

        setJustifications: (justifications) =>
          set({ justifications }, false, 'setJustifications'),

        addJustification: (justification) =>
          set(
            (state) => ({
              justifications: [justification, ...state.justifications],
              totalItems: state.totalItems + 1,
            }),
            false,
            'addJustification'
          ),

        updateJustification: (id, updates) =>
          set(
            (state) => ({
              justifications: state.justifications.map((j) =>
                j.id === id ? { ...j, ...updates } : j
              ),
              selectedJustification:
                state.selectedJustification?.id === id
                  ? { ...state.selectedJustification, ...updates }
                  : state.selectedJustification,
            }),
            false,
            'updateJustification'
          ),

        removeJustification: (id) =>
          set(
            (state) => ({
              justifications: state.justifications.filter((j) => j.id !== id),
              totalItems: Math.max(0, state.totalItems - 1),
              selectedJustification:
                state.selectedJustification?.id === id
                  ? null
                  : state.selectedJustification,
            }),
            false,
            'removeJustification'
          ),

        setSelectedJustification: (justification) =>
          set(
            { 
              selectedJustification: justification,
              viewState: {
                ...get().viewState,
                selectedJustificationId: justification?.id || null,
              },
            },
            false,
            'setSelectedJustification'
          ),

        setSummary: (summary) => set({ summary }, false, 'setSummary'),

        // ====================================================================
        // PAGINACIÓN
        // ====================================================================

        setPage: (page) =>
          set({ currentPage: page }, false, 'setPage'),

        setPageSize: (size) =>
          set({ pageSize: size, currentPage: 1 }, false, 'setPageSize'),

        setPagination: (total, totalPages) =>
          set({ totalItems: total, totalPages }, false, 'setPagination'),

        // ====================================================================
        // FILTROS
        // ====================================================================

        setFilter: (key, value) =>
          set(
            (state) => ({
              filters: { ...state.filters, [key]: value },
              currentPage: 1, // Reset page on filter change
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
          const { filters, currentPage, pageSize } = get();
          const params: ListJustificationsParams = {
            page: currentPage,
            pageSize,
          };

          if (filters.search) params.search = filters.search;
          if (filters.status !== 'all') params.status = filters.status;
          if (filters.type !== 'all') params.type = filters.type;
          if (filters.groupId) params.groupId = filters.groupId;
          if (filters.studentId) params.studentId = filters.studentId;
          if (filters.dateFrom) params.fromDate = filters.dateFrom;
          if (filters.dateTo) params.toDate = filters.dateTo;

          return params;
        },

        // ====================================================================
        // VISTA
        // ====================================================================

        setView: (view) =>
          set(
            (state) => ({
              viewState: { ...state.viewState, view },
            }),
            false,
            'setView'
          ),

        openCreate: () =>
          set(
            {
              viewState: {
                view: 'create',
                selectedJustificationId: null,
                isFormOpen: true,
                isReviewOpen: false,
              },
            },
            false,
            'openCreate'
          ),

        openDetail: (id) =>
          set(
            {
              viewState: {
                view: 'detail',
                selectedJustificationId: id,
                isFormOpen: false,
                isReviewOpen: false,
              },
            },
            false,
            'openDetail'
          ),

        openReview: (id) =>
          set(
            {
              viewState: {
                view: 'review',
                selectedJustificationId: id,
                isFormOpen: false,
                isReviewOpen: true,
              },
            },
            false,
            'openReview'
          ),

        closeModals: () =>
          set(
            (state) => ({
              viewState: {
                ...state.viewState,
                view: 'list',
                isFormOpen: false,
                isReviewOpen: false,
              },
            }),
            false,
            'closeModals'
          ),

        // ====================================================================
        // LOADING
        // ====================================================================

        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),

        setSubmitting: (submitting) =>
          set({ isSubmitting: submitting }, false, 'setSubmitting'),

        setLoadingDetail: (loading) =>
          set({ isLoadingDetail: loading }, false, 'setLoadingDetail'),

        // ====================================================================
        // ERRORES
        // ====================================================================

        setError: (error) => set({ error }, false, 'setError'),

        clearError: () => set({ error: null }, false, 'clearError'),

        // ====================================================================
        // RESET
        // ====================================================================

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'sicora-justifications-store',
        partialize: (state) => ({
          // Solo persistir filtros y preferencias de vista
          filters: state.filters,
          pageSize: state.pageSize,
        }),
      }
    ),
    { name: 'JustificationsStore' }
  )
);

// ============================================================================
// SELECTORES
// ============================================================================

/**
 * Obtener justificaciones pendientes de revisión
 */
export const selectPendingJustifications = (state: JustificationsState) =>
  state.justifications.filter((j) => j.status === 'pending');

/**
 * Obtener contador de pendientes
 */
export const selectPendingCount = (state: JustificationsState) =>
  state.justifications.filter((j) => j.status === 'pending').length;

/**
 * Obtener justificación por ID
 */
export const selectJustificationById = (id: string) => (state: JustificationsState) =>
  state.justifications.find((j) => j.id === id);

/**
 * Verificar si hay filtros activos
 */
export const selectHasActiveFilters = (state: JustificationsState) => {
  const { filters } = state;
  return (
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.type !== 'all' ||
    filters.groupId !== null ||
    filters.studentId !== null ||
    filters.dateFrom !== null ||
    filters.dateTo !== null
  );
};

export default useJustificationsStore;
