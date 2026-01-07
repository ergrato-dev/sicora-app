// Package cache provides caching functionality for API Gateway.
// It integrates with the shared cache package to provide Redis caching
// for rate limiting, session management, token blacklisting, and service health.
package cache

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"sicora-be-go/pkg/cache"
)

// Session represents a user session stored in cache.
type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
	LastSeen  time.Time `json:"last_seen"`
}

// RateLimitInfo represents rate limiting data for a client.
type RateLimitInfo struct {
	Requests     int        `json:"requests"`
	WindowStart  time.Time  `json:"window_start"`
	Blocked      bool       `json:"blocked"`
	BlockedUntil *time.Time `json:"blocked_until,omitempty"`
}

// ServiceHealth represents health status of a backend service.
type ServiceHealth struct {
	ServiceName  string    `json:"service_name"`
	Status       string    `json:"status"` // healthy, unhealthy, degraded
	LastCheck    time.Time `json:"last_check"`
	ResponseTime int64     `json:"response_time_ms"`
	ErrorCount   int       `json:"error_count"`
}

// APIGatewayCache provides caching for API Gateway operations.
type APIGatewayCache struct {
	client    cache.CacheInterface
	keyPrefix string
	logger    *log.Logger
}

// NewAPIGatewayCache creates a new APIGatewayCache.
func NewAPIGatewayCache(client cache.CacheInterface, logger *log.Logger) *APIGatewayCache {
	return &APIGatewayCache{
		client:    client,
		keyPrefix: cache.PrefixAPIGateway,
		logger:    logger,
	}
}

// NewAPIGatewayCacheFromEnv creates an APIGatewayCache from environment variables.
func NewAPIGatewayCacheFromEnv(logger *log.Logger) (*APIGatewayCache, error) {
	client, err := cache.NewRedisClientFromEnv(cache.PrefixAPIGateway)
	if err != nil {
		return nil, fmt.Errorf("failed to create Redis client: %w", err)
	}
	return NewAPIGatewayCache(client, logger), nil
}

// Close closes the cache connection.
func (c *APIGatewayCache) Close() error {
	return c.client.Close()
}

// Ping checks if the cache is healthy.
func (c *APIGatewayCache) Ping(ctx context.Context) error {
	return c.client.Ping(ctx)
}

// ============================================================================
// Rate Limiting Operations
// TTL: VeryShort (5 minutes) - Rate limit windows
// ============================================================================

// GetRateLimit retrieves rate limit info for a client IP.
func (c *APIGatewayCache) GetRateLimit(ctx context.Context, clientIP string) (*RateLimitInfo, error) {
	key := c.keyPrefix + cache.Gateway().RateLimit(clientIP)
	var info RateLimitInfo
	if err := c.client.GetJSON(ctx, key, &info); err != nil {
		return nil, err
	}
	return &info, nil
}

// SetRateLimit stores rate limit info for a client IP.
func (c *APIGatewayCache) SetRateLimit(ctx context.Context, clientIP string, info *RateLimitInfo) error {
	key := c.keyPrefix + cache.Gateway().RateLimit(clientIP)
	return c.client.SetJSON(ctx, key, info, cache.TTLVeryShort)
}

// IncrementRateLimit atomically increments the request count for a client.
// Returns the new count and whether the client is rate limited.
func (c *APIGatewayCache) IncrementRateLimit(ctx context.Context, clientIP string, limit int, window time.Duration) (int, bool, error) {
	// Try to get existing info
	info, err := c.GetRateLimit(ctx, clientIP)
	if err != nil {
		// Key doesn't exist, create new
		info = &RateLimitInfo{
			Requests:    1,
			WindowStart: time.Now(),
			Blocked:     false,
		}
		if err := c.SetRateLimit(ctx, clientIP, info); err != nil {
			return 0, false, err
		}
		return 1, false, nil
	}

	// Check if window has expired
	if time.Since(info.WindowStart) > window {
		info = &RateLimitInfo{
			Requests:    1,
			WindowStart: time.Now(),
			Blocked:     false,
		}
		if err := c.SetRateLimit(ctx, clientIP, info); err != nil {
			return 0, false, err
		}
		return 1, false, nil
	}

	// Check if blocked
	if info.Blocked && info.BlockedUntil != nil && time.Now().Before(*info.BlockedUntil) {
		return info.Requests, true, nil
	}

	// Increment requests
	info.Requests++

	// Check if over limit
	if info.Requests > limit {
		info.Blocked = true
		blockedUntil := time.Now().Add(window)
		info.BlockedUntil = &blockedUntil
	}

	if err := c.SetRateLimit(ctx, clientIP, info); err != nil {
		return 0, false, err
	}

	return info.Requests, info.Blocked, nil
}

