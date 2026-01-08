/**
 * Cliente API para EvalinService - Evaluación de Instructores
 * 
 * Nota: Usamos non-null assertion (!) en response.data porque:
 * - ApiResponse<T> tiene data como opcional para manejar casos de error
 * - En llamadas exitosas, data siempre estará presente
 * - httpClient lanza excepción en caso de error antes de retornar
 */

import { httpClient } from '../api-client';
import type {
  Question,
  Questionnaire,
  EvaluationPeriod,
  InstructorEvaluation,
  InstructorEvaluationSummary,
  PeriodReport,
  EvalinConfig,
  QuestionCategory,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateQuestionCategoryRequest,
  CreateQuestionnaireRequest,
  UpdateQuestionnaireRequest,
  CreateEvaluationPeriodRequest,
  UpdateEvaluationPeriodRequest,
  SubmitEvaluationRequest,
  AddCommentRequest,
  ListQuestionsParams,
  ListQuestionnairesParams,
  ListPeriodsParams,
  ListEvaluationsParams,
  PaginatedQuestions,
  PaginatedQuestionnaires,
  PaginatedPeriods,
  PaginatedEvaluations,
} from '@/types/evalin.types';

const BASE_URL = '/api/v1';

// Helper para construir query string
function buildQueryString(params: Record<string, unknown>): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return query ? `?${query}` : '';
}

// ============================================================================
// CATEGORÍAS DE PREGUNTAS
// ============================================================================

/**
 * Listar todas las categorías de preguntas
 */
export async function listCategories(): Promise<QuestionCategory[]> {
  const response = await httpClient.get<QuestionCategory[]>(`${BASE_URL}/question-categories`);
  return response.data!;
}

/**
 * Obtener una categoría por ID
 */
export async function getCategory(id: string): Promise<QuestionCategory> {
  const response = await httpClient.get<QuestionCategory>(`${BASE_URL}/question-categories/${id}`);
  return response.data!;
}

/**
 * Crear una nueva categoría
 */
export async function createCategory(
  data: CreateQuestionCategoryRequest
): Promise<QuestionCategory> {
  const response = await httpClient.post<QuestionCategory>(`${BASE_URL}/question-categories`, data);
  return response.data!;
}

/**
 * Actualizar una categoría
 */
export async function updateCategory(
  id: string,
  data: Partial<CreateQuestionCategoryRequest>
): Promise<QuestionCategory> {
  const response = await httpClient.put<QuestionCategory>(`${BASE_URL}/question-categories/${id}`, data);
  return response.data!;
}

/**
 * Eliminar una categoría
 */
export async function deleteCategory(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/question-categories/${id}`);
}

// ============================================================================
// PREGUNTAS
// ============================================================================

/**
 * Listar preguntas con filtros
 */
export async function listQuestions(
  params?: ListQuestionsParams
): Promise<PaginatedQuestions> {
  const query = params ? buildQueryString(params as Record<string, unknown>) : '';
  const response = await httpClient.get<PaginatedQuestions>(`${BASE_URL}/questions${query}`);
  return response.data!;
}

/**
 * Obtener una pregunta por ID
 */
export async function getQuestion(id: string): Promise<Question> {
  const response = await httpClient.get<Question>(`${BASE_URL}/questions/${id}`);
  return response.data!;
}

/**
 * Crear una nueva pregunta
 */
export async function createQuestion(
  data: CreateQuestionRequest
): Promise<Question> {
  const response = await httpClient.post<Question>(`${BASE_URL}/questions`, data);
  return response.data!;
}

/**
 * Actualizar una pregunta
 */
export async function updateQuestion(
  id: string,
  data: UpdateQuestionRequest
): Promise<Question> {
  const response = await httpClient.put<Question>(`${BASE_URL}/questions/${id}`, data);
  return response.data!;
}

/**
 * Eliminar una pregunta
 */
export async function deleteQuestion(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/questions/${id}`);
}

/**
 * Reordenar preguntas
 */
export async function reorderQuestions(
  questionIds: string[]
): Promise<Question[]> {
  const response = await httpClient.post<Question[]>(`${BASE_URL}/questions/reorder`, { questionIds });
  return response.data!;
}

/**
 * Duplicar una pregunta
 */
export async function duplicateQuestion(id: string): Promise<Question> {
  const response = await httpClient.post<Question>(`${BASE_URL}/questions/${id}/duplicate`);
  return response.data!;
}

// ============================================================================
// CUESTIONARIOS
// ============================================================================

/**
 * Listar cuestionarios con filtros
 */
