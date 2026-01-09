/**
 * Store para AIService
 * Gestión de estado para chat, análisis y recomendaciones
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { aiApi } from '@/lib/api/ai';
import type {
  ChatMessage,
  ChatSession,
  AnalysisResult,
  Recommendation,
  PredictiveDashboard,
  AIServiceStatus,
  SendMessageRequest,
  AnalysisRequest,
  RecommendationRequest,
} from '@/types/ai.types';

// ============================================================================
// TIPOS DEL STORE
// ============================================================================

interface AIState {
  // Chat
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isTyping: boolean;
  streamingContent: string;

  // Analysis
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;

  // Recommendations
  recommendations: Recommendation[];
  activeRecommendations: Recommendation[];

  // Dashboard
  predictiveDashboard: PredictiveDashboard | null;

  // Service Status
  serviceStatus: AIServiceStatus | null;
  isServiceAvailable: boolean;

  // Loading states
  isLoading: boolean;
  isSendingMessage: boolean;
  isAnalyzing: boolean;
  isLoadingRecommendations: boolean;

  // UI
  isChatOpen: boolean;
  selectedSuggestion: string | null;

  // Error
  error: string | null;
}

interface AIActions {
  // Chat
  sendMessage: (message: string, context?: SendMessageRequest['context']) => Promise<void>;
  createSession: (title?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  clearCurrentSession: () => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;

  // Analysis
  requestAnalysis: (request: AnalysisRequest) => Promise<AnalysisResult>;
  loadRecentAnalyses: () => Promise<void>;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;

  // Recommendations
  requestRecommendations: (request: RecommendationRequest) => Promise<void>;
  loadActiveRecommendations: () => Promise<void>;
  updateRecommendationStatus: (
    id: string,
    status: 'accepted' | 'rejected' | 'implemented',
    notes?: string
  ) => Promise<void>;

  // Dashboard
  loadPredictiveDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // Service
  checkServiceStatus: () => Promise<void>;

  // UI
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setSuggestion: (suggestion: string | null) => void;

  // Direct setters
  setCurrentSession: (session: ChatSession | null) => void;
  addMessageToSession: (message: ChatMessage) => void;

  // Error
  clearError: () => void;
}

type AIStore = AIState & AIActions;

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialState: AIState = {
  currentSession: null,
  sessions: [],
  isTyping: false,
  streamingContent: '',

  analyses: [],
  currentAnalysis: null,

  recommendations: [],
  activeRecommendations: [],

  predictiveDashboard: null,

  serviceStatus: null,
  isServiceAvailable: true,

  isLoading: false,
  isSendingMessage: false,
  isAnalyzing: false,
  isLoadingRecommendations: false,

  isChatOpen: false,
  selectedSuggestion: null,

  error: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useAIStore = create<AIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ======================================================================
        // CHAT
        // ======================================================================

        sendMessage: async (message: string, context?: SendMessageRequest['context']) => {
          const { currentSession } = get();

          // Crear sesión si no existe
          if (!currentSession) {
            await get().createSession();
          }

          const sessionId = get().currentSession?.id;

          // Agregar mensaje del usuario inmediatamente
          const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  messages: [...state.currentSession.messages, userMessage],
                }
              : null,
            isSendingMessage: true,
            isTyping: true,
            error: null,
          }));

          try {
            const response = await aiApi.chat.sendMessage({
              sessionId,
              message,
              context,
            });

            set((state) => ({
              currentSession: state.currentSession
                ? {
                    ...state.currentSession,
                    messages: [...state.currentSession.messages, response.message],
                    updatedAt: new Date().toISOString(),
                  }
                : null,
              isSendingMessage: false,
              isTyping: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al enviar mensaje',
              isSendingMessage: false,
              isTyping: false,
            });
          }
        },

        createSession: async (title?: string) => {
          set({ isLoading: true, error: null });
          try {
            const session = await aiApi.chat.createSession({ title });
            set((state) => ({
              currentSession: session,
              sessions: [session, ...state.sessions],
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al crear sesión',
              isLoading: false,
            });
          }
        },

        loadSession: async (sessionId: string) => {
          set({ isLoading: true, error: null });
          try {
            const session = await aiApi.chat.getSession(sessionId);
            set({ currentSession: session, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar sesión',
              isLoading: false,
            });
          }
        },

        deleteSession: async (sessionId: string) => {
          try {
            await aiApi.chat.deleteSession(sessionId);
            set((state) => ({
              sessions: state.sessions.filter((s) => s.id !== sessionId),
              currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al eliminar sesión',
            });
          }
        },

        loadSessions: async () => {
          set({ isLoading: true, error: null });
          try {
            const sessions = await aiApi.chat.listSessions();
            set({ sessions, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar sesiones',
              isLoading: false,
            });
          }
        },

        clearCurrentSession: () => set({ currentSession: null, streamingContent: '' }),

        setStreamingContent: (content: string) => set({ streamingContent: content }),

        appendStreamingContent: (chunk: string) =>
          set((state) => ({ streamingContent: state.streamingContent + chunk })),

        // ======================================================================
        // ANALYSIS
        // ======================================================================

        requestAnalysis: async (request: AnalysisRequest) => {
          set({ isAnalyzing: true, error: null });
          try {
            const result = await aiApi.analysis.request(request);
            set((state) => ({
              analyses: [result, ...state.analyses],
              currentAnalysis: result,
              isAnalyzing: false,
            }));
            return result;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al realizar análisis',
              isAnalyzing: false,
            });
            throw error;
          }
        },

        loadRecentAnalyses: async () => {
          set({ isLoading: true, error: null });
          try {
            const analyses = await aiApi.analysis.listRecent();
            set({ analyses, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar análisis',
              isLoading: false,
            });
          }
        },

        setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

        // ======================================================================
        // RECOMMENDATIONS
        // ======================================================================

        requestRecommendations: async (request: RecommendationRequest) => {
          set({ isLoadingRecommendations: true, error: null });
          try {
            const recommendations = await aiApi.recommendations.request(request);
            set((state) => ({
              recommendations: [...recommendations, ...state.recommendations],
              isLoadingRecommendations: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al obtener recomendaciones',
              isLoadingRecommendations: false,
            });
          }
        },

        loadActiveRecommendations: async () => {
          set({ isLoadingRecommendations: true, error: null });
          try {
            const activeRecommendations = await aiApi.recommendations.listActive();
            set({ activeRecommendations, isLoadingRecommendations: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar recomendaciones',
              isLoadingRecommendations: false,
            });
          }
        },

        updateRecommendationStatus: async (id, status, notes) => {
          try {
            const updated = await aiApi.recommendations.updateStatus(id, { status, notes });
            set((state) => ({
              recommendations: state.recommendations.map((r) => (r.id === id ? updated : r)),
              activeRecommendations: state.activeRecommendations.map((r) => (r.id === id ? updated : r)),
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al actualizar recomendación',
            });
          }
        },

        // ======================================================================
        // DASHBOARD
        // ======================================================================

        loadPredictiveDashboard: async () => {
          set({ isLoading: true, error: null });
          try {
            const dashboard = await aiApi.dashboard.getPredictive();
            set({ predictiveDashboard: dashboard, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar dashboard',
              isLoading: false,
            });
          }
        },

        refreshDashboard: async () => {
          set({ isLoading: true, error: null });
          try {
            const dashboard = await aiApi.dashboard.refresh();
            set({ predictiveDashboard: dashboard, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al refrescar dashboard',
              isLoading: false,
            });
          }
        },

        // ======================================================================
        // SERVICE
        // ======================================================================

        checkServiceStatus: async () => {
          try {
            const status = await aiApi.service.getStatus();
            set({ serviceStatus: status, isServiceAvailable: status.isAvailable });
          } catch {
            set({ isServiceAvailable: false });
          }
        },

        // ======================================================================
        // UI
        // ======================================================================

        toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
        openChat: () => set({ isChatOpen: true }),
        closeChat: () => set({ isChatOpen: false }),
        setSuggestion: (suggestion) => set({ selectedSuggestion: suggestion }),

        // ======================================================================
        // DIRECT SETTERS
        // ======================================================================

        setCurrentSession: (session) => set({ currentSession: session }),

        addMessageToSession: (message) =>
          set((state) => ({
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  messages: [...state.currentSession.messages, message],
                }
              : null,
          })),

        // ======================================================================
        // ERROR
        // ======================================================================

        clearError: () => set({ error: null }),
      }),
      {
        name: 'ai-store',
        partialize: (state) => ({
          sessions: state.sessions.slice(0, 10), // Persistir últimas 10 sesiones
        }),
      }
    ),
    { name: 'ai-store' }
  )
);

// ============================================================================
// SELECTORES
// ============================================================================

export const selectCurrentMessages = (state: AIState) =>
  state.currentSession?.messages || [];

export const selectRecentSessions = (state: AIState) =>
  state.sessions.slice(0, 5);

export const selectPendingRecommendations = (state: AIState) =>
  state.activeRecommendations.filter((r) => r.status === 'pending');

export const selectHighPriorityInsights = (state: AIState) =>
  state.predictiveDashboard?.keyInsights.filter(
    (i) => i.priority === 'high' || i.priority === 'critical'
  ) || [];

export const selectRiskStudentsCount = (state: AIState) =>
  state.predictiveDashboard?.riskStudents.length || 0;

export const selectIsAIBusy = (state: AIState) =>
  state.isSendingMessage || state.isAnalyzing || state.isTyping;
