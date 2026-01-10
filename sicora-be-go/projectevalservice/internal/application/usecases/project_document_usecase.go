package usecases

import (
	"context"
	"errors"
	"path/filepath"
	"time"

	"projectevalservice/internal/domain/entities"
	domainErrors "projectevalservice/internal/domain/errors"
	"projectevalservice/internal/domain/repositories"

	"github.com/google/uuid"
)

type ProjectDocumentUseCase struct {
	documentRepo    repositories.ProjectDocumentRepository
	projectRepo     repositories.ProjectRepository
	stakeholderRepo repositories.StakeholderRepository
}

func NewProjectDocumentUseCase(
	documentRepo repositories.ProjectDocumentRepository,
	projectRepo repositories.ProjectRepository,
	stakeholderRepo repositories.StakeholderRepository,
) *ProjectDocumentUseCase {
	return &ProjectDocumentUseCase{
		documentRepo:    documentRepo,
		projectRepo:     projectRepo,
		stakeholderRepo: stakeholderRepo,
	}
}

type CreateDocumentRequest struct {
	ProjectID    uuid.UUID                   `json:"project_id" validate:"required"`
	UploadedByID uuid.UUID                   `json:"uploaded_by_id" validate:"required"`
	Title        string                      `json:"title" validate:"required,min=3,max=200"`
	Description  string                      `json:"description"`
	Type         entities.DocumentType       `json:"type" validate:"required"`
	Visibility   entities.DocumentVisibility `json:"visibility"`
	FileName     string                      `json:"file_name" validate:"required"`
	FilePath     string                      `json:"file_path" validate:"required"`
	FileSize     int64                       `json:"file_size" validate:"required,min=1"`
	MimeType     string                      `json:"mime_type"`
	Version      string                      `json:"version"`
	Tags         []string                    `json:"tags"`
	IsRequired   bool                        `json:"is_required"`
	IsTemplate   bool                        `json:"is_template"`
}

func (uc *ProjectDocumentUseCase) CreateDocument(ctx context.Context, req *CreateDocumentRequest) (*entities.ProjectDocument, error) {
	// Verify project exists
	project, err := uc.projectRepo.GetByID(ctx, req.ProjectID)
	if err != nil {
		return nil, domainErrors.ErrProjectNotFound
	}
	if !project.IsActive() {
		return nil, domainErrors.ErrProjectInactive
	}

	// Verify uploader is a stakeholder of the project
	stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, req.ProjectID, req.UploadedByID)
	if err != nil {
		return nil, domainErrors.ErrStakeholderNotFound
	}
	if stakeholder.Status != entities.StakeholderStatusActivo {
		return nil, domainErrors.ErrStakeholderNotAllowed
	}

	// Validate file type
	if err := uc.validateFileType(req.FileName, req.MimeType); err != nil {
		return nil, err
	}

	// Validate file size (max 100MB)
	if req.FileSize > 100*1024*1024 {
		return nil, domainErrors.ErrDocumentTooLarge
	}

	// Create document
	document := entities.NewProjectDocument(
		req.ProjectID,
		req.UploadedByID,
		req.Title,
		req.FileName,
		req.FilePath,
		req.FileSize,
		req.Type,
	)

	document.Description = req.Description
	if req.Visibility != "" {
		document.Visibility = req.Visibility
	}
	document.MimeType = req.MimeType
	if req.Version != "" {
		document.Version = req.Version
	}
	document.Tags = req.Tags
	document.IsRequired = req.IsRequired
	document.IsTemplate = req.IsTemplate

	// Validate
	if err := document.IsValid(); err != nil {
		return nil, err
	}

	// Save
	if err := uc.documentRepo.Create(ctx, document); err != nil {
		return nil, err
	}

	return document, nil
}

func (uc *ProjectDocumentUseCase) GetDocument(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*entities.ProjectDocument, error) {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, domainErrors.ErrDocumentNotFound
	}

	// Check access permissions
	stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, userID)
	if err != nil {
		return nil, domainErrors.ErrUnauthorized
	}

	if !document.CanBeAccessedBy(userID, string(stakeholder.Role)) {
		return nil, domainErrors.ErrUnauthorized
	}

	// Update access tracking
	document.IncrementDownloadCount()
	uc.documentRepo.Update(ctx, document)

	return document, nil
}

