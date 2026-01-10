package usecases

import (
	"context"
	"errors"
	"time"

	"projectevalservice/internal/domain/entities"
	domainErrors "projectevalservice/internal/domain/errors"
	"projectevalservice/internal/domain/repositories"

	"github.com/google/uuid"
)

type StakeholderUseCase struct {
	stakeholderRepo repositories.StakeholderRepository
	projectRepo     repositories.ProjectRepository
}

func NewStakeholderUseCase(stakeholderRepo repositories.StakeholderRepository, projectRepo repositories.ProjectRepository) *StakeholderUseCase {
	return &StakeholderUseCase{
		stakeholderRepo: stakeholderRepo,
		projectRepo:     projectRepo,
	}
}

type CreateStakeholderRequest struct {
	ProjectID    uuid.UUID                `json:"project_id" validate:"required"`
	UserID       uuid.UUID                `json:"user_id" validate:"required"`
	Role         entities.StakeholderRole `json:"role" validate:"required"`
	Type         entities.StakeholderType `json:"type" validate:"required"`
	Organization string                   `json:"organization"`
	Department   string                   `json:"department"`
	Position     string                   `json:"position"`
	Expertise    []string                 `json:"expertise"`
	ContactEmail string                   `json:"contact_email" validate:"email"`
	ContactPhone string                   `json:"contact_phone"`
	AccessLevel  int                      `json:"access_level" validate:"min=1,max=5"`
	CanEvaluate  bool                     `json:"can_evaluate"`
	CanReview    bool                     `json:"can_review"`
	CanApprove   bool                     `json:"can_approve"`
	Notes        string                   `json:"notes"`
}

func (uc *StakeholderUseCase) CreateStakeholder(ctx context.Context, req *CreateStakeholderRequest) (*entities.Stakeholder, error) {
	// Verify project exists
	project, err := uc.projectRepo.GetByID(ctx, req.ProjectID)
	if err != nil {
		return nil, domainErrors.ErrProjectNotFound
	}
	if !project.IsActive() {
		return nil, domainErrors.ErrProjectInactive
	}

	// Check if stakeholder already exists for this project and user
	existing, _ := uc.stakeholderRepo.GetByProjectAndUser(ctx, req.ProjectID, req.UserID)
	if existing != nil {
		return nil, domainErrors.ErrStakeholderAlreadyExists
	}

	// Create stakeholder
	stakeholder := entities.NewStakeholder(req.ProjectID, req.UserID, req.Role, req.Type)
	stakeholder.Organization = req.Organization
	stakeholder.Department = req.Department
	stakeholder.Position = req.Position
	stakeholder.Expertise = req.Expertise
	stakeholder.ContactEmail = req.ContactEmail
	stakeholder.ContactPhone = req.ContactPhone
	if req.AccessLevel > 0 {
		stakeholder.AccessLevel = req.AccessLevel
	}
	stakeholder.CanEvaluate = req.CanEvaluate
	stakeholder.CanReview = req.CanReview
	stakeholder.CanApprove = req.CanApprove
	stakeholder.Notes = req.Notes

	// Validate
	if err := stakeholder.IsValid(); err != nil {
		return nil, err
	}

	// Save
	if err := uc.stakeholderRepo.Create(ctx, stakeholder); err != nil {
		return nil, err
	}

	return stakeholder, nil
}

func (uc *StakeholderUseCase) GetStakeholder(ctx context.Context, id uuid.UUID) (*entities.Stakeholder, error) {
	stakeholder, err := uc.stakeholderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, domainErrors.ErrStakeholderNotFound
	}
	return stakeholder, nil
}

func (uc *StakeholderUseCase) GetProjectStakeholders(ctx context.Context, projectID uuid.UUID) ([]*entities.Stakeholder, error) {
	// Verify project exists
	_, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, domainErrors.ErrProjectNotFound
	}

	return uc.stakeholderRepo.GetByProjectID(ctx, projectID)
}

func (uc *StakeholderUseCase) GetStakeholdersByRole(ctx context.Context, projectID uuid.UUID, role entities.StakeholderRole) ([]*entities.Stakeholder, error) {
	// Verify project exists
	_, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, domainErrors.ErrProjectNotFound
	}

	return uc.stakeholderRepo.GetByRole(ctx, projectID, role)
}

