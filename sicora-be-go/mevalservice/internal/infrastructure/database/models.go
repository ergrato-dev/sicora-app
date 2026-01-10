package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// CommitteeModel representa el modelo de datos para comités - Acuerdo 009/2024
type CommitteeModel struct {
	// ID único del comité (UUID v4)
	ID uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	// Fecha programada del comité
	CommitteeDate time.Time `gorm:"not null" json:"committee_date"`
	// Tipo de comité (SEGUIMIENTO_EVALUACION)
	CommitteeType string `gorm:"type:varchar(30);not null;check:committee_type IN ('SEGUIMIENTO_EVALUACION')" json:"committee_type"`
	// Estado del comité
	Status string `gorm:"type:varchar(20);not null;default:'PROGRAMADO';check:status IN ('PROGRAMADO','EN_SESION','COMPLETADO','CANCELADO','APLAZADO')" json:"status"`
	// ID del programa de formación (opcional)
	ProgramID *uuid.UUID `gorm:"type:uuid" json:"program_id,omitempty"`
	// Periodo académico (ej: 2024-2)
	AcademicPeriod string `gorm:"type:varchar(50);not null" json:"academic_period"`
	// Indica si se generó la agenda
	AgendaGenerated bool `gorm:"default:false" json:"agenda_generated"`
	// Indica si se alcanzó el quórum
	QuorumAchieved bool `gorm:"default:false" json:"quorum_achieved"`
	// Acta de la sesión
	SessionMinutes *string `gorm:"type:text" json:"session_minutes,omitempty"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Members   []CommitteeMemberModel   `gorm:"foreignKey:CommitteeID" json:"members,omitempty"`
	Cases     []StudentCaseModel       `gorm:"foreignKey:CommitteeID" json:"cases,omitempty"`
	Decisions []CommitteeDecisionModel `gorm:"foreignKey:CommitteeID" json:"decisions,omitempty"`
}

// CommitteeMemberModel representa el modelo de datos para miembros de comité - Acuerdo 009/2024
type CommitteeMemberModel struct {
	// ID único del miembro (UUID v4)
	ID uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	// ID del comité al que pertenece
	CommitteeID uuid.UUID `gorm:"type:uuid;not null" json:"committee_id"`
	// ID del usuario
	UserID uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	// Rol del miembro en el comité
	MemberRole string `gorm:"type:varchar(30);not null;check:member_role IN ('COORDINADOR','INSTRUCTOR','ASISTENTE','APRENDIZ','APOYO','BIENESTAR','REPRESENTANTE_APRENDICES','ABOGADO','DIRECCION')" json:"member_role"`
	// Indica si asistió a la sesión
	Attended bool `gorm:"default:false" json:"attended"`
	// Indica si tiene derecho a voto
	VotingRights bool `gorm:"default:true" json:"voting_rights"`
	// Peso del voto (0=sin voto, 1=normal, 2=doble, 3=veto)
	VotePower int16 `gorm:"type:smallint;default:1;check:vote_power >= 0 AND vote_power <= 3" json:"vote_power"`
	// Justificación de ausencia (si aplica)
	JustificationAbsence *string `gorm:"type:text" json:"justification_absence,omitempty"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Committee CommitteeModel `gorm:"foreignKey:CommitteeID" json:"committee,omitempty"`
}

