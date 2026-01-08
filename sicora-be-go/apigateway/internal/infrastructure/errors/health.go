// Package errors provides health check and shutdown management using the
// centralized error handling package.
package errors

import (
	"context"
	"net/http"
	"time"

	"apigateway/internal/infrastructure/cache"

	apperrors "sicora-be-go/pkg/errors"

	"github.com/gin-gonic/gin"
)

// ============================================================================
// Health Checker Setup
// ============================================================================

// HealthCheckerSetup creates and configures a health checker with standard
// checks for apigateway.
func HealthCheckerSetup(gatewayCache *cache.APIGatewayCache, shutdownMgr *apperrors.ShutdownManager) *apperrors.HealthChecker {
	config := &apperrors.HealthCheckerConfig{
		ServiceName:    ServiceName,
		ServiceVersion: ServiceVersion,
		CheckTimeout:   5 * time.Second,
	}

	checker := apperrors.NewHealthChecker(config)

	// Register Redis health check (if cache is available)
	if gatewayCache != nil {
		checker.RegisterCheck("redis", func(ctx context.Context) apperrors.HealthCheckResult {
			if err := gatewayCache.Ping(ctx); err != nil {
				return apperrors.HealthCheckResult{
					Status: apperrors.HealthStatusDown,
					Error:  "redis ping failed: " + err.Error(),
				}
			}
			return apperrors.HealthCheckResult{
				Status: apperrors.HealthStatusUp,
			}
		})

		// Redis readiness check
		checker.RegisterReadinessCheck("redis", func(ctx context.Context) apperrors.HealthCheckResult {
			if err := gatewayCache.Ping(ctx); err != nil {
				return apperrors.HealthCheckResult{
					Status: apperrors.HealthStatusDown,
					Error:  "redis not ready: " + err.Error(),
				}
			}
			return apperrors.HealthCheckResult{
				Status: apperrors.HealthStatusUp,
			}
		})
	}

	// Register liveness check (basic service alive check)
	checker.RegisterLivenessCheck("service", func(ctx context.Context) apperrors.HealthCheckResult {
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
// graceful shutdown of apigateway.
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
// shutdown management. gatewayCache can be nil if Redis is not available.
func NewServiceSetup(gatewayCache *cache.APIGatewayCache) *ServiceSetup {
	shutdownMgr := ShutdownManagerSetup()
	healthChecker := HealthCheckerSetup(gatewayCache, shutdownMgr)

	return &ServiceSetup{
		HealthChecker:   healthChecker,
		ShutdownManager: shutdownMgr,
	}
}
