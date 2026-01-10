package usecases

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"mevalservice/internal/application/dto"
	"mevalservice/internal/domain/entities"
	"mevalservice/internal/domain/repositories"
)

// Error constants
const (
	ErrFailedToGetStudentCase      = "failed to get student case: %w"
	ErrStudentCaseNotFound         = "student case not found"
	ErrFailedToGetCommittee        = "failed to get committee: %w"
	ErrCommitteeNotFound           = "committee not found"
	ErrFailedToGetImprovementPlan  = "failed to get improvement plan: %w"
	ErrImprovementPlanNotFound     = "improvement plan not found"
	ErrFailedToGetImprovementPlans = "failed to get improvement plans: %w"
	ErrFailedToGetSanction         = "failed to get sanction: %w"
	ErrSanctionNotFound            = "sanction not found"
	ErrFailedToGetSanctions        = "failed to get sanctions: %w"
	ErrFailedToGetAppeal           = "failed to get appeal: %w"
	ErrAppealNotFound              = "appeal not found"
	ErrFailedToGetAppeals          = "failed to get appeals: %w"
)

type CommitteeUseCases interface {
	CreateCommittee(ctx context.Context, req *dto.CreateCommitteeRequest) (*dto.CommitteeResponse, error)
	GetCommitteeByID(ctx context.Context, id uuid.UUID) (*dto.CommitteeResponse, error)
	GetAllCommittees(ctx context.Context, limit, offset int) ([]*dto.CommitteeResponse, error)
	GetCommitteesByType(ctx context.Context, committeeType string) ([]*dto.CommitteeResponse, error)
	GetCommitteesByStatus(ctx context.Context, status string) ([]*dto.CommitteeResponse, error)
	GetCommitteesByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*dto.CommitteeResponse, error)
	UpdateCommittee(ctx context.Context, id uuid.UUID, req *dto.UpdateCommitteeRequest) (*dto.CommitteeResponse, error)
	DeleteCommittee(ctx context.Context, id uuid.UUID) error
}

type StudentCaseUseCases interface {
	CreateStudentCase(ctx context.Context, req *dto.CreateStudentCaseRequest) (*dto.StudentCaseResponse, error)
	GetStudentCaseByID(ctx context.Context, id uuid.UUID) (*dto.StudentCaseResponse, error)
	GetStudentCasesByStudentID(ctx context.Context, studentID uuid.UUID) ([]*dto.StudentCaseResponse, error)
	GetStudentCasesByCommitteeID(ctx context.Context, committeeID uuid.UUID) ([]*dto.StudentCaseResponse, error)
	GetStudentCasesByStatus(ctx context.Context, status string) ([]*dto.StudentCaseResponse, error)
	GetStudentCasesByType(ctx context.Context, caseType string) ([]*dto.StudentCaseResponse, error)
	GetPendingStudentCases(ctx context.Context) ([]*dto.StudentCaseResponse, error)
	GetAutoDetectedCases(ctx context.Context) ([]*dto.StudentCaseResponse, error)
	UpdateStudentCase(ctx context.Context, id uuid.UUID, req *dto.UpdateStudentCaseRequest) (*dto.StudentCaseResponse, error)
	DeleteStudentCase(ctx context.Context, id uuid.UUID) error
}

type ImprovementPlanUseCases interface {
	CreateImprovementPlan(ctx context.Context, req *dto.CreateImprovementPlanRequest) (*dto.ImprovementPlanResponse, error)
	GetImprovementPlanByID(ctx context.Context, id uuid.UUID) (*dto.ImprovementPlanResponse, error)
	GetImprovementPlansByStudentCaseID(ctx context.Context, studentCaseID uuid.UUID) ([]*dto.ImprovementPlanResponse, error)
	GetImprovementPlansByStudentID(ctx context.Context, studentID uuid.UUID) ([]*dto.ImprovementPlanResponse, error)
	GetImprovementPlansBySupervisorID(ctx context.Context, supervisorID uuid.UUID) ([]*dto.ImprovementPlanResponse, error)
	UpdateImprovementPlan(ctx context.Context, id uuid.UUID, req *dto.UpdateImprovementPlanRequest) (*dto.ImprovementPlanResponse, error)
	DeleteImprovementPlan(ctx context.Context, id uuid.UUID) error
	UpdateProgress(ctx context.Context, id uuid.UUID, progress int, notes string) error
}

// SanctionUseCases - Aligned with SENA Agreement 009/2024
type SanctionUseCases interface {
	CreateSanction(ctx context.Context, req *dto.CreateSanctionRequest) (*dto.SanctionResponse, error)
	GetSanctionByID(ctx context.Context, id uuid.UUID) (*dto.SanctionResponse, error)
	GetSanctionsByStudentID(ctx context.Context, studentID uuid.UUID) ([]*dto.SanctionResponse, error)
	GetSanctionsByType(ctx context.Context, sanctionType string) ([]*dto.SanctionResponse, error)
	GetActiveSanctions(ctx context.Context) ([]*dto.SanctionResponse, error)
	GetAppealableSanctions(ctx context.Context) ([]*dto.SanctionResponse, error)
	UpdateSanction(ctx context.Context, id uuid.UUID, req *dto.UpdateSanctionRequest) (*dto.SanctionResponse, error)
	DeleteSanction(ctx context.Context, id uuid.UUID) error
	MarkAsAppealed(ctx context.Context, id uuid.UUID) error
	UpdateComplianceStatus(ctx context.Context, id uuid.UUID, status string) error
	SetAppealResult(ctx context.Context, id uuid.UUID, result string) error
}

// AppealUseCases - Aligned with SENA Agreement 009/2024
type AppealUseCases interface {
	CreateAppeal(ctx context.Context, req *dto.CreateAppealRequest) (*dto.AppealResponse, error)
	GetAppealByID(ctx context.Context, id uuid.UUID) (*dto.AppealResponse, error)
	GetAppealsBySanctionID(ctx context.Context, sanctionID uuid.UUID) ([]*dto.AppealResponse, error)
	GetAppealsByStudentID(ctx context.Context, studentID uuid.UUID) ([]*dto.AppealResponse, error)
	GetPendingAppeals(ctx context.Context) ([]*dto.AppealResponse, error)
	GetAdmittedAppeals(ctx context.Context) ([]*dto.AppealResponse, error)
	UpdateAppeal(ctx context.Context, id uuid.UUID, req *dto.UpdateAppealRequest) (*dto.AppealResponse, error)
	DeleteAppeal(ctx context.Context, id uuid.UUID) error
	AdmitAppeal(ctx context.Context, id uuid.UUID, rationale string) error
	RejectAppeal(ctx context.Context, id uuid.UUID, rationale string) error
	SetFinalDecision(ctx context.Context, id uuid.UUID, decision string, rationale string) error
}

