package errors

import (
	"context"
	"fmt"
	"time"

	apperrors "sicora-be-go/pkg/errors"
)

const ServiceName = "kbservice"

// Domain constant for this service
const DomainKnowledgeBase apperrors.ErrorDomain = "KNOWLEDGEBASE"

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

// Domain-specific error factories for KBService

// NewDocumentNotFoundError creates an error for when a document is not found
func NewDocumentNotFoundError(documentID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainKnowledgeBase, "document", documentID)
}

// NewFAQNotFoundError creates an error for when a FAQ is not found
func NewFAQNotFoundError(faqID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainKnowledgeBase, "faq", faqID)
}

// NewCategoryNotFoundError creates an error for when a category is not found
func NewCategoryNotFoundError(categoryID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainKnowledgeBase, "category", categoryID)
}

// NewTagNotFoundError creates an error for when a tag is not found
func NewTagNotFoundError(tagID string) *apperrors.AppError {
	return apperrors.NewNotFoundError(DomainKnowledgeBase, "tag", tagID)
}

// NewDuplicateDocumentError creates an error for duplicate document
func NewDuplicateDocumentError(title string) *apperrors.AppError {
	return apperrors.NewConflictError(
		DomainKnowledgeBase,
		fmt.Sprintf("document with title '%s' already exists", title),
		"Ya existe un documento con este título",
	)
}

// NewInvalidDocumentFormatError creates an error for invalid document format
func NewInvalidDocumentFormatError(format string) *apperrors.AppError {
	fields := []apperrors.FieldError{
		{
			Field:   "format",
			Message: fmt.Sprintf("unsupported document format: %s", format),
			Code:    "INVALID_FORMAT",
		},
	}
	return apperrors.NewValidationError(fields).AppError
}

// NewSearchError creates an error for search failures
func NewSearchError(query string, cause error) *apperrors.AppError {
	return apperrors.NewInternalError(
		fmt.Sprintf("search failed for query '%s'", query),
		cause,
	)
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
