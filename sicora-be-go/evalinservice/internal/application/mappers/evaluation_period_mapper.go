package mappers

import (
	"evalinservice/internal/application/dtos"
	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/valueobjects"
	"evalinservice/internal/infrastructure/database/models"
)

// EvaluationPeriodMapper maneja la conversión entre entidades EvaluationPeriod y DTOs
type EvaluationPeriodMapper struct{}

// NewEvaluationPeriodMapper crea una nueva instancia de EvaluationPeriodMapper
func NewEvaluationPeriodMapper() *EvaluationPeriodMapper {
	return &EvaluationPeriodMapper{}
}

// ToDTO convierte una entidad EvaluationPeriod a EvaluationPeriodResponseDTO
func (m *EvaluationPeriodMapper) ToDTO(period *entities.EvaluationPeriod) *dtos.EvaluationPeriodResponseDTO {
	if period == nil {
		return nil
	}

	return &dtos.EvaluationPeriodResponseDTO{
		ID:                period.ID,
		Name:              period.Name,
		Description:       period.Description,
		StartDate:         period.StartDate,
		EndDate:           period.EndDate,
		Status:            period.Status,
		QuestionnaireID:   period.QuestionnaireID,
		FichaID:           period.FichaID,
		IsActive:          period.IsActive,
		IsCurrentlyActive: period.IsCurrentlyActive(),
		DaysRemaining:     period.DaysRemaining(),
		Duration:          period.DurationDays(),
		HasStarted:        period.HasStarted(),
		HasEnded:          period.HasEnded(),
		CreatedAt:         period.CreatedAt,
		UpdatedAt:         period.UpdatedAt,
	}
}

// ToModel convierte una entidad EvaluationPeriod a modelo
func (m *EvaluationPeriodMapper) ToModel(period *entities.EvaluationPeriod) *models.EvaluationPeriod {
	if period == nil {
		return nil
	}

	return &models.EvaluationPeriod{
		ID:              period.ID,
		Name:            period.Name,
		Description:     period.Description,
		StartDate:       period.StartDate,
		EndDate:         period.EndDate,
		Status:          string(period.Status),
		QuestionnaireID: period.QuestionnaireID,
		FichaID:         period.FichaID,
		IsActive:        period.IsActive,
		CreatedAt:       period.CreatedAt,
		UpdatedAt:       period.UpdatedAt,
	}
}

// FromModel convierte un modelo a entidad
func (m *EvaluationPeriodMapper) FromModel(model *models.EvaluationPeriod) *entities.EvaluationPeriod {
	if model == nil {
		return nil
	}

	return &entities.EvaluationPeriod{
		ID:              model.ID,
		Name:            model.Name,
		Description:     model.Description,
		StartDate:       model.StartDate,
		EndDate:         model.EndDate,
		Status:          valueobjects.PeriodStatus(model.Status),
		QuestionnaireID: model.QuestionnaireID,
		FichaID:         model.FichaID,
		IsActive:        model.IsActive,
		CreatedAt:       model.CreatedAt,
		UpdatedAt:       model.UpdatedAt,
	}
}
