package errors

import (
	"context"
	"database/sql"
	"fmt"
)

// ============================================================================
// TRANSACTION MANAGER
// ============================================================================

// TxManager manages database transactions with automatic rollback on errors
type TxManager struct {
	db *sql.DB
}

// NewTxManager creates a new transaction manager
func NewTxManager(db *sql.DB) *TxManager {
	return &TxManager{db: db}
}

// TxOptions configures transaction behavior
type TxOptions struct {
	Isolation sql.IsolationLevel
	ReadOnly  bool
}

// DefaultTxOptions returns default transaction options
func DefaultTxOptions() *TxOptions {
	return &TxOptions{
		Isolation: sql.LevelReadCommitted,
		ReadOnly:  false,
	}
}

// ReadOnlyTxOptions returns options for read-only transactions
func ReadOnlyTxOptions() *TxOptions {
	return &TxOptions{
		Isolation: sql.LevelReadCommitted,
		ReadOnly:  true,
	}
}

// SerializableTxOptions returns options for serializable transactions
func SerializableTxOptions() *TxOptions {
	return &TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	}
}

// ============================================================================
// TRANSACTION EXECUTION
// ============================================================================

// WithTransaction executes a function within a transaction
// Automatically commits on success and rolls back on error or panic
func (tm *TxManager) WithTransaction(ctx context.Context, fn func(tx *sql.Tx) error) error {
	return tm.WithTransactionOptions(ctx, DefaultTxOptions(), fn)
}

// WithTransactionOptions executes a function within a transaction with custom options
func (tm *TxManager) WithTransactionOptions(ctx context.Context, opts *TxOptions, fn func(tx *sql.Tx) error) (err error) {
	tx, err := tm.db.BeginTx(ctx, &sql.TxOptions{
		Isolation: opts.Isolation,
		ReadOnly:  opts.ReadOnly,
	})
	if err != nil {
		return NewDatabaseError("begin_transaction", err)
	}

	// Ensure rollback on panic
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			// Re-wrap panic as error
			switch v := p.(type) {
			case error:
				err = NewInternalError("transaction panic", v).WithStack()
			default:
				err = NewInternalError(fmt.Sprintf("transaction panic: %v", p), nil).WithStack()
			}
		}
	}()

	// Execute the function
	if err = fn(tx); err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			// Log rollback error but return original error
			err = Wrap(err, fmt.Sprintf("rollback failed: %v", rbErr))
		}
		return WrapWithContext(ctx, err, "transaction")
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return NewDatabaseError("commit_transaction", err)
	}

	return nil
}

// WithReadOnlyTransaction executes a read-only transaction
func (tm *TxManager) WithReadOnlyTransaction(ctx context.Context, fn func(tx *sql.Tx) error) error {
	return tm.WithTransactionOptions(ctx, ReadOnlyTxOptions(), fn)
}

// ============================================================================
// UNIT OF WORK PATTERN
// ============================================================================

// UnitOfWork represents a transactional unit of work
type UnitOfWork struct {
	tx         *sql.Tx
	committed  bool
	rolledBack bool
}

// NewUnitOfWork creates a new unit of work from a transaction
func NewUnitOfWork(tx *sql.Tx) *UnitOfWork {
	return &UnitOfWork{
		tx:         tx,
		committed:  false,
		rolledBack: false,
	}
}

// Tx returns the underlying transaction
func (uow *UnitOfWork) Tx() *sql.Tx {
	return uow.tx
}

// Commit commits the transaction
func (uow *UnitOfWork) Commit() error {
	if uow.committed || uow.rolledBack {
		return NewBusinessError(
			CodeBizInvalidState,
			"transaction already finalized",
			"La transacción ya fue finalizada",
		)
	}
	if err := uow.tx.Commit(); err != nil {
		return NewDatabaseError("commit", err)
	}
	uow.committed = true
	return nil
}

