package cache

import "errors"

// Cache errors
var (
	ErrCacheClosed           = errors.New("cache: client is closed")
	ErrKeyNotFound           = errors.New("cache: key not found")
	ErrInvalidKey            = errors.New("cache: invalid key")
	ErrSerializationFailed   = errors.New("cache: serialization failed")
	ErrDeserializationFailed = errors.New("cache: deserialization failed")
	ErrConnectionFailed      = errors.New("cache: connection failed")
	ErrTimeout               = errors.New("cache: operation timed out")
)

// IsNotFoundError checks if an error indicates a cache miss.
func IsNotFoundError(err error) bool {
	return errors.Is(err, ErrKeyNotFound)
}

// IsCacheError checks if an error is a cache-related error.
func IsCacheError(err error) bool {
	return errors.Is(err, ErrCacheClosed) ||
		errors.Is(err, ErrKeyNotFound) ||
		errors.Is(err, ErrInvalidKey) ||
		errors.Is(err, ErrSerializationFailed) ||
		errors.Is(err, ErrDeserializationFailed) ||
		errors.Is(err, ErrConnectionFailed) ||
		errors.Is(err, ErrTimeout)
}
