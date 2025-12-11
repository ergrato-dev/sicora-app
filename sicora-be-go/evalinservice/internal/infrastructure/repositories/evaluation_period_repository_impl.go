package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"evalinservice/internal/domain/entities"
	"evalinservice/internal/domain/repositories"
	"evalinservice/internal/domain/valueobjects"
	"evalinservice/internal/infrastructure/database/mappers"
	"evalinservice/internal/infrastructure/database/models"
)

type evaluationPeriodRepositoryImpl struct {
	db     *gorm.DB
	mapper *mappers.EvaluationPeriodMapper
}

func NewEvaluationPeriodRepository(db *gorm.DB) repositories.EvaluationPeriodRepository {
	return &evaluationPeriodRepositoryImpl{
		db:     db,
		mapper: mappers.NewEvaluationPeriodMapper(),
	}
}

func (r *evaluationPeriodRepositoryImpl) Create(ctx context.Context, period *entities.EvaluationPeriod) error {
	model := r.mapper.ToModel(period)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create evaluation period: %w", err)
	}
	return nil
}

func (r *evaluationPeriodRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.EvaluationPeriod, error) {
	var model models.EvaluationPeriod
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get evaluation period by ID: %w", err)
	}
	return r.mapper.ToEntity(&model), nil
}

func (r *evaluationPeriodRepositoryImpl) GetAll(ctx context.Context, filters repositories.PeriodFilters) ([]*entities.EvaluationPeriod, error) {
	query := r.db.WithContext(ctx)

	// Aplicar filtros
	if filters.Status != "" {
		query = query.Where("status = ?", string(filters.Status))
	}

	if filters.QuestionnaireID != nil {
		query = query.Where("questionnaire_id = ?", *filters.QuestionnaireID)
	}

	if filters.FichaID != nil {
		query = query.Where("ficha_id = ?", *filters.FichaID)
	}

	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	if filters.StartDateFrom != nil {
		query = query.Where("start_date >= ?", *filters.StartDateFrom)
	}

	if filters.StartDateTo != nil {
		query = query.Where("start_date <= ?", *filters.StartDateTo)
	}

	if filters.EndDateFrom != nil {
		query = query.Where("end_date >= ?", *filters.EndDateFrom)
	}

	if filters.EndDateTo != nil {
		query = query.Where("end_date <= ?", *filters.EndDateTo)
	}

	if filters.Search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+filters.Search+"%", "%"+filters.Search+"%")
	}

	// Aplicar ordenamiento
	orderBy := "created_at"
	if filters.OrderBy != "" {
		orderBy = filters.OrderBy
	}
	orderDir := "desc"
	if filters.OrderDir != "" {
		orderDir = filters.OrderDir
	}
	query = query.Order(orderBy + " " + orderDir)

	// Aplicar paginación
	if filters.Limit > 0 {
		query = query.Limit(filters.Limit)
	}
	if filters.Offset > 0 {
		query = query.Offset(filters.Offset)
	}

	var periods []models.EvaluationPeriod
	if err := query.Find(&periods).Error; err != nil {
		return nil, fmt.Errorf("failed to get evaluation periods with filters: %w", err)
	}

	result := make([]*entities.EvaluationPeriod, len(periods))
	for i, model := range periods {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationPeriodRepositoryImpl) Update(ctx context.Context, period *entities.EvaluationPeriod) error {
	model := r.mapper.ToModel(period)
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update evaluation period: %w", err)
	}
	return nil
}

func (r *evaluationPeriodRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.EvaluationPeriod{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete evaluation period: %w", err)
	}
	return nil
}

func (r *evaluationPeriodRepositoryImpl) GetActivePeriods(ctx context.Context) ([]*entities.EvaluationPeriod, error) {
	var periods []models.EvaluationPeriod
	if err := r.db.WithContext(ctx).Where("status = ?", "ACTIVE").Find(&periods).Error; err != nil {
		return nil, fmt.Errorf("failed to get active periods: %w", err)
	}

	result := make([]*entities.EvaluationPeriod, len(periods))
	for i, model := range periods {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationPeriodRepositoryImpl) GetPeriodsByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.EvaluationPeriod, error) {
	var periods []models.EvaluationPeriod
	if err := r.db.WithContext(ctx).
		Where("start_date <= ? AND end_date >= ?", endDate, startDate).
		Find(&periods).Error; err != nil {
		return nil, fmt.Errorf("failed to get periods by date range: %w", err)
	}

	result := make([]*entities.EvaluationPeriod, len(periods))
	for i, model := range periods {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationPeriodRepositoryImpl) GetOverlappingPeriods(ctx context.Context, startDate, endDate time.Time, excludeID *uuid.UUID) ([]*entities.EvaluationPeriod, error) {
	query := r.db.WithContext(ctx).
		Where("start_date <= ? AND end_date >= ?", endDate, startDate)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	var periods []models.EvaluationPeriod
	if err := query.Find(&periods).Error; err != nil {
		return nil, fmt.Errorf("failed to get overlapping periods: %w", err)
	}

	result := make([]*entities.EvaluationPeriod, len(periods))
	for i, model := range periods {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationPeriodRepositoryImpl) GetPeriodsByFicha(ctx context.Context, fichaID uuid.UUID) ([]*entities.EvaluationPeriod, error) {
	var periods []models.EvaluationPeriod
	if err := r.db.WithContext(ctx).Where("ficha_id = ?", fichaID).Find(&periods).Error; err != nil {
		return nil, fmt.Errorf("failed to get periods by ficha: %w", err)
	}

	result := make([]*entities.EvaluationPeriod, len(periods))
	for i, model := range periods {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationPeriodRepositoryImpl) GetCurrentActivePeriod(ctx context.Context, fichaID uuid.UUID) (*entities.EvaluationPeriod, error) {
	now := time.Now()
	var model models.EvaluationPeriod

	query := r.db.WithContext(ctx).
		Where("status = ? AND start_date <= ? AND end_date >= ?", "ACTIVE", now, now)

	if fichaID != uuid.Nil {
		query = query.Where("ficha_id = ?", fichaID)
	}

	if err := query.First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get current active period: %w", err)
	}

	return r.mapper.ToEntity(&model), nil
}

// GetByStatus es un alias para GetPeriodsByStatus (para compatibilidad con usecases)
func (r *evaluationPeriodRepositoryImpl) GetByStatus(ctx context.Context, status valueobjects.PeriodStatus) ([]*entities.EvaluationPeriod, error) {
	return r.GetPeriodsByStatus(ctx, status)
}

func (r *evaluationPeriodRepositoryImpl) GetByFichaID(ctx context.Context, fichaID uuid.UUID) ([]*entities.EvaluationPeriod, error) {
	var periods []models.EvaluationPeriod
	if err := r.db.WithContext(ctx).Where("ficha_id = ?", fichaID).Find(&periods).Error; err != nil {
		return nil, fmt.Errorf("failed to get periods by ficha ID: %w", err)
	}

	result := make([]*entities.EvaluationPeriod, len(periods))
	for i, model := range periods {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationPeriodRepositoryImpl) HasActiveEvaluations(ctx context.Context, id uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("period_id = ? AND status NOT IN (?)", id, []string{"COMPLETED", "CANCELLED"}).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check for active evaluations: %w", err)
	}
	return count > 0, nil
}
