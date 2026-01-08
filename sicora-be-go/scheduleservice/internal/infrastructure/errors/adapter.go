// Package errors provides an adapter layer between the centralized error package
// and scheduleservice's domain, enabling consistent error handling.
package errors

import (
	"context"
	"net/http"
	"time"

	apperrors "sicora-be-go/pkg/errors"

	"github.com/gin-gonic/gin"
)

// ============================================================================
// INITIALIZATION
// ============================================================================

// InitServiceContext initializes the global service context for scheduleservice
func InitServiceContext(version, env string) {
	apperrors.SetGlobalServiceContext("scheduleservice", version, env)
}

// ============================================================================
// ERROR CONVERSION
// ============================================================================

// ToAppError converts any error to an AppError
func ToAppError(err error) *apperrors.AppError {
	if err == nil {
		return nil
	}

	// Check if it's already an AppError
	if appErr, ok := err.(*apperrors.AppError); ok {
		return appErr
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
// COMMON ERROR FACTORIES
// ============================================================================

// NewScheduleNotFoundError creates a schedule not found error
func NewScheduleNotFoundError(identifier string) *apperrors.AppError {
	return apperrors.NewScheduleNotFoundError(identifier)
}

// NewScheduleConflictError creates a schedule conflict error
func NewScheduleConflictError(details string) *apperrors.AppError {
	return apperrors.NewScheduleConflictError(details)
}

// NewValidationError creates a validation error
func NewValidationError(message string) *apperrors.AppError {
	return apperrors.NewRequiredFieldError(message)
}

// NewInternalError creates an internal server error
func NewInternalError(message string, cause error) *apperrors.AppError {
	return apperrors.NewInternalError(message, cause)
}

// NewDatabaseError creates a database error
func NewDatabaseError(operation string, cause error) *apperrors.AppError {
	return apperrors.NewDatabaseError(operation, cause)
}

// NewUnauthorizedError creates an unauthorized error
func NewUnauthorizedError(reason string) *apperrors.AppError {
	return apperrors.NewTokenInvalidError()
}

// NewForbiddenError creates a forbidden error
func NewForbiddenError(resource, action string) *apperrors.AppError {
	return apperrors.NewInsufficientPermissionsError(action)
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
