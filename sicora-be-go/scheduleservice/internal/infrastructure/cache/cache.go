// Package cache provides caching functionality for ScheduleService.
// It integrates with the shared cache package to provide Redis caching
// for frequently accessed master data like Campus, Programs, Groups, and Venues.
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"sicora-be-go/pkg/cache"

	"scheduleservice/internal/domain/entities"
)

// ScheduleServiceCache provides caching for schedule service entities.
type ScheduleServiceCache struct {
	client    cache.CacheInterface
	keyPrefix string
	logger    *log.Logger
}

// NewScheduleServiceCache creates a new ScheduleServiceCache.
func NewScheduleServiceCache(client cache.CacheInterface, logger *log.Logger) *ScheduleServiceCache {
	return &ScheduleServiceCache{
		client:    client,
		keyPrefix: cache.PrefixScheduleService,
		logger:    logger,
	}
}

// NewScheduleServiceCacheFromEnv creates a ScheduleServiceCache from environment variables.
func NewScheduleServiceCacheFromEnv(logger *log.Logger) (*ScheduleServiceCache, error) {
	client, err := cache.NewRedisClientFromEnv(cache.PrefixScheduleService)
	if err != nil {
		return nil, fmt.Errorf("failed to create Redis client: %w", err)
	}
	return NewScheduleServiceCache(client, logger), nil
}

// Close closes the cache connection.
func (c *ScheduleServiceCache) Close() error {
	return c.client.Close()
}

// Ping checks if the cache is healthy.
func (c *ScheduleServiceCache) Ping(ctx context.Context) error {
	return c.client.Ping(ctx)
}

// Stats returns cache statistics.
func (c *ScheduleServiceCache) Stats(ctx context.Context) (*cache.CacheStats, error) {
	return c.client.Stats(ctx)
}

// ===== Campus Caching =====

// GetCampus retrieves a campus by ID from cache.
func (c *ScheduleServiceCache) GetCampus(ctx context.Context, id string) (*entities.Campus, error) {
	key := cache.Schedule().Campus(id)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var campus entities.Campus
	if err := json.Unmarshal(data, &campus); err != nil {
		return nil, fmt.Errorf("failed to unmarshal campus: %w", err)
	}
	return &campus, nil
}

// SetCampus stores a campus in cache.
func (c *ScheduleServiceCache) SetCampus(ctx context.Context, campus *entities.Campus) error {
	data, err := json.Marshal(campus)
	if err != nil {
		return fmt.Errorf("failed to marshal campus: %w", err)
	}

	key := cache.Schedule().Campus(campus.ID.String())
	return c.client.Set(ctx, key, data, cache.TTLVeryStable)
}

// GetAllCampuses retrieves all campuses from cache.
func (c *ScheduleServiceCache) GetAllCampuses(ctx context.Context) ([]*entities.Campus, error) {
	key := cache.Schedule().CampusAll()
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var campuses []*entities.Campus
	if err := json.Unmarshal(data, &campuses); err != nil {
		return nil, fmt.Errorf("failed to unmarshal campuses: %w", err)
	}
	return campuses, nil
}

// SetAllCampuses stores all campuses in cache.
func (c *ScheduleServiceCache) SetAllCampuses(ctx context.Context, campuses []*entities.Campus) error {
	data, err := json.Marshal(campuses)
	if err != nil {
		return fmt.Errorf("failed to marshal campuses: %w", err)
	}

	key := cache.Schedule().CampusAll()
	return c.client.Set(ctx, key, data, cache.TTLVeryStable)
}

// GetActiveCampuses retrieves active campuses from cache.
func (c *ScheduleServiceCache) GetActiveCampuses(ctx context.Context) ([]*entities.Campus, error) {
	key := cache.Schedule().CampusActive()
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var campuses []*entities.Campus
	if err := json.Unmarshal(data, &campuses); err != nil {
		return nil, fmt.Errorf("failed to unmarshal active campuses: %w", err)
	}
	return campuses, nil
}

