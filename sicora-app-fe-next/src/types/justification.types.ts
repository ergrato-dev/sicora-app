/**
 * Tipos para el módulo de Justificaciones
 * Sistema de justificación de ausencias con flujo de aprobación
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export type JustificationStatus = 
  | 'pending'     // Pendiente de revisión
  | 'approved'    // Aprobada
  | 'rejected'    // Rechazada
  | 'cancelled';  // Cancelada por el usuario

export type JustificationType = 
  | 'medical'           // Incapacidad médica
  | 'family_emergency'  // Emergencia familiar
  | 'official_duty'     // Comisión oficial/laboral
  | 'academic'          // Actividad académica
  | 'personal'          // Calamidad personal
  | 'transportation'    // Problemas de transporte
  | 'other';            // Otro motivo

export type AttachmentType = 
  | 'document'    // Documento PDF/Word
  | 'image'       // Imagen JPG/PNG
  | 'certificate' // Certificado oficial
  | 'other';      // Otro tipo

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Archivo adjunto a una justificación
 */
export interface JustificationAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  url: string;
  size: number;           // Bytes
  mimeType: string;
  uploadedAt: string;
}

/**
 * Comentario en una justificación
 */
export interface JustificationComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
}

/**
 * Registro de ausencia asociado a justificación
 */
export interface AbsenceRecord {
  id: string;
  date: string;
  scheduleId: string;
  scheduleName: string;
  startTime: string;
  endTime: string;
  attendanceId?: string;
}

/**
 * Justificación de ausencia
 */
export interface Justification {
  id: string;
  
  // Información del estudiante
  studentId: string;
  studentName: string;
  studentDocument: string;
  studentEmail?: string;
  
  // Contexto académico
  programId: string;
  programName: string;
  groupId: string;
  groupName: string;
  
  // Detalles de la justificación
  type: JustificationType;
  status: JustificationStatus;
  subject: string;            // Asunto corto
  description: string;        // Descripción detallada
  
  // Fechas de ausencia
  startDate: string;
  endDate: string;
  absenceDays: number;        // Días de ausencia
  absenceRecords?: AbsenceRecord[];
  
  // Documentos de soporte
  attachments: JustificationAttachment[];
  
  // Revisión
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  
  // Comentarios
  comments: JustificationComment[];
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

/**
 * Resumen de justificaciones para dashboard
 */
export interface JustificationSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  byType: Record<JustificationType, number>;
  avgResponseTime: number;  // Horas promedio de respuesta
}

// ============================================================================
// DTOs PARA API
// ============================================================================

/**
 * Crear nueva justificación
 */
export interface CreateJustificationRequest {
  type: JustificationType;
  subject: string;
  description: string;
  startDate: string;
  endDate: string;
  attendanceIds?: string[];   // IDs de registros de asistencia a justificar
  attachmentIds?: string[];   // IDs de archivos subidos
}

/**
 * Actualizar justificación (solo si está pendiente)
 */
export interface UpdateJustificationRequest {
  type?: JustificationType;
  subject?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  attachmentIds?: string[];
}

/**
 * Aprobar justificación
 */
export interface ApproveJustificationRequest {
  notes?: string;
}

/**
 * Rechazar justificación
 */
export interface RejectJustificationRequest {
  reason: string;
  notes?: string;
}

/**
 * Agregar comentario
 */
export interface AddCommentRequest {
  content: string;
}

/**
 * Subir archivo adjunto
 */
export interface UploadAttachmentRequest {
  file: File;
  type: AttachmentType;
}

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

export interface ListJustificationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: JustificationStatus;
  type?: JustificationType;
  studentId?: string;
  groupId?: string;
  programId?: string;
  fromDate?: string;
  toDate?: string;
  reviewerId?: string;
  sortBy?: 'createdAt' | 'startDate' | 'status' | 'studentName';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedJustifications {
  data: Justification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary?: JustificationSummary;
}

// ============================================================================
// CONFIGURACIÓN DE TIPOS
// ============================================================================

export const JUSTIFICATION_TYPE_CONFIG: Record<JustificationType, {
  label: string;
  description: string;
  requiresAttachment: boolean;
  maxDays: number;
}> = {
  medical: {
    label: 'Incapacidad médica',
    description: 'Enfermedad o cita médica con certificado',
    requiresAttachment: true,
    maxDays: 30,
  },
  family_emergency: {
    label: 'Emergencia familiar',
    description: 'Calamidad doméstica o familiar',
    requiresAttachment: false,
    maxDays: 5,
  },
  official_duty: {
    label: 'Comisión oficial',
    description: 'Actividad laboral o representación institucional',
    requiresAttachment: true,
    maxDays: 15,
  },
  academic: {
    label: 'Actividad académica',
    description: 'Evento académico, conferencia, competencia',
    requiresAttachment: true,
    maxDays: 7,
  },
  personal: {
    label: 'Calamidad personal',
    description: 'Situación personal grave',
    requiresAttachment: false,
    maxDays: 3,
  },
  transportation: {
    label: 'Problemas de transporte',
    description: 'Fallas en transporte público o vías',
    requiresAttachment: false,
    maxDays: 1,
  },
  other: {
    label: 'Otro motivo',
    description: 'Otra razón justificada',
    requiresAttachment: false,
    maxDays: 3,
  },
};

export const JUSTIFICATION_STATUS_CONFIG: Record<JustificationStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  pending: {
    label: 'Pendiente',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: 'Clock',
  },
  approved: {
    label: 'Aprobada',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'CheckCircle',
  },
  rejected: {
    label: 'Rechazada',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'XCircle',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'Ban',
  },
};
