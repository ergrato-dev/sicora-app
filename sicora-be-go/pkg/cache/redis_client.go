package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync/atomic"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisClient implements CacheInterface using go-redis.
type RedisClient struct {
	client    *redis.Client
	cfg       *CacheConfig
	logger    Logger
	keyPrefix string
	closed    atomic.Bool

	// Statistics
	hits      atomic.Uint64
	misses    atomic.Uint64
	errors    atomic.Uint64
	startTime time.Time
}

// NewRedisClient creates a new RedisClient with the given configuration.
func NewRedisClient(cfg *CacheConfig) (*RedisClient, error) {
	if cfg == nil {
		cfg = DefaultConfig()
	}

	opts := &redis.Options{
		Addr:            cfg.Addr,
		Password:        cfg.Password,
		DB:              cfg.DB,
		MaxRetries:      cfg.MaxRetries,
		MinRetryBackoff: cfg.MinRetryBackoff,
		MaxRetryBackoff: cfg.MaxRetryBackoff,
		DialTimeout:     cfg.DialTimeout,
		ReadTimeout:     cfg.ReadTimeout,
		WriteTimeout:    cfg.WriteTimeout,
		PoolSize:        cfg.PoolSize,
		MinIdleConns:    cfg.MinIdleConns,
		PoolTimeout:     cfg.PoolTimeout,
	}

	client := redis.NewClient(opts)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), cfg.DialTimeout)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrConnectionFailed, err)
	}

	return &RedisClient{
		client:    client,
		cfg:       cfg,
		keyPrefix: cfg.KeyPrefix,
		startTime: time.Now(),
	}, nil
}

// NewRedisClientFromURL creates a RedisClient from a Redis URL.
// URL format: redis://[:password@]host:port[/db]
func NewRedisClientFromURL(redisURL, keyPrefix string) (*RedisClient, error) {
	cfg, err := parseRedisURL(redisURL)
	if err != nil {
		return nil, err
	}
	cfg.KeyPrefix = keyPrefix
	return NewRedisClient(cfg)
}

// NewRedisClientFromEnv creates a RedisClient from environment variables.
// Supported env vars: REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB
func NewRedisClientFromEnv(keyPrefix string) (*RedisClient, error) {
	if url := os.Getenv("REDIS_URL"); url != "" {
		return NewRedisClientFromURL(url, keyPrefix)
	}

	cfg := DefaultConfig()
	cfg.KeyPrefix = keyPrefix

	if host := os.Getenv("REDIS_HOST"); host != "" {
		port := os.Getenv("REDIS_PORT")
		if port == "" {
			port = "6379"
		}
		cfg.Addr = fmt.Sprintf("%s:%s", host, port)
	}

	if password := os.Getenv("REDIS_PASSWORD"); password != "" {
		cfg.Password = password
	}

	if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
		db, err := strconv.Atoi(dbStr)
		if err == nil {
			cfg.DB = db
		}
	}

	return NewRedisClient(cfg)
}

// parseRedisURL parses a Redis URL into a CacheConfig.
func parseRedisURL(redisURL string) (*CacheConfig, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	cfg := DefaultConfig()
	cfg.Addr = opts.Addr
	cfg.Password = opts.Password
	cfg.DB = opts.DB
	return cfg, nil
}

// SetLogger sets the logger for the client.
func (r *RedisClient) SetLogger(logger Logger) {
	r.logger = logger
}

// prefixKey adds the key prefix to a key.
func (r *RedisClient) prefixKey(key string) string {
	if r.keyPrefix == "" {
		return key
	}
	return r.keyPrefix + key
}

// Get retrieves a value by key.
func (r *RedisClient) Get(ctx context.Context, key string) ([]byte, error) {
	if r.closed.Load() {
		return nil, ErrCacheClosed
	}

	val, err := r.client.Get(ctx, r.prefixKey(key)).Bytes()
	if err != nil {
		if err == redis.Nil {
			r.misses.Add(1)
			return nil, ErrKeyNotFound
		}
		r.errors.Add(1)
		return nil, fmt.Errorf("cache get error: %w", err)
	}

	r.hits.Add(1)
	return val, nil
}

// GetJSON retrieves and unmarshals a JSON value.
func (r *RedisClient) GetJSON(ctx context.Context, key string, dest interface{}) error {
	data, err := r.Get(ctx, key)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

// Set stores a value with a TTL.
func (r *RedisClient) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	if r.closed.Load() {
		return ErrCacheClosed
	}

	if ttl == 0 {
		ttl = r.cfg.DefaultTTL
	}

	err := r.client.Set(ctx, r.prefixKey(key), value, ttl).Err()
	if err != nil {
		r.errors.Add(1)
		return fmt.Errorf("cache set error: %w", err)
	}
	return nil
}

// SetJSON marshals and stores a JSON value.
func (r *RedisClient) SetJSON(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %w", err)
	}
	return r.Set(ctx, key, data, ttl)
}

// Delete removes a key.
func (r *RedisClient) Delete(ctx context.Context, key string) error {
	if r.closed.Load() {
		return ErrCacheClosed
	}

	err := r.client.Del(ctx, r.prefixKey(key)).Err()
	if err != nil {
		r.errors.Add(1)
		return fmt.Errorf("cache delete error: %w", err)
	}
	return nil
}

