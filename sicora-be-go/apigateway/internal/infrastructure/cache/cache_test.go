// Package cache provides test coverage for API Gateway cache operations.
package cache

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"sicora-be-go/pkg/cache"
)

// Helper to create a test cache with mock client
func newTestGatewayCache(t *testing.T) (*APIGatewayCache, *cache.MockCache) {
	mockCache := cache.NewMockCache()
	logger := log.New(os.Stdout, "[test-gateway-cache] ", log.LstdFlags)
	gatewayCache := NewAPIGatewayCache(mockCache, logger)
	return gatewayCache, mockCache
}

// Helper to create a test session
func createTestSession(id, userID, email, role string) *Session {
	now := time.Now()
	return &Session{
		ID:        id,
		UserID:    userID,
		Email:     email,
		Role:      role,
		IPAddress: "192.168.1.100",
		UserAgent: "Mozilla/5.0 Test",
		CreatedAt: now,
		ExpiresAt: now.Add(30 * time.Minute),
		LastSeen:  now,
	}
}

func TestAPIGatewayCache_RateLimit(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	clientIP := "192.168.1.100"
	info := &RateLimitInfo{
		Requests:    10,
		WindowStart: time.Now(),
		Blocked:     false,
	}

	// Test SetRateLimit
	err := gatewayCache.SetRateLimit(ctx, clientIP, info)
	require.NoError(t, err)

	// Test GetRateLimit
	retrieved, err := gatewayCache.GetRateLimit(ctx, clientIP)
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, info.Requests, retrieved.Requests)
	assert.Equal(t, info.Blocked, retrieved.Blocked)
}

func TestAPIGatewayCache_IncrementRateLimit(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	clientIP := "192.168.1.101"
	limit := 5
	window := 1 * time.Minute

	// First request
	count, blocked, err := gatewayCache.IncrementRateLimit(ctx, clientIP, limit, window)
	require.NoError(t, err)
	assert.Equal(t, 1, count)
	assert.False(t, blocked)

	// Multiple requests within limit
	for i := 2; i <= limit; i++ {
		count, blocked, err = gatewayCache.IncrementRateLimit(ctx, clientIP, limit, window)
		require.NoError(t, err)
		assert.Equal(t, i, count)
		assert.False(t, blocked)
	}

	// Request over limit - should be blocked
	count, blocked, err = gatewayCache.IncrementRateLimit(ctx, clientIP, limit, window)
	require.NoError(t, err)
	assert.True(t, blocked)
}

func TestAPIGatewayCache_ClearRateLimit(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	clientIP := "192.168.1.102"
	info := &RateLimitInfo{
		Requests:    100,
		WindowStart: time.Now(),
		Blocked:     true,
	}

	err := gatewayCache.SetRateLimit(ctx, clientIP, info)
	require.NoError(t, err)

	err = gatewayCache.ClearRateLimit(ctx, clientIP)
	require.NoError(t, err)

	// Should not find after clear
	_, err = gatewayCache.GetRateLimit(ctx, clientIP)
	assert.Error(t, err)
}

func TestAPIGatewayCache_Session(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	sessionID := uuid.New().String()
	session := createTestSession(sessionID, "user-123", "test@example.com", "INSTRUCTOR")

	// Test SetSession
	err := gatewayCache.SetSession(ctx, session)
	require.NoError(t, err)

	// Test GetSession
	retrieved, err := gatewayCache.GetSession(ctx, sessionID)
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, session.ID, retrieved.ID)
	assert.Equal(t, session.UserID, retrieved.UserID)
	assert.Equal(t, session.Email, retrieved.Email)
	assert.Equal(t, session.Role, retrieved.Role)
}

func TestAPIGatewayCache_SessionNotFound(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	retrieved, err := gatewayCache.GetSession(ctx, "non-existent-session")
	assert.Error(t, err)
	assert.Nil(t, retrieved)
}

func TestAPIGatewayCache_UpdateSessionLastSeen(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	sessionID := uuid.New().String()
	originalTime := time.Now().Add(-1 * time.Hour)
	session := &Session{
		ID:        sessionID,
		UserID:    "user-123",
		Email:     "test@example.com",
		Role:      "STUDENT",
		LastSeen:  originalTime,
		CreatedAt: originalTime,
		ExpiresAt: time.Now().Add(30 * time.Minute),
	}

	err := gatewayCache.SetSession(ctx, session)
	require.NoError(t, err)

	err = gatewayCache.UpdateSessionLastSeen(ctx, sessionID)
	require.NoError(t, err)

	retrieved, err := gatewayCache.GetSession(ctx, sessionID)
	require.NoError(t, err)
	assert.True(t, retrieved.LastSeen.After(originalTime))
}

func TestAPIGatewayCache_InvalidateSession(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	sessionID := uuid.New().String()
	session := createTestSession(sessionID, "user-123", "test@example.com", "ADMIN")

	err := gatewayCache.SetSession(ctx, session)
	require.NoError(t, err)

	err = gatewayCache.InvalidateSession(ctx, sessionID)
	require.NoError(t, err)

	_, err = gatewayCache.GetSession(ctx, sessionID)
	assert.Error(t, err)
}

