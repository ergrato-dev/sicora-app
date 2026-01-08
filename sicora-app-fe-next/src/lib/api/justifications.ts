/**
 * API Client para Justificaciones
 * Gestión de justificaciones de ausencias
 */

import { httpClient, buildQueryString } from './client';
import type {
  Justification,
  JustificationSummary,
  CreateJustificationRequest,
  UpdateJustificationRequest,
  ApproveJustificationRequest,
  RejectJustificationRequest,
  AddCommentRequest,
  UploadAttachmentRequest,
  ListJustificationsParams,
  PaginatedJustifications,
  JustificationAttachment,
  JustificationComment,
} from '@/types/justification.types';

const BASE_PATH = '/api/v1/justifications';

// ============================================================================
// CRUD BÁSICO
// ============================================================================

/**
 * Crear nueva justificación
 */
export async function createJustification(
  data: CreateJustificationRequest
): Promise<Justification> {
  return httpClient.post<Justification>(BASE_PATH, data);
}

/**
 * Obtener justificación por ID
 */
export async function getJustification(id: string): Promise<Justification> {
  return httpClient.get<Justification>(`${BASE_PATH}/${id}`);
}

/**
 * Actualizar justificación
 */
export async function updateJustification(
  id: string,
  data: UpdateJustificationRequest
): Promise<Justification> {
  return httpClient.put<Justification>(`${BASE_PATH}/${id}`, data);
}

/**
 * Eliminar justificación
 */
export async function deleteJustification(id: string): Promise<void> {
  return httpClient.delete(`${BASE_PATH}/${id}`);
}

// ============================================================================
// CONSULTAS Y LISTADOS
// ============================================================================

/**
 * Listar justificaciones con filtros y paginación
 */
export async function listJustifications(
  params?: ListJustificationsParams
): Promise<PaginatedJustifications> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedJustifications>(
    `${BASE_PATH}${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Obtener justificaciones del usuario actual
 */
export async function getMyJustifications(
  params?: Omit<ListJustificationsParams, 'userId'>
): Promise<PaginatedJustifications> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedJustifications>(
    `${BASE_PATH}/user${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Obtener justificaciones pendientes de revisión
 */
export async function getPendingJustifications(
  params?: Omit<ListJustificationsParams, 'status'>
): Promise<PaginatedJustifications> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedJustifications>(
    `${BASE_PATH}/pending${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Obtener justificaciones por estudiante
 */
export async function getJustificationsByStudent(
  studentId: string,
  params?: Omit<ListJustificationsParams, 'studentId'>
): Promise<PaginatedJustifications> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedJustifications>(
    `${BASE_PATH}/student/${studentId}${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Obtener justificaciones por grupo
 */
export async function getJustificationsByGroup(
  groupId: string,
  params?: Omit<ListJustificationsParams, 'groupId'>
): Promise<PaginatedJustifications> {
  const queryString = buildQueryString(params);
  return httpClient.get<PaginatedJustifications>(
    `${BASE_PATH}/group/${groupId}${queryString ? `?${queryString}` : ''}`
  );
}

// ============================================================================
// APROBACIÓN Y RECHAZO
// ============================================================================

/**
 * Aprobar justificación
 */
export async function approveJustification(
  id: string,
  data: ApproveJustificationRequest
): Promise<Justification> {
  return httpClient.post<Justification>(`${BASE_PATH}/${id}/approve`, data);
}

/**
 * Rechazar justificación
 */
export async function rejectJustification(
  id: string,
  data: RejectJustificationRequest
): Promise<Justification> {
  return httpClient.post<Justification>(`${BASE_PATH}/${id}/reject`, data);
}

/**
 * Cancelar justificación (por el solicitante)
 */
export async function cancelJustification(
  id: string,
  reason?: string
): Promise<Justification> {
  return httpClient.post<Justification>(`${BASE_PATH}/${id}/cancel`, { reason });
}

// ============================================================================
// COMENTARIOS
// ============================================================================

/**
 * Agregar comentario a una justificación
 */
export async function addComment(
  id: string,
  data: AddCommentRequest
): Promise<JustificationComment> {
  return httpClient.post<JustificationComment>(
    `${BASE_PATH}/${id}/comments`,
    data
  );
}

/**
 * Obtener comentarios de una justificación
 */
export async function getComments(
  id: string
): Promise<JustificationComment[]> {
  return httpClient.get<JustificationComment[]>(
    `${BASE_PATH}/${id}/comments`
  );
}

// ============================================================================
// ARCHIVOS ADJUNTOS
// ============================================================================

/**
 * Subir archivo adjunto
 */
export async function uploadAttachment(
  id: string,
  data: UploadAttachmentRequest
): Promise<JustificationAttachment> {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.description) {
    formData.append('description', data.description);
  }
  
  return httpClient.post<JustificationAttachment>(
    `${BASE_PATH}/${id}/attachments`,
    formData
  );
}

/**
 * Obtener archivos adjuntos
 */
export async function getAttachments(
  id: string
): Promise<JustificationAttachment[]> {
  return httpClient.get<JustificationAttachment[]>(
    `${BASE_PATH}/${id}/attachments`
  );
}

/**
 * Eliminar archivo adjunto
 */
export async function deleteAttachment(
  justificationId: string,
  attachmentId: string
): Promise<void> {
  return httpClient.delete(
    `${BASE_PATH}/${justificationId}/attachments/${attachmentId}`
  );
}

/**
 * Descargar archivo adjunto
 */
export async function downloadAttachment(
  justificationId: string,
  attachmentId: string
): Promise<Blob> {
  return httpClient.get<Blob>(
    `${BASE_PATH}/${justificationId}/attachments/${attachmentId}/download`
  );
}

// ============================================================================
// ESTADÍSTICAS Y RESUMEN
// ============================================================================

/**
 * Obtener resumen de justificaciones del usuario
 */
export async function getJustificationSummary(
  userId?: string
): Promise<JustificationSummary> {
  const path = userId 
    ? `${BASE_PATH}/summary/${userId}`
    : `${BASE_PATH}/summary`;
  return httpClient.get<JustificationSummary>(path);
}

/**
 * Obtener estadísticas de justificaciones para admin
 */
export async function getJustificationStats(
  params?: {
    groupId?: string;
    programId?: string;
    fromDate?: string;
    toDate?: string;
  }
): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Record<string, number>;
  avgProcessingTime: number;
  topReasons: { reason: string; count: number }[];
}> {
  const queryString = buildQueryString(params);
  return httpClient.get(
    `${BASE_PATH}/stats${queryString ? `?${queryString}` : ''}`
  );
}

// ============================================================================
// EXPORT POR DEFECTO
// ============================================================================

export const justificationsApi = {
  // CRUD
  create: createJustification,
  get: getJustification,
  update: updateJustification,
  delete: deleteJustification,
  
  // Consultas
  list: listJustifications,
  getMyJustifications,
  getPending: getPendingJustifications,
  getByStudent: getJustificationsByStudent,
  getByGroup: getJustificationsByGroup,
  
  // Aprobación
  approve: approveJustification,
  reject: rejectJustification,
  cancel: cancelJustification,
  
  // Comentarios
  addComment,
  getComments,
  
  // Archivos
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  downloadAttachment,
  
  // Estadísticas
  getSummary: getJustificationSummary,
  getStats: getJustificationStats,
};

export default justificationsApi;
