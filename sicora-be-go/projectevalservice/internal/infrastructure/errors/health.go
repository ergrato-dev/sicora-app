// Package errors provides health check for projectevalservice.
package errors

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// HealthResponse represents health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Service   string    `json:"service"`
	Version   string    `json:"version"`
	Timestamp time.Time `json:"timestamp"`
	Database  string    `json:"database,omitempty"`
}

// HealthHandler returns health check endpoint handler
func HealthHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		response := HealthResponse{
			Status:    "up",
			Service:   ServiceName,
			Version:   ServiceVersion,
			Timestamp: time.Now(),
		}

		// Check database
		if db != nil {
			sqlDB, err := db.DB()
			if err != nil {
				response.Database = "error: " + err.Error()
				response.Status = "degraded"
			} else {
				ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
				defer cancel()
				if err := sqlDB.PingContext(ctx); err != nil {
					response.Database = "error: " + err.Error()
					response.Status = "degraded"
				} else {
					response.Database = "connected"
				}
			}
		}

		statusCode := http.StatusOK
		if response.Status != "up" {
			statusCode = http.StatusServiceUnavailable
		}

		c.JSON(statusCode, response)
	}
}

// LiveHandler returns liveness check handler
func LiveHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"alive":     true,
			"timestamp": time.Now(),
		})
	}
}

// ReadyHandler returns readiness check handler
func ReadyHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ready := true
		checks := make(map[string]string)

		if db != nil {
			sqlDB, err := db.DB()
			if err != nil {
				ready = false
				checks["database"] = "error: " + err.Error()
			} else {
				ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
				defer cancel()
				if err := sqlDB.PingContext(ctx); err != nil {
					ready = false
					checks["database"] = "error: " + err.Error()
				} else {
					checks["database"] = "ready"
				}
			}
		}

		statusCode := http.StatusOK
		if !ready {
			statusCode = http.StatusServiceUnavailable
		}

		c.JSON(statusCode, gin.H{
			"ready":     ready,
			"checks":    checks,
			"timestamp": time.Now(),
		})
	}
}
