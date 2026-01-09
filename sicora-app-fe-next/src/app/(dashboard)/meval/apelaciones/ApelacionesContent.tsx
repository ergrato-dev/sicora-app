'use client';

/**
 * Página de Apelaciones - MevalService
 * Gestión de apelaciones a sanciones disciplinarias
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Scale,
  FileText,
  Clock,
  CheckCircle,
  ChevronRight,
  Calendar,
  User,
  AlertTriangle,
  Loader2,
  Eye,
  ArrowUpRight,
  XCircle,
  MessageSquare,
  Gavel,
} from 'lucide-react';
import { useMevalStore } from '@/stores/mevalStore';
import type { Appeal, AppealStatus } from '@/types/meval.types';
import { APPEAL_STATUS_CONFIG, SANCTION_TYPE_CONFIG } from '@/types/meval.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoAppeals: Appeal[] = [
  {
    id: 'appeal-1',
    sanctionId: 'sanction-2',
    sanction: {
      id: 'sanction-2',
      type: 'temporary_suspension',
      description: 'Suspensión temporal por 5 días debido a falsificación de documento.',
      startDate: '2026-01-06',
      endDate: '2026-01-11',
      status: 'active',
    },
    student: {
      id: 'student-6',
      documentNumber: '1234509876',
      fullName: 'Diego Fernando Castro',
      email: 'diego.castro@email.com',
      programId: 'prog-1',
      programName: 'Tecnología en Desarrollo de Software',
      groupId: 'group-1',
      groupName: 'ADSO-2024-01',
      enrollmentDate: '2024-02-15',
      status: 'suspended',
    },
    reason: 'El documento en cuestión fue proporcionado por el médico tratante quien cometió un error en las fechas. Se adjunta corrección oficial del centro médico.',
    status: 'in_review',
    submittedAt: '2026-01-07T10:00:00Z',
    arguments: [
      {
        id: 'arg-1',
        type: 'evidence',
        content: 'Carta de corrección del Centro Médico ABC confirmando error en fechas.',
        submittedBy: 'student-6',
        submittedAt: '2026-01-07T10:05:00Z',
        documentUrl: '/docs/carta-correccion.pdf',
      },
      {
        id: 'arg-2',
        type: 'witness',
        content: 'Testimonio de compañero que estuvo presente en la consulta médica.',
        submittedBy: 'student-6',
        submittedAt: '2026-01-07T10:10:00Z',
      },
    ],
    assignedTo: 'admin-2',
    assignedToName: 'Dra. Laura Martínez',
    reviewNotes: 'Se está validando la autenticidad del documento de corrección con el centro médico.',
    committeeId: 'committee-1',
    createdAt: '2026-01-07T10:00:00Z',
    updatedAt: '2026-01-08T14:00:00Z',
  },
  {
    id: 'appeal-2',
    sanctionId: 'sanction-5',
    sanction: {
      id: 'sanction-5',
      type: 'written_warning',
      description: 'Amonestación escrita por conducta irrespetuosa.',
      startDate: '2025-12-20',
      status: 'completed',
    },
    student: {
      id: 'student-9',
      documentNumber: '7891234560',
      fullName: 'Carolina Vásquez Peña',
      email: 'carolina.vasquez@email.com',
      programId: 'prog-2',
      programName: 'Tecnología en Análisis de Datos',
      groupId: 'group-2',
      groupName: 'DATOS-2024-02',
      enrollmentDate: '2024-03-01',
      status: 'active',
    },
    reason: 'No hubo conducta irrespetuosa. Fue una diferencia académica expresada de manera profesional.',
    status: 'rejected',
    submittedAt: '2025-12-22T09:00:00Z',
    arguments: [
      {
        id: 'arg-3',
        type: 'procedural',
        content: 'La sanción fue aplicada sin dar oportunidad de descargos.',
        submittedBy: 'student-9',
        submittedAt: '2025-12-22T09:05:00Z',
      },
    ],
    assignedTo: 'admin-1',
    assignedToName: 'Dr. Juan Pérez',
    resolution: {
      decision: 'rejected',
      reasoning: 'Se revisaron las evidencias y testimonios. La conducta reportada fue corroborada por múltiples testigos. El proceso de descargos se realizó correctamente.',
      decidedBy: 'admin-1',
      decidedByName: 'Dr. Juan Pérez',
      decidedAt: '2025-12-28T15:00:00Z',
    },
    createdAt: '2025-12-22T09:00:00Z',
    updatedAt: '2025-12-28T15:00:00Z',
  },
  {
    id: 'appeal-3',
    sanctionId: 'sanction-6',
    sanction: {
      id: 'sanction-6',
      type: 'verbal_warning',
      description: 'Amonestación verbal por incumplimiento de horario.',
      startDate: '2025-11-15',
      status: 'completed',
    },
    student: {
      id: 'student-10',
      documentNumber: '4567890123',
      fullName: 'Ricardo Mendoza Luna',
      email: 'ricardo.mendoza@email.com',
      programId: 'prog-3',
      programName: 'Tecnología en Contabilidad',
      groupId: 'group-4',
      groupName: 'CONT-2024-01',
      enrollmentDate: '2024-01-15',
      status: 'active',
    },
    reason: 'El retraso fue causado por una emergencia familiar documentada.',
    status: 'approved',
    submittedAt: '2025-11-16T08:00:00Z',
    arguments: [
      {
        id: 'arg-4',
        type: 'evidence',
        content: 'Constancia de urgencias del hospital donde fue atendido un familiar.',
        submittedBy: 'student-10',
        submittedAt: '2025-11-16T08:10:00Z',
        documentUrl: '/docs/constancia-urgencias.pdf',
      },
    ],
    assignedTo: 'admin-2',
    assignedToName: 'Dra. Laura Martínez',
    resolution: {
      decision: 'approved',
      reasoning: 'La evidencia presentada demuestra situación de fuerza mayor. Se retira la sanción del expediente.',
      decidedBy: 'admin-2',
      decidedByName: 'Dra. Laura Martínez',
      decidedAt: '2025-11-18T11:00:00Z',
    },
    createdAt: '2025-11-16T08:00:00Z',
    updatedAt: '2025-11-18T11:00:00Z',
  },
  {
    id: 'appeal-4',
    sanctionId: 'sanction-7',
    sanction: {
      id: 'sanction-7',
      type: 'temporary_suspension',
      description: 'Suspensión por plagio en trabajo académico.',
      startDate: '2026-01-10',
      endDate: '2026-01-17',
      status: 'pending',
    },
    student: {
      id: 'student-11',
      documentNumber: '8901234567',
      fullName: 'Juliana Ortiz Ramírez',
      email: 'juliana.ortiz@email.com',
      programId: 'prog-1',
      programName: 'Tecnología en Desarrollo de Software',
      groupId: 'group-1',
      groupName: 'ADSO-2024-01',
      enrollmentDate: '2024-02-15',
      status: 'active',
    },
    reason: 'El código marcado como plagio es una implementación estándar de algoritmos comunes disponibles en documentación oficial.',
    status: 'submitted',
    submittedAt: '2026-01-10T14:00:00Z',
    arguments: [
      {
        id: 'arg-5',
        type: 'evidence',
        content: 'Enlaces a documentación oficial donde se muestra el mismo patrón de código.',
        submittedBy: 'student-11',
        submittedAt: '2026-01-10T14:15:00Z',
      },
      {
        id: 'arg-6',
        type: 'procedural',
        content: 'No se especificó en las instrucciones del trabajo que no se podían usar implementaciones estándar.',
        submittedBy: 'student-11',
        submittedAt: '2026-01-10T14:20:00Z',
      },
    ],
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-01-10T14:20:00Z',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface AppealCardProps {
  appeal: Appeal;
  onView: () => void;
}

function AppealCard({ appeal, onView }: AppealCardProps) {
  const statusConfig = APPEAL_STATUS_CONFIG[appeal.status];
  const sanctionTypeConfig = SANCTION_TYPE_CONFIG[appeal.sanction.type];

  const getStatusIcon = () => {
    switch (appeal.status) {
      case 'submitted':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'in_review':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Scale className="w-4 h-4" />;
    }
  };

  const daysSinceSubmission = Math.floor(
    (Date.now() - new Date(appeal.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
            {getStatusIcon()}
            {statusConfig.label}
          </span>
          <span className="text-xs text-gray-400">
            {daysSinceSubmission === 0 ? 'Hoy' : `Hace ${daysSinceSubmission} días`}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {appeal.student.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {appeal.student.groupName}
            </p>
          </div>
        </div>
      </div>

      {/* Sanction Reference */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Sanción apelada:</p>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${sanctionTypeConfig.color}`}>
            {sanctionTypeConfig.label}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
          {appeal.sanction.description}
        </p>
      </div>

      {/* Appeal Reason */}
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {appeal.reason}
        </p>

        {/* Arguments */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {appeal.arguments.length} argumento{appeal.arguments.length !== 1 && 's'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(appeal.submittedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
          </span>
        </div>

        {/* Assigned Reviewer */}
        {appeal.assignedToName && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pb-3 border-b border-gray-100 mb-3">
            <Gavel className="w-3 h-3" />
            <span>Revisor: {appeal.assignedToName}</span>
          </div>
        )}

        {/* Resolution Preview */}
        {appeal.resolution && (
          <div className={`p-2 rounded-lg text-xs ${
            appeal.resolution.decision === 'approved' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            <p className="font-medium mb-1">
              {appeal.resolution.decision === 'approved' ? '✓ Aprobada' : '✗ Rechazada'}
            </p>
            <p className="line-clamp-2 opacity-80">
              {appeal.resolution.reasoning}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
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

export default function ApelacionesContent() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppealStatus | 'all'>('all');

  const { setAppeals: setStoreAppeals } = useMevalStore();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAppeals(demoAppeals);
      setStoreAppeals(demoAppeals);
      setIsLoading(false);
    }, 400);
  }, [setStoreAppeals]);

  const filteredAppeals = appeals.filter((a) => {
    const matchesSearch =
      searchQuery === '' ||
      a.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: appeals.length,
    pending: appeals.filter(a => a.status === 'submitted' || a.status === 'in_review').length,
    approved: appeals.filter(a => a.status === 'approved').length,
    rejected: appeals.filter(a => a.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando apelaciones...</p>
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
            <Link href="/meval" className="hover:text-green-600">Meval</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Apelaciones</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Apelaciones</h1>
          <p className="text-gray-500 mt-1">
            Gestión de apelaciones a sanciones disciplinarias
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Scale className="w-5 h-5 text-gray-600" />
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
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-500">Aprobadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Rechazadas</p>
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
              placeholder="Buscar por estudiante o motivo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppealStatus | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(APPEAL_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredAppeals.length} apelacion{filteredAppeals.length !== 1 && 'es'}
      </p>

      {/* Grid */}
      {filteredAppeals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron apelaciones</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros'
              : 'No hay apelaciones registradas'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppeals.map((appeal) => (
            <AppealCard
              key={appeal.id}
              appeal={appeal}
              onView={() => console.log('Ver apelación:', appeal.id)}
            />
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Acceso rápido</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/meval/casos" className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors">
            Casos
          </Link>
          <Link href="/meval/sanciones" className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors">
            Sanciones
          </Link>
          <Link href="/meval/comites" className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors">
            Comités
          </Link>
          <Link href="/meval/planes" className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors">
            Planes de Mejora
          </Link>
        </div>
      </div>
    </div>
  );
}
