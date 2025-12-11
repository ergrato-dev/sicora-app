package repositories

import (
	"gorm.io/gorm"

	"evalinservice/internal/domain/repositories"
)

// RepositoryContainer contiene todas las implementaciones de repositorios
type RepositoryContainer struct {
	Question         repositories.QuestionRepository
	Questionnaire    repositories.QuestionnaireRepository
	EvaluationPeriod repositories.EvaluationPeriodRepository
	Evaluation       repositories.EvaluationRepository
	Comment          repositories.CommentRepository
	Report           repositories.ReportRepository
	Configuration    repositories.ConfigurationRepository
	Notification     repositories.NotificationRepository
}

// NewRepositoryContainer crea un nuevo contenedor con todas las implementaciones de repositorios
func NewRepositoryContainer(db *gorm.DB) *RepositoryContainer {
	return &RepositoryContainer{
		Question:         NewQuestionRepository(db),
		Questionnaire:    NewQuestionnaireRepository(db),
		EvaluationPeriod: NewEvaluationPeriodRepository(db),
		Evaluation:       NewEvaluationRepository(db),
		Comment:          NewCommentRepository(db),
		Report:           NewReportRepository(db),
		Configuration:    NewConfigurationRepository(db),
		Notification:     NewNotificationRepository(db),
	}
}
