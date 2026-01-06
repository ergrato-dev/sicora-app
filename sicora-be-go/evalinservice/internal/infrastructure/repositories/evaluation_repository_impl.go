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

type evaluationRepositoryImpl struct {
	db     *gorm.DB
	mapper *mappers.EvaluationMapper
}

func NewEvaluationRepository(db *gorm.DB) repositories.EvaluationRepository {
	return &evaluationRepositoryImpl{
		db:     db,
		mapper: mappers.NewEvaluationMapper(),
	}
}

func (r *evaluationRepositoryImpl) Create(ctx context.Context, evaluation *entities.Evaluation) error {
	model := r.mapper.ToModel(evaluation)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create evaluation: %w", err)
	}
	return nil
}

func (r *evaluationRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Evaluation, error) {
	var model models.Evaluation
	if err := r.db.WithContext(ctx).Preload("Comments").First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get evaluation by ID: %w", err)
	}
	return r.mapper.ToEntity(&model), nil
}

func (r *evaluationRepositoryImpl) Update(ctx context.Context, evaluation *entities.Evaluation) error {
	model := r.mapper.ToModel(evaluation)
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update evaluation: %w", err)
	}
	return nil
}

func (r *evaluationRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.Evaluation{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete evaluation: %w", err)
	}
	return nil
}

