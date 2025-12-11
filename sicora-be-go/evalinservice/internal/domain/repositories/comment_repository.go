package repositories

import (
	"context"

	"evalinservice/internal/domain/entities"
	"github.com/google/uuid"
)

type CommentRepository interface {
	Create(ctx context.Context, comment *entities.Comment) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Comment, error)
	GetByEvaluationID(ctx context.Context, evaluationID uuid.UUID) ([]*entities.Comment, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.Comment, error)
	Update(ctx context.Context, comment *entities.Comment) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetPublicCommentsByEvaluation(ctx context.Context, evaluationID uuid.UUID) ([]*entities.Comment, error)
	GetPrivateCommentsByEvaluationAndUser(ctx context.Context, evaluationID, userID uuid.UUID) ([]*entities.Comment, error)
	CountByEvaluationID(ctx context.Context, evaluationID uuid.UUID) (int64, error)
	GetCommentsByPeriod(ctx context.Context, periodID uuid.UUID) ([]*entities.Comment, error)
}
