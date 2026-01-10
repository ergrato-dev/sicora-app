// Package errors provides middleware implementations for the apigateway.
package errors

import (
	"fmt"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// HTTP Header constants
const (
	HeaderRequestID     = "X-Request-ID"
	HeaderCorrelationID = "X-Correlation-ID"
)

// RecoveryMiddlewareV2 creates a panic recovery middleware
func RecoveryMiddlewareV2() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				stack := string(debug.Stack())
				fmt.Printf("[PANIC RECOVERED] %v\n%s\n", err, stack)

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": gin.H{
						"code":    "SYS_INTERNAL_001",
						"message": "Ocurrió un error inesperado. Intenta nuevamente",
					},
				})
			}
		}()
		c.Next()
	}
}

// RequestContextMiddleware adds request context (request ID, correlation ID)
func RequestContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader(HeaderRequestID)
		if requestID == "" {
			requestID = uuid.New().String()
		}

		correlationID := c.GetHeader(HeaderCorrelationID)
		if correlationID == "" {
			correlationID = requestID
		}

		c.Set("request_id", requestID)
		c.Set("correlation_id", correlationID)
		c.Header(HeaderRequestID, requestID)
		c.Header(HeaderCorrelationID, correlationID)

		c.Next()
	}
}

// LoggingMiddlewareV2 creates a structured logging middleware
func LoggingMiddlewareV2() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		if path != "/health" && path != "/health/live" && path != "/health/ready" {
			fmt.Printf("[%s] %s %s %d %v\n",
				time.Now().Format("2006-01-02 15:04:05"),
				c.Request.Method,
				path,
				status,
				latency,
			)
		}
	}
}

// LegacyErrorMiddleware handles error responses
func LegacyErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			lastError := c.Errors.Last()
			if lastError != nil {
				appErr := ToAppError(lastError.Err)
				c.JSON(appErr.HTTPStatus, appErr.ToResponse())
			}
		}
	}
}

// SetupV2Middlewares configures the router with V2 middlewares
func SetupV2Middlewares() []gin.HandlerFunc {
	return []gin.HandlerFunc{
		RequestContextMiddleware(),
		RecoveryMiddlewareV2(),
		LoggingMiddlewareV2(),
		LegacyErrorMiddleware(),
	}
}
