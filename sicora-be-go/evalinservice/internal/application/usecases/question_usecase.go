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

type QuestionUseCase struct {
	questionRepo repositories.QuestionRepository
}

func NewQuestionUseCase(questionRepo repositories.QuestionRepository) *QuestionUseCase {
	return &QuestionUseCase{
		questionRepo: questionRepo,
	}
}

func (uc *QuestionUseCase) CreateQuestion(ctx context.Context, req *dtos.QuestionCreateRequest) (*dtos.QuestionResponse, error) {
	questionType := valueobjects.QuestionType(req.Type)
	if !questionType.IsValid() {
		return nil, exceptions.NewValidationError("type", "invalid question type")
	}

	question, err := entities.NewQuestion(
		req.Text,
		req.Description,
		questionType,
		req.Category,
		req.Options,
		req.IsRequired,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create question: %w", err)
	}

	if err := uc.questionRepo.Create(ctx, question); err != nil {
		return nil, fmt.Errorf("failed to save question: %w", err)
	}

	return uc.mapToQuestionResponse(question), nil
}

func (uc *QuestionUseCase) GetQuestionByID(ctx context.Context, id uuid.UUID) (*dtos.QuestionResponse, error) {
	question, err := uc.questionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("question not found: %w", err)
	}

	return uc.mapToQuestionResponse(question), nil
}

func (uc *QuestionUseCase) UpdateQuestion(ctx context.Context, id uuid.UUID, req *dtos.QuestionUpdateRequest) (*dtos.QuestionResponse, error) {
	question, err := uc.questionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("question not found: %w", err)
	}

	if req.Text != nil && *req.Text != "" {
		if err := question.UpdateText(*req.Text); err != nil {
			return nil, err
		}
	}

	if req.Description != nil && *req.Description != "" {
		question.UpdateDescription(*req.Description)
	}

	if req.Options != nil {
		if err := question.UpdateOptions(req.Options); err != nil {
			return nil, err
		}
	}

	if req.Category != nil && *req.Category != "" {
		if err := question.UpdateCategory(*req.Category); err != nil {
			return nil, err
		}
	}

	if req.IsRequired != nil {
		question.SetRequired(*req.IsRequired)
	}

	if req.IsActive != nil {
		if *req.IsActive {
			question.Activate()
		} else {
			question.Deactivate()
		}
	}

	if err := uc.questionRepo.Update(ctx, question); err != nil {
		return nil, fmt.Errorf("failed to update question: %w", err)
	}

	return uc.mapToQuestionResponse(question), nil
}

func (uc *QuestionUseCase) DeleteQuestion(ctx context.Context, id uuid.UUID) error {
	_, err := uc.questionRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("question not found: %w", err)
	}

	inUse, err := uc.questionRepo.IsInUse(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check if question is in use: %w", err)
	}

	if inUse {
		return exceptions.NewValidationError("question", "question is being used and cannot be deleted")
	}

	if err := uc.questionRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete question: %w", err)
	}

	return nil
}

func (uc *QuestionUseCase) GetQuestions(ctx context.Context, filter *dtos.QuestionFilterRequest) ([]*dtos.QuestionResponse, error) {
	filters := repositories.QuestionFilters{
		Category:   filter.Category,
		Type:       filter.Type,
		IsActive:   filter.IsActive,
		IsRequired: filter.IsRequired,
		Search:     filter.Search,
		Limit:      filter.PerPage,
		Offset:     (filter.Page - 1) * filter.PerPage,
		OrderBy:    filter.OrderBy,
		OrderDir:   filter.OrderDir,
	}

	questions, err := uc.questionRepo.GetAll(ctx, filters)
	if err != nil {
		return nil, fmt.Errorf("failed to get questions: %w", err)
	}

	responses := make([]*dtos.QuestionResponse, len(questions))
	for i, question := range questions {
		responses[i] = uc.mapToQuestionResponse(question)
	}

	return responses, nil
}

func (uc *QuestionUseCase) GetQuestionsByCategory(ctx context.Context, category string) ([]*dtos.QuestionResponse, error) {
	questions, err := uc.questionRepo.GetByCategory(ctx, category)
	if err != nil {
		return nil, fmt.Errorf("failed to get questions by category: %w", err)
	}

	responses := make([]*dtos.QuestionResponse, len(questions))
	for i, question := range questions {
		responses[i] = uc.mapToQuestionResponse(question)
	}

	return responses, nil
}

func (uc *QuestionUseCase) GetActiveQuestions(ctx context.Context) ([]*dtos.QuestionResponse, error) {
	questions, err := uc.questionRepo.GetActiveQuestions(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active questions: %w", err)
	}

	responses := make([]*dtos.QuestionResponse, len(questions))
	for i, question := range questions {
		responses[i] = uc.mapToQuestionResponse(question)
	}

	return responses, nil
}

func (uc *QuestionUseCase) BulkUpdateQuestions(ctx context.Context, req *dtos.QuestionBulkUpdateRequest) error {
	for _, update := range req.Updates {
		question, err := uc.questionRepo.GetByID(ctx, update.ID)
		if err != nil {
			continue
		}

		// Aplicar las actualizaciones según los datos del DTO
		if update.Data.Text != nil {
			if err := question.UpdateText(*update.Data.Text); err != nil {
				return fmt.Errorf("failed to update text for question %s: %w", update.ID, err)
			}
		}

		if update.Data.Description != nil {
			question.UpdateDescription(*update.Data.Description)
		}

		if update.Data.Category != nil {
			if err := question.UpdateCategory(*update.Data.Category); err != nil {
				return fmt.Errorf("failed to update category for question %s: %w", update.ID, err)
			}
		}

		if update.Data.Options != nil {
			if err := question.UpdateOptions(update.Data.Options); err != nil {
				return fmt.Errorf("failed to update options for question %s: %w", update.ID, err)
			}
		}

		if update.Data.IsRequired != nil {
			question.SetRequired(*update.Data.IsRequired)
		}

		if update.Data.IsActive != nil {
			if *update.Data.IsActive {
				question.Activate()
			} else {
				question.Deactivate()
			}
		}

		if update.Data.Order != nil {
			if err := question.SetOrder(*update.Data.Order); err != nil {
				return fmt.Errorf("failed to update order for question %s: %w", update.ID, err)
			}
		}

		if err := uc.questionRepo.Update(ctx, question); err != nil {
			return fmt.Errorf("failed to update question %s: %w", update.ID, err)
		}
	}

	return nil
}

func (uc *QuestionUseCase) mapToQuestionResponse(question *entities.Question) *dtos.QuestionResponse {
	return &dtos.QuestionResponse{
		ID:          question.ID,
		Text:        question.Text,
		Description: question.Description,
		Type:        question.Type,
		IsRequired:  question.IsRequired,
		IsActive:    question.IsActive,
		Options:     question.Options,
		Category:    question.Category,
		Order:       question.Order,
		CreatedAt:   question.CreatedAt,
		UpdatedAt:   question.UpdatedAt,
	}
}
