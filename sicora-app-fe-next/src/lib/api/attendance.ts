/**
 * SICORA - API Client para Asistencia (AttendanceService)
 *
 * Funciones para comunicación con el backend Go (AttendanceService)
 * para operaciones de asistencia, QR, justificaciones y alertas.
 *
 * Endpoints manejados:
 * - CRUD /api/v1/attendance          - Asistencia
 * - POST /api/v1/attendance/qr       - Generar QR
 * - POST /api/v1/attendance/qr/scan  - Escanear QR
 * - POST /api/v1/attendance/bulk     - Registro masivo
 * - GET  /api/v1/attendance/history  - Historial
 * - GET  /api/v1/attendance/summary  - Resumen
 * - CRUD /api/v1/justifications      - Justificaciones
 * - GET  /api/v1/alerts              - Alertas
 *
 * @fileoverview Attendance API client
 * @module lib/api/attendance
 */

import { httpClient } from '../api-client';
import type { ApiResponse } from '@/types/auth.types';
import type {
  // Attendance
  AttendanceRecord,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  BulkAttendanceRequest,
  BulkAttendanceResponse,
  ListAttendanceParams,
  AttendanceListResponse,
  // QR
  AttendanceQRCode,
  GenerateQRRequest,
  ScanQRRequest,
  ScanQRResponse,
  // Justifications
  Justification,
  CreateJustificationRequest,
  ReviewJustificationRequest,
  ListJustificationsParams,
  JustificationsListResponse,
  // Alerts
  AttendanceAlert,
  ListAlertsParams,
  AlertsListResponse,
  ResolveAlertRequest,
  // History & Summary
  StudentAttendanceHistory,
  GroupAttendanceSummary,
  AttendanceHistoryParams,
  AttendanceSummaryParams,
} from '@/types/attendance.types';

/* =============================================================================
   ENDPOINTS
   ============================================================================= */

/**
 * Endpoints de asistencia
 */
const ATTENDANCE_ENDPOINTS = {
  // Attendance CRUD
  LIST: '/api/v1/attendance',
  DETAIL: (id: string) => `/api/v1/attendance/${id}`,
  CREATE: '/api/v1/attendance',
  UPDATE: (id: string) => `/api/v1/attendance/${id}`,
  DELETE: (id: string) => `/api/v1/attendance/${id}`,
  
  // Bulk operations
  BULK: '/api/v1/attendance/bulk',
  
  // QR operations
  QR_GENERATE: '/api/v1/attendance/qr',
  QR_SCAN: '/api/v1/attendance/qr/scan',
  QR_STATUS: (id: string) => `/api/v1/attendance/qr/${id}`,
  
  // History & Summary
  HISTORY: '/api/v1/attendance/history',
  SUMMARY: '/api/v1/attendance/summary',
  STUDENT_HISTORY: (id: string) => `/api/v1/attendance/student/${id}/history`,
  GROUP_SUMMARY: (id: string) => `/api/v1/attendance/group/${id}/summary`,
  
  // Justifications
  JUSTIFICATIONS_LIST: '/api/v1/justifications',
  JUSTIFICATIONS_DETAIL: (id: string) => `/api/v1/justifications/${id}`,
  JUSTIFICATIONS_REVIEW: (id: string) => `/api/v1/justifications/${id}/review`,
  
  // Alerts
  ALERTS_LIST: '/api/v1/alerts',
  ALERTS_DETAIL: (id: string) => `/api/v1/alerts/${id}`,
  ALERTS_RESOLVE: (id: string) => `/api/v1/alerts/${id}/resolve`,
  ALERTS_MARK_READ: (id: string) => `/api/v1/alerts/${id}/read`,
  ALERTS_ACTIVE: '/api/v1/alerts/active',
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
   ATTENDANCE CRUD API
   ============================================================================= */

/**
 * Listar registros de asistencia con paginación y filtros
 *
 * @param params - Parámetros de búsqueda y filtrado
 * @returns Lista paginada de registros de asistencia
 *
 * @example
 * ```ts
 * const response = await attendanceApi.listAttendance({
 *   academic_group_id: 'uuid',
 *   date: '2024-01-15'
 * });
 * ```
 */
export async function listAttendance(
  params: ListAttendanceParams = {}
): Promise<ApiResponse<AttendanceListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<AttendanceListResponse>(`${ATTENDANCE_ENDPOINTS.LIST}${queryString}`);
}

/**
 * Obtener registro de asistencia por ID
 */
export async function getAttendance(id: string): Promise<ApiResponse<{ data: AttendanceRecord }>> {
  return httpClient.get<{ data: AttendanceRecord }>(ATTENDANCE_ENDPOINTS.DETAIL(id));
}

