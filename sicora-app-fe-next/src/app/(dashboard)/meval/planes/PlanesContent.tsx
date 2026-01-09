'use client';

/**
 * Página de Planes de Mejora - MevalService
 * Seguimiento de planes de mejora y progreso de estudiantes
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Calendar,
  User,
  FileText,
  BarChart3,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import { useMevalStore } from '@/stores/mevalStore';
import type { ImprovementPlan, ImprovementPlanStatus } from '@/types/meval.types';
import { IMPROVEMENT_PLAN_STATUS_CONFIG } from '@/types/meval.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoPlans: ImprovementPlan[] = [
  {
    id: 'plan-1',
    studentCaseId: 'case-3',
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
    title: 'Plan de Mejora Académica - Competencias Técnicas',
    description: 'Plan enfocado en mejorar el rendimiento en las competencias de desarrollo de software y bases de datos.',
    objectives: [
      { id: 'obj-1', description: 'Completar módulo de refuerzo en programación', dueDate: '2026-01-15', status: 'completed', completedAt: '2026-01-10' },
      { id: 'obj-2', description: 'Aprobar evaluación práctica de bases de datos', dueDate: '2026-01-25', status: 'in_progress' },
      { id: 'obj-3', description: 'Entregar proyecto integrador con nota mínima de 4.0', dueDate: '2026-02-10', status: 'pending' },
    ],
    startDate: '2025-12-20',
    endDate: '2026-02-15',
    durationDays: 57,
    status: 'in_progress',
    overallProgress: 45,
    supervisorId: 'instructor-1',
    supervisorName: 'María González',
    mentorId: 'instructor-2',
    mentorName: 'Carlos Mendoza',
    followUps: [
      {
        id: 'fu-1',
        date: '2026-01-02',
        type: 'meeting',
        description: 'Primera reunión de seguimiento. El estudiante muestra compromiso y ha completado el 30% del primer objetivo.',
        progress: 30,
        objectivesReviewed: ['obj-1'],
        recommendations: 'Continuar con el ritmo actual y dedicar más tiempo a práctica de SQL.',
        conductedBy: 'instructor-1',
        conductedByName: 'María González',
        nextFollowUpDate: '2026-01-15',
      },
    ],
    lastFollowUpDate: '2026-01-02',
    nextFollowUpDate: '2026-01-15',
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-05T14:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'plan-2',
    studentCaseId: 'case-5',
    student: {
      id: 'student-5',
      documentNumber: '9876543210',
      fullName: 'Camila Andrea Ruiz',
      email: 'camila.ruiz@email.com',
      programId: 'prog-2',
      programName: 'Tecnología en Análisis de Datos',
      groupId: 'group-2',
      groupName: 'DATOS-2024-02',
      enrollmentDate: '2024-03-01',
      status: 'active',
    },
    title: 'Plan de Mejora Conductual - Trabajo en Equipo',
    description: 'Plan orientado a mejorar habilidades de comunicación y trabajo colaborativo.',
    objectives: [
      { id: 'obj-4', description: 'Participar activamente en 3 proyectos grupales', dueDate: '2026-01-30', status: 'in_progress' },
      { id: 'obj-5', description: 'Completar taller de comunicación efectiva', dueDate: '2026-01-20', status: 'completed', completedAt: '2026-01-08' },
      { id: 'obj-6', description: 'Recibir evaluación positiva de compañeros de equipo', dueDate: '2026-02-05', status: 'pending' },
    ],
    startDate: '2026-01-02',
    endDate: '2026-02-10',
    durationDays: 39,
    status: 'active',
    overallProgress: 35,
    supervisorId: 'instructor-2',
    supervisorName: 'Carlos Mendoza',
    followUps: [],
    createdAt: '2026-01-02T09:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'plan-3',
    studentCaseId: 'case-4',
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
    title: 'Plan de Mejora - Integridad Académica',
    description: 'Plan para reforzar conocimientos sobre citación de fuentes y evitar plagio.',
    objectives: [
      { id: 'obj-7', description: 'Completar curso virtual de citación APA', dueDate: '2025-12-10', status: 'completed', completedAt: '2025-12-05' },
      { id: 'obj-8', description: 'Entregar ensayo original con citaciones correctas', dueDate: '2025-12-18', status: 'completed', completedAt: '2025-12-17' },
    ],
    startDate: '2025-11-25',
    endDate: '2025-12-20',
    durationDays: 25,
    status: 'completed',
    overallProgress: 100,
    supervisorId: 'instructor-3',
    supervisorName: 'Roberto Díaz',
    followUps: [],
    finalEvaluation: 'Plan cumplido exitosamente. La estudiante demostró comprensión de las normas de citación.',
    completedAt: '2025-12-20T10:00:00Z',
    createdAt: '2025-11-25T14:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
    createdBy: 'admin-1',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md';
}

function ProgressBar({ progress, size = 'md' }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const colorClass = 
    progress >= 75 ? 'bg-green-500' :
    progress >= 50 ? 'bg-cyan-500' :
    progress >= 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`w-full bg-gray-200 rounded-full ${height}`}>
      <div
        className={`${height} rounded-full ${colorClass} transition-all`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

interface PlanCardProps {
  plan: ImprovementPlan;
  onView: () => void;
}

function PlanCard({ plan, onView }: PlanCardProps) {
  const statusConfig = IMPROVEMENT_PLAN_STATUS_CONFIG[plan.status];
  const completedObjectives = plan.objectives.filter(o => o.status === 'completed').length;
  const totalObjectives = plan.objectives.length;
  
  const daysRemaining = Math.ceil((new Date(plan.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          {plan.status !== 'completed' && plan.status !== 'cancelled' && daysRemaining <= 7 && (
            <span className="flex items-center gap-1 text-xs text-orange-600">
              <AlertCircle className="w-3 h-3" />
              {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Vencido'}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-2">{plan.title}</h3>
      </div>

      {/* Student */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {plan.student.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {plan.student.groupName}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progreso general</span>
          <span className="text-sm font-semibold text-gray-900">{plan.overallProgress}%</span>
        </div>
        <ProgressBar progress={plan.overallProgress} />
        
        {/* Objectives summary */}
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-gray-500">
            Objetivos: {completedObjectives}/{totalObjectives}
          </span>
          <div className="flex gap-1">
            {plan.objectives.map((obj, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  obj.status === 'completed' ? 'bg-green-500' :
                  obj.status === 'in_progress' ? 'bg-cyan-500' :
                  obj.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                }`}
                title={obj.description}
              />
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(plan.startDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            {' - '}
            {new Date(plan.endDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
          </span>
          <span>
            {plan.durationDays} días
          </span>
        </div>

        {/* Supervisor */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Supervisor: <span className="text-gray-700">{plan.supervisorName}</span>
          </p>
          {plan.nextFollowUpDate && plan.status !== 'completed' && (
            <p className="text-xs text-gray-500 mt-1">
              Próximo seguimiento: {new Date(plan.nextFollowUpDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            </p>
          )}
        </div>
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

export default function PlanesContent() {
  const [plans, setPlans] = useState<ImprovementPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ImprovementPlanStatus | 'all'>('all');

  const { setImprovementPlans, openPlanModal } = useMevalStore();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPlans(demoPlans);
      setImprovementPlans(demoPlans);
      setIsLoading(false);
    }, 400);
  }, [setImprovementPlans]);

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.student.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === 'active' || p.status === 'in_progress').length,
    completed: plans.filter(p => p.status === 'completed').length,
    avgProgress: Math.round(plans.reduce((sum, p) => sum + p.overallProgress, 0) / plans.length) || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando planes...</p>
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
            <span>Planes de Mejora</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Planes de Mejora</h1>
          <p className="text-gray-500 mt-1">
            Seguimiento y gestión de planes de mejora para estudiantes
          </p>
        </div>
        <button
          onClick={openPlanModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Planes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-100">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
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
            <div className="p-2 rounded-lg bg-purple-100">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</p>
              <p className="text-sm text-gray-500">Progreso Prom.</p>
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
              placeholder="Buscar por título o estudiante..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ImprovementPlanStatus | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(IMPROVEMENT_PLAN_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredPlans.length} plan{filteredPlans.length !== 1 && 'es'}
      </p>

      {/* Grid */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron planes</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros'
              : 'No hay planes de mejora registrados'}
          </p>
          <button
            onClick={openPlanModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Crear plan
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onView={() => console.log('Ver plan:', plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
