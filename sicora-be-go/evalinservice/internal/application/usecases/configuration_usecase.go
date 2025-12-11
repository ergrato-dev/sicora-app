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

type ConfigurationUseCase struct {
	configRepo repositories.ConfigurationRepository
}

func NewConfigurationUseCase(configRepo repositories.ConfigurationRepository) *ConfigurationUseCase {
	return &ConfigurationUseCase{
		configRepo: configRepo,
	}
}

func (uc *ConfigurationUseCase) CreateConfiguration(ctx context.Context, req *dtos.ConfigurationCreateRequest, createdBy uuid.UUID) (*dtos.ConfigurationResponse, error) {
	config := entities.NewConfiguration(
		req.Key,
		req.Value,
		req.Description,
		req.Category,
		createdBy,
	)

	if !config.IsValid() {
		return nil, exceptions.NewValidationError("configuration", "invalid configuration data")
	}

	if err := uc.configRepo.Create(ctx, config); err != nil {
		return nil, fmt.Errorf("failed to create configuration: %w", err)
	}

	return uc.mapToConfigurationResponse(config), nil
}

func (uc *ConfigurationUseCase) GetConfigurationByID(ctx context.Context, id uuid.UUID) (*dtos.ConfigurationResponse, error) {
	config, err := uc.configRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("configuration not found: %w", err)
	}

	return uc.mapToConfigurationResponse(config), nil
}

func (uc *ConfigurationUseCase) GetConfigurationByKey(ctx context.Context, key string) (*dtos.ConfigurationResponse, error) {
	config, err := uc.configRepo.GetByKey(ctx, key)
	if err != nil {
		return nil, fmt.Errorf("configuration not found: %w", err)
	}

	return uc.mapToConfigurationResponse(config), nil
}

func (uc *ConfigurationUseCase) UpdateConfiguration(ctx context.Context, id uuid.UUID, req *dtos.ConfigurationUpdateRequest, updatedBy uuid.UUID) (*dtos.ConfigurationResponse, error) {
	config, err := uc.configRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("configuration not found: %w", err)
	}

	config.UpdateValue(req.Value, updatedBy)
	config.SetActive(req.IsActive, updatedBy)

	if err := uc.configRepo.Update(ctx, config); err != nil {
		return nil, fmt.Errorf("failed to update configuration: %w", err)
	}

	return uc.mapToConfigurationResponse(config), nil
}

func (uc *ConfigurationUseCase) DeleteConfiguration(ctx context.Context, id uuid.UUID) error {
	config, err := uc.configRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("configuration not found: %w", err)
	}

	if !config.IsEditable {
		return exceptions.NewValidationError("configuration", "configuration is not editable and cannot be deleted")
	}

	if err := uc.configRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete configuration: %w", err)
	}

	return nil
}

func (uc *ConfigurationUseCase) GetConfigurationsByCategory(ctx context.Context, category string) ([]*dtos.ConfigurationResponse, error) {
	configs, err := uc.configRepo.GetByCategory(ctx, category)
	if err != nil {
		return nil, fmt.Errorf("failed to get configurations: %w", err)
	}

	responses := make([]*dtos.ConfigurationResponse, len(configs))
	for i, config := range configs {
		responses[i] = uc.mapToConfigurationResponse(config)
	}

	return responses, nil
}

func (uc *ConfigurationUseCase) GetAllConfigurations(ctx context.Context) ([]*dtos.ConfigurationResponse, error) {
	configs, err := uc.configRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get configurations: %w", err)
	}

	responses := make([]*dtos.ConfigurationResponse, len(configs))
	for i, config := range configs {
		responses[i] = uc.mapToConfigurationResponse(config)
	}

	return responses, nil
}

func (uc *ConfigurationUseCase) GetActiveConfigurations(ctx context.Context) ([]*dtos.ConfigurationResponse, error) {
	configs, err := uc.configRepo.GetActiveConfigurations(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active configurations: %w", err)
	}

	responses := make([]*dtos.ConfigurationResponse, len(configs))
	for i, config := range configs {
		responses[i] = uc.mapToConfigurationResponse(config)
	}

	return responses, nil
}

func (uc *ConfigurationUseCase) BulkUpdateConfigurations(ctx context.Context, req *dtos.ConfigurationBulkUpdateRequest, updatedBy uuid.UUID) error {
	for _, configItem := range req.Configurations {
		if err := uc.configRepo.SetValueByKey(ctx, configItem.Key, configItem.Value, updatedBy); err != nil {
			return fmt.Errorf("failed to update configuration %s: %w", configItem.Key, err)
		}
	}

	return nil
}

func (uc *ConfigurationUseCase) GetValueByKey(ctx context.Context, key string) (string, error) {
	value, err := uc.configRepo.GetValueByKey(ctx, key)
	if err != nil {
		return "", fmt.Errorf("configuration value not found: %w", err)
	}

	return value, nil
}

func (uc *ConfigurationUseCase) mapToConfigurationResponse(config *entities.Configuration) *dtos.ConfigurationResponse {
	return &dtos.ConfigurationResponse{
		ID:          config.ID,
		Key:         config.Key,
		Value:       config.Value,
		Description: config.Description,
		Category:    config.Category,
		IsActive:    config.IsActive,
		IsEditable:  config.IsEditable,
		CreatedBy:   config.CreatedBy,
		UpdatedBy:   config.UpdatedBy,
		CreatedAt:   config.CreatedAt,
		UpdatedAt:   config.UpdatedAt,
	}
}
