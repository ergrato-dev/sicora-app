/**
 * SICORA - API Client para Horarios (ScheduleService)
 *
 * Funciones para comunicación con el backend Go (ScheduleService)
 * para operaciones de horarios, programas, fichas, ambientes y sedes.
 *
 * Endpoints manejados:
 * - CRUD /api/v1/schedules         - Horarios
 * - CRUD /api/v1/master-data/academic-programs
 * - CRUD /api/v1/master-data/academic-groups
 * - CRUD /api/v1/master-data/venues
 * - CRUD /api/v1/master-data/campuses
 *
 * @fileoverview Schedules API client
 * @module lib/api/schedules
 */

import { httpClient } from '../api-client';
import type { ApiResponse } from '@/types/auth.types';
import type {
  // Schedules
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ListSchedulesParams,
  SchedulesListResponse,
  ValidateScheduleResponse,
  InstructorScheduleStats,
  ResourceAvailability,
  // Programs
  AcademicProgram,
  CreateProgramRequest,
  UpdateProgramRequest,
  ListProgramsParams,
  ProgramsListResponse,
  // Groups (Fichas)
  AcademicGroup,
  CreateGroupRequest,
  UpdateGroupRequest,
  ListGroupsParams,
  GroupsListResponse,
  // Venues (Ambientes)
  Venue,
  CreateVenueRequest,
  UpdateVenueRequest,
  ListVenuesParams,
  VenuesListResponse,
  // Campuses (Sedes)
  Campus,
  CreateCampusRequest,
  UpdateCampusRequest,
  ListCampusesParams,
  CampusesListResponse,
} from '@/types/schedule.types';

/* =============================================================================
   ENDPOINTS
   ============================================================================= */

/**
 * Endpoints de horarios
 */
const SCHEDULE_ENDPOINTS = {
  // Schedules
  LIST: '/api/v1/schedules',
  DETAIL: (id: string) => `/api/v1/schedules/${id}`,
  CREATE: '/api/v1/schedules',
  UPDATE: (id: string) => `/api/v1/schedules/${id}`,
  DELETE: (id: string) => `/api/v1/schedules/${id}`,
  VALIDATE: '/api/v1/schedules/validate',
  INSTRUCTOR_STATS: (id: string) => `/api/v1/schedules/instructor/${id}/stats`,
  AVAILABILITY: '/api/v1/schedules/availability',
  
  // Programs
  PROGRAMS_LIST: '/api/v1/master-data/academic-programs',
  PROGRAMS_DETAIL: (id: string) => `/api/v1/master-data/academic-programs/${id}`,
  
  // Groups (Fichas)
  GROUPS_LIST: '/api/v1/master-data/academic-groups',
  GROUPS_DETAIL: (id: string) => `/api/v1/master-data/academic-groups/${id}`,
  
  // Venues (Ambientes)
  VENUES_LIST: '/api/v1/master-data/venues',
  VENUES_DETAIL: (id: string) => `/api/v1/master-data/venues/${id}`,
  
  // Campuses (Sedes)
  CAMPUSES_LIST: '/api/v1/master-data/campuses',
  CAMPUSES_DETAIL: (id: string) => `/api/v1/master-data/campuses/${id}`,
} as const;

/* =============================================================================
   HELPERS
   ============================================================================= */

/**
 * Construir query string genérico desde objeto de parámetros
 */
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/* =============================================================================
   SCHEDULES API
   ============================================================================= */

/**
 * Listar horarios con paginación y filtros
 *
 * @param params - Parámetros de búsqueda y filtrado
 * @returns Lista paginada de horarios
 *
 * @example
 * ```ts
 * const response = await schedulesApi.listSchedules({
 *   instructor_id: 'uuid',
 *   trimestre: 1,
 *   año: 2024
 * });
 * ```
 */
export async function listSchedules(
  params: ListSchedulesParams = {}
): Promise<ApiResponse<SchedulesListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<SchedulesListResponse>(`${SCHEDULE_ENDPOINTS.LIST}${queryString}`);
}

/**
 * Obtener horario por ID
 */
export async function getSchedule(id: string): Promise<ApiResponse<{ data: Schedule }>> {
  return httpClient.get<{ data: Schedule }>(SCHEDULE_ENDPOINTS.DETAIL(id));
}

/**
 * Crear nuevo horario
 */
