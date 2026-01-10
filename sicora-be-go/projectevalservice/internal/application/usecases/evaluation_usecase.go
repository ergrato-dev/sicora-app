package usecases

import (
	"context"

	"projectevalservice/internal/domain/entities"
	"projectevalservice/internal/domain/errors"
	"projectevalservice/internal/domain/repositories"

	"github.com/google/uuid"
)

type EvaluationUseCase struct {
	evaluationRepo repositories.EvaluationRepository
	submissionRepo repositories.SubmissionRepository
}

func NewEvaluationUseCase(evaluationRepo repositories.EvaluationRepository, submissionRepo repositories.SubmissionRepository) *EvaluationUseCase {
	return &EvaluationUseCase{
		evaluationRepo: evaluationRepo,
		submissionRepo: submissionRepo,
	}
}

func (uc *EvaluationUseCase) CreateEvaluation(ctx context.Context, evaluation *entities.Evaluation) error {
	submission, err := uc.submissionRepo.GetByID(ctx, evaluation.SubmissionID)
	if err != nil {
		return err
	}

	if submission == nil {
		return errors.ErrSubmissionNotFound
	}

	if !submission.CanBeEvaluated() {
		return errors.ErrEvaluationNotAllowed
	}

	existing, _ := uc.evaluationRepo.GetBySubmissionAndEvaluator(ctx, evaluation.SubmissionID, evaluation.EvaluatorID)
	if existing != nil {
		return errors.ErrEvaluationAlreadyExists
	}

	evaluation.Status = entities.EvaluationStatusBorrador
	return uc.evaluationRepo.Create(ctx, evaluation)
}

func (uc *EvaluationUseCase) GetEvaluationByID(ctx context.Context, id uuid.UUID) (*entities.Evaluation, error) {
	return uc.evaluationRepo.GetByID(ctx, id)
}

func (uc *EvaluationUseCase) GetEvaluationsBySubmission(ctx context.Context, submissionID uuid.UUID) ([]*entities.Evaluation, error) {
	return uc.evaluationRepo.GetBySubmissionID(ctx, submissionID)
}

func (uc *EvaluationUseCase) GetEvaluationsByEvaluator(ctx context.Context, evaluatorID uuid.UUID) ([]*entities.Evaluation, error) {
	return uc.evaluationRepo.GetByEvaluatorID(ctx, evaluatorID)
}

func (uc *EvaluationUseCase) UpdateEvaluation(ctx context.Context, evaluation *entities.Evaluation) error {
	existing, err := uc.evaluationRepo.GetByID(ctx, evaluation.ID)
	if err != nil {
		return err
	}

	if existing == nil {
		return errors.ErrEvaluationNotFound
	}

	if !existing.CanBeModified() {
		return errors.ErrEvaluationNotModifiable
	}

	if !evaluation.Status.IsValid() {
		return errors.ErrInvalidEvaluationStatus
	}

	return uc.evaluationRepo.Update(ctx, evaluation)
}

func (uc *EvaluationUseCase) CompleteEvaluation(ctx context.Context, id uuid.UUID) error {
	evaluation, err := uc.evaluationRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if evaluation == nil {
		return errors.ErrEvaluationNotFound
	}

	if !evaluation.CanBeModified() {
		return errors.ErrEvaluationNotModifiable
	}

	evaluation.Complete()

	err = uc.evaluationRepo.Update(ctx, evaluation)
	if err != nil {
		return err
	}

	submission, err := uc.submissionRepo.GetByID(ctx, evaluation.SubmissionID)
	if err != nil {
		return err
	}

	submission.Status = entities.SubmissionStatusEvaluada
	return uc.submissionRepo.Update(ctx, submission)
}

func (uc *EvaluationUseCase) PublishEvaluation(ctx context.Context, id uuid.UUID) error {
	evaluation, err := uc.evaluationRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if evaluation == nil {
		return errors.ErrEvaluationNotFound
	}

	if evaluation.Status != entities.EvaluationStatusCompletada {
		return errors.ErrEvaluationNotAllowed
	}

	evaluation.Status = entities.EvaluationStatusPublicada
	return uc.evaluationRepo.Update(ctx, evaluation)
}

func (uc *EvaluationUseCase) DeleteEvaluation(ctx context.Context, id uuid.UUID) error {
	existing, err := uc.evaluationRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if existing == nil {
		return errors.ErrEvaluationNotFound
	}

	if !existing.CanBeModified() {
		return errors.ErrEvaluationNotModifiable
	}

	return uc.evaluationRepo.Delete(ctx, id)
}
