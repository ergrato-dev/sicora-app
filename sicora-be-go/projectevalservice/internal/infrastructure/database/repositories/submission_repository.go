package repositories

import (
	"context"

	"projectevalservice/internal/domain/entities"
	"projectevalservice/internal/domain/repositories"
	"projectevalservice/internal/infrastructure/database/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type submissionRepository struct {
	db *gorm.DB
}

func NewSubmissionRepository(db *gorm.DB) repositories.SubmissionRepository {
	return &submissionRepository{db: db}
}

func (r *submissionRepository) Create(ctx context.Context, submission *entities.Submission) error {
	model := &models.Submission{}
	model.FromEntity(submission)

	result := r.db.WithContext(ctx).Create(model)
	if result.Error != nil {
		return result.Error
	}

	*submission = *model.ToEntity()
	return nil
}

func (r *submissionRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Submission, error) {
	var model models.Submission
	result := r.db.WithContext(ctx).Preload("Project").First(&model, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}

	return model.ToEntity(), nil
}

func (r *submissionRepository) GetByProjectID(ctx context.Context, projectID uuid.UUID) ([]*entities.Submission, error) {
	var models []models.Submission
	result := r.db.WithContext(ctx).Preload("Project").Where("project_id = ?", projectID).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	submissions := make([]*entities.Submission, len(models))
	for i, model := range models {
		submissions[i] = model.ToEntity()
	}

	return submissions, nil
}

func (r *submissionRepository) GetByStudentID(ctx context.Context, studentID uuid.UUID) ([]*entities.Submission, error) {
	var models []models.Submission
	result := r.db.WithContext(ctx).Preload("Project").Where("student_id = ?", studentID).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	submissions := make([]*entities.Submission, len(models))
	for i, model := range models {
		submissions[i] = model.ToEntity()
	}

	return submissions, nil
}

func (r *submissionRepository) GetByProjectAndStudent(ctx context.Context, projectID, studentID uuid.UUID) (*entities.Submission, error) {
	var model models.Submission
	result := r.db.WithContext(ctx).Preload("Project").Where("project_id = ? AND student_id = ?", projectID, studentID).First(&model)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}

	return model.ToEntity(), nil
}

func (r *submissionRepository) GetAll(ctx context.Context) ([]*entities.Submission, error) {
	var models []models.Submission
	result := r.db.WithContext(ctx).Preload("Project").Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	submissions := make([]*entities.Submission, len(models))
	for i, model := range models {
		submissions[i] = model.ToEntity()
	}

	return submissions, nil
}

func (r *submissionRepository) Update(ctx context.Context, submission *entities.Submission) error {
	model := &models.Submission{}
	model.FromEntity(submission)

	result := r.db.WithContext(ctx).Save(model)
	if result.Error != nil {
		return result.Error
	}

	*submission = *model.ToEntity()
	return nil
}

func (r *submissionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.Submission{}, "id = ?", id)
	return result.Error
}

func (r *submissionRepository) GetSubmissionsByStatus(ctx context.Context, status entities.SubmissionStatus) ([]*entities.Submission, error) {
	var models []models.Submission
	result := r.db.WithContext(ctx).Preload("Project").Where("status = ?", string(status)).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	submissions := make([]*entities.Submission, len(models))
	for i, model := range models {
		submissions[i] = model.ToEntity()
	}

	return submissions, nil
}

func (r *submissionRepository) GetPendingEvaluations(ctx context.Context) ([]*entities.Submission, error) {
	var models []models.Submission
	result := r.db.WithContext(ctx).Preload("Project").Where("status IN ?", []string{
		string(entities.SubmissionStatusEnviada),
		string(entities.SubmissionStatusEnEvaluacion),
	}).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	submissions := make([]*entities.Submission, len(models))
	for i, model := range models {
		submissions[i] = model.ToEntity()
	}

	return submissions, nil
}