/**
 * Crear nuevo registro de asistencia
 */
export async function createAttendance(
  data: CreateAttendanceRequest
): Promise<ApiResponse<{ message: string; data: AttendanceRecord }>> {
  return httpClient.post<{ message: string; data: AttendanceRecord }>(
    ATTENDANCE_ENDPOINTS.CREATE,
    data
  );
}

/**
 * Actualizar registro de asistencia existente
 */
export async function updateAttendance(
  id: string,
  data: UpdateAttendanceRequest
): Promise<ApiResponse<{ message: string; data: AttendanceRecord }>> {
  return httpClient.put<{ message: string; data: AttendanceRecord }>(
    ATTENDANCE_ENDPOINTS.UPDATE(id),
    data
  );
}

/**
 * Eliminar registro de asistencia
 */
export async function deleteAttendance(id: string): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(ATTENDANCE_ENDPOINTS.DELETE(id));
}

/* =============================================================================
   BULK OPERATIONS API
   ============================================================================= */

/**
 * Registro masivo de asistencia para una clase
 *
 * @param data - Lista de estudiantes con su estado de asistencia
 * @returns Resultado del registro masivo
 *
 * @example
 * ```ts
 * const response = await attendanceApi.bulkAttendance({
 *   schedule_id: 'uuid',
 *   academic_group_id: 'uuid',
 *   date: '2024-01-15',
 *   records: [
 *     { student_id: 'uuid1', status: 'presente' },
 *     { student_id: 'uuid2', status: 'ausente' },
 *   ]
 * });
 * ```
 */
export async function bulkAttendance(
  data: BulkAttendanceRequest
): Promise<ApiResponse<BulkAttendanceResponse>> {
  return httpClient.post<BulkAttendanceResponse>(ATTENDANCE_ENDPOINTS.BULK, data);
}

/* =============================================================================
   QR OPERATIONS API
   ============================================================================= */

/**
 * Generar código QR para toma de asistencia
 *
 * @param data - Configuración del código QR
 * @returns Código QR generado con token de validación
 *
 * @example
 * ```ts
 * const response = await attendanceApi.generateQR({
 *   schedule_id: 'uuid',
 *   academic_group_id: 'uuid',
 *   duration_minutes: 30,
 *   require_location: true
 * });
 * // Mostrar response.data.qr_code en pantalla
 * ```
 */
export async function generateQR(
  data: GenerateQRRequest
): Promise<ApiResponse<{ message: string; data: AttendanceQRCode }>> {
  return httpClient.post<{ message: string; data: AttendanceQRCode }>(
    ATTENDANCE_ENDPOINTS.QR_GENERATE,
    data
  );
}

/**
 * Escanear código QR (desde app móvil del aprendiz)
 *
 * @param data - Token del QR y datos del estudiante
 * @returns Resultado del escaneo
 */
export async function scanQR(data: ScanQRRequest): Promise<ApiResponse<ScanQRResponse>> {
  return httpClient.post<ScanQRResponse>(ATTENDANCE_ENDPOINTS.QR_SCAN, data);
}

/**
 * Obtener estado actual de un código QR
 */
export async function getQRStatus(id: string): Promise<ApiResponse<{ data: AttendanceQRCode }>> {
  return httpClient.get<{ data: AttendanceQRCode }>(ATTENDANCE_ENDPOINTS.QR_STATUS(id));
}

/* =============================================================================
   HISTORY & SUMMARY API
   ============================================================================= */

/**
 * Obtener historial de asistencia
 */
export async function getAttendanceHistory(
  params: AttendanceHistoryParams
): Promise<ApiResponse<StudentAttendanceHistory[]>> {
  const queryString = buildQueryString(params);
  return httpClient.get<StudentAttendanceHistory[]>(`${ATTENDANCE_ENDPOINTS.HISTORY}${queryString}`);
}

/**
 * Obtener historial de asistencia de un estudiante específico
 */
export async function getStudentHistory(
  studentId: string,
  params: AttendanceHistoryParams = {}
): Promise<ApiResponse<StudentAttendanceHistory>> {
  const queryString = buildQueryString(params);
  return httpClient.get<StudentAttendanceHistory>(
    `${ATTENDANCE_ENDPOINTS.STUDENT_HISTORY(studentId)}${queryString}`
  );
}

/**
 * Obtener resumen de asistencia
 */
export async function getAttendanceSummary(
  params: AttendanceSummaryParams
): Promise<ApiResponse<GroupAttendanceSummary[]>> {
  const queryString = buildQueryString(params);
  return httpClient.get<GroupAttendanceSummary[]>(`${ATTENDANCE_ENDPOINTS.SUMMARY}${queryString}`);
}

/**
 * Obtener resumen de asistencia de un grupo específico
 */
