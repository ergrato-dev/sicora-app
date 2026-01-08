/**
 * SICORA - Sistema de Calendario Académico
 *
 * Este archivo define todas las interfaces y tipos para el sistema de gestión
 * de horarios académicos. El sistema está diseñado para que instructores puedan
 * registrar su horario trimestral recibido en PDF de coordinación académica.
 *
 * @fileoverview Tipos TypeScript para el Calendario Académico
 * @module types/calendar
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │                    ARQUITECTURA DEL CALENDARIO                     │
 * ├────────────────────────────────────────────────────────────────────┤
 * │                                                                    │
 * │  ┌──────────────────────────────────────────────────────────────┐ │
 * │  │                         HEADER                                │ │
 * │  │ [Filtros] [◀ Semana 13-19 Ene 2026 ▶] [Día|Semana|Mes] [+]  │ │
 * │  └──────────────────────────────────────────────────────────────┘ │
 * │                                                                    │
 * │  ┌────────────────────────────────┐ ┌────────────────────────────┐│
 * │  │         CALENDARIO             │ │        SIDEBAR             ││
 * │  │                                │ │                            ││
 * │  │  ┌────┬────┬────┬────┬────┐   │ │  📊 Estadísticas           ││
 * │  │  │LUN │MAR │MIE │JUE │VIE │   │ │  ┌──────────────────┐      ││
 * │  │  ├────┼────┼────┼────┼────┤   │ │  │ Horas: 32/40     │      ││
 * │  │  │6:00│    │░░░░│    │░░░░│   │ │  │ Clases: 12       │      ││
 * │  │  │8:00│████│░░░░│████│░░░░│   │ │  └──────────────────┘      ││
 * │  │  │10:0│████│    │████│    │   │ │                            ││
 * │  │  │12:0│    │████│    │████│   │ │  📅 Próximas Clases        ││
 * │  │  │14:0│████│████│    │████│   │ │  • POO - Lun 8:00          ││
 * │  │  │16:0│████│    │    │    │   │ │  • BD - Mar 10:00          ││
 * │  │  │18:0│    │    │████│    │   │ │                            ││
 * │  │  │20:0│    │    │████│    │   │ │  🎨 Leyenda                ││
 * │  │  └────┴────┴────┴────┴────┘   │ │  ■ Mañana ■ Tarde ■ Noche  ││
 * │  │                                │ │                            ││
 * │  └────────────────────────────────┘ └────────────────────────────┘│
 * │                                                                    │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * JORNADAS ACADÉMICAS:
 *  - Mañana: 6:00 AM  a 12:00 PM (6 horas)
 *  - Tarde:  12:00 PM a  6:00 PM (6 horas)
 *  - Noche:  6:00 PM  a 10:00 PM (4 horas)
 *
 * DÍAS: Lunes a Sábado
 * PERIODO: Trimestral
 */

/* =============================================================================
   ENUMERACIONES - Valores constantes del sistema
   ============================================================================= */

/**
 * Jornadas académicas disponibles
 * Cada jornada tiene un rango horario específico
 */
export type Jornada = 'manana' | 'tarde' | 'noche';

/**
 * Mapeo de jornadas a rangos horarios
 * Hora en formato 24h
 */
export const JORNADA_CONFIG: Record<
  Jornada,
  {
    label: string;
    emoji: string;
    startHour: number;
    endHour: number;
    colorClass: string;
  }
