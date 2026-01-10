package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MemberRole represents the role of a committee member according to Agreement 009
type MemberRole string

const (
	MemberRoleCoordinador           MemberRole = "COORDINADOR"
	MemberRoleInstructor            MemberRole = "INSTRUCTOR"
	MemberRoleAsistente             MemberRole = "ASISTENTE"
	MemberRoleAprendiz              MemberRole = "APRENDIZ"
	MemberRoleApoyo                 MemberRole = "APOYO"
	MemberRoleBienestar             MemberRole = "BIENESTAR"
	MemberRoleRepresentanteAprendiz MemberRole = "REPRESENTANTE_APRENDICES"
	MemberRoleAbogado               MemberRole = "ABOGADO"
	MemberRoleDireccion             MemberRole = "DIRECCION"
)

// CommitteeMember represents a member of a committee
type CommitteeMember struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	CommitteeID uuid.UUID  `json:"committee_id" gorm:"type:uuid;not null"`
	UserID      uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	MemberRole  MemberRole `json:"member_role" gorm:"type:varchar(30);not null;check:member_role IN ('COORDINADOR','INSTRUCTOR','ASISTENTE','APRENDIZ','APOYO','BIENESTAR','REPRESENTANTE_APRENDICES','ABOGADO','DIRECCION')"`
	IsPresent   bool       `json:"is_present" gorm:"default:false"`
	VotePower   int        `json:"vote_power" gorm:"type:smallint;default:1;check:vote_power >= 0 AND vote_power <= 3"`
	CreatedAt   time.Time  `json:"created_at" gorm:"autoCreateTime"`

	// Relationships
	Committee Committee `json:"-" gorm:"foreignKey:CommitteeID"`
}

// BeforeCreate sets the ID before creating a new committee member
func (cm *CommitteeMember) BeforeCreate(tx *gorm.DB) error {
	if cm.ID == uuid.Nil {
		cm.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name for CommitteeMember
func (CommitteeMember) TableName() string {
	return "mevalservice_schema.committee_members"
}

// IsDecisionMaker checks if this member can make decisions
func (cm *CommitteeMember) IsDecisionMaker() bool {
	return cm.MemberRole == MemberRoleCoordinador ||
		cm.MemberRole == MemberRoleInstructor ||
		cm.MemberRole == MemberRoleDireccion
}

// HasVotingRights checks if this member has voting rights
func (cm *CommitteeMember) HasVotingRights() bool {
	return cm.VotePower > 0 && cm.IsPresent
}
