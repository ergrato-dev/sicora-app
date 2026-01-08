/**
 * SICORA - Hook de Gestión del Calendario Académico
 *
 * Este hook centraliza toda la lógica de estado y acciones del calendario,
 * incluyendo navegación, filtros, selección, drag & drop y detección de conflictos.
 *
 * @fileoverview Hook de estado para Calendar
 * @module hooks/useCalendar
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  CalendarView,
  CalendarState,
  CalendarActions,
  CalendarFilters,
  CalendarDisplayConfig,
  CalendarStats,
  CalendarCell,
  ClaseProgramada,
  ScheduleFormData,
  Conflict,
  ConflictType,
  ConflictSeverity,
  DragState,
  SelectionState,
  DateRange,
  DuplicateOptions,
  ConflictResolution,
  ExportFormat,
  ExportOptions,
  UseCalendarReturn,
  Jornada,
  DiaSemana,
  TimeSlot,
} from '../types/calendar.types';

import {
  JORNADA_CONFIG,
  DIA_CONFIG,
  DEFAULT_DISPLAY_CONFIG,
  getJornadaFromHour,
  getDurationHours,
} from '../types/calendar.types';

/* =============================================================================
   UTILIDADES DE FECHA
   ============================================================================= */

/**
 * Obtiene el inicio de la semana (Lunes)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que Lunes sea el primer día
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtiene el fin de la semana (Sábado)
 */
function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 5); // Lunes + 5 = Sábado
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Obtiene el inicio del mes
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtiene el fin del mes
 */
function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Obtiene el rango de fechas según la vista
 */
function getDateRange(date: Date, view: CalendarView): DateRange {
  switch (view) {
    case 'day':
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      return { start: dayStart, end: dayEnd };

    case 'week':
      return { start: getWeekStart(date), end: getWeekEnd(date) };

    case 'month':
      return { start: getMonthStart(date), end: getMonthEnd(date) };

    default:
      return { start: getWeekStart(date), end: getWeekEnd(date) };
  }
}

/**
 * Formatea una fecha para mostrar
 */
function formatDateRange(range: DateRange, view: CalendarView): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  if (view === 'day') {
    return range.start.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (view === 'week') {
    const startStr = range.start.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
    const endStr = range.end.toLocaleDateString('es-ES', options);
    return `${startStr} - ${endStr}`;
  }

  return range.start.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Verifica si dos fechas son el mismo día
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Verifica si una fecha está en un rango
 */
function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

/**
 * Obtiene el día de la semana de una fecha
 */
function getDiaSemana(date: Date): DiaSemana {
  const days: DiaSemana[] = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
  ];
  const dayIndex = date.getDay();
  // Ajustar porque getDay() devuelve 0 para Domingo
  return dayIndex === 0 ? 'sabado' : days[dayIndex - 1];
}

/* =============================================================================
   UTILIDADES DE CONFLICTOS
   ============================================================================= */

/**
 * Verifica si dos rangos horarios se solapan
 */
function timeRangesOverlap(
  start1: TimeSlot,
  end1: TimeSlot,
  start2: TimeSlot,
  end2: TimeSlot
): boolean {
  const start1Minutes = start1.hour * 60 + start1.minutes;
  const end1Minutes = end1.hour * 60 + end1.minutes;
  const start2Minutes = start2.hour * 60 + start2.minutes;
  const end2Minutes = end2.hour * 60 + end2.minutes;

  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
}

/**
 * Detecta conflictos para una clase
 */