export async function getGroupSummary(
  groupId: string,
  params: AttendanceSummaryParams = {}
): Promise<ApiResponse<GroupAttendanceSummary>> {
  const queryString = buildQueryString(params);
  return httpClient.get<GroupAttendanceSummary>(
    `${ATTENDANCE_ENDPOINTS.GROUP_SUMMARY(groupId)}${queryString}`
  );
}

/* =============================================================================
   JUSTIFICATIONS API
   ============================================================================= */

/**
 * Listar justificaciones
 */
export async function listJustifications(
  params: ListJustificationsParams = {}
): Promise<ApiResponse<JustificationsListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<JustificationsListResponse>(
    `${ATTENDANCE_ENDPOINTS.JUSTIFICATIONS_LIST}${queryString}`
  );
}

/**
 * Obtener justificación por ID
 */
export async function getJustification(id: string): Promise<ApiResponse<{ data: Justification }>> {
  return httpClient.get<{ data: Justification }>(ATTENDANCE_ENDPOINTS.JUSTIFICATIONS_DETAIL(id));
}

/**
 * Crear nueva justificación (por estudiante o instructor)
 */
export async function createJustification(
  data: CreateJustificationRequest
): Promise<ApiResponse<{ message: string; data: Justification }>> {
  return httpClient.post<{ message: string; data: Justification }>(
    ATTENDANCE_ENDPOINTS.JUSTIFICATIONS_LIST,
    data
  );
}

/**
 * Revisar justificación (aprobar/rechazar) - solo instructor
 */
export async function reviewJustification(
  id: string,
  data: ReviewJustificationRequest
): Promise<ApiResponse<{ message: string; data: Justification }>> {
  return httpClient.put<{ message: string; data: Justification }>(
    ATTENDANCE_ENDPOINTS.JUSTIFICATIONS_REVIEW(id),
    data
  );
}

/**
 * Eliminar justificación (solo si está pendiente)
 */
export async function deleteJustification(id: string): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(ATTENDANCE_ENDPOINTS.JUSTIFICATIONS_DETAIL(id));
}

/* =============================================================================
   ALERTS API
   ============================================================================= */

/**
 * Listar alertas de asistencia
 */
export async function listAlerts(
  params: ListAlertsParams = {}
): Promise<ApiResponse<AlertsListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<AlertsListResponse>(`${ATTENDANCE_ENDPOINTS.ALERTS_LIST}${queryString}`);
}

/**
 * Obtener alertas activas (no leídas o no resueltas)
 */
export async function getActiveAlerts(params: {
  academic_group_id?: string;
  instructor_id?: string;
} = {}): Promise<ApiResponse<AlertsListResponse>> {
  const queryString = buildQueryString(params);
  return httpClient.get<AlertsListResponse>(`${ATTENDANCE_ENDPOINTS.ALERTS_ACTIVE}${queryString}`);
}

/**
 * Obtener alerta por ID
 */
export async function getAlert(id: string): Promise<ApiResponse<{ data: AttendanceAlert }>> {
  return httpClient.get<{ data: AttendanceAlert }>(ATTENDANCE_ENDPOINTS.ALERTS_DETAIL(id));
}

/**
 * Marcar alerta como leída
 */
export async function markAlertAsRead(
  id: string
): Promise<ApiResponse<{ message: string; data: AttendanceAlert }>> {
  return httpClient.put<{ message: string; data: AttendanceAlert }>(
    ATTENDANCE_ENDPOINTS.ALERTS_MARK_READ(id),
    {}
  );
}

/**
 * Resolver alerta
 */
export async function resolveAlert(
  id: string,
  data: ResolveAlertRequest = {}
): Promise<ApiResponse<{ message: string; data: AttendanceAlert }>> {
  return httpClient.put<{ message: string; data: AttendanceAlert }>(
    ATTENDANCE_ENDPOINTS.ALERTS_RESOLVE(id),
    data
  );
}

/* =============================================================================
   EXPORT AGRUPADO
   ============================================================================= */

/**
 * API de Asistencia (AttendanceService)
 */
export const attendanceApi = {
  // Attendance CRUD
  listAttendance,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  
  // Bulk operations
  bulkAttendance,
  
  // QR operations
  generateQR,
  scanQR,
  getQRStatus,
  
  // History & Summary
  getAttendanceHistory,
  getStudentHistory,
  getAttendanceSummary,
  getGroupSummary,
  
  // Justifications
  listJustifications,
  getJustification,
  createJustification,
  reviewJustification,
  deleteJustification,
  
  // Alerts
  listAlerts,
  getActiveAlerts,
  getAlert,
  markAlertAsRead,
  resolveAlert,
};

export default attendanceApi;