export async function listQuestionnaires(
  params?: ListQuestionnairesParams
): Promise<PaginatedQuestionnaires> {
  const query = params ? buildQueryString(params as Record<string, unknown>) : '';
  const response = await httpClient.get<PaginatedQuestionnaires>(`${BASE_URL}/questionnaires${query}`);
  return response.data!;
}

/**
 * Obtener un cuestionario por ID
 */
export async function getQuestionnaire(id: string): Promise<Questionnaire> {
  const response = await httpClient.get<Questionnaire>(`${BASE_URL}/questionnaires/${id}`);
  return response.data!;
}

/**
 * Crear un nuevo cuestionario
 */
export async function createQuestionnaire(
  data: CreateQuestionnaireRequest
): Promise<Questionnaire> {
  const response = await httpClient.post<Questionnaire>(`${BASE_URL}/questionnaires`, data);
  return response.data!;
}

/**
 * Actualizar un cuestionario
 */
export async function updateQuestionnaire(
  id: string,
  data: UpdateQuestionnaireRequest
): Promise<Questionnaire> {
  const response = await httpClient.put<Questionnaire>(`${BASE_URL}/questionnaires/${id}`, data);
  return response.data!;
}

/**
 * Eliminar un cuestionario
 */
export async function deleteQuestionnaire(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/questionnaires/${id}`);
}

/**
 * Agregar pregunta a un cuestionario
 */
export async function addQuestionToQuestionnaire(
  questionnaireId: string,
  questionId: string
): Promise<Questionnaire> {
  const response = await httpClient.post<Questionnaire>(
    `${BASE_URL}/questionnaires/${questionnaireId}/questions`,
    { questionId }
  );
  return response.data!;
}

/**
 * Remover pregunta de un cuestionario
 */
export async function removeQuestionFromQuestionnaire(
  questionnaireId: string,
  questionId: string
): Promise<void> {
  await httpClient.delete(
    `${BASE_URL}/questionnaires/${questionnaireId}/questions/${questionId}`
  );
}

/**
 * Reordenar preguntas en un cuestionario
 */
export async function reorderQuestionnaireQuestions(
  questionnaireId: string,
  questionIds: string[]
): Promise<Questionnaire> {
  const response = await httpClient.post<Questionnaire>(
    `${BASE_URL}/questionnaires/${questionnaireId}/questions/reorder`,
    { questionIds }
  );
  return response.data!;
}

/**
 * Duplicar un cuestionario
 */
export async function duplicateQuestionnaire(id: string): Promise<Questionnaire> {
  const response = await httpClient.post<Questionnaire>(`${BASE_URL}/questionnaires/${id}/duplicate`);
  return response.data!;
}

/**
 * Activar un cuestionario
 */
export async function activateQuestionnaire(id: string): Promise<Questionnaire> {
  const response = await httpClient.post<Questionnaire>(`${BASE_URL}/questionnaires/${id}/activate`);
  return response.data!;
}

/**
 * Desactivar un cuestionario
 */
export async function deactivateQuestionnaire(id: string): Promise<Questionnaire> {
  const response = await httpClient.post<Questionnaire>(`${BASE_URL}/questionnaires/${id}/deactivate`);
  return response.data!;
}

// ============================================================================
// PERÍODOS DE EVALUACIÓN
// ============================================================================

/**
 * Listar períodos con filtros
 */
export async function listPeriods(
  params?: ListPeriodsParams
): Promise<PaginatedPeriods> {
  const query = params ? buildQueryString(params as Record<string, unknown>) : '';
  const response = await httpClient.get<PaginatedPeriods>(`${BASE_URL}/periods${query}`);
  return response.data!;
}

/**
 * Obtener un período por ID
 */
export async function getPeriod(id: string): Promise<EvaluationPeriod> {
  const response = await httpClient.get<EvaluationPeriod>(`${BASE_URL}/periods/${id}`);
  return response.data!;
}

/**
 * Crear un nuevo período
 */
export async function createPeriod(
  data: CreateEvaluationPeriodRequest
): Promise<EvaluationPeriod> {
  const response = await httpClient.post<EvaluationPeriod>(`${BASE_URL}/periods`, data);
  return response.data!;
}

/**
 * Actualizar un período
 */
export async function updatePeriod(
  id: string,
  data: UpdateEvaluationPeriodRequest
): Promise<EvaluationPeriod> {
  const response = await httpClient.put<EvaluationPeriod>(`${BASE_URL}/periods/${id}`, data);
  return response.data!;
}

/**
 * Eliminar un período
 */
export async function deletePeriod(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/periods/${id}`);
}

