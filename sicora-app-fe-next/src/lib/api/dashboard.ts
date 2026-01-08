/**
 * SICORA - API Client del Dashboard
 *
 * Funciones para obtener datos del dashboard desde el backend Go.
 * Implementa manejo robusto de errores según MANEJO_DE_ERRORES.md
 *
 * @fileoverview Dashboard API client
 * @module lib/api/dashboard
 */

import { httpClient, type ApiResponse } from '../http-client';
import type {
  // Métricas
  StudentDashboardMetrics,
  InstructorDashboardMetrics,
  AdminDashboardMetrics,
  // Resúmenes
  UsersSummary,
  StudentAttendanceSummary,
  InstructorAttendanceSummary,
  GlobalAttendanceSummary,
  SchedulesSummary,
  AlertsSummary,
  PendingJustificationsSummary,
  // Entidades
  User,
  UserDetails,
  TodaySchedule,
  ScheduleWithDetails,
  AttendanceRecord,
  Alert,
  Justification,
  JustificationWithDetails,
  ActivityItem,
  AcademicGroup,
  // Filtros
  UsersFilter,
  SchedulesFilter,
  AttendanceFilter,
  AlertsFilter,
  // Tipos
  UserRole,
  Pagination,
} from '@/types/dashboard.types';

// ============================================================================
// TIPOS DE RESPUESTA
// ============================================================================

/**
 * Respuesta paginada
 */
interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ============================================================================
// USUARIOS
// ============================================================================

/**
 * Obtener usuario actual con detalles
 */
export async function getCurrentUser(): Promise<ApiResponse<UserDetails>> {
  return httpClient.get<UserDetails>('/api/v1/users/me');
}

/**
 * Obtener resumen de usuarios (admin)
 */
export async function getUsersSummary(): Promise<ApiResponse<UsersSummary>> {
  return httpClient.get<UsersSummary>('/api/v1/users/summary');
}

/**
 * Listar usuarios con filtros
 */
export async function getUsers(
  filters?: UsersFilter
): Promise<ApiResponse<PaginatedResponse<User>>> {
  const params = new URLSearchParams();

  if (filters?.search) params.append('search', filters.search);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.coordination_id)
    params.append('coordination_id', filters.coordination_id);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = `/api/v1/users${queryString ? `?${queryString}` : ''}`;

  return httpClient.get<PaginatedResponse<User>>(url);
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(
  id: string
): Promise<ApiResponse<UserDetails>> {
  return httpClient.get<UserDetails>(`/api/v1/users/${id}`);
}

// ============================================================================
// HORARIOS
// ============================================================================

/**
 * Obtener horario del día actual
 */
export async function getTodaySchedule(
  userId?: string
): Promise<ApiResponse<TodaySchedule[]>> {
  const params = userId ? `?user_id=${userId}` : '';
  return httpClient.get<TodaySchedule[]>(`/api/v1/schedules/today${params}`);
}

/**
 * Obtener resumen de horarios (admin)
 */
export async function getSchedulesSummary(): Promise<
  ApiResponse<SchedulesSummary>
> {
  return httpClient.get<SchedulesSummary>('/api/v1/schedules/summary');
}

/**
 * Listar horarios con filtros
 */
export async function getSchedules(
  filters?: SchedulesFilter
): Promise<ApiResponse<PaginatedResponse<ScheduleWithDetails>>> {
  const params = new URLSearchParams();

  if (filters?.instructor_id)
    params.append('instructor_id', filters.instructor_id);
  if (filters?.academic_group_id)
    params.append('academic_group_id', filters.academic_group_id);
  if (filters?.venue_id) params.append('venue_id', filters.venue_id);
  if (filters?.day_of_week) params.append('day_of_week', filters.day_of_week);
  if (filters?.date) params.append('date', filters.date);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = `/api/v1/schedules${queryString ? `?${queryString}` : ''}`;

  return httpClient.get<PaginatedResponse<ScheduleWithDetails>>(url);
}

