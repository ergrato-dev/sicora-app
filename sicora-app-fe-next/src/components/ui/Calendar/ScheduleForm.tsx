/**
 * SICORA - Formulario Wizard de Programación de Horario
 *
 * Formulario de 4 pasos para crear/editar clases programadas:
 * 1. ¿Qué enseñas? - Resultado de aprendizaje y grupo
 * 2. ¿Dónde? - Sede y ambiente
 * 3. ¿Cuándo? - Jornada, días, horario y recurrencia
 * 4. Confirmación - Resumen y detección de conflictos
 *
 * @fileoverview Formulario wizard para Schedule
 * @module components/ui/Calendar/ScheduleForm
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  Users,
  MapPin,
  Building,
  Clock,
  Calendar,
  AlertTriangle,
  Repeat,
  Save,
  Loader2,
  Search,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { calendarVariants } from './calendar-variants';
import type {
  ScheduleFormData,
  ScheduleFormState,
  ScheduleFormStep1,
  ScheduleFormStep2,
  ScheduleFormStep3,
  Conflict,
  Jornada,
  DiaSemana,
  TimeSlot,
  RecurrencePattern,
  ResultadoAprendizaje,
  Grupo,
  Sede,
  Ambiente,
} from '../../../types/calendar.types';

/* =============================================================================
   CONSTANTES
   ============================================================================= */

const JORNADAS: {
  value: Jornada;
  label: string;
  emoji: string;
  hours: string;
}[] = [
  {
    value: 'manana',
    label: 'Mañana',
    emoji: '🌅',
    hours: '6:00 AM - 12:00 PM',
  },
  { value: 'tarde', label: 'Tarde', emoji: '☀️', hours: '12:00 PM - 6:00 PM' },
  { value: 'noche', label: 'Noche', emoji: '🌙', hours: '6:00 PM - 10:00 PM' },
];

const DIAS: { value: DiaSemana; label: string; shortLabel: string }[] = [
  { value: 'lunes', label: 'Lunes', shortLabel: 'L' },
  { value: 'martes', label: 'Martes', shortLabel: 'M' },
  { value: 'miercoles', label: 'Miércoles', shortLabel: 'X' },
  { value: 'jueves', label: 'Jueves', shortLabel: 'J' },
  { value: 'viernes', label: 'Viernes', shortLabel: 'V' },
  { value: 'sabado', label: 'Sábado', shortLabel: 'S' },
];

const RECURRENCE_OPTIONS: {
  value: RecurrencePattern;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Sin repetición', description: 'Solo esta fecha' },
  {
    value: 'weekly',
    label: 'Semanal',
    description: 'Cada semana los mismos días',
  },
  { value: 'biweekly', label: 'Quincenal', description: 'Cada dos semanas' },
  { value: 'monthly', label: 'Mensual', description: 'Una vez al mes' },
];

const HOURS_OPTIONS = Array.from({ length: 17 }, (_, i) => ({
  value: i + 6,
  label: `${i + 6 > 12 ? i + 6 - 12 : i + 6}:00 ${i + 6 >= 12 ? 'PM' : 'AM'}`,
}));

const STEP_INFO = [
  { number: 1, title: '¿Qué enseñas?', icon: BookOpen },
  { number: 2, title: '¿Dónde?', icon: MapPin },
  { number: 3, title: '¿Cuándo?', icon: Clock },
  { number: 4, title: 'Confirmar', icon: Check },
];

/* =============================================================================
   DATOS DE EJEMPLO (en producción vendrían de API)
   ============================================================================= */

