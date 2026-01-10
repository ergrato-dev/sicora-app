package entities

import (
	"time"

	"github.com/google/uuid"
)

// FAQStatus represents the status of an FAQ
type FAQStatus string

const (
	FAQStatusBorrador   FAQStatus = "BORRADOR"
	FAQStatusEnRevision FAQStatus = "EN_REVISION"
	FAQStatusPublicado  FAQStatus = "PUBLICADO"
	FAQStatusArchivado  FAQStatus = "ARCHIVADO"
)

// FAQPriority represents the priority/ranking of an FAQ
type FAQPriority string

const (
	FAQPriorityBaja    FAQPriority = "BAJA"
	FAQPriorityMedia   FAQPriority = "MEDIA"
	FAQPriorityAlta    FAQPriority = "ALTA"
	FAQPriorityUrgente FAQPriority = "URGENTE"
)

// FAQ represents a frequently asked question
type FAQ struct {
	ID       uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Question string    `json:"question" gorm:"not null;size:1000"`
	Answer   string    `json:"answer" gorm:"type:text;not null"`

	// Categorization
	Category DocumentCategory `json:"category" gorm:"not null"`
	Audience AudienceType     `json:"audience" gorm:"not null"`
	Tags     []string         `json:"tags" gorm:"type:text[]"`
	Keywords []string         `json:"keywords" gorm:"type:text[]"`

	// Status and workflow
	Status   FAQStatus   `json:"status" gorm:"default:'DRAFT'"`
	Priority FAQPriority `json:"priority" gorm:"default:'MEDIUM'"`

	// Metadata
	AuthorID   uuid.UUID  `json:"authorId" gorm:"type:uuid;not null"`
	ReviewerID *uuid.UUID `json:"reviewerId,omitempty" gorm:"type:uuid"`

	// Analytics and ranking
	ViewCount      int `json:"viewCount" gorm:"default:0"`
	HelpfulCount   int `json:"helpfulCount" gorm:"default:0"`
	UnhelpfulCount int `json:"unhelpfulCount" gorm:"default:0"`
	SearchCount    int `json:"searchCount" gorm:"default:0"` // How often found in search
	ClickCount     int `json:"clickCount" gorm:"default:0"`  // How often clicked

	// Ranking algorithm data
	PopularityScore float64 `json:"popularityScore" gorm:"default:0.0"`
	RelevanceScore  float64 `json:"relevanceScore" gorm:"default:0.0"`
	FreshnessScore  float64 `json:"freshnessScore" gorm:"default:1.0"`
	OverallScore    float64 `json:"overallScore" gorm:"default:0.0;index"`

	// Related content
	RelatedFAQs      []uuid.UUID `json:"relatedFaqs" gorm:"type:uuid[]"`
	RelatedDocuments []uuid.UUID `json:"relatedDocuments" gorm:"type:uuid[]"`

	// Source tracking
	SourceType string     `json:"sourceType"` // MANUAL, AUTO_GENERATED, TICKET_ANALYSIS
	SourceID   *uuid.UUID `json:"sourceId,omitempty" gorm:"type:uuid"`
	SourceData string     `json:"sourceData" gorm:"type:jsonb"`

	// Search and AI
	Embedding    []float32 `json:"-" gorm:"type:vector(1536)"` // For semantic search
	SearchVector string    `json:"-" gorm:"type:tsvector"`     // For full-text search

	// Timestamps
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
	DeletedAt       *time.Time `json:"deletedAt,omitempty" gorm:"index"`
	PublishedAt     *time.Time `json:"publishedAt,omitempty"`
	LastViewedAt    *time.Time `json:"lastViewedAt,omitempty"`
	LastUpdatedByAI *time.Time `json:"lastUpdatedByAI,omitempty"`

	// Relations (loaded separately)
	Author    *User         `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	Reviewer  *User         `json:"reviewer,omitempty" gorm:"foreignKey:ReviewerID"`
	Ratings   []FAQRating   `json:"ratings,omitempty" gorm:"foreignKey:FAQID"`
	Analytics []FAQAnalytic `json:"analytics,omitempty" gorm:"foreignKey:FAQID"`
}

// FAQRating represents user ratings for FAQs
type FAQRating struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	FAQID     uuid.UUID  `json:"faqId" gorm:"type:uuid;not null"`
	UserID    *uuid.UUID `json:"userId,omitempty" gorm:"type:uuid"` // nil for anonymous
	SessionID string     `json:"sessionId" gorm:"not null"`
	IsHelpful bool       `json:"isHelpful" gorm:"not null"`
	Feedback  string     `json:"feedback" gorm:"type:text"`
	CreatedAt time.Time  `json:"createdAt"`

	// Relations
	FAQ  *FAQ  `json:"faq,omitempty" gorm:"foreignKey:FAQID"`
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// FAQAnalytic represents analytics data for FAQs
type FAQAnalytic struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	FAQID       uuid.UUID  `json:"faqId" gorm:"type:uuid;not null"`
	UserID      *uuid.UUID `json:"userId,omitempty" gorm:"type:uuid"`
	SessionID   string     `json:"sessionId" gorm:"not null"`
	Action      string     `json:"action" gorm:"not null"` // VIEW, SEARCH_RESULT, CLICK, HELPFUL, NOT_HELPFUL
	SearchQuery string     `json:"searchQuery"`            // Original search that led to this FAQ
	Position    int        `json:"position"`               // Position in search results
	UserAgent   string     `json:"userAgent"`
	IPAddress   string     `json:"ipAddress"`
	Referrer    string     `json:"referrer"`
	TimeSpent   int        `json:"timeSpent"` // in seconds
	CreatedAt   time.Time  `json:"createdAt"`

	// Relations
	FAQ  *FAQ  `json:"faq,omitempty" gorm:"foreignKey:FAQID"`
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// FAQSuggestion represents AI-generated FAQ suggestions
type FAQSuggestion struct {
	ID       uuid.UUID        `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Question string           `json:"question" gorm:"not null;size:1000"`
	Answer   string           `json:"answer" gorm:"type:text"`
	Category DocumentCategory `json:"category"`
	Audience AudienceType     `json:"audience"`
	Tags     []string         `json:"tags" gorm:"type:text[]"`

	// Source data
	SourceType string  `json:"sourceType"` // TICKET_ANALYSIS, SEARCH_PATTERNS, USER_FEEDBACK
	SourceData string  `json:"sourceData" gorm:"type:jsonb"`
	Confidence float64 `json:"confidence"` // AI confidence score 0-1
	Frequency  int     `json:"frequency"`  // How often this pattern was found

	// Workflow
	Status         string     `json:"status" gorm:"default:'PENDING'"` // PENDING, APPROVED, REJECTED
	ReviewedBy     *uuid.UUID `json:"reviewedBy,omitempty" gorm:"type:uuid"`
	ReviewedAt     *time.Time `json:"reviewedAt,omitempty"`
	ReviewNotes    string     `json:"reviewNotes" gorm:"type:text"`
	ConvertedToFAQ *uuid.UUID `json:"convertedToFaq,omitempty" gorm:"type:uuid"`

	// Timestamps
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty" gorm:"index"`

	// Relations
	Reviewer *User `json:"reviewer,omitempty" gorm:"foreignKey:ReviewedBy"`
	FAQ      *FAQ  `json:"faq,omitempty" gorm:"foreignKey:ConvertedToFAQ"`
}

