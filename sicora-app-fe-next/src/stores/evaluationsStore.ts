/**
 * SICORA - Store de Evaluaciones (Zustand)
 *
 * Gestión de estado global para el módulo de evaluaciones:
 * - Lista de evaluaciones con filtros
 * - Evaluación activa para calificar
 * - Rúbricas disponibles
 * - Calificaciones en progreso
 * - Estadísticas y reportes
 *
 * @fileoverview Evaluations Zustand store
 * @module stores/evaluationsStore
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Evaluation,
  EvaluationStatus,
  EvaluationType,
  Rubric,
  StudentScore,
  EvaluationStats,
  CompetencyLevel,
  CriteriaScore,
} from '@/types/evaluation.types';

// ============================================================================
// TIPOS DEL STORE
// ============================================================================

/**
 * Estudiante para calificación en UI
 */
export interface StudentForGrading {
  id: string;
  name: string;
  document: string;
  photo?: string;
  isGraded: boolean;
  score?: StudentScore;
  // Estado temporal durante la calificación
  tempScores?: {
    criteriaId: string;
    score: number;
    feedback?: string;
  }[];
  tempFeedback?: string;
}

/**
 * Filtros activos de evaluaciones
 */
export interface EvaluationFilters {
  search: string;
  type: EvaluationType | 'all';
  status: EvaluationStatus | 'all';
  programId: string;
  groupId: string;
  fromDate: string;
  toDate: string;
}

/**
 * Sesión de calificación activa
 */
export interface GradingSession {
  evaluation: Evaluation;
  rubric: Rubric;
  students: StudentForGrading[];
  currentStudentIndex: number;
  savedCount: number;
  startedAt: string;
}

/**
 * Estado del store de evaluaciones
 */
interface EvaluationsState {
  // Lista de evaluaciones
  evaluations: Evaluation[];
  totalEvaluations: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  // Filtros
  filters: EvaluationFilters;

  // Evaluación seleccionada para ver/editar
  selectedEvaluation: Evaluation | null;

  // Rúbricas
  rubrics: Rubric[];
  selectedRubric: Rubric | null;

  // Sesión de calificación
  gradingSession: GradingSession | null;
  isGrading: boolean;

  // Estadísticas
  stats: EvaluationStats | null;

  // UI State
  isModalOpen: boolean;
  modalMode: 'create' | 'edit' | 'view' | 'grade' | null;
}

/**
 * Acciones del store de evaluaciones
 */
interface EvaluationsActions {
  // Lista de evaluaciones
  setEvaluations: (evaluations: Evaluation[], total: number) => void;
  addEvaluation: (evaluation: Evaluation) => void;
  updateEvaluation: (id: string, data: Partial<Evaluation>) => void;
  removeEvaluation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Paginación
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Filtros
  setFilter: <K extends keyof EvaluationFilters>(key: K, value: EvaluationFilters[K]) => void;
  setFilters: (filters: Partial<EvaluationFilters>) => void;
  resetFilters: () => void;

  // Selección
  selectEvaluation: (evaluation: Evaluation | null) => void;
  selectRubric: (rubric: Rubric | null) => void;

  // Rúbricas
  setRubrics: (rubrics: Rubric[]) => void;
  addRubric: (rubric: Rubric) => void;
  updateRubric: (id: string, data: Partial<Rubric>) => void;
  removeRubric: (id: string) => void;

  // Sesión de calificación
  startGradingSession: (evaluation: Evaluation, rubric: Rubric, students: StudentForGrading[]) => void;
  endGradingSession: () => void;
  setCurrentStudent: (index: number) => void;
  nextStudent: () => void;
  previousStudent: () => void;
  updateStudentTempScore: (studentId: string, criteriaId: string, score: number, feedback?: string) => void;
  updateStudentTempFeedback: (studentId: string, feedback: string) => void;
  markStudentGraded: (studentId: string, score: StudentScore) => void;
  getGradingProgress: () => { graded: number; total: number; percentage: number };

  // Estadísticas
  setStats: (stats: EvaluationStats) => void;

  // Modal
  openModal: (mode: 'create' | 'edit' | 'view' | 'grade', evaluation?: Evaluation) => void;
  closeModal: () => void;

  // Reset
  reset: () => void;
}

// ============================================================================
// VALORES INICIALES
// ============================================================================

const initialFilters: EvaluationFilters = {
  search: '',
  type: 'all',
  status: 'all',
  programId: '',
  groupId: '',
  fromDate: '',
  toDate: '',
};