// StudentCaseModel representa el modelo de datos para casos de estudiantes - Acuerdo 009/2024
type StudentCaseModel struct {
	// ID único del caso (UUID v4)
	ID uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	// ID del aprendiz
	StudentID uuid.UUID `gorm:"type:uuid;not null" json:"student_id"`
	// ID del comité que revisa el caso
	CommitteeID uuid.UUID `gorm:"type:uuid;not null" json:"committee_id"`
	// Tipo de caso
	CaseType string `gorm:"type:varchar(20);not null;check:case_type IN ('ACADEMICO','DISCIPLINARIO','INASISTENCIA','FELICITACION')" json:"case_type"`
	// Estado del caso
	CaseStatus string `gorm:"type:varchar(25);not null;default:'REGISTRADO';check:case_status IN ('REGISTRADO','EN_REVISION','PENDIENTE_RESOLUCION','RESUELTO','ARCHIVADO')" json:"case_status"`
	// Indica si fue detectado automáticamente
	AutomaticDetection bool `gorm:"default:false" json:"automatic_detection"`
	// Criterios de detección (JSON)
	DetectionCriteria datatypes.JSON `gorm:"type:jsonb" json:"detection_criteria"`
	// Descripción del caso
	CaseDescription string `gorm:"type:text;not null" json:"case_description"`
	// Documentos de evidencia (JSON)
	EvidenceDocuments datatypes.JSON `gorm:"type:jsonb" json:"evidence_documents"`
	// Comentarios del instructor
	InstructorComments *string `gorm:"type:text" json:"instructor_comments,omitempty"`
	// Recomendación del comité
	CommitteeRecommendation *string `gorm:"type:text" json:"committee_recommendation,omitempty"`
	// Resolución final
	FinalResolution *string `gorm:"type:text" json:"final_resolution,omitempty"`
	// Fecha de resolución
	ResolutionDate *time.Time `json:"resolution_date,omitempty"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Committee        CommitteeModel           `gorm:"foreignKey:CommitteeID" json:"committee,omitempty"`
	ImprovementPlans []ImprovementPlanModel   `gorm:"foreignKey:StudentCaseID" json:"improvement_plans,omitempty"`
	Sanctions        []SanctionModel          `gorm:"foreignKey:StudentCaseID" json:"sanctions,omitempty"`
	Decisions        []CommitteeDecisionModel `gorm:"foreignKey:StudentCaseID" json:"decisions,omitempty"`
}

// ImprovementPlanModel representa el modelo de datos para planes de mejoramiento - Acuerdo 009/2024
type ImprovementPlanModel struct {
	// ID único del plan (UUID v4)
	ID uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	// ID del aprendiz
	StudentID uuid.UUID `gorm:"type:uuid;not null" json:"student_id"`
	// ID del caso asociado (opcional)
	StudentCaseID *uuid.UUID `gorm:"type:uuid" json:"student_case_id,omitempty"`
	// Tipo de plan de mejoramiento
	PlanType string `gorm:"type:varchar(20);not null;check:plan_type IN ('ACADEMICO','DISCIPLINARIO','ACTITUDINAL','MIXTO')" json:"plan_type"`
	// Fecha de inicio del plan
	StartDate time.Time `gorm:"not null" json:"start_date"`
	// Fecha de finalización del plan
	EndDate time.Time `gorm:"not null" json:"end_date"`
	// Objetivos del plan (JSON)
	Objectives datatypes.JSON `gorm:"type:jsonb;not null" json:"objectives"`
	// Actividades del plan (JSON)
	Activities datatypes.JSON `gorm:"type:jsonb;not null" json:"activities"`
	// Criterios de éxito (JSON)
	SuccessCriteria datatypes.JSON `gorm:"type:jsonb;not null" json:"success_criteria"`
	// ID del instructor responsable (opcional)
	ResponsibleInstructorID *uuid.UUID `gorm:"type:uuid" json:"responsible_instructor_id,omitempty"`
	// Estado actual del plan
	CurrentStatus string `gorm:"type:varchar(20);not null;default:'BORRADOR';check:current_status IN ('BORRADOR','ACTIVO','COMPLETADO','INCUMPLIDO','CANCELADO')" json:"current_status"`
	// Porcentaje de cumplimiento (0-100)
	CompliancePercentage int16 `gorm:"type:smallint;default:0;check:compliance_percentage >= 0 AND compliance_percentage <= 100" json:"compliance_percentage"`
	// Evaluación final del plan
	FinalEvaluation *string `gorm:"type:text" json:"final_evaluation,omitempty"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	StudentCase *StudentCaseModel `gorm:"foreignKey:StudentCaseID" json:"student_case,omitempty"`
}