// Implementation of Committee Use Cases
type committeeUseCases struct {
	committeeRepo repositories.CommitteeRepository
	memberRepo    repositories.CommitteeMemberRepository
}

func NewCommitteeUseCases(
	committeeRepo repositories.CommitteeRepository,
	memberRepo repositories.CommitteeMemberRepository,
) CommitteeUseCases {
	return &committeeUseCases{
		committeeRepo: committeeRepo,
		memberRepo:    memberRepo,
	}
}

func (uc *committeeUseCases) CreateCommittee(ctx context.Context, req *dto.CreateCommitteeRequest) (*dto.CommitteeResponse, error) {
	// Validate committee type
	committeeType := entities.CommitteeType(req.CommitteeType)

	// Create committee entity
	committee := &entities.Committee{
		ID:             uuid.New(),
		CommitteeDate:  req.CommitteeDate,
		CommitteeType:  committeeType,
		Status:         entities.CommitteeStatusProgramado,
		ProgramID:      req.ProgramID,
		AcademicPeriod: req.AcademicPeriod,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Save to repository
	if err := uc.committeeRepo.Create(ctx, committee); err != nil {
		return nil, fmt.Errorf("failed to create committee: %w", err)
	}

	return uc.toCommitteeResponse(committee), nil
}

func (uc *committeeUseCases) GetCommitteeByID(ctx context.Context, id uuid.UUID) (*dto.CommitteeResponse, error) {
	committee, err := uc.committeeRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get committee: %w", err)
	}
	if committee == nil {
		return nil, fmt.Errorf("committee not found")
	}

	return uc.toCommitteeResponse(committee), nil
}

func (uc *committeeUseCases) GetAllCommittees(ctx context.Context, limit, offset int) ([]*dto.CommitteeResponse, error) {
	committees, err := uc.committeeRepo.GetAll(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get committees: %w", err)
	}

	responses := make([]*dto.CommitteeResponse, len(committees))
	for i, committee := range committees {
		responses[i] = uc.toCommitteeResponse(committee)
	}

	return responses, nil
}

func (uc *committeeUseCases) GetCommitteesByType(ctx context.Context, committeeType string) ([]*dto.CommitteeResponse, error) {
	committees, err := uc.committeeRepo.GetByType(ctx, entities.CommitteeType(committeeType))
	if err != nil {
		return nil, fmt.Errorf("failed to get committees by type: %w", err)
	}

	responses := make([]*dto.CommitteeResponse, len(committees))
	for i, committee := range committees {
		responses[i] = uc.toCommitteeResponse(committee)
	}

	return responses, nil
}

func (uc *committeeUseCases) GetCommitteesByStatus(ctx context.Context, status string) ([]*dto.CommitteeResponse, error) {
	committees, err := uc.committeeRepo.GetByStatus(ctx, entities.CommitteeStatus(status))
	if err != nil {
		return nil, fmt.Errorf("failed to get committees by status: %w", err)
	}

	responses := make([]*dto.CommitteeResponse, len(committees))
	for i, committee := range committees {
		responses[i] = uc.toCommitteeResponse(committee)
	}

	return responses, nil
}

func (uc *committeeUseCases) GetCommitteesByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*dto.CommitteeResponse, error) {
	committees, err := uc.committeeRepo.GetByDateRange(ctx, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get committees by date range: %w", err)
	}

	responses := make([]*dto.CommitteeResponse, len(committees))
	for i, committee := range committees {
		responses[i] = uc.toCommitteeResponse(committee)
	}

	return responses, nil
}

func (uc *committeeUseCases) UpdateCommittee(ctx context.Context, id uuid.UUID, req *dto.UpdateCommitteeRequest) (*dto.CommitteeResponse, error) {
	committee, err := uc.committeeRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get committee: %w", err)
	}
	if committee == nil {
		return nil, fmt.Errorf("committee not found")
	}

	// Update fields if provided
	if req.CommitteeDate != nil {
		committee.CommitteeDate = *req.CommitteeDate
	}
	if req.Status != "" {
		committee.Status = entities.CommitteeStatus(req.Status)
	}
	if req.AcademicPeriod != "" {
		committee.AcademicPeriod = req.AcademicPeriod
	}
	if req.SessionMinutes != nil {
		committee.SessionMinutes = req.SessionMinutes
	}

	committee.UpdatedAt = time.Now()

	if err := uc.committeeRepo.Update(ctx, committee); err != nil {
		return nil, fmt.Errorf("failed to update committee: %w", err)
	}

	return uc.toCommitteeResponse(committee), nil
}

func (uc *committeeUseCases) DeleteCommittee(ctx context.Context, id uuid.UUID) error {
	committee, err := uc.committeeRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get committee: %w", err)
	}
	if committee == nil {
		return fmt.Errorf("committee not found")
	}

	return uc.committeeRepo.Delete(ctx, id)
}

