package handlers

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/application/usecases"
	"evalinservice/internal/presentation/middleware"
)

// EvaluationHandler maneja las operaciones relacionadas con evaluaciones
type EvaluationHandler struct {
	*BaseHandler
	evaluationUseCase *usecases.EvaluationUseCase
}

// NewEvaluationHandler crea un nuevo handler de evaluaciones
func NewEvaluationHandler(
	logger *logrus.Logger,
	evaluationUseCase *usecases.EvaluationUseCase,
) *EvaluationHandler {
	return &EvaluationHandler{
		BaseHandler:       NewBaseHandler(logger),
		evaluationUseCase: evaluationUseCase,
	}
}

// CreateEvaluation crea una nueva evaluación
// @Summary Crear evaluación
// @Description Crea una nueva evaluación para un instructor en un período específico
// @Tags evaluations
// @Accept json
// @Produce json
// @Param evaluation body dtos.CreateEvaluationRequest true "Datos de la evaluación"
// @Success 201 {object} APIResponse{data=dtos.EvaluationResponse}
// @Failure 400 {object} APIResponse
// @Failure 401 {object} APIResponse
// @Failure 409 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/evaluations [post]
func (h *EvaluationHandler) CreateEvaluation(c *gin.Context) {
	ctx := context.Background()

	// Obtener datos validados
	validatedData, exists := middleware.GetValidatedData(c)
	if !exists {
		h.BadRequestResponse(c, "Invalid request data", nil)
		return
	}

	req, ok := validatedData.(*dtos.CreateEvaluationRequest)
	if !ok {
		h.BadRequestResponse(c, "Invalid request format", nil)
		return
	}

	// Obtener ID del usuario actual
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		h.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	// Establecer el estudiante como el usuario actual
	req.StudentID = userID

	// Crear la evaluación
	response, err := h.evaluationUseCase.CreateEvaluation(ctx, req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to create evaluation")

		// Manejar diferentes tipos de error
		switch err.Error() {
		case "evaluation already exists":
			h.ConflictResponse(c, "You have already evaluated this instructor for this period", nil)
		case "invalid period":
			h.BadRequestResponse(c, "The evaluation period is not active", nil)
		case "invalid instructor":
			h.BadRequestResponse(c, "The specified instructor is not valid", nil)
		default:
			h.InternalErrorResponse(c, "Failed to create evaluation", err)
		}
		return
	}

	h.CreatedResponse(c, "Evaluation created successfully", response)
}

// GetEvaluationByID obtiene una evaluación por su ID
// @Summary Obtener evaluación por ID
// @Description Obtiene los detalles de una evaluación específica
// @Tags evaluations
// @Produce json
// @Param id path string true "ID de la evaluación"
// @Success 200 {object} APIResponse{data=dtos.EvaluationResponse}
// @Failure 404 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/evaluations/{id} [get]
func (h *EvaluationHandler) GetEvaluationByID(c *gin.Context) {
	ctx := context.Background()

	// Obtener ID de la evaluación
	evaluationID, err := h.GetUserIDFromParams(c, "id")
	if err != nil {
		h.BadRequestResponse(c, "Invalid evaluation ID", nil)
		return
	}

	// Obtener la evaluación
	evaluation, err := h.evaluationUseCase.GetEvaluationByID(ctx, evaluationID)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get evaluation")
		h.InternalErrorResponse(c, "Failed to get evaluation", err)
		return
	}

	if evaluation == nil {
		h.NotFoundResponse(c, "Evaluation not found")
		return
	}

	h.SuccessResponse(c, "Evaluation retrieved successfully", evaluation)
}

// UpdateEvaluation actualiza una evaluación existente
// @Summary Actualizar evaluación
// @Description Actualiza los datos de una evaluación existente
// @Tags evaluations
// @Accept json
// @Produce json
// @Param id path string true "ID de la evaluación"
// @Param evaluation body dtos.UpdateEvaluationRequest true "Datos actualizados"
// @Success 200 {object} APIResponse{data=dtos.EvaluationResponse}
// @Failure 400 {object} APIResponse
// @Failure 404 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/evaluations/{id} [put]
func (h *EvaluationHandler) UpdateEvaluation(c *gin.Context) {
	ctx := context.Background()

	// Obtener ID de la evaluación
	evaluationID, err := h.GetUserIDFromParams(c, "id")
	if err != nil {
		h.BadRequestResponse(c, "Invalid evaluation ID", nil)
		return
	}

	// Obtener datos validados
	validatedData, exists := middleware.GetValidatedData(c)
	if !exists {
		h.BadRequestResponse(c, "Invalid request data", nil)
		return
	}

	req, ok := validatedData.(*dtos.UpdateEvaluationRequest)
	if !ok {
		h.BadRequestResponse(c, "Invalid request format", nil)
		return
	}

	// Actualizar la evaluación
	response, err := h.evaluationUseCase.UpdateEvaluation(ctx, evaluationID, req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to update evaluation")

		switch err.Error() {
		case "evaluation not found":
			h.NotFoundResponse(c, "Evaluation not found")
		case "evaluation completed":
			h.BadRequestResponse(c, "Cannot update a completed evaluation", nil)
		default:
			h.InternalErrorResponse(c, "Failed to update evaluation", err)
		}
		return
	}

	h.SuccessResponse(c, "Evaluation updated successfully", response)
}

