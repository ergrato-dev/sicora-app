package entities

import (
	"time"

	"github.com/google/uuid"
)

type Checklist struct {
	ID          uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string          `json:"name" gorm:"not null" validate:"required,min=5,max=200"`
	Description string          `json:"description" gorm:"type:text"`
	Version     string          `json:"version" gorm:"not null;default:'1.0'" validate:"required"`
	Trimester   int             `json:"trimester" gorm:"not null" validate:"required,min=2,max=7"`
	ProjectType string          `json:"project_type" gorm:"not null" validate:"required"`
	Program     string          `json:"program" gorm:"not null" validate:"required"` // ADSO, PSW
	Status      ChecklistStatus `json:"status" gorm:"type:varchar(20);not null;default:'draft'" validate:"required"`

	// Metadata
	CreatedBy  uuid.UUID  `json:"created_by" gorm:"type:uuid;not null" validate:"required"`
	ApprovedBy *uuid.UUID `json:"approved_by" gorm:"type:uuid"`
	CreatedAt  time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	ApprovedAt *time.Time `json:"approved_at"`

	// Relationships
	Criteria []ChecklistCriterion `json:"criteria,omitempty" gorm:"foreignKey:ChecklistID;constraint:OnDelete:CASCADE"`
	Sessions []EvaluationSession  `json:"sessions,omitempty" gorm:"foreignKey:ChecklistID"`
}