// Helper methods
func (uc *committeeUseCases) toCommitteeResponse(committee *entities.Committee) *dto.CommitteeResponse {
	response := &dto.CommitteeResponse{
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

	// Convert members if present
	if len(committee.Members) > 0 {
		response.Members = make([]dto.CommitteeMemberResponse, len(committee.Members))
		for i, member := range committee.Members {
			response.Members[i] = dto.CommitteeMemberResponse{
				ID:          member.ID,
				CommitteeID: member.CommitteeID,
				UserID:      member.UserID,
				MemberRole:  string(member.MemberRole),
				IsPresent:   member.IsPresent,
				VotePower:   int16(member.VotePower),
				CreatedAt:   member.CreatedAt,
			}
		}
	}

	return response
}

// Implementation of Student Case Use Cases
type studentCaseUseCases struct {
	studentCaseRepo repositories.StudentCaseRepository
	committeeRepo   repositories.CommitteeRepository
}

func NewStudentCaseUseCases(
	studentCaseRepo repositories.StudentCaseRepository,
	committeeRepo repositories.CommitteeRepository,
) StudentCaseUseCases {
	return &studentCaseUseCases{
		studentCaseRepo: studentCaseRepo,
		committeeRepo:   committeeRepo,
	}
}

func (uc *studentCaseUseCases) CreateStudentCase(ctx context.Context, req *dto.CreateStudentCaseRequest) (*dto.StudentCaseResponse, error) {
	// Validate committee exists
	committee, err := uc.committeeRepo.GetByID(ctx, req.CommitteeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get committee: %w", err)
	}
	if committee == nil {
		return nil, fmt.Errorf("committee not found")
	}

	// Convert detection criteria if provided
	var detectionCriteria entities.DetectionCriteria
	if req.DetectionCriteria != nil {
		detectionCriteria = entities.DetectionCriteria{
			AverageGrade:        req.DetectionCriteria.AverageGrade,
			DisciplinaryFaults:  req.DetectionCriteria.DisciplinaryFaults,
			AttendanceRate:      req.DetectionCriteria.AttendanceRate,
			LeadershipIndicator: req.DetectionCriteria.LeadershipIndicator,
			ComplianceRate:      req.DetectionCriteria.ComplianceRate,
			DaysOverdue:         req.DetectionCriteria.DaysOverdue,
		}
	}

	// Convert evidence documents
	var evidenceDocuments []entities.EvidenceDocument
	for _, doc := range req.EvidenceDocuments {
		evidenceDocuments = append(evidenceDocuments, entities.EvidenceDocument{
			URL:         doc.URL,
			Type:        doc.Type,
			Description: doc.Description,
			UploadedAt:  time.Now(),
		})
	}

	// Create student case entity
	studentCase := &entities.StudentCase{
		ID:                 uuid.New(),
		StudentID:          req.StudentID,
		CommitteeID:        req.CommitteeID,
		CaseType:           entities.CaseType(req.CaseType),
		CaseStatus:         entities.CaseStatusRegistrado,
		AutomaticDetection: req.AutomaticDetection,
		DetectionCriteria:  detectionCriteria,
		CaseDescription:    req.CaseDescription,
		EvidenceDocuments:  evidenceDocuments,
		InstructorComments: req.InstructorComments,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	// Save to repository
	if err := uc.studentCaseRepo.Create(ctx, studentCase); err != nil {
		return nil, fmt.Errorf("failed to create student case: %w", err)
	}

	return uc.toStudentCaseResponse(studentCase), nil
}

func (uc *studentCaseUseCases) GetStudentCaseByID(ctx context.Context, id uuid.UUID) (*dto.StudentCaseResponse, error) {
	studentCase, err := uc.studentCaseRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get student case: %w", err)
	}
	if studentCase == nil {
		return nil, fmt.Errorf("student case not found")
	}

	return uc.toStudentCaseResponse(studentCase), nil
}

func (uc *studentCaseUseCases) GetStudentCasesByStudentID(ctx context.Context, studentID uuid.UUID) ([]*dto.StudentCaseResponse, error) {
	cases, err := uc.studentCaseRepo.GetByStudentID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get student cases: %w", err)
	}

	responses := make([]*dto.StudentCaseResponse, len(cases))
	for i, studentCase := range cases {
		responses[i] = uc.toStudentCaseResponse(studentCase)
	}

	return responses, nil
}

func (uc *studentCaseUseCases) GetStudentCasesByCommitteeID(ctx context.Context, committeeID uuid.UUID) ([]*dto.StudentCaseResponse, error) {
	cases, err := uc.studentCaseRepo.GetByCommitteeID(ctx, committeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get student cases: %w", err)
	}

	responses := make([]*dto.StudentCaseResponse, len(cases))
	for i, studentCase := range cases {
		responses[i] = uc.toStudentCaseResponse(studentCase)
	}

	return responses, nil
}

func (uc *studentCaseUseCases) GetStudentCasesByStatus(ctx context.Context, status string) ([]*dto.StudentCaseResponse, error) {
	cases, err := uc.studentCaseRepo.GetByStatus(ctx, entities.CaseStatus(status))
	if err != nil {
		return nil, fmt.Errorf("failed to get student cases: %w", err)
	}

	responses := make([]*dto.StudentCaseResponse, len(cases))
	for i, studentCase := range cases {
		responses[i] = uc.toStudentCaseResponse(studentCase)
	}

	return responses, nil
}

func (uc *studentCaseUseCases) GetStudentCasesByType(ctx context.Context, caseType string) ([]*dto.StudentCaseResponse, error) {
	cases, err := uc.studentCaseRepo.GetByType(ctx, entities.CaseType(caseType))
	if err != nil {
		return nil, fmt.Errorf("failed to get student cases by type: %w", err)
	}

	responses := make([]*dto.StudentCaseResponse, len(cases))
	for i, studentCase := range cases {
		responses[i] = uc.toStudentCaseResponse(studentCase)
	}

	return responses, nil
}

func (uc *studentCaseUseCases) GetPendingStudentCases(ctx context.Context) ([]*dto.StudentCaseResponse, error) {
	cases, err := uc.studentCaseRepo.GetPendingCases(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get pending cases: %w", err)
	}

	responses := make([]*dto.StudentCaseResponse, len(cases))
	for i, studentCase := range cases {
		responses[i] = uc.toStudentCaseResponse(studentCase)
	}

	return responses, nil
}

func (uc *studentCaseUseCases) GetAutoDetectedCases(ctx context.Context) ([]*dto.StudentCaseResponse, error) {
	cases, err := uc.studentCaseRepo.GetAutoDetectedCases(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get auto-detected cases: %w", err)
	}

	responses := make([]*dto.StudentCaseResponse, len(cases))
	for i, studentCase := range cases {
		responses[i] = uc.toStudentCaseResponse(studentCase)
	}

	return responses, nil
}

