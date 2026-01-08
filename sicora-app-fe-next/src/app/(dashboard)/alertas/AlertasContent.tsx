/**
 * SICORA - Página de Alertas
 *
 * Módulo completo para gestión de alertas y notificaciones.
 * Incluye:
 * - Lista de alertas con filtros por tipo, prioridad, estado
 * - Vista de detalle con acciones
 * - Acciones masivas (marcar como leído, archivar)
 * - Estadísticas de alertas
 *
 * @fileoverview Alerts management page
 * @module app/(dashboard)/alertas/AlertasContent
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Info,
  Search,
  Filter,
  CheckCircle,
  Archive,
  Trash2,
  Eye,
  X,
  ChevronRight,
  Clock,
  User,
  Users,
  Calendar,
  BarChart3,
  Loader2,
  Check,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import { useAlertsStore } from '@/stores/alertsStore';
import {
  ALERT_TYPE_CONFIG,
  ALERT_PRIORITY_CONFIG,
  ALERT_STATUS_CONFIG,
  type Alert,
  type AlertType,
  type AlertPriority,
  type AlertStatus,
} from '@/types/alert.types';

// ============================================================================
// DEMO DATA
// ============================================================================

const demoAlerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'attendance_critical',
    priority: 'critical',
    status: 'unread',
    title: 'Estudiante en riesgo de pérdida',
    message: 'El estudiante ha alcanzado el 20% de inasistencia acumulada, superando el límite permitido.',
    recipientId: 'inst-001',
    recipientType: 'instructor',
    student: {
      id: 'std-001',
      name: 'Carlos Andrés Pérez',
      document: '1234567890',
      email: 'carlos.perez@email.com',
      groupId: 'grp-001',
      groupName: '2584621 - Desarrollo de Software',
      programId: 'prog-001',
      programName: 'Tecnología en Desarrollo de Software',
    },
    metrics: {
      totalSessions: 50,
      attended: 40,
      absences: 10,
      justified: 3,
      unjustified: 7,
      attendanceRate: 80,
      consecutiveAbsences: 3,
      riskLevel: 'critical',
    },
    actions: [
      { id: 'act-1', label: 'Ver historial', type: 'primary', action: 'view_history' },
      { id: 'act-2', label: 'Contactar estudiante', type: 'secondary', action: 'contact' },
    ],
    createdAt: '2025-01-16T08:00:00Z',
    isExpired: false,
  },
  {
    id: 'alert-002',
    type: 'attendance_warning',
    priority: 'high',
    status: 'unread',
    title: 'Advertencia de asistencia',
    message: 'El estudiante ha faltado 3 días consecutivos sin justificación.',
    recipientId: 'inst-001',
    recipientType: 'instructor',
    student: {
      id: 'std-002',
      name: 'Ana María González',
      document: '0987654321',
      groupId: 'grp-001',
      groupName: '2584621 - Desarrollo de Software',
      programId: 'prog-001',
      programName: 'Tecnología en Desarrollo de Software',
    },
    metrics: {
      totalSessions: 50,
      attended: 45,
      absences: 5,
      justified: 2,
      unjustified: 3,
      attendanceRate: 90,
      consecutiveAbsences: 3,
      riskLevel: 'medium',
    },
    createdAt: '2025-01-16T09:30:00Z',
    isExpired: false,
  },
  {
    id: 'alert-003',
    type: 'justification_pending',
    priority: 'medium',
    status: 'unread',
    title: 'Nueva justificación por revisar',
    message: 'Se ha recibido una nueva solicitud de justificación que requiere tu revisión.',
    recipientId: 'inst-001',
    recipientType: 'instructor',
    student: {
      id: 'std-003',
      name: 'Laura Martínez',
      document: '1122334455',
      groupId: 'grp-002',
      groupName: '2584622 - Análisis de Datos',
      programId: 'prog-002',
      programName: 'Tecnología en Análisis de Datos',
    },
    actions: [
      { id: 'act-1', label: 'Revisar justificación', type: 'primary', action: 'review', url: '/justificaciones' },
    ],
    createdAt: '2025-01-16T10:00:00Z',
    isExpired: false,
  },
  {
    id: 'alert-004',
    type: 'schedule_change',
    priority: 'medium',
    status: 'read',
    title: 'Cambio de horario programado',
    message: 'Se ha modificado el horario de la sesión del viernes 17 de enero. Nueva hora: 10:00 AM.',
    recipientId: 'grp-001',
    recipientType: 'group',
    details: 'La sesión de Programación Avanzada se ha reprogramado de 8:00 AM a 10:00 AM debido a mantenimiento de aulas.',
    createdAt: '2025-01-15T14:00:00Z',
    readAt: '2025-01-15T16:30:00Z',
    isExpired: false,
  },
  {
    id: 'alert-005',
    type: 'justification_approved',
    priority: 'low',
    status: 'read',
    title: 'Justificación aprobada',
    message: 'Tu justificación para la ausencia del 10 de enero ha sido aprobada.',
    recipientId: 'std-001',
    recipientType: 'student',
    createdAt: '2025-01-14T11:00:00Z',
    readAt: '2025-01-14T12:00:00Z',
    isExpired: false,
  },
  {
    id: 'alert-006',
    type: 'evaluation_reminder',
    priority: 'medium',
    status: 'unread',
    title: 'Recordatorio de evaluación',
    message: 'Mañana vence el plazo para entregar la evaluación de Bases de Datos.',
    recipientId: 'std-002',
    recipientType: 'student',
    createdAt: '2025-01-16T07:00:00Z',
    expiresAt: '2025-01-17T23:59:59Z',
    isExpired: false,
  },
  {
    id: 'alert-007',
    type: 'attendance_risk',
    priority: 'high',
    status: 'archived',
    title: 'Posible riesgo de deserción',
    message: 'Se ha detectado un patrón de inasistencia que podría indicar riesgo de deserción.',
    recipientId: 'coord-001',
    recipientType: 'coordinator',
    student: {
      id: 'std-004',
      name: 'Miguel Ángel Rodríguez',
      document: '5566778899',
      groupId: 'grp-001',
      groupName: '2584621 - Desarrollo de Software',
      programId: 'prog-001',
      programName: 'Tecnología en Desarrollo de Software',
    },
    createdAt: '2025-01-10T08:00:00Z',
    isExpired: false,
  },
  {
    id: 'alert-008',
    type: 'system_notification',
    priority: 'low',
    status: 'read',
    title: 'Mantenimiento programado',
    message: 'El sistema estará en mantenimiento el sábado 18 de enero de 2:00 AM a 6:00 AM.',
    recipientId: 'broadcast',
    recipientType: 'broadcast',
    createdAt: '2025-01-14T09:00:00Z',
    readAt: '2025-01-14T10:00:00Z',
    isExpired: false,
  },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Icono de prioridad
 */