// SetActiveCampuses stores active campuses in cache.
func (c *ScheduleServiceCache) SetActiveCampuses(ctx context.Context, campuses []*entities.Campus) error {
	data, err := json.Marshal(campuses)
	if err != nil {
		return fmt.Errorf("failed to marshal active campuses: %w", err)
	}

	key := cache.Schedule().CampusActive()
	return c.client.Set(ctx, key, data, cache.TTLVeryStable)
}

// InvalidateCampus removes a campus from cache.
func (c *ScheduleServiceCache) InvalidateCampus(ctx context.Context, id string) error {
	// Invalidate specific campus and lists
	keys := []string{
		cache.Schedule().Campus(id),
		cache.Schedule().CampusAll(),
		cache.Schedule().CampusActive(),
	}

	for _, key := range keys {
		if err := c.client.Delete(ctx, key); err != nil && !cache.IsNotFoundError(err) {
			c.logger.Printf("Warning: failed to invalidate cache key %s: %v", key, err)
		}
	}
	return nil
}

// InvalidateAllCampuses removes all campus-related cache.
func (c *ScheduleServiceCache) InvalidateAllCampuses(ctx context.Context) error {
	_, err := c.client.DeletePattern(ctx, cache.Pattern().AllCampuses())
	return err
}

// ===== Academic Program Caching =====

// GetProgram retrieves a program by ID from cache.
func (c *ScheduleServiceCache) GetProgram(ctx context.Context, id string) (*entities.AcademicProgram, error) {
	key := cache.Schedule().Program(id)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var program entities.AcademicProgram
	if err := json.Unmarshal(data, &program); err != nil {
		return nil, fmt.Errorf("failed to unmarshal program: %w", err)
	}
	return &program, nil
}

// SetProgram stores a program in cache.
func (c *ScheduleServiceCache) SetProgram(ctx context.Context, program *entities.AcademicProgram) error {
	data, err := json.Marshal(program)
	if err != nil {
		return fmt.Errorf("failed to marshal program: %w", err)
	}

	key := cache.Schedule().Program(program.ID.String())
	return c.client.Set(ctx, key, data, cache.TTLStable)
}

// GetAllPrograms retrieves all programs from cache.
func (c *ScheduleServiceCache) GetAllPrograms(ctx context.Context) ([]*entities.AcademicProgram, error) {
	key := cache.Schedule().ProgramAll()
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var programs []*entities.AcademicProgram
	if err := json.Unmarshal(data, &programs); err != nil {
		return nil, fmt.Errorf("failed to unmarshal programs: %w", err)
	}
	return programs, nil
}

// SetAllPrograms stores all programs in cache.
func (c *ScheduleServiceCache) SetAllPrograms(ctx context.Context, programs []*entities.AcademicProgram) error {
	data, err := json.Marshal(programs)
	if err != nil {
		return fmt.Errorf("failed to marshal programs: %w", err)
	}

	key := cache.Schedule().ProgramAll()
	return c.client.Set(ctx, key, data, cache.TTLStable)
}

// GetActivePrograms retrieves active programs from cache.
func (c *ScheduleServiceCache) GetActivePrograms(ctx context.Context) ([]*entities.AcademicProgram, error) {
	key := cache.Schedule().ProgramActive()
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var programs []*entities.AcademicProgram
	if err := json.Unmarshal(data, &programs); err != nil {
		return nil, fmt.Errorf("failed to unmarshal active programs: %w", err)
	}
	return programs, nil
}

// SetActivePrograms stores active programs in cache.
func (c *ScheduleServiceCache) SetActivePrograms(ctx context.Context, programs []*entities.AcademicProgram) error {
	data, err := json.Marshal(programs)
	if err != nil {
		return fmt.Errorf("failed to marshal active programs: %w", err)
	}

	key := cache.Schedule().ProgramActive()
	return c.client.Set(ctx, key, data, cache.TTLStable)
}

// InvalidateProgram removes a program from cache.
func (c *ScheduleServiceCache) InvalidateProgram(ctx context.Context, id string) error {
	keys := []string{
		cache.Schedule().Program(id),
		cache.Schedule().ProgramAll(),
		cache.Schedule().ProgramActive(),
	}

	for _, key := range keys {
		if err := c.client.Delete(ctx, key); err != nil && !cache.IsNotFoundError(err) {
			c.logger.Printf("Warning: failed to invalidate cache key %s: %v", key, err)
		}
	}
	return nil
}

