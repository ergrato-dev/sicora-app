package usecases

import (
	"context"
	"errors"
	"time"

	"attendanceservice/internal/application/dtos"
	"attendanceservice/internal/domain/entities"
	"attendanceservice/internal/domain/repositories"

	"github.com/google/uuid"
)

type JustificationUseCase struct {
	justificationRepo repositories.JustificationRepository
	attendanceRepo    repositories.AttendanceRepository
}

func NewJustificationUseCase(
	justificationRepo repositories.JustificationRepository,
	attendanceRepo repositories.AttendanceRepository,
) *JustificationUseCase {
	return &JustificationUseCase{
		justificationRepo: justificationRepo,
		attendanceRepo:    attendanceRepo,
	}
}

// CreateJustification crea una nueva justificación
func (uc *JustificationUseCase) CreateJustification(ctx context.Context, req *dtos.CreateJustificationRequest) (*dtos.JustificationResponse, error) {
	// Verificar que el registro de asistencia existe
	attendance, err := uc.attendanceRepo.GetByID(ctx, req.AttendanceID)
	if err != nil {
		return nil, err
	}
	if attendance == nil {
		return nil, errors.New("attendance record not found")
	}

	// Verificar que no existe ya una justificación para este registro
	existing, _ := uc.justificationRepo.GetByAttendanceID(ctx, req.AttendanceID)
	if existing != nil {
		return nil, errors.New("justification already exists for this attendance record")
	}

	// Crear nueva justificación
	justification := &entities.Justification{
		ID:           uuid.New(),
		AttendanceID: req.AttendanceID,
		StudentID:    req.StudentID,
		Reason:       req.Reason,
		Description:  req.Description,
		Status:       entities.JustificationStatusPendiente,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Validar la justificación
	if !justification.IsValidStatus() {
		return nil, errors.New("invalid justification status")
	}

	// Guardar en el repositorio
	if err := uc.justificationRepo.Create(ctx, justification); err != nil {
		return nil, err
	}

	return uc.mapToJustificationResponse(justification), nil
}

// UpdateJustification actualiza una justificación existente
func (uc *JustificationUseCase) UpdateJustification(ctx context.Context, id uuid.UUID, req *dtos.UpdateJustificationRequest) (*dtos.JustificationResponse, error) {
	// Obtener la justificación existente
	justification, err := uc.justificationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if justification == nil {
		return nil, errors.New("justification not found")
	}

	// Solo se puede actualizar si está pendiente
	if justification.Status != entities.JustificationStatusPendiente {
		return nil, errors.New("cannot update justification that is not pending")
	}

	// Actualizar campos si están presentes
	if req.Reason != nil {
		justification.Reason = *req.Reason
	}
	if req.Description != nil {
		justification.Description = *req.Description
	}

	justification.UpdatedAt = time.Now()

	// Guardar cambios
	if err := uc.justificationRepo.Update(ctx, justification); err != nil {
		return nil, err
	}

	return uc.mapToJustificationResponse(justification), nil
}

// GetJustificationByID obtiene una justificación por ID
func (uc *JustificationUseCase) GetJustificationByID(ctx context.Context, id uuid.UUID) (*dtos.JustificationResponse, error) {
	justification, err := uc.justificationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if justification == nil {
		return nil, errors.New("justification not found")
	}

	return uc.mapToJustificationResponse(justification), nil
}

// GetJustificationsByUser obtiene las justificaciones de un usuario
func (uc *JustificationUseCase) GetJustificationsByUser(ctx context.Context, req *dtos.JustificationListRequest) (*dtos.JustificationListResponse, error) {
	if req.UserID == nil {
		return nil, errors.New("user ID is required")
	}

	justifications, err := uc.justificationRepo.GetByUserID(ctx, *req.UserID, req.Limit, req.Offset)
	if err != nil {
		return nil, err
	}

	// Filtrar por estado si se especifica
	if req.Status != nil {
		filtered := make([]*entities.Justification, 0)
		for _, just := range justifications {
			if string(just.Status) == *req.Status {
				filtered = append(filtered, just)
			}
		}
		justifications = filtered
	}

	responses := make([]dtos.JustificationResponse, len(justifications))
	for i, just := range justifications {
		responses[i] = *uc.mapToJustificationResponse(just)
	}

	return &dtos.JustificationListResponse{
		Justifications: responses,
		Total:          len(justifications),
		Limit:          req.Limit,
		Offset:         req.Offset,
	}, nil
}

// GetPendingJustifications obtiene las justificaciones pendientes
func (uc *JustificationUseCase) GetPendingJustifications(ctx context.Context, req *dtos.JustificationListRequest) (*dtos.JustificationListResponse, error) {
	justifications, err := uc.justificationRepo.GetPendingJustifications(ctx, req.Limit, req.Offset)
	if err != nil {
		return nil, err
	}

	responses := make([]dtos.JustificationResponse, len(justifications))
	for i, just := range justifications {
		responses[i] = *uc.mapToJustificationResponse(just)
	}

	return &dtos.JustificationListResponse{
		Justifications: responses,
		Total:          len(justifications),
		Limit:          req.Limit,
		Offset:         req.Offset,
	}, nil
}

// ApproveJustification aprueba una justificación
func (uc *JustificationUseCase) ApproveJustification(ctx context.Context, id uuid.UUID, req *dtos.ApproveJustificationRequest) (*dtos.JustificationResponse, error) {
	// Obtener la justificación
	justification, err := uc.justificationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if justification == nil {
		return nil, errors.New("justification not found")
	}

	// Verificar que está pendiente
	if justification.Status != entities.JustificationStatusPendiente {
		return nil, errors.New("justification is not pending")
	}

	// Aprobar usando el método del repositorio
	if err := uc.justificationRepo.ApproveJustification(ctx, id, req.ApproverID); err != nil {
		return nil, err
	}

	// Obtener la justificación actualizada
	updatedJustification, err := uc.justificationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Actualizar el estado de asistencia asociado a "JUSTIFICADO"
	attendance, err := uc.attendanceRepo.GetByID(ctx, justification.AttendanceID)
	if err == nil && attendance != nil {
		attendance.Status = entities.AttendanceStatusJustificado
		attendance.UpdatedAt = time.Now()
		uc.attendanceRepo.Update(ctx, attendance)
	}

	return uc.mapToJustificationResponse(updatedJustification), nil
}

// RejectJustification rechaza una justificación
func (uc *JustificationUseCase) RejectJustification(ctx context.Context, id uuid.UUID, req *dtos.RejectJustificationRequest) (*dtos.JustificationResponse, error) {
	// Obtener la justificación
	justification, err := uc.justificationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if justification == nil {
		return nil, errors.New("justification not found")
	}

	// Verificar que está pendiente
	if justification.Status != entities.JustificationStatusPendiente {
		return nil, errors.New("justification is not pending")
	}

	// Rechazar usando el método del repositorio
	if err := uc.justificationRepo.RejectJustification(ctx, id, req.ApproverID, req.Reason); err != nil {
		return nil, err
	}

	// Obtener la justificación actualizada
	updatedJustification, err := uc.justificationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return uc.mapToJustificationResponse(updatedJustification), nil
}

// DeleteJustification elimina una justificación
func (uc *JustificationUseCase) DeleteJustification(ctx context.Context, id uuid.UUID) error {
	// Verificar que la justificación existe
	justification, err := uc.justificationRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if justification == nil {
		return errors.New("justification not found")
	}

	// Solo se puede eliminar si está pendiente
	if justification.Status != entities.JustificationStatusPendiente {
		return errors.New("cannot delete justification that is not pending")
	}

	return uc.justificationRepo.Delete(ctx, id)
}

// mapToJustificationResponse convierte una entidad a DTO de respuesta
func (uc *JustificationUseCase) mapToJustificationResponse(justification *entities.Justification) *dtos.JustificationResponse {
	return &dtos.JustificationResponse{
		ID:              justification.ID,
		AttendanceID:    justification.AttendanceID,
		StudentID:       justification.StudentID,
		Reason:          justification.Reason,
		Description:     justification.Description,
		Status:          string(justification.Status),
		SubmittedAt:     justification.CreatedAt, // Usar CreatedAt como fecha de envío
		ReviewedAt:      justification.ReviewDate,
		ReviewedBy:      justification.ReviewedBy,
		RejectionReason: justification.ReviewComments, // Usar ReviewComments como motivo de rechazo
		IsActive:        justification.IsActive,
		CreatedAt:       justification.CreatedAt,
		UpdatedAt:       justification.UpdatedAt,
	}
}