function PriorityIcon({ priority, className = 'w-5 h-5' }: { priority: AlertPriority; className?: string }) {
  const icons = {
    low: Info,
    medium: AlertCircle,
    high: AlertTriangle,
    critical: AlertOctagon,
  };
  const Icon = icons[priority];
  const config = ALERT_PRIORITY_CONFIG[priority];

  return <Icon className={`${className} ${config.color}`} />;
}

/**
 * Badge de prioridad
 */
function PriorityBadge({ priority }: { priority: AlertPriority }) {
  const config = ALERT_PRIORITY_CONFIG[priority];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  );
}

/**
 * Badge de estado
 */
function StatusBadge({ status }: { status: AlertStatus }) {
  const config = ALERT_STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  );
}

/**
 * Tarjeta de alerta
 */
function AlertCard({
  alert,
  isSelected,
  onToggleSelect,
  onView,
  onMarkRead,
  onArchive,
  selectionMode,
}: {
  alert: Alert;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onMarkRead: () => void;
  onArchive: () => void;
  selectionMode: boolean;
}) {
  const isUnread = alert.status === 'unread';
  const typeConfig = ALERT_TYPE_CONFIG[alert.type];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${
        isUnread
          ? 'border-brand-200 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-900/10'
          : 'border-gray-200 dark:border-gray-700'
      } ${isSelected ? 'ring-2 ring-brand-500' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox en modo selección */}
          {selectionMode && (
            <div className="pt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
              />
            </div>
          )}

          {/* Icono de prioridad */}
          <div className={`p-2 rounded-lg ${ALERT_PRIORITY_CONFIG[alert.priority].bgColor}`}>
            <PriorityIcon priority={alert.priority} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <PriorityBadge priority={alert.priority} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {typeConfig.label}
              </span>
              {isUnread && (
                <span className="w-2 h-2 bg-brand-600 rounded-full" />
              )}
            </div>

            <h3 className={`font-medium mb-1 ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {alert.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {alert.message}
            </p>

            {/* Info del estudiante si aplica */}
            {alert.student && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <User className="w-3.5 h-3.5" />
                <span>{alert.student.name}</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span>{alert.student.groupName}</span>
              </div>
            )}

            {/* Métricas si aplica */}
            {alert.metrics && (
              <div className="flex items-center gap-4 text-xs mb-2">
                <span className={`font-medium ${
                  alert.metrics.attendanceRate < 80 ? 'text-red-600' : 
                  alert.metrics.attendanceRate < 90 ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {alert.metrics.attendanceRate}% asistencia
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {alert.metrics.unjustified} faltas sin justificar
                </span>
              </div>
            )}

            {/* Fecha */}
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {new Date(alert.createdAt).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-start gap-1">
            <button
              onClick={onView}
              className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Ver detalle"
            >
              <Eye className="w-4 h-4" />
            </button>
            {isUnread && (
              <button
                onClick={onMarkRead}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Marcar como leída"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onArchive}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Archivar"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal de detalle de alerta
 */
function AlertDetailModal({
  alert,
  onClose,
  onMarkRead,
  onArchive,
}: {
  alert: Alert | null;
  onClose: () => void;
  onMarkRead: () => void;
  onArchive: () => void;
}) {
  if (!alert) return null;

  const typeConfig = ALERT_TYPE_CONFIG[alert.type];
  const isUnread = alert.status === 'unread';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${ALERT_PRIORITY_CONFIG[alert.priority].bgColor}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <PriorityIcon priority={alert.priority} className="w-6 h-6 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PriorityBadge priority={alert.priority} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {typeConfig.label}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {alert.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mensaje */}
          <div>
            <p className="text-gray-700 dark:text-gray-300">{alert.message}</p>
            {alert.details && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {alert.details}
              </p>
            )}
          </div>

          {/* Estudiante */}
          {alert.student && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Información del estudiante
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{alert.student.name}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Documento:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{alert.student.document}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Grupo:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{alert.student.groupName}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Programa:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{alert.student.programName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Métricas */}
          {alert.metrics && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Métricas de asistencia
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className={`text-2xl font-bold ${
                    alert.metrics.attendanceRate < 80 ? 'text-red-600' : 
                    alert.metrics.attendanceRate < 90 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {alert.metrics.attendanceRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Asistencia</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {alert.metrics.absences}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Faltas totales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {alert.metrics.unjustified}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sin justificar</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Faltas consecutivas:</span>
                  <span className={`font-medium ${
                    alert.metrics.consecutiveAbsences >= 3 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {alert.metrics.consecutiveAbsences}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500 dark:text-gray-400">Nivel de riesgo:</span>
                  <span className={`font-medium px-2 py-0.5 rounded ${
                    alert.metrics.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                    alert.metrics.riskLevel === 'high' ? 'bg-amber-100 text-amber-700' :
                    alert.metrics.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {alert.metrics.riskLevel === 'critical' ? 'Crítico' :
                     alert.metrics.riskLevel === 'high' ? 'Alto' :
                     alert.metrics.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fecha y estado */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <span>Creada: </span>
              <span className="text-gray-700 dark:text-gray-300">
                {new Date(alert.createdAt).toLocaleString('es-CO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <StatusBadge status={alert.status} />
          </div>

          {/* Acciones */}
          {(alert.actions || isUnread) && (
            <div className="flex flex-wrap gap-3">
              {alert.actions?.map((action) => (
                <button
                  key={action.id}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    action.type === 'primary'
                      ? 'bg-brand-600 hover:bg-brand-700 text-white'
                      : action.type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {action.label}
                </button>
              ))}
              {isUnread && (
                <button
                  onClick={onMarkRead}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Marcar como leída
                </button>
              )}
              <button
                onClick={onArchive}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archivar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Panel de filtros
 */
function FiltersPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { filters, setFilter, resetFilters } = useAlertsStore();

  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Filtros</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value as AlertStatus | 'all')}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">Todos</option>
            <option value="unread">No leídas</option>
            <option value="read">Leídas</option>
            <option value="archived">Archivadas</option>
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridad
          </label>
          <select
            value={filters.priority}
            onChange={(e) => setFilter('priority', e.target.value as AlertPriority | 'all')}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilter('type', e.target.value as AlertType | 'all')}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">Todos</option>
            {Object.entries(ALERT_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => setFilter('dateFrom', e.target.value || null)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AlertasContent() {
  const {
    alerts,
    setAlerts,
    unreadCount,
    setUnreadCount,
    selectedAlert,
    setSelectedAlert,
    filters,
    setFilter,
    markAsRead,
    markAllAsRead,
    archiveAlert,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelectionMode,
    setSelectionMode,
    markMultipleAsRead,
    archiveMultiple,
    isDetailOpen,
    openDetail,
    closeDetail,
  } = useAlertsStore();

  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos demo
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAlerts(demoAlerts);
      setUnreadCount(demoAlerts.filter((a) => a.status === 'unread').length);
      setIsLoading(false);
    };
    loadData();
  }, [setAlerts, setUnreadCount]);

  // Filtrar alertas
  const filteredAlerts = alerts.filter((alert) => {
    if (filters.status !== 'all' && alert.status !== filters.status) return false;
    if (filters.priority !== 'all' && alert.priority !== filters.priority) return false;
    if (filters.type !== 'all' && alert.type !== filters.type) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (
        !alert.title.toLowerCase().includes(search) &&
        !alert.message.toLowerCase().includes(search) &&
        !(alert.student?.name.toLowerCase().includes(search))
      ) {
        return false;
      }
    }
    return true;
  });

  // Estadísticas rápidas
  const stats = {
    total: alerts.length,
    unread: alerts.filter((a) => a.status === 'unread').length,
    critical: alerts.filter((a) => a.priority === 'critical' && a.status === 'unread').length,
    high: alerts.filter((a) => a.priority === 'high' && a.status === 'unread').length,
  };

  const handleMarkRead = (id: string) => {
    markAsRead(id);
  };

  const handleArchive = (id: string) => {
    archiveAlert(id);
  };

  const handleBulkMarkRead = () => {
    const ids = Array.from(selectedIds);
    markMultipleAsRead(ids);
    clearSelection();
  };

  const handleBulkArchive = () => {
    const ids = Array.from(selectedIds);
    archiveMultiple(ids);
    clearSelection();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-brand-600" />
            Alertas
            {stats.unread > 0 && (
              <span className="px-2.5 py-0.5 bg-red-600 text-white text-sm font-medium rounded-full">
                {stats.unread}
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Centro de notificaciones y alertas del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar todo como leído
            </button>
          )}
          <button
            onClick={() => setSelectionMode(!isSelectionMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isSelectionMode
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Check className="w-4 h-4" />
            {isSelectionMode ? 'Cancelar selección' : 'Seleccionar'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.unread}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin leer</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Críticas</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.high}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Alta prioridad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Actions */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg">
          <span className="text-sm font-medium text-brand-700 dark:text-brand-400">
            {selectedIds.size} alerta(s) seleccionada(s)
          </span>
          <div className="flex-1" />
          <button
            onClick={handleBulkMarkRead}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Check className="w-4 h-4" />
            Marcar como leídas
          </button>
          <button
            onClick={handleBulkArchive}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Archive className="w-4 h-4" />
            Archivar
          </button>
          <button
            onClick={clearSelection}
            className="p-1.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar alertas..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
            showFilters
              ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Filters Panel */}
      <FiltersPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay alertas
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.type !== 'all'
              ? 'No se encontraron alertas con los filtros aplicados'
              : '¡Genial! No tienes alertas pendientes'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isSelected={selectedIds.has(alert.id)}
              onToggleSelect={() => toggleSelection(alert.id)}
              onView={() => openDetail(alert)}
              onMarkRead={() => handleMarkRead(alert.id)}
              onArchive={() => handleArchive(alert.id)}
              selectionMode={isSelectionMode}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={closeDetail}
        onMarkRead={() => {
          if (selectedAlert) {
            handleMarkRead(selectedAlert.id);
          }
        }}
        onArchive={() => {
          if (selectedAlert) {
            handleArchive(selectedAlert.id);
            closeDetail();
          }
        }}
      />
    </div>
  );
}
