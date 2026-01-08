package errors

// ErrorDomain represents the domain/module where the error originated
type ErrorDomain string

const (
	// DomainUser - User management domain
	DomainUser ErrorDomain = "USER"
	// DomainAuth - Authentication/Authorization domain
	DomainAuth ErrorDomain = "AUTH"
	// DomainDB - Database domain
	DomainDB ErrorDomain = "DB"
	// DomainCache - Cache/Redis domain
	DomainCache ErrorDomain = "CACHE"
	// DomainValidation - Input validation domain
	DomainValidation ErrorDomain = "VALID"
	// DomainBusiness - Business rules domain
	DomainBusiness ErrorDomain = "BIZ"
	// DomainExternal - External services domain
	DomainExternal ErrorDomain = "EXT"
	// DomainSystem - System/Infrastructure domain
	DomainSystem ErrorDomain = "SYS"
	// DomainSchedule - Schedule management domain
	DomainSchedule ErrorDomain = "SCHED"
	// DomainAttendance - Attendance management domain
	DomainAttendance ErrorDomain = "ATTEND"
	// DomainEvaluation - Evaluation domain
	DomainEvaluation ErrorDomain = "EVAL"
	// DomainKB - Knowledge Base domain
	DomainKB ErrorDomain = "KB"
)

// ErrorCategory represents the category/type of error
type ErrorCategory string

const (
	// CategoryValidation - Input validation errors (400)
	CategoryValidation ErrorCategory = "VALIDATION"
	// CategoryUnauthorized - Authentication errors (401)
	CategoryUnauthorized ErrorCategory = "UNAUTHORIZED"
	// CategoryForbidden - Authorization errors (403)
	CategoryForbidden ErrorCategory = "FORBIDDEN"
	// CategoryNotFound - Resource not found errors (404)
	CategoryNotFound ErrorCategory = "NOT_FOUND"
	// CategoryConflict - State conflict errors (409)
	CategoryConflict ErrorCategory = "CONFLICT"
	// CategoryUnprocessable - Business rule violations (422)
	CategoryUnprocessable ErrorCategory = "UNPROCESSABLE"
	// CategoryRateLimited - Rate limiting errors (429)
	CategoryRateLimited ErrorCategory = "RATE_LIMITED"
	// CategoryInternal - Internal server errors (500)
	CategoryInternal ErrorCategory = "INTERNAL"
	// CategoryUnavailable - Service unavailable errors (503)
	CategoryUnavailable ErrorCategory = "UNAVAILABLE"
	// CategoryTimeout - Timeout errors (504)
	CategoryTimeout ErrorCategory = "TIMEOUT"
)

// ErrorCode represents a unique, structured error code
// Format: [DOMAIN]_[TYPE]_[NUMBER] e.g., USER_NOT_FOUND_001
type ErrorCode string

// ============================================================================
// Authentication/Authorization Error Codes
// ============================================================================

const (
	// AUTH_INVALID_CREDENTIALS_001 - Wrong email or password
	CodeAuthInvalidCredentials ErrorCode = "AUTH_INVALID_CREDENTIALS_001"
	// AUTH_TOKEN_EXPIRED_001 - JWT token has expired
	CodeAuthTokenExpired ErrorCode = "AUTH_TOKEN_EXPIRED_001"
	// AUTH_TOKEN_INVALID_001 - JWT token is malformed or invalid
	CodeAuthTokenInvalid ErrorCode = "AUTH_TOKEN_INVALID_001"
	// AUTH_TOKEN_MISSING_001 - No token provided
	CodeAuthTokenMissing ErrorCode = "AUTH_TOKEN_MISSING_001"
	// AUTH_REFRESH_EXPIRED_001 - Refresh token has expired
	CodeAuthRefreshExpired ErrorCode = "AUTH_REFRESH_EXPIRED_001"
	// AUTH_ACCOUNT_LOCKED_001 - Account is locked
	CodeAuthAccountLocked ErrorCode = "AUTH_ACCOUNT_LOCKED_001"
	// AUTH_ACCOUNT_INACTIVE_001 - Account is inactive
	CodeAuthAccountInactive ErrorCode = "AUTH_ACCOUNT_INACTIVE_001"
	// AUTH_PASSWORD_EXPIRED_001 - Password has expired
	CodeAuthPasswordExpired ErrorCode = "AUTH_PASSWORD_EXPIRED_001"
	// AUTH_INSUFFICIENT_PERMISSIONS_001 - User lacks required permissions
	CodeAuthInsufficientPermissions ErrorCode = "AUTH_INSUFFICIENT_PERMISSIONS_001"
	// AUTH_SESSION_EXPIRED_001 - User session has expired
	CodeAuthSessionExpired ErrorCode = "AUTH_SESSION_EXPIRED_001"
)

