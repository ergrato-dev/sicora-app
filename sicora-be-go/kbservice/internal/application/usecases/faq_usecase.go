package usecases

import (
	"context"
	"fmt"
	"time"

	"kbservice/internal/application/dto"
	"kbservice/internal/domain/entities"
	"kbservice/internal/domain/repositories"

	"github.com/google/uuid"
)

// FAQUseCase defines the business logic for FAQ operations
type FAQUseCase struct {
	faqRepo       repositories.FAQRepository
	analyticsRepo repositories.AnalyticsRepository
	aiService     AIService
	searchService SearchService
}

// NewFAQUseCase creates a new FAQUseCase instance
func NewFAQUseCase(
	faqRepo repositories.FAQRepository,
	analyticsRepo repositories.AnalyticsRepository,
	aiService AIService,
	searchService SearchService,
) *FAQUseCase {
	return &FAQUseCase{
		faqRepo:       faqRepo,
		analyticsRepo: analyticsRepo,
		aiService:     aiService,
		searchService: searchService,
	}
}

// CreateFAQ creates a new FAQ
func (uc *FAQUseCase) CreateFAQ(ctx context.Context, req *dto.CreateFAQRequest) (*dto.FAQResponse, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrValidationFailed, err)
	}

	// Create FAQ entity
	faq := &entities.FAQ{
		ID:         uuid.New(),
		Question:   req.Question,
		Answer:     req.Answer,
		Category:   req.Category,
		Audience:   req.Audience,
		Tags:       req.Tags,
		Keywords:   req.Keywords,
		Status:     entities.FAQStatusBorrador,
		Priority:   req.Priority,
		AuthorID:   req.AuthorID,
		SourceType: req.SourceType,
		SourceID:   req.SourceID,
		SourceData: req.SourceData,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Set default priority if not provided
	if faq.Priority == "" {
		faq.Priority = entities.FAQPriorityMedia
	}

	// Generate AI-enhanced content if AI service is available
	if uc.aiService != nil {
		// Generate embedding for semantic search
		questionAndAnswer := faq.Question + " " + faq.Answer
		if embedding, err := uc.aiService.GenerateEmbedding(ctx, questionAndAnswer); err == nil {
			faq.Embedding = embedding
		}

		// Suggest tags if not provided
		if len(faq.Tags) == 0 {
			if tags, err := uc.aiService.SuggestTags(ctx, questionAndAnswer); err == nil {
				faq.Tags = tags
			}
		}

		// Suggest keywords if not provided
		if len(faq.Keywords) == 0 {
			if keywords, err := uc.aiService.SuggestTags(ctx, faq.Question); err == nil {
				faq.Keywords = keywords
			}
		}
	}

	// Run before create hooks
	if err := faq.BeforeCreate(); err != nil {
		return nil, fmt.Errorf("failed to prepare FAQ: %w", err)
	}

	// Save to repository
	if err := uc.faqRepo.Create(ctx, faq); err != nil {
		return nil, fmt.Errorf("failed to create FAQ: %w", err)
	}

	return dto.FAQToResponse(faq), nil
}

// GetFAQ retrieves a FAQ by ID
func (uc *FAQUseCase) GetFAQ(ctx context.Context, id uuid.UUID, userID *uuid.UUID, sessionID string) (*dto.FAQResponse, error) {
	faq, err := uc.faqRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check if user can view this FAQ
	if !faq.IsPublished() {
		// TODO: Implement proper authorization logic
		if faq.DeletedAt != nil {
			return nil, ErrUnauthorized
		}
	}

	// Track view analytics asynchronously
	go func() {
		// Increment view count
		if err := uc.faqRepo.IncrementViewCount(context.Background(), id, userID); err != nil {
			// Log error
		}

		// Record analytic event
		analytic := &entities.FAQAnalytic{
			ID:        uuid.New(),
			FAQID:     id,
			UserID:    userID,
			SessionID: sessionID,
			Action:    "VIEW",
			CreatedAt: time.Now(),
		}
		if err := uc.faqRepo.RecordAnalytic(context.Background(), analytic); err != nil {
			// Log error
		}
	}()

	return dto.FAQToResponse(faq), nil
}

