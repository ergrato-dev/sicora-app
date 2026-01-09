/**
 * API Client para MevalService - Evaluación de Medidas y Sanciones
 * Endpoints para gestión de casos disciplinarios
 */

import { httpClient } from './client';
import type {
  Committee,
  StudentCase,
  ImprovementPlan,
  Sanction,
  Appeal,
  CaseEvidence,
  CreateCommitteeRequest,
  UpdateCommitteeRequest,
  CreateStudentCaseRequest,
  UpdateStudentCaseRequest,
  CreateImprovementPlanRequest,
  UpdateImprovementPlanRequest,
  UpdatePlanProgressRequest,
  CreateSanctionRequest,
  CreateAppealRequest,
  ProcessAppealRequest,
  PaginatedCommittees,
  PaginatedStudentCases,
  PaginatedImprovementPlans,
  PaginatedSanctions,
  PaginatedAppeals,
  MevalDashboardStats,
  CommitteeType,
} from '@/types/meval.types';

const BASE_URL = '/api/v1';

// ============================================================================
// COMMITTEES - COMITÉS
// ============================================================================

const committees = {
  /**
   * Crear nuevo comité
   */
  create: async (data: CreateCommitteeRequest): Promise<Committee> => {
    const response = await httpClient.post<Committee>(`${BASE_URL}/committees`, data);
    return response.data!;
  },

  /**
   * Obtener lista de comités
   */
  list: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: CommitteeType;
    centerId?: string;
    isActive?: boolean;
  }): Promise<PaginatedCommittees> => {
    const response = await httpClient.get<PaginatedCommittees>(`${BASE_URL}/committees`, { params });
    return response.data!;
  },

  /**
   * Obtener comité por ID
   */
  get: async (id: string): Promise<Committee> => {
    const response = await httpClient.get<Committee>(`${BASE_URL}/committees/${id}`);
    return response.data!;
  },

  /**
   * Actualizar comité
   */
  update: async (id: string, data: UpdateCommitteeRequest): Promise<Committee> => {
    const response = await httpClient.put<Committee>(`${BASE_URL}/committees/${id}`, data);
    return response.data!;
  },

  /**
   * Eliminar comité
   */
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${BASE_URL}/committees/${id}`);
  },

  /**
   * Obtener comités por centro
   */
  getByCenter: async (centerId: string): Promise<Committee[]> => {
    const response = await httpClient.get<Committee[]>(`${BASE_URL}/committees/by-center`, {
      params: { centerId },
    });
    return response.data!;
  },

  /**
   * Obtener comités por tipo
   */
  getByType: async (type: CommitteeType): Promise<Committee[]> => {
    const response = await httpClient.get<Committee[]>(`${BASE_URL}/committees/by-type`, {
      params: { type },
    });
    return response.data!;
  },

  /**
   * Agregar miembro al comité
   */
  addMember: async (
    committeeId: string,
    data: { userId: string; role: 'president' | 'secretary' | 'member' | 'guest' }
  ): Promise<Committee> => {
    const response = await httpClient.post<Committee>(
      `${BASE_URL}/committees/${committeeId}/members`,
      data
    );
    return response.data!;
  },

  /**
   * Remover miembro del comité
   */
  removeMember: async (committeeId: string, memberId: string): Promise<Committee> => {
    const response = await httpClient.delete<Committee>(
      `${BASE_URL}/committees/${committeeId}/members/${memberId}`
    );
    return response.data!;
  },
};

// ============================================================================
// STUDENT CASES - CASOS DE ESTUDIANTES
// ============================================================================

const studentCases = {
  /**
   * Crear nuevo caso
   */
  create: async (data: CreateStudentCaseRequest): Promise<StudentCase> => {
    const response = await httpClient.post<StudentCase>(`${BASE_URL}/student-cases`, data);
    return response.data!;
  },

  /**
   * Obtener caso por ID
   */
  get: async (id: string): Promise<StudentCase> => {
    const response = await httpClient.get<StudentCase>(`${BASE_URL}/student-cases/${id}`);
    return response.data!;
  },

  /**
   * Actualizar caso
   */
  update: async (id: string, data: UpdateStudentCaseRequest): Promise<StudentCase> => {
    const response = await httpClient.put<StudentCase>(`${BASE_URL}/student-cases/${id}`, data);
    return response.data!;
  },

  /**
   * Obtener casos por estudiante
   */
  getByStudent: async (
    studentId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<PaginatedStudentCases> => {
    const response = await httpClient.get<PaginatedStudentCases>(
      `${BASE_URL}/student-cases/by-student`,
      { params: { studentId, ...params } }
    );
    return response.data!;
  },

  /**
   * Obtener casos pendientes
   */
  getPending: async (params?: {
    page?: number;
    pageSize?: number;
    committeeId?: string;
  }): Promise<PaginatedStudentCases> => {
    const response = await httpClient.get<PaginatedStudentCases>(
      `${BASE_URL}/student-cases/pending`,
      { params }
    );
    return response.data!;
  },

  /**
   * Obtener casos vencidos
   */
  getOverdue: async (params?: {
    page?: number;
    pageSize?: number;
    committeeId?: string;
  }): Promise<PaginatedStudentCases> => {
    const response = await httpClient.get<PaginatedStudentCases>(
      `${BASE_URL}/student-cases/overdue`,
      { params }
    );
    return response.data!;
  },

  /**
   * Buscar casos
   */
  search: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    faultType?: string;
    priority?: string;
    committeeId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedStudentCases> => {
    const response = await httpClient.get<PaginatedStudentCases>(`${BASE_URL}/student-cases`, {
      params,
    });
    return response.data!;
  },

  /**
   * Agregar evidencia al caso
   */
  addEvidence: async (
    caseId: string,
    data: FormData
  ): Promise<CaseEvidence> => {
    const response = await httpClient.post<CaseEvidence>(
      `${BASE_URL}/student-cases/${caseId}/evidence`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data!;
  },

  /**
   * Eliminar evidencia del caso
   */
  removeEvidence: async (caseId: string, evidenceId: string): Promise<void> => {
    await httpClient.delete(`${BASE_URL}/student-cases/${caseId}/evidence/${evidenceId}`);
  },

  /**
   * Cambiar estado del caso
   */
  changeStatus: async (
    caseId: string,
    data: { status: string; notes?: string }
  ): Promise<StudentCase> => {
    const response = await httpClient.patch<StudentCase>(
      `${BASE_URL}/student-cases/${caseId}/status`,
      data
    );
    return response.data!;
  },

  /**
   * Registrar decisión del comité
   */
  registerDecision: async (
    caseId: string,
    data: { decision: string; notes?: string }
  ): Promise<StudentCase> => {
    const response = await httpClient.post<StudentCase>(
      `${BASE_URL}/student-cases/${caseId}/decision`,
      data
    );
    return response.data!;
  },
};

// ============================================================================
// IMPROVEMENT PLANS - PLANES DE MEJORA
// ============================================================================

const improvementPlans = {
  /**
   * Crear plan de mejora
   */
  create: async (data: CreateImprovementPlanRequest): Promise<ImprovementPlan> => {
    const response = await httpClient.post<ImprovementPlan>(
      `${BASE_URL}/improvement-plans`,
      data
    );
    return response.data!;
  },

  /**
   * Obtener plan por ID
   */
  get: async (id: string): Promise<ImprovementPlan> => {
    const response = await httpClient.get<ImprovementPlan>(`${BASE_URL}/improvement-plans/${id}`);
    return response.data!;
  },

  /**
   * Actualizar plan
   */
  update: async (id: string, data: UpdateImprovementPlanRequest): Promise<ImprovementPlan> => {
    const response = await httpClient.put<ImprovementPlan>(
      `${BASE_URL}/improvement-plans/${id}`,
      data
    );
    return response.data!;
  },

  /**
   * Obtener planes por caso
   */
  getByStudentCase: async (caseId: string): Promise<ImprovementPlan[]> => {
    const response = await httpClient.get<ImprovementPlan[]>(
      `${BASE_URL}/improvement-plans/student-case/${caseId}`
    );
    return response.data!;
  },

  /**
   * Actualizar progreso del plan
   */
  updateProgress: async (
    planId: string,
    data: UpdatePlanProgressRequest
  ): Promise<ImprovementPlan> => {
    const response = await httpClient.patch<ImprovementPlan>(
      `${BASE_URL}/improvement-plans/${planId}/progress`,
      data
    );
    return response.data!;
  },

  /**
   * Buscar planes
   */
  search: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    supervisorId?: string;
    studentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedImprovementPlans> => {
    const response = await httpClient.get<PaginatedImprovementPlans>(
      `${BASE_URL}/improvement-plans`,
      { params }
    );
    return response.data!;
  },

  /**
   * Completar plan de mejora
   */
  complete: async (
    planId: string,
    data: { finalEvaluation: string; success: boolean }
  ): Promise<ImprovementPlan> => {
    const response = await httpClient.post<ImprovementPlan>(
      `${BASE_URL}/improvement-plans/${planId}/complete`,
      data
    );
    return response.data!;
  },
};

// ============================================================================
// SANCTIONS - SANCIONES
// ============================================================================

const sanctions = {
  /**
   * Crear sanción
   */
  create: async (data: CreateSanctionRequest): Promise<Sanction> => {
    const response = await httpClient.post<Sanction>(`${BASE_URL}/sanctions`, data);
    return response.data!;
  },

  /**
   * Obtener sanción por ID
   */
  get: async (id: string): Promise<Sanction> => {
    const response = await httpClient.get<Sanction>(`${BASE_URL}/sanctions/${id}`);
    return response.data!;
  },

  /**
   * Obtener sanciones por estudiante
   */
  getByStudent: async (
    studentId: string,
    params?: { page?: number; pageSize?: number; status?: string }
  ): Promise<PaginatedSanctions> => {
    const response = await httpClient.get<PaginatedSanctions>(
      `${BASE_URL}/sanctions/student/${studentId}`,
      { params }
    );
    return response.data!;
  },

  /**
   * Activar sanción
   */
  activate: async (sanctionId: string): Promise<Sanction> => {
    const response = await httpClient.patch<Sanction>(
      `${BASE_URL}/sanctions/${sanctionId}/activate`
    );
    return response.data!;
  },

  /**
   * Completar/Finalizar sanción
   */
  complete: async (
    sanctionId: string,
    data: { completionNotes?: string }
  ): Promise<Sanction> => {
    const response = await httpClient.patch<Sanction>(
      `${BASE_URL}/sanctions/${sanctionId}/complete`,
      data
    );
    return response.data!;
  },

  /**
   * Buscar sanciones
   */
  search: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    status?: string;
    studentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedSanctions> => {
    const response = await httpClient.get<PaginatedSanctions>(`${BASE_URL}/sanctions`, { params });
    return response.data!;
  },

  /**
   * Suspender sanción (por apelación)
   */
  suspend: async (sanctionId: string, data: { reason: string }): Promise<Sanction> => {
    const response = await httpClient.patch<Sanction>(
      `${BASE_URL}/sanctions/${sanctionId}/suspend`,
      data
    );
    return response.data!;
  },

  /**
   * Notificar sanción
   */
  notify: async (
    sanctionId: string,
    data: { method: 'email' | 'physical' | 'both'; notifyParent?: boolean }
  ): Promise<Sanction> => {
    const response = await httpClient.post<Sanction>(
      `${BASE_URL}/sanctions/${sanctionId}/notify`,
      data
    );
    return response.data!;
  },
};

// ============================================================================
// APPEALS - APELACIONES
// ============================================================================

const appeals = {
  /**
   * Crear apelación
   */
  create: async (data: CreateAppealRequest): Promise<Appeal> => {
    const response = await httpClient.post<Appeal>(`${BASE_URL}/appeals`, data);
    return response.data!;
  },

  /**
   * Obtener apelación por ID
   */
  get: async (id: string): Promise<Appeal> => {
    const response = await httpClient.get<Appeal>(`${BASE_URL}/appeals/${id}`);
    return response.data!;
  },

  /**
   * Obtener apelaciones por estudiante
   */
  getByStudent: async (
    studentId: string,
    params?: { page?: number; pageSize?: number; status?: string }
  ): Promise<PaginatedAppeals> => {
    const response = await httpClient.get<PaginatedAppeals>(
      `${BASE_URL}/appeals/student/${studentId}`,
      { params }
    );
    return response.data!;
  },

  /**
   * Procesar apelación (aprobar/rechazar)
   */
  process: async (appealId: string, data: ProcessAppealRequest): Promise<Appeal> => {
    const response = await httpClient.patch<Appeal>(
      `${BASE_URL}/appeals/${appealId}/process`,
      data
    );
    return response.data!;
  },

  /**
   * Buscar apelaciones
   */
  search: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    studentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedAppeals> => {
    const response = await httpClient.get<PaginatedAppeals>(`${BASE_URL}/appeals`, { params });
    return response.data!;
  },

  /**
   * Agregar documento a la apelación
   */
  addDocument: async (appealId: string, data: FormData): Promise<Appeal> => {
    const response = await httpClient.post<Appeal>(
      `${BASE_URL}/appeals/${appealId}/documents`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data!;
  },
};

// ============================================================================
// DASHBOARD / ESTADÍSTICAS
// ============================================================================

const dashboard = {
  /**
   * Obtener estadísticas del dashboard
   */
  getStats: async (params?: {
    centerId?: string;
    committeeId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<MevalDashboardStats> => {
    const response = await httpClient.get<MevalDashboardStats>(`${BASE_URL}/meval/dashboard`, {
      params,
    });
    return response.data!;
  },

  /**
   * Obtener resumen rápido
   */
  getQuickSummary: async (): Promise<{
    openCases: number;
    pendingAppeals: number;
    activeSanctions: number;
    overdueCases: number;
  }> => {
    const response = await httpClient.get<{
      openCases: number;
      pendingAppeals: number;
      activeSanctions: number;
      overdueCases: number;
    }>(`${BASE_URL}/meval/quick-summary`);
    return response.data!;
  },
};

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const mevalApi = {
  committees,
  studentCases,
  improvementPlans,
  sanctions,
  appeals,
  dashboard,
};

export default mevalApi;
