/**
 * SICORA - Tipos de Usuario
 * 
 * Tipos TypeScript sincronizados con DTOs del Backend Go (UserService)
 * @see sicora-be-go/userservice/internal/application/dtos/user_dtos.go
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export const UserRole = {
  ADMIN: 'admin',
  COORDINADOR: 'coordinador',
  INSTRUCTOR: 'instructor',
  APRENDIZ: 'aprendiz',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// Labels para mostrar en UI
export const UserRoleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  coordinador: 'Coordinador',
  instructor: 'Instructor',
  aprendiz: 'Aprendiz',
};

export const UserStatusLabels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
  suspended: 'Suspendido',
};

// ============================================================================
// TIPOS PRINCIPALES
// ============================================================================

/**
 * Usuario completo (respuesta del API)
 * Mapea a UserDTO del backend Go
 */
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  rol: UserRole;
  ficha_id?: string | null;
  programa_formacion: string;
  is_active: boolean;
  full_name: string;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

/**
 * Usuario para crear (request al API)
 * Mapea a CreateUserRequestDTO del backend Go
 */
export interface CreateUserRequest {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  rol: UserRole;
  password: string;
  ficha_id?: string;
  programa_formacion: string;
}

/**
 * Usuario para actualizar (request al API)
 * Mapea a UpdateUserRequestDTO del backend Go
 */
export interface UpdateUserRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  documento?: string;
  rol?: UserRole;
  ficha_id?: string | null;
  programa_formacion?: string;
  is_active?: boolean;
}

/**
 * Actualización de perfil propio
 * Mapea a UpdateProfileRequestDTO del backend Go
 */
export interface UpdateProfileRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  programa_formacion?: string;
}

/**
 * Cambio de contraseña
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

/**
 * Reset de contraseña por admin
 */
export interface AdminResetPasswordRequest {
  new_password?: string;
}

export interface AdminResetPasswordResponse {
  user_id: string;
  temporary_password: string;
  must_change_password: boolean;
}

/**
 * Asignación de rol
 */
export interface AssignRoleRequest {
  new_role: UserRole;
  ficha_id?: string;
}

// ============================================================================
// TIPOS DE LISTADO Y PAGINACIÓN
// ============================================================================

/**
 * Parámetros para listar usuarios
 * Mapea a UserListRequestDTO del backend Go
 */
export interface ListUsersParams {
  rol?: UserRole;
  ficha_id?: string;
  programa?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: 'nombre' | 'apellido' | 'email' | 'created_at' | 'updated_at';
  sort_direction?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de usuarios
 * Mapea a UserListResponseDTO del backend Go
 */
export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Estadísticas de usuarios
 * Mapea a UserStatsDTO del backend Go
 */
export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_aprendices: number;
  total_instructors: number;
  total_admins: number;
}

// ============================================================================
// TIPOS DE UI Y FORMULARIOS
// ============================================================================

/**
 * Estado del formulario de usuario
 */
export interface UserFormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Valores del formulario de creación
 */
export interface CreateUserFormValues extends Omit<CreateUserRequest, 'password'> {
  password: string;
  confirmPassword: string;
}

/**
 * Valores del formulario de edición
 */
export interface EditUserFormValues {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  rol: UserRole;
  ficha_id?: string;
  programa_formacion: string;
  is_active: boolean;
}

/**
 * Filtros del listado de usuarios
 */
export interface UserFilters {
  search: string;
  rol: UserRole | '';
  is_active: boolean | null;
  ficha_id: string;
}

/**
 * Opciones para selects de rol
 */
export interface RoleOption {
  value: UserRole;
  label: string;
}

export const roleOptions: RoleOption[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'coordinador', label: 'Coordinador' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'aprendiz', label: 'Aprendiz' },
];

// ============================================================================
// TIPOS DE TABLA
// ============================================================================

/**
 * Columna de la tabla de usuarios
 */
export interface UserTableColumn {
  key: keyof User | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Configuración de columnas para la tabla
 */
export const userTableColumns: UserTableColumn[] = [
  { key: 'full_name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'documento', label: 'Documento', sortable: false },
  { key: 'rol', label: 'Rol', sortable: true, width: '120px' },
  { key: 'is_active', label: 'Estado', sortable: true, width: '100px', align: 'center' },
  { key: 'created_at', label: 'Creado', sortable: true, width: '120px' },
  { key: 'actions', label: 'Acciones', sortable: false, width: '100px', align: 'center' },
];

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtener iniciales del usuario
 */
export function getUserInitials(user: Pick<User, 'nombre' | 'apellido'>): string {
  return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
}

/**
 * Obtener nombre completo formateado
 */
export function getFullName(user: Pick<User, 'nombre' | 'apellido'>): string {
  return `${user.nombre} ${user.apellido}`;
}

/**
 * Obtener color de badge según rol
 */
export function getRoleBadgeColor(rol: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800',
    coordinador: 'bg-blue-100 text-blue-800',
    instructor: 'bg-green-100 text-green-800',
    aprendiz: 'bg-yellow-100 text-yellow-800',
  };
  return colors[rol] || 'bg-gray-100 text-gray-800';
}

/**
 * Obtener color de badge según estado
 */
export function getStatusBadgeColor(isActive: boolean): string {
  return isActive
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
}
