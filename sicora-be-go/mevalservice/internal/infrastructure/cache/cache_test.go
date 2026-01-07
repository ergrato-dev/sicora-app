// Package cache provides test coverage for MevalService cache operations.
package cache

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"sicora-be-go/pkg/cache"

	"mevalservice/internal/domain/entities"
)

// Helper to create a test cache with mock client
func newTestMevalCache(t *testing.T) (*MevalServiceCache, *cache.MockCache) {
	mockCache := cache.NewMockCache()
	logger := log.New(os.Stdout, "[test-meval-cache] ", log.LstdFlags)
	mevalCache := NewMevalServiceCache(mockCache, logger)
	return mevalCache, mockCache
}

// Helper to create a test committee
func createTestCommittee(id uuid.UUID, committeeType entities.CommitteeType, status entities.CommitteeStatus) *entities.Committee {
	now := time.Now()
	return &entities.Committee{
		ID:              id,
		CommitteeDate:   now.AddDate(0, 0, 7),
		CommitteeType:   committeeType,
		Status:          status,
		AcademicPeriod:  "2026-1",
		AgendaGenerated: false,
		QuorumAchieved:  false,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// Helper to create a test student case
func createTestStudentCase(id, studentID, committeeID uuid.UUID, caseType entities.CaseType) *entities.StudentCase {
	now := time.Now()
	return &entities.StudentCase{
		ID:                 id,
		StudentID:          studentID,
		CommitteeID:        committeeID,
		CaseType:           caseType,
		CaseStatus:         entities.CaseStatusPending,
		AutomaticDetection: true,
		CaseDescription:    "Test case description",
		CreatedAt:          now,
		UpdatedAt:          now,
	}
}

// Helper to create a test sanction
func createTestSanction(id, studentID, caseID uuid.UUID, sanctionType entities.SanctionType) *entities.Sanction {
	now := time.Now()
	return &entities.Sanction{
		ID:                 id,
		StudentID:          studentID,
		StudentCaseID:      caseID,
		SanctionType:       sanctionType,
		SeverityLevel:      1,
		Description:        "Test sanction",
		StartDate:          now,
		ComplianceRequired: true,
		ComplianceStatus:   entities.ComplianceStatusPending,
		CreatedAt:          now,
		UpdatedAt:          now,
	}
}

// Helper to create a test improvement plan
func createTestImprovementPlan(id, studentID uuid.UUID, planType entities.PlanType) *entities.ImprovementPlan {
	now := time.Now()
	return &entities.ImprovementPlan{
		ID:                   id,
		StudentID:            studentID,
		PlanType:             planType,
		StartDate:            now,
		EndDate:              now.AddDate(0, 3, 0),
		Objectives:           []entities.Objective{},
		Activities:           []entities.Activity{},
		SuccessCriteria:      []entities.SuccessCriteria{},
		CurrentStatus:        entities.PlanStatusActive,
		CompliancePercentage: 0,
		CreatedAt:            now,
		UpdatedAt:            now,
	}
}

func TestMevalServiceCache_Committee(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	cID := uuid.New()
	committee := createTestCommittee(cID, entities.CommitteeTypeMonthly, entities.CommitteeStatusScheduled)

	// Test SetCommittee
	err := mevalCache.SetCommittee(ctx, committee)
	require.NoError(t, err)

	// Test GetCommittee
	retrieved, err := mevalCache.GetCommittee(ctx, cID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, committee.ID, retrieved.ID)
	assert.Equal(t, committee.CommitteeType, retrieved.CommitteeType)
}

func TestMevalServiceCache_CommitteeNotFound(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	retrieved, err := mevalCache.GetCommittee(ctx, uuid.New().String())
	assert.Error(t, err)
	assert.Nil(t, retrieved)
}

func TestMevalServiceCache_ScheduledCommittees(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	committees := []*entities.Committee{
		createTestCommittee(uuid.New(), entities.CommitteeTypeMonthly, entities.CommitteeStatusScheduled),
		createTestCommittee(uuid.New(), entities.CommitteeTypeExtraordinary, entities.CommitteeStatusScheduled),
	}

	// Test SetScheduledCommittees
	err := mevalCache.SetScheduledCommittees(ctx, committees)
	require.NoError(t, err)

	// Test GetScheduledCommittees
	retrieved, err := mevalCache.GetScheduledCommittees(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestMevalServiceCache_ActiveCommittees(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	committees := []*entities.Committee{
		createTestCommittee(uuid.New(), entities.CommitteeTypeMonthly, entities.CommitteeStatusInSession),
	}

	// Test SetActiveCommittees
	err := mevalCache.SetActiveCommittees(ctx, committees)
	require.NoError(t, err)

	// Test GetActiveCommittees
	retrieved, err := mevalCache.GetActiveCommittees(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 1)
}

func TestMevalServiceCache_StudentCase(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	caseID := uuid.New()
	studentID := uuid.New()
	committeeID := uuid.New()
	studentCase := createTestStudentCase(caseID, studentID, committeeID, entities.CaseTypeImprovementPlan)

	// Test SetStudentCase
	err := mevalCache.SetStudentCase(ctx, studentCase)
	require.NoError(t, err)

	// Test GetStudentCase
	retrieved, err := mevalCache.GetStudentCase(ctx, caseID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, studentCase.ID, retrieved.ID)
	assert.Equal(t, studentCase.CaseType, retrieved.CaseType)
}

func TestMevalServiceCache_CasesByStudent(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	studentID := uuid.New()
	committeeID := uuid.New()
	cases := []*entities.StudentCase{
		createTestStudentCase(uuid.New(), studentID, committeeID, entities.CaseTypeImprovementPlan),
		createTestStudentCase(uuid.New(), studentID, committeeID, entities.CaseTypeSanction),
	}

	// Test SetCasesByStudent
	err := mevalCache.SetCasesByStudent(ctx, studentID.String(), cases)
	require.NoError(t, err)

	// Test GetCasesByStudent
	retrieved, err := mevalCache.GetCasesByStudent(ctx, studentID.String())
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestMevalServiceCache_CasesByCommittee(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	committeeID := uuid.New()
	cases := []*entities.StudentCase{
		createTestStudentCase(uuid.New(), uuid.New(), committeeID, entities.CaseTypeRecognition),
		createTestStudentCase(uuid.New(), uuid.New(), committeeID, entities.CaseTypeFollowUp),
	}

	// Test SetCasesByCommittee
	err := mevalCache.SetCasesByCommittee(ctx, committeeID.String(), cases)
	require.NoError(t, err)

	// Test GetCasesByCommittee
	retrieved, err := mevalCache.GetCasesByCommittee(ctx, committeeID.String())
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestMevalServiceCache_SanctionTypes(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	types := []entities.SanctionType{
		entities.SanctionTypeVerbalWarning,
		entities.SanctionTypeWrittenWarning,
		entities.SanctionTypeAcademicCommitment,
	}

	// Test SetSanctionTypes
	err := mevalCache.SetSanctionTypes(ctx, types)
	require.NoError(t, err)

	// Test GetSanctionTypes
	retrieved, err := mevalCache.GetSanctionTypes(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 3)
}

func TestMevalServiceCache_Sanction(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	sanctionID := uuid.New()
	studentID := uuid.New()
	caseID := uuid.New()
	sanction := createTestSanction(sanctionID, studentID, caseID, entities.SanctionTypeWrittenWarning)

	// Test SetSanction
	err := mevalCache.SetSanction(ctx, sanction)
	require.NoError(t, err)

	// Test GetSanction
	retrieved, err := mevalCache.GetSanction(ctx, sanctionID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, sanction.ID, retrieved.ID)
	assert.Equal(t, sanction.SanctionType, retrieved.SanctionType)
}

func TestMevalServiceCache_SanctionsByStudent(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	studentID := uuid.New()
	caseID := uuid.New()
	sanctions := []*entities.Sanction{
		createTestSanction(uuid.New(), studentID, caseID, entities.SanctionTypeVerbalWarning),
		createTestSanction(uuid.New(), studentID, caseID, entities.SanctionTypeWrittenWarning),
	}

	// Test SetSanctionsByStudent
	err := mevalCache.SetSanctionsByStudent(ctx, studentID.String(), sanctions)
	require.NoError(t, err)

	// Test GetSanctionsByStudent
	retrieved, err := mevalCache.GetSanctionsByStudent(ctx, studentID.String())
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestMevalServiceCache_ImprovementPlan(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	planID := uuid.New()
	studentID := uuid.New()
	plan := createTestImprovementPlan(planID, studentID, entities.PlanTypeAcademic)

	// Test SetImprovementPlan
	err := mevalCache.SetImprovementPlan(ctx, plan)
	require.NoError(t, err)

	// Test GetImprovementPlan
	retrieved, err := mevalCache.GetImprovementPlan(ctx, planID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, plan.ID, retrieved.ID)
	assert.Equal(t, plan.PlanType, retrieved.PlanType)
}

func TestMevalServiceCache_PlansByStudent(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	studentID := uuid.New()
	plans := []*entities.ImprovementPlan{
		createTestImprovementPlan(uuid.New(), studentID, entities.PlanTypeAcademic),
		createTestImprovementPlan(uuid.New(), studentID, entities.PlanTypeDisciplinary),
	}

	// Test SetPlansByStudent
	err := mevalCache.SetPlansByStudent(ctx, studentID.String(), plans)
	require.NoError(t, err)

	// Test GetPlansByStudent
	retrieved, err := mevalCache.GetPlansByStudent(ctx, studentID.String())
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestMevalServiceCache_ActivePlans(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	plans := []*entities.ImprovementPlan{
		createTestImprovementPlan(uuid.New(), uuid.New(), entities.PlanTypeAcademic),
		createTestImprovementPlan(uuid.New(), uuid.New(), entities.PlanTypeMixed),
	}

	// Test SetActivePlans
	err := mevalCache.SetActivePlans(ctx, plans)
	require.NoError(t, err)

	// Test GetActivePlans
	retrieved, err := mevalCache.GetActivePlans(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestMevalServiceCache_Config(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	config := map[string]interface{}{
		"appeal_days":     5,
		"quorum_required": 3,
		"max_sanctions":   3,
	}

	// Test SetConfig
	err := mevalCache.SetConfig(ctx, config)
	require.NoError(t, err)

	// Test GetConfig
	retrieved, err := mevalCache.GetConfig(ctx)
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
}

func TestMevalServiceCache_InvalidateCommittee(t *testing.T) {
	mevalCache, mockCache := newTestMevalCache(t)
	ctx := context.Background()

	cID := uuid.New()
	committee := createTestCommittee(cID, entities.CommitteeTypeMonthly, entities.CommitteeStatusScheduled)

	err := mevalCache.SetCommittee(ctx, committee)
	require.NoError(t, err)

	countBefore := mockCache.Count()

	err = mevalCache.InvalidateCommittee(ctx, cID.String())
	require.NoError(t, err)

	countAfter := mockCache.Count()
	assert.True(t, countAfter <= countBefore)
}

func TestMevalServiceCache_InvalidateStudentCase(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	caseID := uuid.New()
	studentID := uuid.New()
	studentCase := createTestStudentCase(caseID, studentID, uuid.New(), entities.CaseTypeSanction)

	err := mevalCache.SetStudentCase(ctx, studentCase)
	require.NoError(t, err)

	err = mevalCache.InvalidateStudentCase(ctx, caseID.String(), studentID.String())
	require.NoError(t, err)
}

func TestMevalServiceCache_WarmupCommittees(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	committees := []*entities.Committee{
		createTestCommittee(uuid.New(), entities.CommitteeTypeMonthly, entities.CommitteeStatusScheduled),
		createTestCommittee(uuid.New(), entities.CommitteeTypeExtraordinary, entities.CommitteeStatusScheduled),
	}

	err := mevalCache.WarmupCommittees(ctx, committees)
	require.NoError(t, err)

	// Verify each committee is retrievable
	for _, c := range committees {
		retrieved, err := mevalCache.GetCommittee(ctx, c.ID.String())
		require.NoError(t, err)
		assert.Equal(t, c.CommitteeType, retrieved.CommitteeType)
	}
}

func TestMevalServiceCache_WarmupSanctionTypes(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	err := mevalCache.WarmupSanctionTypes(ctx)
	require.NoError(t, err)

	// Verify sanction types are retrievable
	retrieved, err := mevalCache.GetSanctionTypes(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 7) // 7 sanction types defined
}

func TestMevalServiceCache_SetMultipleCases(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	committeeID := uuid.New()
	cases := []*entities.StudentCase{
		createTestStudentCase(uuid.New(), uuid.New(), committeeID, entities.CaseTypeRecognition),
		createTestStudentCase(uuid.New(), uuid.New(), committeeID, entities.CaseTypeImprovementPlan),
		createTestStudentCase(uuid.New(), uuid.New(), committeeID, entities.CaseTypeSanction),
	}

	err := mevalCache.SetMultipleCases(ctx, cases)
	require.NoError(t, err)

	// Verify each case can be retrieved
	for _, sc := range cases {
		retrieved, err := mevalCache.GetStudentCase(ctx, sc.ID.String())
		require.NoError(t, err)
		assert.Equal(t, sc.CaseType, retrieved.CaseType)
	}
}

func TestMevalServiceCache_Ping(t *testing.T) {
	mevalCache, _ := newTestMevalCache(t)
	ctx := context.Background()

	err := mevalCache.Ping(ctx)
	assert.NoError(t, err)
}

func TestMevalServiceCache_TTLs(t *testing.T) {
	// Verify TTL constants used by MevalService
	assert.Equal(t, 1*time.Hour, cache.TTLModerate)    // Committees
	assert.Equal(t, 30*time.Minute, cache.TTLDynamic)  // Cases, Sanctions, Plans
	assert.Equal(t, 24*time.Hour, cache.TTLVeryStable) // SanctionTypes, Config
}
