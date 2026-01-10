package repositories

import (
	"context"
	"database/sql"
	"time"

	"attendanceservice/internal/domain/entities"
	"attendanceservice/internal/domain/repositories"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type qrCodeRepository struct {
	db *gorm.DB
}

// NewQRCodeRepository crea una nueva instancia del repositorio de códigos QR
func NewQRCodeRepository(db *gorm.DB) repositories.QRCodeRepository {
	return &qrCodeRepository{
		db: db,
	}
}

// Create crea un nuevo código QR
func (r *qrCodeRepository) Create(ctx context.Context, qrCode *entities.AttendanceQRCode) error {
	return r.db.WithContext(ctx).Create(qrCode).Error
}

// GetByID obtiene un código QR por su ID
func (r *qrCodeRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.AttendanceQRCode, error) {
	var qrCode entities.AttendanceQRCode
	err := r.db.WithContext(ctx).Where("id = ? AND is_active = ?", id, true).First(&qrCode).Error
	if err != nil {
		return nil, err
	}
	return &qrCode, nil
}

// GetByCode obtiene un código QR por su código
func (r *qrCodeRepository) GetByCode(ctx context.Context, code string) (*entities.AttendanceQRCode, error) {
	var qrCode entities.AttendanceQRCode
	err := r.db.WithContext(ctx).Where("code = ? AND is_active = ?", code, true).First(&qrCode).Error
	if err != nil {
		return nil, err
	}
	return &qrCode, nil
}

// GetActiveByStudent obtiene el código QR activo de un estudiante para un horario
func (r *qrCodeRepository) GetActiveByStudent(ctx context.Context, studentID, scheduleID uuid.UUID) (*entities.AttendanceQRCode, error) {
	var qrCode entities.AttendanceQRCode
	err := r.db.WithContext(ctx).Where(
		"student_id = ? AND schedule_id = ? AND status = ? AND is_active = ? AND expires_at > ?",
		studentID, scheduleID, entities.QRCodeStatusActivo, true, time.Now(),
	).First(&qrCode).Error

	if err != nil {
		return nil, err
	}
	return &qrCode, nil
}

// GetByStudentAndSchedule obtiene todos los códigos QR de un estudiante para un horario
func (r *qrCodeRepository) GetByStudentAndSchedule(ctx context.Context, studentID, scheduleID uuid.UUID) ([]*entities.AttendanceQRCode, error) {
	var qrCodes []*entities.AttendanceQRCode
	err := r.db.WithContext(ctx).Where(
		"student_id = ? AND schedule_id = ? AND is_active = ?",
		studentID, scheduleID, true,
	).Order("created_at DESC").Find(&qrCodes).Error

	return qrCodes, err
}

// Update actualiza un código QR
func (r *qrCodeRepository) Update(ctx context.Context, qrCode *entities.AttendanceQRCode) error {
	qrCode.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(qrCode).Error
}

// Delete elimina un código QR (soft delete)
func (r *qrCodeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&entities.AttendanceQRCode{}).
		Where("id = ?", id).
		Update("is_active", false).Error
}

// ExpireOldCodes marca como expirados los códigos que han sobrepasado su tiempo
func (r *qrCodeRepository) ExpireOldCodes(ctx context.Context) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&entities.AttendanceQRCode{}).
		Where("expires_at < ? AND status = ? AND is_active = ?", now, entities.QRCodeStatusActivo, true).
		Updates(map[string]interface{}{
			"status":     entities.QRCodeStatusExpirado,
			"updated_at": now,
		}).Error
}

// GetExpiredCodes obtiene códigos QR expirados para limpieza
func (r *qrCodeRepository) GetExpiredCodes(ctx context.Context, olderThan time.Time) ([]*entities.AttendanceQRCode, error) {
	var qrCodes []*entities.AttendanceQRCode
	err := r.db.WithContext(ctx).Where(
		"expires_at < ? AND status IN (?) AND is_active = ?",
		olderThan, []entities.QRCodeStatus{entities.QRCodeStatusExpirado, entities.QRCodeStatusUsado}, true,
	).Find(&qrCodes).Error

	return qrCodes, err
}

// BulkCreate crea múltiples códigos QR
func (r *qrCodeRepository) BulkCreate(ctx context.Context, qrCodes []*entities.AttendanceQRCode) error {
	return r.db.WithContext(ctx).CreateInBatches(qrCodes, 100).Error
}

