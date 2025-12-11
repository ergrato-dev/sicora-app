package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/application/usecases"
)

const (
	ErrInvalidCommentID = "ID de comentario inválido"
	ErrInvalidUserID    = "ID de usuario inválido"
)

// CommentHandler maneja las solicitudes HTTP relacionadas con comentarios
type CommentHandler struct {
	*BaseHandler
	commentUseCase *usecases.CommentUseCase
}

// NewCommentHandler crea una nueva instancia de CommentHandler
func NewCommentHandler(logger *logrus.Logger, commentUseCase *usecases.CommentUseCase) *CommentHandler {
	return &CommentHandler{
		BaseHandler:    NewBaseHandler(logger),
		commentUseCase: commentUseCase,
	}
}

// CreateComment crea un nuevo comentario
func (h *CommentHandler) CreateComment(c *gin.Context) {
	var createReq dtos.CommentCreateRequest
	if err := c.ShouldBindJSON(&createReq); err != nil {
		h.BadRequestResponse(c, ErrInvalidInput, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, ErrInvalidUserID)
		return
	}

	comment, err := h.commentUseCase.CreateComment(c.Request.Context(), userUUID, &createReq)
	if err != nil {
		h.InternalErrorResponse(c, "Error al crear comentario", err)
		return
	}

	h.CreatedResponse(c, "Comentario creado exitosamente", comment)
}

// GetCommentByID obtiene un comentario por su ID
func (h *CommentHandler) GetCommentByID(c *gin.Context) {
	idStr := c.Param("id")
	commentID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidCommentID, err.Error())
		return
	}

	comment, err := h.commentUseCase.GetCommentByID(c.Request.Context(), commentID)
	if err != nil {
		h.NotFoundResponse(c, "Comentario no encontrado")
		return
	}

	h.SuccessResponse(c, "Comentario obtenido exitosamente", comment)
}

// GetCommentsByEvaluation obtiene los comentarios de una evaluación
func (h *CommentHandler) GetCommentsByEvaluation(c *gin.Context) {
	idStr := c.Param("evaluation_id")
	evaluationID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, "ID de evaluación inválido", err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, ErrInvalidUserID)
		return
	}

	// Verificar si debe incluir comentarios privados (admin o instructor)
	userRole, _ := c.Get("user_role")
	includePrivate := false
	if role, ok := userRole.(string); ok && (role == "admin" || role == "instructor") {
		includePrivate = true
	}

	comments, err := h.commentUseCase.GetCommentsByEvaluation(c.Request.Context(), evaluationID, includePrivate, &userUUID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener comentarios", err)
		return
	}

	h.SuccessResponse(c, "Comentarios obtenidos exitosamente", comments)
}

// UpdateComment actualiza un comentario
func (h *CommentHandler) UpdateComment(c *gin.Context) {
	idStr := c.Param("id")
	commentID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidCommentID, err.Error())
		return
	}

	var updateReq dtos.CommentUpdateRequest
	if err := c.ShouldBindJSON(&updateReq); err != nil {
		h.BadRequestResponse(c, ErrInvalidInput, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, ErrInvalidUserID)
		return
	}

	comment, err := h.commentUseCase.UpdateComment(c.Request.Context(), commentID, userUUID, &updateReq)
	if err != nil {
		h.InternalErrorResponse(c, "Error al actualizar comentario", err)
		return
	}

	h.SuccessResponse(c, "Comentario actualizado exitosamente", comment)
}

// DeleteComment elimina un comentario
func (h *CommentHandler) DeleteComment(c *gin.Context) {
	idStr := c.Param("id")
	commentID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidCommentID, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		h.UnauthorizedResponse(c, ErrUnauthorized)
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		h.UnauthorizedResponse(c, ErrInvalidUserID)
		return
	}

	err = h.commentUseCase.DeleteComment(c.Request.Context(), commentID, userUUID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al eliminar comentario", err)
		return
	}

	h.SuccessResponse(c, "Comentario eliminado exitosamente", nil)
}

// GetCommentStats obtiene estadísticas de comentarios
func (h *CommentHandler) GetCommentStats(c *gin.Context) {
	// Verificar si se especifica una evaluación específica
	var evaluationID *uuid.UUID
	if evalIDStr := c.Query("evaluation_id"); evalIDStr != "" {
		if evalID, err := uuid.Parse(evalIDStr); err == nil {
			evaluationID = &evalID
		}
	}

	stats, err := h.commentUseCase.GetCommentStats(c.Request.Context(), evaluationID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener estadísticas", err)
		return
	}

	h.SuccessResponse(c, "Estadísticas obtenidas exitosamente", stats)
}
