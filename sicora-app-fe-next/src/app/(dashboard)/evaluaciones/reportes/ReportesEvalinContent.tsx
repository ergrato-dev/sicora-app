'use client';

/**
 * Página de Reportes - EvalinService
 * Reportes por instructor y por período
 */

import { useState } from 'react';
import {
  Search,
  Download,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  FileText,
  Star,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  InstructorEvaluationSummary,
  PeriodReport,
  EvaluationPeriod,
} from '@/types/evalin.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoPeriods: EvaluationPeriod[] = [
  {
    id: 'period-1',
    name: 'Primer Semestre 2025',
    description: 'Evaluación docente del primer semestre',
    startDate: '2025-01-15T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    status: 'active',
    questionnaireId: 'qn-1',
    totalEvaluations: 450,
    completedEvaluations: 387,
    completionRate: 86,
    createdBy: 'admin-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'period-2',
    name: 'Segundo Semestre 2024',
    description: 'Evaluación docente del segundo semestre 2024',
    startDate: '2024-07-15T00:00:00Z',
    endDate: '2024-12-15T23:59:59Z',
    status: 'closed',
    questionnaireId: 'qn-1',
    totalEvaluations: 420,
    completedEvaluations: 398,
    completionRate: 95,
    createdBy: 'admin-1',
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-12-16T00:00:00Z',
  },
];

