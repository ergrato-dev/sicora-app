package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/application/usecases"
)

const (
	ErrInvalidConfigID = "ID de configuración inválido"
)

// ConfigurationHandler maneja las solicitudes HTTP relacionadas con configuración
type ConfigurationHandler struct {
	*BaseHandler
	configUseCase *usecases.ConfigurationUseCase
}

// NewConfigurationHandler crea una nueva instancia de ConfigurationHandler
func NewConfigurationHandler(logger *logrus.Logger, configUseCase *usecases.ConfigurationUseCase) *ConfigurationHandler {
	return &ConfigurationHandler{
		BaseHandler:   NewBaseHandler(logger),
		configUseCase: configUseCase,
	}
}

// CreateConfiguration crea una nueva configuración
func (h *ConfigurationHandler) CreateConfiguration(c *gin.Context) {
	var createReq dtos.ConfigurationCreateRequest
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

	config, err := h.configUseCase.CreateConfiguration(c.Request.Context(), &createReq, userUUID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al crear configuración", err)
		return
	}

	h.CreatedResponse(c, "Configuración creada exitosamente", config)
}

// GetConfigurationByID obtiene una configuración por su ID
func (h *ConfigurationHandler) GetConfigurationByID(c *gin.Context) {
	idStr := c.Param("id")
	configID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidConfigID, err.Error())
		return
	}

	config, err := h.configUseCase.GetConfigurationByID(c.Request.Context(), configID)
	if err != nil {
		h.NotFoundResponse(c, "Configuración no encontrada")
		return
	}

	h.SuccessResponse(c, "Configuración obtenida exitosamente", config)
}

// GetConfigurationByKey obtiene una configuración por su clave
func (h *ConfigurationHandler) GetConfigurationByKey(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		h.BadRequestResponse(c, "Clave de configuración requerida", nil)
		return
	}

	config, err := h.configUseCase.GetConfigurationByKey(c.Request.Context(), key)
	if err != nil {
		h.NotFoundResponse(c, "Configuración no encontrada")
		return
	}

	h.SuccessResponse(c, "Configuración obtenida exitosamente", config)
}

// GetAllConfigurations obtiene todas las configuraciones
func (h *ConfigurationHandler) GetAllConfigurations(c *gin.Context) {
	configs, err := h.configUseCase.GetAllConfigurations(c.Request.Context())
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener configuraciones", err)
		return
	}

	h.SuccessResponse(c, "Configuraciones obtenidas exitosamente", configs)
}

// GetActiveConfigurations obtiene solo las configuraciones activas
func (h *ConfigurationHandler) GetActiveConfigurations(c *gin.Context) {
	configs, err := h.configUseCase.GetActiveConfigurations(c.Request.Context())
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener configuraciones activas", err)
		return
	}

	h.SuccessResponse(c, "Configuraciones activas obtenidas exitosamente", configs)
}

// GetConfigurationsByCategory obtiene configuraciones por categoría
func (h *ConfigurationHandler) GetConfigurationsByCategory(c *gin.Context) {
	category := c.Param("category")
	if category == "" {
		h.BadRequestResponse(c, "Categoría requerida", nil)
		return
	}

	configs, err := h.configUseCase.GetConfigurationsByCategory(c.Request.Context(), category)
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener configuraciones por categoría", err)
		return
	}

	h.SuccessResponse(c, "Configuraciones obtenidas exitosamente", configs)
}

// UpdateConfiguration actualiza una configuración
func (h *ConfigurationHandler) UpdateConfiguration(c *gin.Context) {
	idStr := c.Param("id")
	configID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidConfigID, err.Error())
		return
	}

	var updateReq dtos.ConfigurationUpdateRequest
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

	config, err := h.configUseCase.UpdateConfiguration(c.Request.Context(), configID, &updateReq, userUUID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al actualizar configuración", err)
		return
	}

	h.SuccessResponse(c, "Configuración actualizada exitosamente", config)
}

// DeleteConfiguration elimina una configuración
func (h *ConfigurationHandler) DeleteConfiguration(c *gin.Context) {
	idStr := c.Param("id")
	configID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidConfigID, err.Error())
		return
	}

	err = h.configUseCase.DeleteConfiguration(c.Request.Context(), configID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al eliminar configuración", err)
		return
	}

	h.SuccessResponse(c, "Configuración eliminada exitosamente", nil)
}

// BulkUpdateConfigurations actualiza múltiples configuraciones
func (h *ConfigurationHandler) BulkUpdateConfigurations(c *gin.Context) {
	var bulkReq dtos.ConfigurationBulkUpdateRequest
	if err := c.ShouldBindJSON(&bulkReq); err != nil {
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

	err := h.configUseCase.BulkUpdateConfigurations(c.Request.Context(), &bulkReq, userUUID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al actualizar configuraciones", err)
		return
	}

	h.SuccessResponse(c, "Configuraciones actualizadas exitosamente", gin.H{
		"updated_count": len(bulkReq.Configurations),
	})
}

// GetValueByKey obtiene solo el valor de una configuración por su clave
func (h *ConfigurationHandler) GetValueByKey(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		h.BadRequestResponse(c, "Clave de configuración requerida", nil)
		return
	}

	value, err := h.configUseCase.GetValueByKey(c.Request.Context(), key)
	if err != nil {
		h.NotFoundResponse(c, "Configuración no encontrada")
		return
	}

	h.SuccessResponse(c, "Valor obtenido exitosamente", gin.H{
		"key":   key,
		"value": value,
	})
}
