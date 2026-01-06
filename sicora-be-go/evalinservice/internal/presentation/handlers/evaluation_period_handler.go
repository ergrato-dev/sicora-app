package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/application/usecases"
)

const (
	ErrInvalidInput    = "Datos de entrada inválidos"
	ErrUnauthorized    = "Usuario no autenticado"
	ErrInvalidPeriodID = "ID de período inválido"
)

// EvaluationPeriodHandler maneja las solicitudes HTTP relacionadas con períodos de evaluación
type EvaluationPeriodHandler struct {
	*BaseHandler
	periodUseCase *usecases.EvaluationPeriodUseCase
}

// NewEvaluationPeriodHandler crea una nueva instancia de EvaluationPeriodHandler
func NewEvaluationPeriodHandler(logger *logrus.Logger, periodUseCase *usecases.EvaluationPeriodUseCase) *EvaluationPeriodHandler {
	return &EvaluationPeriodHandler{
		BaseHandler:   NewBaseHandler(logger),
		periodUseCase: periodUseCase,
	}
}

// CreatePeriod crea un nuevo período de evaluación
func (h *EvaluationPeriodHandler) CreatePeriod(c *gin.Context) {
	var createDTO dtos.EvaluationPeriodCreateDTO
	if err := c.ShouldBindJSON(&createDTO); err != nil {
		h.BadRequestResponse(c, ErrInvalidInput, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	_, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, "ID de usuario inválido")
		return
	}

	period, err := h.periodUseCase.CreatePeriod(c.Request.Context(), &createDTO)
	if err != nil {
		h.InternalErrorResponse(c, "Error al crear período", err)
		return
	}

	h.CreatedResponse(c, "Período creado exitosamente", period)
}

// GetPeriodByID obtiene un período por su ID
func (h *EvaluationPeriodHandler) GetPeriodByID(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidPeriodID, err.Error())
		return
	}

	period, err := h.periodUseCase.GetPeriodByID(c.Request.Context(), periodID)
	if err != nil {
		h.NotFoundResponse(c, "Período no encontrado")
		return
	}

	h.SuccessResponse(c, "Período obtenido exitosamente", period)
}

// GetActivePeriods obtiene todos los períodos activos
func (h *EvaluationPeriodHandler) GetActivePeriods(c *gin.Context) {
	periods, err := h.periodUseCase.GetActivePeriods(c.Request.Context())
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener períodos activos", err)
		return
	}

	h.SuccessResponse(c, "Períodos activos obtenidos exitosamente", periods)
}

// GetCurrentPeriods obtiene los períodos actuales
func (h *EvaluationPeriodHandler) GetCurrentPeriods(c *gin.Context) {
	periods, err := h.periodUseCase.GetCurrentPeriods(c.Request.Context())
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener períodos actuales", err)
		return
	}

	h.SuccessResponse(c, "Períodos actuales obtenidos exitosamente", periods)
}

// UpdatePeriod actualiza un período existente
func (h *EvaluationPeriodHandler) UpdatePeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidPeriodID, err.Error())
		return
	}

	var updateDTO dtos.EvaluationPeriodUpdateDTO
	if err := c.ShouldBindJSON(&updateDTO); err != nil {
		h.BadRequestResponse(c, ErrInvalidInput, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	_, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, "ID de usuario inválido")
		return
	}

	period, err := h.periodUseCase.UpdatePeriod(c.Request.Context(), periodID, &updateDTO)
	if err != nil {
		h.InternalErrorResponse(c, "Error al actualizar período", err)
		return
	}

	h.SuccessResponse(c, "Período actualizado exitosamente", period)
}

// DeletePeriod elimina un período
func (h *EvaluationPeriodHandler) DeletePeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidPeriodID, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	_, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, "ID de usuario inválido")
		return
	}

	err = h.periodUseCase.DeletePeriod(c.Request.Context(), periodID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al eliminar período", err)
		return
	}

	h.SuccessResponse(c, "Período eliminado exitosamente", nil)
}

// ActivatePeriod activa un período de evaluación
func (h *EvaluationPeriodHandler) ActivatePeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidPeriodID, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	_, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, "ID de usuario inválido")
		return
	}

	period, err := h.periodUseCase.ActivatePeriod(c.Request.Context(), periodID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al activar período", err)
		return
	}

	h.SuccessResponse(c, "Período activado exitosamente", period)
}

// ClosePeriod finaliza un período de evaluación
func (h *EvaluationPeriodHandler) ClosePeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidPeriodID, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	_, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, "ID de usuario inválido")
		return
	}

	period, err := h.periodUseCase.ClosePeriod(c.Request.Context(), periodID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al finalizar período", err)
		return
	}

	h.SuccessResponse(c, "Período finalizado exitosamente", period)
}

// GetPeriodsByFicha obtiene los períodos de una ficha específica
func (h *EvaluationPeriodHandler) GetPeriodsByFicha(c *gin.Context) {
	fichaID := c.Param("ficha_id")
	if fichaID == "" {
		h.BadRequestResponse(c, "ID de ficha inválido", nil)
		return
	}

	periods, err := h.periodUseCase.GetPeriodsByFicha(c.Request.Context(), fichaID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener períodos de la ficha", err)
		return
	}

	h.SuccessResponse(c, "Períodos de la ficha obtenidos exitosamente", periods)
}

// GetPeriodEvaluations obtiene las evaluaciones de un período específico
func (h *EvaluationPeriodHandler) GetPeriodEvaluations(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de período inválido", err.Error())
		return
	}

	// TODO: Implementar lógica para obtener evaluaciones del período
	// Por ahora retornar un stub
	h.SuccessResponse(c, "Evaluaciones del período obtenidas exitosamente", gin.H{
		"period_id":   periodID,
		"evaluations": []interface{}{},
		"message":     "Funcionalidad pendiente de implementación",
	})
}

// GetPeriodsForInstructor obtiene los períodos asignados a un instructor
func (h *EvaluationPeriodHandler) GetPeriodsForInstructor(c *gin.Context) {
	instructorIDStr := c.Param("instructor_id")
	_, err := uuid.Parse(instructorIDStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de instructor inválido", err.Error())
		return
	}

	// TODO: Implementar lógica para obtener períodos del instructor
	// Por ahora retornar un stub
	h.SuccessResponse(c, "Períodos del instructor obtenidos exitosamente", gin.H{
		"instructor_id": instructorIDStr,
		"periods":       []interface{}{},
		"message":       "Funcionalidad pendiente de implementación",
	})
}

// GetPeriodStats obtiene estadísticas de un período específico
func (h *EvaluationPeriodHandler) GetPeriodStats(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de período inválido", err.Error())
		return
	}

	// TODO: Implementar lógica para obtener estadísticas del período
	// Por ahora retornar un stub
	h.SuccessResponse(c, "Estadísticas del período obtenidas exitosamente", gin.H{
		"period_id":         periodID,
		"total_evaluations": 0,
		"completed":         0,
		"pending":           0,
		"completion_rate":   0.0,
		"message":           "Funcionalidad pendiente de implementación",
	})
}
