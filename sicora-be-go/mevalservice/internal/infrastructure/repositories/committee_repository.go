package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"mevalservice/internal/domain/entities"
	"mevalservice/internal/domain/repositories"
	"mevalservice/internal/infrastructure/database"
)

type committeeRepository struct {
	db *gorm.DB
}

func NewCommitteeRepository(db *database.Database) repositories.CommitteeRepository {
	return &committeeRepository{
		db: db.DB,
	}
}

func (r *committeeRepository) Create(ctx context.Context, committee *entities.Committee) error {
	model := r.toModel(committee)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return err
	}
	committee.ID = model.ID
	return nil
}

func (r *committeeRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Committee, error) {
	var model database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *committeeRepository) GetAll(ctx context.Context, limit, offset int) ([]*entities.Committee, error) {
	var models []database.CommitteeModel
	query := r.db.WithContext(ctx).Preload("Members")
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}

	committees := make([]*entities.Committee, len(models))
	for i, model := range models {
		committees[i] = r.toEntity(&model)
	}
	return committees, nil
}

func (r *committeeRepository) GetByType(ctx context.Context, committeeType entities.CommitteeType) ([]*entities.Committee, error) {
	var models []database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("committee_type = ?", string(committeeType)).
		Find(&models).Error; err != nil {
		return nil, err
	}

	committees := make([]*entities.Committee, len(models))
	for i, model := range models {
		committees[i] = r.toEntity(&model)
	}
	return committees, nil
}

func (r *committeeRepository) GetByStatus(ctx context.Context, status entities.CommitteeStatus) ([]*entities.Committee, error) {
	var models []database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("status = ?", string(status)).
		Find(&models).Error; err != nil {
		return nil, err
	}

	committees := make([]*entities.Committee, len(models))
	for i, model := range models {
		committees[i] = r.toEntity(&model)
	}
	return committees, nil
}

func (r *committeeRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.Committee, error) {
	var models []database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("committee_date BETWEEN ? AND ?", startDate, endDate).
		Find(&models).Error; err != nil {
		return nil, err
	}

	committees := make([]*entities.Committee, len(models))
	for i, model := range models {
		committees[i] = r.toEntity(&model)
	}
	return committees, nil
}

func (r *committeeRepository) GetByAcademicPeriod(ctx context.Context, academicPeriod string) ([]*entities.Committee, error) {
	var models []database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("academic_period = ?", academicPeriod).
		Find(&models).Error; err != nil {
		return nil, err
	}

	committees := make([]*entities.Committee, len(models))
	for i, model := range models {
		committees[i] = r.toEntity(&model)
	}
	return committees, nil
}

func (r *committeeRepository) GetByProgramID(ctx context.Context, programID uuid.UUID) ([]*entities.Committee, error) {
	var models []database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("program_id = ?", programID).
		Find(&models).Error; err != nil {
		return nil, err
	}

	committees := make([]*entities.Committee, len(models))
	for i, model := range models {
		committees[i] = r.toEntity(&model)
	}
	return committees, nil
}

func (r *committeeRepository) GetScheduledCommittees(ctx context.Context) ([]*entities.Committee, error) {
	var models []database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("status = ?", string(entities.CommitteeStatusProgramado)).
		Find(&models).Error; err != nil {
		return nil, err
	}

	committees := make([]*entities.Committee, len(models))
	for i, model := range models {
		committees[i] = r.toEntity(&model)
	}
	return committees, nil
}

func (r *committeeRepository) GetCompletedCommittees(ctx context.Context) ([]*entities.Committee, error) {
	var models []database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("status = ?", string(entities.CommitteeStatusCompletado)).
		Find(&models).Error; err != nil {
		return nil, err
	}

	committees := make([]*entities.Committee, len(models))
	for i, model := range models {
		committees[i] = r.toEntity(&model)
	}
	return committees, nil
}