// ============================================================================
// User Management Error Codes
// ============================================================================

const (
	// USER_NOT_FOUND_001 - User does not exist
	CodeUserNotFound ErrorCode = "USER_NOT_FOUND_001"
	// USER_EMAIL_EXISTS_001 - Email already registered
	CodeUserEmailExists ErrorCode = "USER_EMAIL_EXISTS_001"
	// USER_DOCUMENT_EXISTS_001 - Document number already registered
	CodeUserDocumentExists ErrorCode = "USER_DOCUMENT_EXISTS_001"
	// USER_INACTIVE_001 - User account is inactive
	CodeUserInactive ErrorCode = "USER_INACTIVE_001"
	// USER_CREATION_FAILED_001 - Failed to create user
	CodeUserCreationFailed ErrorCode = "USER_CREATION_FAILED_001"
	// USER_UPDATE_FAILED_001 - Failed to update user
	CodeUserUpdateFailed ErrorCode = "USER_UPDATE_FAILED_001"
	// USER_DELETE_FAILED_001 - Failed to delete user
	CodeUserDeleteFailed ErrorCode = "USER_DELETE_FAILED_001"
)

// ============================================================================
// Validation Error Codes
// ============================================================================

const (
	// VALID_REQUIRED_FIELD_001 - Required field is missing
	CodeValidRequiredField ErrorCode = "VALID_REQUIRED_FIELD_001"
	// VALID_EMAIL_FORMAT_001 - Invalid email format
	CodeValidEmailFormat ErrorCode = "VALID_EMAIL_FORMAT_001"
	// VALID_PASSWORD_WEAK_001 - Password doesn't meet requirements
	CodeValidPasswordWeak ErrorCode = "VALID_PASSWORD_WEAK_001"
	// VALID_PASSWORD_MISMATCH_001 - Passwords don't match
	CodeValidPasswordMismatch ErrorCode = "VALID_PASSWORD_MISMATCH_001"
	// VALID_UUID_FORMAT_001 - Invalid UUID format
	CodeValidUUIDFormat ErrorCode = "VALID_UUID_FORMAT_001"
	// VALID_DATE_FORMAT_001 - Invalid date format
	CodeValidDateFormat ErrorCode = "VALID_DATE_FORMAT_001"
	// VALID_DATE_RANGE_001 - Invalid date range (start > end)
	CodeValidDateRange ErrorCode = "VALID_DATE_RANGE_001"
	// VALID_STRING_LENGTH_001 - String length out of bounds
	CodeValidStringLength ErrorCode = "VALID_STRING_LENGTH_001"
	// VALID_NUMERIC_RANGE_001 - Number out of allowed range
	CodeValidNumericRange ErrorCode = "VALID_NUMERIC_RANGE_001"
	// VALID_ENUM_VALUE_001 - Value not in allowed enum
	CodeValidEnumValue ErrorCode = "VALID_ENUM_VALUE_001"
	// VALID_JSON_FORMAT_001 - Invalid JSON format
	CodeValidJSONFormat ErrorCode = "VALID_JSON_FORMAT_001"
	// VALID_FILE_TYPE_001 - Invalid file type
	CodeValidFileType ErrorCode = "VALID_FILE_TYPE_001"
	// VALID_FILE_SIZE_001 - File size exceeds limit
	CodeValidFileSize ErrorCode = "VALID_FILE_SIZE_001"
)

// ============================================================================
// Database Error Codes
// ============================================================================

const (
	// DB_CONNECTION_001 - Failed to connect to database
	CodeDBConnection ErrorCode = "DB_CONNECTION_001"
	// DB_QUERY_001 - Query execution failed
	CodeDBQuery ErrorCode = "DB_QUERY_001"
	// DB_CONSTRAINT_001 - Constraint violation
	CodeDBConstraint ErrorCode = "DB_CONSTRAINT_001"
	// DB_UNIQUE_001 - Unique constraint violation
	CodeDBUnique ErrorCode = "DB_UNIQUE_001"
	// DB_FOREIGN_KEY_001 - Foreign key constraint violation
	CodeDBForeignKey ErrorCode = "DB_FOREIGN_KEY_001"
	// DB_NOT_NULL_001 - Not null constraint violation
	CodeDBNotNull ErrorCode = "DB_NOT_NULL_001"
	// DB_DEADLOCK_001 - Deadlock detected
	CodeDBDeadlock ErrorCode = "DB_DEADLOCK_001"
	// DB_TIMEOUT_001 - Query timeout
	CodeDBTimeout ErrorCode = "DB_TIMEOUT_001"
	// DB_TRANSACTION_001 - Transaction failed
	CodeDBTransaction ErrorCode = "DB_TRANSACTION_001"
)

// ============================================================================
// Cache Error Codes
// ============================================================================

