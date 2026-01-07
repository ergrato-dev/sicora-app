package repositories

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"mevalservice/internal/domain/entities"
	"mevalservice/internal/domain/repositories"
	"mevalservice/internal/infrastructure/database"
)

// Implementation of all remaining repositories
type improvementPlanRepository struct {
	db *gorm.DB
}

type sanctionRepository struct {
	db *gorm.DB
}

type committeeDecisionRepository struct {
	db *gorm.DB
}

type appealRepository struct {
	db *gorm.DB
}

type committeeMemberRepository struct {
	db *gorm.DB
}

// Factory function to create all repositories
func NewRepositories(db *database.Database) *Repositories {
	return &Repositories{
		Committee:         NewCommitteeRepository(db),
		CommitteeMember:   NewCommitteeMemberRepository(db),
		StudentCase:       NewStudentCaseRepository(db),
		ImprovementPlan:   NewImprovementPlanRepository(db),
		Sanction:          NewSanctionRepository(db),
		CommitteeDecision: NewCommitteeDecisionRepository(db),
		Appeal:            NewAppealRepository(db),
	}
}

type Repositories struct {
	Committee         repositories.CommitteeRepository
	CommitteeMember   repositories.CommitteeMemberRepository
	StudentCase       repositories.StudentCaseRepository
	ImprovementPlan   repositories.ImprovementPlanRepository
	Sanction          repositories.SanctionRepository
	CommitteeDecision repositories.CommitteeDecisionRepository
	Appeal            repositories.AppealRepository
}

// ImprovementPlan Repository
func NewImprovementPlanRepository(db *database.Database) repositories.ImprovementPlanRepository {
	return &improvementPlanRepository{db: db.DB}
}

func (r *improvementPlanRepository) Create(ctx context.Context, plan *entities.ImprovementPlan) error {
	model := r.toModel(plan)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return err
	}
	plan.ID = model.ID
	return nil
}

func (r *improvementPlanRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.ImprovementPlan, error) {
	var model database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *improvementPlanRepository) GetByStudentCaseID(ctx context.Context, studentCaseID uuid.UUID) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).Where("student_case_id = ?", studentCaseID).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetByStudentID(ctx context.Context, studentID uuid.UUID) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).Where("student_id = ?", studentID).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetBySupervisorID(ctx context.Context, supervisorID uuid.UUID) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).Where("supervisor_id = ?", supervisorID).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetByStatus(ctx context.Context, status entities.PlanStatus) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).Where("current_status = ?", string(status)).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetAll(ctx context.Context, limit, offset int) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	query := r.db.WithContext(ctx)
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetByType(ctx context.Context, planType entities.PlanType) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).Where("plan_type = ?", string(planType)).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetByInstructor(ctx context.Context, instructorID uuid.UUID) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).Where("responsible_instructor_id = ?", instructorID).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetActivePlans(ctx context.Context) ([]*entities.ImprovementPlan, error) {
	return r.GetByStatus(ctx, entities.PlanStatusActive)
}

func (r *improvementPlanRepository) GetOverduePlans(ctx context.Context) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	now := time.Now()
	if err := r.db.WithContext(ctx).Where("end_date < ? AND current_status = ?", now, string(entities.PlanStatusActive)).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetPlansEndingSoon(ctx context.Context, days int) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	now := time.Now()
	endDate := now.AddDate(0, 0, days)
	if err := r.db.WithContext(ctx).Where("end_date BETWEEN ? AND ? AND current_status = ?", now, endDate, string(entities.PlanStatusActive)).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetCompletedPlans(ctx context.Context) ([]*entities.ImprovementPlan, error) {
	return r.GetByStatus(ctx, entities.PlanStatusCompleted)
}

func (r *improvementPlanRepository) GetPlansByComplianceRange(ctx context.Context, minCompliance, maxCompliance float64) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).Where("compliance_percentage BETWEEN ? AND ?", minCompliance, maxCompliance).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) GetSuccessfulPlans(ctx context.Context, minCompliance float64) ([]*entities.ImprovementPlan, error) {
	var models []database.ImprovementPlanModel
	if err := r.db.WithContext(ctx).Where("compliance_percentage >= ? AND current_status = ?", minCompliance, string(entities.PlanStatusCompleted)).Find(&models).Error; err != nil {
		return nil, err
	}

	plans := make([]*entities.ImprovementPlan, len(models))
	for i, model := range models {
		plans[i] = r.toEntity(&model)
	}
	return plans, nil
}

