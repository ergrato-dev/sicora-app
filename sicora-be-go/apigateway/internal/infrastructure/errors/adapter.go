// Package errors provides the adapter layer for integrating the centralized
// error handling package (pkg/errors) into apigateway.
package errors

import (
	"context"
	"os"
	"time"

	apperrors "sicora-be-go/pkg/errors"
)

const (
	// ServiceName identifies this service in error contexts
	ServiceName = "apigateway"
	// ServiceVersion current version of the service
	ServiceVersion = "2.0.0"
	// DomainGateway is the domain identifier for gateway errors
	DomainGateway = "GATEWAY"
)

// InitServiceContext initializes the global service context for error handling.
// Should be called once at application startup.
func InitServiceContext() {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}
	apperrors.SetGlobalServiceContext(ServiceName, ServiceVersion, env)
}

// ToAppError converts any error to an AppError.
// If the error is already an AppError, it returns it as-is.
// Otherwise, it wraps it as an internal error.
func ToAppError(err error) *apperrors.AppError {
	if err == nil {
		return nil
	}

	if appErr, ok := err.(*apperrors.AppError); ok {
		return appErr
	}

	return apperrors.NewInternalError(DomainGateway, err)
}

// ============================================================================
// Gateway-specific errors
// ============================================================================

// NewServiceUnavailableError creates an error when a backend service is unavailable
func NewServiceUnavailableError(serviceName string) *apperrors.AppError {
	return apperrors.NewServiceUnavailableError(
		DomainGateway,
		serviceName+" service is unavailable",
		"El servicio no está disponible temporalmente",
	)
}

// NewUpstreamTimeoutError creates an error when upstream service times out
func NewUpstreamTimeoutError(serviceName string, timeout time.Duration) *apperrors.AppError {
	return apperrors.NewTimeoutError(DomainGateway, serviceName, timeout)
}

// NewRateLimitExceededError creates an error when rate limit is exceeded
func NewRateLimitExceededError(clientIP string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainGateway,
		"rate limit exceeded for IP: "+clientIP,
		"Has excedido el límite de solicitudes. Intenta de nuevo más tarde.",
	)
}

// NewInvalidRouteError creates an error for invalid route requests
func NewInvalidRouteError(path string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainGateway, "route", path)
}

// NewAuthenticationRequiredError creates an error when authentication is required
func NewAuthenticationRequiredError() *apperrors.AppError {
	return apperrors.NewUnauthorizedError(
		DomainGateway,
		"authentication required",
		"Se requiere autenticación para acceder a este recurso",
	)
}

// NewInvalidTokenError creates an error for invalid JWT tokens
func NewInvalidTokenError(reason string) *apperrors.AppError {
	return apperrors.NewUnauthorizedError(
		DomainGateway,
		"invalid token: "+reason,
		"Token de autenticación inválido",
	)
}

// NewCircuitBreakerOpenError creates an error when circuit breaker is open
func NewCircuitBreakerOpenError(serviceName string) *apperrors.AppError {
	return apperrors.NewServiceUnavailableError(
		DomainGateway,
		"circuit breaker open for service: "+serviceName,
		"El servicio está temporalmente no disponible. Intenta de nuevo más tarde.",
	)
}

// ============================================================================
// Validation helpers
// ============================================================================

// Validator provides validation utilities
type Validator struct{}

// NewValidator creates a new validator instance
func NewValidator() *Validator {
	return &Validator{}
}

// ValidateRequired checks if required fields are present
func (v *Validator) ValidateRequired(fields map[string]interface{}) *apperrors.AppError {
	var fieldErrors []apperrors.FieldError

	for field, value := range fields {
		if value == nil || value == "" {
			fieldErrors = append(fieldErrors, apperrors.FieldError{
				Field:   field,
				Message: "field is required",
				Code:    "REQUIRED",
			})
		}
	}

	if len(fieldErrors) > 0 {
		return apperrors.NewValidationError(fieldErrors).AppError
	}

	return nil
}

// ============================================================================
// Context helpers
// ============================================================================

// ExecuteWithTimeout executes a function with a timeout context
func ExecuteWithTimeout(ctx context.Context, timeout time.Duration, fn func(ctx context.Context) error) error {
	timeoutCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	done := make(chan error, 1)
	go func() {
		done <- fn(timeoutCtx)
	}()

	select {
	case err := <-done:
		return err
	case <-timeoutCtx.Done():
		return apperrors.NewTimeoutError(DomainGateway, "operation", timeout)
	}
}
