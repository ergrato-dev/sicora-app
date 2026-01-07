// Package cache provides caching functionality for KbService.
// It integrates with the shared cache package to provide Redis caching
// for frequently accessed FAQs, Documents, and Categories.
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"sicora-be-go/pkg/cache"

	"kbservice/internal/domain/entities"
)

// KbServiceCache provides caching for knowledge base service entities.
type KbServiceCache struct {
	client    cache.CacheInterface
	keyPrefix string
	logger    *log.Logger
}

// NewKbServiceCache creates a new KbServiceCache.
func NewKbServiceCache(client cache.CacheInterface, logger *log.Logger) *KbServiceCache {
	return &KbServiceCache{
		client:    client,
		keyPrefix: cache.PrefixKbService,
		logger:    logger,
	}
}

// NewKbServiceCacheFromEnv creates a KbServiceCache from environment variables.
func NewKbServiceCacheFromEnv(logger *log.Logger) (*KbServiceCache, error) {
	client, err := cache.NewRedisClientFromEnv(cache.PrefixKbService)
	if err != nil {
		return nil, fmt.Errorf("failed to create Redis client: %w", err)
	}
	return NewKbServiceCache(client, logger), nil
}

// Close closes the cache connection.
func (c *KbServiceCache) Close() error {
	return c.client.Close()
}

// Ping checks if the cache is healthy.
func (c *KbServiceCache) Ping(ctx context.Context) error {
	return c.client.Ping(ctx)
}

// ============================================================================
// FAQ Cache Operations
// TTL: Stable (12 hours) - FAQs don't change frequently
// ============================================================================

// GetFAQ retrieves a FAQ from cache by ID.
func (c *KbServiceCache) GetFAQ(ctx context.Context, id string) (*entities.FAQ, error) {
	key := c.keyPrefix + cache.Kb().FAQ(id)
	var faq entities.FAQ
	if err := c.client.GetJSON(ctx, key, &faq); err != nil {
		return nil, err
	}
	return &faq, nil
}

// SetFAQ stores a FAQ in cache.
func (c *KbServiceCache) SetFAQ(ctx context.Context, faq *entities.FAQ) error {
	key := c.keyPrefix + cache.Kb().FAQ(faq.ID.String())
	return c.client.SetJSON(ctx, key, faq, cache.TTLStable)
}

// InvalidateFAQ removes a FAQ from cache.
func (c *KbServiceCache) InvalidateFAQ(ctx context.Context, id string) error {
	keys := []string{
		c.keyPrefix + cache.Kb().FAQ(id),
	}
	// Also invalidate list caches
	keys = append(keys, c.keyPrefix+cache.Kb().FAQsAll())
	keys = append(keys, c.keyPrefix+cache.Kb().FAQsActive())
	return c.client.DeleteMany(ctx, keys)
}

// ============================================================================
// FAQs by Category Cache Operations
// TTL: Stable (12 hours)
// ============================================================================

// GetFAQsByCategory retrieves FAQs for a category from cache.
func (c *KbServiceCache) GetFAQsByCategory(ctx context.Context, category string) ([]*entities.FAQ, error) {
	key := c.keyPrefix + cache.Kb().FAQsByCategory(category)
	var faqs []*entities.FAQ
	if err := c.client.GetJSON(ctx, key, &faqs); err != nil {
		return nil, err
	}
	return faqs, nil
}

// SetFAQsByCategory stores FAQs for a category in cache.
func (c *KbServiceCache) SetFAQsByCategory(ctx context.Context, category string, faqs []*entities.FAQ) error {
	key := c.keyPrefix + cache.Kb().FAQsByCategory(category)
	return c.client.SetJSON(ctx, key, faqs, cache.TTLStable)
}

// InvalidateFAQsByCategory removes a category's FAQs from cache.
func (c *KbServiceCache) InvalidateFAQsByCategory(ctx context.Context, category string) error {
	key := c.keyPrefix + cache.Kb().FAQsByCategory(category)
	return c.client.Delete(ctx, key)
}

// ============================================================================
// All FAQs Cache Operations
// TTL: Stable (12 hours)
// ============================================================================

// GetAllFAQs retrieves all FAQs from cache.
func (c *KbServiceCache) GetAllFAQs(ctx context.Context) ([]*entities.FAQ, error) {
	key := c.keyPrefix + cache.Kb().FAQsAll()
	var faqs []*entities.FAQ
	if err := c.client.GetJSON(ctx, key, &faqs); err != nil {
		return nil, err
	}
	return faqs, nil
}

// SetAllFAQs stores all FAQs in cache.
func (c *KbServiceCache) SetAllFAQs(ctx context.Context, faqs []*entities.FAQ) error {
	key := c.keyPrefix + cache.Kb().FAQsAll()
	return c.client.SetJSON(ctx, key, faqs, cache.TTLStable)
}

