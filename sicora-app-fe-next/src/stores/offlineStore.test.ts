/**
 * SICORA - Offline Store Tests
 *
 * Tests unitarios para el store de funcionalidad offline.
 * Verifica conexión, cola de sincronización, caché y conflictos.
 *
 * @fileoverview Offline store unit tests
 * @module stores/offlineStore.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useOfflineStore } from './offlineStore';
import { ConnectionStatus, SyncStatus, SyncPriority, IndexedDBStore } from '@/types/offline.types';
import type { OfflineStudent, OfflineAttendance, OfflineSchedule } from '@/types/offline.types';

// Mock navigator y service worker
const mockNavigator = {
  onLine: true,
  serviceWorker: {
    register: vi.fn(() => Promise.resolve({ waiting: null })),
    addEventListener: vi.fn(),
    controller: null,
  },
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    addEventListener: vi.fn(),
  },
};

vi.stubGlobal('navigator', mockNavigator);

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
});

// Mock window
vi.stubGlobal('window', {
  addEventListener: vi.fn(),
  location: { reload: vi.fn() },
});

describe('offlineStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOfflineStore.getState().reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have online connection by default when navigator.onLine is true', () => {
      const state = useOfflineStore.getState();
      expect(state.connection.status).toBe(ConnectionStatus.ONLINE);
    });

    it('should have empty sync queue', () => {
      const state = useOfflineStore.getState();
      expect(state.syncQueue).toEqual([]);
    });

    it('should have initial sync stats', () => {
      const state = useOfflineStore.getState();
      expect(state.syncStats.pendingItems).toBe(0);
      expect(state.syncStats.failedItems).toBe(0);
      expect(state.syncStats.totalSynced).toBe(0);
    });

    it('should have empty cache arrays', () => {
      const state = useOfflineStore.getState();
      expect(state.students).toEqual([]);
      expect(state.attendance).toEqual([]);
      expect(state.schedules).toEqual([]);
    });

    it('should have default preferences', () => {
      const state = useOfflineStore.getState();
      expect(state.preferences.autoSync).toBe(true);
      expect(state.preferences.syncOnWifiOnly).toBe(false);
      expect(state.preferences.notifyOnSync).toBe(true);
      expect(state.preferences.notifyOnConflict).toBe(true);
    });

    it('should not have service worker registration', () => {
      const state = useOfflineStore.getState();
      expect(state.swRegistration).toBeNull();
      expect(state.swUpdateAvailable).toBe(false);
    });

    it('should not be syncing', () => {
      const state = useOfflineStore.getState();
      expect(state.isSyncing).toBe(false);
      expect(state.isInitializing).toBe(false);
    });

    it('should have no conflicts', () => {
      const state = useOfflineStore.getState();
      expect(state.conflicts).toEqual([]);
    });
  });

  describe('Connection Actions', () => {
    it('should set connection status to offline', () => {
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.OFFLINE);
      expect(useOfflineStore.getState().connection.status).toBe(ConnectionStatus.OFFLINE);
    });

    it('should set connection status to online', () => {
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.OFFLINE);
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.ONLINE);
      expect(useOfflineStore.getState().connection.status).toBe(ConnectionStatus.ONLINE);
    });

    it('should set connection status to slow', () => {
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.SLOW);
      expect(useOfflineStore.getState().connection.status).toBe(ConnectionStatus.SLOW);
    });

    it('should record lastOnlineAt when going online', () => {
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.OFFLINE);
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.ONLINE);
      expect(useOfflineStore.getState().connection.lastOnlineAt).toBeDefined();
    });

    it('should record lastOfflineAt when going offline', () => {
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.OFFLINE);
      expect(useOfflineStore.getState().connection.lastOfflineAt).toBeDefined();
    });

    it('should update connection info', () => {
      useOfflineStore.getState().updateConnectionInfo({
        effectiveType: '3g',
        downlink: 5,
        rtt: 100,
        saveData: true,
      });

      const connection = useOfflineStore.getState().connection;
      expect(connection.effectiveType).toBe('3g');
      expect(connection.downlink).toBe(5);
      expect(connection.rtt).toBe(100);
      expect(connection.saveData).toBe(true);
    });
  });

  describe('Sync Queue Actions', () => {
    it('should add item to sync queue', () => {
      useOfflineStore.getState().addToSyncQueue({
        operationType: 'attendance_update' as any,
        storeName: IndexedDBStore.ATTENDANCE,
        entityId: 'att-1',
        data: { status: 'presente' },
        priority: SyncPriority.HIGH,
      });

      const state = useOfflineStore.getState();
      expect(state.syncQueue).toHaveLength(1);
      expect(state.syncQueue[0].status).toBe(SyncStatus.PENDING);
      expect(state.syncQueue[0].retries).toBe(0);
      expect(state.syncStats.pendingItems).toBe(1);
    });

    it('should assign unique id to queue items', () => {
      useOfflineStore.getState().addToSyncQueue({
        operationType: 'attendance_update' as any,
        storeName: IndexedDBStore.ATTENDANCE,
        entityId: 'att-1',
        data: {},
        priority: SyncPriority.NORMAL,
      });

      useOfflineStore.getState().addToSyncQueue({
        operationType: 'attendance_update' as any,
        storeName: IndexedDBStore.ATTENDANCE,
        entityId: 'att-2',
        data: {},
        priority: SyncPriority.NORMAL,
      });

      const state = useOfflineStore.getState();
      expect(state.syncQueue[0].id).not.toBe(state.syncQueue[1].id);
    });

    it('should remove item from sync queue', () => {
      useOfflineStore.getState().addToSyncQueue({
        operationType: 'attendance_update' as any,
        storeName: IndexedDBStore.ATTENDANCE,
        entityId: 'att-1',
        data: {},
        priority: SyncPriority.NORMAL,
      });

      const itemId = useOfflineStore.getState().syncQueue[0].id;
      useOfflineStore.getState().removeSyncItem(itemId);

      expect(useOfflineStore.getState().syncQueue).toHaveLength(0);
    });

    it('should clear sync queue', () => {
      useOfflineStore.getState().addToSyncQueue({
        operationType: 'attendance_update' as any,
        storeName: IndexedDBStore.ATTENDANCE,
        entityId: 'att-1',
        data: {},
        priority: SyncPriority.NORMAL,
      });

      useOfflineStore.getState().addToSyncQueue({
        operationType: 'attendance_update' as any,
        storeName: IndexedDBStore.ATTENDANCE,
        entityId: 'att-2',
        data: {},
        priority: SyncPriority.NORMAL,
      });

      useOfflineStore.getState().clearSyncQueue();

      const state = useOfflineStore.getState();
      expect(state.syncQueue).toHaveLength(0);
      expect(state.syncStats.pendingItems).toBe(0);
    });

    it('should not process sync queue when offline', async () => {
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.OFFLINE);
      useOfflineStore.getState().addToSyncQueue({
        operationType: 'attendance_update' as any,
        storeName: IndexedDBStore.ATTENDANCE,
        entityId: 'att-1',
        data: {},
        priority: SyncPriority.NORMAL,
      });

      await useOfflineStore.getState().processSyncQueue();

      // Should still be pending since we're offline
      expect(useOfflineStore.getState().syncQueue[0].status).toBe(SyncStatus.PENDING);
    });
  });

  describe('Conflict Actions', () => {
    const mockConflict = {
      id: 'conflict-1',
      syncQueueItemId: 'sync-1',
      entityId: 'att-1',
      storeName: IndexedDBStore.ATTENDANCE,
      localData: { status: 'presente' },
      serverData: { status: 'ausente' },
      detectedAt: '2024-03-15T08:00:00Z',
    };

    it('should resolve conflict with local data', () => {
      // Manually add conflict for testing
      useOfflineStore.setState((state) => ({
        conflicts: [...state.conflicts, mockConflict],
      }));

      useOfflineStore.getState().resolveConflict('conflict-1', 'local');

      const conflict = useOfflineStore.getState().conflicts.find((c) => c.id === 'conflict-1');
      expect(conflict?.resolution).toBe('local');
      expect(conflict?.resolvedAt).toBeDefined();
    });

    it('should resolve conflict with server data', () => {
      useOfflineStore.setState((state) => ({
        conflicts: [...state.conflicts, mockConflict],
      }));

      useOfflineStore.getState().resolveConflict('conflict-1', 'server');

      const conflict = useOfflineStore.getState().conflicts.find((c) => c.id === 'conflict-1');
      expect(conflict?.resolution).toBe('server');
    });

    it('should resolve conflict with merged data', () => {
      useOfflineStore.setState((state) => ({
        conflicts: [...state.conflicts, mockConflict],
      }));

      const mergedData = { status: 'tardanza' };
      useOfflineStore.getState().resolveConflict('conflict-1', 'merge', mergedData);

      const conflict = useOfflineStore.getState().conflicts.find((c) => c.id === 'conflict-1');
      expect(conflict?.resolution).toBe('merge');
      expect(conflict?.resolvedData).toEqual(mergedData);
    });

    it('should dismiss conflict', () => {
      useOfflineStore.setState((state) => ({
        conflicts: [...state.conflicts, mockConflict],
      }));

      useOfflineStore.getState().dismissConflict('conflict-1');

      expect(useOfflineStore.getState().conflicts).toHaveLength(0);
    });
  });

  describe('Cache Actions', () => {
    describe('cacheStudents', () => {
      it('should cache students', () => {
        const students = [
          { id: 'std-1', nombre: 'Juan', apellido: 'Pérez', documento: '12345' },
          { id: 'std-2', nombre: 'María', apellido: 'García', documento: '67890' },
        ] as OfflineStudent[];

        useOfflineStore.getState().cacheStudents(students);

        const state = useOfflineStore.getState();
        expect(state.students).toHaveLength(2);
        expect(state.students[0].cachedAt).toBeDefined();
      });

      it('should merge with existing students', () => {
        const initialStudents = [
          { id: 'std-1', nombre: 'Juan', apellido: 'Pérez', documento: '12345' },
        ] as OfflineStudent[];

        useOfflineStore.getState().cacheStudents(initialStudents);

        const newStudents = [
          { id: 'std-1', nombre: 'Juan Carlos', apellido: 'Pérez', documento: '12345' },
          { id: 'std-2', nombre: 'María', apellido: 'García', documento: '67890' },
        ] as OfflineStudent[];

        useOfflineStore.getState().cacheStudents(newStudents);

        const state = useOfflineStore.getState();
        expect(state.students).toHaveLength(2);
        // Should update existing student
        const juan = state.students.find((s) => s.id === 'std-1');
        expect(juan?.nombre).toBe('Juan Carlos');
      });
    });

    describe('cacheAttendance', () => {
      it('should cache attendance records', () => {
        const attendance = [
          { id: 'att-1', studentId: 'std-1', date: '2024-03-15', status: 'presente' },
          { id: 'att-2', studentId: 'std-2', date: '2024-03-15', status: 'ausente' },
        ] as OfflineAttendance[];

        useOfflineStore.getState().cacheAttendance(attendance);

        const state = useOfflineStore.getState();
        expect(state.attendance).toHaveLength(2);
        expect(state.attendance[0].cachedAt).toBeDefined();
        expect(state.attendance[0].syncStatus).toBe(SyncStatus.SYNCED);
      });

      it('should merge with existing attendance', () => {
        const initial = [
          { id: 'att-1', studentId: 'std-1', date: '2024-03-15', status: 'presente' },
        ] as OfflineAttendance[];

        useOfflineStore.getState().cacheAttendance(initial);

        const newRecords = [
          { id: 'att-1', studentId: 'std-1', date: '2024-03-15', status: 'tardanza' },
          { id: 'att-2', studentId: 'std-2', date: '2024-03-15', status: 'ausente' },
        ] as OfflineAttendance[];

        useOfflineStore.getState().cacheAttendance(newRecords);

        const state = useOfflineStore.getState();
        expect(state.attendance).toHaveLength(2);
      });
    });

    describe('cacheSchedules', () => {
      it('should cache schedules', () => {
        const schedules = [
          { id: 'sch-1', fichaId: 'f-1', instructorId: 'i-1', dayOfWeek: 1 },
          { id: 'sch-2', fichaId: 'f-1', instructorId: 'i-2', dayOfWeek: 2 },
        ] as OfflineSchedule[];

        useOfflineStore.getState().cacheSchedules(schedules);

        const state = useOfflineStore.getState();
        expect(state.schedules).toHaveLength(2);
        expect(state.schedules[0].cachedAt).toBeDefined();
      });
    });

    describe('updateCachedAttendance', () => {
      it('should update cached attendance and add to sync queue', () => {
        const initial = [
          { id: 'att-1', studentId: 'std-1', date: '2024-03-15', status: 'presente' },
        ] as OfflineAttendance[];

        useOfflineStore.getState().cacheAttendance(initial);
        useOfflineStore.getState().updateCachedAttendance('att-1', { status: 'ausente' });

        const state = useOfflineStore.getState();
        const updated = state.attendance.find((a) => a.id === 'att-1');
        expect(updated?.status).toBe('ausente');
        expect(updated?.syncStatus).toBe(SyncStatus.PENDING);
        expect(state.syncQueue.length).toBeGreaterThan(0);
      });
    });

    describe('clearCache', () => {
      it('should clear specific store cache', () => {
        useOfflineStore.getState().cacheStudents([{ id: 'std-1' } as OfflineStudent]);
        useOfflineStore.getState().cacheAttendance([{ id: 'att-1' } as OfflineAttendance]);

        useOfflineStore.getState().clearCache(IndexedDBStore.STUDENTS);

        const state = useOfflineStore.getState();
        expect(state.students).toHaveLength(0);
        expect(state.attendance).toHaveLength(1);
      });

      it('should clear all cache when no store specified', () => {
        useOfflineStore.getState().cacheStudents([{ id: 'std-1' } as OfflineStudent]);
        useOfflineStore.getState().cacheAttendance([{ id: 'att-1' } as OfflineAttendance]);
        useOfflineStore.getState().cacheSchedules([{ id: 'sch-1' } as OfflineSchedule]);

        useOfflineStore.getState().clearCache();

        const state = useOfflineStore.getState();
        expect(state.students).toHaveLength(0);
        expect(state.attendance).toHaveLength(0);
        expect(state.schedules).toHaveLength(0);
      });
    });
  });

  describe('Preferences Actions', () => {
    it('should update preferences', () => {
      useOfflineStore.getState().updatePreferences({
        autoSync: false,
        syncOnWifiOnly: true,
      });

      const state = useOfflineStore.getState();
      expect(state.preferences.autoSync).toBe(false);
      expect(state.preferences.syncOnWifiOnly).toBe(true);
    });

    it('should preserve other preferences when updating', () => {
      const originalMaxCacheSize = useOfflineStore.getState().preferences.maxCacheSize;

      useOfflineStore.getState().updatePreferences({
        notifyOnSync: false,
      });

      const state = useOfflineStore.getState();
      expect(state.preferences.notifyOnSync).toBe(false);
      expect(state.preferences.maxCacheSize).toBe(originalMaxCacheSize);
    });
  });

  describe('Service Worker Actions', () => {
    it('should handle SW message - SYNC_COMPLETE', () => {
      useOfflineStore.getState().handleSWMessage({
        type: 'SYNC_COMPLETE',
        payload: true,
        timestamp: '2024-03-15T08:00:00Z',
      });

      expect(useOfflineStore.getState().syncStats.lastSyncAt).toBe('2024-03-15T08:00:00Z');
    });

    it('should handle SW message - SYNC_ERROR', () => {
      useOfflineStore.getState().handleSWMessage({
        type: 'SYNC_ERROR',
        payload: { error: 'Network failure' },
      });

      expect(useOfflineStore.getState().lastError).toBe('Network failure');
    });

    it('should handle SW message - UPDATE_AVAILABLE', () => {
      useOfflineStore.getState().handleSWMessage({
        type: 'UPDATE_AVAILABLE',
      });

      expect(useOfflineStore.getState().swUpdateAvailable).toBe(true);
    });
  });

  describe('Reset Store', () => {
    it('should reset all state to initial values', () => {
      // Modify state
      useOfflineStore.getState().setConnectionStatus(ConnectionStatus.OFFLINE);
      useOfflineStore.getState().addToSyncQueue({
        operationType: 'attendance_update' as any,
        storeName: IndexedDBStore.ATTENDANCE,
        entityId: 'att-1',
        data: {},
        priority: SyncPriority.NORMAL,
      });
      useOfflineStore.getState().cacheStudents([{ id: 'std-1' } as OfflineStudent]);
      useOfflineStore.getState().updatePreferences({ autoSync: false });

      // Reset
      useOfflineStore.getState().reset();

      const state = useOfflineStore.getState();
      expect(state.syncQueue).toEqual([]);
      expect(state.students).toEqual([]);
      expect(state.preferences.autoSync).toBe(true);
    });
  });
});
