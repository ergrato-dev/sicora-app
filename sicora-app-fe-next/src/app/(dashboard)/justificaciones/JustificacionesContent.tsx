/**
 * SICORA - Página de Justificaciones
 *
 * Módulo completo para gestión de justificaciones de ausencias.
 * Incluye:
 * - Lista de justificaciones con filtros
 * - Formulario de creación
 * - Vista de detalle
 * - Flujo de aprobación/rechazo (instructores/admin)
 *
 * @fileoverview Justifications management page
 * @module app/(dashboard)/justificaciones/JustificacionesContent
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Paperclip,
  MessageSquare,
  ChevronRight,
  MoreVertical,
  Download,
  Eye,
  FileCheck,
  FileX,
  Loader2,
  X,
  Upload,
} from 'lucide-react';
import { useJustificationsStore } from '@/stores/justificationsStore';
import {
  JUSTIFICATION_TYPE_CONFIG,
  JUSTIFICATION_STATUS_CONFIG,
  type Justification,
  type JustificationType,
  type JustificationStatus,
  type CreateJustificationRequest,
} from '@/types/justification.types';

// ============================================================================
// DEMO DATA
// ============================================================================

const demoJustifications: Justification[] = [
  {
    id: 'just-001',
    type: 'medical',
    status: 'pending',
    title: 'Cita médica programada',
    description: 'Tengo cita con el médico especialista para control de salud.',
    studentId: 'std-001',
    studentName: 'Ana María González',
    studentDocument: '1234567890',
    groupId: 'grp-001',
    groupName: '2584621 - Desarrollo de Software',
    absenceDate: '2025-01-15',
    absenceType: 'full_day',
    requestedBy: 'std-001',
    requestedByName: 'Ana María González',
    createdAt: '2025-01-14T10:30:00Z',
    updatedAt: '2025-01-14T10:30:00Z',
    attachments: [
      {
        id: 'att-001',
        fileName: 'cita_medica.pdf',
        fileType: 'application/pdf',
        fileSize: 245000,
        uploadedAt: '2025-01-14T10:30:00Z',
        uploadedBy: 'std-001',
        url: '/attachments/cita_medica.pdf',
      },
    ],
    comments: [],
  },
  {
    id: 'just-002',
    type: 'family_emergency',
    status: 'approved',
    title: 'Emergencia familiar',
    description: 'Situación de emergencia con un familiar cercano que requirió mi atención inmediata.',
    studentId: 'std-002',
    studentName: 'Carlos Andrés Pérez',
    studentDocument: '0987654321',
    groupId: 'grp-001',
    groupName: '2584621 - Desarrollo de Software',
    absenceDate: '2025-01-10',
    absenceType: 'full_day',
    requestedBy: 'std-002',
    requestedByName: 'Carlos Andrés Pérez',
    reviewedBy: 'inst-001',
    reviewedByName: 'Prof. María López',
    reviewedAt: '2025-01-11T14:00:00Z',
    reviewNotes: 'Justificación aprobada. Se recomienda ponerse al día con las actividades.',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-11T14:00:00Z',
    attachments: [],
    comments: [],
  },
  {
    id: 'just-003',
    type: 'academic',
    status: 'rejected',
    title: 'Participación en evento',
    description: 'Asistencia a conferencia de tecnología.',
    studentId: 'std-003',
    studentName: 'Laura Martínez',
    studentDocument: '1122334455',
    groupId: 'grp-002',
    groupName: '2584622 - Análisis de Datos',
    absenceDate: '2025-01-08',
    absenceType: 'partial',
    partialHours: 4,
    requestedBy: 'std-003',
    requestedByName: 'Laura Martínez',
    reviewedBy: 'inst-002',
    reviewedByName: 'Prof. Juan García',
    reviewedAt: '2025-01-09T10:00:00Z',
    reviewNotes: 'No se adjuntó documentación que soporte la participación oficial.',
    rejectionReason: 'Documentación insuficiente',
    createdAt: '2025-01-07T16:00:00Z',
    updatedAt: '2025-01-09T10:00:00Z',
    attachments: [],
    comments: [],
  },
  {
    id: 'just-004',
    type: 'transportation',
    status: 'pending',
    title: 'Problemas de transporte',
    description: 'Falla en el sistema de transporte público que impidió mi llegada a tiempo.',
    studentId: 'std-004',
    studentName: 'Miguel Ángel Rodríguez',
    studentDocument: '5566778899',
    groupId: 'grp-001',
    groupName: '2584621 - Desarrollo de Software',
    absenceDate: '2025-01-16',
    absenceType: 'partial',
    partialHours: 2,
    requestedBy: 'std-004',
    requestedByName: 'Miguel Ángel Rodríguez',
    createdAt: '2025-01-16T11:00:00Z',
    updatedAt: '2025-01-16T11:00:00Z',
    attachments: [],
    comments: [
      {
        id: 'com-001',
        content: 'Por favor adjuntar captura de la noticia o comunicado oficial del sistema de transporte.',
        authorId: 'inst-001',
        authorName: 'Prof. María López',
        authorRole: 'instructor',
        createdAt: '2025-01-16T14:00:00Z',
      },
    ],
  },
  {
    id: 'just-005',
    type: 'personal',
    status: 'pending',
    title: 'Trámite personal urgente',
    description: 'Necesito realizar un trámite en una entidad gubernamental que solo atiende en horario de formación.',
    studentId: 'std-005',
    studentName: 'Sofía Hernández',
    studentDocument: '9988776655',
    groupId: 'grp-002',
    groupName: '2584622 - Análisis de Datos',
    absenceDate: '2025-01-17',
    absenceType: 'partial',
    partialHours: 3,
    requestedBy: 'std-005',
    requestedByName: 'Sofía Hernández',
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-01-15T09:00:00Z',
    attachments: [],
    comments: [],
  },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Badge de estado de justificación
 */
