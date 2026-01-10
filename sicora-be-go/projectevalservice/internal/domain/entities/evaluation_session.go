package entities

import (
	"time"

	"github.com/google/uuid"
)

type EvaluationSession struct {
	ID          uuid.UUID               `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ProjectID   uuid.UUID               `json:"project_id" gorm:"type:uuid;not null" validate:"required"`
	Name        string                  `json:"name" gorm:"not null" validate:"required,min=5,max=200"`
	Description string                  `json:"description" gorm:"type:text"`
	Trimester   int                     `json:"trimester" gorm:"not null" validate:"required,min=2,max=7"`
	SessionType EvaluationSessionType   `json:"session_type" gorm:"type:varchar(30);not null" validate:"required"`
	Status      EvaluationSessionStatus `json:"status" gorm:"type:varchar(20);not null;default:'scheduled'" validate:"required"`

	// Schedule
	ScheduledDate     time.Time `json:"scheduled_date" gorm:"not null" validate:"required"`
	StartTime         time.Time `json:"start_time" gorm:"not null" validate:"required"`
	EndTime           time.Time `json:"end_time" gorm:"not null" validate:"required"`
	Location          string    `json:"location" gorm:"not null" validate:"required"`
	VirtualMeetingURL string    `json:"virtual_meeting_url"`

	// Configuration
	MinJurors    int        `json:"min_jurors" gorm:"not null;default:2" validate:"min=2"`
	MaxGroups    int        `json:"max_groups" gorm:"not null;default:10" validate:"min=1"`
	TimePerGroup int        `json:"time_per_group" gorm:"not null;default:30" validate:"min=15,max=120"` // minutes
	ChecklistID  *uuid.UUID `json:"checklist_id" gorm:"type:uuid"`

	// Notifications
	NotifyBefore     int        `json:"notify_before" gorm:"not null;default:48"` // hours
	LastNotification *time.Time `json:"last_notification"`

	// Metadata
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	Project            Project              `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
	Checklist          *Checklist           `json:"checklist,omitempty" gorm:"foreignKey:ChecklistID"`
	Jurors             []SessionJuror       `json:"jurors,omitempty" gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE"`
	Participants       []SessionParticipant `json:"participants,omitempty" gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE"`
	SessionEvaluations []SessionEvaluation  `json:"session_evaluations,omitempty" gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE"`
}

type SessionJuror struct {
	ID           uuid.UUID   `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SessionID    uuid.UUID   `json:"session_id" gorm:"type:uuid;not null" validate:"required"`
	InstructorID uuid.UUID   `json:"instructor_id" gorm:"type:uuid;not null" validate:"required"`
	Role         JurorRole   `json:"role" gorm:"type:varchar(20);not null;default:'evaluator'" validate:"required"`
	Status       JurorStatus `json:"status" gorm:"type:varchar(20);not null;default:'assigned'" validate:"required"`
	AssignedAt   time.Time   `json:"assigned_at" gorm:"autoCreateTime"`
	ConfirmedAt  *time.Time  `json:"confirmed_at"`

	// Relationships
	Session EvaluationSession `json:"session,omitempty" gorm:"foreignKey:SessionID"`
}

type SessionParticipant struct {
	ID                uuid.UUID         `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SessionID         uuid.UUID         `json:"session_id" gorm:"type:uuid;not null" validate:"required"`
	WorkGroupID       uuid.UUID         `json:"work_group_id" gorm:"type:uuid;not null" validate:"required"`
	Status            ParticipantStatus `json:"status" gorm:"type:varchar(20);not null;default:'registered'" validate:"required"`
	PresentationOrder int               `json:"presentation_order" gorm:"not null;default:1"`
	StartTime         *time.Time        `json:"start_time"`
	EndTime           *time.Time        `json:"end_time"`

	// Relationships
	Session   EvaluationSession `json:"session,omitempty" gorm:"foreignKey:SessionID"`
	WorkGroup WorkGroup         `json:"work_group,omitempty" gorm:"foreignKey:WorkGroupID"`
}

type SessionEvaluation struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SessionID    uuid.UUID  `json:"session_id" gorm:"type:uuid;not null" validate:"required"`
	WorkGroupID  uuid.UUID  `json:"work_group_id" gorm:"type:uuid;not null" validate:"required"`
	JurorID      uuid.UUID  `json:"juror_id" gorm:"type:uuid;not null" validate:"required"`
	EvaluationID uuid.UUID  `json:"evaluation_id" gorm:"type:uuid;not null" validate:"required"`
	CompletedAt  *time.Time `json:"completed_at"`

	// Relationships
	Session    EvaluationSession `json:"session,omitempty" gorm:"foreignKey:SessionID"`
	WorkGroup  WorkGroup         `json:"work_group,omitempty" gorm:"foreignKey:WorkGroupID"`
	Evaluation Evaluation        `json:"evaluation,omitempty" gorm:"foreignKey:EvaluationID"`
}

