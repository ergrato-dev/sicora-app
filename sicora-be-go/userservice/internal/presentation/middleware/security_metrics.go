package middleware

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// SecurityMetrics estructura para métricas de seguridad
type SecurityMetrics struct {
	mutex              sync.RWMutex
	failedLogins       map[string]int       // IP -> count
	rateLimitHits      map[string]int       // IP -> count
	suspiciousRequests map[string]int       // IP -> count
	blockedIPs         map[string]time.Time // IP -> blocked until
	logger             *log.Logger
}

// NewSecurityMetrics crea un nuevo recolector de métricas de seguridad
func NewSecurityMetrics(logger *log.Logger) *SecurityMetrics {
	sm := &SecurityMetrics{
		failedLogins:       make(map[string]int),
		rateLimitHits:      make(map[string]int),
		suspiciousRequests: make(map[string]int),
		blockedIPs:         make(map[string]time.Time),
		logger:             logger,
	}

	// Limpiar métricas cada hora
	go sm.cleanupRoutine()

	return sm
}

// RecordFailedLogin registra un intento fallido de login
func (sm *SecurityMetrics) RecordFailedLogin(ip string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	sm.failedLogins[ip]++
	count := sm.failedLogins[ip]

	// SECURITY: Alerta si hay muchos intentos fallidos
	if count >= 5 {
		sm.logger.Printf("SECURITY_ALERT: Multiple failed login attempts from IP %s (count: %d)", maskIP(ip), count)
	}

	// Bloquear IP temporalmente después de 10 intentos
	if count >= 10 {
		sm.blockedIPs[ip] = time.Now().Add(15 * time.Minute)
		sm.logger.Printf("SECURITY_BLOCK: IP %s blocked for 15 minutes due to %d failed login attempts", maskIP(ip), count)
	}
}

// RecordRateLimitHit registra cuando se alcanza el rate limit
func (sm *SecurityMetrics) RecordRateLimitHit(ip string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	sm.rateLimitHits[ip]++
	count := sm.rateLimitHits[ip]

	// SECURITY: Alerta si una IP está haciendo muchos requests
	if count >= 10 {
		sm.logger.Printf("SECURITY_ALERT: Rate limit frequently hit by IP %s (count: %d)", maskIP(ip), count)
	}
}

// RecordSuspiciousRequest registra una solicitud sospechosa
func (sm *SecurityMetrics) RecordSuspiciousRequest(ip, reason string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	sm.suspiciousRequests[ip]++
	count := sm.suspiciousRequests[ip]

	sm.logger.Printf("SECURITY_WARNING: Suspicious request from IP %s - %s (count: %d)", maskIP(ip), reason, count)

	// Bloquear si hay muchas solicitudes sospechosas
	if count >= 5 {
		sm.blockedIPs[ip] = time.Now().Add(30 * time.Minute)
		sm.logger.Printf("SECURITY_BLOCK: IP %s blocked for 30 minutes due to suspicious activity", maskIP(ip))
	}
}

// IsBlocked verifica si una IP está bloqueada
func (sm *SecurityMetrics) IsBlocked(ip string) bool {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()

	if blockedUntil, exists := sm.blockedIPs[ip]; exists {
		if time.Now().Before(blockedUntil) {
			return true
		}
	}
	return false
}

// GetStats retorna estadísticas actuales
func (sm *SecurityMetrics) GetStats() map[string]interface{} {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()

	return map[string]interface{}{
		"total_failed_logins":       sumValues(sm.failedLogins),
		"total_rate_limit_hits":     sumValues(sm.rateLimitHits),
		"total_suspicious_requests": sumValues(sm.suspiciousRequests),
		"currently_blocked_ips":     len(sm.blockedIPs),
	}
}

// SecurityMetricsMiddleware middleware para bloquear IPs bloqueadas
func (sm *SecurityMetrics) SecurityMetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		if sm.IsBlocked(ip) {
			c.JSON(403, gin.H{
				"error":   "ACCESS_DENIED",
				"message": "Your IP has been temporarily blocked due to suspicious activity",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// cleanupRoutine limpia las métricas antiguas cada hora
func (sm *SecurityMetrics) cleanupRoutine() {
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		sm.mutex.Lock()

		// Limpiar contadores (reset cada hora)
		sm.failedLogins = make(map[string]int)
		sm.rateLimitHits = make(map[string]int)
		sm.suspiciousRequests = make(map[string]int)

		// Limpiar IPs bloqueadas expiradas
		now := time.Now()
		for ip, blockedUntil := range sm.blockedIPs {
			if now.After(blockedUntil) {
				delete(sm.blockedIPs, ip)
			}
		}

		sm.mutex.Unlock()
		sm.logger.Printf("Security metrics cleanup completed")
	}
}

// maskIP enmascara una IP para logs seguros
func maskIP(ip string) string {
	if len(ip) > 8 {
		return ip[:8] + "***"
	}
	return "***"
}

// sumValues suma todos los valores de un mapa
func sumValues(m map[string]int) int {
	total := 0
	for _, v := range m {
		total += v
	}
	return total
}

// SuspiciousPatternDetector detecta patrones sospechosos en requests
func SuspiciousPatternDetector(sm *SecurityMetrics) gin.HandlerFunc {
	suspiciousPatterns := []string{
		"../",           // Path traversal
		"<script",       // XSS
		"SELECT ",       // SQL injection
		"DROP ",         // SQL injection
		"UNION ",        // SQL injection
		"' OR ",         // SQL injection
		"--",            // SQL comment
		"eval(",         // Code injection
		"exec(",         // Code injection
		"base64_decode", // PHP injection
	}

	return func(c *gin.Context) {
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		fullURL := path + "?" + query

		for _, pattern := range suspiciousPatterns {
			if containsIgnoreCase(fullURL, pattern) {
				sm.RecordSuspiciousRequest(c.ClientIP(), fmt.Sprintf("suspicious pattern: %s", pattern))
				c.JSON(400, gin.H{
					"error":   "BAD_REQUEST",
					"message": "Invalid request",
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// containsIgnoreCase verifica si s contiene substr ignorando mayúsculas
func containsIgnoreCase(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		(len(s) > 0 && len(substr) > 0 &&
			(s[0] == substr[0] || s[0] == substr[0]+32 || s[0] == substr[0]-32) &&
			containsIgnoreCase(s[1:], substr[1:])) ||
		(len(s) > 0 && containsIgnoreCase(s[1:], substr)))
}
