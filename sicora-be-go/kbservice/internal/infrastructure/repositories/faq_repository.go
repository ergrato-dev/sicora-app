package repositories

import (
	"context"
	"fmt"
	"kbservice/internal/domain/entities"
	"kbservice/internal/domain/repositories"
	"time"

	"gorm.io/gorm"
)

type faqRepository struct {
	db *gorm.DB
}

// NewFAQRepository creates a new FAQ repository instance
func NewFAQRepository(db *gorm.DB) repositories.FAQRepository {
	return &faqRepository{db: db}
}

func (r *faqRepository) Create(ctx context.Context, faq *entities.FAQ) error {
	return r.db.WithContext(ctx).Create(faq).Error
}

func (r *faqRepository) GetByID(ctx context.Context, id, tenantID string) (*entities.FAQ, error) {
	var faq entities.FAQ
	err := r.db.WithContext(ctx).
		Where("id = ? AND tenant_id = ?", id, tenantID).
		First(&faq).Error
	if err != nil {
		return nil, err
	}
	return &faq, nil
}

func (r *faqRepository) GetAll(ctx context.Context, tenantID string, page, pageSize int) ([]*entities.FAQ, int64, error) {
	var faqs []*entities.FAQ
	var total int64

	// Count total records
	err := r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("tenant_id = ?", tenantID).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * pageSize
	err = r.db.WithContext(ctx).
		Where("tenant_id = ?", tenantID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&faqs).Error

	return faqs, total, err
}

func (r *faqRepository) Update(ctx context.Context, faq *entities.FAQ) error {
	return r.db.WithContext(ctx).Save(faq).Error
}

func (r *faqRepository) Delete(ctx context.Context, id, tenantID string) error {
	return r.db.WithContext(ctx).
		Where("id = ? AND tenant_id = ?", id, tenantID).
		Delete(&entities.FAQ{}).Error
}

func (r *faqRepository) SearchByVector(ctx context.Context, tenantID string, embedding []float32, threshold float64, limit int) ([]*entities.FAQ, error) {
	var faqs []*entities.FAQ

	// Vector similarity search using pgvector
	query := `
		SELECT *, (1 - (question_embedding <=> ?)) as similarity 
		FROM faqs 
		WHERE tenant_id = ? AND (1 - (question_embedding <=> ?)) > ?
		ORDER BY similarity DESC 
		LIMIT ?
	`

	err := r.db.WithContext(ctx).
		Raw(query, embedding, tenantID, embedding, threshold, limit).
		Scan(&faqs).Error

	return faqs, err
}

func (r *faqRepository) SearchByText(ctx context.Context, tenantID string, query string, limit int) ([]*entities.FAQ, error) {
	var faqs []*entities.FAQ

	searchPattern := fmt.Sprintf("%%%s%%", query)
	err := r.db.WithContext(ctx).
		Where("tenant_id = ? AND (question ILIKE ? OR answer ILIKE ?)",
			tenantID, searchPattern, searchPattern).
		Order("created_at DESC").
		Limit(limit).
		Find(&faqs).Error

	return faqs, err
}

func (r *faqRepository) GetByCategory(ctx context.Context, tenantID, category string, page, pageSize int) ([]*entities.FAQ, int64, error) {
	var faqs []*entities.FAQ
	var total int64

	// Count total records
	err := r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("tenant_id = ? AND category = ?", tenantID, category).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * pageSize
	err = r.db.WithContext(ctx).
		Where("tenant_id = ? AND category = ?", tenantID, category).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&faqs).Error

	return faqs, total, err
}

func (r *faqRepository) UpdateRating(ctx context.Context, id, tenantID string, rating float64) error {
	return r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("id = ? AND tenant_id = ?", id, tenantID).
		Updates(map[string]interface{}{
			"rating":     rating,
			"updated_at": time.Now(),
		}).Error
}

func (r *faqRepository) IncrementViews(ctx context.Context, id, tenantID string) error {
	return r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("id = ? AND tenant_id = ?", id, tenantID).
		UpdateColumn("view_count", gorm.Expr("view_count + ?", 1)).Error
}

func (r *faqRepository) GetPopular(ctx context.Context, tenantID string, limit int) ([]*entities.FAQ, error) {
	var faqs []*entities.FAQ

	err := r.db.WithContext(ctx).
		Where("tenant_id = ?", tenantID).
		Order("view_count DESC, rating DESC").
		Limit(limit).
		Find(&faqs).Error

	return faqs, err
}

func (r *faqRepository) GetRecent(ctx context.Context, tenantID string, limit int) ([]*entities.FAQ, error) {
	var faqs []*entities.FAQ

	err := r.db.WithContext(ctx).
		Where("tenant_id = ?", tenantID).
		Order("created_at DESC").
		Limit(limit).
		Find(&faqs).Error

	return faqs, err
}

// GetFAQStats returns statistics for a FAQ item
func (r *faqRepository) GetFAQStats(ctx context.Context, faqID interface{}) (*repositories.FAQStats, error) {
	var faq entities.FAQ
	err := r.db.WithContext(ctx).
		Where("id = ?", faqID).
		First(&faq).Error
	if err != nil {
		return nil, err
	}

	// Calculate stats from the FAQ entity
	totalRatings := int64(faq.HelpfulCount + faq.UnhelpfulCount)
	var avgRating float64
	if totalRatings > 0 {
		avgRating = float64(faq.HelpfulCount) / float64(totalRatings) * 5.0 // Convert to 5-star scale
	}

	return &repositories.FAQStats{
		TotalViews:      int64(faq.ViewCount),
		UniqueViews:     int64(faq.ViewCount), // Simplified - no unique tracking
		HelpfulCount:    int64(faq.HelpfulCount),
		NotHelpfulCount: int64(faq.UnhelpfulCount),
		AverageRating:   avgRating,
		TotalRatings:    totalRatings,
	}, nil
}

// GetAnalytics returns analytics data for a FAQ item
func (r *faqRepository) GetAnalytics(ctx context.Context, faqID interface{}, from, to interface{}) ([]entities.FAQAnalytic, error) {
	// TODO: Implement proper analytics tracking
	// For now, return empty slice as placeholder
	return []entities.FAQAnalytic{}, nil
}

// UpdateSearchIndex updates the search index for a FAQ item
func (r *faqRepository) UpdateSearchIndex(ctx context.Context, faqID interface{}) error {
	// TODO: Implement search index update logic
	// This could involve regenerating embeddings or updating full-text search indexes
	return nil
}
