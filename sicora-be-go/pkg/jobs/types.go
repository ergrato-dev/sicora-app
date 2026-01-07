// Package jobs provides a Redis-based job queue system for background processing.
// It supports multiple job types, automatic retries, and dead letter queues.
package jobs

import (
	"encoding/json"
	"time"
)

// JobType represents the type of job to be processed.
type JobType string

const (
	// JobTypeNotification handles email, SMS, and push notifications.
	JobTypeNotification JobType = "notification"

	// JobTypeImport handles bulk data imports (CSV, Excel).
	JobTypeImport JobType = "import"

	// JobTypeReport handles PDF/Excel report generation.
	JobTypeReport JobType = "report"

	// JobTypeCalculation handles batch calculations (grades, averages).
	JobTypeCalculation JobType = "calculation"

	// JobTypeCleanup handles cleanup tasks (expired tokens, old logs).
	JobTypeCleanup JobType = "cleanup"

	// JobTypeWebhook handles external webhook calls.
	JobTypeWebhook JobType = "webhook"
)

// JobStatus represents the current status of a job.
type JobStatus string

const (
	JobStatusPending    JobStatus = "pending"
	JobStatusProcessing JobStatus = "processing"
	JobStatusCompleted  JobStatus = "completed"
	JobStatusFailed     JobStatus = "failed"
	JobStatusRetrying   JobStatus = "retrying"
)

// JobPriority represents job priority levels.
type JobPriority int

const (
	PriorityLow    JobPriority = 1
	PriorityNormal JobPriority = 5
	PriorityHigh   JobPriority = 10
)

// Job represents a task to be processed asynchronously.
type Job struct {
	// ID is the unique identifier for the job.
	ID string `json:"id"`

	// Type identifies the kind of job to process.
	Type JobType `json:"type"`

	// Priority determines processing order (higher = processed first).
	Priority JobPriority `json:"priority"`

	// Payload contains the job-specific data.
	Payload json.RawMessage `json:"payload"`

	// Status is the current job status.
	Status JobStatus `json:"status"`

	// Attempts is the number of processing attempts.
	Attempts int `json:"attempts"`

	// MaxAttempts is the maximum number of retry attempts.
	MaxAttempts int `json:"max_attempts"`

	// CreatedAt is when the job was created.
	CreatedAt time.Time `json:"created_at"`

	// UpdatedAt is when the job was last updated.
	UpdatedAt time.Time `json:"updated_at"`

	// ScheduledAt is when the job should be processed (for delayed jobs).
	ScheduledAt *time.Time `json:"scheduled_at,omitempty"`

	// ProcessedAt is when the job was processed.
	ProcessedAt *time.Time `json:"processed_at,omitempty"`

	// Error contains the last error message if failed.
	Error string `json:"error,omitempty"`

	// Result contains the job result if successful.
	Result json.RawMessage `json:"result,omitempty"`

	// Metadata contains additional job metadata.
	Metadata map[string]string `json:"metadata,omitempty"`
}

// NotificationPayload is the payload for notification jobs.
type NotificationPayload struct {
	// Channel specifies the notification channel.
	Channel NotificationChannel `json:"channel"`

	// Recipients contains the target recipients.
	Recipients []string `json:"recipients"`

	// Subject is the notification subject (for email).
	Subject string `json:"subject,omitempty"`

	// Body is the notification body.
	Body string `json:"body"`

	// Template is the template name to use.
	Template string `json:"template,omitempty"`

	// TemplateData contains data for template rendering.
	TemplateData map[string]interface{} `json:"template_data,omitempty"`

	// Attachments for email notifications.
	Attachments []Attachment `json:"attachments,omitempty"`
}

// NotificationChannel represents a notification delivery channel.
type NotificationChannel string

const (
	ChannelEmail NotificationChannel = "email"
	ChannelSMS   NotificationChannel = "sms"
	ChannelPush  NotificationChannel = "push"
	ChannelSlack NotificationChannel = "slack"
)

// Attachment represents a file attachment.
type Attachment struct {
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
	Data        []byte `json:"data,omitempty"`
	URL         string `json:"url,omitempty"`
}

// ImportPayload is the payload for import jobs.
type ImportPayload struct {
	// EntityType identifies what is being imported (users, schedules, etc.).
	EntityType string `json:"entity_type"`

	// FileURL is the URL to the import file.
	FileURL string `json:"file_url,omitempty"`

	// FileData is the raw file data (base64 encoded).
	FileData string `json:"file_data,omitempty"`

	// Format is the file format (csv, xlsx).
	Format string `json:"format"`

	// Options contains import options.
	Options ImportOptions `json:"options"`

	// RequestedBy is the user ID who requested the import.
	RequestedBy string `json:"requested_by"`
}

// ImportOptions contains options for import jobs.
type ImportOptions struct {
	// SkipHeader indicates whether to skip the first row.
	SkipHeader bool `json:"skip_header"`

	// UpdateExisting indicates whether to update existing records.
	UpdateExisting bool `json:"update_existing"`

	// DryRun indicates whether to simulate the import.
	DryRun bool `json:"dry_run"`

	// BatchSize is the number of records to process at once.
	BatchSize int `json:"batch_size"`
}

// ReportPayload is the payload for report generation jobs.
type ReportPayload struct {
	// ReportType identifies the report to generate.
	ReportType string `json:"report_type"`

	// Format is the output format (pdf, xlsx, csv).
	Format string `json:"format"`

	// Filters contains report filters.
	Filters map[string]interface{} `json:"filters,omitempty"`

	// RequestedBy is the user ID who requested the report.
	RequestedBy string `json:"requested_by"`

	// DeliveryEmail is the email to send the report to.
	DeliveryEmail string `json:"delivery_email,omitempty"`
}

// CalculationPayload is the payload for calculation jobs.
type CalculationPayload struct {
	// CalculationType identifies the calculation to perform.
	CalculationType string `json:"calculation_type"`

	// EntityIDs contains the IDs to process.
	EntityIDs []string `json:"entity_ids,omitempty"`

	// Period specifies the time period for calculations.
	Period string `json:"period,omitempty"`

	// Options contains calculation options.
	Options map[string]interface{} `json:"options,omitempty"`
}

// CleanupPayload is the payload for cleanup jobs.
type CleanupPayload struct {
	// CleanupType identifies what to clean up.
	CleanupType string `json:"cleanup_type"`

	// OlderThan specifies the age threshold.
	OlderThan time.Duration `json:"older_than"`

	// DryRun indicates whether to simulate the cleanup.
	DryRun bool `json:"dry_run"`
}

// JobResult represents the result of a processed job.
type JobResult struct {
	// Success indicates if the job completed successfully.
	Success bool `json:"success"`

	// Message contains a human-readable result message.
	Message string `json:"message,omitempty"`

	// Data contains job-specific result data.
	Data interface{} `json:"data,omitempty"`

	// ProcessedCount is the number of items processed.
	ProcessedCount int `json:"processed_count,omitempty"`

	// ErrorCount is the number of errors encountered.
	ErrorCount int `json:"error_count,omitempty"`

	// Errors contains detailed error information.
	Errors []string `json:"errors,omitempty"`
}

// ImportResult extends JobResult for import jobs.
type ImportResult struct {
	JobResult
	CreatedCount int      `json:"created_count"`
	UpdatedCount int      `json:"updated_count"`
	SkippedCount int      `json:"skipped_count"`
	FailedRows   []int    `json:"failed_rows,omitempty"`
	Warnings     []string `json:"warnings,omitempty"`
}
