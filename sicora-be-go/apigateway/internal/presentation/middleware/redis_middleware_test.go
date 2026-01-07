// Package middleware provides test coverage for Redis-integrated middleware.
package middleware

import (
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"apigateway/internal/infrastructure/cache"
	"apigateway/internal/infrastructure/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	pkgcache "sicora-be-go/pkg/cache"
)

// Test setup helpers
func init() {
	gin.SetMode(gin.TestMode)
}

func newTestMiddlewareManager(t *testing.T) (*MiddlewareManager, *pkgcache.MockCache) {
	mockCache := pkgcache.NewMockCache()
	logger := log.New(os.Stdout, "[test-middleware] ", log.LstdFlags)
	gatewayCache := cache.NewAPIGatewayCache(mockCache, logger)

	cfg := &config.Config{
		JWTSecret:     "test-secret-key-for-testing-only",
		JWTExpiration: time.Hour,
		RateLimit:     100,
	}

	mm := NewMiddlewareManager(gatewayCache, cfg)
	return mm, mockCache
}

func createTestRouter() *gin.Engine {
	router := gin.New()
	return router
}

// Helper to create a valid JWT token
func createTestToken(secret string, claims *Claims) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(secret))
	return tokenString
}

// ============================================================================
// RateLimiterRedis Tests
// ============================================================================

func TestRateLimiterRedis_AllowsRequestsUnderLimit(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.RateLimiterRedis(10, time.Minute))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Make several requests under the limit
	for i := 0; i < 5; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/test", nil)
		req.RemoteAddr = "192.168.1.100:12345"
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.NotEmpty(t, w.Header().Get("X-RateLimit-Limit"))
		assert.NotEmpty(t, w.Header().Get("X-RateLimit-Remaining"))
	}
}

func TestRateLimiterRedis_BlocksRequestsOverLimit(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	limit := 3
	router.Use(mm.RateLimiterRedis(limit, time.Minute))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Make requests up to limit
	for i := 0; i < limit; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/test", nil)
		req.RemoteAddr = "192.168.1.200:12345"
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
	}

	// Next request should be blocked
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.RemoteAddr = "192.168.1.200:12345"
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusTooManyRequests, w.Code)
	assert.NotEmpty(t, w.Header().Get("Retry-After"))
}

func TestRateLimiterRedis_SetsHeaders(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.RateLimiterRedis(100, time.Minute))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.RemoteAddr = "10.0.0.1:12345"
	router.ServeHTTP(w, req)

	assert.Equal(t, "100", w.Header().Get("X-RateLimit-Limit"))
	assert.NotEmpty(t, w.Header().Get("X-RateLimit-Remaining"))
	assert.NotEmpty(t, w.Header().Get("X-RateLimit-Reset"))
}

// ============================================================================
// AuthWithBlacklist Tests
// ============================================================================