// GetMany retrieves multiple values by keys.
func (r *RedisClient) GetMany(ctx context.Context, keys []string) (map[string][]byte, error) {
	if r.closed.Load() {
		return nil, ErrCacheClosed
	}

	if len(keys) == 0 {
		return make(map[string][]byte), nil
	}

	// Prefix all keys
	prefixedKeys := make([]string, len(keys))
	for i, k := range keys {
		prefixedKeys[i] = r.prefixKey(k)
	}

	vals, err := r.client.MGet(ctx, prefixedKeys...).Result()
	if err != nil {
		r.errors.Add(1)
		return nil, fmt.Errorf("cache mget error: %w", err)
	}

	result := make(map[string][]byte)
	for i, val := range vals {
		if val != nil {
			if str, ok := val.(string); ok {
				result[keys[i]] = []byte(str)
				r.hits.Add(1)
			}
		} else {
			r.misses.Add(1)
		}
	}

	return result, nil
}

// SetMany stores multiple key-value pairs with a TTL.
func (r *RedisClient) SetMany(ctx context.Context, items map[string][]byte, ttl time.Duration) error {
	if r.closed.Load() {
		return ErrCacheClosed
	}

	if len(items) == 0 {
		return nil
	}

	if ttl == 0 {
		ttl = r.cfg.DefaultTTL
	}

	pipe := r.client.Pipeline()
	for k, v := range items {
		pipe.Set(ctx, r.prefixKey(k), v, ttl)
	}

	_, err := pipe.Exec(ctx)
	if err != nil {
		r.errors.Add(1)
		return fmt.Errorf("cache mset error: %w", err)
	}
	return nil
}

// DeleteMany removes multiple keys.
func (r *RedisClient) DeleteMany(ctx context.Context, keys []string) error {
	if r.closed.Load() {
		return ErrCacheClosed
	}

	if len(keys) == 0 {
		return nil
	}

	prefixedKeys := make([]string, len(keys))
	for i, k := range keys {
		prefixedKeys[i] = r.prefixKey(k)
	}

	err := r.client.Del(ctx, prefixedKeys...).Err()
	if err != nil {
		r.errors.Add(1)
		return fmt.Errorf("cache delete many error: %w", err)
	}
	return nil
}

// Exists checks if a key exists.
func (r *RedisClient) Exists(ctx context.Context, key string) (bool, error) {
	if r.closed.Load() {
		return false, ErrCacheClosed
	}

	count, err := r.client.Exists(ctx, r.prefixKey(key)).Result()
	if err != nil {
		r.errors.Add(1)
		return false, fmt.Errorf("cache exists error: %w", err)
	}
	return count > 0, nil
}

// DeletePattern removes all keys matching a pattern.
func (r *RedisClient) DeletePattern(ctx context.Context, pattern string) (int64, error) {
	if r.closed.Load() {
		return 0, ErrCacheClosed
	}

	prefixedPattern := r.prefixKey(pattern)
	var deleted int64

	iter := r.client.Scan(ctx, 0, prefixedPattern, 100).Iterator()
	for iter.Next(ctx) {
		if err := r.client.Del(ctx, iter.Val()).Err(); err != nil {
			r.errors.Add(1)
			continue
		}
		deleted++
	}

	if err := iter.Err(); err != nil {
		r.errors.Add(1)
		return deleted, fmt.Errorf("cache delete pattern error: %w", err)
	}

	return deleted, nil
}

// GetTTL returns the remaining TTL for a key.
func (r *RedisClient) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	if r.closed.Load() {
		return 0, ErrCacheClosed
	}

	ttl, err := r.client.TTL(ctx, r.prefixKey(key)).Result()
	if err != nil {
		r.errors.Add(1)
		return 0, fmt.Errorf("cache ttl error: %w", err)
	}

	if ttl < 0 {
		return 0, ErrKeyNotFound
	}

	return ttl, nil
}

// SetTTL updates the TTL of an existing key.
func (r *RedisClient) SetTTL(ctx context.Context, key string, ttl time.Duration) error {
	if r.closed.Load() {
		return ErrCacheClosed
	}

	ok, err := r.client.Expire(ctx, r.prefixKey(key), ttl).Result()
	if err != nil {
		r.errors.Add(1)
		return fmt.Errorf("cache set ttl error: %w", err)
	}

	if !ok {
		return ErrKeyNotFound
	}

	return nil
}

// Stats returns cache statistics.
func (r *RedisClient) Stats(ctx context.Context) (*CacheStats, error) {
	if r.closed.Load() {
		return nil, ErrCacheClosed
	}

	info, err := r.client.Info(ctx, "stats", "memory", "keyspace").Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get cache stats: %w", err)
	}

	stats := &CacheStats{
		Hits:   r.hits.Load(),
		Misses: r.misses.Load(),
		Errors: r.errors.Load(),
		Uptime: time.Since(r.startTime),
	}

	// Parse memory usage from INFO output
	for _, line := range strings.Split(info, "\r\n") {
		if strings.HasPrefix(line, "used_memory:") {
			if val, err := strconv.ParseInt(strings.TrimPrefix(line, "used_memory:"), 10, 64); err == nil {
				stats.MemoryUsage = val
			}
		} else if strings.HasPrefix(line, "db") {
			// Parse keyspace info: db0:keys=123,expires=45
			if idx := strings.Index(line, "keys="); idx != -1 {
				end := strings.Index(line[idx:], ",")
				if end == -1 {
					end = len(line) - idx
				}
				if val, err := strconv.ParseInt(line[idx+5:idx+end], 10, 64); err == nil {
					stats.Keys = val
				}
			}
		}
	}

	return stats, nil
}

// Ping checks if the cache is healthy.
func (r *RedisClient) Ping(ctx context.Context) error {
	if r.closed.Load() {
		return ErrCacheClosed
	}

	if err := r.client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("%w: %v", ErrConnectionFailed, err)
	}
	return nil
}

// Close closes the connection to Redis.
func (r *RedisClient) Close() error {
	if r.closed.Swap(true) {
		return nil // Already closed
	}
	return r.client.Close()
}

// Client returns the underlying go-redis client for advanced operations.
func (r *RedisClient) Client() *redis.Client {
	return r.client
}
