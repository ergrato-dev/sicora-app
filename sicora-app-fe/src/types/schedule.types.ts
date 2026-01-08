/**
 * Tipos para el módulo de Horarios
 */

// Tipos de estado de horario
export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// Tipos de recurrencia
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

// Días de la semana
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// Colores para eventos
export type EventColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'cyan'
  | 'pink';

// Interfaz principal de Schedule
export interface Schedule {
  id: string;
  title: string;
  description?: string;
  instructor_id: string;
  instructor_name: string;
  ficha_id: string;
  ficha_code: string;
  program_name: string;
  ambiente_id: string;
  ambiente_name: string;
  date: string; // ISO date string (YYYY-MM-DD)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  status: ScheduleStatus;
  color: EventColor;
  recurrence: RecurrenceType;
  recurrence_end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Request para crear horario
export interface CreateScheduleRequest {
  title: string;
  description?: string;
  instructor_id: string;
  ficha_id: string;
  ambiente_id: string;
  date: string;
  start_time: string;
  end_time: string;
  color?: EventColor;
  recurrence?: RecurrenceType;
  recurrence_end_date?: string;
  notes?: string;
}

// Request para actualizar horario
export interface UpdateScheduleRequest {
  title?: string;
  description?: string;
  instructor_id?: string;
  ficha_id?: string;
  ambiente_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: ScheduleStatus;
  color?: EventColor;
  recurrence?: RecurrenceType;
  recurrence_end_date?: string;
  notes?: string;
}

// Filtros para horarios
export interface ScheduleFilters {
  instructor_id?: string;
  ficha_id?: string;
  ambiente_id?: string;
  status?: ScheduleStatus;
  date_from?: string;
  date_to?: string;
  day_of_week?: DayOfWeek;
}

// Respuesta paginada
export interface ScheduleListResponse {
  data: Schedule[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Horario de calendario (simplificado para vista)
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: EventColor;
  instructor: string;
  ambiente: string;
  ficha: string;
  status: ScheduleStatus;
}

// Disponibilidad de ambiente
export interface AmbienteAvailability {
  ambiente_id: string;
  ambiente_name: string;
  date: string;
  time_slots: TimeSlot[];
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  schedule_id?: string;
}

// Conflicto de horario
export interface ScheduleConflict {
  type: 'instructor' | 'ambiente' | 'ficha';
  conflicting_schedule: Schedule;
  message: string;
}

// Parámetros de paginación
export interface SchedulePaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: 'date' | 'start_time' | 'title' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Estadísticas de horarios
export interface ScheduleStats {
  total_scheduled: number;
  total_completed: number;
  total_cancelled: number;
  hours_scheduled: number;
  hours_completed: number;
  most_used_ambientes: Array<{
    ambiente_id: string;
    ambiente_name: string;
    total_hours: number;
  }>;
  busiest_days: Array<{
    day: DayOfWeek;
    total_schedules: number;
  }>;
}

// Labels para UI
export const StatusLabels: Record<ScheduleStatus, string> = {
  scheduled: 'Programado',
  in_progress: 'En Curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const DayLabels: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const RecurrenceLabels: Record<RecurrenceType, string> = {
  none: 'Sin Recurrencia',
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
};

export const ColorClasses: Record<EventColor, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
  green: { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-800' },
  red: { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-800' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800' },
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800' },
  cyan: { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-800' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-800' },
};

// Horarios laborales estándar
export const WORK_HOURS = {
  start: 6,
  end: 22,
  slots: Array.from({ length: 16 }, (_, i) => {
    const hour = i + 6;
    return {
      value: `${hour.toString().padStart(2, '0')}:00`,
      label: `${hour}:00`,
    };
  }),
};

// Colores disponibles para eventos
export const AVAILABLE_COLORS: EventColor[] = [
  'blue',
  'green',
  'purple',
  'red',
  'orange',
  'yellow',
  'cyan',
  'pink',
];