const demoInstructorSummaries: InstructorEvaluationSummary[] = [
  {
    instructorId: 'inst-1',
    instructorName: 'Carlos Rodríguez',
    periodId: 'period-1',
    periodName: 'Primer Semestre 2025',
    totalEvaluations: 45,
    completedEvaluations: 42,
    responseRate: 93,
    overallScore: 4.6,
    categoryScores: [
      { categoryId: 'cat-1', categoryName: 'Conocimiento y Dominio', averageScore: 4.8, responseCount: 42 },
      { categoryId: 'cat-2', categoryName: 'Metodología', averageScore: 4.5, responseCount: 42 },
      { categoryId: 'cat-3', categoryName: 'Relación con Estudiantes', averageScore: 4.7, responseCount: 42 },
      { categoryId: 'cat-4', categoryName: 'Puntualidad', averageScore: 4.4, responseCount: 42 },
    ],
    scoreDistribution: [
      { score: 5, count: 28, percentage: 67 },
      { score: 4, count: 10, percentage: 24 },
      { score: 3, count: 3, percentage: 7 },
      { score: 2, count: 1, percentage: 2 },
      { score: 1, count: 0, percentage: 0 },
    ],
    trend: { previousScore: 4.3, change: 0.3, changePercentage: 7 },
    strengths: ['Excelente dominio del tema', 'Clases dinámicas', 'Disponibilidad para consultas'],
    areasForImprovement: ['Retroalimentación más rápida', 'Material adicional'],
    highlightedComments: [
      'Uno de los mejores instructores que he tenido',
      'Explica de manera muy clara los conceptos complejos',
    ],
  },
  {
    instructorId: 'inst-2',
    instructorName: 'María González',
    periodId: 'period-1',
    periodName: 'Primer Semestre 2025',
    totalEvaluations: 52,
    completedEvaluations: 50,
    responseRate: 96,
    overallScore: 4.8,
    categoryScores: [
      { categoryId: 'cat-1', categoryName: 'Conocimiento y Dominio', averageScore: 4.9, responseCount: 50 },
      { categoryId: 'cat-2', categoryName: 'Metodología', averageScore: 4.8, responseCount: 50 },
      { categoryId: 'cat-3', categoryName: 'Relación con Estudiantes', averageScore: 4.9, responseCount: 50 },
      { categoryId: 'cat-4', categoryName: 'Puntualidad', averageScore: 4.6, responseCount: 50 },
    ],
    scoreDistribution: [
      { score: 5, count: 40, percentage: 80 },
      { score: 4, count: 8, percentage: 16 },
      { score: 3, count: 2, percentage: 4 },
      { score: 2, count: 0, percentage: 0 },
      { score: 1, count: 0, percentage: 0 },
    ],
    trend: { previousScore: 4.7, change: 0.1, changePercentage: 2 },
    strengths: ['Metodología innovadora', 'Excelente comunicación', 'Muy organizada'],
    areasForImprovement: ['Mayor enfoque práctico'],
    highlightedComments: [
      'La mejor instructora del programa',
      'Siempre dispuesta a ayudar',
    ],
  },
  {
    instructorId: 'inst-3',
    instructorName: 'Juan Martínez',
    periodId: 'period-1',
    periodName: 'Primer Semestre 2025',
    totalEvaluations: 38,
    completedEvaluations: 35,
    responseRate: 92,
    overallScore: 3.9,
    categoryScores: [
      { categoryId: 'cat-1', categoryName: 'Conocimiento y Dominio', averageScore: 4.2, responseCount: 35 },
      { categoryId: 'cat-2', categoryName: 'Metodología', averageScore: 3.5, responseCount: 35 },
      { categoryId: 'cat-3', categoryName: 'Relación con Estudiantes', averageScore: 4, responseCount: 35 },
      { categoryId: 'cat-4', categoryName: 'Puntualidad', averageScore: 3.9, responseCount: 35 },
    ],
    scoreDistribution: [
      { score: 5, count: 10, percentage: 29 },
      { score: 4, count: 12, percentage: 34 },
      { score: 3, count: 10, percentage: 29 },
      { score: 2, count: 3, percentage: 8 },
      { score: 1, count: 0, percentage: 0 },
    ],
    trend: { previousScore: 4.1, change: -0.2, changePercentage: -5 },
    strengths: ['Buen conocimiento técnico', 'Accesible para preguntas'],
    areasForImprovement: ['Mejorar explicaciones', 'Más ejemplos prácticos', 'Puntualidad'],
    highlightedComments: [
      'Necesita mejorar la metodología',
      'Conoce el tema pero le cuesta explicar',
    ],
  },
  {
    instructorId: 'inst-4',
    instructorName: 'Ana López',
    periodId: 'period-1',
    periodName: 'Primer Semestre 2025',
    totalEvaluations: 48,
    completedEvaluations: 46,
    responseRate: 96,
    overallScore: 4.4,
    categoryScores: [
      { categoryId: 'cat-1', categoryName: 'Conocimiento y Dominio', averageScore: 4.5, responseCount: 46 },
      { categoryId: 'cat-2', categoryName: 'Metodología', averageScore: 4.4, responseCount: 46 },
      { categoryId: 'cat-3', categoryName: 'Relación con Estudiantes', averageScore: 4.6, responseCount: 46 },
      { categoryId: 'cat-4', categoryName: 'Puntualidad', averageScore: 4.1, responseCount: 46 },
    ],
    scoreDistribution: [
      { score: 5, count: 25, percentage: 54 },
      { score: 4, count: 15, percentage: 33 },
      { score: 3, count: 5, percentage: 11 },
      { score: 2, count: 1, percentage: 2 },
      { score: 1, count: 0, percentage: 0 },
    ],
    trend: { previousScore: 4.2, change: 0.2, changePercentage: 5 },
    strengths: ['Buena relación con estudiantes', 'Clases organizadas'],
    areasForImprovement: ['Cumplimiento de horarios'],
    highlightedComments: [
      'Excelente trato con los estudiantes',
      'Hace que las clases sean interesantes',
    ],
  },
  {
    instructorId: 'inst-5',
    instructorName: 'Pedro Sánchez',
    periodId: 'period-1',
    periodName: 'Primer Semestre 2025',
    totalEvaluations: 40,
    completedEvaluations: 38,
    responseRate: 95,
    overallScore: 4.2,
    categoryScores: [
      { categoryId: 'cat-1', categoryName: 'Conocimiento y Dominio', averageScore: 4.4, responseCount: 38 },
      { categoryId: 'cat-2', categoryName: 'Metodología', averageScore: 4, responseCount: 38 },
      { categoryId: 'cat-3', categoryName: 'Relación con Estudiantes', averageScore: 4.2, responseCount: 38 },
      { categoryId: 'cat-4', categoryName: 'Puntualidad', averageScore: 4.2, responseCount: 38 },
    ],
    scoreDistribution: [
      { score: 5, count: 18, percentage: 47 },
      { score: 4, count: 14, percentage: 37 },
      { score: 3, count: 5, percentage: 13 },
      { score: 2, count: 1, percentage: 3 },
      { score: 1, count: 0, percentage: 0 },
    ],
    strengths: ['Conocimiento técnico', 'Puntualidad'],
    areasForImprovement: ['Diversificar métodos de enseñanza'],
    highlightedComments: [
      'Buen instructor en general',
    ],
  },
];

