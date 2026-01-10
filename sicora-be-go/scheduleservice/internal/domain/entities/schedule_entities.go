package entities

import (
	"time"

	"github.com/google/uuid"
)

// =============================================================================
// ENUMS Y CONSTANTES
// =============================================================================

// TipoCompetencia define los tipos de competencia
type TipoCompetencia string

const (
	TipoCompetenciaTecnica     TipoCompetencia = "TECNICA"
	TipoCompetenciaTransversal TipoCompetencia = "TRANSVERSAL"
)

// TipoPrograma define los tipos de programa de formación
type TipoPrograma string

const (
	TipoProgramaTecnico         TipoPrograma = "TECNICO"
	TipoProgramaTecnologo       TipoPrograma = "TECNOLOGO"
	TipoProgramaEspecializacion TipoPrograma = "ESPECIALIZACION"
	TipoProgramaCursoCorto      TipoPrograma = "CURSO_CORTO"
	TipoProgramaComplementaria  TipoPrograma = "COMPLEMENTARIA"
)

// TipoAmbiente define los tipos de ambiente de formación
type TipoAmbiente string

const (
	TipoAmbienteAula        TipoAmbiente = "AULA"
	TipoAmbienteLaboratorio TipoAmbiente = "LABORATORIO"
	TipoAmbienteTaller      TipoAmbiente = "TALLER"
	TipoAmbienteAuditorio   TipoAmbiente = "AUDITORIO"
	TipoAmbienteBiblioteca  TipoAmbiente = "BIBLIOTECA"
	TipoAmbienteVirtual     TipoAmbiente = "VIRTUAL"
)

// Jornada define las jornadas de formación
type Jornada string

const (
	JornadaDiurna    Jornada = "DIURNA"    // 6:00 a.m. a 6:00 p.m.
	JornadaNocturna  Jornada = "NOCTURNA"  // 6:00 p.m. a 10:00 p.m.
	JornadaMadrugada Jornada = "MADRUGADA" // 10:00 p.m. a 6:00 a.m.
	JornadaMixta     Jornada = "MIXTA"     // Combinación de jornadas
)

// EstadoHorario define los estados de un horario
type EstadoHorario string

const (
	EstadoHorarioActivo     EstadoHorario = "ACTIVO"
	EstadoHorarioCancelado  EstadoHorario = "CANCELADO"
	EstadoHorarioSuspendido EstadoHorario = "SUSPENDIDO"
)

// =============================================================================
// ENTIDADES DE COMPETENCIAS Y RESULTADOS DE APRENDIZAJE
// =============================================================================

