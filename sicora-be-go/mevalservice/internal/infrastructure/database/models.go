package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// CommitteeModel representa el modelo de datos para comités - Acuerdo 009/2024
type CommitteeModel struct {
	ID              uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CommitteeDate   time.Time      `gorm:"not null" json:"committee_date"`
	CommitteeType   string         `gorm:"type:varchar(100);not null" json:"committee_type"`            // EVALUATION, DISCIPLINARY, ACADEMIC_FOLLOW_UP
	Status          string         `gorm:"type:varchar(50);not null;default:'SCHEDULED'" json:"status"` // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
	ProgramID       *uuid.UUID     `gorm:"type:uuid" json:"program_id,omitempty"`
	AcademicPeriod  string         `gorm:"type:varchar(50);not null" json:"academic_period"`
	AgendaGenerated bool           `gorm:"default:false" json:"agenda_generated"`
	QuorumAchieved  bool           `gorm:"default:false" json:"quorum_achieved"`
	SessionMinutes  *string        `gorm:"type:text" json:"session_minutes,omitempty"`
	CreatedAt       time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Members   []CommitteeMemberModel   `gorm:"foreignKey:CommitteeID" json:"members,omitempty"`
	Cases     []StudentCaseModel       `gorm:"foreignKey:CommitteeID" json:"cases,omitempty"`
	Decisions []CommitteeDecisionModel `gorm:"foreignKey:CommitteeID" json:"decisions,omitempty"`
}

// CommitteeMemberModel representa el modelo de datos para miembros de comité - Acuerdo 009/2024
type CommitteeMemberModel struct {
	ID                   uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CommitteeID          uuid.UUID      `gorm:"type:uuid;not null" json:"committee_id"`
	UserID               uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	MemberRole           string         `gorm:"type:varchar(50);not null" json:"member_role"` // PRESIDENT, SECRETARY, VOTING_MEMBER, ADVISOR, GUEST
	Attended             bool           `gorm:"default:false" json:"attended"`
	VotingRights         bool           `gorm:"default:true" json:"voting_rights"`
	JustificationAbsence *string        `gorm:"type:text" json:"justification_absence,omitempty"`
	CreatedAt            time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Committee CommitteeModel `gorm:"foreignKey:CommitteeID" json:"committee,omitempty"`
}

// StudentCaseModel representa el modelo de datos para casos de estudiantes - Acuerdo 009/2024
type StudentCaseModel struct {
	ID                      uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	StudentID               uuid.UUID      `gorm:"type:uuid;not null" json:"student_id"`
	CommitteeID             uuid.UUID      `gorm:"type:uuid;not null" json:"committee_id"`
	CaseType                string         `gorm:"type:varchar(100);not null" json:"case_type"`                       // ACADEMIC_RISK, DISCIPLINARY_FAULT, LOW_ATTENDANCE, etc.
	CaseStatus              string         `gorm:"type:varchar(50);not null;default:'REGISTERED'" json:"case_status"` // REGISTERED, UNDER_REVIEW, RESOLUTION_PENDING, etc.
	AutomaticDetection      bool           `gorm:"default:false" json:"automatic_detection"`
	DetectionCriteria       datatypes.JSON `gorm:"type:jsonb" json:"detection_criteria"`
	CaseDescription         string         `gorm:"type:text;not null" json:"case_description"`
	EvidenceDocuments       datatypes.JSON `gorm:"type:jsonb" json:"evidence_documents"`
	InstructorComments      *string        `gorm:"type:text" json:"instructor_comments,omitempty"`
	CommitteeRecommendation *string        `gorm:"type:text" json:"committee_recommendation,omitempty"`
	FinalResolution         *string        `gorm:"type:text" json:"final_resolution,omitempty"`
	ResolutionDate          *time.Time     `json:"resolution_date,omitempty"`
	CreatedAt               time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt               time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt               gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Committee        CommitteeModel           `gorm:"foreignKey:CommitteeID" json:"committee,omitempty"`
	ImprovementPlans []ImprovementPlanModel   `gorm:"foreignKey:StudentCaseID" json:"improvement_plans,omitempty"`
	Sanctions        []SanctionModel          `gorm:"foreignKey:StudentCaseID" json:"sanctions,omitempty"`
	Decisions        []CommitteeDecisionModel `gorm:"foreignKey:StudentCaseID" json:"decisions,omitempty"`
}

