/**
 * SICORA - Tipos para AttendanceService
 *
 * Interfaces y tipos para la comunicación con el backend Go (AttendanceService)
 * incluyendo asistencia, QR, justificaciones y alertas.
 *
 * @fileoverview Attendance types
 * @module types/attendance
 */

/* =============================================================================
   ENUMERACIONES
   ============================================================================= */

/**
 * Estado de asistencia de un aprendiz
 */
export type AttendanceStatus = 
  | 'presente'       // Asistió y fue registrado
  | 'ausente'        // No asistió
  | 'tardanza'       // Llegó tarde (dentro del margen)
  | 'justificado'    // Ausencia con justificación aprobada
  | 'excusa'         // Ausencia con excusa médica/personal
  | 'permiso'        // Con permiso oficial
  | 'pendiente';     // Aún no se ha tomado asistencia

/**
 * Método de registro de asistencia
 */
export type CheckInMethod = 
  | 'manual'         // Registrado por instructor
  | 'qr_scan'        // Escaneó código QR
  | 'facial'         // Reconocimiento facial (futuro)
  | 'biometric'      // Huella dactilar (futuro)
  | 'bulk'           // Registro masivo
  | 'auto';          // Auto-registro por sistema

/**
 * Estado de una justificación
 */
export type JustificationStatus = 'pendiente' | 'aprobada' | 'rechazada';

/**
 * Tipo de justificación
 */
export type JustificationType = 
  | 'medica'         // Incapacidad médica
  | 'calamidad'      // Calamidad doméstica
  | 'academica'      // Evento académico
  | 'laboral'        // Compromiso laboral (etapa productiva)
  | 'personal'       // Motivo personal
  | 'institucional'  // Citación institucional
  | 'otro';

/**
 * Severidad de alerta
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Tipo de alerta
 */
export type AlertType = 
  | 'inasistencia_frecuente'      // Múltiples faltas
  | 'tardanza_reiterada'          // Múltiples tardanzas
  | 'riesgo_desercion'            // En riesgo de abandonar
  | 'justificacion_pendiente'     // Tiene justificaciones sin revisar
  | 'porcentaje_bajo'             // % asistencia bajo
  | 'novedad';                    // Novedad general

/* =============================================================================
   INTERFACES - ASISTENCIA (ATTENDANCE)
   ============================================================================= */

/**
 * Registro de asistencia individual
 */
export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_document?: string;
  schedule_id: string;
  academic_group_id: string;
  group_code?: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  status: AttendanceStatus;
  check_in_time?: string; // HH:mm:ss
  check_out_time?: string;
  check_in_method?: CheckInMethod;
  notes?: string;
  recorded_by: string; // instructor_id o 'system'
  recorded_by_name?: string;
  justification_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request para registrar asistencia individual
 */
export interface CreateAttendanceRequest {
  student_id: string;
  schedule_id: string;
  academic_group_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_in_method?: CheckInMethod;
  notes?: string;
}

/**
 * Request para actualizar asistencia
 */
export interface UpdateAttendanceRequest {
  status?: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
}

/**
 * Request para registro masivo de asistencia
 */
export interface BulkAttendanceRequest {
  schedule_id: string;
  academic_group_id: string;
  date: string;
  check_in_method?: CheckInMethod;
  records: {
    student_id: string;
    status: AttendanceStatus;
    check_in_time?: string;
    notes?: string;
  }[];
}

/**
 * Respuesta de registro masivo
 */
export interface BulkAttendanceResponse {
  success_count: number;
  error_count: number;
  errors: {
    student_id: string;
    message: string;
  }[];
  created_records: string[]; // IDs de los registros creados
}

/**
 * Parámetros para listar asistencia
 */
export interface ListAttendanceParams {
  student_id?: string;
  schedule_id?: string;
  academic_group_id?: string;
  instructor_id?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: AttendanceStatus;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de asistencia
 */
export interface AttendanceListResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/* =============================================================================
   INTERFACES - REGISTRO QR
   ============================================================================= */

/**
 * Código QR generado para toma de asistencia
 */
export interface AttendanceQRCode {
  id: string;
  schedule_id: string;
  academic_group_id: string;
  qr_code: string; // Base64 o URL de la imagen
  token: string; // Token único para validación
  valid_from: string; // ISO 8601
  valid_until: string;
  location?: {
    latitude: number;
    longitude: number;
    radius_meters: number;
  };
  created_by: string; // instructor_id
  is_active: boolean;
  scans_count: number;
  created_at: string;
}

/**
 * Request para generar QR
 */
export interface GenerateQRRequest {
  schedule_id: string;
  academic_group_id: string;
  duration_minutes?: number; // Default: 30
  require_location?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius_meters: number;
  };
}

/**
 * Request para escanear QR (desde app móvil)
 */
export interface ScanQRRequest {
  token: string;
  student_id: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  device_info?: {
    device_id: string;
    device_name: string;
    platform: string;
  };
}

/**
 * Respuesta de escaneo QR
 */
export interface ScanQRResponse {
  success: boolean;
  message: string;
  attendance_id?: string;
  status?: AttendanceStatus;
  student_name?: string;
  check_in_time?: string;
  error_code?: 'QR_EXPIRED' | 'ALREADY_SCANNED' | 'INVALID_LOCATION' | 'NOT_ENROLLED' | 'INVALID_TOKEN';
}

/* =============================================================================
   INTERFACES - JUSTIFICACIONES
   ============================================================================= */

/**
 * Justificación de inasistencia
 */
