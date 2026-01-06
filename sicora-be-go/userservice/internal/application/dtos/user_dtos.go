package dtos

import (
	"time"

	"userservice/internal/domain/entities"

	"github.com/google/uuid"
)

// UserDTO representa la transferencia de datos de usuario hacia el exterior
type UserDTO struct {
	ID                uuid.UUID  `json:"id"`
	Nombre            string     `json:"nombre"`
	Apellido          string     `json:"apellido"`
	Email             string     `json:"email"`
	Documento         string     `json:"documento"`
	Rol               string     `json:"rol"`
	FichaID           *string    `json:"ficha_id,omitempty"`
	ProgramaFormacion string     `json:"programa_formacion"`
	IsActive          bool       `json:"is_active"`
	FullName          string     `json:"full_name"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	LastLogin         *time.Time `json:"last_login,omitempty"`
}

// FromEntity convierte una entidad User a UserDTO
func (dto *UserDTO) FromEntity(user *entities.User) {
	dto.ID = user.ID
	dto.Nombre = user.Nombre
	dto.Apellido = user.Apellido
	dto.Email = user.Email
	dto.Documento = user.Documento
	dto.Rol = string(user.Rol)
	dto.FichaID = user.FichaID
	dto.ProgramaFormacion = user.ProgramaFormacion
	dto.IsActive = user.IsActive
	dto.FullName = user.GetFullName()
	dto.CreatedAt = user.CreatedAt
	dto.UpdatedAt = user.UpdatedAt
	dto.LastLogin = user.LastLogin
}

// NewUserDTOFromEntity crea un UserDTO desde una entidad
func NewUserDTOFromEntity(user *entities.User) *UserDTO {
	dto := &UserDTO{}
	dto.FromEntity(user)
	return dto
}

// CreateUserRequestDTO representa la solicitud de creación de usuario desde la API
type CreateUserRequestDTO struct {
	Nombre            string  `json:"nombre" validate:"required,min=2,max=50"`
	Apellido          string  `json:"apellido" validate:"required,min=2,max=50"`
	Email             string  `json:"email" validate:"required,email"`
	Documento         string  `json:"documento" validate:"required,min=7,max=15"`
	Rol               string  `json:"rol" validate:"required,oneof=aprendiz instructor admin coordinador"`
	Password          string  `json:"password" validate:"required,min=10"`
	FichaID           *string `json:"ficha_id,omitempty"`
	ProgramaFormacion string  `json:"programa_formacion" validate:"required,max=100"`
}

// UpdateUserRequestDTO representa la solicitud de actualización de usuario por admin
type UpdateUserRequestDTO struct {
	Nombre            string  `json:"nombre,omitempty" validate:"omitempty,min=2,max=50"`
	Apellido          string  `json:"apellido,omitempty" validate:"omitempty,min=2,max=50"`
	Email             string  `json:"email,omitempty" validate:"omitempty,email"`
	Documento         string  `json:"documento,omitempty" validate:"omitempty,min=8,max=15"`
	Rol               string  `json:"rol,omitempty" validate:"omitempty,oneof=aprendiz instructor admin coordinador"`
	FichaID           *string `json:"ficha_id,omitempty" validate:"omitempty,len=7"`
	ProgramaFormacion string  `json:"programa_formacion,omitempty" validate:"omitempty,min=5,max=100"`
	IsActive          *bool   `json:"is_active,omitempty"`
}

// UpdateProfileRequestDTO representa la solicitud de actualización de perfil por usuario autenticado
type UpdateProfileRequestDTO struct {
	UserID            uuid.UUID `json:"-"` // No serializar en JSON
	Nombre            *string   `json:"nombre,omitempty" validate:"omitempty,min=2,max=50"`
	Apellido          *string   `json:"apellido,omitempty" validate:"omitempty,min=2,max=50"`
	Email             *string   `json:"email,omitempty" validate:"omitempty,email"`
	ProgramaFormacion *string   `json:"programa_formacion,omitempty" validate:"omitempty,max=100"`
}

// ChangePasswordRequestDTO para cambio de contraseña por usuario autenticado
type ChangePasswordRequestDTO struct {
	CurrentPassword string `json:"current_password" validate:"required,min=1"`
	NewPassword     string `json:"new_password" validate:"required,min=10,max=128"`
}

// AdminResetPasswordRequestDTO para reset de contraseña por admin
type AdminResetPasswordRequestDTO struct {
	NewPassword string `json:"new_password,omitempty" validate:"omitempty,min=10,max=128"`
}

// AdminResetPasswordResponseDTO respuesta de reset por admin
type AdminResetPasswordResponseDTO struct {
	UserID             uuid.UUID `json:"user_id"`
	TemporaryPassword  string    `json:"temporary_password"`
	MustChangePassword bool      `json:"must_change_password"`
}

// AssignRoleRequestDTO para asignación de roles
type AssignRoleRequestDTO struct {
	NewRole string  `json:"new_role" validate:"required,oneof=aprendiz instructor admin coordinador"`
	FichaID *string `json:"ficha_id,omitempty" validate:"omitempty,len=7"`
}

// UserListRequestDTO representa los parámetros para listar usuarios
type UserListRequestDTO struct {
	Rol           *string `query:"rol" validate:"omitempty,oneof=aprendiz instructor admin coordinador"`
	FichaID       *string `query:"ficha_id" validate:"omitempty,len=7"`
	Programa      *string `query:"programa" validate:"omitempty,max=100"`
	IsActive      *bool   `query:"is_active"`
	Search        *string `query:"search" validate:"omitempty,max=100"`
	Page          int     `query:"page" validate:"min=1"`
	PageSize      int     `query:"page_size" validate:"min=1,max=100"`
	SortBy        string  `query:"sort_by" validate:"omitempty,oneof=nombre apellido email created_at updated_at"`
	SortDirection string  `query:"sort_direction" validate:"omitempty,oneof=asc desc"`
}

// Alias para compatibilidad
type ListUsersRequest = UserListRequestDTO

// UserListResponseDTO representa la respuesta de listado paginado
type UserListResponseDTO struct {
	Users       []*UserDTO `json:"users"`
	Total       int64      `json:"total"`
	Page        int        `json:"page"`
	PageSize    int        `json:"page_size"`
	TotalPages  int        `json:"total_pages"`
	HasNext     bool       `json:"has_next"`
	HasPrevious bool       `json:"has_previous"`
}

// UserStatsDTO representa estadísticas de usuarios
type UserStatsDTO struct {
	TotalUsers       int64 `json:"total_users"`
	ActiveUsers      int64 `json:"active_users"`
	InactiveUsers    int64 `json:"inactive_users"`
	TotalAprendices  int64 `json:"total_aprendices"`
	TotalInstructors int64 `json:"total_instructors"`
	TotalAdmins      int64 `json:"total_admins"`
}

// BulkCreateRequestDTO para creación masiva de usuarios
type BulkCreateRequestDTO struct {
	Users []CreateUserRequestDTO `json:"users" validate:"required,min=1,max=100,dive"`
}

// BulkCreateResponseDTO respuesta de creación masiva
type BulkCreateResponseDTO struct {
	Total   int                     `json:"total"`
	Success int                     `json:"success"`
	Failed  int                     `json:"failed"`
	Errors  []BulkOperationErrorDTO `json:"errors,omitempty"`
	Created []*UserDTO              `json:"created,omitempty"`
}

// BulkOperationErrorDTO representa un error en operación masiva
type BulkOperationErrorDTO struct {
	Index int    `json:"index"`
	User  string `json:"user"`
	Error string `json:"error"`
	Field string `json:"field,omitempty"`
}

// AuthenticateUserRequest representa la solicitud de autenticación
type AuthenticateUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=1"`
}