// GetUserRateLimit retrieves rate limit info for a user.
func (c *APIGatewayCache) GetUserRateLimit(ctx context.Context, userID string) (*RateLimitInfo, error) {
	key := c.keyPrefix + cache.Gateway().RateLimitUser(userID)
	var info RateLimitInfo
	if err := c.client.GetJSON(ctx, key, &info); err != nil {
		return nil, err
	}
	return &info, nil
}

// SetUserRateLimit stores rate limit info for a user.
func (c *APIGatewayCache) SetUserRateLimit(ctx context.Context, userID string, info *RateLimitInfo) error {
	key := c.keyPrefix + cache.Gateway().RateLimitUser(userID)
	return c.client.SetJSON(ctx, key, info, cache.TTLVeryShort)
}

// ClearRateLimit removes rate limit for a client IP.
func (c *APIGatewayCache) ClearRateLimit(ctx context.Context, clientIP string) error {
	key := c.keyPrefix + cache.Gateway().RateLimit(clientIP)
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Session Management Operations
// TTL: Dynamic (30 minutes) - Session timeout
// ============================================================================

// GetSession retrieves a session by ID.
func (c *APIGatewayCache) GetSession(ctx context.Context, sessionID string) (*Session, error) {
	key := c.keyPrefix + cache.Gateway().Session(sessionID)
	var session Session
	if err := c.client.GetJSON(ctx, key, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

// SetSession stores a session.
func (c *APIGatewayCache) SetSession(ctx context.Context, session *Session) error {
	key := c.keyPrefix + cache.Gateway().Session(session.ID)
	return c.client.SetJSON(ctx, key, session, cache.TTLDynamic)
}

// UpdateSessionLastSeen updates the last seen timestamp of a session.
func (c *APIGatewayCache) UpdateSessionLastSeen(ctx context.Context, sessionID string) error {
	session, err := c.GetSession(ctx, sessionID)
	if err != nil {
		return err
	}
	session.LastSeen = time.Now()
	return c.SetSession(ctx, session)
}

// InvalidateSession removes a session.
func (c *APIGatewayCache) InvalidateSession(ctx context.Context, sessionID string) error {
	key := c.keyPrefix + cache.Gateway().Session(sessionID)
	return c.client.Delete(ctx, key)
}

// GetUserSessions retrieves all session IDs for a user.
func (c *APIGatewayCache) GetUserSessions(ctx context.Context, userID string) ([]string, error) {
	key := c.keyPrefix + cache.Gateway().UserSessions(userID)
	var sessionIDs []string
	if err := c.client.GetJSON(ctx, key, &sessionIDs); err != nil {
		return nil, err
	}
	return sessionIDs, nil
}

// AddUserSession adds a session ID to a user's session list.
func (c *APIGatewayCache) AddUserSession(ctx context.Context, userID, sessionID string) error {
	key := c.keyPrefix + cache.Gateway().UserSessions(userID)

	sessions, err := c.GetUserSessions(ctx, userID)
	if err != nil {
		sessions = []string{}
	}

	// Add new session
	sessions = append(sessions, sessionID)

	return c.client.SetJSON(ctx, key, sessions, cache.TTLDynamic)
}

// RemoveUserSession removes a session ID from a user's session list.
func (c *APIGatewayCache) RemoveUserSession(ctx context.Context, userID, sessionID string) error {
	key := c.keyPrefix + cache.Gateway().UserSessions(userID)

	sessions, err := c.GetUserSessions(ctx, userID)
	if err != nil {
		return nil // No sessions to remove
	}

	// Filter out the session
	filtered := make([]string, 0, len(sessions))
	for _, s := range sessions {
		if s != sessionID {
			filtered = append(filtered, s)
		}
	}

	if len(filtered) == 0 {
		return c.client.Delete(ctx, key)
	}

	return c.client.SetJSON(ctx, key, filtered, cache.TTLDynamic)
}

// InvalidateAllUserSessions removes all sessions for a user (logout all devices).
func (c *APIGatewayCache) InvalidateAllUserSessions(ctx context.Context, userID string) error {
	sessions, err := c.GetUserSessions(ctx, userID)
	if err != nil {
		return nil // No sessions
	}

	// Delete each session
	keys := make([]string, len(sessions)+1)
	for i, sessionID := range sessions {
		keys[i] = c.keyPrefix + cache.Gateway().Session(sessionID)
	}
	keys[len(sessions)] = c.keyPrefix + cache.Gateway().UserSessions(userID)

	return c.client.DeleteMany(ctx, keys)
}

// ============================================================================
// Token Blacklist Operations
// TTL: Based on token expiration
// ============================================================================

// BlacklistToken adds a JWT token ID to the blacklist.
func (c *APIGatewayCache) BlacklistToken(ctx context.Context, jti string, expiresAt time.Time) error {
	key := c.keyPrefix + cache.Gateway().TokenBlacklist(jti)
	ttl := time.Until(expiresAt)
	if ttl <= 0 {
		return nil // Token already expired
	}
	return c.client.Set(ctx, key, []byte("1"), ttl)
}

// IsTokenBlacklisted checks if a token is blacklisted.
func (c *APIGatewayCache) IsTokenBlacklisted(ctx context.Context, jti string) (bool, error) {
	key := c.keyPrefix + cache.Gateway().TokenBlacklist(jti)
	exists, err := c.client.Exists(ctx, key)
	if err != nil {
		return false, err
	}
	return exists, nil
}

// ============================================================================
// Refresh Token Operations
// TTL: Moderate (1 hour) - Refresh token validity
// ============================================================================

// RefreshTokenData represents stored refresh token data.
type RefreshTokenData struct {
	UserID    string    `json:"user_id"`
	TokenHash string    `json:"token_hash"`
	IssuedAt  time.Time `json:"issued_at"`
	ExpiresAt time.Time `json:"expires_at"`
	Used      bool      `json:"used"`
}

// StoreRefreshToken stores a refresh token.
func (c *APIGatewayCache) StoreRefreshToken(ctx context.Context, tokenID string, data *RefreshTokenData) error {
	key := c.keyPrefix + cache.Gateway().RefreshToken(tokenID)
	ttl := time.Until(data.ExpiresAt)
	if ttl <= 0 {
		return fmt.Errorf("refresh token already expired")
	}
	return c.client.SetJSON(ctx, key, data, ttl)
}

// GetRefreshToken retrieves refresh token data.
func (c *APIGatewayCache) GetRefreshToken(ctx context.Context, tokenID string) (*RefreshTokenData, error) {
	key := c.keyPrefix + cache.Gateway().RefreshToken(tokenID)
	var data RefreshTokenData
	if err := c.client.GetJSON(ctx, key, &data); err != nil {
		return nil, err
	}
	return &data, nil
}

// MarkRefreshTokenUsed marks a refresh token as used (for rotation).
func (c *APIGatewayCache) MarkRefreshTokenUsed(ctx context.Context, tokenID string) error {
	data, err := c.GetRefreshToken(ctx, tokenID)
	if err != nil {
		return err
	}
	data.Used = true
	return c.StoreRefreshToken(ctx, tokenID, data)
}

// InvalidateRefreshToken removes a refresh token.
func (c *APIGatewayCache) InvalidateRefreshToken(ctx context.Context, tokenID string) error {
	key := c.keyPrefix + cache.Gateway().RefreshToken(tokenID)
	return c.client.Delete(ctx, key)
}

// ============================================================================
// API Key Operations
// TTL: Stable (12 hours) - API keys are validated frequently
// ============================================================================

// APIKeyData represents stored API key data.
type APIKeyData struct {
	KeyHash     string     `json:"key_hash"`
	Name        string     `json:"name"`
	OwnerID     string     `json:"owner_id"`
	Permissions []string   `json:"permissions"`
	RateLimit   int        `json:"rate_limit"`
	CreatedAt   time.Time  `json:"created_at"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	Active      bool       `json:"active"`
}

// HashAPIKey creates a SHA-256 hash of an API key.
func HashAPIKey(apiKey string) string {
	hash := sha256.Sum256([]byte(apiKey))
	return hex.EncodeToString(hash[:])
}

// GetAPIKey retrieves API key data by key hash.
func (c *APIGatewayCache) GetAPIKey(ctx context.Context, keyHash string) (*APIKeyData, error) {
	key := c.keyPrefix + cache.Gateway().APIKey(keyHash)
	var data APIKeyData
	if err := c.client.GetJSON(ctx, key, &data); err != nil {
		return nil, err
	}
	return &data, nil
}

// SetAPIKey stores API key data.
func (c *APIGatewayCache) SetAPIKey(ctx context.Context, data *APIKeyData) error {
	key := c.keyPrefix + cache.Gateway().APIKey(data.KeyHash)
	return c.client.SetJSON(ctx, key, data, cache.TTLStable)
}

// InvalidateAPIKey removes an API key from cache.
func (c *APIGatewayCache) InvalidateAPIKey(ctx context.Context, keyHash string) error {
	key := c.keyPrefix + cache.Gateway().APIKey(keyHash)
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Service Health Operations
// TTL: VeryShort (5 minutes) - Health checks are frequent
// ============================================================================

// GetServiceHealth retrieves health status for a service.
func (c *APIGatewayCache) GetServiceHealth(ctx context.Context, serviceName string) (*ServiceHealth, error) {
	key := c.keyPrefix + cache.Gateway().ServiceHealth(serviceName)
	var health ServiceHealth
	if err := c.client.GetJSON(ctx, key, &health); err != nil {
		return nil, err
	}
	return &health, nil
}

// SetServiceHealth stores health status for a service.
func (c *APIGatewayCache) SetServiceHealth(ctx context.Context, health *ServiceHealth) error {
	key := c.keyPrefix + cache.Gateway().ServiceHealth(health.ServiceName)
	return c.client.SetJSON(ctx, key, health, cache.TTLVeryShort)
}

// GetAllServicesHealth retrieves health for all known services.
func (c *APIGatewayCache) GetAllServicesHealth(ctx context.Context) (map[string]*ServiceHealth, error) {
	services := []string{
		"userservice", "scheduleservice", "attendanceservice",
		"evalinservice", "kbservice", "aiservice",
		"projectevalservice", "mevalservice",
	}

	result := make(map[string]*ServiceHealth)
	for _, svc := range services {
		health, err := c.GetServiceHealth(ctx, svc)
		if err == nil {
			result[svc] = health
		}
	}
	return result, nil
}

// UpdateServiceHealth updates health status after a check.
func (c *APIGatewayCache) UpdateServiceHealth(ctx context.Context, serviceName, status string, responseTime int64, errorOccurred bool) error {
	health, err := c.GetServiceHealth(ctx, serviceName)
	if err != nil {
		health = &ServiceHealth{
			ServiceName: serviceName,
			ErrorCount:  0,
		}
	}

	health.Status = status
	health.LastCheck = time.Now()
	health.ResponseTime = responseTime

	if errorOccurred {
		health.ErrorCount++
	} else {
		health.ErrorCount = 0
	}

	return c.SetServiceHealth(ctx, health)
}

// ============================================================================
// Batch Operations
// ============================================================================

// SetMultipleSessions stores multiple sessions at once.
func (c *APIGatewayCache) SetMultipleSessions(ctx context.Context, sessions []*Session) error {
	items := make(map[string][]byte)
	for _, s := range sessions {
		key := c.keyPrefix + cache.Gateway().Session(s.ID)
		data, err := json.Marshal(s)
		if err != nil {
			c.logger.Printf("[CACHE] Failed to marshal session %s: %v", s.ID, err)
			continue
		}
		items[key] = data
	}
	if len(items) == 0 {
		return nil
	}
	return c.client.SetMany(ctx, items, cache.TTLDynamic)
}

// InvalidateMultipleSessions removes multiple sessions at once.
func (c *APIGatewayCache) InvalidateMultipleSessions(ctx context.Context, sessionIDs []string) error {
	keys := make([]string, len(sessionIDs))
	for i, id := range sessionIDs {
		keys[i] = c.keyPrefix + cache.Gateway().Session(id)
	}
	return c.client.DeleteMany(ctx, keys)
}
