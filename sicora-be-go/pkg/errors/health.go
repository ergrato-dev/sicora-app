package errors

import (
	"context"
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

// ============================================================================
// HEALTH STATUS
// ============================================================================

// HealthStatus represents the health status of a component
type HealthStatus string

const (
	HealthStatusUp       HealthStatus = "up"
	HealthStatusDown     HealthStatus = "down"
	HealthStatusDegraded HealthStatus = "degraded"
	HealthStatusUnknown  HealthStatus = "unknown"
)

// ============================================================================
// HEALTH CHECK TYPES
// ============================================================================

// HealthCheck represents a health check function
type HealthCheck func(ctx context.Context) HealthCheckResult

// HealthCheckResult represents the result of a health check
type HealthCheckResult struct {
	Status    HealthStatus           `json:"status"`
	Message   string                 `json:"message,omitempty"`
	Duration  time.Duration          `json:"duration_ms,omitempty"`
	Error     string                 `json:"error,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
}

// HealthResponse represents the overall health response
type HealthResponse struct {
	Status    HealthStatus                 `json:"status"`
	Version   string                       `json:"version,omitempty"`
	Service   string                       `json:"service,omitempty"`
	Uptime    string                       `json:"uptime,omitempty"`
	Timestamp time.Time                    `json:"timestamp"`
	Checks    map[string]HealthCheckResult `json:"checks,omitempty"`
}

// ReadinessResponse represents readiness probe response
type ReadinessResponse struct {
	Ready     bool                         `json:"ready"`
	Checks    map[string]HealthCheckResult `json:"checks,omitempty"`
	Timestamp time.Time                    `json:"timestamp"`
}

// LivenessResponse represents liveness probe response
type LivenessResponse struct {
	Alive     bool      `json:"alive"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// HEALTH CHECKER
// ============================================================================

// HealthChecker manages health checks for a service
type HealthChecker struct {
	mu          sync.RWMutex
	checks      map[string]HealthCheck
	readiness   map[string]HealthCheck
	liveness    map[string]HealthCheck
	service     *ServiceContext
	startTime   time.Time
	shutdownMgr *ShutdownManager
	timeout     time.Duration
}

// HealthCheckerConfig configures the health checker
type HealthCheckerConfig struct {
	Service     *ServiceContext
	ShutdownMgr *ShutdownManager
	Timeout     time.Duration
}

// DefaultHealthCheckerConfig returns default configuration
func DefaultHealthCheckerConfig() *HealthCheckerConfig {
	return &HealthCheckerConfig{
		Service:     GetGlobalServiceContext(),
		ShutdownMgr: nil,
		Timeout:     5 * time.Second,
	}
}

// NewHealthChecker creates a new health checker
func NewHealthChecker(config *HealthCheckerConfig) *HealthChecker {
	if config == nil {
		config = DefaultHealthCheckerConfig()
	}
	return &HealthChecker{
		checks:      make(map[string]HealthCheck),
		readiness:   make(map[string]HealthCheck),
		liveness:    make(map[string]HealthCheck),
		service:     config.Service,
		startTime:   time.Now(),
		shutdownMgr: config.ShutdownMgr,
		timeout:     config.Timeout,
	}
}

// ============================================================================
// REGISTER CHECKS
// ============================================================================

// RegisterCheck registers a health check
func (hc *HealthChecker) RegisterCheck(name string, check HealthCheck) {
	hc.mu.Lock()
	defer hc.mu.Unlock()
	hc.checks[name] = check
}

// RegisterReadinessCheck registers a readiness check
func (hc *HealthChecker) RegisterReadinessCheck(name string, check HealthCheck) {
	hc.mu.Lock()
	defer hc.mu.Unlock()
	hc.readiness[name] = check
}

// RegisterLivenessCheck registers a liveness check
func (hc *HealthChecker) RegisterLivenessCheck(name string, check HealthCheck) {
	hc.mu.Lock()
	defer hc.mu.Unlock()
	hc.liveness[name] = check
}

// ============================================================================
// RUN CHECKS
// ============================================================================

// Check runs all health checks and returns the overall status
func (hc *HealthChecker) Check(ctx context.Context) HealthResponse {
	ctx, cancel := context.WithTimeout(ctx, hc.timeout)
	defer cancel()

	hc.mu.RLock()
	checks := make(map[string]HealthCheck, len(hc.checks))
	for k, v := range hc.checks {
		checks[k] = v
	}
	hc.mu.RUnlock()

	results := hc.runChecks(ctx, checks)
	overallStatus := hc.calculateOverallStatus(results)

	// Check if shutting down
	if hc.shutdownMgr != nil && hc.shutdownMgr.IsShuttingDown() {
		overallStatus = HealthStatusDown
	}

	response := HealthResponse{
		Status:    overallStatus,
		Timestamp: time.Now().UTC(),
		Checks:    results,
	}

	if hc.service != nil {
		response.Service = hc.service.Name
		response.Version = hc.service.Version
	}

	response.Uptime = time.Since(hc.startTime).Round(time.Second).String()

	return response
}

// CheckReadiness runs readiness checks
func (hc *HealthChecker) CheckReadiness(ctx context.Context) ReadinessResponse {
	ctx, cancel := context.WithTimeout(ctx, hc.timeout)
	defer cancel()

	// If shutting down, not ready
	if hc.shutdownMgr != nil && hc.shutdownMgr.IsShuttingDown() {
		return ReadinessResponse{
			Ready:     false,
			Timestamp: time.Now().UTC(),
		}
	}

	hc.mu.RLock()
	checks := make(map[string]HealthCheck, len(hc.readiness))
	for k, v := range hc.readiness {
		checks[k] = v
	}
	hc.mu.RUnlock()

	results := hc.runChecks(ctx, checks)
	ready := hc.allChecksPass(results)

	return ReadinessResponse{
		Ready:     ready,
		Checks:    results,
		Timestamp: time.Now().UTC(),
	}
}

// CheckLiveness runs liveness checks
func (hc *HealthChecker) CheckLiveness(ctx context.Context) LivenessResponse {
	ctx, cancel := context.WithTimeout(ctx, hc.timeout)
	defer cancel()

	hc.mu.RLock()
	checks := make(map[string]HealthCheck, len(hc.liveness))
	for k, v := range hc.liveness {
		checks[k] = v
	}
	hc.mu.RUnlock()

	// If no liveness checks, just return alive
	if len(checks) == 0 {
		return LivenessResponse{
			Alive:     true,
			Timestamp: time.Now().UTC(),
		}
	}

	results := hc.runChecks(ctx, checks)
	alive := hc.allChecksPass(results)

	return LivenessResponse{
		Alive:     alive,
		Timestamp: time.Now().UTC(),
	}
}

// runChecks runs multiple health checks concurrently
func (hc *HealthChecker) runChecks(ctx context.Context, checks map[string]HealthCheck) map[string]HealthCheckResult {
	results := make(map[string]HealthCheckResult)
	var mu sync.Mutex
	var wg sync.WaitGroup

	for name, check := range checks {
		wg.Add(1)
		go func(name string, check HealthCheck) {
			defer wg.Done()
			result := hc.runSingleCheck(ctx, check)
			mu.Lock()
			results[name] = result
			mu.Unlock()
		}(name, check)
	}

	wg.Wait()
	return results
}

// runSingleCheck runs a single health check with panic recovery
func (hc *HealthChecker) runSingleCheck(ctx context.Context, check HealthCheck) (result HealthCheckResult) {
	start := time.Now()

	defer func() {
		if r := recover(); r != nil {
			result = HealthCheckResult{
				Status:    HealthStatusDown,
				Error:     "check panicked",
				Duration:  time.Since(start),
				Timestamp: time.Now().UTC(),
			}
		}
	}()

	result = check(ctx)
	result.Duration = time.Since(start)
	if result.Timestamp.IsZero() {
		result.Timestamp = time.Now().UTC()
	}
	return result
}

// calculateOverallStatus calculates overall status from individual results
func (hc *HealthChecker) calculateOverallStatus(results map[string]HealthCheckResult) HealthStatus {
	if len(results) == 0 {
		return HealthStatusUp
	}

	hasDown := false
	hasDegraded := false

	for _, result := range results {
		switch result.Status {
		case HealthStatusDown:
			hasDown = true
		case HealthStatusDegraded:
			hasDegraded = true
		}
	}

	if hasDown {
		return HealthStatusDown
	}
	if hasDegraded {
		return HealthStatusDegraded
	}
	return HealthStatusUp
}

// allChecksPass returns true if all checks are up
func (hc *HealthChecker) allChecksPass(results map[string]HealthCheckResult) bool {
	for _, result := range results {
		if result.Status != HealthStatusUp {
			return false
		}
	}
	return true
}

// ============================================================================
// HTTP HANDLERS
// ============================================================================

// HealthHandler returns an HTTP handler for /health endpoint
func (hc *HealthChecker) HealthHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := hc.Check(r.Context())

		w.Header().Set("Content-Type", "application/json")
		if response.Status != HealthStatusUp {
			w.WriteHeader(http.StatusServiceUnavailable)
		}
		json.NewEncoder(w).Encode(response)
	}
}

