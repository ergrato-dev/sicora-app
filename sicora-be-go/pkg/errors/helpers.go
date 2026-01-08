package errors

import (
	"errors"
	"fmt"
)

// ============================================================================
// ERROR TYPE CHECKING (Is* functions)
// ============================================================================

// Is checks if an error is an AppError with a specific code
func Is(err error, code ErrorCode) bool {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Code == code
	}
	return false
}

// IsAppError checks if an error is an AppError
func IsAppError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr)
}

// IsValidationError checks if an error is a ValidationError
func IsValidationError(err error) bool {
	var validErr *ValidationError
	return errors.As(err, &validErr)
}

// IsCategory checks if an error belongs to a specific category
func IsCategory(err error, category ErrorCategory) bool {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Category == category
	}
	return false
}

// IsDomain checks if an error belongs to a specific domain
func IsDomain(err error, domain ErrorDomain) bool {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Domain == domain
	}
	return false
}

// ============================================================================
// CATEGORY CHECKERS
// ============================================================================

// IsNotFound checks if an error is a "not found" error
func IsNotFound(err error) bool {
	return IsCategory(err, CategoryNotFound)
}

// IsUnauthorized checks if an error is an "unauthorized" error
func IsUnauthorized(err error) bool {
	return IsCategory(err, CategoryUnauthorized)
}

// IsForbidden checks if an error is a "forbidden" error
func IsForbidden(err error) bool {
	return IsCategory(err, CategoryForbidden)
}

// IsValidation checks if an error is a "validation" error
func IsValidation(err error) bool {
	return IsCategory(err, CategoryValidation)
}

// IsConflict checks if an error is a "conflict" error
func IsConflict(err error) bool {
	return IsCategory(err, CategoryConflict)
}

// IsInternal checks if an error is an "internal" error
func IsInternal(err error) bool {
	return IsCategory(err, CategoryInternal)
}

// IsUnavailable checks if an error is a "service unavailable" error
func IsUnavailable(err error) bool {
	return IsCategory(err, CategoryUnavailable)
}

// IsTimeout checks if an error is a "timeout" error
func IsTimeout(err error) bool {
	return IsCategory(err, CategoryTimeout)
}

// IsRateLimited checks if an error is a "rate limited" error
func IsRateLimited(err error) bool {
	return IsCategory(err, CategoryRateLimited)
}

// IsUnprocessable checks if an error is an "unprocessable" error
func IsUnprocessable(err error) bool {
	return IsCategory(err, CategoryUnprocessable)
}

// ============================================================================
// RETRYABLE CHECK
// ============================================================================

// IsRetryable checks if an error can be retried
func IsRetryable(err error) bool {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Retryable
	}
	return false
}

// GetRetryAfter returns the suggested retry time in seconds
// Returns 0 if the error is not retryable or not an AppError
func GetRetryAfter(err error) int {
	var appErr *AppError
	if errors.As(err, &appErr) && appErr.Retryable {
		return appErr.RetryAfter
	}
	return 0
}

// ============================================================================
// ERROR EXTRACTION
// ============================================================================

// GetAppError extracts an AppError from an error chain
func GetAppError(err error) *AppError {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr
	}
	return nil
}

// GetValidationError extracts a ValidationError from an error chain
func GetValidationError(err error) *ValidationError {
	var validErr *ValidationError
	if errors.As(err, &validErr) {
		return validErr
	}
	return nil
}

// GetHTTPStatus returns the HTTP status code for an error
// Returns 500 for non-AppError types
func GetHTTPStatus(err error) int {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.GetHTTPStatus()
	}
	return 500
}

// GetCode returns the error code for an AppError
// Returns empty string for non-AppError types
func GetCode(err error) ErrorCode {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Code
	}
	return ""
}

// GetDomain returns the domain for an AppError
// Returns empty string for non-AppError types
func GetDomain(err error) ErrorDomain {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Domain
	}
	return ""
}

