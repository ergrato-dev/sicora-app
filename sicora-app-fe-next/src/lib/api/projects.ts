/**
 * API Client para ProjectEvalService
 * Evaluación de proyectos formativos
 */

import { httpClient } from './http-client';
import type {
  Project,
  Submission,
  Evaluation,
  Rubric,
  ProjectDashboardStats,
  CreateProjectRequest,
  UpdateProjectRequest,
  AddTeamMemberRequest,
  AddMilestoneRequest,
  AddDeliverableRequest,
  CreateSubmissionRequest,
  CreateEvaluationRequest,
  SaveEvaluationRequest,
  CreateRubricRequest,
  ReturnSubmissionRequest,
  ProjectFilters,
  SubmissionFilters,
  EvaluationFilters,
  PaginatedProjects,
  PaginatedSubmissions,
  PaginatedEvaluations,
  PaginatedRubrics,
  ProjectStatus,
  ProjectPhase,
} from '@/types/project.types';

const BASE_URL = '/api/projects';

// ============================================================================
// PROYECTOS
// ============================================================================

const projects = {
  /**
   * Crear nuevo proyecto
   */
  async create(data: CreateProjectRequest): Promise<Project> {
    const response = await httpClient.post<Project>(BASE_URL, data);
    return response.data!;
  },

  /**
   * Obtener lista de proyectos con filtros
   */
  async list(filters?: ProjectFilters, page = 1, pageSize = 10): Promise<PaginatedProjects> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await httpClient.get<PaginatedProjects>(`${BASE_URL}?${params}`);
    return response.data!;
  },

  /**
   * Obtener proyecto por ID
   */
  async get(id: string): Promise<Project> {
    const response = await httpClient.get<Project>(`${BASE_URL}/${id}`);
    return response.data!;
  },

  /**
   * Actualizar proyecto
   */
  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await httpClient.put<Project>(`${BASE_URL}/${id}`, data);
    return response.data!;
  },

  /**
   * Eliminar proyecto
   */
  async delete(id: string): Promise<void> {
    await httpClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Obtener proyectos por programa
   */
  async getByProgram(programId: string): Promise<Project[]> {
    const response = await httpClient.get<Project[]>(`${BASE_URL}/program/${programId}`);
    return response.data!;
  },

  /**
   * Obtener proyectos por grupo
   */
  async getByGroup(groupId: string): Promise<Project[]> {
    const response = await httpClient.get<Project[]>(`${BASE_URL}/group/${groupId}`);
    return response.data!;
  },

  /**
   * Obtener proyectos por instructor
   */
  async getByInstructor(instructorId: string): Promise<Project[]> {
    const response = await httpClient.get<Project[]>(`${BASE_URL}/instructor/${instructorId}`);
    return response.data!;
  },

  /**
   * Cambiar estado del proyecto
   */
  async changeStatus(id: string, status: ProjectStatus): Promise<Project> {
    const response = await httpClient.patch<Project>(`${BASE_URL}/${id}/status`, { status });
    return response.data!;
  },

  /**
   * Cambiar fase del proyecto
   */
  async changePhase(id: string, phase: ProjectPhase): Promise<Project> {
    const response = await httpClient.patch<Project>(`${BASE_URL}/${id}/phase`, { phase });
    return response.data!;
  },

  /**
   * Agregar miembro al equipo
   */
  async addTeamMember(projectId: string, data: AddTeamMemberRequest): Promise<Project> {
    const response = await httpClient.post<Project>(`${BASE_URL}/${projectId}/team`, data);
    return response.data!;
  },

  /**
   * Remover miembro del equipo
   */
  async removeTeamMember(projectId: string, memberId: string): Promise<Project> {
    const response = await httpClient.delete<Project>(`${BASE_URL}/${projectId}/team/${memberId}`);
    return response.data!;
  },

  /**
   * Agregar milestone
   */
  async addMilestone(projectId: string, data: AddMilestoneRequest): Promise<Project> {
    const response = await httpClient.post<Project>(`${BASE_URL}/${projectId}/milestones`, data);
    return response.data!;
  },

  /**
   * Completar milestone
   */
  async completeMilestone(projectId: string, milestoneId: string): Promise<Project> {
    const response = await httpClient.patch<Project>(
      `${BASE_URL}/${projectId}/milestones/${milestoneId}/complete`,
      {}
    );
    return response.data!;
  },

  /**
   * Agregar entregable
   */
  async addDeliverable(projectId: string, data: AddDeliverableRequest): Promise<Project> {
    const response = await httpClient.post<Project>(`${BASE_URL}/${projectId}/deliverables`, data);
    return response.data!;
  },

  /**
   * Buscar proyectos
   */
  async search(query: string): Promise<Project[]> {
    const response = await httpClient.get<Project[]>(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    return response.data!;
  },
};

// ============================================================================
// ENTREGAS (SUBMISSIONS)
// ============================================================================

const submissions = {
  /**
   * Crear nueva entrega
   */
  async create(data: CreateSubmissionRequest): Promise<Submission> {
    const response = await httpClient.post<Submission>(`${BASE_URL}/submissions`, data);
    return response.data!;
  },

  /**
   * Obtener lista de entregas con filtros
   */
  async list(filters?: SubmissionFilters, page = 1, pageSize = 10): Promise<PaginatedSubmissions> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await httpClient.get<PaginatedSubmissions>(`${BASE_URL}/submissions?${params}`);
    return response.data!;
  },

  /**
   * Obtener entrega por ID
   */
  async get(id: string): Promise<Submission> {
    const response = await httpClient.get<Submission>(`${BASE_URL}/submissions/${id}`);
    return response.data!;
  },

  /**
   * Subir archivos a entrega
   */
  async uploadFiles(submissionId: string, files: File[]): Promise<Submission> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await httpClient.post<Submission>(
      `${BASE_URL}/submissions/${submissionId}/files`,
      formData
    );
    return response.data!;
  },

  /**
   * Eliminar archivo de entrega
   */
  async removeFile(submissionId: string, fileId: string): Promise<Submission> {
    const response = await httpClient.delete<Submission>(
      `${BASE_URL}/submissions/${submissionId}/files/${fileId}`
    );
    return response.data!;
  },

  /**
   * Enviar entrega
   */
  async submit(submissionId: string): Promise<Submission> {
    const response = await httpClient.patch<Submission>(
      `${BASE_URL}/submissions/${submissionId}/submit`,
      {}
    );
    return response.data!;
  },

  /**
   * Devolver entrega (solicitar correcciones)
   */
  async return(submissionId: string, data: ReturnSubmissionRequest): Promise<Submission> {
    const response = await httpClient.patch<Submission>(
      `${BASE_URL}/submissions/${submissionId}/return`,
      data
    );
    return response.data!;
  },

  /**
   * Agregar comentario a entrega
   */
  async addComment(submissionId: string, content: string, isPrivate = false): Promise<Submission> {
    const response = await httpClient.post<Submission>(
      `${BASE_URL}/submissions/${submissionId}/comments`,
      { content, isPrivate }
    );
    return response.data!;
  },

  /**
   * Obtener entregas por proyecto
   */
  async getByProject(projectId: string): Promise<Submission[]> {
    const response = await httpClient.get<Submission[]>(`${BASE_URL}/${projectId}/submissions`);
    return response.data!;
  },

  /**
   * Obtener entregas por estudiante
   */
  async getByStudent(studentId: string): Promise<Submission[]> {
    const response = await httpClient.get<Submission[]>(`${BASE_URL}/submissions/student/${studentId}`);
    return response.data!;
  },

  /**
   * Obtener entregas pendientes
   */
  async getPending(): Promise<Submission[]> {
    const response = await httpClient.get<Submission[]>(`${BASE_URL}/submissions/pending`);
    return response.data!;
  },

  /**
   * Obtener entregas tardías
   */
  async getLate(): Promise<Submission[]> {
    const response = await httpClient.get<Submission[]>(`${BASE_URL}/submissions/late`);
    return response.data!;
  },

  /**
   * Obtener entregas por evaluar
   */
  async getToEvaluate(): Promise<Submission[]> {
    const response = await httpClient.get<Submission[]>(`${BASE_URL}/submissions/to-evaluate`);
    return response.data!;
  },
};

