 /**
 * SICORA - Hook para Gestión de Horarios
 *
 * Hook que integra el store de schedules con los API clients
 * para cargar y manipular datos de horarios.
 *
 * @fileoverview Schedule management hook
 * @module hooks/useScheduleData
 */

'use client';

import { useCallback, useEffect } from 'react';
import { useScheduleStore } from '@/stores/scheduleStore';
import { schedulesApi } from '@/lib/api/schedules';
import { useUserStore } from '@/stores/userStore';
import type { 
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ListSchedulesParams 
} from '@/types/schedule.types';

interface UseScheduleDataOptions {
  /** Cargar horarios automáticamente al montar */
  autoFetch?: boolean;
  /** Cargar datos maestros automáticamente */
  loadMasterData?: boolean;
  /** ID de instructor específico (si no se usa el del usuario actual) */
  instructorId?: string;
  /** ID de grupo específico */
  groupId?: string;
}

interface UseScheduleDataReturn {
  // Estado
  schedules: Schedule[];
  selectedSchedule: Schedule | null;
  isLoading: boolean;
  error: string | null;
  
  // Datos maestros
  programs: typeof useScheduleStore.getState['programs'];
  groups: typeof useScheduleStore.getState['groups'];
  venues: typeof useScheduleStore.getState['venues'];
  campuses: typeof useScheduleStore.getState['campuses'];
  
  // Acciones
  fetchSchedules: (params?: ListSchedulesParams) => Promise<void>;
  fetchMasterData: () => Promise<void>;
  createSchedule: (data: CreateScheduleRequest) => Promise<Schedule | null>;
  updateSchedule: (id: string, data: UpdateScheduleRequest) => Promise<Schedule | null>;
  deleteSchedule: (id: string) => Promise<boolean>;
  selectSchedule: (schedule: Schedule | null) => void;
  refreshData: () => Promise<void>;
}

/**
 * Hook para gestión de datos de horarios
 */
