/**
 * Hooks personalizados para el módulo de Horarios
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useSchedulesStore } from '../stores/schedules.store';
import { schedulesApi } from '../lib/api/schedules';
import type {
  CreateScheduleRequest,
  ScheduleStats,
  AmbienteAvailability,
  ScheduleConflict,
} from '../types/schedule.types';

/**
 * Hook principal para gestionar horarios
 */
export function useSchedules() {
  const {
    schedules,
    calendarEvents,
    totalSchedules,
    currentPage,
    totalPages,
    filters,
    currentDateRange,
    viewMode,
    isLoading,
    isLoadingCalendar,
    error,
    fetchSchedules,
    fetchCalendarEvents,
    setFilters,
    clearFilters,
    setPage,
    setDateRange,
    setViewMode,
    filterByStatus,
    filterByInstructor,
    filterByFicha,
    filterByAmbiente,
    clearError,
  } = useSchedulesStore();

  // Cargar horarios al montar
  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers de paginación
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, setPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, setPage]);

  // Refresh
  const refresh = useCallback(() => {
    fetchSchedules();
    if (currentDateRange.from && currentDateRange.to) {
      fetchCalendarEvents(currentDateRange.from, currentDateRange.to);
    }
  }, [fetchSchedules, fetchCalendarEvents, currentDateRange]);

  return {
    // Datos
    schedules,
    calendarEvents,
    totalSchedules,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    filters,
    currentDateRange,
    viewMode,

    // Estados
    isLoading,
    isLoadingCalendar,
    error,

    // Acciones
    refresh,
    setFilters,
    clearFilters,
    setPage,
    nextPage,
    prevPage,
    setDateRange,
    setViewMode,
    filterByStatus,
    filterByInstructor,
    filterByFicha,
    filterByAmbiente,
    clearError,
  };
}

/**
 * Hook para eventos de calendario
 */
export function useCalendarEvents(initialFrom?: string, initialTo?: string) {
  const {
    calendarEvents,
    currentDateRange,
    isLoadingCalendar,
    error,
    fetchCalendarEvents,
    filters,
  } = useSchedulesStore();

  // Cargar eventos al montar o cambiar rango
  useEffect(() => {
    const from = initialFrom || currentDateRange.from;
    const to = initialTo || currentDateRange.to;

    if (from && to) {
      fetchCalendarEvents(from, to);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFrom, initialTo, JSON.stringify(filters)]);

  // Agrupar eventos por día
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, typeof calendarEvents> = {};

    calendarEvents.forEach((event) => {
      const dateKey = event.start.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [calendarEvents]);

  // Obtener eventos para un día específico
  const getEventsForDay = useCallback(
    (date: Date) => {
      const dateKey = date.toISOString().split('T')[0];
      return eventsByDay[dateKey] || [];
    },
    [eventsByDay]
  );

  // Navegación de semana
  const goToNextWeek = useCallback(() => {
    const from = new Date(currentDateRange.from);
    from.setDate(from.getDate() + 7);
    const to = new Date(currentDateRange.to);
    to.setDate(to.getDate() + 7);

    fetchCalendarEvents(from.toISOString().split('T')[0], to.toISOString().split('T')[0]);
  }, [currentDateRange, fetchCalendarEvents]);

  const goToPrevWeek = useCallback(() => {
    const from = new Date(currentDateRange.from);
    from.setDate(from.getDate() - 7);
    const to = new Date(currentDateRange.to);
    to.setDate(to.getDate() - 7);

    fetchCalendarEvents(from.toISOString().split('T')[0], to.toISOString().split('T')[0]);
  }, [currentDateRange, fetchCalendarEvents]);

  const goToToday = useCallback(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    fetchCalendarEvents(monday.toISOString().split('T')[0], friday.toISOString().split('T')[0]);
  }, [fetchCalendarEvents]);

  return {
    events: calendarEvents,
    eventsByDay,
    currentDateRange,
    isLoading: isLoadingCalendar,
    error,
    getEventsForDay,
    goToNextWeek,
    goToPrevWeek,
    goToToday,
    refresh: () => fetchCalendarEvents(currentDateRange.from, currentDateRange.to),
  };
}

/**
 * Hook para crear horarios
 */
export function useCreateSchedule() {
  const { createSchedule, isLoading, error, clearError } = useSchedulesStore();

  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // Verificar conflictos antes de crear
  const checkConflicts = useCallback(async (data: CreateScheduleRequest) => {
    setIsCheckingConflicts(true);
    try {
      const result = await schedulesApi.checkConflicts(data);
      setConflicts(result);
      return result;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    } finally {
      setIsCheckingConflicts(false);
    }
  }, []);

  // Crear horario
  const create = useCallback(
    async (data: CreateScheduleRequest, skipConflictCheck = false) => {
      if (!skipConflictCheck) {
        const foundConflicts = await checkConflicts(data);
        if (foundConflicts.length > 0) {
          throw new Error('Se encontraron conflictos de horario');
        }
      }

      return createSchedule(data);
    },
    [checkConflicts, createSchedule]
  );

  return {
    create,
    checkConflicts,
    conflicts,
    isCreating: isLoading,
    isCheckingConflicts,
    error,
    clearError,
  };
}

// Necesito importar useState
import { useState } from 'react';

/**
 * Hook para acciones sobre un horario específico
 */
export function useScheduleActions() {
  const {
    updateSchedule,
    deleteSchedule,
    cancelSchedule,
    completeSchedule,
    isLoading,
    error,
    clearError,
  } = useSchedulesStore();

  const update = useCallback(
    (id: string, data: Parameters<typeof updateSchedule>[1]) => updateSchedule(id, data),
    [updateSchedule]
  );

  const remove = useCallback((id: string) => deleteSchedule(id), [deleteSchedule]);

  const cancel = useCallback(
    (id: string, reason?: string) => cancelSchedule(id, reason),
    [cancelSchedule]
  );

  const complete = useCallback(
    (id: string, notes?: string) => completeSchedule(id, notes),
    [completeSchedule]
  );

  return {
    update,
    remove,
    cancel,
    complete,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Hook para obtener un horario específico
 */
export function useSchedule(id: string | undefined) {
  const { selectedSchedule, fetchScheduleById, isLoading, error } = useSchedulesStore();

  useEffect(() => {
    if (id) {
      fetchScheduleById(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    schedule: selectedSchedule,
    isLoading,
    error,
  };
}

/**
 * Hook para verificar disponibilidad
 */
export function useAvailability() {
  const [ambienteAvailability, setAmbienteAvailability] = useState<AmbienteAvailability | null>(
    null
  );
  const [instructorAvailability, setInstructorAvailability] = useState<AmbienteAvailability | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAmbienteAvailability = useCallback(async (ambienteId: string, date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await schedulesApi.getAmbienteAvailability(ambienteId, date);
      setAmbienteAvailability(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error verificando disponibilidad');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkInstructorAvailability = useCallback(async (instructorId: string, date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await schedulesApi.getInstructorAvailability(instructorId, date);
      setInstructorAvailability(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error verificando disponibilidad');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    ambienteAvailability,
    instructorAvailability,
    isLoading,
    error,
    checkAmbienteAvailability,
    checkInstructorAvailability,
  };
}

/**
 * Hook para estadísticas de horarios
 */
export function useScheduleStats(dateFrom?: string, dateTo?: string) {
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await schedulesApi.getStats(dateFrom, dateTo);
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error obteniendo estadísticas');
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}
