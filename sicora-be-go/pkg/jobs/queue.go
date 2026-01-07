// Package jobs provides a Redis-based job queue for background processing.
package jobs

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// Queue key constants
const (
	keyPending     = "jobs:pending"    // List of pending job IDs (sorted by priority)
	keyProcessing  = "jobs:processing" // Set of job IDs being processed
	keyCompleted   = "jobs:completed"  // List of completed job IDs
	keyFailed      = "jobs:failed"     // List of failed job IDs (dead letter queue)
	keyScheduled   = "jobs:scheduled"  // Sorted set of scheduled jobs (score = timestamp)
	keyJobData     = "jobs:data:"      // Hash prefix for job data
	keyJobStats    = "jobs:stats"      // Hash for job statistics
	keyWorkerLocks = "jobs:workers:"   // Prefix for worker locks
)

// Queue errors
var (
	ErrQueueClosed     = errors.New("queue is closed")
	ErrJobNotFound     = errors.New("job not found")
	ErrInvalidJob      = errors.New("invalid job")
	ErrJobExists       = errors.New("job already exists")
	ErrNoJobsAvailable = errors.New("no jobs available")
)

// QueueConfig contains configuration for the job queue.
type QueueConfig struct {
	// Redis connection
	RedisAddr     string
	RedisPassword string
	RedisDB       int

	// Queue behavior
	MaxRetries      int           // Maximum retry attempts (default: 3)
	RetryDelay      time.Duration // Delay between retries (default: 1 minute)
	JobTimeout      time.Duration // Timeout for job processing (default: 5 minutes)
	CleanupInterval time.Duration // Interval for cleanup tasks (default: 1 hour)
	StatsRetention  time.Duration // How long to keep completed job data (default: 24 hours)

	// Key prefix for namespacing
	KeyPrefix string
}

// DefaultQueueConfig returns a QueueConfig with sensible defaults.
func DefaultQueueConfig() *QueueConfig {
	return &QueueConfig{
		RedisAddr:       "localhost:6379",
		RedisPassword:   "",
		RedisDB:         0,
		MaxRetries:      3,
		RetryDelay:      time.Minute,
		JobTimeout:      5 * time.Minute,
		CleanupInterval: time.Hour,
		StatsRetention:  24 * time.Hour,
		KeyPrefix:       "sicora:",
	}
}

// Queue manages job enqueueing and retrieval.
type Queue struct {
	client *redis.Client
	cfg    *QueueConfig
	closed bool
	mu     sync.RWMutex
}

// NewQueue creates a new job queue with the given configuration.
func NewQueue(cfg *QueueConfig) (*Queue, error) {
	if cfg == nil {
		cfg = DefaultQueueConfig()
	}

	client := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &Queue{
		client: client,
		cfg:    cfg,
	}, nil
}

// NewQueueFromClient creates a Queue using an existing Redis client.
func NewQueueFromClient(client *redis.Client, cfg *QueueConfig) *Queue {
	if cfg == nil {
		cfg = DefaultQueueConfig()
	}
	return &Queue{
		client: client,
		cfg:    cfg,
	}
}

// key returns the full key with prefix.
func (q *Queue) key(k string) string {
	return q.cfg.KeyPrefix + k
}

// Close closes the queue and releases resources.
func (q *Queue) Close() error {
	q.mu.Lock()
	defer q.mu.Unlock()

	if q.closed {
		return nil
	}
	q.closed = true
	return q.client.Close()
}

