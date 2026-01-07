/**
 * Tipos para el módulo de gestión de usuarios
 * Integración con Backend Go - UserService
 */

// Roles de usuario del sistema
export const UserRole = {
  ADMIN: 'admin',
  COORDINADOR: 'coordinador',
  INSTRUCTOR: 'instructor',
  APRENDIZ: 'aprendiz',
  ADMINISTRATIVO: 'administrativo',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Estados de usuario
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// Usuario completo (respuesta del backend)
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  document_type: DocumentType;
  document_number: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Campos específicos según rol
  coordination?: string; // Para coordinadores
  program?: string; // Para instructores/aprendices
  ficha?: string; // Para aprendices
}

// Tipos de documento
export const DocumentType = {
  CC: 'CC', // Cédula de ciudadanía
  TI: 'TI', // Tarjeta de identidad
  CE: 'CE', // Cédula de extranjería
  PASSPORT: 'PASSPORT',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

// Crear usuario
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  document_type: DocumentType;
  document_number: string;
  phone?: string;
  role: UserRole;
  permissions?: string[];
  coordination?: string;
  program?: string;
  ficha?: string;
}

// Actualizar usuario
export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: string[];
  coordination?: string;
  program?: string;
  ficha?: string;
}

// Cambiar contraseña (admin)
export interface AdminChangePasswordRequest {
  user_id: string;
  new_password: string;
}

// Filtros de búsqueda
export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  coordination?: string;
  program?: string;
  ficha?: string;
}

// Paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Respuesta de lista de usuarios
export type UsersListResponse = PaginatedResponse<User>;

// Permisos disponibles
export const UserPermissions = {
  // Usuarios
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  // Horarios
  SCHEDULES_VIEW: 'schedules:view',
  SCHEDULES_CREATE: 'schedules:create',
  SCHEDULES_EDIT: 'schedules:edit',
  SCHEDULES_DELETE: 'schedules:delete',
  // Asistencia
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_EDIT: 'attendance:edit',
  // Evaluaciones
  EVALUATIONS_VIEW: 'evaluations:view',
  EVALUATIONS_CREATE: 'evaluations:create',
  EVALUATIONS_EDIT: 'evaluations:edit',
  EVALUATIONS_DELETE: 'evaluations:delete',
  // Reportes
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  // Configuración
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const;

export type UserPermission = (typeof UserPermissions)[keyof typeof UserPermissions];

// Labels para UI
export const RoleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  coordinador: 'Coordinador',
  instructor: 'Instructor',
  aprendiz: 'Aprendiz',
  administrativo: 'Administrativo',
};

export const StatusLabels: Record<UserStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
  suspended: 'Suspendido',
};

export const DocumentTypeLabels: Record<DocumentType, string> = {
  CC: 'Cédula de Ciudadanía',
  TI: 'Tarjeta de Identidad',
  CE: 'Cédula de Extranjería',
  PASSPORT: 'Pasaporte',
};
