package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ========================
// Queue Tests
// ========================

func TestNewQueue(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping test that requires Redis")
	}

	cfg := &QueueConfig{
		RedisAddr:  "localhost:6379",
		MaxRetries: 5,
	}

	queue, err := NewQueue(cfg)
	require.NoError(t, err)
	require.NotNil(t, queue)
	assert.Equal(t, 5, queue.cfg.MaxRetries)
}

func TestQueueConfig_Defaults(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping test that requires Redis")
	}

	cfg := &QueueConfig{
		RedisAddr: "localhost:6379",
	}

	queue, err := NewQueue(cfg)
	require.NoError(t, err)

	assert.Equal(t, 3, queue.cfg.MaxRetries)
	assert.Equal(t, time.Minute, queue.cfg.RetryDelay)
	assert.Equal(t, 5*time.Minute, queue.cfg.JobTimeout)
}

// ========================
// Job Type Tests
// ========================

func TestJobType_String(t *testing.T) {
	tests := []struct {
		jobType  JobType
		expected string
	}{
		{JobTypeNotification, "notification"},
		{JobTypeImport, "import"},
		{JobTypeReport, "report"},
		{JobTypeCalculation, "calculation"},
		{JobTypeCleanup, "cleanup"},
		{JobTypeWebhook, "webhook"},
	}

	for _, tt := range tests {
		t.Run(string(tt.jobType), func(t *testing.T) {
			assert.Equal(t, tt.expected, string(tt.jobType))
		})
	}
}

func TestJobStatus_Values(t *testing.T) {
	tests := []struct {
		status   JobStatus
		expected string
	}{
		{JobStatusPending, "pending"},
		{JobStatusProcessing, "processing"},
		{JobStatusCompleted, "completed"},
		{JobStatusFailed, "failed"},
		{JobStatusRetrying, "retrying"},
	}

	for _, tt := range tests {
		t.Run(string(tt.status), func(t *testing.T) {
			assert.Equal(t, tt.expected, string(tt.status))
		})
	}
}

func TestJobPriority_Values(t *testing.T) {
	assert.Equal(t, JobPriority(1), PriorityLow)
	assert.Equal(t, JobPriority(5), PriorityNormal)
	assert.Equal(t, JobPriority(10), PriorityHigh)
}

// ========================
// Payload Tests
// ========================

func TestNotificationPayload_Marshal(t *testing.T) {
	payload := &NotificationPayload{
		Channel:    ChannelEmail,
		Recipients: []string{"user@example.com"},
		Subject:    "Test Subject",
		Body:       "Test Body",
		Template:   "template-123",
	}

	data, err := json.Marshal(payload)
	require.NoError(t, err)

	var decoded NotificationPayload
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, payload.Channel, decoded.Channel)
	assert.Equal(t, payload.Recipients, decoded.Recipients)
	assert.Equal(t, payload.Subject, decoded.Subject)
	assert.Equal(t, payload.Body, decoded.Body)
	assert.Equal(t, payload.Template, decoded.Template)
}

func TestImportPayload_Marshal(t *testing.T) {
	payload := &ImportPayload{
		EntityType:  "users",
		FileURL:     "https://example.com/users.csv",
		Format:      "csv",
		RequestedBy: "user-123",
		Options: ImportOptions{
			BatchSize:      100,
			DryRun:         true,
			UpdateExisting: true,
			SkipHeader:     true,
		},
	}

	data, err := json.Marshal(payload)
	require.NoError(t, err)

	var decoded ImportPayload
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, payload.EntityType, decoded.EntityType)
	assert.Equal(t, payload.FileURL, decoded.FileURL)
	assert.Equal(t, payload.Format, decoded.Format)
	assert.Equal(t, payload.Options.BatchSize, decoded.Options.BatchSize)
	assert.True(t, decoded.Options.DryRun)
	assert.True(t, decoded.Options.UpdateExisting)
}

