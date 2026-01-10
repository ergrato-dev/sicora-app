package usecases

import (
	"context"

	"projectevalservice/internal/domain/entities"
	"projectevalservice/internal/domain/errors"
	"projectevalservice/internal/domain/repositories"

	"github.com/google/uuid"
)

type SubmissionUseCase struct {
	submissionRepo repositories.SubmissionRepository
	projectRepo    repositories.ProjectRepository
}

func NewSubmissionUseCase(submissionRepo repositories.SubmissionRepository, projectRepo repositories.ProjectRepository) *SubmissionUseCase {
	return &SubmissionUseCase{
		submissionRepo: submissionRepo,
		projectRepo:    projectRepo,
	}
}

func (uc *SubmissionUseCase) CreateSubmission(ctx context.Context, submission *entities.Submission) error {
	project, err := uc.projectRepo.GetByID(ctx, submission.ProjectID)
	if err != nil {
		return err
	}

	if project == nil {
		return errors.ErrProjectNotFound
	}

	if !project.CanReceiveSubmissions() {
		return errors.ErrSubmissionNotAllowed
	}

	existing, _ := uc.submissionRepo.GetByProjectAndStudent(ctx, submission.ProjectID, submission.StudentID)
	if existing != nil {
		return errors.ErrSubmissionAlreadyExists
	}

	submission.Status = entities.SubmissionStatusEnviada
	return uc.submissionRepo.Create(ctx, submission)
}

func (uc *SubmissionUseCase) GetSubmissionByID(ctx context.Context, id uuid.UUID) (*entities.Submission, error) {
	return uc.submissionRepo.GetByID(ctx, id)
}

func (uc *SubmissionUseCase) GetSubmissionsByProject(ctx context.Context, projectID uuid.UUID) ([]*entities.Submission, error) {
	return uc.submissionRepo.GetByProjectID(ctx, projectID)
}

func (uc *SubmissionUseCase) GetSubmissionsByStudent(ctx context.Context, studentID uuid.UUID) ([]*entities.Submission, error) {
	return uc.submissionRepo.GetByStudentID(ctx, studentID)
}

func (uc *SubmissionUseCase) UpdateSubmission(ctx context.Context, submission *entities.Submission) error {
	existing, err := uc.submissionRepo.GetByID(ctx, submission.ID)
	if err != nil {
		return err
	}

	if existing == nil {
		return errors.ErrSubmissionNotFound
	}

	if existing.Status == entities.SubmissionStatusEvaluada {
		return errors.ErrSubmissionNotAllowed
	}

	if !submission.Status.IsValid() {
		return errors.ErrInvalidSubmissionStatus
	}

	return uc.submissionRepo.Update(ctx, submission)
}

func (uc *SubmissionUseCase) DeleteSubmission(ctx context.Context, id uuid.UUID) error {
	existing, err := uc.submissionRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if existing == nil {
		return errors.ErrSubmissionNotFound
	}

	if existing.Status == entities.SubmissionStatusEvaluada {
		return errors.ErrSubmissionNotAllowed
	}

	return uc.submissionRepo.Delete(ctx, id)
}

func (uc *SubmissionUseCase) GetPendingEvaluations(ctx context.Context) ([]*entities.Submission, error) {
	return uc.submissionRepo.GetPendingEvaluations(ctx)
}

func (uc *SubmissionUseCase) MarkAsEvaluating(ctx context.Context, id uuid.UUID) error {
	submission, err := uc.submissionRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if submission == nil {
		return errors.ErrSubmissionNotFound
	}

	if !submission.CanBeEvaluated() {
		return errors.ErrSubmissionNotAllowed
	}

	submission.Status = entities.SubmissionStatusEnEvaluacion
	return uc.submissionRepo.Update(ctx, submission)
}