func (uc *studentCaseUseCases) UpdateStudentCase(ctx context.Context, id uuid.UUID, req *dto.UpdateStudentCaseRequest) (*dto.StudentCaseResponse, error) {
	studentCase, err := uc.studentCaseRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get student case: %w", err)
	}
	if studentCase == nil {
		return nil, fmt.Errorf("student case not found")
	}

	// Update fields if provided
	if req.CaseStatus != "" {
		studentCase.CaseStatus = entities.CaseStatus(req.CaseStatus)
	}
	if req.CaseDescription != "" {
		studentCase.CaseDescription = req.CaseDescription
	}
	if req.InstructorComments != nil {
		studentCase.InstructorComments = req.InstructorComments
	}
	if len(req.EvidenceDocuments) > 0 {
		var evidenceDocuments []entities.EvidenceDocument
		for _, doc := range req.EvidenceDocuments {
			evidenceDocuments = append(evidenceDocuments, entities.EvidenceDocument{
				URL:         doc.URL,
				Type:        doc.Type,
				Description: doc.Description,
				UploadedAt:  time.Now(),
			})
		}
		studentCase.EvidenceDocuments = evidenceDocuments
	}

	studentCase.UpdatedAt = time.Now()

	if err := uc.studentCaseRepo.Update(ctx, studentCase); err != nil {
		return nil, fmt.Errorf("failed to update student case: %w", err)
	}

	return uc.toStudentCaseResponse(studentCase), nil
}

func (uc *studentCaseUseCases) DeleteStudentCase(ctx context.Context, id uuid.UUID) error {
	studentCase, err := uc.studentCaseRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get student case: %w", err)
	}
	if studentCase == nil {
		return fmt.Errorf("student case not found")
	}

	return uc.studentCaseRepo.Delete(ctx, id)
}

// Helper methods
func (uc *studentCaseUseCases) toStudentCaseResponse(studentCase *entities.StudentCase) *dto.StudentCaseResponse {
	// Convert detection criteria
	var detectionCriteria *dto.DetectionCriteriaDTO
	if studentCase.DetectionCriteria.AverageGrade > 0 || studentCase.DetectionCriteria.DisciplinaryFaults > 0 {
		detectionCriteria = &dto.DetectionCriteriaDTO{
			AverageGrade:        studentCase.DetectionCriteria.AverageGrade,
			DisciplinaryFaults:  studentCase.DetectionCriteria.DisciplinaryFaults,
			AttendanceRate:      studentCase.DetectionCriteria.AttendanceRate,
			LeadershipIndicator: studentCase.DetectionCriteria.LeadershipIndicator,
			ComplianceRate:      studentCase.DetectionCriteria.ComplianceRate,
			DaysOverdue:         studentCase.DetectionCriteria.DaysOverdue,
		}
	}

	// Convert evidence documents
	var evidenceDocuments []dto.EvidenceDocumentDTO
	for _, doc := range studentCase.EvidenceDocuments {
		evidenceDocuments = append(evidenceDocuments, dto.EvidenceDocumentDTO{
			URL:         doc.URL,
			Type:        doc.Type,
			Description: doc.Description,
			UploadedAt:  doc.UploadedAt,
		})
	}

	return &dto.StudentCaseResponse{
		ID:                 studentCase.ID,
		StudentID:          studentCase.StudentID,
		CommitteeID:        studentCase.CommitteeID,
		CaseType:           string(studentCase.CaseType),
		CaseStatus:         string(studentCase.CaseStatus),
		AutomaticDetection: studentCase.AutomaticDetection,
		DetectionCriteria:  detectionCriteria,
		CaseDescription:    studentCase.CaseDescription,
		EvidenceDocuments:  evidenceDocuments,
		InstructorComments: studentCase.InstructorComments,
		CreatedAt:          studentCase.CreatedAt,
		UpdatedAt:          studentCase.UpdatedAt,
	}
}

// Implementation of ImprovementPlan Use Cases
type improvementPlanUseCases struct {
	improvementPlanRepo repositories.ImprovementPlanRepository
	studentCaseRepo     repositories.StudentCaseRepository
}

func NewImprovementPlanUseCases(
	improvementPlanRepo repositories.ImprovementPlanRepository,
	studentCaseRepo repositories.StudentCaseRepository,
) ImprovementPlanUseCases {
	return &improvementPlanUseCases{
		improvementPlanRepo: improvementPlanRepo,
		studentCaseRepo:     studentCaseRepo,
	}
}

func (uc *improvementPlanUseCases) CreateImprovementPlan(ctx context.Context, req *dto.CreateImprovementPlanRequest) (*dto.ImprovementPlanResponse, error) {
	// Validate student case exists if provided
	if req.StudentCaseID != nil {
		studentCase, err := uc.studentCaseRepo.GetByID(ctx, *req.StudentCaseID)
		if err != nil {
			return nil, fmt.Errorf("failed to get student case: %w", err)
		}
		if studentCase == nil {
			return nil, fmt.Errorf("student case not found")
		}
	}

	// Convert objectives
	objectives := make([]entities.Objective, len(req.Objectives))
	for i, obj := range req.Objectives {
		objectives[i] = entities.Objective{
			ID:          uuid.New().String(),
			Description: obj.Description,
			Target:      obj.Target,
			Deadline:    obj.Deadline,
			Completed:   false,
		}
	}

	// Convert activities
	activities := make([]entities.Activity, len(req.Activities))
	for i, act := range req.Activities {
		activities[i] = entities.Activity{
			ID:          uuid.New().String(),
			Name:        act.Name,
			Description: act.Description,
			DueDate:     act.DueDate,
			Completed:   false,
		}
	}

	// Convert success criteria
	successCriteria := make([]entities.SuccessCriteria, len(req.SuccessCriteria))
	for i, sc := range req.SuccessCriteria {
		successCriteria[i] = entities.SuccessCriteria{
			ID:          uuid.New().String(),
			Description: sc.Description,
			Metric:      sc.Metric,
			Target:      sc.Target,
			Achieved:    false,
		}
	}

	plan := &entities.ImprovementPlan{
		ID:                      uuid.New(),
		StudentID:               req.StudentID,
		StudentCaseID:           req.StudentCaseID,
		PlanType:                entities.PlanType(req.PlanType),
		StartDate:               req.StartDate,
		EndDate:                 req.EndDate,
		Objectives:              objectives,
		Activities:              activities,
		SuccessCriteria:         successCriteria,
		ResponsibleInstructorID: req.ResponsibleInstructorID,
		CurrentStatus:           entities.PlanStatusActivo,
		CompliancePercentage:    0,
		CreatedAt:               time.Now(),
		UpdatedAt:               time.Now(),
	}

	if err := uc.improvementPlanRepo.Create(ctx, plan); err != nil {
		return nil, fmt.Errorf("failed to create improvement plan: %w", err)
	}

	return uc.toImprovementPlanResponse(plan), nil
}

