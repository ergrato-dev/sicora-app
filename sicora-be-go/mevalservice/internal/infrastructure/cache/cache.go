// Package cache provides caching functionality for MevalService.
// It integrates with the shared cache package to provide Redis caching
// for committees, student cases, sanctions, and improvement plans.
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"sicora-be-go/pkg/cache"

	"mevalservice/internal/domain/entities"
)

// MevalServiceCache provides caching for the evaluation committee service entities.
type MevalServiceCache struct {
	client    cache.CacheInterface
	keyPrefix string
	logger    *log.Logger
}

// NewMevalServiceCache creates a new MevalServiceCache.
func NewMevalServiceCache(client cache.CacheInterface, logger *log.Logger) *MevalServiceCache {
	return &MevalServiceCache{
		client:    client,
		keyPrefix: cache.PrefixMevalService,
		logger:    logger,
	}
}

// NewMevalServiceCacheFromEnv creates a MevalServiceCache from environment variables.
func NewMevalServiceCacheFromEnv(logger *log.Logger) (*MevalServiceCache, error) {
	client, err := cache.NewRedisClientFromEnv(cache.PrefixMevalService)
	if err != nil {
		return nil, fmt.Errorf("failed to create Redis client: %w", err)
	}
	return NewMevalServiceCache(client, logger), nil
}

// Close closes the cache connection.
func (c *MevalServiceCache) Close() error {
	return c.client.Close()
}

// Ping checks if the cache is healthy.
func (c *MevalServiceCache) Ping(ctx context.Context) error {
	return c.client.Ping(ctx)
}

// ============================================================================
// Committee Cache Operations
// TTL: Moderate (1 hour) - Committees have active sessions
// ============================================================================

// committeeKey generates a key for a committee.
func (c *MevalServiceCache) committeeKey(id string) string {
	return c.keyPrefix + "committee:" + id
}

// GetCommittee retrieves a committee from cache by ID.
func (c *MevalServiceCache) GetCommittee(ctx context.Context, id string) (*entities.Committee, error) {
	key := c.committeeKey(id)
	var committee entities.Committee
	if err := c.client.GetJSON(ctx, key, &committee); err != nil {
		return nil, err
	}
	return &committee, nil
}

// SetCommittee stores a committee in cache.
func (c *MevalServiceCache) SetCommittee(ctx context.Context, committee *entities.Committee) error {
	key := c.committeeKey(committee.ID.String())
	return c.client.SetJSON(ctx, key, committee, cache.TTLModerate)
}

// InvalidateCommittee removes a committee from cache.
func (c *MevalServiceCache) InvalidateCommittee(ctx context.Context, id string) error {
	keys := []string{
		c.committeeKey(id),
		c.keyPrefix + "committees:scheduled",
		c.keyPrefix + "committees:active",
	}
	return c.client.DeleteMany(ctx, keys)
}

// GetScheduledCommittees retrieves scheduled committees from cache.
func (c *MevalServiceCache) GetScheduledCommittees(ctx context.Context) ([]*entities.Committee, error) {
	key := c.keyPrefix + "committees:scheduled"
	var committees []*entities.Committee
	if err := c.client.GetJSON(ctx, key, &committees); err != nil {
		return nil, err
	}
	return committees, nil
}

// SetScheduledCommittees stores scheduled committees in cache.
func (c *MevalServiceCache) SetScheduledCommittees(ctx context.Context, committees []*entities.Committee) error {
	key := c.keyPrefix + "committees:scheduled"
	return c.client.SetJSON(ctx, key, committees, cache.TTLModerate)
}

// GetActiveCommittees retrieves committees with active sessions from cache.
func (c *MevalServiceCache) GetActiveCommittees(ctx context.Context) ([]*entities.Committee, error) {
	key := c.keyPrefix + "committees:active"
	var committees []*entities.Committee
	if err := c.client.GetJSON(ctx, key, &committees); err != nil {
		return nil, err
	}
	return committees, nil
}

