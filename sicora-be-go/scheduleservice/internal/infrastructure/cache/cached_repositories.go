package cache

import (
	"context"
	"log"

	"sicora-be-go/pkg/cache"

	"scheduleservice/internal/domain/entities"
	"scheduleservice/internal/domain/repositories"

	"github.com/google/uuid"
)

// CachedCampusRepository wraps CampusRepository with caching.
type CachedCampusRepository struct {
	repo   repositories.CampusRepository
	cache  *ScheduleServiceCache
	logger *log.Logger
}

// NewCachedCampusRepository creates a new CachedCampusRepository.
func NewCachedCampusRepository(
	repo repositories.CampusRepository,
	cache *ScheduleServiceCache,
	logger *log.Logger,
) repositories.CampusRepository {
	return &CachedCampusRepository{
		repo:   repo,
		cache:  cache,
		logger: logger,
	}
}

func (r *CachedCampusRepository) Create(ctx context.Context, campus *entities.Campus) (*entities.Campus, error) {
	result, err := r.repo.Create(ctx, campus)
	if err != nil {
		return nil, err
	}
	// Invalidate list caches
	_ = r.cache.InvalidateCampus(ctx, result.ID.String())
	return result, nil
}

func (r *CachedCampusRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Campus, error) {
	// Try cache first
	campus, err := r.cache.GetCampus(ctx, id.String())
	if err == nil {
		return campus, nil
	}

	// Cache miss - fetch from DB
	campus, err = r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Store in cache
	if campus != nil {
		_ = r.cache.SetCampus(ctx, campus)
	}

	return campus, nil
}

func (r *CachedCampusRepository) GetByCode(ctx context.Context, code string) (*entities.Campus, error) {
	// Code lookups are less common, skip caching for now
	return r.repo.GetByCode(ctx, code)
}

func (r *CachedCampusRepository) Update(ctx context.Context, campus *entities.Campus) (*entities.Campus, error) {
	result, err := r.repo.Update(ctx, campus)
	if err != nil {
		return nil, err
	}
	// Invalidate cache
	_ = r.cache.InvalidateCampus(ctx, result.ID.String())
	return result, nil
}

func (r *CachedCampusRepository) Delete(ctx context.Context, id uuid.UUID) error {
	err := r.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	// Invalidate cache
	_ = r.cache.InvalidateCampus(ctx, id.String())
	return nil
}

func (r *CachedCampusRepository) List(ctx context.Context, filter repositories.BaseFilter) ([]*entities.Campus, int64, error) {
	// List operations with filters should not be cached (dynamic)
	return r.repo.List(ctx, filter)
}

func (r *CachedCampusRepository) ListActive(ctx context.Context) ([]*entities.Campus, error) {
	// Try cache first
	campuses, err := r.cache.GetActiveCampuses(ctx)
	if err == nil {
		return campuses, nil
	}

	// Cache miss - fetch from DB
	campuses, err = r.repo.ListActive(ctx)
	if err != nil {
		return nil, err
	}

	// Store in cache
	_ = r.cache.SetActiveCampuses(ctx, campuses)

	return campuses, nil
}

// CachedAcademicProgramRepository wraps AcademicProgramRepository with caching.
type CachedAcademicProgramRepository struct {
	repo   repositories.AcademicProgramRepository
	cache  *ScheduleServiceCache
	logger *log.Logger
}

// NewCachedAcademicProgramRepository creates a new CachedAcademicProgramRepository.
func NewCachedAcademicProgramRepository(
	repo repositories.AcademicProgramRepository,
	cache *ScheduleServiceCache,
	logger *log.Logger,
) repositories.AcademicProgramRepository {
	return &CachedAcademicProgramRepository{
		repo:   repo,
		cache:  cache,
		logger: logger,
	}
}

func (r *CachedAcademicProgramRepository) Create(ctx context.Context, program *entities.AcademicProgram) (*entities.AcademicProgram, error) {
	result, err := r.repo.Create(ctx, program)
	if err != nil {
		return nil, err
	}
	_ = r.cache.InvalidateProgram(ctx, result.ID.String())
	return result, nil
}

func (r *CachedAcademicProgramRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.AcademicProgram, error) {
	// Try cache first
	program, err := r.cache.GetProgram(ctx, id.String())
	if err == nil {
		return program, nil
	}

	// Cache miss
	program, err = r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if program != nil {
		_ = r.cache.SetProgram(ctx, program)
	}

	return program, nil
}

