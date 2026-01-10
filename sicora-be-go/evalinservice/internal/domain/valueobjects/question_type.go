package valueobjects

// QuestionType representa los tipos de preguntas disponibles
type QuestionType string

const (
	QuestionTypeEscalaLikert      QuestionType = "ESCALA_LIKERT"      // Escala 1-5
	QuestionTypeTexto             QuestionType = "TEXTO"              // Respuesta libre
	QuestionTypeSeleccionMultiple QuestionType = "SELECCION_MULTIPLE" // Selección múltiple
	QuestionTypeSeleccionUnica    QuestionType = "SELECCION_UNICA"    // Selección única
	QuestionTypeSiNo              QuestionType = "SI_NO"              // Sí/No
)

// IsValid verifica si el tipo de pregunta es válido
func (qt QuestionType) IsValid() bool {
	switch qt {
	case QuestionTypeEscalaLikert, QuestionTypeTexto, QuestionTypeSeleccionMultiple, QuestionTypeSeleccionUnica, QuestionTypeSiNo:
		return true
	default:
		return false
	}
}

// String retorna la representación en string del tipo de pregunta
func (qt QuestionType) String() string {
	return string(qt)
}

// GetValidOptions retorna las opciones válidas para el tipo de pregunta
func (qt QuestionType) GetValidOptions() []string {
	switch qt {
	case QuestionTypeEscalaLikert:
		return []string{"1", "2", "3", "4", "5"}
	case QuestionTypeSiNo:
		return []string{"SI", "NO"}
	case QuestionTypeSeleccionMultiple, QuestionTypeSeleccionUnica:
		// Se definen en la pregunta específica
		return nil
	case QuestionTypeTexto:
		// Respuesta libre
		return nil
	default:
		return nil
	}
}

// RequiresOptions indica si el tipo de pregunta requiere opciones predefinidas
func (qt QuestionType) RequiresOptions() bool {
	return qt == QuestionTypeSeleccionMultiple || qt == QuestionTypeSeleccionUnica
}

// AllowsMultipleAnswers indica si el tipo permite múltiples respuestas
func (qt QuestionType) AllowsMultipleAnswers() bool {
	return qt == QuestionTypeSeleccionMultiple
}