func (r *improvementPlanRepository) Update(ctx context.Context, plan *entities.ImprovementPlan) error {
	model := r.toModel(plan)
	return r.db.WithContext(ctx).Save(model).Error
}

func (r *improvementPlanRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&database.ImprovementPlanModel{}, "id = ?", id).Error
}

func (r *improvementPlanRepository) toModel(plan *entities.ImprovementPlan) *database.ImprovementPlanModel {
	// Marshal Objectives to JSON
	objectivesJSON, _ := json.Marshal(plan.Objectives)
	// Marshal Activities to JSON
	activitiesJSON, _ := json.Marshal(plan.Activities)
	// Marshal SuccessCriteria to JSON
	successCriteriaJSON, _ := json.Marshal(plan.SuccessCriteria)

	return &database.ImprovementPlanModel{
		ID:                      plan.ID,
		StudentCaseID:           plan.StudentCaseID,
		StudentID:               plan.StudentID,
		PlanType:                string(plan.PlanType),
		StartDate:               plan.StartDate,
		EndDate:                 plan.EndDate,
		Objectives:              datatypes.JSON(objectivesJSON),
		Activities:              datatypes.JSON(activitiesJSON),
		SuccessCriteria:         datatypes.JSON(successCriteriaJSON),
		ResponsibleInstructorID: plan.ResponsibleInstructorID,
		CurrentStatus:           string(plan.CurrentStatus),
		CompliancePercentage:    plan.CompliancePercentage,
		FinalEvaluation:         plan.FinalEvaluation,
		CreatedAt:               plan.CreatedAt,
		UpdatedAt:               plan.UpdatedAt,
	}
}

func (r *improvementPlanRepository) toEntity(model *database.ImprovementPlanModel) *entities.ImprovementPlan {
	// Unmarshal Objectives from JSON
	var objectives []entities.Objective
	_ = json.Unmarshal(model.Objectives, &objectives)
	// Unmarshal Activities from JSON
	var activities []entities.Activity
	_ = json.Unmarshal(model.Activities, &activities)
	// Unmarshal SuccessCriteria from JSON
	var successCriteria []entities.SuccessCriteria
	_ = json.Unmarshal(model.SuccessCriteria, &successCriteria)

	return &entities.ImprovementPlan{
		ID:                      model.ID,
		StudentCaseID:           model.StudentCaseID,
		StudentID:               model.StudentID,
		PlanType:                entities.PlanType(model.PlanType),
		StartDate:               model.StartDate,
		EndDate:                 model.EndDate,
		Objectives:              objectives,
		Activities:              activities,
		SuccessCriteria:         successCriteria,
		ResponsibleInstructorID: model.ResponsibleInstructorID,
		CurrentStatus:           entities.PlanStatus(model.CurrentStatus),
		CompliancePercentage:    model.CompliancePercentage,
		FinalEvaluation:         model.FinalEvaluation,
		CreatedAt:               model.CreatedAt,
		UpdatedAt:               model.UpdatedAt,
	}
}

// CommitteeMember Repository
func NewCommitteeMemberRepository(db *database.Database) repositories.CommitteeMemberRepository {
	return &committeeMemberRepository{db: db.DB}
}

func (r *committeeMemberRepository) Create(ctx context.Context, member *entities.CommitteeMember) error {
	model := r.toModel(member)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return err
	}
	member.ID = model.ID
	return nil
}

func (r *committeeMemberRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.CommitteeMember, error) {
	var model database.CommitteeMemberModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *committeeMemberRepository) GetByCommitteeID(ctx context.Context, committeeID uuid.UUID) ([]*entities.CommitteeMember, error) {
	var models []database.CommitteeMemberModel
	if err := r.db.WithContext(ctx).Where("committee_id = ?", committeeID).Find(&models).Error; err != nil {
		return nil, err
	}

	members := make([]*entities.CommitteeMember, len(models))
	for i, model := range models {
		members[i] = r.toEntity(&model)
	}
	return members, nil
}

