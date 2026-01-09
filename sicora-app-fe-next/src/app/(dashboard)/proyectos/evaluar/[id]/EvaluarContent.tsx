'use client';

/**
 * Página de Evaluación - ProjectEvalService
 * Formulario de evaluación con rúbrica
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  User,
  File,
  Calendar,
  Loader2,
  Save,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import type { RubricCriteria, RubricLevel } from '@/types/project.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoSubmission = {
  id: 'sub-2',
  projectId: 'proj-1',
  projectName: 'Sistema de Gestión de Inventarios',
  deliverableId: 'del-3',
  deliverableName: 'API Backend v1.0',
  deliverableType: 'code' as const,
  teamMembers: [
    { id: 'student-1', name: 'Carlos Andrés Martínez' },
    { id: 'student-3', name: 'Laura Sofía Hernández' },
    { id: 'student-4', name: 'Miguel Ángel Torres' },
  ],
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
};

const demoRubric = {
  id: 'rubric-1',
  name: 'Rúbrica de Evaluación de Código',
  description: 'Rúbrica para evaluar entregas de código fuente en proyectos de desarrollo de software.',
  criteria: [
    {
      id: 'crit-1',
      name: 'Funcionalidad',
      description: 'El código cumple con los requisitos funcionales especificados.',
      weight: 30,
      maxScore: 100,
      levels: [
        { id: 'lvl-1-1', level: 5, label: 'Excelente', description: 'Cumple todos los requisitos y agrega funcionalidades adicionales de valor.', score: 100 },
        { id: 'lvl-1-2', level: 4, label: 'Bueno', description: 'Cumple todos los requisitos especificados correctamente.', score: 80 },
        { id: 'lvl-1-3', level: 3, label: 'Aceptable', description: 'Cumple la mayoría de requisitos con algunos errores menores.', score: 60 },
        { id: 'lvl-1-4', level: 2, label: 'Deficiente', description: 'Cumple parcialmente los requisitos con errores significativos.', score: 40 },
        { id: 'lvl-1-5', level: 1, label: 'No cumple', description: 'No cumple con los requisitos básicos.', score: 20 },
      ],
    },
    {
      id: 'crit-2',
      name: 'Calidad del Código',
      description: 'El código está bien estructurado, es legible y sigue buenas prácticas.',
      weight: 25,
      maxScore: 100,
      levels: [
        { id: 'lvl-2-1', level: 5, label: 'Excelente', description: 'Código limpio, bien documentado, sigue patrones de diseño apropiados.', score: 100 },
        { id: 'lvl-2-2', level: 4, label: 'Bueno', description: 'Código organizado y legible con documentación adecuada.', score: 80 },
        { id: 'lvl-2-3', level: 3, label: 'Aceptable', description: 'Código funcional con estructura básica aceptable.', score: 60 },
        { id: 'lvl-2-4', level: 2, label: 'Deficiente', description: 'Código desorganizado y difícil de mantener.', score: 40 },
        { id: 'lvl-2-5', level: 1, label: 'No cumple', description: 'Código sin estructura ni documentación.', score: 20 },
      ],
    },
    {
      id: 'crit-3',
      name: 'Pruebas',
      description: 'El código incluye pruebas unitarias y de integración.',
      weight: 20,
      maxScore: 100,
      levels: [
        { id: 'lvl-3-1', level: 5, label: 'Excelente', description: 'Cobertura >90%, pruebas unitarias e integración bien estructuradas.', score: 100 },
        { id: 'lvl-3-2', level: 4, label: 'Bueno', description: 'Cobertura >70%, pruebas para funcionalidades principales.', score: 80 },
        { id: 'lvl-3-3', level: 3, label: 'Aceptable', description: 'Cobertura >50%, pruebas básicas implementadas.', score: 60 },
        { id: 'lvl-3-4', level: 2, label: 'Deficiente', description: 'Pocas pruebas, cobertura <30%.', score: 40 },
        { id: 'lvl-3-5', level: 1, label: 'No cumple', description: 'Sin pruebas implementadas.', score: 20 },
      ],
    },
    {
      id: 'crit-4',
      name: 'Documentación',
      description: 'Documentación técnica del código y API.',
      weight: 15,
      maxScore: 100,
      levels: [
        { id: 'lvl-4-1', level: 5, label: 'Excelente', description: 'Documentación completa con ejemplos, diagramas y guías de uso.', score: 100 },
        { id: 'lvl-4-2', level: 4, label: 'Bueno', description: 'Documentación clara de endpoints, funciones principales.', score: 80 },
        { id: 'lvl-4-3', level: 3, label: 'Aceptable', description: 'Documentación básica presente.', score: 60 },
        { id: 'lvl-4-4', level: 2, label: 'Deficiente', description: 'Documentación incompleta o confusa.', score: 40 },
        { id: 'lvl-4-5', level: 1, label: 'No cumple', description: 'Sin documentación.', score: 20 },
      ],
    },
    {
      id: 'crit-5',
      name: 'Seguridad',
      description: 'Implementación de prácticas de seguridad en el código.',
      weight: 10,
      maxScore: 100,
      levels: [
        { id: 'lvl-5-1', level: 5, label: 'Excelente', description: 'Implementa validaciones, sanitización, autenticación robusta.', score: 100 },
        { id: 'lvl-5-2', level: 4, label: 'Bueno', description: 'Implementa medidas de seguridad principales.', score: 80 },
        { id: 'lvl-5-3', level: 3, label: 'Aceptable', description: 'Seguridad básica implementada.', score: 60 },
        { id: 'lvl-5-4', level: 2, label: 'Deficiente', description: 'Vulnerabilidades evidentes.', score: 40 },
        { id: 'lvl-5-5', level: 1, label: 'No cumple', description: 'Sin consideraciones de seguridad.', score: 20 },
      ],
    },
  ],
  totalMaxScore: 100,
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface CriteriaEvaluationProps {
  criteria: RubricCriteria;
  selectedLevelId: string | null;
  feedback: string;
  onSelectLevel: (levelId: string) => void;
  onFeedbackChange: (feedback: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function CriteriaEvaluation({
  criteria,
  selectedLevelId,
  feedback,
  onSelectLevel,
  onFeedbackChange,
  isExpanded,
  onToggle,
}: CriteriaEvaluationProps) {
  const selectedLevel = criteria.levels.find((l) => l.id === selectedLevelId);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            selectedLevelId ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
          }`}>
            {selectedLevelId ? <CheckCircle className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <h4 className="font-medium text-gray-900">{criteria.name}</h4>
            <p className="text-xs text-gray-500">Peso: {criteria.weight}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedLevel && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              selectedLevel.level >= 4 ? 'bg-green-100 text-green-700' :
              selectedLevel.level >= 3 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {selectedLevel.label} ({selectedLevel.score}pts)
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">{criteria.description}</p>

          {/* Levels */}
          <div className="space-y-2">
            {criteria.levels.map((level) => (
              <button
                key={level.id}
                onClick={() => onSelectLevel(level.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedLevelId === level.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${
                    level.level >= 4 ? 'text-green-700' :
                    level.level >= 3 ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {level.label}
                  </span>
                  <span className="text-sm font-mono text-gray-500">{level.score} pts</span>
                </div>
                <p className="text-xs text-gray-600">{level.description}</p>
              </button>
            ))}
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retroalimentación específica (opcional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
              placeholder="Comentarios sobre este criterio..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface EvaluarContentProps {
  submissionId: string;
}

export default function EvaluarContent({ submissionId }: EvaluarContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Evaluation state
  const [criteriaEvaluations, setCriteriaEvaluations] = useState<Record<string, { levelId: string | null; feedback: string }>>({});
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [strengths, setStrengths] = useState<string[]>(['']);
  const [improvements, setImprovements] = useState<string[]>(['']);
  const [expandedCriteria, setExpandedCriteria] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Initialize criteria evaluations
      const initial: Record<string, { levelId: string | null; feedback: string }> = {};
      demoRubric.criteria.forEach((c) => {
        initial[c.id] = { levelId: null, feedback: '' };
      });
      setCriteriaEvaluations(initial);
      setExpandedCriteria(demoRubric.criteria[0]?.id || null);
      setIsLoading(false);
    }, 400);
  }, [submissionId]);

  const handleSelectLevel = (criteriaId: string, levelId: string) => {
    setCriteriaEvaluations((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], levelId },
    }));
  };

  const handleFeedbackChange = (criteriaId: string, feedback: string) => {
    setCriteriaEvaluations((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], feedback },
    }));
  };

  const addStrength = () => setStrengths((prev) => [...prev, '']);
  const addImprovement = () => setImprovements((prev) => [...prev, '']);

  const updateStrength = (index: number, value: string) => {
    setStrengths((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const updateImprovement = (index: number, value: string) => {
    setImprovements((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const removeStrength = (index: number) => {
    setStrengths((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImprovement = (index: number) => {
    setImprovements((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate score
  const calculateScore = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    demoRubric.criteria.forEach((criteria) => {
      const evaluation = criteriaEvaluations[criteria.id];
      if (evaluation?.levelId) {
        const level = criteria.levels.find((l) => l.id === evaluation.levelId);
        if (level) {
          totalWeightedScore += (level.score * criteria.weight) / 100;
          totalWeight += criteria.weight;
        }
      }
    });

    return totalWeight > 0 ? Math.round(totalWeightedScore) : 0;
  };

  const evaluatedCount = Object.values(criteriaEvaluations).filter((e) => e.levelId).length;
  const totalCriteria = demoRubric.criteria.length;
  const score = calculateScore();
  const isComplete = evaluatedCount === totalCriteria;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      console.log('Guardando evaluación:', {
        criteriaEvaluations,
        generalFeedback,
        strengths: strengths.filter(Boolean),
        improvements: improvements.filter(Boolean),
        score,
      });
      setIsSaving(false);
    }, 500);
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    setIsSaving(true);
    setTimeout(() => {
      console.log('Enviando evaluación final');
      setIsSaving(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/proyectos" className="hover:text-green-600">Proyectos</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/proyectos/entregas" className="hover:text-green-600">Entregas</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Evaluar</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluar Entrega</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">{demoSubmission.deliverableName}</h2>
            <p className="text-sm text-gray-500 mb-3">{demoSubmission.projectName}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-gray-400" />
                <span>{demoSubmission.teamMembers.map((m) => m.name).join(', ')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(demoSubmission.submittedAt!).toLocaleDateString('es-CO')}</span>
              </div>
            </div>

            {/* Files */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500 mb-2">Archivos entregados:</p>
              <div className="space-y-2">
                {demoSubmission.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{file.fileName}</span>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-green-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rubric */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">{demoRubric.name}</h2>
                <p className="text-sm text-gray-500">{demoRubric.description}</p>
              </div>
              <span className="text-sm text-gray-500">
                {evaluatedCount}/{totalCriteria} criterios
              </span>
            </div>

            {/* Criteria */}
            <div className="space-y-3">
              {demoRubric.criteria.map((criteria) => (
                <CriteriaEvaluation
                  key={criteria.id}
                  criteria={criteria}
                  selectedLevelId={criteriaEvaluations[criteria.id]?.levelId}
                  feedback={criteriaEvaluations[criteria.id]?.feedback || ''}
                  onSelectLevel={(levelId) => handleSelectLevel(criteria.id, levelId)}
                  onFeedbackChange={(feedback) => handleFeedbackChange(criteria.id, feedback)}
                  isExpanded={expandedCriteria === criteria.id}
                  onToggle={() => setExpandedCriteria(expandedCriteria === criteria.id ? null : criteria.id)}
                />
              ))}
            </div>
          </div>

          {/* General Feedback */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              Retroalimentación General
            </h3>
            <textarea
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              placeholder="Escribe una retroalimentación general sobre la entrega..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Fortalezas
              </h3>
              <div className="space-y-2">
                {strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => updateStrength(i, e.target.value)}
                      placeholder="Agregar fortaleza..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {strengths.length > 1 && (
                      <button
                        onClick={() => removeStrength(i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addStrength}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Agregar fortaleza
                </button>
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Áreas de Mejora
              </h3>
              <div className="space-y-2">
                {improvements.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => updateImprovement(i, e.target.value)}
                      placeholder="Agregar área de mejora..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {improvements.length > 1 && (
                      <button
                        onClick={() => removeImprovement(i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addImprovement}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Agregar área de mejora
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Score Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
            
            {/* Score Display */}
            <div className="text-center mb-4 p-4 bg-gray-50 rounded-xl">
              <div className={`text-5xl font-bold mb-1 ${
                score >= 60 ? 'text-green-600' : score > 0 ? 'text-red-600' : 'text-gray-400'
              }`}>
                {score}
              </div>
              <p className="text-sm text-gray-500">Puntuación total</p>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progreso</span>
                <span className="font-medium">{evaluatedCount}/{totalCriteria}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(evaluatedCount / totalCriteria) * 100}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 p-2 rounded-lg mb-4 text-sm">
              {isComplete ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg w-full">
                  <CheckCircle className="w-4 h-4" />
                  <span>Evaluación completa</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded-lg w-full">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Faltan {totalCriteria - evaluatedCount} criterios</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar borrador
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isComplete || isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar evaluación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
