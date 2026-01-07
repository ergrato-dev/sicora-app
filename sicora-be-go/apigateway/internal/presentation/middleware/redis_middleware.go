// Package middleware provides HTTP middleware for the API Gateway with Redis integration.
package middleware

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"apigateway/internal/infrastructure/cache"
	"apigateway/internal/infrastructure/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// MiddlewareManager holds dependencies for Redis-integrated middleware.
type MiddlewareManager struct {
	cache  *cache.APIGatewayCache
	config *config.Config
}

// NewMiddlewareManager creates a new MiddlewareManager with cache integration.
func NewMiddlewareManager(c *cache.APIGatewayCache, cfg *config.Config) *MiddlewareManager {
	return &MiddlewareManager{
		cache:  c,
		config: cfg,
	}
}

// ============================================================================
// Rate Limiting with Redis
// ============================================================================

// RateLimiterRedis implements distributed rate limiting using Redis.
// Unlike the in-memory rate limiter, this works across multiple gateway instances.
func (m *MiddlewareManager) RateLimiterRedis(limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		clientIP := c.ClientIP()

		// Check and increment rate limit atomically
		count, blocked, err := m.cache.IncrementRateLimit(ctx, clientIP, limit, window)
		if err != nil {
			// On cache error, log and allow request (fail-open)
			c.Set("rate_limit_error", err.Error())
			c.Next()
			return
		}

		// Set rate limit headers
		c.Header("X-RateLimit-Limit", formatInt(limit))
		c.Header("X-RateLimit-Remaining", formatInt(max(0, limit-count)))
		c.Header("X-RateLimit-Reset", formatInt(int(time.Now().Add(window).Unix())))

		if blocked {
			c.Header("Retry-After", formatInt(int(window.Seconds())))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "Too Many Requests",
				"message":     "Rate limit exceeded. Please try again later.",
				"retry_after": int(window.Seconds()),
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RateLimiterByUser implements per-user rate limiting using Redis.
// Useful for authenticated endpoints where you want user-specific limits.
func (m *MiddlewareManager) RateLimiterByUser(limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		// Get user ID from context (set by Auth middleware)
		userID := c.GetString("user_id")
		if userID == "" {
			// No user ID, fall back to IP-based limiting
			clientIP := c.ClientIP()
			count, blocked, err := m.cache.IncrementRateLimit(ctx, clientIP, limit, window)
			if err != nil {
				c.Next()
				return
			}

			if blocked {
				c.JSON(http.StatusTooManyRequests, gin.H{
					"error":   "Too Many Requests",
					"message": "Rate limit exceeded",
				})
				c.Abort()
				return
			}

			c.Header("X-RateLimit-Remaining", formatInt(max(0, limit-count)))
			c.Next()
			return
		}

		// Check user rate limit
		info, err := m.cache.GetUserRateLimit(ctx, userID)
		if err != nil {
			// New user or error - create entry
			info = &cache.RateLimitInfo{
				Requests:    1,
				WindowStart: time.Now(),
				Blocked:     false,
			}
		} else {
			// Check if window has expired
			if time.Since(info.WindowStart) > window {
				info.Requests = 1
				info.WindowStart = time.Now()
				info.Blocked = false
			} else {
				info.Requests++
				if info.Requests > limit {
					info.Blocked = true
				}
			}
		}

		// Update rate limit in cache
		if err := m.cache.SetRateLimit(ctx, "user:"+userID, info); err != nil {
			// Log error but continue
			c.Set("rate_limit_error", err.Error())
		}

		c.Header("X-RateLimit-Limit", formatInt(limit))
		c.Header("X-RateLimit-Remaining", formatInt(max(0, limit-info.Requests)))

		if info.Blocked {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Too Many Requests",
				"message": "User rate limit exceeded",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// ============================================================================
// Authentication with Token Blacklist
// ============================================================================

// AuthWithBlacklist validates JWT tokens and checks the blacklist.
// Tokens that have been explicitly invalidated (logout) will be rejected.
func (m *MiddlewareManager) AuthWithBlacklist() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid authorization header format",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Parse and validate token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(m.config.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Check if token is blacklisted (logout)
		ctx := c.Request.Context()
		jti := claims.ID // JWT ID from RegisteredClaims
		if jti != "" {
			isBlacklisted, err := m.cache.IsTokenBlacklisted(ctx, jti)
			if err == nil && isBlacklisted {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":   "Unauthorized",
					"message": "Token has been revoked",
				})
				c.Abort()
				return
			}
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Set("token_jti", jti)
		c.Set("token_exp", claims.ExpiresAt)

		c.Next()
	}
}

// Logout blacklists the current token to prevent reuse.
func (m *MiddlewareManager) Logout() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		jti := c.GetString("token_jti")
		if jti == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Bad Request",
				"message": "Token does not have a JTI claim",
			})
			c.Abort()
			return
		}

		// Get token expiration
		expClaim, exists := c.Get("token_exp")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Bad Request",
				"message": "Token does not have an expiration",
			})
			c.Abort()
			return
		}

		expiresAt := expClaim.(*jwt.NumericDate).Time

		// Blacklist the token
		if err := m.cache.BlacklistToken(ctx, jti, expiresAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Failed to logout",
			})
			c.Abort()
			return
		}

		// Also invalidate session if exists
		userID := c.GetString("user_id")
		if userID != "" {
			// Best effort - don't fail if session invalidation fails
			_ = m.cache.InvalidateAllUserSessions(ctx, userID)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully logged out",
		})
	}
}

