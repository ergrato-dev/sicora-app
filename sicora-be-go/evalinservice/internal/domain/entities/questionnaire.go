package entities

import (
	"strings"
	"time"

	"evalinservice/internal/domain/exceptions"
	"github.com/google/uuid"
)

// Questionnaire representa un cuestionario que agrupa preguntas
type Questionnaire struct {
	ID          uuid.UUID   `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	IsActive    bool        `json:"is_active"`
	QuestionIDs []uuid.UUID `json:"question_ids"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// NewQuestionnaire crea un nuevo cuestionario
func NewQuestionnaire(name, description string) (*Questionnaire, error) {
	if err := validateQuestionnaireData(name, description); err != nil {
		return nil, err
	}

	now := time.Now()
	return &Questionnaire{
		ID:          uuid.New(),
		Name:        strings.TrimSpace(name),
		Description: strings.TrimSpace(description),
		IsActive:    true,
		QuestionIDs: make([]uuid.UUID, 0),
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// UpdateName actualiza el nombre del cuestionario
func (q *Questionnaire) UpdateName(newName string) error {
	if strings.TrimSpace(newName) == "" {
		return exceptions.NewRequiredFieldError("name")
	}

	if len(newName) > 200 {
		return exceptions.NewValidationError("name", "el nombre no puede exceder 200 caracteres")
	}

	q.Name = strings.TrimSpace(newName)
	q.UpdatedAt = time.Now()
	return nil
}

// UpdateDescription actualiza la descripción del cuestionario
func (q *Questionnaire) UpdateDescription(newDescription string) error {
	if len(newDescription) > 1000 {
		return exceptions.NewValidationError("description", "la descripción no puede exceder 1000 caracteres")
	}

	q.Description = strings.TrimSpace(newDescription)
	q.UpdatedAt = time.Now()
	return nil
}

// AddQuestion agrega una pregunta al cuestionario
func (q *Questionnaire) AddQuestion(questionID uuid.UUID) error {
	// Validar que el ID no sea nulo
	if questionID == uuid.Nil {
		return exceptions.NewValidationError("question_id", "el ID de la pregunta no puede ser nulo")
	}

	// Verificar que la pregunta no esté ya en el cuestionario
	for _, id := range q.QuestionIDs {
		if id == questionID {
			return exceptions.NewQuestionAlreadyInQuestionnaireError(questionID.String(), q.ID.String())
		}
	}

	// Limitar número de preguntas
	if len(q.QuestionIDs) >= 50 {
		return exceptions.NewValidationError("questions", "un cuestionario no puede tener más de 50 preguntas")
	}

	q.QuestionIDs = append(q.QuestionIDs, questionID)
	q.UpdatedAt = time.Now()
	return nil
}

// RemoveQuestion remueve una pregunta del cuestionario
func (q *Questionnaire) RemoveQuestion(questionID uuid.UUID) error {
	// Buscar la pregunta
	for i, id := range q.QuestionIDs {
		if id == questionID {
			// Remover la pregunta
			q.QuestionIDs = append(q.QuestionIDs[:i], q.QuestionIDs[i+1:]...)
			q.UpdatedAt = time.Now()
			return nil
		}
	}

	return exceptions.NewQuestionNotInQuestionnaireError(questionID.String(), q.ID.String())
}

// ReorderQuestions reordena las preguntas del cuestionario
func (q *Questionnaire) ReorderQuestions(questionIDs []uuid.UUID) error {
	// Validar que la cantidad sea la misma
	if len(questionIDs) != len(q.QuestionIDs) {
		return exceptions.NewValidationError("questions", "la cantidad de preguntas no coincide")
	}

	// Validar que todas las preguntas existan en el cuestionario
	existingIDs := make(map[uuid.UUID]bool)
	for _, id := range q.QuestionIDs {
		existingIDs[id] = true
	}

	for _, id := range questionIDs {
		if !existingIDs[id] {
			return exceptions.NewQuestionNotInQuestionnaireError(id.String(), q.ID.String())
		}
	}

	q.QuestionIDs = questionIDs
	q.UpdatedAt = time.Now()
	return nil
}

// HasQuestion verifica si el cuestionario tiene una pregunta específica
func (q *Questionnaire) HasQuestion(questionID uuid.UUID) bool {
	for _, id := range q.QuestionIDs {
		if id == questionID {
			return true
		}
	}
	return false
}

// GetQuestionCount retorna el número de preguntas en el cuestionario
func (q *Questionnaire) GetQuestionCount() int {
	return len(q.QuestionIDs)
}

// IsEmpty verifica si el cuestionario está vacío
func (q *Questionnaire) IsEmpty() bool {
	return len(q.QuestionIDs) == 0
}

// Activate activa el cuestionario
func (q *Questionnaire) Activate() {
	q.IsActive = true
	q.UpdatedAt = time.Now()
}

// Deactivate desactiva el cuestionario
func (q *Questionnaire) Deactivate() {
	q.IsActive = false
	q.UpdatedAt = time.Now()
}

// CanBeModified verifica si el cuestionario puede ser modificado
func (q *Questionnaire) CanBeModified() bool {
	// Por ahora, permitir modificación de cuestionarios activos
	// En el futuro podríamos verificar si está siendo usado en evaluaciones activas
	return true
}

// ValidateForUse valida si el cuestionario puede ser usado para evaluaciones
func (q *Questionnaire) ValidateForUse() error {
	if !q.IsActive {
		return exceptions.NewValidationError("questionnaire", "el cuestionario debe estar activo")
	}

	if q.IsEmpty() {
		return exceptions.NewValidationError("questionnaire", "el cuestionario debe tener al menos una pregunta")
	}

	return nil
}

// Funciones de validación
func validateQuestionnaireData(name, description string) error {
	// Validar nombre
	if strings.TrimSpace(name) == "" {
		return exceptions.NewRequiredFieldError("name")
	}
	if len(name) > 200 {
		return exceptions.NewValidationError("name", "el nombre no puede exceder 200 caracteres")
	}

	// Validar descripción
	if len(description) > 1000 {
		return exceptions.NewValidationError("description", "la descripción no puede exceder 1000 caracteres")
	}

	return nil
}