func TestReportPayload_Marshal(t *testing.T) {
	payload := &ReportPayload{
		ReportType: "monthly-summary",
		Format:     "pdf",
		Filters: map[string]interface{}{
			"status": "active",
		},
		RequestedBy:   "user-123",
		DeliveryEmail: "reports@example.com",
	}

	data, err := json.Marshal(payload)
	require.NoError(t, err)

	var decoded ReportPayload
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, payload.ReportType, decoded.ReportType)
	assert.Equal(t, payload.Format, decoded.Format)
	assert.Equal(t, payload.RequestedBy, decoded.RequestedBy)
	assert.Equal(t, payload.DeliveryEmail, decoded.DeliveryEmail)
}

// ========================
// Job Creation Tests
// ========================

func TestNewJob(t *testing.T) {
	payload := map[string]string{"key": "value"}
	payloadBytes, _ := json.Marshal(payload)

	job := &Job{
		Type:     JobTypeNotification,
		Priority: PriorityHigh,
		Payload:  payloadBytes,
	}

	assert.Equal(t, JobTypeNotification, job.Type)
	assert.Equal(t, PriorityHigh, job.Priority)
	assert.NotEmpty(t, job.Payload)
}

func TestJob_JSON_Marshal(t *testing.T) {
	job := &Job{
		ID:          "job-123",
		Type:        JobTypeImport,
		Priority:    PriorityNormal,
		Status:      JobStatusPending,
		Payload:     []byte(`{"test": true}`),
		Attempts:    0,
		MaxAttempts: 3,
		CreatedAt:   time.Now(),
	}

	data, err := json.Marshal(job)
	require.NoError(t, err)

	var decoded Job
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, job.ID, decoded.ID)
	assert.Equal(t, job.Type, decoded.Type)
	assert.Equal(t, job.Priority, decoded.Priority)
	assert.Equal(t, job.Status, decoded.Status)
}

// ========================
// JobResult Tests
// ========================

func TestJobResult_Success(t *testing.T) {
	result := &JobResult{
		Success:        true,
		Message:        "Job completed successfully",
		ProcessedCount: 100,
		ErrorCount:     0,
		Data: map[string]interface{}{
			"records": 100,
		},
	}

	assert.True(t, result.Success)
	assert.Equal(t, 100, result.ProcessedCount)
	assert.Equal(t, 0, result.ErrorCount)
}

func TestImportResult(t *testing.T) {
	result := &ImportResult{
		JobResult: JobResult{
			Success:        true,
			Message:        "Import completed",
			ProcessedCount: 100,
			ErrorCount:     5,
		},
		CreatedCount: 90,
		UpdatedCount: 5,
		SkippedCount: 5,
		FailedRows:   []int{10, 25, 50},
		Warnings:     []string{"Row 10 had invalid email format"},
	}

	assert.True(t, result.Success)
	assert.Equal(t, 90, result.CreatedCount)
	assert.Equal(t, 5, result.UpdatedCount)
	assert.Len(t, result.FailedRows, 3)
	assert.Len(t, result.Warnings, 1)
}

// ========================
// NotificationChannel Tests
// ========================

func TestNotificationChannel_Values(t *testing.T) {
	tests := []struct {
		channel  NotificationChannel
		expected string
	}{
		{ChannelEmail, "email"},
		{ChannelSMS, "sms"},
		{ChannelPush, "push"},
		{ChannelSlack, "slack"},
	}

	for _, tt := range tests {
		t.Run(string(tt.channel), func(t *testing.T) {
			assert.Equal(t, tt.expected, string(tt.channel))
		})
	}
}

// ========================
// Worker Config Tests
// ========================

func TestDefaultWorkerConfig(t *testing.T) {
	cfg := DefaultWorkerConfig()

	assert.Equal(t, 3, cfg.Concurrency)
	assert.Equal(t, time.Second, cfg.PollInterval)
	assert.Equal(t, 30*time.Second, cfg.ShutdownTimeout)
	assert.NotNil(t, cfg.Logger)
}

func TestWorkerStats(t *testing.T) {
	stats := WorkerStats{
		Running:   true,
		Uptime:    time.Hour,
		Processed: 100,
		Errors:    5,
	}

	assert.True(t, stats.Running)
	assert.Equal(t, time.Hour, stats.Uptime)
	assert.Equal(t, uint64(100), stats.Processed)
	assert.Equal(t, uint64(5), stats.Errors)
}

