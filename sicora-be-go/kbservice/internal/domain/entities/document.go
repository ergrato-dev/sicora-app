package entities

import (
	"time"

	"github.com/google/uuid"
)

// DocumentStatus represents the status of a document
type DocumentStatus string

const (
	DocumentStatusBorrador   DocumentStatus = "BORRADOR"
	DocumentStatusEnRevision DocumentStatus = "EN_REVISION"
	DocumentStatusAprobado   DocumentStatus = "APROBADO"
	DocumentStatusArchivado  DocumentStatus = "ARCHIVADO"
	DocumentStatusPublicado  DocumentStatus = "PUBLICADO"
)

// DocumentType represents the type of document
type DocumentType string

const (
	DocumentTypeTutorial          DocumentType = "TUTORIAL"
	DocumentTypePreguntaFrecuente DocumentType = "PREGUNTA_FRECUENTE"
	DocumentTypeSolucionProblemas DocumentType = "SOLUCION_PROBLEMAS"
	DocumentTypeDocumentacionAPI  DocumentType = "DOCUMENTACION_API"
	DocumentTypeGuiaUsuario       DocumentType = "GUIA_USUARIO"
	DocumentTypePolitica          DocumentType = "POLITICA"
)

// DocumentCategory represents the category/module of the document
type DocumentCategory string

const (
	CategoryUserService        DocumentCategory = "USER_SERVICE"
	CategoryScheduleService    DocumentCategory = "SCHEDULE_SERVICE"
	CategoryAttendanceService  DocumentCategory = "ATTENDANCE_SERVICE"
	CategoryEvalinService      DocumentCategory = "EVALIN_SERVICE"
	CategoryMEvalService       DocumentCategory = "MEVAL_SERVICE"
	CategoryProjectEvalService DocumentCategory = "PROJECT_EVAL_SERVICE"
	CategoryKbService          DocumentCategory = "KB_SERVICE"
	CategoryGeneral            DocumentCategory = "GENERAL"
)

// AudienceType represents the target audience for the document
type AudienceType string

const (
	AudienceAdministrador AudienceType = "ADMINISTRADOR"
	AudienceInstructor    AudienceType = "INSTRUCTOR"
	AudienceAprendiz      AudienceType = "APRENDIZ"
	AudienceCoordinador   AudienceType = "COORDINADOR"
	AudienceTodos         AudienceType = "TODOS"
)

