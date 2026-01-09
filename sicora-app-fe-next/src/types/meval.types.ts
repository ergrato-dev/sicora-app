/**
 * Tipos para MevalService - Evaluación de Medidas y Sanciones
 * Sistema de gestión disciplinaria de estudiantes
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

/**
 * Estado del caso de estudiante
 */
export type CaseStatus = 
  | 'open'           // Caso abierto/nuevo
  | 'under_review'   // En revisión por comité
  | 'pending_plan'   // Pendiente plan de mejora
  | 'in_progress'    // Plan en progreso
  | 'pending_sanction' // Pendiente aplicar sanción
  | 'sanctioned'     // Sanción aplicada
  | 'appealed'       // En apelación
  | 'resolved'       // Resuelto
  | 'closed';        // Cerrado

/**
 * Configuración UI para estados de caso
 */
export const CASE_STATUS_CONFIG: Record<CaseStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  open: { label: 'Abierto', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: 'FolderOpen' },
  under_review: { label: 'En Revisión', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: 'Search' },
  pending_plan: { label: 'Pendiente Plan', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: 'ClipboardList' },
  in_progress: { label: 'En Progreso', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: 'Clock' },
  pending_sanction: { label: 'Pendiente Sanción', color: 'text-red-600', bgColor: 'bg-red-100', icon: 'AlertTriangle' },
  sanctioned: { label: 'Sancionado', color: 'text-red-700', bgColor: 'bg-red-200', icon: 'Ban' },
  appealed: { label: 'En Apelación', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: 'Scale' },
  resolved: { label: 'Resuelto', color: 'text-green-600', bgColor: 'bg-green-100', icon: 'CheckCircle' },
  closed: { label: 'Cerrado', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: 'XCircle' },
};

/**
 * Tipo de comité
 */
export type CommitteeType = 
  | 'disciplinary'    // Comité disciplinario
  | 'academic'        // Comité académico
  | 'welfare'         // Comité de bienestar
  | 'special';        // Comité especial

export const COMMITTEE_TYPE_CONFIG: Record<CommitteeType, { label: string; color: string; description: string }> = {
  disciplinary: { label: 'Disciplinario', color: 'text-red-600', description: 'Evalúa faltas disciplinarias' },
  academic: { label: 'Académico', color: 'text-blue-600', description: 'Evalúa rendimiento académico' },
  welfare: { label: 'Bienestar', color: 'text-green-600', description: 'Evalúa situaciones de bienestar' },
  special: { label: 'Especial', color: 'text-purple-600', description: 'Casos especiales' },
};

/**
 * Tipo de falta
 */
export type FaultType = 
  | 'minor'          // Falta leve
  | 'moderate'       // Falta moderada
  | 'serious'        // Falta grave
  | 'very_serious';  // Falta muy grave

export const FAULT_TYPE_CONFIG: Record<FaultType, { label: string; color: string; bgColor: string; maxSanction: string }> = {
  minor: { label: 'Leve', color: 'text-yellow-600', bgColor: 'bg-yellow-100', maxSanction: 'Amonestación verbal' },
  moderate: { label: 'Moderada', color: 'text-orange-600', bgColor: 'bg-orange-100', maxSanction: 'Amonestación escrita' },
  serious: { label: 'Grave', color: 'text-red-600', bgColor: 'bg-red-100', maxSanction: 'Suspensión temporal' },
  very_serious: { label: 'Muy Grave', color: 'text-red-700', bgColor: 'bg-red-200', maxSanction: 'Cancelación de matrícula' },
};

/**
 * Estado de sanción
 */
export type SanctionStatus = 
  | 'pending'        // Pendiente de aplicar
  | 'active'         // Sanción activa
  | 'completed'      // Sanción cumplida
  | 'cancelled'      // Sanción cancelada
  | 'suspended';     // Sanción suspendida (por apelación)

