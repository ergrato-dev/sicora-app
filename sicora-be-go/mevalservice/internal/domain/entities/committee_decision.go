package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DecisionType representa el tipo de decisión del comité
type DecisionType string

const (
	DecisionTypeReconocimiento DecisionType = "RECONOCIMIENTO"  // Estímulo o felicitación
	DecisionTypeSancion        DecisionType = "SANCION"         // Sanción disciplinaria
	DecisionTypeRenovacionPlan DecisionType = "RENOVACION_PLAN" // Renovación de plan de mejoramiento
	DecisionTypeApelacion      DecisionType = "APELACION"       // Resultado de apelación
)

// CommitteeDecision representa una decisión tomada por un comité
type CommitteeDecision struct {
	// ID único de la decisión (UUID v4)
	ID uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	// ID del comité que tomó la decisión
	CommitteeID uuid.UUID `json:"committee_id" gorm:"type:uuid;not null"`
	// ID del caso del aprendiz
	StudentCaseID uuid.UUID `json:"student_case_id" gorm:"type:uuid;not null"`
	// Tipo de decisión tomada
	DecisionType DecisionType `json:"decision_type" gorm:"type:varchar(20);not null;check:decision_type IN ('RECONOCIMIENTO','SANCION','RENOVACION_PLAN','APELACION')"`
	// Descripción detallada de la decisión
	DecisionDescription string `json:"decision_description" gorm:"type:text;not null"`
	// Votos a favor
	VotesFor int16 `json:"votes_for" gorm:"type:smallint;default:0;check:votes_for >= 0"`
	// Votos en contra
	VotesAgainst int16 `json:"votes_against" gorm:"type:smallint;default:0;check:votes_against >= 0"`
	// Abstenciones
	VotesAbstain int16 `json:"votes_abstain" gorm:"type:smallint;default:0;check:votes_abstain >= 0"`
	// Indica si la decisión fue unánime
	Unanimous bool `json:"unanimous" gorm:"default:false"`
	// Justificación de la decisión
	DecisionRationale *string `json:"decision_rationale,omitempty" gorm:"type:text"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime;not null"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime;not null"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"` // Soft delete

	// --- Relaciones ---
	Committee   Committee   `json:"-" gorm:"foreignKey:CommitteeID"`
	StudentCase StudentCase `json:"-" gorm:"foreignKey:StudentCaseID"`
}

// BeforeCreate establece el ID antes de crear una nueva decisión
func (cd *CommitteeDecision) BeforeCreate(tx *gorm.DB) error {
	if cd.ID == uuid.Nil {
		cd.ID = uuid.New()
	}
	return nil
}

// TableName especifica el nombre de la tabla
func (CommitteeDecision) TableName() string {
	return "mevalservice_schema.committee_decisions"
}

// GetTotalVotes retorna el total de votos emitidos
func (cd *CommitteeDecision) GetTotalVotes() int16 {
	return cd.VotesFor + cd.VotesAgainst + cd.VotesAbstain
}

// IsAprobada verifica si la decisión fue aprobada
func (cd *CommitteeDecision) IsAprobada() bool {
	return cd.VotesFor > cd.VotesAgainst
}

// IsUnanime verifica si la decisión fue unánime
func (cd *CommitteeDecision) IsUnanime() bool {
	return cd.Unanimous || (cd.VotesAgainst == 0 && cd.VotesAbstain == 0)
}

// GetApprovalPercentage retorna el porcentaje de votos de aprobación
func (cd *CommitteeDecision) GetApprovalPercentage() float64 {
	total := cd.GetTotalVotes()
	if total == 0 {
		return 0.0
	}
	return float64(cd.VotesFor) / float64(total) * 100
}
