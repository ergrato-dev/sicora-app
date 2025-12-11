package repositories

import (
	"context"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

// QuestionRepository define las operaciones para la gestión de preguntas
type QuestionRepository interface {
	// Create crea una nueva pregunta
	Create(ctx context.Context, question *entities.Question) error

	// GetByID obtiene una pregunta por su ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Question, error)

	// GetAll obtiene todas las preguntas con filtros opcionales
	GetAll(ctx context.Context, filters QuestionFilters) ([]*entities.Question, error)

	// Update actualiza una pregunta existente
	Update(ctx context.Context, question *entities.Question) error

	// Delete elimina una pregunta (soft delete)
	Delete(ctx context.Context, id uuid.UUID) error

	// GetByCategory obtiene preguntas por categoría
	GetByCategory(ctx context.Context, category string) ([]*entities.Question, error)

	// GetByType obtiene preguntas por tipo
	GetByType(ctx context.Context, questionType valueobjects.QuestionType) ([]*entities.Question, error)

	// GetActiveQuestions obtiene solo las preguntas activas
	GetActiveQuestions(ctx context.Context) ([]*entities.Question, error)

	// BulkCreate crea múltiples preguntas en una transacción
	BulkCreate(ctx context.Context, questions []*entities.Question) error

	// IsInUse verifica si una pregunta está siendo usada en cuestionarios activos
	IsInUse(ctx context.Context, id uuid.UUID) (bool, error)

	// GetCategories obtiene todas las categorías disponibles
	GetCategories(ctx context.Context) ([]string, error)
}

// QuestionFilters define los filtros para búsqueda de preguntas
type QuestionFilters struct {
	Category   string                    `json:"category"`
	Type       valueobjects.QuestionType `json:"type"`
	IsActive   *bool                     `json:"is_active"`
	IsRequired *bool                     `json:"is_required"`
	Search     string                    `json:"search"` // Búsqueda en texto y descripción
	Limit      int                       `json:"limit"`
	Offset     int                       `json:"offset"`
	OrderBy    string                    `json:"order_by"`  // "created_at", "updated_at", "order", "text"
	OrderDir   string                    `json:"order_dir"` // "asc", "desc"
}
