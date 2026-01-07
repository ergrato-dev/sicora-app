package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter estructura para rate limiting por IP
type RateLimiter struct {
	requests map[string][]time.Time
	mutex    sync.RWMutex
	limit    int
	window   time.Duration
}

// NewRateLimiter crea un nuevo rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

// RateLimitMiddleware middleware para rate limiting
func (rl *RateLimiter) RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		rl.mutex.Lock()
		defer rl.mutex.Unlock()

		now := time.Now()

		// Limpiar requests antiguos fuera de la ventana de tiempo
		if requests, exists := rl.requests[clientIP]; exists {
			var validRequests []time.Time
			cutoff := now.Add(-rl.window)

			for _, reqTime := range requests {
				if reqTime.After(cutoff) {
					validRequests = append(validRequests, reqTime)
				}
			}
			rl.requests[clientIP] = validRequests
		}

		// Verificar límite
		if len(rl.requests[clientIP]) >= rl.limit {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "RATE_LIMIT_EXCEEDED",
				"message":     fmt.Sprintf("Rate limit exceeded. Maximum %d requests per %v", rl.limit, rl.window),
				"retry_after": rl.window.Seconds(),
			})
			c.Abort()
			return
		}

		// Agregar request actual
		rl.requests[clientIP] = append(rl.requests[clientIP], now)

		c.Next()
	}
}

// SecurityHeadersMiddleware agrega headers de seguridad HTTP
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Previene MIME-sniffing
		c.Header("X-Content-Type-Options", "nosniff")
		// Previene clickjacking
		c.Header("X-Frame-Options", "DENY")
		// Activa protección XSS del navegador
		c.Header("X-XSS-Protection", "1; mode=block")
		// Fuerza HTTPS
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		// Controla información del referrer
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		// Política de contenido base
		c.Header("Content-Security-Policy", "default-src 'self'")
		// Previene acceso entre dominios Flash/PDF
		c.Header("X-Permitted-Cross-Domain-Policies", "none")
		// Cache control para datos sensibles
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate")
		c.Header("Pragma", "no-cache")

		c.Next()
	}
}

// SecureCORSMiddleware CORS seguro sin wildcard
func SecureCORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		// Verificar si el origin está permitido
		allowed := false
		for _, o := range allowedOrigins {
			if o == origin {
				allowed = true
				break
			}
		}

		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Request-ID")
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// RequestIDMiddleware agrega un ID único a cada request
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = fmt.Sprintf("req_%d", time.Now().UnixNano())
		}

		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)
		c.Next()
	}
}
