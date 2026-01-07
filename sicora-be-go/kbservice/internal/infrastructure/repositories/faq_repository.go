package repositories

import (
	"context"
	"fmt"
	"kbservice/internal/domain/entities"
	"kbservice/internal/domain/repositories"
	"time"

	"github.com/google/uuid"
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

// GetByID retrieves an FAQ by ID (without tenant restriction)
func (r *faqRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.FAQ, error) {
	var faq entities.FAQ
	err := r.db.WithContext(ctx).
		Where("id = ?", id).
		First(&faq).Error
	if err != nil {
		return nil, err
	}
	return &faq, nil
}

// GetByIDWithTenant retrieves an FAQ by ID with tenant restriction
func (r *faqRepository) GetByIDWithTenant(ctx context.Context, id, tenantID string) (*entities.FAQ, error) {
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
		Order("view_count DESC, overall_score DESC").
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

// SoftDelete soft deletes an FAQ by ID
func (r *faqRepository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("id = ?", id).
		Update("deleted_at", &now).Error
}

// Search searches FAQs based on criteria
func (r *faqRepository) Search(ctx context.Context, criteria repositories.FAQSearchCriteria) ([]entities.FAQ, int64, error) {
	var faqs []entities.FAQ
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.FAQ{})

	// Apply filters
	if criteria.Query != "" {
		searchPattern := fmt.Sprintf("%%%s%%", criteria.Query)
		query = query.Where("question ILIKE ? OR answer ILIKE ?", searchPattern, searchPattern)
	}

	if len(criteria.Categories) > 0 {
		query = query.Where("category IN ?", criteria.Categories)
	}

	if len(criteria.Statuses) > 0 {
		query = query.Where("status IN ?", criteria.Statuses)
	}

	if len(criteria.Tags) > 0 {
		query = query.Where("tags && ?", criteria.Tags)
	}

	if criteria.DateFrom != nil {
		query = query.Where("created_at >= ?", criteria.DateFrom)
	}

	if criteria.DateTo != nil {
		query = query.Where("created_at <= ?", criteria.DateTo)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	if criteria.SortBy != "" {
		order := criteria.SortBy
		if criteria.SortOrder == "desc" {
			order += " DESC"
		}
		query = query.Order(order)
	} else {
		query = query.Order("created_at DESC")
	}

	// Apply pagination
	if criteria.Limit > 0 {
		query = query.Limit(criteria.Limit)
	}
	if criteria.Offset > 0 {
		query = query.Offset(criteria.Offset)
	}

	err := query.Find(&faqs).Error
	return faqs, total, err
}

// SemanticSearch performs semantic search using embeddings
func (r *faqRepository) SemanticSearch(ctx context.Context, req repositories.FAQSemanticSearchRequest) ([]entities.FAQ, error) {
	var faqs []entities.FAQ

	// Vector similarity search using pgvector
	query := `
		SELECT *, (1 - (embedding <=> ?)) as similarity 
		FROM kb_faqs 
		WHERE deleted_at IS NULL AND status = 'PUBLISHED'
		AND (1 - (embedding <=> ?)) > ?
	`
	args := []interface{}{req.Embedding, req.Embedding, req.Threshold}

	if len(req.Categories) > 0 {
		query += " AND category IN ?"
		args = append(args, req.Categories)
	}

	if len(req.Audiences) > 0 {
		query += " AND audience IN ?"
		args = append(args, req.Audiences)
	}

	query += " ORDER BY similarity DESC"

	if req.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, req.Limit)
	}

	err := r.db.WithContext(ctx).Raw(query, args...).Scan(&faqs).Error
	return faqs, err
}

// IncrementViewCount increments the view count for an FAQ
func (r *faqRepository) IncrementViewCount(ctx context.Context, id uuid.UUID, userID *uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"view_count":     gorm.Expr("view_count + 1"),
			"last_viewed_at": &now,
		}).Error
}

// IncrementSearchCount increments the search count for an FAQ
func (r *faqRepository) IncrementSearchCount(ctx context.Context, id uuid.UUID, query string) error {
	return r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("id = ?", id).
		UpdateColumn("search_count", gorm.Expr("search_count + 1")).Error
}

// RecordAnalytic records an analytics event for an FAQ
func (r *faqRepository) RecordAnalytic(ctx context.Context, analytic *entities.FAQAnalytic) error {
	return r.db.WithContext(ctx).Create(analytic).Error
}

// UpdateRating updates an existing FAQ rating
func (r *faqRepository) UpdateRating(ctx context.Context, rating *entities.FAQRating) error {
	return r.db.WithContext(ctx).Save(rating).Error
}

// AddRating adds a new rating for an FAQ
func (r *faqRepository) AddRating(ctx context.Context, rating *entities.FAQRating) error {
	return r.db.WithContext(ctx).Create(rating).Error
}

// GetRating retrieves a rating by FAQ ID and session ID
func (r *faqRepository) GetRating(ctx context.Context, faqID uuid.UUID, sessionID string) (*entities.FAQRating, error) {
	var rating entities.FAQRating
	err := r.db.WithContext(ctx).
		Where("faq_id = ? AND session_id = ?", faqID, sessionID).
		First(&rating).Error
	if err != nil {
		return nil, err
	}
	return &rating, nil
}