// Enqueue adds a new job to the queue.
func (q *Queue) Enqueue(ctx context.Context, job *Job) error {
	q.mu.RLock()
	if q.closed {
		q.mu.RUnlock()
		return ErrQueueClosed
	}
	q.mu.RUnlock()

	if job == nil {
		return ErrInvalidJob
	}

	// Generate ID if not set
	if job.ID == "" {
		job.ID = uuid.New().String()
	}

	// Set defaults
	now := time.Now()
	job.Status = JobStatusPending
	job.CreatedAt = now
	job.UpdatedAt = now
	if job.MaxAttempts == 0 {
		job.MaxAttempts = q.cfg.MaxRetries
	}
	if job.Priority == 0 {
		job.Priority = PriorityNormal
	}

	// Serialize job
	jobData, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to serialize job: %w", err)
	}

	// Store job data and add to pending queue
	pipe := q.client.Pipeline()

	// Store job data
	pipe.Set(ctx, q.key(keyJobData+job.ID), jobData, q.cfg.StatsRetention)

	// Add to appropriate queue
	if job.ScheduledAt != nil && job.ScheduledAt.After(now) {
		// Scheduled job - add to sorted set with timestamp as score
		pipe.ZAdd(ctx, q.key(keyScheduled), redis.Z{
			Score:  float64(job.ScheduledAt.Unix()),
			Member: job.ID,
		})
	} else {
		// Immediate job - add to pending list with priority
		// Use LPUSH for high priority, RPUSH for normal/low
		if job.Priority >= PriorityHigh {
			pipe.LPush(ctx, q.key(keyPending), job.ID)
		} else {
			pipe.RPush(ctx, q.key(keyPending), job.ID)
		}
	}

	// Update stats
	pipe.HIncrBy(ctx, q.key(keyJobStats), "total_enqueued", 1)
	pipe.HIncrBy(ctx, q.key(keyJobStats), fmt.Sprintf("type:%s", job.Type), 1)

	_, err = pipe.Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to enqueue job: %w", err)
	}

	return nil
}

// EnqueueNotification is a convenience method to enqueue a notification job.
func (q *Queue) EnqueueNotification(ctx context.Context, payload *NotificationPayload, priority JobPriority) (string, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal payload: %w", err)
	}

	job := &Job{
		Type:     JobTypeNotification,
		Priority: priority,
		Payload:  payloadBytes,
	}

	if err := q.Enqueue(ctx, job); err != nil {
		return "", err
	}

	return job.ID, nil
}

// EnqueueImport is a convenience method to enqueue an import job.
func (q *Queue) EnqueueImport(ctx context.Context, payload *ImportPayload) (string, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal payload: %w", err)
	}

	job := &Job{
		Type:     JobTypeImport,
		Priority: PriorityNormal,
		Payload:  payloadBytes,
	}

	if err := q.Enqueue(ctx, job); err != nil {
		return "", err
	}

	return job.ID, nil
}

// EnqueueReport is a convenience method to enqueue a report job.
func (q *Queue) EnqueueReport(ctx context.Context, payload *ReportPayload) (string, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal payload: %w", err)
	}

	job := &Job{
		Type:     JobTypeReport,
		Priority: PriorityLow,
		Payload:  payloadBytes,
	}

	if err := q.Enqueue(ctx, job); err != nil {
		return "", err
	}

	return job.ID, nil
}

// EnqueueDelayed enqueues a job to be processed at a specific time.
func (q *Queue) EnqueueDelayed(ctx context.Context, job *Job, processAt time.Time) error {
	job.ScheduledAt = &processAt
	return q.Enqueue(ctx, job)
}

// Dequeue retrieves the next job from the queue.
// It blocks until a job is available or the context is cancelled.
func (q *Queue) Dequeue(ctx context.Context, timeout time.Duration) (*Job, error) {
	q.mu.RLock()
	if q.closed {
		q.mu.RUnlock()
		return nil, ErrQueueClosed
	}
	q.mu.RUnlock()

	// First, check for scheduled jobs that are ready
	if err := q.promoteScheduledJobs(ctx); err != nil {
		// Log but don't fail - continue to dequeue
	}

	// Block waiting for a job
	result, err := q.client.BRPop(ctx, timeout, q.key(keyPending)).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, ErrNoJobsAvailable
		}
		return nil, fmt.Errorf("failed to dequeue job: %w", err)
	}

	if len(result) < 2 {
		return nil, ErrNoJobsAvailable
	}

	jobID := result[1]

	// Get job data
	jobData, err := q.client.Get(ctx, q.key(keyJobData+jobID)).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, ErrJobNotFound
		}
		return nil, fmt.Errorf("failed to get job data: %w", err)
	}

	var job Job
	if err := json.Unmarshal(jobData, &job); err != nil {
		return nil, fmt.Errorf("failed to unmarshal job: %w", err)
	}

	// Mark as processing
	now := time.Now()
	job.Status = JobStatusProcessing
	job.UpdatedAt = now
	job.Attempts++

	// Update job and add to processing set
	pipe := q.client.Pipeline()

	updatedData, _ := json.Marshal(&job)
	pipe.Set(ctx, q.key(keyJobData+jobID), updatedData, q.cfg.StatsRetention)
	pipe.SAdd(ctx, q.key(keyProcessing), jobID)
	pipe.HIncrBy(ctx, q.key(keyJobStats), "total_processing", 1)

	_, err = pipe.Exec(ctx)
	if err != nil {
		// Re-queue the job on error
		q.client.LPush(ctx, q.key(keyPending), jobID)
		return nil, fmt.Errorf("failed to mark job as processing: %w", err)
	}

	return &job, nil
}

