/**
 * SICORA - Tipos para ScheduleService
 *
 * Interfaces y tipos para la comunicación con el backend Go (ScheduleService)
 * incluyendo horarios, programas académicos, fichas, ambientes y sedes.
 *
 * @fileoverview Schedule types
 * @module types/schedule
 */

/* =============================================================================
   ENUMERACIONES
   ============================================================================= */

/**
 * Estado de un horario
 */
export type ScheduleStatus = 'activo' | 'inactivo' | 'suspendido' | 'finalizado';

/**
 * Tipo de programa de formación
 */
export type ProgramType = 'TECNICO' | 'TECNOLOGO' | 'ESPECIALIZACION' | 'COMPLEMENTARIO';

/**
 * Estado de un programa académico
 */
export type ProgramStatus = 'activo' | 'inactivo' | 'suspendido';

/**
 * Estado de una ficha/grupo académico
 */
export type GroupStatus = 'en_formacion' | 'finalizada' | 'suspendida' | 'en_etapa_productiva';

/**
 * Tipo de ambiente
 */
export type VenueType = 'aula' | 'laboratorio' | 'taller' | 'auditorio' | 'virtual' | 'externo';

/* =============================================================================
   INTERFACES - HORARIOS (SCHEDULES)
   ============================================================================= */

/**
 * Horario programado - Entidad principal
 */
export interface Schedule {
  id: string;
  instructor_id: string;
  instructor_name?: string;
  academic_group_id: string;
  group_code?: string;
  venue_id: string;
  venue_name?: string;
  subject: string;
  competencia?: string;
  resultado_aprendizaje?: string;
  fecha_inicio: string; // ISO 8601
  fecha_fin: string;
  hora_inicio: string; // HH:mm
  hora_fin: string;
  dia_semana: string; // lunes, martes, etc.
  jornada: 'manana' | 'tarde' | 'noche';
  trimestre: number; // 1, 2, 3, 4
  año: number;
  status: ScheduleStatus;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request para crear un horario
 */
export interface CreateScheduleRequest {
  instructor_id: string;
  academic_group_id: string;
  venue_id: string;
  subject: string;
  competencia?: string;
  resultado_aprendizaje?: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  dia_semana: string;
  jornada: 'manana' | 'tarde' | 'noche';
  trimestre: number;
  año: number;
  observaciones?: string;
}

/**
 * Request para actualizar un horario
 */
export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  status?: ScheduleStatus;
}

/**
 * Parámetros para listar horarios
 */
