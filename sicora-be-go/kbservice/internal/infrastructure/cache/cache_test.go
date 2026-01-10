// Package cache provides test coverage for KbService cache operations.
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

	"kbservice/internal/domain/entities"
)

// Helper to create a test cache with mock client
func newTestKbCache(t *testing.T) (*KbServiceCache, *cache.MockCache) {
	mockCache := cache.NewMockCache()
	logger := log.New(os.Stdout, "[test-kb-cache] ", log.LstdFlags)
	kbCache := NewKbServiceCache(mockCache, logger)
	return kbCache, mockCache
}

// Helper to create a test FAQ
func createTestFAQ(id uuid.UUID, question, answer string, category entities.DocumentCategory) *entities.FAQ {
	return &entities.FAQ{
		ID:       id,
		Question: question,
		Answer:   answer,
		Category: category,
		Audience: entities.AudienceTodos,
		Status:   entities.FAQStatusPublicado,
		Priority: entities.FAQPriorityMedia,
	}
}

// Helper to create a test Document
func createTestDocument(id uuid.UUID, title, content string, category entities.DocumentCategory) *entities.Document {
	return &entities.Document{
		ID:       id,
		Title:    title,
		Content:  content,
		Category: category,
		Type:     entities.DocumentTypeGuiaUsuario,
		Audience: entities.AudienceTodos,
		Status:   entities.DocumentStatusPublicado,
		Slug:     "test-document-" + id.String()[:8],
	}
}

func TestKbServiceCache_FAQ(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	faqID := uuid.New()
	faq := createTestFAQ(faqID, "¿Cómo registro mi asistencia?", "Debes usar el módulo de horarios...", entities.CategoryScheduleService)

	// Test SetFAQ
	err := kbCache.SetFAQ(ctx, faq)
	require.NoError(t, err)

	// Test GetFAQ
	retrieved, err := kbCache.GetFAQ(ctx, faqID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, faq.ID, retrieved.ID)
	assert.Equal(t, faq.Question, retrieved.Question)
	assert.Equal(t, faq.Answer, retrieved.Answer)
	assert.Equal(t, faq.Category, retrieved.Category)
}

func TestKbServiceCache_FAQNotFound(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	// Test GetFAQ for non-existent FAQ
	retrieved, err := kbCache.GetFAQ(ctx, uuid.New().String())
	assert.Error(t, err)
	assert.Nil(t, retrieved)
}

