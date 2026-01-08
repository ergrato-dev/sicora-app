// Package errors provides middleware implementations using the centralized
// error handling package.
package errors

import (
	"time"

	apperrors "sicora-be-go/pkg/errors"

	"github.com/gin-gonic/gin"
)

// ============================================================================
// V2 Middlewares using pkg/errors
// ============================================================================

// RecoveryMiddlewareV2 creates a panic recovery middleware using the centralized
// error handling package with proper error wrapping and logging.
func RecoveryMiddlewareV2() gin.HandlerFunc {
	return apperrors.GinRecoveryMiddleware()
}

// RequestContextMiddleware creates a middleware that adds request context
// (request ID, correlation ID) to all requests.
func RequestContextMiddleware() gin.HandlerFunc {
	return apperrors.GinRequestContextMiddleware()
}

// LoggingMiddlewareV2 creates a structured logging middleware using the
// centralized error handling package.
func LoggingMiddlewareV2() gin.HandlerFunc {
	config := apperrors.LoggingMiddlewareConfig{
		SlowRequestThreshold: 500 * time.Millisecond,
		LogRequestBody:       false,
		LogResponseBody:      false,
		SkipPaths:            []string{"/health", "/health/live", "/health/ready", "/metrics"},
	}
	return apperrors.GinLoggingMiddleware(config)
}

// ============================================================================
// Legacy Middleware Adapter
// ============================================================================

// legacyLoggerAdapter provides an adapter for legacy middleware that expects
// a logger interface. This allows gradual migration to the new error system.
type legacyLoggerAdapter struct{}

// newLegacyLoggerAdapter creates a new legacy logger adapter
func newLegacyLoggerAdapter() *legacyLoggerAdapter {
	return &legacyLoggerAdapter{}
}

// Info logs an info message using the centralized logger
func (l *legacyLoggerAdapter) Info(msg string, keysAndValues ...interface{}) {
	logger := apperrors.NewLogger(apperrors.LoggerConfig{
		ServiceName: ServiceName,
		Environment: "development",
	})
	logger.Info(msg, keysAndValues...)
}

// Error logs an error message using the centralized logger
func (l *legacyLoggerAdapter) Error(msg string, keysAndValues ...interface{}) {
	logger := apperrors.NewLogger(apperrors.LoggerConfig{
		ServiceName: ServiceName,
		Environment: "development",
	})
	logger.Error(msg, keysAndValues...)
}

// Warn logs a warning message using the centralized logger
func (l *legacyLoggerAdapter) Warn(msg string, keysAndValues ...interface{}) {
	logger := apperrors.NewLogger(apperrors.LoggerConfig{
		ServiceName: ServiceName,
		Environment: "development",
	})
	logger.Warn(msg, keysAndValues...)
}

// Debug logs a debug message using the centralized logger
func (l *legacyLoggerAdapter) Debug(msg string, keysAndValues ...interface{}) {
	logger := apperrors.NewLogger(apperrors.LoggerConfig{
		ServiceName: ServiceName,
		Environment: "development",
	})
	logger.Debug(msg, keysAndValues...)
}

// ============================================================================
// Error Response Middleware
// ============================================================================

// LegacyErrorMiddleware provides backwards compatibility for handlers that
// still return errors in the old format. It intercepts error responses and
// converts them to the standardized format.
func LegacyErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there were any errors set in the context
		if len(c.Errors) > 0 {
			lastError := c.Errors.Last()
			if lastError != nil {
				appErr := ToAppError(lastError.Err)
				response := apperrors.ToErrorResponse(appErr)
				c.JSON(appErr.HTTPStatus, response)
				return
			}
		}
	}
}

// ============================================================================
// Middleware Chain Helper
// ============================================================================

// SetupV2Middlewares configures the router with V2 middlewares in the correct order.
// Returns the middleware functions to be applied.
func SetupV2Middlewares() []gin.HandlerFunc {
	return []gin.HandlerFunc{
		RequestContextMiddleware(), // First: adds request ID and correlation ID
		RecoveryMiddlewareV2(),     // Second: catches panics
		LoggingMiddlewareV2(),      // Third: logs requests
		LegacyErrorMiddleware(),    // Last: handles error responses
	}
}
