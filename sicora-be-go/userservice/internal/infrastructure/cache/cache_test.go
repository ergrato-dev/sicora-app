package cache

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"sicora-be-go/pkg/cache"

	"userservice/internal/domain/entities"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestCache(t *testing.T) (*UserServiceCache, func()) {
	logger := log.New(os.Stdout, "[TEST] ", log.LstdFlags)
	mockCache := cache.NewMockCache()
	serviceCache := NewUserServiceCache(mockCache, logger)

	cleanup := func() {
		_ = serviceCache.Close()
	}

	return serviceCache, cleanup
}

func createTestUser() *entities.User {
	return &entities.User{
		ID:                uuid.New(),
		Nombre:            "Juan",
		Apellido:          "Pérez",
		Email:             "juan.perez@example.com",
		Documento:         "12345678",
		Rol:               entities.RoleInstructor,
		ProgramaFormacion: "ADSO",
		IsActive:          true,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}
}

func TestUserServiceCache_User(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	user := createTestUser()

	// Set
	err := serviceCache.SetUser(ctx, user)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetUser(ctx, user.ID.String())
	require.NoError(t, err)
	assert.Equal(t, user.Email, retrieved.Email)
	assert.Equal(t, user.Nombre, retrieved.Nombre)
}

func TestUserServiceCache_UserByEmail(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	user := createTestUser()

	// Set
	err := serviceCache.SetUserByEmail(ctx, user)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetUserByEmail(ctx, user.Email)
	require.NoError(t, err)
	assert.Equal(t, user.ID, retrieved.ID)
}

func TestUserServiceCache_UserByDocument(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	user := createTestUser()

	// Set
	err := serviceCache.SetUserByDocument(ctx, user)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetUserByDocument(ctx, user.Documento)
	require.NoError(t, err)
	assert.Equal(t, user.ID, retrieved.ID)
}

func TestUserServiceCache_Profile(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	user := createTestUser()

	// Set
	err := serviceCache.SetProfile(ctx, user)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetProfile(ctx, user.ID.String())
	require.NoError(t, err)
	assert.Equal(t, user.Email, retrieved.Email)

	// Invalidate
	err = serviceCache.InvalidateProfile(ctx, user.ID.String())
	require.NoError(t, err)

	// Get after invalidate should fail
	_, err = serviceCache.GetProfile(ctx, user.ID.String())
	assert.Error(t, err)
}

func TestUserServiceCache_UsersByGroup(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	fichaID := "2540827"
	users := []*entities.User{
		createTestUser(),
		createTestUser(),
	}

	// Set
	err := serviceCache.SetUsersByGroup(ctx, fichaID, users)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetUsersByGroup(ctx, fichaID)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestUserServiceCache_ActiveInstructors(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	users := []*entities.User{
		createTestUser(),
		createTestUser(),
	}

	// Set
	err := serviceCache.SetActiveInstructors(ctx, users)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetActiveInstructors(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)

	// Invalidate
	err = serviceCache.InvalidateActiveInstructors(ctx)
	require.NoError(t, err)

	// Get after invalidate should fail
	_, err = serviceCache.GetActiveInstructors(ctx)
	assert.Error(t, err)
}

func TestUserServiceCache_ActiveApprentices(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	users := []*entities.User{
		{
			ID:       uuid.New(),
			Nombre:   "Maria",
			Apellido: "García",
			Email:    "maria@example.com",
			Rol:      entities.RoleAprendiz,
			IsActive: true,
		},
	}

	// Set
	err := serviceCache.SetActiveApprentices(ctx, users)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetActiveApprentices(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 1)
}

func TestUserServiceCache_InvalidateUser(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	user := createTestUser()

	// Set all indices
	_ = serviceCache.SetUser(ctx, user)
	_ = serviceCache.SetUserByEmail(ctx, user)
	_ = serviceCache.SetUserByDocument(ctx, user)

	// Verify they exist
	_, err := serviceCache.GetUser(ctx, user.ID.String())
	require.NoError(t, err)

	// Invalidate all
	err = serviceCache.InvalidateUser(ctx, user.ID.String(), user.Email, user.Documento)
	require.NoError(t, err)

	// All should be gone
	_, err = serviceCache.GetUser(ctx, user.ID.String())
	assert.Error(t, err)
}

func TestUserServiceCache_SetMultipleUsers(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	users := []*entities.User{
		createTestUser(),
		createTestUser(),
	}

	// Set multiple
	err := serviceCache.SetMultipleUsers(ctx, users)
	require.NoError(t, err)

	// Verify first user
	retrieved, err := serviceCache.GetUser(ctx, users[0].ID.String())
	require.NoError(t, err)
	assert.Equal(t, users[0].Email, retrieved.Email)
}

func TestUserServiceCache_Ping(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	err := serviceCache.Ping(ctx)
	require.NoError(t, err)
}

func TestUserServiceCache_TTLs(t *testing.T) {
	// Verify TTLs are set correctly according to business rules
	assert.Equal(t, 30*time.Minute, cache.TTLDynamic, "Users should have 30min TTL (dynamic)")
	assert.Equal(t, 6*time.Hour, cache.TTLSemiStable, "Role lists should have 6h TTL")
}
