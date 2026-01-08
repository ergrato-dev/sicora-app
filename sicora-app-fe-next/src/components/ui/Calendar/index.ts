/**
 * SICORA - Exports del Componente Calendar
 *
 * Barrel file para exportar todos los elementos del sistema de calendario académico.
 *
 * @fileoverview Exports del módulo Calendar
 * @module components/ui/Calendar
 */

// Componente principal
export { Calendar, type CalendarProps } from './Calendar';
export { default } from './Calendar';

// Formulario wizard
export { ScheduleForm, type ScheduleFormProps } from './ScheduleForm';

// Variantes de estilo
export { calendarVariants } from './calendar-variants';

// Re-exportar tipos desde el módulo de tipos
export type {
  // Enumeraciones y constantes
  Jornada,
  DiaSemana,
  CalendarView,
  ClassStatus,
  ConflictType,
  ConflictSeverity,
  RecurrencePattern,

  // Interfaces principales
  TimeSlot,
  TimeRange,
  Trimestre,
  Sede,
  Ambiente,
  Instructor,
  Grupo,
  ResultadoAprendizaje,
  ClaseProgramada,
  Conflict,

  // Formulario
  ScheduleFormStep1,
  ScheduleFormStep2,
  ScheduleFormStep3,
  ScheduleFormData,
  ScheduleFormState,

  // UI
  CalendarCell,
  DateRange,
  CalendarFilters,
  CalendarDisplayConfig,
  DragState,
  SelectionState,
  CalendarStats,

  // Hook
  CalendarState,
  CalendarActions,
  DuplicateOptions,
  ConflictResolution,
  ExportFormat,
  ExportOptions,
  UseCalendarReturn,

  // Accesibilidad
  CalendarAriaLabels,
} from '../../../types/calendar.types';

// Re-exportar constantes de configuración
export {
  JORNADA_CONFIG,
  DIA_CONFIG,
  CLASS_STATUS_CONFIG,
  CONFLICT_SEVERITY_CONFIG,
  CALENDAR_KEYBOARD_SHORTCUTS,
  DEFAULT_ARIA_LABELS,
  DEFAULT_DISPLAY_CONFIG,
  INITIAL_CALENDAR_STATE,

  // Funciones utilitarias
  getDayFromDate,
  formatTime,
  formatTime24,
  getDurationHours,
  getJornadaFromHour,
  isClaseProgramada,
} from '../../../types/calendar.types';

// Hook
export {
  useCalendar,
  type UseCalendarOptions,
} from '../../../hooks/useCalendar';
