/**
 * SICORA - Componente de Calendario Académico
 *
 * Sistema de gestión de horarios académicos con vistas de día, semana y mes.
 * Permite a instructores registrar su horario trimestral con detección de conflictos,
 * drag & drop, y múltiples funcionalidades de edición.
 *
 * @fileoverview Componente principal Calendar
 * @module components/ui/Calendar/Calendar
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │                    ESTRUCTURA DEL COMPONENTE                       │
 * ├────────────────────────────────────────────────────────────────────┤
 * │                                                                    │
 * │  CalendarProvider (Context)                                        │
 * │    │                                                               │
 * │    ├── Calendar (Container Principal)                              │
 * │    │     │                                                         │
 * │    │     ├── CalendarHeader                                        │
 * │    │     │     ├── CalendarFilters                                 │
 * │    │     │     ├── CalendarNavigation                              │
 * │    │     │     ├── ViewSelector                                    │
 * │    │     │     └── ActionButtons                                   │
 * │    │     │                                                         │
 * │    │     ├── CalendarBody                                          │
 * │    │     │     ├── DayView                                         │
 * │    │     │     ├── WeekView                                        │
 * │    │     │     │     ├── GridHeader (días)                         │
 * │    │     │     │     ├── TimeColumn (horas)                        │
 * │    │     │     │     └── ClassBlocks                               │
 * │    │     │     └── MonthView                                       │
 * │    │     │                                                         │
 * │    │     └── CalendarSidebar (opcional)                            │
 * │    │           ├── Statistics                                      │
 * │    │           ├── UpcomingClasses                                 │
 * │    │           ├── MiniCalendar                                    │
 * │    │           └── Legend                                          │
 * │    │                                                               │
 * │    ├── DetailsPanel (Drawer)                                       │
 * │    └── ScheduleFormModal (Dialog)                                  │
 * │                                                                    │
 * └────────────────────────────────────────────────────────────────────┘
 */

'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  X,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Settings,
  Search,
  Check,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { calendarVariants } from './calendar-variants';
import {
  useCalendar,
  type UseCalendarOptions,
} from '../../../hooks/useCalendar';
import type {
  CalendarView,
  ClaseProgramada,
  CalendarFilters,
  Jornada,
  DiaSemana,
  TimeSlot,
  Conflict,
  CalendarStats,
  CalendarDisplayConfig,
  JORNADA_CONFIG,
  DIA_CONFIG,
  CLASS_STATUS_CONFIG,
  CONFLICT_SEVERITY_CONFIG,
  UseCalendarReturn,
  formatTime,
  getJornadaFromHour,
} from '../../../types/calendar.types';

/* =============================================================================
   CONSTANTES
   ============================================================================= */

const JORNADA_CONFIG_DATA: Record<
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
};

const DIA_CONFIG_DATA: Record<
  DiaSemana,
  { label: string; shortLabel: string; index: number }
> = {
  lunes: { label: 'Lunes', shortLabel: 'Lun', index: 0 },
  martes: { label: 'Martes', shortLabel: 'Mar', index: 1 },
  miercoles: { label: 'Miércoles', shortLabel: 'Mié', index: 2 },
  jueves: { label: 'Jueves', shortLabel: 'Jue', index: 3 },
  viernes: { label: 'Viernes', shortLabel: 'Vie', index: 4 },
  sabado: { label: 'Sábado', shortLabel: 'Sáb', index: 5 },
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM a 10 PM
const DIAS: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

/* =============================================================================
   CONTEXT
   ============================================================================= */

const CalendarContext = createContext<UseCalendarReturn | null>(null);

function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      'useCalendarContext debe usarse dentro de CalendarProvider'
    );
  }
  return context;
}

/* =============================================================================
   UTILIDADES
   ============================================================================= */

function formatTimeSlot(time: TimeSlot): string {
  const hour12 =
    time.hour > 12 ? time.hour - 12 : time.hour === 0 ? 12 : time.hour;
  const period = time.hour >= 12 ? 'PM' : 'AM';
  const minutes = time.minutes.toString().padStart(2, '0');
  return `${hour12}:${minutes} ${period}`;
}