// Enums
type EvaluationSessionType string

const (
	EvaluationSessionTypePresentacionIdea   EvaluationSessionType = "PRESENTACION_IDEA"
	EvaluationSessionTypeRevisionProgreso   EvaluationSessionType = "REVISION_PROGRESO"
	EvaluationSessionTypePresentacionFinal  EvaluationSessionType = "PRESENTACION_FINAL"
	EvaluationSessionTypeRevisionIntermedia EvaluationSessionType = "REVISION_INTERMEDIA"
)

type EvaluationSessionStatus string

const (
	EvaluationSessionStatusProgramada EvaluationSessionStatus = "PROGRAMADA"
	EvaluationSessionStatusConfirmada EvaluationSessionStatus = "CONFIRMADA"
	EvaluationSessionStatusEnProgreso EvaluationSessionStatus = "EN_PROGRESO"
	EvaluationSessionStatusCompletada EvaluationSessionStatus = "COMPLETADA"
	EvaluationSessionStatusCancelada  EvaluationSessionStatus = "CANCELADA"
	EvaluationSessionStatusPostpuesta EvaluationSessionStatus = "POSTPUESTA"
)

type JurorRole string

const (
	JurorRolePresidente JurorRole = "PRESIDENTE"
	JurorRoleEvaluador  JurorRole = "EVALUADOR"
	JurorRoleObservador JurorRole = "OBSERVADOR"
)

type JurorStatus string

const (
	JurorStatusAsignado   JurorStatus = "ASIGNADO"
	JurorStatusConfirmado JurorStatus = "CONFIRMADO"
	JurorStatusDeclinado  JurorStatus = "DECLINADO"
	JurorStatusAsistio    JurorStatus = "ASISTIO"
	JurorStatusAusente    JurorStatus = "AUSENTE"
)

type ParticipantStatus string

const (
	ParticipantStatusRegistrado ParticipantStatus = "REGISTRADO"
	ParticipantStatusConfirmado ParticipantStatus = "CONFIRMADO"
	ParticipantStatusPresento   ParticipantStatus = "PRESENTO"
	ParticipantStatusAusente    ParticipantStatus = "AUSENTE"
	ParticipantStatusExcusado   ParticipantStatus = "EXCUSADO"
)

// Methods
func (est EvaluationSessionType) String() string {
	return string(est)
}

func (est EvaluationSessionType) IsValid() bool {
	switch est {
	case EvaluationSessionTypePresentacionIdea, EvaluationSessionTypeRevisionProgreso, EvaluationSessionTypePresentacionFinal, EvaluationSessionTypeRevisionIntermedia:
		return true
	default:
		return false
	}
}

func (ess EvaluationSessionStatus) String() string {
	return string(ess)
}

func (ess EvaluationSessionStatus) IsValid() bool {
	switch ess {
	case EvaluationSessionStatusProgramada, EvaluationSessionStatusConfirmada, EvaluationSessionStatusEnProgreso, EvaluationSessionStatusCompletada, EvaluationSessionStatusCancelada, EvaluationSessionStatusPostpuesta:
		return true
	default:
		return false
	}
}

func (es *EvaluationSession) CanBeModified() bool {
	return es.Status == EvaluationSessionStatusProgramada || es.Status == EvaluationSessionStatusPostpuesta
}

func (es *EvaluationSession) CanStart() bool {
	return es.Status == EvaluationSessionStatusConfirmada && time.Now().After(es.StartTime.Add(-15*time.Minute))
}

func (es *EvaluationSession) GetConfirmedJurors() []SessionJuror {
	var confirmed []SessionJuror
	for _, juror := range es.Jurors {
		if juror.Status == JurorStatusConfirmado || juror.Status == JurorStatusAsistio {
			confirmed = append(confirmed, juror)
		}
	}
	return confirmed
}

func (es *EvaluationSession) HasMinimumJurors() bool {
	return len(es.GetConfirmedJurors()) >= es.MinJurors
}

func (es *EvaluationSession) GetDuration() time.Duration {
	return es.EndTime.Sub(es.StartTime)
}

func (es *EvaluationSession) IsInProgress() bool {
	now := time.Now()
	return es.Status == EvaluationSessionStatusEnProgreso && now.After(es.StartTime) && now.Before(es.EndTime)
}
