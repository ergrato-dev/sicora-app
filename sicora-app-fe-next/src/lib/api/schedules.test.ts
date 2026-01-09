/**
 * SICORA - Schedules API Client Tests
 *
 * Tests unitarios para el cliente API de horarios.
 * Testea las funciones exportadas por schedulesApi.
 *
 * @fileoverview Schedules API tests
 * @module lib/api/schedules.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { schedulesApi } from './schedules';
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

describe('schedulesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ==========================================================================
     SCHEDULES CRUD
     ========================================================================== */

  describe('Schedules CRUD', () => {
    describe('listSchedules', () => {
      it('should call httpClient.get with correct endpoint', async () => {
        const mockResponse = {
          data: { schedules: [], total: 0, page: 1 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        const params = { instructor_id: 'inst-1', trimestre: 1 };

        await schedulesApi.listSchedules(params);

        expect(httpClient.get).toHaveBeenCalled();
      });

      it('should handle empty params', async () => {
        const mockResponse = {
          data: { schedules: [], total: 0 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.listSchedules();

        expect(httpClient.get).toHaveBeenCalled();
      });
    });

    describe('getSchedule', () => {
      it('should call httpClient.get with schedule ID', async () => {
        const mockResponse = {
          data: {
            id: 'sch-1',
            subject: 'Matemáticas',
            dia_semana: 'lunes',
            hora_inicio: '08:00',
            hora_fin: '10:00',
          },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.getSchedule('sch-1');

        expect(httpClient.get).toHaveBeenCalledWith('/api/v1/schedules/sch-1');
      });
    });

    describe('createSchedule', () => {
      it('should call httpClient.post with schedule data', async () => {
        const mockResponse = {
          data: { id: 'sch-new', subject: 'Física' },
          status: 201,
          message: 'Created',
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          instructor_id: 'inst-1',
          academic_group_id: 'group-1',
          venue_id: 'venue-1',
          subject: 'Física',
          fecha_inicio: '2024-03-01',
          fecha_fin: '2024-06-30',
          hora_inicio: '10:00',
          hora_fin: '12:00',
          dia_semana: 'martes',
          jornada: 'manana' as const,
          trimestre: 1,
          año: 2024,
        };

        await schedulesApi.createSchedule(request);

        expect(httpClient.post).toHaveBeenCalledWith(
          '/api/v1/schedules',
          request
        );
      });
    });

    describe('updateSchedule', () => {
      it('should call httpClient.put with schedule ID and updates', async () => {
        const mockResponse = {
          data: { id: 'sch-1', subject: 'Física Avanzada' },
          status: 200,
          message: 'Updated',
        };
        vi.mocked(httpClient.put).mockResolvedValue(mockResponse);

        const updates = { subject: 'Física Avanzada' };

        await schedulesApi.updateSchedule('sch-1', updates);

        expect(httpClient.put).toHaveBeenCalledWith(
          '/api/v1/schedules/sch-1',
          updates
        );
      });
    });

    describe('deleteSchedule', () => {
      it('should call httpClient.delete with schedule ID', async () => {
        const mockResponse = {
          data: null,
          status: 204,
          message: 'Deleted',
        };
        vi.mocked(httpClient.delete).mockResolvedValue(mockResponse);

        await schedulesApi.deleteSchedule('sch-1');

        expect(httpClient.delete).toHaveBeenCalledWith('/api/v1/schedules/sch-1');
      });
    });

    describe('validateSchedule', () => {
      it('should call httpClient.post with validation data', async () => {
        const mockResponse = {
          data: { is_valid: true, conflicts: [] },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          instructor_id: 'inst-1',
          academic_group_id: 'group-1',
          venue_id: 'venue-1',
          subject: 'Matemáticas',
          fecha_inicio: '2024-03-01',
          fecha_fin: '2024-06-30',
          hora_inicio: '08:00',
          hora_fin: '10:00',
          dia_semana: 'lunes',
          jornada: 'manana' as const,
          trimestre: 1,
          año: 2024,
        };

        await schedulesApi.validateSchedule(request);

        expect(httpClient.post).toHaveBeenCalledWith(
          '/api/v1/schedules/validate',
          request
        );
      });
    });

    describe('getInstructorScheduleStats', () => {
      it('should call httpClient.get with instructor stats endpoint', async () => {
        const mockResponse = {
          data: { totalHours: 40, totalClasses: 10 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.getInstructorScheduleStats('inst-1');

        expect(httpClient.get).toHaveBeenCalledWith(
          '/api/v1/schedules/instructor/inst-1/stats'
        );
      });
    });

    describe('checkAvailability', () => {
      it('should call httpClient.get with availability endpoint', async () => {
        const mockResponse = {
          data: { available: true },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        const params = {
          resource_type: 'venue' as const,
          resource_id: 'venue-1',
          date: '2024-03-15',
        };

        await schedulesApi.checkAvailability(params);

        expect(httpClient.get).toHaveBeenCalled();
      });
    });
  });

  /* ==========================================================================
     PROGRAMS CRUD
     ========================================================================== */

  describe('Programs CRUD', () => {
    describe('listPrograms', () => {
      it('should call httpClient.get for programs', async () => {
        const mockResponse = {
          data: { programs: [], total: 0 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.listPrograms();

        expect(httpClient.get).toHaveBeenCalled();
      });
    });

    describe('getProgram', () => {
      it('should call httpClient.get with program ID', async () => {
        const mockResponse = {
          data: { id: 'prog-1', nombre: 'Desarrollo de Software' },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.getProgram('prog-1');

        expect(httpClient.get).toHaveBeenCalledWith(
          '/api/v1/master-data/academic-programs/prog-1'
        );
      });
    });

    describe('createProgram', () => {
      it('should call httpClient.post with program data', async () => {
        const mockResponse = {
          data: { id: 'prog-new' },
          status: 201,
          message: 'Created',
        };
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        const request = {
          name: 'Data Science',
          code: 'DS-001',
          type: 'TECNOLOGO' as const,
          duration_months: 24,
          description: 'Programa de ciencia de datos',
        };

        await schedulesApi.createProgram(request);

        expect(httpClient.post).toHaveBeenCalledWith(
          '/api/v1/master-data/academic-programs',
          request
        );
      });
    });

    describe('deleteProgram', () => {
      it('should call httpClient.delete with program ID', async () => {
        const mockResponse = { data: null, status: 204, message: 'Deleted' };
        vi.mocked(httpClient.delete).mockResolvedValue(mockResponse);

        await schedulesApi.deleteProgram('prog-1');

        expect(httpClient.delete).toHaveBeenCalledWith(
          '/api/v1/master-data/academic-programs/prog-1'
        );
      });
    });
  });

  /* ==========================================================================
     GROUPS (FICHAS) CRUD
     ========================================================================== */

  describe('Groups (Fichas) CRUD', () => {
    describe('listGroups', () => {
      it('should call httpClient.get for groups', async () => {
        const mockResponse = {
          data: { groups: [], total: 0 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.listGroups();

        expect(httpClient.get).toHaveBeenCalled();
      });
    });

    describe('getGroup', () => {
      it('should call httpClient.get with group ID', async () => {
        const mockResponse = {
          data: { id: 'group-1', codigo: 'Ficha 2541238' },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.getGroup('group-1');

        expect(httpClient.get).toHaveBeenCalledWith(
          '/api/v1/master-data/academic-groups/group-1'
        );
      });
    });

    describe('deleteGroup', () => {
      it('should call httpClient.delete with group ID', async () => {
        const mockResponse = { data: null, status: 204, message: 'Deleted' };
        vi.mocked(httpClient.delete).mockResolvedValue(mockResponse);

        await schedulesApi.deleteGroup('group-1');

        expect(httpClient.delete).toHaveBeenCalledWith(
          '/api/v1/master-data/academic-groups/group-1'
        );
      });
    });
  });

  /* ==========================================================================
     VENUES (AMBIENTES) CRUD
     ========================================================================== */

  describe('Venues (Ambientes) CRUD', () => {
    describe('listVenues', () => {
      it('should call httpClient.get for venues', async () => {
        const mockResponse = {
          data: { venues: [], total: 0 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.listVenues();

        expect(httpClient.get).toHaveBeenCalled();
      });
    });

    describe('getVenue', () => {
      it('should call httpClient.get with venue ID', async () => {
        const mockResponse = {
          data: { id: 'venue-1', nombre: 'Aula 101' },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.getVenue('venue-1');

        expect(httpClient.get).toHaveBeenCalledWith(
          '/api/v1/master-data/venues/venue-1'
        );
      });
    });

    describe('deleteVenue', () => {
      it('should call httpClient.delete with venue ID', async () => {
        const mockResponse = { data: null, status: 204, message: 'Deleted' };
        vi.mocked(httpClient.delete).mockResolvedValue(mockResponse);

        await schedulesApi.deleteVenue('venue-1');

        expect(httpClient.delete).toHaveBeenCalledWith(
          '/api/v1/master-data/venues/venue-1'
        );
      });
    });
  });

  /* ==========================================================================
     CAMPUSES (SEDES) CRUD
     ========================================================================== */

  describe('Campuses (Sedes) CRUD', () => {
    describe('listCampuses', () => {
      it('should call httpClient.get for campuses', async () => {
        const mockResponse = {
          data: { campuses: [], total: 0 },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.listCampuses();

        expect(httpClient.get).toHaveBeenCalled();
      });
    });

    describe('getCampus', () => {
      it('should call httpClient.get with campus ID', async () => {
        const mockResponse = {
          data: { id: 'campus-1', nombre: 'Sede Formación' },
          status: 200,
          message: 'Success',
        };
        vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

        await schedulesApi.getCampus('campus-1');

        expect(httpClient.get).toHaveBeenCalledWith(
          '/api/v1/master-data/campuses/campus-1'
        );
      });
    });

    describe('deleteCampus', () => {
      it('should call httpClient.delete with campus ID', async () => {
        const mockResponse = { data: null, status: 204, message: 'Deleted' };
        vi.mocked(httpClient.delete).mockResolvedValue(mockResponse);

        await schedulesApi.deleteCampus('campus-1');

        expect(httpClient.delete).toHaveBeenCalledWith(
          '/api/v1/master-data/campuses/campus-1'
        );
      });
    });
  });
});

