package usecases

import (
	"context"
	"time"

	"projectevalservice/internal/domain/entities"
	"projectevalservice/internal/domain/errors"
	"projectevalservice/internal/domain/repositories"

	"github.com/google/uuid"
)

type ProjectUseCase struct {
	projectRepo repositories.ProjectRepository
}

func NewProjectUseCase(projectRepo repositories.ProjectRepository) *ProjectUseCase {
	return &ProjectUseCase{
		projectRepo: projectRepo,
	}
}

func (uc *ProjectUseCase) CreateProject(ctx context.Context, project *entities.Project) error {
	if project.Name == "" {
		return errors.ErrInvalidProjectData
	}

	if project.DeliveryDate.Before(time.Now()) {
		return errors.ErrInvalidProjectData
	}

	if !project.Status.IsValid() {
		project.Status = entities.ProjectStatusActivo
	}

	return uc.projectRepo.Create(ctx, project)
}

func (uc *ProjectUseCase) GetProjectByID(ctx context.Context, id uuid.UUID) (*entities.Project, error) {
	return uc.projectRepo.GetByID(ctx, id)
}

func (uc *ProjectUseCase) GetProjectsByInstructor(ctx context.Context, instructorID uuid.UUID) ([]*entities.Project, error) {
	return uc.projectRepo.GetByInstructorID(ctx, instructorID)
}

func (uc *ProjectUseCase) GetAllProjects(ctx context.Context) ([]*entities.Project, error) {
	return uc.projectRepo.GetAll(ctx)
}

func (uc *ProjectUseCase) UpdateProject(ctx context.Context, project *entities.Project) error {
	existing, err := uc.projectRepo.GetByID(ctx, project.ID)
	if err != nil {
		return err
	}

	if existing == nil {
		return errors.ErrProjectNotFound
	}

	if !project.Status.IsValid() {
		return errors.ErrInvalidProjectStatus
	}

	return uc.projectRepo.Update(ctx, project)
}

func (uc *ProjectUseCase) DeleteProject(ctx context.Context, id uuid.UUID) error {
	existing, err := uc.projectRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if existing == nil {
		return errors.ErrProjectNotFound
	}

	return uc.projectRepo.Delete(ctx, id)
}

func (uc *ProjectUseCase) GetActiveProjects(ctx context.Context) ([]*entities.Project, error) {
	return uc.projectRepo.GetActiveProjects(ctx)
}

func (uc *ProjectUseCase) ArchiveProject(ctx context.Context, id uuid.UUID) error {
	project, err := uc.projectRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if project == nil {
		return errors.ErrProjectNotFound
	}

	project.Status = entities.ProjectStatusArchivado
	return uc.projectRepo.Update(ctx, project)
}
