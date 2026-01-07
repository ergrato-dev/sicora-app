// Package cache provides caching functionality for EvalinService.
// It integrates with the shared cache package to provide Redis caching
// for questionnaires, questions, evaluation periods, and evaluations.
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"sicora-be-go/pkg/cache"

	"evalinservice/internal/domain/entities"
)

// EvalinServiceCache provides caching for evaluation service entities.
type EvalinServiceCache struct {
	client    cache.CacheInterface
	keyPrefix string
	logger    *log.Logger
}

// NewEvalinServiceCache creates a new EvalinServiceCache.
func NewEvalinServiceCache(client cache.CacheInterface, logger *log.Logger) *EvalinServiceCache {
	return &EvalinServiceCache{
		client:    client,
		keyPrefix: cache.PrefixEvalinService,
		logger:    logger,
	}
}

// NewEvalinServiceCacheFromEnv creates an EvalinServiceCache from environment variables.
func NewEvalinServiceCacheFromEnv(logger *log.Logger) (*EvalinServiceCache, error) {
	client, err := cache.NewRedisClientFromEnv(cache.PrefixEvalinService)
	if err != nil {
		return nil, fmt.Errorf("failed to create Redis client: %w", err)
	}
	return NewEvalinServiceCache(client, logger), nil
}

// Close closes the cache connection.
func (c *EvalinServiceCache) Close() error {
	return c.client.Close()
}

// Ping checks if the cache is healthy.
func (c *EvalinServiceCache) Ping(ctx context.Context) error {
	return c.client.Ping(ctx)
}

// ============================================================================
// Questionnaire Cache Operations
// TTL: SemiStable (6 hours) - Questionnaires change occasionally
// ============================================================================

// questionnaireKey generates a key for a questionnaire.
func (c *EvalinServiceCache) questionnaireKey(id string) string {
	return c.keyPrefix + cache.Evalin().FormTemplate(id)
}

// GetQuestionnaire retrieves a questionnaire from cache by ID.
func (c *EvalinServiceCache) GetQuestionnaire(ctx context.Context, id string) (*entities.Questionnaire, error) {
	key := c.questionnaireKey(id)
	var q entities.Questionnaire
	if err := c.client.GetJSON(ctx, key, &q); err != nil {
		return nil, err
	}
	return &q, nil
}

// SetQuestionnaire stores a questionnaire in cache.
func (c *EvalinServiceCache) SetQuestionnaire(ctx context.Context, q *entities.Questionnaire) error {
	key := c.questionnaireKey(q.ID.String())
	return c.client.SetJSON(ctx, key, q, cache.TTLSemiStable)
}

// InvalidateQuestionnaire removes a questionnaire from cache.
func (c *EvalinServiceCache) InvalidateQuestionnaire(ctx context.Context, id string) error {
	keys := []string{
		c.questionnaireKey(id),
		c.keyPrefix + cache.Evalin().FormTemplatesAll(),
	}
	return c.client.DeleteMany(ctx, keys)
}

// GetAllQuestionnaires retrieves all questionnaires from cache.
func (c *EvalinServiceCache) GetAllQuestionnaires(ctx context.Context) ([]*entities.Questionnaire, error) {
	key := c.keyPrefix + cache.Evalin().FormTemplatesAll()
	var questionnaires []*entities.Questionnaire
	if err := c.client.GetJSON(ctx, key, &questionnaires); err != nil {
		return nil, err
	}
	return questionnaires, nil
}

// SetAllQuestionnaires stores all questionnaires in cache.
func (c *EvalinServiceCache) SetAllQuestionnaires(ctx context.Context, questionnaires []*entities.Questionnaire) error {
	key := c.keyPrefix + cache.Evalin().FormTemplatesAll()
	return c.client.SetJSON(ctx, key, questionnaires, cache.TTLSemiStable)
}

// ============================================================================
// Question Cache Operations
// TTL: SemiStable (6 hours) - Questions are fairly stable
// ============================================================================

// questionKey generates a key for a question.
func (c *EvalinServiceCache) questionKey(id string) string {
	return c.keyPrefix + "question:" + id
}

