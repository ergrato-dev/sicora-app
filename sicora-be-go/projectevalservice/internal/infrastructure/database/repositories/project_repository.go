package repositories

import (
	"context"

	"projectevalservice/internal/domain/entities"
	"projectevalservice/internal/domain/repositories"
	"projectevalservice/internal/infrastructure/database/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type projectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) repositories.ProjectRepository {
	return &projectRepository{db: db}
}

func (r *projectRepository) Create(ctx context.Context, project *entities.Project) error {
	model := &models.Project{}
	model.FromEntity(project)

	result := r.db.WithContext(ctx).Create(model)
	if result.Error != nil {
		return result.Error
	}

	*project = *model.ToEntity()
	return nil
}

func (r *projectRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Project, error) {
	var model models.Project
	result := r.db.WithContext(ctx).First(&model, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}

	return model.ToEntity(), nil
}

func (r *projectRepository) GetByInstructorID(ctx context.Context, instructorID uuid.UUID) ([]*entities.Project, error) {
	var models []models.Project
	result := r.db.WithContext(ctx).Where("instructor_id = ?", instructorID).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	projects := make([]*entities.Project, len(models))
	for i, model := range models {
		projects[i] = model.ToEntity()
	}

	return projects, nil
}

func (r *projectRepository) GetAll(ctx context.Context) ([]*entities.Project, error) {
	var models []models.Project
	result := r.db.WithContext(ctx).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	projects := make([]*entities.Project, len(models))
	for i, model := range models {
		projects[i] = model.ToEntity()
	}

	return projects, nil
}

func (r *projectRepository) Update(ctx context.Context, project *entities.Project) error {
	model := &models.Project{}
	model.FromEntity(project)

	result := r.db.WithContext(ctx).Save(model)
	if result.Error != nil {
		return result.Error
	}

	*project = *model.ToEntity()
	return nil
}

func (r *projectRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.Project{}, "id = ?", id)
	return result.Error
}

func (r *projectRepository) GetActiveProjects(ctx context.Context) ([]*entities.Project, error) {
	var models []models.Project
	result := r.db.WithContext(ctx).Where("status = ?", string(entities.ProjectStatusActivo)).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	projects := make([]*entities.Project, len(models))
	for i, model := range models {
		projects[i] = model.ToEntity()
	}

	return projects, nil
}

func (r *projectRepository) GetProjectsByStatus(ctx context.Context, status entities.ProjectStatus) ([]*entities.Project, error) {
	var models []models.Project
	result := r.db.WithContext(ctx).Where("status = ?", string(status)).Find(&models)
	if result.Error != nil {
		return nil, result.Error
	}

	projects := make([]*entities.Project, len(models))
	for i, model := range models {
		projects[i] = model.ToEntity()
	}

	return projects, nil
}
