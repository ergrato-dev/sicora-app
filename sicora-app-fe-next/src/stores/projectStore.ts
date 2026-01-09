/**
 * Store para ProjectEvalService
 * Gestión de estado para proyectos y evaluaciones
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { projectsApi } from '@/lib/api/projects';
import type {
  Project,
  Submission,
  Evaluation,
  Rubric,
  ProjectDashboardStats,
  ProjectFilters,
  SubmissionFilters,
  EvaluationFilters,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateSubmissionRequest,
  SaveEvaluationRequest,
  CreateRubricRequest,
  INITIAL_PROJECT_FILTERS,
  INITIAL_SUBMISSION_FILTERS,
  INITIAL_EVALUATION_FILTERS,
} from '@/types/project.types';

// ============================================================================
// TIPOS DEL STORE
// ============================================================================

interface ProjectState {
  // Data
  projects: Project[];
  submissions: Submission[];
  evaluations: Evaluation[];
  rubrics: Rubric[];
  dashboardStats: ProjectDashboardStats | null;

  // Selected items
  selectedProject: Project | null;
  selectedSubmission: Submission | null;
  selectedEvaluation: Evaluation | null;
  selectedRubric: Rubric | null;

  // Filters
  projectFilters: ProjectFilters;
  submissionFilters: SubmissionFilters;
  evaluationFilters: EvaluationFilters;

  // Pagination
  projectPagination: { page: number; pageSize: number; total: number; totalPages: number };
  submissionPagination: { page: number; pageSize: number; total: number; totalPages: number };
  evaluationPagination: { page: number; pageSize: number; total: number; totalPages: number };

  // Loading states
  isLoading: boolean;
  isLoadingProjects: boolean;
  isLoadingSubmissions: boolean;
  isLoadingEvaluations: boolean;
  isLoadingRubrics: boolean;
  isSubmitting: boolean;

  // UI State
  activeTab: 'projects' | 'submissions' | 'evaluations' | 'rubrics';
  modals: {
    createProject: boolean;
    editProject: boolean;
    createSubmission: boolean;
    evaluateSubmission: boolean;
    createRubric: boolean;
    viewEvaluation: boolean;
  };

  // Error
  error: string | null;
}

interface ProjectActions {
  // Projects
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;

  // Submissions
  fetchSubmissions: () => Promise<void>;
  fetchSubmission: (id: string) => Promise<void>;
  createSubmission: (data: CreateSubmissionRequest) => Promise<Submission>;
  submitSubmission: (id: string) => Promise<void>;
  uploadFiles: (submissionId: string, files: File[]) => Promise<void>;
  setSelectedSubmission: (submission: Submission | null) => void;

  // Evaluations
  fetchEvaluations: () => Promise<void>;
  fetchEvaluation: (id: string) => Promise<void>;
  saveEvaluation: (id: string, data: SaveEvaluationRequest, finalize?: boolean) => Promise<void>;
  completeEvaluation: (id: string) => Promise<void>;
  setSelectedEvaluation: (evaluation: Evaluation | null) => void;

  // Rubrics
  fetchRubrics: () => Promise<void>;
  fetchRubric: (id: string) => Promise<void>;
  createRubric: (data: CreateRubricRequest) => Promise<Rubric>;
  deleteRubric: (id: string) => Promise<void>;
  setSelectedRubric: (rubric: Rubric | null) => void;

  // Dashboard
  fetchDashboardStats: () => Promise<void>;

  // Filters
  setProjectFilters: (filters: Partial<ProjectFilters>) => void;
  setSubmissionFilters: (filters: Partial<SubmissionFilters>) => void;
  setEvaluationFilters: (filters: Partial<EvaluationFilters>) => void;
  resetProjectFilters: () => void;
  resetSubmissionFilters: () => void;
  resetEvaluationFilters: () => void;

  // Pagination
  setProjectPage: (page: number) => void;
  setSubmissionPage: (page: number) => void;
  setEvaluationPage: (page: number) => void;

  // UI
  setActiveTab: (tab: ProjectState['activeTab']) => void;
  openModal: (modal: keyof ProjectState['modals']) => void;
  closeModal: (modal: keyof ProjectState['modals']) => void;
  closeAllModals: () => void;

  // Direct setters
  setProjects: (projects: Project[]) => void;
  setSubmissions: (submissions: Submission[]) => void;
  setEvaluations: (evaluations: Evaluation[]) => void;
  setRubrics: (rubrics: Rubric[]) => void;

  // Error
  clearError: () => void;
}

type ProjectStore = ProjectState & ProjectActions;

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialState: ProjectState = {
  projects: [],
  submissions: [],
  evaluations: [],
  rubrics: [],
  dashboardStats: null,

  selectedProject: null,
  selectedSubmission: null,
  selectedEvaluation: null,
  selectedRubric: null,

  projectFilters: { search: '', status: undefined, phase: undefined },
  submissionFilters: { search: '', status: undefined, projectId: undefined },
  evaluationFilters: { search: '', status: undefined, projectId: undefined },

  projectPagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
  submissionPagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
  evaluationPagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },

  isLoading: false,
  isLoadingProjects: false,
  isLoadingSubmissions: false,
  isLoadingEvaluations: false,
  isLoadingRubrics: false,
  isSubmitting: false,

  activeTab: 'projects',
  modals: {
    createProject: false,
    editProject: false,
    createSubmission: false,
    evaluateSubmission: false,
    createRubric: false,
    viewEvaluation: false,
  },

  error: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useProjectStore = create<ProjectStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ======================================================================
      // PROJECTS
      // ======================================================================

      fetchProjects: async () => {
        set({ isLoadingProjects: true, error: null });
        try {
          const { projectFilters, projectPagination } = get();
          const result = await projectsApi.projects.list(
            projectFilters,
            projectPagination.page,
            projectPagination.pageSize
          );
          set({
            projects: result.items,
            projectPagination: {
              ...projectPagination,
              total: result.total,
              totalPages: result.totalPages,
            },
            isLoadingProjects: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar proyectos',
            isLoadingProjects: false,
          });
        }
      },

      fetchProject: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const project = await projectsApi.projects.get(id);
          set({ selectedProject: project, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar proyecto',
            isLoading: false,
          });
        }
      },

      createProject: async (data: CreateProjectRequest) => {
        set({ isSubmitting: true, error: null });
        try {
          const project = await projectsApi.projects.create(data);
          set((state) => ({
            projects: [project, ...state.projects],
            isSubmitting: false,
          }));
          return project;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al crear proyecto',
            isSubmitting: false,
          });
          throw error;
        }
      },

      updateProject: async (id: string, data: UpdateProjectRequest) => {
        set({ isSubmitting: true, error: null });
        try {
          const updated = await projectsApi.projects.update(id, data);
          set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? updated : p)),
            selectedProject: state.selectedProject?.id === id ? updated : state.selectedProject,
            isSubmitting: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al actualizar proyecto',
            isSubmitting: false,
          });
          throw error;
        }
      },

      deleteProject: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
          await projectsApi.projects.delete(id);
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
            isSubmitting: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al eliminar proyecto',
            isSubmitting: false,
          });
          throw error;
        }
      },

      setSelectedProject: (project) => set({ selectedProject: project }),

      // ======================================================================
      // SUBMISSIONS
      // ======================================================================

      fetchSubmissions: async () => {
        set({ isLoadingSubmissions: true, error: null });
        try {
          const { submissionFilters, submissionPagination } = get();
          const result = await projectsApi.submissions.list(
            submissionFilters,
            submissionPagination.page,
            submissionPagination.pageSize
          );
          set({
            submissions: result.items,
            submissionPagination: {
              ...submissionPagination,
              total: result.total,
              totalPages: result.totalPages,
            },
            isLoadingSubmissions: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar entregas',
            isLoadingSubmissions: false,
          });
        }
      },

      fetchSubmission: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const submission = await projectsApi.submissions.get(id);
          set({ selectedSubmission: submission, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar entrega',
            isLoading: false,
          });
        }
      },

      createSubmission: async (data: CreateSubmissionRequest) => {
        set({ isSubmitting: true, error: null });
        try {
          const submission = await projectsApi.submissions.create(data);
          set((state) => ({
            submissions: [submission, ...state.submissions],
            isSubmitting: false,
          }));
          return submission;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al crear entrega',
            isSubmitting: false,
          });
          throw error;
        }
      },

      submitSubmission: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
          const updated = await projectsApi.submissions.submit(id);
          set((state) => ({
            submissions: state.submissions.map((s) => (s.id === id ? updated : s)),
            selectedSubmission: state.selectedSubmission?.id === id ? updated : state.selectedSubmission,
            isSubmitting: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al enviar entrega',
            isSubmitting: false,
          });
          throw error;
        }
      },

      uploadFiles: async (submissionId: string, files: File[]) => {
        set({ isSubmitting: true, error: null });
        try {
          const updated = await projectsApi.submissions.uploadFiles(submissionId, files);
          set((state) => ({
            submissions: state.submissions.map((s) => (s.id === submissionId ? updated : s)),
            selectedSubmission: state.selectedSubmission?.id === submissionId ? updated : state.selectedSubmission,
            isSubmitting: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al subir archivos',
            isSubmitting: false,
          });
          throw error;
        }
      },

      setSelectedSubmission: (submission) => set({ selectedSubmission: submission }),

      // ======================================================================
      // EVALUATIONS
      // ======================================================================

      fetchEvaluations: async () => {
        set({ isLoadingEvaluations: true, error: null });
        try {
          const { evaluationFilters, evaluationPagination } = get();
          const result = await projectsApi.evaluations.list(
            evaluationFilters,
            evaluationPagination.page,
            evaluationPagination.pageSize
          );
          set({
            evaluations: result.items,
            evaluationPagination: {
              ...evaluationPagination,
              total: result.total,
              totalPages: result.totalPages,
            },
            isLoadingEvaluations: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar evaluaciones',
            isLoadingEvaluations: false,
          });
        }
      },

      fetchEvaluation: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const evaluation = await projectsApi.evaluations.get(id);
          set({ selectedEvaluation: evaluation, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar evaluación',
            isLoading: false,
          });
        }
      },

      saveEvaluation: async (id: string, data: SaveEvaluationRequest, finalize = false) => {
        set({ isSubmitting: true, error: null });
        try {
          const updated = await projectsApi.evaluations.save(id, data, finalize);
          set((state) => ({
            evaluations: state.evaluations.map((e) => (e.id === id ? updated : e)),
            selectedEvaluation: state.selectedEvaluation?.id === id ? updated : state.selectedEvaluation,
            isSubmitting: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al guardar evaluación',
            isSubmitting: false,
          });
          throw error;
        }
      },

      completeEvaluation: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
          const updated = await projectsApi.evaluations.complete(id);
          set((state) => ({
            evaluations: state.evaluations.map((e) => (e.id === id ? updated : e)),
            selectedEvaluation: state.selectedEvaluation?.id === id ? updated : state.selectedEvaluation,
            isSubmitting: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al completar evaluación',
            isSubmitting: false,
          });
          throw error;
        }
      },

      setSelectedEvaluation: (evaluation) => set({ selectedEvaluation: evaluation }),

      // ======================================================================
      // RUBRICS
      // ======================================================================

      fetchRubrics: async () => {
        set({ isLoadingRubrics: true, error: null });
        try {
          const result = await projectsApi.rubrics.list();
          set({
            rubrics: result.items,
            isLoadingRubrics: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar rúbricas',
            isLoadingRubrics: false,
          });
        }
      },

      fetchRubric: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const rubric = await projectsApi.rubrics.get(id);
          set({ selectedRubric: rubric, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar rúbrica',
            isLoading: false,
          });
        }
      },

      createRubric: async (data: CreateRubricRequest) => {
        set({ isSubmitting: true, error: null });
        try {
          const rubric = await projectsApi.rubrics.create(data);
          set((state) => ({
            rubrics: [rubric, ...state.rubrics],
            isSubmitting: false,
          }));
          return rubric;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al crear rúbrica',
            isSubmitting: false,
          });
          throw error;
        }
      },

      deleteRubric: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
          await projectsApi.rubrics.delete(id);
          set((state) => ({
            rubrics: state.rubrics.filter((r) => r.id !== id),
            selectedRubric: state.selectedRubric?.id === id ? null : state.selectedRubric,
            isSubmitting: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al eliminar rúbrica',
            isSubmitting: false,
          });
          throw error;
        }
      },

      setSelectedRubric: (rubric) => set({ selectedRubric: rubric }),

      // ======================================================================
      // DASHBOARD
      // ======================================================================

      fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const stats = await projectsApi.dashboard.getStats();
          set({ dashboardStats: stats, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar estadísticas',
            isLoading: false,
          });
        }
      },

      // ======================================================================
      // FILTERS
      // ======================================================================

      setProjectFilters: (filters) =>
        set((state) => ({
          projectFilters: { ...state.projectFilters, ...filters },
          projectPagination: { ...state.projectPagination, page: 1 },
        })),

      setSubmissionFilters: (filters) =>
        set((state) => ({
          submissionFilters: { ...state.submissionFilters, ...filters },
          submissionPagination: { ...state.submissionPagination, page: 1 },
        })),

      setEvaluationFilters: (filters) =>
        set((state) => ({
          evaluationFilters: { ...state.evaluationFilters, ...filters },
          evaluationPagination: { ...state.evaluationPagination, page: 1 },
        })),

      resetProjectFilters: () =>
        set({
          projectFilters: { search: '', status: undefined, phase: undefined },
          projectPagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
        }),

      resetSubmissionFilters: () =>
        set({
          submissionFilters: { search: '', status: undefined, projectId: undefined },
          submissionPagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
        }),

      resetEvaluationFilters: () =>
        set({
          evaluationFilters: { search: '', status: undefined, projectId: undefined },
          evaluationPagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
        }),

      // ======================================================================
      // PAGINATION
      // ======================================================================

      setProjectPage: (page) =>
        set((state) => ({
          projectPagination: { ...state.projectPagination, page },
        })),

      setSubmissionPage: (page) =>
        set((state) => ({
          submissionPagination: { ...state.submissionPagination, page },
        })),

      setEvaluationPage: (page) =>
        set((state) => ({
          evaluationPagination: { ...state.evaluationPagination, page },
        })),

      // ======================================================================
      // UI
      // ======================================================================

      setActiveTab: (tab) => set({ activeTab: tab }),

      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
        })),

      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
        })),

      closeAllModals: () =>
        set({
          modals: {
            createProject: false,
            editProject: false,
            createSubmission: false,
            evaluateSubmission: false,
            createRubric: false,
            viewEvaluation: false,
          },
        }),

      // ======================================================================
      // DIRECT SETTERS
      // ======================================================================

      setProjects: (projects) => set({ projects }),
      setSubmissions: (submissions) => set({ submissions }),
      setEvaluations: (evaluations) => set({ evaluations }),
      setRubrics: (rubrics) => set({ rubrics }),

      // ======================================================================
      // ERROR
      // ======================================================================

      clearError: () => set({ error: null }),
    }),
    { name: 'project-store' }
  )
);

// ============================================================================
// SELECTORES
// ============================================================================

export const selectActiveProjects = (state: ProjectState) =>
  state.projects.filter((p) => p.status === 'active' || p.status === 'in_progress');

export const selectCompletedProjects = (state: ProjectState) =>
  state.projects.filter((p) => p.status === 'completed');

export const selectProjectsByPhase = (state: ProjectState, phase: string) =>
  state.projects.filter((p) => p.phase === phase);

export const selectPendingSubmissions = (state: ProjectState) =>
  state.submissions.filter((s) => s.status === 'pending' || s.status === 'submitted');

export const selectLateSubmissions = (state: ProjectState) =>
  state.submissions.filter((s) => s.isLate);

export const selectSubmissionsToEvaluate = (state: ProjectState) =>
  state.submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review');

export const selectPendingEvaluations = (state: ProjectState) =>
  state.evaluations.filter((e) => e.status === 'pending' || e.status === 'in_progress');

export const selectCompletedEvaluations = (state: ProjectState) =>
  state.evaluations.filter((e) => e.status === 'completed');

export const selectActiveRubrics = (state: ProjectState) =>
  state.rubrics.filter((r) => r.isActive);

export const selectQuickStats = (state: ProjectState) => ({
  activeProjects: state.projects.filter((p) => p.status === 'active' || p.status === 'in_progress').length,
  pendingSubmissions: state.submissions.filter((s) => s.status === 'pending').length,
  pendingEvaluations: state.evaluations.filter((e) => e.status === 'pending' || e.status === 'in_progress').length,
  totalRubrics: state.rubrics.length,
});

export const selectSubmissionsByProject = (state: ProjectState, projectId: string) =>
  state.submissions.filter((s) => s.projectId === projectId);

export const selectEvaluationsByProject = (state: ProjectState, projectId: string) =>
  state.evaluations.filter((e) => e.submission.projectName === projectId);
