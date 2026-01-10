package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CommitteeType represents the type of committee according to OneVision Agreement 009 of 2024
type CommitteeType string

const (
	// Solo existe un tipo de comité según Acuerdo 009
	CommitteeTypeSeguimientoEvaluacion CommitteeType = "SEGUIMIENTO_EVALUACION"
)

// CommitteeStatus represents the current status of a committee session
type CommitteeStatus string

const (
	CommitteeStatusProgramado CommitteeStatus = "PROGRAMADO"
	CommitteeStatusEnSesion   CommitteeStatus = "EN_SESION"
	CommitteeStatusCompletado CommitteeStatus = "COMPLETADO"
	CommitteeStatusCancelado  CommitteeStatus = "CANCELADO"
	CommitteeStatusAplazado   CommitteeStatus = "APLAZADO"
)

// Committee represents a committee session for academic/disciplinary evaluation
type Committee struct {
	ID              uuid.UUID       `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	CommitteeDate   time.Time       `json:"committee_date" gorm:"not null"`
	CommitteeType   CommitteeType   `json:"committee_type" gorm:"type:varchar(30);not null;default:'SEGUIMIENTO_EVALUACION';check:committee_type = 'SEGUIMIENTO_EVALUACION'"`
	Status          CommitteeStatus `json:"status" gorm:"type:varchar(20);not null;default:'PROGRAMADO';check:status IN ('PROGRAMADO','EN_SESION','COMPLETADO','CANCELADO','APLAZADO')"`
	ProgramID       *uuid.UUID      `json:"program_id,omitempty" gorm:"type:uuid"`
	AcademicPeriod  string          `json:"academic_period" gorm:"type:varchar(20);not null"`
	AgendaGenerated bool            `json:"agenda_generated" gorm:"default:false"`
	QuorumAchieved  bool            `json:"quorum_achieved" gorm:"default:false"`
	SessionMinutes  *string         `json:"session_minutes,omitempty" gorm:"type:text"`
	CreatedAt       time.Time       `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time       `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	Members   []CommitteeMember   `json:"members,omitempty" gorm:"foreignKey:CommitteeID"`
	Cases     []StudentCase       `json:"cases,omitempty" gorm:"foreignKey:CommitteeID"`
	Decisions []CommitteeDecision `json:"decisions,omitempty" gorm:"foreignKey:CommitteeID"`
}

// BeforeCreate sets the ID before creating a new committee
func (c *Committee) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name for Committee
func (Committee) TableName() string {
	return "mevalservice_schema.committees"
}

// IsMonthlyCommittee - Ya no aplica, solo hay un tipo de comité
func (c *Committee) IsMonthlyCommittee() bool {
	return c.CommitteeType == CommitteeTypeSeguimientoEvaluacion
}

// CanStartSession validates if the committee can start a session
func (c *Committee) CanStartSession() bool {
	return c.Status == CommitteeStatusProgramado && c.QuorumAchieved
}

// IsCompleted checks if the committee session is completed
func (c *Committee) IsCompleted() bool {
	return c.Status == CommitteeStatusCompletado
}

// GetFormattedDate returns the committee date in a human-readable format
func (c *Committee) GetFormattedDate() string {
	return c.CommitteeDate.Format("2006-01-02 15:04")
}
