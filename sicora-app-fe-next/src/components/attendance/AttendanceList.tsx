/**
 * SICORA - Componente Lista de Asistencia
 *
 * Muestra la lista de estudiantes para registro de asistencia.
 * Permite marcar presentes, ausentes, tardanzas de forma individual
 * o masiva.
 *
 * @fileoverview Attendance List component
 * @module components/attendance/AttendanceList
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Clock,
  Search,
  ChevronUp,
  User,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AttendanceStatus } from '@/types/attendance.types';
import { ATTENDANCE_STATUS_CONFIG } from '@/types/attendance.types';
import type { StudentForAttendance } from '@/stores/attendanceStore';

/* =============================================================================
   INTERFACES
   ============================================================================= */

interface AttendanceListProps {
  /** Lista de estudiantes */
  students: StudentForAttendance[];
  /** Si está guardando */
  isSaving: boolean;
  /** Callback para marcar asistencia individual */
  onMarkAttendance: (studentId: string, status: AttendanceStatus) => Promise<boolean>;
  /** Callback para marcar todos */
  onMarkAll: (status: AttendanceStatus) => Promise<boolean>;
  /** Callback para guardar todo */
  onSaveAll: () => Promise<boolean>;
  /** Stats de la sesión */
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    pending: number;
    percentage: number;
  };
  /** Clase adicional */
  className?: string;
}

/* =============================================================================
   COMPONENTES AUXILIARES
   ============================================================================= */

/**
 * Botón de estado de asistencia
 */
interface StatusButtonProps {
  status: AttendanceStatus;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

function StatusButton({ status, isActive, onClick, disabled, size = 'md' }: StatusButtonProps) {
  const config = ATTENDANCE_STATUS_CONFIG[status];
  
  const icons: Record<AttendanceStatus, React.ReactNode> = {
    presente: <Check className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />,
    ausente: <X className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />,
    tardanza: <Clock className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />,
    justificado: <CheckCircle className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />,
    excusa: <AlertCircle className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />,
    permiso: <Check className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />,
    pendiente: <Clock className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={config.label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all',
        size === 'sm' ? 'p-1.5' : 'p-2',
        isActive
          ? cn(config.bgColor, config.color, 'ring-2 ring-offset-1', `ring-current`)
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icons[status]}
    </button>
  );
}

/**
 * Fila de estudiante
 */
interface StudentRowProps {
  student: StudentForAttendance;
  onMarkAttendance: (status: AttendanceStatus) => void;
  isLoading: boolean;
}

function StudentRow({ student, onMarkAttendance, isLoading }: StudentRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentStatus = student.currentStatus || 'pendiente';
  const statusConfig = ATTENDANCE_STATUS_CONFIG[currentStatus];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'border-b border-gray-100 dark:border-gray-700 last:border-0',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {student.name}
          </p>
          {student.document && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {student.document}
            </p>
          )}
        </div>

