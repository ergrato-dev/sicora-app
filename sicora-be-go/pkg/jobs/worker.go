package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"sync/atomic"
	"syscall"
	"time"
)

// JobHandler is a function that processes a job.
type JobHandler func(ctx context.Context, job *Job) (*JobResult, error)

// WorkerConfig contains configuration for the worker.
type WorkerConfig struct {
	// Concurrency is the number of jobs to process concurrently.
	Concurrency int

	// PollInterval is how often to check for new jobs when idle.
	PollInterval time.Duration

	// ShutdownTimeout is how long to wait for jobs to complete on shutdown.
	ShutdownTimeout time.Duration

	// Logger is the logger to use.
	Logger Logger
}

// Logger interface for worker logging.
type Logger interface {
	Info(msg string, keysAndValues ...interface{})
	Error(msg string, keysAndValues ...interface{})
	Debug(msg string, keysAndValues ...interface{})
}

// defaultLogger is a simple logger that writes to stdout.
type defaultLogger struct{}

func (l *defaultLogger) Info(msg string, keysAndValues ...interface{}) {
	log.Printf("[INFO] %s %v", msg, keysAndValues)
}

func (l *defaultLogger) Error(msg string, keysAndValues ...interface{}) {
	log.Printf("[ERROR] %s %v", msg, keysAndValues)
}

func (l *defaultLogger) Debug(msg string, keysAndValues ...interface{}) {
	log.Printf("[DEBUG] %s %v", msg, keysAndValues)
}

// DefaultWorkerConfig returns a WorkerConfig with sensible defaults.
func DefaultWorkerConfig() *WorkerConfig {
	return &WorkerConfig{
		Concurrency:     3,
		PollInterval:    time.Second,
		ShutdownTimeout: 30 * time.Second,
		Logger:          &defaultLogger{},
	}
}

// Worker processes jobs from the queue.
type Worker struct {
	queue    *Queue
	cfg      *WorkerConfig
	handlers map[JobType]JobHandler
	running  atomic.Bool
	wg       sync.WaitGroup
	stopCh   chan struct{}
	mu       sync.RWMutex

	// Stats
	processedCount atomic.Uint64
	errorCount     atomic.Uint64
	startTime      time.Time
}

// NewWorker creates a new worker.
func NewWorker(queue *Queue, cfg *WorkerConfig) *Worker {
	if cfg == nil {
		cfg = DefaultWorkerConfig()
	}

	return &Worker{
		queue:    queue,
		cfg:      cfg,
		handlers: make(map[JobType]JobHandler),
		stopCh:   make(chan struct{}),
	}
}

// RegisterHandler registers a handler for a specific job type.
func (w *Worker) RegisterHandler(jobType JobType, handler JobHandler) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.handlers[jobType] = handler
}

// Start starts the worker and begins processing jobs.
func (w *Worker) Start(ctx context.Context) error {
	if w.running.Load() {
		return fmt.Errorf("worker is already running")
	}

	w.running.Store(true)
	w.startTime = time.Now()
	w.stopCh = make(chan struct{})

	w.cfg.Logger.Info("Worker starting",
		"concurrency", w.cfg.Concurrency,
		"handlers", len(w.handlers),
	)

	// Start worker goroutines
	for i := 0; i < w.cfg.Concurrency; i++ {
		w.wg.Add(1)
		go w.processLoop(ctx, i)
	}

	return nil
}

// Stop gracefully stops the worker.
func (w *Worker) Stop() error {
	if !w.running.Load() {
		return nil
	}

	w.cfg.Logger.Info("Worker stopping...")
	w.running.Store(false)
	close(w.stopCh)

	// Wait for workers to finish with timeout
	done := make(chan struct{})
	go func() {
		w.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		w.cfg.Logger.Info("Worker stopped gracefully",
			"processed", w.processedCount.Load(),
			"errors", w.errorCount.Load(),
		)
	case <-time.After(w.cfg.ShutdownTimeout):
		w.cfg.Logger.Error("Worker shutdown timeout exceeded")
	}

	return nil
}

// Run starts the worker and blocks until interrupted.
func (w *Worker) Run(ctx context.Context) error {
	if err := w.Start(ctx); err != nil {
		return err
	}

	// Wait for interrupt signal
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigCh:
		w.cfg.Logger.Info("Received signal", "signal", sig)
	case <-ctx.Done():
		w.cfg.Logger.Info("Context cancelled")
	}

	return w.Stop()
}

// processLoop is the main processing loop for a worker goroutine.
func (w *Worker) processLoop(ctx context.Context, workerID int) {
	defer w.wg.Done()

	w.cfg.Logger.Debug("Worker goroutine started", "worker_id", workerID)

	for {
		select {
		case <-w.stopCh:
			w.cfg.Logger.Debug("Worker goroutine stopping", "worker_id", workerID)
			return
		case <-ctx.Done():
			return
		default:
			// Try to get a job
			job, err := w.queue.Dequeue(ctx, w.cfg.PollInterval)
			if err != nil {
				if err == ErrNoJobsAvailable || err == ErrQueueClosed {
					continue
				}
				w.cfg.Logger.Error("Failed to dequeue job",
					"worker_id", workerID,
					"error", err,
				)
				continue
			}

			// Process the job
			w.processJob(ctx, workerID, job)
		}
	}
}

