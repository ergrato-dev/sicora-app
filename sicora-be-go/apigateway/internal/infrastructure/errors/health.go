// Package errors provides health check for apigateway.
package errors

import (
	"context"
	"net/http"
	"time"

	"apigateway/internal/infrastructure/cache"

	"github.com/gin-gonic/gin"
)

// HealthResponse represents health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Service   string    `json:"service"`
	Version   string    `json:"version"`
	Timestamp time.Time `json:"timestamp"`
	Redis     string    `json:"redis,omitempty"`
}

// HealthHandler returns health check endpoint handler
func HealthHandler(gatewayCache *cache.APIGatewayCache) gin.HandlerFunc {
	return func(c *gin.Context) {
		response := HealthResponse{
			Status:    "up",
			Service:   ServiceName,
			Version:   ServiceVersion,
			Timestamp: time.Now(),
		}

		// Check Redis if available
		if gatewayCache != nil {
			ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
			defer cancel()
			if err := gatewayCache.Ping(ctx); err != nil {
				response.Redis = "error: " + err.Error()
				response.Status = "degraded"
			} else {
				response.Redis = "connected"
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
func ReadyHandler(gatewayCache *cache.APIGatewayCache) gin.HandlerFunc {
	return func(c *gin.Context) {
		ready := true
		checks := make(map[string]string)

		if gatewayCache != nil {
			ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
			defer cancel()
			if err := gatewayCache.Ping(ctx); err != nil {
				ready = false
				checks["redis"] = "error: " + err.Error()
			} else {
				checks["redis"] = "ready"
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

// ============================================================================
// Service Setup (Health Checker + Shutdown Manager)
// ============================================================================

// HealthChecker provides health checking capabilities
type HealthChecker struct {
	cache *cache.APIGatewayCache
}

// NewHealthChecker creates a new health checker
func NewHealthChecker(gatewayCache *cache.APIGatewayCache) *HealthChecker {
	return &HealthChecker{cache: gatewayCache}
}

// Check performs health check
func (h *HealthChecker) Check(ctx context.Context) error {
	if h.cache == nil {
		return nil
	}
	return h.cache.Ping(ctx)
}

// ShutdownFunc is a function that shuts down a component
type ShutdownFunc func(ctx context.Context) error

// ShutdownItem represents a component to shutdown
type ShutdownItem struct {
	Name     string
	Priority int
	Fn       ShutdownFunc
}

// ShutdownManager manages graceful shutdown of services
type ShutdownManager struct {
	items []ShutdownItem
}

// NewShutdownManager creates a new shutdown manager
func NewShutdownManager() *ShutdownManager {
	return &ShutdownManager{
		items: make([]ShutdownItem, 0),
	}
}

// Register adds a component to the shutdown manager
func (sm *ShutdownManager) Register(name string, priority int, fn ShutdownFunc) {
	sm.items = append(sm.items, ShutdownItem{
		Name:     name,
		Priority: priority,
		Fn:       fn,
	})
}

// Shutdown performs graceful shutdown of all registered components
func (sm *ShutdownManager) Shutdown(ctx context.Context) error {
	// Sort by priority (lower = shutdown first)
	for i := 0; i < len(sm.items); i++ {
		for j := i + 1; j < len(sm.items); j++ {
			if sm.items[j].Priority < sm.items[i].Priority {
				sm.items[i], sm.items[j] = sm.items[j], sm.items[i]
			}
		}
	}

	// Shutdown each component
	for _, item := range sm.items {
		if err := item.Fn(ctx); err != nil {
			// Log but continue shutting down other components
			continue
		}
	}
	return nil
}

// ServiceSetup provides unified health checker and shutdown manager
type ServiceSetup struct {
	HealthChecker   *HealthChecker
	ShutdownManager *ShutdownManager
}

// NewServiceSetup creates a new service setup with health checker and shutdown manager
func NewServiceSetup(gatewayCache *cache.APIGatewayCache) *ServiceSetup {
	return &ServiceSetup{
		HealthChecker:   NewHealthChecker(gatewayCache),
		ShutdownManager: NewShutdownManager(),
	}
}

// RegisterHealthRoutes registers health check routes on a Gin router
func RegisterHealthRoutes(router *gin.Engine, healthChecker *HealthChecker) {
	router.GET("/health", HealthHandler(healthChecker.cache))
	router.GET("/health/live", LiveHandler())
	router.GET("/health/ready", ReadyHandler(healthChecker.cache))
}
