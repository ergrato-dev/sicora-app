package valueobjects

// EvaluationStatus representa el estado de una evaluación
type EvaluationStatus string

const (
	EvaluationStatusBorrador   EvaluationStatus = "BORRADOR"   // Borrador, en progreso
	EvaluationStatusEnviada    EvaluationStatus = "ENVIADA"    // Enviada, completa
	EvaluationStatusValidada   EvaluationStatus = "VALIDADA"   // Validada por administrador
	EvaluationStatusCompletada EvaluationStatus = "COMPLETADA" // Completada (alias para enviada)
	EvaluationStatusPendiente  EvaluationStatus = "PENDIENTE"  // Pendiente
)

// IsValid verifica si el estado de la evaluación es válido
func (es EvaluationStatus) IsValid() bool {
	switch es {
	case EvaluationStatusBorrador, EvaluationStatusEnviada, EvaluationStatusValidada, EvaluationStatusCompletada, EvaluationStatusPendiente:
		return true
	default:
		return false
	}
}

// String retorna la representación en string del estado
func (es EvaluationStatus) String() string {
	return string(es)
}

// CanBeModified indica si la evaluación puede ser modificada
func (es EvaluationStatus) CanBeModified() bool {
	return es == EvaluationStatusBorrador
}

// CanBeSubmitted indica si la evaluación puede ser enviada
func (es EvaluationStatus) CanBeSubmitted() bool {
	return es == EvaluationStatusBorrador
}

// CanBeValidated indica si la evaluación puede ser validada
func (es EvaluationStatus) CanBeValidated() bool {
	return es == EvaluationStatusEnviada
}

// IsComplete indica si la evaluación está completa
func (es EvaluationStatus) IsComplete() bool {
	return es == EvaluationStatusEnviada || es == EvaluationStatusValidada
}
