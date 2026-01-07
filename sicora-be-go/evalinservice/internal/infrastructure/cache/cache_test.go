// Package cache provides test coverage for EvalinService cache operations.
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

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/valueobjects"
)

// Helper to create a test cache with mock client
func newTestEvalinCache(t *testing.T) (*EvalinServiceCache, *cache.MockCache) {
	mockCache := cache.NewMockCache()
	logger := log.New(os.Stdout, "[test-evalin-cache] ", log.LstdFlags)
	evalinCache := NewEvalinServiceCache(mockCache, logger)
	return evalinCache, mockCache
}

// Helper to create a test questionnaire
func createTestQuestionnaire(id uuid.UUID, name, description string) *entities.Questionnaire {
	now := time.Now()
	return &entities.Questionnaire{
		ID:          id,
		Name:        name,
		Description: description,
		IsActive:    true,
		QuestionIDs: []uuid.UUID{},
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// Helper to create a test question
func createTestQuestion(id uuid.UUID, text, category string) *entities.Question {
	now := time.Now()
	return &entities.Question{
		ID:          id,
		Text:        text,
		Description: "Test description",
		Type:        valueobjects.QuestionTypeLikert,
		Category:    category,
		Options:     []string{"1", "2", "3", "4", "5"},
		IsRequired:  true,
		IsActive:    true,
		Order:       1,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// Helper to create a test evaluation period
func createTestPeriod(id uuid.UUID, name string) *entities.EvaluationPeriod {
	now := time.Now()
	return &entities.EvaluationPeriod{
		ID:              id,
		Name:            name,
		Description:     "Test period",
		StartDate:       now,
		EndDate:         now.AddDate(0, 1, 0),
		Status:          valueobjects.PeriodStatusActive,
		QuestionnaireID: uuid.New(),
		FichaID:         uuid.New(),
		IsActive:        true,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

func TestEvalinServiceCache_Questionnaire(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	qID := uuid.New()
	questionnaire := createTestQuestionnaire(qID, "Evaluación de Instructor", "Cuestionario para evaluar instructores")

	// Test SetQuestionnaire
	err := evalinCache.SetQuestionnaire(ctx, questionnaire)
	require.NoError(t, err)

	// Test GetQuestionnaire
	retrieved, err := evalinCache.GetQuestionnaire(ctx, qID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, questionnaire.ID, retrieved.ID)
	assert.Equal(t, questionnaire.Name, retrieved.Name)
}

func TestEvalinServiceCache_QuestionnaireNotFound(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	retrieved, err := evalinCache.GetQuestionnaire(ctx, uuid.New().String())
	assert.Error(t, err)
	assert.Nil(t, retrieved)
}

func TestEvalinServiceCache_AllQuestionnaires(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	questionnaires := []*entities.Questionnaire{
		createTestQuestionnaire(uuid.New(), "Questionnaire 1", "Desc 1"),
		createTestQuestionnaire(uuid.New(), "Questionnaire 2", "Desc 2"),
	}

	// Test SetAllQuestionnaires
	err := evalinCache.SetAllQuestionnaires(ctx, questionnaires)
	require.NoError(t, err)

	// Test GetAllQuestionnaires
	retrieved, err := evalinCache.GetAllQuestionnaires(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestEvalinServiceCache_Question(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	qID := uuid.New()
	question := createTestQuestion(qID, "¿El instructor explica claramente?", "pedagogia")

	// Test SetQuestion
	err := evalinCache.SetQuestion(ctx, question)
	require.NoError(t, err)

	// Test GetQuestion
	retrieved, err := evalinCache.GetQuestion(ctx, qID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, question.ID, retrieved.ID)
	assert.Equal(t, question.Text, retrieved.Text)
}

func TestEvalinServiceCache_QuestionsByCategory(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	category := "pedagogia"
	questions := []*entities.Question{
		createTestQuestion(uuid.New(), "Question 1", category),
		createTestQuestion(uuid.New(), "Question 2", category),
	}

	// Test SetQuestionsByCategory
	err := evalinCache.SetQuestionsByCategory(ctx, category, questions)
	require.NoError(t, err)

	// Test GetQuestionsByCategory
	retrieved, err := evalinCache.GetQuestionsByCategory(ctx, category)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestEvalinServiceCache_ActivePeriod(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	period := createTestPeriod(uuid.New(), "Periodo 2026-1")

	// Test SetActivePeriod
	err := evalinCache.SetActivePeriod(ctx, period)
	require.NoError(t, err)

	// Test GetActivePeriod
	retrieved, err := evalinCache.GetActivePeriod(ctx)
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, period.Name, retrieved.Name)
}

func TestEvalinServiceCache_Period(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	pID := uuid.New()
	period := createTestPeriod(pID, "Periodo Test")

	// Test SetPeriod
	err := evalinCache.SetPeriod(ctx, period)
	require.NoError(t, err)

	// Test GetPeriod
	retrieved, err := evalinCache.GetPeriod(ctx, pID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, period.ID, retrieved.ID)
}

func TestEvalinServiceCache_InvalidateQuestionnaire(t *testing.T) {
	evalinCache, mockCache := newTestEvalinCache(t)
	ctx := context.Background()

	qID := uuid.New()
	questionnaire := createTestQuestionnaire(qID, "Test Questionnaire", "Description")

	// Set first
	err := evalinCache.SetQuestionnaire(ctx, questionnaire)
	require.NoError(t, err)

	countBefore := mockCache.Count()

	// Invalidate
	err = evalinCache.InvalidateQuestionnaire(ctx, qID.String())
	require.NoError(t, err)

	countAfter := mockCache.Count()
	assert.True(t, countAfter <= countBefore)
}

func TestEvalinServiceCache_InvalidatePeriod(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	pID := uuid.New()
	period := createTestPeriod(pID, "Test Period")

	// Set first
	err := evalinCache.SetPeriod(ctx, period)
	require.NoError(t, err)

	// Invalidate
	err = evalinCache.InvalidatePeriod(ctx, pID.String())
	require.NoError(t, err)
}

func TestEvalinServiceCache_Criteria(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	criteria := map[string]interface{}{
		"min_score":     1,
		"max_score":     5,
		"passing_score": 3,
	}

	// Test SetCriteria
	err := evalinCache.SetCriteria(ctx, "default", criteria)
	require.NoError(t, err)

	// Test GetCriteria
	retrieved, err := evalinCache.GetCriteria(ctx, "default")
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
}

func TestEvalinServiceCache_AllCriteria(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	criteria := []map[string]interface{}{
		{"id": "1", "name": "Criteria 1"},
		{"id": "2", "name": "Criteria 2"},
	}

	// Test SetAllCriteria
	err := evalinCache.SetAllCriteria(ctx, criteria)
	require.NoError(t, err)

	// Test GetAllCriteria
	retrieved, err := evalinCache.GetAllCriteria(ctx)
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
}

func TestEvalinServiceCache_WarmupQuestionnaires(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	questionnaires := []*entities.Questionnaire{
		createTestQuestionnaire(uuid.New(), "Q1", "Desc 1"),
		createTestQuestionnaire(uuid.New(), "Q2", "Desc 2"),
	}

	// Test WarmupQuestionnaires
	err := evalinCache.WarmupQuestionnaires(ctx, questionnaires)
	require.NoError(t, err)

	// Verify each questionnaire is retrievable
	for _, q := range questionnaires {
		retrieved, err := evalinCache.GetQuestionnaire(ctx, q.ID.String())
		require.NoError(t, err)
		assert.Equal(t, q.Name, retrieved.Name)
	}
}

func TestEvalinServiceCache_WarmupQuestions(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	questions := []*entities.Question{
		createTestQuestion(uuid.New(), "Q1", "cat1"),
		createTestQuestion(uuid.New(), "Q2", "cat2"),
	}

	// Test WarmupQuestions
	err := evalinCache.WarmupQuestions(ctx, questions)
	require.NoError(t, err)

	// Verify each question is retrievable
	for _, q := range questions {
		retrieved, err := evalinCache.GetQuestion(ctx, q.ID.String())
		require.NoError(t, err)
		assert.Equal(t, q.Text, retrieved.Text)
	}
}

func TestEvalinServiceCache_SetMultipleQuestionnaires(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	questionnaires := []*entities.Questionnaire{
		createTestQuestionnaire(uuid.New(), "Batch Q1", "Desc 1"),
		createTestQuestionnaire(uuid.New(), "Batch Q2", "Desc 2"),
		createTestQuestionnaire(uuid.New(), "Batch Q3", "Desc 3"),
	}

	// Test SetMultipleQuestionnaires
	err := evalinCache.SetMultipleQuestionnaires(ctx, questionnaires)
	require.NoError(t, err)

	// Verify each can be retrieved
	for _, q := range questionnaires {
		retrieved, err := evalinCache.GetQuestionnaire(ctx, q.ID.String())
		require.NoError(t, err)
		assert.Equal(t, q.Name, retrieved.Name)
	}
}

func TestEvalinServiceCache_Ping(t *testing.T) {
	evalinCache, _ := newTestEvalinCache(t)
	ctx := context.Background()

	err := evalinCache.Ping(ctx)
	assert.NoError(t, err)
}

func TestEvalinServiceCache_TTLs(t *testing.T) {
	// Verify TTL constants used by EvalinService
	assert.Equal(t, 6*time.Hour, cache.TTLSemiStable) // Questionnaires, Questions
	assert.Equal(t, 1*time.Hour, cache.TTLModerate)   // Periods
	assert.Equal(t, 12*time.Hour, cache.TTLStable)    // Criteria
}
