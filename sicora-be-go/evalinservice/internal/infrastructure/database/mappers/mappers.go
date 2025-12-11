package mappers

import (
	"encoding/json"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/valueobjects"
	"evalinservice/internal/infrastructure/database/models"
)

// QuestionMapper convierte entre entidades Question y modelos GORM
type QuestionMapper struct{}

func NewQuestionMapper() *QuestionMapper {
	return &QuestionMapper{}
}

func (m *QuestionMapper) ToModel(entity *entities.Question) *models.Question {
	optionsJSON, _ := json.Marshal(entity.Options)

	return &models.Question{
		ID:          entity.ID,
		Text:        entity.Text,
		Description: entity.Description,
		Type:        string(entity.Type),
		IsRequired:  entity.IsRequired,
		IsActive:    entity.IsActive,
		Options:     string(optionsJSON),
		Category:    entity.Category,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
	}
}

func (m *QuestionMapper) ToEntity(model *models.Question) *entities.Question {
	var options []string
	if model.Options != "" {
		json.Unmarshal([]byte(model.Options), &options)
	}

	question, _ := entities.NewQuestion(
		model.Text,
		model.Description,
		valueobjects.QuestionType(model.Type),
		model.Category,
		options,
		model.IsRequired,
	)

	// Sobrescribir campos que no se pueden establecer en NewQuestion
	question.ID = model.ID
	question.IsActive = model.IsActive
	question.CreatedAt = model.CreatedAt
	question.UpdatedAt = model.UpdatedAt

	return question
}

// QuestionnaireMapper convierte entre entidades Questionnaire y modelos GORM
type QuestionnaireMapper struct{}

func NewQuestionnaireMapper() *QuestionnaireMapper {
	return &QuestionnaireMapper{}
}

func (m *QuestionnaireMapper) ToModel(entity *entities.Questionnaire) *models.Questionnaire {
	return &models.Questionnaire{
		ID:          entity.ID,
		Name:        entity.Name,
		Description: entity.Description,
		IsActive:    entity.IsActive,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
	}
}

func (m *QuestionnaireMapper) ToEntity(model *models.Questionnaire) *entities.Questionnaire {
	questionnaire, _ := entities.NewQuestionnaire(
		model.Name,
		model.Description,
	)

	// Sobrescribir campos
	questionnaire.ID = model.ID
	questionnaire.IsActive = model.IsActive
	questionnaire.CreatedAt = model.CreatedAt
	questionnaire.UpdatedAt = model.UpdatedAt

	return questionnaire
}

// EvaluationPeriodMapper convierte entre entidades EvaluationPeriod y modelos GORM
type EvaluationPeriodMapper struct{}

func NewEvaluationPeriodMapper() *EvaluationPeriodMapper {
	return &EvaluationPeriodMapper{}
}

func (m *EvaluationPeriodMapper) ToModel(entity *entities.EvaluationPeriod) *models.EvaluationPeriod {
	return &models.EvaluationPeriod{
		ID:              entity.ID,
		Name:            entity.Name,
		Description:     entity.Description,
		Status:          string(entity.Status),
		StartDate:       entity.StartDate,
		EndDate:         entity.EndDate,
		QuestionnaireID: entity.QuestionnaireID,
		FichaID:         entity.FichaID,
		IsActive:        entity.IsActive,
		CreatedAt:       entity.CreatedAt,
		UpdatedAt:       entity.UpdatedAt,
	}
}

func (m *EvaluationPeriodMapper) ToEntity(model *models.EvaluationPeriod) *entities.EvaluationPeriod {
	period, _ := entities.NewEvaluationPeriod(
		model.Name,
		model.Description,
		model.StartDate,
		model.EndDate,
		model.QuestionnaireID,
		model.FichaID,
	)

	// Sobrescribir campos
	period.ID = model.ID
	period.Status = valueobjects.PeriodStatus(model.Status)
	period.IsActive = model.IsActive
	period.CreatedAt = model.CreatedAt
	period.UpdatedAt = model.UpdatedAt

	return period
}

