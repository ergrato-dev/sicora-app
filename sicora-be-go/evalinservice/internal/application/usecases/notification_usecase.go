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

type NotificationUseCase struct {
	notificationRepo repositories.NotificationRepository
}

func NewNotificationUseCase(notificationRepo repositories.NotificationRepository) *NotificationUseCase {
	return &NotificationUseCase{
		notificationRepo: notificationRepo,
	}
}

func (uc *NotificationUseCase) CreateNotification(ctx context.Context, req *dtos.NotificationCreateRequest) (*dtos.NotificationResponse, error) {
	notification := entities.NewNotification(
		req.Type,
		req.Title,
		req.Message,
		req.Recipient,
		req.EntityType,
		req.EntityID,
		req.Metadata,
	)

	if !notification.IsValid() {
		return nil, exceptions.NewValidationError("notification", "invalid notification data")
	}

	if err := uc.notificationRepo.Create(ctx, notification); err != nil {
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}

	return uc.mapToNotificationResponse(notification), nil
}

func (uc *NotificationUseCase) GetNotificationsByRecipient(ctx context.Context, recipient uuid.UUID, onlyUnread bool) ([]*dtos.NotificationResponse, error) {
	var notifications []*entities.Notification
	var err error

	if onlyUnread {
		notifications, err = uc.notificationRepo.GetUnreadByRecipient(ctx, recipient)
	} else {
		notifications, err = uc.notificationRepo.GetByRecipient(ctx, recipient)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}

	responses := make([]*dtos.NotificationResponse, len(notifications))
	for i, notification := range notifications {
		responses[i] = uc.mapToNotificationResponse(notification)
	}

	return responses, nil
}

func (uc *NotificationUseCase) MarkAsRead(ctx context.Context, id uuid.UUID) error {
	if err := uc.notificationRepo.MarkAsRead(ctx, id); err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}
	return nil
}

func (uc *NotificationUseCase) SendEvaluationNotification(ctx context.Context, evaluationID uuid.UUID, notificationType string) error {
	return nil
}

func (uc *NotificationUseCase) mapToNotificationResponse(notification *entities.Notification) *dtos.NotificationResponse {
	return &dtos.NotificationResponse{
		ID:         notification.ID,
		Type:       notification.Type,
		Title:      notification.Title,
		Message:    notification.Message,
		Recipient:  notification.Recipient,
		EntityType: notification.EntityType,
		EntityID:   notification.EntityID,
		Metadata:   notification.Metadata,
		IsRead:     notification.IsRead,
		IsSent:     notification.IsSent,
		SentAt:     notification.SentAt,
		ReadAt:     notification.ReadAt,
		CreatedAt:  notification.CreatedAt,
		UpdatedAt:  notification.UpdatedAt,
	}
}
