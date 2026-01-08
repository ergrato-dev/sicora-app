package errors

import (
	"context"
	"fmt"
	"path/filepath"
	"runtime"
	"strings"
)

// ============================================================================
// CONTEXT KEYS FOR ERROR TRACKING
// ============================================================================

type contextKey string

const (
	// RequestIDKey is the context key for request ID
	RequestIDKey contextKey = "request_id"
	// UserIDKey is the context key for user ID
	UserIDKey contextKey = "user_id"
	// OperationKey is the context key for current operation
	OperationKey contextKey = "operation"
	// ServiceKey is the context key for service name
	ServiceKey contextKey = "service"
)

// ============================================================================
// OPERATION CONTEXT
// ============================================================================

// OperationContext holds information about the current operation
type OperationContext struct {
	Service    string                 // Service name (e.g., "userservice")
	Layer      string                 // Layer (e.g., "handler", "usecase", "repository")
	Operation  string                 // Operation name (e.g., "CreateUser")
	Method     string                 // HTTP method or gRPC method
	Path       string                 // Request path
	RequestID  string                 // Request ID for tracing
	UserID     string                 // User ID if authenticated
	Metadata   map[string]interface{} // Additional metadata
	StackTrace string                 // Stack trace at error point
}

// NewOperationContext creates a new operation context
func NewOperationContext(service, layer, operation string) *OperationContext {
	return &OperationContext{
		Service:   service,
		Layer:     layer,
		Operation: operation,
		Metadata:  make(map[string]interface{}),
	}
}

// WithMethod sets the HTTP/gRPC method
func (oc *OperationContext) WithMethod(method string) *OperationContext {
	oc.Method = method
	return oc
}

// WithPath sets the request path
func (oc *OperationContext) WithPath(path string) *OperationContext {
	oc.Path = path
	return oc
}

// WithRequestID sets the request ID
func (oc *OperationContext) WithRequestID(requestID string) *OperationContext {
	oc.RequestID = requestID
	return oc
}

// WithUserID sets the user ID
func (oc *OperationContext) WithUserID(userID string) *OperationContext {
	oc.UserID = userID
	return oc
}

// WithMetadata adds metadata to the context
func (oc *OperationContext) WithMetadata(key string, value interface{}) *OperationContext {
	oc.Metadata[key] = value
	return oc
}

// CaptureStack captures the current stack trace
func (oc *OperationContext) CaptureStack() *OperationContext {
	oc.StackTrace = CaptureStackTrace(3)
	return oc
}

// ============================================================================
// CONTEXT-AWARE ERROR WRAPPING
// ============================================================================

// WrapWithContext wraps an error with operation context
func WrapWithContext(ctx context.Context, err error, operation string) *AppError {
	if err == nil {
		return nil
	}

	appErr := FromStdError(err)

	// Extract context values
	if requestID, ok := ctx.Value(RequestIDKey).(string); ok && requestID != "" {
		appErr.RequestID = requestID
	}

	// Add operation to details
	appErr.WithDetail("operation", operation)

	// Extract and add user ID if present
	if userID, ok := ctx.Value(UserIDKey).(string); ok && userID != "" {
		appErr.WithDetail("user_id", userID)
	}

	// Add context location
	file, line, fn := getCallerInfo(2)
	appErr.WithDetails(map[string]interface{}{
		"_file":     file,
		"_line":     line,
		"_function": fn,
	})

	return appErr
}

// WrapWithOp wraps an error with operation context struct
func WrapWithOp(err error, opCtx *OperationContext) *AppError {
	if err == nil {
		return nil
	}

	appErr := FromStdError(err)
	appErr.RequestID = opCtx.RequestID

	// Add all operation context as details
	details := map[string]interface{}{
		"_service":   opCtx.Service,
		"_layer":     opCtx.Layer,
		"_operation": opCtx.Operation,
	}

	if opCtx.Method != "" {
		details["_method"] = opCtx.Method
	}
	if opCtx.Path != "" {
		details["_path"] = opCtx.Path
	}
	if opCtx.UserID != "" {
		details["_user_id"] = opCtx.UserID
	}

	// Merge metadata
	for k, v := range opCtx.Metadata {
		details[k] = v
	}

	appErr.WithDetails(details)

	// Add stack trace if captured
	if opCtx.StackTrace != "" {
		appErr.Stack = opCtx.StackTrace
	}

	return appErr
}

// ============================================================================
// LAYER-SPECIFIC WRAPPING
// ============================================================================

// WrapHandler wraps an error at the handler layer
func WrapHandler(err error, service, handler string) *AppError {
	return wrapAtLayer(err, service, "handler", handler)
}

// WrapUseCase wraps an error at the use case layer
func WrapUseCase(err error, service, useCase string) *AppError {
	return wrapAtLayer(err, service, "usecase", useCase)
}

// WrapRepository wraps an error at the repository layer
func WrapRepository(err error, service, repository string) *AppError {
	return wrapAtLayer(err, service, "repository", repository)
}