// SanctionModel representa el modelo de datos para sanciones - Acuerdo 009/2024
type SanctionModel struct {
	// ID único de la sanción (UUID v4)
	ID uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	// ID del aprendiz sancionado
	StudentID uuid.UUID `gorm:"type:uuid;not null" json:"student_id"`
	// ID del caso asociado
	StudentCaseID uuid.UUID `gorm:"type:uuid;not null" json:"student_case_id"`
	// Tipo de sanción
	SanctionType string `gorm:"type:varchar(30);not null;check:sanction_type IN ('LLAMADO_ATENCION_VERBAL','LLAMADO_ATENCION_ESCRITO','PLAN_MEJORAMIENTO','CONDICIONAMIENTO_MATRICULA','CANCELACION_MATRICULA')" json:"sanction_type"`
	// Nivel de gravedad de la falta
	SeverityLevel string `gorm:"type:varchar(20);not null;check:severity_level IN ('LEVE','MODERADA','GRAVE','MUY_GRAVE')" json:"severity_level"`
	// Descripción de la sanción
	Description string `gorm:"type:text;not null" json:"description"`
	// Fecha de inicio de la sanción
	StartDate time.Time `gorm:"not null" json:"start_date"`
	// Fecha de fin de la sanción (opcional)
	EndDate *time.Time `json:"end_date,omitempty"`
	// Indica si requiere cumplimiento
	ComplianceRequired bool `gorm:"default:false" json:"compliance_required"`
	// Estado de cumplimiento
	ComplianceStatus string `gorm:"type:varchar(20);default:'PENDIENTE';check:compliance_status IN ('PENDIENTE','EN_PROGRESO','CUMPLIDO','INCUMPLIDO')" json:"compliance_status"`
	// Fecha límite para apelar
	AppealDeadline *time.Time `json:"appeal_deadline,omitempty"`
	// Indica si fue apelada
	Appealed bool `gorm:"default:false" json:"appealed"`
	// Resultado de la apelación (si aplica)
	AppealResult *string `gorm:"type:varchar(20);check:appeal_result IN ('CONFIRMADA','MODIFICADA','REVOCADA')" json:"appeal_result,omitempty"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	StudentCase StudentCaseModel `gorm:"foreignKey:StudentCaseID" json:"student_case,omitempty"`
	Appeals     []AppealModel    `gorm:"foreignKey:SanctionID" json:"appeals,omitempty"`
}

// CommitteeDecisionModel representa el modelo de datos para decisiones de comité
type CommitteeDecisionModel struct {
	// ID único de la decisión (UUID v4)
	ID uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	// ID del comité que tomó la decisión
	CommitteeID uuid.UUID `gorm:"type:uuid;not null" json:"committee_id"`
	// ID del caso del aprendiz (opcional)
	StudentCaseID *uuid.UUID `gorm:"type:uuid" json:"student_case_id,omitempty"`
	// Número de acta de decisión
	DecisionNumber string `gorm:"uniqueIndex;not null" json:"decision_number"`
	// Tipo de decisión
	Type string `gorm:"type:varchar(20);not null;check:type IN ('RECONOCIMIENTO','SANCION','RENOVACION_PLAN','APELACION')" json:"type"`
	// Título de la decisión
	Title string `gorm:"not null" json:"title"`
	// Descripción detallada
	Description string `gorm:"type:text;not null" json:"description"`
	// Resolución tomada
	Resolution string `gorm:"type:text;not null" json:"resolution"`
	// Justificación de la decisión
	Justification string `gorm:"type:text;not null" json:"justification"`
	// Resultado de la votación
	VotingResult string `gorm:"type:text" json:"voting_result"`
	// Lista de asistentes
	AttendeesList string `gorm:"type:text" json:"attendees_list"`
	// Estado de la decisión
	Status string `gorm:"type:varchar(20);not null;default:'BORRADOR';check:status IN ('BORRADOR','APROBADO','EJECUTADO','APELADO')" json:"status"`
	// Fecha de la decisión
	DecisionDate time.Time `gorm:"not null" json:"decision_date"`
	// Fecha de ejecución (opcional)
	ExecutionDate *time.Time `json:"execution_date,omitempty"`
	// Firma del presidente
	PresidentSignature bool `gorm:"default:false" json:"president_signature"`
	// Firma del secretario
	SecretarySignature bool `gorm:"default:false" json:"secretary_signature"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Committee   CommitteeModel    `gorm:"foreignKey:CommitteeID" json:"committee,omitempty"`
	StudentCase *StudentCaseModel `gorm:"foreignKey:StudentCaseID" json:"student_case,omitempty"`
}

// AppealModel representa el modelo de datos para apelaciones - Acuerdo 009/2024
type AppealModel struct {
	// ID único de la apelación (UUID v4)
	ID uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	// ID de la sanción apelada
	SanctionID uuid.UUID `gorm:"type:uuid;not null" json:"sanction_id"`
	// ID del aprendiz que apela
	StudentID uuid.UUID `gorm:"type:uuid;not null" json:"student_id"`
	// Fecha de presentación de la apelación
	SubmissionDate time.Time `gorm:"not null" json:"submission_date"`
	// Fecha límite legal para apelar
	DeadlineDate time.Time `gorm:"not null" json:"deadline_date"`
	// Fundamentos de la apelación
	AppealGrounds string `gorm:"type:text;not null" json:"appeal_grounds"`
	// Documentos de soporte (JSON)
	SupportingDocuments datatypes.JSON `gorm:"type:jsonb" json:"supporting_documents"`
	// Estado de admisibilidad
	AdmissibilityStatus string `gorm:"type:varchar(20);default:'PENDIENTE';check:admissibility_status IN ('PENDIENTE','ADMITIDA','RECHAZADA')" json:"admissibility_status"`
	// Justificación de admisibilidad
	AdmissibilityRationale *string `gorm:"type:text" json:"admissibility_rationale,omitempty"`
	// ID del comité de segunda instancia (opcional)
	SecondInstanceCommitteeID *uuid.UUID `gorm:"type:uuid" json:"second_instance_committee_id,omitempty"`
	// Decisión final de la apelación
	FinalDecision *string `gorm:"type:varchar(20);check:final_decision IN ('CONFIRMADA','MODIFICADA','REVOCADA')" json:"final_decision,omitempty"`
	// Justificación de la decisión final
	FinalRationale *string `gorm:"type:text" json:"final_rationale,omitempty"`

	// --- Campos de Auditoría ---
	CreatedAt time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relaciones
	Sanction                SanctionModel   `gorm:"foreignKey:SanctionID" json:"sanction,omitempty"`
	SecondInstanceCommittee *CommitteeModel `gorm:"foreignKey:SecondInstanceCommitteeID" json:"second_instance_committee,omitempty"`
}

// TableName methods para nombres de tabla personalizados
func (CommitteeModel) TableName() string         { return "committees" }
func (CommitteeMemberModel) TableName() string   { return "committee_members" }
func (StudentCaseModel) TableName() string       { return "student_cases" }
func (ImprovementPlanModel) TableName() string   { return "improvement_plans" }
func (SanctionModel) TableName() string          { return "sanctions" }
func (CommitteeDecisionModel) TableName() string { return "committee_decisions" }
func (AppealModel) TableName() string            { return "appeals" }
