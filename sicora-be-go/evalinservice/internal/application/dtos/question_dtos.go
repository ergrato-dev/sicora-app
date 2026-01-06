package dtos

import (
	"time"

	"evalinservice/internal/domain/valueobjects"

	"github.com/google/uuid"
)

// QuestionCreateDTO representa los datos para crear una pregunta
type QuestionCreateDTO struct {
	Text        string                    `json:"text" validate:"required,min=10,max=500"`
	Description string                    `json:"description" validate:"max=1000"`
	Type        valueobjects.QuestionType `json:"type" validate:"required"`
	Category    string                    `json:"category" validate:"required,min=2,max=100"`
	Options     []string                  `json:"options"`
	IsRequired  bool                      `json:"is_required"`
}

// QuestionUpdateDTO representa los datos para actualizar una pregunta
type QuestionUpdateDTO struct {
	Text        *string  `json:"text" validate:"omitempty,min=10,max=500"`
	Description *string  `json:"description" validate:"omitempty,max=1000"`
	Category    *string  `json:"category" validate:"omitempty,min=2,max=100"`
	Options     []string `json:"options"`
	IsRequired  *bool    `json:"is_required"`
	IsActive    *bool    `json:"is_active"`
	Order       *int     `json:"order" validate:"omitempty,min=0"`
}

// QuestionResponseDTO representa una pregunta en las respuestas
type QuestionResponseDTO struct {
	ID          uuid.UUID                 `json:"id"`
	Text        string                    `json:"text"`
	Description string                    `json:"description"`
	Type        valueobjects.QuestionType `json:"type"`
	Category    string                    `json:"category"`
	Options     []string                  `json:"options"`
	IsRequired  bool                      `json:"is_required"`
	IsActive    bool                      `json:"is_active"`
	Order       int                       `json:"order"`
	CreatedAt   time.Time                 `json:"created_at"`
	UpdatedAt   time.Time                 `json:"updated_at"`
}

// QuestionListResponseDTO representa una lista paginada de preguntas
type QuestionListResponseDTO struct {
	Questions  []QuestionResponseDTO `json:"questions"`
	Total      int                   `json:"total"`
	Page       int                   `json:"page"`
	PerPage    int                   `json:"per_page"`
	TotalPages int                   `json:"total_pages"`
}

// QuestionBulkCreateDTO representa los datos para creación masiva de preguntas
type QuestionBulkCreateDTO struct {
	Questions []QuestionCreateDTO `json:"questions" validate:"required,min=1,max=100"`
}

// QuestionBulkCreateResponseDTO representa la respuesta de creación masiva
type QuestionBulkCreateResponseDTO struct {
	Created    []QuestionResponseDTO `json:"created"`
	Errors     []BulkError           `json:"errors"`
	Total      int                   `json:"total"`
	Successful int                   `json:"successful"`
	Failed     int                   `json:"failed"`
}

// QuestionCategoriesResponseDTO representa las categorías disponibles
type QuestionCategoriesResponseDTO struct {
	Categories []string `json:"categories"`
}

// QuestionFiltersDTO representa los filtros para búsqueda de preguntas
type QuestionFiltersDTO struct {
	Category   string                    `json:"category"`
	Type       valueobjects.QuestionType `json:"type"`
	IsActive   *bool                     `json:"is_active"`
	IsRequired *bool                     `json:"is_required"`
	Search     string                    `json:"search"`
	Page       int                       `json:"page" validate:"min=1"`
	PerPage    int                       `json:"per_page" validate:"min=1,max=100"`
	OrderBy    string                    `json:"order_by" validate:"omitempty,oneof=created_at updated_at order text category"`
	OrderDir   string                    `json:"order_dir" validate:"omitempty,oneof=asc desc"`
}

// BulkError representa un error en operaciones masivas
type BulkError struct {
	Index   int    `json:"index"`
	Message string `json:"message"`
	Field   string `json:"field,omitempty"`
}

// Aliases para compatibilidad con usecases
type QuestionCreateRequest = QuestionCreateDTO
type QuestionUpdateRequest = QuestionUpdateDTO
type QuestionResponse = QuestionResponseDTO
type QuestionFilterRequest = QuestionFiltersDTO

// CreateQuestionRequest alias para handlers
type CreateQuestionRequest = QuestionCreateDTO

// UpdateQuestionRequest alias para handlers
type UpdateQuestionRequest = QuestionUpdateDTO

// QuestionBulkUpdateRequest representa una solicitud de actualización masiva
type QuestionBulkUpdateRequest struct {
	Updates []QuestionBulkUpdateItem `json:"updates" validate:"required,min=1,max=100"`
}

// QuestionBulkUpdateItem representa un elemento de actualización masiva
type QuestionBulkUpdateItem struct {
	ID   uuid.UUID         `json:"id" validate:"required"`
	Data QuestionUpdateDTO `json:"data" validate:"required"`
}

// QuestionBulkUpdateResponse representa la respuesta de actualización masiva
type QuestionBulkUpdateResponse struct {
	Updated    []QuestionResponseDTO `json:"updated"`
	Errors     []BulkError           `json:"errors"`
	Total      int                   `json:"total"`
	Successful int                   `json:"successful"`
	Failed     int                   `json:"failed"`
}
