/**
 * SICORA - Alerts Store Tests
 *
 * Tests unitarios para el store de alertas.
 * Verifica filtrado, lectura, archivado y selección múltiple.
 *
 * @fileoverview Alerts store unit tests
 * @module stores/alertsStore.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAlertsStore } from './alertsStore';
import type { Alert } from '@/types/alert.types';

// Mock de datos
const mockAlert1: Alert = {
  id: 'alert-1',
  type: 'attendance_warning',
  priority: 'high',
  status: 'unread',
  title: 'Inasistencia consecutiva',
  message: 'Estudiante con 3 inasistencias consecutivas',
  created_at: '2024-03-15T08:00:00Z',
};

const mockAlert2: Alert = {
  ...mockAlert1,
  id: 'alert-2',
  type: 'attendance_risk',
  priority: 'medium',
  status: 'read',
};

const mockAlert3: Alert = {
  ...mockAlert1,
  id: 'alert-3',
  status: 'archived',
};

describe('alertsStore', () => {
  beforeEach(() => {
    useAlertsStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have empty alerts initially', () => {
      const state = useAlertsStore.getState();
      expect(state.alerts).toEqual([]);
      expect(state.selectedAlert).toBeNull();
    });

    it('should have default filters', () => {
      const state = useAlertsStore.getState();
      expect(state.filters.status).toBe('all');
      expect(state.filters.type).toBe('all');
      expect(state.filters.priority).toBe('all');
      expect(state.filters.search).toBe('');
    });

    it('should have default view preferences', () => {
      const state = useAlertsStore.getState();
      expect(state.viewPreferences.showArchived).toBe(false);
      expect(state.viewPreferences.sortBy).toBe('createdAt');
      expect(state.viewPreferences.sortOrder).toBe('desc');
    });

    it('should have unread count as 0', () => {
      const state = useAlertsStore.getState();
      expect(state.unreadCount).toBe(0);
    });

    it('should have selection mode disabled', () => {
      const state = useAlertsStore.getState();
      expect(state.isSelectionMode).toBe(false);
      expect(state.selectedIds.size).toBe(0);
    });
  });

  describe('Alert Data Actions', () => {
    it('should set alerts', () => {
      useAlertsStore.getState().setAlerts([mockAlert1, mockAlert2]);
      
      const state = useAlertsStore.getState();
      expect(state.alerts).toHaveLength(2);
    });

    it('should append alerts (for pagination)', () => {
      useAlertsStore.getState().setAlerts([mockAlert1]);
      useAlertsStore.getState().appendAlerts([mockAlert2]);
      
      const state = useAlertsStore.getState();
      expect(state.alerts).toHaveLength(2);
    });

    it('should add a single alert', () => {
      useAlertsStore.getState().addAlert(mockAlert1);
      
      const state = useAlertsStore.getState();
      expect(state.alerts).toHaveLength(1);
      expect(state.alerts[0]).toEqual(mockAlert1);
    });

    it('should update an alert', () => {
      useAlertsStore.getState().setAlerts([mockAlert1]);
      useAlertsStore.getState().updateAlert('alert-1', { status: 'read' });
      
      const state = useAlertsStore.getState();
      expect(state.alerts[0].status).toBe('read');
    });

    it('should remove an alert', () => {
      useAlertsStore.getState().setAlerts([mockAlert1, mockAlert2]);
      useAlertsStore.getState().removeAlert('alert-1');
      
      const state = useAlertsStore.getState();
      expect(state.alerts).toHaveLength(1);
      expect(state.alerts[0].id).toBe('alert-2');
    });

    it('should set selected alert', () => {
      useAlertsStore.getState().setSelectedAlert(mockAlert1);
      
      const state = useAlertsStore.getState();
      expect(state.selectedAlert).toEqual(mockAlert1);
    });
  });

  describe('Unread Count Actions', () => {
    it('should set unread count', () => {
      useAlertsStore.getState().setUnreadCount(5);
      expect(useAlertsStore.getState().unreadCount).toBe(5);
    });

    it('should decrement unread count by 1', () => {
      useAlertsStore.getState().setUnreadCount(5);
      useAlertsStore.getState().decrementUnread();
      expect(useAlertsStore.getState().unreadCount).toBe(4);
    });

    it('should decrement unread count by custom amount', () => {
      useAlertsStore.getState().setUnreadCount(10);
      useAlertsStore.getState().decrementUnread(3);
      expect(useAlertsStore.getState().unreadCount).toBe(7);
    });

    it('should not go below 0', () => {
      useAlertsStore.getState().setUnreadCount(2);
      useAlertsStore.getState().decrementUnread(5);
      expect(useAlertsStore.getState().unreadCount).toBe(0);
    });
  });

  describe('Read Actions', () => {
    it('should mark alert as read', () => {
      useAlertsStore.getState().setAlerts([mockAlert1]);
      useAlertsStore.getState().markAsRead('alert-1');
      
      const state = useAlertsStore.getState();
      expect(state.alerts[0].status).toBe('read');
    });

    it('should mark multiple alerts as read', () => {
      useAlertsStore.getState().setAlerts([mockAlert1, { ...mockAlert1, id: 'alert-x', status: 'unread' }]);
      useAlertsStore.getState().markMultipleAsRead(['alert-1', 'alert-x']);
      
      const state = useAlertsStore.getState();
      expect(state.alerts.every(a => a.status === 'read')).toBe(true);
    });

    it('should mark all alerts as read', () => {
      useAlertsStore.getState().setAlerts([
        mockAlert1,
        { ...mockAlert1, id: 'alert-x', status: 'unread' },
        { ...mockAlert1, id: 'alert-y', status: 'unread' },
      ]);
      useAlertsStore.getState().markAllAsRead();
      
      const state = useAlertsStore.getState();
      expect(state.alerts.every(a => a.status === 'read')).toBe(true);
    });
  });

  describe('Archive Actions', () => {
    it('should archive an alert', () => {
      useAlertsStore.getState().setAlerts([mockAlert1]);
      useAlertsStore.getState().archiveAlert('alert-1');
      
      const state = useAlertsStore.getState();
      expect(state.alerts[0].status).toBe('archived');
    });

    it('should archive multiple alerts', () => {
      useAlertsStore.getState().setAlerts([mockAlert1, { ...mockAlert1, id: 'alert-x' }]);
      useAlertsStore.getState().archiveMultiple(['alert-1', 'alert-x']);
      
      const state = useAlertsStore.getState();
      expect(state.alerts.every(a => a.status === 'archived')).toBe(true);
    });

    it('should dismiss an alert', () => {
      useAlertsStore.getState().setAlerts([mockAlert1]);
      useAlertsStore.getState().dismissAlert('alert-1');
      
      const state = useAlertsStore.getState();
      expect(state.alerts[0].status).toBe('dismissed');
    });
  });

  describe('Pagination Actions', () => {
    it('should set page', () => {
      useAlertsStore.getState().setPage(2);
      expect(useAlertsStore.getState().currentPage).toBe(2);
    });

    it('should set page size', () => {
      useAlertsStore.getState().setPageSize(20);
      expect(useAlertsStore.getState().pageSize).toBe(20);
    });

    it('should set pagination', () => {
      useAlertsStore.getState().setPagination(100, 10);
      
      const state = useAlertsStore.getState();
      expect(state.totalItems).toBe(100);
      expect(state.totalPages).toBe(10);
    });

    it('should load more (increment page)', () => {
      useAlertsStore.getState().setPage(1);
      useAlertsStore.getState().loadMore();
      
      expect(useAlertsStore.getState().currentPage).toBe(2);
    });
  });

  describe('Filter Actions', () => {
    it('should set single filter', () => {
      useAlertsStore.getState().setFilter('status', 'unread');
      expect(useAlertsStore.getState().filters.status).toBe('unread');
    });

    it('should set multiple filters', () => {
      useAlertsStore.getState().setFilters({
        status: 'unread',
        priority: 'high',
        search: 'inasistencia',
      });
      
      const state = useAlertsStore.getState();
      expect(state.filters.status).toBe('unread');
      expect(state.filters.priority).toBe('high');
      expect(state.filters.search).toBe('inasistencia');
    });

    it('should reset filters', () => {
      useAlertsStore.getState().setFilters({
        status: 'read',
        priority: 'high',
        search: 'test',
      });
      useAlertsStore.getState().resetFilters();
      
      const state = useAlertsStore.getState();
      expect(state.filters.status).toBe('all');
      expect(state.filters.search).toBe('');
    });
  });

  describe('View Preferences Actions', () => {
    it('should set view preference', () => {
      useAlertsStore.getState().setViewPreference('showArchived', true);
      expect(useAlertsStore.getState().viewPreferences.showArchived).toBe(true);
    });

    it('should change sort by', () => {
      useAlertsStore.getState().setViewPreference('sortBy', 'priority');
      expect(useAlertsStore.getState().viewPreferences.sortBy).toBe('priority');
    });

    it('should change sort order', () => {
      useAlertsStore.getState().setViewPreference('sortOrder', 'asc');
      expect(useAlertsStore.getState().viewPreferences.sortOrder).toBe('asc');
    });
  });

  describe('Selection Actions', () => {
    it('should toggle selection', () => {
      useAlertsStore.getState().toggleSelection('alert-1');
      expect(useAlertsStore.getState().selectedIds.has('alert-1')).toBe(true);
      
      useAlertsStore.getState().toggleSelection('alert-1');
      expect(useAlertsStore.getState().selectedIds.has('alert-1')).toBe(false);
    });

    it('should select all alerts', () => {
      useAlertsStore.getState().setAlerts([mockAlert1, mockAlert2]);
      useAlertsStore.getState().selectAll();
      
      const state = useAlertsStore.getState();
      expect(state.selectedIds.size).toBe(2);
    });

    it('should clear selection', () => {
      useAlertsStore.getState().toggleSelection('alert-1');
      useAlertsStore.getState().toggleSelection('alert-2');
      useAlertsStore.getState().clearSelection();
      
      expect(useAlertsStore.getState().selectedIds.size).toBe(0);
    });

    it('should set selection mode', () => {
      useAlertsStore.getState().setSelectionMode(true);
      expect(useAlertsStore.getState().isSelectionMode).toBe(true);
    });

    it('should clear selection when disabling selection mode', () => {
      useAlertsStore.getState().toggleSelection('alert-1');
      useAlertsStore.getState().setSelectionMode(false);
      
      expect(useAlertsStore.getState().selectedIds.size).toBe(0);
    });
  });

  describe('Loading Actions', () => {
    it('should set loading state', () => {
      useAlertsStore.getState().setLoading(true);
      expect(useAlertsStore.getState().isLoading).toBe(true);
    });

    it('should set loading more state', () => {
      useAlertsStore.getState().setLoadingMore(true);
      expect(useAlertsStore.getState().isLoadingMore).toBe(true);
    });

    it('should set refreshing state', () => {
      useAlertsStore.getState().setRefreshing(true);
      expect(useAlertsStore.getState().isRefreshing).toBe(true);
    });

    it('should open detail modal', () => {
      useAlertsStore.getState().openDetail(mockAlert1);
      expect(useAlertsStore.getState().isDetailOpen).toBe(true);
      expect(useAlertsStore.getState().selectedAlert).toEqual(mockAlert1);
    });

    it('should set error', () => {
      useAlertsStore.getState().setError('Test error');
      expect(useAlertsStore.getState().error).toBe('Test error');
    });
  });

  describe('Query Params Builder', () => {
    it('should build query params from filters', () => {
      // setFilters resets page to 1, so we set page AFTER filters
      useAlertsStore.getState().setPageSize(20);
      useAlertsStore.getState().setFilters({
        status: 'unread',
        type: 'attendance_warning',
        priority: 'high',
      });
      
      const params = useAlertsStore.getState().getQueryParams();
      
      expect(params.status).toBe('unread');
      expect(params.type).toBe('attendance_warning');
      expect(params.priority).toBe('high');
      expect(params.page).toBe(1); // setFilters resets page to 1
      expect(params.pageSize).toBe(20);
    });

    it('should exclude "all" filter values', () => {
      const params = useAlertsStore.getState().getQueryParams();
      
      expect(params.status).toBeUndefined();
      expect(params.type).toBeUndefined();
      expect(params.priority).toBeUndefined();
    });
  });

  describe('Reset Store', () => {
    it('should reset all state to initial values', () => {
      // Modify state
      useAlertsStore.getState().setAlerts([mockAlert1, mockAlert2]);
      useAlertsStore.getState().setSelectedAlert(mockAlert1);
      useAlertsStore.getState().setUnreadCount(5);
      useAlertsStore.getState().setFilters({ status: 'unread' });
      useAlertsStore.getState().toggleSelection('alert-1');
      useAlertsStore.getState().setError('Some error');
      
      // Reset
      useAlertsStore.getState().reset();
      
      const state = useAlertsStore.getState();
      expect(state.alerts).toEqual([]);
      expect(state.selectedAlert).toBeNull();
      expect(state.unreadCount).toBe(0);
      expect(state.filters.status).toBe('all');
      expect(state.selectedIds.size).toBe(0);
      expect(state.error).toBeNull();
    });
  });
});
