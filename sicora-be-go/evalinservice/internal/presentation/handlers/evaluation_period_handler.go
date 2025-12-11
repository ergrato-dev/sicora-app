package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/application/usecases"
	"evalinservice/internal/presentation/middleware"
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

// UpdatePeriod actualiza un período existente
func (h *EvaluationPeriodHandler) UpdatePeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.HandleError(c, http.StatusBadRequest, "ID de período inválido", err)
		return
	}

	var updateDTO dtos.UpdateEvaluationPeriodDTO
	if err := c.ShouldBindJSON(&updateDTO); err != nil {
		h.HandleError(c, http.StatusBadRequest, "Datos de entrada inválidos", err)
		return
	}

	userClaims := middleware.GetUserFromContext(c)
	if userClaims == nil {
		h.HandleError(c, http.StatusUnauthorized, "Usuario no autenticado", nil)
		return
	}

	updateDTO.UpdatedBy = userClaims.UserID

	period, err := h.periodUseCase.UpdatePeriod(periodID, &updateDTO)
	if err != nil {
		h.HandleError(c, http.StatusInternalServerError, "Error al actualizar período", err)
		return
	}

	h.HandleSuccess(c, http.StatusOK, "Período actualizado exitosamente", period)
}

// DeletePeriod elimina un período
func (h *EvaluationPeriodHandler) DeletePeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.HandleError(c, http.StatusBadRequest, "ID de período inválido", err)
		return
	}

	userClaims := middleware.GetUserFromContext(c)
	if userClaims == nil {
		h.HandleError(c, http.StatusUnauthorized, "Usuario no autenticado", nil)
		return
	}

	err = h.periodUseCase.DeletePeriod(periodID, userClaims.UserID)
	if err != nil {
		h.HandleError(c, http.StatusInternalServerError, "Error al eliminar período", err)
		return
	}

	h.HandleSuccess(c, http.StatusOK, "Período eliminado exitosamente", nil)
}

// StartPeriod inicia un período de evaluación
func (h *EvaluationPeriodHandler) StartPeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.HandleError(c, http.StatusBadRequest, "ID de período inválido", err)
		return
	}

	userClaims := middleware.GetUserFromContext(c)
	if userClaims == nil {
		h.HandleError(c, http.StatusUnauthorized, "Usuario no autenticado", nil)
		return
	}

	err = h.periodUseCase.StartPeriod(periodID, userClaims.UserID)
	if err != nil {
		h.HandleError(c, http.StatusInternalServerError, "Error al iniciar período", err)
		return
	}

	h.HandleSuccess(c, http.StatusOK, "Período iniciado exitosamente", nil)
}

// EndPeriod finaliza un período de evaluación
func (h *EvaluationPeriodHandler) EndPeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.HandleError(c, http.StatusBadRequest, "ID de período inválido", err)
		return
	}

	userClaims := middleware.GetUserFromContext(c)
	if userClaims == nil {
		h.HandleError(c, http.StatusUnauthorized, "Usuario no autenticado", nil)
		return
	}

	err = h.periodUseCase.EndPeriod(periodID, userClaims.UserID)
	if err != nil {
		h.HandleError(c, http.StatusInternalServerError, "Error al finalizar período", err)
		return
	}

	h.HandleSuccess(c, http.StatusOK, "Período finalizado exitosamente", nil)
}

// ExtendPeriod extiende la fecha de finalización de un período
func (h *EvaluationPeriodHandler) ExtendPeriod(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.HandleError(c, http.StatusBadRequest, "ID de período inválido", err)
		return
	}

	var req struct {
		NewEndDate time.Time `json:"new_end_date" binding:"required"`
		Reason     string    `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.HandleError(c, http.StatusBadRequest, "Datos de entrada inválidos", err)
		return
	}

	userClaims := middleware.GetUserFromContext(c)
	if userClaims == nil {
		h.HandleError(c, http.StatusUnauthorized, "Usuario no autenticado", nil)
		return
	}

	err = h.periodUseCase.ExtendPeriod(periodID, req.NewEndDate, req.Reason, userClaims.UserID)
	if err != nil {
		h.HandleError(c, http.StatusInternalServerError, "Error al extender período", err)
		return
	}

	h.HandleSuccess(c, http.StatusOK, "Período extendido exitosamente", nil)
}

// GetPeriodStats obtiene estadísticas de un período
func (h *EvaluationPeriodHandler) GetPeriodStats(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.HandleError(c, http.StatusBadRequest, "ID de período inválido", err)
		return
	}

	stats, err := h.periodUseCase.GetPeriodStats(periodID)
	if err != nil {
		h.HandleError(c, http.StatusInternalServerError, "Error al obtener estadísticas del período", err)
		return
	}

	h.HandleSuccess(c, http.StatusOK, "Estadísticas obtenidas exitosamente", stats)
}

// GetPeriodEvaluations obtiene las evaluaciones de un período
func (h *EvaluationPeriodHandler) GetPeriodEvaluations(c *gin.Context) {
	idStr := c.Param("id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.HandleError(c, http.StatusBadRequest, "ID de período inválido", err)
		return
	}

	page, limit := h.GetPaginationParams(c)

	evaluations, total, err := h.periodUseCase.GetPeriodEvaluations(periodID, page, limit)
	if err != nil {
		h.HandleError(c, http.StatusInternalServerError, "Error al obtener evaluaciones del período", err)
		return
	}

	response := h.CreatePaginatedResponse(evaluations, page, limit, total)
	h.HandleSuccess(c, http.StatusOK, "Evaluaciones del período obtenidas exitosamente", response)
}

// GetPeriodsForInstructor obtiene los períodos de un instructor específico
func (h *EvaluationPeriodHandler) GetPeriodsForInstructor(c *gin.Context) {
	instructorIDStr := c.Param("instructor_id")
	instructorID, err := uuid.Parse(instructorIDStr)
	if err != nil {
		h.HandleError(c, http.StatusBadRequest, "ID de instructor inválido", err)
		return
	}

	page, limit := h.GetPaginationParams(c)

	periods, total, err := h.periodUseCase.GetPeriodsForInstructor(instructorID, page, limit)
	if err != nil {
		h.HandleError(c, http.StatusInternalServerError, "Error al obtener períodos del instructor", err)
		return
	}

	response := h.CreatePaginatedResponse(periods, page, limit, total)
	h.HandleSuccess(c, http.StatusOK, "Períodos del instructor obtenidos exitosamente", response)
}
