'use client';

/**
 * Página de Casos Disciplinarios - MevalService
 * Lista de casos con filtros, estados y acciones
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ChevronRight,
  Calendar,
  User,
  FolderOpen,
  Scale,
  Ban,
  RefreshCw,
  MoreVertical,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useMevalStore, selectQuickStats, selectCasesByPriority } from '@/stores/mevalStore';
import type { StudentCase, CaseStatus, FaultType } from '@/types/meval.types';
import { CASE_STATUS_CONFIG, FAULT_TYPE_CONFIG } from '@/types/meval.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoCases: StudentCase[] = [
  {
    id: 'case-1',
    caseNumber: 'CASO-2026-001',
    student: {
      id: 'student-1',
      documentNumber: '1234567890',
      fullName: 'Juan Carlos Pérez García',
      email: 'juan.perez@email.com',
      phone: '3001234567',
      programId: 'prog-1',
      programName: 'Tecnología en Desarrollo de Software',
      groupId: 'group-1',
      groupName: 'ADSO-2024-01',
      enrollmentDate: '2024-02-15',
      status: 'active',
    },
    committeeId: 'committee-1',
    title: 'Incumplimiento reiterado de asistencia',
    description: 'El aprendiz ha presentado inasistencias recurrentes sin justificación válida durante el trimestre.',
    faultType: 'moderate',
    faultDate: '2026-01-05',
    reportedBy: 'instructor-1',
    reportedByName: 'María González',
    reportedAt: '2026-01-06T10:30:00Z',
    status: 'under_review',
    priority: 'high',
    dueDate: '2026-01-20',
    isOverdue: false,
    evidences: [],
    history: [],
    sanctionIds: [],
    appealIds: [],
    tags: ['asistencia', 'reincidente'],
    createdAt: '2026-01-06T10:30:00Z',
    updatedAt: '2026-01-07T14:00:00Z',
  },
  {
    id: 'case-2',
    caseNumber: 'CASO-2026-002',
    student: {
      id: 'student-2',
      documentNumber: '0987654321',
      fullName: 'Ana María Rodríguez López',
      email: 'ana.rodriguez@email.com',
      programId: 'prog-2',
      programName: 'Tecnología en Análisis de Datos',
      groupId: 'group-2',
      groupName: 'DATOS-2024-02',
      enrollmentDate: '2024-03-01',
      status: 'active',
    },
    committeeId: 'committee-1',
    title: 'Conducta inapropiada en ambiente de formación',
    description: 'Uso de lenguaje inapropiado y falta de respeto hacia compañeros durante sesión de clase.',
    faultType: 'serious',
    faultDate: '2026-01-03',
    reportedBy: 'instructor-2',
    reportedByName: 'Carlos Mendoza',
    reportedAt: '2026-01-03T16:00:00Z',
    status: 'pending_sanction',
    priority: 'urgent',
    dueDate: '2026-01-10',
    isOverdue: true,
    committeeDecision: 'Se determina aplicar sanción por falta grave contra la convivencia.',
    decisionDate: '2026-01-05',
    evidences: [],
    history: [],
    sanctionIds: [],
    appealIds: [],
    tags: ['convivencia', 'conducta'],
    createdAt: '2026-01-03T16:00:00Z',
    updatedAt: '2026-01-05T11:00:00Z',
  },
  {
    id: 'case-3',
    caseNumber: 'CASO-2025-089',
    student: {
      id: 'student-3',
      documentNumber: '1122334455',
      fullName: 'Pedro Antonio Sánchez',
      email: 'pedro.sanchez@email.com',
      programId: 'prog-1',
      programName: 'Tecnología en Desarrollo de Software',
      groupId: 'group-3',
      groupName: 'ADSO-2023-02',
      enrollmentDate: '2023-08-01',
      status: 'active',
    },
    committeeId: 'committee-2',
    title: 'Bajo rendimiento académico persistente',
    description: 'El aprendiz no ha alcanzado los resultados de aprendizaje mínimos en dos competencias consecutivas.',
    faultType: 'minor',
    faultDate: '2025-12-15',
    reportedBy: 'instructor-1',
    reportedByName: 'María González',
    reportedAt: '2025-12-16T09:00:00Z',
    status: 'in_progress',
    priority: 'medium',
    isOverdue: false,
    improvementPlanId: 'plan-1',
    evidences: [],
    history: [],
    sanctionIds: [],
    appealIds: [],
    tags: ['académico', 'rendimiento'],
    createdAt: '2025-12-16T09:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
  },
  {
    id: 'case-4',
    caseNumber: 'CASO-2025-075',
    student: {
      id: 'student-4',
      documentNumber: '5544332211',
      fullName: 'Laura Valentina Martínez',
      email: 'laura.martinez@email.com',
      programId: 'prog-3',
      programName: 'Tecnología en Contabilidad',
      groupId: 'group-4',
      groupName: 'CONT-2024-01',
      enrollmentDate: '2024-01-15',
      status: 'active',
    },
    committeeId: 'committee-1',
    title: 'Plagio en evidencia de aprendizaje',
    description: 'Se detectó copia parcial de contenido en entrega de proyecto sin citación de fuentes.',
    faultType: 'moderate',
    faultDate: '2025-11-20',
    reportedBy: 'instructor-3',
    reportedByName: 'Roberto Díaz',
    reportedAt: '2025-11-21T14:30:00Z',
    status: 'resolved',
    priority: 'medium',
    isOverdue: false,
    committeeDecision: 'Plan de mejora cumplido satisfactoriamente. Caso cerrado sin sanción.',
    decisionDate: '2025-12-20',
    evidences: [],
    history: [],
    sanctionIds: [],
    appealIds: [],
    tags: ['académico', 'plagio'],
    createdAt: '2025-11-21T14:30:00Z',
    updatedAt: '2025-12-20T16:00:00Z',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </div>
  );
}

interface CaseCardProps {
  studentCase: StudentCase;
  onView: () => void;
}

function CaseCard({ studentCase, onView }: CaseCardProps) {
  const statusConfig = CASE_STATUS_CONFIG[studentCase.status];
  const faultConfig = FAULT_TYPE_CONFIG[studentCase.faultType];
  
  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-gray-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-500">{studentCase.caseNumber}</span>
          {studentCase.isOverdue && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Vencido
            </span>
          )}
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Título y descripción */}
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
        {studentCase.title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {studentCase.description}
      </p>

      {/* Estudiante */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {studentCase.student.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {studentCase.student.programName}
          </p>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        <span className={`px-2 py-0.5 rounded ${faultConfig.bgColor} ${faultConfig.color}`}>
          {faultConfig.label}
        </span>
        <span className={`px-2 py-0.5 rounded ${priorityColors[studentCase.priority]}`}>
          {studentCase.priority === 'urgent' ? 'Urgente' : 
           studentCase.priority === 'high' ? 'Alta' :
           studentCase.priority === 'medium' ? 'Media' : 'Baja'}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(studentCase.faultDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      {/* Tags */}
      {studentCase.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {studentCase.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Reportado por {studentCase.reportedByName}
        </span>
        <button
          onClick={onView}
          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Ver detalle
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: CaseStatus | 'all';
  onStatusChange: (status: CaseStatus | 'all') => void;
  faultFilter: FaultType | 'all';
  onFaultChange: (fault: FaultType | 'all') => void;
  onRefresh: () => void;
}

function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  faultFilter,
  onFaultChange,
  onRefresh,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por número, estudiante o descripción..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as CaseStatus | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(CASE_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Fault Type Filter */}
        <select
          value={faultFilter}
          onChange={(e) => onFaultChange(e.target.value as FaultType | 'all')}
          className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Todas las faltas</option>
          {Object.entries(FAULT_TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Actualizar"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CasosContent() {
  // Estado local
  const [cases, setCases] = useState<StudentCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [faultFilter, setFaultFilter] = useState<FaultType | 'all'>('all');

  // Store
  const { setStudentCases, openCaseModal } = useMevalStore();

  // Cargar datos demo
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCases(demoCases);
      setStudentCases(demoCases);
      setIsLoading(false);
    }, 500);
  }, [setStudentCases]);

  // Filtrar casos
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesFault = faultFilter === 'all' || c.faultType === faultFilter;

    return matchesSearch && matchesStatus && matchesFault;
  });

  // Estadísticas
  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === 'open' || c.status === 'under_review').length,
    overdue: cases.filter((c) => c.isOverdue).length,
    pending: cases.filter((c) => c.status === 'pending_sanction' || c.status === 'pending_plan').length,
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleViewCase = (studentCase: StudentCase) => {
    // En implementación real, navegaría al detalle
    console.log('Ver caso:', studentCase.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando casos...</p>
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
            <span>Casos</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Casos Disciplinarios</h1>
          <p className="text-gray-500 mt-1">
            Gestión de casos de estudiantes y procesos disciplinarios
          </p>
        </div>
        <button
          onClick={openCaseModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Caso
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Casos"
          value={stats.total}
          icon={FolderOpen}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Casos Abiertos"
          value={stats.open}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Casos Vencidos"
          value={stats.overdue}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={AlertCircle}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Filters */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        faultFilter={faultFilter}
        onFaultChange={setFaultFilter}
        onRefresh={handleRefresh}
      />

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {filteredCases.length} {filteredCases.length === 1 ? 'caso encontrado' : 'casos encontrados'}
        </p>
        {(statusFilter !== 'all' || faultFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setFaultFilter('all');
            }}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron casos</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' || faultFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay casos registrados en el sistema'}
          </p>
          <button
            onClick={openCaseModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear primer caso
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((studentCase) => (
            <CaseCard
              key={studentCase.id}
              studentCase={studentCase}
              onView={() => handleViewCase(studentCase)}
            />
          ))}
        </div>
      )}

      {/* Quick Access */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/meval/comites"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Comités</p>
              <p className="text-xs text-gray-500">Gestionar comités</p>
            </div>
          </Link>
          <Link
            href="/meval/planes"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 bg-cyan-100 rounded-lg">
              <FileText className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Planes</p>
              <p className="text-xs text-gray-500">Planes de mejora</p>
            </div>
          </Link>
          <Link
            href="/meval/sanciones"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Sanciones</p>
              <p className="text-xs text-gray-500">Gestionar sanciones</p>
            </div>
          </Link>
          <Link
            href="/meval/apelaciones"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 bg-orange-100 rounded-lg">
              <Scale className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Apelaciones</p>
              <p className="text-xs text-gray-500">Revisar apelaciones</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