/**
 * Activar un período
 */
export async function activatePeriod(id: string): Promise<EvaluationPeriod> {
  const response = await httpClient.post<EvaluationPeriod>(`${BASE_URL}/periods/${id}/activate`);
  return response.data!;
}

/**
 * Cerrar un período
 */
export async function closePeriod(id: string): Promise<EvaluationPeriod> {
  const response = await httpClient.post<EvaluationPeriod>(`${BASE_URL}/periods/${id}/close`);
  return response.data!;
}

/**
 * Obtener estadísticas de un período
 */
export async function getPeriodStats(id: string): Promise<{
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  averageScore: number;
  completionRate: number;
  byDepartment: { department: string; completed: number; total: number }[];
}> {
  const response = await httpClient.get<{
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    averageScore: number;
    completionRate: number;
    byDepartment: { department: string; completed: number; total: number }[];
  }>(`${BASE_URL}/periods/${id}/stats`);
  return response.data!;
}

/**
 * Obtener período activo actual
 */
export async function getActivePeriod(): Promise<EvaluationPeriod | null> {
  const response = await httpClient.get<EvaluationPeriod | null>(`${BASE_URL}/periods/active`);
  return response.data!;
}

// ============================================================================
// EVALUACIONES
// ============================================================================

/**
 * Listar evaluaciones con filtros
 */
export async function listEvaluationsEvalin(
  params?: ListEvaluationsParams
): Promise<PaginatedEvaluations> {
  const query = params ? buildQueryString(params as Record<string, unknown>) : '';
  const response = await httpClient.get<PaginatedEvaluations>(`${BASE_URL}/evaluations${query}`);
  return response.data!;
}

/**
 * Obtener una evaluación por ID
 */
export async function getEvaluationEvalin(id: string): Promise<InstructorEvaluation> {
  const response = await httpClient.get<InstructorEvaluation>(`${BASE_URL}/evaluations/${id}`);
  return response.data!;
}

/**
 * Obtener evaluaciones pendientes del usuario actual
 */
export async function getMyPendingEvaluations(): Promise<InstructorEvaluation[]> {
  const response = await httpClient.get<InstructorEvaluation[]>(`${BASE_URL}/evaluations/my/pending`);
  return response.data!;
}

/**
 * Obtener evaluaciones completadas del usuario actual
 */
export async function getMyCompletedEvaluations(): Promise<InstructorEvaluation[]> {
  const response = await httpClient.get<InstructorEvaluation[]>(`${BASE_URL}/evaluations/my/completed`);
  return response.data!;
}

/**
 * Iniciar una evaluación
 */
export async function startEvaluation(
  periodId: string,
  instructorId: string,
  groupId?: string
): Promise<InstructorEvaluation> {
  const response = await httpClient.post<InstructorEvaluation>(
    `${BASE_URL}/evaluations/start`,
    { periodId, instructorId, groupId }
  );
  return response.data!;
}

/**
 * Guardar borrador de evaluación
 */
export async function saveDraftEvaluation(
  id: string,
  data: Partial<SubmitEvaluationRequest>
): Promise<InstructorEvaluation> {
  const response = await httpClient.put<InstructorEvaluation>(`${BASE_URL}/evaluations/${id}/draft`, data);
  return response.data!;
}

/**
 * Enviar evaluación completa
 */
export async function submitEvaluation(
  data: SubmitEvaluationRequest
): Promise<InstructorEvaluation> {
  const response = await httpClient.post<InstructorEvaluation>(`${BASE_URL}/evaluations/submit`, data);
  return response.data!;
}

/**
 * Cancelar una evaluación en progreso
 */
export async function cancelEvaluation(id: string): Promise<void> {
  await httpClient.post(`${BASE_URL}/evaluations/${id}/cancel`);
}

// ============================================================================
// COMENTARIOS
// ============================================================================

/**
 * Agregar comentario a una evaluación
 */
export async function addComment(
  data: AddCommentRequest
): Promise<{ id: string; content: string; createdAt: string }> {
  const response = await httpClient.post<{ id: string; content: string; createdAt: string }>(
    `${BASE_URL}/comments`,
    data
  );
  return response.data!;
}

/**
 * Listar comentarios de una evaluación
 */
export async function listComments(
  evaluationId: string
): Promise<{ id: string; content: string; isPrivate: boolean; createdAt: string }[]> {
  const response = await httpClient.get<{ id: string; content: string; isPrivate: boolean; createdAt: string }[]>(
    `${BASE_URL}/evaluations/${evaluationId}/comments`
  );
  return response.data!;
}

