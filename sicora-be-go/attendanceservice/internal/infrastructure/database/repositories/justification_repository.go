package repositories

import (
	"context"
	"time"

	"attendanceservice/internal/domain/entities"
	"attendanceservice/internal/domain/repositories"
	"attendanceservice/internal/infrastructure/database/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	justificationStatusPendiente = "PENDIENTE"
	justificationStatusAprobada  = "APROBADA"
	justificationStatusRechazada = "RECHAZADA"
)

type justificationRepository struct {
	db *gorm.DB
}

// NewJustificationRepository crea una nueva instancia del repositorio de justificaciones
func NewJustificationRepository(db *gorm.DB) repositories.JustificationRepository {
	return &justificationRepository{db: db}
}

// Create crea una nueva justificación
func (r *justificationRepository) Create(ctx context.Context, justification *entities.Justification) error {
	model := r.mapToModel(justification)
	return r.db.WithContext(ctx).Create(model).Error
}

// GetByID obtiene una justificación por ID
func (r *justificationRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Justification, error) {
	var model models.Justification
	err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.mapToEntity(&model), nil
}

// GetByAttendanceID obtiene una justificación por ID de asistencia
func (r *justificationRepository) GetByAttendanceID(ctx context.Context, attendanceID uuid.UUID) (*entities.Justification, error) {
	var model models.Justification
	err := r.db.WithContext(ctx).First(&model, "attendance_id = ?", attendanceID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.mapToEntity(&model), nil
}

// GetByUserID obtiene justificaciones por ID de usuario
func (r *justificationRepository) GetByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.Justification, error) {
	var models []models.Justification
	err := r.db.WithContext(ctx).
		Where("student_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&models).Error
	if err != nil {
		return nil, err
	}

	entities := make([]*entities.Justification, len(models))
	for i, model := range models {
		entities[i] = r.mapToEntity(&model)
	}
	return entities, nil
}

// Update actualiza una justificación
func (r *justificationRepository) Update(ctx context.Context, justification *entities.Justification) error {
	model := r.mapToModel(justification)
	return r.db.WithContext(ctx).Save(model).Error
}

// Delete elimina una justificación
func (r *justificationRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Justification{}, id).Error
}

// GetPendingJustifications obtiene justificaciones pendientes
func (r *justificationRepository) GetPendingJustifications(ctx context.Context, limit, offset int) ([]*entities.Justification, error) {
	var models []models.Justification
	err := r.db.WithContext(ctx).
		Where("status = ?", justificationStatusPendiente).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&models).Error
	if err != nil {
		return nil, err
	}

	entities := make([]*entities.Justification, len(models))
	for i, model := range models {
		entities[i] = r.mapToEntity(&model)
	}
	return entities, nil
}

// ApproveJustification aprueba una justificación
func (r *justificationRepository) ApproveJustification(ctx context.Context, id uuid.UUID, approverID uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&models.Justification{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":      justificationStatusAprobada,
			"reviewed_by": approverID,
			"review_date": now,
			"updated_at":  now,
		}).Error
}

// RejectJustification rechaza una justificación
func (r *justificationRepository) RejectJustification(ctx context.Context, id uuid.UUID, approverID uuid.UUID, reason string) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&models.Justification{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":          justificationStatusRechazada,
			"reviewed_by":     approverID,
			"review_date":     now,
			"review_comments": reason,
			"updated_at":      now,
		}).Error
}

// mapToModel convierte una entidad a modelo GORM
func (r *justificationRepository) mapToModel(entity *entities.Justification) *models.Justification {
	return &models.Justification{
		ID:             entity.ID,
		AttendanceID:   entity.AttendanceID,
		StudentID:      entity.StudentID,
		Reason:         entity.Reason,
		Description:    entity.Description,
		DocumentURL:    entity.DocumentURL,
		Status:         string(entity.Status),
		ReviewedBy:     entity.ReviewedBy,
		ReviewDate:     entity.ReviewDate,
		ReviewComments: entity.ReviewComments,
		IsActive:       entity.IsActive,
		CreatedAt:      entity.CreatedAt,
		UpdatedAt:      entity.UpdatedAt,
	}
}

// mapToEntity convierte un modelo GORM a entidad
func (r *justificationRepository) mapToEntity(model *models.Justification) *entities.Justification {
	return &entities.Justification{
		ID:             model.ID,
		AttendanceID:   model.AttendanceID,
		StudentID:      model.StudentID,
		Reason:         model.Reason,
		Description:    model.Description,
		DocumentURL:    model.DocumentURL,
		Status:         entities.JustificationStatus(model.Status),
		ReviewedBy:     model.ReviewedBy,
		ReviewDate:     model.ReviewDate,
		ReviewComments: model.ReviewComments,
		IsActive:       model.IsActive,
		CreatedAt:      model.CreatedAt,
		UpdatedAt:      model.UpdatedAt,
	}
}