// InvalidateAllFAQs removes all FAQs list from cache.
func (c *KbServiceCache) InvalidateAllFAQs(ctx context.Context) error {
	key := c.keyPrefix + cache.Kb().FAQsAll()
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Active FAQs Cache Operations
// TTL: Stable (12 hours)
// ============================================================================

// GetActiveFAQs retrieves active/published FAQs from cache.
func (c *KbServiceCache) GetActiveFAQs(ctx context.Context) ([]*entities.FAQ, error) {
	key := c.keyPrefix + cache.Kb().FAQsActive()
	var faqs []*entities.FAQ
	if err := c.client.GetJSON(ctx, key, &faqs); err != nil {
		return nil, err
	}
	return faqs, nil
}

// SetActiveFAQs stores active/published FAQs in cache.
func (c *KbServiceCache) SetActiveFAQs(ctx context.Context, faqs []*entities.FAQ) error {
	key := c.keyPrefix + cache.Kb().FAQsActive()
	return c.client.SetJSON(ctx, key, faqs, cache.TTLStable)
}

// InvalidateActiveFAQs removes active FAQs from cache.
func (c *KbServiceCache) InvalidateActiveFAQs(ctx context.Context) error {
	key := c.keyPrefix + cache.Kb().FAQsActive()
	return c.client.Delete(ctx, key)
}

// ============================================================================
// Category Cache Operations
// TTL: Very Stable (24 hours) - Categories rarely change
// ============================================================================

// GetCategory retrieves a category from cache by ID.
func (c *KbServiceCache) GetCategory(ctx context.Context, id string) (*entities.DocumentCategory, error) {
	key := c.keyPrefix + cache.Kb().Category(id)
	var category entities.DocumentCategory
	if err := c.client.GetJSON(ctx, key, &category); err != nil {
		return nil, err
	}
	return &category, nil
}

// SetCategory stores a category in cache.
func (c *KbServiceCache) SetCategory(ctx context.Context, id string, category *entities.DocumentCategory) error {
	key := c.keyPrefix + cache.Kb().Category(id)
	return c.client.SetJSON(ctx, key, category, cache.TTLVeryStable)
}

// GetAllCategories retrieves all categories from cache.
func (c *KbServiceCache) GetAllCategories(ctx context.Context) ([]entities.DocumentCategory, error) {
	key := c.keyPrefix + cache.Kb().CategoriesAll()
	var categories []entities.DocumentCategory
	if err := c.client.GetJSON(ctx, key, &categories); err != nil {
		return nil, err
	}
	return categories, nil
}

// SetAllCategories stores all categories in cache.
func (c *KbServiceCache) SetAllCategories(ctx context.Context, categories []entities.DocumentCategory) error {
	key := c.keyPrefix + cache.Kb().CategoriesAll()
	return c.client.SetJSON(ctx, key, categories, cache.TTLVeryStable)
}

// InvalidateCategory removes a category from cache.
func (c *KbServiceCache) InvalidateCategory(ctx context.Context, id string) error {
	keys := []string{
		c.keyPrefix + cache.Kb().Category(id),
		c.keyPrefix + cache.Kb().CategoriesAll(),
	}
	return c.client.DeleteMany(ctx, keys)
}

// ============================================================================
// Search Results Cache Operations
// TTL: Short-lived (15 minutes) - Search results are dynamic
// ============================================================================

// GetSearchResult retrieves cached search results.
func (c *KbServiceCache) GetSearchResult(ctx context.Context, queryHash string) ([]*entities.FAQ, error) {
	key := c.keyPrefix + cache.Kb().SearchResult(queryHash)
	var faqs []*entities.FAQ
	if err := c.client.GetJSON(ctx, key, &faqs); err != nil {
		return nil, err
	}
	return faqs, nil
}

// SetSearchResult stores search results in cache.
func (c *KbServiceCache) SetSearchResult(ctx context.Context, queryHash string, faqs []*entities.FAQ) error {
	key := c.keyPrefix + cache.Kb().SearchResult(queryHash)
	return c.client.SetJSON(ctx, key, faqs, cache.TTLShortLived)
}

// GetPopularSearches retrieves popular search queries.
func (c *KbServiceCache) GetPopularSearches(ctx context.Context) ([]string, error) {
	key := c.keyPrefix + cache.Kb().PopularSearches()
	var searches []string
	if err := c.client.GetJSON(ctx, key, &searches); err != nil {
		return nil, err
	}
	return searches, nil
}

// SetPopularSearches stores popular search queries.
func (c *KbServiceCache) SetPopularSearches(ctx context.Context, searches []string) error {
	key := c.keyPrefix + cache.Kb().PopularSearches()
	return c.client.SetJSON(ctx, key, searches, cache.TTLModerate)
}

// ============================================================================
// Document Cache Operations
// TTL: Stable (12 hours) - Documents don't change frequently
// ============================================================================

// documentKey generates a key for a document.
func (c *KbServiceCache) documentKey(id string) string {
	return c.keyPrefix + "document:" + id
}

// documentsByCategoryKey generates a key for documents by category.
func (c *KbServiceCache) documentsByCategoryKey(category string) string {
	return c.keyPrefix + "documents:category:" + category
}

// GetDocument retrieves a document from cache by ID.
func (c *KbServiceCache) GetDocument(ctx context.Context, id string) (*entities.Document, error) {
	key := c.documentKey(id)
	var doc entities.Document
	if err := c.client.GetJSON(ctx, key, &doc); err != nil {
		return nil, err
	}
	return &doc, nil
}

// SetDocument stores a document in cache.
func (c *KbServiceCache) SetDocument(ctx context.Context, doc *entities.Document) error {
	key := c.documentKey(doc.ID.String())
	return c.client.SetJSON(ctx, key, doc, cache.TTLStable)
}

// InvalidateDocument removes a document from cache.
func (c *KbServiceCache) InvalidateDocument(ctx context.Context, id, category string) error {
	keys := []string{
		c.documentKey(id),
	}
	if category != "" {
		keys = append(keys, c.documentsByCategoryKey(category))
	}
	return c.client.DeleteMany(ctx, keys)
}

// GetDocumentsByCategory retrieves documents for a category from cache.
func (c *KbServiceCache) GetDocumentsByCategory(ctx context.Context, category string) ([]*entities.Document, error) {
	key := c.documentsByCategoryKey(category)
	var docs []*entities.Document
	if err := c.client.GetJSON(ctx, key, &docs); err != nil {
		return nil, err
	}
	return docs, nil
}

// SetDocumentsByCategory stores documents for a category in cache.
func (c *KbServiceCache) SetDocumentsByCategory(ctx context.Context, category string, docs []*entities.Document) error {
	key := c.documentsByCategoryKey(category)
	return c.client.SetJSON(ctx, key, docs, cache.TTLStable)
}

// ============================================================================
// Cache Warmup Functions
// ============================================================================

// WarmupFAQs preloads FAQs into cache.
func (c *KbServiceCache) WarmupFAQs(ctx context.Context, faqs []*entities.FAQ) error {
	if len(faqs) == 0 {
		return nil
	}

	// Cache all FAQs list
	if err := c.SetAllFAQs(ctx, faqs); err != nil {
		return fmt.Errorf("failed to warmup all FAQs: %w", err)
	}

	// Cache individual FAQs
	for _, faq := range faqs {
		_ = c.SetFAQ(ctx, faq)
	}

	c.logger.Printf("[CACHE] Warmed up %d FAQs", len(faqs))
	return nil
}

// WarmupCategories preloads categories into cache.
func (c *KbServiceCache) WarmupCategories(ctx context.Context, categories []entities.DocumentCategory) error {
	if len(categories) == 0 {
		return nil
	}
	if err := c.SetAllCategories(ctx, categories); err != nil {
		return fmt.Errorf("failed to warmup categories: %w", err)
	}
	c.logger.Printf("[CACHE] Warmed up %d categories", len(categories))
	return nil
}

// ============================================================================
// Batch Operations
// ============================================================================

// SetMultipleFAQs stores multiple FAQs in cache at once.
func (c *KbServiceCache) SetMultipleFAQs(ctx context.Context, faqs []*entities.FAQ) error {
	items := make(map[string][]byte)
	for _, faq := range faqs {
		key := c.keyPrefix + cache.Kb().FAQ(faq.ID.String())
		data, err := json.Marshal(faq)
		if err != nil {
			c.logger.Printf("[CACHE] Failed to marshal FAQ %s: %v", faq.ID.String(), err)
			continue
		}
		items[key] = data
	}
	if len(items) == 0 {
		return nil
	}
	return c.client.SetMany(ctx, items, cache.TTLStable)
}

// InvalidateMultipleFAQs removes multiple FAQs from cache.
func (c *KbServiceCache) InvalidateMultipleFAQs(ctx context.Context, faqIDs []string) error {
	keys := make([]string, len(faqIDs))
	for i, id := range faqIDs {
		keys[i] = c.keyPrefix + cache.Kb().FAQ(id)
	}
	// Also invalidate list caches
	keys = append(keys, c.keyPrefix+cache.Kb().FAQsAll())
	keys = append(keys, c.keyPrefix+cache.Kb().FAQsActive())
	return c.client.DeleteMany(ctx, keys)
}
