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

type AttendanceUseCase struct {
	attendanceRepo repositories.AttendanceRepository
	alertRepo      repositories.AttendanceAlertRepository
}

func NewAttendanceUseCase(
	attendanceRepo repositories.AttendanceRepository,
	alertRepo repositories.AttendanceAlertRepository,
) *AttendanceUseCase {
	return &AttendanceUseCase{
		attendanceRepo: attendanceRepo,
		alertRepo:      alertRepo,
	}
}

// CreateAttendance crea un nuevo registro de asistencia
func (uc *AttendanceUseCase) CreateAttendance(ctx context.Context, req *dtos.CreateAttendanceRequest) (*dtos.AttendanceResponse, error) {
	// Verificar si ya existe un registro para el usuario y fecha
	existing, err := uc.attendanceRepo.GetByUserAndDate(ctx, req.StudentID, req.Date)
	if err == nil && existing != nil {
		return nil, errors.New("attendance record already exists for this date")
	}

	// Crear nueva entidad de asistencia
	attendance := &entities.AttendanceRecord{
		ID:           uuid.New(),
		StudentID:    req.StudentID,
		ScheduleID:   req.ScheduleID,
		InstructorID: req.InstructorID,
		Date:         req.Date,
		Status:       entities.AttendanceStatus(req.Status),
		CheckInTime:  req.CheckInTime,
		QRCodeData:   req.QRCodeData,
		Notes:        req.Notes,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Validar la entidad
	if !attendance.IsValidStatus() {
		return nil, errors.New("invalid attendance status")
	}

	// Guardar en el repositorio
	if err := uc.attendanceRepo.Create(ctx, attendance); err != nil {
		return nil, err
	}

	// Verificar si necesita generar alertas
	go uc.checkAndGenerateAlerts(ctx, attendance)

	return uc.mapToAttendanceResponse(attendance), nil
}

// UpdateAttendance actualiza un registro de asistencia existente
func (uc *AttendanceUseCase) UpdateAttendance(ctx context.Context, id uuid.UUID, req *dtos.UpdateAttendanceRequest) (*dtos.AttendanceResponse, error) {
	// Obtener el registro existente
	attendance, err := uc.attendanceRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if attendance == nil {
		return nil, errors.New("attendance record not found")
	}

	// Actualizar campos si están presentes
	if req.Status != nil {
		attendance.Status = entities.AttendanceStatus(*req.Status)
		if !attendance.IsValidStatus() {
			return nil, errors.New("invalid attendance status")
		}
	}
	if req.CheckInTime != nil {
		attendance.CheckInTime = req.CheckInTime
	}
	if req.Notes != nil {
		attendance.Notes = *req.Notes
	}

	attendance.UpdatedAt = time.Now()

	// Guardar cambios
	if err := uc.attendanceRepo.Update(ctx, attendance); err != nil {
		return nil, err
	}

	return uc.mapToAttendanceResponse(attendance), nil
}

// GetAttendanceByID obtiene un registro de asistencia por ID
func (uc *AttendanceUseCase) GetAttendanceByID(ctx context.Context, id uuid.UUID) (*dtos.AttendanceResponse, error) {
	attendance, err := uc.attendanceRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if attendance == nil {
		return nil, errors.New("attendance record not found")
	}

	return uc.mapToAttendanceResponse(attendance), nil
}

// GetAttendanceHistory obtiene el historial de asistencia
func (uc *AttendanceUseCase) GetAttendanceHistory(ctx context.Context, req *dtos.AttendanceHistoryRequest) (*dtos.AttendanceHistoryResponse, error) {
	attendances, err := uc.attendanceRepo.GetByDateRange(ctx, req.UserID, req.StartDate, req.EndDate)
	if err != nil {
		return nil, err
	}

	// Filtrar por estado si se especifica
	if req.Status != nil {
		filtered := make([]*entities.AttendanceRecord, 0)
		for _, att := range attendances {
			if string(att.Status) == *req.Status {
				filtered = append(filtered, att)
			}
		}
		attendances = filtered
	}

	// Aplicar paginación
	total := len(attendances)
	start := req.Offset
	end := start + req.Limit
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	paginatedAttendances := attendances[start:end]
	responses := make([]dtos.AttendanceResponse, len(paginatedAttendances))
	for i, att := range paginatedAttendances {
		responses[i] = *uc.mapToAttendanceResponse(att)
	}

	return &dtos.AttendanceHistoryResponse{
		Attendances: responses,
		Total:       total,
		Limit:       req.Limit,
		Offset:      req.Offset,
	}, nil
}

// GetAttendanceSummary obtiene un resumen de asistencia
func (uc *AttendanceUseCase) GetAttendanceSummary(ctx context.Context, req *dtos.AttendanceSummaryRequest) (*dtos.AttendanceSummaryResponse, error) {
	summary, err := uc.attendanceRepo.GetAttendanceSummary(ctx, req.UserID, req.StartDate, req.EndDate)
	if err != nil {
		return nil, err
	}

	return &dtos.AttendanceSummaryResponse{
		UserID:            summary.UserID,
		StartDate:         summary.StartDate,
		EndDate:           summary.EndDate,
		TotalScheduled:    summary.TotalScheduled,
		TotalPresent:      summary.TotalPresent,
		TotalAbsent:       summary.TotalAbsent,
		TotalJustified:    summary.TotalJustified,
		TotalLate:         summary.TotalLate,
		AttendanceRate:    summary.AttendanceRate,
		PunctualityRate:   summary.PunctualityRate,
		AverageLateness:   summary.AverageLateness,
		ConsecutiveAbsent: summary.ConsecutiveAbsent,
	}, nil
}

// RegisterQRCodeAttendance registra asistencia usando código QR
func (uc *AttendanceUseCase) RegisterQRCodeAttendance(ctx context.Context, req *dtos.QRCodeAttendanceRequest) (*dtos.AttendanceResponse, error) {
	// TODO: Decodificar QR code para obtener información del horario
	// Por ahora, asumimos que el QR contiene información válida

	now := time.Now()
	attendance := &entities.AttendanceRecord{
		ID:          uuid.New(),
		StudentID:   req.StudentID,
		QRCodeData:  req.QRCodeData,
		Date:        now,
		CheckInTime: &now,
		Status:      entities.AttendanceStatusPresente,
		IsActive:    true,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := uc.attendanceRepo.Create(ctx, attendance); err != nil {
		return nil, err
	}

	return uc.mapToAttendanceResponse(attendance), nil
}

// BulkCreateAttendance crea múltiples registros de asistencia
func (uc *AttendanceUseCase) BulkCreateAttendance(ctx context.Context, req *dtos.BulkAttendanceRequest) error {
	attendances := make([]*entities.AttendanceRecord, len(req.Attendances))

	for i, attReq := range req.Attendances {
		attendance := &entities.AttendanceRecord{
			ID:           uuid.New(),
			StudentID:    attReq.StudentID,
			ScheduleID:   attReq.ScheduleID,
			InstructorID: attReq.InstructorID,
			Date:         attReq.Date,
			Status:       entities.AttendanceStatus(attReq.Status),
			CheckInTime:  attReq.CheckInTime,
			QRCodeData:   attReq.QRCodeData,
			Notes:        attReq.Notes,
			IsActive:     true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if !attendance.IsValidStatus() {
			return errors.New("invalid attendance status in bulk data")
		}

		attendances[i] = attendance
	}

	return uc.attendanceRepo.BulkCreate(ctx, attendances)
}

// DeleteAttendance elimina un registro de asistencia
func (uc *AttendanceUseCase) DeleteAttendance(ctx context.Context, id uuid.UUID) error {
	// Verificar que el registro existe
	attendance, err := uc.attendanceRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if attendance == nil {
		return errors.New("attendance record not found")
	}

	return uc.attendanceRepo.Delete(ctx, id)
}

// checkAndGenerateAlerts verifica y genera alertas según el patrón de asistencia
func (uc *AttendanceUseCase) checkAndGenerateAlerts(ctx context.Context, attendance *entities.AttendanceRecord) {
	// Verificar ausencias consecutivas
	if attendance.Status == entities.AttendanceStatusAusente {
		// Obtener registros recientes para verificar patrón
		endDate := attendance.Date
		startDate := endDate.AddDate(0, 0, -7) // Últimos 7 días

		recentAttendances, err := uc.attendanceRepo.GetByDateRange(ctx, attendance.StudentID, startDate, endDate)
		if err != nil {
			return
		}

		consecutiveAbsences := 0
		for i := len(recentAttendances) - 1; i >= 0; i-- {
			if recentAttendances[i].Status == entities.AttendanceStatusAusente {
				consecutiveAbsences++
			} else {
				break
			}
		}

		// Generar alerta si hay 3 o más ausencias consecutivas
		if consecutiveAbsences >= 3 {
			alert := &entities.AttendanceAlert{
				ID:          uuid.New(),
				StudentID:   attendance.StudentID,
				Type:        entities.AlertTypeConsecutivo,
				Level:       entities.AlertLevelAlto,
				Title:       "Ausencias Consecutivas Detectadas",
				Description: "Se han detectado ausencias consecutivas que requieren atención",
				IsRead:      false,
				IsActive:    true,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}
			uc.alertRepo.Create(ctx, alert)
		}
	}
}

// mapToAttendanceResponse convierte una entidad a DTO de respuesta
func (uc *AttendanceUseCase) mapToAttendanceResponse(attendance *entities.AttendanceRecord) *dtos.AttendanceResponse {
	return &dtos.AttendanceResponse{
		ID:           attendance.ID,
		StudentID:    attendance.StudentID,
		ScheduleID:   attendance.ScheduleID,
		InstructorID: attendance.InstructorID,
		Date:         attendance.Date,
		Status:       string(attendance.Status),
		CheckInTime:  attendance.CheckInTime,
		QRCodeData:   attendance.QRCodeData,
		Notes:        attendance.Notes,
		IsActive:     attendance.IsActive,
		CreatedAt:    attendance.CreatedAt,
		UpdatedAt:    attendance.UpdatedAt,
	}
}
