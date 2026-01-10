package entities

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// AttendanceStatus representa los posibles estados de asistencia
type AttendanceStatus string

const (
	AttendanceStatusPresente    AttendanceStatus = "PRESENTE"
	AttendanceStatusAusente     AttendanceStatus = "AUSENTE"
	AttendanceStatusJustificado AttendanceStatus = "JUSTIFICADO"
	AttendanceStatusRetardo     AttendanceStatus = "RETARDO"
)

// QRCodeStatus representa los estados de un código QR
type QRCodeStatus string

const (
	QRCodeStatusActivo   QRCodeStatus = "ACTIVO"
	QRCodeStatusExpirado QRCodeStatus = "EXPIRADO"
	QRCodeStatusUsado    QRCodeStatus = "USADO"
)

// AttendanceQRCode representa un código QR para toma de asistencia
type AttendanceQRCode struct {
	ID         uuid.UUID    `json:"id"`
	StudentID  uuid.UUID    `json:"student_id"`
	ScheduleID uuid.UUID    `json:"schedule_id"`
	Code       string       `json:"code"` // Código QR único
	Status     QRCodeStatus `json:"status"`
	ExpiresAt  time.Time    `json:"expires_at"` // Regeneración cada 15 segundos
	UsedAt     *time.Time   `json:"used_at,omitempty"`
	ScannerID  *uuid.UUID   `json:"scanner_id,omitempty"` // ID del instructor que escaneó
	Location   string       `json:"location,omitempty"`   // Ubicación del escaneo
	IsActive   bool         `json:"is_active"`
	CreatedAt  time.Time    `json:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at"`
}

// AttendanceRecord representa un registro de asistencia
type AttendanceRecord struct {
	ID           uuid.UUID        `json:"id"`
	StudentID    uuid.UUID        `json:"student_id"`
	ScheduleID   uuid.UUID        `json:"schedule_id"`
	InstructorID uuid.UUID        `json:"instructor_id"`
	Date         time.Time        `json:"date"`
	Status       AttendanceStatus `json:"status"`
	CheckInTime  *time.Time       `json:"check_in_time,omitempty"`
	QRCodeID     *uuid.UUID       `json:"qr_code_id,omitempty"`   // Referencia al QR usado
	QRCodeData   string           `json:"qr_code_data,omitempty"` // Código QR escaneado
	Method       string           `json:"method"`                 // "QR_SCAN" o "MANUAL"
	Notes        string           `json:"notes,omitempty"`
	IsActive     bool             `json:"is_active"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
}

// JustificationStatus representa los estados de una justificación
type JustificationStatus string

const (
	JustificationStatusPendiente JustificationStatus = "PENDIENTE"
	JustificationStatusAprobada  JustificationStatus = "APROBADA"
	JustificationStatusRechazada JustificationStatus = "RECHAZADA"
)

// Justification representa una justificación de ausencia
type Justification struct {
	ID             uuid.UUID           `json:"id"`
	AttendanceID   uuid.UUID           `json:"attendance_id"`
	StudentID      uuid.UUID           `json:"student_id"`
	Reason         string              `json:"reason"`
	Description    string              `json:"description,omitempty"`
	DocumentURL    string              `json:"document_url,omitempty"`
	Status         JustificationStatus `json:"status"`
	ReviewedBy     *uuid.UUID          `json:"reviewed_by,omitempty"`
	ReviewDate     *time.Time          `json:"review_date,omitempty"`
	ReviewComments string              `json:"review_comments,omitempty"`
	IsActive       bool                `json:"is_active"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
}

// AlertLevel representa el nivel de criticidad de una alerta
type AlertLevel string

const (
	AlertLevelBajo    AlertLevel = "BAJO"
	AlertLevelMedio   AlertLevel = "MEDIO"
	AlertLevelAlto    AlertLevel = "ALTO"
	AlertLevelCritico AlertLevel = "CRITICO"
)

// AlertType representa el tipo de alerta
type AlertType string

const (
	AlertTypeAusencia      AlertType = "AUSENCIA"
	AlertTypeRetardo       AlertType = "RETARDO"
	AlertTypePatron        AlertType = "PATRON"
	AlertTypeConsecutivo   AlertType = "CONSECUTIVO"
	AlertTypePorcentaje    AlertType = "PORCENTAJE"
	AlertTypePersonalizado AlertType = "PERSONALIZADO"
)