// AuthResponseDTO representa la respuesta de autenticación
type AuthResponseDTO struct {
	AccessToken  string   `json:"access_token"`
	Token        string   `json:"token,omitempty"` // Alias para compatibilidad con usecases
	RefreshToken string   `json:"refresh_token"`
	TokenType    string   `json:"token_type"`
	ExpiresIn    int      `json:"expires_in"`
	User         *UserDTO `json:"user"`
}

// GetProfileRequest representa la solicitud para obtener perfil
type GetProfileRequest struct {
	UserID uuid.UUID `json:"user_id" validate:"required"`
}

// CreateUserRequest es un alias para CreateUserRequestDTO
type CreateUserRequest = CreateUserRequestDTO

// GetUserRequest para obtener usuario por ID
type GetUserRequest struct {
	ID uuid.UUID `param:"id" validate:"required"`
}

// RefreshTokenRequest para renovar token
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// RefreshTokenResponse respuesta de renovación de token
type RefreshTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

// LogoutRequest para cerrar sesión
type LogoutRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// ForgotPasswordRequest para solicitar reset de contraseña
type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// ResetPasswordRequest para restablecer contraseña
type ResetPasswordRequest struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=10,max=128"`
}

// ForceChangePasswordRequest para cambio forzado de contraseña
type ForceChangePasswordRequest struct {
	NewPassword string `json:"new_password" validate:"required,min=10,max=128"`
}

