/**
 * Store Zustand para gestión de Horarios
 */

import { create } from 'zustand';
import type {
  Schedule,
  ScheduleFilters,
  ScheduleStatus,
  CalendarEvent,
} from '../types/schedule.types';
import { schedulesApi } from '../lib/api/schedules';

interface SchedulesState {
  // Estado
  schedules: Schedule[];
  calendarEvents: CalendarEvent[];
  selectedSchedule: Schedule | null;
  totalSchedules: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filters: ScheduleFilters;
  currentDateRange: { from: string; to: string };
  viewMode: 'week' | 'month' | 'day';

  // Estados de carga
  isLoading: boolean;
  isLoadingCalendar: boolean;
  error: string | null;

  // Acciones
  fetchSchedules: () => Promise<void>;
  fetchCalendarEvents: (from: string, to: string) => Promise<void>;
  fetchScheduleById: (id: string) => Promise<void>;
  createSchedule: (data: Parameters<typeof schedulesApi.createSchedule>[0]) => Promise<Schedule>;
  updateSchedule: (
    id: string,
    data: Parameters<typeof schedulesApi.updateSchedule>[1]
  ) => Promise<Schedule>;
  deleteSchedule: (id: string) => Promise<void>;
  cancelSchedule: (id: string, reason?: string) => Promise<void>;
  completeSchedule: (id: string, notes?: string) => Promise<void>;

  // Filtros y navegación
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setDateRange: (from: string, to: string) => void;
  setViewMode: (mode: 'week' | 'month' | 'day') => void;

  // Selección
  selectSchedule: (schedule: Schedule | null) => void;

  // Helpers
  filterByStatus: (status: ScheduleStatus | undefined) => void;
  filterByInstructor: (instructorId: string | undefined) => void;
  filterByFicha: (fichaId: string | undefined) => void;
  filterByAmbiente: (ambienteId: string | undefined) => void;

  // Control de errores
  clearError: () => void;
}

// Convertir Schedule a CalendarEvent
const toCalendarEvent = (schedule: Schedule): CalendarEvent => {
  const [year, month, day] = schedule.date.split('-').map(Number);
  const [startHour, startMin] = schedule.start_time.split(':').map(Number);
  const [endHour, endMin] = schedule.end_time.split(':').map(Number);

  return {
    id: schedule.id,
    title: schedule.title,
    start: new Date(year, month - 1, day, startHour, startMin),
    end: new Date(year, month - 1, day, endHour, endMin),
    color: schedule.color,
    instructor: schedule.instructor_name,
    ambiente: schedule.ambiente_name,
    ficha: schedule.ficha_code,
    status: schedule.status,
  };
};

// Obtener rango de fechas de la semana actual
const getCurrentWeekRange = (): { from: string; to: string } => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return {
    from: monday.toISOString().split('T')[0],
    to: friday.toISOString().split('T')[0],
  };
};

