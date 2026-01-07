package handlers

import (
	"net/http"

	"apigateway/internal/infrastructure/config"

	"github.com/gin-gonic/gin"
)

// HealthHandler handles health check endpoints
type HealthHandler struct {
	cfg *config.Config
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(cfg *config.Config) *HealthHandler {
	return &HealthHandler{cfg: cfg}
}

// Health returns the health status of the API Gateway
func (h *HealthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":      "healthy",
		"service":     "apigateway",
		"version":     "2.0.0",
		"environment": h.cfg.Environment,
	})
}

// Ready returns the readiness status
func (h *HealthHandler) Ready(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ready",
	})
}

// Live returns the liveness status
func (h *HealthHandler) Live(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "alive",
	})
}

// Services returns the status of all backend services
func (h *HealthHandler) Services(c *gin.Context) {
	services := make(map[string]interface{})

	for name, url := range h.cfg.Services {
		status := "unknown"
		resp, err := http.Get(url + "/health")
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				status = "healthy"
			} else {
				status = "unhealthy"
			}
		} else {
			status = "unreachable"
		}

		services[name] = gin.H{
			"url":    url,
			"status": status,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"services": services,
	})
}
