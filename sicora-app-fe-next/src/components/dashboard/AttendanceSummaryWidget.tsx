'use client';

import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type {
  StudentAttendanceSummary,
  InstructorAttendanceSummary,
  GlobalAttendanceSummary,
} from '@/types/dashboard.types';

// ============================================================================
// TIPOS
// ============================================================================

type AttendanceSummary =
  | StudentAttendanceSummary
  | InstructorAttendanceSummary
  | GlobalAttendanceSummary;

interface AttendanceSummaryWidgetProps {
  data: AttendanceSummary | null;
  role: 'aprendiz' | 'instructor' | 'admin' | 'coordinador' | 'administrativo';
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// WIDGET PRINCIPAL
// ============================================================================

/**
 * Widget de Resumen de Asistencia
 * Muestra estadísticas de asistencia según el rol del usuario
 */
export function AttendanceSummaryWidget({
  data,
  role,
  isLoading,
  className,
}: AttendanceSummaryWidgetProps) {
  if (isLoading) {
    return <AttendanceWidgetSkeleton className={className} />;
  }

  if (!data) {
    return (
      <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay datos de asistencia disponibles</p>
        </div>
      </div>
    );
  }

  // Renderizar según rol
  if (role === 'aprendiz') {
    return <StudentAttendanceWidget data={data as StudentAttendanceSummary} className={className} />;
  }

  if (role === 'instructor') {
    return <InstructorAttendanceWidget data={data as InstructorAttendanceSummary} className={className} />;
  }

  return <GlobalAttendanceWidget data={data as GlobalAttendanceSummary} className={className} />;
}

// ============================================================================
// WIDGET PARA APRENDIZ
// ============================================================================

interface StudentAttendanceWidgetProps {
  data: StudentAttendanceSummary;
  className?: string;
}

function StudentAttendanceWidget({ data, className }: StudentAttendanceWidgetProps) {
  const attendanceRate = data.total_classes > 0
    ? Math.round((data.attended / data.total_classes) * 100)
    : 0;

  const isGoodRate = attendanceRate >= 80;
  const isWarningRate = attendanceRate >= 60 && attendanceRate < 80;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Mi Asistencia</h3>
        <span className="text-sm text-gray-500">Este mes</span>
      </div>

      {/* Círculo de progreso */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - attendanceRate / 100)}`}
              className={cn(
                'transition-all duration-500',
                isGoodRate && 'text-green-500',
                isWarningRate && 'text-yellow-500',
                !isGoodRate && !isWarningRate && 'text-red-500'
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-900">{attendanceRate}%</span>
              <p className="text-xs text-gray-500">Asistencia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-700">{data.attended}</p>
          <p className="text-xs text-green-600">Asistencias</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-700">{data.absences}</p>
          <p className="text-xs text-red-600">Ausencias</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-yellow-700">{data.late}</p>
          <p className="text-xs text-yellow-600">Tardanzas</p>
        </div>
      </div>

      {/* Justificaciones pendientes */}
      {data.pending_justifications > 0 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-700">
              {data.pending_justifications} justificación(es) pendiente(s)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WIDGET PARA INSTRUCTOR
// ============================================================================

interface InstructorAttendanceWidgetProps {
  data: InstructorAttendanceSummary;
  className?: string;
}

function InstructorAttendanceWidget({ data, className }: InstructorAttendanceWidgetProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Asistencia de mis Grupos</h3>
        <span className="text-sm text-gray-500">Hoy</span>
      </div>

      {/* Tasa general */}
      <div className="flex items-center justify-between p-4 bg-sena-primary-50 rounded-lg mb-4">
        <div>
          <p className="text-sm text-sena-primary-600">Tasa de Asistencia</p>
          <p className="text-3xl font-bold text-sena-primary-700">{data.average_rate.toFixed(1)}%</p>
        </div>
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium',
          data.trend >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {data.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{data.trend >= 0 ? '+' : ''}{data.trend.toFixed(1)}%</span>
        </div>
      </div>

      {/* Resumen del día */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Total Estudiantes</p>
          <p className="text-xl font-bold text-gray-900">{data.total_students}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Presentes Hoy</p>
          <p className="text-xl font-bold text-gray-900">{data.present_today}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Clases Hoy</p>
          <p className="text-xl font-bold text-gray-900">{data.classes_today}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-xl font-bold text-gray-900">{data.pending_attendance}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WIDGET PARA ADMIN/COORDINADOR
// ============================================================================

interface GlobalAttendanceWidgetProps {
  data: GlobalAttendanceSummary;
  className?: string;
}

function GlobalAttendanceWidget({ data, className }: GlobalAttendanceWidgetProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Asistencia Global</h3>
        <span className="text-sm text-gray-500">Esta semana</span>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-sena-primary-50 rounded-lg">
          <p className="text-sm text-sena-primary-600">Tasa Global</p>
          <p className="text-3xl font-bold text-sena-primary-700">{data.global_rate.toFixed(1)}%</p>
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium mt-1',
            data.trend >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {data.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{data.trend >= 0 ? '+' : ''}{data.trend.toFixed(1)}% vs semana anterior</span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Aprendices Activos</p>
          <p className="text-3xl font-bold text-gray-900">{data.active_students.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{data.total_groups} grupos</p>
        </div>
      </div>

      {/* Alertas */}
      {data.critical_groups > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">
              {data.critical_groups} grupo(s) con asistencia crítica (&lt;60%)
            </span>
          </div>
        </div>
      )}

      {/* Distribución */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Distribución</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${data.on_time_rate}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-16">
            {data.on_time_rate.toFixed(0)}% a tiempo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500"
              style={{ width: `${data.late_rate}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-16">
            {data.late_rate.toFixed(0)}% tarde
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500"
              style={{ width: `${data.absence_rate}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-16">
            {data.absence_rate.toFixed(0)}% ausente
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

function AttendanceWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-32 w-32 mx-auto mb-6 bg-gray-200 rounded-full" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