// ============================================================================
// REPORTES
// ============================================================================

/**
 * Obtener reporte de un período
 */
export async function getPeriodReport(periodId: string): Promise<PeriodReport> {
  const response = await httpClient.get<PeriodReport>(`${BASE_URL}/reports/period/${periodId}`);
  return response.data!;
}

/**
 * Obtener resumen de evaluación de un instructor
 */
export async function getInstructorEvaluationSummary(
  instructorId: string,
  periodId?: string
): Promise<InstructorEvaluationSummary> {
  const query = periodId ? buildQueryString({ periodId }) : '';
  const response = await httpClient.get<InstructorEvaluationSummary>(
    `${BASE_URL}/reports/instructor/${instructorId}${query}`
  );
  return response.data!;
}

/**
 * Obtener histórico de evaluaciones de un instructor
 */
export async function getInstructorEvaluationHistory(
  instructorId: string
): Promise<InstructorEvaluationSummary[]> {
  const response = await httpClient.get<InstructorEvaluationSummary[]>(
    `${BASE_URL}/reports/instructor/${instructorId}/history`
  );
  return response.data!;
}

/**
 * Obtener ranking de instructores
 */
export async function getInstructorRanking(
  periodId: string,
  limit?: number
): Promise<{
  instructorId: string;
  instructorName: string;
  score: number;
  rank: number;
  evaluationCount: number;
}[]> {
  const query = limit ? buildQueryString({ limit }) : '';
  const response = await httpClient.get<{
    instructorId: string;
    instructorName: string;
    score: number;
    rank: number;
    evaluationCount: number;
  }[]>(`${BASE_URL}/reports/ranking/${periodId}${query}`);
  return response.data!;
}

/**
 * Obtener comparativa entre períodos
 */
export async function getPeriodsComparison(
  periodIds: string[]
): Promise<{
  periods: { id: string; name: string; averageScore: number }[];
  categoryComparison: {
    categoryName: string;
    scores: { periodId: string; score: number }[];
  }[];
}> {
  const response = await httpClient.post<{
    periods: { id: string; name: string; averageScore: number }[];
    categoryComparison: {
      categoryName: string;
      scores: { periodId: string; score: number }[];
    }[];
  }>(`${BASE_URL}/reports/compare`, { periodIds });
  return response.data!;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * Obtener configuración de EvalinService
 */
export async function getEvalinConfig(): Promise<EvalinConfig> {
  const response = await httpClient.get<EvalinConfig>(`${BASE_URL}/config`);
  return response.data!;
}

/**
 * Actualizar configuración de EvalinService
 */
export async function updateEvalinConfig(
  data: Partial<EvalinConfig>
): Promise<EvalinConfig> {
  const response = await httpClient.put<EvalinConfig>(`${BASE_URL}/config`, data);
  return response.data!;
}

// ============================================================================
// DASHBOARD / ESTADÍSTICAS
// ============================================================================

/**
 * Obtener estadísticas del dashboard de evaluaciones
 */
export async function getEvaluationsDashboard(): Promise<{
  activePeriod: EvaluationPeriod | null;
  myPendingCount: number;
  myCompletedCount: number;
  globalStats: {
    totalEvaluations: number;
    completedEvaluations: number;
    averageScore: number;
    completionRate: number;
  };
  recentActivity: {
    type: 'completed' | 'started';
    evaluationId: string;
    timestamp: string;
  }[];
}> {
  const response = await httpClient.get<{
    activePeriod: EvaluationPeriod | null;
    myPendingCount: number;
    myCompletedCount: number;
    globalStats: {
      totalEvaluations: number;
      completedEvaluations: number;
      averageScore: number;
      completionRate: number;
    };
    recentActivity: {
      type: 'completed' | 'started';
      evaluationId: string;
      timestamp: string;
    }[];
  }>(`${BASE_URL}/evaluations/dashboard`);
  return response.data!;
}

/**
 * Obtener instructores disponibles para evaluar
 */
export async function getInstructorsToEvaluate(
  periodId: string
): Promise<{
  instructorId: string;
  instructorName: string;
  groupId: string;
  groupName: string;
  courseName: string;
  isEvaluated: boolean;
}[]> {
  const response = await httpClient.get<{
    instructorId: string;
    instructorName: string;
    groupId: string;
    groupName: string;
    courseName: string;
    isEvaluated: boolean;
  }[]>(`${BASE_URL}/periods/${periodId}/instructors-to-evaluate`);
  return response.data!;
}
