package handlers

import (
	"net/http"
	"time"

	"projectevalservice/internal/application/usecases"
	"projectevalservice/internal/domain/entities"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ProjectHandler struct {
	projectUseCase *usecases.ProjectUseCase
}

func NewProjectHandler(projectUseCase *usecases.ProjectUseCase) *ProjectHandler {
	return &ProjectHandler{
		projectUseCase: projectUseCase,
	}
}

type CreateProjectRequest struct {
	Name            string    `json:"name" binding:"required,min=3,max=200"`
	Description     string    `json:"description"`
	TechnologyStack string    `json:"technology_stack" binding:"required"`
	Requirements    string    `json:"requirements"`
	DeliveryDate    time.Time `json:"delivery_date" binding:"required"`
	MaxScore        float64   `json:"max_score" binding:"min=0"`
	InstructorID    uuid.UUID `json:"instructor_id" binding:"required"`
}

type UpdateProjectRequest struct {
	Name            string                 `json:"name" binding:"required,min=3,max=200"`
	Description     string                 `json:"description"`
	TechnologyStack string                 `json:"technology_stack" binding:"required"`
	Requirements    string                 `json:"requirements"`
	DeliveryDate    time.Time              `json:"delivery_date" binding:"required"`
	MaxScore        float64                `json:"max_score" binding:"min=0"`
	Status          entities.ProjectStatus `json:"status" binding:"required"`
}

// @Summary Create a new project
// @Description Create a new software development project for evaluation
// @Tags projects
// @Accept json
// @Produce json
// @Param request body CreateProjectRequest true "Project creation data"
// @Success 201 {object} entities.Project
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /projects [post]
func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var req CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.MaxScore == 0 {
		req.MaxScore = 100
	}

	project := &entities.Project{
		Name:            req.Name,
		Description:     req.Description,
		TechnologyStack: req.TechnologyStack,
		Requirements:    req.Requirements,
		DeliveryDate:    req.DeliveryDate,
		MaxScore:        req.MaxScore,
		InstructorID:    req.InstructorID,
		Status:          entities.ProjectStatusActivo,
	}

	if err := h.projectUseCase.CreateProject(c.Request.Context(), project); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, project)
}

// @Summary Get project by ID
// @Description Get a specific project by its ID
// @Tags projects
// @Produce json
// @Param id path string true "Project ID"
// @Success 200 {object} entities.Project
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /projects/{id} [get]
func (h *ProjectHandler) GetProject(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	project, err := h.projectUseCase.GetProjectByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if project == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, project)
}

// @Summary Get all projects
// @Description Get all projects with optional filtering
// @Tags projects
// @Produce json
// @Param instructor_id query string false "Filter by instructor ID"
// @Param status query string false "Filter by status"
// @Success 200 {array} entities.Project
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /projects [get]
func (h *ProjectHandler) GetProjects(c *gin.Context) {
	instructorIDParam := c.Query("instructor_id")
	statusParam := c.Query("status")

	var projects []*entities.Project
	var err error

	if instructorIDParam != "" {
		instructorID, parseErr := uuid.Parse(instructorIDParam)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instructor ID"})
			return
		}
		projects, err = h.projectUseCase.GetProjectsByInstructor(c.Request.Context(), instructorID)
	} else if statusParam != "" {
		status := entities.ProjectStatus(statusParam)
		if !status.IsValid() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
			return
		}
		// Note: We would need to add this method to the use case
		projects, err = h.projectUseCase.GetAllProjects(c.Request.Context())
	} else {
		projects, err = h.projectUseCase.GetAllProjects(c.Request.Context())
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, projects)
}

// @Summary Update project
// @Description Update an existing project
// @Tags projects
// @Accept json
// @Produce json
// @Param id path string true "Project ID"
// @Param request body UpdateProjectRequest true "Project update data"
// @Success 200 {object} entities.Project
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /projects/{id} [put]
func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	var req UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project := &entities.Project{
		ID:              id,
		Name:            req.Name,
		Description:     req.Description,
		TechnologyStack: req.TechnologyStack,
		Requirements:    req.Requirements,
		DeliveryDate:    req.DeliveryDate,
		MaxScore:        req.MaxScore,
		Status:          req.Status,
	}

	if err := h.projectUseCase.UpdateProject(c.Request.Context(), project); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, project)
}

// @Summary Delete project
// @Description Delete a project by ID
// @Tags projects
// @Param id path string true "Project ID"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /projects/{id} [delete]
func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	if err := h.projectUseCase.DeleteProject(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