func (r *committeeMemberRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.CommitteeMember, error) {
	var models []database.CommitteeMemberModel
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&models).Error; err != nil {
		return nil, err
	}

	members := make([]*entities.CommitteeMember, len(models))
	for i, model := range models {
		members[i] = r.toEntity(&model)
	}
	return members, nil
}

func (r *committeeMemberRepository) Update(ctx context.Context, member *entities.CommitteeMember) error {
	model := r.toModel(member)
	return r.db.WithContext(ctx).Save(model).Error
}

func (r *committeeMemberRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&database.CommitteeMemberModel{}, "id = ?", id).Error
}

func (r *committeeMemberRepository) toModel(member *entities.CommitteeMember) *database.CommitteeMemberModel {
	return &database.CommitteeMemberModel{
		ID:          member.ID,
		CommitteeID: member.CommitteeID,
		UserID:      member.UserID,
		MemberRole:  string(member.MemberRole),
		Attended:    member.IsPresent,
		VotingRights: member.VotePower > 0,
		CreatedAt:   member.CreatedAt,
	}
}

func (r *committeeMemberRepository) toEntity(model *database.CommitteeMemberModel) *entities.CommitteeMember {
	votePower := 0
	if model.VotingRights {
		votePower = 1
	}
	return &entities.CommitteeMember{
		ID:          model.ID,
		CommitteeID: model.CommitteeID,
		UserID:      model.UserID,
		MemberRole:  entities.MemberRole(model.MemberRole),
		IsPresent:   model.Attended,
		VotePower:   votePower,
		CreatedAt:   model.CreatedAt,
	}
}

// CommitteeMember additional methods required by interface
func (r *committeeMemberRepository) GetByRole(ctx context.Context, role entities.MemberRole) ([]*entities.CommitteeMember, error) {
	var models []database.CommitteeMemberModel
	if err := r.db.WithContext(ctx).Where("member_role = ?", string(role)).Find(&models).Error; err != nil {
		return nil, err
	}

	members := make([]*entities.CommitteeMember, len(models))
	for i, model := range models {
		members[i] = r.toEntity(&model)
	}
	return members, nil
}

func (r *committeeMemberRepository) GetPresentMembers(ctx context.Context, committeeID uuid.UUID) ([]*entities.CommitteeMember, error) {
	var models []database.CommitteeMemberModel
	if err := r.db.WithContext(ctx).Where("committee_id = ? AND attended = ?", committeeID, true).Find(&models).Error; err != nil {
		return nil, err
	}

	members := make([]*entities.CommitteeMember, len(models))
	for i, model := range models {
		members[i] = r.toEntity(&model)
	}
	return members, nil
}

func (r *committeeMemberRepository) GetAbsentMembers(ctx context.Context, committeeID uuid.UUID) ([]*entities.CommitteeMember, error) {
	var models []database.CommitteeMemberModel
	if err := r.db.WithContext(ctx).Where("committee_id = ? AND attended = ?", committeeID, false).Find(&models).Error; err != nil {
		return nil, err
	}

	members := make([]*entities.CommitteeMember, len(models))
	for i, model := range models {
		members[i] = r.toEntity(&model)
	}
	return members, nil
}

func (r *committeeMemberRepository) GetVotingMembers(ctx context.Context, committeeID uuid.UUID) ([]*entities.CommitteeMember, error) {
	var models []database.CommitteeMemberModel
	if err := r.db.WithContext(ctx).Where("committee_id = ? AND voting_rights = ?", committeeID, true).Find(&models).Error; err != nil {
		return nil, err
	}

	members := make([]*entities.CommitteeMember, len(models))
	for i, model := range models {
		members[i] = r.toEntity(&model)
	}
	return members, nil
}

func (r *committeeMemberRepository) GetMemberAttendanceRate(ctx context.Context, userID uuid.UUID) (float64, error) {
	var total, attended int64
	if err := r.db.WithContext(ctx).Model(&database.CommitteeMemberModel{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return 0, err
	}
	if total == 0 {
		return 0, nil
	}
	if err := r.db.WithContext(ctx).Model(&database.CommitteeMemberModel{}).Where("user_id = ? AND attended = ?", userID, true).Count(&attended).Error; err != nil {
		return 0, err
	}
	return float64(attended) / float64(total) * 100, nil
}

func (r *committeeMemberRepository) GetQuorumCount(ctx context.Context, committeeID uuid.UUID) (int, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.CommitteeMemberModel{}).Where("committee_id = ? AND attended = ? AND voting_rights = ?", committeeID, true, true).Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}

