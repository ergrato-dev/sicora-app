package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/application/usecases"
)

// QuestionnaireHandler maneja las solicitudes HTTP relacionadas con cuestionarios
type QuestionnaireHandler struct {
	*BaseHandler
	questionnaireUseCase *usecases.QuestionnaireUseCase
}

// NewQuestionnaireHandler crea una nueva instancia de QuestionnaireHandler
func NewQuestionnaireHandler(logger *logrus.Logger, questionnaireUseCase *usecases.QuestionnaireUseCase) *QuestionnaireHandler {
	return &QuestionnaireHandler{
		BaseHandler:          NewBaseHandler(logger),
		questionnaireUseCase: questionnaireUseCase,
	}
}

// CreateQuestionnaire crea un nuevo cuestionario
func (h *QuestionnaireHandler) CreateQuestionnaire(c *gin.Context) {
	var createDTO dtos.QuestionnaireCreateDTO
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

	questionnaire, err := h.questionnaireUseCase.CreateQuestionnaire(c.Request.Context(), &createDTO)
	if err != nil {
		h.InternalErrorResponse(c, "Error al crear cuestionario", err)
		return
	}

	h.CreatedResponse(c, "Cuestionario creado exitosamente", questionnaire)
}

// GetQuestionnaireByID obtiene un cuestionario por su ID
func (h *QuestionnaireHandler) GetQuestionnaireByID(c *gin.Context) {
	idStr := c.Param("id")
	questionnaireID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de cuestionario inválido", err.Error())
		return
	}

	questionnaire, err := h.questionnaireUseCase.GetQuestionnaireByID(c.Request.Context(), questionnaireID)
	if err != nil {
		h.NotFoundResponse(c, "Cuestionario no encontrado")
		return
	}

	h.SuccessResponse(c, "Cuestionario obtenido exitosamente", questionnaire)
}

// GetActiveQuestionnaires obtiene todos los cuestionarios activos
func (h *QuestionnaireHandler) GetActiveQuestionnaires(c *gin.Context) {
	questionnaires, err := h.questionnaireUseCase.GetActiveQuestionnaires(c.Request.Context())
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener cuestionarios activos", err)
		return
	}

	h.SuccessResponse(c, "Cuestionarios activos obtenidos exitosamente", questionnaires)
}

// GetAllQuestionnaires obtiene todos los cuestionarios (activos e inactivos)
func (h *QuestionnaireHandler) GetAllQuestionnaires(c *gin.Context) {
	// Por ahora retornar solo los activos - TODO: implementar paginación completa
	questionnaires, err := h.questionnaireUseCase.GetActiveQuestionnaires(c.Request.Context())
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener cuestionarios", err)
		return
	}

	h.SuccessResponse(c, "Cuestionarios obtenidos exitosamente", questionnaires)
}

// UpdateQuestionnaire actualiza un cuestionario existente
func (h *QuestionnaireHandler) UpdateQuestionnaire(c *gin.Context) {
	idStr := c.Param("id")
	questionnaireID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de cuestionario inválido", err.Error())
		return
	}

	var updateDTO dtos.QuestionnaireUpdateDTO
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

	questionnaire, err := h.questionnaireUseCase.UpdateQuestionnaire(c.Request.Context(), questionnaireID, &updateDTO)
	if err != nil {
		h.InternalErrorResponse(c, "Error al actualizar cuestionario", err)
		return
	}

	h.SuccessResponse(c, "Cuestionario actualizado exitosamente", questionnaire)
}

// DeleteQuestionnaire elimina un cuestionario
func (h *QuestionnaireHandler) DeleteQuestionnaire(c *gin.Context) {
	idStr := c.Param("id")
	questionnaireID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de cuestionario inválido", err.Error())
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

	err = h.questionnaireUseCase.DeleteQuestionnaire(c.Request.Context(), questionnaireID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al eliminar cuestionario", err)
		return
	}

	h.SuccessResponse(c, "Cuestionario eliminado exitosamente", nil)
}

// GetQuestionnaireWithQuestions obtiene un cuestionario con sus preguntas
func (h *QuestionnaireHandler) GetQuestionnaireWithQuestions(c *gin.Context) {
	idStr := c.Param("id")
	questionnaireID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de cuestionario inválido", err.Error())
		return
	}

	questionnaire, err := h.questionnaireUseCase.GetQuestionnaireWithQuestions(c.Request.Context(), questionnaireID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener cuestionario con preguntas", err)
		return
	}

	h.SuccessResponse(c, "Cuestionario con preguntas obtenido exitosamente", questionnaire)
}

// AddQuestionToQuestionnaire agrega una pregunta a un cuestionario
func (h *QuestionnaireHandler) AddQuestionToQuestionnaire(c *gin.Context) {
	idStr := c.Param("id")
	questionnaireID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de cuestionario inválido", err.Error())
		return
	}

	var req dtos.AddQuestionToQuestionnaireDTO
	if err := c.ShouldBindJSON(&req); err != nil {
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

	err = h.questionnaireUseCase.AddQuestionToQuestionnaire(c.Request.Context(), questionnaireID, req.QuestionID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al agregar pregunta al cuestionario", err)
		return
	}

	h.SuccessResponse(c, "Pregunta agregada al cuestionario exitosamente", nil)
}

// RemoveQuestionFromQuestionnaire remueve una pregunta de un cuestionario
func (h *QuestionnaireHandler) RemoveQuestionFromQuestionnaire(c *gin.Context) {
	idStr := c.Param("id")
	questionnaireID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de cuestionario inválido", err.Error())
		return
	}

	questionIDStr := c.Param("question_id")
	questionID, err := uuid.Parse(questionIDStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de pregunta inválido", err.Error())
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

	err = h.questionnaireUseCase.RemoveQuestionFromQuestionnaire(c.Request.Context(), questionnaireID, questionID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al remover pregunta del cuestionario", err)
		return
	}

	h.SuccessResponse(c, "Pregunta removida del cuestionario exitosamente", nil)
}