// promoteScheduledJobs moves scheduled jobs that are ready to the pending queue.
func (q *Queue) promoteScheduledJobs(ctx context.Context) error {
	now := time.Now().Unix()

	// Get all jobs scheduled before now
	jobIDs, err := q.client.ZRangeByScore(ctx, q.key(keyScheduled), &redis.ZRangeBy{
		Min: "-inf",
		Max: fmt.Sprintf("%d", now),
	}).Result()
	if err != nil {
		return err
	}

	if len(jobIDs) == 0 {
		return nil
	}

	// Move each job to pending queue
	pipe := q.client.Pipeline()
	for _, jobID := range jobIDs {
		pipe.ZRem(ctx, q.key(keyScheduled), jobID)
		pipe.RPush(ctx, q.key(keyPending), jobID)
	}
	_, err = pipe.Exec(ctx)
	return err
}

// Complete marks a job as completed.
func (q *Queue) Complete(ctx context.Context, job *Job, result *JobResult) error {
	now := time.Now()
	job.Status = JobStatusCompleted
	job.UpdatedAt = now
	job.ProcessedAt = &now

	if result != nil {
		resultData, _ := json.Marshal(result)
		job.Result = resultData
	}

	jobData, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to serialize job: %w", err)
	}

	pipe := q.client.Pipeline()
	pipe.Set(ctx, q.key(keyJobData+job.ID), jobData, q.cfg.StatsRetention)
	pipe.SRem(ctx, q.key(keyProcessing), job.ID)
	pipe.LPush(ctx, q.key(keyCompleted), job.ID)
	pipe.HIncrBy(ctx, q.key(keyJobStats), "total_completed", 1)
	pipe.HIncrBy(ctx, q.key(keyJobStats), "total_processing", -1)

	_, err = pipe.Exec(ctx)
	return err
}

// Fail marks a job as failed. If retries are available, it will be requeued.
func (q *Queue) Fail(ctx context.Context, job *Job, jobErr error) error {
	now := time.Now()
	job.UpdatedAt = now
	job.Error = jobErr.Error()

	// Check if we should retry
	if job.Attempts < job.MaxAttempts {
		job.Status = JobStatusRetrying

		jobData, err := json.Marshal(job)
		if err != nil {
			return fmt.Errorf("failed to serialize job: %w", err)
		}

		// Schedule retry with exponential backoff
		retryDelay := q.cfg.RetryDelay * time.Duration(job.Attempts)
		retryAt := now.Add(retryDelay)

		pipe := q.client.Pipeline()
		pipe.Set(ctx, q.key(keyJobData+job.ID), jobData, q.cfg.StatsRetention)
		pipe.SRem(ctx, q.key(keyProcessing), job.ID)
		pipe.ZAdd(ctx, q.key(keyScheduled), redis.Z{
			Score:  float64(retryAt.Unix()),
			Member: job.ID,
		})
		pipe.HIncrBy(ctx, q.key(keyJobStats), "total_retries", 1)
		pipe.HIncrBy(ctx, q.key(keyJobStats), "total_processing", -1)

		_, err = pipe.Exec(ctx)
		return err
	}

	// No more retries - move to failed queue (dead letter)
	job.Status = JobStatusFailed

	jobData, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to serialize job: %w", err)
	}

	pipe := q.client.Pipeline()
	pipe.Set(ctx, q.key(keyJobData+job.ID), jobData, q.cfg.StatsRetention)
	pipe.SRem(ctx, q.key(keyProcessing), job.ID)
	pipe.LPush(ctx, q.key(keyFailed), job.ID)
	pipe.HIncrBy(ctx, q.key(keyJobStats), "total_failed", 1)
	pipe.HIncrBy(ctx, q.key(keyJobStats), "total_processing", -1)

	_, err = pipe.Exec(ctx)
	return err
}