func (uc *improvementPlanUseCases) GetImprovementPlanByID(ctx context.Context, id uuid.UUID) (*dto.ImprovementPlanResponse, error) {
	plan, err := uc.improvementPlanRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get improvement plan: %w", err)
	}
	if plan == nil {
		return nil, fmt.Errorf("improvement plan not found")
	}

	return uc.toImprovementPlanResponse(plan), nil
}

func (uc *improvementPlanUseCases) GetImprovementPlansByStudentCaseID(ctx context.Context, studentCaseID uuid.UUID) ([]*dto.ImprovementPlanResponse, error) {
	// Get plans by student case - use StudentID with the case's StudentID
	studentCase, err := uc.studentCaseRepo.GetByID(ctx, studentCaseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get student case: %w", err)
	}
	if studentCase == nil {
		return nil, fmt.Errorf("student case not found")
	}

	plans, err := uc.improvementPlanRepo.GetByStudentID(ctx, studentCase.StudentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get improvement plans: %w", err)
	}

	// Filter plans that match the studentCaseID
	var filteredPlans []*dto.ImprovementPlanResponse
	for _, plan := range plans {
		if plan.StudentCaseID != nil && *plan.StudentCaseID == studentCaseID {
			filteredPlans = append(filteredPlans, uc.toImprovementPlanResponse(plan))
		}
	}

	return filteredPlans, nil
}

func (uc *improvementPlanUseCases) GetImprovementPlansByStudentID(ctx context.Context, studentID uuid.UUID) ([]*dto.ImprovementPlanResponse, error) {
	plans, err := uc.improvementPlanRepo.GetByStudentID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get improvement plans: %w", err)
	}

	responses := make([]*dto.ImprovementPlanResponse, len(plans))
	for i, plan := range plans {
		responses[i] = uc.toImprovementPlanResponse(plan)
	}

	return responses, nil
}

func (uc *improvementPlanUseCases) GetImprovementPlansBySupervisorID(ctx context.Context, supervisorID uuid.UUID) ([]*dto.ImprovementPlanResponse, error) {
	plans, err := uc.improvementPlanRepo.GetByInstructor(ctx, supervisorID)
	if err != nil {
		return nil, fmt.Errorf("failed to get improvement plans: %w", err)
	}

	responses := make([]*dto.ImprovementPlanResponse, len(plans))
	for i, plan := range plans {
		responses[i] = uc.toImprovementPlanResponse(plan)
	}

	return responses, nil
}

func (uc *improvementPlanUseCases) UpdateImprovementPlan(ctx context.Context, id uuid.UUID, req *dto.UpdateImprovementPlanRequest) (*dto.ImprovementPlanResponse, error) {
	plan, err := uc.improvementPlanRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get improvement plan: %w", err)
	}
	if plan == nil {
		return nil, fmt.Errorf("improvement plan not found")
	}

	// Update status if provided
	if req.CurrentStatus != "" {
		plan.CurrentStatus = entities.PlanStatus(req.CurrentStatus)
	}

	// Update compliance percentage if provided
	if req.CompliancePercentage != nil {
		plan.CompliancePercentage = *req.CompliancePercentage
	}

	// Update final evaluation if provided
	if req.FinalEvaluation != nil {
		plan.FinalEvaluation = req.FinalEvaluation
	}

	// Update objectives if provided
	if len(req.Objectives) > 0 {
		objectives := make([]entities.Objective, len(req.Objectives))
		for i, obj := range req.Objectives {
			id := obj.ID
			if id == "" {
				id = uuid.New().String()
			}
			objectives[i] = entities.Objective{
				ID:          id,
				Description: obj.Description,
				Target:      obj.Target,
				Deadline:    obj.Deadline,
				Completed:   obj.Completed,
			}
		}
		plan.Objectives = objectives
	}

	// Update activities if provided
	if len(req.Activities) > 0 {
		activities := make([]entities.Activity, len(req.Activities))
		for i, act := range req.Activities {
			id := act.ID
			if id == "" {
				id = uuid.New().String()
			}
			activities[i] = entities.Activity{
				ID:          id,
				Name:        act.Name,
				Description: act.Description,
				DueDate:     act.DueDate,
				Completed:   act.Completed,
				CompletedAt: act.CompletedAt,
			}
		}
		plan.Activities = activities
	}

	// Update success criteria if provided
	if len(req.SuccessCriteria) > 0 {
		successCriteria := make([]entities.SuccessCriteria, len(req.SuccessCriteria))
		for i, sc := range req.SuccessCriteria {
			id := sc.ID
			if id == "" {
				id = uuid.New().String()
			}
			successCriteria[i] = entities.SuccessCriteria{
				ID:          id,
				Description: sc.Description,
				Metric:      sc.Metric,
				Target:      sc.Target,
				Achieved:    sc.Achieved,
			}
		}
		plan.SuccessCriteria = successCriteria
	}

	plan.UpdatedAt = time.Now()

	if err := uc.improvementPlanRepo.Update(ctx, plan); err != nil {
		return nil, fmt.Errorf("failed to update improvement plan: %w", err)
	}

	return uc.toImprovementPlanResponse(plan), nil
}

func (uc *improvementPlanUseCases) DeleteImprovementPlan(ctx context.Context, id uuid.UUID) error {
	plan, err := uc.improvementPlanRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get improvement plan: %w", err)
	}
	if plan == nil {
		return fmt.Errorf("improvement plan not found")
	}

	return uc.improvementPlanRepo.Delete(ctx, id)
}

func (uc *improvementPlanUseCases) UpdateProgress(ctx context.Context, id uuid.UUID, progress int, notes string) error {
	plan, err := uc.improvementPlanRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get improvement plan: %w", err)
	}
	if plan == nil {
		return fmt.Errorf("improvement plan not found")
	}

	if progress < 0 || progress > 100 {
		return fmt.Errorf("progress must be between 0 and 100")
	}

	plan.CompliancePercentage = int16(progress)
	if notes != "" {
		plan.FinalEvaluation = &notes
	}
	plan.UpdatedAt = time.Now()

	// Update status based on progress
	if progress == 100 {
		plan.CurrentStatus = entities.PlanStatusCompletado
	}

	return uc.improvementPlanRepo.Update(ctx, plan)
}

