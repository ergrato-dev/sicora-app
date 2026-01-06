package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/repositories"
	"evalinservice/internal/infrastructure/database/mappers"
	"evalinservice/internal/infrastructure/database/models"
)

type notificationRepositoryImpl struct {
	db     *gorm.DB
	mapper *mappers.NotificationMapper
}

func NewNotificationRepository(db *gorm.DB) repositories.NotificationRepository {
	return &notificationRepositoryImpl{
		db:     db,
		mapper: mappers.NewNotificationMapper(),
	}
}

func (r *notificationRepositoryImpl) Create(ctx context.Context, notification *entities.Notification) error {
	model := r.mapper.ToModel(notification)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}
	return nil
}

func (r *notificationRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Notification, error) {
	var model models.Notification
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get notification by ID: %w", err)
	}
	return r.mapper.ToEntity(&model), nil
}

func (r *notificationRepositoryImpl) Update(ctx context.Context, notification *entities.Notification) error {
	model := r.mapper.ToModel(notification)
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update notification: %w", err)
	}
	return nil
}

func (r *notificationRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.Notification{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete notification: %w", err)
	}
	return nil
}

func (r *notificationRepositoryImpl) GetByRecipient(ctx context.Context, recipientID uuid.UUID) ([]*entities.Notification, error) {
	var notifications []models.Notification
	if err := r.db.WithContext(ctx).Where("recipient_id = ?", recipientID).
		Order("created_at DESC").Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to get notifications by recipient: %w", err)
	}

	result := make([]*entities.Notification, len(notifications))
	for i, model := range notifications {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *notificationRepositoryImpl) GetUnreadByRecipient(ctx context.Context, recipientID uuid.UUID) ([]*entities.Notification, error) {
	var notifications []models.Notification
	if err := r.db.WithContext(ctx).
		Where("recipient_id = ? AND is_read = ?", recipientID, false).
		Order("created_at DESC").Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to get unread notifications: %w", err)
	}

	result := make([]*entities.Notification, len(notifications))
	for i, model := range notifications {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *notificationRepositoryImpl) MarkAsRead(ctx context.Context, id uuid.UUID) error {
	updates := map[string]interface{}{
		"is_read": true,
		"read_at": time.Now(),
	}

	if err := r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("id = ?", id).Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}
	return nil
}

func (r *notificationRepositoryImpl) MarkAsUnread(ctx context.Context, id uuid.UUID) error {
	updates := map[string]interface{}{
		"is_read": false,
		"read_at": nil,
	}

	if err := r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("id = ?", id).Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to mark notification as unread: %w", err)
	}
	return nil
}

func (r *notificationRepositoryImpl) MarkAllAsRead(ctx context.Context, recipientID uuid.UUID) error {
	updates := map[string]interface{}{
		"is_read": true,
		"read_at": time.Now(),
	}

	if err := r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("recipient_id = ? AND is_read = ?", recipientID, false).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}
	return nil
}

func (r *notificationRepositoryImpl) GetByType(ctx context.Context, notificationType string) ([]*entities.Notification, error) {
	var notifications []models.Notification
	if err := r.db.WithContext(ctx).Where("type = ?", notificationType).
		Order("created_at DESC").Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to get notifications by type: %w", err)
	}

	result := make([]*entities.Notification, len(notifications))
	for i, model := range notifications {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *notificationRepositoryImpl) GetPendingNotifications(ctx context.Context, limit int) ([]*entities.Notification, error) {
	query := r.db.WithContext(ctx).Where("is_sent = ?", false).Order("created_at ASC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	var notifications []models.Notification
	if err := query.Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to get pending notifications: %w", err)
	}

	result := make([]*entities.Notification, len(notifications))
	for i, model := range notifications {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *notificationRepositoryImpl) MarkAsSent(ctx context.Context, id uuid.UUID) error {
	updates := map[string]interface{}{
		"is_sent": true,
		"sent_at": time.Now(),
	}

	if err := r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("id = ?", id).Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to mark notification as sent: %w", err)
	}
	return nil
}

func (r *notificationRepositoryImpl) CountUnreadByRecipient(ctx context.Context, recipientID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("recipient_id = ? AND is_read = ?", recipientID, false).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count unread notifications: %w", err)
	}
	return count, nil
}

func (r *notificationRepositoryImpl) DeleteOldNotifications(ctx context.Context, days int) error {
	cutoff := time.Now().AddDate(0, 0, -days)

	if err := r.db.WithContext(ctx).Where("created_at < ?", cutoff).
		Delete(&models.Notification{}).Error; err != nil {
		return fmt.Errorf("failed to delete old notifications: %w", err)
	}
	return nil
}

func (r *notificationRepositoryImpl) GetByEntityID(ctx context.Context, entityType string, entityID uuid.UUID) ([]*entities.Notification, error) {
	var notifications []models.Notification
	if err := r.db.WithContext(ctx).Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Order("created_at DESC").Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to get notifications by entity ID: %w", err)
	}

	result := make([]*entities.Notification, len(notifications))
	for i, model := range notifications {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

// GetUnsentNotifications obtiene notificaciones no enviadas
func (r *notificationRepositoryImpl) GetUnsentNotifications(ctx context.Context) ([]*entities.Notification, error) {
	var notifications []models.Notification
	if err := r.db.WithContext(ctx).Where("is_sent = ?", false).
		Order("created_at ASC").Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to get unsent notifications: %w", err)
	}

	result := make([]*entities.Notification, len(notifications))
	for i, model := range notifications {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

// GetRecentNotificationsByRecipient obtiene notificaciones recientes de un recipient
func (r *notificationRepositoryImpl) GetRecentNotificationsByRecipient(ctx context.Context, recipient uuid.UUID, limit int) ([]*entities.Notification, error) {
	var notifications []models.Notification
	if err := r.db.WithContext(ctx).Where("recipient_id = ?", recipient).
		Order("created_at DESC").Limit(limit).Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to get recent notifications: %w", err)
	}

	result := make([]*entities.Notification, len(notifications))
	for i, model := range notifications {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *notificationRepositoryImpl) BulkMarkAsRead(ctx context.Context, notificationIDs []uuid.UUID) error {
	if len(notificationIDs) == 0 {
		return nil
	}

	updates := map[string]interface{}{
		"is_read": true,
		"read_at": time.Now(),
	}

	if err := r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("id IN ?", notificationIDs).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to bulk mark notifications as read: %w", err)
	}
	return nil
}
