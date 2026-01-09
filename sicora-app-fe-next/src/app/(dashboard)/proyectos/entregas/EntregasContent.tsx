'use client';

/**
 * Página de Entregas - ProjectEvalService
 * Gestión de entregas de proyectos
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  FileUp,
  Calendar,
  Clock,
  ChevronRight,
  User,
  File,
  Loader2,
  Eye,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  ExternalLink,
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import type { Submission, SubmissionStatus, DeliverableType } from '@/types/project.types';
import { SUBMISSION_STATUS_CONFIG, DELIVERABLE_TYPE_CONFIG } from '@/types/project.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoSubmissions: Submission[] = [
  {
    id: 'sub-1',
    projectId: 'proj-1',
    projectName: 'Sistema de Gestión de Inventarios',
    deliverableId: 'del-1',
    deliverableName: 'Documento de Requerimientos',
    deliverableType: 'document',
    teamId: 'team-1',
    teamMembers: [
      { id: 'student-1', name: 'Carlos Andrés Martínez' },
      { id: 'student-3', name: 'Laura Sofía Hernández' },
      { id: 'student-4', name: 'Miguel Ángel Torres' },
    ],
    status: 'evaluated',
    files: [
      {
        id: 'file-1',
        fileName: 'SRS_Inventarios_v1.2.pdf',
        fileUrl: '/uploads/srs-inventarios.pdf',
        fileSize: 2456789,
        mimeType: 'application/pdf',
        uploadedAt: '2025-11-12T14:30:00Z',
      },
      {
        id: 'file-2',
        fileName: 'Diagramas_Casos_Uso.pdf',
        fileUrl: '/uploads/casos-uso.pdf',
        fileSize: 1234567,
        mimeType: 'application/pdf',
        uploadedAt: '2025-11-12T14:35:00Z',
      },
    ],
    description: 'Documento de especificación de requerimientos del sistema incluyendo casos de uso y diagramas.',
    submittedAt: '2025-11-12T15:00:00Z',
    dueDate: '2025-11-15',
    isLate: false,
    comments: [
      {
        id: 'comment-1',
        content: 'Buen trabajo en la documentación de requerimientos. Los casos de uso están bien estructurados.',
        authorId: 'instructor-1',
        authorName: 'María González',
        authorRole: 'instructor',
        createdAt: '2025-11-14T10:00:00Z',
        isPrivate: false,
      },
    ],
    evaluationId: 'eval-1',
    score: 85,
    feedback: 'Documento completo y bien estructurado. Falta mayor detalle en algunos requerimientos no funcionales.',
    createdAt: '2025-11-10T09:00:00Z',
    updatedAt: '2025-11-14T10:00:00Z',
  },
  {
    id: 'sub-2',
    projectId: 'proj-1',
    projectName: 'Sistema de Gestión de Inventarios',
    deliverableId: 'del-3',
    deliverableName: 'API Backend v1.0',
    deliverableType: 'code',
    teamId: 'team-1',
    teamMembers: [
      { id: 'student-1', name: 'Carlos Andrés Martínez' },
      { id: 'student-3', name: 'Laura Sofía Hernández' },
      { id: 'student-4', name: 'Miguel Ángel Torres' },
    ],
    status: 'submitted',
    files: [
      {
        id: 'file-3',
        fileName: 'api-backend-v1.zip',
        fileUrl: '/uploads/api-backend.zip',
        fileSize: 5678901,
        mimeType: 'application/zip',
        uploadedAt: '2026-01-08T16:00:00Z',
      },
    ],
    description: 'Primera versión del API REST con módulos de productos, categorías y usuarios.',
    submittedAt: '2026-01-08T16:30:00Z',
    dueDate: '2026-01-15',
    isLate: false,
    comments: [],
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-08T16:30:00Z',
  },
  {
    id: 'sub-3',
    projectId: 'proj-2',
    projectName: 'Dashboard de Analítica de Datos',
    deliverableId: 'del-10',
    deliverableName: 'Plan de Proyecto',
    deliverableType: 'document',
    teamId: 'team-2',
    teamMembers: [
      { id: 'student-2', name: 'Ana María Rodríguez' },
      { id: 'student-5', name: 'Pedro Luis Sánchez' },
    ],
    status: 'pending',
    files: [],
    dueDate: '2026-01-25',
    isLate: false,
    comments: [],
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'sub-4',
    projectId: 'proj-1',
    projectName: 'Sistema de Gestión de Inventarios',
    deliverableId: 'del-2',
    deliverableName: 'Diseño de Base de Datos',
    deliverableType: 'document',
    teamId: 'team-1',
    teamMembers: [
      { id: 'student-1', name: 'Carlos Andrés Martínez' },
      { id: 'student-3', name: 'Laura Sofía Hernández' },
      { id: 'student-4', name: 'Miguel Ángel Torres' },
    ],
    status: 'late',
    files: [
      {
        id: 'file-4',
        fileName: 'ER_Diagram_Inventarios.pdf',
        fileUrl: '/uploads/er-diagram.pdf',
        fileSize: 987654,
        mimeType: 'application/pdf',
        uploadedAt: '2025-11-18T10:00:00Z',
      },
    ],
    submittedAt: '2025-11-18T10:30:00Z',
    dueDate: '2025-11-15',
    isLate: true,
    lateDays: 3,
    latePenalty: 15,
    comments: [
      {
        id: 'comment-2',
        content: 'Entrega tardía. Se aplicará penalización del 15% por 3 días de retraso.',
        authorId: 'instructor-1',
        authorName: 'María González',
        authorRole: 'instructor',
        createdAt: '2025-11-18T11:00:00Z',
        isPrivate: true,
      },
    ],
    createdAt: '2025-11-10T09:00:00Z',
    updatedAt: '2025-11-18T11:00:00Z',
  },
  {
    id: 'sub-5',
    projectId: 'proj-3',
    projectName: 'App Móvil de Control de Gastos',
    deliverableId: 'del-20',
    deliverableName: 'Presentación Final',
    deliverableType: 'presentation',
    studentId: 'student-8',
    studentName: 'Andrés Felipe Gómez',
    status: 'evaluated',
    files: [
      {
        id: 'file-5',
        fileName: 'Presentacion_App_Gastos.pptx',
        fileUrl: '/uploads/presentacion-gastos.pptx',
        fileSize: 15678901,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        uploadedAt: '2025-09-28T09:00:00Z',
      },
    ],
    submittedAt: '2025-09-28T10:00:00Z',
    dueDate: '2025-09-30',
    isLate: false,
    comments: [],
    evaluationId: 'eval-5',
    score: 92,
    feedback: 'Excelente presentación. Demostró dominio del tema y buenas habilidades de comunicación.',
    createdAt: '2025-09-25T09:00:00Z',
    updatedAt: '2025-09-30T14:00:00Z',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface SubmissionCardProps {
  submission: Submission;
  onView: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SubmissionCard({ submission, onView }: SubmissionCardProps) {
  const statusConfig = SUBMISSION_STATUS_CONFIG[submission.status];
  const deliverableConfig = DELIVERABLE_TYPE_CONFIG[submission.deliverableType];

  const daysToDeadline = Math.ceil(
    (new Date(submission.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          {submission.isLate && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              {submission.lateDays}d tarde
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-1">{submission.deliverableName}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{submission.projectName}</p>
      </div>

      {/* Deliverable Type */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-gray-100">
            <File className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-sm text-gray-600">{deliverableConfig.label}</span>
        </div>
      </div>

      {/* Team/Student */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          {submission.studentName ? (
            <span className="text-sm text-gray-600">{submission.studentName}</span>
          ) : (
            <span className="text-sm text-gray-600">
              {submission.teamMembers?.map((m) => m.name).join(', ').slice(0, 40)}
              {(submission.teamMembers?.join(', ') || '').length > 40 && '...'}
            </span>
          )}
        </div>
      </div>

      {/* Files */}
      <div className="p-4">
        {submission.files.length > 0 ? (
          <div className="space-y-2 mb-3">
            {submission.files.slice(0, 2).map((file) => (
              <div key={file.id} className="flex items-center gap-2 text-xs text-gray-500">
                <File className="w-3 h-3" />
                <span className="truncate flex-1">{file.fileName}</span>
                <span className="text-gray-400">{formatFileSize(file.fileSize)}</span>
              </div>
            ))}
            {submission.files.length > 2 && (
              <p className="text-xs text-gray-400">+{submission.files.length - 2} archivo(s) más</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Upload className="w-3 h-3" />
            <span>Sin archivos</span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Límite: {new Date(submission.dueDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</span>
          </div>
          {submission.status === 'pending' && daysToDeadline > 0 && (
            <span className={`flex items-center gap-1 ${daysToDeadline <= 3 ? 'text-orange-600 font-medium' : ''}`}>
              <Clock className="w-3 h-3" />
              {daysToDeadline}d
            </span>
          )}
        </div>

        {/* Score if evaluated */}
        {submission.score !== undefined && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-3">
            <span className="text-xs text-gray-500">Calificación</span>
            <span className={`text-sm font-bold ${submission.score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
              {submission.score}%
            </span>
          </div>
        )}

        {/* Comments indicator */}
        {submission.comments.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MessageSquare className="w-3 h-3" />
            <span>{submission.comments.length} comentario(s)</span>
          </div>
        )}

        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver detalle
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function EntregasContent() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');

  const { setSubmissions: setStoreSubmissions } = useProjectStore();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setSubmissions(demoSubmissions);
      setStoreSubmissions(demoSubmissions);
      setIsLoading(false);
    }, 400);
  }, [setStoreSubmissions]);

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      searchQuery === '' ||
      s.deliverableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    submitted: submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length,
    evaluated: submissions.filter((s) => s.status === 'evaluated').length,
    late: submissions.filter((s) => s.isLate).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando entregas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/proyectos" className="hover:text-green-600">Proyectos</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Entregas</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
          <p className="text-gray-500 mt-1">
            Gestión de entregas de proyectos formativos
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <FileUp className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
              <p className="text-sm text-gray-500">Entregadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.evaluated}</p>
              <p className="text-sm text-gray-500">Evaluadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
              <p className="text-sm text-gray-500">Tardías</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por entregable o proyecto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(SUBMISSION_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredSubmissions.length} entrega{filteredSubmissions.length !== 1 && 's'}
      </p>

      {/* Grid */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron entregas</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros'
              : 'No hay entregas registradas'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onView={() => console.log('Ver entrega:', submission.id)}
            />
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Acceso rápido</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/proyectos" className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors">
            Proyectos
          </Link>
          <Link href="/proyectos/evaluar" className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors">
            Evaluar
          </Link>
          <Link href="/proyectos/rubricas" className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors">
            Rúbricas
          </Link>
        </div>
      </div>
    </div>
  );
}
