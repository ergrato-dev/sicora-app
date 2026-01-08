package errors

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

// ============================================================================
// SHUTDOWN CONFIGURATION
// ============================================================================

// ShutdownConfig configures graceful shutdown behavior
type ShutdownConfig struct {
	// Timeout is the maximum time to wait for shutdown
	Timeout time.Duration

	// Signals to listen for
	Signals []os.Signal

	// OnShutdownStart is called when shutdown begins
	OnShutdownStart func()

	// OnShutdownComplete is called when shutdown completes
	OnShutdownComplete func(err error)

	// ForceKillTimeout is the time after which to force kill if graceful fails
	ForceKillTimeout time.Duration
}

// DefaultShutdownConfig returns sensible defaults
func DefaultShutdownConfig() *ShutdownConfig {
	return &ShutdownConfig{
		Timeout:          30 * time.Second,
		Signals:          []os.Signal{syscall.SIGINT, syscall.SIGTERM},
		ForceKillTimeout: 5 * time.Second,
	}
}

// ============================================================================
// SHUTDOWN MANAGER
// ============================================================================

// ShutdownManager coordinates graceful shutdown of multiple components
type ShutdownManager struct {
	config     *ShutdownConfig
	ctx        context.Context
	cancel     context.CancelFunc
	components []ShutdownComponent
	mu         sync.RWMutex
	shutdown   bool
	wg         sync.WaitGroup
}

// ShutdownComponent represents a component that can be shutdown
type ShutdownComponent struct {
	Name     string
	Priority int // Lower priority shuts down first
	Shutdown func(ctx context.Context) error
}

// NewShutdownManager creates a new shutdown manager
func NewShutdownManager(config *ShutdownConfig) *ShutdownManager {
	if config == nil {
		config = DefaultShutdownConfig()
	}
	ctx, cancel := context.WithCancel(context.Background())
	return &ShutdownManager{
		config:     config,
		ctx:        ctx,
		cancel:     cancel,
		components: make([]ShutdownComponent, 0),
	}
}

// Register registers a component for shutdown
func (sm *ShutdownManager) Register(name string, priority int, shutdownFn func(ctx context.Context) error) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sm.components = append(sm.components, ShutdownComponent{
		Name:     name,
		Priority: priority,
		Shutdown: shutdownFn,
	})
}

// RegisterHTTPServer registers an HTTP server for shutdown
func (sm *ShutdownManager) RegisterHTTPServer(name string, server *http.Server) {
	sm.Register(name, 10, func(ctx context.Context) error {
		return server.Shutdown(ctx)
	})
}

// Context returns the shutdown context
func (sm *ShutdownManager) Context() context.Context {
	return sm.ctx
}

// IsShuttingDown returns true if shutdown has been initiated
func (sm *ShutdownManager) IsShuttingDown() bool {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	return sm.shutdown
}

// ============================================================================
// SHUTDOWN EXECUTION
// ============================================================================

// ListenAndShutdown starts listening for shutdown signals
func (sm *ShutdownManager) ListenAndShutdown() error {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, sm.config.Signals...)

	// Wait for signal
	sig := <-sigChan
	LogInfo(sm.ctx, "shutdown signal received", Str("signal", sig.String()))

	return sm.Shutdown()
}

// Shutdown initiates graceful shutdown
func (sm *ShutdownManager) Shutdown() error {
	sm.mu.Lock()
	if sm.shutdown {
		sm.mu.Unlock()
		return nil
	}
	sm.shutdown = true
	sm.mu.Unlock()

	// Call shutdown start callback
	if sm.config.OnShutdownStart != nil {
		sm.config.OnShutdownStart()
	}

	// Cancel main context
	sm.cancel()

	// Create shutdown context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), sm.config.Timeout)
	defer cancel()

	// Sort components by priority (lower first)
	sm.sortComponentsByPriority()

	// Shutdown all components
	var shutdownErr error
	for _, comp := range sm.components {
		LogInfo(ctx, "shutting down component", Str("component", comp.Name))

		if err := sm.shutdownComponent(ctx, comp); err != nil {
			LogError(ctx, "component shutdown failed", err, Str("component", comp.Name))
			if shutdownErr == nil {
				shutdownErr = err
			}
		} else {
			LogInfo(ctx, "component shutdown complete", Str("component", comp.Name))
		}
	}

	// Call shutdown complete callback
	if sm.config.OnShutdownComplete != nil {
		sm.config.OnShutdownComplete(shutdownErr)
	}

	return shutdownErr
}