// Sanction Repository
func NewSanctionRepository(db *database.Database) repositories.SanctionRepository {
	return &sanctionRepository{db: db.DB}
}

func (r *sanctionRepository) Create(ctx context.Context, sanction *entities.Sanction) error {
	model := r.toModel(sanction)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return err
	}
	sanction.ID = model.ID
	return nil
}

func (r *sanctionRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Sanction, error) {
	var model database.SanctionModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return r.toEntity(&model), nil
}

func (r *sanctionRepository) GetByStudentCaseID(ctx context.Context, studentCaseID uuid.UUID) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	if err := r.db.WithContext(ctx).Where("student_case_id = ?", studentCaseID).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetByStudentID(ctx context.Context, studentID uuid.UUID) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	if err := r.db.WithContext(ctx).Where("student_id = ?", studentID).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetByType(ctx context.Context, sanctionType entities.SanctionType) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	if err := r.db.WithContext(ctx).Where("sanction_type = ?", string(sanctionType)).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetByStatus(ctx context.Context, status string) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	if err := r.db.WithContext(ctx).Where("compliance_status = ?", status).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetAll(ctx context.Context, limit, offset int) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	query := r.db.WithContext(ctx)
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetBySeverityLevel(ctx context.Context, level int) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	if err := r.db.WithContext(ctx).Where("severity_level = ?", level).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	if err := r.db.WithContext(ctx).Where("start_date BETWEEN ? AND ?", startDate, endDate).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetActiveSanctions(ctx context.Context) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	now := time.Now()
	if err := r.db.WithContext(ctx).Where("start_date <= ? AND (end_date IS NULL OR end_date > ?)", now, now).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetExpiredSanctions(ctx context.Context) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	now := time.Now()
	if err := r.db.WithContext(ctx).Where("end_date IS NOT NULL AND end_date < ?", now).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetAppealableSanctions(ctx context.Context) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	now := time.Now()
	if err := r.db.WithContext(ctx).Where("appeal_deadline IS NOT NULL AND appeal_deadline > ? AND appealed = ?", now, false).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetAppealedSanctions(ctx context.Context) ([]*entities.Sanction, error) {
	var models []database.SanctionModel
	if err := r.db.WithContext(ctx).Where("appealed = ?", true).Find(&models).Error; err != nil {
		return nil, err
	}

	sanctions := make([]*entities.Sanction, len(models))
	for i, model := range models {
		sanctions[i] = r.toEntity(&model)
	}
	return sanctions, nil
}

func (r *sanctionRepository) GetSanctionCountByType(ctx context.Context, sanctionType entities.SanctionType) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.SanctionModel{}).Where("sanction_type = ?", string(sanctionType)).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *sanctionRepository) GetSanctionCountByStudent(ctx context.Context, studentID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.SanctionModel{}).Where("student_id = ?", studentID).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *sanctionRepository) GetReincidenceCount(ctx context.Context, studentID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&database.SanctionModel{}).Where("student_id = ?", studentID).Count(&count).Error; err != nil {
		return 0, err
	}
	// Reincidence is count - 1 if count > 0
	if count > 0 {
		return count - 1, nil
	}
	return 0, nil
}

func (r *sanctionRepository) Update(ctx context.Context, sanction *entities.Sanction) error {
	model := r.toModel(sanction)
	return r.db.WithContext(ctx).Save(model).Error
}

func (r *sanctionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&database.SanctionModel{}, "id = ?", id).Error
}