// Rollback rolls back the transaction
func (uow *UnitOfWork) Rollback() error {
	if uow.committed {
		return NewBusinessError(
			CodeBizInvalidState,
			"cannot rollback committed transaction",
			"No se puede revertir una transacción confirmada",
		)
	}
	if uow.rolledBack {
		return nil // Already rolled back, no error
	}
	if err := uow.tx.Rollback(); err != nil {
		return NewDatabaseError("rollback", err)
	}
	uow.rolledBack = true
	return nil
}

// IsFinalized returns true if the transaction has been committed or rolled back
func (uow *UnitOfWork) IsFinalized() bool {
	return uow.committed || uow.rolledBack
}

// ============================================================================
// SAVEPOINT SUPPORT
// ============================================================================

// Savepoint represents a transaction savepoint
type Savepoint struct {
	uow  *UnitOfWork
	name string
}

// CreateSavepoint creates a savepoint within a unit of work
func (uow *UnitOfWork) CreateSavepoint(ctx context.Context, name string) (*Savepoint, error) {
	_, err := uow.tx.ExecContext(ctx, fmt.Sprintf("SAVEPOINT %s", name))
	if err != nil {
		return nil, NewDatabaseError("create_savepoint", err)
	}
	return &Savepoint{uow: uow, name: name}, nil
}

// Rollback rolls back to this savepoint
func (sp *Savepoint) Rollback(ctx context.Context) error {
	_, err := sp.uow.tx.ExecContext(ctx, fmt.Sprintf("ROLLBACK TO SAVEPOINT %s", sp.name))
	if err != nil {
		return NewDatabaseError("rollback_savepoint", err)
	}
	return nil
}

// Release releases this savepoint
func (sp *Savepoint) Release(ctx context.Context) error {
	_, err := sp.uow.tx.ExecContext(ctx, fmt.Sprintf("RELEASE SAVEPOINT %s", sp.name))
	if err != nil {
		return NewDatabaseError("release_savepoint", err)
	}
	return nil
}

// ============================================================================
// TRANSACTION-SAFE OPERATIONS
// ============================================================================

// TxExecutor interface for transaction-aware operations
type TxExecutor interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
}

// ExecuteInTx executes a query within a transaction or connection
func ExecuteInTx(ctx context.Context, exec TxExecutor, query string, args ...interface{}) (sql.Result, error) {
	result, err := exec.ExecContext(ctx, query, args...)
	if err != nil {
		return nil, WrapDatabaseError(err, "execute")
	}
	return result, nil
}

// QueryInTx queries within a transaction or connection
func QueryInTx(ctx context.Context, exec TxExecutor, query string, args ...interface{}) (*sql.Rows, error) {
	rows, err := exec.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, WrapDatabaseError(err, "query")
	}
	return rows, nil
}

// QueryRowInTx queries a single row within a transaction or connection
func QueryRowInTx(ctx context.Context, exec TxExecutor, query string, args ...interface{}) *sql.Row {
	return exec.QueryRowContext(ctx, query, args...)
}

// ============================================================================
// DATABASE ERROR WRAPPING
// ============================================================================

// WrapDatabaseError wraps a database error with appropriate error type
func WrapDatabaseError(err error, operation string) *AppError {
	if err == nil {
		return nil
	}

	// Check for specific database errors
	errStr := err.Error()

	// No rows found
	if err == sql.ErrNoRows {
		return newError(
			CodeDBQuery,
			DomainDB,
			CategoryNotFound,
			fmt.Sprintf("No rows found during %s", operation),
			"No se encontraron resultados",
			404,
			false,
		).WithCause(err)
	}

	// Connection errors
	if containsAny(errStr, "connection refused", "connection reset", "no connection") {
		return NewDatabaseConnectionError(err)
	}

	// Timeout errors
	if containsAny(errStr, "timeout", "deadline exceeded", "context canceled") {
		return NewDatabaseTimeoutError(operation)
	}

	// Deadlock
	if containsAny(errStr, "deadlock", "lock wait timeout") {
		return NewDeadlockError(err)
	}

	// Unique constraint violation
	if containsAny(errStr, "duplicate key", "unique constraint", "UNIQUE constraint") {
		return newError(
			CodeDBUnique,
			DomainDB,
			CategoryConflict,
			fmt.Sprintf("Unique constraint violation during %s", operation),
			"Este registro ya existe",
			409,
			false,
		).WithCause(err)
	}

	// Foreign key violation
	if containsAny(errStr, "foreign key", "FOREIGN KEY constraint") {
		return newError(
			CodeDBForeignKey,
			DomainDB,
			CategoryUnprocessable,
			fmt.Sprintf("Foreign key violation during %s", operation),
			"El registro referenciado no existe",
			422,
			false,
		).WithCause(err)
	}

	// Check constraint violation
	if containsAny(errStr, "check constraint", "CHECK constraint") {
		return newError(
			CodeDBConstraint,
			DomainDB,
			CategoryValidation,
			fmt.Sprintf("Check constraint violation during %s", operation),
			"Los datos no cumplen con las restricciones",
			400,
			false,
		).WithCause(err)
	}

	// Default database error
	return NewDatabaseError(operation, err)
}