// EvaluationMapper convierte entre entidades Evaluation y modelos GORM
type EvaluationMapper struct{}

func NewEvaluationMapper() *EvaluationMapper {
	return &EvaluationMapper{}
}

func (m *EvaluationMapper) ToModel(entity *entities.Evaluation) *models.Evaluation {
	responsesJSON, _ := json.Marshal(entity.Responses)

	return &models.Evaluation{
		ID:              entity.ID,
		StudentID:       entity.StudentID,
		InstructorID:    entity.InstructorID,
		PeriodID:        entity.PeriodID,
		QuestionnaireID: entity.QuestionnaireID,
		Responses:       string(responsesJSON),
		GeneralComment:  entity.GeneralComment,
		Status:          string(entity.Status),
		SubmittedAt:     entity.SubmittedAt,
		CreatedAt:       entity.CreatedAt,
		UpdatedAt:       entity.UpdatedAt,
	}
}

func (m *EvaluationMapper) ToEntity(model *models.Evaluation) *entities.Evaluation {
	evaluation, _ := entities.NewEvaluation(
		model.StudentID,
		model.InstructorID,
		model.PeriodID,
		model.QuestionnaireID,
	)

	// Convertir responses JSON
	var responses []entities.EvaluationResponse
	if model.Responses != "" {
		json.Unmarshal([]byte(model.Responses), &responses)
	}

	// Sobrescribir campos
	evaluation.ID = model.ID
	evaluation.Responses = responses
	evaluation.GeneralComment = model.GeneralComment
	evaluation.Status = valueobjects.EvaluationStatus(model.Status)
	evaluation.SubmittedAt = model.SubmittedAt
	evaluation.CreatedAt = model.CreatedAt
	evaluation.UpdatedAt = model.UpdatedAt

	return evaluation
}

// CommentMapper convierte entre entidades Comment y modelos GORM
type CommentMapper struct{}

func NewCommentMapper() *CommentMapper {
	return &CommentMapper{}
}

func (m *CommentMapper) ToModel(entity *entities.Comment) *models.Comment {
	return &models.Comment{
		ID:           entity.ID,
		EvaluationID: entity.EvaluationID,
		UserID:       entity.UserID,
		Content:      entity.Content,
		Rating:       entity.Rating,
		IsPrivate:    entity.IsPrivate,
		CreatedAt:    entity.CreatedAt,
		UpdatedAt:    entity.UpdatedAt,
	}
}

func (m *CommentMapper) ToEntity(model *models.Comment) *entities.Comment {
	comment := entities.NewComment(
		model.EvaluationID,
		model.UserID,
		model.Content,
		model.Rating,
		model.IsPrivate,
	)

	// Sobrescribir campos
	comment.ID = model.ID
	comment.CreatedAt = model.CreatedAt
	comment.UpdatedAt = model.UpdatedAt

	return comment
}

// ReportMapper convierte entre entidades Report y modelos GORM
type ReportMapper struct{}

func NewReportMapper() *ReportMapper {
	return &ReportMapper{}
}

func (m *ReportMapper) ToModel(entity *entities.Report) *models.Report {
	parametersJSON, _ := json.Marshal(entity.Parameters)
	resultsJSON, _ := json.Marshal(entity.Results)

	return &models.Report{
		ID:           entity.ID,
		PeriodID:     entity.PeriodID,
		Type:         string(entity.Type),
		Status:       string(entity.Status),
		Title:        entity.Title,
		Description:  entity.Description,
		Parameters:   string(parametersJSON),
		Results:      string(resultsJSON),
		FilePath:     entity.FilePath,
		GeneratedBy:  entity.GeneratedBy,
		GeneratedAt:  entity.GeneratedAt,
		ErrorMessage: entity.ErrorMessage,
		CreatedAt:    entity.CreatedAt,
		UpdatedAt:    entity.UpdatedAt,
	}
}

