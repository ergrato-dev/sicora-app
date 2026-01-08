package errors

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

// ============================================================================
// CONTEXT KEYS
// ============================================================================

type ctxKey string

const (
	// Tracing keys
	ctxKeyTraceID      ctxKey = "trace_id"
	ctxKeySpanID       ctxKey = "span_id"
	ctxKeyParentSpanID ctxKey = "parent_span_id"

	// Request keys
	ctxKeyRequestID     ctxKey = "request_id"
	ctxKeyCorrelationID ctxKey = "correlation_id"

	// User keys
	ctxKeyUserID    ctxKey = "user_id"
	ctxKeyUserEmail ctxKey = "user_email"
	ctxKeyUserRole  ctxKey = "user_role"
	ctxKeyTenantID  ctxKey = "tenant_id"

	// Service keys
	ctxKeyServiceName    ctxKey = "service_name"
	ctxKeyServiceVersion ctxKey = "service_version"
	ctxKeyEnvironment    ctxKey = "environment"

	// Operation keys
	ctxKeyOperationName  ctxKey = "operation_name"
	ctxKeyOperationStart ctxKey = "operation_start"

	// Metadata key for arbitrary data
	ctxKeyMetadata ctxKey = "metadata"
)

// HTTP Header names for context propagation
const (
	HeaderTraceID       = "X-Trace-ID"
	HeaderSpanID        = "X-Span-ID"
	HeaderParentSpanID  = "X-Parent-Span-ID"
	HeaderRequestID     = "X-Request-ID"
	HeaderCorrelationID = "X-Correlation-ID"
	HeaderUserID        = "X-User-ID"
	HeaderTenantID      = "X-Tenant-ID"
	HeaderServiceName   = "X-Service-Name"
)

// ============================================================================
// REQUEST CONTEXT
// ============================================================================

