package errors

import (
	"context"
	"fmt"
	"time"

	apperrors "sicora-be-go/pkg/errors"
)

const ServiceName = "evalinservice"

// Domain constant for this service
const DomainEvaluation apperrors.ErrorDomain = "EVALUATION"

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

// Domain-specific error factories for EvalinService

// NewEvaluationNotFoundError creates an error for when an evaluation is not found
func NewEvaluationNotFoundError(evaluationID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainEvaluation, "evaluation", evaluationID)
}

// NewQuestionNotFoundError creates an error for when a question is not found
func NewQuestionNotFoundError(questionID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainEvaluation, "question", questionID)
}

// NewQuestionnaireNotFoundError creates an error for when a questionnaire is not found
func NewQuestionnaireNotFoundError(questionnaireID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainEvaluation, "questionnaire", questionnaireID)
}

// NewPeriodNotFoundError creates an error for when an evaluation period is not found
func NewPeriodNotFoundError(periodID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainEvaluation, "evaluation_period", periodID)
}

// NewDuplicateEvaluationError creates an error for duplicate evaluation
func NewDuplicateEvaluationError(evaluatorID, evaluatedID, periodID string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainEvaluation,
		fmt.Sprintf("evaluation already exists for evaluator %s, evaluated %s in period %s", evaluatorID, evaluatedID, periodID),
		"Ya existe una evaluación para esta combinación",
	)
}

// NewPeriodClosedError creates an error when trying to submit evaluation in closed period
func NewPeriodClosedError(periodID string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainEvaluation,
		fmt.Sprintf("evaluation period %s is closed", periodID),
		"El período de evaluación está cerrado",
	)
}

// NewInvalidScoreError creates an error for invalid score value
func NewInvalidScoreError(score float64, min, max float64) *apperrors.AppError {
	fields := []apperrors.FieldError{
		{
			Field:   "score",
			Message: fmt.Sprintf("score %.2f is out of valid range [%.2f, %.2f]", score, min, max),
			Code:    "INVALID_RANGE",
		},
	}
	validationErr := apperrors.NewValidationError(fields)
	return validationErr.AppError
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