const initialState: EvaluationsState = {
  evaluations: [],
  totalEvaluations: 0,
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  error: null,
  filters: initialFilters,
  selectedEvaluation: null,
  rubrics: [],
  selectedRubric: null,
  gradingSession: null,
  isGrading: false,
  stats: null,
  isModalOpen: false,
  modalMode: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useEvaluationsStore = create<EvaluationsState & EvaluationsActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // =====================================================================
        // LISTA DE EVALUACIONES
        // =====================================================================

        setEvaluations: (evaluations, total) =>
          set({ evaluations, totalEvaluations: total }, false, 'setEvaluations'),

        addEvaluation: (evaluation) =>
          set(
            (state) => ({
              evaluations: [evaluation, ...state.evaluations],
              totalEvaluations: state.totalEvaluations + 1,
            }),
            false,
            'addEvaluation'
          ),

        updateEvaluation: (id, data) =>
          set(
            (state) => ({
              evaluations: state.evaluations.map((e) =>
                e.id === id ? { ...e, ...data } : e
              ),
              selectedEvaluation:
                state.selectedEvaluation?.id === id
                  ? { ...state.selectedEvaluation, ...data }
                  : state.selectedEvaluation,
            }),
            false,
            'updateEvaluation'
          ),

        removeEvaluation: (id) =>
          set(
            (state) => ({
              evaluations: state.evaluations.filter((e) => e.id !== id),
              totalEvaluations: state.totalEvaluations - 1,
              selectedEvaluation:
                state.selectedEvaluation?.id === id ? null : state.selectedEvaluation,
            }),
            false,
            'removeEvaluation'
          ),

        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

        setError: (error) => set({ error }, false, 'setError'),

        // =====================================================================
        // PAGINACIÓN
        // =====================================================================

        setPage: (currentPage) => set({ currentPage }, false, 'setPage'),

        setPageSize: (pageSize) =>
          set({ pageSize, currentPage: 1 }, false, 'setPageSize'),

        // =====================================================================
        // FILTROS
        // =====================================================================

        setFilter: (key, value) =>
          set(
            (state) => ({
              filters: { ...state.filters, [key]: value },
              currentPage: 1,
            }),
            false,
            'setFilter'
          ),

        setFilters: (filters) =>
          set(
            (state) => ({
              filters: { ...state.filters, ...filters },
              currentPage: 1,
            }),
            false,
            'setFilters'
          ),

        resetFilters: () =>
          set({ filters: initialFilters, currentPage: 1 }, false, 'resetFilters'),

        // =====================================================================
        // SELECCIÓN
        // =====================================================================

        selectEvaluation: (selectedEvaluation) =>
          set({ selectedEvaluation }, false, 'selectEvaluation'),

        selectRubric: (selectedRubric) =>
          set({ selectedRubric }, false, 'selectRubric'),

        // =====================================================================
        // RÚBRICAS
        // =====================================================================

        setRubrics: (rubrics) => set({ rubrics }, false, 'setRubrics'),

        addRubric: (rubric) =>
          set(
            (state) => ({ rubrics: [rubric, ...state.rubrics] }),
            false,
            'addRubric'
          ),

        updateRubric: (id, data) =>
          set(
            (state) => ({
              rubrics: state.rubrics.map((r) =>
                r.id === id ? { ...r, ...data } : r
              ),
              selectedRubric:
                state.selectedRubric?.id === id
                  ? { ...state.selectedRubric, ...data }
                  : state.selectedRubric,
            }),
            false,
            'updateRubric'
          ),

        removeRubric: (id) =>
          set(
            (state) => ({
              rubrics: state.rubrics.filter((r) => r.id !== id),
              selectedRubric:
                state.selectedRubric?.id === id ? null : state.selectedRubric,
            }),
            false,
            'removeRubric'
          ),

        // =====================================================================
        // SESIÓN DE CALIFICACIÓN
        // =====================================================================

        startGradingSession: (evaluation, rubric, students) =>
          set(
            {
              gradingSession: {
                evaluation,
                rubric,
                students,
                currentStudentIndex: 0,
                savedCount: 0,
                startedAt: new Date().toISOString(),
              },
              isGrading: true,
            },
            false,
            'startGradingSession'
          ),

        endGradingSession: () =>
          set(
            { gradingSession: null, isGrading: false },
            false,
            'endGradingSession'
          ),

        setCurrentStudent: (index) =>
          set(
            (state) => {
              if (!state.gradingSession) return state;
              const maxIndex = state.gradingSession.students.length - 1;
              const safeIndex = Math.max(0, Math.min(index, maxIndex));
              return {
                gradingSession: {
                  ...state.gradingSession,
                  currentStudentIndex: safeIndex,
                },
              };
            },
            false,
            'setCurrentStudent'
          ),

        nextStudent: () =>
          set(
            (state) => {
              if (!state.gradingSession) return state;
              const nextIndex = Math.min(
                state.gradingSession.currentStudentIndex + 1,
                state.gradingSession.students.length - 1
              );
              return {
                gradingSession: {
                  ...state.gradingSession,
                  currentStudentIndex: nextIndex,
                },
              };
            },
            false,
            'nextStudent'
          ),

        previousStudent: () =>
          set(
            (state) => {
              if (!state.gradingSession) return state;
              const prevIndex = Math.max(
                state.gradingSession.currentStudentIndex - 1,
                0
              );
              return {
                gradingSession: {
                  ...state.gradingSession,
                  currentStudentIndex: prevIndex,
                },
              };
            },
            false,
            'previousStudent'
          ),

        updateStudentTempScore: (studentId, criteriaId, score, feedback) =>
          set(
            (state) => {
              if (!state.gradingSession) return state;

              const students = state.gradingSession.students.map((student) => {
                if (student.id !== studentId) return student;

                const tempScores = student.tempScores || [];
                const existingIndex = tempScores.findIndex(
                  (s) => s.criteriaId === criteriaId
                );

                if (existingIndex >= 0) {
                  tempScores[existingIndex] = { criteriaId, score, feedback };
                } else {
                  tempScores.push({ criteriaId, score, feedback });
                }

                return { ...student, tempScores };
              });

              return {
                gradingSession: { ...state.gradingSession, students },
              };
            },
            false,
            'updateStudentTempScore'
          ),

        updateStudentTempFeedback: (studentId, feedback) =>
          set(
            (state) => {
              if (!state.gradingSession) return state;

              const students = state.gradingSession.students.map((student) =>
                student.id === studentId
                  ? { ...student, tempFeedback: feedback }
                  : student
              );

              return {
                gradingSession: { ...state.gradingSession, students },
              };
            },
            false,
            'updateStudentTempFeedback'
          ),

        markStudentGraded: (studentId, score) =>
          set(
            (state) => {
              if (!state.gradingSession) return state;

              const students = state.gradingSession.students.map((student) =>
                student.id === studentId
                  ? { ...student, isGraded: true, score, tempScores: undefined, tempFeedback: undefined }
                  : student
              );

              const savedCount = students.filter((s) => s.isGraded).length;

              return {
                gradingSession: { ...state.gradingSession, students, savedCount },
              };
            },
            false,
            'markStudentGraded'
          ),

        getGradingProgress: () => {
          const session = get().gradingSession;
          if (!session) return { graded: 0, total: 0, percentage: 0 };

          const graded = session.students.filter((s) => s.isGraded).length;
          const total = session.students.length;
          const percentage = total > 0 ? Math.round((graded / total) * 100) : 0;

          return { graded, total, percentage };
        },

        // =====================================================================
        // ESTADÍSTICAS
        // =====================================================================

        setStats: (stats) => set({ stats }, false, 'setStats'),

        // =====================================================================
        // MODAL
        // =====================================================================

        openModal: (mode, evaluation) =>
          set(
            {
              isModalOpen: true,
              modalMode: mode,
              selectedEvaluation: evaluation || null,
            },
            false,
            'openModal'
          ),

        closeModal: () =>
          set(
            { isModalOpen: false, modalMode: null },
            false,
            'closeModal'
          ),

        // =====================================================================
        // RESET
        // =====================================================================

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'sicora-evaluations-store',
        partialize: (state) => ({
          // Solo persistir filtros y preferencias, no datos
          filters: state.filters,
          pageSize: state.pageSize,
        }),
      }
    ),
    { name: 'EvaluationsStore' }
  )
);