// InvalidateAllPrograms removes all program-related cache.
func (c *ScheduleServiceCache) InvalidateAllPrograms(ctx context.Context) error {
	_, err := c.client.DeletePattern(ctx, cache.Pattern().AllPrograms())
	return err
}

// ===== Academic Group Caching =====

// GetGroup retrieves a group by ID from cache.
func (c *ScheduleServiceCache) GetGroup(ctx context.Context, id string) (*entities.AcademicGroup, error) {
	key := cache.Schedule().Group(id)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var group entities.AcademicGroup
	if err := json.Unmarshal(data, &group); err != nil {
		return nil, fmt.Errorf("failed to unmarshal group: %w", err)
	}
	return &group, nil
}

// SetGroup stores a group in cache.
func (c *ScheduleServiceCache) SetGroup(ctx context.Context, group *entities.AcademicGroup) error {
	data, err := json.Marshal(group)
	if err != nil {
		return fmt.Errorf("failed to marshal group: %w", err)
	}

	key := cache.Schedule().Group(group.ID.String())
	return c.client.Set(ctx, key, data, cache.TTLSemiStable)
}

// GetGroupByNumber retrieves a group by number from cache.
func (c *ScheduleServiceCache) GetGroupByNumber(ctx context.Context, number string) (*entities.AcademicGroup, error) {
	key := cache.Schedule().GroupByNumber(number)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var group entities.AcademicGroup
	if err := json.Unmarshal(data, &group); err != nil {
		return nil, fmt.Errorf("failed to unmarshal group: %w", err)
	}
	return &group, nil
}

// SetGroupByNumber stores a group by number in cache.
func (c *ScheduleServiceCache) SetGroupByNumber(ctx context.Context, group *entities.AcademicGroup) error {
	data, err := json.Marshal(group)
	if err != nil {
		return fmt.Errorf("failed to marshal group: %w", err)
	}

	key := cache.Schedule().GroupByNumber(group.Number)
	return c.client.Set(ctx, key, data, cache.TTLSemiStable)
}

// GetGroupsByProgram retrieves groups by program ID from cache.
func (c *ScheduleServiceCache) GetGroupsByProgram(ctx context.Context, programID string) ([]*entities.AcademicGroup, error) {
	key := cache.Schedule().GroupsByProgram(programID)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var groups []*entities.AcademicGroup
	if err := json.Unmarshal(data, &groups); err != nil {
		return nil, fmt.Errorf("failed to unmarshal groups: %w", err)
	}
	return groups, nil
}

// SetGroupsByProgram stores groups by program ID in cache.
func (c *ScheduleServiceCache) SetGroupsByProgram(ctx context.Context, programID string, groups []*entities.AcademicGroup) error {
	data, err := json.Marshal(groups)
	if err != nil {
		return fmt.Errorf("failed to marshal groups: %w", err)
	}

	key := cache.Schedule().GroupsByProgram(programID)
	return c.client.Set(ctx, key, data, cache.TTLSemiStable)
}

// GetActiveGroups retrieves active groups from cache.
func (c *ScheduleServiceCache) GetActiveGroups(ctx context.Context) ([]*entities.AcademicGroup, error) {
	key := cache.Schedule().GroupsActive()
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var groups []*entities.AcademicGroup
	if err := json.Unmarshal(data, &groups); err != nil {
		return nil, fmt.Errorf("failed to unmarshal active groups: %w", err)
	}
	return groups, nil
}

// SetActiveGroups stores active groups in cache.
func (c *ScheduleServiceCache) SetActiveGroups(ctx context.Context, groups []*entities.AcademicGroup) error {
	data, err := json.Marshal(groups)
	if err != nil {
		return fmt.Errorf("failed to marshal active groups: %w", err)
	}

	key := cache.Schedule().GroupsActive()
	return c.client.Set(ctx, key, data, cache.TTLSemiStable)
}

