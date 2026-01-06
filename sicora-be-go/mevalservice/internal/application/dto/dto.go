package dto

import (
	"time"

	"github.com/google/uuid"
)

// Committee DTOs - Aligned with SENA Agreement 009/2024
type CreateCommitteeRequest struct {
	CommitteeDate  time.Time  `json:"committee_date" validate:"required"`
	CommitteeType  string     `json:"committee_type" validate:"required,oneof=MONTHLY EXTRAORDINARY APPEALS SPECIAL"`
	ProgramID      *uuid.UUID `json:"program_id,omitempty"`
	AcademicPeriod string     `json:"academic_period" validate:"required,min=3,max=20"`
}

type UpdateCommitteeRequest struct {
	CommitteeDate  *time.Time `json:"committee_date,omitempty"`
	Status         string     `json:"status,omitempty" validate:"omitempty,oneof=SCHEDULED IN_SESSION COMPLETED CANCELLED POSTPONED"`
	AcademicPeriod string     `json:"academic_period,omitempty" validate:"omitempty,min=3,max=20"`
	SessionMinutes *string    `json:"session_minutes,omitempty"`
}

type CommitteeResponse struct {
	ID              uuid.UUID                 `json:"id"`
	CommitteeDate   time.Time                 `json:"committee_date"`
	CommitteeType   string                    `json:"committee_type"`
	Status          string                    `json:"status"`
	ProgramID       *uuid.UUID                `json:"program_id,omitempty"`
	AcademicPeriod  string                    `json:"academic_period"`
	AgendaGenerated bool                      `json:"agenda_generated"`
	QuorumAchieved  bool                      `json:"quorum_achieved"`
	SessionMinutes  *string                   `json:"session_minutes,omitempty"`
	Members         []CommitteeMemberResponse `json:"members,omitempty"`
	CreatedAt       time.Time                 `json:"created_at"`
	UpdatedAt       time.Time                 `json:"updated_at"`
}

// Committee Member DTOs - Aligned with SENA Agreement 009/2024
type CreateCommitteeMemberRequest struct {
	CommitteeID uuid.UUID `json:"committee_id" validate:"required"`
	UserID      uuid.UUID `json:"user_id" validate:"required"`
	MemberRole  string    `json:"member_role" validate:"required,oneof=COORDINATOR INSTRUCTOR REPRESENTATIVE SECRETARY PRESIDENT"`
	VotePower   int       `json:"vote_power,omitempty" validate:"omitempty,min=0,max=3"`
}

type UpdateCommitteeMemberRequest struct {
	MemberRole string `json:"member_role,omitempty" validate:"omitempty,oneof=COORDINATOR INSTRUCTOR REPRESENTATIVE SECRETARY PRESIDENT"`
	IsPresent  *bool  `json:"is_present,omitempty"`
	VotePower  *int   `json:"vote_power,omitempty" validate:"omitempty,min=0,max=3"`
}

type CommitteeMemberResponse struct {
	ID          uuid.UUID `json:"id"`
	CommitteeID uuid.UUID `json:"committee_id"`
	UserID      uuid.UUID `json:"user_id"`
	MemberRole  string    `json:"member_role"`
	IsPresent   bool      `json:"is_present"`
	VotePower   int       `json:"vote_power"`
	CreatedAt   time.Time `json:"created_at"`
}

// Student Case DTOs - Aligned with SENA Agreement 009/2024
type CreateStudentCaseRequest struct {
	StudentID          uuid.UUID             `json:"student_id" validate:"required"`
	CommitteeID        uuid.UUID             `json:"committee_id" validate:"required"`
	CaseType           string                `json:"case_type" validate:"required,oneof=RECOGNITION IMPROVEMENT_PLAN SANCTION APPEAL FOLLOW_UP"`
	AutomaticDetection bool                  `json:"automatic_detection"`
	DetectionCriteria  *DetectionCriteriaDTO `json:"detection_criteria,omitempty"`
	CaseDescription    string                `json:"case_description" validate:"required,min=10"`
	EvidenceDocuments  []EvidenceDocumentDTO `json:"evidence_documents,omitempty"`
	InstructorComments *string               `json:"instructor_comments,omitempty"`
}

type DetectionCriteriaDTO struct {
	AverageGrade        float64 `json:"average_grade,omitempty"`
	DisciplinaryFaults  int     `json:"disciplinary_faults,omitempty"`
	AttendanceRate      float64 `json:"attendance_rate,omitempty"`
	LeadershipIndicator bool    `json:"leadership_indicator,omitempty"`
	ComplianceRate      float64 `json:"compliance_rate,omitempty"`
	DaysOverdue         int     `json:"days_overdue,omitempty"`
}