// ImprovementPlanModel representa el modelo de datos para planes de mejoramiento - Acuerdo 009/2024
type ImprovementPlanModel struct {
	ID                      uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	StudentID               uuid.UUID      `gorm:"type:uuid;not null" json:"student_id"`
	StudentCaseID           *uuid.UUID     `gorm:"type:uuid" json:"student_case_id,omitempty"`
	PlanType                string         `gorm:"type:varchar(100);not null" json:"plan_type"` // ACADEMIC_RECOVERY, BEHAVIORAL_IMPROVEMENT, ATTENDANCE_COMMITMENT
	StartDate               time.Time      `gorm:"not null" json:"start_date"`
	EndDate                 time.Time      `gorm:"not null" json:"end_date"`
	Objectives              datatypes.JSON `gorm:"type:jsonb;not null" json:"objectives"`
	Activities              datatypes.JSON `gorm:"type:jsonb;not null" json:"activities"`
	SuccessCriteria         datatypes.JSON `gorm:"type:jsonb;not null" json:"success_criteria"`
	ResponsibleInstructorID *uuid.UUID     `gorm:"type:uuid" json:"responsible_instructor_id,omitempty"`
	CurrentStatus           string         `gorm:"type:varchar(50);not null;default:'DRAFT'" json:"current_status"` // DRAFT, ACTIVE, COMPLETED, CANCELLED
	CompliancePercentage    float64        `gorm:"default:0" json:"compliance_percentage"`
	FinalEvaluation         *string        `gorm:"type:text" json:"final_evaluation,omitempty"`
	CreatedAt               time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt               time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt               gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	StudentCase *StudentCaseModel `gorm:"foreignKey:StudentCaseID" json:"student_case,omitempty"`
}

// SanctionModel representa el modelo de datos para sanciones - Acuerdo 009/2024
type SanctionModel struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	StudentID          uuid.UUID      `gorm:"type:uuid;not null" json:"student_id"`
	StudentCaseID      uuid.UUID      `gorm:"type:uuid;not null" json:"student_case_id"`
	SanctionType       string         `gorm:"type:varchar(100);not null" json:"sanction_type"` // VERBAL_WARNING, WRITTEN_WARNING, ACADEMIC_COMMITMENT, etc.
	SeverityLevel      int            `gorm:"not null" json:"severity_level"`                  // 1-7
	Description        string         `gorm:"type:text;not null" json:"description"`
	StartDate          time.Time      `gorm:"not null" json:"start_date"`
	EndDate            *time.Time     `json:"end_date,omitempty"`
	ComplianceRequired bool           `gorm:"default:false" json:"compliance_required"`
	ComplianceStatus   string         `gorm:"type:varchar(50);default:'PENDING'" json:"compliance_status"` // PENDING, IN_PROGRESS, COMPLETED, VIOLATED
	AppealDeadline     *time.Time     `json:"appeal_deadline,omitempty"`
	Appealed           bool           `gorm:"default:false" json:"appealed"`
	AppealResult       *string        `gorm:"type:varchar(50)" json:"appeal_result,omitempty"` // CONFIRMED, MODIFIED, REVOKED
	CreatedAt          time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	StudentCase StudentCaseModel `gorm:"foreignKey:StudentCaseID" json:"student_case,omitempty"`
	Appeals     []AppealModel    `gorm:"foreignKey:SanctionID" json:"appeals,omitempty"`
}

