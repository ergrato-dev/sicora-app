package handlers

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/application/usecases"
	"evalinservice/internal/presentation/middleware"
)

// QuestionHandler maneja las operaciones relacionadas con preguntas
type QuestionHandler struct {
	*BaseHandler
	questionUseCase *usecases.QuestionUseCase
}

// NewQuestionHandler crea un nuevo handler de preguntas
func NewQuestionHandler(
	logger *logrus.Logger,
	questionUseCase *usecases.QuestionUseCase,
) *QuestionHandler {
	return &QuestionHandler{
		BaseHandler:     NewBaseHandler(logger),
		questionUseCase: questionUseCase,
	}
}

// CreateQuestion crea una nueva pregunta
// @Summary Crear pregunta
// @Description Crea una nueva pregunta para evaluaciones
// @Tags questions
// @Accept json
// @Produce json
// @Param question body dtos.CreateQuestionRequest true "Datos de la pregunta"
// @Success 201 {object} APIResponse{data=dtos.QuestionResponse}
// @Failure 400 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/questions [post]
func (h *QuestionHandler) CreateQuestion(c *gin.Context) {
	ctx := context.Background()

	// Obtener datos validados
	validatedData, exists := middleware.GetValidatedData(c)
	if !exists {
		h.BadRequestResponse(c, "Invalid request data", nil)
		return
	}

	req, ok := validatedData.(*dtos.CreateQuestionRequest)
	if !ok {
		h.BadRequestResponse(c, "Invalid request format", nil)
		return
	}

	// Crear la pregunta
	response, err := h.questionUseCase.CreateQuestion(ctx, req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to create question")
		h.InternalErrorResponse(c, "Failed to create question", err)
		return
	}

	h.CreatedResponse(c, "Question created successfully", response)
}

// GetQuestionByID obtiene una pregunta por su ID
// @Summary Obtener pregunta por ID
// @Description Obtiene los detalles de una pregunta específica
// @Tags questions
// @Produce json
// @Param id path string true "ID de la pregunta"
// @Success 200 {object} APIResponse{data=dtos.QuestionResponse}
// @Failure 404 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/questions/{id} [get]
func (h *QuestionHandler) GetQuestionByID(c *gin.Context) {
	ctx := context.Background()

	// Obtener ID de la pregunta
	questionID, err := h.GetUserIDFromParams(c, "id")
	if err != nil {
		h.BadRequestResponse(c, "Invalid question ID", nil)
		return
	}

	// Obtener la pregunta
	question, err := h.questionUseCase.GetQuestionByID(ctx, questionID)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get question")
		h.InternalErrorResponse(c, "Failed to get question", err)
		return
	}

	if question == nil {
		h.NotFoundResponse(c, "Question not found")
		return
	}

	h.SuccessResponse(c, "Question retrieved successfully", question)
}

// GetAllQuestions obtiene todas las preguntas con filtros
// @Summary Obtener todas las preguntas
// @Description Obtiene una lista de preguntas con filtros opcionales
// @Tags questions
// @Produce json
// @Param page query int false "Página" default(1)
// @Param limit query int false "Límite por página" default(20)
// @Param category query string false "Filtrar por categoría"
// @Param active query bool false "Filtrar por estado activo"
// @Success 200 {object} APIResponse{data=[]dtos.QuestionResponse}
// @Failure 500 {object} APIResponse
// @Router /api/v1/questions [get]
func (h *QuestionHandler) GetAllQuestions(c *gin.Context) {
	ctx := context.Background()

	// Obtener parámetros de paginación
	pagination := h.GetPaginationParams(c)

	// Obtener filtros
	category := c.Query("category")
	activeStr := c.Query("active")
	var active *bool
	if activeStr == "true" {
		val := true
		active = &val
	} else if activeStr == "false" {
		val := false
		active = &val
	}

	// Crear filtros para QuestionFilterRequest
	filters := &dtos.QuestionFilterRequest{
		Category: category,
		IsActive: active,
		Page:     pagination.Page,
		PerPage:  pagination.Limit,
	}

	// Obtener preguntas
	questions, err := h.questionUseCase.GetQuestions(ctx, filters)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get questions")
		h.InternalErrorResponse(c, "Failed to get questions", err)
		return
	}

	// Retornar respuesta
	h.SuccessResponse(c, "Questions retrieved successfully", questions)
}

// UpdateQuestion actualiza una pregunta existente
// @Summary Actualizar pregunta
// @Description Actualiza los datos de una pregunta existente
// @Tags questions
// @Accept json
// @Produce json
// @Param id path string true "ID de la pregunta"
// @Param question body dtos.UpdateQuestionRequest true "Datos actualizados"
// @Success 200 {object} APIResponse{data=dtos.QuestionResponse}
// @Failure 400 {object} APIResponse
// @Failure 404 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/questions/{id} [put]
func (h *QuestionHandler) UpdateQuestion(c *gin.Context) {
	ctx := context.Background()

	// Obtener ID de la pregunta
	questionID, err := h.GetUserIDFromParams(c, "id")
	if err != nil {
		h.BadRequestResponse(c, "Invalid question ID", nil)
		return
	}

	// Obtener datos validados
	validatedData, exists := middleware.GetValidatedData(c)
	if !exists {
		h.BadRequestResponse(c, "Invalid request data", nil)
		return
	}

	req, ok := validatedData.(*dtos.UpdateQuestionRequest)
	if !ok {
		h.BadRequestResponse(c, "Invalid request format", nil)
		return
	}

	// Actualizar la pregunta
	response, err := h.questionUseCase.UpdateQuestion(ctx, questionID, req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to update question")

		if err.Error() == "question not found" {
			h.NotFoundResponse(c, "Question not found")
		} else {
			h.InternalErrorResponse(c, "Failed to update question", err)
		}
		return
	}

	h.SuccessResponse(c, "Question updated successfully", response)
}

