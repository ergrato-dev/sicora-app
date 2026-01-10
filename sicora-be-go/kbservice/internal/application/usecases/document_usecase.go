package usecases

import (
	"context"
	"errors"
	"fmt"
	"time"

	"kbservice/internal/application/dto"
	"kbservice/internal/domain/entities"
	"kbservice/internal/domain/repositories"

	"github.com/google/uuid"
)

var (
	ErrDocumentNotFound = errors.New("document not found")
	ErrDocumentExists   = errors.New("document already exists")
	ErrUnauthorized     = errors.New("unauthorized")
	ErrInvalidStatus    = errors.New("invalid status transition")
	ErrValidationFailed = errors.New("validation failed")
)

// DocumentUseCase defines the business logic for document operations
type DocumentUseCase struct {
	documentRepo  repositories.DocumentRepository
	analyticsRepo repositories.AnalyticsRepository
	aiService     AIService
	searchService SearchService
}

// AIService interface for AI-related operations
type AIService interface {
	GenerateEmbedding(ctx context.Context, text string) ([]float32, error)
	GenerateSummary(ctx context.Context, content string) (string, error)
	SuggestTags(ctx context.Context, content string) ([]string, error)
	EstimateReadingTime(ctx context.Context, content string) (int, error)
}

// SearchService interface for search-related operations
type SearchService interface {
	IndexDocument(ctx context.Context, doc *entities.Document) error
	UpdateIndex(ctx context.Context, docID uuid.UUID) error
	RemoveFromIndex(ctx context.Context, docID uuid.UUID) error
	Search(ctx context.Context, query string, filters map[string]interface{}) ([]entities.Document, error)
}

// NewDocumentUseCase creates a new DocumentUseCase instance
func NewDocumentUseCase(
	documentRepo repositories.DocumentRepository,
	analyticsRepo repositories.AnalyticsRepository,
	aiService AIService,
	searchService SearchService,
) *DocumentUseCase {
	return &DocumentUseCase{
		documentRepo:  documentRepo,
		analyticsRepo: analyticsRepo,
		aiService:     aiService,
		searchService: searchService,
	}
}

// CreateDocument creates a new document
func (uc *DocumentUseCase) CreateDocument(ctx context.Context, req *dto.CreateDocumentRequest) (*dto.DocumentResponse, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrValidationFailed, err)
	}

	// Create document entity
	document := &entities.Document{
		ID:              uuid.New(),
		Title:           req.Title,
		Content:         req.Content,
		Summary:         req.Summary,
		Type:            req.Type,
		Category:        req.Category,
		Audience:        req.Audience,
		Status:          entities.DocumentStatusBorrador,
		Tags:            req.Tags,
		MetaTitle:       req.MetaTitle,
		MetaDescription: req.MetaDescription,
		Keywords:        req.Keywords,
		Difficulty:      req.Difficulty,
		AuthorID:        req.AuthorID,
		ParentID:        req.ParentID,
		Version:         "1.0",
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Generate slug if not provided
	if req.Slug != "" {
		document.Slug = req.Slug
	} else {
		document.Slug = document.GenerateSlug()
	}

	// Generate AI-enhanced content if AI service is available
	if uc.aiService != nil {
		// Generate embedding for semantic search
		if embedding, err := uc.aiService.GenerateEmbedding(ctx, document.Content); err == nil {
			document.Embedding = embedding
		}

		// Generate summary if not provided
		if document.Summary == "" {
			if summary, err := uc.aiService.GenerateSummary(ctx, document.Content); err == nil {
				document.Summary = summary
			}
		}

		// Suggest tags if not provided
		if len(document.Tags) == 0 {
			if tags, err := uc.aiService.SuggestTags(ctx, document.Content); err == nil {
				document.Tags = tags
			}
		}

		// Estimate reading time
		if readingTime, err := uc.aiService.EstimateReadingTime(ctx, document.Content); err == nil {
			document.ReadingTime = readingTime
		}
	}

	// Run before create hooks
	if err := document.BeforeCreate(); err != nil {
		return nil, fmt.Errorf("failed to prepare document: %w", err)
	}

	// Save to repository
	if err := uc.documentRepo.Create(ctx, document); err != nil {
		return nil, fmt.Errorf("failed to create document: %w", err)
	}

	// Index for search
	if uc.searchService != nil {
		if err := uc.searchService.IndexDocument(ctx, document); err != nil {
			// Log error but don't fail the operation
			// TODO: Add proper logging
		}
	}

	return dto.DocumentToResponse(document), nil
}

// GetDocument retrieves a document by ID
func (uc *DocumentUseCase) GetDocument(ctx context.Context, id uuid.UUID, userID *uuid.UUID) (*dto.DocumentResponse, error) {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check if user can view this document
	if !document.IsPublic() {
		// TODO: Implement proper authorization logic
		// For now, allow if document is not deleted
		if document.DeletedAt != nil {
			return nil, ErrUnauthorized
		}
	}

	// Track view analytics
	if userID != nil {
		go func() {
			if err := uc.documentRepo.IncrementViewCount(context.Background(), id, userID); err != nil {
				// Log error
			}
		}()
	}

	return dto.DocumentToResponse(document), nil
}