// CommitteeDecisionModel representa el modelo de datos para decisiones de comité
type CommitteeDecisionModel struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CommitteeID        uuid.UUID      `gorm:"type:uuid;not null" json:"committee_id"`
	StudentCaseID      *uuid.UUID     `gorm:"type:uuid" json:"student_case_id,omitempty"`
	DecisionNumber     string         `gorm:"uniqueIndex;not null" json:"decision_number"`
	Type               string         `gorm:"not null" json:"type"` // CASE_RESOLUTION, SANCTION_APPROVAL, APPEAL_RESOLUTION, POLICY_DECISION
	Title              string         `gorm:"not null" json:"title"`
	Description        string         `gorm:"type:text;not null" json:"description"`
	Resolution         string         `gorm:"type:text;not null" json:"resolution"`
	Justification      string         `gorm:"type:text;not null" json:"justification"`
	VotingResult       string         `gorm:"type:text" json:"voting_result"`
	AttendeesList      string         `gorm:"type:text" json:"attendees_list"`
	Status             string         `gorm:"not null;default:'DRAFT'" json:"status"` // DRAFT, APPROVED, EXECUTED, APPEALED
	DecisionDate       time.Time      `gorm:"not null" json:"decision_date"`
	ExecutionDate      *time.Time     `json:"execution_date,omitempty"`
	PresidentSignature bool           `gorm:"default:false" json:"president_signature"`
	SecretarySignature bool           `gorm:"default:false" json:"secretary_signature"`
	CreatedAt          time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Committee   CommitteeModel    `gorm:"foreignKey:CommitteeID" json:"committee,omitempty"`
	StudentCase *StudentCaseModel `gorm:"foreignKey:StudentCaseID" json:"student_case,omitempty"`
}

// AppealModel representa el modelo de datos para apelaciones - Acuerdo 009/2024
type AppealModel struct {
	ID                        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SanctionID                uuid.UUID      `gorm:"type:uuid;not null" json:"sanction_id"`
	StudentID                 uuid.UUID      `gorm:"type:uuid;not null" json:"student_id"`
	SubmissionDate            time.Time      `gorm:"not null" json:"submission_date"`
	DeadlineDate              time.Time      `gorm:"not null" json:"deadline_date"`
	AppealGrounds             string         `gorm:"type:text;not null" json:"appeal_grounds"`
	SupportingDocuments       datatypes.JSON `gorm:"type:jsonb" json:"supporting_documents"`
	AdmissibilityStatus       string         `gorm:"type:varchar(50);default:'PENDING'" json:"admissibility_status"` // PENDING, ADMITTED, REJECTED
	AdmissibilityRationale    *string        `gorm:"type:text" json:"admissibility_rationale,omitempty"`
	SecondInstanceCommitteeID *uuid.UUID     `gorm:"type:uuid" json:"second_instance_committee_id,omitempty"`
	FinalDecision             *string        `gorm:"type:varchar(50)" json:"final_decision,omitempty"` // CONFIRMED, MODIFIED, REVOKED
	FinalRationale            *string        `gorm:"type:text" json:"final_rationale,omitempty"`
	CreatedAt                 time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt                 time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt                 gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Sanction                SanctionModel   `gorm:"foreignKey:SanctionID" json:"sanction,omitempty"`
	SecondInstanceCommittee *CommitteeModel `gorm:"foreignKey:SecondInstanceCommitteeID" json:"second_instance_committee,omitempty"`
}

// TableName methods for custom table names
func (CommitteeModel) TableName() string         { return "committees" }
func (CommitteeMemberModel) TableName() string   { return "committee_members" }
func (StudentCaseModel) TableName() string       { return "student_cases" }
func (ImprovementPlanModel) TableName() string   { return "improvement_plans" }
func (SanctionModel) TableName() string          { return "sanctions" }
func (CommitteeDecisionModel) TableName() string { return "committee_decisions" }
func (AppealModel) TableName() string            { return "appeals" }
