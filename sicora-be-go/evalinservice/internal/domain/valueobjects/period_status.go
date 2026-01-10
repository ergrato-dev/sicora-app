package valueobjects

// PeriodStatus representa el estado de un período de evaluación
type PeriodStatus string

const (
	PeriodStatusBorrador PeriodStatus = "BORRADOR" // Borrador, en preparación
	PeriodStatusActivo   PeriodStatus = "ACTIVO"   // Activo, acepta evaluaciones
	PeriodStatusCerrado  PeriodStatus = "CERRADO"  // Cerrado, no acepta más evaluaciones
)

// IsValid verifica si el estado del período es válido
func (ps PeriodStatus) IsValid() bool {
	switch ps {
	case PeriodStatusBorrador, PeriodStatusActivo, PeriodStatusCerrado:
		return true
	default:
		return false
	}
}

// String retorna la representación en string del estado
func (ps PeriodStatus) String() string {
	return string(ps)
}

// CanAcceptEvaluations indica si el período puede aceptar evaluaciones
func (ps PeriodStatus) CanAcceptEvaluations() bool {
	return ps == PeriodStatusActivo
}

// CanBeModified indica si el período puede ser modificado
func (ps PeriodStatus) CanBeModified() bool {
	return ps == PeriodStatusBorrador
}

// CanBeActivated indica si el período puede ser activado
func (ps PeriodStatus) CanBeActivated() bool {
	return ps == PeriodStatusBorrador
}

// CanBeClosed indica si el período puede ser cerrado
func (ps PeriodStatus) CanBeClosed() bool {
	return ps == PeriodStatusActivo
}
