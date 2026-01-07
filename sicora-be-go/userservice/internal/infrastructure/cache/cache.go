// Package cache provides caching functionality for UserService.
// It integrates with the shared cache package to provide Redis caching
// for frequently accessed user data like profiles and instructor lists.
package cache

import (
	"context"
	"fmt"
	"log"

	"encoding/json"
	"sicora-be-go/pkg/cache"

	"userservice/internal/domain/entities"
)

// UserServiceCache provides caching for user service entities.
type UserServiceCache struct {
	client    cache.CacheInterface
	keyPrefix string
	logger    *log.Logger
}

// NewUserServiceCache creates a new UserServiceCache.
func NewUserServiceCache(client cache.CacheInterface, logger *log.Logger) *UserServiceCache {
	return &UserServiceCache{
		client:    client,
		keyPrefix: cache.PrefixUserService,
		logger:    logger,
	}
}

// NewUserServiceCacheFromEnv creates a UserServiceCache from environment variables.
func NewUserServiceCacheFromEnv(logger *log.Logger) (*UserServiceCache, error) {
	client, err := cache.NewRedisClientFromEnv(cache.PrefixUserService)
	if err != nil {
		return nil, fmt.Errorf("failed to create Redis client: %w", err)
	}
	return NewUserServiceCache(client, logger), nil
}

// Close closes the cache connection.
func (c *UserServiceCache) Close() error {
	return c.client.Close()
}

// Ping checks if the cache is healthy.
func (c *UserServiceCache) Ping(ctx context.Context) error {
	return c.client.Ping(ctx)
}

// ============================================================================
// User Cache Operations
// TTL: Dynamic (30 minutes) - Users change moderately
// ============================================================================