// processJob processes a single job.
func (w *Worker) processJob(ctx context.Context, workerID int, job *Job) {
	w.mu.RLock()
	handler, ok := w.handlers[job.Type]
	w.mu.RUnlock()

	if !ok {
		w.cfg.Logger.Error("No handler for job type",
			"worker_id", workerID,
			"job_id", job.ID,
			"job_type", job.Type,
		)
		w.queue.Fail(ctx, job, fmt.Errorf("no handler for job type: %s", job.Type))
		w.errorCount.Add(1)
		return
	}

	w.cfg.Logger.Debug("Processing job",
		"worker_id", workerID,
		"job_id", job.ID,
		"job_type", job.Type,
		"attempt", job.Attempts,
	)

	// Create job context with timeout
	jobCtx, cancel := context.WithTimeout(ctx, w.queue.cfg.JobTimeout)
	defer cancel()

	// Execute handler
	startTime := time.Now()
	result, err := handler(jobCtx, job)
	duration := time.Since(startTime)

	if err != nil {
		w.cfg.Logger.Error("Job failed",
			"worker_id", workerID,
			"job_id", job.ID,
			"job_type", job.Type,
			"attempt", job.Attempts,
			"duration", duration,
			"error", err,
		)

		if failErr := w.queue.Fail(ctx, job, err); failErr != nil {
			w.cfg.Logger.Error("Failed to mark job as failed",
				"job_id", job.ID,
				"error", failErr,
			)
		}
		w.errorCount.Add(1)
		return
	}

	w.cfg.Logger.Info("Job completed",
		"worker_id", workerID,
		"job_id", job.ID,
		"job_type", job.Type,
		"duration", duration,
	)

	if completeErr := w.queue.Complete(ctx, job, result); completeErr != nil {
		w.cfg.Logger.Error("Failed to mark job as complete",
			"job_id", job.ID,
			"error", completeErr,
		)
	}
	w.processedCount.Add(1)
}

// Stats returns worker statistics.
func (w *Worker) Stats() WorkerStats {
	return WorkerStats{
		Running:   w.running.Load(),
		Uptime:    time.Since(w.startTime),
		Processed: w.processedCount.Load(),
		Errors:    w.errorCount.Load(),
	}
}

// WorkerStats contains worker statistics.
type WorkerStats struct {
	Running   bool          `json:"running"`
	Uptime    time.Duration `json:"uptime"`
	Processed uint64        `json:"processed"`
	Errors    uint64        `json:"errors"`
}

// ========================
// Default Job Handlers
// ========================

// NotificationHandler returns a handler for notification jobs.
// The actual sending logic should be provided via the sender function.
func NotificationHandler(sender func(ctx context.Context, payload *NotificationPayload) error) JobHandler {
	return func(ctx context.Context, job *Job) (*JobResult, error) {
		var payload NotificationPayload
		if err := json.Unmarshal(job.Payload, &payload); err != nil {
			return nil, fmt.Errorf("invalid notification payload: %w", err)
		}

		if err := sender(ctx, &payload); err != nil {
			return nil, err
		}

		return &JobResult{
			Success:        true,
			Message:        fmt.Sprintf("Notification sent to %d recipients", len(payload.Recipients)),
			ProcessedCount: len(payload.Recipients),
		}, nil
	}
}

// ImportHandler returns a handler for import jobs.
// The actual import logic should be provided via the importer function.
func ImportHandler(importer func(ctx context.Context, payload *ImportPayload) (*ImportResult, error)) JobHandler {
	return func(ctx context.Context, job *Job) (*JobResult, error) {
		var payload ImportPayload
		if err := json.Unmarshal(job.Payload, &payload); err != nil {
			return nil, fmt.Errorf("invalid import payload: %w", err)
		}

		result, err := importer(ctx, &payload)
		if err != nil {
			return nil, err
		}

		return &result.JobResult, nil
	}
}

// ReportHandler returns a handler for report jobs.
// The actual report generation logic should be provided via the generator function.
func ReportHandler(generator func(ctx context.Context, payload *ReportPayload) ([]byte, error)) JobHandler {
	return func(ctx context.Context, job *Job) (*JobResult, error) {
		var payload ReportPayload
		if err := json.Unmarshal(job.Payload, &payload); err != nil {
			return nil, fmt.Errorf("invalid report payload: %w", err)
		}

		data, err := generator(ctx, &payload)
		if err != nil {
			return nil, err
		}

		return &JobResult{
			Success: true,
			Message: fmt.Sprintf("Report generated: %d bytes", len(data)),
			Data:    map[string]interface{}{"size": len(data)},
		}, nil
	}
}