function detectConflicts(
  clase: ClaseProgramada | ScheduleFormData,
  allClases: ClaseProgramada[],
  excludeId?: string
): Conflict[] {
  const conflicts: Conflict[] = [];

  const fecha = 'fecha' in clase ? clase.fecha : new Date();
  const instructorId = 'instructorId' in clase ? clase.instructorId : '';
  const ambienteId = 'ambienteId' in clase ? clase.ambienteId : '';
  const grupoId = 'grupoId' in clase ? clase.grupoId : '';

  // Filtrar clases del mismo día (excluyendo la clase actual si es edición)
  const clasesDelDia = allClases.filter(
    (c) =>
      isSameDay(c.fecha, fecha) &&
      c.id !== excludeId &&
      c.estado !== 'cancelada'
  );

  for (const otraClase of clasesDelDia) {
    // Verificar solapamiento de horarios
    if (
      !timeRangesOverlap(
        clase.horaInicio,
        clase.horaFin,
        otraClase.horaInicio,
        otraClase.horaFin
      )
    ) {
      continue; // No hay solapamiento, siguiente clase
    }

    // Conflicto de instructor
    if (instructorId && instructorId === otraClase.instructorId) {
      conflicts.push({
        id: `conflict-instructor-${otraClase.id}`,
        tipo: 'instructor',
        severidad: 'critical',
        mensaje: `El instructor ya tiene clase de "${otraClase.resultadoAprendizaje.nombre}" en este horario`,
        claseConflicto: otraClase,
        sugerencia: 'Cambiar el horario o asignar otro instructor',
      });
    }

    // Conflicto de salón
    if (ambienteId && ambienteId === otraClase.ambienteId) {
      conflicts.push({
        id: `conflict-salon-${otraClase.id}`,
        tipo: 'salon',
        severidad: 'critical',
        mensaje: `El salón ya está ocupado por "${otraClase.resultadoAprendizaje.nombre}"`,
        claseConflicto: otraClase,
        sugerencia: 'Seleccionar otro ambiente disponible',
      });
    }

    // Conflicto de grupo
    if (grupoId && grupoId === otraClase.grupoId) {
      conflicts.push({
        id: `conflict-grupo-${otraClase.id}`,
        tipo: 'grupo',
        severidad: 'critical',
        mensaje: `El grupo ya tiene clase de "${otraClase.resultadoAprendizaje.nombre}" en este horario`,
        claseConflicto: otraClase,
        sugerencia: 'Verificar el horario del grupo',
      });
    }
  }

  return conflicts;
}

/* =============================================================================
   UTILIDADES DE ESTADÍSTICAS
   ============================================================================= */

/**
 * Calcula estadísticas del calendario
 */
function calculateStats(
  clases: ClaseProgramada[],
  dateRange: DateRange
): CalendarStats {
  const clasesEnRango = clases.filter(
    (c) => isDateInRange(c.fecha, dateRange) && c.estado !== 'cancelada'
  );

  const horasProgramadas = clasesEnRango.reduce((acc, c) => {
    return acc + getDurationHours(c.horaInicio, c.horaFin);
  }, 0);

  const clasesPorJornada: Record<Jornada, number> = {
    manana: 0,
    tarde: 0,
    noche: 0,
  };

  const clasesPorDia: Record<DiaSemana, number> = {
    lunes: 0,
    martes: 0,
    miercoles: 0,
    jueves: 0,
    viernes: 0,
    sabado: 0,
  };

  clasesEnRango.forEach((c) => {
    clasesPorJornada[c.jornada]++;
    const dia = getDiaSemana(c.fecha);
    clasesPorDia[dia]++;
  });

  const conflictosActivos = clasesEnRango.filter(
    (c) => c.conflictos && c.conflictos.length > 0
  ).length;

  // Horas totales disponibles (16 horas x 6 días = 96 horas por semana)
  const diasEnRango = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const totalHoras = diasEnRango * 16; // 16 horas por día (6 AM - 10 PM)

  return {
    totalHoras,
    horasProgramadas,
    horasDisponibles: totalHoras - horasProgramadas,
    totalClases: clasesEnRango.length,
    clasesPorJornada,
    clasesPorDia,
    conflictosActivos,
    ocupacionSalones: {}, // Se calcularía con datos de ambientes
  };
}

/* =============================================================================
   HOOK PRINCIPAL
   ============================================================================= */

export interface UseCalendarOptions {
  initialClases?: ClaseProgramada[];
  initialView?: CalendarView;
  initialDate?: Date;
  initialFilters?: CalendarFilters;
  displayConfig?: Partial<CalendarDisplayConfig>;
  onClassCreate?: (clase: ClaseProgramada) => void;
  onClassUpdate?: (clase: ClaseProgramada) => void;
  onClassDelete?: (id: string) => void;
}