// RequestContext holds all context information for a request
type RequestContext struct {
	// Tracing
	TraceID      string `json:"trace_id,omitempty"`
	SpanID       string `json:"span_id,omitempty"`
	ParentSpanID string `json:"parent_span_id,omitempty"`

	// Request identification
	RequestID     string `json:"request_id,omitempty"`
	CorrelationID string `json:"correlation_id,omitempty"`

	// User information
	UserID    string `json:"user_id,omitempty"`
	UserEmail string `json:"user_email,omitempty"`
	UserRole  string `json:"user_role,omitempty"`
	TenantID  string `json:"tenant_id,omitempty"`

	// Service information
	ServiceName    string `json:"service_name,omitempty"`
	ServiceVersion string `json:"service_version,omitempty"`
	Environment    string `json:"environment,omitempty"`

	// Operation
	OperationName string    `json:"operation_name,omitempty"`
	StartTime     time.Time `json:"start_time,omitempty"`

	// Custom metadata
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// NewRequestContext creates a new request context with generated IDs
func NewRequestContext() *RequestContext {
	now := time.Now()
	return &RequestContext{
		TraceID:   generateID(),
		SpanID:    generateID(),
		RequestID: generateID(),
		StartTime: now,
		Metadata:  make(map[string]interface{}),
	}
}

// generateID generates a short unique ID
func generateID() string {
	id := uuid.New().String()
	return strings.ReplaceAll(id, "-", "")[:16]
}

// NewSpan creates a child span from this context
func (rc *RequestContext) NewSpan(operationName string) *RequestContext {
	return &RequestContext{
		TraceID:        rc.TraceID,
		SpanID:         generateID(),
		ParentSpanID:   rc.SpanID,
		RequestID:      rc.RequestID,
		CorrelationID:  rc.CorrelationID,
		UserID:         rc.UserID,
		UserEmail:      rc.UserEmail,
		UserRole:       rc.UserRole,
		TenantID:       rc.TenantID,
		ServiceName:    rc.ServiceName,
		ServiceVersion: rc.ServiceVersion,
		Environment:    rc.Environment,
		OperationName:  operationName,
		StartTime:      time.Now(),
		Metadata:       copyMetadata(rc.Metadata),
	}
}

// Duration returns the duration since the operation started
func (rc *RequestContext) Duration() time.Duration {
	if rc.StartTime.IsZero() {
		return 0
	}
	return time.Since(rc.StartTime)
}

// WithMetadata adds metadata to the context
func (rc *RequestContext) WithMetadata(key string, value interface{}) *RequestContext {
	if rc.Metadata == nil {
		rc.Metadata = make(map[string]interface{})
	}
	rc.Metadata[key] = value
	return rc
}

// ToMap converts the context to a map for logging
func (rc *RequestContext) ToMap() map[string]interface{} {
	m := make(map[string]interface{})
	if rc.TraceID != "" {
		m["trace_id"] = rc.TraceID
	}
	if rc.SpanID != "" {
		m["span_id"] = rc.SpanID
	}
	if rc.ParentSpanID != "" {
		m["parent_span_id"] = rc.ParentSpanID
	}
	if rc.RequestID != "" {
		m["request_id"] = rc.RequestID
	}
	if rc.CorrelationID != "" {
		m["correlation_id"] = rc.CorrelationID
	}
	if rc.UserID != "" {
		m["user_id"] = rc.UserID
	}
	if rc.TenantID != "" {
		m["tenant_id"] = rc.TenantID
	}
	if rc.ServiceName != "" {
		m["service"] = rc.ServiceName
	}
	if rc.OperationName != "" {
		m["operation"] = rc.OperationName
	}
	if !rc.StartTime.IsZero() {
		m["duration_ms"] = rc.Duration().Milliseconds()
	}
	return m
}

// copyMetadata creates a copy of the metadata map
func copyMetadata(m map[string]interface{}) map[string]interface{} {
	if m == nil {
		return make(map[string]interface{})
	}
	copy := make(map[string]interface{}, len(m))
	for k, v := range m {
		copy[k] = v
	}
	return copy
}

// ============================================================================
// CONTEXT INJECTION/EXTRACTION
// ============================================================================

// InjectContext injects a RequestContext into a Go context
func InjectContext(ctx context.Context, rc *RequestContext) context.Context {
	if rc == nil {
		return ctx
	}
	if rc.TraceID != "" {
		ctx = context.WithValue(ctx, ctxKeyTraceID, rc.TraceID)
	}
	if rc.SpanID != "" {
		ctx = context.WithValue(ctx, ctxKeySpanID, rc.SpanID)
	}
	if rc.ParentSpanID != "" {
		ctx = context.WithValue(ctx, ctxKeyParentSpanID, rc.ParentSpanID)
	}
	if rc.RequestID != "" {
		ctx = context.WithValue(ctx, ctxKeyRequestID, rc.RequestID)
	}
	if rc.CorrelationID != "" {
		ctx = context.WithValue(ctx, ctxKeyCorrelationID, rc.CorrelationID)
	}
	if rc.UserID != "" {
		ctx = context.WithValue(ctx, ctxKeyUserID, rc.UserID)
	}
	if rc.UserEmail != "" {
		ctx = context.WithValue(ctx, ctxKeyUserEmail, rc.UserEmail)
	}
	if rc.UserRole != "" {
		ctx = context.WithValue(ctx, ctxKeyUserRole, rc.UserRole)
	}
	if rc.TenantID != "" {
		ctx = context.WithValue(ctx, ctxKeyTenantID, rc.TenantID)
	}
	if rc.ServiceName != "" {
		ctx = context.WithValue(ctx, ctxKeyServiceName, rc.ServiceName)
	}
	if rc.OperationName != "" {
		ctx = context.WithValue(ctx, ctxKeyOperationName, rc.OperationName)
	}
	if !rc.StartTime.IsZero() {
		ctx = context.WithValue(ctx, ctxKeyOperationStart, rc.StartTime)
	}
	if len(rc.Metadata) > 0 {
		ctx = context.WithValue(ctx, ctxKeyMetadata, rc.Metadata)
	}
	return ctx
}

// ExtractContext extracts a RequestContext from a Go context
func ExtractContext(ctx context.Context) *RequestContext {
	rc := &RequestContext{
		Metadata: make(map[string]interface{}),
	}

	if v, ok := ctx.Value(ctxKeyTraceID).(string); ok {
		rc.TraceID = v
	}
	if v, ok := ctx.Value(ctxKeySpanID).(string); ok {
		rc.SpanID = v
	}
	if v, ok := ctx.Value(ctxKeyParentSpanID).(string); ok {
		rc.ParentSpanID = v
	}
	if v, ok := ctx.Value(ctxKeyRequestID).(string); ok {
		rc.RequestID = v
	}
	if v, ok := ctx.Value(ctxKeyCorrelationID).(string); ok {
		rc.CorrelationID = v
	}
	if v, ok := ctx.Value(ctxKeyUserID).(string); ok {
		rc.UserID = v
	}
	if v, ok := ctx.Value(ctxKeyUserEmail).(string); ok {
		rc.UserEmail = v
	}
	if v, ok := ctx.Value(ctxKeyUserRole).(string); ok {
		rc.UserRole = v
	}
	if v, ok := ctx.Value(ctxKeyTenantID).(string); ok {
		rc.TenantID = v
	}
	if v, ok := ctx.Value(ctxKeyServiceName).(string); ok {
		rc.ServiceName = v
	}
	if v, ok := ctx.Value(ctxKeyOperationName).(string); ok {
		rc.OperationName = v
	}
	if v, ok := ctx.Value(ctxKeyOperationStart).(time.Time); ok {
		rc.StartTime = v
	}
	if v, ok := ctx.Value(ctxKeyMetadata).(map[string]interface{}); ok {
		rc.Metadata = v
	}

	return rc
}

// ============================================================================
// HTTP PROPAGATION
// ============================================================================

// InjectHTTPHeaders injects context into HTTP headers for outgoing requests
func InjectHTTPHeaders(ctx context.Context, headers http.Header) {
	rc := ExtractContext(ctx)
	if rc.TraceID != "" {
		headers.Set(HeaderTraceID, rc.TraceID)
	}
	if rc.SpanID != "" {
		headers.Set(HeaderSpanID, rc.SpanID)
	}
	if rc.ParentSpanID != "" {
		headers.Set(HeaderParentSpanID, rc.ParentSpanID)
	}
	if rc.RequestID != "" {
		headers.Set(HeaderRequestID, rc.RequestID)
	}
	if rc.CorrelationID != "" {
		headers.Set(HeaderCorrelationID, rc.CorrelationID)
	}
	if rc.UserID != "" {
		headers.Set(HeaderUserID, rc.UserID)
	}
	if rc.TenantID != "" {
		headers.Set(HeaderTenantID, rc.TenantID)
	}
	if rc.ServiceName != "" {
		headers.Set(HeaderServiceName, rc.ServiceName)
	}
}

// ExtractHTTPHeaders extracts context from incoming HTTP headers
func ExtractHTTPHeaders(headers http.Header) *RequestContext {
	rc := NewRequestContext()

	if v := headers.Get(HeaderTraceID); v != "" {
		rc.TraceID = v
	}
	if v := headers.Get(HeaderSpanID); v != "" {
		rc.ParentSpanID = v // Incoming span becomes parent
	}
	if v := headers.Get(HeaderRequestID); v != "" {
		rc.RequestID = v
	}
	if v := headers.Get(HeaderCorrelationID); v != "" {
		rc.CorrelationID = v
	}
	if v := headers.Get(HeaderUserID); v != "" {
		rc.UserID = v
	}
	if v := headers.Get(HeaderTenantID); v != "" {
		rc.TenantID = v
	}

	return rc
}

// PropagateToRequest adds context headers to an outgoing HTTP request
func PropagateToRequest(ctx context.Context, req *http.Request) *http.Request {
	InjectHTTPHeaders(ctx, req.Header)
	return req
}

// ============================================================================
// CONTEXT BUILDERS
// ============================================================================

// ContextBuilder provides fluent API for building context
type ContextBuilder struct {
	ctx context.Context
	rc  *RequestContext
}

// NewContextBuilder creates a new context builder
func NewContextBuilder(ctx context.Context) *ContextBuilder {
	return &ContextBuilder{
		ctx: ctx,
		rc:  NewRequestContext(),
	}
}

// WithTraceID sets the trace ID
func (cb *ContextBuilder) WithTraceID(traceID string) *ContextBuilder {
	cb.rc.TraceID = traceID
	return cb
}

// WithRequestID sets the request ID
func (cb *ContextBuilder) WithRequestID(requestID string) *ContextBuilder {
	cb.rc.RequestID = requestID
	return cb
}

// WithCorrelationID sets the correlation ID
func (cb *ContextBuilder) WithCorrelationID(correlationID string) *ContextBuilder {
	cb.rc.CorrelationID = correlationID
	return cb
}

// WithUser sets user information
func (cb *ContextBuilder) WithUser(userID, email, role string) *ContextBuilder {
	cb.rc.UserID = userID
	cb.rc.UserEmail = email
	cb.rc.UserRole = role
	return cb
}

// WithTenant sets the tenant ID
func (cb *ContextBuilder) WithTenant(tenantID string) *ContextBuilder {
	cb.rc.TenantID = tenantID
	return cb
}

// WithService sets service information
func (cb *ContextBuilder) WithService(name, version, env string) *ContextBuilder {
	cb.rc.ServiceName = name
	cb.rc.ServiceVersion = version
	cb.rc.Environment = env
	return cb
}

// WithOperation sets the operation name
func (cb *ContextBuilder) WithOperation(name string) *ContextBuilder {
	cb.rc.OperationName = name
	return cb
}

// WithMetadata adds metadata
func (cb *ContextBuilder) WithMetadata(key string, value interface{}) *ContextBuilder {
	cb.rc.WithMetadata(key, value)
	return cb
}

// WithTimeout adds a timeout to the context
func (cb *ContextBuilder) WithTimeout(timeout time.Duration) *ContextBuilder {
	cb.ctx, _ = context.WithTimeout(cb.ctx, timeout)
	return cb
}

// Build returns the context with all values injected
func (cb *ContextBuilder) Build() context.Context {
	return InjectContext(cb.ctx, cb.rc)
}

// ============================================================================
// SERVICE CONTEXT
// ============================================================================

// ServiceContext holds service-level context configuration
type ServiceContext struct {
	Name        string
	Version     string
	Environment string
}

var (
	globalServiceCtx     *ServiceContext
	globalServiceCtxOnce sync.Once
)

// SetGlobalServiceContext sets the global service context
func SetGlobalServiceContext(name, version, env string) {
	globalServiceCtxOnce.Do(func() {
		globalServiceCtx = &ServiceContext{
			Name:        name,
			Version:     version,
			Environment: env,
		}
	})
}

// GetGlobalServiceContext returns the global service context
func GetGlobalServiceContext() *ServiceContext {
	if globalServiceCtx == nil {
		return &ServiceContext{
			Name:        "unknown",
			Version:     "unknown",
			Environment: "unknown",
		}
	}
	return globalServiceCtx
}

// WithServiceContext adds global service context to a request context
func WithServiceContext(ctx context.Context) context.Context {
	sc := GetGlobalServiceContext()
	ctx = context.WithValue(ctx, ctxKeyServiceName, sc.Name)
	ctx = context.WithValue(ctx, ctxKeyServiceVersion, sc.Version)
	ctx = context.WithValue(ctx, ctxKeyEnvironment, sc.Environment)
	return ctx
}

// ============================================================================
// QUICK CONTEXT HELPERS
// ============================================================================

// TraceID extracts trace ID from context
func TraceID(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeyTraceID).(string); ok {
		return v
	}
	return ""
}