// ErrorResponseDTO representa respuestas de error
type ErrorResponseDTO struct {
	Error   string                 `json:"error"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// SuccessResponseDTO representa respuestas de éxito
type SuccessResponseDTO struct {
	Success bool                   `json:"success"`
	Message string                 `json:"message"`
	Data    map[string]interface{} `json:"data,omitempty"`
}

// BulkCreateUserRequest representa una solicitud de creación masiva de usuarios
type BulkCreateUserRequest struct {
	Users []CreateUserRequestDTO `json:"users" validate:"required,min=1,max=100"`
}

// BulkUserResult representa el resultado de una operación masiva sobre un usuario
type BulkUserResult struct {
	Email   string     `json:"email"`
	Success bool       `json:"success"`
	Message string     `json:"message,omitempty"`
	UserID  *uuid.UUID `json:"user_id,omitempty"`
}

// BulkOperationResponse representa la respuesta de una operación masiva
type BulkOperationResponse struct {
	TotalProcessed int              `json:"total_processed"`
	SuccessCount   int              `json:"success_count"`
	FailureCount   int              `json:"failure_count"`
	Results        []BulkUserResult `json:"results"`
	Message        string           `json:"message"`
}

// BulkUpdateUserRequest representa una solicitud de actualización masiva de usuarios
type BulkUpdateUserRequest struct {
	Users []BulkUpdateUserItem `json:"users" validate:"required,min=1,max=100"`
}

// BulkUpdateUserItem representa un elemento de actualización masiva
type BulkUpdateUserItem struct {
	Email             string  `json:"email" validate:"required,email"`
	Nombre            *string `json:"nombre,omitempty"`
	Apellido          *string `json:"apellido,omitempty"`
	Documento         *string `json:"documento,omitempty"`
	FichaID           *string `json:"ficha_id,omitempty"`
	ProgramaFormacion *string `json:"programa_formacion,omitempty"`
	IsActive          *bool   `json:"is_active,omitempty"`
}

// BulkDeleteRequest representa una solicitud de eliminación masiva
type BulkDeleteRequest struct {
	Emails []string `json:"emails" validate:"required,min=1,max=100,dive,email"`
}

// BulkStatusRequest representa una solicitud de cambio de estado masivo
type BulkStatusRequest struct {
	Emails   []string `json:"emails" validate:"required,min=1,max=100,dive,email"`
	IsActive bool     `json:"is_active"`
}