export const useSchedulesStore = create<SchedulesState>((set, get) => ({
  // Estado inicial
  schedules: [],
  calendarEvents: [],
  selectedSchedule: null,
  totalSchedules: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 20,
  filters: {},
  currentDateRange: getCurrentWeekRange(),
  viewMode: 'week',
  isLoading: false,
  isLoadingCalendar: false,
  error: null,

  // Acciones principales
  fetchSchedules: async () => {
    const { filters, currentPage, pageSize } = get();
    set({ isLoading: true, error: null });

    try {
      const response = await schedulesApi.getSchedules(filters, {
        page: currentPage,
        page_size: pageSize,
        sort_by: 'date',
        sort_order: 'asc',
      });

      set({
        schedules: response.data,
        totalSchedules: response.total,
        totalPages: response.total_pages,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar horarios',
        isLoading: false,
      });
    }
  },

  fetchCalendarEvents: async (from: string, to: string) => {
    const { filters } = get();
    set({ isLoadingCalendar: true, error: null });

    try {
      const schedules = await schedulesApi.getSchedulesByDateRange(from, to, filters);
      const events = schedules.map(toCalendarEvent);

      set({
        calendarEvents: events,
        currentDateRange: { from, to },
        isLoadingCalendar: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar calendario',
        isLoadingCalendar: false,
      });
    }
  },

  fetchScheduleById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const schedule = await schedulesApi.getScheduleById(id);
      set({ selectedSchedule: schedule, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar horario',
        isLoading: false,
      });
    }
  },

  createSchedule: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const newSchedule = await schedulesApi.createSchedule(data);

      set((state) => ({
        schedules: [newSchedule, ...state.schedules],
        calendarEvents: [...state.calendarEvents, toCalendarEvent(newSchedule)],
        totalSchedules: state.totalSchedules + 1,
        isLoading: false,
      }));

      return newSchedule;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al crear horario',
        isLoading: false,
      });
      throw error;
    }
  },

  updateSchedule: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedSchedule = await schedulesApi.updateSchedule(id, data);

      set((state) => ({
        schedules: state.schedules.map((s) => (s.id === id ? updatedSchedule : s)),
        calendarEvents: state.calendarEvents.map((e) =>
          e.id === id ? toCalendarEvent(updatedSchedule) : e
        ),
        selectedSchedule:
          state.selectedSchedule?.id === id ? updatedSchedule : state.selectedSchedule,
        isLoading: false,
      }));

      return updatedSchedule;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al actualizar horario',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSchedule: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await schedulesApi.deleteSchedule(id);

      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
        calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
        selectedSchedule: state.selectedSchedule?.id === id ? null : state.selectedSchedule,
        totalSchedules: state.totalSchedules - 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al eliminar horario',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelSchedule: async (id, reason) => {
    set({ isLoading: true, error: null });

    try {
      const updatedSchedule = await schedulesApi.cancelSchedule(id, reason);

      set((state) => ({
        schedules: state.schedules.map((s) => (s.id === id ? updatedSchedule : s)),
        calendarEvents: state.calendarEvents.map((e) =>
          e.id === id ? toCalendarEvent(updatedSchedule) : e
        ),
        selectedSchedule:
          state.selectedSchedule?.id === id ? updatedSchedule : state.selectedSchedule,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cancelar horario',
        isLoading: false,
      });
      throw error;
    }
  },

  completeSchedule: async (id, notes) => {
    set({ isLoading: true, error: null });

    try {
      const updatedSchedule = await schedulesApi.completeSchedule(id, notes);

      set((state) => ({
        schedules: state.schedules.map((s) => (s.id === id ? updatedSchedule : s)),
        calendarEvents: state.calendarEvents.map((e) =>
          e.id === id ? toCalendarEvent(updatedSchedule) : e
        ),
        selectedSchedule:
          state.selectedSchedule?.id === id ? updatedSchedule : state.selectedSchedule,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al completar horario',
        isLoading: false,
      });
      throw error;
    }
  },

  // Filtros y navegación
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1,
    }));
    get().fetchSchedules();
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
    get().fetchSchedules();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchSchedules();
  },

  setDateRange: (from, to) => {
    set({ currentDateRange: { from, to } });
    get().fetchCalendarEvents(from, to);
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  // Selección
  selectSchedule: (schedule) => {
    set({ selectedSchedule: schedule });
  },

  // Helpers de filtros
  filterByStatus: (status) => {
    set((state) => ({
      filters: { ...state.filters, status },
      currentPage: 1,
    }));
    get().fetchSchedules();
  },

  filterByInstructor: (instructorId) => {
    set((state) => ({
      filters: { ...state.filters, instructor_id: instructorId },
      currentPage: 1,
    }));
    get().fetchSchedules();
  },

  filterByFicha: (fichaId) => {
    set((state) => ({
      filters: { ...state.filters, ficha_id: fichaId },
      currentPage: 1,
    }));
    get().fetchSchedules();
  },

  filterByAmbiente: (ambienteId) => {
    set((state) => ({
      filters: { ...state.filters, ambiente_id: ambienteId },
      currentPage: 1,
    }));
    get().fetchSchedules();
  },

  // Control de errores
  clearError: () => {
    set({ error: null });
  },
}));
