/**
 * SICORA - Evaluations Store Tests
 *
 * Tests unitarios para el store de evaluaciones.
 * Verifica CRUD, sesión de calificación, rúbricas y estadísticas.
 *
 * @fileoverview Evaluations store unit tests
 * @module stores/evaluationsStore.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEvaluationsStore, type StudentForGrading, type GradingSession } from './evaluationsStore';
import type { Evaluation, Rubric, StudentScore, EvaluationStats } from '@/types/evaluation.types';

// Mock de datos
const mockEvaluation: Evaluation = {
  id: 'eval-1',
  titulo: 'Evaluación Trimestre 1',
  descripcion: 'Evaluación de competencias técnicas',
  type: 'sumativa',
  status: 'activa',
  program_id: 'program-1',
  group_id: 'group-1',
  rubric_id: 'rubric-1',
  fecha_inicio: '2024-03-15',
  fecha_fin: '2024-03-20',
  peso: 30,
  created_at: '2024-03-01T00:00:00Z',
};

const mockEvaluation2: Evaluation = {
  ...mockEvaluation,
  id: 'eval-2',
  titulo: 'Evaluación Trimestre 2',
  status: 'borrador',
};

const mockRubric: Rubric = {
  id: 'rubric-1',
  nombre: 'Rúbrica Técnica',
  descripcion: 'Evaluación de competencias técnicas',
  criterios: [
    {
      id: 'crit-1',
      nombre: 'Calidad de código',
      peso: 40,
      niveles: [
        { id: 'niv-1', nombre: 'Excelente', puntos: 4, descripcion: 'Código impecable' },
        { id: 'niv-2', nombre: 'Bueno', puntos: 3, descripcion: 'Código bueno' },
        { id: 'niv-3', nombre: 'Regular', puntos: 2, descripcion: 'Código aceptable' },
        { id: 'niv-4', nombre: 'Deficiente', puntos: 1, descripcion: 'Código deficiente' },
      ],
    },
  ],
  status: 'activa',
  created_at: '2024-01-01T00:00:00Z',
};

const mockStudent1: StudentForGrading = {
  id: 'student-1',
  name: 'Juan Pérez',
  document: '1234567890',
  isGraded: false,
};

const mockStudent2: StudentForGrading = {
  id: 'student-2',
  name: 'María García',
  document: '0987654321',
  isGraded: false,
};

const mockScore: StudentScore = {
  student_id: 'student-1',
  evaluation_id: 'eval-1',
  nota_final: 85,
  criterios_scores: [
    { criterio_id: 'crit-1', puntos: 3.4, feedback: 'Buen trabajo' },
  ],
  feedback_general: 'Excelente desempeño',
  created_at: '2024-03-16T00:00:00Z',
};

const mockStats: EvaluationStats = {
  total_evaluaciones: 10,
  promedio_general: 78.5,
  aprobados: 8,
  reprobados: 2,
  pendientes: 3,
  por_tipo: {
    sumativa: 6,
    formativa: 4,
  },
};

describe('evaluationsStore', () => {
  beforeEach(() => {
    useEvaluationsStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have empty evaluations initially', () => {
      const state = useEvaluationsStore.getState();
      expect(state.evaluations).toEqual([]);
      expect(state.selectedEvaluation).toBeNull();
    });

    it('should have default filters', () => {
      const state = useEvaluationsStore.getState();
      expect(state.filters.type).toBe('all');
      expect(state.filters.status).toBe('all');
      expect(state.filters.search).toBe('');
    });

    it('should have no grading session', () => {
      const state = useEvaluationsStore.getState();
      expect(state.gradingSession).toBeNull();
      expect(state.isGrading).toBe(false);
    });

    it('should have modal closed', () => {
      const state = useEvaluationsStore.getState();
      expect(state.isModalOpen).toBe(false);
      expect(state.modalMode).toBeNull();
    });
  });

  describe('Evaluation Actions', () => {
    it('should set evaluations with total', () => {
      useEvaluationsStore.getState().setEvaluations([mockEvaluation], 100);
      
      const state = useEvaluationsStore.getState();
      expect(state.evaluations).toHaveLength(1);
      expect(state.totalEvaluations).toBe(100);
    });

    it('should add evaluation', () => {
      useEvaluationsStore.getState().addEvaluation(mockEvaluation);
      
      const state = useEvaluationsStore.getState();
      expect(state.evaluations).toHaveLength(1);
    });

    it('should update evaluation', () => {
      useEvaluationsStore.getState().setEvaluations([mockEvaluation], 1);
      useEvaluationsStore.getState().updateEvaluation('eval-1', { status: 'finalizada' });
      
      const state = useEvaluationsStore.getState();
      expect(state.evaluations[0].status).toBe('finalizada');
    });

    it('should remove evaluation', () => {
      useEvaluationsStore.getState().setEvaluations([mockEvaluation, mockEvaluation2], 2);
      useEvaluationsStore.getState().removeEvaluation('eval-1');
      
      const state = useEvaluationsStore.getState();
      expect(state.evaluations).toHaveLength(1);
      expect(state.evaluations[0].id).toBe('eval-2');
    });

    it('should select evaluation', () => {
      useEvaluationsStore.getState().selectEvaluation(mockEvaluation);
      expect(useEvaluationsStore.getState().selectedEvaluation).toEqual(mockEvaluation);
    });
  });

  describe('Rubric Actions', () => {
    it('should set rubrics', () => {
      useEvaluationsStore.getState().setRubrics([mockRubric]);
      
      const state = useEvaluationsStore.getState();
      expect(state.rubrics).toHaveLength(1);
    });

    it('should add rubric', () => {
      useEvaluationsStore.getState().addRubric(mockRubric);
      expect(useEvaluationsStore.getState().rubrics).toHaveLength(1);
    });

    it('should update rubric', () => {
      useEvaluationsStore.getState().setRubrics([mockRubric]);
      useEvaluationsStore.getState().updateRubric('rubric-1', { status: 'inactiva' });
      
      const state = useEvaluationsStore.getState();
      expect(state.rubrics[0].status).toBe('inactiva');
    });

    it('should remove rubric', () => {
      useEvaluationsStore.getState().setRubrics([mockRubric]);
      useEvaluationsStore.getState().removeRubric('rubric-1');
      
      expect(useEvaluationsStore.getState().rubrics).toHaveLength(0);
    });

    it('should select rubric', () => {
      useEvaluationsStore.getState().selectRubric(mockRubric);
      expect(useEvaluationsStore.getState().selectedRubric).toEqual(mockRubric);
    });
  });

  describe('Grading Session Actions', () => {
    it('should start grading session', () => {
      useEvaluationsStore.getState().startGradingSession(
        mockEvaluation,
        mockRubric,
        [mockStudent1, mockStudent2]
      );
      
      const state = useEvaluationsStore.getState();
      expect(state.gradingSession).not.toBeNull();
      expect(state.gradingSession?.evaluation).toEqual(mockEvaluation);
      expect(state.gradingSession?.students).toHaveLength(2);
      expect(state.gradingSession?.currentStudentIndex).toBe(0);
      expect(state.isGrading).toBe(true);
    });

    it('should end grading session', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1]);
      useEvaluationsStore.getState().endGradingSession();
      
      const state = useEvaluationsStore.getState();
      expect(state.gradingSession).toBeNull();
      expect(state.isGrading).toBe(false);
    });

    it('should set current student index', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1, mockStudent2]);
      useEvaluationsStore.getState().setCurrentStudent(1);
      
      expect(useEvaluationsStore.getState().gradingSession?.currentStudentIndex).toBe(1);
    });

    it('should go to next student', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1, mockStudent2]);
      useEvaluationsStore.getState().nextStudent();
      
      expect(useEvaluationsStore.getState().gradingSession?.currentStudentIndex).toBe(1);
    });

    it('should not exceed student count', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1, mockStudent2]);
      useEvaluationsStore.getState().setCurrentStudent(1);
      useEvaluationsStore.getState().nextStudent();
      
      expect(useEvaluationsStore.getState().gradingSession?.currentStudentIndex).toBe(1);
    });

    it('should go to previous student', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1, mockStudent2]);
      useEvaluationsStore.getState().setCurrentStudent(1);
      useEvaluationsStore.getState().previousStudent();
      
      expect(useEvaluationsStore.getState().gradingSession?.currentStudentIndex).toBe(0);
    });

    it('should not go below 0', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1]);
      useEvaluationsStore.getState().previousStudent();
      
      expect(useEvaluationsStore.getState().gradingSession?.currentStudentIndex).toBe(0);
    });

    it('should update student temp score', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1]);
      useEvaluationsStore.getState().updateStudentTempScore('student-1', 'crit-1', 3.5, 'Good job');
      
      const session = useEvaluationsStore.getState().gradingSession;
      const student = session?.students.find(s => s.id === 'student-1');
      expect(student?.tempScores).toBeDefined();
      expect(student?.tempScores?.[0].score).toBe(3.5);
      expect(student?.tempScores?.[0].feedback).toBe('Good job');
    });

    it('should update student temp feedback', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1]);
      useEvaluationsStore.getState().updateStudentTempFeedback('student-1', 'Great work overall');
      
      const session = useEvaluationsStore.getState().gradingSession;
      const student = session?.students.find(s => s.id === 'student-1');
      expect(student?.tempFeedback).toBe('Great work overall');
    });

    it('should mark student as graded', () => {
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1, mockStudent2]);
      useEvaluationsStore.getState().markStudentGraded('student-1', mockScore);
      
      const session = useEvaluationsStore.getState().gradingSession;
      const student = session?.students.find(s => s.id === 'student-1');
      expect(student?.isGraded).toBe(true);
      expect(student?.score).toEqual(mockScore);
      expect(session?.savedCount).toBe(1);
    });

    it('should calculate grading progress', () => {
      useEvaluationsStore.getState().startGradingSession(
        mockEvaluation,
        mockRubric,
        [mockStudent1, mockStudent2]
      );
      useEvaluationsStore.getState().markStudentGraded('student-1', mockScore);
      
      const progress = useEvaluationsStore.getState().getGradingProgress();
      expect(progress.graded).toBe(1);
      expect(progress.total).toBe(2);
      expect(progress.percentage).toBe(50);
    });

    it('should return zeros when no grading session', () => {
      const progress = useEvaluationsStore.getState().getGradingProgress();
      expect(progress.graded).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe('Filter Actions', () => {
    it('should set single filter', () => {
      useEvaluationsStore.getState().setFilter('status', 'activa');
      expect(useEvaluationsStore.getState().filters.status).toBe('activa');
    });

    it('should set multiple filters', () => {
      useEvaluationsStore.getState().setFilters({
        type: 'sumativa',
        status: 'borrador',
        search: 'Trimestre',
      });
      
      const state = useEvaluationsStore.getState();
      expect(state.filters.type).toBe('sumativa');
      expect(state.filters.status).toBe('borrador');
      expect(state.filters.search).toBe('Trimestre');
    });

    it('should reset filters', () => {
      useEvaluationsStore.getState().setFilters({ type: 'formativa', search: 'test' });
      useEvaluationsStore.getState().resetFilters();
      
      const state = useEvaluationsStore.getState();
      expect(state.filters.type).toBe('all');
      expect(state.filters.search).toBe('');
    });
  });

  describe('Pagination Actions', () => {
    it('should set page', () => {
      useEvaluationsStore.getState().setPage(3);
      expect(useEvaluationsStore.getState().currentPage).toBe(3);
    });

    it('should set page size', () => {
      useEvaluationsStore.getState().setPageSize(25);
      expect(useEvaluationsStore.getState().pageSize).toBe(25);
    });
  });

  describe('Statistics Actions', () => {
    it('should set stats', () => {
      useEvaluationsStore.getState().setStats(mockStats);
      expect(useEvaluationsStore.getState().stats).toEqual(mockStats);
    });
  });

  describe('Modal Actions', () => {
    it('should open modal', () => {
      useEvaluationsStore.getState().openModal('create');
      
      const state = useEvaluationsStore.getState();
      expect(state.isModalOpen).toBe(true);
      expect(state.modalMode).toBe('create');
    });

    it('should open modal with evaluation', () => {
      useEvaluationsStore.getState().openModal('edit', mockEvaluation);
      
      const state = useEvaluationsStore.getState();
      expect(state.isModalOpen).toBe(true);
      expect(state.modalMode).toBe('edit');
      expect(state.selectedEvaluation).toEqual(mockEvaluation);
    });

    it('should close modal', () => {
      useEvaluationsStore.getState().openModal('create');
      useEvaluationsStore.getState().closeModal();
      
      const state = useEvaluationsStore.getState();
      expect(state.isModalOpen).toBe(false);
      expect(state.modalMode).toBeNull();
    });
  });

  describe('Loading Actions', () => {
    it('should set loading state', () => {
      useEvaluationsStore.getState().setLoading(true);
      expect(useEvaluationsStore.getState().isLoading).toBe(true);
    });

    it('should set error', () => {
      useEvaluationsStore.getState().setError('Test error');
      expect(useEvaluationsStore.getState().error).toBe('Test error');
    });
  });

  describe('Reset Store', () => {
    it('should reset all state to initial values', () => {
      // Modify state
      useEvaluationsStore.getState().setEvaluations([mockEvaluation], 1);
      useEvaluationsStore.getState().startGradingSession(mockEvaluation, mockRubric, [mockStudent1]);
      useEvaluationsStore.getState().openModal('grade');
      useEvaluationsStore.getState().setError('Some error');
      
      // Reset
      useEvaluationsStore.getState().reset();
      
      const state = useEvaluationsStore.getState();
      expect(state.evaluations).toEqual([]);
      expect(state.gradingSession).toBeNull();
      expect(state.isModalOpen).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
