package valueobjects

// ReportType representa el tipo de reporte
type ReportType string

const (
	ReportTypeRendimientoInstructor ReportType = "RENDIMIENTO_INSTRUCTOR" // Rendimiento por instructor
	ReportTypeResumenPeriodo        ReportType = "RESUMEN_PERIODO"        // Resumen de período
	ReportTypeComparativo           ReportType = "COMPARATIVO"            // Comparativo entre períodos
	ReportTypeDetallado             ReportType = "DETALLADO"              // Reporte detallado
	ReportTypeEjecutivo             ReportType = "EJECUTIVO"              // Resumen ejecutivo
)

// IsValid verifica si el tipo de reporte es válido
func (rt ReportType) IsValid() bool {
	switch rt {
	case ReportTypeRendimientoInstructor, ReportTypeResumenPeriodo, ReportTypeComparativo, ReportTypeDetallado, ReportTypeEjecutivo:
		return true
	default:
		return false
	}
}

// String retorna la representación en string del tipo
func (rt ReportType) String() string {
	return string(rt)
}

// GetAllReportTypes retorna todos los tipos de reporte válidos
func GetAllReportTypes() []ReportType {
	return []ReportType{
		ReportTypeRendimientoInstructor,
		ReportTypeResumenPeriodo,
		ReportTypeComparativo,
		ReportTypeDetallado,
		ReportTypeEjecutivo,
	}
}