const (
	// CACHE_CONNECTION_001 - Failed to connect to cache
	CodeCacheConnection ErrorCode = "CACHE_CONNECTION_001"
	// CACHE_TIMEOUT_001 - Cache operation timeout
	CodeCacheTimeout ErrorCode = "CACHE_TIMEOUT_001"
	// CACHE_SERIALIZATION_001 - Serialization error
	CodeCacheSerialization ErrorCode = "CACHE_SERIALIZATION_001"
	// CACHE_KEY_NOT_FOUND_001 - Key not found in cache
	CodeCacheKeyNotFound ErrorCode = "CACHE_KEY_NOT_FOUND_001"
)

// ============================================================================
// Business Logic Error Codes
// ============================================================================

const (
	// BIZ_INVALID_STATE_001 - Invalid state transition
	CodeBizInvalidState ErrorCode = "BIZ_INVALID_STATE_001"
	// BIZ_DUPLICATE_001 - Duplicate operation attempted
	CodeBizDuplicate ErrorCode = "BIZ_DUPLICATE_001"
	// BIZ_LIMIT_EXCEEDED_001 - Business limit exceeded
	CodeBizLimitExceeded ErrorCode = "BIZ_LIMIT_EXCEEDED_001"
	// BIZ_NOT_ALLOWED_001 - Operation not allowed
	CodeBizNotAllowed ErrorCode = "BIZ_NOT_ALLOWED_001"
	// BIZ_PREREQUISITE_001 - Prerequisite not met
	CodeBizPrerequisite ErrorCode = "BIZ_PREREQUISITE_001"
)

// ============================================================================
// Schedule Error Codes
// ============================================================================

const (
	// SCHED_NOT_FOUND_001 - Schedule not found
	CodeSchedNotFound ErrorCode = "SCHED_NOT_FOUND_001"
	// SCHED_CONFLICT_001 - Schedule conflict detected
	CodeSchedConflict ErrorCode = "SCHED_CONFLICT_001"
	// SCHED_VENUE_OCCUPIED_001 - Venue already occupied
	CodeSchedVenueOccupied ErrorCode = "SCHED_VENUE_OCCUPIED_001"
	// SCHED_INSTRUCTOR_BUSY_001 - Instructor already assigned
	CodeSchedInstructorBusy ErrorCode = "SCHED_INSTRUCTOR_BUSY_001"
	// SCHED_INVALID_TIME_001 - Invalid time range
	CodeSchedInvalidTime ErrorCode = "SCHED_INVALID_TIME_001"
)

// ============================================================================
// Attendance Error Codes
// ============================================================================

const (
	// ATTEND_NOT_FOUND_001 - Attendance record not found
	CodeAttendNotFound ErrorCode = "ATTEND_NOT_FOUND_001"
	// ATTEND_DUPLICATE_001 - Attendance already registered
	CodeAttendDuplicate ErrorCode = "ATTEND_DUPLICATE_001"
	// ATTEND_QR_EXPIRED_001 - QR code has expired
	CodeAttendQRExpired ErrorCode = "ATTEND_QR_EXPIRED_001"
	// ATTEND_QR_INVALID_001 - QR code is invalid
	CodeAttendQRInvalid ErrorCode = "ATTEND_QR_INVALID_001"
	// ATTEND_OUTSIDE_WINDOW_001 - Outside attendance window
	CodeAttendOutsideWindow ErrorCode = "ATTEND_OUTSIDE_WINDOW_001"
)

// ============================================================================
// System Error Codes
// ============================================================================

const (
	// SYS_INTERNAL_001 - Internal server error
	CodeSysInternal ErrorCode = "SYS_INTERNAL_001"
	// SYS_UNAVAILABLE_001 - Service temporarily unavailable
	CodeSysUnavailable ErrorCode = "SYS_UNAVAILABLE_001"
	// SYS_TIMEOUT_001 - Operation timeout
	CodeSysTimeout ErrorCode = "SYS_TIMEOUT_001"
	// SYS_RATE_LIMIT_001 - Rate limit exceeded
	CodeSysRateLimit ErrorCode = "SYS_RATE_LIMIT_001"
	// SYS_MAINTENANCE_001 - System under maintenance
	CodeSysMaintenance ErrorCode = "SYS_MAINTENANCE_001"
)

// ============================================================================
// External Service Error Codes
// ============================================================================

const (
	// EXT_CONNECTION_001 - Failed to connect to external service
	CodeExtConnection ErrorCode = "EXT_CONNECTION_001"
	// EXT_TIMEOUT_001 - External service timeout
	CodeExtTimeout ErrorCode = "EXT_TIMEOUT_001"
	// EXT_RESPONSE_001 - Invalid response from external service
	CodeExtResponse ErrorCode = "EXT_RESPONSE_001"
)
