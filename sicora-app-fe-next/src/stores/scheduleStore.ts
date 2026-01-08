/**
 * SICORA - Schedule Store (Zustand)
 *
 * Estado global para gestión de horarios y calendario.
 * Maneja:
 * - Horarios del usuario actual
 * - Datos maestros (programas, fichas, ambientes, sedes)
 * - Filtros y vista de calendario
 * - Cache para optimizar peticiones
 *
 * @fileoverview Schedule store
 * @module stores/scheduleStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Schedule,
  AcademicProgram,
  AcademicGroup,
  Venue,
  Campus,
  ListSchedulesParams,
} from '@/types/schedule.types';
import type { CalendarView, Jornada, DiaSemana } from '@/types/calendar.types';

/* =============================================================================
   INTERFACES
   ============================================================================= */

/**
 * Filtros activos del calendario
 */
export interface ScheduleFilters {
  instructor_id?: string;
  academic_group_id?: string;
  venue_id?: string;
  jornada?: Jornada | 'todas';
  trimestre?: number;
  año?: number;
  status?: 'activo' | 'inactivo' | 'suspendido' | 'finalizado';
  searchTerm?: string;
}

/**
 * Rango de fechas visible en el calendario
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Estado del store de horarios
 */
interface ScheduleState {
  // === DATOS ===
  /** Horarios cargados actualmente */
  schedules: Schedule[];
  /** Horario seleccionado para edición/vista */
  selectedSchedule: Schedule | null;
  
  // === DATOS MAESTROS ===
  /** Programas de formación */
  programs: AcademicProgram[];
  /** Fichas/Grupos académicos */
  groups: AcademicGroup[];
  /** Ambientes */
  venues: Venue[];
  /** Sedes */
  campuses: Campus[];
  
  // === UI STATE ===
  /** Vista activa del calendario */
  calendarView: CalendarView;
  /** Fecha actualmente seleccionada */
  selectedDate: Date;
  /** Rango de fechas visible */
  visibleDateRange: DateRange;
  /** Filtros activos */
  filters: ScheduleFilters;
  
  // === LOADING & ERROR ===
  isLoading: boolean;
  isLoadingMasterData: boolean;
  error: string | null;
  
  // === CACHE ===
  /** Timestamp de última carga de horarios */
  lastFetchTime: number | null;
  /** Timestamp de última carga de datos maestros */
  lastMasterDataFetchTime: number | null;
  
  // === ACTIONS - SCHEDULES ===
  setSchedules: (schedules: Schedule[]) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  removeSchedule: (id: string) => void;
  setSelectedSchedule: (schedule: Schedule | null) => void;
  
  // === ACTIONS - MASTER DATA ===
  setPrograms: (programs: AcademicProgram[]) => void;
  setGroups: (groups: AcademicGroup[]) => void;
  setVenues: (venues: Venue[]) => void;
  setCampuses: (campuses: Campus[]) => void;
  
  // === ACTIONS - UI ===
  setCalendarView: (view: CalendarView) => void;
  setSelectedDate: (date: Date) => void;
  setVisibleDateRange: (range: DateRange) => void;
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  clearFilters: () => void;
  
  // === ACTIONS - LOADING ===
  setLoading: (loading: boolean) => void;
  setLoadingMasterData: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetchTime: (time: number) => void;
  setLastMasterDataFetchTime: (time: number) => void;
  
  // === ACTIONS - RESET ===
  resetStore: () => void;
  
  // === GETTERS (computados) ===
  getSchedulesByDate: (date: Date) => Schedule[];
  getSchedulesByGroup: (groupId: string) => Schedule[];
  getSchedulesByInstructor: (instructorId: string) => Schedule[];
  getSchedulesByVenue: (venueId: string) => Schedule[];
  getFilteredSchedules: () => Schedule[];
  getGroupById: (id: string) => AcademicGroup | undefined;
  getVenueById: (id: string) => Venue | undefined;
  getCampusById: (id: string) => Campus | undefined;
  getProgramById: (id: string) => AcademicProgram | undefined;
  
  // === HELPERS ===
  shouldRefetchSchedules: () => boolean;
  shouldRefetchMasterData: () => boolean;
  buildApiParams: () => ListSchedulesParams;
}

/* =============================================================================
   INITIAL STATE
   ============================================================================= */