// containsAny checks if str contains any of the substrings
func containsAny(str string, substrings ...string) bool {
	lowerStr := stringToLower(str)
	for _, sub := range substrings {
		if stringContains(lowerStr, stringToLower(sub)) {
			return true
		}
	}
	return false
}

// stringToLower converts string to lowercase (simple implementation)
func stringToLower(s string) string {
	result := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			result[i] = c + 32
		} else {
			result[i] = c
		}
	}
	return string(result)
}

// stringContains checks if s contains substr
func stringContains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 || findSubstring(s, substr) >= 0)
}

// findSubstring finds substr in s
func findSubstring(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}

// ============================================================================
// BATCH OPERATIONS WITH TRANSACTION
// ============================================================================

// BatchResult represents the result of a batch operation
type BatchResult struct {
	Succeeded int
	Failed    int
	Errors    []BatchError
}

// BatchError represents an error in a batch operation
type BatchError struct {
	Index int
	Item  interface{}
	Error error
}

// BatchOperation represents a single operation in a batch
type BatchOperation func(tx *sql.Tx, index int) error

// ExecuteBatch executes multiple operations in a single transaction
// Rolls back all if any operation fails
func (tm *TxManager) ExecuteBatch(ctx context.Context, operations []BatchOperation) (*BatchResult, error) {
	result := &BatchResult{
		Errors: make([]BatchError, 0),
	}

	err := tm.WithTransaction(ctx, func(tx *sql.Tx) error {
		for i, op := range operations {
			if err := op(tx, i); err != nil {
				result.Failed++
				result.Errors = append(result.Errors, BatchError{
					Index: i,
					Error: err,
				})
				return Wrapf(err, "batch operation failed at index %d", i)
			}
			result.Succeeded++
		}
		return nil
	})

	if err != nil {
		// Reset succeeded count on rollback
		result.Succeeded = 0
		result.Failed = len(operations)
	}

	return result, err
}

// ExecuteBatchPartial executes multiple operations, continuing on errors
// Each operation runs in its own savepoint
func (tm *TxManager) ExecuteBatchPartial(ctx context.Context, operations []BatchOperation) (*BatchResult, error) {
	result := &BatchResult{
		Errors: make([]BatchError, 0),
	}

	err := tm.WithTransaction(ctx, func(tx *sql.Tx) error {
		uow := NewUnitOfWork(tx)

		for i, op := range operations {
			sp, err := uow.CreateSavepoint(ctx, fmt.Sprintf("op_%d", i))
			if err != nil {
				return err
			}

			if err := op(tx, i); err != nil {
				result.Failed++
				result.Errors = append(result.Errors, BatchError{
					Index: i,
					Error: err,
				})
				// Rollback to savepoint and continue
				if rbErr := sp.Rollback(ctx); rbErr != nil {
					return rbErr
				}
			} else {
				result.Succeeded++
				if err := sp.Release(ctx); err != nil {
					return err
				}
			}
		}
		return nil
	})

	return result, err
}
