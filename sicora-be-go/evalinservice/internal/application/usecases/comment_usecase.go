package usecases

import (
	"context"
	"fmt"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/exceptions"
	"evalinservice/internal/domain/repositories"
	"github.com/google/uuid"
)

type CommentUseCase struct {
	commentRepo    repositories.CommentRepository
	evaluationRepo repositories.EvaluationRepository
}

func NewCommentUseCase(
	commentRepo repositories.CommentRepository,
	evaluationRepo repositories.EvaluationRepository,
) *CommentUseCase {
	return &CommentUseCase{
		commentRepo:    commentRepo,
		evaluationRepo: evaluationRepo,
	}
}

func (uc *CommentUseCase) CreateComment(ctx context.Context, userID uuid.UUID, req *dtos.CommentCreateRequest) (*dtos.CommentResponse, error) {
	evaluation, err := uc.evaluationRepo.GetByID(ctx, req.EvaluationID)
	if err != nil {
		return nil, fmt.Errorf("evaluation not found: %w", err)
	}

	if evaluation == nil {
		return nil, exceptions.NewValidationError("evaluation_id", "evaluation does not exist")
	}

	comment := entities.NewComment(
		req.EvaluationID,
		userID,
		req.Content,
		req.Rating,
		req.IsPrivate,
	)

	if !comment.IsValid() {
		return nil, exceptions.NewValidationError("comment", "invalid comment data")
	}

	if err := uc.commentRepo.Create(ctx, comment); err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return uc.mapToCommentResponse(comment), nil
}

func (uc *CommentUseCase) GetCommentByID(ctx context.Context, id uuid.UUID) (*dtos.CommentResponse, error) {
	comment, err := uc.commentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("comment not found: %w", err)
	}

	return uc.mapToCommentResponse(comment), nil
}

func (uc *CommentUseCase) UpdateComment(ctx context.Context, id, userID uuid.UUID, req *dtos.CommentUpdateRequest) (*dtos.CommentResponse, error) {
	comment, err := uc.commentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("comment not found: %w", err)
	}

	if comment.UserID != userID {
		return nil, exceptions.NewValidationError("user_id", "can only update own comments")
	}

	comment.UpdateContent(req.Content)
	comment.UpdateRating(req.Rating)
	comment.SetPrivacy(req.IsPrivate)

	if !comment.IsValid() {
		return nil, exceptions.NewValidationError("comment", "invalid comment data")
	}

	if err := uc.commentRepo.Update(ctx, comment); err != nil {
		return nil, fmt.Errorf("failed to update comment: %w", err)
	}

	return uc.mapToCommentResponse(comment), nil
}

func (uc *CommentUseCase) DeleteComment(ctx context.Context, id, userID uuid.UUID) error {
	comment, err := uc.commentRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}

	if comment.UserID != userID {
		return exceptions.NewValidationError("user_id", "can only delete own comments")
	}

	if err := uc.commentRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	return nil
}

func (uc *CommentUseCase) GetCommentsByEvaluation(ctx context.Context, evaluationID uuid.UUID, includePrivate bool, userID *uuid.UUID) ([]*dtos.CommentResponse, error) {
	var comments []*entities.Comment
	var err error

	if includePrivate && userID != nil {
		comments, err = uc.commentRepo.GetByEvaluationID(ctx, evaluationID)
	} else {
		comments, err = uc.commentRepo.GetPublicCommentsByEvaluation(ctx, evaluationID)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get comments: %w", err)
	}

	responses := make([]*dtos.CommentResponse, 0)
	for _, comment := range comments {
		if !includePrivate && comment.IsPrivate {
			continue
		}
		if comment.IsPrivate && userID != nil && comment.UserID != *userID {
			continue
		}
		responses = append(responses, uc.mapToCommentResponse(comment))
	}

	return responses, nil
}

func (uc *CommentUseCase) GetCommentStats(ctx context.Context, evaluationID *uuid.UUID) (*dtos.CommentStatsResponse, error) {
	var totalComments, publicComments, privateComments, ratedComments int64

	if evaluationID != nil {
		comments, err := uc.commentRepo.GetByEvaluationID(ctx, *evaluationID)
		if err != nil {
			return nil, fmt.Errorf("failed to get comments: %w", err)
		}

		totalComments = int64(len(comments))
		for _, comment := range comments {
			if comment.IsPrivate {
				privateComments++
			} else {
				publicComments++
			}
			if comment.Rating != nil {
				ratedComments++
			}
		}
	}

	return &dtos.CommentStatsResponse{
		TotalComments:   totalComments,
		PublicComments:  publicComments,
		PrivateComments: privateComments,
		RatedComments:   ratedComments,
		AverageRating:   0.0,
		CommentsPerDay:  0.0,
	}, nil
}

func (uc *CommentUseCase) mapToCommentResponse(comment *entities.Comment) *dtos.CommentResponse {
	return &dtos.CommentResponse{
		ID:           comment.ID,
		EvaluationID: comment.EvaluationID,
		UserID:       comment.UserID,
		Content:      comment.Content,
		Rating:       comment.Rating,
		IsPrivate:    comment.IsPrivate,
		CreatedAt:    comment.CreatedAt,
		UpdatedAt:    comment.UpdatedAt,
	}
}
