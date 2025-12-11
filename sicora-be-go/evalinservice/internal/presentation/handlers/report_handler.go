package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/dtos"
	"evalinservice/internal/application/usecases"
)

const (
	ErrInvalidReportID = "ID de reporte inválido"
)

// ReportHandler maneja las solicitudes HTTP relacionadas con reportes
type ReportHandler struct {
	*BaseHandler
	reportUseCase *usecases.ReportUseCase
}

// NewReportHandler crea una nueva instancia de ReportHandler
func NewReportHandler(logger *logrus.Logger, reportUseCase *usecases.ReportUseCase) *ReportHandler {
	return &ReportHandler{
		BaseHandler:   NewBaseHandler(logger),
		reportUseCase: reportUseCase,
	}
}

// CreateReport crea un nuevo reporte
func (h *ReportHandler) CreateReport(c *gin.Context) {
	var createReq dtos.ReportCreateRequest
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

	report, err := h.reportUseCase.CreateReport(c.Request.Context(), &createReq, userUUID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al crear reporte", err)
		return
	}

	h.CreatedResponse(c, "Reporte creado exitosamente", report)
}

// GetReportByID obtiene un reporte por su ID
func (h *ReportHandler) GetReportByID(c *gin.Context) {
	idStr := c.Param("id")
	reportID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidReportID, err.Error())
		return
	}

	report, err := h.reportUseCase.GetReportByID(c.Request.Context(), reportID)
	if err != nil {
		h.NotFoundResponse(c, "Reporte no encontrado")
		return
	}

	h.SuccessResponse(c, "Reporte obtenido exitosamente", report)
}

// GetReportsByPeriod obtiene los reportes de un período específico
func (h *ReportHandler) GetReportsByPeriod(c *gin.Context) {
	idStr := c.Param("period_id")
	periodID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidPeriodID, err.Error())
		return
	}

	reports, err := h.reportUseCase.GetReportsByPeriod(c.Request.Context(), periodID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener reportes del período", err)
		return
	}

	h.SuccessResponse(c, "Reportes del período obtenidos exitosamente", reports)
}

// DeleteReport elimina un reporte
func (h *ReportHandler) DeleteReport(c *gin.Context) {
	idStr := c.Param("id")
	reportID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidReportID, err.Error())
		return
	}

	err = h.reportUseCase.DeleteReport(c.Request.Context(), reportID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al eliminar reporte", err)
		return
	}

	h.SuccessResponse(c, "Reporte eliminado exitosamente", nil)
}

// GenerateReport genera un reporte
func (h *ReportHandler) GenerateReport(c *gin.Context) {
	idStr := c.Param("id")
	reportID, err := uuid.Parse(idStr)
	if err != nil {
		h.BadRequestResponse(c, ErrInvalidReportID, err.Error())
		return
	}

	err = h.reportUseCase.GenerateReport(c.Request.Context(), reportID)
	if err != nil {
		h.InternalErrorResponse(c, "Error al generar reporte", err)
		return
	}

	h.SuccessResponse(c, "Generación de reporte iniciada", gin.H{
		"report_id": reportID,
		"status":    "processing",
	})
}

// GetPendingReports obtiene reportes pendientes
func (h *ReportHandler) GetPendingReports(c *gin.Context) {
	reports, err := h.reportUseCase.GetPendingReports(c.Request.Context())
	if err != nil {
		h.InternalErrorResponse(c, "Error al obtener reportes pendientes", err)
		return
	}

	h.SuccessResponse(c, "Reportes pendientes obtenidos exitosamente", reports)
}
