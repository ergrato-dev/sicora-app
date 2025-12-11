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
		req.Category,
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

	if req.Name != "" {
		questionnaire.UpdateName(req.Name)
	}

	if req.Description != "" {
		questionnaire.UpdateDescription(req.Description)
	}

	if req.Category != "" {
		questionnaire.UpdateCategory(req.Category)
	}

	questionnaire.SetActive(req.IsActive)

	if err := uc.questionnaireRepo.Update(ctx, questionnaire); err != nil {
		return nil, fmt.Errorf("failed to update questionnaire: %w", err)
	}

	return uc.mapToQuestionnaireDTO(questionnaire), nil
}

func (uc *QuestionnaireUseCase) DeleteQuestionnaire(ctx context.Context, id uuid.UUID) error {
	inUse, err := uc.questionnaireRepo.IsQuestionnaireInUse(ctx, id)
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

func (uc *QuestionnaireUseCase) AddQuestionToQuestionnaire(ctx context.Context, questionnaireID, questionID uuid.UUID, order int) error {
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

	if err := questionnaire.AddQuestion(questionID, order); err != nil {
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
	questionnaires, err := uc.questionnaireRepo.GetActive(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active questionnaires: %w", err)
	}

	responses := make([]*dtos.QuestionnaireDTO, len(questionnaires))
	for i, questionnaire := range questionnaires {
		responses[i] = uc.mapToQuestionnaireDTO(questionnaire)
	}

	return responses, nil
}

func (uc *QuestionnaireUseCase) GetQuestionnairesByCategory(ctx context.Context, category string) ([]*dtos.QuestionnaireDTO, error) {
	questionnaires, err := uc.questionnaireRepo.GetByCategory(ctx, category)
	if err != nil {
		return nil, fmt.Errorf("failed to get questionnaires by category: %w", err)
	}

	responses := make([]*dtos.QuestionnaireDTO, len(questionnaires))
	for i, questionnaire := range questionnaires {
		responses[i] = uc.mapToQuestionnaireDTO(questionnaire)
	}

	return responses, nil
}

func (uc *QuestionnaireUseCase) GetQuestionnaireWithQuestions(ctx context.Context, id uuid.UUID) (*dtos.QuestionnaireWithQuestionsDTO, error) {
	questionnaire, err := uc.questionnaireRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("questionnaire not found: %w", err)
	}

	questions := make([]*dtos.QuestionDTO, 0)
	for _, questionOrder := range questionnaire.Questions {
		question, err := uc.questionRepo.GetByID(ctx, questionOrder.QuestionID)
		if err != nil {
			continue
		}

		questionDTO := &dtos.QuestionDTO{
			ID:          question.ID,
			Text:        question.Text,
			Description: question.Description,
			Type:        string(question.Type),
			IsRequired:  question.IsRequired,
			IsActive:    question.IsActive,
			Options:     question.Options,
			Category:    question.Category,
			CreatedAt:   question.CreatedAt,
			UpdatedAt:   question.UpdatedAt,
			Order:       questionOrder.Order,
		}
		questions = append(questions, questionDTO)
	}

	return &dtos.QuestionnaireWithQuestionsDTO{
		ID:          questionnaire.ID,
		Name:        questionnaire.Name,
		Description: questionnaire.Description,
		Category:    questionnaire.Category,
		IsActive:    questionnaire.IsActive,
		CreatedAt:   questionnaire.CreatedAt,
		UpdatedAt:   questionnaire.UpdatedAt,
		Questions:   questions,
	}, nil
}

func (uc *QuestionnaireUseCase) mapToQuestionnaireDTO(questionnaire *entities.Questionnaire) *dtos.QuestionnaireDTO {
	return &dtos.QuestionnaireDTO{
		ID:            questionnaire.ID,
		Name:          questionnaire.Name,
		Description:   questionnaire.Description,
		Category:      questionnaire.Category,
		IsActive:      questionnaire.IsActive,
		QuestionCount: len(questionnaire.Questions),
		CreatedAt:     questionnaire.CreatedAt,
		UpdatedAt:     questionnaire.UpdatedAt,
	}
}
