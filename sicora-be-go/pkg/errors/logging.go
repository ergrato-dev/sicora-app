package errors

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"runtime"
	"sync"
	"time"
)

// ============================================================================
// LOG LEVELS
// ============================================================================

// LogLevel represents the severity of a log entry
type LogLevel int

const (
	LevelDebug LogLevel = iota
	LevelInfo
	LevelWarn
	LevelError
	LevelFatal
)

// String returns the string representation of the log level
func (l LogLevel) String() string {
	switch l {
	case LevelDebug:
		return "DEBUG"
	case LevelInfo:
		return "INFO"
	case LevelWarn:
		return "WARN"
	case LevelError:
		return "ERROR"
	case LevelFatal:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

// ============================================================================
// LOG ENTRY
// ============================================================================

// LogEntry represents a structured log entry
type LogEntry struct {
	// Standard fields
	Timestamp time.Time `json:"timestamp"`
	Level     string    `json:"level"`
	Message   string    `json:"message"`

	// Context fields
	TraceID   string `json:"trace_id,omitempty"`
	SpanID    string `json:"span_id,omitempty"`
	RequestID string `json:"request_id,omitempty"`

	// Service fields
	Service     string `json:"service,omitempty"`
	Version     string `json:"version,omitempty"`
	Environment string `json:"environment,omitempty"`

	// Operation fields
	Operation string `json:"operation,omitempty"`
	Duration  int64  `json:"duration_ms,omitempty"`

	// User fields
	UserID   string `json:"user_id,omitempty"`
	TenantID string `json:"tenant_id,omitempty"`

	// Error fields
	Error *ErrorLogEntry `json:"error,omitempty"`

	// Location
	File     string `json:"file,omitempty"`
	Line     int    `json:"line,omitempty"`
	Function string `json:"function,omitempty"`

	// Additional fields
	Fields map[string]interface{} `json:"fields,omitempty"`
}

// ErrorLogEntry represents error information in a log entry
type ErrorLogEntry struct {
	Code     string                 `json:"code,omitempty"`
	Domain   string                 `json:"domain,omitempty"`
	Category string                 `json:"category,omitempty"`
	Message  string                 `json:"message"`
	Details  map[string]interface{} `json:"details,omitempty"`
	Stack    string                 `json:"stack,omitempty"`
	Cause    string                 `json:"cause,omitempty"`
}

// ============================================================================
// LOGGER INTERFACE
// ============================================================================

// Logger interface for structured logging
type Logger interface {
	Debug(ctx context.Context, msg string, fields ...Field)
	Info(ctx context.Context, msg string, fields ...Field)
	Warn(ctx context.Context, msg string, fields ...Field)
	Error(ctx context.Context, msg string, err error, fields ...Field)
	Fatal(ctx context.Context, msg string, err error, fields ...Field)

	WithFields(fields ...Field) Logger
	WithContext(ctx context.Context) Logger
}

// ============================================================================
// FIELD TYPE
// ============================================================================

// Field represents a key-value pair for logging
type Field struct {
	Key   string
	Value interface{}
}

// F creates a new Field
func F(key string, value interface{}) Field {
	return Field{Key: key, Value: value}
}

// Common field constructors
func Str(key, value string) Field               { return F(key, value) }
func Int(key string, value int) Field           { return F(key, value) }
func Int64(key string, value int64) Field       { return F(key, value) }
func Float64(key string, value float64) Field   { return F(key, value) }
func Bool(key string, value bool) Field         { return F(key, value) }
func Dur(key string, value time.Duration) Field { return F(key, value.Milliseconds()) }
func Time(key string, value time.Time) Field    { return F(key, value.Format(time.RFC3339)) }
func Err(err error) Field                       { return F("error", err) }
func Any(key string, value interface{}) Field   { return F(key, value) }

// ============================================================================
// JSON LOGGER
// ============================================================================

// JSONLogger implements structured logging in JSON format
type JSONLogger struct {
	mu              sync.Mutex
	output          io.Writer
	level           LogLevel
	fields          map[string]interface{}
	service         *ServiceContext
	includeLocation bool
}

// LoggerConfig configures the JSON logger
type LoggerConfig struct {
	Output          io.Writer
	Level           LogLevel
	Service         *ServiceContext
	IncludeLocation bool
}

// DefaultLoggerConfig returns default logger configuration
func DefaultLoggerConfig() *LoggerConfig {
	return &LoggerConfig{
		Output:          os.Stdout,
		Level:           LevelInfo,
		Service:         GetGlobalServiceContext(),
		IncludeLocation: true,
	}
}

// NewJSONLogger creates a new JSON logger
func NewJSONLogger(config *LoggerConfig) *JSONLogger {
	if config == nil {
		config = DefaultLoggerConfig()
	}
	return &JSONLogger{
		output:          config.Output,
		level:           config.Level,
		fields:          make(map[string]interface{}),
		service:         config.Service,
		includeLocation: config.IncludeLocation,
	}
}

// Debug logs at debug level
func (l *JSONLogger) Debug(ctx context.Context, msg string, fields ...Field) {
	l.log(ctx, LevelDebug, msg, nil, fields)
}

// Info logs at info level
func (l *JSONLogger) Info(ctx context.Context, msg string, fields ...Field) {
	l.log(ctx, LevelInfo, msg, nil, fields)
}

// Warn logs at warn level
func (l *JSONLogger) Warn(ctx context.Context, msg string, fields ...Field) {
	l.log(ctx, LevelWarn, msg, nil, fields)
}

// Error logs at error level
func (l *JSONLogger) Error(ctx context.Context, msg string, err error, fields ...Field) {
	l.log(ctx, LevelError, msg, err, fields)
}

// Fatal logs at fatal level
func (l *JSONLogger) Fatal(ctx context.Context, msg string, err error, fields ...Field) {
	l.log(ctx, LevelFatal, msg, err, fields)
}

// WithFields returns a logger with additional fields
func (l *JSONLogger) WithFields(fields ...Field) Logger {
	newLogger := &JSONLogger{
		output:          l.output,
		level:           l.level,
		fields:          make(map[string]interface{}),
		service:         l.service,
		includeLocation: l.includeLocation,
	}
	// Copy existing fields
	for k, v := range l.fields {
		newLogger.fields[k] = v
	}
	// Add new fields
	for _, f := range fields {
		newLogger.fields[f.Key] = f.Value
	}
	return newLogger
}

// WithContext returns a logger with context values
func (l *JSONLogger) WithContext(ctx context.Context) Logger {
	rc := ExtractContext(ctx)
	return l.WithFields(
		Str("trace_id", rc.TraceID),
		Str("span_id", rc.SpanID),
		Str("request_id", rc.RequestID),
		Str("user_id", rc.UserID),
		Str("operation", rc.OperationName),
	)
}

// log performs the actual logging
func (l *JSONLogger) log(ctx context.Context, level LogLevel, msg string, err error, fields []Field) {
	if level < l.level {
		return
	}

	entry := l.buildEntry(ctx, level, msg, err, fields)

	l.mu.Lock()
	defer l.mu.Unlock()

	data, _ := json.Marshal(entry)
	l.output.Write(data)
	l.output.Write([]byte("\n"))
}

// buildEntry creates a log entry
func (l *JSONLogger) buildEntry(ctx context.Context, level LogLevel, msg string, err error, fields []Field) *LogEntry {
	entry := &LogEntry{
		Timestamp: time.Now().UTC(),
		Level:     level.String(),
		Message:   msg,
		Fields:    make(map[string]interface{}),
	}

	// Add service info
	if l.service != nil {
		entry.Service = l.service.Name
		entry.Version = l.service.Version
		entry.Environment = l.service.Environment
	}

	// Extract context
	if ctx != nil {
		rc := ExtractContext(ctx)
		entry.TraceID = rc.TraceID
		entry.SpanID = rc.SpanID
		entry.RequestID = rc.RequestID
		entry.UserID = rc.UserID
		entry.TenantID = rc.TenantID
		entry.Operation = rc.OperationName
		if !rc.StartTime.IsZero() {
			entry.Duration = rc.Duration().Milliseconds()
		}
	}

	// Add location
	if l.includeLocation && level >= LevelWarn {
		file, line, fn := getCallerInfo(4)
		entry.File = file
		entry.Line = line
		entry.Function = fn
	}

	// Add persistent fields
	for k, v := range l.fields {
		entry.Fields[k] = v
	}

	// Add call fields
	for _, f := range fields {
		if f.Key != "" {
			entry.Fields[f.Key] = f.Value
		}
	}

	// Add error info
	if err != nil {
		entry.Error = errorToLogEntry(err)
	}

	// Remove empty fields map
	if len(entry.Fields) == 0 {
		entry.Fields = nil
	}

	return entry
}

// errorToLogEntry converts an error to ErrorLogEntry
func errorToLogEntry(err error) *ErrorLogEntry {
	if err == nil {
		return nil
	}

	logEntry := &ErrorLogEntry{
		Message: err.Error(),
	}

	if appErr := GetAppError(err); appErr != nil {
		logEntry.Code = string(appErr.Code)
		logEntry.Domain = string(appErr.Domain)
		logEntry.Category = string(appErr.Category)
		logEntry.Details = appErr.Details
		if appErr.Stack != "" {
			logEntry.Stack = appErr.Stack
		}
		if appErr.Cause != nil {
			logEntry.Cause = appErr.Cause.Error()
		}
	}

	return logEntry
}

// ============================================================================
// GLOBAL LOGGER
// ============================================================================

var (
	globalLogger     Logger
	globalLoggerOnce sync.Once
)

// SetGlobalLogger sets the global logger instance
func SetGlobalLogger(logger Logger) {
	globalLogger = logger
}

// GetGlobalLogger returns the global logger instance
func GetGlobalLogger() Logger {
	globalLoggerOnce.Do(func() {
		if globalLogger == nil {
			globalLogger = NewJSONLogger(nil)
		}
	})
	return globalLogger
}

// Package-level logging functions
func LogDebug(ctx context.Context, msg string, fields ...Field) {
	GetGlobalLogger().Debug(ctx, msg, fields...)
}

func LogInfo(ctx context.Context, msg string, fields ...Field) {
	GetGlobalLogger().Info(ctx, msg, fields...)
}

func LogWarn(ctx context.Context, msg string, fields ...Field) {
	GetGlobalLogger().Warn(ctx, msg, fields...)
}

func LogError(ctx context.Context, msg string, err error, fields ...Field) {
	GetGlobalLogger().Error(ctx, msg, err, fields...)
}

func LogFatal(ctx context.Context, msg string, err error, fields ...Field) {
	GetGlobalLogger().Fatal(ctx, msg, err, fields...)
}

// ============================================================================
// ERROR LOGGING HELPERS
// ============================================================================

// LogAppError logs an AppError with full context
func LogAppError(ctx context.Context, appErr *AppError, fields ...Field) {
	if appErr == nil {
		return
	}

	allFields := append(fields,
		Str("error_code", string(appErr.Code)),
		Str("error_domain", string(appErr.Domain)),
		Str("error_category", string(appErr.Category)),
		Bool("retryable", appErr.Retryable),
	)

	if appErr.HTTPStatus != 0 {
		allFields = append(allFields, Int("http_status", appErr.HTTPStatus))
	}

	GetGlobalLogger().Error(ctx, appErr.Message, appErr, allFields...)
}

// LogOperationStart logs the start of an operation
func LogOperationStart(ctx context.Context, operation string, fields ...Field) {
	allFields := append(fields, Str("operation", operation))
	LogInfo(ctx, "operation started", allFields...)
}

// LogOperationEnd logs the end of an operation
func LogOperationEnd(ctx context.Context, operation string, startTime time.Time, err error, fields ...Field) {
	duration := time.Since(startTime)
	allFields := append(fields,
		Str("operation", operation),
		Dur("duration_ms", duration),
		Bool("success", err == nil),
	)

	if err != nil {
		LogError(ctx, "operation failed", err, allFields...)
	} else {
		LogInfo(ctx, "operation completed", allFields...)
	}
}

// LogHTTPRequest logs an HTTP request
func LogHTTPRequest(ctx context.Context, method, path string, statusCode int, duration time.Duration, err error) {
	fields := []Field{
		Str("method", method),
		Str("path", path),
		Int("status", statusCode),
		Dur("duration_ms", duration),
	}

	if err != nil {
		LogError(ctx, "http request failed", err, fields...)
	} else if statusCode >= 500 {
		LogError(ctx, "http request error", nil, fields...)
	} else if statusCode >= 400 {
		LogWarn(ctx, "http request warning", fields...)
	} else {
		LogInfo(ctx, "http request completed", fields...)
	}
}

// LogDatabaseQuery logs a database query
func LogDatabaseQuery(ctx context.Context, query string, duration time.Duration, err error) {
	// Truncate query for logging
	if len(query) > 200 {
		query = query[:200] + "..."
	}

	fields := []Field{
		Str("query", query),
		Dur("duration_ms", duration),
	}

	if err != nil {
		LogError(ctx, "database query failed", err, fields...)
	} else if duration > 1*time.Second {
		LogWarn(ctx, "slow database query", fields...)
	} else {
		LogDebug(ctx, "database query executed", fields...)
	}
}

// LogExternalCall logs an external service call
func LogExternalCall(ctx context.Context, service, operation string, duration time.Duration, err error) {
	fields := []Field{
		Str("external_service", service),
		Str("operation", operation),
		Dur("duration_ms", duration),
	}

	if err != nil {
		LogError(ctx, "external call failed", err, fields...)
	} else {
		LogInfo(ctx, "external call completed", fields...)
	}
}

// ============================================================================
// LOG WRITER FOR HTTP RESPONSE
// ============================================================================

// ResponseLogWriter wraps http.ResponseWriter to capture status code
type ResponseLogWriter struct {
	http.ResponseWriter
	StatusCode   int
	BytesWritten int
}

// NewResponseLogWriter creates a new response log writer
func NewResponseLogWriter(w http.ResponseWriter) *ResponseLogWriter {
	return &ResponseLogWriter{
		ResponseWriter: w,
		StatusCode:     http.StatusOK,
	}
}

// WriteHeader captures the status code
func (w *ResponseLogWriter) WriteHeader(code int) {
	w.StatusCode = code
	w.ResponseWriter.WriteHeader(code)
}

// Write captures bytes written
func (w *ResponseLogWriter) Write(b []byte) (int, error) {
	n, err := w.ResponseWriter.Write(b)
	w.BytesWritten += n
	return n, err
}

// ============================================================================
// CALLER INFO
// ============================================================================

// getLogCallerInfo gets caller information for logging
func getLogCallerInfo(skip int) (file string, line int, function string) {
	pc, file, line, ok := runtime.Caller(skip)
	if !ok {
		return "unknown", 0, "unknown"
	}

	fn := runtime.FuncForPC(pc)
	if fn != nil {
		function = shortenFunction(fn.Name())
	}

	file = shortenPath(file)
	return
}

// ============================================================================
// DEVELOPMENT LOGGER (PRETTY PRINT)
// ============================================================================

// DevLogger is a development-friendly logger with colored output
type DevLogger struct {
	*JSONLogger
	colorEnabled bool
}

// NewDevLogger creates a development logger
func NewDevLogger() *DevLogger {
	return &DevLogger{
		JSONLogger:   NewJSONLogger(DefaultLoggerConfig()),
		colorEnabled: true,
	}
}

// log overrides JSONLogger to provide pretty output
func (l *DevLogger) log(ctx context.Context, level LogLevel, msg string, err error, fields []Field) {
	if level < l.level {
		return
	}

	timestamp := time.Now().Format("15:04:05.000")
	levelStr := l.colorLevel(level)

	// Build output
	output := fmt.Sprintf("%s %s %s", timestamp, levelStr, msg)

	// Add fields
	if len(fields) > 0 {
		output += " |"
		for _, f := range fields {
			output += fmt.Sprintf(" %s=%v", f.Key, f.Value)
		}
	}

	// Add error
	if err != nil {
		output += fmt.Sprintf(" | error=%s", err.Error())
	}

	// Add context
	if ctx != nil {
		if traceID := TraceID(ctx); traceID != "" {
			output += fmt.Sprintf(" | trace=%s", traceID[:8])
		}
	}

	l.mu.Lock()
	fmt.Fprintln(l.output, output)
	l.mu.Unlock()
}

// colorLevel returns colored level string
func (l *DevLogger) colorLevel(level LogLevel) string {
	if !l.colorEnabled {
		return fmt.Sprintf("[%s]", level.String())
	}

	switch level {
	case LevelDebug:
		return "\033[36m[DEBUG]\033[0m" // Cyan
	case LevelInfo:
		return "\033[32m[INFO]\033[0m" // Green
	case LevelWarn:
		return "\033[33m[WARN]\033[0m" // Yellow
	case LevelError:
		return "\033[31m[ERROR]\033[0m" // Red
	case LevelFatal:
		return "\033[35m[FATAL]\033[0m" // Magenta
	default:
		return fmt.Sprintf("[%s]", level.String())
	}
}