// WrapService wraps an error at the service layer (external calls)
func WrapService(err error, service, operation string) *AppError {
	return wrapAtLayer(err, service, "service", operation)
}

// wrapAtLayer is the internal implementation for layer wrapping
func wrapAtLayer(err error, service, layer, operation string) *AppError {
	if err == nil {
		return nil
	}

	appErr := FromStdError(err)

	// Get caller info for the actual location
	file, line, fn := getCallerInfo(3)

	appErr.WithDetails(map[string]interface{}{
		"_service":   service,
		"_layer":     layer,
		"_operation": operation,
		"_file":      file,
		"_line":      line,
		"_function":  fn,
	})

	// Update message with context
	appErr.Message = fmt.Sprintf("[%s.%s.%s] %s", service, layer, operation, appErr.Message)

	return appErr
}

// ============================================================================
// STACK TRACE UTILITIES
// ============================================================================

// StackFrame represents a single frame in a stack trace
type StackFrame struct {
	File     string `json:"file"`
	Line     int    `json:"line"`
	Function string `json:"function"`
}

// CaptureStackTrace captures a formatted stack trace
func CaptureStackTrace(skip int) string {
	frames := CaptureStackFrames(skip + 1)
	var sb strings.Builder
	for _, frame := range frames {
		sb.WriteString(fmt.Sprintf("%s:%d %s\n", frame.File, frame.Line, frame.Function))
	}
	return sb.String()
}

// CaptureStackFrames captures stack frames as structured data
func CaptureStackFrames(skip int) []StackFrame {
	var frames []StackFrame
	pcs := make([]uintptr, 32)
	n := runtime.Callers(skip+1, pcs)

	callFrames := runtime.CallersFrames(pcs[:n])
	for {
		frame, more := callFrames.Next()

		// Skip runtime and standard library frames
		if strings.Contains(frame.File, "runtime/") {
			if !more {
				break
			}
			continue
		}

		frames = append(frames, StackFrame{
			File:     shortenPath(frame.File),
			Line:     frame.Line,
			Function: shortenFunction(frame.Function),
		})

		if !more || len(frames) >= 10 {
			break
		}
	}
	return frames
}

// getCallerInfo returns file, line, and function name of the caller
func getCallerInfo(skip int) (file string, line int, function string) {
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

// shortenPath shortens a file path to just the package and file
func shortenPath(path string) string {
	// Get just the last two path components
	parts := strings.Split(filepath.ToSlash(path), "/")
	if len(parts) >= 2 {
		return strings.Join(parts[len(parts)-2:], "/")
	}
	return path
}

// shortenFunction shortens a function name to just package.function
func shortenFunction(name string) string {
	// Remove the full package path, keep just package.function
	if idx := strings.LastIndex(name, "/"); idx >= 0 {
		name = name[idx+1:]
	}
	return name
}

// ============================================================================
// CONTEXT PROPAGATION HELPERS
// ============================================================================

// ContextWithRequestID adds a request ID to the context
func ContextWithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, RequestIDKey, requestID)
}

// ContextWithUserID adds a user ID to the context
func ContextWithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, UserIDKey, userID)
}

// ContextWithOperation adds an operation name to the context
func ContextWithOperation(ctx context.Context, operation string) context.Context {
	return context.WithValue(ctx, OperationKey, operation)
}

// ContextWithService adds a service name to the context
func ContextWithService(ctx context.Context, service string) context.Context {
	return context.WithValue(ctx, ServiceKey, service)
}

// GetRequestID extracts the request ID from context
func GetRequestID(ctx context.Context) string {
	if requestID, ok := ctx.Value(RequestIDKey).(string); ok {
		return requestID
	}
	return ""
}

// GetUserID extracts the user ID from context
func GetUserID(ctx context.Context) string {
	if userID, ok := ctx.Value(UserIDKey).(string); ok {
		return userID
	}
	return ""
}

// GetOperation extracts the operation name from context
func GetOperation(ctx context.Context) string {
	if operation, ok := ctx.Value(OperationKey).(string); ok {
		return operation
	}
	return ""
}

// GetServiceName extracts the service name from context
func GetServiceName(ctx context.Context) string {
	if service, ok := ctx.Value(ServiceKey).(string); ok {
		return service
	}
	return ""
}

// ============================================================================
// ERROR ENRICHMENT FROM CONTEXT
// ============================================================================

// EnrichFromContext enriches an AppError with context values
func EnrichFromContext(ctx context.Context, err *AppError) *AppError {
	if err == nil || ctx == nil {
		return err
	}

	if requestID := GetRequestID(ctx); requestID != "" {
		err.RequestID = requestID
	}

	if userID := GetUserID(ctx); userID != "" {
		err.WithDetail("user_id", userID)
	}

	if operation := GetOperation(ctx); operation != "" {
		err.WithDetail("operation", operation)
	}

	if service := GetServiceName(ctx); service != "" {
		err.WithDetail("service", service)
	}

	return err
}