// SetActiveCommittees stores active committees in cache.
func (c *MevalServiceCache) SetActiveCommittees(ctx context.Context, committees []*entities.Committee) error {
	key := c.keyPrefix + "committees:active"
	return c.client.SetJSON(ctx, key, committees, cache.TTLModerate)
}

// ============================================================================
// Student Case Cache Operations
// TTL: Dynamic (30 minutes) - Cases are frequently updated
// ============================================================================

// caseKey generates a key for a student case.
func (c *MevalServiceCache) caseKey(id string) string {
	return c.keyPrefix + "case:" + id
}

// GetStudentCase retrieves a student case from cache by ID.
func (c *MevalServiceCache) GetStudentCase(ctx context.Context, id string) (*entities.StudentCase, error) {
	key := c.caseKey(id)
	var studentCase entities.StudentCase
	if err := c.client.GetJSON(ctx, key, &studentCase); err != nil {
		return nil, err
	}
	return &studentCase, nil
}

// SetStudentCase stores a student case in cache.
func (c *MevalServiceCache) SetStudentCase(ctx context.Context, studentCase *entities.StudentCase) error {
	key := c.caseKey(studentCase.ID.String())
	return c.client.SetJSON(ctx, key, studentCase, cache.TTLDynamic)
}

// InvalidateStudentCase removes a student case from cache.
func (c *MevalServiceCache) InvalidateStudentCase(ctx context.Context, id, studentID string) error {
	keys := []string{
		c.caseKey(id),
	}
	if studentID != "" {
		keys = append(keys, c.keyPrefix+"cases:student:"+studentID)
	}
	return c.client.DeleteMany(ctx, keys)
}

// GetCasesByStudent retrieves student cases by student ID from cache.
func (c *MevalServiceCache) GetCasesByStudent(ctx context.Context, studentID string) ([]*entities.StudentCase, error) {
	key := c.keyPrefix + "cases:student:" + studentID
	var cases []*entities.StudentCase
	if err := c.client.GetJSON(ctx, key, &cases); err != nil {
		return nil, err
	}
	return cases, nil
}

// SetCasesByStudent stores student cases by student ID in cache.
func (c *MevalServiceCache) SetCasesByStudent(ctx context.Context, studentID string, cases []*entities.StudentCase) error {
	key := c.keyPrefix + "cases:student:" + studentID
	return c.client.SetJSON(ctx, key, cases, cache.TTLDynamic)
}

// GetCasesByCommittee retrieves student cases by committee ID from cache.
func (c *MevalServiceCache) GetCasesByCommittee(ctx context.Context, committeeID string) ([]*entities.StudentCase, error) {
	key := c.keyPrefix + "cases:committee:" + committeeID
	var cases []*entities.StudentCase
	if err := c.client.GetJSON(ctx, key, &cases); err != nil {
		return nil, err
	}
	return cases, nil
}

// SetCasesByCommittee stores student cases by committee ID in cache.
func (c *MevalServiceCache) SetCasesByCommittee(ctx context.Context, committeeID string, cases []*entities.StudentCase) error {
	key := c.keyPrefix + "cases:committee:" + committeeID
	return c.client.SetJSON(ctx, key, cases, cache.TTLDynamic)
}

// ============================================================================
// Sanction Types Cache Operations
// TTL: VeryStable (24 hours) - Sanction types rarely change
// ============================================================================

// GetSanctionTypes retrieves sanction types from cache.
func (c *MevalServiceCache) GetSanctionTypes(ctx context.Context) ([]entities.SanctionType, error) {
	key := c.keyPrefix + cache.Meval().SanctionTypes()
	var types []entities.SanctionType
	if err := c.client.GetJSON(ctx, key, &types); err != nil {
		return nil, err
	}
	return types, nil
}

// SetSanctionTypes stores sanction types in cache.
func (c *MevalServiceCache) SetSanctionTypes(ctx context.Context, types []entities.SanctionType) error {
	key := c.keyPrefix + cache.Meval().SanctionTypes()
	return c.client.SetJSON(ctx, key, types, cache.TTLVeryStable)
}

// ============================================================================
// Sanction Cache Operations
// TTL: Dynamic (30 minutes) - Sanctions may be appealed
// ============================================================================

