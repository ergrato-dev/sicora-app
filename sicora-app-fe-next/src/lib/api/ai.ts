/**
 * API Client para AIService
 * Backend: Python FastAPI (único servicio no-Go)
 */

import { httpClient } from './http-client';
import type {
  ChatMessage,
  ChatSession,
  ChatResponse,
  AnalysisRequest,
  AnalysisResult,
  RecommendationRequest,
  Recommendation,
  CSVValidationRequest,
  CSVValidationResult,
  PredictionRequest,
  PredictionResult,
  PredictiveDashboard,
  SendMessageRequest,
  CreateSessionRequest,
  UpdateRecommendationStatusRequest,
  AIHistoryEntry,
  AIFilters,
  AIServiceStatus,
} from '@/types/ai.types';

const BASE_URL = '/api/v1/ai';

// ============================================================================
// CHAT
// ============================================================================

const chat = {
  /**
   * Enviar mensaje al asistente
   */
  async sendMessage(data: SendMessageRequest): Promise<ChatResponse> {
    const response = await httpClient.post<ChatResponse>(`${BASE_URL}/chat`, data);
    return response.data!;
  },

  /**
   * Crear nueva sesión de chat
   */
  async createSession(data?: CreateSessionRequest): Promise<ChatSession> {
    const response = await httpClient.post<ChatSession>(`${BASE_URL}/chat/sessions`, data || {});
    return response.data!;
  },

  /**
   * Obtener sesión de chat
   */
  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await httpClient.get<ChatSession>(`${BASE_URL}/chat/sessions/${sessionId}`);
    return response.data!;
  },

  /**
   * Listar sesiones de chat del usuario
   */
  async listSessions(): Promise<ChatSession[]> {
    const response = await httpClient.get<ChatSession[]>(`${BASE_URL}/chat/sessions`);
    return response.data!;
  },

  /**
   * Eliminar sesión de chat
   */
  async deleteSession(sessionId: string): Promise<void> {
    await httpClient.delete(`${BASE_URL}/chat/sessions/${sessionId}`);
  },

  /**
   * Obtener sugerencias de consultas
   */
  async getSuggestions(context?: string): Promise<string[]> {
    const params = context ? `?context=${encodeURIComponent(context)}` : '';
    const response = await httpClient.get<string[]>(`${BASE_URL}/chat/suggestions${params}`);
    return response.data!;
  },

  /**
   * Streaming de respuesta (para respuestas largas)
   */
  async streamMessage(
    data: SendMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: (message: ChatMessage) => void
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al conectar con el asistente');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No se pudo iniciar el streaming');
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullContent += chunk;
      onChunk(chunk);
    }

    // Construir mensaje final
    const finalMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: fullContent,
      timestamp: new Date().toISOString(),
    };
    onComplete(finalMessage);
  },
};

// ============================================================================
// ANÁLISIS
// ============================================================================

const analysis = {
  /**
   * Solicitar análisis
   */
  async request(data: AnalysisRequest): Promise<AnalysisResult> {
    const response = await httpClient.post<AnalysisResult>(`${BASE_URL}/analyze`, data);
    return response.data!;
  },

  /**
   * Obtener resultado de análisis
   */
  async getResult(analysisId: string): Promise<AnalysisResult> {
    const response = await httpClient.get<AnalysisResult>(`${BASE_URL}/analyze/${analysisId}`);
    return response.data!;
  },

  /**
   * Listar análisis recientes
   */
  async listRecent(limit = 10): Promise<AnalysisResult[]> {
    const response = await httpClient.get<AnalysisResult[]>(`${BASE_URL}/analyze/recent?limit=${limit}`);
    return response.data!;
  },

  /**
   * Análisis rápido de asistencia
   */
  async quickAttendanceAnalysis(entityType: string, entityId?: string): Promise<AnalysisResult> {
    const response = await httpClient.post<AnalysisResult>(`${BASE_URL}/analyze/attendance`, {
      entityType,
      entityId,
    });
    return response.data!;
  },

  /**
   * Análisis de riesgo de deserción
   */
  async riskAnalysis(entityType: 'student' | 'group' | 'program', entityId?: string): Promise<AnalysisResult> {
    const response = await httpClient.post<AnalysisResult>(`${BASE_URL}/analyze/risk`, {
      type: 'risk',
      entityType,
      entityId,
    });
    return response.data!;
  },

  /**
   * Análisis de tendencias
   */
  async trendAnalysis(
    metric: string,
    entityType: string,
    dateRange: { from: string; to: string }
  ): Promise<AnalysisResult> {
    const response = await httpClient.post<AnalysisResult>(`${BASE_URL}/analyze/trends`, {
      type: 'trend',
      entityType,
      parameters: { metric },
      dateRange,
    });
    return response.data!;
  },
};

// ============================================================================
// RECOMENDACIONES
// ============================================================================

