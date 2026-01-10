package entities

import (
	"time"

	"github.com/google/uuid"
)

type WorkGroup struct {
	ID          uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ProjectID   uuid.UUID       `json:"project_id" gorm:"type:uuid;not null" validate:"required"`
	Name        string          `json:"name" gorm:"not null" validate:"required,min=3,max=100"`
	Description string          `json:"description" gorm:"type:text"`
	LeaderID    *uuid.UUID      `json:"leader_id" gorm:"type:uuid"`
	Status      WorkGroupStatus `json:"status" gorm:"type:varchar(20);not null;default:'active'" validate:"required"`
	MaxMembers  int             `json:"max_members" gorm:"not null;default:5" validate:"min=3,max=7"`

	// Metadata
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	Project Project       `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
	Members []GroupMember `json:"members,omitempty" gorm:"foreignKey:WorkGroupID;constraint:OnDelete:CASCADE"`
	Ideas   []ProjectIdea `json:"ideas,omitempty" gorm:"foreignKey:WorkGroupID;constraint:OnDelete:CASCADE"`
}

type GroupMember struct {
	ID          uuid.UUID         `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	WorkGroupID uuid.UUID         `json:"work_group_id" gorm:"type:uuid;not null" validate:"required"`
	StudentID   uuid.UUID         `json:"student_id" gorm:"type:uuid;not null" validate:"required"`
	Role        GroupMemberRole   `json:"role" gorm:"type:varchar(20);not null;default:'member'" validate:"required"`
	Status      GroupMemberStatus `json:"status" gorm:"type:varchar(20);not null;default:'active'" validate:"required"`
	JoinedAt    time.Time         `json:"joined_at" gorm:"autoCreateTime"`
	LeftAt      *time.Time        `json:"left_at"`

	// Relationships
	WorkGroup WorkGroup `json:"work_group,omitempty" gorm:"foreignKey:WorkGroupID"`
}

type WorkGroupStatus string

const (
	WorkGroupStatusActivo   WorkGroupStatus = "ACTIVO"
	WorkGroupStatusInactivo WorkGroupStatus = "INACTIVO"
	WorkGroupStatusCompleto WorkGroupStatus = "COMPLETO"
	WorkGroupStatusDisuelto WorkGroupStatus = "DISUELTO"
)

type GroupMemberRole string

const (
	GroupMemberRoleLider         GroupMemberRole = "LIDER"
	GroupMemberRoleMiembro       GroupMemberRole = "MIEMBRO"
	GroupMemberRoleDesarrollador GroupMemberRole = "DESARROLLADOR"
	GroupMemberRoleDisenador     GroupMemberRole = "DISENADOR"
	GroupMemberRoleAnalista      GroupMemberRole = "ANALISTA"
)

type GroupMemberStatus string

const (
	GroupMemberStatusActivo   GroupMemberStatus = "ACTIVO"
	GroupMemberStatusInactivo GroupMemberStatus = "INACTIVO"
	GroupMemberStatusRetirado GroupMemberStatus = "RETIRADO"
)

func (wgs WorkGroupStatus) String() string {
	return string(wgs)
}

func (wgs WorkGroupStatus) IsValid() bool {
	switch wgs {
	case WorkGroupStatusActivo, WorkGroupStatusInactivo, WorkGroupStatusCompleto, WorkGroupStatusDisuelto:
		return true
	default:
		return false
	}
}

func (gmr GroupMemberRole) String() string {
	return string(gmr)
}

func (gmr GroupMemberRole) IsValid() bool {
	switch gmr {
	case GroupMemberRoleLider, GroupMemberRoleMiembro, GroupMemberRoleDesarrollador, GroupMemberRoleDisenador, GroupMemberRoleAnalista:
		return true
	default:
		return false
	}
}

func (gms GroupMemberStatus) String() string {
	return string(gms)
}

func (gms GroupMemberStatus) IsValid() bool {
	switch gms {
	case GroupMemberStatusActivo, GroupMemberStatusInactivo, GroupMemberStatusRetirado:
		return true
	default:
		return false
	}
}

func (wg *WorkGroup) IsActive() bool {
	return wg.Status == WorkGroupStatusActivo
}

func (wg *WorkGroup) GetActiveMembers() []GroupMember {
	var activeMembers []GroupMember
	for _, member := range wg.Members {
		if member.Status == GroupMemberStatusActivo {
			activeMembers = append(activeMembers, member)
		}
	}
	return activeMembers
}

func (wg *WorkGroup) GetMemberCount() int {
	return len(wg.GetActiveMembers())
}

func (wg *WorkGroup) IsFull() bool {
	return wg.GetMemberCount() >= wg.MaxMembers
}

func (wg *WorkGroup) CanAddMember() bool {
	return wg.IsActive() && !wg.IsFull()
}

func (wg *WorkGroup) HasLeader() bool {
	return wg.LeaderID != nil
}

func (wg *WorkGroup) GetLeader() *GroupMember {
	if !wg.HasLeader() {
		return nil
	}

	for _, member := range wg.Members {
		if member.StudentID == *wg.LeaderID && member.Status == GroupMemberStatusActivo {
			return &member
		}
	}
	return nil
}

func (wg *WorkGroup) SetLeader(studentID uuid.UUID) error {
	// Verify the student is an active member
	for _, member := range wg.Members {
		if member.StudentID == studentID && member.Status == GroupMemberStatusActivo {
			wg.LeaderID = &studentID
			return nil
		}
	}
	return nil // Should return proper error
}

func (wg *WorkGroup) RemoveMember(studentID uuid.UUID) {
	for i, member := range wg.Members {
		if member.StudentID == studentID {
			wg.Members[i].Status = GroupMemberStatusRetirado
			now := time.Now()
			wg.Members[i].LeftAt = &now

			// If removing leader, clear leadership
			if wg.LeaderID != nil && *wg.LeaderID == studentID {
				wg.LeaderID = nil
			}
			break
		}
	}
}
