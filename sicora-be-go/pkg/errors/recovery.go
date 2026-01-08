package errors

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"runtime/debug"
)

// ============================================================================
// PANIC RECOVERY
// ============================================================================

// RecoverFunc is a function that handles recovered panics
type RecoverFunc func(ctx context.Context, panicValue interface{}, stack string)

// DefaultRecoverFunc logs the panic and returns an error
var DefaultRecoverFunc RecoverFunc = func(ctx context.Context, panicValue interface{}, stack string) {
	LogError(ctx, "panic recovered", fmt.Errorf("panic: %v", panicValue),
		Str("stack", stack),
		Any("panic_value", panicValue),
	)
}

// ============================================================================
// PANIC ERROR TYPE
// ============================================================================

// PanicError represents a recovered panic as an error
type PanicError struct {
	*AppError
	PanicValue interface{}
	Stack      string
}

// NewPanicError creates a new panic error
func NewPanicError(panicValue interface{}, stack string) *PanicError {
	msg := fmt.Sprintf("panic: %v", panicValue)
	return &PanicError{
		AppError: newError(
			CodeSysInternal,
			DomainSystem,
			CategoryInternal,
			msg,
			"Ocurrió un error inesperado. El equipo técnico ha sido notificado",
			http.StatusInternalServerError,
			false,
		).WithDetail("panic_value", fmt.Sprintf("%v", panicValue)),
		PanicValue: panicValue,
		Stack:      stack,
	}
}

// ============================================================================
// RECOVER FUNCTIONS
// ============================================================================

// Recover recovers from a panic and converts it to an error
// Usage: defer errors.Recover(ctx, &err)
func Recover(ctx context.Context, errPtr *error) {
	if r := recover(); r != nil {
		stack := string(debug.Stack())
		*errPtr = NewPanicError(r, stack)
		DefaultRecoverFunc(ctx, r, stack)
	}
}

// RecoverWithHandler recovers from a panic with a custom handler
// Usage: defer errors.RecoverWithHandler(ctx, &err, handler)
func RecoverWithHandler(ctx context.Context, errPtr *error, handler RecoverFunc) {
	if r := recover(); r != nil {
		stack := string(debug.Stack())
		*errPtr = NewPanicError(r, stack)
		if handler != nil {
			handler(ctx, r, stack)
		}
	}
}

// RecoverFunc2 recovers and returns an error directly (for use without pointer)
// Usage: defer func() { err = errors.RecoverFunc2(ctx, recover()) }()
func RecoverFunc2(ctx context.Context, r interface{}) error {
	if r == nil {
		return nil
	}
	stack := string(debug.Stack())
	DefaultRecoverFunc(ctx, r, stack)
	return NewPanicError(r, stack)
}

// MustRecover recovers from panic silently (no logging)
// Useful for goroutines that should not crash the program
func MustRecover() {
	recover()
}

// MustRecoverWithLog recovers and logs
func MustRecoverWithLog(ctx context.Context) {
	if r := recover(); r != nil {
		stack := string(debug.Stack())
		DefaultRecoverFunc(ctx, r, stack)
	}
}

// ============================================================================
// SAFE EXECUTION
// ============================================================================

// SafeGo runs a function in a goroutine with panic recovery
func SafeGo(ctx context.Context, fn func()) {
	go func() {
		defer MustRecoverWithLog(ctx)
		fn()
	}()
}

// SafeGoWithError runs a function in a goroutine with panic recovery and error channel
func SafeGoWithError(ctx context.Context, fn func() error) <-chan error {
	errCh := make(chan error, 1)
	go func() {
		defer func() {
			if r := recover(); r != nil {
				stack := string(debug.Stack())
				DefaultRecoverFunc(ctx, r, stack)
				errCh <- NewPanicError(r, stack)
			}
		}()
		errCh <- fn()
	}()
	return errCh
}

// Safe executes a function with panic recovery, returning an error if panic occurs
func Safe(ctx context.Context, fn func() error) (err error) {
	defer Recover(ctx, &err)
	return fn()
}

// SafeWithResult executes a function with panic recovery, returning result and error
func SafeWithResult[T any](ctx context.Context, fn func() (T, error)) (result T, err error) {
	defer Recover(ctx, &err)
	return fn()
}

// ============================================================================
// HTTP MIDDLEWARE
// ============================================================================

// RecoveryMiddleware is an HTTP middleware that recovers from panics
func RecoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				ctx := r.Context()
				stack := string(debug.Stack())

				// Log the panic
				DefaultRecoverFunc(ctx, rec, stack)

				// Create error response
				panicErr := NewPanicError(rec, stack)

				// Write error response
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)

				response := panicErr.ToResponse()
				responseJSON, _ := jsonMarshal(response)
				w.Write(responseJSON)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// RecoveryMiddlewareWithHandler is an HTTP middleware with custom panic handler