// GetActiveBySchedule obtiene todos los códigos QR activos para un horario
func (r *qrCodeRepository) GetActiveBySchedule(ctx context.Context, scheduleID uuid.UUID) ([]*entities.AttendanceQRCode, error) {
	var qrCodes []*entities.AttendanceQRCode
	err := r.db.WithContext(ctx).Where(
		"schedule_id = ? AND status = ? AND is_active = ? AND expires_at > ?",
		scheduleID, entities.QRCodeStatusActivo, true, time.Now(),
	).Find(&qrCodes).Error

	return qrCodes, err
}

// DeactivateByStudent desactiva todos los códigos QR de un estudiante
func (r *qrCodeRepository) DeactivateByStudent(ctx context.Context, studentID uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&entities.AttendanceQRCode{}).
		Where("student_id = ? AND is_active = ?", studentID, true).
		Updates(map[string]interface{}{
			"is_active":  false,
			"status":     entities.QRCodeStatusExpirado,
			"updated_at": now,
		}).Error
}

// GetUsageStats obtiene estadísticas de uso de códigos QR
func (r *qrCodeRepository) GetUsageStats(ctx context.Context, scheduleID uuid.UUID, startDate, endDate time.Time) (*repositories.QRUsageStats, error) {
	stats := &repositories.QRUsageStats{
		ScheduleID: scheduleID,
		UsageByDay: make(map[string]int),
	}

	// Total generados
	err := r.db.WithContext(ctx).Model(&entities.AttendanceQRCode{}).
		Where("schedule_id = ? AND created_at BETWEEN ? AND ?", scheduleID, startDate, endDate).
		Count(&stats.TotalGenerated).Error
	if err != nil {
		return nil, err
	}

	// Total usados
	err = r.db.WithContext(ctx).Model(&entities.AttendanceQRCode{}).
		Where("schedule_id = ? AND status = ? AND created_at BETWEEN ? AND ?",
			scheduleID, entities.QRCodeStatusUsado, startDate, endDate).
		Count(&stats.TotalUsed).Error
	if err != nil {
		return nil, err
	}

	// Total expirados
	err = r.db.WithContext(ctx).Model(&entities.AttendanceQRCode{}).
		Where("schedule_id = ? AND status = ? AND created_at BETWEEN ? AND ?",
			scheduleID, entities.QRCodeStatusExpirado, startDate, endDate).
		Count(&stats.TotalExpired).Error
	if err != nil {
		return nil, err
	}

	// Calcular tasa de uso
	if stats.TotalGenerated > 0 {
		stats.UsageRate = float64(stats.TotalUsed) / float64(stats.TotalGenerated) * 100
	}

	// Tiempo promedio de uso (en segundos desde creación hasta uso)
	var avgUsageTime sql.NullFloat64
	err = r.db.WithContext(ctx).Raw(`
		SELECT AVG(EXTRACT(EPOCH FROM (used_at - created_at))) 
		FROM attendance_qrcodes 
		WHERE schedule_id = ? AND status = ? AND used_at IS NOT NULL 
		AND created_at BETWEEN ? AND ?`,
		scheduleID, entities.QRCodeStatusUsado, startDate, endDate).Scan(&avgUsageTime).Error

	if err == nil && avgUsageTime.Valid {
		stats.AverageUsageTime = avgUsageTime.Float64
	}

	// Hora pico de uso
	var peakHour sql.NullInt64
	err = r.db.WithContext(ctx).Raw(`
		SELECT EXTRACT(HOUR FROM used_at) as hour
		FROM attendance_qrcodes 
		WHERE schedule_id = ? AND status = ? AND used_at IS NOT NULL 
		AND created_at BETWEEN ? AND ?
		GROUP BY EXTRACT(HOUR FROM used_at)
		ORDER BY COUNT(*) DESC
		LIMIT 1`,
		scheduleID, entities.QRCodeStatusUsado, startDate, endDate).Scan(&peakHour).Error

	if err == nil && peakHour.Valid {
		stats.PeakUsageHour = int(peakHour.Int64)
	}

	// Uso por día
	rows, err := r.db.WithContext(ctx).Raw(`
		SELECT DATE(used_at) as day, COUNT(*) as count
		FROM attendance_qrcodes 
		WHERE schedule_id = ? AND status = ? AND used_at IS NOT NULL 
		AND created_at BETWEEN ? AND ?
		GROUP BY DATE(used_at)
		ORDER BY day`,
		scheduleID, entities.QRCodeStatusUsado, startDate, endDate).Rows()

	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var day string
			var count int
			if err := rows.Scan(&day, &count); err == nil {
				stats.UsageByDay[day] = count
			}
		}
	}

	return stats, nil
}
