package cache

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"sicora-be-go/pkg/cache"

	"scheduleservice/internal/domain/entities"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestCache(t *testing.T) (*ScheduleServiceCache, func()) {
	logger := log.New(os.Stdout, "[TEST] ", log.LstdFlags)
	mockCache := cache.NewMockCache()
	serviceCache := NewScheduleServiceCache(mockCache, logger)

	cleanup := func() {
		_ = serviceCache.Close()
	}

	return serviceCache, cleanup
}

func TestScheduleServiceCache_Campus(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	campusID := uuid.New()
	campus := &entities.Campus{
		ID:       campusID,
		Code:     "HQ",
		Name:     "Sede Principal",
		IsActive: true,
	}

	// Set
	err := serviceCache.SetCampus(ctx, campus)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetCampus(ctx, campusID.String())
	require.NoError(t, err)
	assert.Equal(t, campus.Code, retrieved.Code)
	assert.Equal(t, campus.Name, retrieved.Name)

	// Invalidate
	err = serviceCache.InvalidateCampus(ctx, campusID.String())
	require.NoError(t, err)

	// Get after invalidate should fail
	_, err = serviceCache.GetCampus(ctx, campusID.String())
	assert.Error(t, err)
}

func TestScheduleServiceCache_ActiveCampuses(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	campuses := []*entities.Campus{
		{ID: uuid.New(), Code: "HQ", Name: "Sede Principal", IsActive: true},
		{ID: uuid.New(), Code: "BR", Name: "Sucursal", IsActive: true},
	}

	// Set active campuses
	err := serviceCache.SetActiveCampuses(ctx, campuses)
	require.NoError(t, err)

	// Get active campuses
	retrieved, err := serviceCache.GetActiveCampuses(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestScheduleServiceCache_Program(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	programID := uuid.New()
	program := &entities.AcademicProgram{
		ID:       programID,
		Code:     "228118",
		Name:     "Análisis y Desarrollo de Software",
		Type:     entities.TipoProgramaTecnologo,
		Duration: 27,
		IsActive: true,
	}

	// Set
	err := serviceCache.SetProgram(ctx, program)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetProgram(ctx, programID.String())
	require.NoError(t, err)
	assert.Equal(t, program.Code, retrieved.Code)
	assert.Equal(t, program.Name, retrieved.Name)
	assert.Equal(t, entities.TipoProgramaTecnologo, retrieved.Type)
}

func TestScheduleServiceCache_Group(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	groupID := uuid.New()
	programID := uuid.New()
	group := &entities.AcademicGroup{
		ID:                groupID,
		Number:            "2540827",
		AcademicProgramID: programID,
		IsActive:          true,
	}

	// Set
	err := serviceCache.SetGroup(ctx, group)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetGroup(ctx, groupID.String())
	require.NoError(t, err)
	assert.Equal(t, group.Number, retrieved.Number)

	// Set by number
	err = serviceCache.SetGroupByNumber(ctx, group)
	require.NoError(t, err)

	// Get by number
	retrievedByNumber, err := serviceCache.GetGroupByNumber(ctx, "2540827")
	require.NoError(t, err)
	assert.Equal(t, group.Number, retrievedByNumber.Number)
}

func TestScheduleServiceCache_Venue(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	venueID := uuid.New()
	campusID := uuid.New()
	venue := &entities.Venue{
		ID:       venueID,
		Code:     "LAB-101",
		Name:     "Laboratorio Principal",
		CampusID: campusID,
		IsActive: true,
	}

	// Set
	err := serviceCache.SetVenue(ctx, venue)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetVenue(ctx, venueID.String())
	require.NoError(t, err)
	assert.Equal(t, venue.Code, retrieved.Code)
	assert.Equal(t, venue.Name, retrieved.Name)
}

func TestScheduleServiceCache_VenuesByCampus(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	campusID := uuid.New()
	venues := []*entities.Venue{
		{ID: uuid.New(), Code: "LAB-101", Name: "Lab 1", CampusID: campusID, IsActive: true},
		{ID: uuid.New(), Code: "LAB-102", Name: "Lab 2", CampusID: campusID, IsActive: true},
	}

	// Set
	err := serviceCache.SetVenuesByCampus(ctx, campusID.String(), venues)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetVenuesByCampus(ctx, campusID.String())
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestScheduleServiceCache_Schedule(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	scheduleID := uuid.New()
	groupID := uuid.New()
	instructorID := uuid.New()
	schedule := &entities.Schedule{
		ID:              scheduleID,
		AcademicGroupID: groupID,
		InstructorID:    instructorID,
		Subject:         "Programación",
		DayOfWeek:       1,
		Status:          entities.EstadoHorarioActivo,
	}

	// Set
	err := serviceCache.SetSchedule(ctx, schedule)
	require.NoError(t, err)

	// Get
	retrieved, err := serviceCache.GetSchedule(ctx, scheduleID.String())
	require.NoError(t, err)
	assert.Equal(t, schedule.Subject, retrieved.Subject)
	assert.Equal(t, schedule.DayOfWeek, retrieved.DayOfWeek)
	assert.Equal(t, entities.EstadoHorarioActivo, retrieved.Status)
}

func TestScheduleServiceCache_Ping(t *testing.T) {
	ctx := context.Background()
	serviceCache, cleanup := setupTestCache(t)
	defer cleanup()

	err := serviceCache.Ping(ctx)
	require.NoError(t, err)
}

func TestScheduleServiceCache_TTLs(t *testing.T) {
	// Verify TTLs are set correctly according to business rules
	assert.Equal(t, 24*time.Hour, cache.TTLVeryStable, "Campus/Venues should have 24h TTL")
	assert.Equal(t, 12*time.Hour, cache.TTLStable, "Programs should have 12h TTL")
	assert.Equal(t, 6*time.Hour, cache.TTLSemiStable, "Groups should have 6h TTL")
	assert.Equal(t, 1*time.Hour, cache.TTLModerate, "Schedules should have 1h TTL")
}