// ============================================================================
// SELECTORES DERIVADOS
// ============================================================================

/**
 * Obtener estudiante actual en sesión de calificación
 */
export const useCurrentGradingStudent = () =>
  useEvaluationsStore((state) => {
    if (!state.gradingSession) return null;
    return state.gradingSession.students[state.gradingSession.currentStudentIndex];
  });

/**
 * Obtener evaluaciones por estado
 */
export const useEvaluationsByStatus = (status: EvaluationStatus) =>
  useEvaluationsStore((state) =>
    state.evaluations.filter((e) => e.status === status)
  );

/**
 * Obtener evaluaciones próximas (scheduled)
 */
export const useUpcomingEvaluations = () =>
  useEvaluationsStore((state) =>
    state.evaluations
      .filter((e) => e.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
  );

/**
 * Calcular nivel de competencia basado en puntaje
 */
export function calculateCompetencyLevel(
  score: number,
  passingScore: number
): CompetencyLevel {
  const percentage = score;
  if (percentage < passingScore * 0.5) return 'not_achieved';
  if (percentage < passingScore) return 'in_progress';
  if (percentage < 90) return 'achieved';
  return 'exceeded';
}

/**
 * Calcular puntaje total de criterios
 */
export function calculateTotalScore(
  criteriaScores: CriteriaScore[],
  rubric: Rubric
): { totalScore: number; percentage: number; passed: boolean } {
  let weightedScore = 0;
  let totalWeight = 0;

  for (const criteria of rubric.criteria) {
    const score = criteriaScores.find((s) => s.criteriaId === criteria.id);
    if (score) {
      const criteriaPercentage = (score.score / criteria.maxScore) * 100;
      weightedScore += criteriaPercentage * (criteria.weight / 100);
      totalWeight += criteria.weight;
    }
  }

  const percentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
  const totalScore = Math.round(percentage);
  const passed = totalScore >= rubric.passingScore;

  return { totalScore, percentage, passed };
}

export default useEvaluationsStore;
