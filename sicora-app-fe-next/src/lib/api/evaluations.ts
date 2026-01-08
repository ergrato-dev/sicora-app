/**
 * SICORA - API Client para Evaluaciones (EvaluationService)
 *
 * Funciones para comunicación con el backend para
 * operaciones de evaluaciones, rúbricas, calificaciones y reportes.
 *
 * Endpoints manejados:
 * - CRUD /api/v1/evaluations         - Evaluaciones
 * - CRUD /api/v1/rubrics             - Rúbricas
 * - CRUD /api/v1/scores              - Calificaciones
 * - GET  /api/v1/evaluations/stats   - Estadísticas
 * - GET  /api/v1/reports/group       - Reporte de grupo
 * - GET  /api/v1/reports/student     - Reporte de estudiante
 *
 * @fileoverview Evaluations API client
 * @module lib/api/evaluations
 */

import { httpClient } from '../api-client';
import type { ApiResponse } from '@/types/auth.types';
import type {
  // Evaluations
  Evaluation,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  ListEvaluationsParams,
  PaginatedEvaluations,
  EvaluationStats,
  // Rubrics
  Rubric,
  CreateRubricRequest,
  UpdateRubricRequest,
  ListRubricsParams,
  PaginatedRubrics,
  // Scores
  StudentScore,
  SubmitScoreRequest,
  BulkScoreRequest,
  ListScoresParams,
  PaginatedScores,
  // Reports
  GroupEvaluationReport,
  StudentEvaluationReport,
} from '@/types/evaluation.types';

/* =============================================================================
   ENDPOINTS
   ============================================================================= */

/**
 * Endpoints de evaluaciones
 */
const ENDPOINTS = {
  // Evaluaciones
  EVALUATIONS: '/api/v1/evaluations',
  EVALUATION_BY_ID: (id: string) => `/api/v1/evaluations/${id}`,
  EVALUATION_STATS: '/api/v1/evaluations/stats',
  EVALUATION_START: (id: string) => `/api/v1/evaluations/${id}/start`,
  EVALUATION_COMPLETE: (id: string) => `/api/v1/evaluations/${id}/complete`,
  EVALUATION_CANCEL: (id: string) => `/api/v1/evaluations/${id}/cancel`,
  
  // Rúbricas
  RUBRICS: '/api/v1/rubrics',
  RUBRIC_BY_ID: (id: string) => `/api/v1/rubrics/${id}`,
  RUBRIC_DUPLICATE: (id: string) => `/api/v1/rubrics/${id}/duplicate`,
  
  // Calificaciones
  SCORES: '/api/v1/scores',
  SCORES_BY_EVALUATION: (evaluationId: string) => `/api/v1/evaluations/${evaluationId}/scores`,
  SCORE_BY_ID: (id: string) => `/api/v1/scores/${id}`,
  SCORES_BULK: '/api/v1/scores/bulk',
  
  // Reportes
  REPORT_GROUP: (groupId: string) => `/api/v1/reports/group/${groupId}`,
  REPORT_STUDENT: (studentId: string) => `/api/v1/reports/student/${studentId}`,
} as const;

/* =============================================================================
   HELPERS
   ============================================================================= */

/**
 * Construir query string genérico desde objeto de parámetros
 */
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/* =============================================================================
   EVALUACIONES
   ============================================================================= */

/**
 * Listar evaluaciones con filtros
 */
export async function listEvaluations(
  params: ListEvaluationsParams = {}
): Promise<ApiResponse<PaginatedEvaluations>> {
  const queryString = buildQueryString(params as Record<string, unknown>);
  return httpClient.get<PaginatedEvaluations>(`${ENDPOINTS.EVALUATIONS}${queryString}`);
}

/**
 * Obtener evaluación por ID
 */
export async function getEvaluation(id: string): Promise<ApiResponse<Evaluation>> {
  return httpClient.get<Evaluation>(ENDPOINTS.EVALUATION_BY_ID(id));
}

/**
 * Crear nueva evaluación
 */
export async function createEvaluation(
  data: CreateEvaluationRequest
): Promise<ApiResponse<Evaluation>> {
  return httpClient.post<Evaluation>(ENDPOINTS.EVALUATIONS, data);
}

/**
 * Actualizar evaluación
 */
export async function updateEvaluation(
  id: string,
  data: Partial<UpdateEvaluationRequest>
): Promise<ApiResponse<Evaluation>> {
  return httpClient.put<Evaluation>(ENDPOINTS.EVALUATION_BY_ID(id), data);
}

/**
 * Eliminar evaluación
 */
export async function deleteEvaluation(id: string): Promise<ApiResponse<void>> {
  return httpClient.delete<void>(ENDPOINTS.EVALUATION_BY_ID(id));
}

/**
 * Iniciar evaluación (cambiar estado a in_progress)
 */
export async function startEvaluation(id: string): Promise<ApiResponse<Evaluation>> {
  return httpClient.post<Evaluation>(ENDPOINTS.EVALUATION_START(id), {});
}

/**
 * Completar evaluación (cambiar estado a completed)
 */
export async function completeEvaluation(id: string): Promise<ApiResponse<Evaluation>> {
  return httpClient.post<Evaluation>(ENDPOINTS.EVALUATION_COMPLETE(id), {});
}

/**
 * Cancelar evaluación
 */
export async function cancelEvaluation(id: string): Promise<ApiResponse<Evaluation>> {
  return httpClient.post<Evaluation>(ENDPOINTS.EVALUATION_CANCEL(id), {});
}

/**
 * Obtener estadísticas de evaluaciones
 */
