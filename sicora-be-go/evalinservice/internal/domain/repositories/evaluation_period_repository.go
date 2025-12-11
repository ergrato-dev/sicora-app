package repositories

import (
	"context"
	"time"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

// EvaluationPeriodRepository define las operaciones para la gestión de períodos de evaluación
type EvaluationPeriodRepository interface {
	// Create crea un nuevo período de evaluación
	Create(ctx context.Context, period *entities.EvaluationPeriod) error

	// GetByID obtiene un período por su ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.EvaluationPeriod, error)

	// GetAll obtiene todos los períodos con filtros opcionales
	GetAll(ctx context.Context, filters PeriodFilters) ([]*entities.EvaluationPeriod, error)

	// Update actualiza un período existente
	Update(ctx context.Context, period *entities.EvaluationPeriod) error

	// Delete elimina un período (soft delete)
	Delete(ctx context.Context, id uuid.UUID) error

	// GetActivePeriods obtiene los períodos activos
	GetActivePeriods(ctx context.Context) ([]*entities.EvaluationPeriod, error)

	// GetCurrentPeriods obtiene los períodos que están activos en este momento
	GetCurrentPeriods(ctx context.Context) ([]*entities.EvaluationPeriod, error)

	// GetOverlappingPeriods obtiene períodos que se superponen con las fechas dadas
	GetOverlappingPeriods(ctx context.Context, startDate, endDate time.Time, excludeID *uuid.UUID) ([]*entities.EvaluationPeriod, error)

	// GetPeriodsByQuestionnaire obtiene períodos que usan un cuestionario específico
	GetPeriodsByQuestionnaire(ctx context.Context, questionnaireID uuid.UUID) ([]*entities.EvaluationPeriod, error)

	// GetPeriodsByStatus obtiene períodos por estado
	GetPeriodsByStatus(ctx context.Context, status valueobjects.PeriodStatus) ([]*entities.EvaluationPeriod, error)

	// GetUpcomingPeriods obtiene períodos que están próximos a comenzar
	GetUpcomingPeriods(ctx context.Context, days int) ([]*entities.EvaluationPeriod, error)

	// GetExpiringPeriods obtiene períodos que están próximos a terminar
	GetExpiringPeriods(ctx context.Context, days int) ([]*entities.EvaluationPeriod, error)

	// HasActivePeriodsForQuestionnaire verifica si hay períodos activos usando un cuestionario
	HasActivePeriodsForQuestionnaire(ctx context.Context, questionnaireID uuid.UUID) (bool, error)

	// GetByStatus obtiene períodos por estado (alias para GetPeriodsByStatus)
	GetByStatus(ctx context.Context, status valueobjects.PeriodStatus) ([]*entities.EvaluationPeriod, error)

	// GetByFichaID obtiene períodos por ficha ID
	GetByFichaID(ctx context.Context, fichaID uuid.UUID) ([]*entities.EvaluationPeriod, error)
}

// PeriodFilters define los filtros para búsqueda de períodos
type PeriodFilters struct {
	Status          valueobjects.PeriodStatus `json:"status"`
	IsActive        *bool                     `json:"is_active"`
	QuestionnaireID *uuid.UUID                `json:"questionnaire_id"`
	FichaID         *uuid.UUID                `json:"ficha_id"`
	StartDateFrom   *time.Time                `json:"start_date_from"`
	StartDateTo     *time.Time                `json:"start_date_to"`
	EndDateFrom     *time.Time                `json:"end_date_from"`
	EndDateTo       *time.Time                `json:"end_date_to"`
	Search          string                    `json:"search"` // Búsqueda en nombre y descripción
	Limit           int                       `json:"limit"`
	Offset          int                       `json:"offset"`
	OrderBy         string                    `json:"order_by"`  // "created_at", "start_date", "end_date", "name"
	OrderDir        string                    `json:"order_dir"` // "asc", "desc"
}
