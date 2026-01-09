/**
 * SICORA - Justifications Store Tests
 *
 * Tests unitarios para el store de justificaciones.
 * Verifica CRUD, filtros, vistas y paginación.
 *
 * @fileoverview Justifications store unit tests
 * @module stores/justificationsStore.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useJustificationsStore } from './justificationsStore';
import type { Justification, JustificationSummary } from '@/types/justification.types';

// Mock de datos - usando tipos correctos en inglés
const mockJustification1: Justification = {
  id: 'just-1',
  studentId: 'student-1',
  studentName: 'Juan Pérez',
  studentDocument: '12345678',
  studentEmail: 'juan@test.com',
  programId: 'prog-1',
  programName: 'Programa Test',
  groupId: 'group-1',
  groupName: 'Grupo A',
  type: 'medical',
  status: 'pending',
  subject: 'Cita médica',
  description: 'Cita médica programada',
  startDate: '2024-03-14',
  endDate: '2024-03-14',
  absenceDays: 1,
  attachments: [],
  absenceRecords: [],
  createdAt: '2024-03-15T10:00:00Z',
  updatedAt: '2024-03-15T10:00:00Z',
};

const mockJustification2: Justification = {
  ...mockJustification1,
  id: 'just-2',
  studentId: 'student-2',
  studentName: 'María García',
  studentDocument: '87654321',
  type: 'family_emergency',
  status: 'approved',
};

const mockSummary: JustificationSummary = {
  total: 10,
  byStatus: {
    pending: 4,
    approved: 5,
    rejected: 1,
    cancelled: 0,
  },
  byType: {
    medical: 5,
    family_emergency: 3,
    official_duty: 2,
    academic: 0,
    personal: 0,
    transportation: 0,
    other: 0,
  },
  avgResolutionDays: 2.5,
};

describe('justificationsStore', () => {
  beforeEach(() => {
    useJustificationsStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have empty justifications initially', () => {
      const state = useJustificationsStore.getState();
      expect(state.justifications).toEqual([]);
      expect(state.selectedJustification).toBeNull();
    });

    it('should have default filters', () => {
      const state = useJustificationsStore.getState();
      expect(state.filters.status).toBe('all');
      expect(state.filters.type).toBe('all');
      expect(state.filters.search).toBe('');
    });

    it('should have default view state', () => {
      const state = useJustificationsStore.getState();
      expect(state.viewState.view).toBe('list');
      expect(state.viewState.isFormOpen).toBe(false);
      expect(state.viewState.isReviewOpen).toBe(false);
    });

    it('should have default pagination', () => {
      const state = useJustificationsStore.getState();
      expect(state.currentPage).toBe(1);
      expect(state.pageSize).toBe(10);
    });

    it('should not be loading initially', () => {
      const state = useJustificationsStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isSubmitting).toBe(false);
    });
  });

  describe('Justification Data Actions', () => {
    it('should set justifications', () => {
      useJustificationsStore.getState().setJustifications([mockJustification1, mockJustification2]);
      
      const state = useJustificationsStore.getState();
      expect(state.justifications).toHaveLength(2);
    });

    it('should add single justification', () => {
      useJustificationsStore.getState().addJustification(mockJustification1);
      
      const state = useJustificationsStore.getState();
      expect(state.justifications).toHaveLength(1);
      expect(state.justifications[0]).toEqual(mockJustification1);
    });

    it('should update justification', () => {
      useJustificationsStore.getState().setJustifications([mockJustification1]);
      useJustificationsStore.getState().updateJustification('just-1', { status: 'approved' });
      
      const state = useJustificationsStore.getState();
      expect(state.justifications[0].status).toBe('approved');
    });

    it('should remove justification', () => {
      useJustificationsStore.getState().setJustifications([mockJustification1, mockJustification2]);
      useJustificationsStore.getState().removeJustification('just-1');
      
      const state = useJustificationsStore.getState();
      expect(state.justifications).toHaveLength(1);
      expect(state.justifications[0].id).toBe('just-2');
    });

    it('should set selected justification', () => {
      useJustificationsStore.getState().setSelectedJustification(mockJustification1);
      
      const state = useJustificationsStore.getState();
      expect(state.selectedJustification).toEqual(mockJustification1);
    });

    it('should set summary', () => {
      useJustificationsStore.getState().setSummary(mockSummary);
      
      const state = useJustificationsStore.getState();
      expect(state.summary).toEqual(mockSummary);
    });
  });

  describe('Filter Actions', () => {
    it('should set single filter', () => {
      useJustificationsStore.getState().setFilter('status', 'pending');
      expect(useJustificationsStore.getState().filters.status).toBe('pending');
    });

    it('should set multiple filters', () => {
      useJustificationsStore.getState().setFilters({
        status: 'approved',
        type: 'medical',
        search: 'Juan',
      });
      
      const state = useJustificationsStore.getState();
      expect(state.filters.status).toBe('approved');
      expect(state.filters.type).toBe('medical');
      expect(state.filters.search).toBe('Juan');
    });

    it('should reset filters to default', () => {
      useJustificationsStore.getState().setFilters({
        status: 'rejected',
        type: 'family_emergency',
        search: 'test',
      });
      useJustificationsStore.getState().resetFilters();
      
      const state = useJustificationsStore.getState();
      expect(state.filters.status).toBe('all');
      expect(state.filters.type).toBe('all');
      expect(state.filters.search).toBe('');
    });

    it('should reset page when setting filters', () => {
      useJustificationsStore.getState().setPage(3);
      useJustificationsStore.getState().setFilters({ status: 'pending' });
      
      expect(useJustificationsStore.getState().currentPage).toBe(1);
    });
  });

  describe('Pagination Actions', () => {
    it('should set page', () => {
      useJustificationsStore.getState().setPage(3);
      expect(useJustificationsStore.getState().currentPage).toBe(3);
    });

    it('should set page size', () => {
      useJustificationsStore.getState().setPageSize(25);
      expect(useJustificationsStore.getState().pageSize).toBe(25);
    });

    it('should set pagination info', () => {
      useJustificationsStore.getState().setPagination(50, 5);
      
      const state = useJustificationsStore.getState();
      expect(state.totalItems).toBe(50);
      expect(state.totalPages).toBe(5);
    });
  });

  describe('View State Actions', () => {
    it('should set view', () => {
      useJustificationsStore.getState().setView('calendar');
      expect(useJustificationsStore.getState().viewState.view).toBe('calendar');
    });

    it('should open create form', () => {
      useJustificationsStore.getState().openCreate();
      
      const state = useJustificationsStore.getState();
      expect(state.viewState.isFormOpen).toBe(true);
      expect(state.selectedJustification).toBeNull();
    });

    it('should open edit form with justification', () => {
      useJustificationsStore.getState().setSelectedJustification(mockJustification1);
      useJustificationsStore.getState().openCreate();
      
      const state = useJustificationsStore.getState();
      expect(state.viewState.isFormOpen).toBe(true);
      expect(state.selectedJustification).toEqual(mockJustification1);
    });

    it('should open review modal', () => {
      useJustificationsStore.getState().openReview('just-1');
      
      const state = useJustificationsStore.getState();
      expect(state.viewState.isReviewOpen).toBe(true);
      expect(state.viewState.selectedJustificationId).toBe('just-1');
    });

    it('should open detail view', () => {
      useJustificationsStore.getState().openDetail('just-1');
      
      const state = useJustificationsStore.getState();
      expect(state.viewState.view).toBe('detail');
      expect(state.viewState.selectedJustificationId).toBe('just-1');
    });

    it('should close all modals', () => {
      useJustificationsStore.getState().openCreate();
      useJustificationsStore.getState().closeModals();
      
      const state = useJustificationsStore.getState();
      expect(state.viewState.isFormOpen).toBe(false);
      expect(state.viewState.isReviewOpen).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('should set loading state', () => {
      useJustificationsStore.getState().setLoading(true);
      expect(useJustificationsStore.getState().isLoading).toBe(true);
    });

    it('should set submitting state', () => {
      useJustificationsStore.getState().setSubmitting(true);
      expect(useJustificationsStore.getState().isSubmitting).toBe(true);
    });

    it('should set error', () => {
      useJustificationsStore.getState().setError('Test error');
      expect(useJustificationsStore.getState().error).toBe('Test error');
    });

    it('should clear error', () => {
      useJustificationsStore.getState().setError('Test error');
      useJustificationsStore.getState().setError(null);
      expect(useJustificationsStore.getState().error).toBeNull();
    });
  });

  describe('Query Params Builder', () => {
    it('should build query params from filters', () => {
      useJustificationsStore.getState().setFilters({
        status: 'pending',
        type: 'medical',
        search: 'Juan',
        groupId: 'group-1',
      });
      // setFilters resets page to 1
      
      const params = useJustificationsStore.getState().getQueryParams();
      
      expect(params.status).toBe('pending');
      expect(params.type).toBe('medical');
      expect(params.search).toBe('Juan');
      expect(params.groupId).toBe('group-1');
      expect(params.page).toBe(1);
    });

    it('should exclude "all" filter values', () => {
      const params = useJustificationsStore.getState().getQueryParams();
      
      expect(params.status).toBeUndefined();
      expect(params.type).toBeUndefined();
    });
  });

  describe('Reset Store', () => {
    it('should reset all state to initial values', () => {
      // Modify state
      useJustificationsStore.getState().setJustifications([mockJustification1]);
      useJustificationsStore.getState().setSelectedJustification(mockJustification1);
      useJustificationsStore.getState().setFilters({ status: 'pending' });
      useJustificationsStore.getState().openCreate();
      useJustificationsStore.getState().setError('Some error');
      
      // Reset
      useJustificationsStore.getState().reset();
      
      const state = useJustificationsStore.getState();
      expect(state.justifications).toEqual([]);
      expect(state.selectedJustification).toBeNull();
      expect(state.filters.status).toBe('all');
      expect(state.viewState.view).toBe('list');
      expect(state.error).toBeNull();
    });
  });
});