// InvalidateGroup removes a group from cache.
func (c *ScheduleServiceCache) InvalidateGroup(ctx context.Context, id string, number string, programID string) error {
	keys := []string{
		cache.Schedule().Group(id),
		cache.Schedule().GroupsActive(),
	}

	if number != "" {
		keys = append(keys, cache.Schedule().GroupByNumber(number))
	}
	if programID != "" {
		keys = append(keys, cache.Schedule().GroupsByProgram(programID))
	}

	for _, key := range keys {
		if err := c.client.Delete(ctx, key); err != nil && !cache.IsNotFoundError(err) {
			c.logger.Printf("Warning: failed to invalidate cache key %s: %v", key, err)
		}
	}
	return nil
}

// InvalidateAllGroups removes all group-related cache.
func (c *ScheduleServiceCache) InvalidateAllGroups(ctx context.Context) error {
	_, err := c.client.DeletePattern(ctx, cache.Pattern().AllGroups())
	return err
}

// ===== Venue Caching =====

// GetVenue retrieves a venue by ID from cache.
func (c *ScheduleServiceCache) GetVenue(ctx context.Context, id string) (*entities.Venue, error) {
	key := cache.Schedule().Venue(id)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var venue entities.Venue
	if err := json.Unmarshal(data, &venue); err != nil {
		return nil, fmt.Errorf("failed to unmarshal venue: %w", err)
	}
	return &venue, nil
}

// SetVenue stores a venue in cache.
func (c *ScheduleServiceCache) SetVenue(ctx context.Context, venue *entities.Venue) error {
	data, err := json.Marshal(venue)
	if err != nil {
		return fmt.Errorf("failed to marshal venue: %w", err)
	}

	key := cache.Schedule().Venue(venue.ID.String())
	return c.client.Set(ctx, key, data, cache.TTLVeryStable)
}

// GetAllVenues retrieves all venues from cache.
func (c *ScheduleServiceCache) GetAllVenues(ctx context.Context) ([]*entities.Venue, error) {
	key := cache.Schedule().VenueAll()
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var venues []*entities.Venue
	if err := json.Unmarshal(data, &venues); err != nil {
		return nil, fmt.Errorf("failed to unmarshal venues: %w", err)
	}
	return venues, nil
}

// SetAllVenues stores all venues in cache.
func (c *ScheduleServiceCache) SetAllVenues(ctx context.Context, venues []*entities.Venue) error {
	data, err := json.Marshal(venues)
	if err != nil {
		return fmt.Errorf("failed to marshal venues: %w", err)
	}

	key := cache.Schedule().VenueAll()
	return c.client.Set(ctx, key, data, cache.TTLVeryStable)
}

// GetVenuesByCampus retrieves venues by campus ID from cache.
func (c *ScheduleServiceCache) GetVenuesByCampus(ctx context.Context, campusID string) ([]*entities.Venue, error) {
	key := cache.Schedule().VenuesByCampus(campusID)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var venues []*entities.Venue
	if err := json.Unmarshal(data, &venues); err != nil {
		return nil, fmt.Errorf("failed to unmarshal venues: %w", err)
	}
	return venues, nil
}

// SetVenuesByCampus stores venues by campus ID in cache.
func (c *ScheduleServiceCache) SetVenuesByCampus(ctx context.Context, campusID string, venues []*entities.Venue) error {
	data, err := json.Marshal(venues)
	if err != nil {
		return fmt.Errorf("failed to marshal venues: %w", err)
	}

	key := cache.Schedule().VenuesByCampus(campusID)
	return c.client.Set(ctx, key, data, cache.TTLVeryStable)
}

// InvalidateVenue removes a venue from cache.
func (c *ScheduleServiceCache) InvalidateVenue(ctx context.Context, id string, campusID string) error {
	keys := []string{
		cache.Schedule().Venue(id),
		cache.Schedule().VenueAll(),
	}

	if campusID != "" {
		keys = append(keys, cache.Schedule().VenuesByCampus(campusID))
	}

	for _, key := range keys {
		if err := c.client.Delete(ctx, key); err != nil && !cache.IsNotFoundError(err) {
			c.logger.Printf("Warning: failed to invalidate cache key %s: %v", key, err)
		}
	}
	return nil
}

