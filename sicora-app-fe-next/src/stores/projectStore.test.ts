/**
 * SICORA - Project Store Tests
 *
 * Tests unitarios para el store de proyectos.
 * Verifica CRUD, filtros, modales y selección.
 *
 * @fileoverview Project store unit tests
 * @module stores/projectStore.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProjectStore } from './projectStore';
import type {
  Project,
  Submission,
  Evaluation,
  Rubric,
  ProjectDashboardStats,
} from '@/types/project.types';

// Mock API
vi.mock('@/lib/api/projects', () => ({
  projectsApi: {
    projects: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    submissions: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      submit: vi.fn(),
      uploadFiles: vi.fn(),
    },
    evaluations: {
      list: vi.fn(),
      get: vi.fn(),
      save: vi.fn(),
      complete: vi.fn(),
    },
    rubrics: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    dashboard: {
      stats: vi.fn(),
    },
  },
}));

// Mock de datos
const mockProject: Project = {
  id: 'project-1',
  titulo: 'Proyecto Final',
  descripcion: 'Desarrollo de aplicación web',
  program_id: 'program-1',
  group_id: 'group-1',
  instructor_id: 'instructor-1',
  fase: 'desarrollo',
  status: 'activo',
  fecha_inicio: '2024-03-01',
  fecha_entrega: '2024-06-01',
  rubric_id: 'rubric-1',
  created_at: '2024-03-01T00:00:00Z',
};

const mockProject2: Project = {
  ...mockProject,
  id: 'project-2',
  titulo: 'Proyecto Parcial',
  status: 'borrador',
};

const mockSubmission: Submission = {
  id: 'submission-1',
  project_id: 'project-1',
  student_id: 'student-1',
  student_name: 'Juan Pérez',
  titulo: 'Entrega Final',
  descripcion: 'Mi proyecto completo',
  status: 'enviado',
  archivos: [],
  fecha_envio: '2024-05-15T10:00:00Z',
  created_at: '2024-05-15T10:00:00Z',
};

const mockEvaluation: Evaluation = {
  id: 'eval-1',
  submission_id: 'submission-1',
  project_id: 'project-1',
  evaluator_id: 'instructor-1',
  status: 'en_progreso',
  nota_final: null,
  criterios: [],
  created_at: '2024-05-16T00:00:00Z',
};

const mockRubric: Rubric = {
  id: 'rubric-1',
  nombre: 'Rúbrica Proyecto',
  descripcion: 'Evaluación de proyectos',
  criterios: [],
  status: 'activa',
  created_at: '2024-01-01T00:00:00Z',
};

const mockDashboardStats: ProjectDashboardStats = {
  total_projects: 10,
  active_projects: 8,
  total_submissions: 45,
  pending_evaluations: 12,
  completed_evaluations: 33,
  average_score: 82.5,
};

describe('projectStore', () => {
  beforeEach(() => {
    // Reset store - usar initialState directamente
    const state = useProjectStore.getState();
    state.setProjects([]);
    state.setSubmissions([]);
    state.setEvaluations([]);
    state.setRubrics([]);
    state.setSelectedProject(null);
    state.setSelectedSubmission(null);
    state.setSelectedEvaluation(null);
    state.setSelectedRubric(null);
    state.resetProjectFilters();
    state.resetSubmissionFilters();
    state.resetEvaluationFilters();
    state.closeAllModals();
    state.clearError();
  });

  describe('Initial State', () => {
    it('should have empty arrays initially', () => {
      const state = useProjectStore.getState();
      expect(state.projects).toEqual([]);
      expect(state.submissions).toEqual([]);
      expect(state.evaluations).toEqual([]);
      expect(state.rubrics).toEqual([]);
    });

    it('should have no selected items', () => {
      const state = useProjectStore.getState();
      expect(state.selectedProject).toBeNull();
      expect(state.selectedSubmission).toBeNull();
      expect(state.selectedEvaluation).toBeNull();
    });

    it('should have default tab', () => {
      const state = useProjectStore.getState();
      expect(state.activeTab).toBe('projects');
    });

    it('should have all modals closed', () => {
      const state = useProjectStore.getState();
      expect(state.modals.createProject).toBe(false);
      expect(state.modals.editProject).toBe(false);
      expect(state.modals.createSubmission).toBe(false);
    });
  });

  describe('Direct Setters', () => {
    it('should set projects', () => {
      useProjectStore.getState().setProjects([mockProject, mockProject2]);
      expect(useProjectStore.getState().projects).toHaveLength(2);
    });

    it('should set submissions', () => {
      useProjectStore.getState().setSubmissions([mockSubmission]);
      expect(useProjectStore.getState().submissions).toHaveLength(1);
    });

    it('should set evaluations', () => {
      useProjectStore.getState().setEvaluations([mockEvaluation]);
      expect(useProjectStore.getState().evaluations).toHaveLength(1);
    });

    it('should set rubrics', () => {
      useProjectStore.getState().setRubrics([mockRubric]);
      expect(useProjectStore.getState().rubrics).toHaveLength(1);
    });
  });

  describe('Selection Actions', () => {
    it('should set selected project', () => {
      useProjectStore.getState().setSelectedProject(mockProject);
      expect(useProjectStore.getState().selectedProject).toEqual(mockProject);
    });

    it('should clear selected project', () => {
      useProjectStore.getState().setSelectedProject(mockProject);
      useProjectStore.getState().setSelectedProject(null);
      expect(useProjectStore.getState().selectedProject).toBeNull();
    });

    it('should set selected submission', () => {
      useProjectStore.getState().setSelectedSubmission(mockSubmission);
      expect(useProjectStore.getState().selectedSubmission).toEqual(mockSubmission);
    });

    it('should set selected evaluation', () => {
      useProjectStore.getState().setSelectedEvaluation(mockEvaluation);
      expect(useProjectStore.getState().selectedEvaluation).toEqual(mockEvaluation);
    });

    it('should set selected rubric', () => {
      useProjectStore.getState().setSelectedRubric(mockRubric);
      expect(useProjectStore.getState().selectedRubric).toEqual(mockRubric);
    });
  });

  describe('Filter Actions', () => {
    it('should set project filters', () => {
      useProjectStore.getState().setProjectFilters({ search: 'Final', status: 'activo' });
      
      const state = useProjectStore.getState();
      expect(state.projectFilters.search).toBe('Final');
      expect(state.projectFilters.status).toBe('activo');
    });

    it('should reset project filters', () => {
      useProjectStore.getState().setProjectFilters({ search: 'test', status: 'borrador' });
      useProjectStore.getState().resetProjectFilters();
      
      const state = useProjectStore.getState();
      expect(state.projectFilters.search).toBe('');
      expect(state.projectFilters.status).toBeUndefined();
    });

    it('should set submission filters', () => {
      useProjectStore.getState().setSubmissionFilters({ projectId: 'project-1', status: 'enviado' });
      
      const state = useProjectStore.getState();
      expect(state.submissionFilters.projectId).toBe('project-1');
      expect(state.submissionFilters.status).toBe('enviado');
    });

    it('should reset submission filters', () => {
      useProjectStore.getState().setSubmissionFilters({ search: 'test' });
      useProjectStore.getState().resetSubmissionFilters();
      
      expect(useProjectStore.getState().submissionFilters.search).toBe('');
    });

    it('should set evaluation filters', () => {
      useProjectStore.getState().setEvaluationFilters({ status: 'en_progreso' });
      expect(useProjectStore.getState().evaluationFilters.status).toBe('en_progreso');
    });

    it('should reset evaluation filters', () => {
      useProjectStore.getState().setEvaluationFilters({ search: 'test' });
      useProjectStore.getState().resetEvaluationFilters();
      
      expect(useProjectStore.getState().evaluationFilters.search).toBe('');
    });
  });

  describe('Pagination Actions', () => {
    it('should set project page', () => {
      useProjectStore.getState().setProjectPage(3);
      expect(useProjectStore.getState().projectPagination.page).toBe(3);
    });

    it('should set submission page', () => {
      useProjectStore.getState().setSubmissionPage(2);
      expect(useProjectStore.getState().submissionPagination.page).toBe(2);
    });

    it('should set evaluation page', () => {
      useProjectStore.getState().setEvaluationPage(4);
      expect(useProjectStore.getState().evaluationPagination.page).toBe(4);
    });
  });

  describe('UI Actions', () => {
    it('should set active tab', () => {
      useProjectStore.getState().setActiveTab('submissions');
      expect(useProjectStore.getState().activeTab).toBe('submissions');
    });

    it('should open modal', () => {
      useProjectStore.getState().openModal('createProject');
      expect(useProjectStore.getState().modals.createProject).toBe(true);
    });

    it('should close modal', () => {
      useProjectStore.getState().openModal('createProject');
      useProjectStore.getState().closeModal('createProject');
      expect(useProjectStore.getState().modals.createProject).toBe(false);
    });

    it('should close all modals', () => {
      useProjectStore.getState().openModal('createProject');
      useProjectStore.getState().openModal('editProject');
      useProjectStore.getState().closeAllModals();
      
      const state = useProjectStore.getState();
      expect(state.modals.createProject).toBe(false);
      expect(state.modals.editProject).toBe(false);
    });
  });

  describe('Error Actions', () => {
    it('should clear error', () => {
      // Set error by causing an action that sets it (mocked)
      useProjectStore.setState({ error: 'Test error' });
      useProjectStore.getState().clearError();
      
      expect(useProjectStore.getState().error).toBeNull();
    });
  });
});