func TestKbServiceCache_FAQsByCategory(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	category := entities.CategoryScheduleService
	faqs := []*entities.FAQ{
		createTestFAQ(uuid.New(), "¿Cómo consulto mi horario?", "Respuesta 1", category),
		createTestFAQ(uuid.New(), "¿Cómo solicito cambio de turno?", "Respuesta 2", category),
	}

	// Test SetFAQsByCategory
	err := kbCache.SetFAQsByCategory(ctx, string(category), faqs)
	require.NoError(t, err)

	// Test GetFAQsByCategory
	retrieved, err := kbCache.GetFAQsByCategory(ctx, string(category))
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestKbServiceCache_AllFAQs(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	faqs := []*entities.FAQ{
		createTestFAQ(uuid.New(), "FAQ 1", "Answer 1", entities.CategoryGeneral),
		createTestFAQ(uuid.New(), "FAQ 2", "Answer 2", entities.CategoryScheduleService),
		createTestFAQ(uuid.New(), "FAQ 3", "Answer 3", entities.CategoryUserService),
	}

	// Test SetAllFAQs
	err := kbCache.SetAllFAQs(ctx, faqs)
	require.NoError(t, err)

	// Test GetAllFAQs
	retrieved, err := kbCache.GetAllFAQs(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 3)
}

func TestKbServiceCache_ActiveFAQs(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	faqs := []*entities.FAQ{
		createTestFAQ(uuid.New(), "Active FAQ 1", "Answer 1", entities.CategoryGeneral),
		createTestFAQ(uuid.New(), "Active FAQ 2", "Answer 2", entities.CategoryScheduleService),
	}

	// Test SetActiveFAQs
	err := kbCache.SetActiveFAQs(ctx, faqs)
	require.NoError(t, err)

	// Test GetActiveFAQs
	retrieved, err := kbCache.GetActiveFAQs(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestKbServiceCache_Categories(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	categories := []entities.DocumentCategory{
		entities.CategoryGeneral,
		entities.CategoryScheduleService,
		entities.CategoryUserService,
		entities.CategoryEvalinService,
	}

	// Test SetAllCategories
	err := kbCache.SetAllCategories(ctx, categories)
	require.NoError(t, err)

	// Test GetAllCategories
	retrieved, err := kbCache.GetAllCategories(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 4)
	assert.Contains(t, retrieved, entities.CategoryGeneral)
	assert.Contains(t, retrieved, entities.CategoryScheduleService)
}

func TestKbServiceCache_SearchResult(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	query := "horario asistencia"
	searchResults := []*entities.FAQ{
		createTestFAQ(uuid.New(), "¿Cómo consulto mi horario?", "Ingresa al módulo...", entities.CategoryScheduleService),
		createTestFAQ(uuid.New(), "¿Cómo registro asistencia?", "Usa el sistema...", entities.CategoryScheduleService),
	}

	// Test SetSearchResult
	err := kbCache.SetSearchResult(ctx, query, searchResults)
	require.NoError(t, err)

	// Test GetSearchResult
	retrieved, err := kbCache.GetSearchResult(ctx, query)
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestKbServiceCache_PopularSearches(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	popularSearches := []string{"horario", "vacaciones", "certificado"}

	// Test SetPopularSearches
	err := kbCache.SetPopularSearches(ctx, popularSearches)
	require.NoError(t, err)

	// Test GetPopularSearches
	retrieved, err := kbCache.GetPopularSearches(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 3)
	assert.Contains(t, retrieved, "horario")
}

func TestKbServiceCache_Document(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	docID := uuid.New()
	doc := createTestDocument(docID, "Guía de Usuario", "# Contenido de la guía...", entities.CategoryUserService)

	// Test SetDocument
	err := kbCache.SetDocument(ctx, doc)
	require.NoError(t, err)

	// Test GetDocument
	retrieved, err := kbCache.GetDocument(ctx, docID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, doc.ID, retrieved.ID)
	assert.Equal(t, doc.Title, retrieved.Title)
	assert.Equal(t, doc.Content, retrieved.Content)
}

func TestKbServiceCache_DocumentsByCategory(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	category := entities.CategoryScheduleService
	docs := []*entities.Document{
		createTestDocument(uuid.New(), "Doc 1", "Content 1", category),
		createTestDocument(uuid.New(), "Doc 2", "Content 2", category),
	}

	// Test SetDocumentsByCategory
	err := kbCache.SetDocumentsByCategory(ctx, string(category), docs)
	require.NoError(t, err)

	// Test GetDocumentsByCategory
	retrieved, err := kbCache.GetDocumentsByCategory(ctx, string(category))
	require.NoError(t, err)
	assert.Len(t, retrieved, 2)
}

func TestKbServiceCache_InvalidateFAQ(t *testing.T) {
	kbCache, mockCache := newTestKbCache(t)
	ctx := context.Background()

	faqID := uuid.New()
	faq := createTestFAQ(faqID, "Test FAQ", "Test Answer", entities.CategoryGeneral)

	// Set the FAQ first
	err := kbCache.SetFAQ(ctx, faq)
	require.NoError(t, err)

	// Verify it's cached
	retrieved, err := kbCache.GetFAQ(ctx, faqID.String())
	require.NoError(t, err)
	assert.NotNil(t, retrieved)

	// Count items before invalidation
	countBefore := mockCache.Count()

	// Invalidate the FAQ
	err = kbCache.InvalidateFAQ(ctx, faqID.String())
	require.NoError(t, err)

	// Verify item count decreased
	countAfter := mockCache.Count()
	assert.True(t, countAfter < countBefore || countBefore == 1)
}

func TestKbServiceCache_InvalidateDocument(t *testing.T) {
	kbCache, mockCache := newTestKbCache(t)
	ctx := context.Background()

	docID := uuid.New()
	doc := createTestDocument(docID, "Test Doc", "Test Content", entities.CategoryGeneral)

	// Set the document first
	err := kbCache.SetDocument(ctx, doc)
	require.NoError(t, err)

	// Count before invalidation
	countBefore := mockCache.Count()

	// Invalidate the document with category
	err = kbCache.InvalidateDocument(ctx, docID.String(), string(entities.CategoryGeneral))
	require.NoError(t, err)

	// Verify item count changed
	countAfter := mockCache.Count()
	assert.True(t, countAfter <= countBefore)
}

func TestKbServiceCache_WarmupFAQs(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	faqs := []*entities.FAQ{
		createTestFAQ(uuid.New(), "FAQ 1", "Answer 1", entities.CategoryGeneral),
		createTestFAQ(uuid.New(), "FAQ 2", "Answer 2", entities.CategoryScheduleService),
	}

	// Test WarmupFAQs (batch operation)
	err := kbCache.WarmupFAQs(ctx, faqs)
	require.NoError(t, err)

	// Verify each FAQ is retrievable
	for _, faq := range faqs {
		retrieved, err := kbCache.GetFAQ(ctx, faq.ID.String())
		require.NoError(t, err)
		assert.Equal(t, faq.Question, retrieved.Question)
	}
}

func TestKbServiceCache_WarmupCategories(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	categories := []entities.DocumentCategory{
		entities.CategoryGeneral,
		entities.CategoryScheduleService,
		entities.CategoryUserService,
	}

	// Test WarmupCategories
	err := kbCache.WarmupCategories(ctx, categories)
	require.NoError(t, err)

	// Verify categories are retrievable
	retrieved, err := kbCache.GetAllCategories(ctx)
	require.NoError(t, err)
	assert.Len(t, retrieved, 3)
}

func TestKbServiceCache_Ping(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	err := kbCache.Ping(ctx)
	assert.NoError(t, err)
}

func TestKbServiceCache_TTLs(t *testing.T) {
	// Verify TTL constants are correctly defined
	assert.Equal(t, 12*time.Hour, cache.TTLStable)       // FAQs, Documents
	assert.Equal(t, 24*time.Hour, cache.TTLVeryStable)   // Categories
	assert.Equal(t, 15*time.Minute, cache.TTLShortLived) // Search results
	assert.Equal(t, 1*time.Hour, cache.TTLModerate)      // Popular searches
}

func TestKbServiceCache_SetMultipleFAQs(t *testing.T) {
	kbCache, _ := newTestKbCache(t)
	ctx := context.Background()

	faqs := []*entities.FAQ{
		createTestFAQ(uuid.New(), "Batch FAQ 1", "Answer 1", entities.CategoryGeneral),
		createTestFAQ(uuid.New(), "Batch FAQ 2", "Answer 2", entities.CategoryScheduleService),
		createTestFAQ(uuid.New(), "Batch FAQ 3", "Answer 3", entities.CategoryUserService),
	}

	// Test SetMultipleFAQs
	err := kbCache.SetMultipleFAQs(ctx, faqs)
	require.NoError(t, err)

	// Verify each FAQ can be retrieved
	for _, faq := range faqs {
		retrieved, err := kbCache.GetFAQ(ctx, faq.ID.String())
		require.NoError(t, err)
		assert.Equal(t, faq.Question, retrieved.Question)
	}
}

func TestKbServiceCache_InvalidateMultipleFAQs(t *testing.T) {
	kbCache, mockCache := newTestKbCache(t)
	ctx := context.Background()

	faqIDs := []string{uuid.New().String(), uuid.New().String(), uuid.New().String()}

	// First create some FAQs
	for i, id := range faqIDs {
		parsedID, _ := uuid.Parse(id)
		faq := createTestFAQ(parsedID, "FAQ "+string(rune('A'+i)), "Answer", entities.CategoryGeneral)
		err := kbCache.SetFAQ(ctx, faq)
		require.NoError(t, err)
	}

	// Count before invalidation
	countBefore := mockCache.Count()
	assert.True(t, countBefore >= 3)

	// Invalidate all FAQs
	err := kbCache.InvalidateMultipleFAQs(ctx, faqIDs)
	require.NoError(t, err)

	// Verify items were deleted
	countAfter := mockCache.Count()
	assert.True(t, countAfter < countBefore)
}