// GetQuestion retrieves a question from cache by ID.
func (c *EvalinServiceCache) GetQuestion(ctx context.Context, id string) (*entities.Question, error) {
	key := c.questionKey(id)
	var q entities.Question
	if err := c.client.GetJSON(ctx, key, &q); err != nil {
		return nil, err
	}
	return &q, nil
}

// SetQuestion stores a question in cache.
func (c *EvalinServiceCache) SetQuestion(ctx context.Context, q *entities.Question) error {
	key := c.questionKey(q.ID.String())
	return c.client.SetJSON(ctx, key, q, cache.TTLSemiStable)
}

// InvalidateQuestion removes a question from cache.
func (c *EvalinServiceCache) InvalidateQuestion(ctx context.Context, id string) error {
	key := c.questionKey(id)
	return c.client.Delete(ctx, key)
}

// GetQuestionsByCategory retrieves questions by category from cache.
func (c *EvalinServiceCache) GetQuestionsByCategory(ctx context.Context, category string) ([]*entities.Question, error) {
	key := c.keyPrefix + "questions:category:" + category
	var questions []*entities.Question
	if err := c.client.GetJSON(ctx, key, &questions); err != nil {
		return nil, err
	}
	return questions, nil
}

// SetQuestionsByCategory stores questions by category in cache.
func (c *EvalinServiceCache) SetQuestionsByCategory(ctx context.Context, category string, questions []*entities.Question) error {
	key := c.keyPrefix + "questions:category:" + category
	return c.client.SetJSON(ctx, key, questions, cache.TTLSemiStable)
}

// ============================================================================
// Evaluation Period Cache Operations
// TTL: Moderate (1 hour) - Periods are checked frequently
// ============================================================================

// GetActivePeriod retrieves the active evaluation period from cache.
func (c *EvalinServiceCache) GetActivePeriod(ctx context.Context) (*entities.EvaluationPeriod, error) {
	key := c.keyPrefix + cache.Evalin().PeriodActive()
	var period entities.EvaluationPeriod
	if err := c.client.GetJSON(ctx, key, &period); err != nil {
		return nil, err
	}
	return &period, nil
}

// SetActivePeriod stores the active evaluation period in cache.
func (c *EvalinServiceCache) SetActivePeriod(ctx context.Context, period *entities.EvaluationPeriod) error {
	key := c.keyPrefix + cache.Evalin().PeriodActive()
	return c.client.SetJSON(ctx, key, period, cache.TTLModerate)
}

// InvalidateActivePeriod removes the active period from cache.
func (c *EvalinServiceCache) InvalidateActivePeriod(ctx context.Context) error {
	key := c.keyPrefix + cache.Evalin().PeriodActive()
	return c.client.Delete(ctx, key)
}

// GetPeriod retrieves an evaluation period by ID from cache.
func (c *EvalinServiceCache) GetPeriod(ctx context.Context, id string) (*entities.EvaluationPeriod, error) {
	key := c.keyPrefix + cache.Evalin().PeriodByID(id)
	var period entities.EvaluationPeriod
	if err := c.client.GetJSON(ctx, key, &period); err != nil {
		return nil, err
	}
	return &period, nil
}

// SetPeriod stores an evaluation period in cache.
func (c *EvalinServiceCache) SetPeriod(ctx context.Context, period *entities.EvaluationPeriod) error {
	key := c.keyPrefix + cache.Evalin().PeriodByID(period.ID.String())
	return c.client.SetJSON(ctx, key, period, cache.TTLModerate)
}

// InvalidatePeriod removes a period from cache.
func (c *EvalinServiceCache) InvalidatePeriod(ctx context.Context, id string) error {
	keys := []string{
		c.keyPrefix + cache.Evalin().PeriodByID(id),
		c.keyPrefix + cache.Evalin().PeriodActive(),
	}
	return c.client.DeleteMany(ctx, keys)
}

// ============================================================================
// Evaluation Criteria Cache Operations
// TTL: Stable (12 hours) - Criteria rarely change
// ============================================================================