type UpdateStakeholderRequest struct {
	Organization string   `json:"organization"`
	Department   string   `json:"department"`
	Position     string   `json:"position"`
	Expertise    []string `json:"expertise"`
	ContactEmail string   `json:"contact_email" validate:"email"`
	ContactPhone string   `json:"contact_phone"`
	AccessLevel  int      `json:"access_level" validate:"min=1,max=5"`
	CanEvaluate  bool     `json:"can_evaluate"`
	CanReview    bool     `json:"can_review"`
	CanApprove   bool     `json:"can_approve"`
	Notes        string   `json:"notes"`
}

func (uc *StakeholderUseCase) UpdateStakeholder(ctx context.Context, id uuid.UUID, req *UpdateStakeholderRequest) (*entities.Stakeholder, error) {
	stakeholder, err := uc.stakeholderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, domainErrors.ErrStakeholderNotFound
	}

	// Update fields
	stakeholder.Organization = req.Organization
	stakeholder.Department = req.Department
	stakeholder.Position = req.Position
	stakeholder.Expertise = req.Expertise
	stakeholder.ContactEmail = req.ContactEmail
	stakeholder.ContactPhone = req.ContactPhone
	if req.AccessLevel > 0 {
		stakeholder.AccessLevel = req.AccessLevel
	}
	stakeholder.CanEvaluate = req.CanEvaluate
	stakeholder.CanReview = req.CanReview
	stakeholder.CanApprove = req.CanApprove
	stakeholder.Notes = req.Notes
	stakeholder.UpdatedAt = time.Now()

	// Validate
	if err := stakeholder.IsValid(); err != nil {
		return nil, err
	}

	// Save
	if err := uc.stakeholderRepo.Update(ctx, stakeholder); err != nil {
		return nil, err
	}

	return stakeholder, nil
}

func (uc *StakeholderUseCase) ActivateStakeholder(ctx context.Context, id uuid.UUID) error {
	stakeholder, err := uc.stakeholderRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrStakeholderNotFound
	}

	if err := stakeholder.Activate(); err != nil {
		return err
	}

	return uc.stakeholderRepo.Update(ctx, stakeholder)
}

func (uc *StakeholderUseCase) DeactivateStakeholder(ctx context.Context, id uuid.UUID) error {
	stakeholder, err := uc.stakeholderRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrStakeholderNotFound
	}

	stakeholder.Deactivate()
	return uc.stakeholderRepo.Update(ctx, stakeholder)
}

func (uc *StakeholderUseCase) BlockStakeholder(ctx context.Context, id uuid.UUID, reason string) error {
	stakeholder, err := uc.stakeholderRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrStakeholderNotFound
	}

	stakeholder.Block(reason)
	return uc.stakeholderRepo.Update(ctx, stakeholder)
}

func (uc *StakeholderUseCase) UpdateLastActive(ctx context.Context, id uuid.UUID) error {
	stakeholder, err := uc.stakeholderRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrStakeholderNotFound
	}

	stakeholder.UpdateLastActive()
	return uc.stakeholderRepo.Update(ctx, stakeholder)
}

func (uc *StakeholderUseCase) DeleteStakeholder(ctx context.Context, id uuid.UUID) error {
	stakeholder, err := uc.stakeholderRepo.GetByID(ctx, id)
	if err != nil {
		return domainErrors.ErrStakeholderNotFound
	}

	// Business rule: Cannot delete coordinators if they are the only ones
	if stakeholder.IsCoordinator() {
		coordinators, err := uc.stakeholderRepo.GetByRole(ctx, stakeholder.ProjectID, entities.StakeholderRoleCoordinador)
		if err != nil {
			return err
		}
		if len(coordinators) <= 1 {
			return errors.New("cannot delete the last coordinator of the project")
		}
	}

	return uc.stakeholderRepo.Delete(ctx, id)
}

func (uc *StakeholderUseCase) ListStakeholders(ctx context.Context, filters map[string]interface{}) ([]*entities.Stakeholder, error) {
	return uc.stakeholderRepo.List(ctx, filters)
}

func (uc *StakeholderUseCase) CanUserPerformAction(ctx context.Context, userID, projectID uuid.UUID, action string) (bool, error) {
	stakeholder, err := uc.stakeholderRepo.GetByProjectAndUser(ctx, projectID, userID)
	if err != nil {
		return false, domainErrors.ErrStakeholderNotFound
	}

	return stakeholder.CanPerformAction(action), nil
}