// shutdownComponent shuts down a single component with panic recovery
func (sm *ShutdownManager) shutdownComponent(ctx context.Context, comp ShutdownComponent) (err error) {
	defer Recover(ctx, &err)
	return comp.Shutdown(ctx)
}

// sortComponentsByPriority sorts components by priority
func (sm *ShutdownManager) sortComponentsByPriority() {
	// Simple bubble sort for small slice
	for i := 0; i < len(sm.components)-1; i++ {
		for j := 0; j < len(sm.components)-i-1; j++ {
			if sm.components[j].Priority > sm.components[j+1].Priority {
				sm.components[j], sm.components[j+1] = sm.components[j+1], sm.components[j]
			}
		}
	}
}

// ============================================================================
// SHUTDOWN HOOKS
// ============================================================================

// ShutdownHook represents a cleanup function
type ShutdownHook func(ctx context.Context) error

// Hooks manages shutdown hooks
type Hooks struct {
	mu    sync.RWMutex
	hooks []namedHook
}

type namedHook struct {
	name string
	hook ShutdownHook
}

// NewHooks creates a new hooks manager
func NewHooks() *Hooks {
	return &Hooks{
		hooks: make([]namedHook, 0),
	}
}

// Add adds a shutdown hook
func (h *Hooks) Add(name string, hook ShutdownHook) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.hooks = append(h.hooks, namedHook{name: name, hook: hook})
}

// Run runs all hooks in reverse order (LIFO)
func (h *Hooks) Run(ctx context.Context) error {
	h.mu.RLock()
	hooks := make([]namedHook, len(h.hooks))
	copy(hooks, h.hooks)
	h.mu.RUnlock()

	var lastErr error
	// Run in reverse order
	for i := len(hooks) - 1; i >= 0; i-- {
		nh := hooks[i]
		LogInfo(ctx, "running shutdown hook", Str("hook", nh.name))
		if err := nh.hook(ctx); err != nil {
			LogError(ctx, "shutdown hook failed", err, Str("hook", nh.name))
			lastErr = err
		}
	}
	return lastErr
}

// ============================================================================
// GLOBAL SHUTDOWN MANAGER
// ============================================================================

var (
	globalShutdownManager     *ShutdownManager
	globalShutdownManagerOnce sync.Once
)

// GlobalShutdownManager returns the global shutdown manager
func GlobalShutdownManager() *ShutdownManager {
	globalShutdownManagerOnce.Do(func() {
		globalShutdownManager = NewShutdownManager(nil)
	})
	return globalShutdownManager
}

// RegisterForShutdown registers a component with the global shutdown manager
func RegisterForShutdown(name string, priority int, shutdownFn func(ctx context.Context) error) {
	GlobalShutdownManager().Register(name, priority, shutdownFn)
}

// ShutdownContext returns the global shutdown context
func ShutdownContext() context.Context {
	return GlobalShutdownManager().Context()
}

// ============================================================================
// SERVER RUNNER
// ============================================================================

// ServerRunner manages running and shutting down an HTTP server
type ServerRunner struct {
	server  *http.Server
	config  *ShutdownConfig
	errChan chan error
}

// NewServerRunner creates a new server runner
func NewServerRunner(server *http.Server, config *ShutdownConfig) *ServerRunner {
	if config == nil {
		config = DefaultShutdownConfig()
	}
	return &ServerRunner{
		server:  server,
		config:  config,
		errChan: make(chan error, 1),
	}
}