func (r *committeeRepository) GetMonthlyCommitteeForDate(ctx context.Context, date time.Time) (*entities.Committee, error) {
	var model database.CommitteeModel
	startOfMonth := time.Date(date.Year(), date.Month(), 1, 0, 0, 0, 0, date.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("committee_date BETWEEN ? AND ?", startOfMonth, endOfMonth).
		First(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *committeeRepository) GetNextScheduledCommittee(ctx context.Context) (*entities.Committee, error) {
	var model database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Where("status = ? AND committee_date > ?", string(entities.CommitteeStatusProgramado), time.Now()).
		Order("committee_date ASC").
		First(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *committeeRepository) GetCurrentMonthCommittees(ctx context.Context) ([]*entities.Committee, error) {
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)
	return r.GetByDateRange(ctx, startOfMonth, endOfMonth)
}

func (r *committeeRepository) GetWithMembers(ctx context.Context, id uuid.UUID) (*entities.Committee, error) {
	return r.GetByID(ctx, id) // Already loads members via preload
}

func (r *committeeRepository) GetWithCases(ctx context.Context, id uuid.UUID) (*entities.Committee, error) {
	var model database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Preload("Cases").
		First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *committeeRepository) GetWithDecisions(ctx context.Context, id uuid.UUID) (*entities.Committee, error) {
	var model database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Preload("Decisions").
		First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *committeeRepository) GetWithAllRelations(ctx context.Context, id uuid.UUID) (*entities.Committee, error) {
	var model database.CommitteeModel
	if err := r.db.WithContext(ctx).
		Preload("Members").
		Preload("Cases").
		Preload("Decisions").
		First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *committeeRepository) Update(ctx context.Context, committee *entities.Committee) error {
	model := r.toModel(committee)
	return r.db.WithContext(ctx).Save(model).Error
}

func (r *committeeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&database.CommitteeModel{}, "id = ?", id).Error
}

func (r *committeeRepository) GetCommitteeCount(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.CommitteeModel{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *committeeRepository) GetCommitteeCountByType(ctx context.Context, committeeType entities.CommitteeType) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.CommitteeModel{}).
		Where("committee_type = ?", string(committeeType)).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *committeeRepository) GetCommitteeCountByDateRange(ctx context.Context, startDate, endDate time.Time) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.CommitteeModel{}).
		Where("committee_date BETWEEN ? AND ?", startDate, endDate).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// Conversion methods
func (r *committeeRepository) toModel(committee *entities.Committee) *database.CommitteeModel {
	return &database.CommitteeModel{
		ID:              committee.ID,
		CommitteeDate:   committee.CommitteeDate,
		CommitteeType:   string(committee.CommitteeType),
		Status:          string(committee.Status),
		ProgramID:       committee.ProgramID,
		AcademicPeriod:  committee.AcademicPeriod,
		AgendaGenerated: committee.AgendaGenerated,
		QuorumAchieved:  committee.QuorumAchieved,
		SessionMinutes:  committee.SessionMinutes,
		CreatedAt:       committee.CreatedAt,
		UpdatedAt:       committee.UpdatedAt,
	}
}

func (r *committeeRepository) toEntity(model *database.CommitteeModel) *entities.Committee {
	committee := &entities.Committee{
		ID:              model.ID,
		CommitteeDate:   model.CommitteeDate,
		CommitteeType:   entities.CommitteeType(model.CommitteeType),
		Status:          entities.CommitteeStatus(model.Status),
		ProgramID:       model.ProgramID,
		AcademicPeriod:  model.AcademicPeriod,
		AgendaGenerated: model.AgendaGenerated,
		QuorumAchieved:  model.QuorumAchieved,
		SessionMinutes:  model.SessionMinutes,
		CreatedAt:       model.CreatedAt,
		UpdatedAt:       model.UpdatedAt,
	}

	// Convert members if loaded
	if len(model.Members) > 0 {
		members := make([]entities.CommitteeMember, len(model.Members))
		for i, memberModel := range model.Members {
			members[i] = entities.CommitteeMember{
				ID:          memberModel.ID,
				CommitteeID: memberModel.CommitteeID,
				UserID:      memberModel.UserID,
				MemberRole:  entities.MemberRole(memberModel.MemberRole),
				IsPresent:   memberModel.Attended,
				VotePower:   1, // Default
				CreatedAt:   memberModel.CreatedAt,
			}
		}
		committee.Members = members
	}

	return committee
}