func (r *sanctionRepository) toModel(sanction *entities.Sanction) *database.SanctionModel {
	var appealResult *string
	if sanction.AppealResult != nil {
		result := string(*sanction.AppealResult)
		appealResult = &result
	}
	return &database.SanctionModel{
		ID:                 sanction.ID,
		StudentID:          sanction.StudentID,
		StudentCaseID:      sanction.StudentCaseID,
		SanctionType:       string(sanction.SanctionType),
		SeverityLevel:      sanction.SeverityLevel,
		Description:        sanction.Description,
		StartDate:          sanction.StartDate,
		EndDate:            sanction.EndDate,
		ComplianceRequired: sanction.ComplianceRequired,
		ComplianceStatus:   string(sanction.ComplianceStatus),
		AppealDeadline:     sanction.AppealDeadline,
		Appealed:           sanction.Appealed,
		AppealResult:       appealResult,
		CreatedAt:          sanction.CreatedAt,
		UpdatedAt:          sanction.UpdatedAt,
	}
}

func (r *sanctionRepository) toEntity(model *database.SanctionModel) *entities.Sanction {
	var appealResult *entities.AppealResult
	if model.AppealResult != nil {
		result := entities.AppealResult(*model.AppealResult)
		appealResult = &result
	}
	return &entities.Sanction{
		ID:                 model.ID,
		StudentID:          model.StudentID,
		StudentCaseID:      model.StudentCaseID,
		SanctionType:       entities.SanctionType(model.SanctionType),
		SeverityLevel:      model.SeverityLevel,
		Description:        model.Description,
		StartDate:          model.StartDate,
		EndDate:            model.EndDate,
		ComplianceRequired: model.ComplianceRequired,
		ComplianceStatus:   entities.ComplianceStatus(model.ComplianceStatus),
		AppealDeadline:     model.AppealDeadline,
		Appealed:           model.Appealed,
		AppealResult:       appealResult,
		CreatedAt:          model.CreatedAt,
		UpdatedAt:          model.UpdatedAt,
	}
}

// CommitteeDecision Repository
func NewCommitteeDecisionRepository(db *database.Database) repositories.CommitteeDecisionRepository {
	return &committeeDecisionRepository{db: db.DB}
}

func (r *committeeDecisionRepository) Create(ctx context.Context, decision *entities.CommitteeDecision) error {
	return nil // TODO: Implement
}

func (r *committeeDecisionRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) GetByCommitteeID(ctx context.Context, committeeID uuid.UUID) ([]*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) GetByStudentCaseID(ctx context.Context, studentCaseID uuid.UUID) ([]*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) Update(ctx context.Context, decision *entities.CommitteeDecision) error {
	return nil
}

func (r *committeeDecisionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return nil
}

func (r *committeeDecisionRepository) GetAll(ctx context.Context, limit, offset int) ([]*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) GetByType(ctx context.Context, decisionType entities.DecisionType) ([]*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) GetUnanimousDecisions(ctx context.Context) ([]*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) GetApprovedDecisions(ctx context.Context) ([]*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) GetRejectedDecisions(ctx context.Context) ([]*entities.CommitteeDecision, error) {
	return nil, nil
}

func (r *committeeDecisionRepository) GetDecisionCountByType(ctx context.Context, decisionType entities.DecisionType) (int64, error) {
	return 0, nil
}

func (r *committeeDecisionRepository) GetApprovalRate(ctx context.Context) (float64, error) {
	return 0, nil
}

// Appeal Repository
func NewAppealRepository(db *database.Database) repositories.AppealRepository {
	return &appealRepository{db: db.DB}
}

func (r *appealRepository) Create(ctx context.Context, appeal *entities.Appeal) error {
	return nil // TODO: Implement
}

func (r *appealRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetByStudentID(ctx context.Context, studentID uuid.UUID) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetBySanctionID(ctx context.Context, sanctionID uuid.UUID) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetByStatus(ctx context.Context, status entities.AdmissibilityStatus) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) Update(ctx context.Context, appeal *entities.Appeal) error {
	return nil
}

func (r *appealRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return nil
}

func (r *appealRepository) GetAll(ctx context.Context, limit, offset int) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetPendingAppeals(ctx context.Context) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetAdmittedAppeals(ctx context.Context) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetRejectedAppeals(ctx context.Context) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetAppealsWithFinalDecision(ctx context.Context) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetAppealsNearDeadline(ctx context.Context, days int) ([]*entities.Appeal, error) {
	return nil, nil
}

func (r *appealRepository) GetOverdueAppeals(ctx context.Context) ([]*entities.Appeal, error) {
	return nil, nil
}
