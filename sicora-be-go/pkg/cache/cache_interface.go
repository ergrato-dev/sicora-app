// Package cache provides a unified caching interface for SICORA Go services.
// It abstracts the underlying cache implementation (Redis) allowing for
// easy testing and potential future implementations.
package cache

import (
	"context"
	"time"
)

// CacheInterface defines the contract for cache operations.
// All methods are context-aware for proper timeout handling and cancellation.
type CacheInterface interface {
	// Basic operations
	Get(ctx context.Context, key string) ([]byte, error)
	GetJSON(ctx context.Context, key string, dest interface{}) error
	Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
	SetJSON(ctx context.Context, key string, value interface{}, ttl time.Duration) error
	Delete(ctx context.Context, key string) error
	Exists(ctx context.Context, key string) (bool, error)

	// Batch operations
	GetMany(ctx context.Context, keys []string) (map[string][]byte, error)
	SetMany(ctx context.Context, items map[string][]byte, ttl time.Duration) error
	DeleteMany(ctx context.Context, keys []string) error

	// Pattern operations
	DeletePattern(ctx context.Context, pattern string) (int64, error)

	// TTL operations
	GetTTL(ctx context.Context, key string) (time.Duration, error)
	SetTTL(ctx context.Context, key string, ttl time.Duration) error

	// Health and stats
	Stats(ctx context.Context) (*CacheStats, error)
	Ping(ctx context.Context) error
	Close() error
}

// CacheStats holds cache performance metrics.
type CacheStats struct {
	Hits        uint64
	Misses      uint64
	Errors      uint64
	Keys        int64
	MemoryUsage int64
	Uptime      time.Duration
}

// HitRate calculates the cache hit rate as a percentage.
func (s *CacheStats) HitRate() float64 {
	total := s.Hits + s.Misses
	if total == 0 {
		return 0
	}
	return float64(s.Hits) / float64(total) * 100
}

// CacheConfig holds configuration for cache initialization.
type CacheConfig struct {
	// Connection
	Addr     string
	Password string
	DB       int

	// Pool
	PoolSize     int
	MinIdleConns int
	PoolTimeout  time.Duration

	// Timeouts
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration

	// Retry
	MaxRetries      int
	MinRetryBackoff time.Duration
	MaxRetryBackoff time.Duration

	// Options
	KeyPrefix  string
	DefaultTTL time.Duration
}

// Logger interface for cache logging.
type Logger interface {
	Debug(msg string, args ...interface{})
	Info(msg string, args ...interface{})
	Warn(msg string, args ...interface{})
	Error(msg string, args ...interface{})
}

// DefaultConfig returns a CacheConfig with sensible defaults.
func DefaultConfig() *CacheConfig {
	return &CacheConfig{
		Addr:            "localhost:6379",
		Password:        "",
		DB:              0,
		PoolSize:        10,
		MinIdleConns:    2,
		PoolTimeout:     4 * time.Second,
		DialTimeout:     5 * time.Second,
		ReadTimeout:     3 * time.Second,
		WriteTimeout:    3 * time.Second,
		MaxRetries:      3,
		MinRetryBackoff: 8 * time.Millisecond,
		MaxRetryBackoff: 512 * time.Millisecond,
		KeyPrefix:       "",
		DefaultTTL:      time.Hour,
	}
}