// Competencia representa una competencia del programa de formación
// Ejemplo: "220501096 - Desarrollar la solución de software"
type Competencia struct {
	ID                    uuid.UUID              `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Codigo                string                 `json:"codigo" gorm:"column:codigo;type:varchar(20);uniqueIndex;not null" validate:"required,min=6,max=20"`
	Nombre                string                 `json:"nombre" gorm:"column:nombre;type:varchar(300);not null" validate:"required,min=10,max=300"`
	Descripcion           string                 `json:"descripcion" gorm:"column:descripcion;type:text"`
	Tipo                  TipoCompetencia        `json:"tipo" gorm:"column:tipo;type:varchar(20);not null" validate:"required,oneof=TECNICA TRANSVERSAL"`
	HorasEstimadas        int                    `json:"horas_estimadas" gorm:"column:horas_estimadas;not null;default:0" validate:"min=0,max=2000"`
	AcademicProgramID     uuid.UUID              `json:"academic_program_id" gorm:"column:academic_program_id;type:uuid;not null;index" validate:"required"`
	AcademicProgram       *AcademicProgram       `json:"academic_program,omitempty" gorm:"foreignKey:AcademicProgramID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Orden                 int                    `json:"orden" gorm:"column:orden;default:0"` // Para ordenar competencias dentro del programa
	IsActive              bool                   `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt             time.Time              `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt             time.Time              `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
	ResultadosAprendizaje []ResultadoAprendizaje `json:"resultados_aprendizaje,omitempty" gorm:"foreignKey:CompetenciaID"`
}

// ResultadoAprendizaje representa un RAP (Resultado de Aprendizaje)
// Ejemplo: "220501096-01 - Planear actividades de construcción del software"
type ResultadoAprendizaje struct {
	ID             uuid.UUID    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Codigo         string       `json:"codigo" gorm:"column:codigo;type:varchar(20);uniqueIndex;not null" validate:"required,min=8,max=20"`
	Nombre         string       `json:"nombre" gorm:"column:nombre;type:varchar(500);not null" validate:"required,min=10,max=500"`
	Descripcion    string       `json:"descripcion" gorm:"column:descripcion;type:text"`
	CompetenciaID  uuid.UUID    `json:"competencia_id" gorm:"column:competencia_id;type:uuid;not null;index" validate:"required"`
	Competencia    *Competencia `json:"competencia,omitempty" gorm:"foreignKey:CompetenciaID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	HorasEstimadas int          `json:"horas_estimadas" gorm:"column:horas_estimadas;not null;default:0" validate:"min=0,max=500"`
	Trimestre      int          `json:"trimestre" gorm:"column:trimestre;default:0" validate:"min=0,max=10"` // Trimestre sugerido para desarrollar el RAP
	Orden          int          `json:"orden" gorm:"column:orden;default:0"`                                 // Para ordenar RAPs dentro de la competencia
	IsActive       bool         `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt      time.Time    `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt      time.Time    `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// =============================================================================
// ENTIDADES BASE
// =============================================================================

// Campus representa una sede educativa
type Campus struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name      string    `json:"name" gorm:"column:name;type:varchar(100);not null" validate:"required,min=2,max=100"`
	Code      string    `json:"code" gorm:"column:code;type:varchar(20);uniqueIndex;not null" validate:"required,min=2,max=20"`
	Address   string    `json:"address" gorm:"column:address;type:text"`
	City      string    `json:"city" gorm:"column:city;type:varchar(50)" validate:"max=50"`
	IsActive  bool      `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// AcademicProgram representa un programa académico (Técnico, Tecnólogo, etc.)
type AcademicProgram struct {
	ID               uuid.UUID     `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name             string        `json:"name" gorm:"column:name;type:varchar(200);not null" validate:"required,min=5,max=200"`
	Code             string        `json:"code" gorm:"column:code;type:varchar(20);uniqueIndex;not null" validate:"required,min=2,max=20"`
	Type             TipoPrograma  `json:"type" gorm:"column:type;type:varchar(50);not null" validate:"required,oneof=TECNICO TECNOLOGO ESPECIALIZACION CURSO_CORTO COMPLEMENTARIA"`
	Version          string        `json:"version" gorm:"column:version;type:varchar(20)" validate:"max=20"`                             // Versión del diseño curricular
	Duration         int           `json:"duration" gorm:"column:duration;not null" validate:"required,min=1,max=60"`                    // Duración en meses
	TotalHours       int           `json:"total_hours" gorm:"column:total_hours;not null;default:0" validate:"min=0,max=10000"`          // Horas totales del programa
	LectiveHours     int           `json:"lective_hours" gorm:"column:lective_hours;not null;default:0" validate:"min=0,max=10000"`      // Horas etapa lectiva
	ProductiveHours  int           `json:"productive_hours" gorm:"column:productive_hours;not null;default:0" validate:"min=0,max=5000"` // Horas etapa productiva
	Credits          int           `json:"credits" gorm:"column:credits;default:0" validate:"min=0,max=200"`                             // Créditos académicos
	KnowledgeNetwork string        `json:"knowledge_network" gorm:"column:knowledge_network;type:varchar(200)"`                          // Red de conocimiento
	TechnologyLine   string        `json:"technology_line" gorm:"column:technology_line;type:varchar(200)"`                              // Línea tecnológica
	IsActive         bool          `json:"is_active" gorm:"column:is_active;default:true"`
	Description      string        `json:"description" gorm:"column:description;type:text"`
	CreatedAt        time.Time     `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt        time.Time     `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
	Competencias     []Competencia `json:"competencias,omitempty" gorm:"foreignKey:AcademicProgramID"`
}

// AcademicGroup representa una ficha/grupo de estudiantes
type AcademicGroup struct {
	ID                uuid.UUID        `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Number            string           `json:"number" gorm:"column:number;type:varchar(20);uniqueIndex;not null" validate:"required,min=4,max=20"`
	AcademicProgramID uuid.UUID        `json:"academic_program_id" gorm:"column:academic_program_id;type:uuid;not null" validate:"required"`
	AcademicProgram   *AcademicProgram `json:"academic_program,omitempty" gorm:"foreignKey:AcademicProgramID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Quarter           int              `json:"quarter" gorm:"column:quarter;not null" validate:"required,min=1,max=10"` // Trimestre actual
	Year              int              `json:"year" gorm:"column:year;not null" validate:"required,min=2020,max=2030"`
	Shift             Jornada          `json:"shift" gorm:"column:shift;type:varchar(20);not null" validate:"required,oneof=DIURNA NOCTURNA MADRUGADA MIXTA"`
	StartDate         time.Time        `json:"start_date" gorm:"column:start_date;type:date"`       // Fecha de inicio de la ficha
	EndDate           time.Time        `json:"end_date" gorm:"column:end_date;type:date"`           // Fecha estimada de finalización
	StudentCount      int              `json:"student_count" gorm:"column:student_count;default:0"` // Cantidad de aprendices
	IsActive          bool             `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt         time.Time        `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt         time.Time        `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// Venue representa un ambiente/aula/laboratorio
type Venue struct {
	ID          uuid.UUID    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string       `json:"name" gorm:"column:name;type:varchar(100);not null" validate:"required,min=2,max=100"`
	Code        string       `json:"code" gorm:"column:code;type:varchar(20);uniqueIndex;not null" validate:"required,min=2,max=20"`
	Type        TipoAmbiente `json:"type" gorm:"column:type;type:varchar(50);not null" validate:"required,oneof=AULA LABORATORIO TALLER AUDITORIO BIBLIOTECA VIRTUAL"`
	Capacity    int          `json:"capacity" gorm:"column:capacity;not null" validate:"required,min=1,max=500"`
	CampusID    uuid.UUID    `json:"campus_id" gorm:"column:campus_id;type:uuid;not null" validate:"required"`
	Campus      *Campus      `json:"campus,omitempty" gorm:"foreignKey:CampusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Floor       string       `json:"floor" gorm:"column:floor;type:varchar(10)" validate:"max=10"`
	Building    string       `json:"building" gorm:"column:building;type:varchar(50)"` // Bloque o edificio
	Description string       `json:"description" gorm:"column:description;type:text"`
	Equipment   string       `json:"equipment" gorm:"column:equipment;type:text"` // Equipamiento disponible (JSON o texto)
	IsActive    bool         `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt   time.Time    `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time    `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// Schedule representa un horario específico
// Un instructor selecciona: día → sede → ambiente → jornada → RAP
type Schedule struct {
	ID                     uuid.UUID             `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	AcademicGroupID        uuid.UUID             `json:"academic_group_id" gorm:"column:academic_group_id;type:uuid;not null" validate:"required"`
	AcademicGroup          *AcademicGroup        `json:"academic_group,omitempty" gorm:"foreignKey:AcademicGroupID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	InstructorID           uuid.UUID             `json:"instructor_id" gorm:"column:instructor_id;type:uuid;not null" validate:"required"`
	VenueID                uuid.UUID             `json:"venue_id" gorm:"column:venue_id;type:uuid;not null" validate:"required"`
	Venue                  *Venue                `json:"venue,omitempty" gorm:"foreignKey:VenueID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	ResultadoAprendizajeID uuid.UUID             `json:"resultado_aprendizaje_id" gorm:"column:resultado_aprendizaje_id;type:uuid;not null;index" validate:"required"`
	ResultadoAprendizaje   *ResultadoAprendizaje `json:"resultado_aprendizaje,omitempty" gorm:"foreignKey:ResultadoAprendizajeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Subject                string                `json:"subject" gorm:"column:subject;type:varchar(200)"`                                // Campo legacy para compatibilidad, se llena automáticamente del RAP
	DayOfWeek              int                   `json:"day_of_week" gorm:"column:day_of_week;not null" validate:"required,min=1,max=7"` // 1=Lunes, 7=Domingo
	StartTime              time.Time             `json:"start_time" gorm:"column:start_time;type:time;not null" validate:"required"`
	EndTime                time.Time             `json:"end_time" gorm:"column:end_time;type:time;not null" validate:"required"`
	BlockIdentifier        string                `json:"block_identifier" gorm:"column:block_identifier;type:varchar(10);not null" validate:"required,min=4,max=10"` // MLUN1, TMAR2, etc.
	StartDate              time.Time             `json:"start_date" gorm:"column:start_date;type:date;not null" validate:"required"`
	EndDate                time.Time             `json:"end_date" gorm:"column:end_date;type:date;not null" validate:"required"`
	Shift                  Jornada               `json:"shift" gorm:"column:shift;type:varchar(20)" validate:"oneof=DIURNA NOCTURNA MADRUGADA MIXTA"` // Jornada del horario
	Status                 EstadoHorario         `json:"status" gorm:"column:status;type:varchar(20);default:ACTIVO" validate:"oneof=ACTIVO CANCELADO SUSPENDIDO"`
	Notes                  string                `json:"notes" gorm:"column:notes;type:text"` // Observaciones del instructor
	IsActive               bool                  `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt              time.Time             `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt              time.Time             `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// TableName especifica el nombre de la tabla para cada entidad
func (Campus) TableName() string               { return "campuses" }
func (AcademicProgram) TableName() string      { return "academic_programs" }
func (AcademicGroup) TableName() string        { return "academic_groups" }
func (Venue) TableName() string                { return "venues" }
func (Schedule) TableName() string             { return "schedules" }
func (Competencia) TableName() string          { return "competencias" }
func (ResultadoAprendizaje) TableName() string { return "resultados_aprendizaje" }

// Métodos de validación de negocio

// IsValidTimeRange verifica si el rango de tiempo es válido
func (s *Schedule) IsValidTimeRange() bool {
	return s.StartTime.Before(s.EndTime)
}

// IsValidDateRange verifica si el rango de fechas es válido
func (s *Schedule) IsValidDateRange() bool {
	return s.StartDate.Before(s.EndDate) || s.StartDate.Equal(s.EndDate)
}

// GetShiftFromTime determina la jornada basada en la hora de inicio
func (s *Schedule) GetShiftFromTime() string {
	hour := s.StartTime.Hour()
	switch {
	case hour >= 6 && hour < 12:
		return "MANANA"
	case hour >= 12 && hour < 18:
		return "TARDE"
	case hour >= 18 && hour <= 22:
		return "NOCHE"
	default:
		return "UNKNOWN"
	}
}

// IsWeekday verifica si el día es entre semana
func (s *Schedule) IsWeekday() bool {
	return s.DayOfWeek >= 1 && s.DayOfWeek <= 5 // Lunes a Viernes
}

// IsWeekend verifica si el día es fin de semana
func (s *Schedule) IsWeekend() bool {
	return s.DayOfWeek == 6 || s.DayOfWeek == 7 // Sábado y Domingo
}