const MOCK_RESULTADOS: ResultadoAprendizaje[] = [
  {
    id: 'ra-1',
    codigo: 'POO-001',
    nombre: 'Programación Orientada a Objetos',
    descripcion: 'Fundamentos de POO con Java',
    horasEstimadas: 40,
  },
  {
    id: 'ra-2',
    codigo: 'BD-001',
    nombre: 'Bases de Datos',
    descripcion: 'Diseño y gestión de bases de datos relacionales',
    horasEstimadas: 60,
  },
  {
    id: 'ra-3',
    codigo: 'WEB-001',
    nombre: 'Desarrollo Web Frontend',
    descripcion: 'HTML, CSS y JavaScript',
    horasEstimadas: 80,
  },
  {
    id: 'ra-4',
    codigo: 'NET-001',
    nombre: 'Redes y Comunicaciones',
    descripcion: 'Fundamentos de networking',
    horasEstimadas: 40,
  },
];

const MOCK_GRUPOS: Grupo[] = [
  {
    id: 'g-1',
    codigo: 'ADSO-2024-01',
    nombre: 'ADSO Ficha 2024-01',
    programaId: 'p-1',
    cantidadAprendices: 28,
    jornada: 'manana',
    activo: true,
  },
  {
    id: 'g-2',
    codigo: 'ADSO-2024-02',
    nombre: 'ADSO Ficha 2024-02',
    programaId: 'p-1',
    cantidadAprendices: 30,
    jornada: 'tarde',
    activo: true,
  },
  {
    id: 'g-3',
    codigo: 'ADSO-2024-03',
    nombre: 'ADSO Ficha 2024-03',
    programaId: 'p-1',
    cantidadAprendices: 25,
    jornada: 'noche',
    activo: true,
  },
];

const MOCK_SEDES: Sede[] = [
  {
    id: 's-1',
    nombre: 'Sede Principal',
    codigo: 'SP',
    direccion: 'Calle 1 #2-3',
    activa: true,
  },
  {
    id: 's-2',
    nombre: 'Sede Norte',
    codigo: 'SN',
    direccion: 'Av. Norte #45-67',
    activa: true,
  },
];

const MOCK_AMBIENTES: Ambiente[] = [
  {
    id: 'a-1',
    sedeId: 's-1',
    nombre: 'Aula 201',
    codigo: 'A201',
    tipo: 'aula',
    capacidad: 35,
    activo: true,
  },
  {
    id: 'a-2',
    sedeId: 's-1',
    nombre: 'Aula 202',
    codigo: 'A202',
    tipo: 'aula',
    capacidad: 30,
    activo: true,
  },
  {
    id: 'a-3',
    sedeId: 's-1',
    nombre: 'Laboratorio 101',
    codigo: 'L101',
    tipo: 'laboratorio',
    capacidad: 25,
    equipamiento: ['Computadores', 'Proyector'],
    activo: true,
  },
  {
    id: 'a-4',
    sedeId: 's-2',
    nombre: 'Aula 301',
    codigo: 'A301',
    tipo: 'aula',
    capacidad: 40,
    activo: true,
  },
];

/* =============================================================================
   COMPONENTES INTERNOS
   ============================================================================= */