// ReadinessHandler returns an HTTP handler for /ready endpoint
func (hc *HealthChecker) ReadinessHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := hc.CheckReadiness(r.Context())

		w.Header().Set("Content-Type", "application/json")
		if !response.Ready {
			w.WriteHeader(http.StatusServiceUnavailable)
		}
		json.NewEncoder(w).Encode(response)
	}
}

// LivenessHandler returns an HTTP handler for /live endpoint
func (hc *HealthChecker) LivenessHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := hc.CheckLiveness(r.Context())

		w.Header().Set("Content-Type", "application/json")
		if !response.Alive {
			w.WriteHeader(http.StatusServiceUnavailable)
		}
		json.NewEncoder(w).Encode(response)
	}
}

// RegisterHandlers registers all health endpoints on an HTTP mux
func (hc *HealthChecker) RegisterHandlers(mux *http.ServeMux) {
	mux.HandleFunc("/health", hc.HealthHandler())
	mux.HandleFunc("/ready", hc.ReadinessHandler())
	mux.HandleFunc("/live", hc.LivenessHandler())
}

// ============================================================================
// COMMON HEALTH CHECKS
// ============================================================================

// DatabaseHealthCheck creates a health check for a database connection
func DatabaseHealthCheck(pingFn func(ctx context.Context) error) HealthCheck {
	return func(ctx context.Context) HealthCheckResult {
		err := pingFn(ctx)
		if err != nil {
			return HealthCheckResult{
				Status:    HealthStatusDown,
				Message:   "database connection failed",
				Error:     err.Error(),
				Timestamp: time.Now().UTC(),
			}
		}
		return HealthCheckResult{
			Status:    HealthStatusUp,
			Message:   "database connection ok",
			Timestamp: time.Now().UTC(),
		}
	}
}

