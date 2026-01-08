/**
 * Tipos para EvalinService - Evaluación de Instructores
 * Sistema de evaluación de desempeño de instructores
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export type QuestionType =
  | 'rating'           // Escala 1-5 o 1-10
  | 'likert'           // Muy en desacuerdo a Muy de acuerdo
  | 'text'             // Respuesta abierta
  | 'multiple_choice'  // Selección múltiple
  | 'single_choice'    // Selección única
  | 'yes_no'           // Sí/No
  | 'matrix';          // Matriz de opciones

export type EvaluationStatus =
  | 'draft'            // Borrador
  | 'pending'          // Pendiente de responder
  | 'in_progress'      // En progreso
  | 'completed'        // Completada
  | 'cancelled';       // Cancelada

export type PeriodStatus =
  | 'draft'            // Borrador
  | 'scheduled'        // Programado
  | 'active'           // Activo
  | 'closed'           // Cerrado
  | 'archived';        // Archivado

export type QuestionnaireStatus =
  | 'draft'            // Borrador
  | 'active'           // Activo (disponible para usar)
  | 'inactive'         // Inactivo
  | 'archived';        // Archivado

export type EvaluatorRole =
  | 'student'          // Estudiante evalúa instructor
  | 'peer'             // Instructor evalúa instructor
  | 'coordinator'      // Coordinador evalúa instructor
  | 'self';            // Autoevaluación

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Categoría de preguntas
 */
export interface QuestionCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  weight: number;           // Peso en la calificación final (0-100)
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Opción de respuesta para preguntas de selección
 */
export interface QuestionOption {
  id: string;
  text: string;
  value: number;            // Valor numérico para cálculos
  order: number;
}

/**
 * Pregunta de evaluación
 */
export interface Question {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  categoryId: string;
  category?: QuestionCategory;
  
  // Configuración de respuesta
  isRequired: boolean;
  options?: QuestionOption[];   // Para choice/likert
  minValue?: number;            // Para rating
  maxValue?: number;            // Para rating
  minLength?: number;           // Para text
  maxLength?: number;           // Para text
  
  // Para matriz
  matrixRows?: string[];
  matrixColumns?: QuestionOption[];
  
  // Orden y estado
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cuestionario de evaluación
 */
export interface Questionnaire {
  id: string;
  name: string;
  description?: string;
  instructions?: string;       // Instrucciones para el evaluador
  
  // Configuración
  status: QuestionnaireStatus;
  evaluatorRole: EvaluatorRole;
  estimatedTimeMinutes: number;
  allowPartialSave: boolean;
  anonymousResponses: boolean;
  
  // Contenido
  categories: QuestionCategory[];
  questions: Question[];
  totalQuestions: number;
  
  // Metadatos
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Período de evaluación
 */
export interface EvaluationPeriod {
  id: string;
  name: string;
  description?: string;
  
  // Fechas
  startDate: string;
  endDate: string;
  
  // Estado
  status: PeriodStatus;
  
  // Cuestionario asignado
  questionnaireId: string;
  questionnaire?: Questionnaire;
  
  // Alcance
  programIds?: string[];       // Programas incluidos (null = todos)
  groupIds?: string[];         // Grupos incluidos
  instructorIds?: string[];    // Instructores a evaluar
  
  // Estadísticas
  totalEvaluations: number;
  completedEvaluations: number;
  completionRate: number;
  
  // Metadatos
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta individual a una pregunta
 */
export interface QuestionResponse {
  questionId: string;
  value: string | number | string[];  // Depende del tipo de pregunta
  textResponse?: string;              // Para preguntas de texto
  matrixResponses?: Record<string, number>;  // Para preguntas matriz
}

/**
 * Evaluación completa de un instructor
 */
export interface InstructorEvaluation {
  id: string;
  
  // Período y cuestionario
  periodId: string;
  period?: EvaluationPeriod;
  questionnaireId: string;
  questionnaire?: Questionnaire;
  
  // Participantes
  instructorId: string;
  instructorName: string;
  evaluatorId: string;
  evaluatorName?: string;        // null si es anónima
  evaluatorRole: EvaluatorRole;
  
  // Contexto
  groupId?: string;
  groupName?: string;
  courseId?: string;
  courseName?: string;
  
  // Estado
  status: EvaluationStatus;
  startedAt?: string;
  completedAt?: string;
  
  // Respuestas
  responses: QuestionResponse[];
  
  // Resultados
  categoryScores?: Record<string, number>;  // Puntaje por categoría
  totalScore?: number;                      // Puntaje total
  
  // Comentarios generales
  generalComments?: string;
  suggestions?: string;
  
