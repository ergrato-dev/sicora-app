package entities

import (
	"strings"
	"time"

	"evalinservice/internal/domain/exceptions"
	"evalinservice/internal/domain/valueobjects"

	"github.com/google/uuid"
)

// EvaluationPeriod representa un período durante el cual se pueden realizar evaluaciones
type EvaluationPeriod struct {
	ID              uuid.UUID                 `json:"id"`
	Name            string                    `json:"name"`
	Description     string                    `json:"description"`
	StartDate       time.Time                 `json:"start_date"`
	EndDate         time.Time                 `json:"end_date"`
	Status          valueobjects.PeriodStatus `json:"status"`
	QuestionnaireID uuid.UUID                 `json:"questionnaire_id"`
	FichaID         uuid.UUID                 `json:"ficha_id"`
	IsActive        bool                      `json:"is_active"`
	CreatedAt       time.Time                 `json:"created_at"`
	UpdatedAt       time.Time                 `json:"updated_at"`
}

// NewEvaluationPeriod crea un nuevo período de evaluación
func NewEvaluationPeriod(name, description string, startDate, endDate time.Time, questionnaireID, fichaID uuid.UUID) (*EvaluationPeriod, error) {
	if err := validatePeriodData(name, description, startDate, endDate, questionnaireID, fichaID); err != nil {
		return nil, err
	}

	now := time.Now()
	return &EvaluationPeriod{
		ID:              uuid.New(),
		Name:            strings.TrimSpace(name),
		Description:     strings.TrimSpace(description),
		StartDate:       startDate,
		EndDate:         endDate,
		Status:          valueobjects.PeriodStatusBorrador,
		QuestionnaireID: questionnaireID,
		FichaID:         fichaID,
		IsActive:        false, // Se activa cuando el estado pasa a ACTIVE
		CreatedAt:       now,
		UpdatedAt:       now,
	}, nil
}