func (r *evaluationRepositoryImpl) GetByStudentAndInstructor(ctx context.Context, studentID, instructorID uuid.UUID) ([]*entities.Evaluation, error) {
	var evaluations []models.Evaluation
	if err := r.db.WithContext(ctx).
		Where("student_id = ? AND instructor_id = ?", studentID, instructorID).
		Find(&evaluations).Error; err != nil {
		return nil, fmt.Errorf("failed to get evaluations by student and instructor: %w", err)
	}

	result := make([]*entities.Evaluation, len(evaluations))
	for i, model := range evaluations {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationRepositoryImpl) GetByPeriod(ctx context.Context, periodID uuid.UUID) ([]*entities.Evaluation, error) {
	var evaluations []models.Evaluation
	if err := r.db.WithContext(ctx).Where("period_id = ?", periodID).Find(&evaluations).Error; err != nil {
		return nil, fmt.Errorf("failed to get evaluations by period: %w", err)
	}

	result := make([]*entities.Evaluation, len(evaluations))
	for i, model := range evaluations {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationRepositoryImpl) GetByInstructor(ctx context.Context, instructorID uuid.UUID) ([]*entities.Evaluation, error) {
	var evaluations []models.Evaluation
	if err := r.db.WithContext(ctx).Where("instructor_id = ?", instructorID).Find(&evaluations).Error; err != nil {
		return nil, fmt.Errorf("failed to get evaluations by instructor: %w", err)
	}

	result := make([]*entities.Evaluation, len(evaluations))
	for i, model := range evaluations {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationRepositoryImpl) GetByStudent(ctx context.Context, studentID uuid.UUID) ([]*entities.Evaluation, error) {
	var evaluations []models.Evaluation
	if err := r.db.WithContext(ctx).Where("student_id = ?", studentID).Find(&evaluations).Error; err != nil {
		return nil, fmt.Errorf("failed to get evaluations by student: %w", err)
	}

	result := make([]*entities.Evaluation, len(evaluations))
	for i, model := range evaluations {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationRepositoryImpl) GetPendingEvaluations(ctx context.Context, studentID uuid.UUID) ([]*entities.Evaluation, error) {
	var evaluations []models.Evaluation
	if err := r.db.WithContext(ctx).
		Where("student_id = ? AND status = ?", studentID, "PENDING").
		Find(&evaluations).Error; err != nil {
		return nil, fmt.Errorf("failed to get pending evaluations: %w", err)
	}

	result := make([]*entities.Evaluation, len(evaluations))
	for i, model := range evaluations {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationRepositoryImpl) GetCompletedEvaluations(ctx context.Context, instructorID uuid.UUID, periodID *uuid.UUID) ([]*entities.Evaluation, error) {
	query := r.db.WithContext(ctx).Where("instructor_id = ? AND status = ?", instructorID, "COMPLETED")

	if periodID != nil {
		query = query.Where("period_id = ?", *periodID)
	}

	var evaluations []models.Evaluation
	if err := query.Find(&evaluations).Error; err != nil {
		return nil, fmt.Errorf("failed to get completed evaluations: %w", err)
	}

	result := make([]*entities.Evaluation, len(evaluations))
	for i, model := range evaluations {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationRepositoryImpl) GetOverdueEvaluations(ctx context.Context, days int) ([]*entities.Evaluation, error) {
	cutoff := time.Now().AddDate(0, 0, -days)

	var evaluations []models.Evaluation
	if err := r.db.WithContext(ctx).
		Where("status = ? AND created_at < ?", "PENDING", cutoff).
		Find(&evaluations).Error; err != nil {
		return nil, fmt.Errorf("failed to get overdue evaluations: %w", err)
	}

	result := make([]*entities.Evaluation, len(evaluations))
	for i, model := range evaluations {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

func (r *evaluationRepositoryImpl) GetEvaluationStats(ctx context.Context, periodID uuid.UUID) (map[string]int64, error) {
	stats := make(map[string]int64)

	// Total evaluaciones
	var total int64
	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("period_id = ?", periodID).Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to get total evaluations: %w", err)
	}
	stats["total"] = total

	// Completadas
	var completed int64
	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("period_id = ? AND status = ?", periodID, "COMPLETED").Count(&completed).Error; err != nil {
		return nil, fmt.Errorf("failed to get completed evaluations: %w", err)
	}
	stats["completed"] = completed

	// Pendientes
	var pending int64
	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("period_id = ? AND status = ?", periodID, "PENDING").Count(&pending).Error; err != nil {
		return nil, fmt.Errorf("failed to get pending evaluations: %w", err)
	}
	stats["pending"] = pending

	// En progreso
	var inProgress int64
	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("period_id = ? AND status = ?", periodID, "IN_PROGRESS").Count(&inProgress).Error; err != nil {
		return nil, fmt.Errorf("failed to get in progress evaluations: %w", err)
	}
	stats["in_progress"] = inProgress

	return stats, nil
}

func (r *evaluationRepositoryImpl) ExistsForStudentAndInstructor(ctx context.Context, studentID, instructorID, periodID uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("student_id = ? AND instructor_id = ? AND period_id = ?", studentID, instructorID, periodID).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check evaluation existence: %w", err)
	}
	return count > 0, nil
}

func (r *evaluationRepositoryImpl) ExistsEvaluation(ctx context.Context, studentID, instructorID, periodID uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("student_id = ? AND instructor_id = ? AND period_id = ?", studentID, instructorID, periodID).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check if evaluation exists: %w", err)
	}
	return count > 0, nil
}

func (r *evaluationRepositoryImpl) BulkUpdateStatus(ctx context.Context, evaluationIDs []uuid.UUID, status valueobjects.EvaluationStatus) error {
	if len(evaluationIDs) == 0 {
		return nil
	}

	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("id IN ?", evaluationIDs).
		Update("status", string(status)).Error; err != nil {
		return fmt.Errorf("failed to bulk update evaluation status: %w", err)
	}
	return nil
}

func (r *evaluationRepositoryImpl) GetAll(ctx context.Context, filters repositories.EvaluationFilters) ([]*entities.Evaluation, error) {
	query := r.db.WithContext(ctx)

	// Aplicar filtros
	if filters.StudentID != nil {
		query = query.Where("student_id = ?", *filters.StudentID)
	}

	if filters.InstructorID != nil {
		query = query.Where("instructor_id = ?", *filters.InstructorID)
	}

	if filters.PeriodID != nil {
		query = query.Where("period_id = ?", *filters.PeriodID)
	}

	if filters.Status != "" {
		query = query.Where("status = ?", string(filters.Status))
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

	var evaluations []models.Evaluation
	if err := query.Find(&evaluations).Error; err != nil {
		return nil, fmt.Errorf("failed to get evaluations with filters: %w", err)
	}

	result := make([]*entities.Evaluation, len(evaluations))
	for i, model := range evaluations {
		result[i] = r.mapper.ToEntity(&model)
	}
	return result, nil
}

// GetByInstructorAndPeriod obtiene evaluaciones de un instructor en un período
func (r *evaluationRepositoryImpl) GetByInstructorAndPeriod(ctx context.Context, instructorID, periodID uuid.UUID) ([]*entities.Evaluation, error) {
	var evals []models.Evaluation
	if err := r.db.WithContext(ctx).
		Where("instructor_id = ? AND period_id = ?", instructorID, periodID).
		Order("created_at DESC").
		Find(&evals).Error; err != nil {
		return nil, fmt.Errorf("failed to get evaluations by instructor and period: %w", err)
	}

	res := make([]*entities.Evaluation, len(evals))
	for i, model := range evals {
		res[i] = r.mapper.ToEntity(&model)
	}
	return res, nil
}

// GetByStudentAndPeriod obtiene evaluaciones de un estudiante en un período
func (r *evaluationRepositoryImpl) GetByStudentAndPeriod(ctx context.Context, studentID, periodID uuid.UUID) ([]*entities.Evaluation, error) {
	var evals []models.Evaluation
	if err := r.db.WithContext(ctx).
		Where("student_id = ? AND period_id = ?", studentID, periodID).
		Order("created_at DESC").
		Find(&evals).Error; err != nil {
		return nil, fmt.Errorf("failed to get evaluations by student and period: %w", err)
	}

	res := make([]*entities.Evaluation, len(evals))
	for i, model := range evals {
		res[i] = r.mapper.ToEntity(&model)
	}
	return res, nil
}

// GetEvaluationByStudentInstructorPeriod obtiene una evaluación específica
func (r *evaluationRepositoryImpl) GetEvaluationByStudentInstructorPeriod(ctx context.Context, studentID, instructorID, periodID uuid.UUID) (*entities.Evaluation, error) {
	var model models.Evaluation
	if err := r.db.WithContext(ctx).
		Where("student_id = ? AND instructor_id = ? AND period_id = ?", studentID, instructorID, periodID).
		First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get evaluation: %w", err)
	}
	return r.mapper.ToEntity(&model), nil
}

// GetSubmittedEvaluations obtiene evaluaciones enviadas
func (r *evaluationRepositoryImpl) GetSubmittedEvaluations(ctx context.Context, filters repositories.EvaluationFilters) ([]*entities.Evaluation, error) {
	query := r.db.WithContext(ctx).Where("status = ?", "SUBMITTED")

	if filters.PeriodID != nil {
		query = query.Where("period_id = ?", *filters.PeriodID)
	}
	if filters.InstructorID != nil {
		query = query.Where("instructor_id = ?", *filters.InstructorID)
	}

	var evals []models.Evaluation
	if err := query.Order("created_at DESC").Find(&evals).Error; err != nil {
		return nil, fmt.Errorf("failed to get submitted evaluations: %w", err)
	}

	res := make([]*entities.Evaluation, len(evals))
	for i, model := range evals {
		res[i] = r.mapper.ToEntity(&model)
	}
	return res, nil
}

// GetDraftEvaluations obtiene evaluaciones en borrador
func (r *evaluationRepositoryImpl) GetDraftEvaluations(ctx context.Context, filters repositories.EvaluationFilters) ([]*entities.Evaluation, error) {
	query := r.db.WithContext(ctx).Where("status = ?", "DRAFT")

	if filters.PeriodID != nil {
		query = query.Where("period_id = ?", *filters.PeriodID)
	}
	if filters.InstructorID != nil {
		query = query.Where("instructor_id = ?", *filters.InstructorID)
	}

	var evals []models.Evaluation
	if err := query.Order("created_at DESC").Find(&evals).Error; err != nil {
		return nil, fmt.Errorf("failed to get draft evaluations: %w", err)
	}

	res := make([]*entities.Evaluation, len(evals))
	for i, model := range evals {
		res[i] = r.mapper.ToEntity(&model)
	}
	return res, nil
}

// GetEvaluationsByPeriod obtiene evaluaciones por período
func (r *evaluationRepositoryImpl) GetEvaluationsByPeriod(ctx context.Context, periodID uuid.UUID) ([]*entities.Evaluation, error) {
	return r.GetByPeriod(ctx, periodID)
}

// GetParticipationStats obtiene estadísticas de participación
func (r *evaluationRepositoryImpl) GetParticipationStats(ctx context.Context, periodID uuid.UUID, fichaID *string) (*repositories.ParticipationStats, error) {
	stats := &repositories.ParticipationStats{
		PeriodID: periodID,
	}

	// Contar total de evaluaciones
	var totalCount int64
	query := r.db.WithContext(ctx).Model(&models.Evaluation{}).Where("period_id = ?", periodID)
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count evaluations: %w", err)
	}
	stats.TotalEvaluations = int(totalCount)

	// Contar evaluaciones enviadas
	var submittedCount int64
	if err := r.db.WithContext(ctx).Model(&models.Evaluation{}).
		Where("period_id = ? AND status = ?", periodID, "SUBMITTED").
		Count(&submittedCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count submitted evaluations: %w", err)
	}
	stats.SubmittedEvaluations = int(submittedCount)
	stats.DraftEvaluations = stats.TotalEvaluations - stats.SubmittedEvaluations

	if stats.TotalEvaluations > 0 {
		stats.ParticipationRate = float64(stats.SubmittedEvaluations) / float64(stats.TotalEvaluations) * 100
	}

	return stats, nil
}

// GetInstructorEvaluationSummary obtiene resumen de evaluaciones de un instructor
func (r *evaluationRepositoryImpl) GetInstructorEvaluationSummary(ctx context.Context, instructorID uuid.UUID, periodID *uuid.UUID) (*repositories.InstructorEvaluationSummary, error) {
	summary := &repositories.InstructorEvaluationSummary{
		InstructorID:         instructorID,
		PeriodID:             periodID,
		ResponseDistribution: make(map[string]int),
		Categories:           make(map[string]*repositories.CategorySummary),
		Comments:             make([]string, 0),
	}

	query := r.db.WithContext(ctx).Model(&models.Evaluation{}).Where("instructor_id = ?", instructorID)
	if periodID != nil {
		query = query.Where("period_id = ?", *periodID)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		return nil, fmt.Errorf("failed to count instructor evaluations: %w", err)
	}
	summary.TotalEvaluations = int(count)

	return summary, nil
}
