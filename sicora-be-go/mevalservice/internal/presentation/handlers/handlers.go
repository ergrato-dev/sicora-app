package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mevalservice/internal/application/dto"
	"mevalservice/internal/application/usecases"
)

// Error constants
const (
	ErrInvalidRequest = "Invalid request"
	ErrInvalidID      = "Invalid ID"
)

type CommitteeHandler struct {
	committeeUC usecases.CommitteeUseCases
}

func NewCommitteeHandler(committeeUC usecases.CommitteeUseCases) *CommitteeHandler {
	return &CommitteeHandler{
		committeeUC: committeeUC,
	}
}

// CreateCommittee creates a new committee
// @Summary Create a new committee
// @Description Create a new committee with the provided information
// @Tags committees
// @Accept json
// @Produce json
// @Param committee body dto.CreateCommitteeRequest true "Committee information"
// @Success 201 {object} dto.CommitteeResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /committees [post]
func (h *CommitteeHandler) CreateCommittee(c *gin.Context) {
	var req dto.CreateCommitteeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	committee, err := h.committeeUC.CreateCommittee(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create committee",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, committee)
}

// GetCommitteeByID gets a committee by ID
// @Summary Get committee by ID
// @Description Get a committee by its ID
// @Tags committees
// @Produce json
// @Param id path string true "Committee ID"
// @Success 200 {object} dto.CommitteeResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /committees/{id} [get]
func (h *CommitteeHandler) GetCommitteeByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	committee, err := h.committeeUC.GetCommitteeByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "committee not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Committee not found",
				Message: "Committee with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get committee",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, committee)
}

// GetAllCommittees gets all committees
// @Summary Get all committees
// @Description Get all committees
// @Tags committees
// @Produce json
// @Success 200 {array} dto.CommitteeResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /committees [get]
func (h *CommitteeHandler) GetAllCommittees(c *gin.Context) {
	// Parse limit and offset from query params, with defaults
	limit := 100
	offset := 0
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	committees, err := h.committeeUC.GetAllCommittees(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get committees",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, committees)
}

// GetCommitteesByStatus gets committees by status
// @Summary Get committees by status
// @Description Get committees by status
// @Tags committees
// @Produce json
// @Param status query string true "Committee status"
// @Success 200 {array} dto.CommitteeResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /committees/by-status [get]
func (h *CommitteeHandler) GetCommitteesByCenter(c *gin.Context) {
	// Note: GetCommitteesByCenter is deprecated, now uses status
	status := c.Query("status")
	if status == "" {
		status = c.Query("center") // Backwards compatibility
	}
	if status == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Missing parameter",
			Message: "Status parameter is required",
		})
		return
	}

	committees, err := h.committeeUC.GetCommitteesByStatus(c.Request.Context(), status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get committees",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, committees)
}

// GetCommitteesByType gets committees by type
// @Summary Get committees by type
// @Description Get committees by type
// @Tags committees
// @Produce json
// @Param type query string true "Committee type" Enums(DISCIPLINARY, ACADEMIC)
// @Success 200 {array} dto.CommitteeResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /committees/by-type [get]
func (h *CommitteeHandler) GetCommitteesByType(c *gin.Context) {
	committeeType := c.Query("type")
	if committeeType == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Missing parameter",
			Message: "Type parameter is required",
		})
		return
	}

	committees, err := h.committeeUC.GetCommitteesByType(c.Request.Context(), committeeType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get committees",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, committees)
}

// UpdateCommittee updates a committee
// @Summary Update committee
// @Description Update a committee by its ID
// @Tags committees
// @Accept json
// @Produce json
// @Param id path string true "Committee ID"
// @Param committee body dto.UpdateCommitteeRequest true "Committee update information"
// @Success 200 {object} dto.CommitteeResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /committees/{id} [put]
func (h *CommitteeHandler) UpdateCommittee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	var req dto.UpdateCommitteeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	committee, err := h.committeeUC.UpdateCommittee(c.Request.Context(), id, &req)
	if err != nil {
		if err.Error() == "committee not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Committee not found",
				Message: "Committee with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update committee",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, committee)
}

// DeleteCommittee deletes a committee
// @Summary Delete committee
// @Description Delete a committee by its ID
// @Tags committees
// @Param id path string true "Committee ID"
// @Success 204
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /committees/{id} [delete]
func (h *CommitteeHandler) DeleteCommittee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	err = h.committeeUC.DeleteCommittee(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "committee not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Committee not found",
				Message: "Committee with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to delete committee",
			Message: err.Error(),
		})
		return
	}

	c.Status(http.StatusNoContent)
}

type StudentCaseHandler struct {
	studentCaseUC usecases.StudentCaseUseCases
}

