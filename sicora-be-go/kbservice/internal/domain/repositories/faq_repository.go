package repositories

import (
	"context"

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

// FAQRepository defines the interface for FAQ data persistence
type FAQRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, faq *entities.FAQ) error
	GetByID(ctx context.Context, id, tenantID string) (*entities.FAQ, error)
	GetAll(ctx context.Context, tenantID string, page, pageSize int) ([]*entities.FAQ, int64, error)
	Update(ctx context.Context, faq *entities.FAQ) error
	Delete(ctx context.Context, id, tenantID string) error

	// Search operations
	SearchByVector(ctx context.Context, tenantID string, embedding []float32, threshold float64, limit int) ([]*entities.FAQ, error)
	SearchByText(ctx context.Context, tenantID string, query string, limit int) ([]*entities.FAQ, error)

	// Category operations
	GetByCategory(ctx context.Context, tenantID, category string, page, pageSize int) ([]*entities.FAQ, int64, error)

	// Analytics operations
	UpdateRating(ctx context.Context, id, tenantID string, rating float64) error
	IncrementViews(ctx context.Context, id, tenantID string) error

	// Popular content
	GetPopular(ctx context.Context, tenantID string, limit int) ([]*entities.FAQ, error)
	GetRecent(ctx context.Context, tenantID string, limit int) ([]*entities.FAQ, error)

	// Stats and analytics
	GetFAQStats(ctx context.Context, faqID interface{}) (*FAQStats, error)
	GetAnalytics(ctx context.Context, faqID interface{}, from, to interface{}) ([]entities.FAQAnalytic, error)
	UpdateSearchIndex(ctx context.Context, faqID interface{}) error
}
