/**
 * API Client para Alertas
 * Sistema de notificaciones y alertas
 */

import { httpClient, buildQueryString } from './client';
import type {
  Alert,
  AlertSummary,
  AlertStats,
  AlertCounts,
  CreateAlertRequest,
  UpdateAlertRequest,
  MarkReadRequest,
  ArchiveAlertsRequest,
  DismissAlertsRequest,
  ListAlertsParams,
  PaginatedAlerts,
} from '@/types/alert.types';

const BASE_PATH = '/api/v1/alerts';

// ============================================================================
// CRUD BÁSICO
// ============================================================================

/**
 * Crear nueva alerta (solo admin/sistema)
 */
export async function createAlert(data: CreateAlertRequest): Promise<Alert> {
  return httpClient.post<Alert>(BASE_PATH, data);
}

/**
 * Obtener alerta por ID
 */
export async function getAlert(id: string): Promise<Alert> {
  return httpClient.get<Alert>(`${BASE_PATH}/${id}`);
}

/**
 * Actualizar alerta
 */
export async function updateAlert(
  id: string,
  data: UpdateAlertRequest
): Promise<Alert> {
  return httpClient.put<Alert>(`${BASE_PATH}/${id}`, data);
}

/**
 * Eliminar alerta
 */
export async function deleteAlert(id: string): Promise<void> {
  return httpClient.delete(`${BASE_PATH}/${id}`);
}

// ============================================================================
// CONSULTAS Y LISTADOS
// ============================================================================

/**
 * Listar alertas con filtros y paginación
 */
