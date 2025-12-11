package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/repositories"
	"evalinservice/internal/infrastructure/database/mappers"
	"evalinservice/internal/infrastructure/database/models"
)

type commentRepositoryImpl struct {
	db     *gorm.DB
	mapper *mappers.CommentMapper
}

func NewCommentRepository(db *gorm.DB) repositories.CommentRepository {
	return &commentRepositoryImpl{
		db:     db,
		mapper: mappers.NewCommentMapper(),
	}
}

func (r *commentRepositoryImpl) Create(ctx context.Context, comment *entities.Comment) error {
	model := r.mapper.ToModel(comment)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create comment: %w", err)
	}
	return nil
}

func (r *commentRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Comment, error) {
	var model models.Comment
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get comment by ID: %w", err)
	}
	return r.mapper.ToEntity(&model), nil
}

func (r *commentRepositoryImpl) GetByEvaluation(ctx context.Context, evaluationID uuid.UUID) ([]*entities.Comment, error) {
	var comments []models.Comment
	if err := r.db.WithContext(ctx).Where("evaluation_id = ?", evaluationID).
		Order("created_at DESC").Find(&comments).Error; err != nil {
		return nil, fmt.Errorf("failed to get comments by evaluation: %w", err)
	}

	result := make([]*entities.Comment, len(comments))
	for i, model := range comments {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *commentRepositoryImpl) Update(ctx context.Context, comment *entities.Comment) error {
	model := r.mapper.ToModel(comment)
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update comment: %w", err)
	}
	return nil
}

func (r *commentRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.Comment{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}
	return nil
}

func (r *commentRepositoryImpl) GetByAuthor(ctx context.Context, authorID uuid.UUID) ([]*entities.Comment, error) {
	var comments []models.Comment
	if err := r.db.WithContext(ctx).Where("author_id = ?", authorID).
		Order("created_at DESC").Find(&comments).Error; err != nil {
		return nil, fmt.Errorf("failed to get comments by author: %w", err)
	}

	result := make([]*entities.Comment, len(comments))
	for i, model := range comments {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *commentRepositoryImpl) GetByInstructor(ctx context.Context, instructorID uuid.UUID) ([]*entities.Comment, error) {
	var comments []models.Comment
	if err := r.db.WithContext(ctx).
		Joins("JOIN evaluations ON comments.evaluation_id = evaluations.id").
		Where("evaluations.instructor_id = ?", instructorID).
		Order("comments.created_at DESC").Find(&comments).Error; err != nil {
		return nil, fmt.Errorf("failed to get comments by instructor: %w", err)
	}

	result := make([]*entities.Comment, len(comments))
	for i, model := range comments {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *commentRepositoryImpl) CountByEvaluation(ctx context.Context, evaluationID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.Comment{}).
		Where("evaluation_id = ?", evaluationID).Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count comments by evaluation: %w", err)
	}
	return count, nil
}

func (r *commentRepositoryImpl) CountByEvaluationID(ctx context.Context, evaluationID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.Comment{}).
		Where("evaluation_id = ?", evaluationID).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count comments by evaluation ID: %w", err)
	}
	return count, nil
}
