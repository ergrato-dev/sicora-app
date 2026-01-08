// Package errors provides health check and shutdown management using the
// centralized error handling package.
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
// Health Checker Setup
// ============================================================================

// HealthCheckerSetup creates and configures a health checker with standard
// checks for projectevalservice.
func HealthCheckerSetup(db *gorm.DB, shutdownMgr *apperrors.ShutdownManager) *apperrors.HealthChecker {
	config := &apperrors.HealthCheckerConfig{
		ServiceName:    ServiceName,
		ServiceVersion: ServiceVersion,
		CheckTimeout:   5 * time.Second,
	}

	checker := apperrors.NewHealthChecker(config)

	// Register database health check
	checker.RegisterCheck("database", func(ctx context.Context) apperrors.HealthCheckResult {
		sqlDB, err := db.DB()
		if err != nil {
			return apperrors.HealthCheckResult{
				Status: apperrors.HealthStatusDown,
				Error:  "failed to get database connection: " + err.Error(),
			}
		}

		if err := sqlDB.PingContext(ctx); err != nil {
			return apperrors.HealthCheckResult{
				Status: apperrors.HealthStatusDown,
				Error:  "database ping failed: " + err.Error(),
			}
		}

		return apperrors.HealthCheckResult{
			Status: apperrors.HealthStatusUp,
		}
	})

	// Register liveness check (basic service alive check)
	checker.RegisterLivenessCheck("service", func(ctx context.Context) apperrors.HealthCheckResult {
		return apperrors.HealthCheckResult{
			Status: apperrors.HealthStatusUp,
		}
	})

	// Register readiness check (service ready to accept traffic)
	checker.RegisterReadinessCheck("database", func(ctx context.Context) apperrors.HealthCheckResult {
		sqlDB, err := db.DB()
		if err != nil {
			return apperrors.HealthCheckResult{
				Status: apperrors.HealthStatusDown,
				Error:  "database not available: " + err.Error(),
			}
		}

		if err := sqlDB.PingContext(ctx); err != nil {
			return apperrors.HealthCheckResult{
				Status: apperrors.HealthStatusDown,
				Error:  "database not ready: " + err.Error(),
			}
		}

		return apperrors.HealthCheckResult{
			Status: apperrors.HealthStatusUp,
		}
	})

	return checker
}

// ============================================================================
// Shutdown Manager Setup
// ============================================================================

// ShutdownManagerSetup creates and configures a shutdown manager for
// graceful shutdown of projectevalservice.
func ShutdownManagerSetup() *apperrors.ShutdownManager {
	config := &apperrors.ShutdownConfig{
		Timeout:         30 * time.Second,
		GracePeriod:     5 * time.Second,
		ShutdownSignals: true,
	}

	return apperrors.NewShutdownManager(config)
}

// ============================================================================
// Health Routes Registration
// ============================================================================

// RegisterHealthRoutes registers health check endpoints on the router.
func RegisterHealthRoutes(router *gin.Engine, checker *apperrors.HealthChecker) {
	// Main health endpoint
	router.GET("/health", func(c *gin.Context) {
		result := checker.Check(c.Request.Context())
		status := http.StatusOK
		if result.Status != apperrors.HealthStatusUp {
			status = http.StatusServiceUnavailable
		}
		c.JSON(status, result)
	})

	// Kubernetes-style liveness probe
	router.GET("/health/live", func(c *gin.Context) {
		result := checker.CheckLiveness(c.Request.Context())
		status := http.StatusOK
		if result.Status != apperrors.HealthStatusUp {
			status = http.StatusServiceUnavailable
		}
		c.JSON(status, result)
	})

	// Kubernetes-style readiness probe
	router.GET("/health/ready", func(c *gin.Context) {
		result := checker.CheckReadiness(c.Request.Context())
		status := http.StatusOK
		if result.Status != apperrors.HealthStatusUp {
			status = http.StatusServiceUnavailable
		}
		c.JSON(status, result)
	})
}

// ============================================================================
// Service Setup Helper
// ============================================================================

// ServiceSetup holds all the components needed for service lifecycle management.
type ServiceSetup struct {
	HealthChecker   *apperrors.HealthChecker
	ShutdownManager *apperrors.ShutdownManager
}

// NewServiceSetup creates a complete service setup with health checking and
// shutdown management.
func NewServiceSetup(db *gorm.DB) *ServiceSetup {
	shutdownMgr := ShutdownManagerSetup()
	healthChecker := HealthCheckerSetup(db, shutdownMgr)

	return &ServiceSetup{
		HealthChecker:   healthChecker,
		ShutdownManager: shutdownMgr,
	}
}