// Document represents a knowledge base document
type Document struct {
	ID       uuid.UUID        `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Title    string           `json:"title" gorm:"not null;size:500"`
	Content  string           `json:"content" gorm:"type:text"`
	Summary  string           `json:"summary" gorm:"size:1000"`
	Type     DocumentType     `json:"type" gorm:"not null"`
	Category DocumentCategory `json:"category" gorm:"not null"`
	Audience AudienceType     `json:"audience" gorm:"not null"`
	Status   DocumentStatus   `json:"status" gorm:"default:'DRAFT'"`
	Tags     []string         `json:"tags" gorm:"type:text[]"`
	Slug     string           `json:"slug" gorm:"unique;not null"`

	// SEO and metadata
	MetaTitle       string   `json:"metaTitle" gorm:"size:60"`
	MetaDescription string   `json:"metaDescription" gorm:"size:160"`
	Keywords        []string `json:"keywords" gorm:"type:text[]"`

	// Content structure
	TableOfContents string `json:"tableOfContents" gorm:"type:text"`
	ReadingTime     int    `json:"readingTime"` // in minutes
	Difficulty      string `json:"difficulty"`  // BEGINNER, INTERMEDIATE, ADVANCED

	// Relations
	AuthorID   uuid.UUID  `json:"authorId" gorm:"type:uuid;not null"`
	ReviewerID *uuid.UUID `json:"reviewerId,omitempty" gorm:"type:uuid"`
	ParentID   *uuid.UUID `json:"parentId,omitempty" gorm:"type:uuid"` // For hierarchical docs

	// Version control
	Version           string     `json:"version" gorm:"default:'1.0'"`
	VersionNotes      string     `json:"versionNotes" gorm:"type:text"`
	PreviousVersionID *uuid.UUID `json:"previousVersionId,omitempty" gorm:"type:uuid"`

	// Statistics
	ViewCount    int        `json:"viewCount" gorm:"default:0"`
	LikeCount    int        `json:"likeCount" gorm:"default:0"`
	ShareCount   int        `json:"shareCount" gorm:"default:0"`
	LastViewedAt *time.Time `json:"lastViewedAt,omitempty"`

	// Search and AI
	Embedding    []float32 `json:"-" gorm:"type:vector(1536)"` // For semantic search
	SearchVector string    `json:"-" gorm:"type:tsvector"`     // For full-text search

	// Timestamps
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty" gorm:"index"`

	// Approval workflow
	SubmittedForReviewAt *time.Time `json:"submittedForReviewAt,omitempty"`
	ReviewedAt           *time.Time `json:"reviewedAt,omitempty"`
	PublishedAt          *time.Time `json:"publishedAt,omitempty"`

	// Relations (loaded separately)
	Author    *User              `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	Reviewer  *User              `json:"reviewer,omitempty" gorm:"foreignKey:ReviewerID"`
	Parent    *Document          `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children  []Document         `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	Comments  []DocumentComment  `json:"comments,omitempty" gorm:"foreignKey:DocumentID"`
	Versions  []DocumentVersion  `json:"versions,omitempty" gorm:"foreignKey:DocumentID"`
	Analytics []DocumentAnalytic `json:"analytics,omitempty" gorm:"foreignKey:DocumentID"`
}

// User represents a basic user reference (from UserService)
type User struct {
	ID     uuid.UUID `json:"id"`
	Name   string    `json:"name"`
	Email  string    `json:"email"`
	Role   string    `json:"role"`
	Avatar string    `json:"avatar"`
}

// DocumentVersion represents a version of a document
type DocumentVersion struct {
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DocumentID   uuid.UUID      `json:"documentId" gorm:"type:uuid;not null"`
	Version      string         `json:"version" gorm:"not null"`
	Title        string         `json:"title" gorm:"not null;size:500"`
	Content      string         `json:"content" gorm:"type:text"`
	Summary      string         `json:"summary" gorm:"size:1000"`
	Status       DocumentStatus `json:"status"`
	VersionNotes string         `json:"versionNotes" gorm:"type:text"`
	AuthorID     uuid.UUID      `json:"authorId" gorm:"type:uuid;not null"`
	CreatedAt    time.Time      `json:"createdAt"`

	// Relations
	Document *Document `json:"document,omitempty" gorm:"foreignKey:DocumentID"`
	Author   *User     `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
}

