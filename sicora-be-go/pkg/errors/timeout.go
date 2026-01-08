package errors

import (
	"context"
	"time"
)

// ============================================================================
// DEFAULT TIMEOUT VALUES
// ============================================================================

const (
	// DefaultHTTPTimeout for HTTP client requests
	DefaultHTTPTimeout = 30 * time.Second

	// DefaultDatabaseTimeout for database operations
	DefaultDatabaseTimeout = 10 * time.Second

	// DefaultCacheTimeout for cache operations
	DefaultCacheTimeout = 2 * time.Second

	// DefaultQueryTimeout for simple database queries
	DefaultQueryTimeout = 5 * time.Second

	// DefaultTransactionTimeout for database transactions
	DefaultTransactionTimeout = 30 * time.Second

	// DefaultExternalAPITimeout for external API calls
	DefaultExternalAPITimeout = 15 * time.Second

	// DefaultShortTimeout for quick operations
	DefaultShortTimeout = 1 * time.Second

	// DefaultLongTimeout for long-running operations
	DefaultLongTimeout = 60 * time.Second

	// DefaultBatchTimeout for batch operations
	DefaultBatchTimeout = 120 * time.Second
)

// ============================================================================
// TIMEOUT CONFIGURATION
// ============================================================================

// TimeoutConfig holds timeout configurations for different operation types
type TimeoutConfig struct {
	HTTP        time.Duration
	Database    time.Duration
	Cache       time.Duration
	Query       time.Duration
	Transaction time.Duration
	ExternalAPI time.Duration
	Short       time.Duration
	Long        time.Duration
	Batch       time.Duration
}

// DefaultTimeoutConfig returns the default timeout configuration
func DefaultTimeoutConfig() *TimeoutConfig {
	return &TimeoutConfig{
		HTTP:        DefaultHTTPTimeout,
		Database:    DefaultDatabaseTimeout,
		Cache:       DefaultCacheTimeout,
		Query:       DefaultQueryTimeout,
		Transaction: DefaultTransactionTimeout,
		ExternalAPI: DefaultExternalAPITimeout,
		Short:       DefaultShortTimeout,
		Long:        DefaultLongTimeout,
		Batch:       DefaultBatchTimeout,
	}
}

// ============================================================================
// CONTEXT WITH TIMEOUT HELPERS
// ============================================================================

// WithTimeout creates a context with the specified timeout
// Returns the context and a cancel function that must be called
func WithTimeout(parent context.Context, timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, timeout)
}

// WithHTTPTimeout creates a context with HTTP timeout
func WithHTTPTimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultHTTPTimeout)
}

// WithDatabaseTimeout creates a context with database timeout
func WithDatabaseTimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultDatabaseTimeout)
}

// WithCacheTimeout creates a context with cache timeout
func WithCacheTimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultCacheTimeout)
}

// WithQueryTimeout creates a context with query timeout
func WithQueryTimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultQueryTimeout)
}

// WithTransactionTimeout creates a context with transaction timeout
func WithTransactionTimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultTransactionTimeout)
}

// WithExternalAPITimeout creates a context with external API timeout
func WithExternalAPITimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultExternalAPITimeout)
}

// WithShortTimeout creates a context with short timeout
func WithShortTimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultShortTimeout)
}

// WithLongTimeout creates a context with long timeout
func WithLongTimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultLongTimeout)
}

// WithBatchTimeout creates a context with batch operation timeout
func WithBatchTimeout(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, DefaultBatchTimeout)
}

// ============================================================================
// TIMEOUT EXECUTION WRAPPERS
// ============================================================================

// TimeoutResult represents the result of a timeout-wrapped operation
type TimeoutResult[T any] struct {
	Value T
	Err   error
}

