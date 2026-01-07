package repositories

import (
	"context"
	"fmt"
	"strings"
	"time"

	"kbservice/internal/domain/entities"
	"kbservice/internal/domain/repositories"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// DocumentRepositoryImpl implements the DocumentRepository interface
type DocumentRepositoryImpl struct {
	db *gorm.DB
}

// NewDocumentRepository creates a new document repository
func NewDocumentRepository(db *gorm.DB) repositories.DocumentRepository {
	return &DocumentRepositoryImpl{db: db}
}

// Create creates a new document
func (r *DocumentRepositoryImpl) Create(ctx context.Context, document *entities.Document) error {
	return r.db.WithContext(ctx).Create(document).Error
}

// GetByID retrieves a document by ID
func (r *DocumentRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Document, error) {
	var document entities.Document
	err := r.db.WithContext(ctx).
		Preload("Author").
		Preload("Reviewer").
		Preload("Parent").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&document).Error

	if err != nil {
		return nil, err
	}

	return &document, nil
}

// GetBySlug retrieves a document by slug
func (r *DocumentRepositoryImpl) GetBySlug(ctx context.Context, slug string) (*entities.Document, error) {
	var document entities.Document
	err := r.db.WithContext(ctx).
		Preload("Author").
		Preload("Reviewer").
		Preload("Parent").
		Where("slug = ? AND deleted_at IS NULL", slug).
		First(&document).Error

	if err != nil {
		return nil, err
	}

	return &document, nil
}

// Update updates an existing document
func (r *DocumentRepositoryImpl) Update(ctx context.Context, document *entities.Document) error {
	return r.db.WithContext(ctx).Save(document).Error
}

// Delete permanently deletes a document
func (r *DocumentRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Unscoped().Delete(&entities.Document{}, id).Error
}

// SoftDelete soft deletes a document
func (r *DocumentRepositoryImpl) SoftDelete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.Document{}, id).Error
}

// List retrieves documents based on criteria
func (r *DocumentRepositoryImpl) List(ctx context.Context, criteria repositories.DocumentSearchCriteria) ([]entities.Document, int, error) {
	var documents []entities.Document
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("deleted_at IS NULL")

	// Apply filters
	query = r.applyFilters(query, criteria)

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	query = r.applySorting(query, criteria.SortBy, criteria.SortOrder)

	// Apply pagination
	if criteria.Limit > 0 {
		query = query.Limit(criteria.Limit)
	}
	if criteria.Offset > 0 {
		query = query.Offset(criteria.Offset)
	}

	// Preload relations
	query = query.Preload("Author").Preload("Reviewer")

	err := query.Find(&documents).Error
	return documents, int(total), err
}

// Search performs full-text search on documents
func (r *DocumentRepositoryImpl) Search(ctx context.Context, criteria repositories.DocumentSearchCriteria) ([]entities.Document, int, error) {
	var documents []entities.Document
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("deleted_at IS NULL")

	// Apply text search if query is provided
	if criteria.Query != "" {
		// Use PostgreSQL full-text search
		query = query.Where("search_vector @@ plainto_tsquery('english', ?)", criteria.Query)
	}

	// Apply other filters
	query = r.applyFilters(query, criteria)

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting (default to relevance if searching)
	if criteria.Query != "" && criteria.SortBy == "" {
		// SECURITY FIX: Usar parámetro preparado para prevenir SQL Injection
		query = query.Order(gorm.Expr("ts_rank(search_vector, plainto_tsquery('english', ?)) DESC", criteria.Query))
	} else {
		query = r.applySorting(query, criteria.SortBy, criteria.SortOrder)
	}

	// Apply pagination
	if criteria.Limit > 0 {
		query = query.Limit(criteria.Limit)
	}
	if criteria.Offset > 0 {
		query = query.Offset(criteria.Offset)
	}

	// Preload relations
	query = query.Preload("Author").Preload("Reviewer")

	err := query.Find(&documents).Error
	return documents, int(total), err
}

