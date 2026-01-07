package cache

import (
	"context"
	"testing"
	"time"
)

func TestMockCache_SetAndGet(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Test Set and Get
	err := cache.Set(ctx, "test-key", []byte("test-value"), time.Minute)
	if err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	value, err := cache.Get(ctx, "test-key")
	if err != nil {
		t.Fatalf("Get failed: %v", err)
	}

	if string(value) != "test-value" {
		t.Errorf("Expected 'test-value', got '%s'", string(value))
	}
}

func TestMockCache_KeyNotFound(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	_, err := cache.Get(ctx, "nonexistent-key")
	if err != ErrKeyNotFound {
		t.Errorf("Expected ErrKeyNotFound, got %v", err)
	}
}

func TestMockCache_Delete(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Set a value
	_ = cache.Set(ctx, "delete-key", []byte("value"), time.Minute)

	// Delete it
	err := cache.Delete(ctx, "delete-key")
	if err != nil {
		t.Fatalf("Delete failed: %v", err)
	}

	// Verify it's gone
	_, err = cache.Get(ctx, "delete-key")
	if err != ErrKeyNotFound {
		t.Errorf("Expected ErrKeyNotFound after delete, got %v", err)
	}
}

func TestMockCache_Exists(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Key doesn't exist
	exists, err := cache.Exists(ctx, "test-key")
	if err != nil {
		t.Fatalf("Exists failed: %v", err)
	}
	if exists {
		t.Error("Key should not exist")
	}

	// Add key
	_ = cache.Set(ctx, "test-key", []byte("value"), time.Minute)

	// Key should exist
	exists, err = cache.Exists(ctx, "test-key")
	if err != nil {
		t.Fatalf("Exists failed: %v", err)
	}
	if !exists {
		t.Error("Key should exist")
	}
}

func TestMockCache_DeletePattern(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Add multiple keys
	_ = cache.Set(ctx, "campus:1", []byte("value1"), time.Minute)
	_ = cache.Set(ctx, "campus:2", []byte("value2"), time.Minute)
	_ = cache.Set(ctx, "campus:3", []byte("value3"), time.Minute)
	_ = cache.Set(ctx, "program:1", []byte("prog1"), time.Minute)

	// Delete pattern
	deleted, err := cache.DeletePattern(ctx, "campus:*")
	if err != nil {
		t.Fatalf("DeletePattern failed: %v", err)
	}

	if deleted != 3 {
		t.Errorf("Expected 3 deleted, got %d", deleted)
	}

	// Verify campus keys are gone
	_, err = cache.Get(ctx, "campus:1")
	if err != ErrKeyNotFound {
		t.Error("campus:1 should be deleted")
	}

	// Verify program key still exists
	_, err = cache.Get(ctx, "program:1")
	if err != nil {
		t.Error("program:1 should still exist")
	}
}

func TestMockCache_GetMany(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Set values
	_ = cache.Set(ctx, "key1", []byte("value1"), time.Minute)
	_ = cache.Set(ctx, "key2", []byte("value2"), time.Minute)
	_ = cache.Set(ctx, "key3", []byte("value3"), time.Minute)

	// Get many
	result, err := cache.GetMany(ctx, []string{"key1", "key2", "nonexistent"})
	if err != nil {
		t.Fatalf("GetMany failed: %v", err)
	}

	if len(result) != 2 {
		t.Errorf("Expected 2 results, got %d", len(result))
	}

	if string(result["key1"]) != "value1" {
		t.Errorf("Expected 'value1' for key1")
	}

	if string(result["key2"]) != "value2" {
		t.Errorf("Expected 'value2' for key2")
	}
}

func TestMockCache_SetMany(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	items := map[string][]byte{
		"multi1": []byte("val1"),
		"multi2": []byte("val2"),
		"multi3": []byte("val3"),
	}

	err := cache.SetMany(ctx, items, time.Minute)
	if err != nil {
		t.Fatalf("SetMany failed: %v", err)
	}

	// Verify all were set
	for key, expected := range items {
		value, err := cache.Get(ctx, key)
		if err != nil {
			t.Errorf("Get %s failed: %v", key, err)
			continue
		}
		if string(value) != string(expected) {
			t.Errorf("For %s: expected '%s', got '%s'", key, string(expected), string(value))
		}
	}
}

func TestMockCache_Close(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Set a value
	_ = cache.Set(ctx, "key", []byte("value"), time.Minute)

	// Close
	err := cache.Close()
	if err != nil {
		t.Fatalf("Close failed: %v", err)
	}

	// Operations should fail
	_, err = cache.Get(ctx, "key")
	if err != ErrCacheClosed {
		t.Errorf("Expected ErrCacheClosed, got %v", err)
	}

	err = cache.Set(ctx, "new-key", []byte("value"), time.Minute)
	if err != ErrCacheClosed {
		t.Errorf("Expected ErrCacheClosed, got %v", err)
	}
}