function formatDateRange(start: Date, end: Date, view: CalendarView): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  if (view === 'day') {
    return start.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (view === 'week') {
    const startStr = start.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
    const endStr = end.toLocaleDateString('es-ES', options);
    return `${startStr} - ${endStr}`;
  }

  return start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getDiaSemana(date: Date): DiaSemana {
  const dayIndex = date.getDay();
  return dayIndex === 0 ? 'sabado' : DIAS[dayIndex - 1];
}

function getJornadaForHour(hour: number): Jornada {
  if (hour >= 6 && hour < 12) return 'manana';
  if (hour >= 12 && hour < 18) return 'tarde';
  return 'noche';
}

/* =============================================================================
   COMPONENTES INTERNOS
   ============================================================================= */

/**
 * Header del Calendario
 */
interface CalendarHeaderProps {
  showFilters?: boolean;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
}

function CalendarHeader({
  showFilters = true,
  showSidebar,
  onToggleSidebar,
}: CalendarHeaderProps) {
  const {
    view,
    setView,
    currentDate,
    dateRange,
    goToday,
    goNext,
    goPrevious,
    openForm,
    filters,
    clearFilters,
  } = useCalendarContext();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
  );

  return (
    <header className={cn(calendarVariants.header({ sticky: true }))}>
      {/* Filtros */}
      {showFilters && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              calendarVariants.navButton({ variant: 'outline', size: 'md' }),
              'px-3 gap-2',
              hasActiveFilters && 'border-primary text-primary'
            )}
            aria-label="Abrir filtros">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      )}

      {/* Navegación Temporal */}
      <div className="flex items-center gap-4">
        <div className={cn(calendarVariants.navigation({ size: 'md' }))}>
          <button
            type="button"
            onClick={goPrevious}
            className={cn(
              calendarVariants.navButton({ variant: 'default', size: 'md' })
            )}
            aria-label="Período anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={goToday}
            className={cn(
              calendarVariants.navButton({ variant: 'outline', size: 'md' }),
              'px-3'
            )}>
            Hoy
          </button>

          <button
            type="button"
            onClick={goNext}
            className={cn(
              calendarVariants.navButton({ variant: 'default', size: 'md' })
            )}
            aria-label="Período siguiente">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
          {formatDateRange(dateRange.start, dateRange.end, view)}
        </h2>
      </div>

      {/* Controles de Vista y Acciones */}
      <div className="flex items-center gap-2">
        {/* Selector de Vista */}
        <div className={cn(calendarVariants.viewSelector({ size: 'md' }))}>
          {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                calendarVariants.viewSelectorButton({ active: view === v })
              )}
              aria-label={`Vista ${
                v === 'day' ? 'día' : v === 'week' ? 'semana' : 'mes'
              }`}
              aria-pressed={view === v}>
              {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>

        {/* Botón Nueva Clase */}
        <button
          type="button"
          onClick={() => openForm('create')}
          className={cn(
            calendarVariants.navButton({ variant: 'primary', size: 'md' }),
            'px-3 gap-2'
          )}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Clase</span>
        </button>

        {/* Toggle Sidebar */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={cn(
              calendarVariants.navButton({ variant: 'default', size: 'md' })
            )}
            aria-label={
              showSidebar ? 'Ocultar panel lateral' : 'Mostrar panel lateral'
            }>
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}

/**
 * Bloque de Clase
 */
interface ClassBlockProps {
  clase: ClaseProgramada;
  hourHeight: number;
  startHour: number;
  onClick?: () => void;
  onDragStart?: () => void;
}

function ClassBlock({
  clase,
  hourHeight,
  startHour,
  onClick,
  onDragStart,
}: ClassBlockProps) {
  const { selectionState, selectClass, openDetails } = useCalendarContext();

  const isSelected = selectionState.selectedClasses.includes(clase.id);

  // Calcular posición y altura
  const top =
    (clase.horaInicio.hour - startHour) * hourHeight +
    (clase.horaInicio.minutes / 60) * hourHeight;
  const duration =
    clase.horaFin.hour * 60 +
    clase.horaFin.minutes -
    (clase.horaInicio.hour * 60 + clase.horaInicio.minutes);
  const height = (duration / 60) * hourHeight;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      selectClass(clase.id);
    } else {
      openDetails(clase);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetails(clase);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        calendarVariants.classBlock({
          jornada: clase.jornada,
          status: clase.estado,
          selected: isSelected,
          size: 'comfortable',
        })
      )}
      style={{
        top: `${top}px`,
        height: `${Math.max(height - 4, 24)}px`,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      draggable
      onDragStart={onDragStart}
      tabIndex={0}
      role="button"
      aria-label={`Clase de ${
        clase.resultadoAprendizaje.nombre
      }, ${formatTimeSlot(clase.horaInicio)} a ${formatTimeSlot(
        clase.horaFin
      )}`}
      aria-selected={isSelected}>
      <div
        className={cn(
          calendarVariants.classBlockContent({ size: 'comfortable' })
        )}>
        <div className={cn(calendarVariants.classBlockTitle())}>
          {clase.resultadoAprendizaje.nombre}
        </div>
        {height > 40 && (
          <div className={cn(calendarVariants.classBlockSubtitle())}>
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{clase.ambienteId}</span>
          </div>
        )}
        {height > 60 && (
          <div className={cn(calendarVariants.classBlockSubtitle())}>
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>
              {formatTimeSlot(clase.horaInicio)} -{' '}
              {formatTimeSlot(clase.horaFin)}
            </span>
          </div>
        )}
      </div>

      {/* Badge de estado */}
      {clase.estado !== 'confirmada' && (
        <div
          className={cn(
            calendarVariants.classBlockBadge({ status: clase.estado })
          )}>
          {clase.estado === 'conflicto' && (
            <AlertTriangle className="h-3 w-3" />
          )}
          {clase.estado}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Vista de Semana
 */
function WeekView() {
  const { currentDate, dateRange, clasesVisibles, displayConfig, startDrag } =
    useCalendarContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const currentHour = today.getHours();
  const currentMinutes = today.getMinutes();

  // Generar días de la semana actual
  const weekDays = useMemo(() => {
    const days: { date: Date; dia: DiaSemana; isToday: boolean }[] = [];
    const start = new Date(dateRange.start);

    for (let i = 0; i < 6; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        date,
        dia: DIAS[i],
        isToday: isSameDay(date, today),
      });
    }

    return days;
  }, [dateRange.start, today]);

  // Agrupar clases por día
  const clasesPorDia = useMemo(() => {
    const grouped: Record<string, ClaseProgramada[]> = {};

    weekDays.forEach((day) => {
      const dayKey = day.date.toISOString().split('T')[0];
      grouped[dayKey] = clasesVisibles.filter((c) =>
        isSameDay(c.fecha, day.date)
      );
    });

    return grouped;
  }, [clasesVisibles, weekDays]);

  // Scroll a hora actual al montar
  useEffect(() => {
    if (containerRef.current) {
      const scrollTop =
        (currentHour - displayConfig.startHour) * displayConfig.hourHeight;
      containerRef.current.scrollTop = Math.max(0, scrollTop - 100);
    }
  }, [currentHour, displayConfig.hourHeight, displayConfig.startHour]);

  // Calcular posición del indicador de hora actual
  const currentTimeOffset =
    (currentHour - displayConfig.startHour) * displayConfig.hourHeight +
    (currentMinutes / 60) * displayConfig.hourHeight;

  const showCurrentTime =
    currentHour >= displayConfig.startHour &&
    currentHour <= displayConfig.endHour;

  return (
    <div
      ref={containerRef}
      className={cn(calendarVariants.gridContainer({ view: 'week' }))}
      role="grid"
      aria-label="Vista semanal del calendario">
      {/* Header con días */}
      <div
        className={cn(calendarVariants.gridHeader({ columns: 6 }))}
        role="row">
        {/* Columna de horas vacía */}
        <div className="p-2" />

        {/* Días de la semana */}
        {weekDays.map((day) => (
          <div
            key={day.dia}
            className={cn(
              calendarVariants.gridHeaderCell({
                isToday: day.isToday,
                isWeekend: day.dia === 'sabado',
              })
            )}
            role="columnheader">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {DIA_CONFIG_DATA[day.dia].shortLabel}
            </span>
            <span
              className={cn(
                calendarVariants.dayNumber({
                  isToday: day.isToday,
                })
              )}>
              {day.date.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* Cuerpo con horas y celdas */}
      <div className="relative">
        {/* Líneas de hora */}
        {HOURS.map((hour) => (
          <div
            key={hour}
            className={cn(
              calendarVariants.hourRow({ density: displayConfig.density })
            )}
            style={{ height: `${displayConfig.hourHeight}px` }}>
            {/* Columna de tiempo */}
            <div className={cn(calendarVariants.timeColumn())}>
              <div className={cn(calendarVariants.timeSlotLabel())}>
                {hour === 12
                  ? '12 PM'
                  : hour > 12
                  ? `${hour - 12} PM`
                  : `${hour} AM`}
              </div>
            </div>
          </div>
        ))}

        {/* Grid de días */}
        <div
          className="absolute top-0 left-[60px] right-0 bottom-0 grid grid-cols-6"
          style={{ height: `${HOURS.length * displayConfig.hourHeight}px` }}>
          {weekDays.map((day) => {
            const dayKey = day.date.toISOString().split('T')[0];
            const clasesDelDia = clasesPorDia[dayKey] || [];

            return (
              <div
                key={day.dia}
                className={cn(
                  calendarVariants.dayCell({
                    isToday: day.isToday,
                    isWeekend: day.dia === 'sabado',
                  }),
                  'relative'
                )}
                role="gridcell"
                aria-label={`${
                  DIA_CONFIG_DATA[day.dia].label
                } ${day.date.getDate()}`}>
                {/* Líneas de hora */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800"
                    style={{
                      top: `${
                        (hour - displayConfig.startHour) *
                        displayConfig.hourHeight
                      }px`,
                    }}
                  />
                ))}

                {/* Bloques de clases */}
                <AnimatePresence>
                  {clasesDelDia.map((clase) => (
                    <ClassBlock
                      key={clase.id}
                      clase={clase}
                      hourHeight={displayConfig.hourHeight}
                      startHour={displayConfig.startHour}
                      onDragStart={() => startDrag(clase)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Indicador de hora actual */}
        {showCurrentTime && weekDays.some((d) => d.isToday) && (
          <div
            className={cn(calendarVariants.currentTimeIndicator())}
            style={{ top: `${currentTimeOffset}px` }}>
            <div className={cn(calendarVariants.currentTimeDot())} />
            <div className={cn(calendarVariants.currentTimeLine())} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Vista de Día
 */
function DayView() {
  const { currentDate, clasesVisibles, displayConfig, startDrag } =
    useCalendarContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const isToday = isSameDay(currentDate, today);
  const currentHour = today.getHours();
  const currentMinutes = today.getMinutes();

  // Clases del día actual
  const clasesDelDia = useMemo(
    () => clasesVisibles.filter((c) => isSameDay(c.fecha, currentDate)),
    [clasesVisibles, currentDate]
  );

  // Scroll a hora actual
  useEffect(() => {
    if (containerRef.current && isToday) {
      const scrollTop =
        (currentHour - displayConfig.startHour) * displayConfig.hourHeight;
      containerRef.current.scrollTop = Math.max(0, scrollTop - 100);
    }
  }, [currentHour, displayConfig.hourHeight, displayConfig.startHour, isToday]);

  const currentTimeOffset =
    (currentHour - displayConfig.startHour) * displayConfig.hourHeight +
    (currentMinutes / 60) * displayConfig.hourHeight;

  const showCurrentTime =
    isToday &&
    currentHour >= displayConfig.startHour &&
    currentHour <= displayConfig.endHour;

  return (
    <div
      ref={containerRef}
      className={cn(calendarVariants.gridContainer({ view: 'day' }))}
      role="grid"
      aria-label="Vista diaria del calendario">
      {/* Header */}
      <div className={cn(calendarVariants.gridHeader({ columns: 1 }))}>
        <div className="p-2" />
        <div className={cn(calendarVariants.gridHeaderCell({ isToday }))}>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {currentDate.toLocaleDateString('es-ES', { weekday: 'long' })}
          </span>
          <span className={cn(calendarVariants.dayNumber({ isToday }))}>
            {currentDate.getDate()}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="relative grid grid-cols-[60px_1fr]">
        {/* Columna de horas */}
        <div className={cn(calendarVariants.timeColumn())}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex justify-end pr-2"
              style={{ height: `${displayConfig.hourHeight}px` }}>
              <span className={cn(calendarVariants.timeSlotLabel())}>
                {hour === 12
                  ? '12 PM'
                  : hour > 12
                  ? `${hour - 12} PM`
                  : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>

        {/* Área de clases */}
        <div
          className={cn(
            calendarVariants.dayCell({ isToday }),
            'relative border-l border-gray-200 dark:border-gray-700'
          )}
          style={{ height: `${HOURS.length * displayConfig.hourHeight}px` }}>
          {/* Líneas de hora */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800"
              style={{
                top: `${
                  (hour - displayConfig.startHour) * displayConfig.hourHeight
                }px`,
              }}
            />
          ))}

          {/* Bloques de clases */}
          <AnimatePresence>
            {clasesDelDia.map((clase) => (
              <ClassBlock
                key={clase.id}
                clase={clase}
                hourHeight={displayConfig.hourHeight}
                startHour={displayConfig.startHour}
                onDragStart={() => startDrag(clase)}
              />
            ))}
          </AnimatePresence>

          {/* Indicador de hora actual */}
          {showCurrentTime && (
            <div
              className={cn(calendarVariants.currentTimeIndicator())}
              style={{ top: `${currentTimeOffset}px` }}>
              <div className={cn(calendarVariants.currentTimeDot())} />
              <div className={cn(calendarVariants.currentTimeLine())} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Vista de Mes
 */
function MonthView() {
  const { currentDate, dateRange, clasesVisibles, goToDate, setView } =
    useCalendarContext();

  const today = new Date();

  // Generar días del mes
  const monthDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] =
      [];

    // Obtener primer día del mes
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Ajustar para empezar en Lunes

    // Días del mes anterior
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - i - 1);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
      });
    }

    // Días del mes actual
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
      });
    }

    // Completar semana con días del siguiente mes
    const remaining = 42 - days.length; // 6 semanas * 7 días
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(lastDay);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
      });
    }

    return days;
  }, [currentDate, today]);

  // Contar clases por día
  const clasesPorDia = useMemo(() => {
    const count: Record<string, number> = {};
    clasesVisibles.forEach((c) => {
      const key = c.fecha.toISOString().split('T')[0];
      count[key] = (count[key] || 0) + 1;
    });
    return count;
  }, [clasesVisibles]);

  const handleDayClick = (date: Date) => {
    goToDate(date);
    setView('day');
  };

  return (
    <div
      className={cn(calendarVariants.gridContainer({ view: 'month' }), 'p-4')}
      role="grid"
      aria-label="Vista mensual del calendario">
      {/* Header con días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, index) => {
          const dayKey = day.date.toISOString().split('T')[0];
          const classCount = clasesPorDia[dayKey] || 0;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDayClick(day.date)}
              className={cn(
                'p-2 min-h-[80px] rounded-lg text-left transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                day.isCurrentMonth
                  ? 'bg-white dark:bg-gray-900'
                  : 'bg-gray-50 dark:bg-gray-800/50',
                day.isToday && 'ring-2 ring-primary'
              )}>
              <span
                className={cn(
                  calendarVariants.dayNumber({ isToday: day.isToday }),
                  'text-sm',
                  !day.isCurrentMonth && 'text-gray-400 dark:text-gray-600'
                )}>
                {day.date.getDate()}
              </span>

              {classCount > 0 && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                    {classCount} clase{classCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Sidebar del Calendario
 */
interface CalendarSidebarProps {
  collapsed?: boolean;
}

function CalendarSidebar({ collapsed = false }: CalendarSidebarProps) {
  const {
    stats,
    clasesVisibles,
    currentDate,
    goToDate,
    filters,
    clearFilters,
  } = useCalendarContext();

  // Próximas clases (siguientes 5)
  const upcomingClasses = useMemo(() => {
    const now = new Date();
    return clasesVisibles
      .filter((c) => c.fecha >= now)
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .slice(0, 5);
  }, [clasesVisibles]);

  if (collapsed) return null;

  return (
    <aside
      className={cn(calendarVariants.sidebar({ collapsed, position: 'right' }))}
      aria-label="Panel lateral del calendario">
      {/* Estadísticas */}
      <section className={cn(calendarVariants.sidebarSection())}>
        <h3 className={cn(calendarVariants.sidebarSectionTitle())}>
          📊 Estadísticas
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className={cn(calendarVariants.statCard())}>
            <div className={cn(calendarVariants.statValue())}>
              {stats.totalClases}
            </div>
            <div className={cn(calendarVariants.statLabel())}>Clases</div>
          </div>
          <div className={cn(calendarVariants.statCard())}>
            <div className={cn(calendarVariants.statValue())}>
              {stats.horasProgramadas}h
            </div>
            <div className={cn(calendarVariants.statLabel())}>Programadas</div>
          </div>
          <div className={cn(calendarVariants.statCard())}>
            <div className={cn(calendarVariants.statValue())}>
              {stats.horasDisponibles}h
            </div>
            <div className={cn(calendarVariants.statLabel())}>Disponibles</div>
          </div>
          <div className={cn(calendarVariants.statCard())}>
            <div
              className={cn(
                calendarVariants.statValue(),
                stats.conflictosActivos > 0 && 'text-red-500'
              )}>
              {stats.conflictosActivos}
            </div>
            <div className={cn(calendarVariants.statLabel())}>Conflictos</div>
          </div>
        </div>
      </section>

      {/* Próximas Clases */}
      <section className={cn(calendarVariants.sidebarSection())}>
        <h3 className={cn(calendarVariants.sidebarSectionTitle())}>
          📅 Próximas Clases
        </h3>
        {upcomingClasses.length > 0 ? (
          <div className="space-y-2">
            {upcomingClasses.map((clase) => (
              <div
                key={clase.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => goToDate(clase.fecha)}>
                <div
                  className={cn(
                    'w-1 h-8 rounded-full',
                    clase.jornada === 'manana' && 'bg-blue-500',
                    clase.jornada === 'tarde' && 'bg-orange-500',
                    clase.jornada === 'noche' && 'bg-purple-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    {clase.resultadoAprendizaje.nombre}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {clase.fecha.toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                    })}{' '}
                    • {formatTimeSlot(clase.horaInicio)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay clases próximas
          </p>
        )}
      </section>

      {/* Leyenda */}
      <section className={cn(calendarVariants.sidebarSection())}>
        <h3 className={cn(calendarVariants.sidebarSectionTitle())}>
          🎨 Leyenda
        </h3>
        <div className={cn(calendarVariants.legendContainer())}>
          {(
            Object.entries(JORNADA_CONFIG_DATA) as [
              Jornada,
              (typeof JORNADA_CONFIG_DATA)[Jornada]
            ][]
          ).map(([key, config]) => (
            <div
              key={key}
              className={cn(calendarVariants.legendItem())}>
              <div
                className={cn(calendarVariants.legendColor({ jornada: key }))}
              />
              <span>
                {config.emoji} {config.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Filtros Activos */}
      {Object.values(filters).some((v) =>
        Array.isArray(v) ? v.length > 0 : v
      ) && (
        <section className={cn(calendarVariants.sidebarSection())}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={cn(calendarVariants.sidebarSectionTitle(), 'mb-0')}>
              🔍 Filtros
            </h3>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-primary hover:underline">
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.sede && (
              <span className={cn(calendarVariants.filterChip())}>
                Sede: {filters.sede}
              </span>
            )}
            {filters.jornada?.map((j) => (
              <span
                key={j}
                className={cn(calendarVariants.filterChip())}>
                {JORNADA_CONFIG_DATA[j].emoji} {JORNADA_CONFIG_DATA[j].label}
              </span>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

/**
 * Panel de Detalles de Clase
 */
function DetailsPanel() {
  const {
    selectedClass,
    isDetailsPanelOpen,
    closeDetails,
    updateClass,
    deleteClass,
    openForm,
  } = useCalendarContext();

  if (!selectedClass) return null;

  return (
    <AnimatePresence>
      {isDetailsPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={closeDetails}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              calendarVariants.detailsPanel({ open: true, size: 'md' })
            )}
            role="dialog"
            aria-label="Detalles de la clase">
            {/* Header */}
            <header className={cn(calendarVariants.detailsPanelHeader())}>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedClass.resultadoAprendizaje.nombre}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedClass.resultadoAprendizaje.codigo}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className={cn(
                  calendarVariants.navButton({ variant: 'default', size: 'md' })
                )}
                aria-label="Cerrar panel">
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Contenido */}
            <div className={cn(calendarVariants.detailsPanelContent())}>
              {/* Conflictos */}
              {selectedClass.conflictos &&
                selectedClass.conflictos.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {selectedClass.conflictos.map((conflict) => (
                      <div
                        key={conflict.id}
                        className={cn(
                          calendarVariants.conflictBanner({
                            severity: conflict.severidad,
                          })
                        )}>
                        <AlertTriangle
                          className={cn(
                            calendarVariants.conflictIcon({
                              severity: conflict.severidad,
                            })
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              calendarVariants.conflictText({
                                severity: conflict.severidad,
                              })
                            )}>
                            {conflict.mensaje}
                          </p>
                          {conflict.sugerencia && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              💡 {conflict.sugerencia}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Información */}
              <div className="space-y-4">
                {/* Fecha y Hora */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedClass.fecha.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeSlot(selectedClass.horaInicio)} -{' '}
                      {formatTimeSlot(selectedClass.horaFin)}
                    </p>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedClass.ambienteId}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedClass.sedeId}
                    </p>
                  </div>
                </div>

                {/* Grupo */}
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedClass.grupoId}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Jornada:{' '}
                      {JORNADA_CONFIG_DATA[selectedClass.jornada].emoji}{' '}
                      {JORNADA_CONFIG_DATA[selectedClass.jornada].label}
                    </p>
                  </div>
                </div>

                {/* Notas */}
                {selectedClass.notas && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Notas
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedClass.notas}
                    </p>
                  </div>
                )}

                {/* Metadatos */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    Creado:{' '}
                    {selectedClass.fechaCreacion.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  {selectedClass.ultimaModificacion && (
                    <p>
                      Modificado:{' '}
                      {selectedClass.ultimaModificacion.toLocaleDateString(
                        'es-ES',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className={cn(calendarVariants.detailsPanelFooter())}>
              <button
                type="button"
                onClick={() => {
                  closeDetails();
                  deleteClass(selectedClass.id);
                }}
                className={cn(
                  calendarVariants.navButton({
                    variant: 'outline',
                    size: 'md',
                  }),
                  'px-3 text-red-600 hover:text-red-700 hover:bg-red-50'
                )}>
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDetails();
                  openForm('edit', {
                    resultadoAprendizajeId:
                      selectedClass.resultadoAprendizaje.id,
                    grupoId: selectedClass.grupoId,
                    sedeId: selectedClass.sedeId,
                    ambienteId: selectedClass.ambienteId,
                    jornada: selectedClass.jornada,
                    horaInicio: selectedClass.horaInicio,
                    horaFin: selectedClass.horaFin,
                    fechaInicio: selectedClass.fecha,
                    fechaFin:
                      selectedClass.fechaFinRecurrencia || selectedClass.fecha,
                    recurrencia: selectedClass.recurrencia,
                    diasSemana: selectedClass.diasRecurrencia,
                    notas: selectedClass.notas,
                    color: selectedClass.color,
                  });
                }}
                className={cn(
                  calendarVariants.navButton({
                    variant: 'primary',
                    size: 'md',
                  }),
                  'px-3'
                )}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* =============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================= */

export interface CalendarProps extends UseCalendarOptions {
  /** Clases CSS adicionales */
  className?: string;
  /** Mostrar el sidebar */
  showSidebar?: boolean;
  /** Sidebar colapsado por defecto */
  sidebarCollapsed?: boolean;
  /** Altura completa */
  fullHeight?: boolean;
  /** Mostrar filtros */
  showFilters?: boolean;
}

export function Calendar({
  className,
  showSidebar = true,
  sidebarCollapsed: initialSidebarCollapsed = false,
  fullHeight = true,
  showFilters = true,
  ...options
}: CalendarProps) {
  const calendarState = useCalendar(options);
  const { view, isLoading, error } = calendarState;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    initialSidebarCollapsed
  );

  // Renderizar vista según el tipo
  const renderView = () => {
    switch (view) {
      case 'day':
        return <DayView />;
      case 'week':
        return <WeekView />;
      case 'month':
        return <MonthView />;
      default:
        return <WeekView />;
    }
  };

  return (
    <CalendarContext.Provider value={calendarState}>
      <div
        className={cn(
          calendarVariants.container({ fullHeight, loading: isLoading }),
          className
        )}
        role="application"
        aria-label="Calendario de horarios académicos">
        {/* Header */}
        <CalendarHeader
          showFilters={showFilters}
          showSidebar={!sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {error}
            </p>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="flex flex-1 overflow-hidden">
          {/* Área del Calendario */}
          <main className="flex-1 overflow-hidden">{renderView()}</main>

          {/* Sidebar */}
          {showSidebar && <CalendarSidebar collapsed={sidebarCollapsed} />}
        </div>

        {/* Panel de Detalles */}
        <DetailsPanel />
      </div>
    </CalendarContext.Provider>
  );
}

Calendar.displayName = 'Calendar';

export default Calendar;