// AttendanceAlert representa una alerta de asistencia
type AttendanceAlert struct {
	ID          uuid.UUID  `json:"id"`
	StudentID   uuid.UUID  `json:"student_id"`
	Type        AlertType  `json:"type"`
	Level       AlertLevel `json:"level"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Metadata    string     `json:"metadata,omitempty"` // JSON para datos adicionales
	IsRead      bool       `json:"is_read"`
	ReadBy      *uuid.UUID `json:"read_by,omitempty"`
	ReadAt      *time.Time `json:"read_at,omitempty"`
	IsActive    bool       `json:"is_active"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// TableName especifica el nombre de las tablas para cada entidad
func (AttendanceRecord) TableName() string { return "attendance_records" }
func (Justification) TableName() string    { return "justifications" }
func (AttendanceAlert) TableName() string  { return "attendance_alerts" }
func (AttendanceQRCode) TableName() string { return "attendance_qrcodes" }

// Métodos de validación de negocio

// IsValidStatus verifica si el estado de asistencia es válido
func (ar *AttendanceRecord) IsValidStatus() bool {
	switch ar.Status {
	case AttendanceStatusPresente, AttendanceStatusAusente, AttendanceStatusJustificado, AttendanceStatusRetardo:
		return true
	default:
		return false
	}
}

// IsLate determina si la asistencia se marcó como tardía
func (ar *AttendanceRecord) IsLate() bool {
	return ar.Status == AttendanceStatusRetardo
}

// IsPresent determina si el estudiante estuvo presente
func (ar *AttendanceRecord) IsPresent() bool {
	return ar.Status == AttendanceStatusPresente || ar.Status == AttendanceStatusRetardo
}

// CanBeJustified verifica si una ausencia puede ser justificada
func (ar *AttendanceRecord) CanBeJustified() bool {
	return ar.Status == AttendanceStatusAusente
}

// IsQRMethod verifica si la asistencia fue registrada mediante QR
func (ar *AttendanceRecord) IsQRMethod() bool {
	return ar.Method == "QR_SCAN"
}

// IsManualMethod verifica si la asistencia fue registrada manualmente
func (ar *AttendanceRecord) IsManualMethod() bool {
	return ar.Method == "MANUAL"
}

// QRCode validation methods

// IsActiveAndValid verifica si el código QR está activo y válido
func (qr *AttendanceQRCode) IsActiveAndValid() bool {
	return qr.Status == QRCodeStatusActivo && time.Now().Before(qr.ExpiresAt)
}

// IsExpired verifica si el código QR ha expirado
func (qr *AttendanceQRCode) IsExpired() bool {
	return time.Now().After(qr.ExpiresAt) || qr.Status == QRCodeStatusExpirado
}

// CanBeUsed verifica si el código QR puede ser usado
func (qr *AttendanceQRCode) CanBeUsed() bool {
	return qr.Status == QRCodeStatusActivo && time.Now().Before(qr.ExpiresAt) && qr.IsActive
}

// MarkAsUsed marca el código QR como usado
func (qr *AttendanceQRCode) MarkAsUsed(scannerID uuid.UUID, location string) {
	now := time.Now()
	qr.Status = QRCodeStatusUsado
	qr.UsedAt = &now
	qr.ScannerID = &scannerID
	qr.Location = location
	qr.UpdatedAt = now
}

// MarkAsExpired marca el código QR como expirado
func (qr *AttendanceQRCode) MarkAsExpired() {
	now := time.Now()
	qr.Status = QRCodeStatusExpirado
	qr.UpdatedAt = now
}

// GenerateNewCode genera un nuevo código QR para el estudiante
func (qr *AttendanceQRCode) GenerateNewCode() {
	now := time.Now()
	// El código se regenera cada 15 segundos
	qr.ExpiresAt = now.Add(15 * time.Second)
	qr.Code = generateQRCode(qr.StudentID, qr.ScheduleID, now)
	qr.Status = QRCodeStatusActivo
	qr.UpdatedAt = now
}

// generateQRCode genera un código QR único basado en el estudiante, horario y tiempo
func generateQRCode(studentID, scheduleID uuid.UUID, timestamp time.Time) string {
	// Implementación simple - en producción usar una función de hash más robusta
	return fmt.Sprintf("QR_%s_%s_%d",
		studentID.String()[:8],
		scheduleID.String()[:8],
		timestamp.Unix())
}

// IsValidJustificationStatus verifica si el estado de justificación es válido
func (j *Justification) IsValidJustificationStatus() bool {
	switch j.Status {
	case JustificationStatusPendiente, JustificationStatusAprobada, JustificationStatusRechazada:
		return true
	default:
		return false
	}
}

// CanBeReviewed verifica si una justificación puede ser revisada
func (j *Justification) CanBeReviewed() bool {
	return j.Status == JustificationStatusPendiente
}

// IsApproved verifica si la justificación fue aprobada
func (j *Justification) IsApproved() bool {
	return j.Status == JustificationStatusAprobada
}

// IsValidAlertLevel verifica si el nivel de alerta es válido
func (aa *AttendanceAlert) IsValidAlertLevel() bool {
	switch aa.Level {
	case AlertLevelBajo, AlertLevelMedio, AlertLevelAlto, AlertLevelCritico:
		return true
	default:
		return false
	}
}

// IsValidAlertType verifica si el tipo de alerta es válido
func (aa *AttendanceAlert) IsValidAlertType() bool {
	switch aa.Type {
	case AlertTypeAusencia, AlertTypeRetardo, AlertTypePatron, AlertTypeConsecutivo, AlertTypePorcentaje, AlertTypePersonalizado:
		return true
	default:
		return false
	}
}

// IsCritical verifica si la alerta es crítica
func (aa *AttendanceAlert) IsCritical() bool {
	return aa.Level == AlertLevelCritico
}

// MarkAsRead marca la alerta como leída
func (aa *AttendanceAlert) MarkAsRead(userID uuid.UUID) {
	now := time.Now()
	aa.IsRead = true
	aa.ReadBy = &userID
	aa.ReadAt = &now
	aa.UpdatedAt = now
}

// AttendanceSummary representa un resumen de asistencia para un periodo
type AttendanceSummary struct {
	UserID            uuid.UUID `json:"user_id"`
	StartDate         time.Time `json:"start_date"`
	EndDate           time.Time `json:"end_date"`
	TotalScheduled    int       `json:"total_scheduled"`
	TotalPresent      int       `json:"total_present"`
	TotalAbsent       int       `json:"total_absent"`
	TotalJustified    int       `json:"total_justified"`
	TotalLate         int       `json:"total_late"`
	AttendanceRate    float64   `json:"attendance_rate"`
	PunctualityRate   float64   `json:"punctuality_rate"`
	AverageLateness   float64   `json:"average_lateness_minutes"`
	ConsecutiveAbsent int       `json:"consecutive_absent"`
}

// CalculateRates calcula las tasas de asistencia y puntualidad
func (as *AttendanceSummary) CalculateRates() {
	if as.TotalScheduled == 0 {
		as.AttendanceRate = 0
		as.PunctualityRate = 0
		return
	}

	// Tasa de asistencia: (Presentes + Tardíos + Justificados) / Total programado
	totalAttended := as.TotalPresent + as.TotalLate + as.TotalJustified
	as.AttendanceRate = float64(totalAttended) / float64(as.TotalScheduled) * 100

	// Tasa de puntualidad: Presentes / Total asistido
	if totalAttended > 0 {
		as.PunctualityRate = float64(as.TotalPresent) / float64(totalAttended) * 100
	} else {
		as.PunctualityRate = 0
	}
}

// IsValidStatus verifica si el estado de la justificación es válido
func (j *Justification) IsValidStatus() bool {
	switch j.Status {
	case JustificationStatusPendiente, JustificationStatusAprobada, JustificationStatusRechazada:
		return true
	default:
		return false
	}
}

// IsPending verifica si la justificación está pendiente
func (j *Justification) IsPending() bool {
	return j.Status == JustificationStatusPendiente
}

// Approve aprueba la justificación
func (j *Justification) Approve(reviewerID uuid.UUID) {
	now := time.Now()
	j.Status = JustificationStatusAprobada
	j.ReviewedBy = &reviewerID
	j.ReviewDate = &now
	j.UpdatedAt = now
}

// Reject rechaza la justificación
func (j *Justification) Reject(reviewerID uuid.UUID, comments string) {
	now := time.Now()
	j.Status = JustificationStatusRechazada
	j.ReviewedBy = &reviewerID
	j.ReviewDate = &now
	j.ReviewComments = comments
	j.UpdatedAt = now
}