// SemanticSearch performs semantic search using vector embeddings
func (r *DocumentRepositoryImpl) SemanticSearch(ctx context.Context, request repositories.SemanticSearchRequest) ([]entities.Document, error) {
	var documents []entities.Document

	// Convert embedding to PostgreSQL array format
	embeddingStr := fmt.Sprintf("[%s]", strings.Join(func() []string {
		strs := make([]string, len(request.Embedding))
		for i, v := range request.Embedding {
			strs[i] = fmt.Sprintf("%f", v)
		}
		return strs
	}(), ","))

	query := r.db.WithContext(ctx).
		Where("deleted_at IS NULL AND status = ?", entities.DocumentStatusPublished)

	// Apply filters
	if len(request.Categories) > 0 {
		query = query.Where("category IN ?", request.Categories)
	}
	if len(request.Audiences) > 0 {
		query = query.Where("audience IN ?", request.Audiences)
	}

	// Order by cosine similarity
	query = query.
		Select("*, (1 - (embedding <=> ?::vector)) as similarity", embeddingStr).
		Where("(1 - (embedding <=> ?::vector)) > ?", embeddingStr, request.Threshold).
		Order("similarity DESC")

	if request.Limit > 0 {
		query = query.Limit(request.Limit)
	}

	query = query.Preload("Author")

	err := query.Find(&documents).Error
	return documents, err
}

// GetByCategory retrieves documents by category
func (r *DocumentRepositoryImpl) GetByCategory(ctx context.Context, category entities.DocumentCategory, limit, offset int) ([]entities.Document, error) {
	var documents []entities.Document
	query := r.db.WithContext(ctx).
		Where("category = ? AND deleted_at IS NULL AND status = ?", category, entities.DocumentStatusPublished).
		Preload("Author").
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&documents).Error
	return documents, err
}

// GetByAuthor retrieves documents by author
func (r *DocumentRepositoryImpl) GetByAuthor(ctx context.Context, authorID uuid.UUID, limit, offset int) ([]entities.Document, error) {
	var documents []entities.Document
	query := r.db.WithContext(ctx).
		Where("author_id = ? AND deleted_at IS NULL", authorID).
		Preload("Author").
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&documents).Error
	return documents, err
}

// GetByStatus retrieves documents by status
func (r *DocumentRepositoryImpl) GetByStatus(ctx context.Context, status entities.DocumentStatus, limit, offset int) ([]entities.Document, error) {
	var documents []entities.Document
	query := r.db.WithContext(ctx).
		Where("status = ? AND deleted_at IS NULL", status).
		Preload("Author").
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&documents).Error
	return documents, err
}

// GetByAudience retrieves documents by audience
func (r *DocumentRepositoryImpl) GetByAudience(ctx context.Context, audience entities.AudienceType, limit, offset int) ([]entities.Document, error) {
	var documents []entities.Document
	query := r.db.WithContext(ctx).
		Where("audience = ? AND deleted_at IS NULL AND status = ?", audience, entities.DocumentStatusPublished).
		Preload("Author").
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&documents).Error
	return documents, err
}

// GetChildren retrieves child documents
func (r *DocumentRepositoryImpl) GetChildren(ctx context.Context, parentID uuid.UUID) ([]entities.Document, error) {
	var documents []entities.Document
	err := r.db.WithContext(ctx).
		Where("parent_id = ? AND deleted_at IS NULL", parentID).
		Preload("Author").
		Order("created_at ASC").
		Find(&documents).Error
	return documents, err
}

// GetParent retrieves the parent document
func (r *DocumentRepositoryImpl) GetParent(ctx context.Context, documentID uuid.UUID) (*entities.Document, error) {
	var document entities.Document
	err := r.db.WithContext(ctx).
		Joins("JOIN kb_documents child ON child.parent_id = kb_documents.id").
		Where("child.id = ? AND kb_documents.deleted_at IS NULL", documentID).
		Preload("Author").
		First(&document).Error

	if err != nil {
		return nil, err
	}

	return &document, nil
}

