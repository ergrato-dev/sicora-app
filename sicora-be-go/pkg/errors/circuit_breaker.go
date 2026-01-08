package errors

import (
	"context"
	"sync"
	"time"
)

// ============================================================================
// CIRCUIT BREAKER STATES
// ============================================================================

// CircuitState represents the state of the circuit breaker
type CircuitState int

const (
	// StateClosed allows requests to pass through
	StateClosed CircuitState = iota
	// StateOpen blocks all requests
	StateOpen
	// StateHalfOpen allows limited requests for testing recovery
	StateHalfOpen
)

// String returns the string representation of the state
func (s CircuitState) String() string {
	switch s {
	case StateClosed:
		return "closed"
	case StateOpen:
		return "open"
	case StateHalfOpen:
		return "half-open"
	default:
		return "unknown"
	}
}

// ============================================================================
// CIRCUIT BREAKER CONFIGURATION
// ============================================================================

// CircuitBreakerConfig configures circuit breaker behavior
type CircuitBreakerConfig struct {
	// Name identifies the circuit breaker
	Name string

	// FailureThreshold is the number of failures before opening
	FailureThreshold int

	// SuccessThreshold is the number of successes in half-open to close
	SuccessThreshold int

	// Timeout is how long to stay open before testing recovery
	Timeout time.Duration

	// MaxHalfOpenRequests limits concurrent requests in half-open state
	MaxHalfOpenRequests int

	// OnStateChange is called when state changes
	OnStateChange func(name string, from, to CircuitState)

	// IsFailure determines if an error should count as a failure
	// If nil, all non-nil errors are failures
	IsFailure func(err error) bool
}

// DefaultCircuitBreakerConfig returns sensible defaults
func DefaultCircuitBreakerConfig(name string) *CircuitBreakerConfig {
	return &CircuitBreakerConfig{
		Name:                name,
		FailureThreshold:    5,
		SuccessThreshold:    2,
		Timeout:             30 * time.Second,
		MaxHalfOpenRequests: 1,
	}
}

// DatabaseCircuitBreakerConfig returns config for database operations
func DatabaseCircuitBreakerConfig(name string) *CircuitBreakerConfig {
	return &CircuitBreakerConfig{
		Name:                name,
		FailureThreshold:    3,
		SuccessThreshold:    2,
		Timeout:             15 * time.Second,
		MaxHalfOpenRequests: 1,
		IsFailure: func(err error) bool {
			// Only count connection and timeout errors
			return IsDomain(err, DomainDB) && (IsTimeout(err) || IsUnavailable(err))
		},
	}
}

