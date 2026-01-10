package usecases

import (
	"context"
	"crypto/rand"
	"fmt"
	"time"

	"attendanceservice/internal/application/dtos"
	"attendanceservice/internal/domain/entities"
	"attendanceservice/internal/domain/repositories"

	"github.com/google/uuid"
)

type QRCodeUseCase struct {
	qrRepo         repositories.QRCodeRepository
	attendanceRepo repositories.AttendanceRepository
}

// NewQRCodeUseCase crea una nueva instancia del caso de uso de códigos QR
func NewQRCodeUseCase(
	qrRepo repositories.QRCodeRepository,
	attendanceRepo repositories.AttendanceRepository,
) *QRCodeUseCase {
	return &QRCodeUseCase{
		qrRepo:         qrRepo,
		attendanceRepo: attendanceRepo,
	}
}

// GenerateQRCode genera un nuevo código QR para un estudiante
func (uc *QRCodeUseCase) GenerateQRCode(ctx context.Context, req *dtos.QRCodeRequest) (*dtos.QRCodeResponse, error) {
	// Verificar si ya existe un código QR activo para este estudiante y horario
	existingQR, err := uc.qrRepo.GetActiveByStudent(ctx, req.StudentID, req.ScheduleID)
	if err == nil && existingQR != nil {
		// Si existe un código activo y no ha expirado, devolverlo
		if existingQR.CanBeUsed() {
			return uc.mapQRCodeToResponse(existingQR), nil
		}
		// Si está expirado, marcarlo como tal
		existingQR.MarkAsExpired()
		uc.qrRepo.Update(ctx, existingQR)
	}

	// Crear nuevo código QR
	now := time.Now()
	qrCode := &entities.AttendanceQRCode{
		ID:         uuid.New(),
		StudentID:  req.StudentID,
		ScheduleID: req.ScheduleID,
		Code:       uc.generateSecureCode(req.StudentID, req.ScheduleID, now),
		Status:     entities.QRCodeStatusActivo,
		ExpiresAt:  now.Add(15 * time.Second), // Expira en 15 segundos
		IsActive:   true,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	if err := uc.qrRepo.Create(ctx, qrCode); err != nil {
		return nil, fmt.Errorf("failed to create QR code: %w", err)
	}

	return uc.mapQRCodeToResponse(qrCode), nil
}

// ScanQRCode procesa el escaneo de un código QR por un instructor
func (uc *QRCodeUseCase) ScanQRCode(ctx context.Context, req *dtos.QRScanRequest) (*dtos.QRScanResponse, error) {
	// Buscar el código QR
	qrCode, err := uc.qrRepo.GetByCode(ctx, req.Code)
	if err != nil || qrCode == nil {
		return &dtos.QRScanResponse{
			Success: false,
			Message: "Código QR no encontrado o inválido",
		}, nil
	}

	// Verificar si el código puede ser usado
	if !qrCode.CanBeUsed() {
		wasExpired := qrCode.IsExpired()
		return &dtos.QRScanResponse{
			Success: false,
			Message: uc.getQRErrorMessage(qrCode),
			ScanDetails: &dtos.QRScanDetailsResponse{
				QRCodeID:     qrCode.ID,
				ScanTime:     time.Now(),
				Location:     req.Location,
				Latitude:     req.Latitude,
				Longitude:    req.Longitude,
				InstructorID: req.InstructorID,
				Method:       "QR_SCAN",
				WasExpired:   wasExpired,
			},
		}, nil
	}

	// Marcar el código como usado
	scanTime := time.Now()
	if req.ScanTime != nil {
		scanTime = *req.ScanTime
	}

	qrCode.MarkAsUsed(req.InstructorID, req.Location)
	if err := uc.qrRepo.Update(ctx, qrCode); err != nil {
		return nil, fmt.Errorf("failed to update QR code: %w", err)
	}

	// Determinar el estado de asistencia basado en el tiempo
	status := uc.determineAttendanceStatus(scanTime, qrCode.ScheduleID)

	// Crear registro de asistencia
	attendanceReq := &dtos.CreateAttendanceRequest{
		StudentID:    qrCode.StudentID,
		ScheduleID:   qrCode.ScheduleID,
		InstructorID: req.InstructorID,
		Date:         scanTime,
		Status:       status,
		CheckInTime:  &scanTime,
		QRCodeID:     &qrCode.ID,
		QRCodeData:   qrCode.Code,
		Method:       "QR_SCAN",
		Notes:        fmt.Sprintf("Escaneado desde: %s", req.Location),
	}

	// Aquí necesitaríamos crear el registro de asistencia usando el AttendanceUseCase
	// Por simplicidad, asumo que tenemos acceso al método
	attendanceResponse, err := uc.createAttendanceFromQR(ctx, attendanceReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create attendance record: %w", err)
	}

	// Obtener información del estudiante (esto normalmente vendría de un servicio externo)
	studentInfo := &dtos.StudentInfoResponse{
		ID: qrCode.StudentID,
		// Otros campos se llenarían desde el servicio de usuarios
	}

	return &dtos.QRScanResponse{
		Success:          true,
		Message:          "Asistencia registrada exitosamente",
		AttendanceRecord: attendanceResponse,
		StudentInfo:      studentInfo,
		ScanDetails: &dtos.QRScanDetailsResponse{
			QRCodeID:     qrCode.ID,
			ScanTime:     scanTime,
			Location:     req.Location,
			Latitude:     req.Latitude,
			Longitude:    req.Longitude,
			InstructorID: req.InstructorID,
			Method:       "QR_SCAN",
			WasExpired:   false,
		},
	}, nil
}

// GetStudentQRStatus obtiene el estado del código QR de un estudiante
func (uc *QRCodeUseCase) GetStudentQRStatus(ctx context.Context, req *dtos.StudentQRStatusRequest) (*dtos.StudentQRStatusResponse, error) {
	// Buscar código QR activo
	activeQR, err := uc.qrRepo.GetActiveByStudent(ctx, req.StudentID, req.ScheduleID)
	if err != nil {
		return &dtos.StudentQRStatusResponse{
			HasActiveQR:      false,
			AttendanceStatus: "UNKNOWN",
			CanGenerate:      true,
			Message:          "No hay código QR activo",
		}, nil
	}

	if activeQR == nil || !activeQR.CanBeUsed() {
		return &dtos.StudentQRStatusResponse{
			HasActiveQR:      false,
			AttendanceStatus: "PENDING",
			CanGenerate:      true,
			Message:          "Puede generar un nuevo código QR",
		}, nil
	}

	// Calcular próxima renovación
	nextRefresh := activeQR.ExpiresAt

	return &dtos.StudentQRStatusResponse{
		HasActiveQR:      true,
		CurrentQR:        uc.mapQRCodeToResponse(activeQR),
		NextRefresh:      &nextRefresh,
		AttendanceStatus: "PENDING",
		CanGenerate:      false,
		Message:          "Código QR activo - esperando escaneo",
	}, nil
}

// ExpireOldQRCodes marca como expirados los códigos QR antiguos (tarea programada)
func (uc *QRCodeUseCase) ExpireOldQRCodes(ctx context.Context) error {
	return uc.qrRepo.ExpireOldCodes(ctx)
}

// BulkGenerateQRCodes genera códigos QR para múltiples estudiantes
func (uc *QRCodeUseCase) BulkGenerateQRCodes(ctx context.Context, req *dtos.BulkQRGenerationRequest) (*dtos.BulkQRGenerationResponse, error) {
	response := &dtos.BulkQRGenerationResponse{
		ScheduleID:     req.ScheduleID,
		TotalRequested: len(req.StudentIDs),
		GeneratedCodes: make([]dtos.QRCodeResponse, 0),
		FailedStudents: make([]uuid.UUID, 0),
	}

	for _, studentID := range req.StudentIDs {
		qrReq := &dtos.QRCodeRequest{
			StudentID:  studentID,
			ScheduleID: req.ScheduleID,
		}

		qrResp, err := uc.GenerateQRCode(ctx, qrReq)
		if err != nil {
			response.FailedStudents = append(response.FailedStudents, studentID)
			response.TotalFailed++
		} else {
			response.GeneratedCodes = append(response.GeneratedCodes, *qrResp)
			response.TotalGenerated++
		}
	}

	response.Message = fmt.Sprintf("Generados %d/%d códigos QR exitosamente",
		response.TotalGenerated, response.TotalRequested)

	return response, nil
}

// Métodos auxiliares privados

func (uc *QRCodeUseCase) generateSecureCode(studentID, scheduleID uuid.UUID, timestamp time.Time) string {
	// Generar un código seguro usando random bytes
	randomBytes := make([]byte, 16)
	rand.Read(randomBytes)

	return fmt.Sprintf("SICORA_%s_%s_%d_%x",
		studentID.String()[:8],
		scheduleID.String()[:8],
		timestamp.Unix(),
		randomBytes[:8])
}

func (uc *QRCodeUseCase) mapQRCodeToResponse(qr *entities.AttendanceQRCode) *dtos.QRCodeResponse {
	expiresIn := int(time.Until(qr.ExpiresAt).Seconds())
	if expiresIn < 0 {
		expiresIn = 0
	}

	return &dtos.QRCodeResponse{
		ID:         qr.ID,
		StudentID:  qr.StudentID,
		ScheduleID: qr.ScheduleID,
		Code:       qr.Code,
		Status:     string(qr.Status),
		ExpiresAt:  qr.ExpiresAt,
		ExpiresIn:  expiresIn,
		IsActive:   qr.IsActive,
		CreatedAt:  qr.CreatedAt,
		UpdatedAt:  qr.UpdatedAt,
	}
}

func (uc *QRCodeUseCase) getQRErrorMessage(qr *entities.AttendanceQRCode) string {
	switch qr.Status {
	case entities.QRCodeStatusExpirado:
		return "El código QR ha expirado. Genere uno nuevo."
	case entities.QRCodeStatusUsado:
		return "Este código QR ya fue utilizado."
	default:
		if qr.IsExpired() {
			return "El código QR ha expirado. Los códigos expiran cada 15 segundos."
		}
		return "El código QR no es válido."
	}
}

func (uc *QRCodeUseCase) determineAttendanceStatus(scanTime time.Time, scheduleID uuid.UUID) string {
	// Esta lógica se basaría en el horario programado
	// Por simplicidad, asumimos que si es dentro de los primeros 15 minutos es "PRESENT"
	// y después es "LATE"

	// En una implementación real, consultar el horario desde scheduleID
	// Por ahora usar lógica simple basada en la hora
	hour := scanTime.Hour()
	if hour >= 8 && hour < 12 { // Horario matutino
		return "PRESENT"
	} else if hour >= 14 && hour < 18 { // Horario vespertino
		return "PRESENT"
	}

	return "LATE" // Fuera de horario normal
}

func (uc *QRCodeUseCase) createAttendanceFromQR(ctx context.Context, req *dtos.CreateAttendanceRequest) (*dtos.AttendanceResponse, error) {
	// Crear entidad de asistencia
	now := time.Now()
	attendance := &entities.AttendanceRecord{
		ID:           uuid.New(),
		StudentID:    req.StudentID,
		ScheduleID:   req.ScheduleID,
		InstructorID: req.InstructorID,
		Date:         req.Date,
		Status:       entities.AttendanceStatus(req.Status),
		CheckInTime:  req.CheckInTime,
		QRCodeID:     req.QRCodeID,
		QRCodeData:   req.QRCodeData,
		Method:       req.Method,
		Notes:        req.Notes,
		IsActive:     true,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := uc.attendanceRepo.Create(ctx, attendance); err != nil {
		return nil, err
	}

	// Mapear a respuesta
	return &dtos.AttendanceResponse{
		ID:           attendance.ID,
		StudentID:    attendance.StudentID,
		ScheduleID:   attendance.ScheduleID,
		InstructorID: attendance.InstructorID,
		Date:         attendance.Date,
		Status:       string(attendance.Status),
		CheckInTime:  attendance.CheckInTime,
		QRCodeID:     attendance.QRCodeID,
		QRCodeData:   attendance.QRCodeData,
		Method:       attendance.Method,
		Notes:        attendance.Notes,
		IsActive:     attendance.IsActive,
		CreatedAt:    attendance.CreatedAt,
		UpdatedAt:    attendance.UpdatedAt,
	}, nil
}