// CreateVersion creates a new document version
func (r *DocumentRepositoryImpl) CreateVersion(ctx context.Context, version *entities.DocumentVersion) error {
	return r.db.WithContext(ctx).Create(version).Error
}

// GetVersions retrieves all versions of a document
func (r *DocumentRepositoryImpl) GetVersions(ctx context.Context, documentID uuid.UUID) ([]entities.DocumentVersion, error) {
	var versions []entities.DocumentVersion
	err := r.db.WithContext(ctx).
		Where("document_id = ?", documentID).
		Preload("Author").
		Order("created_at DESC").
		Find(&versions).Error
	return versions, err
}

// GetVersion retrieves a specific version of a document
func (r *DocumentRepositoryImpl) GetVersion(ctx context.Context, documentID uuid.UUID, version string) (*entities.DocumentVersion, error) {
	var docVersion entities.DocumentVersion
	err := r.db.WithContext(ctx).
		Where("document_id = ? AND version = ?", documentID, version).
		Preload("Author").
		First(&docVersion).Error

	if err != nil {
		return nil, err
	}

	return &docVersion, nil
}

// RestoreVersion restores a document to a specific version
func (r *DocumentRepositoryImpl) RestoreVersion(ctx context.Context, documentID uuid.UUID, version string) error {
	// Get the version
	docVersion, err := r.GetVersion(ctx, documentID, version)
	if err != nil {
		return err
	}

	// Get the current document
	document, err := r.GetByID(ctx, documentID)
	if err != nil {
		return err
	}

	// Create backup of current version
	backup := &entities.DocumentVersion{
		ID:           uuid.New(),
		DocumentID:   documentID,
		Version:      document.Version,
		Title:        document.Title,
		Content:      document.Content,
		Summary:      document.Summary,
		Status:       document.Status,
		VersionNotes: "Auto-backup before restore",
		AuthorID:     document.AuthorID,
		CreatedAt:    time.Now(),
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Create backup
		if err := tx.Create(backup).Error; err != nil {
			return err
		}

		// Update document with version data
		updates := map[string]interface{}{
			"title":         docVersion.Title,
			"content":       docVersion.Content,
			"summary":       docVersion.Summary,
			"version_notes": fmt.Sprintf("Restored from version %s", version),
			"updated_at":    time.Now(),
		}

		return tx.Model(document).Updates(updates).Error
	})
}

// IncrementViewCount increments the view count for a document
func (r *DocumentRepositoryImpl) IncrementViewCount(ctx context.Context, documentID uuid.UUID, userID *uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id = ?", documentID).
		Updates(map[string]interface{}{
			"view_count":     gorm.Expr("view_count + 1"),
			"last_viewed_at": now,
		}).Error
}

// IncrementLikeCount increments the like count for a document
func (r *DocumentRepositoryImpl) IncrementLikeCount(ctx context.Context, documentID uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id = ?", documentID).
		Update("like_count", gorm.Expr("like_count + 1")).Error
}

// IncrementShareCount increments the share count for a document
func (r *DocumentRepositoryImpl) IncrementShareCount(ctx context.Context, documentID uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id = ?", documentID).
		Update("share_count", gorm.Expr("share_count + 1")).Error
}

// GetPopularDocuments retrieves popular documents
func (r *DocumentRepositoryImpl) GetPopularDocuments(ctx context.Context, category *entities.DocumentCategory, limit int) ([]entities.Document, error) {
	var documents []entities.Document
	query := r.db.WithContext(ctx).
		Where("deleted_at IS NULL AND status = ?", entities.DocumentStatusPublished)

	if category != nil {
		query = query.Where("category = ?", *category)
	}

	query = query.
		Preload("Author").
		Order("view_count DESC, like_count DESC").
		Limit(limit)

	err := query.Find(&documents).Error
	return documents, err
}

// GetRecentDocuments retrieves recently created documents
func (r *DocumentRepositoryImpl) GetRecentDocuments(ctx context.Context, category *entities.DocumentCategory, limit int) ([]entities.Document, error) {
	var documents []entities.Document
	query := r.db.WithContext(ctx).
		Where("deleted_at IS NULL AND status = ?", entities.DocumentStatusPublished)

	if category != nil {
		query = query.Where("category = ?", *category)
	}

	query = query.
		Preload("Author").
		Order("published_at DESC, created_at DESC").
		Limit(limit)

	err := query.Find(&documents).Error
	return documents, err
}

