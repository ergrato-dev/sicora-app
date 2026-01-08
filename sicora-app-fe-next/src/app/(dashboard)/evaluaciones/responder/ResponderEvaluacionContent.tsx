'use client';

/**
 * Página para Responder Evaluación - EvalinService
 * Formulario dinámico basado en cuestionario asignado
 */

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useEvalinStore } from '@/stores/evalinStore';
import type {
  Question,
  Questionnaire,
  EvaluationPeriod,
} from '@/types/evalin.types';
import {
  QUESTION_TYPE_CONFIG,
  LIKERT_OPTIONS,
} from '@/types/evalin.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoPeriod: EvaluationPeriod = {
  id: 'period-1',
  name: 'Evaluación Primer Semestre 2025',
  description: 'Período de evaluación docente del primer semestre académico',
  startDate: '2025-06-01T00:00:00Z',
  endDate: '2025-06-30T23:59:59Z',
  status: 'active',
  questionnaireId: 'qn-1',
  totalEvaluations: 150,
  completedEvaluations: 45,
  completionRate: 30,
  createdBy: 'admin-1',
  createdAt: '2025-05-15T00:00:00Z',
  updatedAt: '2025-05-15T00:00:00Z',
};

const demoQuestionnaire: Questionnaire = {
  id: 'qn-1',
  name: 'Evaluación Docente Semestral',
  description: 'Cuestionario estándar de evaluación de instructores',
  instructions: 'Por favor responda con honestidad. Sus respuestas son anónimas y ayudarán a mejorar la calidad educativa. Lea cada pregunta cuidadosamente antes de responder.',
  status: 'active',
  evaluatorRole: 'student',
  estimatedTimeMinutes: 15,
  allowPartialSave: true,
  anonymousResponses: true,
  categories: [],
  questions: [
    {
      id: 'q-1',
      text: '¿El instructor demuestra dominio del tema que enseña?',
      description: 'Considere el nivel de conocimiento técnico mostrado durante las clases',
      type: 'likert',
      categoryId: 'cat-1',
      isRequired: true,
      options: LIKERT_OPTIONS,
      order: 1,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-2',
      text: '¿El instructor explica los conceptos de forma clara y comprensible?',
      type: 'likert',
      categoryId: 'cat-2',
      isRequired: true,
      options: LIKERT_OPTIONS,
      order: 2,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-3',
      text: '¿El instructor utiliza ejemplos prácticos y relevantes?',
      type: 'likert',
      categoryId: 'cat-2',
      isRequired: true,
      options: LIKERT_OPTIONS,
      order: 3,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-4',
      text: '¿El instructor resuelve las dudas de manera oportuna y clara?',
      type: 'likert',
      categoryId: 'cat-3',
      isRequired: true,
      options: LIKERT_OPTIONS,
      order: 4,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-5',
      text: '¿El instructor fomenta la participación activa de los estudiantes?',
      type: 'likert',
      categoryId: 'cat-3',
      isRequired: true,
      options: LIKERT_OPTIONS,
      order: 5,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-6',
      text: '¿El instructor es puntual al iniciar y finalizar las clases?',
      type: 'likert',
      categoryId: 'cat-4',
      isRequired: true,
      options: LIKERT_OPTIONS,
      order: 6,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-7',
      text: 'Califique al instructor en una escala del 1 al 10',
      description: 'Donde 1 es deficiente y 10 es excelente',
      type: 'rating',
      categoryId: 'cat-1',
      isRequired: true,
      minValue: 1,
      maxValue: 10,
      order: 7,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-8',
      text: '¿Recomendaría este instructor a otros estudiantes?',
      type: 'yes_no',
      categoryId: 'cat-3',
      isRequired: true,
      order: 8,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-9',
      text: '¿Qué aspectos positivos destacaría del instructor?',
      description: 'Mínimo 20 caracteres',
      type: 'text',
      categoryId: 'cat-3',
      isRequired: false,
      minLength: 20,
      maxLength: 500,
      order: 9,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-10',
      text: '¿Qué aspectos considera que el instructor podría mejorar?',
      description: 'Sus sugerencias son valiosas para el desarrollo profesional',
      type: 'text',
      categoryId: 'cat-3',
      isRequired: false,
      minLength: 20,
      maxLength: 500,
      order: 10,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ],
  totalQuestions: 10,
  version: 1,
  createdBy: 'admin-1',
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
};

const demoInstructor = {
  id: 'instructor-1',
  name: 'Carlos Rodríguez',
  department: 'Desarrollo de Software',
  course: 'Programación Web Avanzada',
  group: 'ADSO-2567890',
};

// ============================================================================
// COMPONENTES DE PREGUNTAS
// ============================================================================

interface QuestionRendererProps {
  question: Question;
  value: string | number | string[] | undefined;
  onChange: (value: string | number | string[]) => void;
}

function LikertQuestion({ question, value, onChange }: QuestionRendererProps) {
  const options = question.options || LIKERT_OPTIONS;
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.value)}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <span className="block text-lg font-bold mb-1">{option.value}</span>
            <span className="block text-xs leading-tight">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RatingQuestion({ question, value, onChange }: QuestionRendererProps) {
  const min = question.minValue || 1;
  const max = question.maxValue || 10;
  const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
              value === rating
                ? 'bg-amber-500 text-white scale-110 shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 px-2">
        <span>Deficiente</span>
        <span>Excelente</span>
      </div>
    </div>
  );
}