func (uc *improvementPlanUseCases) toImprovementPlanResponse(plan *entities.ImprovementPlan) *dto.ImprovementPlanResponse {
	// Convert objectives
	objectives := make([]dto.ObjectiveDTO, len(plan.Objectives))
	for i, obj := range plan.Objectives {
		objectives[i] = dto.ObjectiveDTO{
			ID:          obj.ID,
			Description: obj.Description,
			Target:      obj.Target,
			Deadline:    obj.Deadline,
			Completed:   obj.Completed,
		}
	}

	// Convert activities
	activities := make([]dto.ActivityDTO, len(plan.Activities))
	for i, act := range plan.Activities {
		activities[i] = dto.ActivityDTO{
			ID:          act.ID,
			Name:        act.Name,
			Description: act.Description,
			DueDate:     act.DueDate,
			Completed:   act.Completed,
			CompletedAt: act.CompletedAt,
		}
	}

	// Convert success criteria
	successCriteria := make([]dto.SuccessCriteriaDTO, len(plan.SuccessCriteria))
	for i, sc := range plan.SuccessCriteria {
		successCriteria[i] = dto.SuccessCriteriaDTO{
			ID:          sc.ID,
			Description: sc.Description,
			Metric:      sc.Metric,
			Target:      sc.Target,
			Achieved:    sc.Achieved,
		}
	}

	return &dto.ImprovementPlanResponse{
		ID:                      plan.ID,
		StudentID:               plan.StudentID,
		StudentCaseID:           plan.StudentCaseID,
		PlanType:                string(plan.PlanType),
		StartDate:               plan.StartDate,
		EndDate:                 plan.EndDate,
		Objectives:              objectives,
		Activities:              activities,
		SuccessCriteria:         successCriteria,
		ResponsibleInstructorID: plan.ResponsibleInstructorID,
		CurrentStatus:           string(plan.CurrentStatus),
		CompliancePercentage:    float64(plan.CompliancePercentage),
		FinalEvaluation:         plan.FinalEvaluation,
		CreatedAt:               plan.CreatedAt,
		UpdatedAt:               plan.UpdatedAt,
	}
}

// Implementation of Sanction Use Cases
type sanctionUseCases struct {
	sanctionRepo    repositories.SanctionRepository
	studentCaseRepo repositories.StudentCaseRepository
}

func NewSanctionUseCases(
	sanctionRepo repositories.SanctionRepository,
	studentCaseRepo repositories.StudentCaseRepository,
) SanctionUseCases {
	return &sanctionUseCases{
		sanctionRepo:    sanctionRepo,
		studentCaseRepo: studentCaseRepo,
	}
}

func (uc *sanctionUseCases) CreateSanction(ctx context.Context, req *dto.CreateSanctionRequest) (*dto.SanctionResponse, error) {
	// Validate student case exists
	studentCase, err := uc.studentCaseRepo.GetByID(ctx, req.StudentCaseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get student case: %w", err)
	}
	if studentCase == nil {
		return nil, fmt.Errorf("student case not found")
	}

	sanction := &entities.Sanction{
		ID:                 uuid.New(),
		StudentID:          req.StudentID,
		StudentCaseID:      req.StudentCaseID,
		SanctionType:       entities.SanctionType(req.SanctionType),
		SeverityLevel:      entities.SeverityLevel(req.SeverityLevel),
		Description:        req.Description,
		StartDate:          req.StartDate,
		EndDate:            req.EndDate,
		ComplianceRequired: req.ComplianceRequired,
		ComplianceStatus:   entities.ComplianceStatusPendiente,
		Appealed:           false,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if err := uc.sanctionRepo.Create(ctx, sanction); err != nil {
		return nil, fmt.Errorf("failed to create sanction: %w", err)
	}

	return uc.toSanctionResponse(sanction), nil
}

func (uc *sanctionUseCases) GetSanctionByID(ctx context.Context, id uuid.UUID) (*dto.SanctionResponse, error) {
	sanction, err := uc.sanctionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get sanction: %w", err)
	}
	if sanction == nil {
		return nil, fmt.Errorf("sanction not found")
	}

	return uc.toSanctionResponse(sanction), nil
}

func (uc *sanctionUseCases) GetSanctionsByStudentID(ctx context.Context, studentID uuid.UUID) ([]*dto.SanctionResponse, error) {
	sanctions, err := uc.sanctionRepo.GetByStudentID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get sanctions: %w", err)
	}

	responses := make([]*dto.SanctionResponse, len(sanctions))
	for i, sanction := range sanctions {
		responses[i] = uc.toSanctionResponse(sanction)
	}

	return responses, nil
}

func (uc *sanctionUseCases) GetSanctionsByType(ctx context.Context, sanctionType string) ([]*dto.SanctionResponse, error) {
	sanctions, err := uc.sanctionRepo.GetByType(ctx, entities.SanctionType(sanctionType))
	if err != nil {
		return nil, fmt.Errorf("failed to get sanctions: %w", err)
	}

	responses := make([]*dto.SanctionResponse, len(sanctions))
	for i, sanction := range sanctions {
		responses[i] = uc.toSanctionResponse(sanction)
	}

	return responses, nil
}

func (uc *sanctionUseCases) GetActiveSanctions(ctx context.Context) ([]*dto.SanctionResponse, error) {
	sanctions, err := uc.sanctionRepo.GetActiveSanctions(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active sanctions: %w", err)
	}

	responses := make([]*dto.SanctionResponse, len(sanctions))
	for i, sanction := range sanctions {
		responses[i] = uc.toSanctionResponse(sanction)
	}

	return responses, nil
}

func (uc *sanctionUseCases) GetAppealableSanctions(ctx context.Context) ([]*dto.SanctionResponse, error) {
	sanctions, err := uc.sanctionRepo.GetAppealableSanctions(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get appealable sanctions: %w", err)
	}

	responses := make([]*dto.SanctionResponse, len(sanctions))
	for i, sanction := range sanctions {
		responses[i] = uc.toSanctionResponse(sanction)
	}

	return responses, nil
}