export async function getEvaluationStats(
  params?: { programId?: string; groupId?: string; fromDate?: string; toDate?: string }
): Promise<ApiResponse<EvaluationStats>> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  return httpClient.get<EvaluationStats>(`${ENDPOINTS.EVALUATION_STATS}${queryString}`);
}

/* =============================================================================
   RÚBRICAS
   ============================================================================= */

/**
 * Listar rúbricas con filtros
 */
export async function listRubrics(
  params: ListRubricsParams = {}
): Promise<ApiResponse<PaginatedRubrics>> {
  const queryString = buildQueryString(params as Record<string, unknown>);
  return httpClient.get<PaginatedRubrics>(`${ENDPOINTS.RUBRICS}${queryString}`);
}

/**
 * Obtener rúbrica por ID
 */
export async function getRubric(id: string): Promise<ApiResponse<Rubric>> {
  return httpClient.get<Rubric>(ENDPOINTS.RUBRIC_BY_ID(id));
}

/**
 * Crear nueva rúbrica
 */
export async function createRubric(
  data: CreateRubricRequest
): Promise<ApiResponse<Rubric>> {
  return httpClient.post<Rubric>(ENDPOINTS.RUBRICS, data);
}

/**
 * Actualizar rúbrica
 */
export async function updateRubric(
  id: string,
  data: Partial<UpdateRubricRequest>
): Promise<ApiResponse<Rubric>> {
  return httpClient.put<Rubric>(ENDPOINTS.RUBRIC_BY_ID(id), data);
}

/**
 * Eliminar rúbrica
 */
export async function deleteRubric(id: string): Promise<ApiResponse<void>> {
  return httpClient.delete<void>(ENDPOINTS.RUBRIC_BY_ID(id));
}

/**
 * Duplicar rúbrica como plantilla
 */
export async function duplicateRubric(
  id: string,
  newName?: string
): Promise<ApiResponse<Rubric>> {
  return httpClient.post<Rubric>(ENDPOINTS.RUBRIC_DUPLICATE(id), { name: newName });
}

/* =============================================================================
   CALIFICACIONES
   ============================================================================= */

/**
 * Listar calificaciones de una evaluación
 */
export async function listScores(
  params: ListScoresParams
): Promise<ApiResponse<PaginatedScores>> {
  const queryString = buildQueryString({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    passed: params.passed,
    competencyLevel: params.competencyLevel,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  return httpClient.get<PaginatedScores>(
    `${ENDPOINTS.SCORES_BY_EVALUATION(params.evaluationId)}${queryString}`
  );
}

/**
 * Obtener calificación específica
 */
export async function getScore(id: string): Promise<ApiResponse<StudentScore>> {
  return httpClient.get<StudentScore>(ENDPOINTS.SCORE_BY_ID(id));
}

/**
 * Registrar calificación de estudiante
 */
export async function submitScore(
  data: SubmitScoreRequest
): Promise<ApiResponse<StudentScore>> {
  return httpClient.post<StudentScore>(ENDPOINTS.SCORES, data);
}

/**
 * Actualizar calificación existente
 */
export async function updateScore(
  id: string,
  data: Partial<SubmitScoreRequest>
): Promise<ApiResponse<StudentScore>> {
  return httpClient.put<StudentScore>(ENDPOINTS.SCORE_BY_ID(id), data);
}

/**
 * Eliminar calificación
 */
export async function deleteScore(id: string): Promise<ApiResponse<void>> {
  return httpClient.delete<void>(ENDPOINTS.SCORE_BY_ID(id));
}

/**
 * Registrar calificaciones masivas
 */
export async function submitBulkScores(
  data: BulkScoreRequest
): Promise<ApiResponse<{ created: number; updated: number; errors: string[] }>> {
  return httpClient.post<{ created: number; updated: number; errors: string[] }>(
    ENDPOINTS.SCORES_BULK,
    data
  );
}

/* =============================================================================
   REPORTES
   ============================================================================= */

/**
 * Obtener reporte de evaluaciones de un grupo
 */
export async function getGroupReport(
  groupId: string,
  params?: { fromDate?: string; toDate?: string; competencyId?: string }
): Promise<ApiResponse<GroupEvaluationReport>> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  return httpClient.get<GroupEvaluationReport>(`${ENDPOINTS.REPORT_GROUP(groupId)}${queryString}`);
}

/**
 * Obtener reporte de evaluaciones de un estudiante
 */
export async function getStudentReport(
  studentId: string,
  params?: { fromDate?: string; toDate?: string; competencyId?: string }
): Promise<ApiResponse<StudentEvaluationReport>> {
  const queryString = params ? buildQueryString(params as Record<string, unknown>) : '';
  return httpClient.get<StudentEvaluationReport>(`${ENDPOINTS.REPORT_STUDENT(studentId)}${queryString}`);
}

/* =============================================================================
   OBJETO API AGRUPADO
   ============================================================================= */

/**
 * API de evaluaciones agrupada
 */
export const evaluationsApi = {
  // Evaluaciones
  list: listEvaluations,
  get: getEvaluation,
  create: createEvaluation,
  update: updateEvaluation,
  delete: deleteEvaluation,
  start: startEvaluation,
  complete: completeEvaluation,
  cancel: cancelEvaluation,
  getStats: getEvaluationStats,
  
  // Rúbricas
  rubrics: {
    list: listRubrics,
    get: getRubric,
    create: createRubric,
    update: updateRubric,
    delete: deleteRubric,
    duplicate: duplicateRubric,
  },
  
  // Calificaciones
  scores: {
    list: listScores,
    get: getScore,
    submit: submitScore,
    update: updateScore,
    delete: deleteScore,
    submitBulk: submitBulkScores,
  },
  
  // Reportes
  reports: {
    group: getGroupReport,
    student: getStudentReport,
  },
};

export default evaluationsApi;
