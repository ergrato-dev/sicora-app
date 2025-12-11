package repositories

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/repositories"
	"evalinservice/internal/infrastructure/database/mappers"
	"evalinservice/internal/infrastructure/database/models"
)

type configurationRepositoryImpl struct {
	db     *gorm.DB
	mapper *mappers.ConfigurationMapper
}

func NewConfigurationRepository(db *gorm.DB) repositories.ConfigurationRepository {
	return &configurationRepositoryImpl{
		db:     db,
		mapper: mappers.NewConfigurationMapper(),
	}
}

func (r *configurationRepositoryImpl) Create(ctx context.Context, config *entities.Configuration) error {
	model := r.mapper.ToModel(config)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create configuration: %w", err)
	}
	return nil
}

func (r *configurationRepositoryImpl) GetByKey(ctx context.Context, key string) (*entities.Configuration, error) {
	var model models.Configuration
	if err := r.db.WithContext(ctx).Where("key = ?", key).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get configuration by key: %w", err)
	}
	return r.mapper.ToEntity(&model), nil
}

func (r *configurationRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Configuration, error) {
	var configs []models.Configuration
	if err := r.db.WithContext(ctx).Find(&configs).Error; err != nil {
		return nil, fmt.Errorf("failed to get all configurations: %w", err)
	}

	result := make([]*entities.Configuration, len(configs))
	for i, model := range configs {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *configurationRepositoryImpl) Update(ctx context.Context, config *entities.Configuration) error {
	model := r.mapper.ToModel(config)
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update configuration: %w", err)
	}
	return nil
}

func (r *configurationRepositoryImpl) Delete(ctx context.Context, key string) error {
	if err := r.db.WithContext(ctx).Where("key = ?", key).Delete(&models.Configuration{}).Error; err != nil {
		return fmt.Errorf("failed to delete configuration: %w", err)
	}
	return nil
}

func (r *configurationRepositoryImpl) GetByCategory(ctx context.Context, category string) ([]*entities.Configuration, error) {
	var configs []models.Configuration
	if err := r.db.WithContext(ctx).Where("category = ?", category).Find(&configs).Error; err != nil {
		return nil, fmt.Errorf("failed to get configurations by category: %w", err)
	}

	result := make([]*entities.Configuration, len(configs))
	for i, model := range configs {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *configurationRepositoryImpl) SetValue(ctx context.Context, key, value string) error {
	if err := r.db.WithContext(ctx).Model(&models.Configuration{}).
		Where("key = ?", key).Update("value", value).Error; err != nil {
		return fmt.Errorf("failed to set configuration value: %w", err)
	}
	return nil
}

func (r *configurationRepositoryImpl) GetValue(ctx context.Context, key string) (string, error) {
	var value string
	if err := r.db.WithContext(ctx).Model(&models.Configuration{}).
		Select("value").Where("key = ?", key).Scan(&value).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", fmt.Errorf("failed to get configuration value: %w", err)
	}
	return value, nil
}

func (r *configurationRepositoryImpl) Exists(ctx context.Context, key string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.Configuration{}).
		Where("key = ?", key).Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check configuration existence: %w", err)
	}
	return count > 0, nil
}

func (r *configurationRepositoryImpl) BulkUpdate(ctx context.Context, configs []*entities.Configuration) error {
	if len(configs) == 0 {
		return nil
	}

	for _, config := range configs {
		model := r.mapper.ToModel(config)
		if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
			return fmt.Errorf("failed to bulk update configuration: %w", err)
		}
	}
	return nil
}
