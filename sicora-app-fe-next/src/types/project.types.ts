/**
 * Tipos para ProjectEvalService
 * Evaluación de proyectos formativos
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export type ProjectStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'archived';
export type ProjectPhase = 'planning' | 'execution' | 'evaluation' | 'closure';
export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'under_review' | 'evaluated' | 'returned';
export type EvaluationStatus = 'pending' | 'in_progress' | 'completed' | 'appealed';
export type DeliverableType = 'document' | 'code' | 'presentation' | 'prototype' | 'video' | 'other';

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  active: { label: 'Activo', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  in_progress: { label: 'En Progreso', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  completed: { label: 'Completado', color: 'text-green-600', bgColor: 'bg-green-100' },
  archived: { label: 'Archivado', color: 'text-gray-500', bgColor: 'bg-gray-50' },
};

export const PROJECT_PHASE_CONFIG: Record<ProjectPhase, { label: string; color: string; bgColor: string; icon: string }> = {
  planning: { label: 'Planeación', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: 'clipboard' },
  execution: { label: 'Ejecución', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: 'play' },
  evaluation: { label: 'Evaluación', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: 'check-square' },
  closure: { label: 'Cierre', color: 'text-green-600', bgColor: 'bg-green-100', icon: 'flag' },
};

export const SUBMISSION_STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendiente', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  submitted: { label: 'Entregado', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  late: { label: 'Tardío', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  under_review: { label: 'En Revisión', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  evaluated: { label: 'Evaluado', color: 'text-green-600', bgColor: 'bg-green-100' },
  returned: { label: 'Devuelto', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const EVALUATION_STATUS_CONFIG: Record<EvaluationStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendiente', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  in_progress: { label: 'En Progreso', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  completed: { label: 'Completada', color: 'text-green-600', bgColor: 'bg-green-100' },
  appealed: { label: 'Apelada', color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

export const DELIVERABLE_TYPE_CONFIG: Record<DeliverableType, { label: string; icon: string; acceptedFormats: string[] }> = {
  document: { label: 'Documento', icon: 'file-text', acceptedFormats: ['.pdf', '.doc', '.docx', '.odt'] },
  code: { label: 'Código', icon: 'code', acceptedFormats: ['.zip', '.tar.gz', '.git'] },
  presentation: { label: 'Presentación', icon: 'presentation', acceptedFormats: ['.pptx', '.pdf', '.odp'] },
  prototype: { label: 'Prototipo', icon: 'box', acceptedFormats: ['.zip', '.fig', '.sketch'] },
  video: { label: 'Video', icon: 'video', acceptedFormats: ['.mp4', '.avi', '.mov', '.mkv'] },
  other: { label: 'Otro', icon: 'file', acceptedFormats: ['*'] },
};

// ============================================================================
// INTERFACES - PROYECTO
// ============================================================================

export interface ProjectTeamMember {
  id: string;
  studentId: string;
  studentName: string;
  role: 'leader' | 'member';
  assignedAt: string;
  responsibilities?: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  weight: number; // Percentage of total grade
  deliverables: string[]; // IDs of required deliverables
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  description: string;
  type: DeliverableType;
  isRequired: boolean;
  dueDate: string;
  weight: number; // Percentage of milestone/project grade
  maxFileSize?: number; // In MB
  rubricId?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  objectives: string[];
  programId: string;
  programName: string;
  groupId: string;
  groupName: string;
  competencies: string[]; // IDs of related competencies
  status: ProjectStatus;
  phase: ProjectPhase;
  startDate: string;
  endDate: string;
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  team: ProjectTeamMember[];
  instructorId: string;
  instructorName: string;
  evaluators?: Array<{ id: string; name: string; role: string }>;
  totalWeight: number; // Total percentage in final grade
  passingScore: number; // Minimum score to pass
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INTERFACES - ENTREGA
// ============================================================================

export interface SubmissionFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // In bytes
  mimeType: string;
  uploadedAt: string;
}

export interface SubmissionComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'instructor' | 'evaluator';
  createdAt: string;
  isPrivate: boolean;
}

export interface Submission {
  id: string;
  projectId: string;
  projectName: string;
  deliverableId: string;
  deliverableName: string;
  deliverableType: DeliverableType;
  studentId?: string;
  studentName?: string;
  teamId?: string;
  teamMembers?: Array<{ id: string; name: string }>;
  status: SubmissionStatus;
  files: SubmissionFile[];
  description?: string;
  submittedAt?: string;
  dueDate: string;
  isLate: boolean;
  lateDays?: number;
  latePenalty?: number; // Percentage deduction
  comments: SubmissionComment[];
  evaluationId?: string;
  score?: number;
  feedback?: string;
  returnReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INTERFACES - RÚBRICA
// ============================================================================

export interface RubricLevel {
  id: string;
  level: number; // 1-5 typically
  label: string; // e.g., "Excelente", "Bueno", "Aceptable", "Deficiente", "No cumple"
  description: string;
  score: number; // Points for this level
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage of total rubric score
  levels: RubricLevel[];
  maxScore: number;
}

export interface Rubric {
  id: string;
  name: string;
  description: string;
  competencyIds: string[];
  criteria: RubricCriteria[];
  totalMaxScore: number;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INTERFACES - EVALUACIÓN
// ============================================================================

export interface CriteriaEvaluation {
  criteriaId: string;
  criteriaName: string;
  selectedLevelId: string;
  selectedLevel: number;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  submission: {
    id: string;
    projectName: string;
    deliverableName: string;
    studentName?: string;
    teamMembers?: Array<{ id: string; name: string }>;
    submittedAt: string;
  };
  rubricId: string;
  rubric: {
    id: string;
    name: string;
    totalMaxScore: number;
  };
  evaluatorId: string;
  evaluatorName: string;
  status: EvaluationStatus;
  criteriaEvaluations: CriteriaEvaluation[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  latePenaltyApplied: number;
  finalScore: number;
  generalFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  evaluatedAt?: string;
  appealId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INTERFACES - DASHBOARD
// ============================================================================

export interface ProjectDashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingSubmissions: number;
  pendingEvaluations: number;
  lateSubmissions: number;
  averageScore: number;
  passingRate: number;
  projectsByPhase: Record<ProjectPhase, number>;
  submissionsByStatus: Record<SubmissionStatus, number>;
  upcomingDeadlines: Array<{
    projectId: string;
    projectName: string;
    deliverableName: string;
    dueDate: string;
    daysRemaining: number;
  }>;
  recentEvaluations: Array<{
    id: string;
    studentName: string;
    projectName: string;
    score: number;
    evaluatedAt: string;
  }>;
}

// ============================================================================
// DTOs - REQUEST/RESPONSE
// ============================================================================

export interface CreateProjectRequest {
  name: string;
  code: string;
  description: string;
  objectives: string[];
  programId: string;
  groupId: string;
  competencies: string[];
  startDate: string;
  endDate: string;
  instructorId: string;
  totalWeight: number;
  passingScore: number;
  milestones?: Omit<ProjectMilestone, 'id' | 'status' | 'completedAt'>[];
  deliverables?: Omit<ProjectDeliverable, 'id'>[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  objectives?: string[];
  competencies?: string[];
  status?: ProjectStatus;
  phase?: ProjectPhase;
  endDate?: string;
  passingScore?: number;
}

export interface AddTeamMemberRequest {
  studentId: string;
  role: 'leader' | 'member';
  responsibilities?: string;
}

export interface AddMilestoneRequest {
  name: string;
  description: string;
  dueDate: string;
  weight: number;
  deliverables: string[];
}

export interface AddDeliverableRequest {
  name: string;
  description: string;
  type: DeliverableType;
  isRequired: boolean;
  dueDate: string;
  weight: number;
  maxFileSize?: number;
  rubricId?: string;
}

export interface CreateSubmissionRequest {
  projectId: string;
  deliverableId: string;
  description?: string;
}

export interface SubmitFilesRequest {
  files: File[];
}

export interface CreateEvaluationRequest {
  submissionId: string;
  rubricId: string;
}

export interface SaveEvaluationRequest {
  criteriaEvaluations: Array<{
    criteriaId: string;
    selectedLevelId: string;
    feedback?: string;
  }>;
  generalFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  applyLatePenalty: boolean;
}

export interface CreateRubricRequest {
  name: string;
  description: string;
  competencyIds: string[];
  criteria: Array<{
    name: string;
    description: string;
    weight: number;
    levels: Array<{
      level: number;
      label: string;
      description: string;
      score: number;
    }>;
  }>;
}

export interface ReturnSubmissionRequest {
  reason: string;
  comments: string;
}

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  phase?: ProjectPhase;
  programId?: string;
  groupId?: string;
  instructorId?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface SubmissionFilters {
  search?: string;
  status?: SubmissionStatus;
  projectId?: string;
  deliverableId?: string;
  studentId?: string;
  isLate?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface EvaluationFilters {
  search?: string;
  status?: EvaluationStatus;
  projectId?: string;
  evaluatorId?: string;
  minScore?: number;
  maxScore?: number;
  passed?: boolean;
  evaluatedFrom?: string;
  evaluatedTo?: string;
}

export const INITIAL_PROJECT_FILTERS: ProjectFilters = {
  search: '',
  status: undefined,
  phase: undefined,
  programId: undefined,
  groupId: undefined,
  instructorId: undefined,
};

export const INITIAL_SUBMISSION_FILTERS: SubmissionFilters = {
  search: '',
  status: undefined,
  projectId: undefined,
  isLate: undefined,
};

export const INITIAL_EVALUATION_FILTERS: EvaluationFilters = {
  search: '',
  status: undefined,
  projectId: undefined,
  passed: undefined,
};

// ============================================================================
// PAGINACIÓN
// ============================================================================

export interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedSubmissions {
  items: Submission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedEvaluations {
  items: Evaluation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedRubrics {
  items: Rubric[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
