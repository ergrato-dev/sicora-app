/**
 * Tipos para el módulo de Evaluaciones
 * Sistema de rúbricas y calificación por competencias
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export type EvaluationType = 
  | 'knowledge'      // Conocimiento - saber
  | 'performance'    // Desempeño - saber hacer
  | 'product'        // Producto - evidencia
  | 'attitude';      // Actitud - saber ser

export type EvaluationStatus = 
  | 'draft'          // Borrador
  | 'scheduled'      // Programada
  | 'in_progress'    // En curso
  | 'completed'      // Completada
  | 'cancelled';     // Cancelada

export type CompetencyLevel = 
  | 'not_achieved'   // No logrado
  | 'in_progress'    // En proceso
  | 'achieved'       // Logrado
  | 'exceeded';      // Superado

export type ScoreScale = 
  | 'numeric'        // 0-100
  | 'competency'     // Logrado/No logrado
  | 'letters'        // A, B, C, D, E
  | 'descriptive';   // Excelente, Bueno, Regular, Deficiente

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Criterio de evaluación dentro de una rúbrica
 */
export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;              // Porcentaje 0-100
  maxScore: number;
  levels: CriteriaLevel[];
  learningOutcomeId?: string;  // Resultado de aprendizaje asociado
}

/**
 * Nivel de logro para un criterio
 */
export interface CriteriaLevel {
  id: string;
  name: string;
  description: string;
  minScore: number;
  maxScore: number;
  competencyLevel: CompetencyLevel;
}

/**
 * Rúbrica de evaluación
 */
export interface Rubric {
  id: string;
  name: string;
  description?: string;
  competencyId: string;
  competencyName: string;
  criteria: EvaluationCriteria[];
  scoreScale: ScoreScale;
  passingScore: number;        // Puntaje mínimo para aprobar
  isTemplate: boolean;         // Si es plantilla reutilizable
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Evaluación programada o realizada
 */
export interface Evaluation {
  id: string;
  name: string;
  description?: string;
  type: EvaluationType;
  status: EvaluationStatus;
  rubricId: string;
  rubric?: Rubric;
  
  // Contexto académico
  programId: string;
  programName: string;
  groupId: string;
  groupName: string;
  competencyId: string;
  competencyName: string;
  learningOutcomeIds: string[];
  
  // Programación
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;           // Minutos
  location?: string;
  
  // Configuración
  maxAttempts: number;
  allowLateSubmission: boolean;
  lateSubmissionPenalty?: number;
  instructions?: string;
  resources?: EvaluationResource[];
  
  // Resultados agregados
  totalStudents: number;
  evaluatedCount: number;
  averageScore?: number;
  passRate?: number;
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  instructorId: string;
  instructorName: string;
}

/**
 * Recurso adjunto a una evaluación
 */
export interface EvaluationResource {
  id: string;
  name: string;
  type: 'document' | 'link' | 'video' | 'image';
  url: string;
  description?: string;
}

/**
 * Calificación de un estudiante
 */
export interface StudentScore {
  id: string;
  evaluationId: string;
  studentId: string;
  studentName: string;
  studentDocument: string;
  
  // Puntuación
  totalScore: number;
  percentage: number;
  competencyLevel: CompetencyLevel;
  passed: boolean;
  
  // Detalle por criterio
  criteriaScores: CriteriaScore[];
  
  // Feedback
  feedback?: string;
  strengthAreas?: string[];
  improvementAreas?: string[];
  
  // Control
  attemptNumber: number;
  submittedAt?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
  isLateSubmission: boolean;
}

/**
 * Puntuación por criterio individual
 */
export interface CriteriaScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
  percentage: number;
  levelAchieved: string;
  competencyLevel: CompetencyLevel;
  feedback?: string;
}

/**
 * Resumen de competencia del estudiante
 */
export interface StudentCompetencySummary {
  studentId: string;
  studentName: string;
  competencyId: string;
  competencyName: string;
  evaluationsCount: number;
  averageScore: number;
  currentLevel: CompetencyLevel;
  progressHistory: CompetencyProgress[];
  strengths: string[];
  areasToImprove: string[];
}

