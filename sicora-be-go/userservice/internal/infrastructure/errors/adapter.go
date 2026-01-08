// Package errors provides an adapter layer between the centralized error package
// and userservice's domain errors, enabling gradual migration while maintaining
// backward compatibility.
package errors

import (
	"context"
	"net/http"
	"time"

	apperrors "sicora-be-go/pkg/errors"
	domainerrors "userservice/internal/domain/errors"

	"github.com/gin-gonic/gin"
)

// ============================================================================
// INITIALIZATION
// ============================================================================

// InitServiceContext initializes the global service context for userservice
func InitServiceContext(version, env string) {
	apperrors.SetGlobalServiceContext("userservice", version, env)
}

// ============================================================================
// ERROR CONVERSION - Domain to AppError
// ============================================================================

// FromDomainError converts a domain error to an AppError
func FromDomainError(err *domainerrors.DomainError) *apperrors.AppError {
	if err == nil {
		return nil
	}

	// Map domain error code to app error
	switch err.Code {
	case domainerrors.InvalidCredentials:
		return apperrors.NewInvalidCredentialsError()
	case domainerrors.TokenExpired:
		return apperrors.NewTokenExpiredError()
	case domainerrors.InsufficientPermissions:
		return apperrors.NewInsufficientPermissionsError("required")
	case domainerrors.UserNotFound:
		return apperrors.NewUserNotFoundError(err.Details)
	case domainerrors.EmailAlreadyExists:
		return apperrors.NewEmailExistsError(err.Details)
	case domainerrors.WeakPassword:
		return apperrors.NewWeakPasswordError()
	case domainerrors.UserInactive:
		return apperrors.NewBusinessError(
			apperrors.CodeUserInactive,
			"User account is inactive",
			err.Message,
		)
	case domainerrors.InvalidInput:
		return apperrors.NewRequiredFieldError(err.Details)
	case domainerrors.RequiredFieldMissing:
		return apperrors.NewRequiredFieldError(err.Details)
	case domainerrors.InvalidEmailFormat:
		return apperrors.NewInvalidEmailError(err.Details)
	case domainerrors.InvalidUUIDFormat:
		return apperrors.NewInvalidUUIDError("id", err.Details)
	case domainerrors.InternalServerError:
		return apperrors.NewInternalError(err.Message, nil)
	case domainerrors.ServiceUnavailable:
		return apperrors.NewServiceUnavailableError("service")
	case domainerrors.DatabaseError:
		return apperrors.NewDatabaseError(err.Details, nil)
	default:
		return apperrors.NewInternalError(err.Message, nil)
	}
}

// ToAppError converts any error to an AppError
func ToAppError(err error) *apperrors.AppError {
	if err == nil {
		return nil
	}

	// Check if it's already an AppError
	if appErr, ok := err.(*apperrors.AppError); ok {
		return appErr
	}

	// Check if it's a domain error
	if domainErr, ok := err.(*domainerrors.DomainError); ok {
		return FromDomainError(domainErr)
	}

	// Convert generic error to internal error
	return apperrors.NewInternalError(err.Error(), err)
}

// ============================================================================
// GIN HELPERS
// ============================================================================

// RespondWithError sends an error response using the centralized error format
func RespondWithError(c *gin.Context, err error) {
	appErr := ToAppError(err)
	c.JSON(appErr.HTTPStatus, appErr.ToResponse())
}

// RespondWithAppError sends an AppError response
func RespondWithAppError(c *gin.Context, appErr *apperrors.AppError) {
	c.JSON(appErr.HTTPStatus, appErr.ToResponse())
}

// ============================================================================
// COMMON ERROR FACTORIES (using centralized package)
// ============================================================================

// NewValidationErrorSimple creates a simple validation error
func NewValidationErrorSimple(message string) *apperrors.AppError {
	return apperrors.NewRequiredFieldError(message)
}

// NewUserNotFoundError creates a user not found error
func NewUserNotFoundError(identifier string) *apperrors.AppError {
	return apperrors.NewUserNotFoundError(identifier)
}

// NewInvalidCredentialsError creates an invalid credentials error
func NewInvalidCredentialsError() *apperrors.AppError {
	return apperrors.NewInvalidCredentialsError()
}

// NewDuplicateEmailError creates a duplicate email error
func NewDuplicateEmailError(email string) *apperrors.AppError {
	return apperrors.NewEmailExistsError(email)
}

// NewUnauthorizedError creates an unauthorized error
func NewUnauthorizedError(reason string) *apperrors.AppError {
	return apperrors.NewTokenInvalidError()
}

// NewForbiddenError creates a forbidden error
func NewForbiddenError(resource, action string) *apperrors.AppError {
	return apperrors.NewInsufficientPermissionsError(action)
}

// NewInternalError creates an internal server error
func NewInternalError(message string, cause error) *apperrors.AppError {
	return apperrors.NewInternalError(message, cause)
}

// NewDatabaseError creates a database error
func NewDatabaseError(operation string, cause error) *apperrors.AppError {
	return apperrors.NewDatabaseError(operation, cause)
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

// Validator returns a new fluent validator
func Validator() *apperrors.Validator {
	return apperrors.NewValidator()
}

// ============================================================================
// CONTEXT HELPERS
// ============================================================================

// WrapWithContext wraps an error with operation context
func WrapWithContext(ctx context.Context, err error, operation string) *apperrors.AppError {
	return apperrors.WrapWithContext(ctx, err, operation)
}

// NewOperationContext creates a new operation context
func NewOperationContext(operation, layer string) *apperrors.OperationContext {
	return &apperrors.OperationContext{
		Operation: operation,
		Layer:     layer,
	}
}

// ============================================================================
// TIMEOUT HELPERS
// ============================================================================

// ExecuteWithTimeout executes an operation with timeout
func ExecuteWithTimeout[T any](ctx context.Context, timeout time.Duration, operation string, fn func(context.Context) (T, error)) (T, error) {
	return apperrors.ExecuteWithTimeout(ctx, timeout, operation, fn)
}

// ============================================================================
// HTTP STATUS HELPERS
// ============================================================================

// GetHTTPStatus returns the HTTP status code for an error
func GetHTTPStatus(err error) int {
	if appErr := ToAppError(err); appErr != nil {
		return appErr.HTTPStatus
	}
	return http.StatusInternalServerError
}