export async function createSchedule(
  data: CreateScheduleRequest
): Promise<ApiResponse<{ message: string; data: Schedule }>> {
  return httpClient.post<{ message: string; data: Schedule }>(SCHEDULE_ENDPOINTS.CREATE, data);
}

/**
 * Actualizar horario existente
 */
export async function updateSchedule(
  id: string,
  data: UpdateScheduleRequest
): Promise<ApiResponse<{ message: string; data: Schedule }>> {
  return httpClient.put<{ message: string; data: Schedule }>(SCHEDULE_ENDPOINTS.UPDATE(id), data);
}

/**
 * Eliminar horario
 */
export async function deleteSchedule(id: string): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(SCHEDULE_ENDPOINTS.DELETE(id));
}

/**
 * Validar horario antes de crear/actualizar (detecta conflictos)
 */
export async function validateSchedule(
  data: CreateScheduleRequest
): Promise<ApiResponse<ValidateScheduleResponse>> {
  return httpClient.post<ValidateScheduleResponse>(SCHEDULE_ENDPOINTS.VALIDATE, data);
}

/**
 * Obtener estadísticas de horarios de un instructor
 */
export async function getInstructorScheduleStats(
  instructorId: string
): Promise<ApiResponse<InstructorScheduleStats>> {
  return httpClient.get<InstructorScheduleStats>(SCHEDULE_ENDPOINTS.INSTRUCTOR_STATS(instructorId));
}

/**
 * Consultar disponibilidad de recurso (instructor, ambiente, grupo)
 */
export async function checkAvailability(params: {
  resource_type: 'instructor' | 'venue' | 'group';
  resource_id: string;
  date: string;
}): Promise<ApiResponse<ResourceAvailability>> {
  const queryString = buildQueryString(params);
  return httpClient.get<ResourceAvailability>(`${SCHEDULE_ENDPOINTS.AVAILABILITY}${queryString}`);
}

/* =============================================================================
   ACADEMIC PROGRAMS API (Programas de Formación)
   ============================================================================= */

/**
 * Listar programas académicos
 */
export async function listPrograms(
  params: ListProgramsParams = {}
): Promise<ApiResponse<ProgramsListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<ProgramsListResponse>(`${SCHEDULE_ENDPOINTS.PROGRAMS_LIST}${queryString}`);
}

/**
 * Obtener programa por ID
 */
export async function getProgram(id: string): Promise<ApiResponse<{ data: AcademicProgram }>> {
  return httpClient.get<{ data: AcademicProgram }>(SCHEDULE_ENDPOINTS.PROGRAMS_DETAIL(id));
}

/**
 * Crear nuevo programa (solo admin)
 */
export async function createProgram(
  data: CreateProgramRequest
): Promise<ApiResponse<{ message: string; data: AcademicProgram }>> {
  return httpClient.post<{ message: string; data: AcademicProgram }>(
    SCHEDULE_ENDPOINTS.PROGRAMS_LIST,
    data
  );
}

/**
 * Actualizar programa existente (solo admin)
 */
export async function updateProgram(
  id: string,
  data: UpdateProgramRequest
): Promise<ApiResponse<{ message: string; data: AcademicProgram }>> {
  return httpClient.put<{ message: string; data: AcademicProgram }>(
    SCHEDULE_ENDPOINTS.PROGRAMS_DETAIL(id),
    data
  );
}

/**
 * Eliminar programa (solo admin)
 */
export async function deleteProgram(id: string): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(SCHEDULE_ENDPOINTS.PROGRAMS_DETAIL(id));
}

/* =============================================================================
   ACADEMIC GROUPS API (Fichas)
   ============================================================================= */

/**
 * Listar fichas/grupos académicos
 *
 * @example
 * ```ts
 * const response = await schedulesApi.listGroups({
 *   instructor_director_id: 'uuid',
 *   status: 'en_formacion'
 * });
 * ```
 */
export async function listGroups(
  params: ListGroupsParams = {}
): Promise<ApiResponse<GroupsListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<GroupsListResponse>(`${SCHEDULE_ENDPOINTS.GROUPS_LIST}${queryString}`);
}

/**
 * Obtener ficha por ID
 */
export async function getGroup(id: string): Promise<ApiResponse<{ data: AcademicGroup }>> {
  return httpClient.get<{ data: AcademicGroup }>(SCHEDULE_ENDPOINTS.GROUPS_DETAIL(id));
}

/**
 * Crear nueva ficha (solo admin/coordinador)
 */