export interface Justification {
  id: string;
  student_id: string;
  student_name: string;
  student_document?: string;
  attendance_ids: string[]; // IDs de los registros de asistencia
  dates: string[]; // Fechas cubiertas
  type: JustificationType;
  description: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  status: JustificationStatus;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request para crear justificación
 */
export interface CreateJustificationRequest {
  student_id: string;
  attendance_ids: string[];
  type: JustificationType;
  description: string;
  attachment_ids?: string[]; // IDs de archivos subidos previamente
}

/**
 * Request para revisar justificación
 */
export interface ReviewJustificationRequest {
  status: 'aprobada' | 'rechazada';
  review_notes?: string;
}

/**
 * Parámetros para listar justificaciones
 */
export interface ListJustificationsParams {
  student_id?: string;
  academic_group_id?: string;
  status?: JustificationStatus;
  type?: JustificationType;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

/**
 * Respuesta de lista de justificaciones
 */
export interface JustificationsListResponse {
  justifications: Justification[];
  total: number;
  page: number;
  page_size: number;
}

/* =============================================================================
   INTERFACES - ALERTAS
   ============================================================================= */

/**
 * Alerta de asistencia
 */
export interface AttendanceAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  student_id?: string;
  student_name?: string;
  academic_group_id?: string;
  group_code?: string;
  related_data?: {
    absences_count?: number;
    tardiness_count?: number;
    attendance_percentage?: number;
    last_attendance_date?: string;
    pending_justifications?: number;
  };
  is_read: boolean;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

/**
 * Parámetros para listar alertas
 */
export interface ListAlertsParams {
  academic_group_id?: string;
  instructor_id?: string;
  student_id?: string;
  type?: AlertType;
  severity?: AlertSeverity;
  is_read?: boolean;
  is_resolved?: boolean;
  page?: number;
  page_size?: number;
}

/**
 * Respuesta de lista de alertas
 */
export interface AlertsListResponse {
  alerts: AttendanceAlert[];
  total: number;
  unread_count: number;
  critical_count: number;
  page: number;
  page_size: number;
}

/**
 * Request para resolver alerta
 */
export interface ResolveAlertRequest {
  resolution_notes?: string;
}

/* =============================================================================
   INTERFACES - HISTORIAL Y ESTADÍSTICAS
   ============================================================================= */

/**
 * Historial de asistencia de un estudiante
 */
export interface StudentAttendanceHistory {
  student_id: string;
  student_name: string;
  academic_group_id: string;
  group_code: string;
  period: {
    from: string;
    to: string;
  };
  summary: {
    total_classes: number;
    present: number;
    absent: number;
    late: number;
    justified: number;
    attendance_percentage: number;
  };
  records: AttendanceRecord[];
}

/**
 * Resumen de asistencia por grupo
 */
export interface GroupAttendanceSummary {
  academic_group_id: string;
  group_code: string;
  program_name: string;
  period: {
    from: string;
    to: string;
  };
  total_students: number;
  total_classes: number;
  average_attendance_percentage: number;
  by_status: {
    present: number;
    absent: number;
    late: number;
    justified: number;
  };
  students_at_risk: {
    id: string;
    name: string;
    attendance_percentage: number;
    absences_count: number;
  }[];
  daily_attendance: {
    date: string;
    present: number;
    absent: number;
    percentage: number;
  }[];
}

/**
 * Parámetros para historial
 */
export interface AttendanceHistoryParams {
  student_id?: string;
  academic_group_id?: string;
  date_from?: string;
  date_to?: string;
  trimestre?: number;
  año?: number;
}

/**
 * Parámetros para resumen
 */
export interface AttendanceSummaryParams {
  academic_group_id?: string;
  instructor_id?: string;
  date_from?: string;
  date_to?: string;
  trimestre?: number;
  año?: number;
}

/* =============================================================================
   UTILIDADES Y MAPEOS
   ============================================================================= */

/**
 * Colores para estados de asistencia
 */
export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  presente: {
    label: 'Presente',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'check-circle',
  },
  ausente: {
    label: 'Ausente',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'x-circle',
  },
  tardanza: {
    label: 'Tardanza',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: 'clock',
  },
  justificado: {
    label: 'Justificado',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'document-check',
  },
  excusa: {
    label: 'Excusa',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'document-text',
  },
  permiso: {
    label: 'Permiso',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: 'badge-check',
  },
  pendiente: {
    label: 'Pendiente',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'minus-circle',
  },
};

/**
 * Configuración de severidad de alertas
 */
export const ALERT_SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; color: string; bgColor: string; priority: number }
> = {
  info: {
    label: 'Información',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    priority: 1,
  },
  warning: {
    label: 'Advertencia',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    priority: 2,
  },
  critical: {
    label: 'Crítico',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    priority: 3,
  },
};

/**
 * Calcular porcentaje de asistencia
 */
export function calculateAttendancePercentage(
  present: number,
  late: number,
  justified: number,
  total: number
): number {
  if (total === 0) return 100;
  const counted = present + late + justified;
  return Math.round((counted / total) * 100);
}

/**
 * Determinar si un estudiante está en riesgo
 */
export function isStudentAtRisk(attendancePercentage: number, absencesCount: number): boolean {
  // En riesgo si: menos de 80% de asistencia O más de 5 faltas
  return attendancePercentage < 80 || absencesCount > 5;
}

/**
 * Obtener color según porcentaje de asistencia
 */
export function getAttendancePercentageColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-yellow-600';
  if (percentage >= 70) return 'text-orange-600';
  return 'text-red-600';
}