// UpdateScores updates the scores for an FAQ
func (r *faqRepository) UpdateScores(ctx context.Context, faqID uuid.UUID) error {
	var faq entities.FAQ
	if err := r.db.WithContext(ctx).Where("id = ?", faqID).First(&faq).Error; err != nil {
		return err
	}

	faq.UpdateScores()

	return r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("id = ?", faqID).
		Updates(map[string]interface{}{
			"popularity_score": faq.PopularityScore,
			"relevance_score":  faq.RelevanceScore,
			"freshness_score":  faq.FreshnessScore,
			"overall_score":    faq.OverallScore,
		}).Error
}

// GetPopularFAQs retrieves popular FAQs by category
func (r *faqRepository) GetPopularFAQs(ctx context.Context, category *entities.DocumentCategory, limit int) ([]entities.FAQ, error) {
	var faqs []entities.FAQ
	query := r.db.WithContext(ctx).
		Where("status = ? AND deleted_at IS NULL", entities.FAQStatusPublished)

	if category != nil {
		query = query.Where("category = ?", *category)
	}

	err := query.Order("overall_score DESC, view_count DESC").
		Limit(limit).
		Find(&faqs).Error

	return faqs, err
}

// GetTrendingFAQs retrieves trending FAQs
func (r *faqRepository) GetTrendingFAQs(ctx context.Context, category *entities.DocumentCategory, timeframe string, limit int) ([]entities.FAQ, error) {
	var faqs []entities.FAQ

	// Calculate time boundary based on timeframe
	var since time.Time
	switch timeframe {
	case "day":
		since = time.Now().AddDate(0, 0, -1)
	case "week":
		since = time.Now().AddDate(0, 0, -7)
	case "month":
		since = time.Now().AddDate(0, -1, 0)
	default:
		since = time.Now().AddDate(0, 0, -7) // default to week
	}

	query := r.db.WithContext(ctx).
		Where("status = ? AND deleted_at IS NULL AND last_viewed_at >= ?",
			entities.FAQStatusPublished, since)

	if category != nil {
		query = query.Where("category = ?", *category)
	}

	err := query.Order("view_count DESC").
		Limit(limit).
		Find(&faqs).Error

	return faqs, err
}

// GetRelatedFAQs retrieves FAQs related to a specific FAQ
func (r *faqRepository) GetRelatedFAQs(ctx context.Context, faqID uuid.UUID, limit int) ([]entities.FAQ, error) {
	// First get the source FAQ to access its related FAQs and category
	var sourceFAQ entities.FAQ
	if err := r.db.WithContext(ctx).Where("id = ?", faqID).First(&sourceFAQ).Error; err != nil {
		return nil, err
	}

	var faqs []entities.FAQ

	// If the FAQ has explicit related FAQs, use those
	if len(sourceFAQ.RelatedFAQs) > 0 {
		err := r.db.WithContext(ctx).
			Where("id IN ? AND status = ? AND deleted_at IS NULL",
				sourceFAQ.RelatedFAQs, entities.FAQStatusPublished).
			Limit(limit).
			Find(&faqs).Error
		return faqs, err
	}

	// Otherwise, find FAQs in the same category
	err := r.db.WithContext(ctx).
		Where("id != ? AND category = ? AND status = ? AND deleted_at IS NULL",
			faqID, sourceFAQ.Category, entities.FAQStatusPublished).
		Order("overall_score DESC").
		Limit(limit).
		Find(&faqs).Error

	return faqs, err
}

// PublishFAQ publishes an FAQ
func (r *faqRepository) PublishFAQ(ctx context.Context, faqID uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&entities.FAQ{}).
		Where("id = ?", faqID).
		Updates(map[string]interface{}{
			"status":       entities.FAQStatusPublished,
			"published_at": &now,
			"updated_at":   now,
		}).Error
}

// ConvertSuggestionToFAQ converts an FAQ suggestion to a real FAQ
func (r *faqRepository) ConvertSuggestionToFAQ(ctx context.Context, suggestionID uuid.UUID) (*entities.FAQ, error) {
	var suggestion entities.FAQSuggestion
	if err := r.db.WithContext(ctx).Where("id = ?", suggestionID).First(&suggestion).Error; err != nil {
		return nil, err
	}

	faq := &entities.FAQ{
		ID:        uuid.New(),
		Question:  suggestion.Question,
		Answer:    suggestion.Answer,
		Category:  suggestion.Category,
		Audience:  suggestion.Audience,
		Tags:      suggestion.Tags,
		Status:    entities.FAQStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := r.db.WithContext(ctx).Create(faq).Error; err != nil {
		return nil, err
	}

	// Mark suggestion as converted
	now := time.Now()
	r.db.WithContext(ctx).
		Model(&entities.FAQSuggestion{}).
		Where("id = ?", suggestionID).
		Updates(map[string]interface{}{
			"status":          "APPROVED",
			"converted_to_faq": faq.ID,
			"updated_at":      now,
		})

	return faq, nil
}
