/**
 * API Client para Horarios
 */

import { apiClient } from './client';
import type {
  Schedule,
  ScheduleListResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleFilters,
  SchedulePaginationParams,
  ScheduleStats,
  AmbienteAvailability,
  ScheduleConflict,
} from '../../types/schedule.types';

const BASE_PATH = '/api/v1/schedules';

export const schedulesApi = {
  /**
   * Obtener listado de horarios con paginación y filtros
   */
  getSchedules: async (
    filters?: ScheduleFilters,
    pagination?: SchedulePaginationParams
  ): Promise<ScheduleListResponse> => {
    const params = new URLSearchParams();

    // Agregar filtros
    if (filters) {
      if (filters.instructor_id) params.append('instructor_id', filters.instructor_id);
      if (filters.ficha_id) params.append('ficha_id', filters.ficha_id);
      if (filters.ambiente_id) params.append('ambiente_id', filters.ambiente_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.day_of_week) params.append('day_of_week', filters.day_of_week);
    }

    // Agregar paginación
    if (pagination) {
      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.page_size) params.append('page_size', pagination.page_size.toString());
      if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
      if (pagination.sort_order) params.append('sort_order', pagination.sort_order);
    }

    const response = await apiClient.get<ScheduleListResponse>(`${BASE_PATH}?${params}`);
    return response.data;
  },

  /**
   * Obtener horarios por rango de fechas (para calendario)
   */
  getSchedulesByDateRange: async (
    dateFrom: string,
    dateTo: string,
    filters?: Omit<ScheduleFilters, 'date_from' | 'date_to'>
  ): Promise<Schedule[]> => {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
    });

    if (filters) {
      if (filters.instructor_id) params.append('instructor_id', filters.instructor_id);
      if (filters.ficha_id) params.append('ficha_id', filters.ficha_id);
      if (filters.ambiente_id) params.append('ambiente_id', filters.ambiente_id);
      if (filters.status) params.append('status', filters.status);
    }

    const response = await apiClient.get<{ data: Schedule[] }>(`${BASE_PATH}/calendar?${params}`);
    return response.data.data;
  },

  /**
   * Obtener horario por ID
   */
  getScheduleById: async (id: string): Promise<Schedule> => {
    const response = await apiClient.get<Schedule>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo horario
   */
  createSchedule: async (data: CreateScheduleRequest): Promise<Schedule> => {
    const response = await apiClient.post<Schedule>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualizar horario existente
   */
  updateSchedule: async (id: string, data: UpdateScheduleRequest): Promise<Schedule> => {
    const response = await apiClient.put<Schedule>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar horario
   */
  deleteSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Cancelar horario
   */
  cancelSchedule: async (id: string, reason?: string): Promise<Schedule> => {
    const response = await apiClient.post<Schedule>(`${BASE_PATH}/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Completar horario
   */
  completeSchedule: async (id: string, notes?: string): Promise<Schedule> => {
    const response = await apiClient.post<Schedule>(`${BASE_PATH}/${id}/complete`, { notes });
    return response.data;
  },

  /**
   * Verificar conflictos de horario
   */
  checkConflicts: async (data: CreateScheduleRequest): Promise<ScheduleConflict[]> => {
    const response = await apiClient.post<{ conflicts: ScheduleConflict[] }>(
      `${BASE_PATH}/check-conflicts`,
      data
    );
    return response.data.conflicts;
  },

  /**
   * Obtener disponibilidad de ambiente
   */
  getAmbienteAvailability: async (
    ambienteId: string,
    date: string
  ): Promise<AmbienteAvailability> => {
    const response = await apiClient.get<AmbienteAvailability>(
      `${BASE_PATH}/availability/ambiente/${ambienteId}?date=${date}`
    );
    return response.data;
  },

  /**
   * Obtener disponibilidad de instructor
   */
  getInstructorAvailability: async (
    instructorId: string,
    date: string
  ): Promise<AmbienteAvailability> => {
    const response = await apiClient.get<AmbienteAvailability>(
      `${BASE_PATH}/availability/instructor/${instructorId}?date=${date}`
    );
    return response.data;
  },

  /**
   * Obtener estadísticas de horarios
   */
  getStats: async (dateFrom?: string, dateTo?: string): Promise<ScheduleStats> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const response = await apiClient.get<ScheduleStats>(`${BASE_PATH}/stats?${params}`);
    return response.data;
  },

  /**
   * Duplicar horario a otras fechas
   */
  duplicateSchedule: async (
    id: string,
    targetDates: string[]
  ): Promise<{ created: Schedule[]; conflicts: ScheduleConflict[] }> => {
    const response = await apiClient.post<{ created: Schedule[]; conflicts: ScheduleConflict[] }>(
      `${BASE_PATH}/${id}/duplicate`,
      { target_dates: targetDates }
    );
    return response.data;
  },

  /**
   * Generar horarios recurrentes
   */
  generateRecurring: async (
    data: CreateScheduleRequest & { end_date: string }
  ): Promise<{ created: Schedule[]; conflicts: ScheduleConflict[] }> => {
    const response = await apiClient.post<{ created: Schedule[]; conflicts: ScheduleConflict[] }>(
      `${BASE_PATH}/generate-recurring`,
      data
    );
    return response.data;
  },

  /**
   * Exportar horarios
   */
  exportSchedules: async (
    filters: ScheduleFilters,
    format: 'csv' | 'pdf' | 'excel' = 'csv'
  ): Promise<Blob> => {
    const params = new URLSearchParams({ format });

    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.instructor_id) params.append('instructor_id', filters.instructor_id);
    if (filters.ficha_id) params.append('ficha_id', filters.ficha_id);
    if (filters.ambiente_id) params.append('ambiente_id', filters.ambiente_id);

    const response = await apiClient.get(`${BASE_PATH}/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