const recommendations = {
  /**
   * Solicitar recomendaciones
   */
  async request(data: RecommendationRequest): Promise<Recommendation[]> {
    const response = await httpClient.post<Recommendation[]>(`${BASE_URL}/recommendations`, data);
    return response.data!;
  },

  /**
   * Obtener recomendación específica
   */
  async get(recommendationId: string): Promise<Recommendation> {
    const response = await httpClient.get<Recommendation>(`${BASE_URL}/recommendations/${recommendationId}`);
    return response.data!;
  },

  /**
   * Listar recomendaciones activas
   */
  async listActive(): Promise<Recommendation[]> {
    const response = await httpClient.get<Recommendation[]>(`${BASE_URL}/recommendations/active`);
    return response.data!;
  },

  /**
   * Actualizar estado de recomendación
   */
  async updateStatus(recommendationId: string, data: UpdateRecommendationStatusRequest): Promise<Recommendation> {
    const response = await httpClient.patch<Recommendation>(
      `${BASE_URL}/recommendations/${recommendationId}/status`,
      data
    );
    return response.data!;
  },

  /**
   * Obtener recomendaciones para optimización de horarios
   */
  async getScheduleOptimization(groupId?: string): Promise<Recommendation[]> {
    const params = groupId ? `?groupId=${groupId}` : '';
    const response = await httpClient.get<Recommendation[]>(`${BASE_URL}/recommendations/schedule${params}`);
    return response.data!;
  },

  /**
   * Obtener recomendaciones de intervención
   */
  async getInterventionSuggestions(studentId?: string): Promise<Recommendation[]> {
    const params = studentId ? `?studentId=${studentId}` : '';
    const response = await httpClient.get<Recommendation[]>(`${BASE_URL}/recommendations/interventions${params}`);
    return response.data!;
  },
};

// ============================================================================
// VALIDACIÓN CSV
// ============================================================================

const csvValidation = {
  /**
   * Validar archivo CSV
   */
  async validate(data: CSVValidationRequest): Promise<CSVValidationResult> {
    const response = await httpClient.post<CSVValidationResult>(`${BASE_URL}/validate-csv`, data);
    return response.data!;
  },

  /**
   * Validar y auto-corregir CSV
   */
  async validateAndCorrect(data: CSVValidationRequest): Promise<CSVValidationResult> {
    const response = await httpClient.post<CSVValidationResult>(`${BASE_URL}/validate-csv`, {
      ...data,
      options: { ...data.options, autoCorrect: true },
    });
    return response.data!;
  },

  /**
   * Obtener plantilla CSV
   */
  async getTemplate(fileType: 'students' | 'schedules' | 'attendance' | 'users'): Promise<string> {
    const response = await httpClient.get<{ template: string }>(`${BASE_URL}/csv-templates/${fileType}`);
    return response.data!.template;
  },
};

// ============================================================================
// PREDICCIONES
// ============================================================================

const predictions = {
  /**
   * Solicitar predicción
   */
  async request(data: PredictionRequest): Promise<PredictionResult> {
    const response = await httpClient.post<PredictionResult>(`${BASE_URL}/predictions`, data);
    return response.data!;
  },

  /**
   * Obtener predicción de asistencia
   */
  async attendanceForecast(
    entityType: 'student' | 'group' | 'program',
    entityId?: string,
    horizon: '1week' | '1month' = '1week'
  ): Promise<PredictionResult> {
    const response = await httpClient.post<PredictionResult>(`${BASE_URL}/predictions/attendance`, {
      targetMetric: 'attendance',
      entityType,
      entityId,
      horizon,
    });
    return response.data!;
  },

  /**
   * Obtener predicción de deserción
   */
  async dropoutRisk(
    entityType: 'student' | 'group' | 'program',
    entityId?: string
  ): Promise<PredictionResult> {
    const response = await httpClient.post<PredictionResult>(`${BASE_URL}/predictions/dropout`, {
      targetMetric: 'dropout',
      entityType,
      entityId,
      horizon: '3months',
    });
    return response.data!;
  },
};

// ============================================================================
// DASHBOARD PREDICTIVO
// ============================================================================

const dashboard = {
  /**
   * Obtener dashboard predictivo
   */
  async getPredictive(): Promise<PredictiveDashboard> {
    const response = await httpClient.get<PredictiveDashboard>(`${BASE_URL}/dashboard/predictive`);
    return response.data!;
  },

  /**
   * Obtener estudiantes en riesgo
   */
  async getRiskStudents(limit = 10): Promise<PredictiveDashboard['riskStudents']> {
    const response = await httpClient.get<PredictiveDashboard['riskStudents']>(
      `${BASE_URL}/dashboard/risk-students?limit=${limit}`
    );
    return response.data!;
  },

  /**
   * Obtener insights clave
   */
  async getKeyInsights(): Promise<PredictiveDashboard['keyInsights']> {
    const response = await httpClient.get<PredictiveDashboard['keyInsights']>(`${BASE_URL}/dashboard/insights`);
    return response.data!;
  },

  /**
   * Refrescar dashboard
   */
  async refresh(): Promise<PredictiveDashboard> {
    const response = await httpClient.post<PredictiveDashboard>(`${BASE_URL}/dashboard/refresh`, {});
    return response.data!;
  },
};

// ============================================================================
// HISTORIAL
// ============================================================================

const history = {
  /**
   * Obtener historial de interacciones con IA
   */
  async list(filters?: AIFilters, page = 1, pageSize = 20): Promise<{
    items: AIHistoryEntry[];
    total: number;
  }> {
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

    const response = await httpClient.get<{ items: AIHistoryEntry[]; total: number }>(
      `${BASE_URL}/history?${params}`
    );
    return response.data!;
  },

  /**
   * Eliminar entrada del historial
   */
  async delete(entryId: string): Promise<void> {
    await httpClient.delete(`${BASE_URL}/history/${entryId}`);
  },

  /**
   * Limpiar historial
   */
  async clear(): Promise<void> {
    await httpClient.delete(`${BASE_URL}/history`);
  },
};

// ============================================================================
// ESTADO DEL SERVICIO
// ============================================================================

const service = {
  /**
   * Verificar estado del servicio IA
   */
  async getStatus(): Promise<AIServiceStatus> {
    const response = await httpClient.get<AIServiceStatus>(`${BASE_URL}/status`);
    return response.data!;
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await httpClient.get(`${BASE_URL}/health`);
      return true;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export const aiApi = {
  chat,
  analysis,
  recommendations,
  csvValidation,
  predictions,
  dashboard,
  history,
  service,
};

export default aiApi;
