package errors

import (
	"fmt"
	"net/http"
	"runtime"
	"strings"
	"time"
)

// AppError is the base error type for all application errors.
// It implements the error interface and provides rich context.
type AppError struct {
	// Code is the unique error code (e.g., USER_NOT_FOUND_001)
	Code ErrorCode `json:"code"`

	// Domain is the domain/module where the error originated
	Domain ErrorDomain `json:"domain"`

	// Category is the error category (e.g., VALIDATION, NOT_FOUND)
	Category ErrorCategory `json:"category"`

	// Message is the technical message for logging
	Message string `json:"message"`

	// UserMessage is the user-friendly message (Spanish)
	UserMessage string `json:"user_message"`

	// Details contains additional error context
	Details map[string]interface{} `json:"details,omitempty"`

	// HTTPStatus is the corresponding HTTP status code
	HTTPStatus int `json:"-"`

	// Timestamp when the error occurred
	Timestamp time.Time `json:"timestamp"`

	// RequestID for tracing (set by middleware)
	RequestID string `json:"request_id,omitempty"`

	// Cause is the underlying error that caused this error
	Cause error `json:"-"`

	// Stack is the stack trace (only in development)
	Stack string `json:"-"`

	// Retryable indicates if the operation can be retried
	Retryable bool `json:"retryable"`

	// RetryAfter suggests when to retry (seconds)
	RetryAfter int `json:"retry_after,omitempty"`
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// Unwrap returns the underlying error for errors.Is/As support
func (e *AppError) Unwrap() error {
	return e.Cause
}

// WithCause adds an underlying cause to the error
func (e *AppError) WithCause(cause error) *AppError {
	e.Cause = cause
	return e
}

// WithDetails adds additional details to the error
func (e *AppError) WithDetails(details map[string]interface{}) *AppError {
	if e.Details == nil {
		e.Details = make(map[string]interface{})
	}
	for k, v := range details {
		e.Details[k] = v
	}
	return e
}

// WithDetail adds a single detail to the error
func (e *AppError) WithDetail(key string, value interface{}) *AppError {
	if e.Details == nil {
		e.Details = make(map[string]interface{})
	}
	e.Details[key] = value
	return e
}

// WithRequestID sets the request ID for tracing
func (e *AppError) WithRequestID(requestID string) *AppError {
	e.RequestID = requestID
	return e
}

// WithStack captures the current stack trace
func (e *AppError) WithStack() *AppError {
	e.Stack = captureStack(3) // Skip WithStack, newError, and caller
	return e
}

// WithRetryAfter sets retry information
func (e *AppError) WithRetryAfter(seconds int) *AppError {
	e.Retryable = true
	e.RetryAfter = seconds
	return e
}

// GetHTTPStatus returns the HTTP status code for this error
func (e *AppError) GetHTTPStatus() int {
	if e.HTTPStatus != 0 {
		return e.HTTPStatus
	}
	return categoryToHTTPStatus(e.Category)
}

// ToResponse converts the error to an API response format
func (e *AppError) ToResponse() ErrorResponse {
	return ErrorResponse{
		Error: ErrorDetails{
			Code:       e.Code,
			Message:    e.UserMessage,
			Details:    e.Details,
			Timestamp:  e.Timestamp,
			RequestID:  e.RequestID,
			Retryable:  e.Retryable,
			RetryAfter: e.RetryAfter,
		},
	}
}

// ============================================================================
// ERROR RESPONSE TYPES (for API responses)
// ============================================================================

// ErrorResponse is the standardized API error response format
type ErrorResponse struct {
	Error ErrorDetails `json:"error"`
}

// ErrorDetails contains the error information
type ErrorDetails struct {
	Code       ErrorCode              `json:"code"`
	Message    string                 `json:"message"`
	Details    map[string]interface{} `json:"details,omitempty"`
	Errors     []FieldError           `json:"errors,omitempty"`
	Timestamp  time.Time              `json:"timestamp"`
	RequestID  string                 `json:"request_id,omitempty"`
	Path       string                 `json:"path,omitempty"`
	Retryable  bool                   `json:"retryable,omitempty"`
	RetryAfter int                    `json:"retry_after,omitempty"`
}

// FieldError represents a validation error for a specific field
type FieldError struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

// ValidationError is a specialized error for validation failures
type ValidationError struct {
	*AppError
	Fields []FieldError `json:"fields"`
}

// ToResponse converts validation error to API response
func (e *ValidationError) ToResponse() ErrorResponse {
	return ErrorResponse{
		Error: ErrorDetails{
			Code:      e.Code,
			Message:   e.UserMessage,
			Errors:    e.Fields,
			Timestamp: e.Timestamp,
			RequestID: e.RequestID,
		},
	}
}

// ============================================================================
// ERROR CONSTRUCTORS
// ============================================================================

// newError creates a new AppError with the given parameters
func newError(
	code ErrorCode,
	domain ErrorDomain,
	category ErrorCategory,
	message string,
	userMessage string,
	httpStatus int,
	retryable bool,
) *AppError {
	return &AppError{
		Code:        code,
		Domain:      domain,
		Category:    category,
		Message:     message,
		UserMessage: userMessage,
		HTTPStatus:  httpStatus,
		Timestamp:   time.Now().UTC(),
		Retryable:   retryable,
	}
}

// ============================================================================
// AUTHENTICATION ERRORS
// ============================================================================

// NewInvalidCredentialsError creates an error for invalid login credentials
func NewInvalidCredentialsError() *AppError {
	return newError(
		CodeAuthInvalidCredentials,
		DomainAuth,
		CategoryUnauthorized,
		"Invalid credentials provided",
		"Email o contraseña incorrectos",
		http.StatusUnauthorized,
		false,
	)
}

// NewTokenExpiredError creates an error for expired JWT token
func NewTokenExpiredError() *AppError {
	return newError(
		CodeAuthTokenExpired,
		DomainAuth,
		CategoryUnauthorized,
		"JWT token has expired",
		"Tu sesión ha expirado. Por favor inicia sesión nuevamente",
		http.StatusUnauthorized,
		false,
	)
}

// NewTokenInvalidError creates an error for invalid JWT token
func NewTokenInvalidError() *AppError {
	return newError(
		CodeAuthTokenInvalid,
		DomainAuth,
		CategoryUnauthorized,
		"JWT token is invalid or malformed",
		"Sesión inválida. Por favor inicia sesión nuevamente",
		http.StatusUnauthorized,
		false,
	)
}

// NewTokenMissingError creates an error for missing JWT token
func NewTokenMissingError() *AppError {
	return newError(
		CodeAuthTokenMissing,
		DomainAuth,
		CategoryUnauthorized,
		"Authorization token is missing",
		"Debes iniciar sesión para continuar",
		http.StatusUnauthorized,
		false,
	)
}

// NewAccountLockedError creates an error for locked account
func NewAccountLockedError() *AppError {
	return newError(
		CodeAuthAccountLocked,
		DomainAuth,
		CategoryForbidden,
		"User account is locked",
		"Tu cuenta ha sido bloqueada. Contacta al administrador",
		http.StatusForbidden,
		false,
	)
}

// NewInsufficientPermissionsError creates an error for insufficient permissions
func NewInsufficientPermissionsError(requiredRole string) *AppError {
	return newError(
		CodeAuthInsufficientPermissions,
		DomainAuth,
		CategoryForbidden,
		fmt.Sprintf("Insufficient permissions, required role: %s", requiredRole),
		"No tienes permisos para realizar esta acción",
		http.StatusForbidden,
		false,
	).WithDetail("required_role", requiredRole)
}

// ============================================================================
// NOT FOUND ERRORS
// ============================================================================

// NewNotFoundError creates a generic not found error
func NewNotFoundError(domain ErrorDomain, resourceType, identifier string) *AppError {
	code := ErrorCode(fmt.Sprintf("%s_NOT_FOUND_001", domain))
	return newError(
		code,
		domain,
		CategoryNotFound,
		fmt.Sprintf("%s not found: %s", resourceType, identifier),
		"No encontramos lo que buscas",
		http.StatusNotFound,
		false,
	).WithDetails(map[string]interface{}{
		"resource_type": resourceType,
		"identifier":    identifier,
	})
}

// NewUserNotFoundError creates a user not found error
func NewUserNotFoundError(identifier string) *AppError {
	return newError(
		CodeUserNotFound,
		DomainUser,
		CategoryNotFound,
		fmt.Sprintf("User not found: %s", identifier),
		"Usuario no encontrado",
		http.StatusNotFound,
		false,
	).WithDetail("identifier", identifier)
}

// NewScheduleNotFoundError creates a schedule not found error
func NewScheduleNotFoundError(identifier string) *AppError {
	return newError(
		CodeSchedNotFound,
		DomainSchedule,
		CategoryNotFound,
		fmt.Sprintf("Schedule not found: %s", identifier),
		"Horario no encontrado",
		http.StatusNotFound,
		false,
	).WithDetail("identifier", identifier)
}

// NewAttendanceNotFoundError creates an attendance not found error
func NewAttendanceNotFoundError(identifier string) *AppError {
	return newError(
		CodeAttendNotFound,
		DomainAttendance,
		CategoryNotFound,
		fmt.Sprintf("Attendance record not found: %s", identifier),
		"Registro de asistencia no encontrado",
		http.StatusNotFound,
		false,
	).WithDetail("identifier", identifier)
}

// ============================================================================
// CONFLICT ERRORS
// ============================================================================

// NewConflictError creates a generic conflict error
func NewConflictError(domain ErrorDomain, message, userMessage string) *AppError {
	code := ErrorCode(fmt.Sprintf("%s_CONFLICT_001", domain))
	return newError(
		code,
		domain,
		CategoryConflict,
		message,
		userMessage,
		http.StatusConflict,
		false,
	)
}

// NewEmailExistsError creates an email already exists error
func NewEmailExistsError(email string) *AppError {
	return newError(
		CodeUserEmailExists,
		DomainUser,
		CategoryConflict,
		fmt.Sprintf("Email already registered: %s", email),
		"Este email ya está registrado",
		http.StatusConflict,
		false,
	).WithDetail("email", maskEmail(email))
}

// NewScheduleConflictError creates a schedule conflict error
func NewScheduleConflictError(details string) *AppError {
	return newError(
		CodeSchedConflict,
		DomainSchedule,
		CategoryConflict,
		fmt.Sprintf("Schedule conflict: %s", details),
		"Conflicto de horario detectado",
		http.StatusConflict,
		false,
	).WithDetail("conflict_details", details)
}

// NewDuplicateAttendanceError creates a duplicate attendance error
func NewDuplicateAttendanceError(studentID, date string) *AppError {
	return newError(
		CodeAttendDuplicate,
		DomainAttendance,
		CategoryConflict,
		fmt.Sprintf("Attendance already registered for student %s on %s", studentID, date),
		"La asistencia ya fue registrada",
		http.StatusConflict,
		false,
	).WithDetails(map[string]interface{}{
		"student_id": studentID,
		"date":       date,
	})
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

// NewValidationError creates a validation error with multiple field errors
func NewValidationError(fields []FieldError) *ValidationError {
	return &ValidationError{
		AppError: newError(
			CodeValidRequiredField,
			DomainValidation,
			CategoryValidation,
			"Validation failed",
			"Por favor verifica los datos ingresados",
			http.StatusBadRequest,
			false,
		),
		Fields: fields,
	}
}

// NewRequiredFieldError creates a required field error
func NewRequiredFieldError(fieldName string) *AppError {
	return newError(
		CodeValidRequiredField,
		DomainValidation,
		CategoryValidation,
		fmt.Sprintf("Required field missing: %s", fieldName),
		fmt.Sprintf("El campo %s es obligatorio", fieldName),
		http.StatusBadRequest,
		false,
	).WithDetail("field", fieldName)
}

// NewInvalidEmailError creates an invalid email format error
func NewInvalidEmailError(email string) *AppError {
	return newError(
		CodeValidEmailFormat,
		DomainValidation,
		CategoryValidation,
		fmt.Sprintf("Invalid email format: %s", email),
		"El formato del email no es válido",
		http.StatusBadRequest,
		false,
	).WithDetail("field", "email")
}

// NewWeakPasswordError creates a weak password error
func NewWeakPasswordError() *AppError {
	return newError(
		CodeValidPasswordWeak,
		DomainValidation,
		CategoryValidation,
		"Password does not meet requirements",
		"La contraseña no cumple con los requisitos de seguridad",
		http.StatusBadRequest,
		false,
	).WithDetails(map[string]interface{}{
		"field": "password",
		"requirements": []string{
			"Mínimo 8 caracteres",
			"Al menos una mayúscula",
			"Al menos una minúscula",
			"Al menos un número",
			"Al menos un carácter especial",
		},
	})
}

// NewInvalidUUIDError creates an invalid UUID format error
func NewInvalidUUIDError(fieldName, value string) *AppError {
	return newError(
		CodeValidUUIDFormat,
		DomainValidation,
		CategoryValidation,
		fmt.Sprintf("Invalid UUID format for %s: %s", fieldName, value),
		"Identificador inválido",
		http.StatusBadRequest,
		false,
	).WithDetail("field", fieldName)
}

// NewInvalidJSONError creates an invalid JSON format error
func NewInvalidJSONError(details string) *AppError {
	return newError(
		CodeValidJSONFormat,
		DomainValidation,
		CategoryValidation,
		fmt.Sprintf("Invalid JSON: %s", details),
		"Formato de datos inválido",
		http.StatusBadRequest,
		false,
	)
}

// ============================================================================
// DATABASE ERRORS
// ============================================================================

// NewDatabaseError creates a generic database error
func NewDatabaseError(operation string, cause error) *AppError {
	return newError(
		CodeDBQuery,
		DomainDB,
		CategoryInternal,
		fmt.Sprintf("Database error during %s", operation),
		"Error al procesar la solicitud. Intenta nuevamente",
		http.StatusInternalServerError,
		true,
	).WithCause(cause).WithDetail("operation", operation)
}

// NewDatabaseConnectionError creates a database connection error
func NewDatabaseConnectionError(cause error) *AppError {
	return newError(
		CodeDBConnection,
		DomainDB,
		CategoryUnavailable,
		"Failed to connect to database",
		"El servicio no está disponible temporalmente. Intenta en unos minutos",
		http.StatusServiceUnavailable,
		true,
	).WithCause(cause).WithRetryAfter(30)
}

// NewDatabaseTimeoutError creates a database timeout error
func NewDatabaseTimeoutError(operation string) *AppError {
	return newError(
		CodeDBTimeout,
		DomainDB,
		CategoryTimeout,
		fmt.Sprintf("Database timeout during %s", operation),
		"La operación tardó demasiado. Intenta nuevamente",
		http.StatusGatewayTimeout,
		true,
	).WithDetail("operation", operation).WithRetryAfter(5)
}

// NewDeadlockError creates a deadlock error
func NewDeadlockError(cause error) *AppError {
	return newError(
		CodeDBDeadlock,
		DomainDB,
		CategoryConflict,
		"Database deadlock detected",
		"Conflicto temporal. Intenta nuevamente",
		http.StatusConflict,
		true,
	).WithCause(cause).WithRetryAfter(1)
}

// NewUniqueConstraintError creates a unique constraint violation error
func NewUniqueConstraintError(field string, cause error) *AppError {
	return newError(
		CodeDBUnique,
		DomainDB,
		CategoryConflict,
		fmt.Sprintf("Unique constraint violation on %s", field),
		"Este valor ya existe y debe ser único",
		http.StatusConflict,
		false,
	).WithCause(cause).WithDetail("field", field)
}

// NewForeignKeyError creates a foreign key constraint error
func NewForeignKeyError(field, reference string, cause error) *AppError {
	return newError(
		CodeDBForeignKey,
		DomainDB,
		CategoryUnprocessable,
		fmt.Sprintf("Foreign key violation: %s references %s", field, reference),
		"El recurso referenciado no existe",
		http.StatusUnprocessableEntity,
		false,
	).WithCause(cause).WithDetails(map[string]interface{}{
		"field":     field,
		"reference": reference,
	})
}

// ============================================================================
// CACHE ERRORS
// ============================================================================

// NewCacheConnectionError creates a cache connection error
func NewCacheConnectionError(cause error) *AppError {
	return newError(
		CodeCacheConnection,
		DomainCache,
		CategoryUnavailable,
		"Failed to connect to cache",
		"Error temporal del servicio",
		http.StatusServiceUnavailable,
		true,
	).WithCause(cause).WithRetryAfter(5)
}

// NewCacheTimeoutError creates a cache timeout error
func NewCacheTimeoutError(operation string) *AppError {
	return newError(
		CodeCacheTimeout,
		DomainCache,
		CategoryTimeout,
		fmt.Sprintf("Cache timeout during %s", operation),
		"Error temporal del servicio",
		http.StatusGatewayTimeout,
		true,
	).WithDetail("operation", operation).WithRetryAfter(2)
}

// ============================================================================
// BUSINESS LOGIC ERRORS
// ============================================================================

// NewBusinessError creates a generic business rule violation error
func NewBusinessError(code ErrorCode, message, userMessage string) *AppError {
	return newError(
		code,
		DomainBusiness,
		CategoryUnprocessable,
		message,
		userMessage,
		http.StatusUnprocessableEntity,
		false,
	)
}

// NewInvalidStateError creates an invalid state transition error
func NewInvalidStateError(currentState, targetState string) *AppError {
	return newError(
		CodeBizInvalidState,
		DomainBusiness,
		CategoryUnprocessable,
		fmt.Sprintf("Invalid state transition from %s to %s", currentState, targetState),
		"Esta operación no está permitida en el estado actual",
		http.StatusUnprocessableEntity,
		false,
	).WithDetails(map[string]interface{}{
		"current_state": currentState,
		"target_state":  targetState,
	})
}

// NewLimitExceededError creates a limit exceeded error
func NewLimitExceededError(limitType string, current, max int) *AppError {
	return newError(
		CodeBizLimitExceeded,
		DomainBusiness,
		CategoryUnprocessable,
		fmt.Sprintf("Limit exceeded for %s: %d/%d", limitType, current, max),
		"Se ha excedido el límite permitido",
		http.StatusUnprocessableEntity,
		false,
	).WithDetails(map[string]interface{}{
		"limit_type": limitType,
		"current":    current,
		"max":        max,
	})
}

// ============================================================================
// SYSTEM ERRORS
// ============================================================================

// NewInternalError creates a generic internal server error
func NewInternalError(message string, cause error) *AppError {
	return newError(
		CodeSysInternal,
		DomainSystem,
		CategoryInternal,
		message,
		"Ocurrió un error inesperado. Intenta nuevamente",
		http.StatusInternalServerError,
		true,
	).WithCause(cause)
}

// NewServiceUnavailableError creates a service unavailable error
func NewServiceUnavailableError(service string) *AppError {
	return newError(
		CodeSysUnavailable,
		DomainSystem,
		CategoryUnavailable,
		fmt.Sprintf("Service unavailable: %s", service),
		"El servicio no está disponible temporalmente. Intenta en unos minutos",
		http.StatusServiceUnavailable,
		true,
	).WithDetail("service", service).WithRetryAfter(60)
}

// NewRateLimitError creates a rate limit exceeded error
func NewRateLimitError(retryAfterSeconds int) *AppError {
	return newError(
		CodeSysRateLimit,
		DomainSystem,
		CategoryRateLimited,
		"Rate limit exceeded",
		"Demasiadas solicitudes. Espera un momento e intenta de nuevo",
		http.StatusTooManyRequests,
		true,
	).WithRetryAfter(retryAfterSeconds)
}

// NewTimeoutError creates a timeout error
func NewTimeoutError(operation string) *AppError {
	return newError(
		CodeSysTimeout,
		DomainSystem,
		CategoryTimeout,
		fmt.Sprintf("Operation timeout: %s", operation),
		"La operación tardó demasiado. Intenta nuevamente",
		http.StatusGatewayTimeout,
		true,
	).WithDetail("operation", operation).WithRetryAfter(5)
}

// ============================================================================
// EXTERNAL SERVICE ERRORS
// ============================================================================

// NewExternalServiceError creates an external service error
func NewExternalServiceError(service string, cause error) *AppError {
	return newError(
		CodeExtConnection,
		DomainExternal,
		CategoryUnavailable,
		fmt.Sprintf("External service error: %s", service),
		"Error al conectar con servicio externo",
		http.StatusBadGateway,
		true,
	).WithCause(cause).WithDetail("service", service).WithRetryAfter(30)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// categoryToHTTPStatus maps error categories to HTTP status codes
func categoryToHTTPStatus(category ErrorCategory) int {
	switch category {
	case CategoryValidation:
		return http.StatusBadRequest
	case CategoryUnauthorized:
		return http.StatusUnauthorized
	case CategoryForbidden:
		return http.StatusForbidden
	case CategoryNotFound:
		return http.StatusNotFound
	case CategoryConflict:
		return http.StatusConflict
	case CategoryUnprocessable:
		return http.StatusUnprocessableEntity
	case CategoryRateLimited:
		return http.StatusTooManyRequests
	case CategoryUnavailable:
		return http.StatusServiceUnavailable
	case CategoryTimeout:
		return http.StatusGatewayTimeout
	default:
		return http.StatusInternalServerError
	}
}

// captureStack captures the current stack trace
func captureStack(skip int) string {
	var pcs [32]uintptr
	n := runtime.Callers(skip, pcs[:])
	frames := runtime.CallersFrames(pcs[:n])

	var builder strings.Builder
	for {
		frame, more := frames.Next()
		fmt.Fprintf(&builder, "%s\n\t%s:%d\n", frame.Function, frame.File, frame.Line)
		if !more {
			break
		}
	}
	return builder.String()
}

// maskEmail masks an email for logging (u***@example.com)
func maskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return "***"
	}
	if len(parts[0]) <= 1 {
		return "***@" + parts[1]
	}
	return parts[0][:1] + "***@" + parts[1]
}