// GetDocumentBySlug retrieves a document by slug
func (uc *DocumentUseCase) GetDocumentBySlug(ctx context.Context, slug string, userID *uuid.UUID) (*dto.DocumentResponse, error) {
	document, err := uc.documentRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check if user can view this document
	if !document.IsPublic() {
		if document.DeletedAt != nil {
			return nil, ErrUnauthorized
		}
	}

	// Track view analytics
	if userID != nil {
		go func() {
			if err := uc.documentRepo.IncrementViewCount(context.Background(), document.ID, userID); err != nil {
				// Log error
			}
		}()
	}

	return dto.DocumentToResponse(document), nil
}

// UpdateDocument updates an existing document
func (uc *DocumentUseCase) UpdateDocument(ctx context.Context, id uuid.UUID, req *dto.UpdateDocumentRequest) (*dto.DocumentResponse, error) {
	// Get existing document
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check authorization
	if !document.CanBeEditedBy(req.UserID, req.UserRole) {
		return nil, ErrUnauthorized
	}

	// Create version if this is a published document
	if document.Status == entities.DocumentStatusPublicado {
		version := &entities.DocumentVersion{
			ID:           uuid.New(),
			DocumentID:   document.ID,
			Version:      document.Version,
			Title:        document.Title,
			Content:      document.Content,
			Summary:      document.Summary,
			Status:       document.Status,
			VersionNotes: "Auto-backup before update",
			AuthorID:     document.AuthorID,
			CreatedAt:    time.Now(),
		}

		if err := uc.documentRepo.CreateVersion(ctx, version); err != nil {
			return nil, fmt.Errorf("failed to create version backup: %w", err)
		}
	}

	// Update fields
	if req.Title != nil {
		document.Title = *req.Title
	}
	if req.Content != nil {
		document.Content = *req.Content
	}
	if req.Summary != nil {
		document.Summary = *req.Summary
	}
	if req.Tags != nil {
		document.Tags = *req.Tags
	}
	if req.MetaTitle != nil {
		document.MetaTitle = *req.MetaTitle
	}
	if req.MetaDescription != nil {
		document.MetaDescription = *req.MetaDescription
	}
	if req.Keywords != nil {
		document.Keywords = *req.Keywords
	}
	if req.Difficulty != nil {
		document.Difficulty = *req.Difficulty
	}

	// Update AI-enhanced content if content changed
	if req.Content != nil && uc.aiService != nil {
		// Regenerate embedding
		if embedding, err := uc.aiService.GenerateEmbedding(ctx, document.Content); err == nil {
			document.Embedding = embedding
		}

		// Update reading time
		if readingTime, err := uc.aiService.EstimateReadingTime(ctx, document.Content); err == nil {
			document.ReadingTime = readingTime
		}
	}

	document.UpdatedAt = time.Now()

	// Run before update hooks
	if err := document.BeforeUpdate(); err != nil {
		return nil, fmt.Errorf("failed to prepare document update: %w", err)
	}

	// Save changes
	if err := uc.documentRepo.Update(ctx, document); err != nil {
		return nil, fmt.Errorf("failed to update document: %w", err)
	}

	// Update search index
	if uc.searchService != nil {
		go func() {
			if err := uc.searchService.UpdateIndex(context.Background(), document.ID); err != nil {
				// Log error
			}
		}()
	}

	return dto.DocumentToResponse(document), nil
}

// DeleteDocument soft deletes a document
func (uc *DocumentUseCase) DeleteDocument(ctx context.Context, id uuid.UUID, userID uuid.UUID, userRole string) error {
	// Get document
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check authorization
	if !document.CanBeEditedBy(userID, userRole) {
		return ErrUnauthorized
	}

	// Soft delete
	if err := uc.documentRepo.SoftDelete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete document: %w", err)
	}

	// Remove from search index
	if uc.searchService != nil {
		go func() {
			if err := uc.searchService.RemoveFromIndex(context.Background(), id); err != nil {
				// Log error
			}
		}()
	}

	return nil
}

// SearchDocuments performs a search across documents
func (uc *DocumentUseCase) SearchDocuments(ctx context.Context, req *dto.SearchDocumentsRequest) (*dto.SearchDocumentsResponse, error) {
	// Build search criteria
	criteria := repositories.DocumentSearchCriteria{
		Query:      req.Query,
		Categories: req.Categories,
		Types:      req.Types,
		Audiences:  req.Audiences,
		Statuses:   []entities.DocumentStatus{entities.DocumentStatusPublicado}, // Only search published
		Tags:       req.Tags,
		DateFrom:   req.DateFrom,
		DateTo:     req.DateTo,
		MinRating:  req.MinRating,
		SortBy:     req.SortBy,
		SortOrder:  req.SortOrder,
		Limit:      req.Limit,
		Offset:     req.Offset,
	}

	// Perform search
	documents, total, err := uc.documentRepo.Search(ctx, criteria)
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	// Convert to response DTOs
	results := make([]*dto.DocumentResponse, len(documents))
	for i, doc := range documents {
		results[i] = dto.DocumentToResponse(&doc)
	}

	return &dto.SearchDocumentsResponse{
		Results: results,
		Total:   total,
		Query:   req.Query,
		Limit:   req.Limit,
		Offset:  req.Offset,
	}, nil
}

