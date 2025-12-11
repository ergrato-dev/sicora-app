package repositories

import (
	"context"

	"evalinservice/internal/domain/entities"
	"github.com/google/uuid"
)

// QuestionnaireRepository define las operaciones para la gestión de cuestionarios
type QuestionnaireRepository interface {
	// Create crea un nuevo cuestionario
	Create(ctx context.Context, questionnaire *entities.Questionnaire) error

	// GetByID obtiene un cuestionario por su ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Questionnaire, error)

	// GetAll obtiene todos los cuestionarios con filtros opcionales
	GetAll(ctx context.Context, filters QuestionnaireFilters) ([]*entities.Questionnaire, error)

	// Update actualiza un cuestionario existente
	Update(ctx context.Context, questionnaire *entities.Questionnaire) error

	// Delete elimina un cuestionario (soft delete)
	Delete(ctx context.Context, id uuid.UUID) error

	// GetActiveQuestionnaires obtiene solo los cuestionarios activos
	GetActiveQuestionnaires(ctx context.Context) ([]*entities.Questionnaire, error)

	// GetQuestionnaireWithQuestions obtiene un cuestionario con sus preguntas completas
	GetQuestionnaireWithQuestions(ctx context.Context, id uuid.UUID) (*entities.Questionnaire, []*entities.Question, error)

	// AddQuestionToQuestionnaire agrega una pregunta a un cuestionario
	AddQuestionToQuestionnaire(ctx context.Context, questionnaireID, questionID uuid.UUID) error

	// RemoveQuestionFromQuestionnaire remueve una pregunta de un cuestionario
	RemoveQuestionFromQuestionnaire(ctx context.Context, questionnaireID, questionID uuid.UUID) error

	// ReorderQuestions reordena las preguntas en un cuestionario
	ReorderQuestions(ctx context.Context, questionnaireID uuid.UUID, questionIDs []uuid.UUID) error

	// IsInUse verifica si un cuestionario está siendo usado en períodos activos
	IsInUse(ctx context.Context, id uuid.UUID) (bool, error)

	// GetQuestionnairesByQuestion obtiene cuestionarios que contienen una pregunta específica
	GetQuestionnairesByQuestion(ctx context.Context, questionID uuid.UUID) ([]*entities.Questionnaire, error)
}

// QuestionnaireFilters define los filtros para búsqueda de cuestionarios
type QuestionnaireFilters struct {
	IsActive     *bool  `json:"is_active"`
	Search       string `json:"search"`        // Búsqueda en nombre y descripción
	HasQuestions *bool  `json:"has_questions"` // Solo cuestionarios con/sin preguntas
	Limit        int    `json:"limit"`
	Offset       int    `json:"offset"`
	OrderBy      string `json:"order_by"`  // "created_at", "updated_at", "name"
	OrderDir     string `json:"order_dir"` // "asc", "desc"
}