/**
 * Obtener fichas del instructor
 */
export async function getInstructorFichas(
  instructorId: string
): Promise<ApiResponse<AcademicGroup[]>> {
  return httpClient.get<AcademicGroup[]>(
    `/api/v1/schedules/instructor/${instructorId}/fichas`
  );
}

// ============================================================================
// ASISTENCIA
// ============================================================================

/**
 * Obtener resumen de asistencia del estudiante
 */
export async function getStudentAttendanceSummary(
  studentId?: string
): Promise<ApiResponse<StudentAttendanceSummary>> {
  const params = studentId ? `?student_id=${studentId}` : '';
  return httpClient.get<StudentAttendanceSummary>(
    `/api/v1/attendance/summary/student${params}`
  );
}

/**
 * Obtener resumen de asistencia del instructor
 */
export async function getInstructorAttendanceSummary(
  instructorId?: string
): Promise<ApiResponse<InstructorAttendanceSummary>> {
  const params = instructorId ? `?instructor_id=${instructorId}` : '';
  return httpClient.get<InstructorAttendanceSummary>(
    `/api/v1/attendance/summary/instructor${params}`
  );
}

/**
 * Obtener resumen global de asistencia (admin)
 */
export async function getGlobalAttendanceSummary(): Promise<
  ApiResponse<GlobalAttendanceSummary>
> {
  return httpClient.get<GlobalAttendanceSummary>('/api/v1/attendance/summary');
}

/**
 * Obtener historial de asistencia
 */
export async function getAttendanceHistory(
  filters?: AttendanceFilter
): Promise<ApiResponse<PaginatedResponse<AttendanceRecord>>> {
  const params = new URLSearchParams();

  if (filters?.student_id) params.append('student_id', filters.student_id);
  if (filters?.instructor_id)
    params.append('instructor_id', filters.instructor_id);
  if (filters?.academic_group_id)
    params.append('academic_group_id', filters.academic_group_id);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = `/api/v1/attendance/history${
    queryString ? `?${queryString}` : ''
  }`;

  return httpClient.get<PaginatedResponse<AttendanceRecord>>(url);
}

// ============================================================================
// ALERTAS
// ============================================================================

/**
 * Obtener alertas del usuario actual
 */
export async function getMyAlerts(
  filters?: AlertsFilter
): Promise<ApiResponse<PaginatedResponse<Alert>>> {
  const params = new URLSearchParams();

  if (filters?.type) params.append('type', filters.type);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.read !== undefined)
    params.append('read', filters.read.toString());
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = `/api/v1/alerts/user${queryString ? `?${queryString}` : ''}`;

  return httpClient.get<PaginatedResponse<Alert>>(url);
}

/**
 * Obtener resumen de alertas (admin)
 */
export async function getAlertsSummary(): Promise<ApiResponse<AlertsSummary>> {
  return httpClient.get<AlertsSummary>('/api/v1/alerts/stats');
}

/**
 * Obtener contador de alertas no leídas
 */
export async function getUnreadAlertsCount(): Promise<
  ApiResponse<{ count: number }>
> {
  return httpClient.get<{ count: number }>('/api/v1/alerts/unread-count');
}

/**
 * Marcar alerta como leída
 */
export async function markAlertAsRead(
  alertId: string
): Promise<ApiResponse<Alert>> {
  return httpClient.post<Alert>(`/api/v1/alerts/${alertId}/read`);
}

/**
 * Marcar todas las alertas como leídas
 */
export async function markAllAlertsAsRead(): Promise<ApiResponse<void>> {
  return httpClient.post<void>('/api/v1/alerts/read-all');
}

// ============================================================================
// JUSTIFICACIONES
// ============================================================================

/**
 * Obtener justificaciones pendientes (instructor/admin)
 */
export async function getPendingJustifications(): Promise<
  ApiResponse<PaginatedResponse<JustificationWithDetails>>