function YesNoQuestion({ question, value, onChange }: QuestionRendererProps) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        type="button"
        onClick={() => onChange('yes')}
        className={`flex-1 max-w-[200px] py-4 px-6 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
          value === 'yes'
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-600'
        }`}
      >
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Sí</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('no')}
        className={`flex-1 max-w-[200px] py-4 px-6 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
          value === 'no'
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-600'
        }`}
      >
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">No</span>
      </button>
    </div>
  );
}

function TextQuestion({ question, value, onChange }: QuestionRendererProps) {
  const textValue = (value as string) || '';
  const minLength = question.minLength || 0;
  const maxLength = question.maxLength || 1000;
  const charCount = textValue.length;
  const isValid = !question.isRequired || charCount >= minLength;
  
  return (
    <div className="space-y-2">
      <textarea
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escriba su respuesta aquí..."
        rows={4}
        maxLength={maxLength}
        className={`w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 ${
          isValid
            ? 'border-gray-300 focus:border-blue-500'
            : 'border-red-300 focus:border-red-500'
        }`}
      />
      <div className="flex justify-between text-xs">
        <span className={charCount < minLength && question.isRequired ? 'text-red-500' : 'text-gray-400'}>
          {minLength > 0 && `Mínimo ${minLength} caracteres`}
        </span>
        <span className={charCount > maxLength * 0.9 ? 'text-amber-500' : 'text-gray-400'}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  );
}