func TestMockCache_TTL(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Set with TTL
	_ = cache.Set(ctx, "ttl-key", []byte("value"), time.Second*5)

	// Get TTL
	ttl, err := cache.GetTTL(ctx, "ttl-key")
	if err != nil {
		t.Fatalf("GetTTL failed: %v", err)
	}

	// TTL should be around 5 seconds (allowing for some execution time)
	if ttl < time.Second*4 || ttl > time.Second*6 {
		t.Errorf("Expected TTL around 5s, got %v", ttl)
	}

	// Set new TTL
	err = cache.SetTTL(ctx, "ttl-key", time.Minute)
	if err != nil {
		t.Fatalf("SetTTL failed: %v", err)
	}

	// Verify new TTL
	ttl, _ = cache.GetTTL(ctx, "ttl-key")
	if ttl < time.Second*55 || ttl > time.Second*65 {
		t.Errorf("Expected TTL around 60s, got %v", ttl)
	}
}

func TestMockCache_Stats(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Generate some hits and misses
	_ = cache.Set(ctx, "key", []byte("value"), time.Minute)
	_, _ = cache.Get(ctx, "key")          // Hit
	_, _ = cache.Get(ctx, "key")          // Hit
	_, _ = cache.Get(ctx, "nonexistent")  // Miss
	_, _ = cache.Get(ctx, "nonexistent2") // Miss

	stats, err := cache.Stats(ctx)
	if err != nil {
		t.Fatalf("Stats failed: %v", err)
	}

	if stats.Hits != 2 {
		t.Errorf("Expected 2 hits, got %d", stats.Hits)
	}

	if stats.Misses != 2 {
		t.Errorf("Expected 2 misses, got %d", stats.Misses)
	}

	if stats.Keys != 1 {
		t.Errorf("Expected 1 key, got %d", stats.Keys)
	}
}

func TestMockCache_Ping(t *testing.T) {
	cache := NewMockCache()
	ctx := context.Background()

	// Normal ping
	err := cache.Ping(ctx)
	if err != nil {
		t.Fatalf("Ping failed: %v", err)
	}

	// Set to fail next
	cache.SetFailNext(true)
	err = cache.Ping(ctx)
	if err != ErrConnectionFailed {
		t.Errorf("Expected ErrConnectionFailed, got %v", err)
	}
}

// Test key builders
func TestKeyBuilders(t *testing.T) {
	// Schedule keys
	if Schedule().Campus("123") != "campus:123" {
		t.Error("Schedule.Campus key mismatch")
	}
	if Schedule().CampusAll() != "campus:all" {
		t.Error("Schedule.CampusAll key mismatch")
	}
	if Schedule().Program("456") != "program:456" {
		t.Error("Schedule.Program key mismatch")
	}
	if Schedule().GroupsByProgram("789") != "group:program:789" {
		t.Error("Schedule.GroupsByProgram key mismatch")
	}

	// User keys
	if User().ByID("user123") != "user:user123" {
		t.Error("User.ByID key mismatch")
	}
	if User().ByEmail("test@example.com") != "user:email:test@example.com" {
		t.Error("User.ByEmail key mismatch")
	}
	if User().InstructorsActive() != "users:instructors:active" {
		t.Error("User.InstructorsActive key mismatch")
	}

	// KB keys
	if Kb().FAQ("faq1") != "faq:faq1" {
		t.Error("Kb.FAQ key mismatch")
	}
	if Kb().CategoriesAll() != "category:all" {
		t.Error("Kb.CategoriesAll key mismatch")
	}

	// Pattern keys
	if Pattern().AllCampuses() != "campus:*" {
		t.Error("Pattern.AllCampuses mismatch")
	}
	if Pattern().AllUsers() != "user:*" {
		t.Error("Pattern.AllUsers mismatch")
	}
}

// Test TTL constants
func TestTTLConstants(t *testing.T) {
	if TTLVeryStable != 24*time.Hour {
		t.Error("TTLVeryStable should be 24 hours")
	}
	if TTLStable != 12*time.Hour {
		t.Error("TTLStable should be 12 hours")
	}
	if TTLSemiStable != 6*time.Hour {
		t.Error("TTLSemiStable should be 6 hours")
	}
	if TTLModerate != time.Hour {
		t.Error("TTLModerate should be 1 hour")
	}
	if TTLDynamic != 30*time.Minute {
		t.Error("TTLDynamic should be 30 minutes")
	}
}

// Test default config
func TestDefaultConfig(t *testing.T) {
	cfg := DefaultConfig()

	if cfg.Addr != "localhost:6379" {
		t.Errorf("Expected localhost:6379, got %s", cfg.Addr)
	}
	if cfg.DB != 0 {
		t.Errorf("Expected DB 0, got %d", cfg.DB)
	}
	if cfg.PoolSize != 10 {
		t.Errorf("Expected PoolSize 10, got %d", cfg.PoolSize)
	}
	if cfg.DefaultTTL != time.Hour {
		t.Errorf("Expected DefaultTTL 1h, got %v", cfg.DefaultTTL)
	}
}

// Test errors
func TestErrors(t *testing.T) {
	if !IsNotFoundError(ErrKeyNotFound) {
		t.Error("ErrKeyNotFound should be a not found error")
	}
	if IsNotFoundError(ErrCacheClosed) {
		t.Error("ErrCacheClosed should not be a not found error")
	}
	if !IsCacheError(ErrCacheClosed) {
		t.Error("ErrCacheClosed should be a cache error")
	}
	if !IsCacheError(ErrKeyNotFound) {
		t.Error("ErrKeyNotFound should be a cache error")
	}
}