// SemanticSearchDocuments performs semantic search using embeddings
func (uc *DocumentUseCase) SemanticSearchDocuments(ctx context.Context, req *dto.SemanticSearchRequest) (*dto.SearchDocumentsResponse, error) {
	if uc.aiService == nil {
		return nil, errors.New("AI service not available for semantic search")
	}

	// Generate embedding for query
	embedding, err := uc.aiService.GenerateEmbedding(ctx, req.Query)
	if err != nil {
		return nil, fmt.Errorf("failed to generate query embedding: %w", err)
	}

	// Build search request
	searchReq := repositories.SemanticSearchRequest{
		Query:      req.Query,
		Embedding:  embedding,
		Categories: req.Categories,
		Audiences:  req.Audiences,
		Limit:      req.Limit,
		Threshold:  req.Threshold,
	}

	// Perform semantic search
	documents, err := uc.documentRepo.SemanticSearch(ctx, searchReq)
	if err != nil {
		return nil, fmt.Errorf("semantic search failed: %w", err)
	}

	// Convert to response DTOs
	results := make([]*dto.DocumentResponse, len(documents))
	for i, doc := range documents {
		results[i] = dto.DocumentToResponse(&doc)
	}

	return &dto.SearchDocumentsResponse{
		Results: results,
		Total:   len(results),
		Query:   req.Query,
		Limit:   req.Limit,
		Offset:  0,
	}, nil
}

// SubmitForReview submits a document for review
func (uc *DocumentUseCase) SubmitForReview(ctx context.Context, documentID, reviewerID uuid.UUID, userID uuid.UUID, userRole string) error {
	// Get document
	document, err := uc.documentRepo.GetByID(ctx, documentID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check authorization
	if !document.CanBeEditedBy(userID, userRole) {
		return ErrUnauthorized
	}

	// Check status transition
	if document.Status != entities.DocumentStatusBorrador {
		return fmt.Errorf("%w: can only submit draft documents for review", ErrInvalidStatus)
	}

	// Submit for review
	if err := uc.documentRepo.SubmitForReview(ctx, documentID, reviewerID); err != nil {
		return fmt.Errorf("failed to submit for review: %w", err)
	}

	// TODO: Send notification to reviewer

	return nil
}

// ApproveDocument approves a document for publication
func (uc *DocumentUseCase) ApproveDocument(ctx context.Context, documentID, reviewerID uuid.UUID) error {
	// Get document
	document, err := uc.documentRepo.GetByID(ctx, documentID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check status
	if document.Status != entities.DocumentStatusEnRevision {
		return fmt.Errorf("%w: can only approve documents under review", ErrInvalidStatus)
	}

	// Check if user is the assigned reviewer
	if document.ReviewerID == nil || *document.ReviewerID != reviewerID {
		return ErrUnauthorized
	}

	// Approve document
	if err := uc.documentRepo.ApproveDocument(ctx, documentID, reviewerID); err != nil {
		return fmt.Errorf("failed to approve document: %w", err)
	}

	// TODO: Send notification to author

	return nil
}

// PublishDocument publishes an approved document
func (uc *DocumentUseCase) PublishDocument(ctx context.Context, documentID uuid.UUID, userID uuid.UUID, userRole string) error {
	// Get document
	document, err := uc.documentRepo.GetByID(ctx, documentID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check authorization
	if !document.CanBeEditedBy(userID, userRole) {
		return ErrUnauthorized
	}

	// Check status
	if document.Status != entities.DocumentStatusAprobado {
		return fmt.Errorf("%w: can only publish approved documents", ErrInvalidStatus)
	}

	// Publish document
	if err := uc.documentRepo.PublishDocument(ctx, documentID); err != nil {
		return fmt.Errorf("failed to publish document: %w", err)
	}

	// Update search index
	if uc.searchService != nil {
		go func() {
			if err := uc.searchService.UpdateIndex(context.Background(), documentID); err != nil {
				// Log error
			}
		}()
	}

	return nil
}

// GetDocumentAnalytics retrieves analytics for a document
func (uc *DocumentUseCase) GetDocumentAnalytics(ctx context.Context, documentID uuid.UUID, from, to time.Time) (*dto.DocumentAnalyticsResponse, error) {
	stats, err := uc.documentRepo.GetDocumentStats(ctx, documentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get document stats: %w", err)
	}

	analytics, err := uc.documentRepo.GetAnalytics(ctx, documentID, from, to)
	if err != nil {
		return nil, fmt.Errorf("failed to get document analytics: %w", err)
	}

	return &dto.DocumentAnalyticsResponse{
		DocumentID: documentID,
		Stats:      stats,
		Analytics:  analytics,
		Period: dto.TimePeriod{
			From: from,
			To:   to,
		},
	}, nil
}
