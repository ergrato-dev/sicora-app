package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"

	"kbservice/internal/domain/entities"
)

// FAQStats represents statistics for a FAQ item
type FAQStats struct {
	TotalViews      int64   `json:"total_views"`
	UniqueViews     int64   `json:"unique_views"`
	HelpfulCount    int64   `json:"helpful_count"`
	NotHelpfulCount int64   `json:"not_helpful_count"`
	AverageRating   float64 `json:"average_rating"`
	TotalRatings    int64   `json:"total_ratings"`
}

// FAQSearchCriteria represents criteria for searching FAQs
type FAQSearchCriteria struct {
	Query      string
	Categories []entities.DocumentCategory
	Audiences  []entities.AudienceType
	Statuses   []entities.FAQStatus
	Priorities []entities.FAQPriority
	Tags       []string
	DateFrom   *time.Time
	DateTo     *time.Time
	MinScore   *float64
	SortBy     string
	SortOrder  string
	Limit      int
	Offset     int
}

// FAQSemanticSearchRequest represents a semantic search request
type FAQSemanticSearchRequest struct {
	Query      string
	Embedding  []float32
	Categories []entities.DocumentCategory
	Audiences  []entities.AudienceType
	Limit      int
	Threshold  float64
}

// FAQRepository defines the interface for FAQ data persistence
type FAQRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, faq *entities.FAQ) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.FAQ, error)
	GetAll(ctx context.Context, tenantID string, page, pageSize int) ([]*entities.FAQ, int64, error)
	Update(ctx context.Context, faq *entities.FAQ) error
	Delete(ctx context.Context, id, tenantID string) error
	SoftDelete(ctx context.Context, id uuid.UUID) error

	// Multi-tenant operations
	GetByIDWithTenant(ctx context.Context, id, tenantID string) (*entities.FAQ, error)

	// Search operations
	Search(ctx context.Context, criteria FAQSearchCriteria) ([]entities.FAQ, int64, error)
	SearchByVector(ctx context.Context, tenantID string, embedding []float32, threshold float64, limit int) ([]*entities.FAQ, error)
	SearchByText(ctx context.Context, tenantID string, query string, limit int) ([]*entities.FAQ, error)
	SemanticSearch(ctx context.Context, req FAQSemanticSearchRequest) ([]entities.FAQ, error)

	// Category operations
	GetByCategory(ctx context.Context, tenantID, category string, page, pageSize int) ([]*entities.FAQ, int64, error)

	// Analytics operations
	IncrementViewCount(ctx context.Context, id uuid.UUID, userID *uuid.UUID) error
	IncrementSearchCount(ctx context.Context, id uuid.UUID, query string) error
	RecordAnalytic(ctx context.Context, analytic *entities.FAQAnalytic) error
	UpdateRating(ctx context.Context, rating *entities.FAQRating) error
	AddRating(ctx context.Context, rating *entities.FAQRating) error
	GetRating(ctx context.Context, faqID uuid.UUID, sessionID string) (*entities.FAQRating, error)
	UpdateScores(ctx context.Context, faqID uuid.UUID) error
	IncrementViews(ctx context.Context, id, tenantID string) error

	// Popular content
	GetPopular(ctx context.Context, tenantID string, limit int) ([]*entities.FAQ, error)
	GetRecent(ctx context.Context, tenantID string, limit int) ([]*entities.FAQ, error)
	GetPopularFAQs(ctx context.Context, category *entities.DocumentCategory, limit int) ([]entities.FAQ, error)
	GetTrendingFAQs(ctx context.Context, category *entities.DocumentCategory, timeframe string, limit int) ([]entities.FAQ, error)
	GetRelatedFAQs(ctx context.Context, faqID uuid.UUID, limit int) ([]entities.FAQ, error)

	// Publishing
	PublishFAQ(ctx context.Context, faqID uuid.UUID) error

	// Suggestions
	ConvertSuggestionToFAQ(ctx context.Context, suggestionID uuid.UUID) (*entities.FAQ, error)

	// Stats and analytics
	GetFAQStats(ctx context.Context, faqID interface{}) (*FAQStats, error)
	GetAnalytics(ctx context.Context, faqID interface{}, from, to interface{}) ([]entities.FAQAnalytic, error)
	UpdateSearchIndex(ctx context.Context, faqID interface{}) error
}