function SingleChoiceQuestion({ question, value, onChange }: QuestionRendererProps) {
  const options = question.options || [];
  
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            value === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="flex items-center gap-3">
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              value === option.value ? 'border-blue-500' : 'border-gray-300'
            }`}>
              {value === option.value && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              )}
            </span>
            {option.text}
          </span>
        </button>
      ))}
    </div>
  );
}

function MultipleChoiceQuestion({ question, value, onChange }: QuestionRendererProps) {
  const options = question.options || [];
  const selectedValues = Array.isArray(value) ? value : [];
  
  const toggleOption = (optionValue: number) => {
    const newValues = selectedValues.includes(String(optionValue))
      ? selectedValues.filter((v) => v !== String(optionValue))
      : [...selectedValues, String(optionValue)];
    onChange(newValues);
  };
  
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isSelected = selectedValues.includes(String(option.value));
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleOption(option.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {isSelected && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </span>
              {option.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function QuestionRenderer(props: QuestionRendererProps) {
  const { question } = props;
  
  switch (question.type) {
    case 'likert':
      return <LikertQuestion {...props} />;
    case 'rating':
      return <RatingQuestion {...props} />;
    case 'yes_no':
      return <YesNoQuestion {...props} />;
    case 'text':
      return <TextQuestion {...props} />;
    case 'single_choice':
      return <SingleChoiceQuestion {...props} />;
    case 'multiple_choice':
      return <MultipleChoiceQuestion {...props} />;
    default:
      return <TextQuestion {...props} />;
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ResponderEvaluacionContent() {
  const {
    currentEvaluation,
    startNewEvaluation,
    updateCurrentResponse,
    updateCurrentComments,
    updateCurrentSuggestions,
    clearCurrentEvaluation,
  } = useEvalinStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState<Date>(new Date());

  // Inicializar evaluación demo
  useEffect(() => {
    if (!currentEvaluation) {
      startNewEvaluation(demoPeriod.id, demoInstructor.id, demoQuestionnaire.id);
    }
  }, [currentEvaluation, startNewEvaluation]);

  const questions = demoQuestionnaire.questions;
  const totalSteps = questions.length + 1; // +1 para comentarios finales
  const currentQuestion = questions[currentStep];

  // Obtener respuesta actual
  const getResponseValue = (questionId: string) => {
    return currentEvaluation?.responses.find((r) => r.questionId === questionId)?.value;
  };

  // Validar pregunta actual
  const isCurrentQuestionValid = () => {
    if (currentStep >= questions.length) return true; // Paso de comentarios
    
    const question = currentQuestion;
    if (!question.isRequired) return true;
    
    const value = getResponseValue(question.id);
    if (value === undefined || value === '') return false;
    
    if (question.type === 'text' && question.minLength) {
      return String(value).length >= question.minLength;
    }
    
    return true;
  };

  // Calcular progreso
  const answeredCount = currentEvaluation?.responses.length || 0;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  // Handlers
  const handleNext = () => {
    if (!isCurrentQuestionValid()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowErrors(false);
    }
  };

  const handleResponseChange = (value: string | number | string[]) => {
    if (currentQuestion) {
      updateCurrentResponse(currentQuestion.id, value);
    }
  };

  const handleSaveDraft = () => {
    // En producción, llamar a la API
    alert('Borrador guardado correctamente');
  };

  const handleSubmit = async () => {
    // Validar todas las preguntas requeridas
    const missingRequired = questions.filter((q) => {
      if (!q.isRequired) return false;
      const value = getResponseValue(q.id);
      return value === undefined || value === '';
    });

    if (missingRequired.length > 0) {
      alert(`Faltan ${missingRequired.length} preguntas obligatorias por responder`);
      return;
    }

    setIsSubmitting(true);
    
    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  // Calcular tiempo transcurrido
  const elapsedMinutes = Math.round((Date.now() - startTime.getTime()) / 60000);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Evaluación Enviada!
          </h1>
          <p className="text-gray-600 mb-6">
            Gracias por completar la evaluación del instructor {demoInstructor.name}.
            Sus respuestas han sido registradas de forma anónima.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Preguntas respondidas</span>
                <p className="font-semibold text-gray-900">{answeredCount} de {questions.length}</p>
              </div>
              <div>
                <span className="text-gray-500">Tiempo de respuesta</span>
                <p className="font-semibold text-gray-900">{elapsedMinutes} minutos</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              clearCurrentEvaluation();
              setSubmitted(false);
              setCurrentStep(0);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header con info del instructor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {demoInstructor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {demoInstructor.name}
            </h1>
            <p className="text-gray-600 mb-2">{demoInstructor.course}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                {demoInstructor.group}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {demoPeriod.name}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                ~{demoQuestionnaire.estimatedTimeMinutes} min
              </span>
            </div>
          </div>
          {demoQuestionnaire.anonymousResponses && (
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                <CheckCircle className="h-3 w-3" />
                Anónimo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Pregunta {Math.min(currentStep + 1, questions.length)} de {questions.length}
          </span>
          <span className="text-sm text-gray-500">{progressPercent}% completado</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-center gap-1 mt-3">
          {questions.map((q, i) => {
            const getStepColor = () => {
              if (i === currentStep) return 'bg-blue-500';
              if (i < currentStep) return 'bg-blue-300';
              return 'bg-gray-200';
            };
            return (
              <button
                key={q.id}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-colors ${getStepColor()}`}
                aria-label={`Pregunta ${i + 1}`}
              />
            );
          })}
          {/* Paso final - Comentarios */}
          {(() => {
            const getFinalStepColor = () => {
              if (currentStep === questions.length) return 'bg-blue-500';
              if (currentStep > questions.length) return 'bg-blue-300';
              return 'bg-gray-200';
            };
            return (
              <button
                key="final-step"
                onClick={() => setCurrentStep(questions.length)}
                className={`w-2 h-2 rounded-full transition-colors ${getFinalStepColor()}`}
                aria-label="Comentarios finales"
              />
            );
          })()}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {currentStep < questions.length ? (
          <>
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {currentStep + 1}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentQuestion.text}
                    {currentQuestion.isRequired && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h2>
                  {currentQuestion.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {currentQuestion.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                  {QUESTION_TYPE_CONFIG[currentQuestion.type].label}
                </span>
                {!currentQuestion.isRequired && (
                  <span className="text-gray-400">(Opcional)</span>
                )}
              </div>
            </div>

            <QuestionRenderer
              question={currentQuestion}
              value={getResponseValue(currentQuestion.id)}
              onChange={handleResponseChange}
            />

            {showErrors && !isCurrentQuestionValid() && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Esta pregunta es obligatoria. Por favor proporcione una respuesta.
              </div>
            )}
          </>
        ) : (
          // Paso final: Comentarios
          <div>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Comentarios Finales
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  ¿Desea agregar algún comentario adicional? (Opcional)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="general-comments" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios generales
                </label>
                <textarea
                  id="general-comments"
                  value={currentEvaluation?.generalComments || ''}
                  onChange={(e) => updateCurrentComments(e.target.value)}
                  placeholder="Comparta sus observaciones sobre el instructor..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="improvement-suggestions" className="block text-sm font-medium text-gray-700 mb-2">
                  Sugerencias de mejora
                </label>
                <textarea
                  id="improvement-suggestions"
                  value={currentEvaluation?.suggestions || ''}
                  onChange={(e) => updateCurrentSuggestions(e.target.value)}
                  placeholder="¿Qué sugerencias tiene para mejorar las clases?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Resumen de su evaluación:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{answeredCount} preguntas respondidas de {questions.length}</li>
                    <li>Tiempo transcurrido: {elapsedMinutes} minutos</li>
                    {demoQuestionnaire.anonymousResponses && (
                      <li>Sus respuestas serán anónimas</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <div className="flex items-center gap-2">
            {demoQuestionnaire.allowPartialSave && (
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                Guardar Borrador
              </button>
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Evaluación
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instructions (collapsed) */}
      {demoQuestionnaire.instructions && currentStep === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Instrucciones:</p>
              <p className="text-sm text-amber-700">{demoQuestionnaire.instructions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
