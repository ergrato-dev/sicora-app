'use client';

/**
 * Página de Proyectos Formativos - ProjectEvalService
 * Lista y gestión de proyectos formativos
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  FolderKanban,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  Target,
  Flag,
  Loader2,
  Eye,
  Plus,
  Filter,
  Play,
  CheckCircle,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import type { Project, ProjectStatus, ProjectPhase } from '@/types/project.types';
import { PROJECT_STATUS_CONFIG, PROJECT_PHASE_CONFIG } from '@/types/project.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Sistema de Gestión de Inventarios',
    code: 'PROJ-2024-001',
    description: 'Desarrollo de un sistema web para la gestión integral de inventarios de una empresa comercial, incluyendo control de stock, alertas de reabastecimiento y reportes.',
    objectives: [
      'Implementar módulo de gestión de productos',
      'Desarrollar sistema de alertas automáticas',
      'Crear dashboard con reportes y estadísticas',
      'Integrar con sistemas de facturación'
    ],
    programId: 'prog-1',
    programName: 'Tecnología en Desarrollo de Software',
    groupId: 'group-1',
    groupName: 'ADSO-2024-01',
    competencies: ['comp-1', 'comp-2', 'comp-3'],
    status: 'in_progress',
    phase: 'execution',
    startDate: '2025-10-01',
    endDate: '2026-03-15',
    milestones: [
      {
        id: 'mile-1',
        name: 'Análisis y Diseño',
        description: 'Análisis de requerimientos y diseño del sistema',
        dueDate: '2025-11-15',
        weight: 20,
        deliverables: ['del-1', 'del-2'],
        status: 'completed',
        completedAt: '2025-11-14',
      },
      {
        id: 'mile-2',
        name: 'Desarrollo Backend',
        description: 'Implementación de API y lógica de negocio',
        dueDate: '2026-01-15',
        weight: 30,
        deliverables: ['del-3'],
        status: 'in_progress',
      },
      {
        id: 'mile-3',
        name: 'Desarrollo Frontend',
        description: 'Implementación de interfaz de usuario',
        dueDate: '2026-02-15',
        weight: 25,
        deliverables: ['del-4'],
        status: 'pending',
      },
      {
        id: 'mile-4',
        name: 'Integración y Pruebas',
        description: 'Integración de componentes y pruebas finales',
        dueDate: '2026-03-15',
        weight: 25,
        deliverables: ['del-5'],
        status: 'pending',
      },
    ],
    deliverables: [],
    team: [
      { id: 'tm-1', studentId: 'student-1', studentName: 'Carlos Andrés Martínez', role: 'leader', assignedAt: '2025-10-01' },
      { id: 'tm-2', studentId: 'student-3', studentName: 'Laura Sofía Hernández', role: 'member', assignedAt: '2025-10-01' },
      { id: 'tm-3', studentId: 'student-4', studentName: 'Miguel Ángel Torres', role: 'member', assignedAt: '2025-10-01' },
    ],
    instructorId: 'instructor-1',
    instructorName: 'María González',
    totalWeight: 40,
    passingScore: 60,
    createdAt: '2025-09-25',
    updatedAt: '2026-01-08',
  },
  {
    id: 'proj-2',
    name: 'Dashboard de Analítica de Datos',
    code: 'PROJ-2024-002',
    description: 'Creación de un dashboard interactivo para visualización y análisis de datos empresariales utilizando Python y librerías de visualización.',
    objectives: [
      'Diseñar estructura de datos para análisis',
      'Implementar procesamiento ETL',
      'Crear visualizaciones interactivas',
      'Documentar metodología de análisis'
    ],
    programId: 'prog-2',
    programName: 'Tecnología en Análisis de Datos',
    groupId: 'group-2',
    groupName: 'DATOS-2024-02',
    competencies: ['comp-4', 'comp-5'],
    status: 'active',
    phase: 'planning',
    startDate: '2026-01-15',
    endDate: '2026-05-30',
    milestones: [
      {
        id: 'mile-5',
        name: 'Definición de Requerimientos',
        description: 'Levantamiento de requerimientos y definición de alcance',
        dueDate: '2026-02-01',
        weight: 15,
        deliverables: [],
        status: 'in_progress',
      },
    ],
    deliverables: [],
    team: [
      { id: 'tm-4', studentId: 'student-2', studentName: 'Ana María Rodríguez', role: 'leader', assignedAt: '2026-01-15' },
      { id: 'tm-5', studentId: 'student-5', studentName: 'Pedro Luis Sánchez', role: 'member', assignedAt: '2026-01-15' },
    ],
    instructorId: 'instructor-2',
    instructorName: 'Roberto Jiménez',
    totalWeight: 35,
    passingScore: 60,
    createdAt: '2026-01-10',
    updatedAt: '2026-01-15',
  },
  {
    id: 'proj-3',
    name: 'App Móvil de Control de Gastos',
    code: 'PROJ-2023-015',
    description: 'Desarrollo de aplicación móvil multiplataforma para registro y control de gastos personales con sincronización en la nube.',
    objectives: [
      'Desarrollar interfaz móvil intuitiva',
      'Implementar sincronización cloud',
      'Crear reportes de gastos mensuales',
      'Integrar categorización automática'
    ],
    programId: 'prog-1',
    programName: 'Tecnología en Desarrollo de Software',
    groupId: 'group-3',
    groupName: 'ADSO-2023-02',
    competencies: ['comp-1', 'comp-6'],
    status: 'completed',
    phase: 'closure',
    startDate: '2025-03-01',
    endDate: '2025-09-30',
    milestones: [],
    deliverables: [],
    team: [
      { id: 'tm-6', studentId: 'student-8', studentName: 'Andrés Felipe Gómez', role: 'leader', assignedAt: '2025-03-01' },
    ],
    instructorId: 'instructor-1',
    instructorName: 'María González',
    evaluators: [
      { id: 'eval-1', name: 'María González', role: 'Instructor técnico' },
      { id: 'eval-2', name: 'Dr. Juan Pérez', role: 'Coordinador académico' },
    ],
    totalWeight: 40,
    passingScore: 60,
    createdAt: '2025-02-15',
    updatedAt: '2025-10-01',
  },
  {
    id: 'proj-4',
    name: 'Sistema Contable Simplificado',
    code: 'PROJ-2024-003',
    description: 'Implementación de un sistema contable básico para pequeñas empresas que incluye libro diario, mayor y estados financieros.',
    objectives: [
      'Implementar libro diario electrónico',
      'Crear módulo de libro mayor',
      'Generar estados financieros básicos',
      'Desarrollar módulo de reportes'
    ],
    programId: 'prog-3',
    programName: 'Tecnología en Contabilidad',
    groupId: 'group-4',
    groupName: 'CONT-2024-01',
    competencies: ['comp-7', 'comp-8'],
    status: 'draft',
    phase: 'planning',
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    milestones: [],
    deliverables: [],
    team: [],
    instructorId: 'instructor-3',
    instructorName: 'Carmen Ruiz',
    totalWeight: 35,
    passingScore: 60,
    createdAt: '2026-01-05',
    updatedAt: '2026-01-05',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface ProjectCardProps {
  project: Project;
  onView: () => void;
}

function ProjectCard({ project, onView }: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];
  const phaseConfig = PROJECT_PHASE_CONFIG[project.phase];

  const completedMilestones = project.milestones.filter((m) => m.status === 'completed').length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const daysRemaining = Math.ceil(
    (new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className="text-xs text-gray-400 font-mono">{project.code}</span>
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{project.name}</h3>
        <p className="text-sm text-gray-500">{project.programName}</p>
      </div>

      {/* Phase & Progress */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className={`flex items-center gap-1.5 text-xs font-medium ${phaseConfig.color}`}>
            {project.phase === 'planning' && <ClipboardList className="w-3 h-3" />}
            {project.phase === 'execution' && <Play className="w-3 h-3" />}
            {project.phase === 'evaluation' && <CheckCircle className="w-3 h-3" />}
            {project.phase === 'closure' && <Flag className="w-3 h-3" />}
            {phaseConfig.label}
          </span>
          {totalMilestones > 0 && (
            <span className="text-xs text-gray-500">
              {completedMilestones}/{totalMilestones} hitos
            </span>
          )}
        </div>
        {totalMilestones > 0 && (
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Team */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{project.team.length} miembros</span>
          </div>
          {project.team.length > 0 && (
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                  title={member.studentName}
                >
                  {member.studentName.charAt(0)}
                </div>
              ))}
              {project.team.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                  +{project.team.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dates & Info */}
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(project.startDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
              {' - '}
              {new Date(project.endDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          {project.status !== 'completed' && project.status !== 'archived' && (
            <span className={`flex items-center gap-1 ${daysRemaining <= 7 ? 'text-orange-600 font-medium' : ''}`}>
              <Clock className="w-3 h-3" />
              {daysRemaining > 0 ? `${daysRemaining}d` : 'Vencido'}
            </span>
          )}
        </div>

        {/* Objectives preview */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Target className="w-3 h-3" />
          <span>{project.objectives.length} objetivos</span>
        </div>

        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver proyecto
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ProyectosContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | 'all'>('all');

  const { setProjects: setStoreProjects } = useProjectStore();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setProjects(demoProjects);
      setStoreProjects(demoProjects);
      setIsLoading(false);
    }, 400);
  }, [setStoreProjects]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesPhase = phaseFilter === 'all' || p.phase === phaseFilter;

    return matchesSearch && matchesStatus && matchesPhase;
  });

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active' || p.status === 'in_progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    draft: projects.filter((p) => p.status === 'draft').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos Formativos</h1>
          <p className="text-gray-500 mt-1">
            Gestión y seguimiento de proyectos de formación
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <FolderKanban className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              <p className="text-sm text-gray-500">Borradores</p>
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
              placeholder="Buscar por nombre o código..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as ProjectPhase | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todas las fases</option>
            {Object.entries(PROJECT_PHASE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredProjects.length} proyecto{filteredProjects.length !== 1 && 's'}
      </p>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron proyectos</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' || phaseFilter !== 'all'
              ? 'Intenta ajustar los filtros'
              : 'No hay proyectos registrados'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={() => console.log('Ver proyecto:', project.id)}
            />
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Acceso rápido</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/proyectos/entregas" className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors">
            Entregas
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
