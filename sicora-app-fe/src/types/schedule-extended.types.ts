/**
 * Tipos extendidos para el Sistema de Horarios
 * Incluye entidades maestras: Sede, Ambiente, Competencia, Resultado de Aprendizaje
 */

// =============================================================================
// TRIMESTRE ACADÉMICO
// =============================================================================

export interface AcademicQuarter {
  id: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  name: string; // "Q1 2026", "Primer Trimestre 2026"
  start_date: string;
  end_date: string;
  is_active: boolean;
  scheduling_open: boolean;
  scheduling_deadline: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// SEDE Y AMBIENTE
// =============================================================================

export interface Sede {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  is_active: boolean;
  ambientes_count?: number;
}

export type AmbienteType = 'aula' | 'laboratorio' | 'taller' | 'auditorio' | 'virtual';

export interface Ambiente {
  id: string;
  sede_id: string;
  sede_name?: string;
  code: string;
  name: string;
  type: AmbienteType;
  capacity: number;
  equipment: string[];
  floor?: string;
  building?: string;
  is_active: boolean;
}

export interface AmbienteAvailabilitySlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  event_id?: string;
  event_title?: string;
  instructor_name?: string;
}

export interface AmbienteAvailability {
  ambiente_id: string;
  ambiente_name: string;
  date: string;
  slots: AmbienteAvailabilitySlot[];
}

// =============================================================================
// PROGRAMA DE FORMACIÓN
// =============================================================================

export type ProgramLevel = 'tecnologo' | 'tecnico' | 'auxiliar' | 'especializacion';

export interface ProgramaFormacion {
  id: string;
  code: string;
  name: string;
  version: string;
  level: ProgramLevel;
  duration_months: number;
  total_hours: number;
  is_active: boolean;
}

// =============================================================================
// COMPETENCIA Y RESULTADO DE APRENDIZAJE
// =============================================================================

export interface Competencia {
  id: string;
  programa_id: string;
  code: string;
  name: string;
  description?: string;
  hours_total: number;
  resultados_count?: number;
}

export interface ResultadoAprendizaje {
  id: string;
  competencia_id: string;
  competencia_code?: string;
  competencia_name?: string;
  code: string;
  description: string;
  hours_theory: number;
  hours_practice: number;
  hours_total: number;
}

// =============================================================================
// FICHA DE FORMACIÓN
// =============================================================================

export type FichaStatus = 'en_formacion' | 'finalizada' | 'cancelada' | 'suspendida';

export interface Ficha {
  id: string;
  code: string;
  programa_id: string;
  programa_code?: string;
  programa_name?: string;
  programa_level?: ProgramLevel;
  instructor_lider_id?: string;
  instructor_lider_name?: string;
  sede_id?: string;
  sede_name?: string;
  start_date: string;
  end_date: string;
  current_quarter: number;
  aprendices_count: number;
  status: FichaStatus;
}

// =============================================================================
// ASIGNACIÓN INSTRUCTOR-FICHA
// =============================================================================

export interface InstructorFichaAssignment {
  id: string;
  instructor_id: string;
  instructor_name?: string;
  ficha_id: string;
  ficha_code?: string;
  quarter_id: string;
  competencias_asignadas: string[];
  hours_assigned: number;
  hours_scheduled: number;
  is_lider: boolean;
  is_active: boolean;
}

// =============================================================================
// EVENTO DE HORARIO (SCHEDULE EVENT)
// =============================================================================

export type ScheduleEventStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type EventColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'cyan'
  | 'pink';

export interface RecurrenceConfig {
  type: RecurrenceType;
  days_of_week?: DayOfWeek[];
  end_date: string;
  exceptions: string[]; // Fechas excluidas (ISO)
}

export interface ScheduleEvent {
  id: string;

  // Contexto temporal
  quarter_id: string;
  date: string;
  start_time: string;
  end_time: string;

  // Asignaciones (IDs de selección)
  instructor_id: string;
  ficha_id: string;
  sede_id: string;
  ambiente_id: string;
  resultado_aprendizaje_id: string;

  // Datos denormalizados para display
  instructor_name: string;
  ficha_code: string;
  programa_name: string;
  sede_name: string;
  ambiente_code: string;
  ambiente_name: string;
  resultado_code: string;
  resultado_description: string;
  competencia_code: string;
  competencia_name: string;

  // Metadatos
  status: ScheduleEventStatus;
  color: EventColor;
  recurrence: RecurrenceConfig | null;
  notes?: string;

  // Validación
  conflicts: ConflictInfo[];
  is_validated: boolean;