// DocumentComment represents a comment on a document
type DocumentComment struct {
	ID         uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DocumentID uuid.UUID  `json:"documentId" gorm:"type:uuid;not null"`
	AuthorID   uuid.UUID  `json:"authorId" gorm:"type:uuid;not null"`
	Content    string     `json:"content" gorm:"type:text;not null"`
	ParentID   *uuid.UUID `json:"parentId,omitempty" gorm:"type:uuid"` // For replies
	IsResolved bool       `json:"isResolved" gorm:"default:false"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
	DeletedAt  *time.Time `json:"deletedAt,omitempty" gorm:"index"`

	// Relations
	Document *Document         `json:"document,omitempty" gorm:"foreignKey:DocumentID"`
	Author   *User             `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	Parent   *DocumentComment  `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Replies  []DocumentComment `json:"replies,omitempty" gorm:"foreignKey:ParentID"`
}

// DocumentAnalytic represents analytics data for a document
type DocumentAnalytic struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DocumentID  uuid.UUID  `json:"documentId" gorm:"type:uuid;not null"`
	UserID      *uuid.UUID `json:"userId,omitempty" gorm:"type:uuid"` // nil for anonymous
	SessionID   string     `json:"sessionId" gorm:"not null"`
	Action      string     `json:"action" gorm:"not null"` // VIEW, LIKE, SHARE, DOWNLOAD
	UserAgent   string     `json:"userAgent"`
	IPAddress   string     `json:"ipAddress"`
	Referrer    string     `json:"referrer"`
	TimeSpent   int        `json:"timeSpent"`   // in seconds
	ScrollDepth float64    `json:"scrollDepth"` // percentage
	ExitPoint   string     `json:"exitPoint"`   // where user left
	CreatedAt   time.Time  `json:"createdAt"`

	// Relations
	Document *Document `json:"document,omitempty" gorm:"foreignKey:DocumentID"`
	User     *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// DocumentRating represents user ratings for documents
type DocumentRating struct {
	ID         uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DocumentID uuid.UUID  `json:"documentId" gorm:"type:uuid;not null"`
	UserID     uuid.UUID  `json:"userId" gorm:"type:uuid;not null"`
	Rating     int        `json:"rating" gorm:"check:rating >= 1 AND rating <= 5"`
	Review     string     `json:"review" gorm:"type:text"`
	IsHelpful  *bool      `json:"isHelpful,omitempty"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
	DeletedAt  *time.Time `json:"deletedAt,omitempty" gorm:"index"`

	// Relations
	Document *Document `json:"document,omitempty" gorm:"foreignKey:DocumentID"`
	User     *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for Document
func (Document) TableName() string {
	return "kb_documents"
}

// TableName specifies the table name for DocumentVersion
func (DocumentVersion) TableName() string {
	return "kb_document_versions"
}

// TableName specifies the table name for DocumentComment
func (DocumentComment) TableName() string {
	return "kb_document_comments"
}

// TableName specifies the table name for DocumentAnalytic
func (DocumentAnalytic) TableName() string {
	return "kb_document_analytics"
}

// TableName specifies the table name for DocumentRating
func (DocumentRating) TableName() string {
	return "kb_document_ratings"
}

// IsPublic checks if the document is publicly accessible
func (d *Document) IsPublic() bool {
	return d.Status == DocumentStatusPublicado
}

// CanBeEditedBy checks if a user can edit the document
func (d *Document) CanBeEditedBy(userID uuid.UUID, userRole string) bool {
	// Author can always edit (unless published)
	if d.AuthorID == userID && d.Status != DocumentStatusPublicado {
		return true
	}

	// Admins can edit any document
	if userRole == "ADMIN" || userRole == "KB_ADMIN" {
		return true
	}

	// Reviewers can edit during review
	if d.ReviewerID != nil && *d.ReviewerID == userID && d.Status == DocumentStatusEnRevision {
		return true
	}

	return false
}

// GetReadingTime calculates estimated reading time
func (d *Document) GetReadingTime() int {
	if d.ReadingTime > 0 {
		return d.ReadingTime
	}

	// Average reading speed: 200 words per minute
	wordCount := len(d.Content) / 5 // rough estimate
	readingTime := wordCount / 200
	if readingTime < 1 {
		readingTime = 1
	}

	return readingTime
}

// GenerateSlug creates a URL-friendly slug from the title
func (d *Document) GenerateSlug() string {
	// This would be implemented with a proper slug generation library
	// For now, return a placeholder
	return "generated-slug"
}

// UpdateSearchVector updates the full-text search vector
func (d *Document) UpdateSearchVector() {
	// This would update the PostgreSQL tsvector for full-text search
	// Implementation would use PostgreSQL functions
}

// BeforeCreate runs before creating a document
func (d *Document) BeforeCreate() error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}

	if d.Slug == "" {
		d.Slug = d.GenerateSlug()
	}

	d.ReadingTime = d.GetReadingTime()
	d.UpdateSearchVector()

	return nil
}

// BeforeUpdate runs before updating a document
func (d *Document) BeforeUpdate() error {
	d.ReadingTime = d.GetReadingTime()
	d.UpdateSearchVector()
	return nil
}
