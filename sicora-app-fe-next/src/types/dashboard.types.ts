/**
 * SICORA - Tipos del Dashboard
 *
 * Tipos TypeScript para los datos del dashboard
 * basados en los endpoints del backend Go
 *
 * @fileoverview Dashboard types
 * @module types/dashboard.types
 */

// ============================================================================
// TIPOS COMUNES
// ============================================================================

/**
 * Estado de un recurso
 */
export type ResourceStatus = 'active' | 'inactive' | 'pending' | 'archived';

/**
 * Roles de usuario en el sistema
 */
export type UserRole =
  | 'admin'
  | 'coordinador'
  | 'instructor'
  | 'aprendiz'
  | 'administrativo';

/**
 * Período de tiempo para filtros
 */
export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Paginación
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// USUARIOS
// ============================================================================

/**
 * Usuario básico
 */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: ResourceStatus;
  avatar_url?: string;
  phone?: string;
  document_number?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Usuario completo con relaciones
 */
export interface UserDetails extends User {
  coordination?: Coordination;
  ficha?: AcademicGroup;
  last_login?: string;
  must_change_password?: boolean;
}

/**
 * Resumen de usuarios para dashboard admin
 */
export interface UsersSummary {
  total: number;
  active: number;
  inactive: number;
  by_role: Record<UserRole, number>;
  new_this_month: number;
  new_this_week: number;
}

// ============================================================================
// HORARIOS (SCHEDULES)
// ============================================================================

/**
 * Día de la semana
 */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * Horario de clase
 */