function StatusBadge({ status }: { status: JustificationStatus }) {
  const config = JUSTIFICATION_STATUS_CONFIG[status];
  
  const icons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    cancelled: AlertCircle,
  };
  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

/**
 * Badge de tipo de justificación
 */
function TypeBadge({ type }: { type: JustificationType }) {
  const config = JUSTIFICATION_TYPE_CONFIG[type];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bgColor}`}>
      {config.label}
    </span>
  );
}

/**
 * Tarjeta de justificación en la lista
 */
function JustificationCard({
  justification,
  onView,
  onReview,
}: {
  justification: Justification;
  onView: () => void;
  onReview: () => void;
}) {
  const isPending = justification.status === 'pending';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={justification.status} />
            <TypeBadge type={justification.type} />
          </div>

          {/* Title */}
          <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
            {justification.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {justification.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {justification.studentName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(justification.absenceDate).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            {justification.attachments && justification.attachments.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                {justification.attachments.length} adjunto(s)
              </span>
            )}
            {justification.comments && justification.comments.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {justification.comments.length} comentario(s)
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="p-2 text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isPending && (
            <button
              onClick={onReview}
              className="p-2 text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Revisar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
  const { filters, setFilter, resetFilters } = useJustificationsStore();

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
            onChange={(e) => setFilter('status', e.target.value as JustificationStatus | 'all')}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobada</option>
            <option value="rejected">Rechazada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilter('type', e.target.value as JustificationType | 'all')}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">Todos</option>
            {Object.entries(JUSTIFICATION_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
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

        {/* Fecha hasta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => setFilter('dateTo', e.target.value || null)}
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

/**
 * Modal de crear justificación
 */
function CreateJustificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<CreateJustificationRequest>>({
    type: 'medical',
    title: '',
    description: '',
    absenceDate: '',
    absenceType: 'full_day',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addJustification } = useJustificationsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Crear justificación demo
    const newJustification: Justification = {
      id: `just-${Date.now()}`,
      type: formData.type as JustificationType,
      status: 'pending',
      title: formData.title || '',
      description: formData.description || '',
      studentId: 'std-current',
      studentName: 'Usuario Actual',
      studentDocument: '1234567890',
      groupId: 'grp-001',
      groupName: '2584621 - Desarrollo de Software',
      absenceDate: formData.absenceDate || new Date().toISOString(),
      absenceType: formData.absenceType || 'full_day',
      requestedBy: 'std-current',
      requestedByName: 'Usuario Actual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      comments: [],
    };

    addJustification(newJustification);
    setIsSubmitting(false);
    onClose();
    setFormData({
      type: 'medical',
      title: '',
      description: '',
      absenceDate: '',
      absenceType: 'full_day',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Nueva Justificación
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de justificación *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as JustificationType })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              {Object.entries(JUSTIFICATION_TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Breve descripción de la justificación"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          {/* Fecha de ausencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de ausencia *
            </label>
            <input
              type="date"
              required
              value={formData.absenceDate}
              onChange={(e) => setFormData({ ...formData, absenceDate: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          {/* Tipo de ausencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de ausencia
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="absenceType"
                  value="full_day"
                  checked={formData.absenceType === 'full_day'}
                  onChange={(e) => setFormData({ ...formData, absenceType: e.target.value as 'full_day' | 'partial' })}
                  className="text-brand-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Día completo</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="absenceType"
                  value="partial"
                  checked={formData.absenceType === 'partial'}
                  onChange={(e) => setFormData({ ...formData, absenceType: e.target.value as 'full_day' | 'partial' })}
                  className="text-brand-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Parcial</span>
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explica detalladamente el motivo de tu ausencia"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            />
          </div>

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Documentos de soporte
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arrastra archivos aquí o{' '}
                <button type="button" className="text-brand-600 hover:text-brand-700">
                  selecciona
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, imágenes (máx. 5MB)
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Enviar Justificación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal de revisión de justificación
 */
function ReviewModal({
  justification,
  onClose,
  onApprove,
  onReject,
}: {
  justification: Justification | null;
  onClose: () => void;
  onApprove: (notes: string) => void;
  onReject: (reason: string, notes: string) => void;
}) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!justification) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (action === 'approve') {
      onApprove(notes);
    } else if (action === 'reject') {
      onReject(rejectReason, notes);
    }

    setIsSubmitting(false);
    setAction(null);
    setNotes('');
    setRejectReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Revisar Justificación
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Información de la justificación */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={justification.status} />
              <TypeBadge type={justification.type} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {justification.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {justification.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Estudiante:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {justification.studentName}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Fecha de ausencia:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(justification.absenceDate).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Grupo:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {justification.groupName}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Solicitada:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(justification.createdAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Adjuntos */}
            {justification.attachments && justification.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Documentos adjuntos
                </h4>
                <div className="space-y-2">
                  {justification.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {att.fileName}
                      </span>
                      <button className="p-1 text-brand-600 hover:text-brand-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Acciones de revisión */}
          {justification.status === 'pending' && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              {action === null ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setAction('approve')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    <FileCheck className="w-5 h-5" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    <FileX className="w-5 h-5" />
                    Rechazar
                  </button>
                </div>
              ) : action === 'approve' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Vas a aprobar esta justificación
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Agregar comentarios o recomendaciones para el estudiante"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAction(null)}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Confirmar Aprobación
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Vas a rechazar esta justificación
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Motivo del rechazo *
                    </label>
                    <select
                      required
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="">Seleccionar motivo...</option>
                      <option value="Documentación insuficiente">Documentación insuficiente</option>
                      <option value="Fuera de plazo">Fuera de plazo</option>
                      <option value="Motivo no válido">Motivo no válido</option>
                      <option value="Información inconsistente">Información inconsistente</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notas adicionales
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Explicar el motivo del rechazo al estudiante"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAction(null)}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !rejectReason}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Confirmar Rechazo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function JustificacionesContent() {
  const {
    justifications,
    setJustifications,
    selectedJustification,
    setSelectedJustification,
    updateJustification,
    filters,
    setFilter,
    viewState,
    openCreate,
    openReview,
    closeModals,
  } = useJustificationsStore();

  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos demo
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setJustifications(demoJustifications);
      setIsLoading(false);
    };
    loadData();
  }, [setJustifications]);

  // Filtrar justificaciones
  const filteredJustifications = justifications.filter((j) => {
    if (filters.status !== 'all' && j.status !== filters.status) return false;
    if (filters.type !== 'all' && j.type !== filters.type) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (
        !j.title.toLowerCase().includes(search) &&
        !j.studentName.toLowerCase().includes(search) &&
        !j.description.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    return true;
  });

  // Estadísticas rápidas
  const stats = {
    total: justifications.length,
    pending: justifications.filter((j) => j.status === 'pending').length,
    approved: justifications.filter((j) => j.status === 'approved').length,
    rejected: justifications.filter((j) => j.status === 'rejected').length,
  };

  const handleApprove = (notes: string) => {
    if (selectedJustification) {
      updateJustification(selectedJustification.id, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewNotes: notes,
        reviewedBy: 'inst-001',
        reviewedByName: 'Instructor Actual',
      });
      closeModals();
    }
  };

  const handleReject = (reason: string, notes: string) => {
    if (selectedJustification) {
      updateJustification(selectedJustification.id, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewNotes: notes,
        rejectionReason: reason,
        reviewedBy: 'inst-001',
        reviewedByName: 'Instructor Actual',
      });
      closeModals();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Justificaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las justificaciones de ausencias
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva Justificación
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Aprobadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rechazadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, estudiante..."
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

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : filteredJustifications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay justificaciones
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filters.search || filters.status !== 'all' || filters.type !== 'all'
              ? 'No se encontraron justificaciones con los filtros aplicados'
              : 'Aún no se han registrado justificaciones'}
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Crear primera justificación
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJustifications.map((justification) => (
            <JustificationCard
              key={justification.id}
              justification={justification}
              onView={() => {
                setSelectedJustification(justification);
                openReview(justification.id);
              }}
              onReview={() => {
                setSelectedJustification(justification);
                openReview(justification.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateJustificationModal
        isOpen={viewState.isFormOpen}
        onClose={closeModals}
      />

      <ReviewModal
        justification={selectedJustification}
        onClose={() => {
          setSelectedJustification(null);
          closeModals();
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