/**
 * Indicador de pasos del wizard
 */
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className={cn(calendarVariants.wizardSteps())}>
      {STEP_INFO.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const status = isCompleted
          ? 'completed'
          : isCurrent
          ? 'current'
          : 'upcoming';

        return (
          <React.Fragment key={step.number}>
            <div className={cn(calendarVariants.wizardStep({ status }))}>
              <div
                className={cn(calendarVariants.wizardStepNumber({ status }))}>
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium">
                {step.title}
              </span>
            </div>

            {index < STEP_INFO.length - 1 && (
              <div
                className={cn(
                  calendarVariants.wizardStepConnector({
                    completed: isCompleted,
                  })
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Paso 1: ¿Qué enseñas?
 */
interface Step1Props {
  data: Partial<ScheduleFormStep1>;
  onChange: (data: Partial<ScheduleFormStep1>) => void;
  errors: Record<string, string>;
}

function Step1Content({ data, onChange, errors }: Step1Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResultados = useMemo(() => {
    if (!searchTerm) return MOCK_RESULTADOS;
    const term = searchTerm.toLowerCase();
    return MOCK_RESULTADOS.filter(
      (r) =>
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term) ||
        r.descripcion?.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Resultado de Aprendizaje */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Resultado de Aprendizaje *
        </label>

        {/* Búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Lista de resultados */}
        <div className="grid gap-2 max-h-[200px] overflow-y-auto">
          {filteredResultados.map((resultado) => (
            <button
              key={resultado.id}
              type="button"
              onClick={() =>
                onChange({ ...data, resultadoAprendizajeId: resultado.id })
              }
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                'hover:border-primary hover:bg-primary/5',
                data.resultadoAprendizajeId === resultado.id
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-gray-200 dark:border-gray-700'
              )}>
              <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {resultado.nombre}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {resultado.codigo}
                  </span>
                </div>
                {resultado.descripcion && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {resultado.descripcion}
                  </p>
                )}
                {resultado.horasEstimadas && (
                  <p className="text-xs text-gray-400 mt-1">
                    {resultado.horasEstimadas} horas estimadas
                  </p>
                )}
              </div>
              {data.resultadoAprendizajeId === resultado.id && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {errors.resultadoAprendizajeId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.resultadoAprendizajeId}
          </p>
        )}
      </div>

      {/* Grupo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Grupo / Ficha *
        </label>

        <div className="grid gap-2">
          {MOCK_GRUPOS.map((grupo) => (
            <button
              key={grupo.id}
              type="button"
              onClick={() => onChange({ ...data, grupoId: grupo.id })}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                'hover:border-primary hover:bg-primary/5',
                data.grupoId === grupo.id
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-gray-200 dark:border-gray-700'
              )}>
              <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {grupo.nombre}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {grupo.codigo} • {grupo.cantidadAprendices} aprendices
                </div>
              </div>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  grupo.jornada === 'manana' && 'bg-blue-100 text-blue-700',
                  grupo.jornada === 'tarde' && 'bg-orange-100 text-orange-700',
                  grupo.jornada === 'noche' && 'bg-purple-100 text-purple-700'
                )}>
                {grupo.jornada === 'manana'
                  ? '🌅 Mañana'
                  : grupo.jornada === 'tarde'
                  ? '☀️ Tarde'
                  : '🌙 Noche'}
              </span>
              {data.grupoId === grupo.id && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {errors.grupoId && (
          <p className="mt-1 text-sm text-red-600">{errors.grupoId}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Paso 2: ¿Dónde?
 */
interface Step2Props {
  data: Partial<ScheduleFormStep2>;
  onChange: (data: Partial<ScheduleFormStep2>) => void;
  errors: Record<string, string>;
}

function Step2Content({ data, onChange, errors }: Step2Props) {
  const ambientesFiltrados = useMemo(() => {
    if (!data.sedeId) return MOCK_AMBIENTES;
    return MOCK_AMBIENTES.filter((a) => a.sedeId === data.sedeId);
  }, [data.sedeId]);

  return (
    <div className="space-y-6">
      {/* Sede */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sede de Formación *
        </label>

        <div className="grid gap-2">
          {MOCK_SEDES.map((sede) => (
            <button
              key={sede.id}
              type="button"
              onClick={() =>
                onChange({ ...data, sedeId: sede.id, ambienteId: undefined })
              }
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                'hover:border-primary hover:bg-primary/5',
                data.sedeId === sede.id
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-gray-200 dark:border-gray-700'
              )}>
              <Building className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {sede.nombre}
                </div>
                {sede.direccion && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {sede.direccion}
                  </div>
                )}
              </div>
              {data.sedeId === sede.id && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {errors.sedeId && (
          <p className="mt-1 text-sm text-red-600">{errors.sedeId}</p>
        )}
      </div>

      {/* Ambiente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ambiente / Salón *
        </label>

        {!data.sedeId ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Selecciona una sede primero
          </p>
        ) : (
          <div className="grid gap-2 max-h-[250px] overflow-y-auto">
            {ambientesFiltrados.map((ambiente) => (
              <button
                key={ambiente.id}
                type="button"
                onClick={() => onChange({ ...data, ambienteId: ambiente.id })}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                  'hover:border-primary hover:bg-primary/5',
                  data.ambienteId === ambiente.id
                    ? 'border-primary bg-primary/10 ring-2 ring-primary'
                    : 'border-gray-200 dark:border-gray-700'
                )}>
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {ambiente.nombre}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        ambiente.tipo === 'laboratorio'
                          ? 'bg-blue-100 text-blue-700'
                          : ambiente.tipo === 'taller'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      )}>
                      {ambiente.tipo}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Capacidad: {ambiente.capacidad} personas
                    {ambiente.equipamiento &&
                      ambiente.equipamiento.length > 0 && (
                        <> • {ambiente.equipamiento.join(', ')}</>
                      )}
                  </div>
                </div>
                {data.ambienteId === ambiente.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {errors.ambienteId && (
          <p className="mt-1 text-sm text-red-600">{errors.ambienteId}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Paso 3: ¿Cuándo?
 */
interface Step3Props {
  data: Partial<ScheduleFormStep3>;
  onChange: (data: Partial<ScheduleFormStep3>) => void;
  errors: Record<string, string>;
}

function Step3Content({ data, onChange, errors }: Step3Props) {
  // Horas disponibles según jornada
  const horasDisponibles = useMemo(() => {
    const jornada = data.jornada;
    if (!jornada) return HOURS_OPTIONS;

    const ranges: Record<Jornada, { start: number; end: number }> = {
      manana: { start: 6, end: 12 },
      tarde: { start: 12, end: 18 },
      noche: { start: 18, end: 22 },
    };

    const range = ranges[jornada];
    return HOURS_OPTIONS.filter(
      (h) => h.value >= range.start && h.value <= range.end
    );
  }, [data.jornada]);

  return (
    <div className="space-y-6">
      {/* Jornada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Jornada *
        </label>

        <div className="grid grid-cols-3 gap-2">
          {JORNADAS.map((jornada) => (
            <button
              key={jornada.value}
              type="button"
              onClick={() =>
                onChange({
                  ...data,
                  jornada: jornada.value,
                  horaInicio: undefined,
                  horaFin: undefined,
                })
              }
              className={cn(
                'flex flex-col items-center gap-1 p-4 rounded-lg border transition-all',
                'hover:border-primary hover:bg-primary/5',
                data.jornada === jornada.value
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-gray-200 dark:border-gray-700'
              )}>
              <span className="text-2xl">{jornada.emoji}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {jornada.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {jornada.hours}
              </span>
            </button>
          ))}
        </div>

        {errors.jornada && (
          <p className="mt-1 text-sm text-red-600">{errors.jornada}</p>
        )}
      </div>

      {/* Días de la semana */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Días de la semana *
        </label>

        <div className="flex gap-2">
          {DIAS.map((dia) => {
            const isSelected = data.diasSemana?.includes(dia.value);
            return (
              <button
                key={dia.value}
                type="button"
                onClick={() => {
                  const current = data.diasSemana || [];
                  const newDias = isSelected
                    ? current.filter((d) => d !== dia.value)
                    : [...current, dia.value];
                  onChange({ ...data, diasSemana: newDias });
                }}
                className={cn(
                  'w-10 h-10 rounded-full font-medium transition-all',
                  'hover:bg-primary/10',
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                )}
                title={dia.label}>
                {dia.shortLabel}
              </button>
            );
          })}
        </div>

        {errors.diasSemana && (
          <p className="mt-1 text-sm text-red-600">{errors.diasSemana}</p>
        )}
      </div>

      {/* Horario */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hora de inicio *
          </label>
          <select
            value={data.horaInicio?.hour ?? ''}
            onChange={(e) =>
              onChange({
                ...data,
                horaInicio: { hour: parseInt(e.target.value), minutes: 0 },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={!data.jornada}>
            <option value="">Seleccionar...</option>
            {horasDisponibles.map((h) => (
              <option
                key={h.value}
                value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
          {errors.horaInicio && (
            <p className="mt-1 text-sm text-red-600">{errors.horaInicio}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hora de fin *
          </label>
          <select
            value={data.horaFin?.hour ?? ''}
            onChange={(e) =>
              onChange({
                ...data,
                horaFin: { hour: parseInt(e.target.value), minutes: 0 },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={!data.horaInicio}>
            <option value="">Seleccionar...</option>
            {horasDisponibles
              .filter((h) => !data.horaInicio || h.value > data.horaInicio.hour)
              .map((h) => (
                <option
                  key={h.value}
                  value={h.value}>
                  {h.label}
                </option>
              ))}
          </select>
          {errors.horaFin && (
            <p className="mt-1 text-sm text-red-600">{errors.horaFin}</p>
          )}
        </div>
      </div>

      {/* Recurrencia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Repetición
        </label>

        <div className="grid gap-2">
          {RECURRENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...data, recurrencia: option.value })}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                'hover:border-primary hover:bg-primary/5',
                data.recurrencia === option.value
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-gray-200 dark:border-gray-700'
              )}>
              <Repeat className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {option.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
              {data.recurrencia === option.value && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rango de fechas (si hay recurrencia) */}
      {data.recurrencia && data.recurrencia !== 'none' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={data.fechaInicio?.toISOString().split('T')[0] ?? ''}
              onChange={(e) =>
                onChange({ ...data, fechaInicio: new Date(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de fin
            </label>
            <input
              type="date"
              value={data.fechaFin?.toISOString().split('T')[0] ?? ''}
              onChange={(e) =>
                onChange({ ...data, fechaFin: new Date(e.target.value) })
              }
              min={data.fechaInicio?.toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Paso 4: Confirmación
 */
interface Step4Props {
  data: Partial<ScheduleFormData>;
  conflicts: Conflict[];
}

function Step4Content({ data, conflicts }: Step4Props) {
  const resultado = MOCK_RESULTADOS.find(
    (r) => r.id === data.resultadoAprendizajeId
  );
  const grupo = MOCK_GRUPOS.find((g) => g.id === data.grupoId);
  const sede = MOCK_SEDES.find((s) => s.id === data.sedeId);
  const ambiente = MOCK_AMBIENTES.find((a) => a.id === data.ambienteId);
  const jornada = JORNADAS.find((j) => j.value === data.jornada);

  const formatHour = (hour?: number) => {
    if (!hour) return '--';
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="space-y-6">
      {/* Conflictos */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflictos Detectados ({conflicts.length})
          </h4>
          {conflicts.map((conflict) => (
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

      {/* Resumen */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Resumen de la Programación
        </h4>

        {/* Qué */}
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Resultado de Aprendizaje
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {resultado?.nombre || 'No seleccionado'}
            </p>
            {resultado?.codigo && (
              <p className="text-xs text-gray-400">{resultado.codigo}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Grupo</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {grupo?.nombre || 'No seleccionado'}
            </p>
            {grupo?.codigo && (
              <p className="text-xs text-gray-400">{grupo.codigo}</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4" />

        {/* Dónde */}
        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sede</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {sede?.nombre || 'No seleccionada'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ambiente</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {ambiente?.nombre || 'No seleccionado'}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4" />

        {/* Cuándo */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Horario</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {jornada?.emoji} {jornada?.label || 'No seleccionada'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatHour(data.horaInicio?.hour)} -{' '}
              {formatHour(data.horaFin?.hour)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Días</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {data.diasSemana && data.diasSemana.length > 0
                ? data.diasSemana
                    .map((d) => DIAS.find((dia) => dia.value === d)?.label)
                    .join(', ')
                : 'No seleccionados'}
            </p>
          </div>
        </div>

        {data.recurrencia && data.recurrencia !== 'none' && (
          <div className="flex items-start gap-3">
            <Repeat className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recurrencia
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {
                  RECURRENCE_OPTIONS.find((r) => r.value === data.recurrencia)
                    ?.label
                }
              </p>
              {data.fechaInicio && data.fechaFin && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {data.fechaInicio.toLocaleDateString('es-ES')} -{' '}
                  {data.fechaFin.toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas adicionales (opcional)
        </label>
        <textarea
          rows={3}
          placeholder="Agregar notas o comentarios..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}

/* =============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================= */

export interface ScheduleFormProps {
  /** Modal abierto */
  open: boolean;
  /** Callback al cerrar */
  onClose: () => void;
  /** Callback al guardar */
  onSave: (data: ScheduleFormData) => Promise<void>;
  /** Datos iniciales (para edición) */
  initialData?: Partial<ScheduleFormData>;
  /** Modo del formulario */
  mode?: 'create' | 'edit';
  /** Función para verificar conflictos */
  checkConflicts?: (data: Partial<ScheduleFormData>) => Conflict[];
}

export function ScheduleForm({
  open,
  onClose,
  onSave,
  initialData,
  mode = 'create',
  checkConflicts,
}: ScheduleFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ScheduleFormData>>(
    initialData || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setFormData(initialData || {});
      setErrors({});
      setConflicts([]);
    }
  }, [open, initialData]);

  // Verificar conflictos al llegar al paso 4
  useEffect(() => {
    if (currentStep === 4 && checkConflicts) {
      const detected = checkConflicts(formData);
      setConflicts(detected);
    }
  }, [currentStep, formData, checkConflicts]);

  // Validar paso actual
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 1:
          if (!formData.resultadoAprendizajeId) {
            newErrors.resultadoAprendizajeId =
              'Selecciona un resultado de aprendizaje';
          }
          if (!formData.grupoId) {
            newErrors.grupoId = 'Selecciona un grupo';
          }
          break;

        case 2:
          if (!formData.sedeId) {
            newErrors.sedeId = 'Selecciona una sede';
          }
          if (!formData.ambienteId) {
            newErrors.ambienteId = 'Selecciona un ambiente';
          }
          break;

        case 3:
          if (!formData.jornada) {
            newErrors.jornada = 'Selecciona una jornada';
          }
          if (!formData.diasSemana || formData.diasSemana.length === 0) {
            newErrors.diasSemana = 'Selecciona al menos un día';
          }
          if (!formData.horaInicio) {
            newErrors.horaInicio = 'Selecciona hora de inicio';
          }
          if (!formData.horaFin) {
            newErrors.horaFin = 'Selecciona hora de fin';
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    // Verificar conflictos críticos
    if (conflicts.some((c) => c.severidad === 'critical')) {
      return; // No permitir guardar con conflictos críticos
    }

    setIsSubmitting(true);
    try {
      await onSave(formData as ScheduleFormData);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, validateStep, conflicts, formData, onSave, onClose]);

  const updateFormData = useCallback((updates: Partial<ScheduleFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {mode === 'create'
                    ? 'Nueva Programación'
                    : 'Editar Programación'}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Cerrar">
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Step Indicator */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={4}
                />
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}>
                    {currentStep === 1 && (
                      <Step1Content
                        data={formData}
                        onChange={updateFormData}
                        errors={errors}
                      />
                    )}
                    {currentStep === 2 && (
                      <Step2Content
                        data={formData}
                        onChange={updateFormData}
                        errors={errors}
                      />
                    )}
                    {currentStep === 3 && (
                      <Step3Content
                        data={formData}
                        onChange={updateFormData}
                        errors={errors}
                      />
                    )}
                    {currentStep === 4 && (
                      <Step4Content
                        data={formData}
                        conflicts={conflicts}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <footer className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}>
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Cancelar
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        conflicts.some((c) => c.severidad === 'critical')
                      }
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                        isSubmitting ||
                          conflicts.some((c) => c.severidad === 'critical')
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary/90'
                      )}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </footer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

ScheduleForm.displayName = 'ScheduleForm';

export default ScheduleForm;