// SubmitEvaluation envía una evaluación completada
// @Summary Enviar evaluación
// @Description Marca una evaluación como completada y la envía
// @Tags evaluations
// @Produce json
// @Param id path string true "ID de la evaluación"
// @Success 200 {object} APIResponse{data=dtos.EvaluationResponse}
// @Failure 400 {object} APIResponse
// @Failure 404 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/evaluations/{id}/submit [post]
func (h *EvaluationHandler) SubmitEvaluation(c *gin.Context) {
	ctx := context.Background()

	// Obtener ID de la evaluación
	evaluationID, err := h.GetUserIDFromParams(c, "id")
	if err != nil {
		h.BadRequestResponse(c, "Invalid evaluation ID", nil)
		return
	}

	// Enviar la evaluación
	response, err := h.evaluationUseCase.SubmitEvaluation(ctx, evaluationID)
	if err != nil {
		h.logger.WithError(err).Error("Failed to submit evaluation")

		switch err.Error() {
		case "evaluation not found":
			h.NotFoundResponse(c, "Evaluation not found")
		case "evaluation already submitted":
			h.BadRequestResponse(c, "Evaluation has already been submitted", nil)
		case "evaluation incomplete":
			h.BadRequestResponse(c, "Evaluation must be completed before submission", nil)
		default:
			h.InternalErrorResponse(c, "Failed to submit evaluation", err)
		}
		return
	}

	h.SuccessResponse(c, "Evaluation submitted successfully", response)
}

// GetMyEvaluations obtiene las evaluaciones del usuario actual
// @Summary Obtener mis evaluaciones
// @Description Obtiene todas las evaluaciones realizadas por el usuario actual
// @Tags evaluations
// @Produce json
// @Param page query int false "Página" default(1)
// @Param limit query int false "Límite por página" default(20)
// @Param status query string false "Filtrar por estado"
// @Success 200 {object} APIResponse{data=[]dtos.EvaluationResponse}
// @Failure 500 {object} APIResponse
// @Router /api/v1/evaluations/my [get]
func (h *EvaluationHandler) GetMyEvaluations(c *gin.Context) {
	ctx := context.Background()

	// Obtener ID del usuario actual
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		h.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	// Obtener parámetros de paginación
	pagination := h.GetPaginationParams(c)

	// Obtener filtros adicionales
	status := c.Query("status")

	// Obtener evaluaciones del usuario
	evaluations, total, err := h.evaluationUseCase.GetEvaluationsByStudent(ctx, userID, status, pagination.Page, pagination.Limit)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get user evaluations")
		h.InternalErrorResponse(c, "Failed to get evaluations", err)
		return
	}

	// Calcular metadatos
	meta := h.CalculateMeta(pagination.Page, pagination.Limit, total)

	h.SuccessResponseWithMeta(c, "Evaluations retrieved successfully", evaluations, meta)
}

// GetEvaluationsByInstructor obtiene evaluaciones de un instructor específico
// @Summary Obtener evaluaciones por instructor
// @Description Obtiene todas las evaluaciones de un instructor específico
// @Tags evaluations
// @Produce json
// @Param instructor_id path string true "ID del instructor"
// @Param page query int false "Página" default(1)
// @Param limit query int false "Límite por página" default(20)
// @Success 200 {object} APIResponse{data=[]dtos.EvaluationResponse}
// @Failure 400 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/evaluations/instructor/{instructor_id} [get]
func (h *EvaluationHandler) GetEvaluationsByInstructor(c *gin.Context) {
	ctx := context.Background()

	// Obtener ID del instructor
	instructorID, err := h.GetUserIDFromParams(c, "instructor_id")
	if err != nil {
		h.BadRequestResponse(c, "Invalid instructor ID", nil)
		return
	}

	// Obtener parámetros de paginación
	pagination := h.GetPaginationParams(c)

	// Obtener evaluaciones del instructor
	evaluations, total, err := h.evaluationUseCase.GetEvaluationsByInstructor(ctx, instructorID, pagination.Page, pagination.Limit)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get instructor evaluations")
		h.InternalErrorResponse(c, "Failed to get evaluations", err)
		return
	}

	// Calcular metadatos
	meta := h.CalculateMeta(pagination.Page, pagination.Limit, total)

	h.SuccessResponseWithMeta(c, "Instructor evaluations retrieved successfully", evaluations, meta)
}

// GetEvaluationStats obtiene estadísticas de evaluaciones
// @Summary Obtener estadísticas de evaluaciones
// @Description Obtiene estadísticas generales de evaluaciones por período
// @Tags evaluations
// @Produce json
// @Param period_id query string false "ID del período"
// @Success 200 {object} APIResponse{data=dtos.EvaluationStatsResponse}
// @Failure 500 {object} APIResponse
// @Router /api/v1/evaluations/stats [get]
func (h *EvaluationHandler) GetEvaluationStats(c *gin.Context) {
	ctx := context.Background()

	var periodID *uuid.UUID
	if periodIDStr := c.Query("period_id"); periodIDStr != "" {
		if id, err := uuid.Parse(periodIDStr); err == nil {
			periodID = &id
		} else {
			h.BadRequestResponse(c, "Invalid period ID", nil)
			return
		}
	}

	// Obtener estadísticas
	stats, err := h.evaluationUseCase.GetEvaluationStatistics(ctx, periodID)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get evaluation stats")
		h.InternalErrorResponse(c, "Failed to get statistics", err)
		return
	}

	h.SuccessResponse(c, "Statistics retrieved successfully", stats)
}