type ChecklistCriterion struct {
	ID          uuid.UUID         `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChecklistID uuid.UUID         `json:"checklist_id" gorm:"type:uuid;not null" validate:"required"`
	Name        string            `json:"name" gorm:"not null" validate:"required,min=3,max=100"`
	Description string            `json:"description" gorm:"type:text;not null" validate:"required"`
	Category    CriterionCategory `json:"category" gorm:"type:varchar(30);not null" validate:"required"`
	Weight      float64           `json:"weight" gorm:"not null" validate:"required,min=0,max=100"`
	MaxScore    float64           `json:"max_score" gorm:"not null;default:100" validate:"required,min=0"`
	IsRequired  bool              `json:"is_required" gorm:"not null;default:true"`
	Order       int               `json:"order" gorm:"not null;default:1" validate:"min=1"`

	// Evaluation guidelines
	Rubric         string `json:"rubric" gorm:"type:text"`
	Examples       string `json:"examples" gorm:"type:text"`
	CommonMistakes string `json:"common_mistakes" gorm:"type:text"`

	// Relationships
	Checklist Checklist        `json:"checklist,omitempty" gorm:"foreignKey:ChecklistID"`
	Levels    []CriterionLevel `json:"levels,omitempty" gorm:"foreignKey:CriterionID;constraint:OnDelete:CASCADE"`
}

type CriterionLevel struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CriterionID uuid.UUID `json:"criterion_id" gorm:"type:uuid;not null" validate:"required"`
	Level       int       `json:"level" gorm:"not null" validate:"required,min=1,max=5"`
	Name        string    `json:"name" gorm:"not null" validate:"required,min=3,max=50"`
	Description string    `json:"description" gorm:"type:text;not null" validate:"required"`
	ScoreMin    float64   `json:"score_min" gorm:"not null" validate:"required,min=0"`
	ScoreMax    float64   `json:"score_max" gorm:"not null" validate:"required,min=0"`

	// Relationships
	Criterion ChecklistCriterion `json:"criterion,omitempty" gorm:"foreignKey:CriterionID"`
}

// Enums
type ChecklistStatus string

const (
	ChecklistStatusBorrador   ChecklistStatus = "BORRADOR"
	ChecklistStatusEnRevision ChecklistStatus = "EN_REVISION"
	ChecklistStatusAprobado   ChecklistStatus = "APROBADO"
	ChecklistStatusActivo     ChecklistStatus = "ACTIVO"
	ChecklistStatusArchivado  ChecklistStatus = "ARCHIVADO"
)

type CriterionCategory string

const (
	// Categorías técnicas principales
	CriterionCategoryTecnico       CriterionCategory = "TECNICO"
	CriterionCategoryFuncional     CriterionCategory = "FUNCIONAL"
	CriterionCategoryDocumentacion CriterionCategory = "DOCUMENTACION"
	CriterionCategoryPresentacion  CriterionCategory = "PRESENTACION"
	CriterionCategoryTrabajoEquipo CriterionCategory = "TRABAJO_EQUIPO"
	CriterionCategoryInnovacion    CriterionCategory = "INNOVACION"
	CriterionCategoryCalidad       CriterionCategory = "CALIDAD"
	CriterionCategoryDespliegue    CriterionCategory = "DESPLIEGUE"
	CriterionCategorySeguridad     CriterionCategory = "SEGURIDAD"
	CriterionCategoryRendimiento   CriterionCategory = "RENDIMIENTO"
	CriterionCategoryUsabilidad    CriterionCategory = "USABILIDAD"

	// Categorías DevOps/Cloud (desde T2-T3 según Lista Chequeo ADSO 2026)
	CriterionCategoryDocker       CriterionCategory = "DOCKER"       // Contenedores, Dockerfile, docker-compose
	CriterionCategoryCI_CD        CriterionCategory = "CI_CD"        // GitHub Actions, pipelines, automatización
	CriterionCategoryCloud        CriterionCategory = "CLOUD"        // Deploy en Vercel/Railway/Render
	CriterionCategoryMonitoreo    CriterionCategory = "MONITOREO"    // Logging, Sentry, health checks
	CriterionCategoryVersionado   CriterionCategory = "VERSIONADO"   // Git, branches, PRs, code reviews
	CriterionCategoryIA           CriterionCategory = "IA"           // Uso responsable de IA (Copilot, ChatGPT)
	CriterionCategoryArquitectura CriterionCategory = "ARQUITECTURA" // C4, API-First, patrones
	CriterionCategoryTesting      CriterionCategory = "TESTING"      // Unit, Integration, E2E
)

// Methods
func (cs ChecklistStatus) String() string {
	return string(cs)
}

func (cs ChecklistStatus) IsValid() bool {
	switch cs {
	case ChecklistStatusBorrador, ChecklistStatusEnRevision, ChecklistStatusAprobado, ChecklistStatusActivo, ChecklistStatusArchivado:
		return true
	default:
		return false
	}
}

func (cc CriterionCategory) String() string {
	return string(cc)
}

func (cc CriterionCategory) IsValid() bool {
	switch cc {
	case CriterionCategoryTecnico, CriterionCategoryFuncional, CriterionCategoryDocumentacion,
		CriterionCategoryPresentacion, CriterionCategoryTrabajoEquipo, CriterionCategoryInnovacion,
		CriterionCategoryCalidad, CriterionCategoryDespliegue, CriterionCategorySeguridad,
		CriterionCategoryRendimiento, CriterionCategoryUsabilidad,
		// DevOps/Cloud categories
		CriterionCategoryDocker, CriterionCategoryCI_CD, CriterionCategoryCloud,
		CriterionCategoryMonitoreo, CriterionCategoryVersionado, CriterionCategoryIA,
		CriterionCategoryArquitectura, CriterionCategoryTesting:
		return true
	default:
		return false
	}
}

func (c *Checklist) CanBeModified() bool {
	return c.Status == ChecklistStatusBorrador || c.Status == ChecklistStatusEnRevision
}

func (c *Checklist) IsActive() bool {
	return c.Status == ChecklistStatusActivo
}

func (c *Checklist) GetTotalWeight() float64 {
	total := 0.0
	for _, criterion := range c.Criteria {
		total += criterion.Weight
	}
	return total
}

func (c *Checklist) IsWeightValid() bool {
	return c.GetTotalWeight() == 100.0
}

func (c *Checklist) GetRequiredCriteria() []ChecklistCriterion {
	var required []ChecklistCriterion
	for _, criterion := range c.Criteria {
		if criterion.IsRequired {
			required = append(required, criterion)
		}
	}
	return required
}

func (c *Checklist) Approve(approverID uuid.UUID) {
	c.Status = ChecklistStatusAprobado
	c.ApprovedBy = &approverID
	now := time.Now()
	c.ApprovedAt = &now
}

func (c *Checklist) Activate() {
	if c.Status == ChecklistStatusAprobado {
		c.Status = ChecklistStatusActivo
	}
}

func (c *Checklist) Archive() {
	c.Status = ChecklistStatusArchivado
}

func (cc *ChecklistCriterion) GetLevelByScore(score float64) *CriterionLevel {
	for _, level := range cc.Levels {
		if score >= level.ScoreMin && score <= level.ScoreMax {
			return &level
		}
	}
	return nil
}

func (cc *ChecklistCriterion) GetMaxPossibleScore() float64 {
	if len(cc.Levels) == 0 {
		return cc.MaxScore
	}

	maxScore := 0.0
	for _, level := range cc.Levels {
		if level.ScoreMax > maxScore {
			maxScore = level.ScoreMax
		}
	}
	return maxScore
}