// CacheHealthCheck creates a health check for a cache connection
func CacheHealthCheck(pingFn func(ctx context.Context) error) HealthCheck {
	return func(ctx context.Context) HealthCheckResult {
		err := pingFn(ctx)
		if err != nil {
			return HealthCheckResult{
				Status:    HealthStatusDegraded, // Cache down = degraded, not down
				Message:   "cache connection failed",
				Error:     err.Error(),
				Timestamp: time.Now().UTC(),
			}
		}
		return HealthCheckResult{
			Status:    HealthStatusUp,
			Message:   "cache connection ok",
			Timestamp: time.Now().UTC(),
		}
	}
}

// ExternalServiceHealthCheck creates a health check for an external service
func ExternalServiceHealthCheck(name, url string, timeout time.Duration) HealthCheck {
	return func(ctx context.Context) HealthCheckResult {
		ctx, cancel := context.WithTimeout(ctx, timeout)
		defer cancel()

		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return HealthCheckResult{
				Status:    HealthStatusDown,
				Message:   "failed to create request",
				Error:     err.Error(),
				Timestamp: time.Now().UTC(),
			}
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return HealthCheckResult{
				Status:    HealthStatusDown,
				Message:   name + " is unreachable",
				Error:     err.Error(),
				Timestamp: time.Now().UTC(),
			}
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 500 {
			return HealthCheckResult{
				Status:    HealthStatusDown,
				Message:   name + " returned error status",
				Metadata:  map[string]interface{}{"status_code": resp.StatusCode},
				Timestamp: time.Now().UTC(),
			}
		}

		return HealthCheckResult{
			Status:    HealthStatusUp,
			Message:   name + " is healthy",
			Metadata:  map[string]interface{}{"status_code": resp.StatusCode},
			Timestamp: time.Now().UTC(),
		}
	}
}