export interface ListSchedulesParams {
  instructor_id?: string;
  academic_group_id?: string;
  venue_id?: string;
  jornada?: string;
  trimestre?: number;
  año?: number;
  status?: ScheduleStatus;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de horarios
 */
export interface SchedulesListResponse {
  schedules: Schedule[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Conflicto detectado en horario
 */
export interface ScheduleConflict {
  type: 'instructor' | 'venue' | 'group';
  schedule_id: string;
  conflicting_schedule_id: string;
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Respuesta de validación de horario
 */
export interface ValidateScheduleResponse {
  is_valid: boolean;
  conflicts: ScheduleConflict[];
  warnings: string[];
}

/* =============================================================================
   INTERFACES - PROGRAMAS ACADÉMICOS
   ============================================================================= */

/**
 * Programa de formación académica
 */
export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  type: ProgramType;
  duration_months: number;
  description?: string;
  competencias?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request para crear programa
 */
export interface CreateProgramRequest {
  name: string;
  code: string;
  type: ProgramType;
  duration_months: number;
  description?: string;
  competencias?: string[];
}

/**
 * Request para actualizar programa
 */
export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  is_active?: boolean;
}

/**
 * Parámetros para listar programas
 */
export interface ListProgramsParams {
  type?: ProgramType;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

/**
 * Respuesta de lista de programas
 */
export interface ProgramsListResponse {
  programs: AcademicProgram[];
  total: number;
  page: number;
  page_size: number;
}

/* =============================================================================
   INTERFACES - FICHAS/GRUPOS ACADÉMICOS
   ============================================================================= */

/**
 * Ficha o grupo académico
 */
export interface AcademicGroup {
  id: string;
  code: string; // Código de ficha (ej: 2826503)
  program_id: string;
  program_name?: string;
  program_code?: string;
  name: string; // Nombre descriptivo
  instructor_director_id?: string;
  instructor_director_name?: string;
  fecha_inicio: string;
  fecha_fin_lectiva: string;
  fecha_fin_etapa_productiva?: string;
  jornada: 'manana' | 'tarde' | 'noche' | 'mixta';
  campus_id: string;
  campus_name?: string;
  max_students: number;
  current_students: number;
  status: GroupStatus;
  trimestre_actual: number;
  created_at: string;
  updated_at: string;
}

/**
 * Request para crear ficha
 */
export interface CreateGroupRequest {
  code: string;
  program_id: string;
  name: string;
  instructor_director_id?: string;
  fecha_inicio: string;
  fecha_fin_lectiva: string;
  fecha_fin_etapa_productiva?: string;
  jornada: 'manana' | 'tarde' | 'noche' | 'mixta';
  campus_id: string;
  max_students: number;
}

/**
 * Request para actualizar ficha
 */
export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {
  status?: GroupStatus;
  trimestre_actual?: number;
}

/**
 * Parámetros para listar fichas
 */
export interface ListGroupsParams {
  program_id?: string;
  campus_id?: string;
  instructor_director_id?: string;
  jornada?: string;
  status?: GroupStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

/**
 * Respuesta de lista de fichas
 */
export interface GroupsListResponse {
  groups: AcademicGroup[];
  total: number;
  page: number;
  page_size: number;
}

/* =============================================================================
   INTERFACES - AMBIENTES
   ============================================================================= */

/**
 * Ambiente físico o virtual
 */
export interface Venue {
  id: string;
  name: string;
  code: string;
  type: VenueType;
  campus_id: string;
  campus_name?: string;
  capacity: number;
  building?: string;
  floor?: string;
  room_number?: string;
  equipment?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request para crear ambiente
 */
export interface CreateVenueRequest {
  name: string;
  code: string;
  type: VenueType;
  campus_id: string;
  capacity: number;
  building?: string;
  floor?: string;
  room_number?: string;
  equipment?: string[];
}

/**
 * Request para actualizar ambiente
 */
export interface UpdateVenueRequest extends Partial<CreateVenueRequest> {
  is_active?: boolean;
}

/**
 * Parámetros para listar ambientes
 */
export interface ListVenuesParams {
  campus_id?: string;
  type?: VenueType;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

/**
 * Respuesta de lista de ambientes
 */
export interface VenuesListResponse {
  venues: Venue[];
  total: number;
  page: number;
  page_size: number;
}

/* =============================================================================
   INTERFACES - SEDES (CAMPUSES)
   ============================================================================= */

/**
 * Sede o centro de formación
 */
export interface Campus {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  department: string;
  phone?: string;
  email?: string;
  director_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request para crear sede
 */
export interface CreateCampusRequest {
  name: string;
  code: string;
  address: string;
  city: string;
  department: string;
  phone?: string;
  email?: string;
  director_name?: string;
}

/**
 * Request para actualizar sede
 */
export interface UpdateCampusRequest extends Partial<CreateCampusRequest> {
  is_active?: boolean;
}

/**
 * Parámetros para listar sedes
 */
export interface ListCampusesParams {
  city?: string;
  department?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

/**
 * Respuesta de lista de sedes
 */
export interface CampusesListResponse {
  campuses: Campus[];
  total: number;
  page: number;
  page_size: number;
}

/* =============================================================================
   ESTADÍSTICAS Y UTILIDADES
   ============================================================================= */

/**
 * Estadísticas del instructor
 */
export interface InstructorScheduleStats {
  total_hours_week: number;
  total_hours_trimester: number;
  total_classes: number;
  groups_count: number;
  venues_count: number;
  hours_by_jornada: {
    manana: number;
    tarde: number;
    noche: number;
  };
  hours_by_day: Record<string, number>;
}

/**
 * Disponibilidad de un recurso
 */
export interface ResourceAvailability {
  resource_type: 'instructor' | 'venue' | 'group';
  resource_id: string;
  date: string;
  available_slots: {
    start: string;
    end: string;
    jornada: string;
  }[];
  occupied_slots: {
    start: string;
    end: string;
    schedule_id: string;
    reason: string;
  }[];
}

/**
 * Mapeo entre ClaseProgramada (frontend) y Schedule (backend)
 */
export function mapScheduleToClaseProgramada(schedule: Schedule): {
  id: string;
  fichaId: string;
  ambiente: string;
  competencia: string;
  resultadoAprendizaje: string;
  horaInicio: { hour: number; minutes: number };
  horaFin: { hour: number; minutes: number };
  jornada: 'manana' | 'tarde' | 'noche';
  dia: string;
  status: string;
} {
  const [startHour, startMin] = schedule.hora_inicio.split(':').map(Number);
  const [endHour, endMin] = schedule.hora_fin.split(':').map(Number);
  
  return {
    id: schedule.id,
    fichaId: schedule.academic_group_id,
    ambiente: schedule.venue_name || schedule.venue_id,
    competencia: schedule.competencia || schedule.subject,
    resultadoAprendizaje: schedule.resultado_aprendizaje || '',
    horaInicio: { hour: startHour, minutes: startMin },
    horaFin: { hour: endHour, minutes: endMin },
    jornada: schedule.jornada,
    dia: schedule.dia_semana,
    status: schedule.status === 'activo' ? 'confirmada' : schedule.status,
  };
}