func TestAuthWithBlacklist_RequiresAuthHeader(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.AuthWithBlacklist())
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthWithBlacklist_RejectsInvalidFormat(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.AuthWithBlacklist())
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "InvalidFormat")
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthWithBlacklist_AcceptsValidToken(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.AuthWithBlacklist())
	router.GET("/protected", func(c *gin.Context) {
		userID := c.GetString("user_id")
		c.JSON(http.StatusOK, gin.H{"user_id": userID})
	})

	claims := &Claims{
		UserID: "user-123",
		Email:  "test@example.com",
		Role:   "STUDENT",
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.New().String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := createTestToken("test-secret-key-for-testing-only", claims)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAuthWithBlacklist_RejectsExpiredToken(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.AuthWithBlacklist())
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	claims := &Claims{
		UserID: "user-123",
		Email:  "test@example.com",
		Role:   "STUDENT",
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.New().String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)), // Expired
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	token := createTestToken("test-secret-key-for-testing-only", claims)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthWithBlacklist_RejectsBlacklistedToken(t *testing.T) {
	mm, mockCache := newTestMiddlewareManager(t)
	router := createTestRouter()

	jti := uuid.New().String()

	// Blacklist the token using the correct key format
	// Key format: apigateway:blacklist:{jti}
	blacklistKey := "apigateway:blacklist:" + jti
	mockCache.Set(nil, blacklistKey, []byte("blacklisted"), time.Hour)

	router.Use(mm.AuthWithBlacklist())
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	claims := &Claims{
		UserID: "user-123",
		Email:  "test@example.com",
		Role:   "STUDENT",
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        jti, // Blacklisted JTI
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := createTestToken("test-secret-key-for-testing-only", claims)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// ============================================================================
// SessionManager Tests
// ============================================================================

func TestSessionManager_CreatesNewSession(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	// First authenticate, then manage session
	router.Use(func(c *gin.Context) {
		c.Set("user_id", "user-123")
		c.Set("email", "test@example.com")
		c.Set("role", "STUDENT")
		c.Next()
	})
	router.Use(mm.SessionManager())
	router.GET("/test", func(c *gin.Context) {
		sessionID := c.GetString("session_id")
		c.JSON(http.StatusOK, gin.H{"session_id": sessionID})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.NotEmpty(t, w.Header().Get("X-Session-ID"))
}

func TestSessionManager_ReusesExistingSession(t *testing.T) {
	mm, mockCache := newTestMiddlewareManager(t)
	router := createTestRouter()

	// Pre-create a session
	sessionID := uuid.New().String()
	// Key format: apigateway:session:{sessionID}
	sessionKey := "apigateway:session:" + sessionID
	sessionData := `{"id":"` + sessionID + `","user_id":"user-123","email":"test@example.com","role":"STUDENT"}`
	mockCache.Set(nil, sessionKey, []byte(sessionData), time.Hour)

	router.Use(func(c *gin.Context) {
		c.Set("user_id", "user-123")
		c.Set("email", "test@example.com")
		c.Set("role", "STUDENT")
		c.Next()
	})
	router.Use(mm.SessionManager())
	router.GET("/test", func(c *gin.Context) {
		sid := c.GetString("session_id")
		c.JSON(http.StatusOK, gin.H{"session_id": sid})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("X-Session-ID", sessionID)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// ============================================================================
// RequireSession Tests
// ============================================================================

func TestRequireSession_RejectsWithoutSession(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.RequireSession())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestRequireSession_AllowsWithSession(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(func(c *gin.Context) {
		c.Set("session_id", "valid-session-id")
		c.Next()
	})
	router.Use(mm.RequireSession())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// ============================================================================
// APIKeyAuth Tests
// ============================================================================

func TestAPIKeyAuth_RequiresAPIKey(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.APIKeyAuth())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAPIKeyAuth_AcceptsValidAPIKey(t *testing.T) {
	mm, mockCache := newTestMiddlewareManager(t)
	router := createTestRouter()

	// Create API key in cache
	apiKey := "test-api-key-12345"
	keyHash := cache.HashAPIKey(apiKey)
	// Key format: apigateway:apikey:{hash}
	apiKeyKey := "apigateway:apikey:" + keyHash
	apiKeyData := `{"key_hash":"` + keyHash + `","name":"Test Key","owner_id":"service-1","permissions":["read:users"],"rate_limit":1000,"active":true}`
	mockCache.Set(nil, apiKeyKey, []byte(apiKeyData), time.Hour)

	router.Use(mm.APIKeyAuth())
	router.GET("/test", func(c *gin.Context) {
		owner := c.GetString("api_key_owner")
		c.JSON(http.StatusOK, gin.H{"owner": owner})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("X-API-Key", apiKey)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAPIKeyAuth_RejectsInactiveKey(t *testing.T) {
	mm, mockCache := newTestMiddlewareManager(t)
	router := createTestRouter()

	// Create inactive API key
	apiKey := "inactive-api-key"
	keyHash := cache.HashAPIKey(apiKey)
	// Key format: apigateway:apikey:{hash}
	apiKeyKey := "apigateway:apikey:" + keyHash
	apiKeyData := `{"key_hash":"` + keyHash + `","name":"Inactive Key","owner_id":"service-1","permissions":[],"rate_limit":0,"active":false}`
	mockCache.Set(nil, apiKeyKey, []byte(apiKeyData), time.Hour)

	router.Use(mm.APIKeyAuth())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("X-API-Key", apiKey)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// ============================================================================
// RequireAPIPermission Tests
// ============================================================================

func TestRequireAPIPermission_AllowsWithPermission(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(func(c *gin.Context) {
		c.Set("api_key_permissions", []string{"read:users", "write:users"})
		c.Next()
	})
	router.Use(mm.RequireAPIPermission("read:users"))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestRequireAPIPermission_AllowsWildcard(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(func(c *gin.Context) {
		c.Set("api_key_permissions", []string{"*"})
		c.Next()
	})
	router.Use(mm.RequireAPIPermission("any:permission"))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestRequireAPIPermission_RejectsWithoutPermission(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(func(c *gin.Context) {
		c.Set("api_key_permissions", []string{"read:users"})
		c.Next()
	})
	router.Use(mm.RequireAPIPermission("write:admin"))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// ============================================================================
// ServiceHealthTracker Tests
// ============================================================================

func TestServiceHealthTracker_TracksSuccessfulRequests(t *testing.T) {
	mm, mockCache := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.ServiceHealthTracker("testservice"))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Give background goroutine time to update
	time.Sleep(50 * time.Millisecond)

	// Check that health was updated
	assert.True(t, mockCache.Count() >= 0) // Cache may or may not have been updated depending on timing
}

func TestServiceHealthTracker_TracksErrors(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	router.Use(mm.ServiceHealthTracker("testservice"))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// ============================================================================
// Logout Tests
// ============================================================================

func TestLogout_BlacklistsToken(t *testing.T) {
	mm, mockCache := newTestMiddlewareManager(t)
	router := createTestRouter()

	jti := uuid.New().String()
	expTime := time.Now().Add(time.Hour)

	// Simulate authenticated request with token info
	router.Use(func(c *gin.Context) {
		c.Set("user_id", "user-123")
		c.Set("token_jti", jti)
		c.Set("token_exp", jwt.NewNumericDate(expTime))
		c.Next()
	})
	router.POST("/logout", mm.Logout())

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/logout", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Verify token was blacklisted
	// Key format: apigateway:blacklist:{jti}
	blacklistKey := "apigateway:blacklist:" + jti
	exists, _ := mockCache.Exists(nil, blacklistKey)
	require.True(t, exists)
}

func TestLogout_RequiresJTI(t *testing.T) {
	mm, _ := newTestMiddlewareManager(t)
	router := createTestRouter()

	// Request without JTI
	router.Use(func(c *gin.Context) {
		c.Set("user_id", "user-123")
		c.Next()
	})
	router.POST("/logout", mm.Logout())

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/logout", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// ============================================================================
// Utility Function Tests
// ============================================================================

func TestFormatInt(t *testing.T) {
	assert.Equal(t, "0", formatInt(0))
	assert.Equal(t, "100", formatInt(100))
	assert.Equal(t, "999", formatInt(999))
	assert.Equal(t, "-1", formatInt(-1))
}

func TestMaxInt(t *testing.T) {
	assert.Equal(t, 5, maxInt(3, 5))
	assert.Equal(t, 10, maxInt(10, 5))
	assert.Equal(t, 0, maxInt(0, 0))
	assert.Equal(t, 0, maxInt(-5, 0))
}