// ========================
// Handler Factory Tests
// ========================

func TestNotificationHandler(t *testing.T) {
	var capturedPayload *NotificationPayload

	sender := func(ctx context.Context, payload *NotificationPayload) error {
		capturedPayload = payload
		return nil
	}

	handler := NotificationHandler(sender)

	payload := &NotificationPayload{
		Channel:    ChannelEmail,
		Recipients: []string{"test@example.com"},
		Subject:    "Test",
		Body:       "Test body",
	}
	payloadBytes, _ := json.Marshal(payload)

	job := &Job{
		ID:      "job-123",
		Type:    JobTypeNotification,
		Payload: payloadBytes,
	}

	result, err := handler(context.Background(), job)
	require.NoError(t, err)
	require.NotNil(t, result)

	assert.True(t, result.Success)
	assert.Equal(t, 1, result.ProcessedCount)
	assert.NotNil(t, capturedPayload)
	assert.Equal(t, "Test", capturedPayload.Subject)
}

func TestNotificationHandler_InvalidPayload(t *testing.T) {
	handler := NotificationHandler(func(ctx context.Context, payload *NotificationPayload) error {
		return nil
	})

	job := &Job{
		ID:      "job-123",
		Type:    JobTypeNotification,
		Payload: []byte("invalid json"),
	}

	result, err := handler(context.Background(), job)
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "invalid notification payload")
}

func TestNotificationHandler_SenderError(t *testing.T) {
	handler := NotificationHandler(func(ctx context.Context, payload *NotificationPayload) error {
		return fmt.Errorf("SMTP connection failed")
	})

	payload := &NotificationPayload{
		Channel:    ChannelEmail,
		Recipients: []string{"test@example.com"},
	}
	payloadBytes, _ := json.Marshal(payload)

	job := &Job{
		ID:      "job-123",
		Type:    JobTypeNotification,
		Payload: payloadBytes,
	}

	result, err := handler(context.Background(), job)
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "SMTP connection failed")
}

func TestImportHandler(t *testing.T) {
	importer := func(ctx context.Context, payload *ImportPayload) (*ImportResult, error) {
		return &ImportResult{
			JobResult: JobResult{
				Success:        true,
				Message:        "Import completed",
				ProcessedCount: 50,
			},
			CreatedCount: 45,
			UpdatedCount: 5,
		}, nil
	}

	handler := ImportHandler(importer)

	payload := &ImportPayload{
		EntityType: "users",
		FileURL:    "https://example.com/users.csv",
		Format:     "csv",
	}
	payloadBytes, _ := json.Marshal(payload)

	job := &Job{
		ID:      "job-456",
		Type:    JobTypeImport,
		Payload: payloadBytes,
	}

	result, err := handler(context.Background(), job)
	require.NoError(t, err)
	require.NotNil(t, result)

	assert.True(t, result.Success)
	assert.Equal(t, 50, result.ProcessedCount)
}

func TestReportHandler(t *testing.T) {
	reportData := []byte("PDF content here...")

	generator := func(ctx context.Context, payload *ReportPayload) ([]byte, error) {
		return reportData, nil
	}

	handler := ReportHandler(generator)

	payload := &ReportPayload{
		ReportType: "monthly",
		Format:     "pdf",
	}
	payloadBytes, _ := json.Marshal(payload)

	job := &Job{
		ID:      "job-789",
		Type:    JobTypeReport,
		Payload: payloadBytes,
	}

	result, err := handler(context.Background(), job)
	require.NoError(t, err)
	require.NotNil(t, result)

	assert.True(t, result.Success)
	assert.Contains(t, result.Message, "bytes")
}

// ========================
// QueueStats Tests
// ========================

func TestQueueStats(t *testing.T) {
	stats := &QueueStats{
		PendingJobs:    10,
		ProcessingJobs: 2,
		CompletedJobs:  100,
		FailedJobs:     5,
		ScheduledJobs:  3,
	}

	assert.Equal(t, int64(10), stats.PendingJobs)
	assert.Equal(t, int64(2), stats.ProcessingJobs)
	assert.Equal(t, int64(100), stats.CompletedJobs)
	assert.Equal(t, int64(5), stats.FailedJobs)
	assert.Equal(t, int64(3), stats.ScheduledJobs)
}

