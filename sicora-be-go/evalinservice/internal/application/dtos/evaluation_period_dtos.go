package dtos

import (
	"time"

	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

// EvaluationPeriodCreateDTO representa los datos para crear un período de evaluación
type EvaluationPeriodCreateDTO struct {
	Name            string    `json:"name" validate:"required,min=3,max=200"`
	Description     string    `json:"description" validate:"max=1000"`
	StartDate       time.Time `json:"start_date" validate:"required"`
	EndDate         time.Time `json:"end_date" validate:"required"`
	QuestionnaireID uuid.UUID `json:"questionnaire_id" validate:"required"`
	FichaID         uuid.UUID `json:"ficha_id" validate:"required"`
}

// EvaluationPeriodUpdateDTO representa los datos para actualizar un período
type EvaluationPeriodUpdateDTO struct {
	Name            *string    `json:"name" validate:"omitempty,min=3,max=200"`
	Description     *string    `json:"description" validate:"omitempty,max=1000"`
	StartDate       *time.Time `json:"start_date"`
	EndDate         *time.Time `json:"end_date"`
	QuestionnaireID *uuid.UUID `json:"questionnaire_id"`
	FichaID         *uuid.UUID `json:"ficha_id"`
}

// EvaluationPeriodResponseDTO representa un período en las respuestas
type EvaluationPeriodResponseDTO struct {
	ID                uuid.UUID                 `json:"id"`
	Name              string                    `json:"name"`
	Description       string                    `json:"description"`
	StartDate         time.Time                 `json:"start_date"`
	EndDate           time.Time                 `json:"end_date"`
	Status            valueobjects.PeriodStatus `json:"status"`
	QuestionnaireID   uuid.UUID                 `json:"questionnaire_id"`
	QuestionnaireName string                    `json:"questionnaire_name,omitempty"`
	FichaID           uuid.UUID                 `json:"ficha_id"`
	FichaNumber       string                    `json:"ficha_number,omitempty"`
	IsActive          bool                      `json:"is_active"`
	IsCurrentlyActive bool                      `json:"is_currently_active"`
	DaysRemaining     int                       `json:"days_remaining"`
	Duration          int                       `json:"duration_days"`
	HasStarted        bool                      `json:"has_started"`
	HasEnded          bool                      `json:"has_ended"`
	CreatedAt         time.Time                 `json:"created_at"`
	UpdatedAt         time.Time                 `json:"updated_at"`
}

// EvaluationPeriodListResponseDTO representa una lista paginada de períodos
type EvaluationPeriodListResponseDTO struct {
	Periods    []EvaluationPeriodResponseDTO `json:"periods"`
	Total      int                           `json:"total"`
	Page       int                           `json:"page"`
	PerPage    int                           `json:"per_page"`
	TotalPages int                           `json:"total_pages"`
}

// EvaluationPeriodFiltersDTO representa los filtros para búsqueda de períodos
type EvaluationPeriodFiltersDTO struct {
	Status          valueobjects.PeriodStatus `json:"status"`
	IsActive        *bool                     `json:"is_active"`
	QuestionnaireID *uuid.UUID                `json:"questionnaire_id"`
	StartDateFrom   *time.Time                `json:"start_date_from"`
	StartDateTo     *time.Time                `json:"start_date_to"`
	EndDateFrom     *time.Time                `json:"end_date_from"`
	EndDateTo       *time.Time                `json:"end_date_to"`
	Search          string                    `json:"search"`
	Page            int                       `json:"page" validate:"min=1"`
	PerPage         int                       `json:"per_page" validate:"min=1,max=100"`
	OrderBy         string                    `json:"order_by" validate:"omitempty,oneof=created_at start_date end_date name"`
	OrderDir        string                    `json:"order_dir" validate:"omitempty,oneof=asc desc"`
}

// ActivatePeriodDTO representa los datos para activar un período
type ActivatePeriodDTO struct {
	ForceActivation bool `json:"force_activation"` // Para forzar activación incluso si hay conflictos
}

// PeriodStatsResponseDTO representa estadísticas de un período
type PeriodStatsResponseDTO struct {
	PeriodID             uuid.UUID `json:"period_id"`
	TotalInstructors     int       `json:"total_instructors"`
	TotalStudents        int       `json:"total_students"`
	TotalEvaluations     int       `json:"total_evaluations"`
	SubmittedEvaluations int       `json:"submitted_evaluations"`
	DraftEvaluations     int       `json:"draft_evaluations"`
	ParticipationRate    float64   `json:"participation_rate"`
	AverageResponseTime  float64   `json:"average_response_time_hours"`
	CompletionRate       float64   `json:"completion_rate"`
}
