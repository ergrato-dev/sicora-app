package errors

import (
	"context"
	"fmt"
	"time"

	apperrors "sicora-be-go/pkg/errors"
)

const ServiceName = "mevalservice"

// Domain constant for this service
const DomainMEval apperrors.ErrorDomain = "MEVAL"

// InitServiceContext initializes the global service context
func InitServiceContext(version, env string) {
	apperrors.SetGlobalServiceContext(ServiceName, version, env)
}

// ToAppError converts any error to an AppError
func ToAppError(err error) *apperrors.AppError {
	if err == nil {
		return nil
	}
	if appErr, ok := err.(*apperrors.AppError); ok {
		return appErr
	}
	return apperrors.NewInternalError("internal error", err)
}

// Domain-specific error factories for MEvalService

// NewCommitteeNotFoundError creates an error for when a committee is not found
func NewCommitteeNotFoundError(committeeID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainMEval, "committee", committeeID)
}

// NewStudentCaseNotFoundError creates an error for when a student case is not found
func NewStudentCaseNotFoundError(caseID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainMEval, "student_case", caseID)
}

// NewImprovementPlanNotFoundError creates an error for when an improvement plan is not found
func NewImprovementPlanNotFoundError(planID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainMEval, "improvement_plan", planID)
}

// NewSanctionNotFoundError creates an error for when a sanction is not found
func NewSanctionNotFoundError(sanctionID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainMEval, "sanction", sanctionID)
}

// NewAppealNotFoundError creates an error for when an appeal is not found
func NewAppealNotFoundError(appealID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainMEval, "appeal", appealID)
}

// NewDuplicateCaseError creates an error for duplicate student case
func NewDuplicateCaseError(studentID string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainMEval,
		fmt.Sprintf("active case already exists for student %s", studentID),
		"Ya existe un caso activo para este aprendiz",
	)
}

// NewAppealDeadlineExpiredError creates an error when appeal deadline has passed
func NewAppealDeadlineExpiredError(sanctionID string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainMEval,
		fmt.Sprintf("appeal deadline expired for sanction %s", sanctionID),
		"El plazo para apelar ha vencido",
	)
}

// NewInvalidCaseStatusError creates an error for invalid case status transition
func NewInvalidCaseStatusError(currentStatus, targetStatus string) *apperrors.AppError {
	fields := []apperrors.FieldError{
		{
			Field:   "status",
			Message: fmt.Sprintf("cannot transition from %s to %s", currentStatus, targetStatus),
			Code:    "INVALID_TRANSITION",
		},
	}
	return apperrors.NewValidationError(fields).AppError
}

// Validator provides validation helpers
type Validator struct{}

// NewValidator creates a new validator instance
func NewValidator() *Validator {
	return &Validator{}
}

// ValidateRequired checks if a required field is present
func (v *Validator) ValidateRequired(value interface{}, fieldName string) *apperrors.AppError {
	if value == nil {
		fields := []apperrors.FieldError{
			{Field: fieldName, Message: fmt.Sprintf("%s is required", fieldName), Code: "REQUIRED"},
		}
		return apperrors.NewValidationError(fields).AppError
	}
	if str, ok := value.(string); ok && str == "" {
		fields := []apperrors.FieldError{
			{Field: fieldName, Message: fmt.Sprintf("%s cannot be empty", fieldName), Code: "EMPTY"},
		}
		return apperrors.NewValidationError(fields).AppError
	}
	return nil
}

// ExecuteWithTimeout executes a function with a timeout and returns error only
func ExecuteWithTimeout(ctx context.Context, timeout time.Duration, operation string, fn func(ctx context.Context) error) error {
	_, err := apperrors.ExecuteWithTimeout(ctx, timeout, operation, func(ctx context.Context) (struct{}, error) {
		return struct{}{}, fn(ctx)
	})
	return err
}
