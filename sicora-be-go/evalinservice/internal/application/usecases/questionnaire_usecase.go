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

type QuestionnaireUseCase struct {
	questionnaireRepo repositories.QuestionnaireRepository
	questionRepo      repositories.QuestionRepository
}

func NewQuestionnaireUseCase(
	questionnaireRepo repositories.QuestionnaireRepository,
	questionRepo repositories.QuestionRepository,
) *QuestionnaireUseCase {
	return &QuestionnaireUseCase{
		questionnaireRepo: questionnaireRepo,
		questionRepo:      questionRepo,
	}
}

func (uc *QuestionnaireUseCase) CreateQuestionnaire(ctx context.Context, req *dtos.QuestionnaireCreateDTO) (*dtos.QuestionnaireDTO, error) {
	questionnaire, err := entities.NewQuestionnaire(
		req.Name,
		req.Description,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create questionnaire: %w", err)
	}

	if err := uc.questionnaireRepo.Create(ctx, questionnaire); err != nil {
		return nil, fmt.Errorf("failed to save questionnaire: %w", err)
	}

	return uc.mapToQuestionnaireDTO(questionnaire), nil
}

func (uc *QuestionnaireUseCase) GetQuestionnaireByID(ctx context.Context, id uuid.UUID) (*dtos.QuestionnaireDTO, error) {
	questionnaire, err := uc.questionnaireRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("questionnaire not found: %w", err)
	}

	return uc.mapToQuestionnaireDTO(questionnaire), nil
}

func (uc *QuestionnaireUseCase) UpdateQuestionnaire(ctx context.Context, id uuid.UUID, req *dtos.QuestionnaireUpdateDTO) (*dtos.QuestionnaireDTO, error) {
	questionnaire, err := uc.questionnaireRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("questionnaire not found: %w", err)
	}

	if req.Name != nil && *req.Name != "" {
		if err := questionnaire.UpdateName(*req.Name); err != nil {
			return nil, fmt.Errorf("failed to update name: %w", err)
		}
	}

	if req.Description != nil {
		if err := questionnaire.UpdateDescription(*req.Description); err != nil {
			return nil, fmt.Errorf("failed to update description: %w", err)
		}
	}

	if req.IsActive != nil {
		questionnaire.IsActive = *req.IsActive
	}

	if err := uc.questionnaireRepo.Update(ctx, questionnaire); err != nil {
		return nil, fmt.Errorf("failed to update questionnaire: %w", err)
	}

	return uc.mapToQuestionnaireDTO(questionnaire), nil
}

func (uc *QuestionnaireUseCase) DeleteQuestionnaire(ctx context.Context, id uuid.UUID) error {
	inUse, err := uc.questionnaireRepo.IsInUse(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check if questionnaire is in use: %w", err)
	}

	if inUse {
		return exceptions.NewValidationError("questionnaire", "questionnaire is being used and cannot be deleted")
	}

	if err := uc.questionnaireRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete questionnaire: %w", err)
	}

	return nil
}

func (uc *QuestionnaireUseCase) AddQuestionToQuestionnaire(ctx context.Context, questionnaireID, questionID uuid.UUID) error {
	questionnaire, err := uc.questionnaireRepo.GetByID(ctx, questionnaireID)
	if err != nil {
		return fmt.Errorf("questionnaire not found: %w", err)
	}

	question, err := uc.questionRepo.GetByID(ctx, questionID)
	if err != nil {
		return fmt.Errorf("question not found: %w", err)
	}

	if !question.IsActive {
		return exceptions.NewValidationError("question", "cannot add inactive question to questionnaire")
	}

	if err := questionnaire.AddQuestion(questionID); err != nil {
		return fmt.Errorf("failed to add question to questionnaire: %w", err)
	}

	if err := uc.questionnaireRepo.Update(ctx, questionnaire); err != nil {
		return fmt.Errorf("failed to update questionnaire: %w", err)
	}

	return nil
}

func (uc *QuestionnaireUseCase) RemoveQuestionFromQuestionnaire(ctx context.Context, questionnaireID, questionID uuid.UUID) error {
	questionnaire, err := uc.questionnaireRepo.GetByID(ctx, questionnaireID)
	if err != nil {
		return fmt.Errorf("questionnaire not found: %w", err)
	}

	if err := questionnaire.RemoveQuestion(questionID); err != nil {
		return fmt.Errorf("failed to remove question from questionnaire: %w", err)
	}

	if err := uc.questionnaireRepo.Update(ctx, questionnaire); err != nil {
		return fmt.Errorf("failed to update questionnaire: %w", err)
	}

	return nil
}

func (uc *QuestionnaireUseCase) GetActiveQuestionnaires(ctx context.Context) ([]*dtos.QuestionnaireDTO, error) {
	questionnaires, err := uc.questionnaireRepo.GetActiveQuestionnaires(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active questionnaires: %w", err)
	}

	responses := make([]*dtos.QuestionnaireDTO, len(questionnaires))
	for i, questionnaire := range questionnaires {
		responses[i] = uc.mapToQuestionnaireDTO(questionnaire)
	}

	return responses, nil
}

func (uc *QuestionnaireUseCase) GetQuestionnaireWithQuestions(ctx context.Context, id uuid.UUID) (*dtos.QuestionnaireWithQuestionsDTO, error) {
	questionnaire, questions, err := uc.questionnaireRepo.GetQuestionnaireWithQuestions(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("questionnaire not found: %w", err)
	}

	questionDTOs := make([]dtos.QuestionResponseDTO, 0, len(questions))
	for _, question := range questions {
		questionDTOs = append(questionDTOs, dtos.QuestionResponseDTO{
			ID:          question.ID,
			Text:        question.Text,
			Description: question.Description,
			Type:        question.Type,
		})
	}

	return &dtos.QuestionnaireWithQuestionsDTO{
		Questionnaire: dtos.QuestionnaireResponseDTO{
			ID:            questionnaire.ID,
			Name:          questionnaire.Name,
			Description:   questionnaire.Description,
			IsActive:      questionnaire.IsActive,
			QuestionCount: len(questionnaire.QuestionIDs),
			CreatedAt:     questionnaire.CreatedAt,
			UpdatedAt:     questionnaire.UpdatedAt,
		},
		Questions: questionDTOs,
	}, nil
}

func (uc *QuestionnaireUseCase) mapToQuestionnaireDTO(questionnaire *entities.Questionnaire) *dtos.QuestionnaireDTO {
	return &dtos.QuestionnaireDTO{
		ID:            questionnaire.ID,
		Name:          questionnaire.Name,
		Description:   questionnaire.Description,
		IsActive:      questionnaire.IsActive,
		QuestionCount: len(questionnaire.QuestionIDs),
		CreatedAt:     questionnaire.CreatedAt,
		UpdatedAt:     questionnaire.UpdatedAt,
	}
}