// GetJob retrieves a job by ID.
func (q *Queue) GetJob(ctx context.Context, jobID string) (*Job, error) {
	jobData, err := q.client.Get(ctx, q.key(keyJobData+jobID)).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, ErrJobNotFound
		}
		return nil, fmt.Errorf("failed to get job: %w", err)
	}

	var job Job
	if err := json.Unmarshal(jobData, &job); err != nil {
		return nil, fmt.Errorf("failed to unmarshal job: %w", err)
	}

	return &job, nil
}

// GetStats returns queue statistics.
func (q *Queue) GetStats(ctx context.Context) (*QueueStats, error) {
	pipe := q.client.Pipeline()

	pendingLen := pipe.LLen(ctx, q.key(keyPending))
	processingLen := pipe.SCard(ctx, q.key(keyProcessing))
	completedLen := pipe.LLen(ctx, q.key(keyCompleted))
	failedLen := pipe.LLen(ctx, q.key(keyFailed))
	scheduledLen := pipe.ZCard(ctx, q.key(keyScheduled))
	statsMap := pipe.HGetAll(ctx, q.key(keyJobStats))

	_, err := pipe.Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}

	stats := &QueueStats{
		PendingJobs:    pendingLen.Val(),
		ProcessingJobs: processingLen.Val(),
		CompletedJobs:  completedLen.Val(),
		FailedJobs:     failedLen.Val(),
		ScheduledJobs:  scheduledLen.Val(),
		TypeCounts:     make(map[string]int64),
	}

	for k, v := range statsMap.Val() {
		var val int64
		fmt.Sscanf(v, "%d", &val)

		switch k {
		case "total_enqueued":
			stats.TotalEnqueued = val
		case "total_completed":
			stats.TotalCompleted = val
		case "total_failed":
			stats.TotalFailed = val
		case "total_retries":
			stats.TotalRetries = val
		default:
			if len(k) > 5 && k[:5] == "type:" {
				stats.TypeCounts[k[5:]] = val
			}
		}
	}

	return stats, nil
}

// QueueStats contains queue statistics.
type QueueStats struct {
	PendingJobs    int64            `json:"pending_jobs"`
	ProcessingJobs int64            `json:"processing_jobs"`
	CompletedJobs  int64            `json:"completed_jobs"`
	FailedJobs     int64            `json:"failed_jobs"`
	ScheduledJobs  int64            `json:"scheduled_jobs"`
	TotalEnqueued  int64            `json:"total_enqueued"`
	TotalCompleted int64            `json:"total_completed"`
	TotalFailed    int64            `json:"total_failed"`
	TotalRetries   int64            `json:"total_retries"`
	TypeCounts     map[string]int64 `json:"type_counts"`
}

// PurgeCompleted removes completed jobs older than the specified duration.
func (q *Queue) PurgeCompleted(ctx context.Context, olderThan time.Duration) (int64, error) {
	cutoff := time.Now().Add(-olderThan)
	var purged int64

	// Get completed job IDs
	jobIDs, err := q.client.LRange(ctx, q.key(keyCompleted), 0, -1).Result()
	if err != nil {
		return 0, err
	}

	for _, jobID := range jobIDs {
		job, err := q.GetJob(ctx, jobID)
		if err != nil {
			continue
		}

		if job.ProcessedAt != nil && job.ProcessedAt.Before(cutoff) {
			pipe := q.client.Pipeline()
			pipe.Del(ctx, q.key(keyJobData+jobID))
			pipe.LRem(ctx, q.key(keyCompleted), 1, jobID)
			if _, err := pipe.Exec(ctx); err == nil {
				purged++
			}
		}
	}

	return purged, nil
}

// RetryFailed moves a failed job back to the pending queue.
func (q *Queue) RetryFailed(ctx context.Context, jobID string) error {
	job, err := q.GetJob(ctx, jobID)
	if err != nil {
		return err
	}

	if job.Status != JobStatusFailed {
		return fmt.Errorf("job is not in failed status")
	}

	// Reset job state
	job.Status = JobStatusPending
	job.Attempts = 0
	job.Error = ""
	job.UpdatedAt = time.Now()

	jobData, _ := json.Marshal(job)

	pipe := q.client.Pipeline()
	pipe.Set(ctx, q.key(keyJobData+jobID), jobData, q.cfg.StatsRetention)
	pipe.LRem(ctx, q.key(keyFailed), 1, jobID)
	pipe.RPush(ctx, q.key(keyPending), jobID)

	_, err = pipe.Exec(ctx)
	return err
}
