package errors

import (
	"fmt"
	"net/http"
	"time"
)

// ErrorCode represents standardized error codes across the application
type ErrorCode string

const (
	// Authentication/Authorization errors
	InvalidCredentials      ErrorCode = "INVALID_CREDENTIALS"
	TokenExpired            ErrorCode = "TOKEN_EXPIRED"
	InsufficientPermissions ErrorCode = "INSUFFICIENT_PERMISSIONS"

	// User management errors
	UserNotFound       ErrorCode = "USER_NOT_FOUND"
	EmailAlreadyExists ErrorCode = "EMAIL_ALREADY_EXISTS"
	WeakPassword       ErrorCode = "WEAK_PASSWORD"
	UserInactive       ErrorCode = "USER_INACTIVE"

	// Validation errors
	InvalidInput         ErrorCode = "INVALID_INPUT"
	RequiredFieldMissing ErrorCode = "REQUIRED_FIELD_MISSING"
	InvalidEmailFormat   ErrorCode = "INVALID_EMAIL_FORMAT"
	InvalidUUIDFormat    ErrorCode = "INVALID_UUID_FORMAT"

	// System errors
	InternalServerError ErrorCode = "INTERNAL_SERVER_ERROR"
	ServiceUnavailable  ErrorCode = "SERVICE_UNAVAILABLE"
	DatabaseError       ErrorCode = "DATABASE_ERROR"
)

// DomainError represents a domain-specific error with standardized structure
type DomainError struct {
	Code       ErrorCode `json:"code"`
	Message    string    `json:"message"`
	Details    string    `json:"details,omitempty"`
	Timestamp  time.Time `json:"timestamp"`
	StatusCode int       `json:"-"`
}

func (e *DomainError) Error() string {
	return e.Message
}

// ErrorResponse represents the standardized API error response format
type ErrorResponse struct {
	Error ErrorDetails `json:"error"`
}

type ErrorDetails struct {
	Code          ErrorCode `json:"code"`
	Message       string    `json:"message"`
	Details       string    `json:"details,omitempty"`
	Timestamp     time.Time `json:"timestamp"`
	Path          string    `json:"path"`
	CorrelationID string    `json:"correlationId,omitempty"`
}

// NewErrorResponse creates a new standardized error response
// code: error code string, message: human readable message, details: optional additional info
func NewErrorResponse(code string, message string, details map[string]interface{}) ErrorResponse {
	detailsStr := ""
	if details != nil {
		if d, ok := details["details"]; ok {
			detailsStr = fmt.Sprintf("%v", d)
		}
	}
	return ErrorResponse{
		Error: ErrorDetails{
			Code:      ErrorCode(code),
			Message:   message,
			Details:   detailsStr,
			Timestamp: time.Now().UTC(),
		},
	}
}

// NewDomainError creates a new domain error with the specified parameters
func NewDomainError(code ErrorCode, message string, statusCode int) *DomainError {
	return &DomainError{
		Code:       code,
		Message:    message,
		Timestamp:  time.Now().UTC(),
		StatusCode: statusCode,
	}
}

// NewDomainErrorWithDetails creates a domain error with additional details
func NewDomainErrorWithDetails(code ErrorCode, message, details string, statusCode int) *DomainError {
	return &DomainError{
		Code:       code,
		Message:    message,
		Details:    details,
		Timestamp:  time.Now().UTC(),
		StatusCode: statusCode,
	}
}

// User-specific errors
func NewUserNotFoundError(identifier string) *DomainError {
	return NewDomainErrorWithDetails(
		UserNotFound,
		"Usuario no encontrado",
		fmt.Sprintf("No se encontró usuario con ID: %s", identifier),
		http.StatusNotFound,
	)
}

func NewEmailAlreadyExistsError(email string) *DomainError {
	return NewDomainErrorWithDetails(
		EmailAlreadyExists,
		"Email ya existe",
		fmt.Sprintf("Ya existe un usuario registrado con el email: %s", email),
		http.StatusConflict,
	)
}

func NewWeakPasswordError() *DomainError {
	return NewDomainError(
		WeakPassword,
		"La contraseña no cumple con los requisitos mínimos de seguridad",
		http.StatusBadRequest,
	)
}

func NewInvalidCredentialsError() *DomainError {
	return NewDomainError(
		InvalidCredentials,
		"Credenciales inválidas",
		http.StatusUnauthorized,
	)
}

// Authentication/Authorization errors
func NewUnauthorizedError(details string) *DomainError {
	return NewDomainErrorWithDetails(
		InvalidCredentials,
		"No autorizado",
		details,
		http.StatusUnauthorized,
	)
}

func NewConflictError(message string) *DomainError {
	return NewDomainError(
		EmailAlreadyExists,
		message,
		http.StatusConflict,
	)
}

func NewInvalidInputError(field string) *DomainError {
	return NewDomainErrorWithDetails(
		InvalidInput,
		"Datos de entrada inválidos",
		fmt.Sprintf("El campo '%s' contiene un valor inválido", field),
		http.StatusBadRequest,
	)
}

func NewInvalidUUIDError(value string) *DomainError {
	return NewDomainErrorWithDetails(
		InvalidUUIDFormat,
		"Formato de UUID inválido",
		fmt.Sprintf("El valor '%s' no es un UUID válido", value),
		http.StatusBadRequest,
	)
}

// System errors
func NewInternalServerError(details string) *DomainError {
	return NewDomainErrorWithDetails(
		InternalServerError,
		"Error interno del servidor",
		details,
		http.StatusInternalServerError,
	)
}

func NewDatabaseError(operation string) *DomainError {
	return NewDomainErrorWithDetails(
		DatabaseError,
		"Error de base de datos",
		fmt.Sprintf("Error al ejecutar operación: %s", operation),
		http.StatusInternalServerError,
	)
}

// GetHTTPStatusCode returns the appropriate HTTP status code for an error code
func GetHTTPStatusCode(code ErrorCode) int {
	switch code {
	case InvalidCredentials:
		return http.StatusUnauthorized
	case InsufficientPermissions:
		return http.StatusForbidden
	case UserNotFound:
		return http.StatusNotFound
	case EmailAlreadyExists:
		return http.StatusConflict
	case WeakPassword, InvalidInput, RequiredFieldMissing, InvalidEmailFormat, InvalidUUIDFormat:
		return http.StatusBadRequest
	case InternalServerError, DatabaseError:
		return http.StatusInternalServerError
	case ServiceUnavailable:
		return http.StatusServiceUnavailable
	default:
		return http.StatusInternalServerError
	}
}
