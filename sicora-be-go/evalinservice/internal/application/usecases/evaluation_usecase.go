package usecases

import (
	"context"
	"fmt"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/exceptions"
	"evalinservice/internal/domain/repositories"
	"evalinservice/internal/domain/valueobjects"
	"github.com/google/uuid"
)

const (
	ErrEvaluationNotFound = "evaluation not found: %w"
)

type EvaluationUseCase struct {
	evaluationRepo      repositories.EvaluationRepository
	questionnaireRepo   repositories.QuestionnaireRepository
	periodRepo          repositories.EvaluationPeriodRepository
	notificationUseCase *NotificationUseCase
}

func NewEvaluationUseCase(
	evaluationRepo repositories.EvaluationRepository,
	questionnaireRepo repositories.QuestionnaireRepository,
	periodRepo repositories.EvaluationPeriodRepository,
	notificationUseCase *NotificationUseCase,
) *EvaluationUseCase {
	return &EvaluationUseCase{
		evaluationRepo:      evaluationRepo,
		questionnaireRepo:   questionnaireRepo,
		periodRepo:          periodRepo,
		notificationUseCase: notificationUseCase,
	}
}

func (uc *EvaluationUseCase) CreateEvaluation(ctx context.Context, req *dtos.EvaluationCreateRequest) (*dtos.EvaluationResponse, error) {
	period, err := uc.periodRepo.GetByID(ctx, req.PeriodID)
	if err != nil {
		return nil, fmt.Errorf(ErrEvaluationNotFound, err)
	}

	if period.Status != valueobjects.PeriodStatusActive {
		return nil, exceptions.NewValidationError("period", "period is not active")
	}

	questionnaire, err := uc.questionnaireRepo.GetByID(ctx, req.QuestionnaireID)
	if err != nil {
		return nil, fmt.Errorf("questionnaire not found: %w", err)
	}

	if !questionnaire.IsActive {
		return nil, exceptions.NewValidationError("questionnaire", "questionnaire is not active")
	}

	evaluation, err := entities.NewEvaluation(req.StudentID, req.InstructorID, req.PeriodID, req.QuestionnaireID)
	if err != nil {
		return nil, fmt.Errorf("failed to create evaluation: %w", err)
	}

	if err := uc.evaluationRepo.Create(ctx, evaluation); err != nil {
		return nil, fmt.Errorf("failed to save evaluation: %w", err)
	}

	go uc.notificationUseCase.SendEvaluationNotification(context.Background(), evaluation.ID, "evaluation_created")

	return uc.mapToEvaluationResponse(evaluation), nil
}

func (uc *EvaluationUseCase) GetEvaluationByID(ctx context.Context, id uuid.UUID) (*dtos.EvaluationResponse, error) {
	evaluation, err := uc.evaluationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("evaluation not found: %w", err)
	}

	return uc.mapToEvaluationResponse(evaluation), nil
}

func (uc *EvaluationUseCase) UpdateEvaluation(ctx context.Context, id uuid.UUID, req *dtos.EvaluationUpdateRequest) (*dtos.EvaluationResponse, error) {
	evaluation, err := uc.evaluationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf(ErrEvaluationNotFound, err)
	}

	if evaluation.Status == valueobjects.EvaluationStatusSubmitted || evaluation.Status == valueobjects.EvaluationStatusValidated {
		return nil, exceptions.NewValidationError("status", "cannot update completed evaluation")
	}

	if req.Status != "" {
		status := valueobjects.EvaluationStatus(req.Status)
		if !status.IsValid() {
			return nil, exceptions.NewValidationError("status", "invalid status")
		}

		if status == valueobjects.EvaluationStatusSubmitted {
			if err := evaluation.Submit(); err != nil {
				return nil, fmt.Errorf("failed to submit evaluation: %w", err)
			}
		} else if status == valueobjects.EvaluationStatusValidated {
			if err := evaluation.Validate(); err != nil {
				return nil, fmt.Errorf("failed to validate evaluation: %w", err)
			}
		}
	}

	if err := uc.evaluationRepo.Update(ctx, evaluation); err != nil {
		return nil, fmt.Errorf("failed to update evaluation: %w", err)
	}

	if evaluation.Status == valueobjects.EvaluationStatusSubmitted {
		go uc.notificationUseCase.SendEvaluationNotification(context.Background(), evaluation.ID, "evaluation_completed")
	}

	return uc.mapToEvaluationResponse(evaluation), nil
}

func (uc *EvaluationUseCase) DeleteEvaluation(ctx context.Context, id uuid.UUID) error {
	evaluation, err := uc.evaluationRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf(ErrEvaluationNotFound, err)
	}

	if evaluation.Status == valueobjects.EvaluationStatusSubmitted || evaluation.Status == valueobjects.EvaluationStatusValidated {
		return exceptions.NewValidationError("status", "cannot delete completed evaluation")
	}

	if err := uc.evaluationRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete evaluation: %w", err)
	}

	return nil
}

func (uc *EvaluationUseCase) GetEvaluationsByPeriod(ctx context.Context, periodID uuid.UUID) ([]*dtos.EvaluationResponse, error) {
	evaluations, err := uc.evaluationRepo.GetEvaluationsByPeriod(ctx, periodID)
	if err != nil {
		return nil, fmt.Errorf("failed to get evaluations: %w", err)
	}

	responses := make([]*dtos.EvaluationResponse, len(evaluations))
	for i, eval := range evaluations {
		responses[i] = uc.mapToEvaluationResponse(eval)
	}

	return responses, nil
}

func (uc *EvaluationUseCase) GetEvaluationsByInstructor(ctx context.Context, instructorID uuid.UUID) ([]*dtos.EvaluationResponse, error) {
	evaluations, err := uc.evaluationRepo.GetByInstructor(ctx, instructorID)
	if err != nil {
		return nil, fmt.Errorf("failed to get evaluations: %w", err)
	}

	responses := make([]*dtos.EvaluationResponse, len(evaluations))
	for i, eval := range evaluations {
		responses[i] = uc.mapToEvaluationResponse(eval)
	}

	return responses, nil
}

func (uc *EvaluationUseCase) mapToEvaluationResponse(eval *entities.Evaluation) *dtos.EvaluationResponse {
	// Convertir responses de []EvaluationResponse a map[string]interface{}
	responsesMap := make(map[string]interface{})
	for _, response := range eval.Responses {
		responsesMap[response.QuestionID.String()] = map[string]interface{}{
			"value":   response.ResponseValue,
			"comment": response.Comment,
		}
	}

	return &dtos.EvaluationResponse{
		ID:              eval.ID,
		InstructorID:    eval.InstructorID,
		StudentID:       eval.StudentID,
		PeriodID:        eval.PeriodID,
		QuestionnaireID: eval.QuestionnaireID,
		Responses:       responsesMap,
		Status:          eval.Status.String(),
		CompletedAt:     eval.SubmittedAt,
		CreatedAt:       eval.CreatedAt,
		UpdatedAt:       eval.UpdatedAt,
	}
}
