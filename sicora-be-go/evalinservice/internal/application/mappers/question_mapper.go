package mappers

import (
	"encoding/json"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/valueobjects"
	"evalinservice/internal/infrastructure/database/models"
)

// QuestionMapper maneja la conversión entre entidades Question y DTOs
type QuestionMapper struct{}

// NewQuestionMapper crea una nueva instancia de QuestionMapper
func NewQuestionMapper() *QuestionMapper {
	return &QuestionMapper{}
}

// ToDTO convierte una entidad Question a QuestionResponseDTO
func (m *QuestionMapper) ToDTO(question *entities.Question) *dtos.QuestionResponseDTO {
	if question == nil {
		return nil
	}

	return &dtos.QuestionResponseDTO{
		ID:          question.ID,
		Text:        question.Text,
		Description: question.Description,
		Type:        question.Type,
		Category:    question.Category,
		Options:     question.Options,
		IsRequired:  question.IsRequired,
		IsActive:    question.IsActive,
		Order:       question.Order,
		CreatedAt:   question.CreatedAt,
		UpdatedAt:   question.UpdatedAt,
	}
}

// ToDTOList convierte una lista de entidades Question a QuestionResponseDTO
func (m *QuestionMapper) ToDTOList(questions []*entities.Question) []dtos.QuestionResponseDTO {
	if questions == nil {
		return []dtos.QuestionResponseDTO{}
	}

	result := make([]dtos.QuestionResponseDTO, len(questions))
	for i, question := range questions {
		if dto := m.ToDTO(question); dto != nil {
			result[i] = *dto
		}
	}
	return result
}

// ToEntity convierte un QuestionCreateDTO a entidad Question
func (m *QuestionMapper) ToEntity(dto *dtos.QuestionCreateDTO) *entities.Question {
	if dto == nil {
		return nil
	}

	// Nota: Asumiendo que entities.NewQuestion existe con esta firma
	// Si la firma es diferente, necesitará ser ajustada
	return &entities.Question{
		Text:        dto.Text,
		Description: dto.Description,
		Type:        dto.Type,
		Category:    dto.Category,
		Options:     dto.Options,
		IsRequired:  dto.IsRequired,
		IsActive:    true, // Por defecto activa
		Order:       0,    // Se asignará después
	}
}

// ToModel convierte una entidad Question a modelo de base de datos
func (m *QuestionMapper) ToModel(question *entities.Question) *models.Question {
	if question == nil {
		return nil
	}

	// Convertir options de []string a JSON string
	optionsJSON, _ := json.Marshal(question.Options)

	return &models.Question{
		ID:          question.ID,
		Text:        question.Text,
		Description: question.Description,
		Type:        string(question.Type),
		Category:    question.Category,
		Options:     string(optionsJSON),
		IsRequired:  question.IsRequired,
		IsActive:    question.IsActive,
		CreatedAt:   question.CreatedAt,
		UpdatedAt:   question.UpdatedAt,
	}
}

// FromModel convierte un modelo de base de datos a entidad Question
func (m *QuestionMapper) FromModel(model *models.Question) *entities.Question {
	if model == nil {
		return nil
	}

	// Convertir options de JSON string a []string
	var options []string
	if model.Options != "" {
		json.Unmarshal([]byte(model.Options), &options)
	}

	return &entities.Question{
		ID:          model.ID,
		Text:        model.Text,
		Description: model.Description,
		Type:        valueobjects.QuestionType(model.Type),
		Category:    model.Category,
		Options:     options,
		IsRequired:  model.IsRequired,
		IsActive:    model.IsActive,
		Order:       0, // El modelo no tiene Order, lo inicializamos en 0
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}

// FromModelList convierte una lista de modelos a entidades
func (m *QuestionMapper) FromModelList(models []*models.Question) []*entities.Question {
	if models == nil {
		return []*entities.Question{}
	}

	result := make([]*entities.Question, len(models))
	for i, model := range models {
		result[i] = m.FromModel(model)
	}
	return result
}
