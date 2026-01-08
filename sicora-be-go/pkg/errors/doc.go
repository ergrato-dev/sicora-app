// Package errors provides a centralized, robust error handling system
// for the SICORA backend services following the MANEJO_DE_ERRORES.md guide.
//
// Features:
//   - Categorized error types (Validation, Auth, NotFound, etc.)
//   - Structured error codes [DOMAIN]_[TYPE]_[NUMBER]
//   - HTTP status code mapping
//   - User-friendly messages (Spanish)
//   - Error wrapping with context
//   - Retryable error detection
//   - Structured logging support
//
// Usage:
//
//	err := errors.NewNotFoundError("USER", "user_id", "123")
//	if errors.IsNotFound(err) {
//	    // handle not found
//	}
package errors
