/**
 * Tipos para AIService
 * Servicio de IA para análisis, chat y recomendaciones
 * Backend: Python FastAPI (único servicio no-Go)
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type AnalysisType = 'attendance' | 'performance' | 'risk' | 'trend' | 'impact';
export type RecommendationType = 'schedule' | 'intervention' | 'resource' | 'alert' | 'improvement';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export const ANALYSIS_TYPE_CONFIG: Record<AnalysisType, { label: string; description: string; icon: string }> = {
  attendance: { label: 'Asistencia', description: 'Análisis de patrones de asistencia', icon: 'calendar-check' },
  performance: { label: 'Rendimiento', description: 'Análisis de rendimiento académico', icon: 'trending-up' },
  risk: { label: 'Riesgo', description: 'Identificación de estudiantes en riesgo', icon: 'alert-triangle' },
  trend: { label: 'Tendencias', description: 'Tendencias y proyecciones', icon: 'activity' },
  impact: { label: 'Impacto', description: 'Análisis de impacto de intervenciones', icon: 'target' },
};

export const RECOMMENDATION_TYPE_CONFIG: Record<RecommendationType, { label: string; color: string; bgColor: string }> = {
  schedule: { label: 'Horarios', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  intervention: { label: 'Intervención', color: 'text-red-600', bgColor: 'bg-red-100' },
  resource: { label: 'Recursos', color: 'text-green-600', bgColor: 'bg-green-100' },
  alert: { label: 'Alerta', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  improvement: { label: 'Mejora', color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Baja', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  medium: { label: 'Media', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: 'Alta', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  critical: { label: 'Crítica', color: 'text-red-600', bgColor: 'bg-red-100' },
};

// ============================================================================
// INTERFACES - CHAT
// ============================================================================

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
  };
  attachments?: Array<{
    type: 'chart' | 'table' | 'link';
    data: unknown;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  context?: {
    entityType?: 'student' | 'group' | 'program' | 'instructor';
    entityId?: string;
    entityName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
  relatedQueries?: string[];
  confidence?: number;
}

// ============================================================================
// INTERFACES - ANÁLISIS
// ============================================================================

export interface AnalysisRequest {
  type: AnalysisType;
  entityType: 'student' | 'group' | 'program' | 'instructor' | 'center';
  entityId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  parameters?: Record<string, unknown>;
}

export interface AnalysisMetric {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  benchmark?: number;
  status?: 'good' | 'warning' | 'critical';
}

export interface AnalysisInsight {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  category: string;
  affectedEntities?: Array<{
    type: string;
    id: string;
    name: string;
  }>;
  suggestedActions?: string[];
}

export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  status: AnalysisStatus;
  requestedAt: string;
  completedAt?: string;
  summary: string;
  metrics: AnalysisMetric[];
  insights: AnalysisInsight[];
  charts?: Array<{
    type: 'line' | 'bar' | 'pie' | 'area' | 'radar';
    title: string;
    data: unknown;
  }>;
  rawData?: unknown;
}

// ============================================================================
// INTERFACES - RECOMENDACIONES
// ============================================================================

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: PriorityLevel;
  reasoning: string;
  confidence: number; // 0-100
  impact: {
    area: string;
    estimatedImprovement: string;
    timeframe: string;
  };
  actions: Array<{
    order: number;
    action: string;
    responsible?: string;
    deadline?: string;
  }>;
  relatedEntities?: Array<{
    type: string;
    id: string;
    name: string;
  }>;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  acceptedAt?: string;
  implementedAt?: string;
  createdAt: string;
}

export interface RecommendationRequest {
  type: RecommendationType;
  context: {
    entityType: 'student' | 'group' | 'program' | 'center';
    entityId?: string;
    currentSituation?: string;
    goals?: string[];
  };
  constraints?: {
    budget?: number;
    timeframe?: string;
    resources?: string[];
  };
}

// ============================================================================
// INTERFACES - VALIDACIÓN CSV
// ============================================================================

export interface CSVValidationRequest {
  fileContent: string;
  fileType: 'students' | 'schedules' | 'attendance' | 'users';
  options?: {
    strictMode?: boolean;
    autoCorrect?: boolean;
  };
}

export interface CSVValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
  suggestion?: string;
  autoCorrectValue?: string;
}

export interface CSVValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  errors: CSVValidationError[];
  warnings: CSVValidationError[];
  correctedContent?: string;
  summary: {
    duplicates: number;
    missingRequired: number;
    formatErrors: number;
    dataTypeErrors: number;
  };
}

// ============================================================================
// INTERFACES - PREDICCIONES
// ============================================================================

export interface PredictionRequest {
  targetMetric: 'attendance' | 'dropout' | 'performance' | 'completion';
  entityType: 'student' | 'group' | 'program';
  entityId?: string;
  horizon: '1week' | '1month' | '3months' | '6months';
}

export interface PredictionResult {
  id: string;
  targetMetric: string;
  entityType: string;
  entityId?: string;
  horizon: string;
  predictions: Array<{
    date: string;
    value: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }>;
  factors: Array<{
    name: string;
    impact: number; // -100 to 100
    description: string;
  }>;
  accuracy: {
    historical: number;
    modelType: string;
  };
  generatedAt: string;
}

// ============================================================================
// INTERFACES - DASHBOARD PREDICTIVO
// ============================================================================

export interface PredictiveDashboard {
  riskStudents: Array<{
    studentId: string;
    studentName: string;
    groupName: string;
    riskScore: number;
    riskFactors: string[];
    trend: 'improving' | 'stable' | 'declining';
  }>;
  attendanceForecast: {
    nextWeek: number;
    trend: 'up' | 'down' | 'stable';
    alerts: string[];
  };
  interventionSuggestions: Recommendation[];
  keyInsights: AnalysisInsight[];
  lastUpdated: string;
}

// ============================================================================
// DTOs - REQUEST/RESPONSE
// ============================================================================

export interface SendMessageRequest {
  sessionId?: string;
  message: string;
  context?: {
    entityType?: string;
    entityId?: string;
  };
}

export interface CreateSessionRequest {
  title?: string;
  initialContext?: {
    entityType: string;
    entityId: string;
    entityName: string;
  };
}

export interface UpdateRecommendationStatusRequest {
  status: 'accepted' | 'rejected' | 'implemented';
  notes?: string;
}

// ============================================================================
// INTERFACES - HISTORIAL Y FILTROS
// ============================================================================

export interface AIHistoryEntry {
  id: string;
  type: 'chat' | 'analysis' | 'recommendation' | 'prediction';
  title: string;
  summary: string;
  entityType?: string;
  entityName?: string;
  createdAt: string;
  result?: unknown;
}

export interface AIFilters {
  type?: 'chat' | 'analysis' | 'recommendation' | 'prediction';
  dateFrom?: string;
  dateTo?: string;
  entityType?: string;
}

// ============================================================================
// INTERFACES - ESTADO DEL SERVICIO
// ============================================================================

export interface AIServiceStatus {
  isAvailable: boolean;
  latency: number; // ms
  modelVersion: string;
  capabilities: string[];
  quotaUsed: number;
  quotaLimit: number;
  lastHealthCheck: string;
}

// ============================================================================
// CONSTANTES DE UI
// ============================================================================

export const SUGGESTED_QUERIES = [
  '¿Cuáles estudiantes tienen mayor riesgo de deserción?',
  'Muéstrame el análisis de asistencia del último mes',
  '¿Qué grupos tienen menor rendimiento?',
  'Recomienda acciones para mejorar la asistencia',
  '¿Cuáles son las tendencias de evaluación de instructores?',
  'Analiza el impacto de las intervenciones recientes',
  '¿Qué estudiantes necesitan seguimiento prioritario?',
  'Genera un reporte de riesgos por programa',
];

export const QUICK_ACTIONS = [
  { id: 'risk-analysis', label: 'Análisis de Riesgo', icon: 'alert-triangle', type: 'analysis' as const },
  { id: 'attendance-report', label: 'Reporte Asistencia', icon: 'calendar', type: 'analysis' as const },
  { id: 'recommendations', label: 'Recomendaciones', icon: 'lightbulb', type: 'recommendation' as const },
  { id: 'predictions', label: 'Predicciones', icon: 'trending-up', type: 'prediction' as const },
];
