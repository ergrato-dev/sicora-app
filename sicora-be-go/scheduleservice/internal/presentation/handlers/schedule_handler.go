package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"scheduleservice/internal/application/dtos"
	"scheduleservice/internal/application/usecases"
	"scheduleservice/internal/domain/repositories"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ScheduleHandler maneja las operaciones HTTP para horarios
type ScheduleHandler struct {
	createUseCase *usecases.CreateScheduleUseCase
	getUseCase    *usecases.GetScheduleUseCase
	updateUseCase *usecases.UpdateScheduleUseCase
	deleteUseCase *usecases.DeleteScheduleUseCase
	listUseCase   *usecases.ListSchedulesUseCase
	bulkUseCases  *usecases.BulkScheduleUseCases
	logger        *log.Logger
}

// NewScheduleHandler crea una nueva instancia del handler
func NewScheduleHandler(
	createUseCase *usecases.CreateScheduleUseCase,
	getUseCase *usecases.GetScheduleUseCase,
	updateUseCase *usecases.UpdateScheduleUseCase,
	deleteUseCase *usecases.DeleteScheduleUseCase,
	listUseCase *usecases.ListSchedulesUseCase,
	bulkUseCases *usecases.BulkScheduleUseCases,
	logger *log.Logger,
) *ScheduleHandler {
	return &ScheduleHandler{
		createUseCase: createUseCase,
		getUseCase:    getUseCase,
		updateUseCase: updateUseCase,
		deleteUseCase: deleteUseCase,
		listUseCase:   listUseCase,
		bulkUseCases:  bulkUseCases,
		logger:        logger,
	}
}

