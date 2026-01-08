'use client';

/**
 * EvaluacionesContent - Componente principal del módulo de Evaluaciones
 *
 * Características:
 * - Lista de evaluaciones con filtros y paginación
 * - Sistema de rúbricas para calificación por competencias
 * - Interfaz de calificación estudiante por estudiante
 * - Estadísticas y visualización de resultados
 * - Tabs: Evaluaciones, Rúbricas, Calificar, Reportes
 *
 * @component
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  FileText,
  Users,
  BarChart3,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  Star,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  calculateCompetencyLevel,
  type StudentForGrading,
} from '@/stores/evaluationsStore';
import type {
  Evaluation,
  EvaluationStatus,
  EvaluationType,
  Rubric,
  CompetencyLevel,
  EvaluationCriteria,
} from '@/types/evaluation.types';

// ============================================================================
// CONSTANTES Y TIPOS
// ============================================================================

type TabId = 'evaluaciones' | 'rubricas' | 'calificar' | 'reportes';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const STATUS_CONFIG: Record<EvaluationStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  scheduled: { label: 'Programada', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  in_progress: { label: 'En curso', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  completed: { label: 'Completada', color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelada', color: 'text-red-600', bgColor: 'bg-red-100' },
};

const TYPE_CONFIG: Record<EvaluationType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  knowledge: { label: 'Conocimiento', icon: FileText },
  performance: { label: 'Desempeño', icon: Target },
  product: { label: 'Producto', icon: Award },
  attitude: { label: 'Actitud', icon: Star },
};

const LEVEL_CONFIG: Record<CompetencyLevel, { label: string; color: string; bgColor: string }> = {
  not_achieved: { label: 'No logrado', color: 'text-red-600', bgColor: 'bg-red-100' },
  in_progress: { label: 'En proceso', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  achieved: { label: 'Logrado', color: 'text-green-600', bgColor: 'bg-green-100' },
  exceeded: { label: 'Superado', color: 'text-blue-600', bgColor: 'bg-blue-100' },
};

// ============================================================================
// DATOS DEMO
// ============================================================================

const DEMO_RUBRICS: Rubric[] = [
  {
    id: 'rub-1',
    name: 'Rúbrica de Programación Básica',
    description: 'Evaluación de competencias en programación orientada a objetos',
    competencyId: 'comp-1',
    competencyName: 'Desarrollar aplicaciones de software',
    scoreScale: 'numeric',
    passingScore: 70,
    isTemplate: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    createdBy: 'instructor-1',
    criteria: [
      {
        id: 'crit-1',
        name: 'Sintaxis y estructura',
        description: 'Uso correcto de la sintaxis del lenguaje',
        weight: 25,
        maxScore: 100,
        levels: [
          { id: 'l1', name: 'Excelente', description: 'Sin errores', minScore: 90, maxScore: 100, competencyLevel: 'exceeded' },
          { id: 'l2', name: 'Bueno', description: 'Errores menores', minScore: 70, maxScore: 89, competencyLevel: 'achieved' },
          { id: 'l3', name: 'Regular', description: 'Varios errores', minScore: 50, maxScore: 69, competencyLevel: 'in_progress' },
          { id: 'l4', name: 'Deficiente', description: 'Muchos errores', minScore: 0, maxScore: 49, competencyLevel: 'not_achieved' },
        ],
      },
      {
        id: 'crit-2',
        name: 'Lógica y algoritmos',
        description: 'Implementación correcta de la lógica',
        weight: 35,
        maxScore: 100,
        levels: [
          { id: 'l1', name: 'Excelente', description: 'Lógica óptima', minScore: 90, maxScore: 100, competencyLevel: 'exceeded' },
          { id: 'l2', name: 'Bueno', description: 'Lógica correcta', minScore: 70, maxScore: 89, competencyLevel: 'achieved' },
          { id: 'l3', name: 'Regular', description: 'Lógica parcial', minScore: 50, maxScore: 69, competencyLevel: 'in_progress' },
          { id: 'l4', name: 'Deficiente', description: 'Lógica incorrecta', minScore: 0, maxScore: 49, competencyLevel: 'not_achieved' },
        ],
      },
      {
        id: 'crit-3',
        name: 'Buenas prácticas',
        description: 'Código limpio y documentado',
        weight: 20,
        maxScore: 100,
        levels: [
          { id: 'l1', name: 'Excelente', description: 'Código ejemplar', minScore: 90, maxScore: 100, competencyLevel: 'exceeded' },
          { id: 'l2', name: 'Bueno', description: 'Bien documentado', minScore: 70, maxScore: 89, competencyLevel: 'achieved' },
          { id: 'l3', name: 'Regular', description: 'Documentación básica', minScore: 50, maxScore: 69, competencyLevel: 'in_progress' },
          { id: 'l4', name: 'Deficiente', description: 'Sin documentación', minScore: 0, maxScore: 49, competencyLevel: 'not_achieved' },
        ],
      },
      {
        id: 'crit-4',
        name: 'Funcionalidad',
        description: 'El programa cumple los requisitos',
        weight: 20,
        maxScore: 100,
        levels: [
          { id: 'l1', name: 'Excelente', description: 'Funciona perfectamente', minScore: 90, maxScore: 100, competencyLevel: 'exceeded' },
          { id: 'l2', name: 'Bueno', description: 'Funciona correctamente', minScore: 70, maxScore: 89, competencyLevel: 'achieved' },
          { id: 'l3', name: 'Regular', description: 'Funciona parcialmente', minScore: 50, maxScore: 69, competencyLevel: 'in_progress' },
          { id: 'l4', name: 'Deficiente', description: 'No funciona', minScore: 0, maxScore: 49, competencyLevel: 'not_achieved' },
        ],
      },
    ],
  },
];

const DEMO_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1',
    name: 'Parcial 1 - Fundamentos de Programación',
    description: 'Evaluación de conocimientos básicos de POO',
    type: 'knowledge',
    status: 'scheduled',
    rubricId: 'rub-1',
    programId: 'prog-1',
    programName: 'Tecnólogo en ADSO',
    groupId: 'group-1',
    groupName: 'ADSO-2024-01',
    competencyId: 'comp-1',
    competencyName: 'Desarrollar aplicaciones de software',
    learningOutcomeIds: ['lo-1', 'lo-2'],
    scheduledDate: '2024-02-15',
    startTime: '08:00',
    endTime: '10:00',
    duration: 120,
    location: 'Ambiente 301',
    maxAttempts: 1,
    allowLateSubmission: false,
    instructions: 'Desarrolle los ejercicios propuestos utilizando TypeScript.',
    totalStudents: 25,
    evaluatedCount: 0,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    createdBy: 'instructor-1',
    instructorId: 'instructor-1',
    instructorName: 'Carlos Rodríguez',
  },
  {
    id: 'eval-2',
    name: 'Proyecto Final - Sistema de Inventario',
    description: 'Desarrollo de un sistema CRUD completo',
    type: 'product',
    status: 'in_progress',
    rubricId: 'rub-1',
    programId: 'prog-1',
    programName: 'Tecnólogo en ADSO',
    groupId: 'group-1',
    groupName: 'ADSO-2024-01',
    competencyId: 'comp-1',
    competencyName: 'Desarrollar aplicaciones de software',
    learningOutcomeIds: ['lo-1', 'lo-2', 'lo-3'],
    scheduledDate: '2024-02-10',
    startTime: '14:00',
    duration: 180,
    location: 'Ambiente 302',
    maxAttempts: 2,
    allowLateSubmission: true,
    lateSubmissionPenalty: 10,
    totalStudents: 25,
    evaluatedCount: 15,
    averageScore: 78,
    passRate: 85,
    createdAt: '2024-01-15',
    updatedAt: '2024-02-10',
    createdBy: 'instructor-1',
    instructorId: 'instructor-1',
    instructorName: 'Carlos Rodríguez',
  },
  {
    id: 'eval-3',
    name: 'Quiz - Estructuras de Datos',
    type: 'knowledge',
    status: 'completed',
    rubricId: 'rub-1',
    programId: 'prog-1',
    programName: 'Tecnólogo en ADSO',
    groupId: 'group-2',
    groupName: 'ADSO-2024-02',
    competencyId: 'comp-1',
    competencyName: 'Desarrollar aplicaciones de software',
    learningOutcomeIds: ['lo-2'],
    scheduledDate: '2024-02-01',
    duration: 45,
    location: 'Virtual',
    maxAttempts: 1,
    allowLateSubmission: false,
    totalStudents: 28,
    evaluatedCount: 28,
    averageScore: 82,
    passRate: 92,
    createdAt: '2024-01-25',
    updatedAt: '2024-02-01',
    createdBy: 'instructor-1',
    instructorId: 'instructor-1',
    instructorName: 'Carlos Rodríguez',
  },
];

const DEMO_STUDENTS_GRADING: StudentForGrading[] = [
  { id: 'st-1', name: 'Ana María García', document: '1001234567', isGraded: false },
  { id: 'st-2', name: 'Carlos Eduardo López', document: '1001234568', isGraded: false },
  { id: 'st-3', name: 'Diana Patricia Martínez', document: '1001234569', isGraded: true },
  { id: 'st-4', name: 'Eduardo José Ramírez', document: '1001234570', isGraded: false },
  { id: 'st-5', name: 'Fernanda Isabel Torres', document: '1001234571', isGraded: true },
  { id: 'st-6', name: 'Gabriel Antonio Sánchez', document: '1001234572', isGraded: false },
  { id: 'st-7', name: 'Helena Cristina Vargas', document: '1001234573', isGraded: false },
  { id: 'st-8', name: 'Iván Darío Mendoza', document: '1001234574', isGraded: false },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Badge de estado de evaluación
 */
