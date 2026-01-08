package errors

import (
	"context"
	"net/http"
	"time"

	apperrors "sicora-be-go/pkg/errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ============================================================================
// HEALTH CHECKER SETUP
// ============================================================================

// HealthCheckerSetup contains configuration for health checking
type HealthCheckerSetup struct {
	Checker     *apperrors.HealthChecker
	ShutdownMgr *apperrors.ShutdownManager
}

// NewHealthCheckerSetup creates a new health checker setup for scheduleservice
func NewHealthCheckerSetup(db *gorm.DB, shutdownMgr *apperrors.ShutdownManager) *HealthCheckerSetup {
	config := &apperrors.HealthCheckerConfig{
		Service:     apperrors.GetGlobalServiceContext(),
		ShutdownMgr: shutdownMgr,
		Timeout:     5 * time.Second,
	}

	checker := apperrors.NewHealthChecker(config)

	// Register database health check
	if db != nil {
		dbCheck := func(ctx context.Context) apperrors.HealthCheckResult {
			sqlDB, err := db.DB()
			if err != nil {
				return apperrors.HealthCheckResult{
					Status:    apperrors.HealthStatusDown,
					Message:   "failed to get database connection",
					Error:     err.Error(),
					Timestamp: time.Now().UTC(),
				}
			}

			if err := sqlDB.PingContext(ctx); err != nil {
				return apperrors.HealthCheckResult{
					Status:    apperrors.HealthStatusDown,
					Message:   "database ping failed",
					Error:     err.Error(),
					Timestamp: time.Now().UTC(),
				}
			}

			return apperrors.HealthCheckResult{
				Status:    apperrors.HealthStatusUp,
				Message:   "database connection ok",
				Timestamp: time.Now().UTC(),
			}
		}

		checker.RegisterCheck("postgres", dbCheck)
		checker.RegisterReadinessCheck("postgres", dbCheck)
	}

	// Register basic liveness check
	checker.RegisterLivenessCheck("process", func(ctx context.Context) apperrors.HealthCheckResult {
		return apperrors.HealthCheckResult{
			Status:    apperrors.HealthStatusUp,
			Message:   "process is alive",
			Timestamp: time.Now().UTC(),
		}
	})

	return &HealthCheckerSetup{
		Checker:     checker,
		ShutdownMgr: shutdownMgr,
	}
}

// ============================================================================
// GIN HANDLERS
// ============================================================================

// HealthHandler returns a Gin handler for /health endpoint
func (h *HealthCheckerSetup) HealthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		response := h.Checker.Check(c.Request.Context())

		if response.Status != apperrors.HealthStatusUp {
			c.JSON(http.StatusServiceUnavailable, response)
			return
		}
		c.JSON(http.StatusOK, response)
	}
}

// ReadinessHandler returns a Gin handler for /ready endpoint
func (h *HealthCheckerSetup) ReadinessHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		response := h.Checker.CheckReadiness(c.Request.Context())

		if !response.Ready {
			c.JSON(http.StatusServiceUnavailable, response)
			return
		}
		c.JSON(http.StatusOK, response)
	}
}

// LivenessHandler returns a Gin handler for /live endpoint
func (h *HealthCheckerSetup) LivenessHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		response := h.Checker.CheckLiveness(c.Request.Context())

		if !response.Alive {
			c.JSON(http.StatusServiceUnavailable, response)
			return
		}
		c.JSON(http.StatusOK, response)
	}
}

// RegisterRoutes registers all health endpoints on a Gin router
func (h *HealthCheckerSetup) RegisterRoutes(router *gin.Engine) {
	router.GET("/health", h.HealthHandler())
	router.GET("/ready", h.ReadinessHandler())
	router.GET("/live", h.LivenessHandler())
}

// ============================================================================
// SHUTDOWN MANAGER SETUP
// ============================================================================

// ShutdownManagerSetup contains shutdown configuration
type ShutdownManagerSetup struct {
	Manager *apperrors.ShutdownManager
	Logger  apperrors.Logger
}

// NewShutdownManagerSetup creates a new shutdown manager for scheduleservice
func NewShutdownManagerSetup(logger apperrors.Logger) *ShutdownManagerSetup {
	config := apperrors.DefaultShutdownConfig()
	config.Timeout = 30 * time.Second

	return &ShutdownManagerSetup{
		Manager: apperrors.NewShutdownManager(config),
		Logger:  logger,
	}
}

// RegisterDatabase registers database connection for graceful shutdown
func (s *ShutdownManagerSetup) RegisterDatabase(db *gorm.DB) {
	s.Manager.Register("database", 100, func(ctx context.Context) error {
		sqlDB, err := db.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	})
}

// RegisterServer registers HTTP server for graceful shutdown
func (s *ShutdownManagerSetup) RegisterServer(server *http.Server) {
	s.Manager.RegisterHTTPServer("http-server", server)
}

// Shutdown initiates graceful shutdown
func (s *ShutdownManagerSetup) Shutdown() error {
	return s.Manager.Shutdown()
}

// ============================================================================
// COMBINED SETUP
// ============================================================================

// ServiceSetup combines health checking and shutdown management
type ServiceSetup struct {
	Health   *HealthCheckerSetup
	Shutdown *ShutdownManagerSetup
	Logger   apperrors.Logger
}

// NewServiceSetup creates a complete service setup for scheduleservice
func NewServiceSetup(db *gorm.DB, version, env string) *ServiceSetup {
	// Initialize service context
	InitServiceContext(version, env)

	// Create logger based on environment
	var logger apperrors.Logger
	if env == "production" || env == "release" {
		logger = apperrors.NewJSONLogger(nil)
	} else {
		logger = apperrors.NewDevLogger()
	}

	// Create shutdown manager
	shutdown := NewShutdownManagerSetup(logger)

	// Create health checker with shutdown integration
	health := NewHealthCheckerSetup(db, shutdown.Manager)

	return &ServiceSetup{
		Health:   health,
		Shutdown: shutdown,
		Logger:   logger,
	}
}

// RegisterComponents registers all components for graceful shutdown
func (s *ServiceSetup) RegisterComponents(db *gorm.DB, server *http.Server) {
	if db != nil {
		s.Shutdown.RegisterDatabase(db)
	}
	if server != nil {
		s.Shutdown.RegisterServer(server)
	}
}

// GetLogger returns the configured logger
func (s *ServiceSetup) GetLogger() apperrors.Logger {
	return s.Logger
}