// GetUser retrieves a user from cache by ID.
func (c *UserServiceCache) GetUser(ctx context.Context, id string) (*entities.User, error) {
	key := c.keyPrefix + cache.User().ByID(id)
	var user entities.User
	if err := c.client.GetJSON(ctx, key, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// SetUser stores a user in cache.
func (c *UserServiceCache) SetUser(ctx context.Context, user *entities.User) error {
	key := c.keyPrefix + cache.User().ByID(user.ID.String())
	return c.client.SetJSON(ctx, key, user, cache.TTLDynamic)
}

// GetUserByEmail retrieves a user from cache by email.
func (c *UserServiceCache) GetUserByEmail(ctx context.Context, email string) (*entities.User, error) {
	key := c.keyPrefix + cache.User().ByEmail(email)
	var user entities.User
	if err := c.client.GetJSON(ctx, key, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// SetUserByEmail stores a user in cache indexed by email.
func (c *UserServiceCache) SetUserByEmail(ctx context.Context, user *entities.User) error {
	key := c.keyPrefix + cache.User().ByEmail(user.Email)
	return c.client.SetJSON(ctx, key, user, cache.TTLDynamic)
}

// GetUserByDocument retrieves a user from cache by document.
func (c *UserServiceCache) GetUserByDocument(ctx context.Context, documento string) (*entities.User, error) {
	key := c.keyPrefix + cache.User().ByDocument(documento)
	var user entities.User
	if err := c.client.GetJSON(ctx, key, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// SetUserByDocument stores a user in cache indexed by document.
func (c *UserServiceCache) SetUserByDocument(ctx context.Context, user *entities.User) error {
	key := c.keyPrefix + cache.User().ByDocument(user.Documento)
	return c.client.SetJSON(ctx, key, user, cache.TTLDynamic)
}

// InvalidateUser removes all cache entries for a user.
func (c *UserServiceCache) InvalidateUser(ctx context.Context, id, email, documento string) error {
	keys := []string{
		c.keyPrefix + cache.User().ByID(id),
	}
	if email != "" {
		keys = append(keys, c.keyPrefix+cache.User().ByEmail(email))
	}
	if documento != "" {
		keys = append(keys, c.keyPrefix+cache.User().ByDocument(documento))
	}
	// Also invalidate list caches
	keys = append(keys, c.keyPrefix+cache.User().InstructorsActive())
	keys = append(keys, c.keyPrefix+cache.User().ApprenticesActive())

	return c.client.DeleteMany(ctx, keys)
}

// ============================================================================
// Profile Cache Operations
// TTL: Dynamic (30 minutes)
// ============================================================================

// GetProfile retrieves a user profile from cache.
func (c *UserServiceCache) GetProfile(ctx context.Context, userID string) (*entities.User, error) {
	key := c.keyPrefix + cache.User().Profile(userID)
	var user entities.User
	if err := c.client.GetJSON(ctx, key, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// SetProfile stores a user profile in cache.
func (c *UserServiceCache) SetProfile(ctx context.Context, user *entities.User) error {
	key := c.keyPrefix + cache.User().Profile(user.ID.String())
	return c.client.SetJSON(ctx, key, user, cache.TTLDynamic)
}

// InvalidateProfile removes a profile from cache.
func (c *UserServiceCache) InvalidateProfile(ctx context.Context, userID string) error {
	key := c.keyPrefix + cache.User().Profile(userID)
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Users by Group (Ficha) Cache Operations
// TTL: Semi-stable (6 hours) - Group assignments change rarely
// ============================================================================

// GetUsersByGroup retrieves users in a group from cache.
func (c *UserServiceCache) GetUsersByGroup(ctx context.Context, fichaID string) ([]*entities.User, error) {
	key := c.keyPrefix + cache.User().ByGroup(fichaID)
	var users []*entities.User
	if err := c.client.GetJSON(ctx, key, &users); err != nil {
		return nil, err
	}
	return users, nil
}

// SetUsersByGroup stores users in a group in cache.
func (c *UserServiceCache) SetUsersByGroup(ctx context.Context, fichaID string, users []*entities.User) error {
	key := c.keyPrefix + cache.User().ByGroup(fichaID)
	return c.client.SetJSON(ctx, key, users, cache.TTLSemiStable)
}

// InvalidateUsersByGroup removes a group's users from cache.
func (c *UserServiceCache) InvalidateUsersByGroup(ctx context.Context, fichaID string) error {
	key := c.keyPrefix + cache.User().ByGroup(fichaID)
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Users by Role Cache Operations
// TTL: Semi-stable (6 hours) - Role lists change rarely
// ============================================================================

// GetUsersByRole retrieves users with a specific role from cache.
func (c *UserServiceCache) GetUsersByRole(ctx context.Context, role string) ([]*entities.User, error) {
	key := c.keyPrefix + cache.User().ByRole(role)
	var users []*entities.User
	if err := c.client.GetJSON(ctx, key, &users); err != nil {
		return nil, err
	}
	return users, nil
}

// SetUsersByRole stores users with a role in cache.
func (c *UserServiceCache) SetUsersByRole(ctx context.Context, role string, users []*entities.User) error {
	key := c.keyPrefix + cache.User().ByRole(role)
	return c.client.SetJSON(ctx, key, users, cache.TTLSemiStable)
}

// InvalidateUsersByRole removes a role's users from cache.
func (c *UserServiceCache) InvalidateUsersByRole(ctx context.Context, role string) error {
	key := c.keyPrefix + cache.User().ByRole(role)
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Active Instructors Cache Operations
// TTL: Semi-stable (6 hours) - Instructor list changes rarely
// ============================================================================

// GetActiveInstructors retrieves active instructors from cache.
func (c *UserServiceCache) GetActiveInstructors(ctx context.Context) ([]*entities.User, error) {
	key := c.keyPrefix + cache.User().InstructorsActive()
	var users []*entities.User
	if err := c.client.GetJSON(ctx, key, &users); err != nil {
		return nil, err
	}
	return users, nil
}

// SetActiveInstructors stores active instructors in cache.
func (c *UserServiceCache) SetActiveInstructors(ctx context.Context, users []*entities.User) error {
	key := c.keyPrefix + cache.User().InstructorsActive()
	return c.client.SetJSON(ctx, key, users, cache.TTLSemiStable)
}

// InvalidateActiveInstructors removes active instructors from cache.
func (c *UserServiceCache) InvalidateActiveInstructors(ctx context.Context) error {
	key := c.keyPrefix + cache.User().InstructorsActive()
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Active Apprentices Cache Operations
// TTL: Semi-stable (6 hours) - Apprentice list changes rarely
// ============================================================================

// GetActiveApprentices retrieves active apprentices from cache.
func (c *UserServiceCache) GetActiveApprentices(ctx context.Context) ([]*entities.User, error) {
	key := c.keyPrefix + cache.User().ApprenticesActive()
	var users []*entities.User
	if err := c.client.GetJSON(ctx, key, &users); err != nil {
		return nil, err
	}
	return users, nil
}

// SetActiveApprentices stores active apprentices in cache.
func (c *UserServiceCache) SetActiveApprentices(ctx context.Context, users []*entities.User) error {
	key := c.keyPrefix + cache.User().ApprenticesActive()
	return c.client.SetJSON(ctx, key, users, cache.TTLSemiStable)
}

// InvalidateActiveApprentices removes active apprentices from cache.
func (c *UserServiceCache) InvalidateActiveApprentices(ctx context.Context) error {
	key := c.keyPrefix + cache.User().ApprenticesActive()
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Cache Warmup Functions
// ============================================================================

// WarmupActiveInstructors preloads active instructors into cache.
func (c *UserServiceCache) WarmupActiveInstructors(ctx context.Context, users []*entities.User) error {
	if len(users) == 0 {
		return nil
	}
	if err := c.SetActiveInstructors(ctx, users); err != nil {
		return fmt.Errorf("failed to warmup active instructors: %w", err)
	}
	c.logger.Printf("[CACHE] Warmed up %d active instructors", len(users))
	return nil
}

// WarmupActiveApprentices preloads active apprentices into cache.
func (c *UserServiceCache) WarmupActiveApprentices(ctx context.Context, users []*entities.User) error {
	if len(users) == 0 {
		return nil
	}
	if err := c.SetActiveApprentices(ctx, users); err != nil {
		return fmt.Errorf("failed to warmup active apprentices: %w", err)
	}
	c.logger.Printf("[CACHE] Warmed up %d active apprentices", len(users))
	return nil
}

// ============================================================================
// Batch Operations
// ============================================================================

// SetMultipleUsers stores multiple users in cache at once.
func (c *UserServiceCache) SetMultipleUsers(ctx context.Context, users []*entities.User) error {
	items := make(map[string][]byte)
	for _, user := range users {
		key := c.keyPrefix + cache.User().ByID(user.ID.String())
		data, err := json.Marshal(user)
		if err != nil {
			c.logger.Printf("[CACHE] Failed to marshal user %s: %v", user.ID.String(), err)
			continue
		}
		items[key] = data
	}
	if len(items) == 0 {
		return nil
	}
	return c.client.SetMany(ctx, items, cache.TTLDynamic)
}

// InvalidateMultipleUsers removes multiple users from cache.
func (c *UserServiceCache) InvalidateMultipleUsers(ctx context.Context, userIDs []string) error {
	keys := make([]string, len(userIDs))
	for i, id := range userIDs {
		keys[i] = c.keyPrefix + cache.User().ByID(id)
	}
	// Also invalidate list caches
	keys = append(keys, c.keyPrefix+cache.User().InstructorsActive())
	keys = append(keys, c.keyPrefix+cache.User().ApprenticesActive())
	return c.client.DeleteMany(ctx, keys)
}