// AddRating adds a rating to a document
func (r *DocumentRepositoryImpl) AddRating(ctx context.Context, rating *entities.DocumentRating) error {
	return r.db.WithContext(ctx).Create(rating).Error
}

// UpdateRating updates an existing rating
func (r *DocumentRepositoryImpl) UpdateRating(ctx context.Context, rating *entities.DocumentRating) error {
	return r.db.WithContext(ctx).Save(rating).Error
}

// GetRating retrieves a user's rating for a document
func (r *DocumentRepositoryImpl) GetRating(ctx context.Context, documentID, userID uuid.UUID) (*entities.DocumentRating, error) {
	var rating entities.DocumentRating
	err := r.db.WithContext(ctx).
		Where("document_id = ? AND user_id = ? AND deleted_at IS NULL", documentID, userID).
		First(&rating).Error

	if err != nil {
		return nil, err
	}

	return &rating, nil
}

// GetAverageRating calculates the average rating for a document
func (r *DocumentRepositoryImpl) GetAverageRating(ctx context.Context, documentID uuid.UUID) (float64, int, error) {
	var result struct {
		AvgRating float64
		Count     int64
	}

	err := r.db.WithContext(ctx).
		Model(&entities.DocumentRating{}).
		Select("AVG(rating) as avg_rating, COUNT(*) as count").
		Where("document_id = ? AND deleted_at IS NULL", documentID).
		Scan(&result).Error

	if err != nil {
		return 0, 0, err
	}

	return result.AvgRating, int(result.Count), nil
}

// Helper methods

func (r *DocumentRepositoryImpl) applyFilters(query *gorm.DB, criteria repositories.DocumentSearchCriteria) *gorm.DB {
	if len(criteria.Categories) > 0 {
		query = query.Where("category IN ?", criteria.Categories)
	}
	if len(criteria.Types) > 0 {
		query = query.Where("type IN ?", criteria.Types)
	}
	if len(criteria.Audiences) > 0 {
		query = query.Where("audience IN ?", criteria.Audiences)
	}
	if len(criteria.Statuses) > 0 {
		query = query.Where("status IN ?", criteria.Statuses)
	}
	if len(criteria.Tags) > 0 {
		query = query.Where("tags && ?", criteria.Tags)
	}
	if len(criteria.AuthorIDs) > 0 {
		query = query.Where("author_id IN ?", criteria.AuthorIDs)
	}
	if criteria.DateFrom != nil {
		query = query.Where("created_at >= ?", criteria.DateFrom)
	}
	if criteria.DateTo != nil {
		query = query.Where("created_at <= ?", criteria.DateTo)
	}
	if criteria.MinRating != nil {
		// This would require a subquery to calculate average rating
		// For now, we'll skip this complex filter
	}

	return query
}

func (r *DocumentRepositoryImpl) applySorting(query *gorm.DB, sortBy, sortOrder string) *gorm.DB {
	// SECURITY FIX: Whitelist estricta de campos permitidos para prevenir SQL Injection
	validSortFields := map[string]string{
		"title":      "title",
		"created_at": "created_at",
		"updated_at": "updated_at",
		"view_count": "view_count",
		"like_count": "like_count",
	}

	// Validar campo - usar default si no está en whitelist
	column, ok := validSortFields[sortBy]
	if !ok {
		column = "created_at"
	}

	// Validar dirección - solo ASC o DESC
	descending := true
	if strings.ToLower(sortOrder) == "asc" {
		descending = false
	}

	// SECURITY: Usar GORM clause en lugar de interpolación de strings
	return query.Order(clause.OrderByColumn{
		Column: clause.Column{Name: column},
		Desc:   descending,
	})
}

// Additional methods for workflow operations, analytics, etc.
// These would be implemented similarly following the same patterns...