export interface Schedule {
  id: string;
  academic_program_id: string;
  academic_group_id: string;
  instructor_id: string;
  venue_id: string;
  competency_id?: string;
  day_of_week: DayOfWeek;
  start_time: string; // HH:MM format
  end_time: string;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Horario con relaciones expandidas
 */
export interface ScheduleWithDetails extends Schedule {
  academic_program: AcademicProgram;
  academic_group: AcademicGroup;
  instructor: User;
  venue: Venue;
  competency?: Competency;
}

/**
 * Horario del día para aprendiz/instructor
 */
export interface TodaySchedule {
  id: string;
  subject: string;
  instructor_name: string;
  venue_name: string;
  venue_code: string;
  start_time: string;
  end_time: string;
  ficha: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
}

/**
 * Resumen de horarios para dashboard
 */
export interface SchedulesSummary {
  total: number;
  today: number;
  this_week: number;
  by_day: Record<DayOfWeek, number>;
  conflicts: number;
}

// ============================================================================
// ASISTENCIA (ATTENDANCE)
// ============================================================================

/**
 * Estado de asistencia
 */
export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'justified';

/**
 * Registro de asistencia
 */
export interface AttendanceRecord {
  id: string;
  student_id: string;
  schedule_id: string;
  instructor_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: AttendanceStatus;
  notes?: string;
  qr_code_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Resumen de asistencia para aprendiz
 */
export interface StudentAttendanceSummary {
  total_classes: number;
  attended: number;
  absent: number;
  late: number;
  justified: number;
  attendance_rate: number; // Porcentaje 0-100
  streak_days: number; // Días consecutivos asistiendo
  last_absence?: string; // Fecha de última ausencia
}

/**
 * Resumen de asistencia para instructor
 */
export interface InstructorAttendanceSummary {
  total_students: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  average_attendance_rate: number;
  lowest_attendance_ficha?: {
    id: string;
    name: string;
    rate: number;
  };
}

/**
 * Resumen global de asistencia para admin
 */
export interface GlobalAttendanceSummary {
  total_records_today: number;
  attendance_rate_today: number;
  attendance_rate_week: number;
  attendance_rate_month: number;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  by_coordination: Array<{
    coordination_id: string;
    coordination_name: string;
    rate: number;
  }>;
}

// ============================================================================
// ALERTAS
// ============================================================================

/**
 * Tipo de alerta
 */
export type AlertType =
  | 'attendance_warning' // Bajo porcentaje de asistencia
  | 'attendance_critical' // Asistencia crítica
  | 'schedule_conflict' // Conflicto de horario
  | 'justification_pending' // Justificación pendiente
  | 'evaluation_due' // Evaluación próxima
  | 'document_pending' // Documento pendiente
  | 'system'; // Alerta del sistema

/**
 * Prioridad de alerta
 */
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alerta
 */
export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  read_at?: string;
  action_url?: string;
  expires_at?: string;
  created_at: string;
}

/**
 * Resumen de alertas
 */
export interface AlertsSummary {
  total: number;
  unread: number;
  by_priority: Record<AlertPriority, number>;
  by_type: Record<AlertType, number>;
}

// ============================================================================
// JUSTIFICACIONES
// ============================================================================

/**
 * Estado de justificación
 */
export type JustificationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

/**
 * Tipo de justificación
 */
export type JustificationType =
  | 'medical'
  | 'family_emergency'
  | 'work'
  | 'academic'
  | 'other';

/**
 * Justificación
 */
export interface Justification {
  id: string;
  student_id: string;
  attendance_id?: string;
  type: JustificationType;
  status: JustificationStatus;
  start_date: string;
  end_date: string;
  reason: string;
  evidence_urls?: string[];
  reviewer_id?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Justificación con detalles
 */
export interface JustificationWithDetails extends Justification {
  student: User;
  reviewer?: User;
}

/**
 * Resumen de justificaciones pendientes
 */
export interface PendingJustificationsSummary {
  total: number;
  by_type: Record<JustificationType, number>;
  oldest_pending_date?: string;
}

// ============================================================================
// DATOS MAESTROS
// ============================================================================

/**
 * Programa académico
 */
export interface AcademicProgram {
  id: string;
  code: string;
  name: string;
  level: string;
  duration_months: number;
  status: ResourceStatus;
}

/**
 * Grupo académico (Ficha)
 */
export interface AcademicGroup {
  id: string;
  code: string; // Número de ficha
  academic_program_id: string;
  start_date: string;
  end_date: string;
  status: ResourceStatus;
  students_count?: number;
}

/**
 * Ambiente (Venue)
 */
export interface Venue {
  id: string;
  code: string;
  name: string;
  campus_id: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'workshop' | 'auditorium' | 'virtual';
  status: ResourceStatus;
}

/**
 * Sede (Campus)
 */
export interface Campus {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  status: ResourceStatus;
}

/**
 * Coordinación
 */
export interface Coordination {
  id: string;
  code: string;
  name: string;
  campus_id: string;
  status: ResourceStatus;
}

/**
 * Competencia
 */
export interface Competency {
  id: string;
  code: string;
  name: string;
  academic_program_id: string;
  hours: number;
}

// ============================================================================
// MÉTRICAS DEL DASHBOARD
// ============================================================================

/**
 * Métricas para dashboard de aprendiz
 */
export interface StudentDashboardMetrics {
  user: UserDetails;
  attendance_summary: StudentAttendanceSummary;
  today_schedule: TodaySchedule[];
  pending_justifications: number;
  alerts: Alert[];
  upcoming_evaluations: number;
}

/**
 * Métricas para dashboard de instructor
 */
export interface InstructorDashboardMetrics {
  user: UserDetails;
  attendance_summary: InstructorAttendanceSummary;
  today_schedule: TodaySchedule[];
  pending_justifications: PendingJustificationsSummary;
  alerts: Alert[];
  total_students: number;
  fichas: AcademicGroup[];
}

/**
 * Métricas para dashboard de admin/coordinador
 */
export interface AdminDashboardMetrics {
  users_summary: UsersSummary;
  attendance_summary: GlobalAttendanceSummary;
  schedules_summary: SchedulesSummary;
  alerts_summary: AlertsSummary;
  pending_justifications: PendingJustificationsSummary;
  recent_activity: ActivityItem[];
}

/**
 * Item de actividad reciente
 */
export interface ActivityItem {
  id: string;
  type:
    | 'user'
    | 'schedule'
    | 'attendance'
    | 'justification'
    | 'alert'
    | 'system';
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected';
  message: string;
  user_id?: string;
  user_name?: string;
  resource_id?: string;
  resource_type?: string;
  timestamp: string;
}

// ============================================================================
// FILTROS Y QUERIES
// ============================================================================

/**
 * Filtros para listado de usuarios
 */
export interface UsersFilter {
  search?: string;
  role?: UserRole;
  status?: ResourceStatus;
  coordination_id?: string;
  page?: number;
  limit?: number;
}

/**
 * Filtros para listado de horarios
 */
export interface SchedulesFilter {
  instructor_id?: string;
  academic_group_id?: string;
  venue_id?: string;
  day_of_week?: DayOfWeek;
  date?: string;
  page?: number;
  limit?: number;
}

/**
 * Filtros para historial de asistencia
 */
export interface AttendanceFilter {
  student_id?: string;
  instructor_id?: string;
  academic_group_id?: string;
  status?: AttendanceStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

/**
 * Filtros para alertas
 */
export interface AlertsFilter {
  type?: AlertType;
  priority?: AlertPriority;
  read?: boolean;
  page?: number;
  limit?: number;
}