func (uc *ProjectDocumentUseCase) GetProjectDocuments(ctx context.Context, projectID uuid.UUID, userID uuid.UUID) ([]*entities.ProjectDocument, error) {
	// Verify project exists
	_, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, domainErrors.ErrProjectNotFound
	}

	// Verify user is stakeholder
	stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, projectID, userID)
	if err != nil {
		return nil, domainErrors.ErrUnauthorized
	}

	documents, err := uc.documentRepo.GetByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}

	// Filter documents based on visibility and user role
	var accessibleDocs []*entities.ProjectDocument
	for _, doc := range documents {
		if doc.CanBeAccessedBy(userID, string(stakeholder.Role)) {
			accessibleDocs = append(accessibleDocs, doc)
		}
	}

	return accessibleDocs, nil
}

func (uc *ProjectDocumentUseCase) GetDocumentsByType(ctx context.Context, projectID uuid.UUID, docType entities.DocumentType, userID uuid.UUID) ([]*entities.ProjectDocument, error) {
	// Verify access
	_, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, projectID, userID)
	if err != nil {
		return nil, domainErrors.ErrUnauthorized
	}

	return uc.documentRepo.GetByType(ctx, projectID, docType)
}

type UpdateDocumentRequest struct {
	Title       string                      `json:"title" validate:"min=3,max=200"`
	Description string                      `json:"description"`
	Visibility  entities.DocumentVisibility `json:"visibility"`
	Tags        []string                    `json:"tags"`
	IsRequired  bool                        `json:"is_required"`
	IsTemplate  bool                        `json:"is_template"`
}

func (uc *ProjectDocumentUseCase) UpdateDocument(ctx context.Context, id uuid.UUID, req *UpdateDocumentRequest, userID uuid.UUID) (*entities.ProjectDocument, error) {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, domainErrors.ErrDocumentNotFound
	}

	// Check if user can modify this document
	if document.UploadedByID != userID {
		stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, userID)
		if err != nil || (!stakeholder.CanReview && !stakeholder.IsCoordinator()) {
			return nil, domainErrors.ErrUnauthorized
		}
	}

	// Check if document can be modified
	if document.Status == entities.DocumentStatusApproved && !document.IsDraft() {
		return nil, domainErrors.ErrDocumentNotModifiable
	}

	// Update fields
	if req.Title != "" {
		document.Title = req.Title
	}
	document.Description = req.Description
	if req.Visibility != "" {
		document.Visibility = req.Visibility
	}
	document.Tags = req.Tags
	document.IsRequired = req.IsRequired
	document.IsTemplate = req.IsTemplate
	document.UpdatedAt = time.Now()

	// Validate
	if err := document.IsValid(); err != nil {
		return nil, err
	}

	// Save
	if err := uc.documentRepo.Update(ctx, document); err != nil {
		return nil, err
	}

	return document, nil
}

func (uc *ProjectDocumentUseCase) SubmitForReview(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrDocumentNotFound
	}

	// Check permissions
	if document.UploadedByID != userID {
		return domainErrors.ErrUnauthorized
	}

	if err := document.SubmitForReview(); err != nil {
		return err
	}

	return uc.documentRepo.Update(ctx, document)
}

func (uc *ProjectDocumentUseCase) ReviewDocument(ctx context.Context, id uuid.UUID, reviewerID uuid.UUID, comments string) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrDocumentNotFound
	}

	// Check if user can review
	stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, reviewerID)
	if err != nil || (!stakeholder.CanReview && !stakeholder.IsCoordinator()) {
		return domainErrors.ErrInsufficientPermissions
	}

	if err := document.Review(reviewerID, comments); err != nil {
		return err
	}

	return uc.documentRepo.Update(ctx, document)
}

func (uc *ProjectDocumentUseCase) ApproveDocument(ctx context.Context, id uuid.UUID, approverID uuid.UUID) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrDocumentNotFound
	}

	// Check if user can approve
	stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, approverID)
	if err != nil || (!stakeholder.CanApprove && !stakeholder.IsCoordinator()) {
		return domainErrors.ErrInsufficientPermissions
	}

	if err := document.Approve(approverID); err != nil {
		return err
	}

	return uc.documentRepo.Update(ctx, document)
}