// SubmitForReview submits a document for review
func (r *DocumentRepositoryImpl) SubmitForReview(ctx context.Context, documentID, reviewerID uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id = ?", documentID).
		Updates(map[string]interface{}{
			"status":                  entities.DocumentStatusReview,
			"reviewer_id":             reviewerID,
			"submitted_for_review_at": now,
			"updated_at":              now,
		}).Error
}

// ApproveDocument approves a document
func (r *DocumentRepositoryImpl) ApproveDocument(ctx context.Context, documentID, reviewerID uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id = ? AND reviewer_id = ?", documentID, reviewerID).
		Updates(map[string]interface{}{
			"status":      entities.DocumentStatusApproved,
			"reviewed_at": now,
			"updated_at":  now,
		}).Error
}

// RejectDocument rejects a document
func (r *DocumentRepositoryImpl) RejectDocument(ctx context.Context, documentID, reviewerID uuid.UUID, reason string) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id = ? AND reviewer_id = ?", documentID, reviewerID).
		Updates(map[string]interface{}{
			"status":        entities.DocumentStatusDraft,
			"version_notes": reason,
			"reviewed_at":   now,
			"updated_at":    now,
		}).Error
}

// PublishDocument publishes a document
func (r *DocumentRepositoryImpl) PublishDocument(ctx context.Context, documentID uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id = ?", documentID).
		Updates(map[string]interface{}{
			"status":       entities.DocumentStatusPublished,
			"published_at": now,
			"updated_at":   now,
		}).Error
}

// ArchiveDocument archives a document
func (r *DocumentRepositoryImpl) ArchiveDocument(ctx context.Context, documentID uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id = ?", documentID).
		Updates(map[string]interface{}{
			"status":     entities.DocumentStatusArchived,
			"updated_at": time.Now(),
		}).Error
}

// BulkUpdateStatus updates status for multiple documents
func (r *DocumentRepositoryImpl) BulkUpdateStatus(ctx context.Context, documentIDs []uuid.UUID, status entities.DocumentStatus) error {
	return r.db.WithContext(ctx).Model(&entities.Document{}).
		Where("id IN ?", documentIDs).
		Updates(map[string]interface{}{
			"status":     status,
			"updated_at": time.Now(),
		}).Error
}

// BulkDelete deletes multiple documents
func (r *DocumentRepositoryImpl) BulkDelete(ctx context.Context, documentIDs []uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.Document{}, documentIDs).Error
}

// BulkArchive archives multiple documents
func (r *DocumentRepositoryImpl) BulkArchive(ctx context.Context, documentIDs []uuid.UUID) error {
	return r.BulkUpdateStatus(ctx, documentIDs, entities.DocumentStatusArchived)
}

// RecordAnalytic records an analytic event
func (r *DocumentRepositoryImpl) RecordAnalytic(ctx context.Context, analytic *entities.DocumentAnalytic) error {
	return r.db.WithContext(ctx).Create(analytic).Error
}

// GetAnalytics retrieves analytics for a document
func (r *DocumentRepositoryImpl) GetAnalytics(ctx context.Context, documentID uuid.UUID, from, to time.Time) ([]entities.DocumentAnalytic, error) {
	var analytics []entities.DocumentAnalytic
	err := r.db.WithContext(ctx).
		Where("document_id = ? AND created_at BETWEEN ? AND ?", documentID, from, to).
		Order("created_at DESC").
		Find(&analytics).Error
	return analytics, err
}

// GetDocumentStats retrieves document statistics
func (r *DocumentRepositoryImpl) GetDocumentStats(ctx context.Context, documentID uuid.UUID) (*repositories.DocumentStats, error) {
	var stats repositories.DocumentStats

	// Get basic stats from document
	var doc entities.Document
	if err := r.db.WithContext(ctx).Where("id = ?", documentID).First(&doc).Error; err != nil {
		return nil, err
	}

	stats.TotalViews = doc.ViewCount
	stats.TotalLikes = doc.LikeCount
	stats.TotalShares = doc.ShareCount

	// Get rating stats
	avgRating, ratingCount, err := r.GetAverageRating(ctx, documentID)
	if err == nil {
		stats.AverageRating = avgRating
		stats.RatingCount = ratingCount
	}

	// Get time-based view counts (simplified - would need more complex queries)
	// For now, returning basic stats
	return &stats, nil
}

