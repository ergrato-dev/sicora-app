/**
 * SICORA - Attendance Store Tests
 *
 * Tests unitarios para el store de asistencia.
 * Verifica sesiones, QR, justificaciones, alertas y estadísticas.
 *
 * @fileoverview Attendance store unit tests
 * @module stores/attendanceStore.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAttendanceStore, type StudentForAttendance, type AttendanceSession } from './attendanceStore';
import type { AttendanceRecord, AttendanceQRCode, Justification, AttendanceAlert } from '@/types/attendance.types';

// Mock de datos
const mockStudent1: StudentForAttendance = {
  id: 'student-1',
  name: 'Juan Pérez',
  document: '1234567890',
  currentStatus: undefined,
};

const mockStudent2: StudentForAttendance = {
  id: 'student-2',
  name: 'María García',
  document: '0987654321',
  currentStatus: undefined,
};

const mockSession: Omit<AttendanceSession, 'startedAt'> = {
  scheduleId: 'schedule-1',
  groupId: 'group-1',
  groupCode: '2654321',
  date: '2024-03-15',
  subject: 'Programación',
  venue: 'Aula 101',
  students: [mockStudent1, mockStudent2],
};

const mockRecord: AttendanceRecord = {
  id: 'record-1',
  schedule_id: 'schedule-1',
  student_id: 'student-1',
  status: 'presente',
  fecha: '2024-03-15',
  hora_registro: '08:05:00',
  metodo_registro: 'manual',
  created_at: '2024-03-15T08:05:00Z',
};

const mockQRCode: AttendanceQRCode = {
  id: 'qr-1',
  schedule_id: 'schedule-1',
  code: 'ABC123',
  expires_at: '2024-03-15T09:00:00Z',
  is_active: true,
};

const mockJustification: Justification = {
  id: 'just-1',
  attendance_id: 'record-1',
  student_id: 'student-1',
  tipo: 'medica',
  descripcion: 'Cita médica',
  status: 'pendiente',
  created_at: '2024-03-15T10:00:00Z',
};

const mockAlert: AttendanceAlert = {
  id: 'alert-1',
  student_id: 'student-1',
  type: 'inasistencia_consecutiva',
  message: 'Estudiante con 3 inasistencias consecutivas',
  severity: 'alta',
  is_read: false,
  is_resolved: false,
  created_at: '2024-03-15T08:00:00Z',
};

describe('attendanceStore', () => {
  beforeEach(() => {
    useAttendanceStore.getState().resetStore();
  });

  describe('Initial State', () => {
    it('should have no active session initially', () => {
      const state = useAttendanceStore.getState();
      expect(state.activeSession).toBeNull();
      expect(state.activeQR).toBeNull();
    });

    it('should have empty records', () => {
      const state = useAttendanceStore.getState();
      expect(state.records).toEqual([]);
    });

    it('should have registro as default tab', () => {
      const state = useAttendanceStore.getState();
      expect(state.activeTab).toBe('registro');
    });

    it('should have loading states as false', () => {
      const state = useAttendanceStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isGeneratingQR).toBe(false);
      expect(state.isSavingAttendance).toBe(false);
    });
  });

  describe('Session Actions', () => {
    it('should start a session', () => {
      useAttendanceStore.getState().startSession(mockSession);
      
      const state = useAttendanceStore.getState();
      expect(state.activeSession).not.toBeNull();
      expect(state.activeSession?.scheduleId).toBe('schedule-1');
      expect(state.activeSession?.students).toHaveLength(2);
      expect(state.activeSession?.startedAt).toBeDefined();
    });

    it('should set active tab to registro when starting session', () => {
      useAttendanceStore.getState().setActiveTab('historial');
      useAttendanceStore.getState().startSession(mockSession);
      
      const state = useAttendanceStore.getState();
      expect(state.activeTab).toBe('registro');
    });

    it('should end a session', () => {
      useAttendanceStore.getState().startSession(mockSession);
      useAttendanceStore.getState().setActiveQR(mockQRCode);
      useAttendanceStore.getState().endSession();
      
      const state = useAttendanceStore.getState();
      expect(state.activeSession).toBeNull();
      expect(state.activeQR).toBeNull();
    });

    it('should update student status', () => {
      useAttendanceStore.getState().startSession(mockSession);
      useAttendanceStore.getState().updateStudentStatus('student-1', 'presente', 'attendance-1');
      
      const state = useAttendanceStore.getState();
      const student = state.activeSession?.students.find(s => s.id === 'student-1');
      expect(student?.currentStatus).toBe('presente');
      expect(student?.attendanceId).toBe('attendance-1');
    });

    it('should not update if no active session', () => {
      useAttendanceStore.getState().updateStudentStatus('student-1', 'presente');
      
      const state = useAttendanceStore.getState();
      expect(state.activeSession).toBeNull();
    });

    it('should update all students status', () => {
      useAttendanceStore.getState().startSession(mockSession);
      useAttendanceStore.getState().updateAllStudentsStatus('presente');
      
      const state = useAttendanceStore.getState();
      state.activeSession?.students.forEach(student => {
        expect(student.currentStatus).toBe('presente');
      });
    });
  });

  describe('Record Actions', () => {
    it('should set records', () => {
      useAttendanceStore.getState().setRecords([mockRecord]);
      
      const state = useAttendanceStore.getState();
      expect(state.records).toHaveLength(1);
      expect(state.lastFetchTime).not.toBeNull();
    });

    it('should add a record', () => {
      useAttendanceStore.getState().setRecords([mockRecord]);
      useAttendanceStore.getState().addRecord({ ...mockRecord, id: 'record-2' });
      
      const state = useAttendanceStore.getState();
      expect(state.records).toHaveLength(2);
    });

    it('should update a record', () => {
      useAttendanceStore.getState().setRecords([mockRecord]);
      useAttendanceStore.getState().updateRecord('record-1', { status: 'tardanza' });
      
      const state = useAttendanceStore.getState();
      expect(state.records[0].status).toBe('tardanza');
    });
  });

  describe('QR Actions', () => {
    it('should set active QR', () => {
      useAttendanceStore.getState().setActiveQR(mockQRCode);
      
      const state = useAttendanceStore.getState();
      expect(state.activeQR).toEqual(mockQRCode);
    });

    it('should clear QR', () => {
      useAttendanceStore.getState().setActiveQR(mockQRCode);
      useAttendanceStore.getState().clearQR();
      
      const state = useAttendanceStore.getState();
      expect(state.activeQR).toBeNull();
    });
  });

  describe('Justification Actions', () => {
    it('should set pending justifications', () => {
      useAttendanceStore.getState().setPendingJustifications([mockJustification]);
      
      const state = useAttendanceStore.getState();
      expect(state.pendingJustifications).toHaveLength(1);
    });

    it('should add justification', () => {
      useAttendanceStore.getState().addJustification(mockJustification);
      
      const state = useAttendanceStore.getState();
      expect(state.pendingJustifications).toHaveLength(1);
    });

    it('should remove justification', () => {
      useAttendanceStore.getState().setPendingJustifications([mockJustification]);
      useAttendanceStore.getState().removeJustification('just-1');
      
      const state = useAttendanceStore.getState();
      expect(state.pendingJustifications).toHaveLength(0);
    });

    it('should update justification', () => {
      useAttendanceStore.getState().setPendingJustifications([mockJustification]);
      useAttendanceStore.getState().updateJustification('just-1', { status: 'aprobada' });
      
      const state = useAttendanceStore.getState();
      expect(state.pendingJustifications[0].status).toBe('aprobada');
    });
  });

  describe('Alert Actions', () => {
    it('should set alerts', () => {
      useAttendanceStore.getState().setAlerts([mockAlert]);
      
      const state = useAttendanceStore.getState();
      expect(state.alerts).toHaveLength(1);
    });

    it('should mark alert as read', () => {
      useAttendanceStore.getState().setAlerts([mockAlert]);
      useAttendanceStore.getState().markAlertRead('alert-1');
      
      const state = useAttendanceStore.getState();
      expect(state.alerts[0].is_read).toBe(true);
    });

    it('should resolve alert', () => {
      useAttendanceStore.getState().setAlerts([mockAlert]);
      useAttendanceStore.getState().resolveAlert('alert-1');
      
      const state = useAttendanceStore.getState();
      expect(state.alerts[0].is_resolved).toBe(true);
    });
  });

  describe('UI Actions', () => {
    it('should set active tab', () => {
      useAttendanceStore.getState().setActiveTab('qr');
      expect(useAttendanceStore.getState().activeTab).toBe('qr');
    });

    it('should set filters', () => {
      useAttendanceStore.getState().setFilters({ groupId: 'group-1', status: 'presente' });
      
      const state = useAttendanceStore.getState();
      expect(state.filters.groupId).toBe('group-1');
      expect(state.filters.status).toBe('presente');
    });

    it('should clear filters', () => {
      useAttendanceStore.getState().setFilters({ groupId: 'group-1' });
      useAttendanceStore.getState().clearFilters();
      
      const state = useAttendanceStore.getState();
      expect(state.filters.groupId).toBeUndefined();
    });

    it('should set selected student id', () => {
      useAttendanceStore.getState().setSelectedStudentId('student-1');
      expect(useAttendanceStore.getState().selectedStudentId).toBe('student-1');
    });
  });

  describe('Loading Actions', () => {
    it('should set loading state', () => {
      useAttendanceStore.getState().setLoading(true);
      expect(useAttendanceStore.getState().isLoading).toBe(true);
    });

    it('should set generating QR state', () => {
      useAttendanceStore.getState().setGeneratingQR(true);
      expect(useAttendanceStore.getState().isGeneratingQR).toBe(true);
    });

    it('should set saving attendance state', () => {
      useAttendanceStore.getState().setSavingAttendance(true);
      expect(useAttendanceStore.getState().isSavingAttendance).toBe(true);
    });

    it('should set error and clear success message', () => {
      useAttendanceStore.getState().setSuccessMessage('Previous success');
      useAttendanceStore.getState().setError('Test error');
      
      const state = useAttendanceStore.getState();
      expect(state.error).toBe('Test error');
      expect(state.successMessage).toBeNull();
    });

    it('should set success message and clear error', () => {
      useAttendanceStore.getState().setError('Previous error');
      useAttendanceStore.getState().setSuccessMessage('Test success');
      
      const state = useAttendanceStore.getState();
      expect(state.successMessage).toBe('Test success');
      expect(state.error).toBeNull();
    });
  });

  describe('Getters', () => {
    it('should get student status from active session', () => {
      useAttendanceStore.getState().startSession(mockSession);
      useAttendanceStore.getState().updateStudentStatus('student-1', 'presente');
      
      const status = useAttendanceStore.getState().getStudentStatus('student-1');
      expect(status).toBe('presente');
    });

    it('should return undefined for non-existent student', () => {
      useAttendanceStore.getState().startSession(mockSession);
      
      const status = useAttendanceStore.getState().getStudentStatus('non-existent');
      expect(status).toBeUndefined();
    });

    it('should return undefined when no active session', () => {
      const status = useAttendanceStore.getState().getStudentStatus('student-1');
      expect(status).toBeUndefined();
    });

    describe('getSessionStats', () => {
      it('should return zeros when no active session', () => {
        const stats = useAttendanceStore.getState().getSessionStats();
        expect(stats).toEqual({
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          pending: 0,
          percentage: 0,
        });
      });

      it('should calculate correct stats', () => {
        useAttendanceStore.getState().startSession({
          ...mockSession,
          students: [
            { ...mockStudent1, currentStatus: 'presente' },
            { ...mockStudent2, currentStatus: 'tardanza' },
            { id: 'student-3', name: 'Pedro', currentStatus: 'ausente' },
            { id: 'student-4', name: 'Ana', currentStatus: undefined },
          ],
        });
        
        const stats = useAttendanceStore.getState().getSessionStats();
        expect(stats.total).toBe(4);
        expect(stats.present).toBe(1);
        expect(stats.late).toBe(1);
        expect(stats.absent).toBe(1);
        expect(stats.pending).toBe(1);
        expect(stats.percentage).toBe(50); // (1 presente + 1 tardanza) / 4 * 100
      });
    });

    it('should count unread alerts', () => {
      useAttendanceStore.getState().setAlerts([
        mockAlert,
        { ...mockAlert, id: 'alert-2', is_read: true },
        { ...mockAlert, id: 'alert-3', is_read: false },
      ]);
      
      const count = useAttendanceStore.getState().getUnreadAlertsCount();
      expect(count).toBe(2);
    });

    it('should count pending justifications', () => {
      useAttendanceStore.getState().setPendingJustifications([
        mockJustification,
        { ...mockJustification, id: 'just-2', status: 'aprobada' },
        { ...mockJustification, id: 'just-3', status: 'pendiente' },
      ]);
      
      const count = useAttendanceStore.getState().getPendingJustificationsCount();
      expect(count).toBe(2);
    });
  });

  describe('Cache Helpers', () => {
    it('should indicate refetch needed when no fetch time', () => {
      expect(useAttendanceStore.getState().shouldRefetch()).toBe(true);
    });

    it('should indicate refetch needed when cache expired (>2 minutes)', () => {
      const oldTime = Date.now() - 3 * 60 * 1000;
      useAttendanceStore.getState().setLastFetchTime(oldTime);
      
      expect(useAttendanceStore.getState().shouldRefetch()).toBe(true);
    });

    it('should indicate no refetch needed when cache fresh', () => {
      useAttendanceStore.getState().setLastFetchTime(Date.now());
      
      expect(useAttendanceStore.getState().shouldRefetch()).toBe(false);
    });
  });

  describe('Reset Store', () => {
    it('should reset all state to initial values', () => {
      // Modify state
      useAttendanceStore.getState().startSession(mockSession);
      useAttendanceStore.getState().setActiveQR(mockQRCode);
      useAttendanceStore.getState().setAlerts([mockAlert]);
      useAttendanceStore.getState().setError('Some error');
      
      // Reset
      useAttendanceStore.getState().resetStore();
      
      const state = useAttendanceStore.getState();
      expect(state.activeSession).toBeNull();
      expect(state.activeQR).toBeNull();
      expect(state.alerts).toEqual([]);
      expect(state.error).toBeNull();
      expect(state.activeTab).toBe('registro');
    });
  });
});
