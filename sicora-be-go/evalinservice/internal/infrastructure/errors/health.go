package errors

import (
	"context"
	"time"

	apperrors "sicora-be-go/pkg/errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// HealthCheckerSetup creates and configures a health checker for the evalin service
func HealthCheckerSetup(db *gorm.DB, shutdownMgr *apperrors.ShutdownManager) *apperrors.HealthChecker {
	config := &apperrors.HealthCheckerConfig{
		Service:     apperrors.GetGlobalServiceContext(),
		ShutdownMgr: shutdownMgr,
		Timeout:     5 * time.Second,
	}
	checker := apperrors.NewHealthChecker(config)

	// Add database health check
	if db != nil {
		checker.RegisterCheck("database", func(ctx context.Context) apperrors.HealthCheckResult {
			sqlDB, err := db.DB()
			if err != nil {
				return apperrors.HealthCheckResult{
					Status:  apperrors.HealthStatusDown,
					Message: "Failed to get database instance",
					Error:   err.Error(),
				}
			}

			if err := sqlDB.PingContext(ctx); err != nil {
				return apperrors.HealthCheckResult{
					Status:  apperrors.HealthStatusDown,
					Message: "Database connection failed",
					Error:   err.Error(),
				}
			}

			return apperrors.HealthCheckResult{
				Status:  apperrors.HealthStatusUp,
				Message: "Database connection OK",
			}
		})

		// Register readiness check for database
		checker.RegisterReadinessCheck("database", func(ctx context.Context) apperrors.HealthCheckResult {
			sqlDB, err := db.DB()
			if err != nil {
				return apperrors.HealthCheckResult{
					Status:  apperrors.HealthStatusDown,
					Message: "Database not ready",
				}
			}
			if err := sqlDB.PingContext(ctx); err != nil {
				return apperrors.HealthCheckResult{
					Status:  apperrors.HealthStatusDown,
					Message: "Database not ready",
				}
			}
			return apperrors.HealthCheckResult{
				Status:  apperrors.HealthStatusUp,
				Message: "Database ready",
			}
		})
	}

	// Add liveness check
	checker.RegisterLivenessCheck("service", func(ctx context.Context) apperrors.HealthCheckResult {
		return apperrors.HealthCheckResult{
			Status:  apperrors.HealthStatusUp,
			Message: "Service is alive",
		}
	})

	return checker
}

// ShutdownManagerSetup creates and configures a shutdown manager
func ShutdownManagerSetup() *apperrors.ShutdownManager {
	config := &apperrors.ShutdownConfig{
		Timeout:          30 * time.Second,
		ForceKillTimeout: 5 * time.Second,
	}
	return apperrors.NewShutdownManager(config)
}

// RegisterHealthRoutes registers health check endpoints on a gin router
func RegisterHealthRoutes(router *gin.Engine, checker *apperrors.HealthChecker) {
	router.GET("/health", func(c *gin.Context) {
		result := checker.Check(c.Request.Context())
		status := 200
		if result.Status != apperrors.HealthStatusUp {
			status = 503
		}
		c.JSON(status, result)
	})

	router.GET("/ready", func(c *gin.Context) {
		result := checker.CheckReadiness(c.Request.Context())
		status := 200
		if !result.Ready {
			status = 503
		}
		c.JSON(status, result)
	})

	router.GET("/live", func(c *gin.Context) {
		result := checker.CheckLiveness(c.Request.Context())
		status := 200
		if !result.Alive {
			status = 503
		}
		c.JSON(status, result)
	})
}

// ServiceSetup holds service components
type ServiceSetup struct {
	Logger          apperrors.Logger
	HealthChecker   *apperrors.HealthChecker
	ShutdownManager *apperrors.ShutdownManager
}

// NewServiceSetup creates a complete service setup
func NewServiceSetup(db *gorm.DB, isDev bool) *ServiceSetup {
	var logger apperrors.Logger
	if isDev {
		logger = apperrors.NewDevLogger()
	} else {
		logger = apperrors.NewJSONLogger(nil)
	}

	shutdownManager := ShutdownManagerSetup()
	healthChecker := HealthCheckerSetup(db, shutdownManager)

	return &ServiceSetup{
		Logger:          logger,
		HealthChecker:   healthChecker,
		ShutdownManager: shutdownManager,
	}
}