func (uc *ProjectDocumentUseCase) RejectDocument(ctx context.Context, id uuid.UUID, reviewerID uuid.UUID, reason string) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrDocumentNotFound
	}

	// Check if user can review/reject
	stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, reviewerID)
	if err != nil || (!stakeholder.CanReview && !stakeholder.IsCoordinator()) {
		return domainErrors.ErrInsufficientPermissions
	}

	if err := document.Reject(reviewerID, reason); err != nil {
		return err
	}

	return uc.documentRepo.Update(ctx, document)
}

func (uc *ProjectDocumentUseCase) ArchiveDocument(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrDocumentNotFound
	}

	// Check permissions (only owner or coordinator)
	if document.UploadedByID != userID {
		stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, userID)
		if err != nil || !stakeholder.IsCoordinator() {
			return domainErrors.ErrUnauthorized
		}
	}

	document.Archive()
	return uc.documentRepo.Update(ctx, document)
}

func (uc *ProjectDocumentUseCase) DeleteDocument(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrDocumentNotFound
	}

	// Check permissions (only owner or coordinator)
	if document.UploadedByID != userID {
		stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, userID)
		if err != nil || !stakeholder.IsCoordinator() {
			return domainErrors.ErrUnauthorized
		}
	}

	// Business rule: cannot delete approved required documents
	if document.IsApproved() && document.IsRequired {
		return errors.New("cannot delete approved required documents")
	}

	return uc.documentRepo.Delete(ctx, id)
}

func (uc *ProjectDocumentUseCase) GetRequiredDocuments(ctx context.Context, projectID uuid.UUID) ([]*entities.ProjectDocument, error) {
	// Verify project exists
	_, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, domainErrors.ErrProjectNotFound
	}

	return uc.documentRepo.GetRequiredDocuments(ctx, projectID)
}

func (uc *ProjectDocumentUseCase) AddTag(ctx context.Context, id uuid.UUID, tag string, userID uuid.UUID) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrDocumentNotFound
	}

	// Check permissions
	if document.UploadedByID != userID {
		stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, userID)
		if err != nil || (!stakeholder.CanReview && !stakeholder.IsCoordinator()) {
			return domainErrors.ErrUnauthorized
		}
	}

	document.AddTag(tag)
	return uc.documentRepo.Update(ctx, document)
}

func (uc *ProjectDocumentUseCase) RemoveTag(ctx context.Context, id uuid.UUID, tag string, userID uuid.UUID) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrDocumentNotFound
	}

	// Check permissions
	if document.UploadedByID != userID {
		stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, document.ProjectID, userID)
		if err != nil || (!stakeholder.CanReview && !stakeholder.IsCoordinator()) {
			return domainErrors.ErrUnauthorized
		}
	}

	document.RemoveTag(tag)
	return uc.documentRepo.Update(ctx, document)
}

func (uc *ProjectDocumentUseCase) validateFileType(fileName, mimeType string) error {
	ext := filepath.Ext(fileName)
	allowedExtensions := []string{".pdf", ".docx", ".doc", ".txt", ".md", ".pptx", ".ppt", ".xlsx", ".xls"}

	for _, allowed := range allowedExtensions {
		if ext == allowed {
			return nil
		}
	}

	return domainErrors.ErrInvalidFileType
}

func (uc *ProjectDocumentUseCase) ListDocuments(ctx context.Context, filters map[string]interface{}, userID uuid.UUID) ([]*entities.ProjectDocument, error) {
	// Get documents with filters
	documents, err := uc.documentRepo.List(ctx, filters)
	if err != nil {
		return nil, err
	}

	// Filter based on user permissions
	var accessibleDocs []*entities.ProjectDocument
	for _, doc := range documents {
		// Check if user has access to this project
		stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, doc.ProjectID, userID)
		if err != nil {
			continue // Skip documents from projects user has no access to
		}

		if doc.CanBeAccessedBy(userID, string(stakeholder.Role)) {
			accessibleDocs = append(accessibleDocs, doc)
		}
	}

	return accessibleDocs, nil
}
