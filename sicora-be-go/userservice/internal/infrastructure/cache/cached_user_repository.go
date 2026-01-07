package cache

import (
	"context"
	"log"

	"userservice/internal/domain/entities"
	"userservice/internal/domain/repositories"

	"github.com/google/uuid"
)

// CachedUserRepository wraps UserRepository with caching.
type CachedUserRepository struct {
	repo   repositories.UserRepository
	cache  *UserServiceCache
	logger *log.Logger
}

// NewCachedUserRepository creates a new CachedUserRepository.
func NewCachedUserRepository(
	repo repositories.UserRepository,
	cache *UserServiceCache,
	logger *log.Logger,
) repositories.UserRepository {
	return &CachedUserRepository{
		repo:   repo,
		cache:  cache,
		logger: logger,
	}
}

// Create creates a new user (invalidates caches).
func (r *CachedUserRepository) Create(ctx context.Context, user *entities.User) error {
	if err := r.repo.Create(ctx, user); err != nil {
		return err
	}
	// Invalidate role-based caches
	_ = r.cache.InvalidateUsersByRole(ctx, string(user.Rol))
	if user.IsInstructor() {
		_ = r.cache.InvalidateActiveInstructors(ctx)
	}
	if user.IsAprendiz() {
		_ = r.cache.InvalidateActiveApprentices(ctx)
		if user.FichaID != nil {
			_ = r.cache.InvalidateUsersByGroup(ctx, *user.FichaID)
		}
	}
	return nil
}

// GetByID retrieves a user by ID (cache-aside pattern).
func (r *CachedUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.User, error) {
	// Try cache first
	user, err := r.cache.GetUser(ctx, id.String())
	if err == nil {
		return user, nil
	}

	// Cache miss - fetch from DB
	user, err = r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Store in cache
	if user != nil {
		_ = r.cache.SetUser(ctx, user)
	}

	return user, nil
}

// GetByEmail retrieves a user by email (cache-aside pattern).
func (r *CachedUserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	// Try cache first
	user, err := r.cache.GetUserByEmail(ctx, email)
	if err == nil {
		return user, nil
	}

	// Cache miss
	user, err = r.repo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	if user != nil {
		_ = r.cache.SetUserByEmail(ctx, user)
		_ = r.cache.SetUser(ctx, user) // Also cache by ID
	}

	return user, nil
}

// GetByDocumento retrieves a user by document (cache-aside pattern).
func (r *CachedUserRepository) GetByDocumento(ctx context.Context, documento string) (*entities.User, error) {
	// Try cache first
	user, err := r.cache.GetUserByDocument(ctx, documento)
	if err == nil {
		return user, nil
	}

	// Cache miss
	user, err = r.repo.GetByDocumento(ctx, documento)
	if err != nil {
		return nil, err
	}

	if user != nil {
		_ = r.cache.SetUserByDocument(ctx, user)
		_ = r.cache.SetUser(ctx, user)
	}

	return user, nil
}

// Update updates a user (invalidates cache).
func (r *CachedUserRepository) Update(ctx context.Context, user *entities.User) error {
	// Get old user data for proper cache invalidation
	oldUser, _ := r.repo.GetByID(ctx, user.ID)

	if err := r.repo.Update(ctx, user); err != nil {
		return err
	}

	// Invalidate cache
	_ = r.cache.InvalidateUser(ctx, user.ID.String(), user.Email, user.Documento)
	_ = r.cache.InvalidateProfile(ctx, user.ID.String())

	// If role changed, invalidate old and new role caches
	if oldUser != nil && oldUser.Rol != user.Rol {
		_ = r.cache.InvalidateUsersByRole(ctx, string(oldUser.Rol))
		_ = r.cache.InvalidateUsersByRole(ctx, string(user.Rol))
	}

	// Invalidate instructor/apprentice caches
	if user.IsInstructor() || (oldUser != nil && oldUser.IsInstructor()) {
		_ = r.cache.InvalidateActiveInstructors(ctx)
	}
	if user.IsAprendiz() || (oldUser != nil && oldUser.IsAprendiz()) {
		_ = r.cache.InvalidateActiveApprentices(ctx)
	}

	// Handle ficha changes
	if user.FichaID != nil {
		_ = r.cache.InvalidateUsersByGroup(ctx, *user.FichaID)
	}
	if oldUser != nil && oldUser.FichaID != nil {
		_ = r.cache.InvalidateUsersByGroup(ctx, *oldUser.FichaID)
	}

	return nil
}