const demoPeriodReport: PeriodReport = {
  periodId: 'period-1',
  periodName: 'Primer Semestre 2025',
  startDate: '2025-01-15T00:00:00Z',
  endDate: '2025-06-30T23:59:59Z',
  totalInstructors: 25,
  totalEvaluations: 450,
  completedEvaluations: 387,
  averageCompletionRate: 86,
  globalAverageScore: 4.38,
  categoryAverages: [
    { categoryId: 'cat-1', categoryName: 'Conocimiento y Dominio', averageScore: 4.56 },
    { categoryId: 'cat-2', categoryName: 'Metodología', averageScore: 4.24 },
    { categoryId: 'cat-3', categoryName: 'Relación con Estudiantes', averageScore: 4.48 },
    { categoryId: 'cat-4', categoryName: 'Puntualidad', averageScore: 4.24 },
  ],
  topInstructors: [
    { instructorId: 'inst-2', instructorName: 'María González', score: 4.8, evaluationCount: 50 },
    { instructorId: 'inst-1', instructorName: 'Carlos Rodríguez', score: 4.6, evaluationCount: 42 },
    { instructorId: 'inst-4', instructorName: 'Ana López', score: 4.4, evaluationCount: 46 },
  ],
  instructorsNeedingSupport: [
    { instructorId: 'inst-3', instructorName: 'Juan Martínez', score: 3.9, mainConcerns: ['Metodología', 'Puntualidad'] },
  ],
  scoreDistribution: [
    { range: '4.5 - 5.0', count: 8, percentage: 32 },
    { range: '4.0 - 4.4', count: 10, percentage: 40 },
    { range: '3.5 - 3.9', count: 5, percentage: 20 },
    { range: '3.0 - 3.4', count: 2, percentage: 8 },
    { range: '< 3.0', count: 0, percentage: 0 },
  ],
  generatedAt: new Date().toISOString(),
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const ScoreBadge = ({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) => {
  const getColor = () => {
    if (score >= 4.5) return 'bg-green-100 text-green-700';
    if (score >= 4) return 'bg-blue-100 text-blue-700';
    if (score >= 3.5) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-lg',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${getColor()} ${sizes[size]}`}>
      <Star className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {score.toFixed(1)}
    </span>
  );
};

const TrendIndicator = ({ change }: { change: number }) => {
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
        <TrendingUp className="h-4 w-4" />
        +{change.toFixed(1)}
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-sm">
        <TrendingDown className="h-4 w-4" />
        {change.toFixed(1)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
      <Minus className="h-4 w-4" />
      0.0
    </span>
  );
};

const ProgressBar = ({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) => {
  const percent = Math.min((value / max) * 100, 100);
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${colors[color]} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

type ViewMode = 'overview' | 'instructors' | 'period';

export default function ReportesEvalinContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(demoPeriods[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedInstructor, setExpandedInstructor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'evaluations'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar y ordenar instructores
  const filteredInstructors = demoInstructorSummaries
    .filter((i) =>
      i.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'score':
          comparison = a.overallScore - b.overallScore;
          break;
        case 'name':
          comparison = a.instructorName.localeCompare(b.instructorName);
          break;
        case 'evaluations':
          comparison = a.completedEvaluations - b.completedEvaluations;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`Exportando reporte en formato ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Evaluación</h1>
          <p className="text-sm text-gray-500 mt-1">
            Análisis y métricas de evaluación de instructores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 mb-1">
              Período de Evaluación
            </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {demoPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name} {period.status === 'active' && '(Activo)'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Resumen
            </button>
            <button
              onClick={() => setViewMode('instructors')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'instructors'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Instructores
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {demoPeriodReport.totalInstructors}
                </span>
              </div>
              <p className="text-sm text-gray-500">Instructores Evaluados</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {demoPeriodReport.completedEvaluations}
                </span>
              </div>
              <p className="text-sm text-gray-500">Evaluaciones Completadas</p>
              <p className="text-xs text-gray-400 mt-1">
                de {demoPeriodReport.totalEvaluations} ({demoPeriodReport.averageCompletionRate}%)
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <ScoreBadge score={demoPeriodReport.globalAverageScore} size="lg" />
              </div>
              <p className="text-sm text-gray-500">Promedio Global</p>
              <p className="text-xs text-gray-400 mt-1">de 5.0 puntos</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">+5%</span>
              </div>
              <p className="text-sm text-gray-500">vs Período Anterior</p>
            </div>
          </div>

          {/* Category Averages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Promedio por Categoría
            </h2>
            <div className="space-y-4">
              {demoPeriodReport.categoryAverages.map((cat) => {
                const getProgressColor = () => {
                  if (cat.averageScore >= 4) return 'green';
                  if (cat.averageScore >= 3.5) return 'amber';
                  return 'red';
                };
                return (
                  <div key={cat.categoryId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {cat.categoryName}
                      </span>
                      <ScoreBadge score={cat.averageScore} size="sm" />
                    </div>
                    <ProgressBar value={cat.averageScore} max={5} color={getProgressColor()} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top & Bottom Instructors */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Instructors */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Mejores Evaluados
                </h2>
              </div>
              <div className="space-y-3">
                {demoPeriodReport.topInstructors.map((instructor, index) => {
                  const getRankBadgeStyle = () => {
                    if (index === 0) return 'bg-amber-100 text-amber-700';
                    if (index === 1) return 'bg-gray-200 text-gray-600';
                    return 'bg-amber-50 text-amber-600';
                  };
                  return (
                    <div
                      key={instructor.instructorId}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeStyle()}`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {instructor.instructorName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {instructor.evaluationCount} evaluaciones
                        </p>
                      </div>
                      <ScoreBadge score={instructor.score} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructors Needing Support */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Requieren Apoyo
                </h2>
              </div>
              {demoPeriodReport.instructorsNeedingSupport.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-gray-500">
                    Todos los instructores tienen buen desempeño
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {demoPeriodReport.instructorsNeedingSupport.map((instructor) => (
                    <div
                      key={instructor.instructorId}
                      className="p-3 bg-amber-50 rounded-lg border border-amber-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          {instructor.instructorName}
                        </p>
                        <ScoreBadge score={instructor.score} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {instructor.mainConcerns.map((concern) => (
                          <span
                            key={concern}
                            className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full"
                          >
                            {concern}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución de Puntajes
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {demoPeriodReport.scoreDistribution.map((dist) => {
                const getDistBarColor = () => {
                  if (dist.range.includes('4.5')) return 'bg-green-500';
                  if (dist.range.includes('4.0')) return 'bg-blue-500';
                  if (dist.range.includes('3.5')) return 'bg-amber-500';
                  if (dist.range.includes('3.0')) return 'bg-orange-500';
                  return 'bg-red-500';
                };
                return (
                  <div key={dist.range} className="text-center">
                    <div className="h-32 flex items-end justify-center mb-2">
                      <div
                        className={`w-12 rounded-t-lg ${getDistBarColor()}`}
                        style={{ height: `${Math.max(dist.percentage * 1.2, 10)}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{dist.count}</p>
                    <p className="text-xs text-gray-500">{dist.range}</p>
                    <p className="text-xs text-gray-400">{dist.percentage}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {viewMode === 'instructors' && (
        <>
          {/* Search and Sort */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar instructor..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as typeof sortBy);
                  setSortOrder(order as typeof sortOrder);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="score-desc">Mayor puntaje</option>
                <option value="score-asc">Menor puntaje</option>
                <option value="name-asc">Nombre A-Z</option>
                <option value="name-desc">Nombre Z-A</option>
                <option value="evaluations-desc">Más evaluaciones</option>
              </select>
            </div>
          </div>

          {/* Instructors List */}
          <div className="space-y-4">
            {filteredInstructors.map((instructor) => (
              <div
                key={instructor.instructorId}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Main Row */}
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {instructor.instructorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {instructor.instructorName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {instructor.completedEvaluations} evaluaciones ({instructor.responseRate}% respuesta)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <ScoreBadge score={instructor.overallScore} />
                      {instructor.trend && (
                        <TrendIndicator change={instructor.trend.change} />
                      )}
                      <button
                        onClick={() => setExpandedInstructor(
                          expandedInstructor === instructor.instructorId
                            ? null
                            : instructor.instructorId
                        )}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        {expandedInstructor === instructor.instructorId ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedInstructor === instructor.instructorId && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Category Scores */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Puntaje por Categoría
                        </h4>
                        <div className="space-y-3">
                          {instructor.categoryScores.map((cat) => {
                            const getCategoryColor = () => {
                              if (cat.averageScore >= 4.5) return 'green';
                              if (cat.averageScore >= 4) return 'blue';
                              return 'amber';
                            };
                            return (
                              <div key={cat.categoryId}>
                                <div className="flex items-center justify-between mb-1 text-sm">
                                  <span className="text-gray-600">{cat.categoryName}</span>
                                  <span className="font-medium">{cat.averageScore.toFixed(1)}</span>
                                </div>
                                <ProgressBar
                                  value={cat.averageScore}
                                  max={5}
                                  color={getCategoryColor()}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Feedback Summary */}
                      <div>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Fortalezas
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {instructor.strengths.map((strength) => (
                              <span
                                key={strength}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {strength}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Áreas de Mejora
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {instructor.areasForImprovement.map((area) => (
                              <span
                                key={area}
                                className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Highlighted Comments */}
                    {instructor.highlightedComments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Comentarios Destacados
                        </h4>
                        <div className="space-y-2">
                          {instructor.highlightedComments.map((comment) => (
                            <p
                              key={comment}
                              className="text-sm text-gray-600 italic pl-4 border-l-2 border-gray-300"
                            >
                              &quot;{comment}&quot;
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Score Distribution Mini Chart */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Distribución de Calificaciones
                      </h4>
                      <div className="flex items-end gap-2 h-16">
                        {instructor.scoreDistribution.map((dist) => {
                          const getScoreBarColor = () => {
                            if (dist.score >= 4) return 'bg-green-400';
                            if (dist.score >= 3) return 'bg-amber-400';
                            return 'bg-red-400';
                          };
                          return (
                            <div key={dist.score} className="flex-1 text-center">
                              <div
                                className={`mx-auto w-full max-w-[40px] rounded-t ${getScoreBarColor()}`}
                                style={{ height: `${Math.max(dist.percentage * 0.6, 4)}px` }}
                              />
                              <p className="text-xs text-gray-500 mt-1">{dist.score}★</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
