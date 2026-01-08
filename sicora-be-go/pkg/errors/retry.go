package errors

import (
	"context"
	"math"
	"math/rand"
	"time"
)

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

// RetryConfig configures retry behavior
type RetryConfig struct {
	// MaxAttempts is the maximum number of retry attempts (including initial)
	MaxAttempts int

	// InitialDelay is the initial delay before first retry
	InitialDelay time.Duration

	// MaxDelay is the maximum delay between retries
	MaxDelay time.Duration

	// Multiplier is the exponential backoff multiplier
	Multiplier float64

	// Jitter adds randomness to delays (0.0 - 1.0)
	Jitter float64

	// RetryableErrors defines which errors should trigger a retry
	// If nil, uses IsRetryable() check
	RetryableErrors []ErrorCode

	// OnRetry is called before each retry attempt
	OnRetry func(attempt int, err error, delay time.Duration)
}

// DefaultRetryConfig returns sensible default retry configuration
func DefaultRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxAttempts:  3,
		InitialDelay: 100 * time.Millisecond,
		MaxDelay:     10 * time.Second,
		Multiplier:   2.0,
		Jitter:       0.1,
	}
}

// AggressiveRetryConfig returns config for critical operations
func AggressiveRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxAttempts:  5,
		InitialDelay: 50 * time.Millisecond,
		MaxDelay:     30 * time.Second,
		Multiplier:   2.0,
		Jitter:       0.2,
	}
}

// ConservativeRetryConfig returns config for non-critical operations
func ConservativeRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxAttempts:  2,
		InitialDelay: 500 * time.Millisecond,
		MaxDelay:     5 * time.Second,
		Multiplier:   1.5,
		Jitter:       0.1,
	}
}

// DatabaseRetryConfig returns config optimized for database operations
func DatabaseRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxAttempts:  3,
		InitialDelay: 100 * time.Millisecond,
		MaxDelay:     5 * time.Second,
		Multiplier:   2.0,
		Jitter:       0.15,
		RetryableErrors: []ErrorCode{
			CodeDBConnection,
			CodeDBTimeout,
			CodeDBDeadlock,
		},
	}
}

// ExternalAPIRetryConfig returns config for external API calls
func ExternalAPIRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxAttempts:  3,
		InitialDelay: 200 * time.Millisecond,
		MaxDelay:     15 * time.Second,
		Multiplier:   2.5,
		Jitter:       0.2,
		RetryableErrors: []ErrorCode{
			CodeExtConnection,
			CodeExtTimeout,
			CodeSysUnavailable,
			CodeSysRateLimit,
		},
	}
}

// ============================================================================
// RETRY EXECUTOR
// ============================================================================

// Retryer handles retry logic with exponential backoff
type Retryer struct {
	config *RetryConfig
}

// NewRetryer creates a new retryer with the given configuration
func NewRetryer(config *RetryConfig) *Retryer {
	if config == nil {
		config = DefaultRetryConfig()
	}
	return &Retryer{config: config}
}

// RetryResult contains information about retry execution
type RetryResult struct {
	Attempts   int
	TotalTime  time.Duration
	LastError  error
	Successful bool
}