// sanctionKey generates a key for a sanction.
func (c *MevalServiceCache) sanctionKey(id string) string {
	return c.keyPrefix + "sanction:" + id
}

// GetSanction retrieves a sanction from cache by ID.
func (c *MevalServiceCache) GetSanction(ctx context.Context, id string) (*entities.Sanction, error) {
	key := c.sanctionKey(id)
	var sanction entities.Sanction
	if err := c.client.GetJSON(ctx, key, &sanction); err != nil {
		return nil, err
	}
	return &sanction, nil
}

// SetSanction stores a sanction in cache.
func (c *MevalServiceCache) SetSanction(ctx context.Context, sanction *entities.Sanction) error {
	key := c.sanctionKey(sanction.ID.String())
	return c.client.SetJSON(ctx, key, sanction, cache.TTLDynamic)
}

// InvalidateSanction removes a sanction from cache.
func (c *MevalServiceCache) InvalidateSanction(ctx context.Context, id, studentID string) error {
	keys := []string{
		c.sanctionKey(id),
	}
	if studentID != "" {
		keys = append(keys, c.keyPrefix+"sanctions:student:"+studentID)
	}
	return c.client.DeleteMany(ctx, keys)
}

// GetSanctionsByStudent retrieves sanctions by student ID from cache.
func (c *MevalServiceCache) GetSanctionsByStudent(ctx context.Context, studentID string) ([]*entities.Sanction, error) {
	key := c.keyPrefix + "sanctions:student:" + studentID
	var sanctions []*entities.Sanction
	if err := c.client.GetJSON(ctx, key, &sanctions); err != nil {
		return nil, err
	}
	return sanctions, nil
}

// SetSanctionsByStudent stores sanctions by student ID in cache.
func (c *MevalServiceCache) SetSanctionsByStudent(ctx context.Context, studentID string, sanctions []*entities.Sanction) error {
	key := c.keyPrefix + "sanctions:student:" + studentID
	return c.client.SetJSON(ctx, key, sanctions, cache.TTLDynamic)
}

// ============================================================================
// Improvement Plan Cache Operations
// TTL: Dynamic (30 minutes) - Plans are actively tracked
// ============================================================================

// planKey generates a key for an improvement plan.
func (c *MevalServiceCache) planKey(id string) string {
	return c.keyPrefix + "plan:" + id
}

// GetImprovementPlan retrieves an improvement plan from cache by ID.
func (c *MevalServiceCache) GetImprovementPlan(ctx context.Context, id string) (*entities.ImprovementPlan, error) {
	key := c.planKey(id)
	var plan entities.ImprovementPlan
	if err := c.client.GetJSON(ctx, key, &plan); err != nil {
		return nil, err
	}
	return &plan, nil
}

// SetImprovementPlan stores an improvement plan in cache.
func (c *MevalServiceCache) SetImprovementPlan(ctx context.Context, plan *entities.ImprovementPlan) error {
	key := c.planKey(plan.ID.String())
	return c.client.SetJSON(ctx, key, plan, cache.TTLDynamic)
}

// InvalidateImprovementPlan removes an improvement plan from cache.
func (c *MevalServiceCache) InvalidateImprovementPlan(ctx context.Context, id, studentID string) error {
	keys := []string{
		c.planKey(id),
	}
	if studentID != "" {
		keys = append(keys, c.keyPrefix+"plans:student:"+studentID)
	}
	return c.client.DeleteMany(ctx, keys)
}

// GetPlansByStudent retrieves improvement plans by student ID from cache.
func (c *MevalServiceCache) GetPlansByStudent(ctx context.Context, studentID string) ([]*entities.ImprovementPlan, error) {
	key := c.keyPrefix + "plans:student:" + studentID
	var plans []*entities.ImprovementPlan
	if err := c.client.GetJSON(ctx, key, &plans); err != nil {
		return nil, err
	}
	return plans, nil
}

