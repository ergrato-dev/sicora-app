package repositories

import (
	"context"

	"evalinservice/internal/domain/entities"
	"github.com/google/uuid"
)

type NotificationRepository interface {
	Create(ctx context.Context, notification *entities.Notification) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Notification, error)
	GetByRecipient(ctx context.Context, recipient uuid.UUID) ([]*entities.Notification, error)
	GetByType(ctx context.Context, notificationType string) ([]*entities.Notification, error)
	GetByEntityID(ctx context.Context, entityType string, entityID uuid.UUID) ([]*entities.Notification, error)
	GetUnreadByRecipient(ctx context.Context, recipient uuid.UUID) ([]*entities.Notification, error)
	GetUnsentNotifications(ctx context.Context) ([]*entities.Notification, error)
	Update(ctx context.Context, notification *entities.Notification) error
	Delete(ctx context.Context, id uuid.UUID) error
	MarkAsRead(ctx context.Context, id uuid.UUID) error
	MarkAsSent(ctx context.Context, id uuid.UUID) error
	CountUnreadByRecipient(ctx context.Context, recipient uuid.UUID) (int64, error)
	GetRecentNotificationsByRecipient(ctx context.Context, recipient uuid.UUID, limit int) ([]*entities.Notification, error)
	BulkMarkAsRead(ctx context.Context, ids []uuid.UUID) error
}