// SpanID extracts span ID from context
func SpanID(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeySpanID).(string); ok {
		return v
	}
	return ""
}

// RequestIDFromContext extracts request ID from context
func RequestIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeyRequestID).(string); ok {
		return v
	}
	return ""
}

// UserIDFromContext extracts user ID from context
func UserIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeyUserID).(string); ok {
		return v
	}
	return ""
}

// TenantIDFromContext extracts tenant ID from context
func TenantIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeyTenantID).(string); ok {
		return v
	}
	return ""
}

// ServiceNameFromContext extracts service name from context
func ServiceNameFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeyServiceName).(string); ok {
		return v
	}
	return ""
}

// OperationFromContext extracts operation name from context
func OperationFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeyOperationName).(string); ok {
		return v
	}
	return ""
}

// ============================================================================
// JSON SERIALIZATION FOR SERVICE-TO-SERVICE
// ============================================================================

// MarshalContext serializes RequestContext to JSON for service-to-service calls
func MarshalContext(rc *RequestContext) ([]byte, error) {
	return json.Marshal(rc)
}

// UnmarshalContext deserializes RequestContext from JSON
func UnmarshalContext(data []byte) (*RequestContext, error) {
	var rc RequestContext
	if err := json.Unmarshal(data, &rc); err != nil {
		return nil, err
	}
	if rc.Metadata == nil {
		rc.Metadata = make(map[string]interface{})
	}
	return &rc, nil
}
