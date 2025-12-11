package repositories

import (
	"context"

	"evalinservice/internal/domain/entities"
	"github.com/google/uuid"
)

type ConfigurationRepository interface {
	Create(ctx context.Context, config *entities.Configuration) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Configuration, error)
	GetByKey(ctx context.Context, key string) (*entities.Configuration, error)
	GetByCategory(ctx context.Context, category string) ([]*entities.Configuration, error)
	GetAll(ctx context.Context) ([]*entities.Configuration, error)
	GetActiveConfigurations(ctx context.Context) ([]*entities.Configuration, error)
	GetEditableConfigurations(ctx context.Context) ([]*entities.Configuration, error)
	Update(ctx context.Context, config *entities.Configuration) error
	Delete(ctx context.Context, id uuid.UUID) error
	BulkUpdate(ctx context.Context, configs []*entities.Configuration) error
	GetValueByKey(ctx context.Context, key string) (string, error)
	SetValueByKey(ctx context.Context, key, value string, updatedBy uuid.UUID) error
}