// ExecuteWithTimeout executes a function with a timeout
// Returns a timeout error if the operation exceeds the timeout
func ExecuteWithTimeout[T any](
	ctx context.Context,
	timeout time.Duration,
	operation string,
	fn func(ctx context.Context) (T, error),
) (T, error) {
	var zero T

	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	resultCh := make(chan TimeoutResult[T], 1)

	go func() {
		result, err := fn(ctx)
		resultCh <- TimeoutResult[T]{Value: result, Err: err}
	}()

	select {
	case result := <-resultCh:
		if result.Err != nil {
			return zero, result.Err
		}
		return result.Value, nil
	case <-ctx.Done():
		if ctx.Err() == context.DeadlineExceeded {
			return zero, NewTimeoutError(operation).WithDetail("timeout", timeout.String())
		}
		return zero, NewInternalError("operation cancelled", ctx.Err())
	}
}

// ExecuteWithTimeoutNoResult executes a function with a timeout (no return value)
func ExecuteWithTimeoutNoResult(
	ctx context.Context,
	timeout time.Duration,
	operation string,
	fn func(ctx context.Context) error,
) error {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	errCh := make(chan error, 1)

	go func() {
		errCh <- fn(ctx)
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
		if ctx.Err() == context.DeadlineExceeded {
			return NewTimeoutError(operation).WithDetail("timeout", timeout.String())
		}
		return NewInternalError("operation cancelled", ctx.Err())
	}
}

// ============================================================================
// OPERATION-SPECIFIC TIMEOUT WRAPPERS
// ============================================================================

// ExecuteDBOperation executes a database operation with timeout
func ExecuteDBOperation[T any](
	ctx context.Context,
	operation string,
	fn func(ctx context.Context) (T, error),
) (T, error) {
	return ExecuteWithTimeout(ctx, DefaultDatabaseTimeout, operation, fn)
}

// ExecuteDBQuery executes a database query with timeout
func ExecuteDBQuery[T any](
	ctx context.Context,
	fn func(ctx context.Context) (T, error),
) (T, error) {
	return ExecuteWithTimeout(ctx, DefaultQueryTimeout, "database_query", fn)
}

// ExecuteCacheOperation executes a cache operation with timeout
func ExecuteCacheOperation[T any](
	ctx context.Context,
	operation string,
	fn func(ctx context.Context) (T, error),
) (T, error) {
	return ExecuteWithTimeout(ctx, DefaultCacheTimeout, operation, fn)
}

// ExecuteExternalAPI executes an external API call with timeout
func ExecuteExternalAPI[T any](
	ctx context.Context,
	service string,
	fn func(ctx context.Context) (T, error),
) (T, error) {
	return ExecuteWithTimeout(ctx, DefaultExternalAPITimeout, "external_api_"+service, fn)
}

// ============================================================================
// DEADLINE UTILITIES
// ============================================================================

// GetDeadline returns the deadline from context, or a default deadline
func GetDeadline(ctx context.Context, defaultTimeout time.Duration) time.Time {
	if deadline, ok := ctx.Deadline(); ok {
		return deadline
	}
	return time.Now().Add(defaultTimeout)
}

// RemainingTime returns the remaining time until context deadline
// Returns defaultTimeout if no deadline is set
func RemainingTime(ctx context.Context, defaultTimeout time.Duration) time.Duration {
	if deadline, ok := ctx.Deadline(); ok {
		remaining := time.Until(deadline)
		if remaining < 0 {
			return 0
		}
		return remaining
	}
	return defaultTimeout
}

// HasSufficientTime checks if there's enough time remaining in the context
func HasSufficientTime(ctx context.Context, required time.Duration) bool {
	if deadline, ok := ctx.Deadline(); ok {
		return time.Until(deadline) >= required
	}
	return true // No deadline, assume sufficient time
}

// EnsureSufficientTime returns an error if there isn't enough time remaining
func EnsureSufficientTime(ctx context.Context, required time.Duration, operation string) error {
	if !HasSufficientTime(ctx, required) {
		remaining := RemainingTime(ctx, 0)
		return NewTimeoutError(operation).WithDetails(map[string]interface{}{
			"required_time":  required.String(),
			"remaining_time": remaining.String(),
		})
	}
	return nil
}