// InvalidateAllVenues removes all venue-related cache.
func (c *ScheduleServiceCache) InvalidateAllVenues(ctx context.Context) error {
	_, err := c.client.DeletePattern(ctx, cache.Pattern().AllVenues())
	return err
}

// ===== Schedule Caching =====

// GetSchedule retrieves a schedule by ID from cache.
func (c *ScheduleServiceCache) GetSchedule(ctx context.Context, id string) (*entities.Schedule, error) {
	key := cache.Schedule().ScheduleByID(id)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var schedule entities.Schedule
	if err := json.Unmarshal(data, &schedule); err != nil {
		return nil, fmt.Errorf("failed to unmarshal schedule: %w", err)
	}
	return &schedule, nil
}

// SetSchedule stores a schedule in cache.
func (c *ScheduleServiceCache) SetSchedule(ctx context.Context, schedule *entities.Schedule) error {
	data, err := json.Marshal(schedule)
	if err != nil {
		return fmt.Errorf("failed to marshal schedule: %w", err)
	}

	key := cache.Schedule().ScheduleByID(schedule.ID.String())
	return c.client.Set(ctx, key, data, cache.TTLModerate)
}

// GetSchedulesByGroup retrieves schedules by group ID from cache.
func (c *ScheduleServiceCache) GetSchedulesByGroup(ctx context.Context, groupID string) ([]*entities.Schedule, error) {
	key := cache.Schedule().SchedulesByGroup(groupID)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var schedules []*entities.Schedule
	if err := json.Unmarshal(data, &schedules); err != nil {
		return nil, fmt.Errorf("failed to unmarshal schedules: %w", err)
	}
	return schedules, nil
}

// SetSchedulesByGroup stores schedules by group ID in cache.
func (c *ScheduleServiceCache) SetSchedulesByGroup(ctx context.Context, groupID string, schedules []*entities.Schedule) error {
	data, err := json.Marshal(schedules)
	if err != nil {
		return fmt.Errorf("failed to marshal schedules: %w", err)
	}

	key := cache.Schedule().SchedulesByGroup(groupID)
	return c.client.Set(ctx, key, data, cache.TTLModerate)
}

// GetSchedulesByInstructor retrieves schedules by instructor ID from cache.
func (c *ScheduleServiceCache) GetSchedulesByInstructor(ctx context.Context, instructorID string) ([]*entities.Schedule, error) {
	key := cache.Schedule().SchedulesByInstructor(instructorID)
	data, err := c.client.Get(ctx, key)
	if err != nil {
		return nil, err
	}

	var schedules []*entities.Schedule
	if err := json.Unmarshal(data, &schedules); err != nil {
		return nil, fmt.Errorf("failed to unmarshal schedules: %w", err)
	}
	return schedules, nil
}

// SetSchedulesByInstructor stores schedules by instructor ID in cache.
func (c *ScheduleServiceCache) SetSchedulesByInstructor(ctx context.Context, instructorID string, schedules []*entities.Schedule) error {
	data, err := json.Marshal(schedules)
	if err != nil {
		return fmt.Errorf("failed to marshal schedules: %w", err)
	}

	key := cache.Schedule().SchedulesByInstructor(instructorID)
	return c.client.Set(ctx, key, data, cache.TTLModerate)
}

// InvalidateSchedule removes a schedule from cache.
func (c *ScheduleServiceCache) InvalidateSchedule(ctx context.Context, id, groupID, instructorID, venueID string) error {
	keys := []string{
		cache.Schedule().ScheduleByID(id),
	}

	if groupID != "" {
		keys = append(keys, cache.Schedule().SchedulesByGroup(groupID))
	}
	if instructorID != "" {
		keys = append(keys, cache.Schedule().SchedulesByInstructor(instructorID))
	}
	if venueID != "" {
		keys = append(keys, cache.Schedule().SchedulesByVenue(venueID))
	}

	for _, key := range keys {
		if err := c.client.Delete(ctx, key); err != nil && !cache.IsNotFoundError(err) {
			c.logger.Printf("Warning: failed to invalidate cache key %s: %v", key, err)
		}
	}
	return nil
}

