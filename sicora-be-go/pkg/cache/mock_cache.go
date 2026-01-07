package cache

import (
	"context"
	"encoding/json"
	"sync"
	"time"
)

// MockCache provides an in-memory cache implementation for testing.
type MockCache struct {
	mu       sync.RWMutex
	data     map[string]cacheEntry
	hits     uint64
	misses   uint64
	errors   uint64
	closed   bool
	failNext bool
}

type cacheEntry struct {
	value     []byte
	expiresAt time.Time
}

// NewMockCache creates a new MockCache.
func NewMockCache() *MockCache {
	return &MockCache{
		data: make(map[string]cacheEntry),
	}
}

// SetFailNext causes the next operation to fail (for testing error handling).
func (m *MockCache) SetFailNext(fail bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.failNext = fail
}

// Get retrieves a value by key.
func (m *MockCache) Get(ctx context.Context, key string) ([]byte, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.closed {
		return nil, ErrCacheClosed
	}

	if m.failNext {
		m.failNext = false
		return nil, ErrConnectionFailed
	}

	entry, ok := m.data[key]
	if !ok || time.Now().After(entry.expiresAt) {
		m.misses++
		return nil, ErrKeyNotFound
	}

	m.hits++
	return entry.value, nil
}

// GetJSON retrieves and unmarshals a JSON value.
func (m *MockCache) GetJSON(ctx context.Context, key string, dest interface{}) error {
	data, err := m.Get(ctx, key)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

// Set stores a value with a TTL.
func (m *MockCache) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.closed {
		return ErrCacheClosed
	}

	if m.failNext {
		m.failNext = false
		return ErrConnectionFailed
	}

	if ttl == 0 {
		ttl = time.Hour // Default TTL
	}

	m.data[key] = cacheEntry{
		value:     value,
		expiresAt: time.Now().Add(ttl),
	}
	return nil
}

// SetJSON marshals and stores a JSON value.
func (m *MockCache) SetJSON(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return m.Set(ctx, key, data, ttl)
}

// Delete removes a key.
func (m *MockCache) Delete(ctx context.Context, key string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.closed {
		return ErrCacheClosed
	}

	delete(m.data, key)
	return nil
}

// GetMany retrieves multiple values by keys.
func (m *MockCache) GetMany(ctx context.Context, keys []string) (map[string][]byte, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.closed {
		return nil, ErrCacheClosed
	}

	result := make(map[string][]byte)
	for _, key := range keys {
		if entry, ok := m.data[key]; ok && time.Now().Before(entry.expiresAt) {
			result[key] = entry.value
			m.hits++
		} else {
			m.misses++
		}
	}
	return result, nil
}

// SetMany stores multiple key-value pairs with a TTL.
func (m *MockCache) SetMany(ctx context.Context, items map[string][]byte, ttl time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.closed {
		return ErrCacheClosed
	}

	if ttl == 0 {
		ttl = time.Hour
	}

	expiresAt := time.Now().Add(ttl)
	for k, v := range items {
		m.data[k] = cacheEntry{
			value:     v,
			expiresAt: expiresAt,
		}
	}
	return nil
}

// DeleteMany removes multiple keys.
func (m *MockCache) DeleteMany(ctx context.Context, keys []string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.closed {
		return ErrCacheClosed
	}

	for _, key := range keys {
		delete(m.data, key)
	}
	return nil
}

// Exists checks if a key exists.
func (m *MockCache) Exists(ctx context.Context, key string) (bool, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.closed {
		return false, ErrCacheClosed
	}

	entry, ok := m.data[key]
	if !ok || time.Now().After(entry.expiresAt) {
		return false, nil
	}
	return true, nil
}

// DeletePattern removes all keys matching a pattern.
func (m *MockCache) DeletePattern(ctx context.Context, pattern string) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.closed {
		return 0, ErrCacheClosed
	}

	var deleted int64
	for key := range m.data {
		if matchPattern(pattern, key) {
			delete(m.data, key)
			deleted++
		}
	}
	return deleted, nil
}

// GetTTL returns the remaining TTL for a key.
func (m *MockCache) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.closed {
		return 0, ErrCacheClosed
	}

	entry, ok := m.data[key]
	if !ok || time.Now().After(entry.expiresAt) {
		return 0, ErrKeyNotFound
	}

	return time.Until(entry.expiresAt), nil
}

// SetTTL updates the TTL of an existing key.
func (m *MockCache) SetTTL(ctx context.Context, key string, ttl time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.closed {
		return ErrCacheClosed
	}

	entry, ok := m.data[key]
	if !ok {
		return ErrKeyNotFound
	}

	entry.expiresAt = time.Now().Add(ttl)
	m.data[key] = entry
	return nil
}

// Stats returns cache statistics.
func (m *MockCache) Stats(ctx context.Context) (*CacheStats, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.closed {
		return nil, ErrCacheClosed
	}

	return &CacheStats{
		Hits:   m.hits,
		Misses: m.misses,
		Errors: m.errors,
		Keys:   int64(len(m.data)),
	}, nil
}

// Ping checks if the cache is healthy.
func (m *MockCache) Ping(ctx context.Context) error {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.closed {
		return ErrCacheClosed
	}

	if m.failNext {
		m.failNext = false
		return ErrConnectionFailed
	}

	return nil
}

// Close closes the mock cache.
func (m *MockCache) Close() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.closed = true
	m.data = make(map[string]cacheEntry)
	return nil
}

// Reset clears all data and resets stats (for testing).
func (m *MockCache) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.data = make(map[string]cacheEntry)
	m.hits = 0
	m.misses = 0
	m.errors = 0
	m.closed = false
	m.failNext = false
}

// Count returns the number of items in the cache (for testing).
func (m *MockCache) Count() int {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return len(m.data)
}

// matchPattern matches a simple glob pattern (only supports * wildcard).
func matchPattern(pattern, key string) bool {
	if pattern == "*" {
		return true
	}

	// Handle prefix patterns like "campus:*"
	if len(pattern) > 0 && pattern[len(pattern)-1] == '*' {
		prefix := pattern[:len(pattern)-1]
		return len(key) >= len(prefix) && key[:len(prefix)] == prefix
	}

	return pattern == key
}
