package middleware

import (
	"time"

	"apigateway/internal/infrastructure/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RequestID adds a unique request ID to each request
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

// Logger logs request information
func Logger(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()

		log.Info("Request",
			"status", statusCode,
			"method", c.Request.Method,
			"path", path,
			"query", query,
			"ip", c.ClientIP(),
			"latency", latency.String(),
			"request_id", c.GetString("request_id"),
		)
	}
}

// RateLimiter implements simple rate limiting
func RateLimiter(limit int) gin.HandlerFunc {
	// Simple token bucket implementation
	tokens := make(chan struct{}, limit)

	// Fill the bucket
	go func() {
		ticker := time.NewTicker(time.Second / time.Duration(limit))
		defer ticker.Stop()
		for range ticker.C {
			select {
			case tokens <- struct{}{}:
			default:
			}
		}
	}()

	// Initialize with full bucket
	for i := 0; i < limit; i++ {
		tokens <- struct{}{}
	}

	return func(c *gin.Context) {
		select {
		case <-tokens:
			c.Next()
		default:
			c.JSON(429, gin.H{
				"error":   "Too Many Requests",
				"message": "Rate limit exceeded. Please try again later.",
			})
			c.Abort()
		}
	}
}
