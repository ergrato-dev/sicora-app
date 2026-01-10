package repositories

import (
	"context"

	"projectevalservice/internal/domain/entities"
	"projectevalservice/internal/domain/repositories"
	"projectevalservice/internal/infrastructure/database/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type evaluationRepository struct {
	db *gorm.DB
}

func NewEvaluationRepository(db *gorm.DB) repositories.EvaluationRepository {
	return &evaluationRepository{db: db}
}

func (r *evaluationRepository) Create(ctx context.Context, evaluation *entities.Evaluation) error {
	model := &models.Evaluation{}
	model.FromEntity(evaluation)

	result := r.db.WithContext(ctx).Create(model)
	if result.Error != nil {
		return result.Error
	}

	*evaluation = *model.ToEntity()
	return nil
}

func (r *evaluationRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Evaluation, error) {
	var model models.Evaluation
	result := r.db.WithContext(ctx).Preload("Submission").Preload("Submission.Project").First(&model, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}

	return model.ToEntity(), nil
}

func (r *evaluationRepository) GetBySubmissionID(ctx context.Context, submissionID uuid.UUID) ([]*entities.Evaluation, error) {
	var models []models.Evaluation
	result := r.db.WithContext(ctx).Preload("Submission").Preload("Submission.Project").Where("submission_id = ?", submissionID).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	evaluations := make([]*entities.Evaluation, len(models))
	for i, model := range models {
		evaluations[i] = model.ToEntity()
	}

	return evaluations, nil
}

func (r *evaluationRepository) GetByEvaluatorID(ctx context.Context, evaluatorID uuid.UUID) ([]*entities.Evaluation, error) {
	var models []models.Evaluation
	result := r.db.WithContext(ctx).Preload("Submission").Preload("Submission.Project").Where("evaluator_id = ?", evaluatorID).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	evaluations := make([]*entities.Evaluation, len(models))
	for i, model := range models {
		evaluations[i] = model.ToEntity()
	}

	return evaluations, nil
}

func (r *evaluationRepository) GetBySubmissionAndEvaluator(ctx context.Context, submissionID, evaluatorID uuid.UUID) (*entities.Evaluation, error) {
	var model models.Evaluation
	result := r.db.WithContext(ctx).Preload("Submission").Preload("Submission.Project").Where("submission_id = ? AND evaluator_id = ?", submissionID, evaluatorID).First(&model)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}

	return model.ToEntity(), nil
}

func (r *evaluationRepository) GetAll(ctx context.Context) ([]*entities.Evaluation, error) {
	var models []models.Evaluation
	result := r.db.WithContext(ctx).Preload("Submission").Preload("Submission.Project").Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	evaluations := make([]*entities.Evaluation, len(models))
	for i, model := range models {
		evaluations[i] = model.ToEntity()
	}

	return evaluations, nil
}

func (r *evaluationRepository) Update(ctx context.Context, evaluation *entities.Evaluation) error {
	model := &models.Evaluation{}
	model.FromEntity(evaluation)

	result := r.db.WithContext(ctx).Save(model)
	if result.Error != nil {
		return result.Error
	}

	*evaluation = *model.ToEntity()
	return nil
}

func (r *evaluationRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.Evaluation{}, "id = ?", id)
	return result.Error
}

func (r *evaluationRepository) GetEvaluationsByStatus(ctx context.Context, status entities.EvaluationStatus) ([]*entities.Evaluation, error) {
	var models []models.Evaluation
	result := r.db.WithContext(ctx).Preload("Submission").Preload("Submission.Project").Where("status = ?", string(status)).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	evaluations := make([]*entities.Evaluation, len(models))
	for i, model := range models {
		evaluations[i] = model.ToEntity()
	}

	return evaluations, nil
}

func (r *evaluationRepository) GetCompletedEvaluations(ctx context.Context) ([]*entities.Evaluation, error) {
	var models []models.Evaluation
	result := r.db.WithContext(ctx).Preload("Submission").Preload("Submission.Project").Where("status IN ?", []string{
		string(entities.EvaluationStatusCompletada),
		string(entities.EvaluationStatusPublicada),
	}).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	evaluations := make([]*entities.Evaluation, len(models))
	for i, model := range models {
		evaluations[i] = model.ToEntity()
	}

	return evaluations, nil
}