export function useCalendar(
  options: UseCalendarOptions = {}
): UseCalendarReturn {
  const {
    initialClases = [],
    initialView = 'week',
    initialDate = new Date(),
    initialFilters = {},
    displayConfig: initialDisplayConfig = {},
    onClassCreate,
    onClassUpdate,
    onClassDelete,
  } = options;

  // ==========================================================================
  // ESTADO PRINCIPAL
  // ==========================================================================

  // Vista y navegación
  const [view, setView] = useState<CalendarView>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  // Datos
  const [clases, setClases] = useState<ClaseProgramada[]>(initialClases);

  // Filtros
  const [filters, setFilters] = useState<CalendarFilters>(initialFilters);
  const [savedFilters, setSavedFilters] = useState<
    { name: string; filters: CalendarFilters }[]
  >([]);

  // Configuración de visualización
  const [displayConfig, setDisplayConfig] = useState<CalendarDisplayConfig>({
    ...DEFAULT_DISPLAY_CONFIG,
    ...initialDisplayConfig,
  });

  // Estado de drag & drop
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
  });

  // Estado de selección
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedClasses: [],
    isSelecting: false,
  });

  // UI State
  const [selectedClass, setSelectedClass] = useState<
    ClaseProgramada | undefined
  >();
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formInitialData, setFormInitialData] = useState<
    Partial<ScheduleFormData> | undefined
  >();

  // Loading/Error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // ==========================================================================
  // VALORES CALCULADOS
  // ==========================================================================

  // Rango de fechas actual
  const dateRange = useMemo(
    () => getDateRange(currentDate, view),
    [currentDate, view]
  );

  // Clases filtradas y visibles
  const clasesVisibles = useMemo(() => {
    let resultado = clases.filter((c) => isDateInRange(c.fecha, dateRange));

    // Aplicar filtros
    if (filters.sede) {
      resultado = resultado.filter((c) => c.sedeId === filters.sede);
    }
    if (filters.ambiente) {
      resultado = resultado.filter((c) => c.ambienteId === filters.ambiente);
    }
    if (filters.jornada && filters.jornada.length > 0) {
      resultado = resultado.filter((c) => filters.jornada!.includes(c.jornada));
    }
    if (filters.instructor) {
      resultado = resultado.filter(
        (c) => c.instructorId === filters.instructor
      );
    }
    if (filters.grupo) {
      resultado = resultado.filter((c) => c.grupoId === filters.grupo);
    }
    if (filters.estado && filters.estado.length > 0) {
      resultado = resultado.filter((c) => filters.estado!.includes(c.estado));
    }
    if (filters.busqueda) {
      const search = filters.busqueda.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.resultadoAprendizaje.nombre.toLowerCase().includes(search) ||
          c.resultadoAprendizaje.codigo.toLowerCase().includes(search) ||
          (c.notas && c.notas.toLowerCase().includes(search))
      );
    }

    return resultado;
  }, [clases, dateRange, filters]);

  // Estadísticas
  const stats = useMemo(
    () => calculateStats(clases, dateRange),
    [clases, dateRange]
  );

  // ==========================================================================
  // ACCIONES DE NAVEGACIÓN
  // ==========================================================================

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goNext = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const goPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  }, [currentDate, view]);

  // ==========================================================================
  // ACCIONES CRUD DE CLASES
  // ==========================================================================

  const createClass = useCallback(
    async (data: ScheduleFormData): Promise<ClaseProgramada> => {
      setIsLoading(true);
      setError(undefined);

      try {
        // Crear la nueva clase
        const nuevaClase: ClaseProgramada = {
          id: `clase-${Date.now()}`,
          resultadoAprendizaje: {
            id: data.resultadoAprendizajeId,
            codigo: '', // Se llenaría desde API
            nombre: '', // Se llenaría desde API
          },
          instructorId: '', // Se obtendría del usuario actual
          grupoId: data.grupoId,
          sedeId: data.sedeId,
          ambienteId: data.ambienteId,
          fecha: data.fechaInicio,
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
          jornada: data.jornada,
          recurrencia: data.recurrencia,
          diasRecurrencia: data.diasSemana,
          fechaInicioRecurrencia: data.fechaInicio,
          fechaFinRecurrencia: data.fechaFin,
          estado: 'nueva',
          notas: data.notas,
          color: data.color,
          creadoPor: 'current-user', // Se obtendría del usuario actual
          fechaCreacion: new Date(),
        };

        // Detectar conflictos
        const conflictos = detectConflicts(nuevaClase, clases);
        nuevaClase.conflictos = conflictos;

        if (conflictos.some((c) => c.severidad === 'critical')) {
          nuevaClase.estado = 'conflicto';
        }

        setClases((prev) => [...prev, nuevaClase]);
        onClassCreate?.(nuevaClase);

        return nuevaClase;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al crear la clase';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clases, onClassCreate]
  );

  const updateClass = useCallback(
    async (
      id: string,
      data: Partial<ClaseProgramada>
    ): Promise<ClaseProgramada> => {
      setIsLoading(true);
      setError(undefined);

      try {
        let claseActualizada: ClaseProgramada | undefined;

        setClases((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              claseActualizada = {
                ...c,
                ...data,
                ultimaModificacion: new Date(),
              };

              // Re-detectar conflictos
              const conflictos = detectConflicts(claseActualizada, prev, id);
              claseActualizada.conflictos = conflictos;

              if (conflictos.some((cf) => cf.severidad === 'critical')) {
                claseActualizada.estado = 'conflicto';
              } else if (claseActualizada.estado === 'conflicto') {
                claseActualizada.estado = 'confirmada';
              }

              return claseActualizada;
            }
            return c;
          })
        );

        if (!claseActualizada) {
          throw new Error('Clase no encontrada');
        }

        onClassUpdate?.(claseActualizada);
        return claseActualizada;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al actualizar la clase';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onClassUpdate]
  );

  const deleteClass = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(undefined);

      try {
        setClases((prev) => prev.filter((c) => c.id !== id));
        onClassDelete?.(id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al eliminar la clase';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onClassDelete]
  );

  const duplicateClass = useCallback(
    async (
      id: string,
      options?: DuplicateOptions
    ): Promise<ClaseProgramada[]> => {
      const claseOriginal = clases.find((c) => c.id === id);
      if (!claseOriginal) {
        throw new Error('Clase no encontrada');
      }

      const nuevasClases: ClaseProgramada[] = [];

      if (options?.targetDates) {
        for (const targetDate of options.targetDates) {
          const nuevaClase: ClaseProgramada = {
            ...claseOriginal,
            id: `clase-${Date.now()}-${Math.random()}`,
            fecha: targetDate,
            ambienteId: options.newAmbiente || claseOriginal.ambienteId,
            instructorId: options.newInstructor || claseOriginal.instructorId,
            estado: 'nueva',
            creadoPor: 'current-user',
            fechaCreacion: new Date(),
            ultimaModificacion: undefined,
            modificadoPor: undefined,
          };

          nuevaClase.conflictos = detectConflicts(nuevaClase, [
            ...clases,
            ...nuevasClases,
          ]);
          if (nuevaClase.conflictos.some((c) => c.severidad === 'critical')) {
            nuevaClase.estado = 'conflicto';
          }

          nuevasClases.push(nuevaClase);
        }
      } else if (options?.offsetDays) {
        const nuevaFecha = new Date(claseOriginal.fecha);
        nuevaFecha.setDate(nuevaFecha.getDate() + options.offsetDays);

        const nuevaClase: ClaseProgramada = {
          ...claseOriginal,
          id: `clase-${Date.now()}`,
          fecha: nuevaFecha,
          estado: 'nueva',
          creadoPor: 'current-user',
          fechaCreacion: new Date(),
        };

        nuevaClase.conflictos = detectConflicts(nuevaClase, clases);
        if (nuevaClase.conflictos.some((c) => c.severidad === 'critical')) {
          nuevaClase.estado = 'conflicto';
        }

        nuevasClases.push(nuevaClase);
      }

      setClases((prev) => [...prev, ...nuevasClases]);
      return nuevasClases;
    },
    [clases]
  );

  // ==========================================================================
  // ACCIONES DE FILTROS
  // ==========================================================================

  const setFilter = useCallback(
    <K extends keyof CalendarFilters>(key: K, value: CalendarFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const saveFilter = useCallback(
    (name: string) => {
      setSavedFilters((prev) => {
        const existing = prev.findIndex((f) => f.name === name);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { name, filters };
          return updated;
        }
        return [...prev, { name, filters }];
      });
    },
    [filters]
  );

  const loadFilter = useCallback(
    (name: string) => {
      const saved = savedFilters.find((f) => f.name === name);
      if (saved) {
        setFilters(saved.filters);
      }
    },
    [savedFilters]
  );

  // ==========================================================================
  // ACCIONES DE SELECCIÓN
  // ==========================================================================

  const selectClass = useCallback((id: string) => {
    setSelectionState((prev) => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(id)
        ? prev.selectedClasses.filter((i) => i !== id)
        : [...prev.selectedClasses, id],
    }));
  }, []);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectionState((prev) => ({
      ...prev,
      selectedClasses: ids,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState({
      selectedClasses: [],
      isSelecting: false,
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectionState({
      selectedClasses: clasesVisibles.map((c) => c.id),
      isSelecting: false,
    });
  }, [clasesVisibles]);

  // ==========================================================================
  // ACCIONES DE DRAG & DROP
  // ==========================================================================

  const startDrag = useCallback((clase: ClaseProgramada) => {
    setDragState({
      isDragging: true,
      draggedClass: clase,
    });
  }, []);

  const updateDragTarget = useCallback(
    (cell: CalendarCell) => {
      if (!dragState.draggedClass) return;

      // Crear preview de la clase en la nueva posición
      const previewClase: ClaseProgramada = {
        ...dragState.draggedClass,
        fecha: cell.date,
        horaInicio: { hour: cell.hora, minutes: 0 },
        horaFin: {
          hour:
            cell.hora +
            getDurationHours(
              dragState.draggedClass.horaInicio,
              dragState.draggedClass.horaFin
            ),
          minutes: dragState.draggedClass.horaFin.minutes,
        },
      };

      // Detectar conflictos en la nueva posición
      const previewConflicts = detectConflicts(
        previewClase,
        clases,
        dragState.draggedClass.id
      );

      setDragState((prev) => ({
        ...prev,
        dropTarget: cell,
        previewConflicts,
      }));
    },
    [dragState.draggedClass, clases]
  );

  const endDrag = useCallback(async () => {
    if (!dragState.draggedClass || !dragState.dropTarget) {
      setDragState({ isDragging: false });
      return;
    }

    const { draggedClass, dropTarget } = dragState;

    // Calcular nueva posición
    const duracion = getDurationHours(
      draggedClass.horaInicio,
      draggedClass.horaFin
    );

    await updateClass(draggedClass.id, {
      fecha: dropTarget.date,
      horaInicio: { hour: dropTarget.hora, minutes: 0 },
      horaFin: {
        hour: dropTarget.hora + duracion,
        minutes: draggedClass.horaFin.minutes,
      },
      jornada: getJornadaFromHour(dropTarget.hora),
    });

    setDragState({ isDragging: false });
  }, [dragState, updateClass]);

  const cancelDrag = useCallback(() => {
    setDragState({ isDragging: false });
  }, []);

  // ==========================================================================
  // ACCIONES DE UI
  // ==========================================================================

  const openDetails = useCallback((clase: ClaseProgramada) => {
    setSelectedClass(clase);
    setIsDetailsPanelOpen(true);
  }, []);

  const closeDetails = useCallback(() => {
    setIsDetailsPanelOpen(false);
    setSelectedClass(undefined);
  }, []);

  const openForm = useCallback(
    (mode: 'create' | 'edit', initialData?: Partial<ScheduleFormData>) => {
      setFormMode(mode);
      setFormInitialData(initialData);
      setIsFormOpen(true);
    },
    []
  );

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setFormMode('create');
    setFormInitialData(undefined);
  }, []);

  const updateDisplayConfig = useCallback(
    (config: Partial<CalendarDisplayConfig>) => {
      setDisplayConfig((prev) => ({ ...prev, ...config }));
    },
    []
  );

  // ==========================================================================
  // ACCIONES DE CONFLICTOS
  // ==========================================================================

  const checkConflicts = useCallback(
    (clase: ClaseProgramada | ScheduleFormData): Conflict[] => {
      const excludeId = 'id' in clase ? clase.id : undefined;
      return detectConflicts(clase, clases, excludeId);
    },
    [clases]
  );

  const resolveConflict = useCallback(
    (conflictId: string, resolution: ConflictResolution) => {
      // Implementar lógica de resolución según la acción
      console.log('Resolver conflicto:', conflictId, resolution);
    },
    []
  );

  // ==========================================================================
  // ACCIONES DE EXPORTACIÓN
  // ==========================================================================

  const exportCalendar = useCallback(
    async (format: ExportFormat, options?: ExportOptions): Promise<Blob> => {
      // Implementación básica - en producción usaría librerías específicas
      const dataToExport = options?.dateRange
        ? clases.filter((c) => isDateInRange(c.fecha, options.dateRange!))
        : clasesVisibles;

      switch (format) {
        case 'pdf':
          // Usar html2pdf o similar
          throw new Error('Exportación PDF no implementada');

        case 'excel':
          // Usar xlsx o similar
          const csvContent = [
            [
              'Fecha',
              'Hora Inicio',
              'Hora Fin',
              'Materia',
              'Ambiente',
              'Grupo',
              'Estado',
            ].join(','),
            ...dataToExport.map((c) =>
              [
                c.fecha.toLocaleDateString('es-ES'),
                `${c.horaInicio.hour}:${c.horaInicio.minutes
                  .toString()
                  .padStart(2, '0')}`,
                `${c.horaFin.hour}:${c.horaFin.minutes
                  .toString()
                  .padStart(2, '0')}`,
                c.resultadoAprendizaje.nombre,
                c.ambienteId,
                c.grupoId,
                c.estado,
              ].join(',')
            ),
          ].join('\n');
          return new Blob([csvContent], { type: 'text/csv' });

        case 'ical':
          // Generar formato iCal
          throw new Error('Exportación iCal no implementada');

        case 'png':
          // Usar html2canvas
          throw new Error('Exportación PNG no implementada');

        default:
          throw new Error(`Formato ${format} no soportado`);
      }
    },
    [clases, clasesVisibles]
  );

  // ==========================================================================
  // ACCIONES BULK
  // ==========================================================================

  const bulkDelete = useCallback(
    async (ids: string[]): Promise<void> => {
      setIsLoading(true);
      try {
        setClases((prev) => prev.filter((c) => !ids.includes(c.id)));
        ids.forEach((id) => onClassDelete?.(id));
        clearSelection();
      } finally {
        setIsLoading(false);
      }
    },
    [onClassDelete, clearSelection]
  );

  const bulkUpdate = useCallback(
    async (ids: string[], data: Partial<ClaseProgramada>): Promise<void> => {
      setIsLoading(true);
      try {
        setClases((prev) =>
          prev.map((c) => {
            if (ids.includes(c.id)) {
              const updated = { ...c, ...data, ultimaModificacion: new Date() };
              onClassUpdate?.(updated);
              return updated;
            }
            return c;
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onClassUpdate]
  );

  // ==========================================================================
  // EFECTOS
  // ==========================================================================

  // Sincronizar clases externas
  useEffect(() => {
    if (initialClases !== clases && initialClases.length > 0) {
      setClases(initialClases);
    }
  }, [initialClases]);

  // Limpiar selección al cambiar de vista
  useEffect(() => {
    clearSelection();
  }, [view, clearSelection]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // Estado
    view,
    currentDate,
    dateRange,
    clases,
    clasesVisibles,
    filters,
    savedFilters,
    displayConfig,
    dragState,
    selectionState,
    selectedClass,
    isDetailsPanelOpen,
    isFormOpen,
    formMode,
    formInitialData,
    isLoading,
    error,
    stats,

    // Acciones de navegación
    setView,
    goToDate,
    goToday,
    goNext,
    goPrevious,

    // CRUD
    createClass,
    updateClass,
    deleteClass,
    duplicateClass,

    // Filtros
    setFilter,
    clearFilters,
    saveFilter,
    loadFilter,

    // Selección
    selectClass,
    selectMultiple,
    clearSelection,
    selectAll,

    // Drag & Drop
    startDrag,
    updateDragTarget,
    endDrag,
    cancelDrag,

    // UI
    openDetails,
    closeDetails,
    openForm,
    closeForm,
    updateDisplayConfig,

    // Conflictos
    checkConflicts,
    resolveConflict,

    // Exportación
    exportCalendar,

    // Bulk
    bulkDelete,
    bulkUpdate,
  };
}

export default useCalendar;