// ============================================================================
// EVALUACIONES
// ============================================================================

const evaluations = {
  /**
   * Crear nueva evaluación
   */
  async create(data: CreateEvaluationRequest): Promise<Evaluation> {
    const response = await httpClient.post<Evaluation>(`${BASE_URL}/evaluations`, data);
    return response.data!;
  },

  /**
   * Obtener lista de evaluaciones con filtros
   */
  async list(filters?: EvaluationFilters, page = 1, pageSize = 10): Promise<PaginatedEvaluations> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await httpClient.get<PaginatedEvaluations>(`${BASE_URL}/evaluations?${params}`);
    return response.data!;
  },

  /**
   * Obtener evaluación por ID
   */
  async get(id: string): Promise<Evaluation> {
    const response = await httpClient.get<Evaluation>(`${BASE_URL}/evaluations/${id}`);
    return response.data!;
  },

  /**
   * Guardar evaluación (borrador o final)
   */
  async save(id: string, data: SaveEvaluationRequest, finalize = false): Promise<Evaluation> {
    const response = await httpClient.put<Evaluation>(
      `${BASE_URL}/evaluations/${id}${finalize ? '?finalize=true' : ''}`,
      data
    );
    return response.data!;
  },

  /**
   * Completar evaluación
   */
  async complete(id: string): Promise<Evaluation> {
    const response = await httpClient.patch<Evaluation>(
      `${BASE_URL}/evaluations/${id}/complete`,
      {}
    );
    return response.data!;
  },

  /**
   * Obtener evaluaciones por proyecto
   */
  async getByProject(projectId: string): Promise<Evaluation[]> {
    const response = await httpClient.get<Evaluation[]>(`${BASE_URL}/${projectId}/evaluations`);
    return response.data!;
  },

  /**
   * Obtener evaluaciones por evaluador
   */
  async getByEvaluator(evaluatorId: string): Promise<Evaluation[]> {
    const response = await httpClient.get<Evaluation[]>(`${BASE_URL}/evaluations/evaluator/${evaluatorId}`);
    return response.data!;
  },

  /**
   * Obtener evaluaciones pendientes
   */
  async getPending(): Promise<Evaluation[]> {
    const response = await httpClient.get<Evaluation[]>(`${BASE_URL}/evaluations/pending`);
    return response.data!;
  },

  /**
   * Obtener estadísticas de evaluaciones por proyecto
   */
  async getProjectStats(projectId: string): Promise<{
    totalEvaluations: number;
    averageScore: number;
    passingRate: number;
    scoreDistribution: Record<string, number>;
  }> {
    const response = await httpClient.get<{
      totalEvaluations: number;
      averageScore: number;
      passingRate: number;
      scoreDistribution: Record<string, number>;
    }>(`${BASE_URL}/${projectId}/evaluations/stats`);
    return response.data!;
  },
};