func TestAPIGatewayCache_UserSessions(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	userID := "user-multi-device"
	sessionIDs := []string{uuid.New().String(), uuid.New().String(), uuid.New().String()}

	// Add sessions for user
	for _, sessionID := range sessionIDs {
		err := gatewayCache.AddUserSession(ctx, userID, sessionID)
		require.NoError(t, err)
	}

	// Get user sessions
	retrieved, err := gatewayCache.GetUserSessions(ctx, userID)
	require.NoError(t, err)
	assert.Len(t, retrieved, 3)
}

func TestAPIGatewayCache_RemoveUserSession(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	userID := "user-remove-test"
	sessionIDs := []string{uuid.New().String(), uuid.New().String()}

	for _, sessionID := range sessionIDs {
		err := gatewayCache.AddUserSession(ctx, userID, sessionID)
		require.NoError(t, err)
	}

	// Remove one session
	err := gatewayCache.RemoveUserSession(ctx, userID, sessionIDs[0])
	require.NoError(t, err)

	retrieved, err := gatewayCache.GetUserSessions(ctx, userID)
	require.NoError(t, err)
	assert.Len(t, retrieved, 1)
	assert.Equal(t, sessionIDs[1], retrieved[0])
}

func TestAPIGatewayCache_InvalidateAllUserSessions(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	userID := "user-logout-all"

	// Create sessions
	for i := 0; i < 3; i++ {
		sessionID := uuid.New().String()
		session := createTestSession(sessionID, userID, "test@example.com", "STUDENT")
		err := gatewayCache.SetSession(ctx, session)
		require.NoError(t, err)
		err = gatewayCache.AddUserSession(ctx, userID, sessionID)
		require.NoError(t, err)
	}

	// Invalidate all
	err := gatewayCache.InvalidateAllUserSessions(ctx, userID)
	require.NoError(t, err)

	// Should have no sessions
	sessions, err := gatewayCache.GetUserSessions(ctx, userID)
	assert.Error(t, err)
	assert.Nil(t, sessions)
}

func TestAPIGatewayCache_TokenBlacklist(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	jti := uuid.New().String()
	expiresAt := time.Now().Add(1 * time.Hour)

	// Blacklist token
	err := gatewayCache.BlacklistToken(ctx, jti, expiresAt)
	require.NoError(t, err)

	// Check if blacklisted
	isBlacklisted, err := gatewayCache.IsTokenBlacklisted(ctx, jti)
	require.NoError(t, err)
	assert.True(t, isBlacklisted)
}

func TestAPIGatewayCache_TokenNotBlacklisted(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	isBlacklisted, err := gatewayCache.IsTokenBlacklisted(ctx, "random-jti")
	require.NoError(t, err)
	assert.False(t, isBlacklisted)
}

func TestAPIGatewayCache_RefreshToken(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	tokenID := uuid.New().String()
	data := &RefreshTokenData{
		UserID:    "user-123",
		TokenHash: "abc123hash",
		IssuedAt:  time.Now(),
		ExpiresAt: time.Now().Add(1 * time.Hour),
		Used:      false,
	}

	// Store refresh token
	err := gatewayCache.StoreRefreshToken(ctx, tokenID, data)
	require.NoError(t, err)

	// Get refresh token
	retrieved, err := gatewayCache.GetRefreshToken(ctx, tokenID)
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, data.UserID, retrieved.UserID)
	assert.False(t, retrieved.Used)
}

func TestAPIGatewayCache_MarkRefreshTokenUsed(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	tokenID := uuid.New().String()
	data := &RefreshTokenData{
		UserID:    "user-123",
		TokenHash: "abc123hash",
		IssuedAt:  time.Now(),
		ExpiresAt: time.Now().Add(1 * time.Hour),
		Used:      false,
	}

	err := gatewayCache.StoreRefreshToken(ctx, tokenID, data)
	require.NoError(t, err)

	err = gatewayCache.MarkRefreshTokenUsed(ctx, tokenID)
	require.NoError(t, err)

	retrieved, err := gatewayCache.GetRefreshToken(ctx, tokenID)
	require.NoError(t, err)
	assert.True(t, retrieved.Used)
}

func TestAPIGatewayCache_APIKey(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	keyHash := HashAPIKey("test-api-key-12345")
	data := &APIKeyData{
		KeyHash:     keyHash,
		Name:        "Test API Key",
		OwnerID:     "service-account-1",
		Permissions: []string{"read:users", "write:schedules"},
		RateLimit:   1000,
		CreatedAt:   time.Now(),
		Active:      true,
	}

	// Store API key
	err := gatewayCache.SetAPIKey(ctx, data)
	require.NoError(t, err)

	// Get API key
	retrieved, err := gatewayCache.GetAPIKey(ctx, keyHash)
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, data.Name, retrieved.Name)
	assert.Equal(t, data.OwnerID, retrieved.OwnerID)
	assert.Len(t, retrieved.Permissions, 2)
}

