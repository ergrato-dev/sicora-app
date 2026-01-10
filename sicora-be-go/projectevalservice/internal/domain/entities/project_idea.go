package entities

import (
	"time"

	"github.com/google/uuid"
)

type ProjectIdea struct {
	ID              uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ProjectID       uuid.UUID `json:"project_id" gorm:"type:uuid;not null" validate:"required"`
	WorkGroupID     uuid.UUID `json:"work_group_id" gorm:"type:uuid;not null" validate:"required"`
	Title           string    `json:"title" gorm:"not null" validate:"required,min=5,max=200"`
	Description     string    `json:"description" gorm:"type:text;not null" validate:"required,min=20"`
	Objectives      string    `json:"objectives" gorm:"type:text;not null" validate:"required"`
	StakeholderInfo string    `json:"stakeholder_info" gorm:"type:text"`
	TechnologyStack string    `json:"technology_stack" gorm:"type:text"`
	ExpectedImpact  string    `json:"expected_impact" gorm:"type:text"`
	Feasibility     string    `json:"feasibility" gorm:"type:text"`
	Resources       string    `json:"resources" gorm:"type:text"`

	// Evaluation fields
	Status          ProjectIdeaStatus `json:"status" gorm:"type:varchar(20);not null;default:'proposed'" validate:"required"`
	Score           float64           `json:"score" gorm:"default:0" validate:"min=0,max=100"`
	EvaluatorID     *uuid.UUID        `json:"evaluator_id" gorm:"type:uuid"`
	EvaluationDate  *time.Time        `json:"evaluation_date"`
	Feedback        string            `json:"feedback" gorm:"type:text"`
	RejectionReason string            `json:"rejection_reason" gorm:"type:text"`

	// Metadata
	SubmittedAt time.Time `json:"submitted_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	Project   Project   `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
	WorkGroup WorkGroup `json:"work_group,omitempty" gorm:"foreignKey:WorkGroupID"`
}

type ProjectIdeaStatus string

const (
	ProjectIdeaStatusPropuesta    ProjectIdeaStatus = "PROPUESTA"
	ProjectIdeaStatusEnEvaluacion ProjectIdeaStatus = "EN_EVALUACION"
	ProjectIdeaStatusAprobada     ProjectIdeaStatus = "APROBADA"
	ProjectIdeaStatusRechazada    ProjectIdeaStatus = "RECHAZADA"
	ProjectIdeaStatusEnRevision   ProjectIdeaStatus = "EN_REVISION"
)

func (pis ProjectIdeaStatus) String() string {
	return string(pis)
}

func (pis ProjectIdeaStatus) IsValid() bool {
	switch pis {
	case ProjectIdeaStatusPropuesta, ProjectIdeaStatusEnEvaluacion, ProjectIdeaStatusAprobada, ProjectIdeaStatusRechazada, ProjectIdeaStatusEnRevision:
		return true
	default:
		return false
	}
}

func (pi *ProjectIdea) CanBeEvaluated() bool {
	return pi.Status == ProjectIdeaStatusPropuesta || pi.Status == ProjectIdeaStatusEnRevision
}

func (pi *ProjectIdea) IsApproved() bool {
	return pi.Status == ProjectIdeaStatusAprobada
}

func (pi *ProjectIdea) CanBeModified() bool {
	return pi.Status == ProjectIdeaStatusPropuesta || pi.Status == ProjectIdeaStatusEnRevision
}

func (pi *ProjectIdea) Approve(evaluatorID uuid.UUID, score float64, feedback string) {
	pi.Status = ProjectIdeaStatusAprobada
	pi.EvaluatorID = &evaluatorID
	pi.Score = score
	pi.Feedback = feedback
	now := time.Now()
	pi.EvaluationDate = &now
}

func (pi *ProjectIdea) Reject(evaluatorID uuid.UUID, reason string, feedback string) {
	pi.Status = ProjectIdeaStatusRechazada
	pi.EvaluatorID = &evaluatorID
	pi.RejectionReason = reason
	pi.Feedback = feedback
	now := time.Now()
	pi.EvaluationDate = &now
}

func (pi *ProjectIdea) RequestRevision(evaluatorID uuid.UUID, feedback string) {
	pi.Status = ProjectIdeaStatusEnRevision
	pi.EvaluatorID = &evaluatorID
	pi.Feedback = feedback
	now := time.Now()
	pi.EvaluationDate = &now
}
