package repositories

import (
	"context"

	"userservice/internal/domain/entities"

	"github.com/google/uuid"
)

// UserRepository define las operaciones de persistencia para usuarios
// Esta es la interfaz del dominio que será implementada en la capa de infraestructura
type UserRepository interface {
	// Create crea un nuevo usuario en el repositorio
	Create(ctx context.Context, user *entities.User) error

	// GetByID obtiene un usuario por su ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.User, error)

	// GetByEmail obtiene un usuario por su email
	GetByEmail(ctx context.Context, email string) (*entities.User, error)

	// GetByDocumentNumber obtiene un usuario por su número de documento
	GetByDocumentNumber(ctx context.Context, documentNumber string) (*entities.User, error)

	// Update actualiza los datos de un usuario existente
	Update(ctx context.Context, user *entities.User) error

	// Delete elimina un usuario (soft delete)
	Delete(ctx context.Context, id uuid.UUID) error

	// List obtiene una lista paginada de usuarios con filtros opcionales
	List(ctx context.Context, filters UserFilters) (*PaginatedUsers, error)

	// GetByFicha obtiene todos los aprendices de una ficha específica
	GetByFicha(ctx context.Context, fichaID string) ([]*entities.User, error)

	// ExistsByEmail verifica si existe un usuario con el email dado
	ExistsByEmail(ctx context.Context, email string) (bool, error)

	// ExistsByDocumentNumber verifica si existe un usuario con el documento dado
	ExistsByDocumentNumber(ctx context.Context, documentNumber string) (bool, error)

	// BulkCreate crea múltiples usuarios en una operación
	BulkCreate(ctx context.Context, users []*entities.User) error

	// BulkUpdate actualiza múltiples usuarios en una operación
	BulkUpdate(ctx context.Context, updates map[string]*entities.User) (*BulkOperationResult, error)

	// BulkDelete elimina múltiples usuarios por emails
	BulkDelete(ctx context.Context, emails []string) (*BulkOperationResult, error)

	// BulkStatusChange cambia el estado de múltiples usuarios
	BulkStatusChange(ctx context.Context, emails []string, isActive bool) (*BulkOperationResult, error)

	// GetMultipleByEmails obtiene múltiples usuarios por sus emails
	GetMultipleByEmails(ctx context.Context, emails []string) ([]*entities.User, error)

	// Dashboard Directivo Queries

	// GetTotalUsersByRole obtiene el conteo de usuarios por rol
	GetTotalUsersByRole(ctx context.Context) (map[string]int, error)

	// GetTotalUsersByProgram obtiene el conteo de usuarios por programa
	GetTotalUsersByProgram(ctx context.Context) (map[string]int, error)

	// GetUserRegistrationTrend obtiene el registro de usuarios en los últimos N días
	GetUserRegistrationTrend(ctx context.Context, days int) (map[string]int, error)

	// GetActiveInactiveCount obtiene el conteo de usuarios activos e inactivos
	GetActiveInactiveCount(ctx context.Context) (active int, inactive int, err error)
}

// UserFilters define los filtros disponibles para buscar usuarios
type UserFilters struct {
	Rol           *entities.UserRole `json:"rol,omitempty"`
	FichaID       *string            `json:"ficha_id,omitempty"`
	Programa      *string            `json:"programa,omitempty"`
	IsActive      *bool              `json:"is_active,omitempty"`
	Search        *string            `json:"search,omitempty"` // Búsqueda por nombre, apellido o email
	Page          int                `json:"page"`
	PageSize      int                `json:"page_size"`
	SortBy        string             `json:"sort_by"`
	SortDirection string             `json:"sort_direction"` // "asc" o "desc"
}

// PaginatedUsers representa el resultado paginado de usuarios
type PaginatedUsers struct {
	Users       []*entities.User `json:"users"`
	Total       int64            `json:"total"`
	Page        int              `json:"page"`
	PageSize    int              `json:"page_size"`
	TotalPages  int              `json:"total_pages"`
	HasNext     bool             `json:"has_next"`
	HasPrevious bool             `json:"has_previous"`
}

// BulkOperationResult representa el resultado de una operación masiva
type BulkOperationResult struct {
	Total   int                  `json:"total"`
	Success int                  `json:"success"`
	Failed  int                  `json:"failed"`
	Errors  []BulkOperationError `json:"errors,omitempty"`
}

// BulkOperationError representa un error en una operación masiva
type BulkOperationError struct {
	Index int    `json:"index"`
	User  string `json:"user"` // Email o documento para identificar
	Error string `json:"error"`
	Field string `json:"field,omitempty"`
}