// Run starts the server and handles graceful shutdown
func (sr *ServerRunner) Run() error {
	// Start server in goroutine
	go func() {
		LogInfo(context.Background(), "starting HTTP server", Str("addr", sr.server.Addr))
		if err := sr.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			sr.errChan <- err
		}
	}()

	// Setup signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, sr.config.Signals...)

	// Wait for signal or server error
	select {
	case sig := <-sigChan:
		LogInfo(context.Background(), "shutdown signal received", Str("signal", sig.String()))
	case err := <-sr.errChan:
		return fmt.Errorf("server error: %w", err)
	}

	// Graceful shutdown
	return sr.Shutdown()
}

// Shutdown performs graceful shutdown of the server
func (sr *ServerRunner) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), sr.config.Timeout)
	defer cancel()

	LogInfo(ctx, "shutting down HTTP server")

	if sr.config.OnShutdownStart != nil {
		sr.config.OnShutdownStart()
	}

	err := sr.server.Shutdown(ctx)

	if sr.config.OnShutdownComplete != nil {
		sr.config.OnShutdownComplete(err)
	}

	if err != nil {
		LogError(ctx, "HTTP server shutdown error", err)
		return err
	}

	LogInfo(ctx, "HTTP server shutdown complete")
	return nil
}

// ============================================================================
// DRAINING
// ============================================================================

// Drainer manages request draining during shutdown
type Drainer struct {
	mu       sync.RWMutex
	draining bool
	active   int64
	done     chan struct{}
}

// NewDrainer creates a new drainer
func NewDrainer() *Drainer {
	return &Drainer{
		done: make(chan struct{}),
	}
}

// Start marks the start of a request
// Returns false if draining has started
func (d *Drainer) Start() bool {
	d.mu.Lock()
	defer d.mu.Unlock()
	if d.draining {
		return false
	}
	d.active++
	return true
}

// End marks the end of a request
func (d *Drainer) End() {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.active--
	if d.draining && d.active == 0 {
		close(d.done)
	}
}

// StartDraining starts the draining process
func (d *Drainer) StartDraining() {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.draining = true
	if d.active == 0 {
		close(d.done)
	}
}

// Wait waits for all active requests to complete
func (d *Drainer) Wait(ctx context.Context) error {
	select {
	case <-d.done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// ActiveCount returns the number of active requests
func (d *Drainer) ActiveCount() int64 {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.active
}

// IsDraining returns true if draining has started
func (d *Drainer) IsDraining() bool {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.draining
}

// DrainMiddleware creates an HTTP middleware that supports draining
func DrainMiddleware(drainer *Drainer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !drainer.Start() {
				// Server is draining, reject new requests
				w.Header().Set("Connection", "close")
				w.Header().Set("Retry-After", "30")
				http.Error(w, "Service is shutting down", http.StatusServiceUnavailable)
				return
			}
			defer drainer.End()
			next.ServeHTTP(w, r)
		})
	}
}

// ============================================================================
// HEALTH CHECK INTEGRATION
// ============================================================================

// ShutdownAwareHealthCheck wraps a health check to return unhealthy during shutdown
func ShutdownAwareHealthCheck(sm *ShutdownManager, check func() bool) func() bool {
	return func() bool {
		if sm.IsShuttingDown() {
			return false
		}
		return check()
	}
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// WaitForSignal blocks until a shutdown signal is received
func WaitForSignal(signals ...os.Signal) os.Signal {
	if len(signals) == 0 {
		signals = []os.Signal{syscall.SIGINT, syscall.SIGTERM}
	}
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, signals...)
	return <-sigChan
}

// RunWithGracefulShutdown runs an HTTP server with graceful shutdown
func RunWithGracefulShutdown(server *http.Server) error {
	return NewServerRunner(server, nil).Run()
}

// RunWithGracefulShutdownAndConfig runs an HTTP server with custom config
func RunWithGracefulShutdownAndConfig(server *http.Server, config *ShutdownConfig) error {
	return NewServerRunner(server, config).Run()
}