type EvidenceDocumentDTO struct {
	URL         string    `json:"url"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	UploadedAt  time.Time `json:"uploaded_at,omitempty"`
}

type UpdateStudentCaseRequest struct {
	CaseStatus         string                `json:"case_status,omitempty" validate:"omitempty,oneof=DETECTED PENDING IN_REVIEW RESOLVED"`
	CaseDescription    string                `json:"case_description,omitempty" validate:"omitempty,min=10"`
	InstructorComments *string               `json:"instructor_comments,omitempty"`
	EvidenceDocuments  []EvidenceDocumentDTO `json:"evidence_documents,omitempty"`
}

type StudentCaseResponse struct {
	ID                 uuid.UUID                   `json:"id"`
	StudentID          uuid.UUID                   `json:"student_id"`
	CommitteeID        uuid.UUID                   `json:"committee_id"`
	CaseType           string                      `json:"case_type"`
	CaseStatus         string                      `json:"case_status"`
	AutomaticDetection bool                        `json:"automatic_detection"`
	DetectionCriteria  *DetectionCriteriaDTO       `json:"detection_criteria,omitempty"`
	CaseDescription    string                      `json:"case_description"`
	EvidenceDocuments  []EvidenceDocumentDTO       `json:"evidence_documents,omitempty"`
	InstructorComments *string                     `json:"instructor_comments,omitempty"`
	Committee          *CommitteeResponse          `json:"committee,omitempty"`
	ImprovementPlans   []ImprovementPlanResponse   `json:"improvement_plans,omitempty"`
	Sanctions          []SanctionResponse          `json:"sanctions,omitempty"`
	Decisions          []CommitteeDecisionResponse `json:"decisions,omitempty"`
	CreatedAt          time.Time                   `json:"created_at"`
	UpdatedAt          time.Time                   `json:"updated_at"`
}

// Improvement Plan DTOs - Aligned with SENA Agreement 009/2024

// ObjectiveDTO represents a specific objective in the improvement plan
type ObjectiveDTO struct {
	ID          string    `json:"id,omitempty"`
	Description string    `json:"description" validate:"required,min=10"`
	Target      string    `json:"target" validate:"required"`
	Deadline    time.Time `json:"deadline" validate:"required"`
	Completed   bool      `json:"completed,omitempty"`
}

// ActivityDTO represents an activity to be completed
type ActivityDTO struct {
	ID          string     `json:"id,omitempty"`
	Name        string     `json:"name" validate:"required,min=3,max=100"`
	Description string     `json:"description" validate:"required,min=10"`
	DueDate     time.Time  `json:"due_date" validate:"required"`
	Completed   bool       `json:"completed,omitempty"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

// SuccessCriteriaDTO represents criteria for success
type SuccessCriteriaDTO struct {
	ID          string  `json:"id,omitempty"`
	Description string  `json:"description" validate:"required,min=10"`
	Metric      string  `json:"metric" validate:"required"`
	Target      float64 `json:"target" validate:"required"`
	Achieved    bool    `json:"achieved,omitempty"`
}

type CreateImprovementPlanRequest struct {
	StudentID               uuid.UUID            `json:"student_id" validate:"required"`
	StudentCaseID           *uuid.UUID           `json:"student_case_id,omitempty"`
	PlanType                string               `json:"plan_type" validate:"required,oneof=ACADEMIC DISCIPLINARY MIXED"`
	StartDate               time.Time            `json:"start_date" validate:"required"`
	EndDate                 time.Time            `json:"end_date" validate:"required"`
	Objectives              []ObjectiveDTO       `json:"objectives" validate:"required,min=1"`
	Activities              []ActivityDTO        `json:"activities" validate:"required,min=1"`
	SuccessCriteria         []SuccessCriteriaDTO `json:"success_criteria" validate:"required,min=1"`
	ResponsibleInstructorID *uuid.UUID           `json:"responsible_instructor_id,omitempty"`
}

type UpdateImprovementPlanRequest struct {
	CurrentStatus        string               `json:"current_status,omitempty" validate:"omitempty,oneof=ACTIVE COMPLETED FAILED EXTENDED"`
	CompliancePercentage *float64             `json:"compliance_percentage,omitempty" validate:"omitempty,min=0,max=100"`
	FinalEvaluation      *string              `json:"final_evaluation,omitempty"`
	Objectives           []ObjectiveDTO       `json:"objectives,omitempty"`
	Activities           []ActivityDTO        `json:"activities,omitempty"`
	SuccessCriteria      []SuccessCriteriaDTO `json:"success_criteria,omitempty"`
}

type ImprovementPlanResponse struct {
	ID                      uuid.UUID            `json:"id"`
	StudentID               uuid.UUID            `json:"student_id"`
	StudentCaseID           *uuid.UUID           `json:"student_case_id,omitempty"`
	PlanType                string               `json:"plan_type"`
	StartDate               time.Time            `json:"start_date"`
	EndDate                 time.Time            `json:"end_date"`
	Objectives              []ObjectiveDTO       `json:"objectives"`
	Activities              []ActivityDTO        `json:"activities"`
	SuccessCriteria         []SuccessCriteriaDTO `json:"success_criteria"`
	ResponsibleInstructorID *uuid.UUID           `json:"responsible_instructor_id,omitempty"`
	CurrentStatus           string               `json:"current_status"`
	CompliancePercentage    float64              `json:"compliance_percentage"`
	FinalEvaluation         *string              `json:"final_evaluation,omitempty"`
	CreatedAt               time.Time            `json:"created_at"`
	UpdatedAt               time.Time            `json:"updated_at"`
}

// Sanction DTOs - Aligned with SENA Agreement 009/2024
type CreateSanctionRequest struct {
	StudentID          uuid.UUID  `json:"student_id" validate:"required"`
	StudentCaseID      uuid.UUID  `json:"student_case_id" validate:"required"`
	SanctionType       string     `json:"sanction_type" validate:"required,oneof=VERBAL_WARNING WRITTEN_WARNING ACADEMIC_COMMITMENT IMPROVEMENT_PLAN CONDITIONAL_ENROLLMENT TEMPORARY_SUSPENSION DEFINITIVE_CANCELLATION"`
	SeverityLevel      int        `json:"severity_level" validate:"required,min=1,max=7"`
	Description        string     `json:"description" validate:"required,min=10"`
	StartDate          time.Time  `json:"start_date" validate:"required"`
	EndDate            *time.Time `json:"end_date,omitempty"`
	ComplianceRequired bool       `json:"compliance_required"`
}

type UpdateSanctionRequest struct {
	ComplianceStatus string     `json:"compliance_status,omitempty" validate:"omitempty,oneof=PENDING IN_PROGRESS COMPLETED VIOLATED"`
	EndDate          *time.Time `json:"end_date,omitempty"`
}

type SanctionResponse struct {
	ID                  uuid.UUID  `json:"id"`
	StudentID           uuid.UUID  `json:"student_id"`
	StudentCaseID       uuid.UUID  `json:"student_case_id"`
	SanctionType        string     `json:"sanction_type"`
	SeverityLevel       int        `json:"severity_level"`
	SeverityDescription string     `json:"severity_description"`
	Description         string     `json:"description"`
	StartDate           time.Time  `json:"start_date"`
	EndDate             *time.Time `json:"end_date,omitempty"`
	ComplianceRequired  bool       `json:"compliance_required"`
	ComplianceStatus    string     `json:"compliance_status"`
	AppealDeadline      *time.Time `json:"appeal_deadline,omitempty"`
	Appealed            bool       `json:"appealed"`
	AppealResult        *string    `json:"appeal_result,omitempty"`
	IsActive            bool       `json:"is_active"`
	IsAppealable        bool       `json:"is_appealable"`
	DurationDays        int        `json:"duration_days"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// Committee Decision DTOs
type CreateCommitteeDecisionRequest struct {
	CommitteeID   uuid.UUID  `json:"committee_id" validate:"required"`
	StudentCaseID *uuid.UUID `json:"student_case_id,omitempty"`
	Type          string     `json:"type" validate:"required,oneof=CASE_RESOLUTION SANCTION_APPROVAL APPEAL_RESOLUTION POLICY_DECISION"`
	Title         string     `json:"title" validate:"required,min=5,max=200"`
	Description   string     `json:"description" validate:"required,min=10"`
	Resolution    string     `json:"resolution" validate:"required,min=10"`
	Justification string     `json:"justification" validate:"required,min=10"`
	VotingResult  string     `json:"voting_result,omitempty"`
	AttendeesList string     `json:"attendees_list,omitempty"`
	DecisionDate  time.Time  `json:"decision_date" validate:"required"`
}

type UpdateCommitteeDecisionRequest struct {
	Status             string     `json:"status,omitempty" validate:"omitempty,oneof=DRAFT APPROVED EXECUTED APPEALED"`
	ExecutionDate      *time.Time `json:"execution_date,omitempty"`
	PresidentSignature bool       `json:"president_signature,omitempty"`
	SecretarySignature bool       `json:"secretary_signature,omitempty"`
}

type CommitteeDecisionResponse struct {
	ID                 uuid.UUID  `json:"id"`
	CommitteeID        uuid.UUID  `json:"committee_id"`
	StudentCaseID      *uuid.UUID `json:"student_case_id,omitempty"`
	DecisionNumber     string     `json:"decision_number"`
	Type               string     `json:"type"`
	Title              string     `json:"title"`
	Description        string     `json:"description"`
	Resolution         string     `json:"resolution"`
	Justification      string     `json:"justification"`
	VotingResult       string     `json:"voting_result"`
	AttendeesList      string     `json:"attendees_list"`
	Status             string     `json:"status"`
	DecisionDate       time.Time  `json:"decision_date"`
	ExecutionDate      *time.Time `json:"execution_date,omitempty"`
	PresidentSignature bool       `json:"president_signature"`
	SecretarySignature bool       `json:"secretary_signature"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

// Appeal DTOs - Aligned with SENA Agreement 009/2024
type SupportingDocumentDTO struct {
	URL         string    `json:"url" validate:"required,url"`
	Type        string    `json:"type" validate:"required"`
	Description string    `json:"description"`
	UploadedAt  time.Time `json:"uploaded_at,omitempty"`
}

type CreateAppealRequest struct {
	SanctionID          uuid.UUID               `json:"sanction_id" validate:"required"`
	StudentID           uuid.UUID               `json:"student_id" validate:"required"`
	AppealGrounds       string                  `json:"appeal_grounds" validate:"required,min=50"`
	SupportingDocuments []SupportingDocumentDTO `json:"supporting_documents,omitempty"`
}

type UpdateAppealRequest struct {
	AdmissibilityStatus       string     `json:"admissibility_status,omitempty" validate:"omitempty,oneof=PENDING ADMITTED REJECTED"`
	AdmissibilityRationale    string     `json:"admissibility_rationale,omitempty"`
	SecondInstanceCommitteeID *uuid.UUID `json:"second_instance_committee_id,omitempty"`
	FinalDecision             string     `json:"final_decision,omitempty" validate:"omitempty,oneof=CONFIRMED MODIFIED REVOKED"`
	FinalRationale            string     `json:"final_rationale,omitempty"`
}

type AppealResponse struct {
	ID                        uuid.UUID               `json:"id"`
	SanctionID                uuid.UUID               `json:"sanction_id"`
	StudentID                 uuid.UUID               `json:"student_id"`
	SubmissionDate            time.Time               `json:"submission_date"`
	DeadlineDate              time.Time               `json:"deadline_date"`
	AppealGrounds             string                  `json:"appeal_grounds"`
	SupportingDocuments       []SupportingDocumentDTO `json:"supporting_documents,omitempty"`
	AdmissibilityStatus       string                  `json:"admissibility_status"`
	AdmissibilityRationale    *string                 `json:"admissibility_rationale,omitempty"`
	SecondInstanceCommitteeID *uuid.UUID              `json:"second_instance_committee_id,omitempty"`
	FinalDecision             *string                 `json:"final_decision,omitempty"`
	FinalRationale            *string                 `json:"final_rationale,omitempty"`
	IsWithinDeadline          bool                    `json:"is_within_deadline"`
	IsAdmitted                bool                    `json:"is_admitted"`
	HasFinalDecision          bool                    `json:"has_final_decision"`
	IsSuccessful              bool                    `json:"is_successful"`
	CreatedAt                 time.Time               `json:"created_at"`
	UpdatedAt                 time.Time               `json:"updated_at"`
}

// Common DTOs
type PaginationRequest struct {
	Page     int    `json:"page" validate:"min=1"`
	PageSize int    `json:"page_size" validate:"min=1,max=100"`
	OrderBy  string `json:"order_by,omitempty"`
	Order    string `json:"order,omitempty" validate:"omitempty,oneof=asc desc"`
}

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalItems int64       `json:"total_items"`
	TotalPages int         `json:"total_pages"`
}

type ErrorResponse struct {
	Error   string            `json:"error"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
}

type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
