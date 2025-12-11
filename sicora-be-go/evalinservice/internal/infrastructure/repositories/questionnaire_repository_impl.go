package repositories

import (
	"context"
	"fmt"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/repositories"
	"evalinservice/internal/infrastructure/database/mappers"
	"evalinservice/internal/infrastructure/database/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	queryByID = "id = ?"
)

type questionnaireRepositoryImpl struct {
	db     *gorm.DB
	mapper *mappers.QuestionnaireMapper
}

func NewQuestionnaireRepository(db *gorm.DB) repositories.QuestionnaireRepository {
	return &questionnaireRepositoryImpl{
		db:     db,
		mapper: mappers.NewQuestionnaireMapper(),
	}
}

func (r *questionnaireRepositoryImpl) Create(ctx context.Context, questionnaire *entities.Questionnaire) error {
	model := r.mapper.ToModel(questionnaire)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create questionnaire: %w", err)
	}
	return nil
}

func (r *questionnaireRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Questionnaire, error) {
	var model models.Questionnaire
	if err := r.db.WithContext(ctx).Preload("Questions").First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get questionnaire by ID: %w", err)
	}
	return r.mapper.ToEntity(&model), nil
}

func (r *questionnaireRepositoryImpl) GetAll(ctx context.Context, filters repositories.QuestionnaireFilters) ([]*entities.Questionnaire, error) {
	query := r.db.WithContext(ctx).Preload("Questions")

	// Aplicar filtros
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	if filters.Search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+filters.Search+"%", "%"+filters.Search+"%")
	}

	if filters.HasQuestions != nil {
		if *filters.HasQuestions {
			query = query.Joins("JOIN questionnaire_questions ON questionnaires.id = questionnaire_questions.questionnaire_id")
		} else {
			query = query.Where("NOT EXISTS (SELECT 1 FROM questionnaire_questions WHERE questionnaire_questions.questionnaire_id = questionnaires.id)")
		}
	}

	// Aplicar ordenamiento
	orderBy := "created_at"
	if filters.OrderBy != "" {
		orderBy = filters.OrderBy
	}
	orderDir := "desc"
	if filters.OrderDir != "" {
		orderDir = filters.OrderDir
	}
	query = query.Order(orderBy + " " + orderDir)

	// Aplicar paginación
	if filters.Limit > 0 {
		query = query.Limit(filters.Limit)
	}
	if filters.Offset > 0 {
		query = query.Offset(filters.Offset)
	}

	var models []models.Questionnaire
	if err := query.Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get questionnaires with filters: %w", err)
	}

	questionnaires := make([]*entities.Questionnaire, len(models))
	for i, model := range models {
		questionnaires[i] = r.mapper.ToEntity(&model)
	}
	return questionnaires, nil
}

func (r *questionnaireRepositoryImpl) GetActiveQuestionnaires(ctx context.Context) ([]*entities.Questionnaire, error) {
	var models []models.Questionnaire
	if err := r.db.WithContext(ctx).Preload("Questions").Where("is_active = ?", true).Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get active questionnaires: %w", err)
	}

	questionnaires := make([]*entities.Questionnaire, len(models))
	for i, model := range models {
		questionnaires[i] = r.mapper.ToEntity(&model)
	}
	return questionnaires, nil
}

func (r *questionnaireRepositoryImpl) GetQuestionnaireWithQuestions(ctx context.Context, id uuid.UUID) (*entities.Questionnaire, []*entities.Question, error) {
	var model models.Questionnaire
	if err := r.db.WithContext(ctx).Preload("Questions.Question").First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil, nil
		}
		return nil, nil, fmt.Errorf("failed to get questionnaire with questions: %w", err)
	}

	questionnaire := r.mapper.ToEntity(&model)
	questions := make([]*entities.Question, len(model.Questions))
	dbQuestionMapper := mappers.NewQuestionMapper() // Usar el mapper de database

	for i, questionnaireQuestion := range model.Questions {
		if questionnaireQuestion.Question != nil {
			questions[i] = dbQuestionMapper.ToEntity(questionnaireQuestion.Question)
		}
	}

	return questionnaire, questions, nil
}

func (r *questionnaireRepositoryImpl) AddQuestionToQuestionnaire(ctx context.Context, questionnaireID, questionID uuid.UUID) error {
	if err := r.db.WithContext(ctx).Model(&models.Questionnaire{ID: questionnaireID}).
		Association("Questions").Append(&models.Question{ID: questionID}); err != nil {
		return fmt.Errorf("failed to add question to questionnaire: %w", err)
	}
	return nil
}

func (r *questionnaireRepositoryImpl) RemoveQuestionFromQuestionnaire(ctx context.Context, questionnaireID, questionID uuid.UUID) error {
	if err := r.db.WithContext(ctx).Model(&models.Questionnaire{ID: questionnaireID}).
		Association("Questions").Delete(&models.Question{ID: questionID}); err != nil {
		return fmt.Errorf("failed to remove question from questionnaire: %w", err)
	}
	return nil
}

func (r *questionnaireRepositoryImpl) ReorderQuestions(ctx context.Context, questionnaireID uuid.UUID, questionIDs []uuid.UUID) error {
	// Para reordenar, necesitamos usar una tabla intermedia con posición
	// Por ahora, implementamos una versión simple que limpia y re-agrega
	tx := r.db.WithContext(ctx).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Limpiar asociaciones existentes
	if err := tx.Model(&models.Questionnaire{ID: questionnaireID}).Association("Questions").Clear(); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to clear questions from questionnaire: %w", err)
	}

	// Re-agregar en el nuevo orden
	for _, questionID := range questionIDs {
		if err := tx.Model(&models.Questionnaire{ID: questionnaireID}).
			Association("Questions").Append(&models.Question{ID: questionID}); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to reorder questions: %w", err)
		}
	}

	return tx.Commit().Error
}

func (r *questionnaireRepositoryImpl) IsInUse(ctx context.Context, id uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.EvaluationPeriod{}).
		Where("questionnaire_id = ? AND status != ?", id, "completed").Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check if questionnaire is in use: %w", err)
	}
	return count > 0, nil
}

func (r *questionnaireRepositoryImpl) GetQuestionnairesByQuestion(ctx context.Context, questionID uuid.UUID) ([]*entities.Questionnaire, error) {
	var models []models.Questionnaire
	if err := r.db.WithContext(ctx).
		Joins("JOIN questionnaire_questions ON questionnaires.id = questionnaire_questions.questionnaire_id").
		Where("questionnaire_questions.question_id = ?", questionID).
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get questionnaires by question: %w", err)
	}

	questionnaires := make([]*entities.Questionnaire, len(models))
	for i, model := range models {
		questionnaires[i] = r.mapper.ToEntity(&model)
	}
	return questionnaires, nil
}

func (r *questionnaireRepositoryImpl) Update(ctx context.Context, questionnaire *entities.Questionnaire) error {
	model := r.mapper.ToModel(questionnaire)
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update questionnaire: %w", err)
	}
	return nil
}

func (r *questionnaireRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.Questionnaire{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete questionnaire: %w", err)
	}
	return nil
}