export async function createGroup(
  data: CreateGroupRequest
): Promise<ApiResponse<{ message: string; data: AcademicGroup }>> {
  return httpClient.post<{ message: string; data: AcademicGroup }>(
    SCHEDULE_ENDPOINTS.GROUPS_LIST,
    data
  );
}

/**
 * Actualizar ficha existente
 */
export async function updateGroup(
  id: string,
  data: UpdateGroupRequest
): Promise<ApiResponse<{ message: string; data: AcademicGroup }>> {
  return httpClient.put<{ message: string; data: AcademicGroup }>(
    SCHEDULE_ENDPOINTS.GROUPS_DETAIL(id),
    data
  );
}

/**
 * Eliminar ficha (solo admin)
 */
export async function deleteGroup(id: string): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(SCHEDULE_ENDPOINTS.GROUPS_DETAIL(id));
}

/* =============================================================================
   VENUES API (Ambientes)
   ============================================================================= */

/**
 * Listar ambientes
 */
export async function listVenues(
  params: ListVenuesParams = {}
): Promise<ApiResponse<VenuesListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<VenuesListResponse>(`${SCHEDULE_ENDPOINTS.VENUES_LIST}${queryString}`);
}

/**
 * Obtener ambiente por ID
 */
export async function getVenue(id: string): Promise<ApiResponse<{ data: Venue }>> {
  return httpClient.get<{ data: Venue }>(SCHEDULE_ENDPOINTS.VENUES_DETAIL(id));
}

/**
 * Crear nuevo ambiente (solo admin)
 */
export async function createVenue(
  data: CreateVenueRequest
): Promise<ApiResponse<{ message: string; data: Venue }>> {
  return httpClient.post<{ message: string; data: Venue }>(SCHEDULE_ENDPOINTS.VENUES_LIST, data);
}

/**
 * Actualizar ambiente existente
 */
export async function updateVenue(
  id: string,
  data: UpdateVenueRequest
): Promise<ApiResponse<{ message: string; data: Venue }>> {
  return httpClient.put<{ message: string; data: Venue }>(SCHEDULE_ENDPOINTS.VENUES_DETAIL(id), data);
}

/**
 * Eliminar ambiente (solo admin)
 */
export async function deleteVenue(id: string): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(SCHEDULE_ENDPOINTS.VENUES_DETAIL(id));
}

/* =============================================================================
   CAMPUSES API (Sedes)
   ============================================================================= */

/**
 * Listar sedes
 */
export async function listCampuses(
  params: ListCampusesParams = {}
): Promise<ApiResponse<CampusesListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<CampusesListResponse>(`${SCHEDULE_ENDPOINTS.CAMPUSES_LIST}${queryString}`);
}

/**
 * Obtener sede por ID
 */
export async function getCampus(id: string): Promise<ApiResponse<{ data: Campus }>> {
  return httpClient.get<{ data: Campus }>(SCHEDULE_ENDPOINTS.CAMPUSES_DETAIL(id));
}

/**
 * Crear nueva sede (solo admin)
 */
export async function createCampus(
  data: CreateCampusRequest
): Promise<ApiResponse<{ message: string; data: Campus }>> {
  return httpClient.post<{ message: string; data: Campus }>(SCHEDULE_ENDPOINTS.CAMPUSES_LIST, data);
}

/**
 * Actualizar sede existente
 */
export async function updateCampus(
  id: string,
  data: UpdateCampusRequest
): Promise<ApiResponse<{ message: string; data: Campus }>> {
  return httpClient.put<{ message: string; data: Campus }>(
    SCHEDULE_ENDPOINTS.CAMPUSES_DETAIL(id),
    data
  );
}

/**
 * Eliminar sede (solo admin)
 */
export async function deleteCampus(id: string): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(SCHEDULE_ENDPOINTS.CAMPUSES_DETAIL(id));
}

/* =============================================================================
   EXPORT AGRUPADO
   ============================================================================= */

/**
 * API de Horarios (ScheduleService)
 */
export const schedulesApi = {
  // Schedules
  listSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  validateSchedule,
  getInstructorScheduleStats,
  checkAvailability,
  
  // Programs
  listPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  
  // Groups (Fichas)
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  
  // Venues (Ambientes)
  listVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  
  // Campuses (Sedes)
  listCampuses,
  getCampus,
  createCampus,
  updateCampus,
  deleteCampus,
};

export default schedulesApi;