// ============================================================================
// RÚBRICAS
// ============================================================================

const rubrics = {
  /**
   * Crear nueva rúbrica
   */
  async create(data: CreateRubricRequest): Promise<Rubric> {
    const response = await httpClient.post<Rubric>(`${BASE_URL}/rubrics`, data);
    return response.data!;
  },

  /**
   * Obtener lista de rúbricas
   */
  async list(page = 1, pageSize = 10): Promise<PaginatedRubrics> {
    const response = await httpClient.get<PaginatedRubrics>(
      `${BASE_URL}/rubrics?page=${page}&pageSize=${pageSize}`
    );
    return response.data!;
  },

  /**
   * Obtener rúbrica por ID
   */
  async get(id: string): Promise<Rubric> {
    const response = await httpClient.get<Rubric>(`${BASE_URL}/rubrics/${id}`);
    return response.data!;
  },

  /**
   * Actualizar rúbrica
   */
  async update(id: string, data: Partial<CreateRubricRequest>): Promise<Rubric> {
    const response = await httpClient.put<Rubric>(`${BASE_URL}/rubrics/${id}`, data);
    return response.data!;
  },

  /**
   * Eliminar rúbrica
   */
  async delete(id: string): Promise<void> {
    await httpClient.delete(`${BASE_URL}/rubrics/${id}`);
  },

  /**
   * Obtener rúbricas por competencia
   */
  async getByCompetency(competencyId: string): Promise<Rubric[]> {
    const response = await httpClient.get<Rubric[]>(`${BASE_URL}/rubrics/competency/${competencyId}`);
    return response.data!;
  },

  /**
   * Duplicar rúbrica
   */
  async duplicate(id: string, newName: string): Promise<Rubric> {
    const response = await httpClient.post<Rubric>(`${BASE_URL}/rubrics/${id}/duplicate`, { name: newName });
    return response.data!;
  },

  /**
   * Activar/desactivar rúbrica
   */
  async toggleActive(id: string): Promise<Rubric> {
    const response = await httpClient.patch<Rubric>(`${BASE_URL}/rubrics/${id}/toggle-active`, {});
    return response.data!;
  },
};

// ============================================================================
// DASHBOARD
// ============================================================================

const dashboard = {
  /**
   * Obtener estadísticas generales
   */
  async getStats(): Promise<ProjectDashboardStats> {
    const response = await httpClient.get<ProjectDashboardStats>(`${BASE_URL}/dashboard/stats`);
    return response.data!;
  },

  /**
   * Obtener resumen rápido
   */
  async getQuickSummary(): Promise<{
    activeProjects: number;
    pendingSubmissions: number;
    pendingEvaluations: number;
    upcomingDeadlines: number;
  }> {
    const response = await httpClient.get<{
      activeProjects: number;
      pendingSubmissions: number;
      pendingEvaluations: number;
      upcomingDeadlines: number;
    }>(`${BASE_URL}/dashboard/quick-summary`);
    return response.data!;
  },

  /**
   * Obtener próximas fechas límite
   */
  async getUpcomingDeadlines(days = 7): Promise<Array<{
    projectId: string;
    projectName: string;
    deliverableName: string;
    dueDate: string;
    daysRemaining: number;
  }>> {
    const response = await httpClient.get<Array<{
      projectId: string;
      projectName: string;
      deliverableName: string;
      dueDate: string;
      daysRemaining: number;
    }>>(`${BASE_URL}/dashboard/deadlines?days=${days}`);
    return response.data!;
  },

  /**
   * Obtener evaluaciones recientes
   */
  async getRecentEvaluations(limit = 5): Promise<Array<{
    id: string;
    studentName: string;
    projectName: string;
    score: number;
    evaluatedAt: string;
  }>> {
    const response = await httpClient.get<Array<{
      id: string;
      studentName: string;
      projectName: string;
      score: number;
      evaluatedAt: string;
    }>>(`${BASE_URL}/dashboard/recent-evaluations?limit=${limit}`);
    return response.data!;
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export const projectsApi = {
  projects,
  submissions,
  evaluations,
  rubrics,
  dashboard,
};

export default projectsApi;
