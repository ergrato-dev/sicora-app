package tests

import (
	"testing"

	"kbservice/internal/domain/entities"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestDocumentEntity(t *testing.T) {
	t.Run("Create new document", func(t *testing.T) {
		doc := &entities.Document{
			ID:        uuid.New(),
			TenantID:  "test-tenant",
			Title:     "Test Document",
			Content:   "This is test content",
			Category:  entities.CategoryGeneral,
			Audience:  entities.AudienceTodos,
			Status:    entities.DocumentStatusBorrador,
			AuthorID:  uuid.New(),
			Slug:      "test-document",
			MetaTitle: "Test Document Meta",
			MetaDesc:  "Test document meta description",
			Tags:      []string{"test", "document"},
			Keywords:  []string{"test", "document", "sample"},
		}

		assert.NotEmpty(t, doc.ID)
		assert.Equal(t, "test-tenant", doc.TenantID)
		assert.Equal(t, "Test Document", doc.Title)
		assert.Equal(t, entities.CategoryGeneral, doc.Category)
		assert.Equal(t, entities.DocumentStatusBorrador, doc.Status)
	})

	t.Run("Document validation", func(t *testing.T) {
		doc := &entities.Document{}

		// Test validation would go here
		// For now, just check that fields can be set
		doc.Title = "Valid Title"
		assert.Equal(t, "Valid Title", doc.Title)
	})
}

func TestFAQEntity(t *testing.T) {
	t.Run("Create new FAQ", func(t *testing.T) {
		faq := &entities.FAQ{
			ID:       uuid.New(),
			TenantID: "test-tenant",
			Question: "What is this?",
			Answer:   "This is a test FAQ",
			Category: entities.CategoryGeneral,
			Audience: entities.AudienceTodos,
			Status:   entities.FAQStatusBorrador,
			Priority: entities.FAQPriorityMedia,
			AuthorID: uuid.New(),
			Tags:     []string{"test", "faq"},
			Keywords: []string{"test", "faq", "sample"},
		}

		assert.NotEmpty(t, faq.ID)
		assert.Equal(t, "test-tenant", faq.TenantID)
		assert.Equal(t, "What is this?", faq.Question)
		assert.Equal(t, entities.FAQStatusBorrador, faq.Status)
		assert.Equal(t, entities.FAQPriorityMedia, faq.Priority)
	})
}

func TestAnalyticsEntity(t *testing.T) {
	t.Run("Create analytics event", func(t *testing.T) {
		event := &entities.AnalyticsEvent{
			ID:           uuid.New(),
			TenantID:     "test-tenant",
			ResourceType: "document",
			ResourceID:   uuid.New().String(),
			Action:       "view",
			UserID:       "test-user",
		}

		assert.NotEmpty(t, event.ID)
		assert.Equal(t, "test-tenant", event.TenantID)
		assert.Equal(t, "document", event.ResourceType)
		assert.Equal(t, "view", event.Action)
	})

	t.Run("Create search analytics", func(t *testing.T) {
		search := &entities.SearchAnalytics{
			ID:           uuid.New(),
			TenantID:     "test-tenant",
			Query:        "test query",
			ResultsFound: 5,
			UserID:       "test-user",
			SearchType:   "text",
		}

		assert.NotEmpty(t, search.ID)
		assert.Equal(t, "test-tenant", search.TenantID)
		assert.Equal(t, "test query", search.Query)
		assert.Equal(t, 5, search.ResultsFound)
		assert.Equal(t, "text", search.SearchType)
	})
}