export function useScheduleData(options: UseScheduleDataOptions = {}): UseScheduleDataReturn {
  const {
    autoFetch = true,
    loadMasterData = true,
    instructorId,
    groupId,
  } = options;

  // Store state
  const {
    schedules,
    selectedSchedule,
    programs,
    groups,
    venues,
    campuses,
    isLoading,
    isLoadingMasterData,
    error,
    filters,
    visibleDateRange,
    // Actions
    setSchedules,
    addSchedule,
    updateSchedule: updateScheduleInStore,
    removeSchedule,
    setSelectedSchedule,
    setPrograms,
    setGroups,
    setVenues,
    setCampuses,
    setLoading,
    setLoadingMasterData,
    setError,
    setLastFetchTime,
    setLastMasterDataFetchTime,
    // Helpers
    shouldRefetchSchedules,
    shouldRefetchMasterData,
    buildApiParams,
    getFilteredSchedules,
  } = useScheduleStore();

  // User store para obtener instructor actual
  const { user } = useUserStore();

  /**
   * Cargar horarios desde el backend
   */
  const fetchSchedules = useCallback(async (params?: ListSchedulesParams) => {
    setLoading(true);
    setError(null);

    try {
      // Construir parámetros de la API
      const apiParams: ListSchedulesParams = params || buildApiParams();
      
      // Si no se especifica instructor, usar el del usuario actual (si es instructor)
      if (!apiParams.instructor_id && user?.role === 'instructor') {
        apiParams.instructor_id = user.id;
      }
      
      // Override con opciones del hook
      if (instructorId) apiParams.instructor_id = instructorId;
      if (groupId) apiParams.academic_group_id = groupId;

      const response = await schedulesApi.listSchedules(apiParams);

      if (response.success && response.data) {
        setSchedules(response.data.schedules);
        setLastFetchTime(Date.now());
      } else {
        setError(response.message || 'Error al cargar horarios');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  }, [buildApiParams, user, instructorId, groupId, setSchedules, setLoading, setError, setLastFetchTime]);

  /**
   * Cargar datos maestros (programas, fichas, ambientes, sedes)
   */
  const fetchMasterData = useCallback(async () => {
    if (!shouldRefetchMasterData()) {
      return; // Usar cache
    }

    setLoadingMasterData(true);

    try {
      // Cargar todos en paralelo
      const [programsRes, groupsRes, venuesRes, campusesRes] = await Promise.all([
        schedulesApi.listPrograms({ is_active: true }),
        schedulesApi.listGroups({ status: 'en_formacion' }),
        schedulesApi.listVenues({ is_active: true }),
        schedulesApi.listCampuses({ is_active: true }),
      ]);

      if (programsRes.success && programsRes.data) {
        setPrograms(programsRes.data.programs);
      }
      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data.groups);
      }
      if (venuesRes.success && venuesRes.data) {
        setVenues(venuesRes.data.venues);
      }
      if (campusesRes.success && campusesRes.data) {
        setCampuses(campusesRes.data.campuses);
      }

      setLastMasterDataFetchTime(Date.now());
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setLoadingMasterData(false);
    }
  }, [shouldRefetchMasterData, setLoadingMasterData, setPrograms, setGroups, setVenues, setCampuses, setLastMasterDataFetchTime]);

  /**
   * Crear nuevo horario
   */
  const createSchedule = useCallback(async (data: CreateScheduleRequest): Promise<Schedule | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validar primero
      const validationRes = await schedulesApi.validateSchedule(data);
      
      if (validationRes.success && validationRes.data && !validationRes.data.is_valid) {
        const conflictMessages = validationRes.data.conflicts.map(c => c.message).join(', ');
        setError(`Conflictos detectados: ${conflictMessages}`);
        return null;
      }

      // Crear el horario
      const response = await schedulesApi.createSchedule(data);

      if (response.success && response.data) {
        addSchedule(response.data.data);
        return response.data.data;
      } else {
        setError(response.message || 'Error al crear horario');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error creating schedule:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [addSchedule, setLoading, setError]);

  /**
   * Actualizar horario existente
   */
  const updateSchedule = useCallback(async (
    id: string,
    data: UpdateScheduleRequest
  ): Promise<Schedule | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await schedulesApi.updateSchedule(id, data);

      if (response.success && response.data) {
        updateScheduleInStore(id, response.data.data);
        return response.data.data;
      } else {
        setError(response.message || 'Error al actualizar horario');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error updating schedule:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateScheduleInStore, setLoading, setError]);

  /**
   * Eliminar horario
   */
  const deleteSchedule = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await schedulesApi.deleteSchedule(id);

      if (response.success) {
        removeSchedule(id);
        return true;
      } else {
        setError(response.message || 'Error al eliminar horario');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error deleting schedule:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [removeSchedule, setLoading, setError]);

  /**
   * Seleccionar horario para edición/visualización
   */
  const selectSchedule = useCallback((schedule: Schedule | null) => {
    setSelectedSchedule(schedule);
  }, [setSelectedSchedule]);

  /**
   * Refrescar todos los datos
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchSchedules(),
      fetchMasterData(),
    ]);
  }, [fetchSchedules, fetchMasterData]);

  // Efecto para carga inicial
  useEffect(() => {
    if (autoFetch && shouldRefetchSchedules()) {
      fetchSchedules();
    }
  }, [autoFetch, fetchSchedules, shouldRefetchSchedules]);

  useEffect(() => {
    if (loadMasterData && shouldRefetchMasterData()) {
      fetchMasterData();
    }
  }, [loadMasterData, fetchMasterData, shouldRefetchMasterData]);

  // Re-fetch cuando cambian los filtros o el rango de fechas
  useEffect(() => {
    if (autoFetch) {
      fetchSchedules();
    }
  }, [filters, visibleDateRange, autoFetch, fetchSchedules]);

  return {
    // Estado
    schedules: getFilteredSchedules(),
    selectedSchedule,
    isLoading: isLoading || isLoadingMasterData,
    error,
    
    // Datos maestros
    programs,
    groups,
    venues,
    campuses,
    
    // Acciones
    fetchSchedules,
    fetchMasterData,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    selectSchedule,
    refreshData,
  };
}

export default useScheduleData;