func NewStudentCaseHandler(studentCaseUC usecases.StudentCaseUseCases) *StudentCaseHandler {
	return &StudentCaseHandler{
		studentCaseUC: studentCaseUC,
	}
}

// CreateStudentCase creates a new student case
// @Summary Create a new student case
// @Description Create a new student case with the provided information
// @Tags student-cases
// @Accept json
// @Produce json
// @Param case body dto.CreateStudentCaseRequest true "Student case information"
// @Success 201 {object} dto.StudentCaseResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /student-cases [post]
func (h *StudentCaseHandler) CreateStudentCase(c *gin.Context) {
	var req dto.CreateStudentCaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	studentCase, err := h.studentCaseUC.CreateStudentCase(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create student case",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, studentCase)
}

// GetStudentCaseByID gets a student case by ID
// @Summary Get student case by ID
// @Description Get a student case by its ID
// @Tags student-cases
// @Produce json
// @Param id path string true "Student case ID"
// @Success 200 {object} dto.StudentCaseResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /student-cases/{id} [get]
func (h *StudentCaseHandler) GetStudentCaseByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	studentCase, err := h.studentCaseUC.GetStudentCaseByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "student case not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Student case not found",
				Message: "Student case with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get student case",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, studentCase)
}

// GetStudentCasesByStudentID gets student cases by student ID
// @Summary Get student cases by student ID
// @Description Get student cases by student ID
// @Tags student-cases
// @Produce json
// @Param student_id query string true "Student ID"
// @Success 200 {array} dto.StudentCaseResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /student-cases/by-student [get]
func (h *StudentCaseHandler) GetStudentCasesByStudentID(c *gin.Context) {
	studentIDStr := c.Query("student_id")
	if studentIDStr == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Missing parameter",
			Message: "Student ID parameter is required",
		})
		return
	}

	studentID, err := uuid.Parse(studentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid student ID",
			Message: "Student ID must be a valid UUID",
		})
		return
	}

	cases, err := h.studentCaseUC.GetStudentCasesByStudentID(c.Request.Context(), studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get student cases",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, cases)
}

// GetPendingStudentCases gets pending student cases
// @Summary Get pending student cases
// @Description Get all pending student cases
// @Tags student-cases
// @Produce json
// @Success 200 {array} dto.StudentCaseResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /student-cases/pending [get]
func (h *StudentCaseHandler) GetPendingStudentCases(c *gin.Context) {
	cases, err := h.studentCaseUC.GetPendingStudentCases(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get pending cases",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, cases)
}

// GetOverdueStudentCases gets pending student cases
// @Summary Get pending student cases
// @Description Get all pending student cases
// @Tags student-cases
// @Produce json
// @Success 200 {array} dto.StudentCaseResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /student-cases/overdue [get]
func (h *StudentCaseHandler) GetOverdueStudentCases(c *gin.Context) {
	cases, err := h.studentCaseUC.GetPendingStudentCases(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get pending cases",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, cases)
}

// UpdateStudentCase updates a student case
// @Summary Update student case
// @Description Update a student case by its ID
// @Tags student-cases
// @Accept json
// @Produce json
// @Param id path string true "Student case ID"
// @Param case body dto.UpdateStudentCaseRequest true "Student case update information"
// @Success 200 {object} dto.StudentCaseResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /student-cases/{id} [put]
func (h *StudentCaseHandler) UpdateStudentCase(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	var req dto.UpdateStudentCaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	studentCase, err := h.studentCaseUC.UpdateStudentCase(c.Request.Context(), id, &req)
	if err != nil {
		if err.Error() == "student case not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Student case not found",
				Message: "Student case with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update student case",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, studentCase)
}

// HealthHandler for health checks
type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// Health check endpoint
// @Summary Health check
// @Description Check if the service is running
// @Tags health
// @Produce json
// @Success 200 {object} map[string]string
// @Router /health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	timestamp := time.Now().Unix()
	if ts := c.Request.Context().Value("timestamp"); ts != nil {
		if tsInt, ok := ts.(int64); ok {
			timestamp = tsInt
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"service":   "mevalservice",
		"timestamp": strconv.FormatInt(timestamp, 10),
	})
}

// ImprovementPlan Handlers
type ImprovementPlanHandler struct {
	improvementPlanUC usecases.ImprovementPlanUseCases
}

func NewImprovementPlanHandler(improvementPlanUC usecases.ImprovementPlanUseCases) *ImprovementPlanHandler {
	return &ImprovementPlanHandler{
		improvementPlanUC: improvementPlanUC,
	}
}

// CreateImprovementPlan creates a new improvement plan
// @Summary Create a new improvement plan
// @Description Create a new improvement plan for a student case
// @Tags improvement-plans
// @Accept json
// @Produce json
// @Param plan body dto.CreateImprovementPlanRequest true "Improvement plan information"
// @Success 201 {object} dto.ImprovementPlanResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /improvement-plans [post]
func (h *ImprovementPlanHandler) CreateImprovementPlan(c *gin.Context) {
	var req dto.CreateImprovementPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	plan, err := h.improvementPlanUC.CreateImprovementPlan(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create improvement plan",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, plan)
}

// GetImprovementPlanByID gets an improvement plan by ID
// @Summary Get improvement plan by ID
// @Description Get an improvement plan by its ID
// @Tags improvement-plans
// @Produce json
// @Param id path string true "Improvement Plan ID"
// @Success 200 {object} dto.ImprovementPlanResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /improvement-plans/{id} [get]
func (h *ImprovementPlanHandler) GetImprovementPlanByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	plan, err := h.improvementPlanUC.GetImprovementPlanByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "improvement plan not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Improvement plan not found",
				Message: "Improvement plan with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get improvement plan",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, plan)
}