func (r *CachedAcademicProgramRepository) GetByCode(ctx context.Context, code string) (*entities.AcademicProgram, error) {
	return r.repo.GetByCode(ctx, code)
}

func (r *CachedAcademicProgramRepository) Update(ctx context.Context, program *entities.AcademicProgram) (*entities.AcademicProgram, error) {
	result, err := r.repo.Update(ctx, program)
	if err != nil {
		return nil, err
	}
	_ = r.cache.InvalidateProgram(ctx, result.ID.String())
	return result, nil
}

func (r *CachedAcademicProgramRepository) Delete(ctx context.Context, id uuid.UUID) error {
	err := r.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	_ = r.cache.InvalidateProgram(ctx, id.String())
	return nil
}

func (r *CachedAcademicProgramRepository) List(ctx context.Context, filter repositories.BaseFilter) ([]*entities.AcademicProgram, int64, error) {
	return r.repo.List(ctx, filter)
}

func (r *CachedAcademicProgramRepository) ListActive(ctx context.Context) ([]*entities.AcademicProgram, error) {
	programs, err := r.cache.GetActivePrograms(ctx)
	if err == nil {
		return programs, nil
	}

	programs, err = r.repo.ListActive(ctx)
	if err != nil {
		return nil, err
	}

	_ = r.cache.SetActivePrograms(ctx, programs)
	return programs, nil
}

// CachedAcademicGroupRepository wraps AcademicGroupRepository with caching.
type CachedAcademicGroupRepository struct {
	repo   repositories.AcademicGroupRepository
	cache  *ScheduleServiceCache
	logger *log.Logger
}

// NewCachedAcademicGroupRepository creates a new CachedAcademicGroupRepository.
func NewCachedAcademicGroupRepository(
	repo repositories.AcademicGroupRepository,
	cache *ScheduleServiceCache,
	logger *log.Logger,
) repositories.AcademicGroupRepository {
	return &CachedAcademicGroupRepository{
		repo:   repo,
		cache:  cache,
		logger: logger,
	}
}

func (r *CachedAcademicGroupRepository) Create(ctx context.Context, group *entities.AcademicGroup) (*entities.AcademicGroup, error) {
	result, err := r.repo.Create(ctx, group)
	if err != nil {
		return nil, err
	}
	_ = r.cache.InvalidateGroup(ctx, result.ID.String(), result.Number, result.AcademicProgramID.String())
	return result, nil
}

func (r *CachedAcademicGroupRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.AcademicGroup, error) {
	group, err := r.cache.GetGroup(ctx, id.String())
	if err == nil {
		return group, nil
	}

	group, err = r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if group != nil {
		_ = r.cache.SetGroup(ctx, group)
	}

	return group, nil
}

func (r *CachedAcademicGroupRepository) GetByNumber(ctx context.Context, number string) (*entities.AcademicGroup, error) {
	group, err := r.cache.GetGroupByNumber(ctx, number)
	if err == nil {
		return group, nil
	}

	group, err = r.repo.GetByNumber(ctx, number)
	if err != nil {
		return nil, err
	}

	if group != nil {
		_ = r.cache.SetGroupByNumber(ctx, group)
	}

	return group, nil
}

func (r *CachedAcademicGroupRepository) Update(ctx context.Context, group *entities.AcademicGroup) (*entities.AcademicGroup, error) {
	result, err := r.repo.Update(ctx, group)
	if err != nil {
		return nil, err
	}
	_ = r.cache.InvalidateGroup(ctx, result.ID.String(), result.Number, result.AcademicProgramID.String())
	return result, nil
}

func (r *CachedAcademicGroupRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// Get group first to know number and program for invalidation
	group, _ := r.repo.GetByID(ctx, id)

	err := r.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	if group != nil {
		_ = r.cache.InvalidateGroup(ctx, id.String(), group.Number, group.AcademicProgramID.String())
	} else {
		_ = r.cache.InvalidateGroup(ctx, id.String(), "", "")
	}

	return nil
}

func (r *CachedAcademicGroupRepository) List(ctx context.Context, filter repositories.AcademicGroupFilter) ([]*entities.AcademicGroup, int64, error) {
	return r.repo.List(ctx, filter)
}

func (r *CachedAcademicGroupRepository) ListActive(ctx context.Context) ([]*entities.AcademicGroup, error) {
	groups, err := r.cache.GetActiveGroups(ctx)
	if err == nil {
		return groups, nil
	}

	groups, err = r.repo.ListActive(ctx)
	if err != nil {
		return nil, err
	}

	_ = r.cache.SetActiveGroups(ctx, groups)
	return groups, nil
}