  // Metadatos
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resumen de evaluación de un instructor
 */
export interface InstructorEvaluationSummary {
  instructorId: string;
  instructorName: string;
  periodId: string;
  periodName: string;
  
  // Estadísticas de respuestas
  totalEvaluations: number;
  completedEvaluations: number;
  responseRate: number;
  
  // Puntajes
  overallScore: number;           // Promedio general (0-5 o 0-10)
  categoryScores: {
    categoryId: string;
    categoryName: string;
    averageScore: number;
    responseCount: number;
  }[];
  
  // Distribución de calificaciones
  scoreDistribution: {
    score: number;
    count: number;
    percentage: number;
  }[];
  
  // Tendencias (comparación con período anterior)
  trend?: {
    previousScore: number;
    change: number;
    changePercentage: number;
  };
  
  // Fortalezas y áreas de mejora
  strengths: string[];
  areasForImprovement: string[];
  
  // Comentarios destacados (anónimos)
  highlightedComments: string[];
}

/**
 * Reporte de período de evaluación
 */
export interface PeriodReport {
  periodId: string;
  periodName: string;
  startDate: string;
  endDate: string;
  
  // Estadísticas generales
  totalInstructors: number;
  totalEvaluations: number;
  completedEvaluations: number;
  averageCompletionRate: number;
  
  // Puntajes globales
  globalAverageScore: number;
  categoryAverages: {
    categoryId: string;
    categoryName: string;
    averageScore: number;
  }[];
  
  // Rankings
  topInstructors: {
    instructorId: string;
    instructorName: string;
    score: number;
    evaluationCount: number;
  }[];
  
  instructorsNeedingSupport: {
    instructorId: string;
    instructorName: string;
    score: number;
    mainConcerns: string[];
  }[];
  
  // Distribución de puntajes
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  
  // Generado
  generatedAt: string;
}

/**
 * Configuración del sistema de evaluaciones
 */
export interface EvalinConfig {
  // Escala de calificación
  ratingScale: {
    min: number;
    max: number;
    passingScore: number;
  };
  
  // Anonimato
  defaultAnonymous: boolean;
  allowAnonymousToggle: boolean;
  
  // Recordatorios
  reminderDaysBefore: number;
  reminderFrequency: 'daily' | 'weekly' | 'none';
  
  // Resultados
  showResultsToInstructor: boolean;
  showCommentsToInstructor: boolean;
  minimumResponsesForResults: number;
  
  // Fechas
  gracePeriodDays: number;       // Días adicionales después de cerrar
  
