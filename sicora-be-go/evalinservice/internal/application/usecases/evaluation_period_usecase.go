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

type EvaluationPeriodUseCase struct {
	periodRepo repositories.EvaluationPeriodRepository
}

func NewEvaluationPeriodUseCase(periodRepo repositories.EvaluationPeriodRepository) *EvaluationPeriodUseCase {
	return &EvaluationPeriodUseCase{
		periodRepo: periodRepo,
	}
}

func (uc *EvaluationPeriodUseCase) CreatePeriod(ctx context.Context, req *dtos.EvaluationPeriodCreateDTO) (*dtos.EvaluationPeriodResponseDTO, error) {
	period, err := entities.NewEvaluationPeriod(
		req.Name,
		req.Description,
		req.StartDate,
		req.EndDate,
		req.QuestionnaireID,
		req.FichaID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create evaluation period: %w", err)
	}

	if err := uc.periodRepo.Create(ctx, period); err != nil {
		return nil, fmt.Errorf("failed to save evaluation period: %w", err)
	}

	return uc.mapToPeriodResponse(period), nil
}

func (uc *EvaluationPeriodUseCase) GetPeriodByID(ctx context.Context, id uuid.UUID) (*dtos.EvaluationPeriodResponseDTO, error) {
	period, err := uc.periodRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("evaluation period not found: %w", err)
	}

	return uc.mapToPeriodResponse(period), nil
}

func (uc *EvaluationPeriodUseCase) UpdatePeriod(ctx context.Context, id uuid.UUID, req *dtos.EvaluationPeriodUpdateDTO) (*dtos.EvaluationPeriodResponseDTO, error) {
	period, err := uc.periodRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("evaluation period not found: %w", err)
	}

	if req.Name != nil {
		period.UpdateName(*req.Name)
	}

	if req.Description != nil {
		period.UpdateDescription(*req.Description)
	}

	if req.StartDate != nil {
		period.UpdateStartDate(*req.StartDate)
	}

	if req.EndDate != nil {
		period.UpdateEndDate(*req.EndDate)
	}

	if err := uc.periodRepo.Update(ctx, period); err != nil {
		return nil, fmt.Errorf("failed to update evaluation period: %w", err)
	}

	return uc.mapToPeriodResponse(period), nil
}

func (uc *EvaluationPeriodUseCase) DeletePeriod(ctx context.Context, id uuid.UUID) error {
	period, err := uc.periodRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("evaluation period not found: %w", err)
	}

	if period.Status == valueobjects.PeriodStatusActivo {
		return exceptions.NewValidationError("status", "cannot delete active period")
	}

	if err := uc.periodRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete evaluation period: %w", err)
	}

	return nil
}

func (uc *EvaluationPeriodUseCase) ActivatePeriod(ctx context.Context, id uuid.UUID) (*dtos.EvaluationPeriodResponseDTO, error) {
	period, err := uc.periodRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("evaluation period not found: %w", err)
	}

	if err := period.Activate(); err != nil {
		return nil, fmt.Errorf("failed to activate period: %w", err)
	}

	if err := uc.periodRepo.Update(ctx, period); err != nil {
		return nil, fmt.Errorf("failed to update evaluation period: %w", err)
	}

	return uc.mapToPeriodResponse(period), nil
}

func (uc *EvaluationPeriodUseCase) ClosePeriod(ctx context.Context, id uuid.UUID) (*dtos.EvaluationPeriodResponseDTO, error) {
	period, err := uc.periodRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("evaluation period not found: %w", err)
	}

	if err := period.Close(); err != nil {
		return nil, fmt.Errorf("failed to close period: %w", err)
	}

	if err := uc.periodRepo.Update(ctx, period); err != nil {
		return nil, fmt.Errorf("failed to update evaluation period: %w", err)
	}

	return uc.mapToPeriodResponse(period), nil
}

func (uc *EvaluationPeriodUseCase) GetActivePeriods(ctx context.Context) ([]*dtos.EvaluationPeriodResponseDTO, error) {
	periods, err := uc.periodRepo.GetByStatus(ctx, valueobjects.PeriodStatusActivo)
	if err != nil {
		return nil, fmt.Errorf("failed to get active periods: %w", err)
	}

	responses := make([]*dtos.EvaluationPeriodResponseDTO, len(periods))
	for i, period := range periods {
		responses[i] = uc.mapToPeriodResponse(period)
	}

	return responses, nil
}

func (uc *EvaluationPeriodUseCase) GetPeriodsByFicha(ctx context.Context, fichaID string) ([]*dtos.EvaluationPeriodResponseDTO, error) {
	fichaUUID, err := uuid.Parse(fichaID)
	if err != nil {
		return nil, fmt.Errorf("invalid ficha ID: %w", err)
	}

	periods, err := uc.periodRepo.GetByFichaID(ctx, fichaUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get periods by ficha: %w", err)
	}

	responses := make([]*dtos.EvaluationPeriodResponseDTO, len(periods))
	for i, period := range periods {
		responses[i] = uc.mapToPeriodResponse(period)
	}

	return responses, nil
}

func (uc *EvaluationPeriodUseCase) GetCurrentPeriods(ctx context.Context) ([]*dtos.EvaluationPeriodResponseDTO, error) {
	periods, err := uc.periodRepo.GetCurrentPeriods(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get current periods: %w", err)
	}

	responses := make([]*dtos.EvaluationPeriodResponseDTO, len(periods))
	for i, period := range periods {
		responses[i] = uc.mapToPeriodResponse(period)
	}

	return responses, nil
}

func (uc *EvaluationPeriodUseCase) mapToPeriodResponse(period *entities.EvaluationPeriod) *dtos.EvaluationPeriodResponseDTO {
	return &dtos.EvaluationPeriodResponseDTO{
		ID:          period.ID,
		Name:        period.Name,
		Description: period.Description,
		Status:      period.Status,
		StartDate:   period.StartDate,
		EndDate:     period.EndDate,
		FichaID:     period.FichaID,
		CreatedAt:   period.CreatedAt,
		UpdatedAt:   period.UpdatedAt,
	}
}