> {
  return httpClient.get<PaginatedResponse<JustificationWithDetails>>(
    '/api/v1/justifications/pending'
  );
}

/**
 * Obtener resumen de justificaciones pendientes
 */
export async function getPendingJustificationsSummary(): Promise<
  ApiResponse<PendingJustificationsSummary>
> {
  return httpClient.get<PendingJustificationsSummary>(
    '/api/v1/justifications/pending/summary'
  );
}

/**
 * Obtener justificaciones del usuario
 */
export async function getMyJustifications(): Promise<
  ApiResponse<PaginatedResponse<Justification>>
> {
  return httpClient.get<PaginatedResponse<Justification>>(
    '/api/v1/justifications/user'
  );
}

// ============================================================================
// ACTIVIDAD RECIENTE
// ============================================================================

/**
 * Obtener actividad reciente (admin)
 */
export async function getRecentActivity(
  limit: number = 10
): Promise<ApiResponse<ActivityItem[]>> {
  return httpClient.get<ActivityItem[]>(
    `/api/v1/activity/recent?limit=${limit}`
  );
}

// ============================================================================
// MÉTRICAS CONSOLIDADAS POR ROL
// ============================================================================

/**
 * Obtener métricas del dashboard según el rol del usuario
 */
export async function getDashboardMetrics(
  role: UserRole
): Promise<
  ApiResponse<
    StudentDashboardMetrics | InstructorDashboardMetrics | AdminDashboardMetrics
  >
> {
  switch (role) {
    case 'aprendiz':
      return httpClient.get<StudentDashboardMetrics>(
        '/api/v1/dashboard/student'
      );
    case 'instructor':
      return httpClient.get<InstructorDashboardMetrics>(
        '/api/v1/dashboard/instructor'
      );
    case 'admin':
    case 'coordinador':
    case 'administrativo':
      return httpClient.get<AdminDashboardMetrics>('/api/v1/dashboard/admin');
    default:
      return httpClient.get<AdminDashboardMetrics>('/api/v1/dashboard/admin');
  }
}

/**
 * Obtener métricas de dashboard de estudiante
 */
export async function getStudentDashboardMetrics(): Promise<
  ApiResponse<StudentDashboardMetrics>
> {
  return httpClient.get<StudentDashboardMetrics>('/api/v1/dashboard/student');
}

/**
 * Obtener métricas de dashboard de instructor
 */
export async function getInstructorDashboardMetrics(): Promise<
  ApiResponse<InstructorDashboardMetrics>
> {
  return httpClient.get<InstructorDashboardMetrics>(
    '/api/v1/dashboard/instructor'
  );
}

/**
 * Obtener métricas de dashboard de admin
 */
export async function getAdminDashboardMetrics(): Promise<
  ApiResponse<AdminDashboardMetrics>
> {
  return httpClient.get<AdminDashboardMetrics>('/api/v1/dashboard/admin');
}

// ============================================================================
// EXPORT DEL MÓDULO
// ============================================================================

export const dashboardApi = {
  // Usuarios
  getCurrentUser,
  getUsersSummary,
  getUsers,
  getUserById,

  // Horarios
  getTodaySchedule,
  getSchedulesSummary,
  getSchedules,
  getInstructorFichas,

  // Asistencia
  getStudentAttendanceSummary,
  getInstructorAttendanceSummary,
  getGlobalAttendanceSummary,
  getAttendanceHistory,

  // Alertas
  getMyAlerts,
  getAlertsSummary,
  getUnreadAlertsCount,
  markAlertAsRead,
  markAllAlertsAsRead,

  // Justificaciones
  getPendingJustifications,
  getPendingJustificationsSummary,
  getMyJustifications,

  // Actividad
  getRecentActivity,

  // Métricas consolidadas
  getDashboardMetrics,
  getStudentDashboardMetrics,
  getInstructorDashboardMetrics,
  getAdminDashboardMetrics,
};

export default dashboardApi;
