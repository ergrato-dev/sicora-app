// Package jobs Example Usage
//
// This file provides examples of how to use the job queue system.
package jobs

/*
Example: Basic Queue Usage

	package main

	import (
		"context"
		"log"
		"time"

		"sicora-be-go/pkg/jobs"
	)

	func main() {
		// Create queue configuration
		cfg := &jobs.QueueConfig{
			RedisAddr:  "localhost:6379",
			MaxRetries: 3,
			RetryDelay: time.Minute,
			JobTimeout: 5 * time.Minute,
		}

		// Create queue
		queue, err := jobs.NewQueue(cfg)
		if err != nil {
			log.Fatal(err)
		}
		defer queue.Close()

		ctx := context.Background()

		// Enqueue a notification job
		jobID, err := queue.EnqueueNotification(ctx, &jobs.NotificationPayload{
			Channel:    jobs.ChannelEmail,
			Recipients: []string{"user@example.com"},
			Subject:    "Welcome!",
			Body:       "Welcome to SICORA",
		})
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("Enqueued notification job: %s", jobID)

		// Enqueue an import job with high priority
		importJob := &jobs.Job{
			Type:     jobs.JobTypeImport,
			Priority: jobs.PriorityHigh,
		}
		payload := &jobs.ImportPayload{
			EntityType: "users",
			FileURL:    "https://example.com/users.csv",
			Format:     "csv",
			Options: jobs.ImportOptions{
				SkipHeader:     true,
				UpdateExisting: false,
				BatchSize:      100,
			},
		}
		jobID, err = queue.EnqueueImport(ctx, payload, jobs.PriorityHigh)
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("Enqueued import job: %s", jobID)

		// Enqueue a delayed job (runs in 1 hour)
		delayedJob := &jobs.Job{
			Type:     jobs.JobTypeReport,
			Priority: jobs.PriorityNormal,
		}
		reportPayload := &jobs.ReportPayload{
			ReportType: "monthly_summary",
			Format:     "pdf",
		}
		jobID, err = queue.EnqueueReport(ctx, reportPayload, time.Hour)
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("Enqueued delayed report job: %s", jobID)

		// Get queue stats
		stats, err := queue.GetStats(ctx)
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("Queue stats: pending=%d, processing=%d", stats.PendingJobs, stats.ProcessingJobs)
	}

Example: Worker Setup

	package main

	import (
		"context"
		"log"
		"time"

		"sicora-be-go/pkg/jobs"
	)

	func main() {
		// Create queue
		cfg := &jobs.QueueConfig{
			RedisAddr:  "localhost:6379",
			MaxRetries: 3,
		}
		queue, err := jobs.NewQueue(cfg)
		if err != nil {
			log.Fatal(err)
		}

		// Create worker configuration
		workerCfg := &jobs.WorkerConfig{
			Concurrency:     5,
			PollInterval:    time.Second,
			ShutdownTimeout: 30 * time.Second,
		}

		// Create worker
		worker := jobs.NewWorker(queue, workerCfg)

		// Register handlers
		worker.RegisterHandler(jobs.JobTypeNotification, jobs.NotificationHandler(sendNotification))
		worker.RegisterHandler(jobs.JobTypeImport, jobs.ImportHandler(processImport))
		worker.RegisterHandler(jobs.JobTypeReport, jobs.ReportHandler(generateReport))

		// Run worker (blocks until interrupted)
		ctx := context.Background()
		if err := worker.Run(ctx); err != nil {
			log.Fatal(err)
		}
	}

	func sendNotification(ctx context.Context, payload *jobs.NotificationPayload) error {
		// Implement notification sending logic
		log.Printf("Sending %s to %v", payload.Channel, payload.Recipients)
		return nil
	}

	func processImport(ctx context.Context, payload *jobs.ImportPayload) (*jobs.ImportResult, error) {
		// Implement import logic
		log.Printf("Importing %s from %s", payload.EntityType, payload.FileURL)
		return &jobs.ImportResult{
			JobResult: jobs.JobResult{
				Success:        true,
				ProcessedCount: 100,
			},
			CreatedCount: 90,
			UpdatedCount: 10,
		}, nil
	}

	func generateReport(ctx context.Context, payload *jobs.ReportPayload) ([]byte, error) {
		// Implement report generation logic
		log.Printf("Generating %s report in %s format", payload.ReportType, payload.Format)
		return []byte("PDF content"), nil
	}

Example: Custom Job Handler

	package main

	import (
		"context"
		"encoding/json"
		"fmt"

		"sicora-be-go/pkg/jobs"
	)

	// CustomPayload defines a custom job payload
	type CustomPayload struct {
		TaskID     string `json:"task_id"`
		Parameters map[string]interface{} `json:"parameters"`
	}

	func customHandler(ctx context.Context, job *jobs.Job) (*jobs.JobResult, error) {
		var payload CustomPayload
		if err := json.Unmarshal(job.Payload, &payload); err != nil {
			return nil, fmt.Errorf("invalid payload: %w", err)
		}

		// Process the custom job
		// ...

		return &jobs.JobResult{
			Success: true,
			Message: fmt.Sprintf("Processed task %s", payload.TaskID),
			Data:    map[string]interface{}{"result": "completed"},
		}, nil
	}

Example: Integration with Gin HTTP Server

	package main

	import (
		"net/http"
		"time"

		"github.com/gin-gonic/gin"
		"sicora-be-go/pkg/jobs"
	)

	var queue *jobs.Queue

	func main() {
		// Initialize queue
		var err error
		queue, err = jobs.NewQueue(&jobs.QueueConfig{
			RedisAddr: "localhost:6379",
		})
		if err != nil {
			panic(err)
		}

		r := gin.Default()

		// Endpoint to queue a notification
		r.POST("/api/notifications", queueNotification)

		// Endpoint to check job status
		r.GET("/api/jobs/:id", getJobStatus)

		// Endpoint to get queue stats
		r.GET("/api/jobs/stats", getQueueStats)

		r.Run(":8080")
	}

	func queueNotification(c *gin.Context) {
		var payload jobs.NotificationPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		jobID, err := queue.EnqueueNotification(c.Request.Context(), &payload)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{
			"job_id":  jobID,
			"message": "Notification queued",
		})
	}

	func getJobStatus(c *gin.Context) {
		jobID := c.Param("id")

		job, err := queue.GetJob(c.Request.Context(), jobID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
			return
		}

		c.JSON(http.StatusOK, job)
	}

	func getQueueStats(c *gin.Context) {
		stats, err := queue.GetStats(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
*/