// Delete soft-deletes a user (invalidates cache).
func (r *CachedUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// Get user before delete for cache invalidation
	user, _ := r.repo.GetByID(ctx, id)

	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	if user != nil {
		_ = r.cache.InvalidateUser(ctx, id.String(), user.Email, user.Documento)
		_ = r.cache.InvalidateProfile(ctx, id.String())
		_ = r.cache.InvalidateUsersByRole(ctx, string(user.Rol))
		if user.IsInstructor() {
			_ = r.cache.InvalidateActiveInstructors(ctx)
		}
		if user.IsAprendiz() {
			_ = r.cache.InvalidateActiveApprentices(ctx)
			if user.FichaID != nil {
				_ = r.cache.InvalidateUsersByGroup(ctx, *user.FichaID)
			}
		}
	}

	return nil
}

// List retrieves paginated users (not cached - dynamic filters).
func (r *CachedUserRepository) List(ctx context.Context, filters repositories.UserFilters) (*repositories.PaginatedUsers, error) {
	return r.repo.List(ctx, filters)
}

// GetByFicha retrieves users by ficha (cached).
func (r *CachedUserRepository) GetByFicha(ctx context.Context, fichaID string) ([]*entities.User, error) {
	// Try cache first
	users, err := r.cache.GetUsersByGroup(ctx, fichaID)
	if err == nil {
		return users, nil
	}

	// Cache miss
	users, err = r.repo.GetByFicha(ctx, fichaID)
	if err != nil {
		return nil, err
	}

	if len(users) > 0 {
		_ = r.cache.SetUsersByGroup(ctx, fichaID, users)
	}

	return users, nil
}

// ExistsByEmail checks if email exists (not cached - critical check).
func (r *CachedUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	return r.repo.ExistsByEmail(ctx, email)
}

// ExistsByDocumento checks if documento exists (not cached - critical check).
func (r *CachedUserRepository) ExistsByDocumento(ctx context.Context, documento string) (bool, error) {
	return r.repo.ExistsByDocumento(ctx, documento)
}

// BulkCreate creates multiple users (invalidates caches).
func (r *CachedUserRepository) BulkCreate(ctx context.Context, users []*entities.User) error {
	if err := r.repo.BulkCreate(ctx, users); err != nil {
		return err
	}
	// Invalidate all role caches
	_ = r.cache.InvalidateActiveInstructors(ctx)
	_ = r.cache.InvalidateActiveApprentices(ctx)
	return nil
}

// BulkUpdate updates multiple users (invalidates caches).
func (r *CachedUserRepository) BulkUpdate(ctx context.Context, updates map[string]*entities.User) (*repositories.BulkOperationResult, error) {
	result, err := r.repo.BulkUpdate(ctx, updates)
	if err != nil {
		return nil, err
	}
	// Invalidate affected users
	for _, user := range updates {
		_ = r.cache.InvalidateUser(ctx, user.ID.String(), user.Email, user.Documento)
	}
	_ = r.cache.InvalidateActiveInstructors(ctx)
	_ = r.cache.InvalidateActiveApprentices(ctx)
	return result, nil
}

// BulkDelete deletes multiple users (invalidates caches).
func (r *CachedUserRepository) BulkDelete(ctx context.Context, emails []string) (*repositories.BulkOperationResult, error) {
	result, err := r.repo.BulkDelete(ctx, emails)
	if err != nil {
		return nil, err
	}
	_ = r.cache.InvalidateActiveInstructors(ctx)
	_ = r.cache.InvalidateActiveApprentices(ctx)
	return result, nil
}

// BulkStatusChange changes status of multiple users (invalidates caches).
func (r *CachedUserRepository) BulkStatusChange(ctx context.Context, emails []string, isActive bool) (*repositories.BulkOperationResult, error) {
	result, err := r.repo.BulkStatusChange(ctx, emails, isActive)
	if err != nil {
		return nil, err
	}
	_ = r.cache.InvalidateActiveInstructors(ctx)
	_ = r.cache.InvalidateActiveApprentices(ctx)
	return result, nil
}

// GetMultipleByEmails retrieves multiple users by emails.
func (r *CachedUserRepository) GetMultipleByEmails(ctx context.Context, emails []string) ([]*entities.User, error) {
	return r.repo.GetMultipleByEmails(ctx, emails)
}

// Verify interface implementation
var _ repositories.UserRepository = (*CachedUserRepository)(nil)
