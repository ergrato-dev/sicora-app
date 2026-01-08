/**
 * Store para EvalinService - Evaluación de Instructores
 * Gestión de estado con Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Question,
  Questionnaire,
  EvaluationPeriod,
  InstructorEvaluation,
  QuestionCategory,
  QuestionnaireStatus,
  PeriodStatus,
  EvaluationStatus,
  EvaluatorRole,
  QuestionType,
  InstructorEvaluationSummary,
  QuestionResponse,
} from '@/types/evalin.types';

// ============================================================================
// TIPOS DEL STORE
// ============================================================================

interface QuestionsFilters {
  search: string;
  categoryId: string | null;
  type: QuestionType | null;
  isActive: boolean | null;
}

interface QuestionnairesFilters {
  search: string;
  status: QuestionnaireStatus | null;
  evaluatorRole: EvaluatorRole | null;
}

interface PeriodsFilters {
  search: string;
  status: PeriodStatus | null;
  year: number | null;
}

interface EvaluationsFilters {
  periodId: string | null;
  instructorId: string | null;
  status: EvaluationStatus | null;
  groupId: string | null;
}

interface EvalinState {
  // Datos
  categories: QuestionCategory[];
  questions: Question[];
  questionnaires: Questionnaire[];
  periods: EvaluationPeriod[];
  evaluations: InstructorEvaluation[];
  activePeriod: EvaluationPeriod | null;
  
  // Selección actual
  selectedCategory: QuestionCategory | null;
  selectedQuestion: Question | null;
  selectedQuestionnaire: Questionnaire | null;
  selectedPeriod: EvaluationPeriod | null;
  selectedEvaluation: InstructorEvaluation | null;
  
  // Evaluación en progreso
  currentEvaluation: {
    periodId: string;
    instructorId: string;
    questionnaireId: string;
    responses: QuestionResponse[];
    generalComments: string;
    suggestions: string;
    startedAt: string;
  } | null;
  
  // Reportes
  instructorSummary: InstructorEvaluationSummary | null;
  
  // Filtros
  questionsFilters: QuestionsFilters;
  questionnairesFilters: QuestionnairesFilters;
  periodsFilters: PeriodsFilters;
  evaluationsFilters: EvaluationsFilters;
  
  // Paginación
  questionsPagination: { page: number; pageSize: number; total: number };
  questionnairesPagination: { page: number; pageSize: number; total: number };
  periodsPagination: { page: number; pageSize: number; total: number };
  evaluationsPagination: { page: number; pageSize: number; total: number };
  
  // Estados de UI
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Modales
  modals: {
    questionEditor: boolean;
    questionnaireEditor: boolean;
    periodEditor: boolean;
    evaluationForm: boolean;
    reportViewer: boolean;
  };
  
  // Vista actual
  currentView: 'questions' | 'questionnaires' | 'periods' | 'evaluations' | 'reports';
}

interface EvalinActions {
  // Categorías
  setCategories: (categories: QuestionCategory[]) => void;
  addCategory: (category: QuestionCategory) => void;
  updateCategory: (id: string, data: Partial<QuestionCategory>) => void;
  removeCategory: (id: string) => void;
  setSelectedCategory: (category: QuestionCategory | null) => void;
  
  // Preguntas
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, data: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  setSelectedQuestion: (question: Question | null) => void;
  setQuestionsFilters: (filters: Partial<QuestionsFilters>) => void;
  resetQuestionsFilters: () => void;
  
  // Cuestionarios
  setQuestionnaires: (questionnaires: Questionnaire[]) => void;
  addQuestionnaire: (questionnaire: Questionnaire) => void;
  updateQuestionnaire: (id: string, data: Partial<Questionnaire>) => void;
  removeQuestionnaire: (id: string) => void;
  setSelectedQuestionnaire: (questionnaire: Questionnaire | null) => void;
  setQuestionnairesFilters: (filters: Partial<QuestionnairesFilters>) => void;
  resetQuestionnairesFilters: () => void;
  
  // Períodos
  setPeriods: (periods: EvaluationPeriod[]) => void;
  addPeriod: (period: EvaluationPeriod) => void;
  updatePeriod: (id: string, data: Partial<EvaluationPeriod>) => void;
  removePeriod: (id: string) => void;
  setSelectedPeriod: (period: EvaluationPeriod | null) => void;
  setActivePeriod: (period: EvaluationPeriod | null) => void;
  setPeriodsFilters: (filters: Partial<PeriodsFilters>) => void;
  resetPeriodsFilters: () => void;
  
  // Evaluaciones
  setEvaluations: (evaluations: InstructorEvaluation[]) => void;
  addEvaluation: (evaluation: InstructorEvaluation) => void;
  updateEvaluation: (id: string, data: Partial<InstructorEvaluation>) => void;
  removeEvaluation: (id: string) => void;
  setSelectedEvaluation: (evaluation: InstructorEvaluation | null) => void;
  setEvaluationsFilters: (filters: Partial<EvaluationsFilters>) => void;
  resetEvaluationsFilters: () => void;
  
  // Evaluación en progreso
  startNewEvaluation: (periodId: string, instructorId: string, questionnaireId: string) => void;
  updateCurrentResponse: (questionId: string, value: string | number | string[]) => void;
  updateCurrentComments: (comments: string) => void;
  updateCurrentSuggestions: (suggestions: string) => void;
  clearCurrentEvaluation: () => void;
  
  // Reportes
  setInstructorSummary: (summary: InstructorEvaluationSummary | null) => void;
  
  // Paginación
  setQuestionsPagination: (pagination: Partial<EvalinState['questionsPagination']>) => void;
  setQuestionnairesPagination: (pagination: Partial<EvalinState['questionnairesPagination']>) => void;
  setPeriodsPagination: (pagination: Partial<EvalinState['periodsPagination']>) => void;
  setEvaluationsPagination: (pagination: Partial<EvalinState['evaluationsPagination']>) => void;
  
  // Estados de UI
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  
  // Modales
  openModal: (modal: keyof EvalinState['modals']) => void;
  closeModal: (modal: keyof EvalinState['modals']) => void;
  closeAllModals: () => void;
  
  // Vista
  setCurrentView: (view: EvalinState['currentView']) => void;
  
  // Reset
  resetStore: () => void;
}

type EvalinStore = EvalinState & EvalinActions;

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialFilters = {
  questions: {
    search: '',
    categoryId: null,
    type: null,
    isActive: null,
  } as QuestionsFilters,
  questionnaires: {
    search: '',
    status: null,
    evaluatorRole: null,
  } as QuestionnairesFilters,
  periods: {
    search: '',
    status: null,
    year: null,
  } as PeriodsFilters,
  evaluations: {
    periodId: null,
    instructorId: null,
    status: null,
    groupId: null,
  } as EvaluationsFilters,
};

const initialPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
};

const initialModals = {
  questionEditor: false,
  questionnaireEditor: false,
  periodEditor: false,
  evaluationForm: false,
  reportViewer: false,
};

const initialState: EvalinState = {
  categories: [],
  questions: [],
  questionnaires: [],
  periods: [],
  evaluations: [],
  activePeriod: null,
  
  selectedCategory: null,
  selectedQuestion: null,
  selectedQuestionnaire: null,
  selectedPeriod: null,
  selectedEvaluation: null,
  
  currentEvaluation: null,
  instructorSummary: null,
  
  questionsFilters: initialFilters.questions,
  questionnairesFilters: initialFilters.questionnaires,
  periodsFilters: initialFilters.periods,
  evaluationsFilters: initialFilters.evaluations,
  
  questionsPagination: { ...initialPagination },
  questionnairesPagination: { ...initialPagination },
  periodsPagination: { ...initialPagination },
  evaluationsPagination: { ...initialPagination },
  
  isLoading: false,
  isSaving: false,
  error: null,
  
  modals: { ...initialModals },
  currentView: 'questionnaires',
};

// ============================================================================
// STORE
// ============================================================================

export const useEvalinStore = create<EvalinStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ======================================================================
      // CATEGORÍAS
      // ======================================================================
      
      setCategories: (categories) => set({ categories }),
      
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, category],
        })),
      
      updateCategory: (id, data) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      
      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
      
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // ======================================================================
      // PREGUNTAS
      // ======================================================================
      
      setQuestions: (questions) => set({ questions }),
      
      addQuestion: (question) =>
        set((state) => ({
          questions: [...state.questions, question],
        })),
      
      updateQuestion: (id, data) =>
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, ...data } : q
          ),
        })),
      
      removeQuestion: (id) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
        })),
      
      setSelectedQuestion: (question) => set({ selectedQuestion: question }),
      
      setQuestionsFilters: (filters) =>
        set((state) => ({
          questionsFilters: { ...state.questionsFilters, ...filters },
          questionsPagination: { ...state.questionsPagination, page: 1 },
        })),
      
      resetQuestionsFilters: () =>
        set({
          questionsFilters: initialFilters.questions,
          questionsPagination: { ...initialPagination },
        }),

      // ======================================================================
      // CUESTIONARIOS
      // ======================================================================
      
      setQuestionnaires: (questionnaires) => set({ questionnaires }),
      
      addQuestionnaire: (questionnaire) =>
        set((state) => ({
          questionnaires: [...state.questionnaires, questionnaire],
        })),
      
      updateQuestionnaire: (id, data) =>
        set((state) => ({
          questionnaires: state.questionnaires.map((q) =>
            q.id === id ? { ...q, ...data } : q
          ),
        })),
      
      removeQuestionnaire: (id) =>
        set((state) => ({
          questionnaires: state.questionnaires.filter((q) => q.id !== id),
        })),
      
      setSelectedQuestionnaire: (questionnaire) =>
        set({ selectedQuestionnaire: questionnaire }),
      
      setQuestionnairesFilters: (filters) =>
        set((state) => ({
          questionnairesFilters: { ...state.questionnairesFilters, ...filters },
          questionnairesPagination: { ...state.questionnairesPagination, page: 1 },
        })),
      
      resetQuestionnairesFilters: () =>
        set({
          questionnairesFilters: initialFilters.questionnaires,
          questionnairesPagination: { ...initialPagination },
        }),

      // ======================================================================
      // PERÍODOS
      // ======================================================================
      
      setPeriods: (periods) => set({ periods }),
      
      addPeriod: (period) =>
        set((state) => ({
          periods: [...state.periods, period],
        })),
      
      updatePeriod: (id, data) =>
        set((state) => ({
          periods: state.periods.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      
      removePeriod: (id) =>
        set((state) => ({
          periods: state.periods.filter((p) => p.id !== id),
        })),
      
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      
      setActivePeriod: (period) => set({ activePeriod: period }),
      
      setPeriodsFilters: (filters) =>
        set((state) => ({
          periodsFilters: { ...state.periodsFilters, ...filters },
          periodsPagination: { ...state.periodsPagination, page: 1 },
        })),
      
      resetPeriodsFilters: () =>
        set({
          periodsFilters: initialFilters.periods,
          periodsPagination: { ...initialPagination },
        }),

      // ======================================================================
      // EVALUACIONES
      // ======================================================================
      
      setEvaluations: (evaluations) => set({ evaluations }),
      
      addEvaluation: (evaluation) =>
        set((state) => ({
          evaluations: [...state.evaluations, evaluation],
        })),
      
      updateEvaluation: (id, data) =>
        set((state) => ({
          evaluations: state.evaluations.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),
      
      removeEvaluation: (id) =>
        set((state) => ({
          evaluations: state.evaluations.filter((e) => e.id !== id),
        })),
      
      setSelectedEvaluation: (evaluation) =>
        set({ selectedEvaluation: evaluation }),
      
      setEvaluationsFilters: (filters) =>
        set((state) => ({
          evaluationsFilters: { ...state.evaluationsFilters, ...filters },
          evaluationsPagination: { ...state.evaluationsPagination, page: 1 },
        })),
      
      resetEvaluationsFilters: () =>
        set({
          evaluationsFilters: initialFilters.evaluations,
          evaluationsPagination: { ...initialPagination },
        }),

      // ======================================================================
      // EVALUACIÓN EN PROGRESO
      // ======================================================================
      
      startNewEvaluation: (periodId, instructorId, questionnaireId) =>
        set({
          currentEvaluation: {
            periodId,
            instructorId,
            questionnaireId,
            responses: [],
            generalComments: '',
            suggestions: '',
            startedAt: new Date().toISOString(),
          },
        }),
      
      updateCurrentResponse: (questionId, value) =>
        set((state) => {
          if (!state.currentEvaluation) return state;
          
          const existingIndex = state.currentEvaluation.responses.findIndex(
            (r) => r.questionId === questionId
          );
          
          const newResponse: QuestionResponse = {
            questionId,
            value,
          };
          
          const responses =
            existingIndex >= 0
              ? state.currentEvaluation.responses.map((r, i) =>
                  i === existingIndex ? newResponse : r
                )
              : [...state.currentEvaluation.responses, newResponse];
          
          return {
            currentEvaluation: {
              ...state.currentEvaluation,
              responses,
            },
          };
        }),
      
      updateCurrentComments: (comments) =>
        set((state) => {
          if (!state.currentEvaluation) return state;
          return {
            currentEvaluation: {
              ...state.currentEvaluation,
              generalComments: comments,
            },
          };
        }),
      
      updateCurrentSuggestions: (suggestions) =>
        set((state) => {
          if (!state.currentEvaluation) return state;
          return {
            currentEvaluation: {
              ...state.currentEvaluation,
              suggestions,
            },
          };
        }),
      
      clearCurrentEvaluation: () => set({ currentEvaluation: null }),

      // ======================================================================
      // REPORTES
      // ======================================================================
      
      setInstructorSummary: (summary) => set({ instructorSummary: summary }),

      // ======================================================================
      // PAGINACIÓN
      // ======================================================================
      
      setQuestionsPagination: (pagination) =>
        set((state) => ({
          questionsPagination: { ...state.questionsPagination, ...pagination },
        })),
      
      setQuestionnairesPagination: (pagination) =>
        set((state) => ({
          questionnairesPagination: {
            ...state.questionnairesPagination,
            ...pagination,
          },
        })),
      
      setPeriodsPagination: (pagination) =>
        set((state) => ({
          periodsPagination: { ...state.periodsPagination, ...pagination },
        })),
      
      setEvaluationsPagination: (pagination) =>
        set((state) => ({
          evaluationsPagination: {
            ...state.evaluationsPagination,
            ...pagination,
          },
        })),

      // ======================================================================
      // ESTADOS DE UI
      // ======================================================================
      
      setLoading: (isLoading) => set({ isLoading }),
      setSaving: (isSaving) => set({ isSaving }),
      setError: (error) => set({ error }),

      // ======================================================================
      // MODALES
      // ======================================================================
      
      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
        })),
      
      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
        })),
      
      closeAllModals: () => set({ modals: { ...initialModals } }),

      // ======================================================================
      // VISTA
      // ======================================================================
      
      setCurrentView: (currentView) => set({ currentView }),

      // ======================================================================
      // RESET
      // ======================================================================
      
      resetStore: () => set(initialState),
    }),
    { name: 'evalin-store' }
  )
);

// ============================================================================
// SELECTORES
// ============================================================================

export const evalinSelectors = {
  // Categorías
  getCategories: (state: EvalinState) => state.categories,
  getCategoryById: (state: EvalinState, id: string) =>
    state.categories.find((c) => c.id === id),
  
  // Preguntas filtradas
  getFilteredQuestions: (state: EvalinState) => {
    let result = state.questions;
    const { search, categoryId, type, isActive } = state.questionsFilters;
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.text.toLowerCase().includes(searchLower) ||
          q.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (categoryId) {
      result = result.filter((q) => q.categoryId === categoryId);
    }
    
    if (type) {
      result = result.filter((q) => q.type === type);
    }
    
    if (isActive !== null) {
      result = result.filter((q) => q.isActive === isActive);
    }
    
    return result;
  },
  
  // Cuestionarios filtrados
  getFilteredQuestionnaires: (state: EvalinState) => {
    let result = state.questionnaires;
    const { search, status, evaluatorRole } = state.questionnairesFilters;
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(searchLower) ||
          q.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      result = result.filter((q) => q.status === status);
    }
    
    if (evaluatorRole) {
      result = result.filter((q) => q.evaluatorRole === evaluatorRole);
    }
    
    return result;
  },
  
  // Períodos filtrados
  getFilteredPeriods: (state: EvalinState) => {
    let result = state.periods;
    const { search, status, year } = state.periodsFilters;
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      result = result.filter((p) => p.status === status);
    }
    
    if (year) {
      result = result.filter((p) => {
        const periodYear = new Date(p.startDate).getFullYear();
        return periodYear === year;
      });
    }
    
    return result;
  },
  
  // Evaluaciones filtradas
  getFilteredEvaluations: (state: EvalinState) => {
    let result = state.evaluations;
    const { periodId, instructorId, status, groupId } = state.evaluationsFilters;
    
    if (periodId) {
      result = result.filter((e) => e.periodId === periodId);
    }
    
    if (instructorId) {
      result = result.filter((e) => e.instructorId === instructorId);
    }
    
    if (status) {
      result = result.filter((e) => e.status === status);
    }
    
    if (groupId) {
      result = result.filter((e) => e.groupId === groupId);
    }
    
    return result;
  },
  
  // Progreso de evaluación actual
  getCurrentEvaluationProgress: (state: EvalinState) => {
    if (!state.currentEvaluation) return 0;
    
    const questionnaire = state.questionnaires.find(
      (q) => q.id === state.currentEvaluation!.questionnaireId
    );
    
    if (!questionnaire || questionnaire.totalQuestions === 0) return 0;
    
    const answeredCount = state.currentEvaluation.responses.length;
    return Math.round((answeredCount / questionnaire.totalQuestions) * 100);
  },
  
  // Estadísticas del período activo
  getActivePeriodStats: (state: EvalinState) => {
    if (!state.activePeriod) return null;
    
    return {
      totalEvaluations: state.activePeriod.totalEvaluations,
      completedEvaluations: state.activePeriod.completedEvaluations,
      completionRate: state.activePeriod.completionRate,
      pendingEvaluations:
        state.activePeriod.totalEvaluations -
        state.activePeriod.completedEvaluations,
    };
  },
  
  // Verificar si hay un modal abierto
  isAnyModalOpen: (state: EvalinState) =>
    Object.values(state.modals).some(Boolean),
  
  // Obtener cuestionarios activos
  getActiveQuestionnaires: (state: EvalinState) =>
    state.questionnaires.filter((q) => q.status === 'active'),
};
