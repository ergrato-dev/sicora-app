/**
 * SICORA - Schedule Store Tests
 *
 * Tests unitarios para el store de horarios.
 * Verifica todas las acciones, getters y lógica de filtrado.
 *
 * @fileoverview Schedule store unit tests
 * @module stores/scheduleStore.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScheduleStore } from './scheduleStore';
import type { Schedule, AcademicProgram, AcademicGroup, Venue, Campus } from '@/types/schedule.types';

// Mock de datos
const mockSchedule: Schedule = {
  id: 'schedule-1',
  instructor_id: 'instructor-1',
  academic_group_id: 'group-1',
  venue_id: 'venue-1',
  fecha_inicio: '2024-03-01T08:00:00Z',
  fecha_fin: '2024-03-01T12:00:00Z',
  hora_inicio: '08:00',
  hora_fin: '12:00',
  dia_semana: 'lunes',
  jornada: 'mañana',
  status: 'activo',
  trimestre: 1,
  año: 2024,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockSchedule2: Schedule = {
  ...mockSchedule,
  id: 'schedule-2',
  instructor_id: 'instructor-2',
  academic_group_id: 'group-2',
  dia_semana: 'martes',
};

const mockProgram: AcademicProgram = {
  id: 'program-1',
  nombre: 'Desarrollo de Software',
  codigo: 'ADSO',
  nivel: 'tecnologo',
  duracion_meses: 24,
  status: 'activo',
};

const mockGroup: AcademicGroup = {
  id: 'group-1',
  codigo: '2654321',
  program_id: 'program-1',
  jornada: 'mañana',
  status: 'activo',
  fecha_inicio: '2024-01-15',
  fecha_fin: '2026-01-15',
};

const mockVenue: Venue = {
  id: 'venue-1',
  nombre: 'Aula 101',
  codigo: 'A101',
  campus_id: 'campus-1',
  capacidad: 30,
  tipo: 'aula',
  status: 'activo',
};

const mockCampus: Campus = {
  id: 'campus-1',
  nombre: 'Sede Formación',
  codigo: 'SF',
  direccion: 'Calle 123',
  status: 'activo',
};

describe('scheduleStore', () => {
  beforeEach(() => {
    // Reset store antes de cada test
    useScheduleStore.getState().resetStore();
  });

  describe('Initial State', () => {
    it('should have empty schedules initially', () => {
      const state = useScheduleStore.getState();
      expect(state.schedules).toEqual([]);
      expect(state.selectedSchedule).toBeNull();
    });

    it('should have default calendar view as week', () => {
      const state = useScheduleStore.getState();
      expect(state.calendarView).toBe('week');
    });

    it('should have default filters', () => {
      const state = useScheduleStore.getState();
      expect(state.filters.jornada).toBe('todas');
      expect(state.filters.status).toBe('activo');
    });

    it('should have loading states as false', () => {
      const state = useScheduleStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isLoadingMasterData).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Schedule Actions', () => {
    it('should set schedules', () => {
      useScheduleStore.getState().setSchedules([mockSchedule]);
      
      const state = useScheduleStore.getState();
      expect(state.schedules).toHaveLength(1);
      expect(state.schedules[0]).toEqual(mockSchedule);
      expect(state.lastFetchTime).not.toBeNull();
    });

    it('should add a schedule', () => {
      useScheduleStore.getState().setSchedules([mockSchedule]);
      useScheduleStore.getState().addSchedule(mockSchedule2);
      
      const state = useScheduleStore.getState();
      expect(state.schedules).toHaveLength(2);
    });

    it('should update a schedule', () => {
      useScheduleStore.getState().setSchedules([mockSchedule]);
      useScheduleStore.getState().updateSchedule('schedule-1', { status: 'inactivo' });
      
      const state = useScheduleStore.getState();
      expect(state.schedules[0].status).toBe('inactivo');
    });

    it('should update selected schedule when updating same schedule', () => {
      useScheduleStore.getState().setSchedules([mockSchedule]);
      useScheduleStore.getState().setSelectedSchedule(mockSchedule);
      useScheduleStore.getState().updateSchedule('schedule-1', { status: 'suspendido' });
      
      const state = useScheduleStore.getState();
      expect(state.selectedSchedule?.status).toBe('suspendido');
    });

    it('should remove a schedule', () => {
      useScheduleStore.getState().setSchedules([mockSchedule, mockSchedule2]);
      useScheduleStore.getState().removeSchedule('schedule-1');
      
      const state = useScheduleStore.getState();
      expect(state.schedules).toHaveLength(1);
      expect(state.schedules[0].id).toBe('schedule-2');
    });

    it('should clear selected schedule when removing it', () => {
      useScheduleStore.getState().setSchedules([mockSchedule]);
      useScheduleStore.getState().setSelectedSchedule(mockSchedule);
      useScheduleStore.getState().removeSchedule('schedule-1');
      
      const state = useScheduleStore.getState();
      expect(state.selectedSchedule).toBeNull();
    });

    it('should set selected schedule', () => {
      useScheduleStore.getState().setSelectedSchedule(mockSchedule);
      
      const state = useScheduleStore.getState();
      expect(state.selectedSchedule).toEqual(mockSchedule);
    });
  });

  describe('Master Data Actions', () => {
    it('should set programs', () => {
      useScheduleStore.getState().setPrograms([mockProgram]);
      
      const state = useScheduleStore.getState();
      expect(state.programs).toHaveLength(1);
      expect(state.programs[0]).toEqual(mockProgram);
    });

    it('should set groups', () => {
      useScheduleStore.getState().setGroups([mockGroup]);
      
      const state = useScheduleStore.getState();
      expect(state.groups).toHaveLength(1);
    });

    it('should set venues', () => {
      useScheduleStore.getState().setVenues([mockVenue]);
      
      const state = useScheduleStore.getState();
      expect(state.venues).toHaveLength(1);
    });

    it('should set campuses', () => {
      useScheduleStore.getState().setCampuses([mockCampus]);
      
      const state = useScheduleStore.getState();
      expect(state.campuses).toHaveLength(1);
    });
  });

  describe('UI Actions', () => {
    it('should set calendar view', () => {
      useScheduleStore.getState().setCalendarView('month');
      
      const state = useScheduleStore.getState();
      expect(state.calendarView).toBe('month');
    });

    it('should set selected date', () => {
      const newDate = new Date('2024-06-15');
      useScheduleStore.getState().setSelectedDate(newDate);
      
      const state = useScheduleStore.getState();
      expect(state.selectedDate).toEqual(newDate);
    });

    it('should set filters', () => {
      useScheduleStore.getState().setFilters({ instructor_id: 'instructor-1' });
      
      const state = useScheduleStore.getState();
      expect(state.filters.instructor_id).toBe('instructor-1');
      // Original filters should be preserved
      expect(state.filters.status).toBe('activo');
    });

    it('should clear filters', () => {
      useScheduleStore.getState().setFilters({ instructor_id: 'instructor-1', trimestre: 2 });
      useScheduleStore.getState().clearFilters();
      
      const state = useScheduleStore.getState();
      expect(state.filters.instructor_id).toBeUndefined();
      expect(state.filters.jornada).toBe('todas');
    });
  });

  describe('Loading Actions', () => {
    it('should set loading state', () => {
      useScheduleStore.getState().setLoading(true);
      expect(useScheduleStore.getState().isLoading).toBe(true);
      
      useScheduleStore.getState().setLoading(false);
      expect(useScheduleStore.getState().isLoading).toBe(false);
    });

    it('should set master data loading state', () => {
      useScheduleStore.getState().setLoadingMasterData(true);
      expect(useScheduleStore.getState().isLoadingMasterData).toBe(true);
    });

    it('should set error', () => {
      useScheduleStore.getState().setError('Test error');
      expect(useScheduleStore.getState().error).toBe('Test error');
    });

    it('should set last fetch time', () => {
      const time = Date.now();
      useScheduleStore.getState().setLastFetchTime(time);
      expect(useScheduleStore.getState().lastFetchTime).toBe(time);
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      useScheduleStore.getState().setSchedules([mockSchedule, mockSchedule2]);
      useScheduleStore.getState().setGroups([mockGroup]);
      useScheduleStore.getState().setVenues([mockVenue]);
      useScheduleStore.getState().setCampuses([mockCampus]);
      useScheduleStore.getState().setPrograms([mockProgram]);
    });

    it('should get schedules by group', () => {
      const schedules = useScheduleStore.getState().getSchedulesByGroup('group-1');
      expect(schedules).toHaveLength(1);
      expect(schedules[0].id).toBe('schedule-1');
    });

    it('should get schedules by instructor', () => {
      const schedules = useScheduleStore.getState().getSchedulesByInstructor('instructor-1');
      expect(schedules).toHaveLength(1);
      expect(schedules[0].id).toBe('schedule-1');
    });

    it('should get schedules by venue', () => {
      const schedules = useScheduleStore.getState().getSchedulesByVenue('venue-1');
      expect(schedules).toHaveLength(2);
    });

    it('should get group by id', () => {
      const group = useScheduleStore.getState().getGroupById('group-1');
      expect(group).toEqual(mockGroup);
    });

    it('should return undefined for non-existent group', () => {
      const group = useScheduleStore.getState().getGroupById('non-existent');
      expect(group).toBeUndefined();
    });

    it('should get venue by id', () => {
      const venue = useScheduleStore.getState().getVenueById('venue-1');
      expect(venue).toEqual(mockVenue);
    });

    it('should get campus by id', () => {
      const campus = useScheduleStore.getState().getCampusById('campus-1');
      expect(campus).toEqual(mockCampus);
    });

    it('should get program by id', () => {
      const program = useScheduleStore.getState().getProgramById('program-1');
      expect(program).toEqual(mockProgram);
    });
  });

  describe('Cache Helpers', () => {
    it('should indicate refetch needed when no fetch time', () => {
      expect(useScheduleStore.getState().shouldRefetchSchedules()).toBe(true);
    });

    it('should indicate refetch needed when cache expired', () => {
      // Set fetch time to 10 minutes ago (cache is typically 5 minutes)
      const oldTime = Date.now() - 10 * 60 * 1000;
      useScheduleStore.getState().setLastFetchTime(oldTime);
      
      expect(useScheduleStore.getState().shouldRefetchSchedules()).toBe(true);
    });

    it('should indicate no refetch needed when cache fresh', () => {
      useScheduleStore.getState().setLastFetchTime(Date.now());
      
      expect(useScheduleStore.getState().shouldRefetchSchedules()).toBe(false);
    });
  });

  describe('Reset Store', () => {
    it('should reset all state to initial values', () => {
      // Modify state
      useScheduleStore.getState().setSchedules([mockSchedule]);
      useScheduleStore.getState().setSelectedSchedule(mockSchedule);
      useScheduleStore.getState().setPrograms([mockProgram]);
      useScheduleStore.getState().setLoading(true);
      useScheduleStore.getState().setError('Some error');
      
      // Reset
      useScheduleStore.getState().resetStore();
      
      const state = useScheduleStore.getState();
      expect(state.schedules).toEqual([]);
      expect(state.selectedSchedule).toBeNull();
      expect(state.programs).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