func (uc *sanctionUseCases) UpdateSanction(ctx context.Context, id uuid.UUID, req *dto.UpdateSanctionRequest) (*dto.SanctionResponse, error) {
	sanction, err := uc.sanctionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get sanction: %w", err)
	}
	if sanction == nil {
		return nil, fmt.Errorf("sanction not found")
	}

	// Update fields if provided
	if req.ComplianceStatus != "" {
		sanction.ComplianceStatus = entities.ComplianceStatus(req.ComplianceStatus)
	}
	if req.EndDate != nil {
		sanction.EndDate = req.EndDate
	}

	sanction.UpdatedAt = time.Now()

	if err := uc.sanctionRepo.Update(ctx, sanction); err != nil {
		return nil, fmt.Errorf("failed to update sanction: %w", err)
	}

	return uc.toSanctionResponse(sanction), nil
}

func (uc *sanctionUseCases) DeleteSanction(ctx context.Context, id uuid.UUID) error {
	sanction, err := uc.sanctionRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get sanction: %w", err)
	}
	if sanction == nil {
		return fmt.Errorf("sanction not found")
	}

	return uc.sanctionRepo.Delete(ctx, id)
}

func (uc *sanctionUseCases) MarkAsAppealed(ctx context.Context, id uuid.UUID) error {
	sanction, err := uc.sanctionRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get sanction: %w", err)
	}
	if sanction == nil {
		return fmt.Errorf("sanction not found")
	}

	sanction.MarkAsAppealed()
	sanction.UpdatedAt = time.Now()

	return uc.sanctionRepo.Update(ctx, sanction)
}

func (uc *sanctionUseCases) UpdateComplianceStatus(ctx context.Context, id uuid.UUID, status string) error {
	sanction, err := uc.sanctionRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get sanction: %w", err)
	}
	if sanction == nil {
		return fmt.Errorf("sanction not found")
	}

	sanction.ComplianceStatus = entities.ComplianceStatus(status)
	sanction.UpdatedAt = time.Now()

	return uc.sanctionRepo.Update(ctx, sanction)
}

func (uc *sanctionUseCases) SetAppealResult(ctx context.Context, id uuid.UUID, result string) error {
	sanction, err := uc.sanctionRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get sanction: %w", err)
	}
	if sanction == nil {
		return fmt.Errorf("sanction not found")
	}

	sanction.SetAppealResult(entities.AppealResult(result))
	sanction.UpdatedAt = time.Now()

	return uc.sanctionRepo.Update(ctx, sanction)
}

func (uc *sanctionUseCases) toSanctionResponse(sanction *entities.Sanction) *dto.SanctionResponse {
	var appealResult *string
	if sanction.AppealResult != nil {
		r := string(*sanction.AppealResult)
		appealResult = &r
	}

	return &dto.SanctionResponse{
		ID:                 sanction.ID,
		StudentID:          sanction.StudentID,
		StudentCaseID:      sanction.StudentCaseID,
		SanctionType:       string(sanction.SanctionType),
		SeverityLevel:      string(sanction.SeverityLevel),
		Description:        sanction.Description,
		StartDate:          sanction.StartDate,
		EndDate:            sanction.EndDate,
		ComplianceRequired: sanction.ComplianceRequired,
		ComplianceStatus:   string(sanction.ComplianceStatus),
		AppealDeadline:     sanction.AppealDeadline,
		Appealed:           sanction.Appealed,
		AppealResult:       appealResult,
		IsActive:           sanction.IsActive(),
		IsAppealable:       sanction.IsAppealable(),
		DurationDays:       sanction.GetDurationDays(),
		CreatedAt:          sanction.CreatedAt,
		UpdatedAt:          sanction.UpdatedAt,
	}
}

// Implementation of Appeal Use Cases - Aligned with SENA Agreement 009/2024
type appealUseCases struct {
	appealRepo   repositories.AppealRepository
	sanctionRepo repositories.SanctionRepository
}

func NewAppealUseCases(
	appealRepo repositories.AppealRepository,
	sanctionRepo repositories.SanctionRepository,
) AppealUseCases {
	return &appealUseCases{
		appealRepo:   appealRepo,
		sanctionRepo: sanctionRepo,
	}
}

func (uc *appealUseCases) CreateAppeal(ctx context.Context, req *dto.CreateAppealRequest) (*dto.AppealResponse, error) {
	// Validate sanction exists and is appealable
	sanction, err := uc.sanctionRepo.GetByID(ctx, req.SanctionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get sanction: %w", err)
	}
	if sanction == nil {
		return nil, fmt.Errorf("sanction not found")
	}
	if !sanction.IsAppealable() {
		return nil, fmt.Errorf("sanction is not appealable")
	}

	// Convert supporting documents
	supportingDocs := make([]entities.SupportingDocument, len(req.SupportingDocuments))
	for i, doc := range req.SupportingDocuments {
		supportingDocs[i] = entities.SupportingDocument{
			URL:         doc.URL,
			Type:        doc.Type,
			Description: doc.Description,
			UploadedAt:  time.Now(),
		}
	}

	appeal := &entities.Appeal{
		ID:                  uuid.New(),
		SanctionID:          req.SanctionID,
		StudentID:           req.StudentID,
		SubmissionDate:      time.Now(),
		DeadlineDate:        *sanction.AppealDeadline,
		AppealGrounds:       req.AppealGrounds,
		SupportingDocuments: supportingDocs,
		AdmissibilityStatus: entities.AdmissibilityStatusPendiente,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	if err := uc.appealRepo.Create(ctx, appeal); err != nil {
		return nil, fmt.Errorf("failed to create appeal: %w", err)
	}

	// Mark sanction as appealed
	sanction.MarkAsAppealed()
	if err := uc.sanctionRepo.Update(ctx, sanction); err != nil {
		return nil, fmt.Errorf("failed to mark sanction as appealed: %w", err)
	}

	return uc.toAppealResponse(appeal), nil
}

func (uc *appealUseCases) GetAppealByID(ctx context.Context, id uuid.UUID) (*dto.AppealResponse, error) {
	appeal, err := uc.appealRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get appeal: %w", err)
	}
	if appeal == nil {
		return nil, fmt.Errorf("appeal not found")
	}

	return uc.toAppealResponse(appeal), nil
}

func (uc *appealUseCases) GetAppealsBySanctionID(ctx context.Context, sanctionID uuid.UUID) ([]*dto.AppealResponse, error) {
	appeals, err := uc.appealRepo.GetBySanctionID(ctx, sanctionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get appeals: %w", err)
	}

	responses := make([]*dto.AppealResponse, len(appeals))
	for i, appeal := range appeals {
		responses[i] = uc.toAppealResponse(appeal)
	}

	return responses, nil
}

