package repositories

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"mevalservice/internal/domain/entities"
	"mevalservice/internal/domain/repositories"
	"mevalservice/internal/infrastructure/database"
)

type studentCaseRepository struct {
	db *gorm.DB
}

func NewStudentCaseRepository(db *database.Database) repositories.StudentCaseRepository {
	return &studentCaseRepository{
		db: db.DB,
	}
}

func (r *studentCaseRepository) Create(ctx context.Context, studentCase *entities.StudentCase) error {
	model := r.toModel(studentCase)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return err
	}
	studentCase.ID = model.ID
	return nil
}

func (r *studentCaseRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.StudentCase, error) {
	var model database.StudentCaseModel
	if err := r.db.WithContext(ctx).
		Preload("Committee").
		Preload("ImprovementPlans").
		Preload("Sanctions").
		Preload("Decisions").
		Preload("Appeals").
		First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *studentCaseRepository) GetByCaseNumber(ctx context.Context, caseNumber string) (*entities.StudentCase, error) {
	var model database.StudentCaseModel
	if err := r.db.WithContext(ctx).
		Preload("Committee").
		Preload("ImprovementPlans").
		Preload("Sanctions").
		Preload("Decisions").
		Preload("Appeals").
		First(&model, "case_number = ?", caseNumber).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *studentCaseRepository) GetByStudentID(ctx context.Context, studentID uuid.UUID) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).
		Preload("Committee").
		Preload("ImprovementPlans").
		Preload("Sanctions").
		Preload("Decisions").
		Preload("Appeals").
		Where("student_id = ?", studentID).
		Order("created_at DESC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetByCommitteeID(ctx context.Context, committeeID uuid.UUID) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).
		Preload("Committee").
		Preload("ImprovementPlans").
		Preload("Sanctions").
		Preload("Decisions").
		Preload("Appeals").
		Where("committee_id = ?", committeeID).
		Order("created_at DESC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetByStatus(ctx context.Context, status entities.CaseStatus) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).
		Preload("Committee").
		Preload("ImprovementPlans").
		Preload("Sanctions").
		Preload("Decisions").
		Where("case_status = ?", string(status)).
		Order("created_at DESC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetPendingCases(ctx context.Context) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).
		Preload("Committee").
		Preload("ImprovementPlans").
		Preload("Sanctions").
		Preload("Decisions").
		Where("case_status IN ?", []string{"PENDING", "IN_REVIEW", "DETECTED"}).
		Order("created_at ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetOverdueCases(ctx context.Context) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).
		Preload("Committee").
		Preload("ImprovementPlans").
		Preload("Sanctions").
		Preload("Decisions").
		Preload("Appeals").
		Where("due_date < ? AND status IN ?", time.Now(), []string{"PENDING", "IN_PROGRESS"}).
		Order("due_date ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetBySeverity(ctx context.Context, severity string) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).
		Preload("Committee").
		Preload("ImprovementPlans").
		Preload("Sanctions").
		Preload("Decisions").
		Preload("Appeals").
		Where("severity = ?", severity).
		Order("created_at DESC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) Update(ctx context.Context, studentCase *entities.StudentCase) error {
	model := r.toModel(studentCase)
	return r.db.WithContext(ctx).Save(model).Error
}

func (r *studentCaseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&database.StudentCaseModel{}, "id = ?", id).Error
}

func (r *studentCaseRepository) GenerateCaseNumber(ctx context.Context, caseType string) (string, error) {
	var count int64
	year := time.Now().Year()
	prefix := "DIS" // Disciplinary
	if caseType == "ACADEMIC" {
		prefix = "ACA"
	}

	// Count cases for this year and type
	if err := r.db.WithContext(ctx).Model(&database.StudentCaseModel{}).
		Where("case_number LIKE ? AND EXTRACT(year FROM created_at) = ?",
			fmt.Sprintf("%s-%d-%%", prefix, year), year).
		Count(&count).Error; err != nil {
		return "", err
	}

	// Generate next case number
	return fmt.Sprintf("%s-%d-%04d", prefix, year, count+1), nil
}

// Conversion methods
func (r *studentCaseRepository) toModel(studentCase *entities.StudentCase) *database.StudentCaseModel {
	// Marshal DetectionCriteria and EvidenceDocuments to JSON
	detectionCriteriaJSON, _ := json.Marshal(studentCase.DetectionCriteria)
	evidenceDocumentsJSON, _ := json.Marshal(studentCase.EvidenceDocuments)

	model := &database.StudentCaseModel{
		ID:                 studentCase.ID,
		StudentID:          studentCase.StudentID,
		CommitteeID:        studentCase.CommitteeID,
		CaseType:           string(studentCase.CaseType),
		CaseStatus:         string(studentCase.CaseStatus),
		AutomaticDetection: studentCase.AutomaticDetection,
		DetectionCriteria:  datatypes.JSON(detectionCriteriaJSON),
		CaseDescription:    studentCase.CaseDescription,
		EvidenceDocuments:  datatypes.JSON(evidenceDocumentsJSON),
		InstructorComments: studentCase.InstructorComments,
		CreatedAt:          studentCase.CreatedAt,
		UpdatedAt:          studentCase.UpdatedAt,
	}
	return model
}

func (r *studentCaseRepository) toEntity(model *database.StudentCaseModel) *entities.StudentCase {
	// Unmarshal DetectionCriteria from JSON
	var detectionCriteria entities.DetectionCriteria
	_ = json.Unmarshal(model.DetectionCriteria, &detectionCriteria)
	// Unmarshal EvidenceDocuments from JSON
	var evidenceDocuments []entities.EvidenceDocument
	_ = json.Unmarshal(model.EvidenceDocuments, &evidenceDocuments)

	return &entities.StudentCase{
		ID:                 model.ID,
		StudentID:          model.StudentID,
		CommitteeID:        model.CommitteeID,
		CaseType:           entities.CaseType(model.CaseType),
		CaseStatus:         entities.CaseStatus(model.CaseStatus),
		AutomaticDetection: model.AutomaticDetection,
		DetectionCriteria:  detectionCriteria,
		CaseDescription:    model.CaseDescription,
		EvidenceDocuments:  evidenceDocuments,
		InstructorComments: model.InstructorComments,
		CreatedAt:          model.CreatedAt,
		UpdatedAt:          model.UpdatedAt,
	}
}

// Additional methods required by interface
func (r *studentCaseRepository) GetAll(ctx context.Context, limit, offset int) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	query := r.db.WithContext(ctx).Order("created_at DESC")
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetByType(ctx context.Context, caseType entities.CaseType) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).Where("case_type = ?", string(caseType)).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetByStatusEntity(ctx context.Context, status entities.CaseStatus) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).Where("case_status = ?", string(status)).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetAutoDetectedCases(ctx context.Context) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).Where("automatic_detection = ?", true).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetManualCases(ctx context.Context) ([]*entities.StudentCase, error) {
	var models []database.StudentCaseModel
	if err := r.db.WithContext(ctx).Where("automatic_detection = ?", false).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	cases := make([]*entities.StudentCase, len(models))
	for i, model := range models {
		cases[i] = r.toEntity(&model)
	}
	return cases, nil
}

func (r *studentCaseRepository) GetRecognitionCases(ctx context.Context) ([]*entities.StudentCase, error) {
	return r.GetByType(ctx, entities.CaseTypeFelicitacion)
}

func (r *studentCaseRepository) GetSanctionCases(ctx context.Context) ([]*entities.StudentCase, error) {
	return r.GetByType(ctx, entities.CaseTypeDisciplinario)
}

func (r *studentCaseRepository) GetAppealCases(ctx context.Context) ([]*entities.StudentCase, error) {
	return r.GetByType(ctx, entities.CaseTypeAcademico)
}

func (r *studentCaseRepository) GetCaseCount(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.StudentCaseModel{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *studentCaseRepository) GetCaseCountByType(ctx context.Context, caseType entities.CaseType) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.StudentCaseModel{}).Where("case_type = ?", string(caseType)).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *studentCaseRepository) GetCaseCountByStudent(ctx context.Context, studentID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.StudentCaseModel{}).Where("student_id = ?", studentID).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
