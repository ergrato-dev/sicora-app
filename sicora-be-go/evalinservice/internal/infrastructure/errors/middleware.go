package errors

import (
	"context"
	"log"
	"time"

	apperrors "sicora-be-go/pkg/errors"

	"github.com/gin-gonic/gin"
)

const (
	HeaderRequestID     = "X-Request-ID"
	HeaderCorrelationID = "X-Correlation-ID"
)

// RecoveryMiddlewareV2 handles panics using the centralized error package
func RecoveryMiddlewareV2(logger apperrors.Logger) gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		ctx := c.Request.Context()
		reqCtx := apperrors.ExtractContext(ctx)
		if reqCtx == nil {
			reqCtx = apperrors.NewRequestContext()
		}

		var appErr *apperrors.AppError
		switch err := recovered.(type) {
		case *apperrors.AppError:
			appErr = err
		case error:
			appErr = apperrors.NewInternalError("panic recovered", err)
		default:
			appErr = apperrors.NewInternalError("unknown panic", nil)
		}

		if logger != nil {
			logger.Error(ctx, "Panic recovered", appErr,
				apperrors.Str("path", c.Request.URL.Path),
				apperrors.Str("method", c.Request.Method),
				apperrors.Str("request_id", reqCtx.RequestID),
			)
		}

		c.Header(HeaderRequestID, reqCtx.RequestID)
		c.Header(HeaderCorrelationID, reqCtx.CorrelationID)
		c.AbortWithStatusJSON(appErr.HTTPStatus, appErr.ToResponse())
	})
}

// RequestContextMiddleware extracts or creates request context from headers
func RequestContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqCtx := apperrors.ExtractHTTPHeaders(c.Request.Header)
		if reqCtx == nil {
			reqCtx = apperrors.NewRequestContext()
		}

		ctx := apperrors.InjectContext(c.Request.Context(), reqCtx)
		c.Request = c.Request.WithContext(ctx)

		c.Header(HeaderRequestID, reqCtx.RequestID)
		c.Header(HeaderCorrelationID, reqCtx.CorrelationID)

		c.Next()
	}
}

// LoggingMiddlewareV2 logs requests using structured logger
func LoggingMiddlewareV2(logger apperrors.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		reqCtx := apperrors.ExtractContext(c.Request.Context())
		requestID := ""
		if reqCtx != nil {
			requestID = reqCtx.RequestID
		}

		fields := []apperrors.Field{
			apperrors.Str("method", method),
			apperrors.Str("path", path),
			apperrors.Int("status", status),
			apperrors.Int64("latency_ms", latency.Milliseconds()),
			apperrors.Str("request_id", requestID),
		}

		if status >= 500 {
			logger.Error(c.Request.Context(), "Request error", nil, fields...)
		} else if status >= 400 {
			logger.Warn(c.Request.Context(), "Request warning", fields...)
		} else {
			logger.Info(c.Request.Context(), "Request completed", fields...)
		}
	}
}

// LegacyErrorMiddleware wraps the old error middleware interface
func LegacyErrorMiddleware(legacyLogger *log.Logger) gin.HandlerFunc {
	logger := &legacyLoggerAdapter{logger: legacyLogger}
	return RecoveryMiddlewareV2(logger)
}

type legacyLoggerAdapter struct {
	logger *log.Logger
}

func (l *legacyLoggerAdapter) Debug(ctx context.Context, msg string, fields ...apperrors.Field) {
	l.logger.Printf("[DEBUG] %s", msg)
}

func (l *legacyLoggerAdapter) Info(ctx context.Context, msg string, fields ...apperrors.Field) {
	l.logger.Printf("[INFO] %s", msg)
}

func (l *legacyLoggerAdapter) Warn(ctx context.Context, msg string, fields ...apperrors.Field) {
	l.logger.Printf("[WARN] %s", msg)
}

func (l *legacyLoggerAdapter) Error(ctx context.Context, msg string, err error, fields ...apperrors.Field) {
	l.logger.Printf("[ERROR] %s: %v", msg, err)
}

func (l *legacyLoggerAdapter) Fatal(ctx context.Context, msg string, err error, fields ...apperrors.Field) {
	l.logger.Fatalf("[FATAL] %s: %v", msg, err)
}

func (l *legacyLoggerAdapter) WithFields(fields ...apperrors.Field) apperrors.Logger {
	return l
}

func (l *legacyLoggerAdapter) WithContext(ctx context.Context) apperrors.Logger {
	return l
}
