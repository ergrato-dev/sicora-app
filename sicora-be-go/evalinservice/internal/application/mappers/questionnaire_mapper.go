package mappers

import (
	"evalinservice/internal/application/dtos"
	"evalinservice/internal/domain/entities"
	"evalinservice/internal/infrastructure/database/models"
)

// QuestionnaireMapper maneja la conversión entre entidades Questionnaire y DTOs
type QuestionnaireMapper struct{}

// NewQuestionnaireMapper crea una nueva instancia de QuestionnaireMapper
func NewQuestionnaireMapper() *QuestionnaireMapper {
	return &QuestionnaireMapper{}
}

// ToDTO convierte una entidad Questionnaire a QuestionnaireResponseDTO
func (m *QuestionnaireMapper) ToDTO(questionnaire *entities.Questionnaire) *dtos.QuestionnaireResponseDTO {
	if questionnaire == nil {
		return nil
	}

	return &dtos.QuestionnaireResponseDTO{
		ID:            questionnaire.ID,
		Name:          questionnaire.Name,
		Description:   questionnaire.Description,
		IsActive:      questionnaire.IsActive,
		QuestionCount: 0, // Se calculará por separado
		CreatedAt:     questionnaire.CreatedAt,
		UpdatedAt:     questionnaire.UpdatedAt,
	}
}

// ToModel convierte una entidad Questionnaire a modelo de base de datos
func (m *QuestionnaireMapper) ToModel(questionnaire *entities.Questionnaire) *models.Questionnaire {
	if questionnaire == nil {
		return nil
	}

	return &models.Questionnaire{
		ID:          questionnaire.ID,
		Name:        questionnaire.Name,
		Description: questionnaire.Description,
		IsActive:    questionnaire.IsActive,
		CreatedAt:   questionnaire.CreatedAt,
		UpdatedAt:   questionnaire.UpdatedAt,
	}
}

// FromModel convierte un modelo de base de datos a entidad Questionnaire
func (m *QuestionnaireMapper) FromModel(model *models.Questionnaire) *entities.Questionnaire {
	if model == nil {
		return nil
	}

	return &entities.Questionnaire{
		ID:          model.ID,
		Name:        model.Name,
		Description: model.Description,
		IsActive:    model.IsActive,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}

// ToEntity es un alias para FromModel (para compatibilidad con repositories)
func (m *QuestionnaireMapper) ToEntity(model *models.Questionnaire) *entities.Questionnaire {
	return m.FromModel(model)
}
