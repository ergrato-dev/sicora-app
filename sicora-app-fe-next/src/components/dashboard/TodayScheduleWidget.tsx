'use client';

import { Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TodaySchedule } from '@/types/dashboard.types';

interface TodayScheduleWidgetProps {
  schedules: TodaySchedule[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Widget de Horario del Día
 * Muestra las clases programadas para el día actual
 */
export function TodayScheduleWidget({
  schedules,
  isLoading,
  className,
}: TodayScheduleWidgetProps) {
  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-sena-primary-600" />
          <h3 className="font-semibold text-gray-900">Horario de Hoy</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-12 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinutes;

  // Determinar estado de cada clase
  const schedulesWithStatus = schedules.map((schedule) => {
    const [startHour, startMin] = schedule.start_time.split(':').map(Number);
    const [endHour, endMin] = schedule.end_time.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    let status: 'upcoming' | 'in_progress' | 'completed' = 'upcoming';
    if (currentTimeMinutes >= endMinutes) {
      status = 'completed';
    } else if (currentTimeMinutes >= startMinutes) {
      status = 'in_progress';
    }

    return { ...schedule, computedStatus: status };
  });

  const inProgress = schedulesWithStatus.find((s) => s.computedStatus === 'in_progress');
  const upcoming = schedulesWithStatus.filter((s) => s.computedStatus === 'upcoming');
  const completed = schedulesWithStatus.filter((s) => s.computedStatus === 'completed');

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sena-primary-600" />
          <h3 className="font-semibold text-gray-900">Horario de Hoy</h3>
        </div>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tienes clases programadas para hoy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Clase en progreso */}
          {inProgress && (
            <div className="p-4 bg-sena-primary-50 border-2 border-sena-primary-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-sena-primary-600 text-white px-3 py-1 rounded text-sm font-medium">
                  AHORA
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{inProgress.subject}</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{inProgress.start_time} - {inProgress.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{inProgress.venue_name} ({inProgress.venue_code})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{inProgress.instructor_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Próximas clases */}
          {upcoming.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Próximas</p>
              {upcoming.map((schedule) => (
                <ScheduleItem key={schedule.id} schedule={schedule} status="upcoming" />
              ))}
            </div>
          )}

          {/* Clases completadas (colapsadas) */}
          {completed.length > 0 && (
            <div className="space-y-2 opacity-60">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Completadas</p>
              {completed.slice(0, 2).map((schedule) => (
                <ScheduleItem key={schedule.id} schedule={schedule} status="completed" />
              ))}
              {completed.length > 2 && (
                <p className="text-xs text-gray-400 text-center">
                  +{completed.length - 2} más completadas
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ScheduleItemProps {
  schedule: TodaySchedule;
  status: 'upcoming' | 'completed';
}

function ScheduleItem({ schedule, status }: ScheduleItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        status === 'upcoming' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-50/50'
      )}
    >
      <div className="flex-shrink-0 text-center">
        <div className="text-sm font-semibold text-gray-900">{schedule.start_time}</div>
        <div className="text-xs text-gray-500">{schedule.end_time}</div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn('font-medium truncate', status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900')}>
          {schedule.subject}
        </h4>
        <p className="text-sm text-gray-500 truncate">
          {schedule.venue_code} · {schedule.instructor_name}
        </p>
      </div>
      {schedule.ficha && (
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
          {schedule.ficha}
        </span>
      )}
    </div>
  );
}