// GetImprovementPlansByStudentCaseID gets improvement plans by student case ID
// @Summary Get improvement plans by student case ID
// @Description Get all improvement plans for a specific student case
// @Tags improvement-plans
// @Produce json
// @Param student_case_id path string true "Student Case ID"
// @Success 200 {array} dto.ImprovementPlanResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /improvement-plans/student-case/{student_case_id} [get]
func (h *ImprovementPlanHandler) GetImprovementPlansByStudentCaseID(c *gin.Context) {
	idStr := c.Param("student_case_id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "Student case ID must be a valid UUID",
		})
		return
	}

	plans, err := h.improvementPlanUC.GetImprovementPlansByStudentCaseID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get improvement plans",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, plans)
}

// UpdateImprovementPlan updates an improvement plan
// @Summary Update improvement plan
// @Description Update an improvement plan by ID
// @Tags improvement-plans
// @Accept json
// @Produce json
// @Param id path string true "Improvement Plan ID"
// @Param plan body dto.UpdateImprovementPlanRequest true "Improvement plan updates"
// @Success 200 {object} dto.ImprovementPlanResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /improvement-plans/{id} [put]
func (h *ImprovementPlanHandler) UpdateImprovementPlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	var req dto.UpdateImprovementPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	plan, err := h.improvementPlanUC.UpdateImprovementPlan(c.Request.Context(), id, &req)
	if err != nil {
		if err.Error() == "improvement plan not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Improvement plan not found",
				Message: "Improvement plan with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update improvement plan",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, plan)
}

// UpdateProgress updates progress of an improvement plan
// @Summary Update improvement plan progress
// @Description Update progress and notes of an improvement plan
// @Tags improvement-plans
// @Accept json
// @Produce json
// @Param id path string true "Improvement Plan ID"
// @Param progress body object true "Progress information"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /improvement-plans/{id}/progress [patch]
func (h *ImprovementPlanHandler) UpdateProgress(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	var req struct {
		Progress int    `json:"progress" binding:"required,min=0,max=100"`
		Notes    string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	err = h.improvementPlanUC.UpdateProgress(c.Request.Context(), id, req.Progress, req.Notes)
	if err != nil {
		if err.Error() == "improvement plan not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Improvement plan not found",
				Message: "Improvement plan with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update progress",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Progress updated successfully",
	})
}

// Sanction Handlers
type SanctionHandler struct {
	sanctionUC usecases.SanctionUseCases
}

func NewSanctionHandler(sanctionUC usecases.SanctionUseCases) *SanctionHandler {
	return &SanctionHandler{
		sanctionUC: sanctionUC,
	}
}

// CreateSanction creates a new sanction
// @Summary Create a new sanction
// @Description Create a new sanction for a student case
// @Tags sanctions
// @Accept json
// @Produce json
// @Param sanction body dto.CreateSanctionRequest true "Sanction information"
// @Success 201 {object} dto.SanctionResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /sanctions [post]
func (h *SanctionHandler) CreateSanction(c *gin.Context) {
	var req dto.CreateSanctionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	sanction, err := h.sanctionUC.CreateSanction(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create sanction",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, sanction)
}

// GetSanctionByID gets a sanction by ID
// @Summary Get sanction by ID
// @Description Get a sanction by its ID
// @Tags sanctions
// @Produce json
// @Param id path string true "Sanction ID"
// @Success 200 {object} dto.SanctionResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /sanctions/{id} [get]
func (h *SanctionHandler) GetSanctionByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	sanction, err := h.sanctionUC.GetSanctionByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "sanction not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Sanction not found",
				Message: "Sanction with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get sanction",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, sanction)
}