// CreateSchedule crea un nuevo horario
// @Summary Crear horario
// @Description Crea un nuevo horario en el sistema
// @Tags schedules
// @Accept json
// @Produce json
// @Param schedule body dtos.CreateScheduleRequest true "Datos del horario"
// @Success 201 {object} dtos.ScheduleResponse
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 409 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /schedules [post]
// @Security BearerAuth
func (h *ScheduleHandler) CreateSchedule(c *gin.Context) {
	var req dtos.CreateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	schedule, err := h.createUseCase.Execute(c.Request.Context(), &req)
	if err != nil {
		h.logger.Printf("Error creating schedule: %v", err)

		// Determine error type for appropriate HTTP status
		if contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if contains(err.Error(), "conflict") || contains(err.Error(), "already exists") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if contains(err.Error(), "validation") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	h.logger.Printf("Schedule created successfully: %s", schedule.ID)
	c.JSON(http.StatusCreated, schedule)
}

// GetSchedule obtiene un horario por ID
// @Summary Obtener horario
// @Description Obtiene un horario específico por su ID
// @Tags schedules
// @Accept json
// @Produce json
// @Param id path string true "ID del horario"
// @Success 200 {object} dtos.ScheduleResponse
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /schedules/{id} [get]
// @Security BearerAuth
func (h *ScheduleHandler) GetSchedule(c *gin.Context) {
	idParam := c.Param("id")
	scheduleID, err := uuid.Parse(idParam)
	if err != nil {
		h.logger.Printf("Invalid schedule ID format: %s", idParam)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID format"})
		return
	}

	schedule, err := h.getUseCase.Execute(c.Request.Context(), scheduleID)
	if err != nil {
		h.logger.Printf("Error getting schedule %s: %v", scheduleID, err)

		if contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

// UpdateSchedule actualiza un horario existente
// @Summary Actualizar horario
// @Description Actualiza un horario existente
// @Tags schedules
// @Accept json
// @Produce json
// @Param id path string true "ID del horario"
// @Param schedule body dtos.UpdateScheduleRequest true "Datos a actualizar"
// @Success 200 {object} dtos.ScheduleResponse
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 409 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /schedules/{id} [put]
// @Security BearerAuth
func (h *ScheduleHandler) UpdateSchedule(c *gin.Context) {
	idParam := c.Param("id")
	scheduleID, err := uuid.Parse(idParam)
	if err != nil {
		h.logger.Printf("Invalid schedule ID format: %s", idParam)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID format"})
		return
	}

	var req dtos.UpdateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	schedule, err := h.updateUseCase.Execute(c.Request.Context(), scheduleID, &req)
	if err != nil {
		h.logger.Printf("Error updating schedule %s: %v", scheduleID, err)

		if contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
			return
		}
		if contains(err.Error(), "conflict") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if contains(err.Error(), "validation") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	h.logger.Printf("Schedule updated successfully: %s", scheduleID)
	c.JSON(http.StatusOK, schedule)
}

// DeleteSchedule elimina un horario
// @Summary Eliminar horario
// @Description Elimina un horario del sistema
// @Tags schedules
// @Accept json
// @Produce json
// @Param id path string true "ID del horario"
// @Success 204 "No Content"
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /schedules/{id} [delete]
// @Security BearerAuth
func (h *ScheduleHandler) DeleteSchedule(c *gin.Context) {
	idParam := c.Param("id")
	scheduleID, err := uuid.Parse(idParam)
	if err != nil {
		h.logger.Printf("Invalid schedule ID format: %s", idParam)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID format"})
		return
	}

	err = h.deleteUseCase.Execute(c.Request.Context(), scheduleID)
	if err != nil {
		h.logger.Printf("Error deleting schedule %s: %v", scheduleID, err)

		if contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	h.logger.Printf("Schedule deleted successfully: %s", scheduleID)
	c.JSON(http.StatusNoContent, nil)
}

// ListSchedules lista horarios con filtros y paginación
// @Summary Listar horarios
// @Description Lista horarios con filtros opcionales y paginación
// @Tags schedules
// @Accept json
// @Produce json
// @Param page query int false "Número de página" default(1)
// @Param page_size query int false "Tamaño de página" default(10)
// @Param academic_group_id query string false "Filtrar por grupo académico"
// @Param instructor_id query string false "Filtrar por instructor"
// @Param venue_id query string false "Filtrar por ambiente"
// @Param day_of_week query int false "Filtrar por día de la semana (1-7)"
// @Param status query string false "Filtrar por estado" Enums(ACTIVE, CANCELLED, SUSPENDED)
// @Success 200 {object} dtos.PaginatedResponse[dtos.ScheduleResponse]
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /schedules [get]
// @Security BearerAuth
func (h *ScheduleHandler) ListSchedules(c *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	// Parse filter parameters
	var academicGroupID *uuid.UUID
	if groupIDStr := c.Query("academic_group_id"); groupIDStr != "" {
		if id, err := uuid.Parse(groupIDStr); err == nil {
			academicGroupID = &id
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid academic_group_id format"})
			return
		}
	}

	var instructorID *uuid.UUID
	if instructorIDStr := c.Query("instructor_id"); instructorIDStr != "" {
		if id, err := uuid.Parse(instructorIDStr); err == nil {
			instructorID = &id
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instructor_id format"})
			return
		}
	}

	var venueID *uuid.UUID
	if venueIDStr := c.Query("venue_id"); venueIDStr != "" {
		if id, err := uuid.Parse(venueIDStr); err == nil {
			venueID = &id
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid venue_id format"})
			return
		}
	}

	var dayOfWeek *int
	if dayStr := c.Query("day_of_week"); dayStr != "" {
		if day, err := strconv.Atoi(dayStr); err == nil && day >= 1 && day <= 7 {
			dayOfWeek = &day
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid day_of_week, must be 1-7"})
			return
		}
	}

	status := c.Query("status")
	if status != "" && status != "ACTIVO" && status != "CANCELADO" && status != "SUSPENDIDO" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status, must be ACTIVO, CANCELADO, or SUSPENDIDO"})
		return
	}

	req := &dtos.ListSchedulesRequest{
		Page:            page,
		PageSize:        pageSize,
		AcademicGroupID: academicGroupID,
		InstructorID:    instructorID,
		VenueID:         venueID,
		DayOfWeek:       dayOfWeek,
		Status:          status,
	}

	// Convertir DTO a filtro del repositorio
	filter := repositories.ScheduleFilter{
		BaseFilter: repositories.BaseFilter{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
		InstructorID:    req.InstructorID,
		AcademicGroupID: req.AcademicGroupID,
		VenueID:         req.VenueID,
		DayOfWeek:       req.DayOfWeek,
		Status:          req.Status,
	}

	result, err := h.listUseCase.Execute(c.Request.Context(), filter)
	if err != nil {
		h.logger.Printf("Error listing schedules: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// BulkCreateSchedules crea múltiples horarios en una operación
// @Summary Crear horarios masivamente
// @Description Crea múltiples horarios en una sola operación
// @Tags schedules,bulk
// @Accept json
// @Produce json
// @Param schedules body dtos.BulkCreateSchedulesRequest true "Lista de horarios a crear"
// @Success 200 {object} dtos.BulkCreateSchedulesResponse
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /schedules/bulk [post]
// @Security BearerAuth
func (h *ScheduleHandler) BulkCreateSchedules(c *gin.Context) {
	var req dtos.BulkCreateSchedulesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Printf("Error binding JSON for bulk create: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	if len(req.Schedules) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No schedules provided"})
		return
	}

	if len(req.Schedules) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 100 schedules allowed per bulk operation"})
		return
	}

	h.logger.Printf("Processing bulk create for %d schedules", len(req.Schedules))

	result, err := h.bulkUseCases.BulkCreateSchedules(c.Request.Context(), &req)
	if err != nil {
		h.logger.Printf("Error in bulk create schedules: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error", "details": err.Error()})
		return
	}

	// Determine appropriate status code based on results
	statusCode := http.StatusOK
	if result.Errors > 0 && result.Succeeded == 0 {
		statusCode = http.StatusBadRequest
	} else if result.Errors > 0 && result.Succeeded > 0 {
		statusCode = http.StatusMultiStatus
	}

	h.logger.Printf("Bulk create completed: %d succeeded, %d failed", result.Succeeded, result.Errors)
	c.JSON(statusCode, result)
}

// UploadSchedulesCSV procesa carga masiva desde archivo CSV
// @Summary Cargar horarios desde CSV
// @Description Procesa un archivo CSV para crear múltiples horarios
// @Tags schedules,bulk
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Archivo CSV con horarios"
// @Success 200 {object} dtos.CSVUploadResponse
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /schedules/upload-csv [post]
// @Security BearerAuth
func (h *ScheduleHandler) UploadSchedulesCSV(c *gin.Context) {
	file, fileHeader, err := c.Request.FormFile("file")
	if err != nil {
		h.logger.Printf("Error getting file from request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided or invalid file"})
		return
	}
	defer file.Close()

	// Validate file extension
	if !contains(fileHeader.Filename, ".csv") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File must be a CSV file"})
		return
	}

	// Validate file size (max 5MB)
	if fileHeader.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size too large, maximum 5MB allowed"})
		return
	}

	h.logger.Printf("Processing CSV upload: %s (%d bytes)", fileHeader.Filename, fileHeader.Size)

	result, err := h.bulkUseCases.ProcessCSVUpload(c.Request.Context(), file)
	if err != nil {
		h.logger.Printf("Error processing CSV upload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error processing CSV file", "details": err.Error()})
		return
	}

	// Determine appropriate status code
	statusCode := http.StatusOK
	if result.ErrorRows > 0 && result.SuccessRows == 0 {
		statusCode = http.StatusBadRequest
	} else if result.ErrorRows > 0 && result.SuccessRows > 0 {
		statusCode = http.StatusMultiStatus
	}

	h.logger.Printf("CSV upload completed: %d processed, %d succeeded, %d failed",
		result.ProcessedRows, result.SuccessRows, result.ErrorRows)

	c.JSON(statusCode, result)
}

// Helper function to check if string contains substring
func contains(str, substr string) bool {
	return strings.Contains(str, substr)
}