// UpdateSearchIndex updates the search index for a document
func (r *DocumentRepositoryImpl) UpdateSearchIndex(ctx context.Context, documentID uuid.UUID) error {
	// The search vector is automatically updated by PostgreSQL triggers
	// This method could be used for additional search index operations
	return nil
}

// RebuildSearchIndex rebuilds the entire search index
func (r *DocumentRepositoryImpl) RebuildSearchIndex(ctx context.Context) error {
	// Update search vectors for all documents
	return r.db.WithContext(ctx).Exec(`
		UPDATE kb_documents 
		SET search_vector = 
			setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
			setweight(to_tsvector('english', COALESCE(summary, '')), 'B') ||
			setweight(to_tsvector('english', COALESCE(content, '')), 'C') ||
			setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'D')
		WHERE deleted_at IS NULL
	`).Error
}

// GetRelatedDocuments finds documents related to a specific document
func (r *DocumentRepositoryImpl) GetRelatedDocuments(ctx context.Context, documentID uuid.UUID, limit int) ([]entities.Document, error) {
	// Get the source document to find related content
	sourceDoc, err := r.GetByID(ctx, documentID)
	if err != nil {
		return nil, err
	}

	var documents []entities.Document

	// Find documents with similar tags or in the same category
	query := r.db.WithContext(ctx).
		Where("id != ? AND deleted_at IS NULL AND status = ?", documentID, entities.DocumentStatusPublished).
		Where("category = ? OR tags && ?", sourceDoc.Category, sourceDoc.Tags).
		Preload("Author").
		Order("view_count DESC").
		Limit(limit)

	err = query.Find(&documents).Error
	return documents, err
}

// GetSimilarDocuments finds documents similar to the given embedding
func (r *DocumentRepositoryImpl) GetSimilarDocuments(ctx context.Context, embedding []float32, excludeID uuid.UUID, limit int) ([]entities.Document, error) {
	// Convert embedding to PostgreSQL array format
	embeddingStr := fmt.Sprintf("[%s]", strings.Join(func() []string {
		strs := make([]string, len(embedding))
		for i, v := range embedding {
			strs[i] = fmt.Sprintf("%f", v)
		}
		return strs
	}(), ","))

	var documents []entities.Document

	query := r.db.WithContext(ctx).
		Where("id != ? AND deleted_at IS NULL AND status = ?", excludeID, entities.DocumentStatusPublished).
		Select("*, (1 - (embedding <=> ?::vector)) as similarity", embeddingStr).
		Where("(1 - (embedding <=> ?::vector)) > 0.7", embeddingStr). // Similarity threshold
		Order("similarity DESC").
		Limit(limit).
		Preload("Author")

	err := query.Find(&documents).Error
	return documents, err
}

// Additional comment-related methods would be implemented here...
func (r *DocumentRepositoryImpl) AddComment(ctx context.Context, comment *entities.DocumentComment) error {
	return r.db.WithContext(ctx).Create(comment).Error
}

func (r *DocumentRepositoryImpl) UpdateComment(ctx context.Context, comment *entities.DocumentComment) error {
	return r.db.WithContext(ctx).Save(comment).Error
}

func (r *DocumentRepositoryImpl) DeleteComment(ctx context.Context, commentID uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.DocumentComment{}, commentID).Error
}

func (r *DocumentRepositoryImpl) GetComments(ctx context.Context, documentID uuid.UUID, limit, offset int) ([]entities.DocumentComment, error) {
	var comments []entities.DocumentComment
	query := r.db.WithContext(ctx).
		Where("document_id = ? AND deleted_at IS NULL", documentID).
		Preload("Author").
		Preload("Replies").
		Order("created_at ASC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&comments).Error
	return comments, err
}