// InvalidateAllSchedules removes all schedule-related cache.
func (c *ScheduleServiceCache) InvalidateAllSchedules(ctx context.Context) error {
	_, err := c.client.DeletePattern(ctx, cache.Pattern().AllSchedules())
	return err
}

// ===== Warmup Functions =====

// WarmupCampuses pre-populates the cache with all campuses.
func (c *ScheduleServiceCache) WarmupCampuses(ctx context.Context, campuses []*entities.Campus) error {
	// Cache the list
	if err := c.SetActiveCampuses(ctx, campuses); err != nil {
		return fmt.Errorf("failed to cache active campuses: %w", err)
	}

	// Cache individual items
	for _, campus := range campuses {
		if err := c.SetCampus(ctx, campus); err != nil {
			c.logger.Printf("Warning: failed to cache campus %s: %v", campus.ID, err)
		}
	}

	c.logger.Printf("Cache warmup: %d campuses cached", len(campuses))
	return nil
}

// WarmupPrograms pre-populates the cache with all programs.
func (c *ScheduleServiceCache) WarmupPrograms(ctx context.Context, programs []*entities.AcademicProgram) error {
	if err := c.SetActivePrograms(ctx, programs); err != nil {
		return fmt.Errorf("failed to cache active programs: %w", err)
	}

	for _, program := range programs {
		if err := c.SetProgram(ctx, program); err != nil {
			c.logger.Printf("Warning: failed to cache program %s: %v", program.ID, err)
		}
	}

	c.logger.Printf("Cache warmup: %d programs cached", len(programs))
	return nil
}

// WarmupGroups pre-populates the cache with all groups.
func (c *ScheduleServiceCache) WarmupGroups(ctx context.Context, groups []*entities.AcademicGroup) error {
	if err := c.SetActiveGroups(ctx, groups); err != nil {
		return fmt.Errorf("failed to cache active groups: %w", err)
	}

	for _, group := range groups {
		if err := c.SetGroup(ctx, group); err != nil {
			c.logger.Printf("Warning: failed to cache group %s: %v", group.ID, err)
		}
		if err := c.SetGroupByNumber(ctx, group); err != nil {
			c.logger.Printf("Warning: failed to cache group by number %s: %v", group.Number, err)
		}
	}

	c.logger.Printf("Cache warmup: %d groups cached", len(groups))
	return nil
}

// WarmupVenues pre-populates the cache with all venues.
func (c *ScheduleServiceCache) WarmupVenues(ctx context.Context, venues []*entities.Venue) error {
	if err := c.SetAllVenues(ctx, venues); err != nil {
		return fmt.Errorf("failed to cache all venues: %w", err)
	}

	// Group venues by campus
	byCampus := make(map[string][]*entities.Venue)
	for _, venue := range venues {
		campusID := venue.CampusID.String()
		byCampus[campusID] = append(byCampus[campusID], venue)

		if err := c.SetVenue(ctx, venue); err != nil {
			c.logger.Printf("Warning: failed to cache venue %s: %v", venue.ID, err)
		}
	}

	// Cache by campus
	for campusID, campusVenues := range byCampus {
		if err := c.SetVenuesByCampus(ctx, campusID, campusVenues); err != nil {
			c.logger.Printf("Warning: failed to cache venues for campus %s: %v", campusID, err)
		}
	}

	c.logger.Printf("Cache warmup: %d venues cached across %d campuses", len(venues), len(byCampus))
	return nil
}

// WarmupAll pre-populates all caches.
func (c *ScheduleServiceCache) WarmupAll(ctx context.Context,
	campuses []*entities.Campus,
	programs []*entities.AcademicProgram,
	groups []*entities.AcademicGroup,
	venues []*entities.Venue) error {

	start := time.Now()

	if err := c.WarmupCampuses(ctx, campuses); err != nil {
		return err
	}
	if err := c.WarmupPrograms(ctx, programs); err != nil {
		return err
	}
	if err := c.WarmupGroups(ctx, groups); err != nil {
		return err
	}
	if err := c.WarmupVenues(ctx, venues); err != nil {
		return err
	}

	c.logger.Printf("Cache warmup completed in %v", time.Since(start))
	return nil
}