  // Auditoría
  created_by: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CONFLICTOS
// =============================================================================

export type ConflictType =
  | 'ambiente_ocupado'
  | 'instructor_ocupado'
  | 'ficha_ocupada'
  | 'capacidad_excedida'
  | 'fuera_horario'
  | 'sede_diferente';

export type ConflictSeverity = 'error' | 'warning';

export interface ConflictingEventInfo {
  id: string;
  instructor_name: string;
  ficha_code: string;
  ambiente_name: string;
  time_range: string;
}

export interface ConflictDetails {
  existing_event?: ConflictingEventInfo;
  ambiente_capacity?: number;
  ficha_size?: number;
  allowed_hours?: {
    start: string;
    end: string;
  };
}

export interface ConflictInfo {
  type: ConflictType;
  severity: ConflictSeverity;
  message: string;
  conflicting_event_id?: string;
  details: ConflictDetails;
}

// =============================================================================
// REQUESTS
// =============================================================================

export interface CreateScheduleEventRequest {
  quarter_id: string;
  date: string;
  start_time: string;
  end_time: string;
  instructor_id: string;
  ficha_id: string;
  sede_id: string;
  ambiente_id: string;
  resultado_aprendizaje_id: string;
  color?: EventColor;
  recurrence?: RecurrenceConfig;
  notes?: string;
}

export interface UpdateScheduleEventRequest {
  date?: string;
  start_time?: string;
  end_time?: string;
  ambiente_id?: string;
  resultado_aprendizaje_id?: string;
  status?: ScheduleEventStatus;
  color?: EventColor;
  recurrence?: RecurrenceConfig | null;
  notes?: string;
}

export interface ValidateScheduleRequest {
  event: CreateScheduleEventRequest;
  exclude_event_id?: string; // Para edición
}

export interface ValidateScheduleResponse {
  is_valid: boolean;
  has_errors: boolean;
  has_warnings: boolean;
  conflicts: ConflictInfo[];
}

// =============================================================================
// FILTROS Y PAGINACIÓN
// =============================================================================

export interface ScheduleEventFilters {
  quarter_id?: string;
  instructor_id?: string;
  ficha_id?: string;
  sede_id?: string;
  ambiente_id?: string;
  status?: ScheduleEventStatus;
  date_from?: string;
  date_to?: string;
  day_of_week?: DayOfWeek;
}

export interface ScheduleEventListResponse {
  data: ScheduleEvent[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// =============================================================================
// CALENDARIO VIEW
// =============================================================================

export interface CalendarViewEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: EventColor;
  instructor: string;
  ficha: string;
  ambiente: string;
  resultado: string;
  status: ScheduleEventStatus;
  hasConflicts: boolean;
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarState {
  currentDate: Date;
  viewMode: CalendarViewMode;
  selectedEvent: ScheduleEvent | null;
  events: CalendarViewEvent[];
}

// =============================================================================
// SELECTOR OPTIONS (para dropdowns)
// =============================================================================

export interface SelectorOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SedeOption extends SelectorOption {
  ambientes_count: number;
}

export interface AmbienteOption extends SelectorOption {
  type: AmbienteType;
  capacity: number;
  is_available?: boolean;
}

export interface FichaOption extends SelectorOption {
  programa_name: string;
  aprendices_count: number;
}

export interface CompetenciaOption extends SelectorOption {
  code: string;
  hours_total: number;
}

export interface ResultadoOption extends SelectorOption {
  code: string;
  hours_theory: number;
  hours_practice: number;
}

// =============================================================================
// UTILS
// =============================================================================

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const AMBIENTE_TYPE_LABELS: Record<AmbienteType, string> = {
  aula: 'Aula',
  laboratorio: 'Laboratorio',
  taller: 'Taller',
  auditorio: 'Auditorio',
  virtual: 'Virtual',
};

export const EVENT_COLOR_MAP: Record<EventColor, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#8b5cf6',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  cyan: '#06b6d4',
  pink: '#ec4899',
};

export const SCHEDULE_STATUS_LABELS: Record<ScheduleEventStatus, string> = {
  draft: 'Borrador',
  scheduled: 'Programado',
  in_progress: 'En Curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  ambiente_ocupado: 'Ambiente Ocupado',
  instructor_ocupado: 'Instructor Ocupado',
  ficha_ocupada: 'Ficha Ocupada',
  capacidad_excedida: 'Capacidad Excedida',
  fuera_horario: 'Fuera de Horario',
  sede_diferente: 'Sede Diferente',
};
