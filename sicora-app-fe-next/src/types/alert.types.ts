/**
 * Tipos para el módulo de Alertas
 * Sistema de notificaciones y alertas de asistencia
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export type AlertType = 
  | 'attendance_warning'     // Advertencia de asistencia (ej: 2 faltas)
  | 'attendance_critical'    // Alerta crítica (ej: riesgo de pérdida)
  | 'attendance_risk'        // En riesgo de deserción
  | 'justification_pending'  // Justificación pendiente de revisar
  | 'justification_approved' // Justificación aprobada
  | 'justification_rejected' // Justificación rechazada
  | 'schedule_change'        // Cambio de horario
  | 'evaluation_reminder'    // Recordatorio de evaluación
  | 'system_notification'    // Notificación del sistema
  | 'general';               // Alerta general

export type AlertPriority = 
  | 'low'       // Baja prioridad - informativo
  | 'medium'    // Media prioridad - requiere atención
  | 'high'      // Alta prioridad - acción requerida
  | 'critical'; // Crítica - acción urgente

export type AlertStatus = 
  | 'unread'    // No leída
  | 'read'      // Leída
  | 'archived'  // Archivada
  | 'dismissed';// Descartada

export type AlertRecipientType = 
  | 'student'       // Estudiante/Aprendiz
  | 'instructor'    // Instructor
  | 'coordinator'   // Coordinador
  | 'admin'         // Administrador
  | 'group'         // Grupo/Ficha completa
  | 'broadcast';    // Todos los usuarios

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Datos del estudiante relacionado con la alerta
 */
export interface AlertStudentInfo {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  groupId: string;
  groupName: string;
  programId: string;
  programName: string;
}

/**
 * Métricas de asistencia para alertas
 */
export interface AttendanceMetrics {
  totalSessions: number;
  attended: number;
  absences: number;
  justified: number;
  unjustified: number;
  attendanceRate: number;      // Porcentaje 0-100
  consecutiveAbsences: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Acción disponible para una alerta
 */
export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;    // Nombre de la acción (ej: 'view_details', 'approve', 'dismiss')
  url?: string;      // URL de navegación
  disabled?: boolean;
}

/**
 * Alerta del sistema
 */
export interface Alert {
  id: string;
  
  // Tipo y prioridad
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  
  // Contenido
  title: string;
  message: string;
  details?: string;           // Detalles adicionales (HTML o markdown)
  
  // Destinatario
  recipientId: string;
  recipientType: AlertRecipientType;
  recipientName?: string;
  
  // Origen
  sourceType?: string;        // Tipo de entidad que generó la alerta
  sourceId?: string;          // ID de la entidad
  sourceName?: string;        // Nombre legible
  
  // Información contextual
  student?: AlertStudentInfo;
  metrics?: AttendanceMetrics;
  
  // Acciones disponibles
  actions?: AlertAction[];
  
  // Metadatos
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  isExpired: boolean;
  
  // Agrupación
  groupKey?: string;          // Para agrupar alertas similares
  relatedAlertIds?: string[];
}

/**
 * Contador de alertas por estado
 */
export interface AlertCounts {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byPriority: Record<AlertPriority, number>;
  byType: Record<AlertType, number>;
}

/**
 * Estadísticas de alertas para admin
 */
export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedToday: number;
  avgResponseTime: number;    // Horas
  
  // Por tipo
  byType: Record<AlertType, number>;
  
  // Por prioridad
  byPriority: Record<AlertPriority, number>;
  
  // Tendencias
  alertsTrend: {
    date: string;
    count: number;
  }[];
  
  // Top grupos con más alertas
  topGroups: {
    groupId: string;
    groupName: string;
    alertCount: number;
    criticalCount: number;
  }[];
  
  // Estudiantes en riesgo
  studentsAtRisk: number;
  studentsAtCriticalRisk: number;
}

/**
 * Resumen de alertas para dashboard
 */
export interface AlertSummary {
  unreadCount: number;
  criticalCount: number;
  pendingActionsCount: number;
  recentAlerts: Alert[];
}

// ============================================================================
// DTOs PARA API
// ============================================================================