// GetCriteria retrieves evaluation criteria by ID from cache.
func (c *EvalinServiceCache) GetCriteria(ctx context.Context, id string) (interface{}, error) {
	key := c.keyPrefix + cache.Evalin().Criteria(id)
	var criteria interface{}
	if err := c.client.GetJSON(ctx, key, &criteria); err != nil {
		return nil, err
	}
	return criteria, nil
}

// SetCriteria stores evaluation criteria in cache.
func (c *EvalinServiceCache) SetCriteria(ctx context.Context, id string, criteria interface{}) error {
	key := c.keyPrefix + cache.Evalin().Criteria(id)
	return c.client.SetJSON(ctx, key, criteria, cache.TTLStable)
}

// GetAllCriteria retrieves all evaluation criteria from cache.
func (c *EvalinServiceCache) GetAllCriteria(ctx context.Context) (interface{}, error) {
	key := c.keyPrefix + cache.Evalin().CriteriaAll()
	var criteria interface{}
	if err := c.client.GetJSON(ctx, key, &criteria); err != nil {
		return nil, err
	}
	return criteria, nil
}

// SetAllCriteria stores all evaluation criteria in cache.
func (c *EvalinServiceCache) SetAllCriteria(ctx context.Context, criteria interface{}) error {
	key := c.keyPrefix + cache.Evalin().CriteriaAll()
	return c.client.SetJSON(ctx, key, criteria, cache.TTLStable)
}

// InvalidateCriteria removes criteria from cache.
func (c *EvalinServiceCache) InvalidateCriteria(ctx context.Context, id string) error {
	keys := []string{
		c.keyPrefix + cache.Evalin().Criteria(id),
		c.keyPrefix + cache.Evalin().CriteriaAll(),
	}
	return c.client.DeleteMany(ctx, keys)
}

// ============================================================================
// Warmup Functions
// ============================================================================

// WarmupQuestionnaires preloads questionnaires into cache.
func (c *EvalinServiceCache) WarmupQuestionnaires(ctx context.Context, questionnaires []*entities.Questionnaire) error {
	if len(questionnaires) == 0 {
		return nil
	}

	// Cache all questionnaires list
	if err := c.SetAllQuestionnaires(ctx, questionnaires); err != nil {
		return fmt.Errorf("failed to warmup questionnaires list: %w", err)
	}

	// Cache individual questionnaires
	for _, q := range questionnaires {
		_ = c.SetQuestionnaire(ctx, q)
	}

	c.logger.Printf("[CACHE] Warmed up %d questionnaires", len(questionnaires))
	return nil
}

// WarmupQuestions preloads questions into cache.
func (c *EvalinServiceCache) WarmupQuestions(ctx context.Context, questions []*entities.Question) error {
	if len(questions) == 0 {
		return nil
	}

	for _, q := range questions {
		_ = c.SetQuestion(ctx, q)
	}

	c.logger.Printf("[CACHE] Warmed up %d questions", len(questions))
	return nil
}

// ============================================================================
// Batch Operations
// ============================================================================

// SetMultipleQuestionnaires stores multiple questionnaires in cache at once.
func (c *EvalinServiceCache) SetMultipleQuestionnaires(ctx context.Context, questionnaires []*entities.Questionnaire) error {
	items := make(map[string][]byte)
	for _, q := range questionnaires {
		key := c.questionnaireKey(q.ID.String())
		data, err := json.Marshal(q)
		if err != nil {
			c.logger.Printf("[CACHE] Failed to marshal questionnaire %s: %v", q.ID.String(), err)
			continue
		}
		items[key] = data
	}
	if len(items) == 0 {
		return nil
	}
	return c.client.SetMany(ctx, items, cache.TTLSemiStable)
}

// InvalidateMultipleQuestionnaires removes multiple questionnaires from cache.
func (c *EvalinServiceCache) InvalidateMultipleQuestionnaires(ctx context.Context, ids []string) error {
	keys := make([]string, len(ids)+1)
	for i, id := range ids {
		keys[i] = c.questionnaireKey(id)
	}
	keys[len(ids)] = c.keyPrefix + cache.Evalin().FormTemplatesAll()
	return c.client.DeleteMany(ctx, keys)
}