func (uc *appealUseCases) GetAppealsByStudentID(ctx context.Context, studentID uuid.UUID) ([]*dto.AppealResponse, error) {
	appeals, err := uc.appealRepo.GetByStudentID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get appeals: %w", err)
	}

	responses := make([]*dto.AppealResponse, len(appeals))
	for i, appeal := range appeals {
		responses[i] = uc.toAppealResponse(appeal)
	}

	return responses, nil
}

func (uc *appealUseCases) GetPendingAppeals(ctx context.Context) ([]*dto.AppealResponse, error) {
	appeals, err := uc.appealRepo.GetPendingAppeals(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get pending appeals: %w", err)
	}

	responses := make([]*dto.AppealResponse, len(appeals))
	for i, appeal := range appeals {
		responses[i] = uc.toAppealResponse(appeal)
	}

	return responses, nil
}

func (uc *appealUseCases) GetAdmittedAppeals(ctx context.Context) ([]*dto.AppealResponse, error) {
	appeals, err := uc.appealRepo.GetAdmittedAppeals(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get admitted appeals: %w", err)
	}

	responses := make([]*dto.AppealResponse, len(appeals))
	for i, appeal := range appeals {
		responses[i] = uc.toAppealResponse(appeal)
	}

	return responses, nil
}

func (uc *appealUseCases) UpdateAppeal(ctx context.Context, id uuid.UUID, req *dto.UpdateAppealRequest) (*dto.AppealResponse, error) {
	appeal, err := uc.appealRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get appeal: %w", err)
	}
	if appeal == nil {
		return nil, fmt.Errorf("appeal not found")
	}

	// Update admissibility status if provided
	if req.AdmissibilityStatus != "" {
		appeal.AdmissibilityStatus = entities.AdmissibilityStatus(req.AdmissibilityStatus)
	}
	if req.AdmissibilityRationale != "" {
		appeal.AdmissibilityRationale = &req.AdmissibilityRationale
	}
	if req.SecondInstanceCommitteeID != nil {
		appeal.SecondInstanceCommitteeID = req.SecondInstanceCommitteeID
	}
	if req.FinalDecision != "" {
		decision := entities.FinalDecision(req.FinalDecision)
		appeal.FinalDecision = &decision
	}
	if req.FinalRationale != "" {
		appeal.FinalRationale = &req.FinalRationale
	}

	appeal.UpdatedAt = time.Now()

	if err := uc.appealRepo.Update(ctx, appeal); err != nil {
		return nil, fmt.Errorf("failed to update appeal: %w", err)
	}

	return uc.toAppealResponse(appeal), nil
}

func (uc *appealUseCases) DeleteAppeal(ctx context.Context, id uuid.UUID) error {
	appeal, err := uc.appealRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get appeal: %w", err)
	}
	if appeal == nil {
		return fmt.Errorf("appeal not found")
	}

	return uc.appealRepo.Delete(ctx, id)
}

func (uc *appealUseCases) AdmitAppeal(ctx context.Context, id uuid.UUID, rationale string) error {
	appeal, err := uc.appealRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get appeal: %w", err)
	}
	if appeal == nil {
		return fmt.Errorf("appeal not found")
	}

	appeal.Admitir(rationale)
	appeal.UpdatedAt = time.Now()

	return uc.appealRepo.Update(ctx, appeal)
}

func (uc *appealUseCases) RejectAppeal(ctx context.Context, id uuid.UUID, rationale string) error {
	appeal, err := uc.appealRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get appeal: %w", err)
	}
	if appeal == nil {
		return fmt.Errorf("appeal not found")
	}

	appeal.Rechazar(rationale)
	appeal.UpdatedAt = time.Now()

	return uc.appealRepo.Update(ctx, appeal)
}

func (uc *appealUseCases) SetFinalDecision(ctx context.Context, id uuid.UUID, decision string, rationale string) error {
	appeal, err := uc.appealRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get appeal: %w", err)
	}
	if appeal == nil {
		return fmt.Errorf("appeal not found")
	}

	appeal.SetFinalDecision(entities.FinalDecision(decision), rationale)
	appeal.UpdatedAt = time.Now()

	// Update related sanction with appeal result
	sanction, err := uc.sanctionRepo.GetByID(ctx, appeal.SanctionID)
	if err == nil && sanction != nil {
		sanction.SetAppealResult(entities.AppealResult(decision))
		uc.sanctionRepo.Update(ctx, sanction)
	}

	return uc.appealRepo.Update(ctx, appeal)
}

func (uc *appealUseCases) toAppealResponse(appeal *entities.Appeal) *dto.AppealResponse {
	// Convert supporting documents to DTOs
	supportingDocs := make([]dto.SupportingDocumentDTO, len(appeal.SupportingDocuments))
	for i, doc := range appeal.SupportingDocuments {
		supportingDocs[i] = dto.SupportingDocumentDTO{
			URL:         doc.URL,
			Type:        doc.Type,
			Description: doc.Description,
			UploadedAt:  doc.UploadedAt,
		}
	}

	var finalDecision *string
	if appeal.FinalDecision != nil {
		d := string(*appeal.FinalDecision)
		finalDecision = &d
	}

	return &dto.AppealResponse{
		ID:                        appeal.ID,
		SanctionID:                appeal.SanctionID,
		StudentID:                 appeal.StudentID,
		SubmissionDate:            appeal.SubmissionDate,
		DeadlineDate:              appeal.DeadlineDate,
		AppealGrounds:             appeal.AppealGrounds,
		SupportingDocuments:       supportingDocs,
		AdmissibilityStatus:       string(appeal.AdmissibilityStatus),
		AdmissibilityRationale:    appeal.AdmissibilityRationale,
		SecondInstanceCommitteeID: appeal.SecondInstanceCommitteeID,
		FinalDecision:             finalDecision,
		FinalRationale:            appeal.FinalRationale,
		IsWithinDeadline:          appeal.IsWithinDeadline(),
		IsAdmitted:                appeal.IsAdmitida(),
		HasFinalDecision:          appeal.HasFinalDecision(),
		IsSuccessful:              appeal.IsExitosa(),
		CreatedAt:                 appeal.CreatedAt,
		UpdatedAt:                 appeal.UpdatedAt,
	}
}