// UpdateName actualiza el nombre del período
func (p *EvaluationPeriod) UpdateName(newName string) error {
	if !p.Status.CanBeModified() {
		return exceptions.NewPeriodCannotBeModifiedError(p.ID.String(), string(p.Status))
	}

	if strings.TrimSpace(newName) == "" {
		return exceptions.NewRequiredFieldError("name")
	}

	if len(newName) > 200 {
		return exceptions.NewValidationError("name", "el nombre no puede exceder 200 caracteres")
	}

	p.Name = strings.TrimSpace(newName)
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateDescription actualiza la descripción del período
func (p *EvaluationPeriod) UpdateDescription(newDescription string) error {
	if !p.Status.CanBeModified() {
		return exceptions.NewPeriodCannotBeModifiedError(p.ID.String(), string(p.Status))
	}

	if len(newDescription) > 1000 {
		return exceptions.NewValidationError("description", "la descripción no puede exceder 1000 caracteres")
	}

	p.Description = strings.TrimSpace(newDescription)
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateStartDate actualiza la fecha de inicio del período
func (p *EvaluationPeriod) UpdateStartDate(startDate time.Time) error {
	if !p.Status.CanBeModified() {
		return exceptions.NewPeriodCannotBeModifiedError(p.ID.String(), string(p.Status))
	}

	if startDate.After(p.EndDate) || startDate.Equal(p.EndDate) {
		return exceptions.NewInvalidPeriodDatesError()
	}

	p.StartDate = startDate
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateEndDate actualiza la fecha de fin del período
func (p *EvaluationPeriod) UpdateEndDate(endDate time.Time) error {
	if !p.Status.CanBeModified() {
		return exceptions.NewPeriodCannotBeModifiedError(p.ID.String(), string(p.Status))
	}

	if endDate.Before(p.StartDate) || endDate.Equal(p.StartDate) {
		return exceptions.NewInvalidPeriodDatesError()
	}

	p.EndDate = endDate
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateDates actualiza las fechas del período
func (p *EvaluationPeriod) UpdateDates(startDate, endDate time.Time) error {
	if !p.Status.CanBeModified() {
		return exceptions.NewPeriodCannotBeModifiedError(p.ID.String(), string(p.Status))
	}

	if endDate.Before(startDate) || endDate.Equal(startDate) {
		return exceptions.NewInvalidPeriodDatesError()
	}

	p.StartDate = startDate
	p.EndDate = endDate
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateQuestionnaire actualiza el cuestionario asociado
func (p *EvaluationPeriod) UpdateQuestionnaire(questionnaireID uuid.UUID) error {
	if !p.Status.CanBeModified() {
		return exceptions.NewPeriodCannotBeModifiedError(p.ID.String(), string(p.Status))
	}

	if questionnaireID == uuid.Nil {
		return exceptions.NewRequiredFieldError("questionnaire_id")
	}

	p.QuestionnaireID = questionnaireID
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateFicha actualiza el ficha asociado
func (p *EvaluationPeriod) UpdateFicha(fichaID uuid.UUID) error {
	if !p.Status.CanBeModified() {
		return exceptions.NewPeriodCannotBeModifiedError(p.ID.String(), string(p.Status))
	}

	if fichaID == uuid.Nil {
		return exceptions.NewRequiredFieldError("ficha_id")
	}

	p.FichaID = fichaID
	p.UpdatedAt = time.Now()
	return nil
}

// Activate activa el período (cambia estado a ACTIVE)
func (p *EvaluationPeriod) Activate() error {
	if !p.Status.CanBeActivated() {
		return exceptions.NewValidationError("status", "el período no puede ser activado desde su estado actual")
	}

	p.Status = valueobjects.PeriodStatusActivo
	p.IsActive = true
	p.UpdatedAt = time.Now()
	return nil
}

// Close cierra el período (cambia estado a CLOSED)
func (p *EvaluationPeriod) Close() error {
	if !p.Status.CanBeClosed() {
		return exceptions.NewValidationError("status", "el período no puede ser cerrado desde su estado actual")
	}

	p.Status = valueobjects.PeriodStatusCerrado
	p.IsActive = false
	p.UpdatedAt = time.Now()
	return nil
}

// IsCurrentlyActive verifica si el período está actualmente activo (ACTIVE y en fechas)
func (p *EvaluationPeriod) IsCurrentlyActive() bool {
	if !p.Status.CanAcceptEvaluations() || !p.IsActive {
		return false
	}

	now := time.Now()
	return now.After(p.StartDate) && now.Before(p.EndDate)
}

// HasStarted verifica si el período ha comenzado
func (p *EvaluationPeriod) HasStarted() bool {
	return time.Now().After(p.StartDate)
}

// HasEnded verifica si el período ha terminado
func (p *EvaluationPeriod) HasEnded() bool {
	return time.Now().After(p.EndDate)
}

// DaysRemaining calcula los días restantes del período
func (p *EvaluationPeriod) DaysRemaining() int {
	now := time.Now()
	if now.After(p.EndDate) {
		return 0
	}
	return int(p.EndDate.Sub(now).Hours() / 24)
}

// DurationDays calcula la duración total del período en días
func (p *EvaluationPeriod) DurationDays() int {
	return int(p.EndDate.Sub(p.StartDate).Hours() / 24)
}

// Funciones de validación
func validatePeriodData(name, description string, startDate, endDate time.Time, questionnaireID, fichaID uuid.UUID) error {
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

	// Validar fechas
	if endDate.Before(startDate) || endDate.Equal(startDate) {
		return exceptions.NewInvalidPeriodDatesError()
	}

	// Validar que la fecha de fin no esté muy en el pasado
	now := time.Now()
	if endDate.Before(now.AddDate(0, 0, -1)) { // No más de un día en el pasado
		return exceptions.NewValidationError("end_date", "la fecha de fin no puede estar en el pasado")
	}

	// Validar duración mínima (al menos 1 día)
	duration := endDate.Sub(startDate)
	if duration.Hours() < 24 {
		return exceptions.NewValidationError("dates", "el período debe durar al menos 1 día")
	}

	// Validar duración máxima (no más de 1 año)
	if duration.Hours() > 24*365 {
		return exceptions.NewValidationError("dates", "el período no puede durar más de 1 año")
	}

	// Validar cuestionario
	if questionnaireID == uuid.Nil {
		return exceptions.NewRequiredFieldError("questionnaire_id")
	}

	return nil
}
