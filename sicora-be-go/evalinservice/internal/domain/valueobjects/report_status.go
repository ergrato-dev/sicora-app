package valueobjects

// ReportStatus representa el estado de generación de un reporte
type ReportStatus string

const (
	ReportStatusPendiente  ReportStatus = "PENDIENTE"  // En cola para generar
	ReportStatusGenerando  ReportStatus = "GENERANDO"  // En proceso de generación
	ReportStatusCompletado ReportStatus = "COMPLETADO" // Generación completada
	ReportStatusFallido    ReportStatus = "FALLIDO"    // Falló la generación
)

// IsValid verifica si el estado del reporte es válido
func (rs ReportStatus) IsValid() bool {
	switch rs {
	case ReportStatusPendiente, ReportStatusGenerando, ReportStatusCompletado, ReportStatusFallido:
		return true
	default:
		return false
	}
}

// String retorna la representación en string del estado
func (rs ReportStatus) String() string {
	return string(rs)
}

// GetAllReportStatuses retorna todos los estados de reporte válidos
func GetAllReportStatuses() []ReportStatus {
	return []ReportStatus{
		ReportStatusPendiente,
		ReportStatusGenerando,
		ReportStatusCompletado,
		ReportStatusFallido,
	}
}