export async function listAlerts(
  params?: ListAlertsParams
): Promise<PaginatedAlerts> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedAlerts>(
    `${BASE_PATH}${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Obtener alertas del usuario actual
 */
export async function getMyAlerts(
  params?: Omit<ListAlertsParams, 'recipientId'>
): Promise<PaginatedAlerts> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedAlerts>(
    `${BASE_PATH}/user${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Obtener alertas activas (no leídas y no archivadas)
 */
export async function getActiveAlerts(
  params?: Omit<ListAlertsParams, 'status'>
): Promise<PaginatedAlerts> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedAlerts>(
    `${BASE_PATH}/active${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Obtener alertas por estudiante
 */
export async function getAlertsByStudent(
  studentId: string,
  params?: Omit<ListAlertsParams, 'studentId'>
): Promise<PaginatedAlerts> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedAlerts>(
    `${BASE_PATH}/student/${studentId}${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Obtener alertas por grupo
 */
export async function getAlertsByGroup(
  groupId: string,
  params?: Omit<ListAlertsParams, 'groupId'>
): Promise<PaginatedAlerts> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedAlerts>(
    `${BASE_PATH}/group/${groupId}${queryString ? `?${queryString}` : ''}`
  );
}

// ============================================================================
// ACCIONES DE LECTURA
// ============================================================================

/**
 * Marcar alerta como leída
 */
export async function markAsRead(id: string): Promise<Alert> {
  return httpClient.post<Alert>(`${BASE_PATH}/${id}/read`, {});
}

/**
 * Marcar múltiples alertas como leídas
 */
export async function markMultipleAsRead(
  data: MarkReadRequest
): Promise<{ success: number; failed: number }> {
  return httpClient.post(`${BASE_PATH}/mark-read`, data);
}

/**
 * Marcar todas las alertas como leídas
 */
export async function markAllAsRead(): Promise<{ success: number }> {
  return httpClient.post(`${BASE_PATH}/mark-all-read`, {});
}

// ============================================================================
// ARCHIVADO Y DESCARTE
// ============================================================================

/**
 * Archivar alerta
 */
export async function archiveAlert(id: string): Promise<Alert> {
  return httpClient.post<Alert>(`${BASE_PATH}/${id}/archive`, {});
}

/**
 * Archivar múltiples alertas
 */
export async function archiveMultiple(
  data: ArchiveAlertsRequest
): Promise<{ success: number; failed: number }> {
  return httpClient.post(`${BASE_PATH}/archive`, data);
}

/**
 * Descartar alerta
 */
export async function dismissAlert(
  id: string,
  reason?: string
): Promise<Alert> {
  return httpClient.post<Alert>(`${BASE_PATH}/${id}/dismiss`, { reason });
}

/**
 * Descartar múltiples alertas
 */
export async function dismissMultiple(
  data: DismissAlertsRequest
): Promise<{ success: number; failed: number }> {
  return httpClient.post(`${BASE_PATH}/dismiss`, data);
}

// ============================================================================
// CONTADORES Y ESTADÍSTICAS
// ============================================================================

/**
 * Obtener contador de alertas no leídas
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  return httpClient.get<{ count: number }>(`${BASE_PATH}/unread-count`);
}

/**
 * Obtener contadores de alertas
 */
export async function getAlertCounts(): Promise<AlertCounts> {
  return httpClient.get<AlertCounts>(`${BASE_PATH}/counts`);
}

/**
 * Obtener resumen de alertas para dashboard
 */
export async function getAlertSummary(): Promise<AlertSummary> {
  return httpClient.get<AlertSummary>(`${BASE_PATH}/summary`);
}

/**
 * Obtener estadísticas de alertas (admin)
 */
export async function getAlertStats(
  params?: {
    groupId?: string;
    programId?: string;
    fromDate?: string;
    toDate?: string;
  }
): Promise<AlertStats> {
  const queryString = buildQueryString(params);
  return httpClient.get<AlertStats>(
    `${BASE_PATH}/stats${queryString ? `?${queryString}` : ''}`
  );
}

// ============================================================================
// GENERACIÓN DE ALERTAS (ADMIN/SISTEMA)
// ============================================================================

/**
 * Generar alertas de asistencia para un grupo
 */
export async function generateAttendanceAlerts(
  groupId: string,
  options?: {
    threshold?: number;      // Porcentaje mínimo de asistencia
    includeWarnings?: boolean;
  }
): Promise<{ generated: number; alerts: Alert[] }> {
  return httpClient.post(`${BASE_PATH}/generate/attendance`, {
    groupId,
    ...options,
  });
}

/**
 * Generar alertas de riesgo de deserción
 */
export async function generateRiskAlerts(
  params?: {
    groupId?: string;
    programId?: string;
  }
): Promise<{ generated: number; alerts: Alert[] }> {
  const queryString = buildQueryString(params);
  return httpClient.post(
    `${BASE_PATH}/generate/risk${queryString ? `?${queryString}` : ''}`,
    {}
  );
}

// ============================================================================
// PREFERENCIAS DE NOTIFICACIÓN
// ============================================================================

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  alertTypes: Record<string, {
    enabled: boolean;
    channels: ('email' | 'push' | 'sms')[];
  }>;
  quietHours?: {
    enabled: boolean;
    start: string;   // HH:mm
    end: string;     // HH:mm
  };
}

/**
 * Obtener preferencias de notificación
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return httpClient.get<NotificationPreferences>(
    `${BASE_PATH}/preferences`
  );
}

/**
 * Actualizar preferencias de notificación
 */
export async function updateNotificationPreferences(
  data: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return httpClient.put<NotificationPreferences>(
    `${BASE_PATH}/preferences`,
    data
  );
}

// ============================================================================
// EXPORT POR DEFECTO
// ============================================================================

export const alertsApi = {
  // CRUD
  create: createAlert,
  get: getAlert,
  update: updateAlert,
  delete: deleteAlert,
  
  // Consultas
  list: listAlerts,
  getMyAlerts,
  getActive: getActiveAlerts,
  getByStudent: getAlertsByStudent,
  getByGroup: getAlertsByGroup,
  
  // Lectura
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  
  // Archivado
  archive: archiveAlert,
  archiveMultiple,
  dismiss: dismissAlert,
  dismissMultiple,
  
  // Contadores
  getUnreadCount,
  getCounts: getAlertCounts,
  getSummary: getAlertSummary,
  getStats: getAlertStats,
  
  // Generación
  generateAttendanceAlerts,
  generateRiskAlerts,
  
  // Preferencias
  getPreferences: getNotificationPreferences,
  updatePreferences: updateNotificationPreferences,
};

export default alertsApi;