// Execute executes an operation with retry logic
func (r *Retryer) Execute(ctx context.Context, operation string, fn func(ctx context.Context) error) *RetryResult {
	result := &RetryResult{}
	startTime := time.Now()

	var lastErr error
	delay := r.config.InitialDelay

	for attempt := 1; attempt <= r.config.MaxAttempts; attempt++ {
		result.Attempts = attempt

		// Check context before attempt
		if ctx.Err() != nil {
			result.LastError = CheckContextError(ctx, operation)
			result.TotalTime = time.Since(startTime)
			return result
		}

		// Execute the operation
		err := fn(ctx)
		if err == nil {
			result.Successful = true
			result.TotalTime = time.Since(startTime)
			return result
		}

		lastErr = err
		result.LastError = err

		// Check if we should retry
		if !r.shouldRetry(err) {
			result.TotalTime = time.Since(startTime)
			return result
		}

		// Check if we have more attempts
		if attempt >= r.config.MaxAttempts {
			break
		}

		// Calculate delay with jitter
		actualDelay := r.calculateDelay(delay)

		// Call OnRetry callback if configured
		if r.config.OnRetry != nil {
			r.config.OnRetry(attempt, err, actualDelay)
		}

		// Wait before retry
		select {
		case <-ctx.Done():
			result.LastError = CheckContextError(ctx, operation)
			result.TotalTime = time.Since(startTime)
			return result
		case <-time.After(actualDelay):
		}

		// Calculate next delay
		delay = r.nextDelay(delay)
	}

	// Wrap the last error with retry info
	if appErr := GetAppError(lastErr); appErr != nil {
		appErr.WithDetails(map[string]interface{}{
			"retry_attempts": result.Attempts,
			"total_time":     time.Since(startTime).String(),
		})
	}

	result.TotalTime = time.Since(startTime)
	return result
}

// shouldRetry determines if an error should trigger a retry
func (r *Retryer) shouldRetry(err error) bool {
	if err == nil {
		return false
	}

	// Check specific retryable error codes if configured
	if len(r.config.RetryableErrors) > 0 {
		code := GetCode(err)
		for _, retryableCode := range r.config.RetryableErrors {
			if code == retryableCode {
				return true
			}
		}
		return false
	}

	// Use default IsRetryable check
	return IsRetryable(err)
}

// calculateDelay calculates the actual delay with jitter
func (r *Retryer) calculateDelay(baseDelay time.Duration) time.Duration {
	if r.config.Jitter <= 0 {
		return baseDelay
	}

	// Add jitter: delay * (1 ± jitter)
	jitterRange := float64(baseDelay) * r.config.Jitter
	jitter := (rand.Float64()*2 - 1) * jitterRange
	return time.Duration(float64(baseDelay) + jitter)
}

// nextDelay calculates the next delay using exponential backoff
func (r *Retryer) nextDelay(currentDelay time.Duration) time.Duration {
	nextDelay := time.Duration(float64(currentDelay) * r.config.Multiplier)
	if nextDelay > r.config.MaxDelay {
		return r.config.MaxDelay
	}
	return nextDelay
}