  // Notificaciones
  notifyOnPeriodStart: boolean;
  notifyOnCompletion: boolean;
  notifyLowScores: boolean;
  lowScoreThreshold: number;
}

// ============================================================================
// DTOs PARA API
// ============================================================================

/**
 * Crear categoría de preguntas
 */
export interface CreateQuestionCategoryRequest {
  name: string;
  description?: string;
  order?: number;
  weight: number;
  isRequired?: boolean;
}

/**
 * Crear pregunta
 */
export interface CreateQuestionRequest {
  text: string;
  description?: string;
  type: QuestionType;
  categoryId: string;
  isRequired?: boolean;
  options?: Omit<QuestionOption, 'id'>[];
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  matrixRows?: string[];
  matrixColumns?: Omit<QuestionOption, 'id'>[];
  order?: number;
}

/**
 * Actualizar pregunta
 */
export interface UpdateQuestionRequest {
  text?: string;
  description?: string;
  isRequired?: boolean;
  options?: Omit<QuestionOption, 'id'>[];
  order?: number;
  isActive?: boolean;
}

/**
 * Crear cuestionario
 */
export interface CreateQuestionnaireRequest {
  name: string;
  description?: string;
  instructions?: string;
  evaluatorRole: EvaluatorRole;
  estimatedTimeMinutes?: number;
  allowPartialSave?: boolean;
  anonymousResponses?: boolean;
  categoryIds?: string[];
  questionIds?: string[];
}

/**
 * Actualizar cuestionario
 */
export interface UpdateQuestionnaireRequest {
  name?: string;
  description?: string;
  instructions?: string;
  status?: QuestionnaireStatus;
  estimatedTimeMinutes?: number;
  allowPartialSave?: boolean;
  anonymousResponses?: boolean;
}

/**
 * Crear período de evaluación
 */
export interface CreateEvaluationPeriodRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  questionnaireId: string;
  programIds?: string[];
  groupIds?: string[];
  instructorIds?: string[];
}

/**
 * Actualizar período de evaluación
 */
export interface UpdateEvaluationPeriodRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  questionnaireId?: string;
}

/**
 * Enviar respuestas de evaluación
 */
export interface SubmitEvaluationRequest {
  periodId: string;
  instructorId: string;
  groupId?: string;
  responses: QuestionResponse[];
  generalComments?: string;
  suggestions?: string;
  isDraft?: boolean;
}

/**
 * Comentario adicional
 */
export interface AddCommentRequest {
  evaluationId: string;
  content: string;
  isPrivate?: boolean;
}

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

export interface ListQuestionsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  type?: QuestionType;
  isActive?: boolean;
  sortBy?: 'order' | 'createdAt' | 'text';
  sortOrder?: 'asc' | 'desc';
}

export interface ListQuestionnairesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: QuestionnaireStatus;
  evaluatorRole?: EvaluatorRole;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListPeriodsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PeriodStatus;
  year?: number;
  sortBy?: 'startDate' | 'endDate' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ListEvaluationsParams {
  page?: number;
  pageSize?: number;
  periodId?: string;
  instructorId?: string;
  evaluatorId?: string;
  status?: EvaluationStatus;
  groupId?: string;
  sortBy?: 'createdAt' | 'completedAt' | 'totalScore';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedQuestions {
  data: Question[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedQuestionnaires {
  data: Questionnaire[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedPeriods {
  data: EvaluationPeriod[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedEvaluations {
  data: InstructorEvaluation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// CONFIGURACIÓN DE TIPOS
// ============================================================================

export const QUESTION_TYPE_CONFIG: Record<QuestionType, {
  label: string;
  description: string;
  icon: string;
  hasOptions: boolean;
}> = {
  rating: {
    label: 'Escala de calificación',
    description: 'Respuesta numérica en una escala definida',
    icon: 'Star',
    hasOptions: false,
  },
  likert: {
    label: 'Escala Likert',
    description: 'De muy en desacuerdo a muy de acuerdo',
    icon: 'BarChart',
    hasOptions: true,
  },
  text: {
    label: 'Texto libre',
    description: 'Respuesta abierta de texto',
    icon: 'FileText',
    hasOptions: false,
  },
  multiple_choice: {
    label: 'Opción múltiple',
    description: 'Seleccionar varias opciones',
    icon: 'CheckSquare',
    hasOptions: true,
  },
  single_choice: {
    label: 'Opción única',
    description: 'Seleccionar una sola opción',
    icon: 'Circle',
    hasOptions: true,
  },
  yes_no: {
    label: 'Sí / No',
    description: 'Pregunta binaria',
    icon: 'ToggleLeft',
    hasOptions: false,
  },
  matrix: {
    label: 'Matriz',
    description: 'Tabla de opciones',
    icon: 'Grid',
    hasOptions: true,
  },
};

export const EVALUATION_STATUS_CONFIG: Record<EvaluationStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft: {
    label: 'Borrador',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  pending: {
    label: 'Pendiente',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  in_progress: {
    label: 'En progreso',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  completed: {
    label: 'Completada',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

export const PERIOD_STATUS_CONFIG: Record<PeriodStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  draft: {
    label: 'Borrador',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'FileEdit',
  },
  scheduled: {
    label: 'Programado',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'Calendar',
  },
  active: {
    label: 'Activo',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'Play',
  },
  closed: {
    label: 'Cerrado',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: 'Lock',
  },
  archived: {
    label: 'Archivado',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    icon: 'Archive',
  },
};

export const EVALUATOR_ROLE_CONFIG: Record<EvaluatorRole, {
  label: string;
  description: string;
  icon: string;
}> = {
  student: {
    label: 'Estudiante',
    description: 'Evaluación del estudiante al instructor',
    icon: 'GraduationCap',
  },
  peer: {
    label: 'Par (Instructor)',
    description: 'Evaluación entre instructores',
    icon: 'Users',
  },
  coordinator: {
    label: 'Coordinador',
    description: 'Evaluación del coordinador',
    icon: 'UserCog',
  },
  self: {
    label: 'Autoevaluación',
    description: 'El instructor se evalúa a sí mismo',
    icon: 'User',
  },
};

export const LIKERT_OPTIONS: QuestionOption[] = [
  { id: '1', text: 'Muy en desacuerdo', value: 1, order: 1 },
  { id: '2', text: 'En desacuerdo', value: 2, order: 2 },
  { id: '3', text: 'Neutral', value: 3, order: 3 },
  { id: '4', text: 'De acuerdo', value: 4, order: 4 },
  { id: '5', text: 'Muy de acuerdo', value: 5, order: 5 },
];
