package middleware

import (
	"log"
	"net/http"
	"time"

	"userservice/internal/domain/errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ErrorMiddleware handles errors globally and provides consistent error responses
func ErrorMiddleware(logger *log.Logger) gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		// Generate correlation ID for tracking
		correlationID := uuid.New().String()
		c.Header("X-Correlation-ID", correlationID)

		var errorResponse errors.ErrorResponse

		switch err := recovered.(type) {
		case *errors.DomainError:
			// Handle domain-specific errors
			logger.Printf("[%s] Domain error: %s - %s", correlationID, err.Code, err.Message)

			errorResponse = errors.ErrorResponse{
				Error: errors.ErrorDetails{
					Code:          err.Code,
					Message:       err.Message,
					Details:       err.Details,
					Timestamp:     err.Timestamp,
					Path:          c.Request.URL.Path,
					CorrelationID: correlationID,
				},
			}
			c.JSON(err.StatusCode, errorResponse)

		case error:
			// Handle generic Go errors
			// SECURITY: No exponer stack traces en logs (información sensible)
			logger.Printf("[%s] Generic error: %v", correlationID, err)

			errorResponse = errors.ErrorResponse{
				Error: errors.ErrorDetails{
					Code:          errors.InternalServerError,
					Message:       "Error interno del servidor",
					Details:       "Se ha producido un error inesperado",
					Timestamp:     time.Now().UTC(),
					Path:          c.Request.URL.Path,
					CorrelationID: correlationID,
				},
			}
			c.JSON(http.StatusInternalServerError, errorResponse)

		default:
			// Handle unknown panic types
			// SECURITY: No exponer stack traces en logs (información sensible)
			logger.Printf("[%s] Unknown panic: %v", correlationID, recovered)

			errorResponse = errors.ErrorResponse{
				Error: errors.ErrorDetails{
					Code:          errors.InternalServerError,
					Message:       "Error interno del servidor",
					Details:       "Se ha producido un error crítico inesperado",
					Timestamp:     time.Now().UTC(),
					Path:          c.Request.URL.Path,
					CorrelationID: correlationID,
				},
			}
			c.JSON(http.StatusInternalServerError, errorResponse)
		}
	})
}

// NotFoundMiddleware handles 404 errors with consistent format
func NotFoundMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Only handle if no response has been written and status is 404
		if c.Writer.Status() == http.StatusNotFound && !c.Writer.Written() {
			correlationID := uuid.New().String()
			c.Header("X-Correlation-ID", correlationID)

			errorResponse := errors.ErrorResponse{
				Error: errors.ErrorDetails{
					Code:          "ENDPOINT_NOT_FOUND",
					Message:       "Endpoint no encontrado",
					Details:       "La ruta solicitada no existe",
					Timestamp:     time.Now().UTC(),
					Path:          c.Request.URL.Path,
					CorrelationID: correlationID,
				},
			}

			c.JSON(http.StatusNotFound, errorResponse)
		}
	}
}

// RequestIDMiddleware adds a unique request ID to each request
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}

		c.Header("X-Request-ID", requestID)
		c.Set("RequestID", requestID)
		c.Next()
	}
}