const initialFilters: ScheduleFilters = {
  jornada: 'todas',
  status: 'activo',
};

const getInitialDateRange = (): DateRange => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
  
  return { start: startOfWeek, end: endOfWeek };
};

/* =============================================================================
   STORE
   ============================================================================= */

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      // === INITIAL DATA ===
      schedules: [],
      selectedSchedule: null,
      programs: [],
      groups: [],
      venues: [],
      campuses: [],
      
      // === INITIAL UI STATE ===
      calendarView: 'week' as CalendarView,
      selectedDate: new Date(),
      visibleDateRange: getInitialDateRange(),
      filters: initialFilters,
      
      // === INITIAL LOADING ===
      isLoading: false,
      isLoadingMasterData: false,
      error: null,
      lastFetchTime: null,
      lastMasterDataFetchTime: null,
      
      // === ACTIONS - SCHEDULES ===
      setSchedules: (schedules) => {
        set({ schedules, lastFetchTime: Date.now() });
      },
      
      addSchedule: (schedule) => {
        set((state) => ({
          schedules: [...state.schedules, schedule],
        }));
      },
      
      updateSchedule: (id, updates) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          selectedSchedule:
            state.selectedSchedule?.id === id
              ? { ...state.selectedSchedule, ...updates }
              : state.selectedSchedule,
        }));
      },
      
      removeSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
          selectedSchedule:
            state.selectedSchedule?.id === id ? null : state.selectedSchedule,
        }));
      },
      
      setSelectedSchedule: (schedule) => {
        set({ selectedSchedule: schedule });
      },
      
      // === ACTIONS - MASTER DATA ===
      setPrograms: (programs) => set({ programs }),
      setGroups: (groups) => set({ groups }),
      setVenues: (venues) => set({ venues }),
      setCampuses: (campuses) => set({ campuses }),
      
      // === ACTIONS - UI ===
      setCalendarView: (calendarView) => {
        set({ calendarView });
        // Recalcular rango visible según la vista
        const { selectedDate } = get();
        const newRange = calculateDateRangeForView(selectedDate, calendarView);
        set({ visibleDateRange: newRange });
      },
      
      setSelectedDate: (selectedDate) => {
        set({ selectedDate });
        // Recalcular rango visible
        const { calendarView } = get();
        const newRange = calculateDateRangeForView(selectedDate, calendarView);
        set({ visibleDateRange: newRange });
      },
      
      setVisibleDateRange: (visibleDateRange) => set({ visibleDateRange }),
      
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      
      clearFilters: () => set({ filters: initialFilters }),
      
      // === ACTIONS - LOADING ===
      setLoading: (isLoading) => set({ isLoading }),
      setLoadingMasterData: (isLoadingMasterData) => set({ isLoadingMasterData }),
      setError: (error) => set({ error }),
      setLastFetchTime: (lastFetchTime) => set({ lastFetchTime }),
      setLastMasterDataFetchTime: (lastMasterDataFetchTime) =>
        set({ lastMasterDataFetchTime }),
      
      // === ACTIONS - RESET ===
      resetStore: () => {
        set({
          schedules: [],
          selectedSchedule: null,
          programs: [],
          groups: [],
          venues: [],
          campuses: [],
          calendarView: 'week',
          selectedDate: new Date(),
          visibleDateRange: getInitialDateRange(),
          filters: initialFilters,
          isLoading: false,
          isLoadingMasterData: false,
          error: null,
          lastFetchTime: null,
          lastMasterDataFetchTime: null,
        });
      },
      
      // === GETTERS ===
      getSchedulesByDate: (date) => {
        const { schedules } = get();
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter((s) => {
          const startDate = s.fecha_inicio.split('T')[0];
          const endDate = s.fecha_fin.split('T')[0];
          return dateStr >= startDate && dateStr <= endDate;
        });
      },
      
      getSchedulesByGroup: (groupId) => {
        const { schedules } = get();
        return schedules.filter((s) => s.academic_group_id === groupId);
      },
      
      getSchedulesByInstructor: (instructorId) => {
        const { schedules } = get();
        return schedules.filter((s) => s.instructor_id === instructorId);
      },
      
      getSchedulesByVenue: (venueId) => {
        const { schedules } = get();
        return schedules.filter((s) => s.venue_id === venueId);
      },
      
      getFilteredSchedules: () => {
        const { schedules, filters } = get();
        
        return schedules.filter((schedule) => {
          // Filtro por instructor
          if (filters.instructor_id && schedule.instructor_id !== filters.instructor_id) {
            return false;
          }
          
          // Filtro por grupo
          if (filters.academic_group_id && schedule.academic_group_id !== filters.academic_group_id) {
            return false;
          }
          
          // Filtro por ambiente
          if (filters.venue_id && schedule.venue_id !== filters.venue_id) {
            return false;
          }
          
          // Filtro por jornada
          if (filters.jornada && filters.jornada !== 'todas' && schedule.jornada !== filters.jornada) {
            return false;
          }
          
          // Filtro por trimestre
          if (filters.trimestre && schedule.trimestre !== filters.trimestre) {
            return false;
          }
          
          // Filtro por año
          if (filters.año && schedule.año !== filters.año) {
            return false;
          }
          
          // Filtro por estado
          if (filters.status && schedule.status !== filters.status) {
            return false;
          }
          
          // Filtro por búsqueda de texto
          if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            const matchesSubject = schedule.subject.toLowerCase().includes(term);
            const matchesGroup = schedule.group_code?.toLowerCase().includes(term);
            const matchesVenue = schedule.venue_name?.toLowerCase().includes(term);
            const matchesInstructor = schedule.instructor_name?.toLowerCase().includes(term);
            
            if (!matchesSubject && !matchesGroup && !matchesVenue && !matchesInstructor) {
              return false;
            }
          }
          
          return true;
        });
      },
      
      getGroupById: (id) => {
        const { groups } = get();
        return groups.find((g) => g.id === id);
      },
      
      getVenueById: (id) => {
        const { venues } = get();
        return venues.find((v) => v.id === id);
      },
      
      getCampusById: (id) => {
        const { campuses } = get();
        return campuses.find((c) => c.id === id);
      },
      
      getProgramById: (id) => {
        const { programs } = get();
        return programs.find((p) => p.id === id);
      },
      
      // === HELPERS ===
      shouldRefetchSchedules: () => {
        const { lastFetchTime } = get();
        if (!lastFetchTime) return true;
        // Refetch si han pasado más de 5 minutos
        const CACHE_DURATION = 5 * 60 * 1000;
        return Date.now() - lastFetchTime > CACHE_DURATION;
      },
      
      shouldRefetchMasterData: () => {
        const { lastMasterDataFetchTime } = get();
        if (!lastMasterDataFetchTime) return true;
        // Refetch si han pasado más de 30 minutos
        const CACHE_DURATION = 30 * 60 * 1000;
        return Date.now() - lastMasterDataFetchTime > CACHE_DURATION;
      },
      
      buildApiParams: (): ListSchedulesParams => {
        const { filters, visibleDateRange } = get();
        
        return {
          instructor_id: filters.instructor_id,
          academic_group_id: filters.academic_group_id,
          venue_id: filters.venue_id,
          jornada: filters.jornada !== 'todas' ? filters.jornada : undefined,
          trimestre: filters.trimestre,
          año: filters.año,
          status: filters.status,
          fecha_desde: visibleDateRange.start.toISOString().split('T')[0],
          fecha_hasta: visibleDateRange.end.toISOString().split('T')[0],
        };
      },
    }),
    {
      name: 'sicora-schedule-storage',
      partialize: (state) => ({
        // Solo persistir preferencias de UI, no datos
        calendarView: state.calendarView,
        filters: state.filters,
      }),
    }
  )
);

/* =============================================================================
   HELPERS
   ============================================================================= */

/**
 * Calcular rango de fechas según la vista del calendario
 */
function calculateDateRangeForView(date: Date, view: CalendarView): DateRange {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (view) {
    case 'day':
      // Solo el día actual
      break;
      
    case 'week':
      // Semana completa (lunes a domingo)
      const dayOfWeek = start.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar al lunes
      start.setDate(start.getDate() + diff);
      end.setDate(start.getDate() + 6);
      break;
      
    case 'month':
      // Mes completo
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Último día del mes
      break;
  }
  
  return { start, end };
}

/* =============================================================================
   EXPORTS
   ============================================================================= */

export default useScheduleStore;