func (m *ReportMapper) ToEntity(model *models.Report) *entities.Report {
	var parameters, results map[string]interface{}

	if model.Parameters != "" {
		json.Unmarshal([]byte(model.Parameters), &parameters)
	}
	if model.Results != "" {
		json.Unmarshal([]byte(model.Results), &results)
	}

	report := entities.NewReport(
		model.PeriodID,
		model.GeneratedBy,
		valueobjects.ReportType(model.Type),
		model.Title,
		model.Description,
		parameters,
	)

	// Sobrescribir campos
	report.ID = model.ID
	report.Status = valueobjects.ReportStatus(model.Status)
	report.Results = results
	report.FilePath = model.FilePath
	report.GeneratedAt = model.GeneratedAt
	report.ErrorMessage = model.ErrorMessage
	report.CreatedAt = model.CreatedAt
	report.UpdatedAt = model.UpdatedAt

	return report
}

// ConfigurationMapper convierte entre entidades Configuration y modelos GORM
type ConfigurationMapper struct{}

func NewConfigurationMapper() *ConfigurationMapper {
	return &ConfigurationMapper{}
}

func (m *ConfigurationMapper) ToModel(entity *entities.Configuration) *models.Configuration {
	return &models.Configuration{
		ID:          entity.ID,
		Key:         entity.Key,
		Value:       entity.Value,
		Description: entity.Description,
		Category:    entity.Category,
		IsActive:    entity.IsActive,
		IsEditable:  entity.IsEditable,
		CreatedBy:   entity.CreatedBy,
		UpdatedBy:   entity.UpdatedBy,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
	}
}

func (m *ConfigurationMapper) ToEntity(model *models.Configuration) *entities.Configuration {
	config := entities.NewConfiguration(
		model.Key,
		model.Value,
		model.Description,
		model.Category,
		model.CreatedBy,
	)

	// Sobrescribir campos
	config.ID = model.ID
	config.IsActive = model.IsActive
	config.IsEditable = model.IsEditable
	config.UpdatedBy = model.UpdatedBy
	config.CreatedAt = model.CreatedAt
	config.UpdatedAt = model.UpdatedAt

	return config
}

// NotificationMapper convierte entre entidades Notification y modelos GORM
type NotificationMapper struct{}

func NewNotificationMapper() *NotificationMapper {
	return &NotificationMapper{}
}

func (m *NotificationMapper) ToModel(entity *entities.Notification) *models.Notification {
	metadataJSON, _ := json.Marshal(entity.Metadata)

	return &models.Notification{
		ID:         entity.ID,
		Type:       entity.Type,
		Title:      entity.Title,
		Message:    entity.Message,
		Recipient:  entity.Recipient,
		EntityType: entity.EntityType,
		EntityID:   entity.EntityID,
		Metadata:   string(metadataJSON),
		IsRead:     entity.IsRead,
		IsSent:     entity.IsSent,
		SentAt:     entity.SentAt,
		ReadAt:     entity.ReadAt,
		CreatedAt:  entity.CreatedAt,
		UpdatedAt:  entity.UpdatedAt,
	}
}

func (m *NotificationMapper) ToEntity(model *models.Notification) *entities.Notification {
	var metadata map[string]interface{}
	if model.Metadata != "" {
		json.Unmarshal([]byte(model.Metadata), &metadata)
	}

	notification := entities.NewNotification(
		model.Type,
		model.Title,
		model.Message,
		model.Recipient,
		model.EntityType,
		model.EntityID,
		metadata,
	)

	// Sobrescribir campos
	notification.ID = model.ID
	notification.IsRead = model.IsRead
	notification.IsSent = model.IsSent
	notification.SentAt = model.SentAt
	notification.ReadAt = model.ReadAt
	notification.CreatedAt = model.CreatedAt
	notification.UpdatedAt = model.UpdatedAt

	return notification
}
