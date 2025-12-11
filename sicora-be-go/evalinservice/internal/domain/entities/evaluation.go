package entities

import (
	"encoding/json"
	"strings"
	"time"

	"evalinservice/internal/domain/exceptions"
	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

// EvaluationResponse representa una respuesta individual a una pregunta
type EvaluationResponse struct {
	QuestionID    uuid.UUID `json:"question_id"`
	ResponseValue string    `json:"response_value"`
	Comment       string    `json:"comment"`
}

// NewEvaluationResponse crea una nueva respuesta de evaluación
func NewEvaluationResponse(questionID uuid.UUID, responseValue, comment string) (*EvaluationResponse, error) {
	if questionID == uuid.Nil {
		return nil, exceptions.NewRequiredFieldError("question_id")
	}

	if strings.TrimSpace(responseValue) == "" {
		return nil, exceptions.NewRequiredFieldError("response_value")
	}

	if len(comment) > 500 {
		return nil, exceptions.NewValidationError("comment", "el comentario no puede exceder 500 caracteres")
	}

	return &EvaluationResponse{
		QuestionID:    questionID,
		ResponseValue: strings.TrimSpace(responseValue),
		Comment:       strings.TrimSpace(comment),
	}, nil
}

// Evaluation representa una evaluación completa de un instructor por un estudiante
type Evaluation struct {
	ID              uuid.UUID                     `json:"id"`
	StudentID       uuid.UUID                     `json:"student_id"`
	InstructorID    uuid.UUID                     `json:"instructor_id"`
	PeriodID        uuid.UUID                     `json:"period_id"`
	QuestionnaireID uuid.UUID                     `json:"questionnaire_id"`
	Responses       []EvaluationResponse          `json:"responses"`
	GeneralComment  string                        `json:"general_comment"`
	Status          valueobjects.EvaluationStatus `json:"status"`
	SubmittedAt     *time.Time                    `json:"submitted_at"`
	CreatedAt       time.Time                     `json:"created_at"`
	UpdatedAt       time.Time                     `json:"updated_at"`
}

// NewEvaluation crea una nueva evaluación
func NewEvaluation(studentID, instructorID, periodID, questionnaireID uuid.UUID) (*Evaluation, error) {
	if err := validateEvaluationIDs(studentID, instructorID, periodID, questionnaireID); err != nil {
		return nil, err
	}

	if studentID == instructorID {
		return nil, exceptions.NewValidationError("instructor_id", "un instructor no puede evaluarse a sí mismo")
	}

	now := time.Now()
	return &Evaluation{
		ID:              uuid.New(),
		StudentID:       studentID,
		InstructorID:    instructorID,
		PeriodID:        periodID,
		QuestionnaireID: questionnaireID,
		Responses:       make([]EvaluationResponse, 0),
		GeneralComment:  "",
		Status:          valueobjects.EvaluationStatusDraft,
		SubmittedAt:     nil,
		CreatedAt:       now,
		UpdatedAt:       now,
	}, nil
}

// AddResponse agrega una respuesta a la evaluación
func (e *Evaluation) AddResponse(questionID uuid.UUID, responseValue, comment string) error {
	if !e.Status.CanBeModified() {
		return exceptions.NewEvaluationCannotBeModifiedError(e.ID.String(), string(e.Status))
	}

	response, err := NewEvaluationResponse(questionID, responseValue, comment)
	if err != nil {
		return err
	}

	// Verificar si ya existe una respuesta para esta pregunta
	for i, existing := range e.Responses {
		if existing.QuestionID == questionID {
			// Actualizar respuesta existente
			e.Responses[i] = *response
			e.UpdatedAt = time.Now()
			return nil
		}
	}

	// Agregar nueva respuesta
	e.Responses = append(e.Responses, *response)
	e.UpdatedAt = time.Now()
	return nil
}

// RemoveResponse remueve una respuesta de la evaluación
func (e *Evaluation) RemoveResponse(questionID uuid.UUID) error {
	if !e.Status.CanBeModified() {
		return exceptions.NewEvaluationCannotBeModifiedError(e.ID.String(), string(e.Status))
	}

	for i, response := range e.Responses {
		if response.QuestionID == questionID {
			e.Responses = append(e.Responses[:i], e.Responses[i+1:]...)
			e.UpdatedAt = time.Now()
			return nil
		}
	}

	return exceptions.NewValidationError("question_id", "respuesta no encontrada")
}

// UpdateGeneralComment actualiza el comentario general
func (e *Evaluation) UpdateGeneralComment(comment string) error {
	if !e.Status.CanBeModified() {
		return exceptions.NewEvaluationCannotBeModifiedError(e.ID.String(), string(e.Status))
	}

	if len(comment) > 1000 {
		return exceptions.NewValidationError("general_comment", "el comentario general no puede exceder 1000 caracteres")
	}

	e.GeneralComment = strings.TrimSpace(comment)
	e.UpdatedAt = time.Now()
	return nil
}

// Submit envía la evaluación (cambia estado a SUBMITTED)
func (e *Evaluation) Submit() error {
	if !e.Status.CanBeSubmitted() {
		return exceptions.NewEvaluationAlreadySubmittedError(e.ID.String())
	}

	// Validar que la evaluación esté completa se hace en el caso de uso
	// usando las preguntas del cuestionario

	e.Status = valueobjects.EvaluationStatusSubmitted
	now := time.Now()
	e.SubmittedAt = &now
	e.UpdatedAt = now
	return nil
}

// Validate valida la evaluación (cambia estado a VALIDATED)
func (e *Evaluation) Validate() error {
	if !e.Status.CanBeValidated() {
		return exceptions.NewValidationError("status", "la evaluación no puede ser validada desde su estado actual")
	}

	e.Status = valueobjects.EvaluationStatusValidated
	e.UpdatedAt = time.Now()
	return nil
}

// GetResponse obtiene la respuesta para una pregunta específica
func (e *Evaluation) GetResponse(questionID uuid.UUID) (*EvaluationResponse, bool) {
	for _, response := range e.Responses {
		if response.QuestionID == questionID {
			return &response, true
		}
	}
	return nil, false
}

// HasResponse verifica si existe una respuesta para una pregunta
func (e *Evaluation) HasResponse(questionID uuid.UUID) bool {
	_, exists := e.GetResponse(questionID)
	return exists
}

// GetResponseCount retorna el número de respuestas
func (e *Evaluation) GetResponseCount() int {
	return len(e.Responses)
}

// IsComplete verifica si la evaluación está completa (se usa con las preguntas del cuestionario)
func (e *Evaluation) IsComplete(requiredQuestionIDs []uuid.UUID) bool {
	// Crear un mapa de respuestas para búsqueda rápida
	responseMap := make(map[uuid.UUID]bool)
	for _, response := range e.Responses {
		if strings.TrimSpace(response.ResponseValue) != "" {
			responseMap[response.QuestionID] = true
		}
	}

	// Verificar que todas las preguntas requeridas tengan respuesta
	for _, questionID := range requiredQuestionIDs {
		if !responseMap[questionID] {
			return false
		}
	}

	return true
}

// ValidateResponses valida las respuestas contra las preguntas
func (e *Evaluation) ValidateResponses(questions []Question) error {
	questionMap := make(map[uuid.UUID]*Question)
	for i, question := range questions {
		questionMap[question.ID] = &questions[i]
	}

	for _, response := range e.Responses {
		question, exists := questionMap[response.QuestionID]
		if !exists {
			return exceptions.NewValidationError("responses", "respuesta para pregunta inexistente")
		}

		if err := question.ValidateResponse(response.ResponseValue); err != nil {
			return err
		}
	}

	return nil
}

// GetSubmissionDate retorna la fecha de envío si fue enviada
func (e *Evaluation) GetSubmissionDate() *time.Time {
	return e.SubmittedAt
}

// GetDaysSinceSubmission calcula los días transcurridos desde el envío
func (e *Evaluation) GetDaysSinceSubmission() int {
	if e.SubmittedAt == nil {
		return 0
	}

	duration := time.Since(*e.SubmittedAt)
	return int(duration.Hours() / 24)
}

// ToJSON convierte la evaluación a JSON
func (e *Evaluation) ToJSON() ([]byte, error) {
	return json.Marshal(e)
}

// FromJSON crea una evaluación desde JSON
func FromJSON(data []byte) (*Evaluation, error) {
	var evaluation Evaluation
	if err := json.Unmarshal(data, &evaluation); err != nil {
		return nil, exceptions.NewValidationError("json", "formato JSON inválido")
	}
	return &evaluation, nil
}

// GetResponseSummary retorna un resumen de las respuestas
func (e *Evaluation) GetResponseSummary() map[string]interface{} {
	summary := map[string]interface{}{
		"total_responses":     len(e.Responses),
		"has_general_comment": e.GeneralComment != "",
		"status":              string(e.Status),
		"submitted_at":        e.SubmittedAt,
	}

	if e.SubmittedAt != nil {
		summary["days_since_submission"] = e.GetDaysSinceSubmission()
	}

	return summary
}

// CleanEmptyResponses remueve respuestas vacías
func (e *Evaluation) CleanEmptyResponses() {
	if !e.Status.CanBeModified() {
		return
	}

	validResponses := make([]EvaluationResponse, 0)
	for _, response := range e.Responses {
		if strings.TrimSpace(response.ResponseValue) != "" {
			validResponses = append(validResponses, response)
		}
	}

	if len(validResponses) != len(e.Responses) {
		e.Responses = validResponses
		e.UpdatedAt = time.Now()
	}
}

// Funciones de validación
func validateEvaluationIDs(studentID, instructorID, periodID, questionnaireID uuid.UUID) error {
	if studentID == uuid.Nil {
		return exceptions.NewRequiredFieldError("student_id")
	}

	if instructorID == uuid.Nil {
		return exceptions.NewRequiredFieldError("instructor_id")
	}

	if periodID == uuid.Nil {
		return exceptions.NewRequiredFieldError("period_id")
	}

	if questionnaireID == uuid.Nil {
		return exceptions.NewRequiredFieldError("questionnaire_id")
	}

	return nil
}