// ========================
// Cleanup Payload Tests
// ========================

func TestCleanupPayload_Marshal(t *testing.T) {
	payload := &CleanupPayload{
		CleanupType: "expired_tokens",
		OlderThan:   24 * time.Hour,
		DryRun:      true,
	}

	data, err := json.Marshal(payload)
	require.NoError(t, err)

	var decoded CleanupPayload
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, payload.CleanupType, decoded.CleanupType)
	assert.Equal(t, payload.OlderThan, decoded.OlderThan)
	assert.True(t, decoded.DryRun)
}

// ========================
// Calculation Payload Tests
// ========================

func TestCalculationPayload_Marshal(t *testing.T) {
	payload := &CalculationPayload{
		CalculationType: "student_averages",
		EntityIDs:       []string{"student-1", "student-2"},
		Period:          "2024-Q1",
		Options: map[string]interface{}{
			"include_attendance": true,
		},
	}

	data, err := json.Marshal(payload)
	require.NoError(t, err)

	var decoded CalculationPayload
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, payload.CalculationType, decoded.CalculationType)
	assert.Equal(t, payload.EntityIDs, decoded.EntityIDs)
	assert.Equal(t, payload.Period, decoded.Period)
}

// ========================
// Job Metadata Tests
// ========================

func TestJob_WithMetadata(t *testing.T) {
	job := &Job{
		ID:       "job-123",
		Type:     JobTypeNotification,
		Priority: PriorityNormal,
		Metadata: map[string]string{
			"user_id":    "user-456",
			"request_id": "req-789",
			"source":     "api",
		},
	}

	assert.Equal(t, "user-456", job.Metadata["user_id"])
	assert.Equal(t, "req-789", job.Metadata["request_id"])
	assert.Equal(t, "api", job.Metadata["source"])
}

func TestJob_ScheduledAt(t *testing.T) {
	scheduledTime := time.Now().Add(time.Hour)
	job := &Job{
		ID:          "job-123",
		Type:        JobTypeReport,
		ScheduledAt: &scheduledTime,
	}

	assert.NotNil(t, job.ScheduledAt)
	assert.True(t, job.ScheduledAt.After(time.Now()))
}

// ========================
// Attachment Tests
// ========================

func TestAttachment_Marshal(t *testing.T) {
	attachment := Attachment{
		Filename:    "report.pdf",
		ContentType: "application/pdf",
		URL:         "https://storage.example.com/reports/report.pdf",
	}

	data, err := json.Marshal(attachment)
	require.NoError(t, err)

	var decoded Attachment
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, attachment.Filename, decoded.Filename)
	assert.Equal(t, attachment.ContentType, decoded.ContentType)
	assert.Equal(t, attachment.URL, decoded.URL)
}

func TestNotificationPayload_WithAttachments(t *testing.T) {
	payload := &NotificationPayload{
		Channel:    ChannelEmail,
		Recipients: []string{"user@example.com"},
		Subject:    "Monthly Report",
		Body:       "Please find attached your monthly report.",
		Attachments: []Attachment{
			{
				Filename:    "report.pdf",
				ContentType: "application/pdf",
				URL:         "https://storage.example.com/reports/monthly.pdf",
			},
		},
	}

	assert.Len(t, payload.Attachments, 1)
	assert.Equal(t, "report.pdf", payload.Attachments[0].Filename)
}

// ========================
// Import Options Tests
// ========================

func TestImportOptions_Defaults(t *testing.T) {
	options := ImportOptions{}

	assert.False(t, options.SkipHeader)
	assert.False(t, options.UpdateExisting)
	assert.False(t, options.DryRun)
	assert.Equal(t, 0, options.BatchSize)
}

func TestImportOptions_WithValues(t *testing.T) {
	options := ImportOptions{
		SkipHeader:     true,
		UpdateExisting: true,
		DryRun:         false,
		BatchSize:      500,
	}

	assert.True(t, options.SkipHeader)
	assert.True(t, options.UpdateExisting)
	assert.False(t, options.DryRun)
	assert.Equal(t, 500, options.BatchSize)
}