// ============================================================================
// Session Management
// ============================================================================

// SessionManager creates and validates user sessions.
// Sessions provide additional security by tracking user activity.
func (m *MiddlewareManager) SessionManager() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		userID := c.GetString("user_id")

		if userID == "" {
			c.Next()
			return
		}

		// Check for existing session
		sessionID := c.GetHeader("X-Session-ID")
		if sessionID != "" {
			session, err := m.cache.GetSession(ctx, sessionID)
			if err == nil && session != nil && session.UserID == userID {
				// Valid session - update last seen
				_ = m.cache.UpdateSessionLastSeen(ctx, sessionID)
				c.Set("session_id", sessionID)
				c.Set("session", session)
				c.Next()
				return
			}
		}

		// Create new session
		newSessionID := uuid.New().String()
		session := &cache.Session{
			ID:        newSessionID,
			UserID:    userID,
			Email:     c.GetString("email"),
			Role:      c.GetString("role"),
			IPAddress: c.ClientIP(),
			UserAgent: c.GetHeader("User-Agent"),
			CreatedAt: time.Now(),
			ExpiresAt: time.Now().Add(30 * time.Minute),
			LastSeen:  time.Now(),
		}

		if err := m.cache.SetSession(ctx, session); err != nil {
			// Log error but don't fail the request
			c.Set("session_error", err.Error())
			c.Next()
			return
		}

		// Track session for user
		_ = m.cache.AddUserSession(ctx, userID, newSessionID)

		c.Set("session_id", newSessionID)
		c.Set("session", session)
		c.Header("X-Session-ID", newSessionID)

		c.Next()
	}
}

// RequireSession ensures a valid session exists.
func (m *MiddlewareManager) RequireSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := c.GetString("session_id")
		if sessionID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Valid session required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// ============================================================================
// API Key Authentication
// ============================================================================

// APIKeyAuth validates API keys for service-to-service communication.
func (m *MiddlewareManager) APIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "API key is required",
			})
			c.Abort()
			return
		}

		// Hash the API key
		keyHash := cache.HashAPIKey(apiKey)

		// Look up API key
		keyData, err := m.cache.GetAPIKey(ctx, keyHash)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid API key",
			})
			c.Abort()
			return
		}

		if !keyData.Active {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "API key is inactive",
			})
			c.Abort()
			return
		}

		// Set API key info in context
		c.Set("api_key_owner", keyData.OwnerID)
		c.Set("api_key_permissions", keyData.Permissions)
		c.Set("api_key_rate_limit", keyData.RateLimit)

		c.Next()
	}
}

// RequireAPIPermission checks if the API key has the required permission.
func (m *MiddlewareManager) RequireAPIPermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		permsInterface, exists := c.Get("api_key_permissions")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Forbidden",
				"message": "No permissions found",
			})
			c.Abort()
			return
		}

		permissions, ok := permsInterface.([]string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Invalid permissions format",
			})
			c.Abort()
			return
		}

		for _, p := range permissions {
			if p == permission || p == "*" {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Forbidden",
			"message": "Insufficient permissions",
		})
		c.Abort()
	}
}

// ============================================================================
// Service Health Tracking
// ============================================================================

// ServiceHealthTracker records response times and errors for backend services.
func (m *MiddlewareManager) ServiceHealthTracker(serviceName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		// Record metrics after request
		responseTime := time.Since(start).Milliseconds()
		statusCode := c.Writer.Status()
		hasError := statusCode >= 500

		var status string
		switch {
		case statusCode >= 500:
			status = "unhealthy"
		case statusCode >= 400:
			status = "degraded"
		default:
			status = "healthy"
		}

		// Update service health in background
		go func() {
			bgCtx := context.Background()
			_ = m.cache.UpdateServiceHealth(bgCtx, serviceName, status, responseTime, hasError)
		}()
	}
}

// ============================================================================
// Utility Functions
// ============================================================================

func formatInt(n int) string {
	return strconv.Itoa(n)
}

// maxInt returns the maximum of two integers.
func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