// ExecuteWithResult executes an operation that returns a value with retry logic
// This is a generic function (not a method) due to Go's type parameter limitations
func ExecuteWithResult[T any](
	retryer *Retryer,
	ctx context.Context,
	operation string,
	fn func(ctx context.Context) (T, error),
) (T, *RetryResult) {
	var result T
	retryResult := &RetryResult{}
	startTime := time.Now()

	var lastErr error
	delay := retryer.config.InitialDelay

	for attempt := 1; attempt <= retryer.config.MaxAttempts; attempt++ {
		retryResult.Attempts = attempt

		if ctx.Err() != nil {
			retryResult.LastError = CheckContextError(ctx, operation)
			retryResult.TotalTime = time.Since(startTime)
			return result, retryResult
		}

		var err error
		result, err = fn(ctx)
		if err == nil {
			retryResult.Successful = true
			retryResult.TotalTime = time.Since(startTime)
			return result, retryResult
		}

		lastErr = err
		retryResult.LastError = err

		if !retryer.shouldRetry(err) {
			retryResult.TotalTime = time.Since(startTime)
			return result, retryResult
		}

		if attempt >= retryer.config.MaxAttempts {
			break
		}

		actualDelay := retryer.calculateDelay(delay)

		if retryer.config.OnRetry != nil {
			retryer.config.OnRetry(attempt, err, actualDelay)
		}

		select {
		case <-ctx.Done():
			retryResult.LastError = CheckContextError(ctx, operation)
			retryResult.TotalTime = time.Since(startTime)
			return result, retryResult
		case <-time.After(actualDelay):
		}

		delay = retryer.nextDelay(delay)
	}

	// Wrap the last error with retry info
	if appErr := GetAppError(lastErr); appErr != nil {
		appErr.WithDetails(map[string]interface{}{
			"retry_attempts": retryResult.Attempts,
			"total_time":     time.Since(startTime).String(),
		})
	}

	retryResult.TotalTime = time.Since(startTime)
	return result, retryResult
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// Retry executes an operation with default retry configuration
func Retry(ctx context.Context, operation string, fn func(ctx context.Context) error) error {
	result := NewRetryer(DefaultRetryConfig()).Execute(ctx, operation, fn)
	return result.LastError
}

// RetryWithConfig executes an operation with custom retry configuration
func RetryWithConfig(ctx context.Context, config *RetryConfig, operation string, fn func(ctx context.Context) error) error {
	result := NewRetryer(config).Execute(ctx, operation, fn)
	return result.LastError
}

// RetryDatabase executes a database operation with retry
func RetryDatabase(ctx context.Context, operation string, fn func(ctx context.Context) error) error {
	result := NewRetryer(DatabaseRetryConfig()).Execute(ctx, operation, fn)
	return result.LastError
}

// RetryExternalAPI executes an external API call with retry
func RetryExternalAPI(ctx context.Context, service string, fn func(ctx context.Context) error) error {
	result := NewRetryer(ExternalAPIRetryConfig()).Execute(ctx, "external_api_"+service, fn)
	return result.LastError
}

// RetryWithResultString executes an operation that returns a string with default retry
func RetryWithResultString(ctx context.Context, operation string, fn func(ctx context.Context) (string, error)) (string, error) {
	result, retryResult := ExecuteWithResult(NewRetryer(DefaultRetryConfig()), ctx, operation, fn)
	return result, retryResult.LastError
}

// RetryWithResultBytes executes an operation that returns bytes with default retry
func RetryWithResultBytes(ctx context.Context, operation string, fn func(ctx context.Context) ([]byte, error)) ([]byte, error) {
	result, retryResult := ExecuteWithResult(NewRetryer(DefaultRetryConfig()), ctx, operation, fn)
	return result, retryResult.LastError
}

// RetryWithResultInt executes an operation that returns int with default retry
func RetryWithResultInt(ctx context.Context, operation string, fn func(ctx context.Context) (int, error)) (int, error) {
	result, retryResult := ExecuteWithResult(NewRetryer(DefaultRetryConfig()), ctx, operation, fn)
	return result, retryResult.LastError
}

// ============================================================================
// BACKOFF CALCULATOR
// ============================================================================

// Backoff calculates backoff delays
type Backoff struct {
	Initial    time.Duration
	Max        time.Duration
	Multiplier float64
	Jitter     float64
}

// NewBackoff creates a new backoff calculator
func NewBackoff(initial, max time.Duration, multiplier, jitter float64) *Backoff {
	return &Backoff{
		Initial:    initial,
		Max:        max,
		Multiplier: multiplier,
		Jitter:     jitter,
	}
}

// DefaultBackoff returns a default backoff calculator
func DefaultBackoff() *Backoff {
	return NewBackoff(100*time.Millisecond, 10*time.Second, 2.0, 0.1)
}

// Duration returns the backoff duration for the given attempt (0-indexed)
func (b *Backoff) Duration(attempt int) time.Duration {
	if attempt < 0 {
		attempt = 0
	}

	delay := float64(b.Initial) * math.Pow(b.Multiplier, float64(attempt))
	if delay > float64(b.Max) {
		delay = float64(b.Max)
	}

	// Add jitter
	if b.Jitter > 0 {
		jitterRange := delay * b.Jitter
		jitter := (rand.Float64()*2 - 1) * jitterRange
		delay += jitter
	}

	return time.Duration(delay)
}

// Durations returns all backoff durations for the given number of attempts
func (b *Backoff) Durations(attempts int) []time.Duration {
	durations := make([]time.Duration, attempts)
	for i := 0; i < attempts; i++ {
		durations[i] = b.Duration(i)
	}
	return durations
}

// ============================================================================
// RETRY POLICY
// ============================================================================

// RetryPolicy defines when to retry
type RetryPolicy interface {
	ShouldRetry(err error, attempt int) bool
}

// AlwaysRetryPolicy retries any error
type AlwaysRetryPolicy struct{}

func (p AlwaysRetryPolicy) ShouldRetry(err error, attempt int) bool {
	return err != nil
}

// NeverRetryPolicy never retries
type NeverRetryPolicy struct{}

func (p NeverRetryPolicy) ShouldRetry(err error, attempt int) bool {
	return false
}

// RetryableErrorPolicy retries only retryable errors
type RetryableErrorPolicy struct{}

func (p RetryableErrorPolicy) ShouldRetry(err error, attempt int) bool {
	return IsRetryable(err)
}

// ErrorCodePolicy retries specific error codes
type ErrorCodePolicy struct {
	Codes []ErrorCode
}

func (p ErrorCodePolicy) ShouldRetry(err error, attempt int) bool {
	code := GetCode(err)
	for _, c := range p.Codes {
		if code == c {
			return true
		}
	}
	return false
}

// CategoryPolicy retries specific error categories
type CategoryPolicy struct {
	Categories []ErrorCategory
}

func (p CategoryPolicy) ShouldRetry(err error, attempt int) bool {
	appErr := GetAppError(err)
	if appErr == nil {
		return false
	}
	for _, cat := range p.Categories {
		if appErr.Category == cat {
			return true
		}
	}
	return false
}

// CompositePolicy combines multiple policies (any must match)
type CompositePolicy struct {
	Policies []RetryPolicy
}

func (p CompositePolicy) ShouldRetry(err error, attempt int) bool {
	for _, policy := range p.Policies {
		if policy.ShouldRetry(err, attempt) {
			return true
		}
	}
	return false
}

// ============================================================================
// RETRY BUILDER
// ============================================================================

// RetryBuilder provides fluent API for building retry configuration
type RetryBuilder struct {
	config *RetryConfig
}

// NewRetryBuilder creates a new retry builder
func NewRetryBuilder() *RetryBuilder {
	return &RetryBuilder{
		config: DefaultRetryConfig(),
	}
}

// MaxAttempts sets the maximum number of attempts
func (rb *RetryBuilder) MaxAttempts(n int) *RetryBuilder {
	rb.config.MaxAttempts = n
	return rb
}

// InitialDelay sets the initial delay
func (rb *RetryBuilder) InitialDelay(d time.Duration) *RetryBuilder {
	rb.config.InitialDelay = d
	return rb
}

// MaxDelay sets the maximum delay
func (rb *RetryBuilder) MaxDelay(d time.Duration) *RetryBuilder {
	rb.config.MaxDelay = d
	return rb
}

// Multiplier sets the backoff multiplier
func (rb *RetryBuilder) Multiplier(m float64) *RetryBuilder {
	rb.config.Multiplier = m
	return rb
}

// Jitter sets the jitter factor
func (rb *RetryBuilder) Jitter(j float64) *RetryBuilder {
	rb.config.Jitter = j
	return rb
}

// RetryOn sets specific error codes to retry
func (rb *RetryBuilder) RetryOn(codes ...ErrorCode) *RetryBuilder {
	rb.config.RetryableErrors = codes
	return rb
}

// OnRetry sets the retry callback
func (rb *RetryBuilder) OnRetry(fn func(attempt int, err error, delay time.Duration)) *RetryBuilder {
	rb.config.OnRetry = fn
	return rb
}

// Build returns the retry configuration
func (rb *RetryBuilder) Build() *RetryConfig {
	return rb.config
}

// Execute executes an operation with the built configuration
func (rb *RetryBuilder) Execute(ctx context.Context, operation string, fn func(ctx context.Context) error) error {
	return RetryWithConfig(ctx, rb.config, operation, fn)
}
