/**
 * SICORA - Attendance API Client Tests
 *
 * Tests unitarios para el cliente API de asistencia.
 *
 * @fileoverview Attendance API tests
 * @module lib/api/attendance.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listAttendance,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkAttendance,
  generateQR,
  scanQR,
  getQRStatus,
  getAttendanceHistory,
  getStudentHistory,
  getAttendanceSummary,
  getGroupSummary,
  listJustifications,
  getJustification,
  createJustification,
  reviewJustification,
  listAlerts,
  getAlert,
  resolveAlert,
  markAlertAsRead,
  getActiveAlerts,
  attendanceApi,
} from './attendance';
import { httpClient } from '../api-client';

// Mock del httpClient
vi.mock('../api-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('attendanceApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Attendance CRUD', () => {
    describe('listAttendance', () => {
      it('debe llamar httpClient.get con el endpoint correcto', async () => {
        const mockResponse = {
          data: { records: [], total: 0, page: 1, page_size: 10 },
          success: true,
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await listAttendance({});

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/attendance');
      });

      it('debe incluir query params cuando se proporcionan', async () => {
        const mockResponse = { data: { records: [] }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await listAttendance({ page: 1, page_size: 10, academic_group_id: 'group-1' });

        expect(httpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/attendance?')
        );
      });

      it('debe filtrar parámetros vacíos o undefined', async () => {
        const mockResponse = { data: { records: [] }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await listAttendance({ page: 1, academic_group_id: undefined });

        const calledUrl = vi.mocked(httpClient.get).mock.calls[0][0];
        expect(calledUrl).not.toContain('undefined');
      });
    });

    describe('getAttendance', () => {
      it('debe llamar httpClient.get con el ID de asistencia', async () => {
        const mockResponse = {
          data: { data: { id: 'att-1', student_id: 'std-1', status: 'presente' } },
          success: true,
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getAttendance('att-1');

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/attendance/att-1');
      });
    });

    describe('createAttendance', () => {
      it('debe llamar httpClient.post con los datos de asistencia', async () => {
        const mockResponse = {
          data: { message: 'Created', data: { id: 'att-new' } },
          success: true,
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          student_id: 'std-1',
          schedule_id: 'sch-1',
          date: '2024-03-15',
          status: 'presente' as const,
        };

        await createAttendance(request);

        expect(httpClient.post).toHaveBeenCalledWith('/api/v1/attendance', request);
      });
    });

    describe('updateAttendance', () => {
      it('debe llamar httpClient.put con ID y actualizaciones', async () => {
        const mockResponse = {
          data: { message: 'Updated', data: { id: 'att-1' } },
          success: true,
        };
        vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

        const updates = { status: 'ausente' as const };

        await updateAttendance('att-1', updates);

        expect(httpClient.put).toHaveBeenCalledWith('/api/v1/attendance/att-1', updates);
      });
    });

    describe('deleteAttendance', () => {
      it('debe llamar httpClient.delete con el ID', async () => {
        const mockResponse = { data: { message: 'Deleted' }, success: true };
        vi.mocked(httpClient.delete).mockResolvedValue(mockResponse);

        await deleteAttendance('att-1');

        expect(httpClient.delete).toHaveBeenCalledWith('/api/v1/attendance/att-1');
      });
    });
  });

  describe('Bulk Operations', () => {
    describe('bulkAttendance', () => {
      it('debe llamar httpClient.post con los registros masivos', async () => {
        const mockResponse = {
          data: { total_processed: 5, successful: 5, failed: 0 },
          success: true,
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          schedule_id: 'sch-1',
          academic_group_id: 'grp-1',
          date: '2024-03-15',
          records: [
            { student_id: 'std-1', status: 'presente' as const },
            { student_id: 'std-2', status: 'ausente' as const },
          ],
        };

        await bulkAttendance(request);

        expect(httpClient.post).toHaveBeenCalledWith('/api/v1/attendance/bulk', request);
      });
    });
  });

  describe('QR Operations', () => {
    describe('generateQR', () => {
      it('debe llamar httpClient.post para generar QR', async () => {
        const mockResponse = {
          data: { message: 'QR Generated', data: { id: 'qr-1', qr_code: 'base64...' } },
          success: true,
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          schedule_id: 'sch-1',
          academic_group_id: 'grp-1',
          duration_minutes: 30,
        };

        await generateQR(request);

        expect(httpClient.post).toHaveBeenCalledWith('/api/v1/attendance/qr', request);
      });
    });

    describe('scanQR', () => {
      it('debe llamar httpClient.post para escanear QR', async () => {
        const mockResponse = {
          data: { success: true, attendance_id: 'att-1' },
          success: true,
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          qr_token: 'token-123',
          student_id: 'std-1',
        };

        await scanQR(request);

        expect(httpClient.post).toHaveBeenCalledWith('/api/v1/attendance/qr/scan', request);
      });
    });

    describe('getQRStatus', () => {
      it('debe llamar httpClient.get para obtener estado del QR', async () => {
        const mockResponse = {
          data: { data: { id: 'qr-1', is_active: true } },
          success: true,
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getQRStatus('qr-1');

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/attendance/qr/qr-1');
      });
    });
  });

  describe('History & Summary', () => {
    describe('getAttendanceHistory', () => {
      it('debe llamar httpClient.get con parámetros de historial', async () => {
        const mockResponse = { data: [], success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getAttendanceHistory({ student_id: 'std-1', start_date: '2024-01-01' });

        expect(httpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/attendance/history')
        );
      });
    });

    describe('getStudentHistory', () => {
      it('debe llamar httpClient.get con el ID del estudiante', async () => {
        const mockResponse = { data: { attendance_rate: 95 }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getStudentHistory('std-1');

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/attendance/student/std-1/history');
      });

      it('debe incluir parámetros adicionales', async () => {
        const mockResponse = { data: { attendance_rate: 95 }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getStudentHistory('std-1', { start_date: '2024-01-01' });

        expect(httpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/attendance/student/std-1/history?')
        );
      });
    });

    describe('getAttendanceSummary', () => {
      it('debe llamar httpClient.get con parámetros de resumen', async () => {
        const mockResponse = { data: [], success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getAttendanceSummary({ academic_group_id: 'grp-1' });

        expect(httpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/attendance/summary')
        );
      });
    });

    describe('getGroupSummary', () => {
      it('debe llamar httpClient.get con el ID del grupo', async () => {
        const mockResponse = { data: { total_students: 30 }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getGroupSummary('grp-1');

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/attendance/group/grp-1/summary');
      });
    });
  });

  describe('Justifications', () => {
    describe('listJustifications', () => {
      it('debe llamar httpClient.get para listar justificaciones', async () => {
        const mockResponse = { data: { justifications: [] }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await listJustifications({});

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/justifications');
      });
    });

    describe('getJustification', () => {
      it('debe llamar httpClient.get con el ID de justificación', async () => {
        const mockResponse = { data: { data: { id: 'just-1' } }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getJustification('just-1');

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/justifications/just-1');
      });
    });

    describe('createJustification', () => {
      it('debe llamar httpClient.post para crear justificación', async () => {
        const mockResponse = {
          data: { message: 'Created', data: { id: 'just-new' } },
          success: true,
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          attendance_id: 'att-1',
          reason: 'Cita médica',
          evidence_url: 'https://...',
        };

        await createJustification(request);

        expect(httpClient.post).toHaveBeenCalledWith('/api/v1/justifications', request);
      });
    });

    describe('reviewJustification', () => {
      it('debe llamar httpClient.put para revisar justificación', async () => {
        const mockResponse = {
          data: { message: 'Reviewed', data: { id: 'just-1', status: 'approved' } },
          success: true,
        };
        vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

        const review = {
          status: 'approved' as const,
          reviewer_notes: 'Documentación válida',
        };

        await reviewJustification('just-1', review);

        expect(httpClient.put).toHaveBeenCalledWith('/api/v1/justifications/just-1/review', review);
      });
    });
  });

  describe('Alerts', () => {
    describe('listAlerts', () => {
      it('debe llamar httpClient.get para listar alertas', async () => {
        const mockResponse = { data: { alerts: [] }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await listAlerts({});

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/alerts');
      });

      it('debe incluir filtros cuando se proporcionan', async () => {
        const mockResponse = { data: { alerts: [] }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await listAlerts({ type: 'attendance_warning', is_read: false });

        expect(httpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/alerts?')
        );
      });
    });

    describe('getAlert', () => {
      it('debe llamar httpClient.get con el ID de alerta', async () => {
        const mockResponse = { data: { data: { id: 'alert-1' } }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getAlert('alert-1');

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/alerts/alert-1');
      });
    });

    describe('resolveAlert', () => {
      it('debe llamar httpClient.put para resolver alerta', async () => {
        const mockResponse = {
          data: { message: 'Resolved', data: { id: 'alert-1' } },
          success: true,
        };
        vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

        const resolution = { resolution_notes: 'Se contactó al estudiante' };

        await resolveAlert('alert-1', resolution);

        expect(httpClient.put).toHaveBeenCalledWith('/api/v1/alerts/alert-1/resolve', resolution);
      });
    });

    describe('markAlertAsRead', () => {
      it('debe llamar httpClient.put para marcar alerta como leída', async () => {
        const mockResponse = {
          data: { message: 'Marked as read', data: { id: 'alert-1' } },
          success: true,
        };
        vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

        await markAlertAsRead('alert-1');

        expect(httpClient.put).toHaveBeenCalledWith('/api/v1/alerts/alert-1/read', {});
      });
    });

    describe('getActiveAlerts', () => {
      it('debe llamar httpClient.get para obtener alertas activas', async () => {
        const mockResponse = { data: { alerts: [], count: 0 }, success: true };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await getActiveAlerts();

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/alerts/active');
      });
    });
  });

  describe('attendanceApi object', () => {
    it('debe exportar todas las funciones como propiedades', () => {
      expect(attendanceApi).toHaveProperty('listAttendance');
      expect(attendanceApi).toHaveProperty('getAttendance');
      expect(attendanceApi).toHaveProperty('createAttendance');
      expect(attendanceApi).toHaveProperty('updateAttendance');
      expect(attendanceApi).toHaveProperty('deleteAttendance');
      expect(attendanceApi).toHaveProperty('bulkAttendance');
      expect(attendanceApi).toHaveProperty('generateQR');
      expect(attendanceApi).toHaveProperty('scanQR');
      expect(attendanceApi).toHaveProperty('getQRStatus');
      expect(attendanceApi).toHaveProperty('listJustifications');
      expect(attendanceApi).toHaveProperty('listAlerts');
    });
  });

  describe('Manejo de errores', () => {
    it('debe propagar errores del httpClient', async () => {
      vi.mocked(httpClient.get).mockRejectedValue(new Error('Network error'));

      await expect(listAttendance({})).rejects.toThrow('Network error');
    });

    it('debe manejar respuestas con error del servidor', async () => {
      const errorResponse = {
        success: false,
        message: 'Not found',
        error: { code: 'NOT_FOUND' },
      };
      vi.mocked(httpClient.get).mockResolvedValue(errorResponse);

      const result = await getAttendance('non-existent');

      expect(result.success).toBe(false);
    });
  });
});