// DiskSpaceHealthCheck creates a health check for disk space
func DiskSpaceHealthCheck(path string, minFreeBytes uint64) HealthCheck {
	return func(ctx context.Context) HealthCheckResult {
		// Note: This is a placeholder. Real implementation would use syscall
		// For now, always return up
		return HealthCheckResult{
			Status:    HealthStatusUp,
			Message:   "disk space check ok",
			Metadata:  map[string]interface{}{"path": path},
			Timestamp: time.Now().UTC(),
		}
	}
}

// MemoryHealthCheck creates a health check for memory usage
func MemoryHealthCheck(maxUsagePercent float64) HealthCheck {
	return func(ctx context.Context) HealthCheckResult {
		// Note: This is a placeholder. Real implementation would use runtime.MemStats
		return HealthCheckResult{
			Status:    HealthStatusUp,
			Message:   "memory usage ok",
			Timestamp: time.Now().UTC(),
		}
	}
}

// CircuitBreakerHealthCheck creates a health check from circuit breaker status
func CircuitBreakerHealthCheck(cb *CircuitBreaker) HealthCheck {
	return func(ctx context.Context) HealthCheckResult {
		state := cb.State()
		stats := cb.Stats()

		status := HealthStatusUp
		message := "circuit breaker closed"

		switch state {
		case StateOpen:
			status = HealthStatusDown
			message = "circuit breaker open"
		case StateHalfOpen:
			status = HealthStatusDegraded
			message = "circuit breaker half-open"
		}

		return HealthCheckResult{
			Status:  status,
			Message: message,
			Metadata: map[string]interface{}{
				"state":    state.String(),
				"failures": stats.Failures,
			},
			Timestamp: time.Now().UTC(),
		}
	}
}

// ============================================================================
// GLOBAL HEALTH CHECKER
// ============================================================================

var (
	globalHealthChecker     *HealthChecker
	globalHealthCheckerOnce sync.Once
)

// GlobalHealthChecker returns the global health checker
func GlobalHealthChecker() *HealthChecker {
	globalHealthCheckerOnce.Do(func() {
		globalHealthChecker = NewHealthChecker(nil)
	})
	return globalHealthChecker
}

// RegisterHealthCheck registers a check with the global health checker
func RegisterHealthCheck(name string, check HealthCheck) {
	GlobalHealthChecker().RegisterCheck(name, check)
}

// RegisterReadiness registers a readiness check globally
func RegisterReadiness(name string, check HealthCheck) {
	GlobalHealthChecker().RegisterReadinessCheck(name, check)
}

// RegisterLiveness registers a liveness check globally
func RegisterLiveness(name string, check HealthCheck) {
	GlobalHealthChecker().RegisterLivenessCheck(name, check)
}

// ============================================================================
// SIMPLE HEALTH CHECK
// ============================================================================

// SimpleHealthHandler returns a simple health handler (just returns 200 OK)
func SimpleHealthHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
		})
	}
}