// ============================================================================
// TIMEOUT ERROR CHECKING
// ============================================================================

// IsContextTimeout checks if an error is a context timeout error
func IsContextTimeout(err error) bool {
	if err == nil {
		return false
	}
	return err == context.DeadlineExceeded || IsTimeout(err)
}

// IsContextCancelled checks if an error is a context cancellation error
func IsContextCancelled(err error) bool {
	if err == nil {
		return false
	}
	return err == context.Canceled
}

// CheckContextError wraps context errors as AppError
func CheckContextError(ctx context.Context, operation string) error {
	if ctx.Err() == nil {
		return nil
	}
	if ctx.Err() == context.DeadlineExceeded {
		return NewTimeoutError(operation)
	}
	if ctx.Err() == context.Canceled {
		return NewInternalError("operation cancelled", ctx.Err())
	}
	return NewInternalError("context error", ctx.Err())
}

// ============================================================================
// TIMEOUT DECORATOR
// ============================================================================

// TimeoutDecorator wraps operations with timeout handling
type TimeoutDecorator struct {
	config *TimeoutConfig
}

// NewTimeoutDecorator creates a new timeout decorator
func NewTimeoutDecorator(config *TimeoutConfig) *TimeoutDecorator {
	if config == nil {
		config = DefaultTimeoutConfig()
	}
	return &TimeoutDecorator{config: config}
}

// Database wraps a database operation with timeout
func (td *TimeoutDecorator) Database(ctx context.Context, operation string, fn func(ctx context.Context) error) error {
	return ExecuteWithTimeoutNoResult(ctx, td.config.Database, operation, fn)
}

// Query wraps a query operation with timeout
func (td *TimeoutDecorator) Query(ctx context.Context, fn func(ctx context.Context) error) error {
	return ExecuteWithTimeoutNoResult(ctx, td.config.Query, "query", fn)
}

// Cache wraps a cache operation with timeout
func (td *TimeoutDecorator) Cache(ctx context.Context, operation string, fn func(ctx context.Context) error) error {
	return ExecuteWithTimeoutNoResult(ctx, td.config.Cache, operation, fn)
}

// External wraps an external API call with timeout
func (td *TimeoutDecorator) External(ctx context.Context, service string, fn func(ctx context.Context) error) error {
	return ExecuteWithTimeoutNoResult(ctx, td.config.ExternalAPI, "external_"+service, fn)
}

// Custom wraps an operation with custom timeout
func (td *TimeoutDecorator) Custom(ctx context.Context, timeout time.Duration, operation string, fn func(ctx context.Context) error) error {
	return ExecuteWithTimeoutNoResult(ctx, timeout, operation, fn)
}

// ============================================================================
// PROGRESSIVE TIMEOUT
// ============================================================================

// ProgressiveTimeout implements progressive timeout for retries
type ProgressiveTimeout struct {
	Initial    time.Duration
	Max        time.Duration
	Multiplier float64
	current    time.Duration
}

// NewProgressiveTimeout creates a new progressive timeout
func NewProgressiveTimeout(initial, max time.Duration, multiplier float64) *ProgressiveTimeout {
	return &ProgressiveTimeout{
		Initial:    initial,
		Max:        max,
		Multiplier: multiplier,
		current:    initial,
	}
}

// Next returns the next timeout value and advances the state
func (pt *ProgressiveTimeout) Next() time.Duration {
	timeout := pt.current
	pt.current = time.Duration(float64(pt.current) * pt.Multiplier)
	if pt.current > pt.Max {
		pt.current = pt.Max
	}
	return timeout
}

// Reset resets the timeout to initial value
func (pt *ProgressiveTimeout) Reset() {
	pt.current = pt.Initial
}

// Current returns the current timeout value without advancing
func (pt *ProgressiveTimeout) Current() time.Duration {
	return pt.current
}
