// Package errors provides an adapter layer between the centralized error package
// and attendanceservice's domain, enabling consistent error handling.
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

// InitServiceContext initializes the global service context for attendanceservice
func InitServiceContext(version, env string) {
	apperrors.SetGlobalServiceContext("attendanceservice", version, env)
}

// ============================================================================
// ERROR CONVERSION
// ============================================================================

// ToAppError converts any error to an AppError
func ToAppError(err error) *apperrors.AppError {
	if err == nil {
		return nil
	}

	if appErr, ok := err.(*apperrors.AppError); ok {
		return appErr
	}

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

// ============================================================================
// COMMON ERROR FACTORIES
// ============================================================================

// NewAttendanceNotFoundError creates an attendance not found error
func NewAttendanceNotFoundError(identifier string) *apperrors.AppError {
	return apperrors.NewAttendanceNotFoundError(identifier)
}

// NewDuplicateAttendanceError creates a duplicate attendance error
func NewDuplicateAttendanceError(studentID, date string) *apperrors.AppError {
	return apperrors.NewDuplicateAttendanceError(studentID, date)
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

// ============================================================================
// VALIDATION & CONTEXT HELPERS
// ============================================================================

// Validator returns a new fluent validator
func Validator() *apperrors.Validator {
	return apperrors.NewValidator()
}

// WrapWithContext wraps an error with operation context
func WrapWithContext(ctx context.Context, err error, operation string) *apperrors.AppError {
	return apperrors.WrapWithContext(ctx, err, operation)
}

// ExecuteWithTimeout executes an operation with timeout
func ExecuteWithTimeout[T any](ctx context.Context, timeout time.Duration, operation string, fn func(context.Context) (T, error)) (T, error) {
	return apperrors.ExecuteWithTimeout(ctx, timeout, operation, fn)
}

// GetHTTPStatus returns the HTTP status code for an error
func GetHTTPStatus(err error) int {
	if appErr := ToAppError(err); appErr != nil {
		return appErr.HTTPStatus
	}
	return http.StatusInternalServerError
}