function StatusBadge({ status }: Readonly<{ status: EvaluationStatus }>) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.bgColor, config.color)}>
      {config.label}
    </span>
  );
}

/**
 * Badge de tipo de evaluación
 */
function TypeBadge({ type }: Readonly<{ type: EvaluationType }>) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

/**
 * Badge de nivel de competencia
 */
function LevelBadge({ level }: Readonly<{ level: CompetencyLevel }>) {
  const config = LEVEL_CONFIG[level];
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.bgColor, config.color)}>
      {config.label}
    </span>
  );
}

/**
 * Card de estadísticas
 */
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subvalue, 
  color = 'blue' 
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subvalue?: string;
  color?: 'blue' | 'green' | 'amber' | 'purple';
}>) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subvalue && <p className="text-xs text-gray-400">{subvalue}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * Card de evaluación en lista
 */
function EvaluationCard({ 
  evaluation, 
  onView, 
  onEdit, 
  onGrade 
}: Readonly<{
  evaluation: Evaluation;
  onView: () => void;
  onEdit: () => void;
  onGrade: () => void;
}>) {
  const progress = evaluation.totalStudents > 0 
    ? Math.round((evaluation.evaluatedCount / evaluation.totalStudents) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={evaluation.status} />
            <TypeBadge type={evaluation.type} />
          </div>
          
          <h3 className="font-semibold text-gray-900 truncate">{evaluation.name}</h3>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {evaluation.groupName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(evaluation.scheduledDate).toLocaleDateString('es-CO')}
            </span>
            {evaluation.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {evaluation.duration} min
              </span>
            )}
          </div>

          {evaluation.status !== 'draft' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">
                  {evaluation.evaluatedCount} de {evaluation.totalStudents} evaluados
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sena-primary-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          {(evaluation.status === 'in_progress' || evaluation.status === 'scheduled') && (
            <button
              onClick={onGrade}
              className="p-2 text-sena-primary-600 hover:bg-sena-primary-50 rounded-lg transition-colors"
              title="Calificar"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Card de rúbrica
 */
function RubricCard({ 
  rubric, 
  onView, 
  onEdit, 
  onDuplicate 
}: Readonly<{
  rubric: Rubric;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {rubric.isTemplate && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                Plantilla
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 truncate">{rubric.name}</h3>
          
          <p className="text-sm text-gray-500 mt-1">{rubric.competencyName}</p>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>{rubric.criteria.length} criterios</span>
            <span>Aprobación: {rubric.passingScore}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Duplicar"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview de criterios */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {rubric.criteria.map((criteria) => (
            <span 
              key={criteria.id}
              className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600"
            >
              {criteria.name} ({criteria.weight}%)
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Interfaz de calificación
 */
function GradingInterface({ 
  evaluation, 
  rubric, 
  students, 
  onClose 
}: Readonly<{
  evaluation: Evaluation;
  rubric: Rubric;
  students: StudentForGrading[];
  onClose: () => void;
}>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');

  const currentStudent = students[currentIndex];
  const gradedCount = students.filter(s => s.isGraded).length;

  const totalScore = useMemo(() => {
    let weighted = 0;
    let totalWeight = 0;
    
    for (const criteria of rubric.criteria) {
      const score = scores[criteria.id];
      if (score !== undefined) {
        weighted += (score / criteria.maxScore) * 100 * (criteria.weight / 100);
        totalWeight += criteria.weight;
      }
    }
    
    return totalWeight > 0 ? Math.round(weighted) : 0;
  }, [scores, rubric.criteria]);

  const competencyLevel = calculateCompetencyLevel(totalScore, rubric.passingScore);

  const handleScoreChange = (criteriaId: string, score: number) => {
    setScores(prev => ({ ...prev, [criteriaId]: score }));
  };

  const handleSaveAndNext = () => {
    // En producción, aquí se guardaría la calificación
    console.log('Guardando:', { studentId: currentStudent.id, scores, feedback, totalScore });
    
    if (currentIndex < students.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScores({});
      setFeedback('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="font-semibold text-gray-900">{evaluation.name}</h2>
            <p className="text-sm text-gray-500">
              {gradedCount} de {students.length} estudiantes calificados
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sena-primary-500 transition-all"
              style={{ width: `${((currentIndex + 1) / students.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Student info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{currentStudent.name}</h3>
                <p className="text-sm text-gray-500">Doc: {currentStudent.document}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {students.length}
              </span>
              <button
                onClick={() => setCurrentIndex(prev => Math.min(students.length - 1, prev + 1))}
                disabled={currentIndex === students.length - 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Criteria scoring */}
          <div className="space-y-4">
            {rubric.criteria.map((criteria) => (
              <CriteriaScoringRow
                key={criteria.id}
                criteria={criteria}
                score={scores[criteria.id]}
                onChange={(score) => handleScoreChange(criteria.id, score)}
              />
            ))}
          </div>

          {/* Feedback */}
          <div className="mt-6">
            <label htmlFor="feedback-textarea" className="block text-sm font-medium text-gray-700 mb-2">
              Retroalimentación general
            </label>
            <textarea
              id="feedback-textarea"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent resize-none"
              placeholder="Escriba comentarios para el estudiante..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalScore}</p>
              <p className="text-xs text-gray-500">Puntaje</p>
            </div>
            <LevelBadge level={competencyLevel} />
            {totalScore >= rubric.passingScore ? (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Aprobado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                No aprobado
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndNext}
              className="flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              {currentIndex < students.length - 1 ? 'Guardar y siguiente' : 'Guardar y terminar'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Fila de calificación por criterio
 */
function CriteriaScoringRow({ 
  criteria, 
  score, 
  onChange 
}: Readonly<{
  criteria: EvaluationCriteria;
  score: number | undefined;
  onChange: (score: number) => void;
}>) {
  const currentLevel = useMemo(() => {
    if (score === undefined) return null;
    return criteria.levels.find(l => score >= l.minScore && score <= l.maxScore);
  }, [score, criteria.levels]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h4 className="font-medium text-gray-900">
            {criteria.name}
            <span className="ml-2 text-sm text-gray-500">({criteria.weight}%)</span>
          </h4>
          <p className="text-sm text-gray-500">{criteria.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={score ?? ''}
            onChange={(e) => onChange(Math.min(criteria.maxScore, Math.max(0, Number(e.target.value))))}
            min={0}
            max={criteria.maxScore}
            className="w-20 px-2 py-1 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent"
            placeholder="0"
            aria-label={`Puntaje para ${criteria.name}`}
          />
          <span className="text-sm text-gray-500">/ {criteria.maxScore}</span>
        </div>
      </div>

      {/* Level buttons */}
      <div className="flex flex-wrap gap-2">
        {criteria.levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onChange(level.maxScore)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-lg border transition-colors',
              currentLevel?.id === level.id
                ? 'border-sena-primary-500 bg-sena-primary-50 text-sena-primary-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            )}
          >
            <span className="font-medium">{level.name}</span>
            <span className="ml-1 text-gray-400">({level.minScore}-{level.maxScore})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function EvaluacionesContent() {
  const [activeTab, setActiveTab] = useState<TabId>('evaluaciones');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGrading, setShowGrading] = useState(false);
  const [selectedEvalForGrading, setSelectedEvalForGrading] = useState<Evaluation | null>(null);

  // Tabs disponibles
  const tabs: Tab[] = [
    { id: 'evaluaciones', label: 'Evaluaciones', icon: ClipboardCheck, badge: DEMO_EVALUATIONS.length },
    { id: 'rubricas', label: 'Rúbricas', icon: FileText, badge: DEMO_RUBRICS.length },
    { id: 'calificar', label: 'Calificar', icon: Users },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  // Filtrar evaluaciones
  const filteredEvaluations = useMemo(() => {
    return DEMO_EVALUATIONS.filter(eval_ =>
      eval_.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eval_.groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filtrar rúbricas
  const filteredRubrics = useMemo(() => {
    return DEMO_RUBRICS.filter(rubric =>
      rubric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rubric.competencyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handlers
  const handleStartGrading = useCallback((evaluation: Evaluation) => {
    setSelectedEvalForGrading(evaluation);
    setShowGrading(true);
  }, []);

  const handleCloseGrading = useCallback(() => {
    setShowGrading(false);
    setSelectedEvalForGrading(null);
  }, []);

  // Estadísticas
  const stats = useMemo(() => ({
    total: DEMO_EVALUATIONS.length,
    inProgress: DEMO_EVALUATIONS.filter(e => e.status === 'in_progress').length,
    completed: DEMO_EVALUATIONS.filter(e => e.status === 'completed').length,
    avgPassRate: Math.round(
      DEMO_EVALUATIONS
        .filter(e => e.passRate !== undefined)
        .reduce((acc, e) => acc + (e.passRate || 0), 0) / 
      DEMO_EVALUATIONS.filter(e => e.passRate !== undefined).length || 0
    ),
  }), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluaciones</h1>
          <p className="mt-1 text-gray-500">
            Gestión de evaluaciones y rúbricas por competencias
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600 transition-colors">
          <Plus className="w-4 h-4" />
          Nueva Evaluación
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardCheck}
          label="Total evaluaciones"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={Play}
          label="En curso"
          value={stats.inProgress}
          color="amber"
        />
        <StatCard
          icon={CheckCircle}
          label="Completadas"
          value={stats.completed}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Tasa de aprobación"
          value={`${stats.avgPassRate}%`}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                  isActive
                    ? 'border-sena-primary-500 text-sena-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    isActive ? 'bg-sena-primary-100 text-sena-primary-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'rubricas' ? 'Buscar rúbricas...' : 'Buscar evaluaciones...'}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'evaluaciones' && (
          <motion.div
            key="evaluaciones"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredEvaluations.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron evaluaciones</p>
              </div>
            ) : (
              filteredEvaluations.map((evaluation) => (
                <EvaluationCard
                  key={evaluation.id}
                  evaluation={evaluation}
                  onView={() => console.log('Ver:', evaluation.id)}
                  onEdit={() => console.log('Editar:', evaluation.id)}
                  onGrade={() => handleStartGrading(evaluation)}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'rubricas' && (
          <motion.div
            key="rubricas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600 transition-colors">
                <Plus className="w-4 h-4" />
                Nueva Rúbrica
              </button>
            </div>
            
            {filteredRubrics.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron rúbricas</p>
              </div>
            ) : (
              filteredRubrics.map((rubric) => (
                <RubricCard
                  key={rubric.id}
                  rubric={rubric}
                  onView={() => console.log('Ver:', rubric.id)}
                  onEdit={() => console.log('Editar:', rubric.id)}
                  onDuplicate={() => console.log('Duplicar:', rubric.id)}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'calificar' && (
          <motion.div
            key="calificar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-200 p-8"
          >
            <div className="text-center mb-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900">
                Seleccione una evaluación para calificar
              </h2>
              <p className="text-gray-500 mt-1">
                Las evaluaciones en curso aparecen en la pestaña de Evaluaciones
              </p>
            </div>

            <div className="space-y-3">
              {DEMO_EVALUATIONS.filter(e => e.status === 'in_progress' || e.status === 'scheduled').map((evaluation) => (
                <button
                  key={evaluation.id}
                  onClick={() => handleStartGrading(evaluation)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{evaluation.name}</p>
                    <p className="text-sm text-gray-500">{evaluation.groupName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {evaluation.evaluatedCount}/{evaluation.totalStudents} evaluados
                    </span>
                    <Play className="w-5 h-5 text-sena-primary-500" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'reportes' && (
          <motion.div
            key="reportes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-200 p-12 text-center"
          >
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900">Reportes de Evaluaciones</h2>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Próximamente: reportes por grupo, por competencia y seguimiento individual de estudiantes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grading Modal */}
      {showGrading && selectedEvalForGrading && (
        <GradingInterface
          evaluation={selectedEvalForGrading}
          rubric={DEMO_RUBRICS[0]}
          students={DEMO_STUDENTS_GRADING}
          onClose={handleCloseGrading}
        />
      )}
    </div>
  );
}