func (r *CachedAcademicGroupRepository) GetByProgram(ctx context.Context, programID uuid.UUID) ([]*entities.AcademicGroup, error) {
	groups, err := r.cache.GetGroupsByProgram(ctx, programID.String())
	if err == nil {
		return groups, nil
	}

	groups, err = r.repo.GetByProgram(ctx, programID)
	if err != nil {
		return nil, err
	}

	_ = r.cache.SetGroupsByProgram(ctx, programID.String(), groups)
	return groups, nil
}

// CachedVenueRepository wraps VenueRepository with caching.
type CachedVenueRepository struct {
	repo   repositories.VenueRepository
	cache  *ScheduleServiceCache
	logger *log.Logger
}

// NewCachedVenueRepository creates a new CachedVenueRepository.
func NewCachedVenueRepository(
	repo repositories.VenueRepository,
	cache *ScheduleServiceCache,
	logger *log.Logger,
) repositories.VenueRepository {
	return &CachedVenueRepository{
		repo:   repo,
		cache:  cache,
		logger: logger,
	}
}

func (r *CachedVenueRepository) Create(ctx context.Context, venue *entities.Venue) (*entities.Venue, error) {
	result, err := r.repo.Create(ctx, venue)
	if err != nil {
		return nil, err
	}
	_ = r.cache.InvalidateVenue(ctx, result.ID.String(), result.CampusID.String())
	return result, nil
}

func (r *CachedVenueRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Venue, error) {
	venue, err := r.cache.GetVenue(ctx, id.String())
	if err == nil {
		return venue, nil
	}

	venue, err = r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if venue != nil {
		_ = r.cache.SetVenue(ctx, venue)
	}

	return venue, nil
}

func (r *CachedVenueRepository) GetByCode(ctx context.Context, code string) (*entities.Venue, error) {
	return r.repo.GetByCode(ctx, code)
}

func (r *CachedVenueRepository) Update(ctx context.Context, venue *entities.Venue) (*entities.Venue, error) {
	result, err := r.repo.Update(ctx, venue)
	if err != nil {
		return nil, err
	}
	_ = r.cache.InvalidateVenue(ctx, result.ID.String(), result.CampusID.String())
	return result, nil
}

func (r *CachedVenueRepository) Delete(ctx context.Context, id uuid.UUID) error {
	venue, _ := r.repo.GetByID(ctx, id)

	err := r.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	if venue != nil {
		_ = r.cache.InvalidateVenue(ctx, id.String(), venue.CampusID.String())
	} else {
		_ = r.cache.InvalidateVenue(ctx, id.String(), "")
	}

	return nil
}

func (r *CachedVenueRepository) List(ctx context.Context, filter repositories.VenueFilter) ([]*entities.Venue, int64, error) {
	return r.repo.List(ctx, filter)
}

func (r *CachedVenueRepository) ListActive(ctx context.Context) ([]*entities.Venue, error) {
	venues, err := r.cache.GetAllVenues(ctx)
	if err == nil {
		// Filter active only
		active := make([]*entities.Venue, 0)
		for _, v := range venues {
			if v.IsActive {
				active = append(active, v)
			}
		}
		return active, nil
	}

	venues, err = r.repo.ListActive(ctx)
	if err != nil {
		return nil, err
	}

	_ = r.cache.SetAllVenues(ctx, venues)
	return venues, nil
}

func (r *CachedVenueRepository) GetByCampus(ctx context.Context, campusID uuid.UUID) ([]*entities.Venue, error) {
	venues, err := r.cache.GetVenuesByCampus(ctx, campusID.String())
	if err == nil {
		return venues, nil
	}

	venues, err = r.repo.GetByCampus(ctx, campusID)
	if err != nil {
		return nil, err
	}

	_ = r.cache.SetVenuesByCampus(ctx, campusID.String(), venues)
	return venues, nil
}

// Verify interfaces are implemented
var _ repositories.CampusRepository = (*CachedCampusRepository)(nil)
var _ repositories.AcademicProgramRepository = (*CachedAcademicProgramRepository)(nil)
var _ repositories.AcademicGroupRepository = (*CachedAcademicGroupRepository)(nil)
var _ repositories.VenueRepository = (*CachedVenueRepository)(nil)

// isCacheNotFound checks if an error is a cache not found error.
func isCacheNotFound(err error) bool {
	return cache.IsNotFoundError(err)
}