        {/* Estado actual */}
        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          statusConfig.bgColor,
          statusConfig.color
        )}>
          {statusConfig.label}
        </div>

        {/* Botones de acción rápida */}
        <div className="flex items-center gap-1">
          <StatusButton
            status="presente"
            isActive={currentStatus === 'presente'}
            onClick={() => onMarkAttendance('presente')}
            disabled={isLoading}
            size="sm"
          />
          <StatusButton
            status="ausente"
            isActive={currentStatus === 'ausente'}
            onClick={() => onMarkAttendance('ausente')}
            disabled={isLoading}
            size="sm"
          />
          <StatusButton
            status="tardanza"
            isActive={currentStatus === 'tardanza'}
            onClick={() => onMarkAttendance('tardanza')}
            disabled={isLoading}
            size="sm"
          />
          
          {/* Más opciones */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Panel expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 flex flex-wrap gap-2">
              {(['justificado', 'excusa', 'permiso'] as AttendanceStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    onMarkAttendance(status);
                    setIsExpanded(false);
                  }}
                  disabled={isLoading}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    currentStatus === status
                      ? cn(ATTENDANCE_STATUS_CONFIG[status].bgColor, ATTENDANCE_STATUS_CONFIG[status].color)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {ATTENDANCE_STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================= */

export function AttendanceList({
  students,
  isSaving,
  onMarkAttendance,
  onMarkAll,
  onSaveAll,
  stats,
  className,
}: AttendanceListProps) {
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'todos'>('todos');
  const [loadingStudents, setLoadingStudents] = useState<Set<string>>(new Set());

  /**
   * Filtrar estudiantes
   */
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Filtro por búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(term);
        const matchesDoc = student.document?.toLowerCase().includes(term);
        if (!matchesName && !matchesDoc) return false;
      }

      // Filtro por estado
      if (filterStatus !== 'todos') {
        const currentStatus = student.currentStatus || 'pendiente';
        if (currentStatus !== filterStatus) return false;
      }

      return true;
    });
  }, [students, searchTerm, filterStatus]);

  /**
   * Handler para marcar asistencia individual
   */
  const handleMarkAttendance = useCallback(async (
    studentId: string,
    status: AttendanceStatus
  ) => {
    setLoadingStudents((prev) => new Set(prev).add(studentId));
    
    try {
      await onMarkAttendance(studentId, status);
    } finally {
      setLoadingStudents((prev) => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  }, [onMarkAttendance]);

  /**
   * Renderizar stats
   */
  const renderStats = () => (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {[
        { label: 'Total', value: stats.total, color: 'text-gray-600' },
        { label: 'Presentes', value: stats.present, color: 'text-green-600' },
        { label: 'Ausentes', value: stats.absent, color: 'text-red-600' },
        { label: 'Tardanzas', value: stats.late, color: 'text-yellow-600' },
        { label: 'Pendientes', value: stats.pending, color: 'text-gray-400' },
      ].map((stat) => (
        <div
          key={stat.label}
          className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
        >
          <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );

  /**
   * Renderizar barra de progreso
   */
  const renderProgress = () => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progreso de asistencia
        </span>
        <span className="text-sm font-bold text-sena-primary-600">
          {stats.percentage}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sena-primary-500 to-sena-primary-400 transition-all duration-300"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>
    </div>
  );

  /**
   * Renderizar toolbar
   */
  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Filtro por estado */}
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | 'todos')}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sena-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        <option value="todos">Todos los estados</option>
        <option value="presente">✓ Presentes</option>
        <option value="ausente">✗ Ausentes</option>
        <option value="tardanza">⏰ Tardanzas</option>
        <option value="pendiente">○ Pendientes</option>
      </select>
    </div>
  );

  /**
   * Renderizar acciones masivas
   */
  const renderBulkActions = () => (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
        Marcar todos como:
      </span>
      <button
        type="button"
        onClick={() => onMarkAll('presente')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
      >
        <Check className="h-3 w-3" />
        Presentes
      </button>
      <button
        type="button"
        onClick={() => onMarkAll('ausente')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
      >
        <X className="h-3 w-3" />
        Ausentes
      </button>

      <div className="flex-1" />

      {/* Guardar todo */}
      <button
        type="button"
        onClick={onSaveAll}
        disabled={isSaving || stats.pending === stats.total}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          'bg-sena-primary-500 text-white hover:bg-sena-primary-600',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isSaving ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Guardar asistencia
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-sena-primary-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Lista de Asistencia
          </h3>
          <span className="text-sm text-gray-500">
            ({filteredStudents.length} de {students.length})
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stats */}
        {renderStats()}
        
        {/* Progress */}
        {renderProgress()}

        {/* Toolbar */}
        {renderToolbar()}

        {/* Bulk Actions */}
        {renderBulkActions()}

        {/* Lista de estudiantes */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {filteredStudents.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  onMarkAttendance={(status) => handleMarkAttendance(student.id, status)}
                  isLoading={loadingStudents.has(student.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {searchTerm || filterStatus !== 'todos'
                  ? 'No se encontraron estudiantes con los filtros aplicados'
                  : 'No hay estudiantes en esta sesión'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceList;
