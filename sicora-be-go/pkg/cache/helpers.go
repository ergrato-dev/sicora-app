package cache

import (
	"context"
	"encoding/json"
	"time"
)

// CachedRepository provides a generic cache layer for repositories.
type CachedRepository[T any] struct {
	cache CacheInterface
	ttl   time.Duration
}

// NewCachedRepository creates a new CachedRepository with the given cache and TTL.
func NewCachedRepository[T any](cache CacheInterface, ttl time.Duration) *CachedRepository[T] {
	return &CachedRepository[T]{
		cache: cache,
		ttl:   ttl,
	}
}

// Get retrieves a cached item or calls the fallback function.
func (r *CachedRepository[T]) Get(ctx context.Context, key string, fallback func() (T, error)) (T, error) {
	var result T

	// Try cache first
	data, err := r.cache.Get(ctx, key)
	if err == nil {
		if err := json.Unmarshal(data, &result); err == nil {
			return result, nil
		}
	}

	// Cache miss or unmarshal error - call fallback
	result, err = fallback()
	if err != nil {
		return result, err
	}

	// Store in cache (async to not block)
	go func() {
		if data, err := json.Marshal(result); err == nil {
			_ = r.cache.Set(context.Background(), key, data, r.ttl)
		}
	}()

	return result, nil
}

// GetMany retrieves multiple cached items or calls the fallback function for missing keys.
func (r *CachedRepository[T]) GetMany(ctx context.Context, keys []string, fallback func(missingKeys []string) (map[string]T, error)) (map[string]T, error) {
	result := make(map[string]T)

	// Try cache first
	cached, err := r.cache.GetMany(ctx, keys)
	if err != nil {
		// Cache error - fall back to source
		return fallback(keys)
	}

	// Unmarshal cached items
	missingKeys := make([]string, 0)
	for _, key := range keys {
		if data, ok := cached[key]; ok {
			var item T
			if err := json.Unmarshal(data, &item); err == nil {
				result[key] = item
				continue
			}
		}
		missingKeys = append(missingKeys, key)
	}

	// Fetch missing items
	if len(missingKeys) > 0 {
		missing, err := fallback(missingKeys)
		if err != nil {
			return result, err
		}

		// Add to result and cache
		toCache := make(map[string][]byte)
		for key, item := range missing {
			result[key] = item
			if data, err := json.Marshal(item); err == nil {
				toCache[key] = data
			}
		}

		// Store in cache (async)
		if len(toCache) > 0 {
			go func() {
				_ = r.cache.SetMany(context.Background(), toCache, r.ttl)
			}()
		}
	}

	return result, nil
}

// Set stores an item in cache.
func (r *CachedRepository[T]) Set(ctx context.Context, key string, value T) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.cache.Set(ctx, key, data, r.ttl)
}

// Invalidate removes an item from cache.
func (r *CachedRepository[T]) Invalidate(ctx context.Context, key string) error {
	return r.cache.Delete(ctx, key)
}

// InvalidatePattern removes all items matching a pattern.
func (r *CachedRepository[T]) InvalidatePattern(ctx context.Context, pattern string) (int64, error) {
	return r.cache.DeletePattern(ctx, pattern)
}

// CacheDecorator wraps a function with caching logic.
type CacheDecorator struct {
	cache CacheInterface
}

// NewCacheDecorator creates a new CacheDecorator.
func NewCacheDecorator(cache CacheInterface) *CacheDecorator {
	return &CacheDecorator{cache: cache}
}

// Wrap wraps a function with caching logic.
func (d *CacheDecorator) Wrap(key string, ttl time.Duration, fn func() (interface{}, error)) (interface{}, error) {
	// Try cache first
	data, err := d.cache.Get(context.Background(), key)
	if err == nil {
		var result interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result, nil
		}
	}

	// Execute function
	result, err := fn()
	if err != nil {
		return nil, err
	}

	// Store result in cache
	if data, err := json.Marshal(result); err == nil {
		_ = d.cache.Set(context.Background(), key, data, ttl)
	}

	return result, nil
}

// CachedList caches a list fetch operation.
func CachedList[T any](ctx context.Context, cache CacheInterface, key string, ttl time.Duration, fetch func() ([]T, error)) ([]T, error) {
	// Try cache
	data, err := cache.Get(ctx, key)
	if err == nil {
		var result []T
		if err := json.Unmarshal(data, &result); err == nil {
			return result, nil
		}
	}

	// Fetch from source
	result, err := fetch()
	if err != nil {
		return nil, err
	}

	// Store in cache
	if data, err := json.Marshal(result); err == nil {
		_ = cache.Set(ctx, key, data, ttl)
	}

	return result, nil
}

// CachedItem caches a single item fetch operation.
func CachedItem[T any](ctx context.Context, cache CacheInterface, key string, ttl time.Duration, fetch func() (T, error)) (T, error) {
	var result T

	// Try cache
	data, err := cache.Get(ctx, key)
	if err == nil {
		if err := json.Unmarshal(data, &result); err == nil {
			return result, nil
		}
	}

	// Fetch from source
	result, err = fetch()
	if err != nil {
		return result, err
	}

	// Store in cache
	if data, err := json.Marshal(result); err == nil {
		_ = cache.Set(ctx, key, data, ttl)
	}

	return result, nil
}

// WithCacheInvalidation wraps a write operation with cache invalidation.
func WithCacheInvalidation(cache CacheInterface, keys []string, fn func() error) error {
	if err := fn(); err != nil {
		return err
	}

	// Invalidate cache keys
	ctx := context.Background()
	for _, key := range keys {
		_ = cache.Delete(ctx, key)
	}

	return nil
}

// WithPatternInvalidation wraps a write operation with pattern-based cache invalidation.
func WithPatternInvalidation(cache CacheInterface, patterns []string, fn func() error) error {
	if err := fn(); err != nil {
		return err
	}

	// Invalidate cache patterns
	ctx := context.Background()
	for _, pattern := range patterns {
		_, _ = cache.DeletePattern(ctx, pattern)
	}

	return nil
}

// RefreshAhead implements a refresh-ahead caching pattern.
// When TTL falls below threshold, it triggers a background refresh.
func RefreshAhead[T any](ctx context.Context, cache CacheInterface, key string, ttl time.Duration, threshold time.Duration, fetch func() (T, error)) (T, error) {
	var result T

	// Try cache
	data, err := cache.Get(ctx, key)
	if err == nil {
		if err := json.Unmarshal(data, &result); err == nil {
			// Check if we need to refresh
			remainingTTL, _ := cache.GetTTL(ctx, key)
			if remainingTTL > 0 && remainingTTL < threshold {
				// Trigger background refresh
				go func() {
					if newResult, err := fetch(); err == nil {
						if data, err := json.Marshal(newResult); err == nil {
							_ = cache.Set(context.Background(), key, data, ttl)
						}
					}
				}()
			}
			return result, nil
		}
	}

	// Cache miss - fetch synchronously
	result, err = fetch()
	if err != nil {
		return result, err
	}

	// Store in cache
	if data, err := json.Marshal(result); err == nil {
		_ = cache.Set(ctx, key, data, ttl)
	}

	return result, nil
}