// ============================================================================
// ERROR WRAPPING
// ============================================================================

// Wrap wraps an error with additional context
// If the error is already an AppError, it adds the context and returns it
// Otherwise, it creates a new internal error
func Wrap(err error, message string) *AppError {
	if err == nil {
		return nil
	}

	var appErr *AppError
	if errors.As(err, &appErr) {
		// Clone the error and add context
		newErr := *appErr
		newErr.Message = fmt.Sprintf("%s: %s", message, appErr.Message)
		return &newErr
	}

	// Wrap unknown errors as internal errors
	return NewInternalError(message, err)
}

// WrapWithCode wraps an error with a specific error code
func WrapWithCode(err error, code ErrorCode, message string) *AppError {
	if err == nil {
		return nil
	}

	var appErr *AppError
	if errors.As(err, &appErr) {
		newErr := *appErr
		newErr.Code = code
		newErr.Message = fmt.Sprintf("%s: %s", message, appErr.Message)
		return &newErr
	}

	return NewInternalError(message, err)
}

// Wrapf wraps an error with a formatted message
func Wrapf(err error, format string, args ...interface{}) *AppError {
	return Wrap(err, fmt.Sprintf(format, args...))
}

// ============================================================================
// ERROR CHAIN UTILITIES
// ============================================================================

// Cause returns the root cause of an error chain
func Cause(err error) error {
	for err != nil {
		unwrapper, ok := err.(interface{ Unwrap() error })
		if !ok {
			return err
		}
		unwrapped := unwrapper.Unwrap()
		if unwrapped == nil {
			return err
		}
		err = unwrapped
	}
	return nil
}

// Chain returns all errors in the error chain
func Chain(err error) []error {
	var chain []error
	for err != nil {
		chain = append(chain, err)
		unwrapper, ok := err.(interface{ Unwrap() error })
		if !ok {
			break
		}
		err = unwrapper.Unwrap()
	}
	return chain
}

// ============================================================================
// ERROR AGGREGATION
// ============================================================================

// MultiError represents multiple errors
type MultiError struct {
	Errors []error
}

// NewMultiError creates a new MultiError
func NewMultiError(errs ...error) *MultiError {
	// Filter out nil errors
	filtered := make([]error, 0, len(errs))
	for _, err := range errs {
		if err != nil {
			filtered = append(filtered, err)
		}
	}
	if len(filtered) == 0 {
		return nil
	}
	return &MultiError{Errors: filtered}
}

// Error implements the error interface
func (m *MultiError) Error() string {
	if len(m.Errors) == 1 {
		return m.Errors[0].Error()
	}
	return fmt.Sprintf("%d errors occurred", len(m.Errors))
}

// Add adds an error to the multi-error
func (m *MultiError) Add(err error) {
	if err != nil {
		m.Errors = append(m.Errors, err)
	}
}

// HasErrors returns true if there are any errors
func (m *MultiError) HasErrors() bool {
	return len(m.Errors) > 0
}

// First returns the first error or nil
func (m *MultiError) First() error {
	if len(m.Errors) > 0 {
		return m.Errors[0]
	}
	return nil
}

// ToError returns nil if there are no errors, otherwise returns the MultiError
func (m *MultiError) ToError() error {
	if m == nil || !m.HasErrors() {
		return nil
	}
	return m
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

// FromStdError converts a standard error to an AppError
// If it's already an AppError, returns it directly
// Otherwise, wraps it as an internal error
func FromStdError(err error) *AppError {
	if err == nil {
		return nil
	}
	if appErr := GetAppError(err); appErr != nil {
		return appErr
	}
	return NewInternalError(err.Error(), err)
}

// ToStdError converts an AppError to a standard error
// This is useful when you need to return a standard error interface
func ToStdError(appErr *AppError) error {
	if appErr == nil {
		return nil
	}
	return appErr
}
