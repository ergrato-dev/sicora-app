// Package errors provides the adapter layer for integrating the centralized
// error handling package (pkg/errors) into projectevalservice.
package errors

import (
	"context"
	"os"
	"time"

	apperrors "sicora-be-go/pkg/errors"
)

const (
	// ServiceName identifies this service in error contexts
	ServiceName = "projectevalservice"
	// ServiceVersion current version of the service
	ServiceVersion = "1.0.0"
	// DomainProjectEval is the domain identifier for project evaluation errors
	DomainProjectEval = "PROJECT_EVAL"
)

// InitServiceContext initializes the global service context for error handling.
// Should be called once at application startup.
func InitServiceContext() {
	env := os.Getenv("GIN_MODE")
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

	return apperrors.NewInternalError(DomainProjectEval, err)
}

// ============================================================================
// Project-specific errors
// ============================================================================

// NewProjectNotFoundError creates a not found error for projects
func NewProjectNotFoundError(projectID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainProjectEval, "project", projectID)
}

// NewSubmissionNotFoundError creates a not found error for submissions
func NewSubmissionNotFoundError(submissionID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainProjectEval, "submission", submissionID)
}

// NewEvaluationNotFoundError creates a not found error for evaluations
func NewEvaluationNotFoundError(evaluationID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainProjectEval, "evaluation", evaluationID)
}

// NewRubricNotFoundError creates a not found error for rubrics
func NewRubricNotFoundError(rubricID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainProjectEval, "rubric", rubricID)
}

// ============================================================================
// Business rule errors
// ============================================================================

// NewDuplicateProjectError creates a conflict error for duplicate projects
func NewDuplicateProjectError(projectName string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainProjectEval,
		"project with this name already exists: "+projectName,
		"Ya existe un proyecto con este nombre",
	)
}

// NewSubmissionDeadlinePassedError creates an error when submission deadline has passed
func NewSubmissionDeadlinePassedError(deadline time.Time) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainProjectEval,
		"submission deadline has passed: "+deadline.Format(time.RFC3339),
		"La fecha límite de entrega ha pasado",
	)
}

// NewProjectAlreadyEvaluatedError creates an error when project is already evaluated
func NewProjectAlreadyEvaluatedError(projectID string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainProjectEval,
		"project already has final evaluation: "+projectID,
		"El proyecto ya tiene evaluación final",
	)
}

// NewInvalidSubmissionStatusError creates an error for invalid submission status
func NewInvalidSubmissionStatusError(currentStatus, requiredStatus string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainProjectEval,
		"invalid submission status: "+currentStatus+", required: "+requiredStatus,
		"El estado de la entrega no permite esta operación",
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
		return apperrors.NewTimeoutError(DomainProjectEval, "operation", timeout)
	}
}
