package entities

import (
	"strings"
	"time"

	"evalinservice/internal/domain/exceptions"
	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

// Question representa una pregunta en el sistema de evaluación
type Question struct {
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

// NewQuestion crea una nueva pregunta
func NewQuestion(text, description string, questionType valueobjects.QuestionType, category string, options []string, isRequired bool) (*Question, error) {
	if err := validateQuestionData(text, description, questionType, category, options); err != nil {
		return nil, err
	}

	now := time.Now()
	return &Question{
		ID:          uuid.New(),
		Text:        strings.TrimSpace(text),
		Description: strings.TrimSpace(description),
		Type:        questionType,
		Category:    strings.TrimSpace(category),
		Options:     normalizeOptions(options),
		IsRequired:  isRequired,
		IsActive:    true,
		Order:       0, // Se asignará cuando se agregue a un cuestionario
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// UpdateText actualiza el texto de la pregunta
func (q *Question) UpdateText(newText string) error {
	if strings.TrimSpace(newText) == "" {
		return exceptions.NewValidationError("text", "el texto de la pregunta no puede estar vacío")
	}

	if len(newText) > 500 {
		return exceptions.NewValidationError("text", "el texto de la pregunta no puede exceder 500 caracteres")
	}

	q.Text = strings.TrimSpace(newText)
	q.UpdatedAt = time.Now()
	return nil
}

// UpdateDescription actualiza la descripción de la pregunta
func (q *Question) UpdateDescription(newDescription string) {
	q.Description = strings.TrimSpace(newDescription)
	q.UpdatedAt = time.Now()
}

// UpdateCategory actualiza la categoría de la pregunta
func (q *Question) UpdateCategory(newCategory string) error {
	if strings.TrimSpace(newCategory) == "" {
		return exceptions.NewValidationError("category", "la categoría no puede estar vacía")
	}

	q.Category = strings.TrimSpace(newCategory)
	q.UpdatedAt = time.Now()
	return nil
}

// UpdateOptions actualiza las opciones de la pregunta
func (q *Question) UpdateOptions(newOptions []string) error {
	if q.Type.RequiresOptions() && len(newOptions) == 0 {
		return exceptions.NewValidationError("options", "este tipo de pregunta requiere opciones")
	}

	if !q.Type.RequiresOptions() && len(newOptions) > 0 {
		return exceptions.NewValidationError("options", "este tipo de pregunta no admite opciones")
	}

	q.Options = normalizeOptions(newOptions)
	q.UpdatedAt = time.Now()
	return nil
}

// SetRequired establece si la pregunta es obligatoria
func (q *Question) SetRequired(required bool) {
	q.IsRequired = required
	q.UpdatedAt = time.Now()
}

// Activate activa la pregunta
func (q *Question) Activate() {
	q.IsActive = true
	q.UpdatedAt = time.Now()
}

// Deactivate desactiva la pregunta
func (q *Question) Deactivate() {
	q.IsActive = false
	q.UpdatedAt = time.Now()
}

// SetOrder establece el orden de la pregunta
func (q *Question) SetOrder(order int) error {
	if order < 0 {
		return exceptions.NewValidationError("order", "el orden no puede ser negativo")
	}

	q.Order = order
	q.UpdatedAt = time.Now()
	return nil
}

// ValidateResponse valida una respuesta para esta pregunta
func (q *Question) ValidateResponse(response string) error {
	response = strings.TrimSpace(response)

	// Validar si es obligatoria y está vacía
	if q.IsRequired && response == "" {
		return exceptions.NewValidationError("response", "esta pregunta es obligatoria")
	}

	// Si no es obligatoria y está vacía, es válida
	if !q.IsRequired && response == "" {
		return nil
	}

	// Validar según el tipo de pregunta
	switch q.Type {
	case valueobjects.QuestionTypeLikert:
		return q.validateLikertResponse(response)
	case valueobjects.QuestionTypeBoolean:
		return q.validateBooleanResponse(response)
	case valueobjects.QuestionTypeSingleChoice:
		return q.validateSingleChoiceResponse(response)
	case valueobjects.QuestionTypeMultipleChoice:
		return q.validateMultipleChoiceResponse(response)
	case valueobjects.QuestionTypeText:
		return q.validateTextResponse(response)
	default:
		return exceptions.NewInvalidQuestionTypeError(string(q.Type))
	}
}

// Métodos de validación privados
func (q *Question) validateLikertResponse(response string) error {
	validOptions := q.Type.GetValidOptions()
	for _, option := range validOptions {
		if response == option {
			return nil
		}
	}
	return exceptions.NewInvalidEvaluationResponseError(q.ID.String(), response)
}

func (q *Question) validateBooleanResponse(response string) error {
	if response == "true" || response == "false" {
		return nil
	}
	return exceptions.NewInvalidEvaluationResponseError(q.ID.String(), response)
}

func (q *Question) validateSingleChoiceResponse(response string) error {
	for _, option := range q.Options {
		if response == option {
			return nil
		}
	}
	return exceptions.NewInvalidEvaluationResponseError(q.ID.String(), response)
}

func (q *Question) validateMultipleChoiceResponse(response string) error {
	// Para respuestas múltiples, esperamos un formato separado por comas
	selectedOptions := strings.Split(response, ",")
	for _, selected := range selectedOptions {
		selected = strings.TrimSpace(selected)
		found := false
		for _, option := range q.Options {
			if selected == option {
				found = true
				break
			}
		}
		if !found {
			return exceptions.NewInvalidEvaluationResponseError(q.ID.String(), selected)
		}
	}
	return nil
}

func (q *Question) validateTextResponse(response string) error {
	if len(response) > 1000 {
		return exceptions.NewValidationError("response", "la respuesta de texto no puede exceder 1000 caracteres")
	}
	return nil
}

// Funciones de validación
func validateQuestionData(text, description string, questionType valueobjects.QuestionType, category string, options []string) error {
	// Validar texto
	if strings.TrimSpace(text) == "" {
		return exceptions.NewRequiredFieldError("text")
	}
	if len(text) > 500 {
		return exceptions.NewValidationError("text", "el texto no puede exceder 500 caracteres")
	}

	// Validar descripción
	if len(description) > 1000 {
		return exceptions.NewValidationError("description", "la descripción no puede exceder 1000 caracteres")
	}

	// Validar tipo de pregunta
	if !questionType.IsValid() {
		return exceptions.NewInvalidQuestionTypeError(string(questionType))
	}

	// Validar categoría
	if strings.TrimSpace(category) == "" {
		return exceptions.NewRequiredFieldError("category")
	}
	if len(category) > 100 {
		return exceptions.NewValidationError("category", "la categoría no puede exceder 100 caracteres")
	}

	// Validar opciones según el tipo
	if questionType.RequiresOptions() {
		if len(options) == 0 {
			return exceptions.NewValidationError("options", "este tipo de pregunta requiere opciones")
		}
		if len(options) > 10 {
			return exceptions.NewValidationError("options", "no se pueden tener más de 10 opciones")
		}
	} else if len(options) > 0 {
		return exceptions.NewValidationError("options", "este tipo de pregunta no admite opciones")
	}

	return nil
}

func normalizeOptions(options []string) []string {
	if len(options) == 0 {
		return nil
	}

	normalized := make([]string, 0, len(options))
	seen := make(map[string]bool)

	for _, option := range options {
		trimmed := strings.TrimSpace(option)
		if trimmed != "" && !seen[trimmed] {
			normalized = append(normalized, trimmed)
			seen[trimmed] = true
		}
	}

	return normalized
}