/**
 * Crear nueva alerta (solo admin/sistema)
 */
export interface CreateAlertRequest {
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  details?: string;
  recipientId: string;
  recipientType: AlertRecipientType;
  sourceType?: string;
  sourceId?: string;
  expiresAt?: string;
  actions?: Omit<AlertAction, 'id'>[];
}

/**
 * Actualizar alerta
 */
export interface UpdateAlertRequest {
  status?: AlertStatus;
  priority?: AlertPriority;
  expiresAt?: string;
}

/**
 * Marcar como leída
 */
export interface MarkReadRequest {
  alertIds: string[];
}

/**
 * Archivar alertas
 */
export interface ArchiveAlertsRequest {
  alertIds: string[];
}

/**
 * Descartar alertas
 */
export interface DismissAlertsRequest {
  alertIds: string[];
  reason?: string;
}

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

export interface ListAlertsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: AlertType | AlertType[];
  priority?: AlertPriority | AlertPriority[];
  status?: AlertStatus | AlertStatus[];
  recipientId?: string;
  recipientType?: AlertRecipientType;
  studentId?: string;
  groupId?: string;
  programId?: string;
  fromDate?: string;
  toDate?: string;
  includeExpired?: boolean;
  sortBy?: 'createdAt' | 'priority' | 'type' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAlerts {
  data: Alert[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts?: AlertCounts;
}

// ============================================================================
// CONFIGURACIÓN DE TIPOS
// ============================================================================

export const ALERT_TYPE_CONFIG: Record<AlertType, {
  label: string;
  description: string;
  icon: string;
  defaultPriority: AlertPriority;
}> = {
  attendance_warning: {
    label: 'Advertencia de asistencia',
    description: 'El estudiante tiene faltas que requieren atención',
    icon: 'AlertTriangle',
    defaultPriority: 'medium',
  },
  attendance_critical: {
    label: 'Asistencia crítica',
    description: 'El estudiante está en riesgo de pérdida por inasistencia',
    icon: 'AlertOctagon',
    defaultPriority: 'critical',
  },
  attendance_risk: {
    label: 'Riesgo de deserción',
    description: 'El estudiante muestra señales de riesgo de deserción',
    icon: 'UserMinus',
    defaultPriority: 'high',
  },
  justification_pending: {
    label: 'Justificación pendiente',
    description: 'Hay una justificación esperando revisión',
    icon: 'FileQuestion',
    defaultPriority: 'medium',
  },
  justification_approved: {
    label: 'Justificación aprobada',
    description: 'Tu justificación ha sido aprobada',
    icon: 'FileCheck',
    defaultPriority: 'low',
  },
  justification_rejected: {
    label: 'Justificación rechazada',
    description: 'Tu justificación ha sido rechazada',
    icon: 'FileX',
    defaultPriority: 'medium',
  },
  schedule_change: {
    label: 'Cambio de horario',
    description: 'Se ha modificado el horario de clases',
    icon: 'CalendarClock',
    defaultPriority: 'medium',
  },
  evaluation_reminder: {
    label: 'Recordatorio de evaluación',
    description: 'Tienes una evaluación próxima',
    icon: 'ClipboardCheck',
    defaultPriority: 'medium',
  },
  system_notification: {
    label: 'Notificación del sistema',
    description: 'Mensaje del sistema',
    icon: 'Info',
    defaultPriority: 'low',
  },
  general: {
    label: 'Alerta general',
    description: 'Alerta informativa',
    icon: 'Bell',
    defaultPriority: 'low',
  },
};

export const ALERT_PRIORITY_CONFIG: Record<AlertPriority, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  low: {
    label: 'Baja',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    icon: 'Info',
  },
  medium: {
    label: 'Media',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    icon: 'AlertCircle',
  },
  high: {
    label: 'Alta',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    icon: 'AlertTriangle',
  },
  critical: {
    label: 'Crítica',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    icon: 'AlertOctagon',
  },
};

export const ALERT_STATUS_CONFIG: Record<AlertStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  unread: {
    label: 'No leída',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  read: {
    label: 'Leída',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  archived: {
    label: 'Archivada',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  dismissed: {
    label: 'Descartada',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
  },
};