// UpdateFAQ updates an existing FAQ
func (uc *FAQUseCase) UpdateFAQ(ctx context.Context, id uuid.UUID, req *dto.UpdateFAQRequest) (*dto.FAQResponse, error) {
	// Get existing FAQ
	faq, err := uc.faqRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check authorization
	if !faq.CanBeEditedBy(req.UserID, req.UserRole) {
		return nil, ErrUnauthorized
	}

	// Update fields
	updated := false
	if req.Question != nil && *req.Question != faq.Question {
		faq.Question = *req.Question
		updated = true
	}
	if req.Answer != nil && *req.Answer != faq.Answer {
		faq.Answer = *req.Answer
		updated = true
	}
	if req.Tags != nil {
		faq.Tags = *req.Tags
		updated = true
	}
	if req.Keywords != nil {
		faq.Keywords = *req.Keywords
		updated = true
	}
	if req.Priority != nil {
		faq.Priority = *req.Priority
		updated = true
	}

	if !updated {
		return dto.FAQToResponse(faq), nil
	}

	// Update AI-enhanced content if content changed
	if (req.Question != nil || req.Answer != nil) && uc.aiService != nil {
		questionAndAnswer := faq.Question + " " + faq.Answer
		// Regenerate embedding
		if embedding, err := uc.aiService.GenerateEmbedding(ctx, questionAndAnswer); err == nil {
			faq.Embedding = embedding
		}
	}

	faq.UpdatedAt = time.Now()

	// Run before update hooks
	if err := faq.BeforeUpdate(); err != nil {
		return nil, fmt.Errorf("failed to prepare FAQ update: %w", err)
	}

	// Save changes
	if err := uc.faqRepo.Update(ctx, faq); err != nil {
		return nil, fmt.Errorf("failed to update FAQ: %w", err)
	}

	// Update search index
	if uc.searchService != nil {
		go func() {
			if err := uc.faqRepo.UpdateSearchIndex(context.Background(), faq.ID); err != nil {
				// Log error
			}
		}()
	}

	return dto.FAQToResponse(faq), nil
}

// DeleteFAQ soft deletes a FAQ
func (uc *FAQUseCase) DeleteFAQ(ctx context.Context, id uuid.UUID, userID uuid.UUID, userRole string) error {
	// Get FAQ
	faq, err := uc.faqRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check authorization
	if !faq.CanBeEditedBy(userID, userRole) {
		return ErrUnauthorized
	}

	// Soft delete
	if err := uc.faqRepo.SoftDelete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete FAQ: %w", err)
	}

	return nil
}

// SearchFAQs performs a search across FAQs
func (uc *FAQUseCase) SearchFAQs(ctx context.Context, req *dto.SearchFAQsRequest) (*dto.SearchFAQsResponse, error) {
	// Build search criteria
	criteria := repositories.FAQSearchCriteria{
		Query:      req.Query,
		Categories: req.Categories,
		Audiences:  req.Audiences,
		Statuses:   []entities.FAQStatus{entities.FAQStatusPublicado}, // Only search published
		Priorities: req.Priorities,
		Tags:       req.Tags,
		DateFrom:   req.DateFrom,
		DateTo:     req.DateTo,
		MinScore:   req.MinScore,
		SortBy:     req.SortBy,
		SortOrder:  req.SortOrder,
		Limit:      req.Limit,
		Offset:     req.Offset,
	}

	// Perform search
	faqs, total, err := uc.faqRepo.Search(ctx, criteria)
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	// Track search analytics asynchronously
	if req.Query != "" {
		go func() {
			for _, faq := range faqs {
				if err := uc.faqRepo.IncrementSearchCount(context.Background(), faq.ID, req.Query); err != nil {
					// Log error
				}
			}
		}()
	}

	// Convert to response DTOs
	results := make([]*dto.FAQResponse, len(faqs))
	for i, faq := range faqs {
		results[i] = dto.FAQToResponse(&faq)
	}

	return &dto.SearchFAQsResponse{
		Results: results,
		Total:   int(total),
		Query:   req.Query,
		Limit:   req.Limit,
		Offset:  req.Offset,
	}, nil
}