export const SANCTION_STATUS_CONFIG: Record<SanctionStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  active: { label: 'Activa', color: 'text-red-600', bgColor: 'bg-red-100' },
  completed: { label: 'Cumplida', color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelada', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  suspended: { label: 'Suspendida', color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

/**
 * Tipo de sanción
 */
export type SanctionType = 
  | 'verbal_warning'       // Amonestación verbal
  | 'written_warning'      // Amonestación escrita
  | 'conditional_enrollment' // Matrícula condicional
  | 'temporary_suspension' // Suspensión temporal
  | 'definitive_suspension' // Suspensión definitiva
  | 'enrollment_cancellation'; // Cancelación de matrícula

export const SANCTION_TYPE_CONFIG: Record<SanctionType, { label: string; color: string; severity: number; description: string }> = {
  verbal_warning: { label: 'Amonestación Verbal', color: 'text-yellow-600', severity: 1, description: 'Llamado de atención verbal' },
  written_warning: { label: 'Amonestación Escrita', color: 'text-orange-500', severity: 2, description: 'Constancia escrita en historial' },
  conditional_enrollment: { label: 'Matrícula Condicional', color: 'text-orange-600', severity: 3, description: 'Continuidad condicionada' },
  temporary_suspension: { label: 'Suspensión Temporal', color: 'text-red-500', severity: 4, description: 'Suspensión por tiempo determinado' },
  definitive_suspension: { label: 'Suspensión Definitiva', color: 'text-red-600', severity: 5, description: 'Suspensión permanente' },
  enrollment_cancellation: { label: 'Cancelación Matrícula', color: 'text-red-700', severity: 6, description: 'Retiro definitivo del programa' },
};

/**
 * Estado de apelación
 */
export type AppealStatus = 
  | 'pending'        // Pendiente de revisión
  | 'under_review'   // En revisión
  | 'approved'       // Apelación aprobada
  | 'partially_approved' // Parcialmente aprobada
  | 'rejected';      // Apelación rechazada

export const APPEAL_STATUS_CONFIG: Record<AppealStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  under_review: { label: 'En Revisión', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  approved: { label: 'Aprobada', color: 'text-green-600', bgColor: 'bg-green-100' },
  partially_approved: { label: 'Parcialmente Aprobada', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  rejected: { label: 'Rechazada', color: 'text-red-600', bgColor: 'bg-red-100' },
};

/**
 * Estado del plan de mejora
 */
export type ImprovementPlanStatus = 
  | 'draft'          // Borrador
  | 'active'         // Plan activo
  | 'in_progress'    // En seguimiento
  | 'completed'      // Completado exitosamente
  | 'failed'         // No cumplido
  | 'cancelled';     // Cancelado

export const IMPROVEMENT_PLAN_STATUS_CONFIG: Record<ImprovementPlanStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  active: { label: 'Activo', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  in_progress: { label: 'En Progreso', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  completed: { label: 'Completado', color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { label: 'No Cumplido', color: 'text-red-600', bgColor: 'bg-red-100' },
  cancelled: { label: 'Cancelado', color: 'text-gray-500', bgColor: 'bg-gray-50' },
};

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Miembro de comité
 */
export interface CommitteeMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'president' | 'secretary' | 'member' | 'guest';
  position?: string;
  department?: string;
  isActive: boolean;
  joinedAt: string;
}

/**
 * Comité evaluador
 */
export interface Committee {
  id: string;
  name: string;
  type: CommitteeType;
  description?: string;
  centerId: string;
  centerName?: string;
  members: CommitteeMember[];
  meetingSchedule?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Información básica del estudiante (embebido en caso)
 */
export interface StudentInfo {
  id: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  programId: string;
  programName: string;
  groupId: string;
  groupName: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
}

/**
 * Evidencia del caso
 */
export interface CaseEvidence {
  id: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'testimony' | 'other';
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string;
}

/**
 * Historial de acciones del caso
 */
export interface CaseHistory {
  id: string;
  action: string;
  description: string;
  previousStatus?: CaseStatus;
  newStatus?: CaseStatus;
  performedBy: string;
  performedByName?: string;
  performedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Caso de estudiante
 */
export interface StudentCase {
  id: string;
  caseNumber: string;
  student: StudentInfo;
  committeeId: string;
  committee?: Committee;
  
  // Detalles del caso
  title: string;
  description: string;
  faultType: FaultType;
  faultDate: string;
  reportedBy: string;
  reportedByName?: string;
  reportedAt: string;
  
  // Estado y seguimiento
  status: CaseStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  isOverdue: boolean;
  
  // Decisión del comité
  committeeDecision?: string;
  decisionDate?: string;
  decisionBy?: string;
  decisionByName?: string;
  
  // Relaciones
  evidences: CaseEvidence[];
  history: CaseHistory[];
  improvementPlanId?: string;
  sanctionIds: string[];
  appealIds: string[];
  
  // Metadatos
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Objetivo del plan de mejora
 */
export interface PlanObjective {
  id: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt?: string;
  evidence?: string;
  feedback?: string;
}

/**
 * Seguimiento del plan de mejora
 */
export interface PlanFollowUp {
  id: string;
  date: string;
  type: 'meeting' | 'report' | 'observation' | 'other';
  description: string;
  progress: number; // 0-100
  objectivesReviewed: string[];
  recommendations?: string;
  conductedBy: string;
  conductedByName?: string;
  nextFollowUpDate?: string;
}

/**
 * Plan de mejora
 */
export interface ImprovementPlan {
  id: string;
  studentCaseId: string;
  studentCase?: StudentCase;
  student: StudentInfo;
  
  // Contenido del plan
  title: string;
  description: string;
  objectives: PlanObjective[];
  
  // Fechas y duración
  startDate: string;
  endDate: string;
  durationDays: number;
  
  // Estado y progreso
  status: ImprovementPlanStatus;
  overallProgress: number; // 0-100
  
  // Responsables
  supervisorId: string;
  supervisorName?: string;
  mentorId?: string;
  mentorName?: string;
  
  // Seguimiento
  followUps: PlanFollowUp[];
  lastFollowUpDate?: string;
  nextFollowUpDate?: string;
  
  // Resultado
  finalEvaluation?: string;
  completedAt?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Sanción
 */
export interface Sanction {
  id: string;
  studentCaseId: string;
  studentCase?: StudentCase;
  student: StudentInfo;
  
  // Tipo y descripción
  type: SanctionType;
  description: string;
  legalBasis?: string;
  
  // Fechas
  startDate: string;
  endDate?: string;
  durationDays?: number;
  
  // Estado
  status: SanctionStatus;
  
  // Aplicación
  appliedBy: string;
  appliedByName?: string;
  appliedAt: string;
  
  // Finalización
  completedAt?: string;
  completedBy?: string;
  completionNotes?: string;
  
  // Notificaciones
  studentNotifiedAt?: string;
  parentNotifiedAt?: string;
  notificationMethod?: 'email' | 'physical' | 'both';
  
  // Apelación
  appealId?: string;
  isAppealed: boolean;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Argumento de apelación
 */
export interface AppealArgument {
  id: string;
  type: 'procedural' | 'substantive' | 'mitigating' | 'evidence' | 'other';
  description: string;
  supportingEvidence?: string[];
}

/**
 * Apelación
 */
export interface Appeal {
  id: string;
  studentCaseId: string;
  studentCase?: StudentCase;
  sanctionId: string;
  sanction?: Sanction;
  student: StudentInfo;
  
  // Contenido
  title: string;
  grounds: string; // Fundamentos de la apelación
  arguments: AppealArgument[];
  requestedOutcome: string;
  
  // Estado
  status: AppealStatus;
  
  // Fechas
  filedAt: string;
  filedBy: string;
  dueDate: string;
  
  // Resolución
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  newSanctionId?: string; // Si se modifica la sanción
  
  // Evidencias y documentos
  attachments: CaseEvidence[];
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DTOs - REQUESTS
// ============================================================================

export interface CreateCommitteeRequest {
  name: string;
  type: CommitteeType;
  description?: string;
  centerId: string;
  members: Array<{
    userId: string;
    role: 'president' | 'secretary' | 'member' | 'guest';
  }>;
  meetingSchedule?: string;
}

export interface UpdateCommitteeRequest {
  name?: string;
  type?: CommitteeType;
  description?: string;
  meetingSchedule?: string;
  isActive?: boolean;
}

export interface CreateStudentCaseRequest {
  studentId: string;
  committeeId: string;
  title: string;
  description: string;
  faultType: FaultType;
  faultDate: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateStudentCaseRequest {
  title?: string;
  description?: string;
  faultType?: FaultType;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  status?: CaseStatus;
  committeeDecision?: string;
  notes?: string;
  tags?: string[];
}

export interface CreateImprovementPlanRequest {
  studentCaseId: string;
  title: string;
  description: string;
  objectives: Array<{
    description: string;
    dueDate: string;
  }>;
  startDate: string;
  endDate: string;
  supervisorId: string;
  mentorId?: string;
}

export interface UpdateImprovementPlanRequest {
  title?: string;
  description?: string;
  endDate?: string;
  supervisorId?: string;
  mentorId?: string;
  status?: ImprovementPlanStatus;
  finalEvaluation?: string;
}

export interface UpdatePlanProgressRequest {
  objectiveUpdates?: Array<{
    objectiveId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    evidence?: string;
    feedback?: string;
  }>;
  followUp?: {
    type: 'meeting' | 'report' | 'observation' | 'other';
    description: string;
    progress: number;
    recommendations?: string;
    nextFollowUpDate?: string;
  };
}

export interface CreateSanctionRequest {
  studentCaseId: string;
  type: SanctionType;
  description: string;
  legalBasis?: string;
  startDate: string;
  endDate?: string;
  durationDays?: number;
}

export interface CreateAppealRequest {
  studentCaseId: string;
  sanctionId: string;
  title: string;
  grounds: string;
  arguments: Array<{
    type: 'procedural' | 'substantive' | 'mitigating' | 'evidence' | 'other';
    description: string;
  }>;
  requestedOutcome: string;
}

export interface ProcessAppealRequest {
  status: AppealStatus;
  resolution: string;
  newSanctionType?: SanctionType;
  newSanctionDescription?: string;
}

// ============================================================================
// DTOs - RESPONSES Y PAGINACIÓN
// ============================================================================

export interface PaginatedCommittees {
  items: Committee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedStudentCases {
  items: StudentCase[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedImprovementPlans {
  items: ImprovementPlan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedSanctions {
  items: Sanction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedAppeals {
  items: Appeal[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// FILTROS
// ============================================================================

export interface CommitteeFilters {
  search: string;
  type: CommitteeType | 'all';
  centerId: string | null;
  isActive: boolean | null;
}

export interface StudentCaseFilters {
  search: string;
  status: CaseStatus | 'all';
  faultType: FaultType | 'all';
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  committeeId: string | null;
  studentId: string | null;
  isOverdue: boolean | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface ImprovementPlanFilters {
  search: string;
  status: ImprovementPlanStatus | 'all';
  supervisorId: string | null;
  studentId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface SanctionFilters {
  search: string;
  type: SanctionType | 'all';
  status: SanctionStatus | 'all';
  studentId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface AppealFilters {
  search: string;
  status: AppealStatus | 'all';
  studentId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

// ============================================================================
// VALORES INICIALES
// ============================================================================

export const INITIAL_COMMITTEE_FILTERS: CommitteeFilters = {
  search: '',
  type: 'all',
  centerId: null,
  isActive: null,
};

export const INITIAL_STUDENT_CASE_FILTERS: StudentCaseFilters = {
  search: '',
  status: 'all',
  faultType: 'all',
  priority: 'all',
  committeeId: null,
  studentId: null,
  isOverdue: null,
  dateFrom: null,
  dateTo: null,
};

export const INITIAL_IMPROVEMENT_PLAN_FILTERS: ImprovementPlanFilters = {
  search: '',
  status: 'all',
  supervisorId: null,
  studentId: null,
  dateFrom: null,
  dateTo: null,
};

export const INITIAL_SANCTION_FILTERS: SanctionFilters = {
  search: '',
  type: 'all',
  status: 'all',
  studentId: null,
  dateFrom: null,
  dateTo: null,
};

export const INITIAL_APPEAL_FILTERS: AppealFilters = {
  search: '',
  status: 'all',
  studentId: null,
  dateFrom: null,
  dateTo: null,
};

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

export interface MevalDashboardStats {
  totalCases: number;
  openCases: number;
  pendingCases: number;
  overdueCases: number;
  activeSanctions: number;
  pendingAppeals: number;
  activePlans: number;
  resolvedThisMonth: number;
  casesByStatus: Record<CaseStatus, number>;
  casesByFaultType: Record<FaultType, number>;
  sanctionsByType: Record<SanctionType, number>;
  monthlyTrend: Array<{
    month: string;
    cases: number;
    resolved: number;
  }>;
}