// SetPlansByStudent stores improvement plans by student ID in cache.
func (c *MevalServiceCache) SetPlansByStudent(ctx context.Context, studentID string, plans []*entities.ImprovementPlan) error {
	key := c.keyPrefix + "plans:student:" + studentID
	return c.client.SetJSON(ctx, key, plans, cache.TTLDynamic)
}

// GetActivePlans retrieves active improvement plans from cache.
func (c *MevalServiceCache) GetActivePlans(ctx context.Context) ([]*entities.ImprovementPlan, error) {
	key := c.keyPrefix + "plans:active"
	var plans []*entities.ImprovementPlan
	if err := c.client.GetJSON(ctx, key, &plans); err != nil {
		return nil, err
	}
	return plans, nil
}

// SetActivePlans stores active improvement plans in cache.
func (c *MevalServiceCache) SetActivePlans(ctx context.Context, plans []*entities.ImprovementPlan) error {
	key := c.keyPrefix + "plans:active"
	return c.client.SetJSON(ctx, key, plans, cache.TTLDynamic)
}

// ============================================================================
// Configuration Cache Operations
// TTL: VeryStable (24 hours) - Config rarely changes
// ============================================================================

// GetConfig retrieves service configuration from cache.
func (c *MevalServiceCache) GetConfig(ctx context.Context) (interface{}, error) {
	key := c.keyPrefix + cache.Meval().Config()
	var config interface{}
	if err := c.client.GetJSON(ctx, key, &config); err != nil {
		return nil, err
	}
	return config, nil
}

// SetConfig stores service configuration in cache.
func (c *MevalServiceCache) SetConfig(ctx context.Context, config interface{}) error {
	key := c.keyPrefix + cache.Meval().Config()
	return c.client.SetJSON(ctx, key, config, cache.TTLVeryStable)
}

// InvalidateConfig removes configuration from cache.
func (c *MevalServiceCache) InvalidateConfig(ctx context.Context) error {
	key := c.keyPrefix + cache.Meval().Config()
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Warmup Functions
// ============================================================================

// WarmupCommittees preloads committees into cache.
func (c *MevalServiceCache) WarmupCommittees(ctx context.Context, committees []*entities.Committee) error {
	if len(committees) == 0 {
		return nil
	}

	// Cache individual committees
	for _, committee := range committees {
		_ = c.SetCommittee(ctx, committee)
	}

	c.logger.Printf("[CACHE] Warmed up %d committees", len(committees))
	return nil
}

// WarmupSanctionTypes preloads sanction types into cache.
func (c *MevalServiceCache) WarmupSanctionTypes(ctx context.Context) error {
	types := []entities.SanctionType{
		entities.SanctionTypeLlamadoAtencionVerbal,
		entities.SanctionTypeLlamadoAtencionEscrito,
		entities.SanctionTypePlanMejoramiento,
		entities.SanctionTypeCondicionamiento,
		entities.SanctionTypeCancelacion,
	}
	if err := c.SetSanctionTypes(ctx, types); err != nil {
		return fmt.Errorf("failed to warmup sanction types: %w", err)
	}
	c.logger.Printf("[CACHE] Warmed up %d sanction types", len(types))
	return nil
}

// ============================================================================
// Batch Operations
// ============================================================================

// SetMultipleCases stores multiple student cases in cache at once.
func (c *MevalServiceCache) SetMultipleCases(ctx context.Context, cases []*entities.StudentCase) error {
	items := make(map[string][]byte)
	for _, sc := range cases {
		key := c.caseKey(sc.ID.String())
		data, err := json.Marshal(sc)
		if err != nil {
			c.logger.Printf("[CACHE] Failed to marshal case %s: %v", sc.ID.String(), err)
			continue
		}
		items[key] = data
	}
	if len(items) == 0 {
		return nil
	}
	return c.client.SetMany(ctx, items, cache.TTLDynamic)
}

// InvalidateMultipleCases removes multiple student cases from cache.
func (c *MevalServiceCache) InvalidateMultipleCases(ctx context.Context, caseIDs []string) error {
	keys := make([]string, len(caseIDs))
	for i, id := range caseIDs {
		keys[i] = c.caseKey(id)
	}
	return c.client.DeleteMany(ctx, keys)
}