// SemanticSearchFAQs performs semantic search using embeddings
func (uc *FAQUseCase) SemanticSearchFAQs(ctx context.Context, req *dto.SemanticSearchRequest) (*dto.SearchFAQsResponse, error) {
	if uc.aiService == nil {
		return uc.SearchFAQs(ctx, &dto.SearchFAQsRequest{
			Query:      req.Query,
			Categories: req.Categories,
			Audiences:  req.Audiences,
			Limit:      req.Limit,
		})
	}

	// Generate embedding for query
	embedding, err := uc.aiService.GenerateEmbedding(ctx, req.Query)
	if err != nil {
		return nil, fmt.Errorf("failed to generate query embedding: %w", err)
	}

	// Build search request
	searchReq := repositories.FAQSemanticSearchRequest{
		Query:      req.Query,
		Embedding:  embedding,
		Categories: req.Categories,
		Audiences:  req.Audiences,
		Limit:      req.Limit,
		Threshold:  req.Threshold,
	}

	// Perform semantic search
	faqs, err := uc.faqRepo.SemanticSearch(ctx, searchReq)
	if err != nil {
		return nil, fmt.Errorf("semantic search failed: %w", err)
	}

	// Convert to response DTOs
	results := make([]*dto.FAQResponse, len(faqs))
	for i, faq := range faqs {
		results[i] = dto.FAQToResponse(&faq)
	}

	return &dto.SearchFAQsResponse{
		Results: results,
		Total:   len(results),
		Query:   req.Query,
		Limit:   req.Limit,
		Offset:  0,
	}, nil
}

// RateFAQ records a user rating for a FAQ
func (uc *FAQUseCase) RateFAQ(ctx context.Context, req *dto.RateFAQRequest) error {
	// Get FAQ to ensure it exists
	faq, err := uc.faqRepo.GetByID(ctx, req.FAQID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check if user already rated this FAQ
	existingRating, err := uc.faqRepo.GetRating(ctx, req.FAQID, req.SessionID)
	if err == nil && existingRating != nil {
		// Update existing rating
		existingRating.IsHelpful = req.IsHelpful
		existingRating.Feedback = req.Feedback
		if err := uc.faqRepo.UpdateRating(ctx, existingRating); err != nil {
			return fmt.Errorf("failed to update rating: %w", err)
		}
	} else {
		// Create new rating
		rating := &entities.FAQRating{
			ID:        uuid.New(),
			FAQID:     req.FAQID,
			UserID:    req.UserID,
			SessionID: req.SessionID,
			IsHelpful: req.IsHelpful,
			Feedback:  req.Feedback,
			CreatedAt: time.Now(),
		}

		if err := uc.faqRepo.AddRating(ctx, rating); err != nil {
			return fmt.Errorf("failed to add rating: %w", err)
		}
	}

	// Update FAQ scores asynchronously
	go func() {
		if req.IsHelpful {
			faq.IncrementHelpful()
		} else {
			faq.IncrementUnhelpful()
		}

		if err := uc.faqRepo.UpdateScores(context.Background(), req.FAQID); err != nil {
			// Log error
		}

		// Record analytic event
		action := "NOT_HELPFUL"
		if req.IsHelpful {
			action = "HELPFUL"
		}

		analytic := &entities.FAQAnalytic{
			ID:        uuid.New(),
			FAQID:     req.FAQID,
			UserID:    req.UserID,
			SessionID: req.SessionID,
			Action:    action,
			CreatedAt: time.Now(),
		}
		if err := uc.faqRepo.RecordAnalytic(context.Background(), analytic); err != nil {
			// Log error
		}
	}()

	return nil
}

// GetPopularFAQs retrieves the most popular FAQs
func (uc *FAQUseCase) GetPopularFAQs(ctx context.Context, category *entities.DocumentCategory, limit int) ([]*dto.FAQResponse, error) {
	faqs, err := uc.faqRepo.GetPopularFAQs(ctx, category, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get popular FAQs: %w", err)
	}

	results := make([]*dto.FAQResponse, len(faqs))
	for i, faq := range faqs {
		results[i] = dto.FAQToResponse(&faq)
	}

	return results, nil
}

// GetTrendingFAQs retrieves trending FAQs
func (uc *FAQUseCase) GetTrendingFAQs(ctx context.Context, category *entities.DocumentCategory, timeframe string, limit int) ([]*dto.FAQResponse, error) {
	faqs, err := uc.faqRepo.GetTrendingFAQs(ctx, category, timeframe, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get trending FAQs: %w", err)
	}

	results := make([]*dto.FAQResponse, len(faqs))
	for i, faq := range faqs {
		results[i] = dto.FAQToResponse(&faq)
	}

	return results, nil
}

// PublishFAQ publishes a FAQ
func (uc *FAQUseCase) PublishFAQ(ctx context.Context, faqID uuid.UUID, userID uuid.UUID, userRole string) error {
	// Get FAQ
	faq, err := uc.faqRepo.GetByID(ctx, faqID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDocumentNotFound, err)
	}

	// Check authorization
	if !faq.CanBeEditedBy(userID, userRole) {
		return ErrUnauthorized
	}

	// Check status
	if faq.Status == entities.FAQStatusPublicado {
		return fmt.Errorf("%w: FAQ is already published", ErrInvalidStatus)
	}

	// Publish FAQ
	if err := uc.faqRepo.PublishFAQ(ctx, faqID); err != nil {
		return fmt.Errorf("failed to publish FAQ: %w", err)
	}

	// Update search index
	if uc.searchService != nil {
		go func() {
			if err := uc.faqRepo.UpdateSearchIndex(context.Background(), faqID); err != nil {
				// Log error
			}
		}()
	}

	return nil
}

