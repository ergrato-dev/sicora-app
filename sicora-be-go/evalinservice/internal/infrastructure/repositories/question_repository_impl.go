package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/repositories"
	"evalinservice/internal/domain/valueobjects"
	"evalinservice/internal/infrastructure/database/mappers"
	"evalinservice/internal/infrastructure/database/models"
)

type questionRepositoryImpl struct {
	db     *gorm.DB
	mapper *mappers.QuestionMapper
}

func NewQuestionRepository(db *gorm.DB) repositories.QuestionRepository {
	return &questionRepositoryImpl{
		db:     db,
		mapper: mappers.NewQuestionMapper(),
	}
}

func (r *questionRepositoryImpl) Create(ctx context.Context, question *entities.Question) error {
	model := r.mapper.ToModel(question)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create question: %w", err)
	}
	return nil
}

func (r *questionRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Question, error) {
	var model models.Question
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get question by ID: %w", err)
	}
	return r.mapper.ToEntity(&model), nil
}

func (r *questionRepositoryImpl) GetAll(ctx context.Context, filters repositories.QuestionFilters) ([]*entities.Question, error) {
	query := r.db.WithContext(ctx)

	// Aplicar filtros
	if filters.Category != "" {
		query = query.Where("category = ?", filters.Category)
	}

	if filters.Type != "" {
		query = query.Where("type = ?", string(filters.Type))
	}

	if filters.IsRequired != nil {
		query = query.Where("is_required = ?", *filters.IsRequired)
	}

	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	if filters.Search != "" {
		query = query.Where("text ILIKE ? OR description ILIKE ?", "%"+filters.Search+"%", "%"+filters.Search+"%")
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

	var models []models.Question
	if err := query.Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get all questions: %w", err)
	}

	questions := make([]*entities.Question, len(models))
	for i, model := range models {
		questions[i] = r.mapper.ToEntity(&model)
	}
	return questions, nil
}

func (r *questionRepositoryImpl) GetActiveQuestions(ctx context.Context) ([]*entities.Question, error) {
	var models []models.Question
	if err := r.db.WithContext(ctx).Where("is_active = ?", true).Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get active questions: %w", err)
	}

	questions := make([]*entities.Question, len(models))
	for i, model := range models {
		questions[i] = r.mapper.ToEntity(&model)
	}
	return questions, nil
}

func (r *questionRepositoryImpl) GetByCategory(ctx context.Context, category string) ([]*entities.Question, error) {
	var models []models.Question
	if err := r.db.WithContext(ctx).Where("category = ? AND is_active = ?", category, true).Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get questions by category: %w", err)
	}

	questions := make([]*entities.Question, len(models))
	for i, model := range models {
		questions[i] = r.mapper.ToEntity(&model)
	}
	return questions, nil
}

func (r *questionRepositoryImpl) Update(ctx context.Context, question *entities.Question) error {
	model := r.mapper.ToModel(question)
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update question: %w", err)
	}
	return nil
}

func (r *questionRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.Question{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete question: %w", err)
	}
	return nil
}

func (r *questionRepositoryImpl) BulkCreate(ctx context.Context, questions []*entities.Question) error {
	if len(questions) == 0 {
		return nil
	}

	models := make([]models.Question, len(questions))
	for i, question := range questions {
		models[i] = *r.mapper.ToModel(question)
	}

	if err := r.db.WithContext(ctx).Create(&models).Error; err != nil {
		return fmt.Errorf("failed to bulk create questions: %w", err)
	}
	return nil
}

func (r *questionRepositoryImpl) IsInUse(ctx context.Context, id uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.QuestionnaireQuestion{}).
		Where("question_id = ?", id).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check if question is in use: %w", err)
	}
	return count > 0, nil
}

func (r *questionRepositoryImpl) GetCategories(ctx context.Context) ([]string, error) {
	var categories []string
	if err := r.db.WithContext(ctx).Model(&models.Question{}).
		Distinct("category").
		Where("is_active = ? AND category != ''", true).
		Pluck("category", &categories).Error; err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}
	return categories, nil
}

func (r *questionRepositoryImpl) GetByType(ctx context.Context, questionType valueobjects.QuestionType) ([]*entities.Question, error) {
	var models []models.Question
	if err := r.db.WithContext(ctx).Where("type = ? AND is_active = ?", string(questionType), true).Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get questions by type: %w", err)
	}

	questions := make([]*entities.Question, len(models))
	for i, model := range models {
		questions[i] = r.mapper.ToEntity(&model)
	}
	return questions, nil
}