func RecoveryMiddlewareWithHandler(handler RecoverFunc) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if rec := recover(); rec != nil {
					ctx := r.Context()
					stack := string(debug.Stack())

					// Call custom handler
					if handler != nil {
						handler(ctx, rec, stack)
					}

					// Create error response
					panicErr := NewPanicError(rec, stack)

					// Write error response
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)

					response := panicErr.ToResponse()
					responseJSON, _ := jsonMarshal(response)
					w.Write(responseJSON)
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// ============================================================================
// STACK TRACE UTILITIES
// ============================================================================

// GetStack returns the current stack trace
func GetStack() string {
	return string(debug.Stack())
}

// GetStackFrames returns the current stack as frames
func GetStackFrames() []StackFrame {
	return CaptureStackFrames(2)
}

// FormatPanicStack formats a panic stack trace for logging
func FormatPanicStack(stack string) string {
	// The stack is already formatted by debug.Stack()
	return stack
}

// GetGoroutineID returns the current goroutine ID (for debugging only)
func GetGoroutineID() uint64 {
	b := make([]byte, 64)
	b = b[:runtime.Stack(b, false)]
	var id uint64
	fmt.Sscanf(string(b), "goroutine %d ", &id)
	return id
}

// ============================================================================
// PANIC DETECTION
// ============================================================================

// IsPanicError checks if an error is a PanicError
func IsPanicError(err error) bool {
	_, ok := err.(*PanicError)
	return ok
}

// GetPanicError extracts a PanicError from an error
func GetPanicError(err error) *PanicError {
	if pe, ok := err.(*PanicError); ok {
		return pe
	}
	return nil
}

// ============================================================================
// WORKER POOL WITH RECOVERY
// ============================================================================

// WorkerConfig configures a worker pool
type WorkerConfig struct {
	Workers   int
	QueueSize int
	OnPanic   RecoverFunc
}

// DefaultWorkerConfig returns default worker configuration
func DefaultWorkerConfig() *WorkerConfig {
	return &WorkerConfig{
		Workers:   runtime.NumCPU(),
		QueueSize: 100,
		OnPanic:   DefaultRecoverFunc,
	}
}

// WorkerPool manages a pool of workers with panic recovery
type WorkerPool struct {
	ctx    context.Context
	cancel context.CancelFunc
	jobs   chan func()
	config *WorkerConfig
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(ctx context.Context, config *WorkerConfig) *WorkerPool {
	if config == nil {
		config = DefaultWorkerConfig()
	}

	ctx, cancel := context.WithCancel(ctx)
	pool := &WorkerPool{
		ctx:    ctx,
		cancel: cancel,
		jobs:   make(chan func(), config.QueueSize),
		config: config,
	}

	// Start workers
	for i := 0; i < config.Workers; i++ {
		go pool.worker(i)
	}

	return pool
}

// worker runs jobs with panic recovery
func (p *WorkerPool) worker(id int) {
	for {
		select {
		case <-p.ctx.Done():
			return
		case job, ok := <-p.jobs:
			if !ok {
				return
			}
			p.safeExecute(job)
		}
	}
}

// safeExecute runs a job with panic recovery
func (p *WorkerPool) safeExecute(job func()) {
	defer func() {
		if r := recover(); r != nil {
			stack := string(debug.Stack())
			if p.config.OnPanic != nil {
				p.config.OnPanic(p.ctx, r, stack)
			}
		}
	}()
	job()
}

// Submit submits a job to the worker pool
func (p *WorkerPool) Submit(job func()) bool {
	select {
	case p.jobs <- job:
		return true
	default:
		return false // Queue full
	}
}

// SubmitWait submits a job and waits for completion
func (p *WorkerPool) SubmitWait(job func() error) error {
	done := make(chan error, 1)
	submitted := p.Submit(func() {
		var err error
		defer func() {
			if r := recover(); r != nil {
				stack := string(debug.Stack())
				err = NewPanicError(r, stack)
			}
			done <- err
		}()
		err = job()
	})

	if !submitted {
		return NewServiceUnavailableError("worker_pool")
	}

	select {
	case err := <-done:
		return err
	case <-p.ctx.Done():
		return CheckContextError(p.ctx, "worker_job")
	}
}

// Stop stops the worker pool
func (p *WorkerPool) Stop() {
	p.cancel()
	close(p.jobs)
}

// jsonMarshal wraps json.Marshal for internal use
func jsonMarshal(v interface{}) ([]byte, error) {
	return json.Marshal(v)
}