func TestAPIGatewayCache_InvalidateAPIKey(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	keyHash := HashAPIKey("delete-me-key")
	data := &APIKeyData{
		KeyHash:   keyHash,
		Name:      "Delete Me",
		OwnerID:   "owner-1",
		Active:    true,
		CreatedAt: time.Now(),
	}

	err := gatewayCache.SetAPIKey(ctx, data)
	require.NoError(t, err)

	err = gatewayCache.InvalidateAPIKey(ctx, keyHash)
	require.NoError(t, err)

	_, err = gatewayCache.GetAPIKey(ctx, keyHash)
	assert.Error(t, err)
}

func TestAPIGatewayCache_ServiceHealth(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	health := &ServiceHealth{
		ServiceName:  "userservice",
		Status:       "healthy",
		LastCheck:    time.Now(),
		ResponseTime: 45,
		ErrorCount:   0,
	}

	// Store health
	err := gatewayCache.SetServiceHealth(ctx, health)
	require.NoError(t, err)

	// Get health
	retrieved, err := gatewayCache.GetServiceHealth(ctx, "userservice")
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, "healthy", retrieved.Status)
	assert.Equal(t, int64(45), retrieved.ResponseTime)
}

func TestAPIGatewayCache_UpdateServiceHealth(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	serviceName := "scheduleservice"

	// Initial healthy check
	err := gatewayCache.UpdateServiceHealth(ctx, serviceName, "healthy", 30, false)
	require.NoError(t, err)

	health, err := gatewayCache.GetServiceHealth(ctx, serviceName)
	require.NoError(t, err)
	assert.Equal(t, 0, health.ErrorCount)

	// Simulate error
	err = gatewayCache.UpdateServiceHealth(ctx, serviceName, "unhealthy", 0, true)
	require.NoError(t, err)

	health, err = gatewayCache.GetServiceHealth(ctx, serviceName)
	require.NoError(t, err)
	assert.Equal(t, 1, health.ErrorCount)
	assert.Equal(t, "unhealthy", health.Status)
}

func TestAPIGatewayCache_GetAllServicesHealth(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	// Set health for some services
	services := []string{"userservice", "scheduleservice", "kbservice"}
	for _, svc := range services {
		err := gatewayCache.SetServiceHealth(ctx, &ServiceHealth{
			ServiceName:  svc,
			Status:       "healthy",
			LastCheck:    time.Now(),
			ResponseTime: 50,
		})
		require.NoError(t, err)
	}

	// Get all health
	allHealth, err := gatewayCache.GetAllServicesHealth(ctx)
	require.NoError(t, err)
	assert.Len(t, allHealth, 3)
}

func TestAPIGatewayCache_SetMultipleSessions(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	sessions := []*Session{
		createTestSession(uuid.New().String(), "user-1", "user1@example.com", "STUDENT"),
		createTestSession(uuid.New().String(), "user-2", "user2@example.com", "INSTRUCTOR"),
		createTestSession(uuid.New().String(), "user-3", "user3@example.com", "ADMIN"),
	}

	err := gatewayCache.SetMultipleSessions(ctx, sessions)
	require.NoError(t, err)

	// Verify each session
	for _, s := range sessions {
		retrieved, err := gatewayCache.GetSession(ctx, s.ID)
		require.NoError(t, err)
		assert.Equal(t, s.UserID, retrieved.UserID)
	}
}

func TestAPIGatewayCache_InvalidateMultipleSessions(t *testing.T) {
	gatewayCache, mockCache := newTestGatewayCache(t)
	ctx := context.Background()

	sessionIDs := []string{uuid.New().String(), uuid.New().String()}

	for _, id := range sessionIDs {
		session := createTestSession(id, "user-test", "test@example.com", "STUDENT")
		err := gatewayCache.SetSession(ctx, session)
		require.NoError(t, err)
	}

	countBefore := mockCache.Count()

	err := gatewayCache.InvalidateMultipleSessions(ctx, sessionIDs)
	require.NoError(t, err)

	countAfter := mockCache.Count()
	assert.True(t, countAfter < countBefore)
}

func TestAPIGatewayCache_Ping(t *testing.T) {
	gatewayCache, _ := newTestGatewayCache(t)
	ctx := context.Background()

	err := gatewayCache.Ping(ctx)
	assert.NoError(t, err)
}

func TestAPIGatewayCache_TTLs(t *testing.T) {
	// Verify TTL constants used by API Gateway
	assert.Equal(t, 5*time.Minute, cache.TTLVeryShort) // Rate limiting, Health checks
	assert.Equal(t, 30*time.Minute, cache.TTLDynamic)  // Sessions
	assert.Equal(t, 12*time.Hour, cache.TTLStable)     // API Keys
}

func TestHashAPIKey(t *testing.T) {
	key1 := "my-secret-api-key"
	key2 := "my-secret-api-key"
	key3 := "different-api-key"

	hash1 := HashAPIKey(key1)
	hash2 := HashAPIKey(key2)
	hash3 := HashAPIKey(key3)

	// Same input should produce same hash
	assert.Equal(t, hash1, hash2)
	// Different input should produce different hash
	assert.NotEqual(t, hash1, hash3)
	// Hash should be 64 characters (SHA-256 hex)
	assert.Len(t, hash1, 64)
}