> = {
  manana: {
    label: 'Mañana',
    emoji: '🌅',
    startHour: 6,
    endHour: 12,
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  tarde: {
    label: 'Tarde',
    emoji: '☀️',
    startHour: 12,
    endHour: 18,
    colorClass: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  noche: {
    label: 'Noche',
    emoji: '🌙',
    startHour: 18,
    endHour: 22,
    colorClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
} as const;

/**
 * Días de la semana disponibles (Lunes a Sábado)
 */
export type DiaSemana =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado';

/**
 * Mapeo de días con etiquetas
 */
export const DIA_CONFIG: Record<
  DiaSemana,
  { label: string; shortLabel: string; index: number }
> = {
  lunes: { label: 'Lunes', shortLabel: 'Lun', index: 0 },
  martes: { label: 'Martes', shortLabel: 'Mar', index: 1 },
  miercoles: { label: 'Miércoles', shortLabel: 'Mié', index: 2 },
  jueves: { label: 'Jueves', shortLabel: 'Jue', index: 3 },
  viernes: { label: 'Viernes', shortLabel: 'Vie', index: 4 },
  sabado: { label: 'Sábado', shortLabel: 'Sáb', index: 5 },
} as const;

/**
 * Vistas disponibles del calendario
 */
export type CalendarView = 'day' | 'week' | 'month';

/**
 * Estados posibles de una clase programada
 */
export type ClassStatus =
  | 'nueva' // Recién creada
  | 'confirmada' // Aprobada y activa
  | 'pendiente' // Pendiente de aprobación
  | 'conflicto' // Tiene conflicto detectado
  | 'bloqueada' // No editable
  | 'cancelada'; // Cancelada

/**
 * Configuración visual de estados
 */
export const CLASS_STATUS_CONFIG: Record<
  ClassStatus,
  {
    label: string;
    emoji: string;
    colorClass: string;
    badgeVariant: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
  }
> = {
  nueva: {
    label: 'Nueva',
    emoji: '🎯',
    colorClass: 'bg-blue-50 border-blue-400',
    badgeVariant: 'default',
  },
  confirmada: {
    label: 'Confirmada',
    emoji: '✓',
    colorClass: 'bg-green-50 border-green-400',
    badgeVariant: 'success',
  },
  pendiente: {
    label: 'Pendiente',
    emoji: '⏳',
    colorClass: 'bg-yellow-50 border-yellow-400',
    badgeVariant: 'warning',
  },
  conflicto: {
    label: 'Conflicto',
    emoji: '⚠️',
    colorClass: 'bg-red-50 border-red-400',
    badgeVariant: 'destructive',
  },
  bloqueada: {
    label: 'Bloqueada',
    emoji: '🔒',
    colorClass: 'bg-gray-50 border-gray-400',
    badgeVariant: 'outline',
  },
  cancelada: {
    label: 'Cancelada',
    emoji: '❌',
    colorClass: 'bg-red-100 border-red-500 opacity-60',
    badgeVariant: 'destructive',
  },
} as const;

/**
 * Tipos de conflicto detectables
 */
export type ConflictType =
  | 'instructor' // Mismo instructor en dos lugares
  | 'salon' // Mismo salón ocupado
  | 'grupo'; // Mismo grupo en dos clases

/**
 * Severidad del conflicto
 */
export type ConflictSeverity = 'critical' | 'warning' | 'suggestion';

/**
 * Configuración visual de severidades
 */
export const CONFLICT_SEVERITY_CONFIG: Record<
  ConflictSeverity,
  {
    label: string;
    emoji: string;
    colorClass: string;
    description: string;
  }
> = {
  critical: {
    label: 'Crítico',
    emoji: '🔴',
    colorClass: 'bg-red-100 text-red-800 border-red-400',
    description: 'Debe resolverse antes de guardar',
  },
  warning: {
    label: 'Advertencia',
    emoji: '🟠',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-400',
    description: 'Revisar antes de confirmar',
  },
  suggestion: {
    label: 'Sugerencia',
    emoji: '🟡',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    description: 'Recomendación de optimización',
  },
} as const;

/**
 * Patrón de recurrencia para clases
 */
export type RecurrencePattern =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'custom'
  | 'none';

/* =============================================================================
   INTERFACES - Estructuras de datos principales
   ============================================================================= */

/**
 * Hora específica del día
 */
export interface TimeSlot {
  hour: number; // 0-23
  minutes: number; // 0, 15, 30, 45 (intervalos de 15 min)
}

/**
 * Rango horario
 */
export interface TimeRange {
  start: TimeSlot;
  end: TimeSlot;
}

/**
 * Trimestre académico
 */
export interface Trimestre {
  id: string;
  numero: 1 | 2 | 3 | 4; // Trimestre del año
  anio: number;
  fechaInicio: Date;
  fechaFin: Date;
  activo: boolean;
}

/**
 * Sede de formación
 */
export interface Sede {
  id: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  activa: boolean;
}

/**
 * Ambiente/Salón de formación
 */
export interface Ambiente {
  id: string;
  sedeId: string;
  nombre: string;
  codigo: string;
  tipo: 'aula' | 'laboratorio' | 'taller' | 'virtual' | 'otro';
  capacidad: number;
  equipamiento?: string[];
  activo: boolean;
}

/**
 * Instructor/Formador
 */
export interface Instructor {
  id: string;
  nombre: string;
  email: string;
  documento: string;
  especialidad?: string;
  activo: boolean;
}

/**
 * Grupo de aprendices
 */
export interface Grupo {
  id: string;
  codigo: string;
  nombre: string;
  programaId: string;
  cantidadAprendices: number;
  jornada: Jornada;
  activo: boolean;
}

/**
 * Resultado de Aprendizaje / Materia
 */
export interface ResultadoAprendizaje {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  competenciaId?: string;
  horasEstimadas?: number;
  color?: string; // Color personalizado para el calendario
}

/**
 * Clase programada (bloque en el calendario)
 *
 * ┌─────────────────────────────────────┐
 * │ █████████████████████████████████  │ ← Bloque de clase
 * │ ║ POO - Programación              ║  │
 * │ ║ 📍 Aula 205                     ║  │
 * │ ║ 👥 ADSO-2024-01                 ║  │
 * │ ║ 8:00 AM - 10:00 AM              ║  │
 * │ █████████████████████████████████  │
 * └─────────────────────────────────────┘
 */
export interface ClaseProgramada {
  id: string;

  // Información académica (Qué)
  resultadoAprendizaje: ResultadoAprendizaje;
  instructorId: string;
  grupoId: string;

  // Ubicación (Dónde)
  sedeId: string;
  ambienteId: string;

  // Temporalidad (Cuándo)
  fecha: Date; // Fecha específica de esta instancia
  horaInicio: TimeSlot;
  horaFin: TimeSlot;
  jornada: Jornada;

  // Recurrencia
  recurrencia: RecurrencePattern;
  diasRecurrencia?: DiaSemana[]; // Si es semanal, qué días
  fechaInicioRecurrencia?: Date;
  fechaFinRecurrencia?: Date;
  recurrenciaId?: string; // ID del patrón de recurrencia (para editar todas)

  // Estado
  estado: ClassStatus;
  conflictos?: Conflict[];

  // Metadatos
  notas?: string;
  color?: string; // Color personalizado
  creadoPor: string;
  fechaCreacion: Date;
  ultimaModificacion?: Date;
  modificadoPor?: string;
}

/**
 * Conflicto detectado
 */
export interface Conflict {
  id: string;
  tipo: ConflictType;
  severidad: ConflictSeverity;
  mensaje: string;
  claseConflicto?: ClaseProgramada; // Clase con la que hay conflicto
  sugerencia?: string;
}

/* =============================================================================
   INTERFACES DE FORMULARIO - Wizard de 4 pasos
   ============================================================================= */

/**
 * Paso 1: ¿Qué enseñas?
 */
export interface ScheduleFormStep1 {
  resultadoAprendizajeId: string;
  grupoId: string;
}

/**
 * Paso 2: ¿Dónde?
 */
export interface ScheduleFormStep2 {
  sedeId: string;
  ambienteId: string;
}

/**
 * Paso 3: ¿Cuándo?
 */
export interface ScheduleFormStep3 {
  jornada: Jornada;
  diasSemana: DiaSemana[];
  horaInicio: TimeSlot;
  horaFin: TimeSlot;
  recurrencia: RecurrencePattern;
  fechaInicio: Date;
  fechaFin: Date;
}

/**
 * Datos completos del formulario
 */
export interface ScheduleFormData
  extends ScheduleFormStep1,
    ScheduleFormStep2,
    ScheduleFormStep3 {
  notas?: string;
  color?: string;
}

/**
 * Estado del formulario wizard
 */
export interface ScheduleFormState {
  currentStep: 1 | 2 | 3 | 4;
  data: Partial<ScheduleFormData>;
  isValid: boolean;
  errors: Record<string, string>;
  conflictosDetectados: Conflict[];
}

/* =============================================================================
   INTERFACES DE UI - Componentes del calendario
   ============================================================================= */

/**
 * Celda de la grilla del calendario
 */
export interface CalendarCell {
  date: Date;
  dia: DiaSemana;
  hora: number;
  isToday: boolean;
  isCurrentHour: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  clases: ClaseProgramada[];
  disponible: boolean;
}

/**
 * Rango de fechas para la vista actual
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Filtros activos del calendario
 */
export interface CalendarFilters {
  sede?: string;
  ambiente?: string;
  jornada?: Jornada[];
  instructor?: string;
  grupo?: string;
  estado?: ClassStatus[];
  trimestre?: string;
  busqueda?: string;
}

/**
 * Configuración de visualización
 */
export interface CalendarDisplayConfig {
  showWeekends: boolean;
  showConflicts: boolean;
  showStatistics: boolean;
  showMiniCalendar: boolean;
  showLegend: boolean;
  colorByJornada: boolean;
  hourHeight: number; // Altura en px de cada hora
  startHour: number; // Hora inicial visible (default: 6)
  endHour: number; // Hora final visible (default: 22)
  density: 'compact' | 'comfortable' | 'spacious';
}

/**
 * Estado de drag & drop
 */
export interface DragState {
  isDragging: boolean;
  draggedClass?: ClaseProgramada;
  dropTarget?: CalendarCell;
  previewConflicts?: Conflict[];
}

/**
 * Estado de selección múltiple
 */
export interface SelectionState {
  selectedClasses: string[]; // IDs de clases seleccionadas
  isSelecting: boolean;
  selectionStart?: CalendarCell;
  selectionEnd?: CalendarCell;
}

/**
 * Estadísticas del calendario
 */
export interface CalendarStats {
  totalHoras: number;
  horasProgramadas: number;
  horasDisponibles: number;
  totalClases: number;
  clasesPorJornada: Record<Jornada, number>;
  clasesPorDia: Record<DiaSemana, number>;
  conflictosActivos: number;
  ocupacionSalones: Record<string, number>; // porcentaje
}

/* =============================================================================
   INTERFACES DE HOOKS - Gestión de estado
   ============================================================================= */

/**
 * Estado completo del calendario
 */
export interface CalendarState {
  // Vista actual
  view: CalendarView;
  currentDate: Date;
  dateRange: DateRange;

  // Datos
  clases: ClaseProgramada[];
  clasesVisibles: ClaseProgramada[];

  // Filtros
  filters: CalendarFilters;
  savedFilters: { name: string; filters: CalendarFilters }[];

  // UI State
  displayConfig: CalendarDisplayConfig;
  dragState: DragState;
  selectionState: SelectionState;

  // Modales/Drawers
  selectedClass?: ClaseProgramada;
  isDetailsPanelOpen: boolean;
  isFormOpen: boolean;
  formMode: 'create' | 'edit';
  formInitialData?: Partial<ScheduleFormData>;

  // Loading/Error
  isLoading: boolean;
  error?: string;

  // Estadísticas
  stats: CalendarStats;
}

/**
 * Acciones del calendario
 */
export interface CalendarActions {
  // Navegación
  setView: (view: CalendarView) => void;
  goToDate: (date: Date) => void;
  goToday: () => void;
  goNext: () => void;
  goPrevious: () => void;

  // CRUD Clases
  createClass: (data: ScheduleFormData) => Promise<ClaseProgramada>;
  updateClass: (
    id: string,
    data: Partial<ClaseProgramada>
  ) => Promise<ClaseProgramada>;
  deleteClass: (id: string) => Promise<void>;
  duplicateClass: (
    id: string,
    options?: DuplicateOptions
  ) => Promise<ClaseProgramada[]>;

  // Filtros
  setFilter: (
    key: keyof CalendarFilters,
    value: CalendarFilters[typeof key]
  ) => void;
  clearFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (name: string) => void;

  // Selección
  selectClass: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Drag & Drop
  startDrag: (clase: ClaseProgramada) => void;
  updateDragTarget: (cell: CalendarCell) => void;
  endDrag: () => void;
  cancelDrag: () => void;

  // UI
  openDetails: (clase: ClaseProgramada) => void;
  closeDetails: () => void;
  openForm: (
    mode: 'create' | 'edit',
    initialData?: Partial<ScheduleFormData>
  ) => void;
  closeForm: () => void;
  updateDisplayConfig: (config: Partial<CalendarDisplayConfig>) => void;

  // Conflictos
  checkConflicts: (clase: ClaseProgramada | ScheduleFormData) => Conflict[];
  resolveConflict: (conflictId: string, resolution: ConflictResolution) => void;

  // Exportación
  exportCalendar: (
    format: ExportFormat,
    options?: ExportOptions
  ) => Promise<Blob>;

  // Bulk Actions
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkUpdate: (ids: string[], data: Partial<ClaseProgramada>) => Promise<void>;
}

/**
 * Opciones de duplicación
 */
export interface DuplicateOptions {
  targetDates?: Date[];
  targetTrimestre?: string;
  offsetDays?: number;
  newAmbiente?: string;
  newInstructor?: string;
}

/**
 * Resolución de conflicto
 */
export interface ConflictResolution {
  action: 'keep' | 'replace' | 'move' | 'cancel';
  targetDate?: Date;
  targetAmbiente?: string;
}

/**
 * Formato de exportación
 */
export type ExportFormat = 'pdf' | 'excel' | 'ical' | 'png';

/**
 * Opciones de exportación
 */
export interface ExportOptions {
  dateRange?: DateRange;
  includeNotes?: boolean;
  includeStats?: boolean;
  paperSize?: 'a4' | 'letter' | 'a3';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Return type del hook useCalendar
 */
export interface UseCalendarReturn extends CalendarState, CalendarActions {}

/* =============================================================================
   INTERFACES DE ACCESIBILIDAD
   ============================================================================= */

/**
 * Atajos de teclado del calendario
 */
export const CALENDAR_KEYBOARD_SHORTCUTS = {
  // Navegación
  ArrowRight: 'Siguiente día',
  ArrowLeft: 'Día anterior',
  ArrowUp: 'Bloque anterior',
  ArrowDown: 'Siguiente bloque',

  // Acciones
  Enter: 'Abrir detalles',
  n: 'Nueva clase',
  t: 'Ir a hoy',
  d: 'Vista día',
  w: 'Vista semana',
  m: 'Vista mes',
  Escape: 'Cerrar modal',

  // Edición
  Delete: 'Eliminar seleccionado',
  'Ctrl+c': 'Copiar clase',
  'Ctrl+v': 'Pegar clase',
  'Ctrl+z': 'Deshacer',
  'Ctrl+y': 'Rehacer',
} as const;

/**
 * Labels ARIA para accesibilidad
 */
export interface CalendarAriaLabels {
  calendar: string;
  navigation: string;
  viewSelector: string;
  dayView: string;
  weekView: string;
  monthView: string;
  classBlock: (clase: ClaseProgramada) => string;
  timeSlot: (hora: number, dia: DiaSemana) => string;
  conflict: (conflict: Conflict) => string;
}

/**
 * Labels por defecto
 */
export const DEFAULT_ARIA_LABELS: CalendarAriaLabels = {
  calendar: 'Calendario de horarios académicos',
  navigation: 'Navegación del calendario',
  viewSelector: 'Selector de vista del calendario',
  dayView: 'Vista diaria',
  weekView: 'Vista semanal',
  monthView: 'Vista mensual',
  classBlock: (clase) =>
    `Clase de ${clase.resultadoAprendizaje.nombre}, ${
      DIA_CONFIG[getDayFromDate(clase.fecha)].label
    } ${formatTime(clase.horaInicio)} a ${formatTime(clase.horaFin)}`,
  timeSlot: (hora, dia) =>
    `Bloque horario ${hora}:00 del ${DIA_CONFIG[dia].label}, disponible para programar`,
  conflict: (conflict) =>
    `Conflicto ${CONFLICT_SEVERITY_CONFIG[conflict.severidad].label}: ${
      conflict.mensaje
    }`,
};

/* =============================================================================
   FUNCIONES UTILITARIAS DE TIPOS
   ============================================================================= */

/**
 * Obtiene el día de la semana de una fecha
 */
export function getDayFromDate(date: Date): DiaSemana {
  const days: DiaSemana[] = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'lunes',
  ];
  const dayIndex = date.getDay(); // 0 = Sunday
  // Ajustar porque getDay() devuelve 0 para Domingo
  return dayIndex === 0 ? 'sabado' : days[dayIndex - 1];
}

/**
 * Formatea un TimeSlot a string legible
 */
export function formatTime(time: TimeSlot): string {
  const hour12 =
    time.hour > 12 ? time.hour - 12 : time.hour === 0 ? 12 : time.hour;
  const period = time.hour >= 12 ? 'PM' : 'AM';
  const minutes = time.minutes.toString().padStart(2, '0');
  return `${hour12}:${minutes} ${period}`;
}

/**
 * Formatea un TimeSlot a string de 24h
 */
export function formatTime24(time: TimeSlot): string {
  return `${time.hour.toString().padStart(2, '0')}:${time.minutes
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Calcula la duración en horas entre dos TimeSlots
 */
export function getDurationHours(start: TimeSlot, end: TimeSlot): number {
  const startMinutes = start.hour * 60 + start.minutes;
  const endMinutes = end.hour * 60 + end.minutes;
  return (endMinutes - startMinutes) / 60;
}

/**
 * Determina la jornada de una hora específica
 */
export function getJornadaFromHour(hour: number): Jornada {
  if (hour >= 6 && hour < 12) return 'manana';
  if (hour >= 12 && hour < 18) return 'tarde';
  return 'noche';
}

/**
 * Type guard para verificar si un objeto es ClaseProgramada
 */
export function isClaseProgramada(obj: unknown): obj is ClaseProgramada {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'resultadoAprendizaje' in obj &&
    'fecha' in obj &&
    'horaInicio' in obj &&
    'horaFin' in obj
  );
}

/**
 * Valores por defecto para configuración de visualización
 */
export const DEFAULT_DISPLAY_CONFIG: CalendarDisplayConfig = {
  showWeekends: true,
  showConflicts: true,
  showStatistics: true,
  showMiniCalendar: true,
  showLegend: true,
  colorByJornada: true,
  hourHeight: 60,
  startHour: 6,
  endHour: 22,
  density: 'comfortable',
};

/**
 * Estado inicial del calendario
 */
export const INITIAL_CALENDAR_STATE: Omit<
  CalendarState,
  'clases' | 'clasesVisibles' | 'stats'
> = {
  view: 'week',
  currentDate: new Date(),
  dateRange: {
    start: new Date(),
    end: new Date(),
  },
  filters: {},
  savedFilters: [],
  displayConfig: DEFAULT_DISPLAY_CONFIG,
  dragState: {
    isDragging: false,
  },
  selectionState: {
    selectedClasses: [],
    isSelecting: false,
  },
  isDetailsPanelOpen: false,
  isFormOpen: false,
  formMode: 'create',
  isLoading: false,
};