// TableName specifies the table name for FAQ
func (FAQ) TableName() string {
	return "kb_faqs"
}

// TableName specifies the table name for FAQRating
func (FAQRating) TableName() string {
	return "kb_faq_ratings"
}

// TableName specifies the table name for FAQAnalytic
func (FAQAnalytic) TableName() string {
	return "kb_faq_analytics"
}

// TableName specifies the table name for FAQSuggestion
func (FAQSuggestion) TableName() string {
	return "kb_faq_suggestions"
}

// IsPublished checks if the FAQ is published
func (f *FAQ) IsPublished() bool {
	return f.Status == FAQStatusPublicado
}

// GetHelpfulnessRatio calculates the helpfulness ratio
func (f *FAQ) GetHelpfulnessRatio() float64 {
	total := f.HelpfulCount + f.UnhelpfulCount
	if total == 0 {
		return 0.0
	}
	return float64(f.HelpfulCount) / float64(total)
}

// UpdateScores recalculates all scoring metrics
func (f *FAQ) UpdateScores() {
	// Popularity score based on views and clicks
	if f.ViewCount > 0 {
		f.PopularityScore = float64(f.ClickCount) / float64(f.ViewCount)
	}

	// Relevance score based on helpfulness
	f.RelevanceScore = f.GetHelpfulnessRatio()

	// Freshness score (decays over time)
	daysSinceUpdate := time.Since(f.UpdatedAt).Hours() / 24
	f.FreshnessScore = 1.0 / (1.0 + daysSinceUpdate/30) // 30-day half-life

	// Overall score (weighted combination)
	f.OverallScore = (f.PopularityScore*0.4 + f.RelevanceScore*0.4 + f.FreshnessScore*0.2)
}

// IncrementView increments the view count and updates last viewed time
func (f *FAQ) IncrementView() {
	f.ViewCount++
	now := time.Now()
	f.LastViewedAt = &now
	f.UpdateScores()
}

// IncrementHelpful increments the helpful count
func (f *FAQ) IncrementHelpful() {
	f.HelpfulCount++
	f.UpdateScores()
}

// IncrementUnhelpful increments the unhelpful count
func (f *FAQ) IncrementUnhelpful() {
	f.UnhelpfulCount++
	f.UpdateScores()
}

// CanBeEditedBy checks if a user can edit the FAQ
func (f *FAQ) CanBeEditedBy(userID uuid.UUID, userRole string) bool {
	// Author can edit (unless published and they're not admin)
	if f.AuthorID == userID {
		if f.Status != FAQStatusPublicado || userRole == "ADMIN" || userRole == "KB_ADMIN" {
			return true
		}
	}

	// Admins can edit any FAQ
	if userRole == "ADMIN" || userRole == "KB_ADMIN" {
		return true
	}

	// Reviewers can edit during review
	if f.ReviewerID != nil && *f.ReviewerID == userID && f.Status == FAQStatusEnRevision {
		return true
	}

	return false
}

// BeforeCreate runs before creating an FAQ
func (f *FAQ) BeforeCreate() error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}

	f.UpdateScores()
	return nil
}

// BeforeUpdate runs before updating an FAQ
func (f *FAQ) BeforeUpdate() error {
	f.UpdateScores()
	return nil
}