// GetFAQAnalytics retrieves analytics for a FAQ
func (uc *FAQUseCase) GetFAQAnalytics(ctx context.Context, faqID uuid.UUID, from, to time.Time) (*dto.FAQAnalyticsResponse, error) {
	stats, err := uc.faqRepo.GetFAQStats(ctx, faqID)
	if err != nil {
		return nil, fmt.Errorf("failed to get FAQ stats: %w", err)
	}

	analytics, err := uc.faqRepo.GetAnalytics(ctx, faqID, from, to)
	if err != nil {
		return nil, fmt.Errorf("failed to get FAQ analytics: %w", err)
	}

	return &dto.FAQAnalyticsResponse{
		FAQID:     faqID,
		Stats:     stats,
		Analytics: analytics,
		Period: dto.TimePeriod{
			From: from,
			To:   to,
		},
	}, nil
}

// GetRelatedFAQs retrieves FAQs related to a specific FAQ
func (uc *FAQUseCase) GetRelatedFAQs(ctx context.Context, faqID uuid.UUID, limit int) ([]*dto.FAQResponse, error) {
	faqs, err := uc.faqRepo.GetRelatedFAQs(ctx, faqID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get related FAQs: %w", err)
	}

	results := make([]*dto.FAQResponse, len(faqs))
	for i, faq := range faqs {
		results[i] = dto.FAQToResponse(&faq)
	}

	return results, nil
}

// CreateFAQFromSuggestion creates a FAQ from an AI suggestion
func (uc *FAQUseCase) CreateFAQFromSuggestion(ctx context.Context, suggestionID, userID uuid.UUID) (*dto.FAQResponse, error) {
	// Convert suggestion to FAQ
	faq, err := uc.faqRepo.ConvertSuggestionToFAQ(ctx, suggestionID)
	if err != nil {
		return nil, fmt.Errorf("failed to convert suggestion to FAQ: %w", err)
	}

	// Set the current user as author
	faq.AuthorID = userID
	faq.Status = entities.FAQStatusBorrador
	faq.CreatedAt = time.Now()
	faq.UpdatedAt = time.Now()

	// Update the FAQ
	if err := uc.faqRepo.Update(ctx, faq); err != nil {
		return nil, fmt.Errorf("failed to update converted FAQ: %w", err)
	}

	return dto.FAQToResponse(faq), nil
}