// DeleteQuestion elimina una pregunta (soft delete)
// @Summary Eliminar pregunta
// @Description Elimina una pregunta del sistema (soft delete)
// @Tags questions
// @Produce json
// @Param id path string true "ID de la pregunta"
// @Success 200 {object} APIResponse
// @Failure 400 {object} APIResponse
// @Failure 404 {object} APIResponse
// @Failure 500 {object} APIResponse
// @Router /api/v1/questions/{id} [delete]
func (h *QuestionHandler) DeleteQuestion(c *gin.Context) {
	ctx := context.Background()

	// Obtener ID de la pregunta
	questionID, err := h.GetUserIDFromParams(c, "id")
	if err != nil {
		h.BadRequestResponse(c, "Invalid question ID", nil)
		return
	}

	// Eliminar la pregunta
	err = h.questionUseCase.DeleteQuestion(ctx, questionID)
	if err != nil {
		h.logger.WithError(err).Error("Failed to delete question")

		switch err.Error() {
		case "question not found":
			h.NotFoundResponse(c, "Question not found")
		case "question in use":
			h.ConflictResponse(c, "Cannot delete question because it is being used in questionnaires", nil)
		default:
			h.InternalErrorResponse(c, "Failed to delete question", err)
		}
		return
	}

	h.SuccessResponse(c, "Question deleted successfully", nil)
}

// GetActiveQuestions obtiene solo las preguntas activas
// @Summary Obtener preguntas activas
// @Description Obtiene una lista de preguntas activas disponibles
// @Tags questions
// @Produce json
// @Param category query string false "Filtrar por categoría"
// @Success 200 {object} APIResponse{data=[]dtos.QuestionResponse}
// @Failure 500 {object} APIResponse
// @Router /api/v1/questions/active [get]
func (h *QuestionHandler) GetActiveQuestions(c *gin.Context) {
	ctx := context.Background()

	// Obtener filtro de categoría
	category := c.Query("category")

	// Obtener preguntas activas
	questions, err := h.questionUseCase.GetActiveQuestions(ctx)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get active questions")
		h.InternalErrorResponse(c, "Failed to get active questions", err)
		return
	}

	// Si hay filtro de categoría, filtrar en memoria
	if category != "" {
		var filtered []*dtos.QuestionResponse
		for _, q := range questions {
			if q.Category == category {
				filtered = append(filtered, q)
			}
		}
		questions = filtered
	}

	h.SuccessResponse(c, "Active questions retrieved successfully", questions)
}

// GetQuestionsByCategory obtiene preguntas por categoría
// @Summary Obtener preguntas por categoría
// @Description Obtiene preguntas filtradas por una categoría específica
// @Tags questions
// @Produce json
// @Param category path string true "Categoría de las preguntas"
// @Param active query bool false "Solo preguntas activas" default(true)
// @Success 200 {object} APIResponse{data=[]dtos.QuestionResponse}
// @Failure 500 {object} APIResponse
// @Router /api/v1/questions/category/{category} [get]
func (h *QuestionHandler) GetQuestionsByCategory(c *gin.Context) {
	ctx := context.Background()

	// Obtener categoría
	category := c.Param("category")
	if category == "" {
		h.BadRequestResponse(c, "Category is required", nil)
		return
	}

	// Verificar si solo se quieren preguntas activas
	activeOnly := c.DefaultQuery("active", "true") == "true"

	// Obtener preguntas por categoría
	var questions []*dtos.QuestionResponse
	var err error

	if activeOnly {
		allQuestions, err2 := h.questionUseCase.GetActiveQuestions(ctx)
		if err2 != nil {
			err = err2
		} else {
			// Filtrar por categoría
			for _, q := range allQuestions {
				if q.Category == category {
					questions = append(questions, q)
				}
			}
		}
	} else {
		// Para obtener todas las preguntas de una categoría (activas e inactivas)
		filters := &dtos.QuestionFilterRequest{
			Category: category,
			Page:     1,
			PerPage:  1000, // Límite alto para obtener todas
		}
		questions, err = h.questionUseCase.GetQuestions(ctx, filters)
	}

	if err != nil {
		h.logger.WithError(err).Error("Failed to get questions by category")
		h.InternalErrorResponse(c, "Failed to get questions", err)
		return
	}

	h.SuccessResponse(c, "Questions retrieved successfully", questions)
}