// ExternalAPICircuitBreakerConfig returns config for external APIs
func ExternalAPICircuitBreakerConfig(name string) *CircuitBreakerConfig {
	return &CircuitBreakerConfig{
		Name:                name,
		FailureThreshold:    5,
		SuccessThreshold:    3,
		Timeout:             60 * time.Second,
		MaxHalfOpenRequests: 2,
		IsFailure: func(err error) bool {
			// Count timeouts, unavailable, and rate limit errors
			return IsTimeout(err) || IsUnavailable(err) || IsRateLimited(err)
		},
	}
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

// CircuitBreaker implements the circuit breaker pattern
type CircuitBreaker struct {
	config *CircuitBreakerConfig

	mu              sync.RWMutex
	state           CircuitState
	failures        int
	successes       int
	lastFailureTime time.Time
	halfOpenCount   int
}

// NewCircuitBreaker creates a new circuit breaker
func NewCircuitBreaker(config *CircuitBreakerConfig) *CircuitBreaker {
	if config == nil {
		config = DefaultCircuitBreakerConfig("default")
	}
	return &CircuitBreaker{
		config: config,
		state:  StateClosed,
	}
}

// State returns the current state of the circuit breaker
func (cb *CircuitBreaker) State() CircuitState {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return cb.state
}

// Name returns the name of the circuit breaker
func (cb *CircuitBreaker) Name() string {
	return cb.config.Name
}

// Stats returns current circuit breaker statistics
func (cb *CircuitBreaker) Stats() CircuitBreakerStats {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return CircuitBreakerStats{
		Name:            cb.config.Name,
		State:           cb.state,
		Failures:        cb.failures,
		Successes:       cb.successes,
		LastFailureTime: cb.lastFailureTime,
	}
}

// CircuitBreakerStats contains circuit breaker statistics
type CircuitBreakerStats struct {
	Name            string
	State           CircuitState
	Failures        int
	Successes       int
	LastFailureTime time.Time
}

// Execute executes an operation through the circuit breaker
func (cb *CircuitBreaker) Execute(ctx context.Context, fn func(ctx context.Context) error) error {
	// Check if request is allowed
	if err := cb.beforeRequest(); err != nil {
		return err
	}

	// Execute the operation
	err := fn(ctx)

	// Record the result
	cb.afterRequest(err)

	return err
}

// ExecuteWithResult executes an operation that returns a value
func (cb *CircuitBreaker) ExecuteWithResult(ctx context.Context, fn func(ctx context.Context) (interface{}, error)) (interface{}, error) {
	if err := cb.beforeRequest(); err != nil {
		return nil, err
	}

	result, err := fn(ctx)
	cb.afterRequest(err)

	return result, err
}

// beforeRequest checks if the request should be allowed
func (cb *CircuitBreaker) beforeRequest() error {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	switch cb.state {
	case StateClosed:
		return nil

	case StateOpen:
		// Check if timeout has passed
		if time.Since(cb.lastFailureTime) > cb.config.Timeout {
			cb.transitionTo(StateHalfOpen)
			cb.halfOpenCount = 1
			return nil
		}
		return cb.circuitOpenError()

	case StateHalfOpen:
		// Limit concurrent requests in half-open
		if cb.halfOpenCount >= cb.config.MaxHalfOpenRequests {
			return cb.circuitOpenError()
		}
		cb.halfOpenCount++
		return nil
	}

	return nil
}

// afterRequest records the result of the request
func (cb *CircuitBreaker) afterRequest(err error) {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	isFailure := cb.isFailure(err)

	switch cb.state {
	case StateClosed:
		if isFailure {
			cb.failures++
			cb.lastFailureTime = time.Now()
			if cb.failures >= cb.config.FailureThreshold {
				cb.transitionTo(StateOpen)
			}
		} else {
			// Reset failures on success
			cb.failures = 0
		}

	case StateHalfOpen:
		cb.halfOpenCount--
		if isFailure {
			cb.failures++
			cb.lastFailureTime = time.Now()
			cb.transitionTo(StateOpen)
		} else {
			cb.successes++
			if cb.successes >= cb.config.SuccessThreshold {
				cb.transitionTo(StateClosed)
			}
		}
	}
}

// transitionTo changes the circuit breaker state
func (cb *CircuitBreaker) transitionTo(newState CircuitState) {
	if cb.state == newState {
		return
	}

	oldState := cb.state
	cb.state = newState

	// Reset counters on state change
	switch newState {
	case StateClosed:
		cb.failures = 0
		cb.successes = 0
	case StateOpen:
		cb.successes = 0
	case StateHalfOpen:
		cb.successes = 0
		cb.halfOpenCount = 0
	}

	// Call state change callback
	if cb.config.OnStateChange != nil {
		go cb.config.OnStateChange(cb.config.Name, oldState, newState)
	}
}

// isFailure determines if an error should count as a failure
func (cb *CircuitBreaker) isFailure(err error) bool {
	if err == nil {
		return false
	}
	if cb.config.IsFailure != nil {
		return cb.config.IsFailure(err)
	}
	return true
}

// circuitOpenError returns the error for an open circuit
func (cb *CircuitBreaker) circuitOpenError() *AppError {
	return newError(
		CodeSysUnavailable,
		DomainSystem,
		CategoryUnavailable,
		"circuit breaker is open for "+cb.config.Name,
		"El servicio no está disponible temporalmente. Intenta en unos minutos",
		503,
		true,
	).WithDetails(map[string]interface{}{
		"circuit_breaker": cb.config.Name,
		"state":           cb.state.String(),
		"failures":        cb.failures,
	}).WithRetryAfter(int(cb.config.Timeout.Seconds()))
}

// Reset manually resets the circuit breaker to closed state
func (cb *CircuitBreaker) Reset() {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	cb.transitionTo(StateClosed)
}

// ForceOpen manually opens the circuit breaker
func (cb *CircuitBreaker) ForceOpen() {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	cb.lastFailureTime = time.Now()
	cb.transitionTo(StateOpen)
}

// ============================================================================
// CIRCUIT BREAKER REGISTRY
// ============================================================================

// CircuitBreakerRegistry manages multiple circuit breakers
type CircuitBreakerRegistry struct {
	mu       sync.RWMutex
	breakers map[string]*CircuitBreaker
}

// NewCircuitBreakerRegistry creates a new registry
func NewCircuitBreakerRegistry() *CircuitBreakerRegistry {
	return &CircuitBreakerRegistry{
		breakers: make(map[string]*CircuitBreaker),
	}
}

// Get returns a circuit breaker by name, creating it if needed
func (r *CircuitBreakerRegistry) Get(name string) *CircuitBreaker {
	r.mu.RLock()
	cb, exists := r.breakers[name]
	r.mu.RUnlock()

	if exists {
		return cb
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	// Double-check after acquiring write lock
	if cb, exists = r.breakers[name]; exists {
		return cb
	}

	cb = NewCircuitBreaker(DefaultCircuitBreakerConfig(name))
	r.breakers[name] = cb
	return cb
}

// GetOrCreate returns a circuit breaker, creating with custom config if needed
func (r *CircuitBreakerRegistry) GetOrCreate(config *CircuitBreakerConfig) *CircuitBreaker {
	r.mu.RLock()
	cb, exists := r.breakers[config.Name]
	r.mu.RUnlock()

	if exists {
		return cb
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	if cb, exists = r.breakers[config.Name]; exists {
		return cb
	}

	cb = NewCircuitBreaker(config)
	r.breakers[config.Name] = cb
	return cb
}

// All returns all circuit breakers
func (r *CircuitBreakerRegistry) All() map[string]*CircuitBreaker {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := make(map[string]*CircuitBreaker, len(r.breakers))
	for k, v := range r.breakers {
		result[k] = v
	}
	return result
}

// Stats returns stats for all circuit breakers
func (r *CircuitBreakerRegistry) Stats() []CircuitBreakerStats {
	r.mu.RLock()
	defer r.mu.RUnlock()

	stats := make([]CircuitBreakerStats, 0, len(r.breakers))
	for _, cb := range r.breakers {
		stats = append(stats, cb.Stats())
	}
	return stats
}

// Reset resets all circuit breakers
func (r *CircuitBreakerRegistry) Reset() {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, cb := range r.breakers {
		cb.Reset()
	}
}

// ============================================================================
// GLOBAL REGISTRY
// ============================================================================

var (
	globalRegistry     *CircuitBreakerRegistry
	globalRegistryOnce sync.Once
)

// GlobalCircuitBreakerRegistry returns the global circuit breaker registry
func GlobalCircuitBreakerRegistry() *CircuitBreakerRegistry {
	globalRegistryOnce.Do(func() {
		globalRegistry = NewCircuitBreakerRegistry()
	})
	return globalRegistry
}

// GetCircuitBreaker returns a circuit breaker from the global registry
func GetCircuitBreaker(name string) *CircuitBreaker {
	return GlobalCircuitBreakerRegistry().Get(name)
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// WithCircuitBreaker wraps an operation with circuit breaker protection
func WithCircuitBreaker(ctx context.Context, name string, fn func(ctx context.Context) error) error {
	return GetCircuitBreaker(name).Execute(ctx, fn)
}

// WithCircuitBreakerResult wraps an operation that returns a value
func WithCircuitBreakerResult(ctx context.Context, name string, fn func(ctx context.Context) (interface{}, error)) (interface{}, error) {
	return GetCircuitBreaker(name).ExecuteWithResult(ctx, fn)
}

// ============================================================================
// COMBINED RETRY + CIRCUIT BREAKER
// ============================================================================

// ResilienceConfig combines retry and circuit breaker configuration
type ResilienceConfig struct {
	CircuitBreaker *CircuitBreakerConfig
	Retry          *RetryConfig
}

// DefaultResilienceConfig returns default resilience configuration
func DefaultResilienceConfig(name string) *ResilienceConfig {
	return &ResilienceConfig{
		CircuitBreaker: DefaultCircuitBreakerConfig(name),
		Retry:          DefaultRetryConfig(),
	}
}

// ResilientExecutor combines retry and circuit breaker
type ResilientExecutor struct {
	cb      *CircuitBreaker
	retryer *Retryer
}

// NewResilientExecutor creates a new resilient executor
func NewResilientExecutor(config *ResilienceConfig) *ResilientExecutor {
	return &ResilientExecutor{
		cb:      NewCircuitBreaker(config.CircuitBreaker),
		retryer: NewRetryer(config.Retry),
	}
}

// Execute executes an operation with both retry and circuit breaker
func (re *ResilientExecutor) Execute(ctx context.Context, operation string, fn func(ctx context.Context) error) error {
	return re.cb.Execute(ctx, func(ctx context.Context) error {
		result := re.retryer.Execute(ctx, operation, fn)
		return result.LastError
	})
}

// ExecuteWithFallback executes with fallback on failure
func (re *ResilientExecutor) ExecuteWithFallback(
	ctx context.Context,
	operation string,
	fn func(ctx context.Context) error,
	fallback func(ctx context.Context, err error) error,
) error {
	err := re.Execute(ctx, operation, fn)
	if err != nil {
		return fallback(ctx, err)
	}
	return nil
}

// ============================================================================
// CIRCUIT BREAKER HEALTH CHECK
// ============================================================================

// IsCircuitHealthy checks if a circuit breaker is healthy (closed)
func IsCircuitHealthy(name string) bool {
	cb := GetCircuitBreaker(name)
	return cb.State() == StateClosed
}

// GetCircuitHealth returns health status for all circuits
func GetCircuitHealth() map[string]bool {
	registry := GlobalCircuitBreakerRegistry()
	breakers := registry.All()
	health := make(map[string]bool, len(breakers))
	for name, cb := range breakers {
		health[name] = cb.State() == StateClosed
	}
	return health
}