// GetSanctionsByStudentID gets sanctions by student ID
// @Summary Get sanctions by student ID
// @Description Get all sanctions for a specific student
// @Tags sanctions
// @Produce json
// @Param student_id path string true "Student ID"
// @Success 200 {array} dto.SanctionResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /sanctions/student/{student_id} [get]
func (h *SanctionHandler) GetSanctionsByStudentID(c *gin.Context) {
	idStr := c.Param("student_id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "Student ID must be a valid UUID",
		})
		return
	}

	sanctions, err := h.sanctionUC.GetSanctionsByStudentID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get sanctions",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, sanctions)
}

// ActivateSanction activates a sanction
// @Summary Activate sanction
// @Description Activate a specific sanction
// @Tags sanctions
// @Produce json
// @Param id path string true "Sanction ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /sanctions/{id}/activate [patch]
func (h *SanctionHandler) ActivateSanction(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	err = h.sanctionUC.UpdateComplianceStatus(c.Request.Context(), id, "IN_PROGRESS")
	if err != nil {
		if err.Error() == "sanction not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Sanction not found",
				Message: "Sanction with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to activate sanction",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Sanction activated successfully",
	})
}

// CompleteSanction completes a sanction
// @Summary Complete sanction
// @Description Mark a sanction as completed
// @Tags sanctions
// @Produce json
// @Param id path string true "Sanction ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /sanctions/{id}/complete [patch]
func (h *SanctionHandler) CompleteSanction(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	err = h.sanctionUC.UpdateComplianceStatus(c.Request.Context(), id, "COMPLETED")
	if err != nil {
		if err.Error() == "sanction not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Sanction not found",
				Message: "Sanction with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to complete sanction",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Sanction completed successfully",
	})
}

// Appeal Handlers
type AppealHandler struct {
	appealUC usecases.AppealUseCases
}

func NewAppealHandler(appealUC usecases.AppealUseCases) *AppealHandler {
	return &AppealHandler{
		appealUC: appealUC,
	}
}

// CreateAppeal creates a new appeal
// @Summary Create a new appeal
// @Description Create a new appeal for a student case
// @Tags appeals
// @Accept json
// @Produce json
// @Param appeal body dto.CreateAppealRequest true "Appeal information"
// @Success 201 {object} dto.AppealResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /appeals [post]
func (h *AppealHandler) CreateAppeal(c *gin.Context) {
	var req dto.CreateAppealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	appeal, err := h.appealUC.CreateAppeal(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create appeal",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, appeal)
}

// GetAppealByID gets an appeal by ID
// @Summary Get appeal by ID
// @Description Get an appeal by its ID
// @Tags appeals
// @Produce json
// @Param id path string true "Appeal ID"
// @Success 200 {object} dto.AppealResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /appeals/{id} [get]
func (h *AppealHandler) GetAppealByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	appeal, err := h.appealUC.GetAppealByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "appeal not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Appeal not found",
				Message: "Appeal with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get appeal",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, appeal)
}

// GetAppealsByStudentID gets appeals by student ID
// @Summary Get appeals by student ID
// @Description Get all appeals for a specific student
// @Tags appeals
// @Produce json
// @Param student_id path string true "Student ID"
// @Success 200 {array} dto.AppealResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /appeals/student/{student_id} [get]
func (h *AppealHandler) GetAppealsByStudentID(c *gin.Context) {
	idStr := c.Param("student_id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "Student ID must be a valid UUID",
		})
		return
	}

	appeals, err := h.appealUC.GetAppealsByStudentID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get appeals",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, appeals)
}

// ProcessAppeal processes an appeal (accept/reject)
// @Summary Process appeal
// @Description Process an appeal with decision
// @Tags appeals
// @Accept json
// @Produce json
// @Param id path string true "Appeal ID"
// @Param decision body object true "Appeal decision"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /appeals/{id}/process [patch]
func (h *AppealHandler) ProcessAppeal(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	var req struct {
		Accepted   bool   `json:"accepted"`
		Resolution string `json:"resolution" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Process appeal based on accepted flag
	if req.Accepted {
		err = h.appealUC.AdmitAppeal(c.Request.Context(), id, req.Resolution)
	} else {
		err = h.appealUC.RejectAppeal(c.Request.Context(), id, req.Resolution)
	}

	if err != nil {
		if err.Error() == "appeal not found" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Appeal not found",
				Message: "Appeal with the specified ID was not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to process appeal",
			Message: err.Error(),
		})
		return
	}

	status := "rejected"
	if req.Accepted {
		status = "accepted"
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: fmt.Sprintf("Appeal %s successfully", status),
	})
}