/**
 * Progreso histórico de competencia
 */
export interface CompetencyProgress {
  evaluationId: string;
  evaluationName: string;
  date: string;
  score: number;
  level: CompetencyLevel;
}

// ============================================================================
// DTOs PARA API
// ============================================================================

/**
 * Crear nueva rúbrica
 */
export interface CreateRubricRequest {
  name: string;
  description?: string;
  competencyId: string;
  criteria: Omit<EvaluationCriteria, 'id'>[];
  scoreScale: ScoreScale;
  passingScore: number;
  isTemplate?: boolean;
}

/**
 * Actualizar rúbrica
 */
export interface UpdateRubricRequest extends Partial<CreateRubricRequest> {
  id: string;
}

/**
 * Crear nueva evaluación
 */
export interface CreateEvaluationRequest {
  name: string;
  description?: string;
  type: EvaluationType;
  rubricId: string;
  programId: string;
  groupId: string;
  competencyId: string;
  learningOutcomeIds: string[];
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  location?: string;
  maxAttempts?: number;
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
  instructions?: string;
}

/**
 * Actualizar evaluación
 */
export interface UpdateEvaluationRequest extends Partial<CreateEvaluationRequest> {
  id: string;
  status?: EvaluationStatus;
}

/**
 * Registrar calificación de estudiante
 */
export interface SubmitScoreRequest {
  evaluationId: string;
  studentId: string;
  criteriaScores: {
    criteriaId: string;
    score: number;
    feedback?: string;
  }[];
  feedback?: string;
  strengthAreas?: string[];
  improvementAreas?: string[];
}

/**
 * Calificación masiva
 */
export interface BulkScoreRequest {
  evaluationId: string;
  scores: Omit<SubmitScoreRequest, 'evaluationId'>[];
}

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

export interface ListEvaluationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: EvaluationType;
  status?: EvaluationStatus;
  programId?: string;
  groupId?: string;
  competencyId?: string;
  instructorId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'scheduledDate' | 'name' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ListRubricsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  competencyId?: string;
  isTemplate?: boolean;
  createdBy?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListScoresParams {
  evaluationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  passed?: boolean;
  competencyLevel?: CompetencyLevel;
  sortBy?: 'studentName' | 'totalScore' | 'submittedAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// RESPUESTAS PAGINADAS
// ============================================================================

export interface PaginatedEvaluations {
  data: Evaluation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedRubrics {
  data: Rubric[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedScores {
  data: StudentScore[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    averageScore: number;
    passRate: number;
    levelDistribution: Record<CompetencyLevel, number>;
  };
}

// ============================================================================
// ESTADÍSTICAS Y REPORTES
// ============================================================================

export interface EvaluationStats {
  totalEvaluations: number;
  byStatus: Record<EvaluationStatus, number>;
  byType: Record<EvaluationType, number>;
  completionRate: number;
  averagePassRate: number;
  upcomingCount: number;
  overdueCount: number;
}

export interface GroupEvaluationReport {
  groupId: string;
  groupName: string;
  programId: string;
  programName: string;
  evaluationsCount: number;
  averageScore: number;
  passRate: number;
  competencyProgress: {
    competencyId: string;
    competencyName: string;
    averageLevel: CompetencyLevel;
    studentsAchieved: number;
    totalStudents: number;
  }[];
  topPerformers: {
    studentId: string;
    studentName: string;
    averageScore: number;
  }[];
  needsSupport: {
    studentId: string;
    studentName: string;
    averageScore: number;
    competenciesAtRisk: string[];
  }[];
}

export interface StudentEvaluationReport {
  studentId: string;
  studentName: string;
  studentDocument: string;
  programId: string;
  programName: string;
  groupId: string;
  groupName: string;
  overallProgress: number;
  competencies: StudentCompetencySummary[];
  recentEvaluations: {
    id: string;
    name: string;
    type: EvaluationType;
    date: string;
    score: number;
    level: CompetencyLevel;
    passed: boolean;
  }[];
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
}
