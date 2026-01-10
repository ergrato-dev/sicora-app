package valueobjects

// NotificationType representa los tipos de notificaciones del sistema
type NotificationType string

const (
	NotificationTypeEvaluacionCreada      NotificationType = "EVALUACION_CREADA"
	NotificationTypeEvaluacionActualizada NotificationType = "EVALUACION_ACTUALIZADA"
	NotificationTypeEvaluacionCompletada  NotificationType = "EVALUACION_COMPLETADA"
	NotificationTypePeriodoIniciado       NotificationType = "PERIODO_INICIADO"
	NotificationTypePeriodoFinalizado     NotificationType = "PERIODO_FINALIZADO"
	NotificationTypeReporteGenerado       NotificationType = "REPORTE_GENERADO"
	NotificationTypeComentarioAgregado    NotificationType = "COMENTARIO_AGREGADO"
)

// IsValid verifica si el tipo de notificación es válido
func (nt NotificationType) IsValid() bool {
	switch nt {
	case NotificationTypeEvaluacionCreada, NotificationTypeEvaluacionActualizada, NotificationTypeEvaluacionCompletada,
		NotificationTypePeriodoIniciado, NotificationTypePeriodoFinalizado, NotificationTypeReporteGenerado,
		NotificationTypeComentarioAgregado:
		return true
	default:
		return false
	}
}

// String retorna la representación en string del tipo de notificación
func (nt NotificationType) String() string {
	return string(nt)
}

// GetAllNotificationTypes retorna todos los tipos de notificación válidos
func GetAllNotificationTypes() []NotificationType {
	return []NotificationType{
		NotificationTypeEvaluacionCreada,
		NotificationTypeEvaluacionActualizada,
		NotificationTypeEvaluacionCompletada,
		NotificationTypePeriodoIniciado,
		NotificationTypePeriodoFinalizado,
		NotificationTypeReporteGenerado,
		NotificationTypeComentarioAgregado,
	}
}
