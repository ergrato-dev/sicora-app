package models

import (
	"time"

	"scheduleservice/internal/domain/entities"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// =============================================================================
// MODELOS DE COMPETENCIAS Y RESULTADOS DE APRENDIZAJE
// =============================================================================

// CompetenciaModel representa el modelo de base de datos para Competencia
type CompetenciaModel struct {
	ID                uuid.UUID             `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Codigo            string                `gorm:"type:varchar(20);uniqueIndex;not null" json:"codigo"`
	Nombre            string                `gorm:"type:varchar(300);not null" json:"nombre"`
	Descripcion       string                `gorm:"type:text" json:"descripcion"`
	Tipo              string                `gorm:"type:varchar(20);not null" json:"tipo"` // TECNICA, TRANSVERSAL
	HorasEstimadas    int                   `gorm:"not null;default:0" json:"horas_estimadas"`
	AcademicProgramID uuid.UUID             `gorm:"type:uuid;not null;index" json:"academic_program_id"`
	AcademicProgram   *AcademicProgramModel `gorm:"foreignKey:AcademicProgramID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"academic_program,omitempty"`
	Orden             int                   `gorm:"default:0" json:"orden"`
	IsActive          bool                  `gorm:"default:true;not null" json:"is_active"`
	CreatedAt         time.Time             `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt         time.Time             `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt         gorm.DeletedAt        `gorm:"index" json:"deleted_at,omitempty"`
	// Relación inversa
	ResultadosAprendizaje []ResultadoAprendizajeModel `gorm:"foreignKey:CompetenciaID" json:"resultados_aprendizaje,omitempty"`
}

// ResultadoAprendizajeModel representa el modelo de base de datos para RAP
type ResultadoAprendizajeModel struct {
	ID             uuid.UUID         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Codigo         string            `gorm:"type:varchar(20);uniqueIndex;not null" json:"codigo"`
	Nombre         string            `gorm:"type:varchar(500);not null" json:"nombre"`
	Descripcion    string            `gorm:"type:text" json:"descripcion"`
	CompetenciaID  uuid.UUID         `gorm:"type:uuid;not null;index" json:"competencia_id"`
	Competencia    *CompetenciaModel `gorm:"foreignKey:CompetenciaID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"competencia,omitempty"`
	HorasEstimadas int               `gorm:"not null;default:0" json:"horas_estimadas"`
	Trimestre      int               `gorm:"default:0" json:"trimestre"`
	Orden          int               `gorm:"default:0" json:"orden"`
	IsActive       bool              `gorm:"default:true;not null" json:"is_active"`
	CreatedAt      time.Time         `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt      time.Time         `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt      gorm.DeletedAt    `gorm:"index" json:"deleted_at,omitempty"`
}

// =============================================================================
// MODELOS BASE
// =============================================================================

// CampusModel representa el modelo de base de datos para Campus
type CampusModel struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string         `gorm:"type:varchar(100);not null" json:"name"`
	Code      string         `gorm:"type:varchar(20);uniqueIndex;not null" json:"code"`
	Address   string         `gorm:"type:text" json:"address"`
	City      string         `gorm:"type:varchar(50)" json:"city"`
	IsActive  bool           `gorm:"default:true;not null" json:"is_active"`
	CreatedAt time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// AcademicProgramModel representa el modelo de base de datos para AcademicProgram
type AcademicProgramModel struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name             string         `gorm:"type:varchar(200);not null" json:"name"`
	Code             string         `gorm:"type:varchar(20);uniqueIndex;not null" json:"code"`
	Type             string         `gorm:"type:varchar(50);not null" json:"type"`
	Version          string         `gorm:"type:varchar(20)" json:"version"`
	Duration         int            `gorm:"not null" json:"duration"`
	TotalHours       int            `gorm:"not null;default:0" json:"total_hours"`
	LectiveHours     int            `gorm:"not null;default:0" json:"lective_hours"`
	ProductiveHours  int            `gorm:"not null;default:0" json:"productive_hours"`
	Credits          int            `gorm:"default:0" json:"credits"`
	KnowledgeNetwork string         `gorm:"type:varchar(200)" json:"knowledge_network"`
	TechnologyLine   string         `gorm:"type:varchar(200)" json:"technology_line"`
	IsActive         bool           `gorm:"default:true;not null" json:"is_active"`
	Description      string         `gorm:"type:text" json:"description"`
	CreatedAt        time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	// Relación inversa
	Competencias []CompetenciaModel `gorm:"foreignKey:AcademicProgramID" json:"competencias,omitempty"`
}

// AcademicGroupModel representa el modelo de base de datos para AcademicGroup
type AcademicGroupModel struct {
	ID                uuid.UUID             `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Number            string                `gorm:"type:varchar(20);uniqueIndex;not null" json:"number"`
	AcademicProgramID uuid.UUID             `gorm:"type:uuid;not null;index" json:"academic_program_id"`
	AcademicProgram   *AcademicProgramModel `gorm:"foreignKey:AcademicProgramID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"academic_program,omitempty"`
	Quarter           int                   `gorm:"not null" json:"quarter"`
	Year              int                   `gorm:"not null" json:"year"`
	Shift             string                `gorm:"type:varchar(20);not null" json:"shift"`
	StartDate         time.Time             `gorm:"type:date" json:"start_date"`
	EndDate           time.Time             `gorm:"type:date" json:"end_date"`
	StudentCount      int                   `gorm:"default:0" json:"student_count"`
	IsActive          bool                  `gorm:"default:true;not null" json:"is_active"`
	CreatedAt         time.Time             `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt         time.Time             `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt         gorm.DeletedAt        `gorm:"index" json:"deleted_at,omitempty"`
}

// VenueModel representa el modelo de base de datos para Venue
type VenueModel struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Code        string         `gorm:"type:varchar(20);uniqueIndex;not null" json:"code"`
	Type        string         `gorm:"type:varchar(50);not null" json:"type"`
	Capacity    int            `gorm:"not null" json:"capacity"`
	CampusID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"campus_id"`
	Campus      *CampusModel   `gorm:"foreignKey:CampusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"campus,omitempty"`
	Floor       string         `gorm:"type:varchar(10)" json:"floor"`
	Building    string         `gorm:"type:varchar(50)" json:"building"`
	Description string         `gorm:"type:text" json:"description"`
	Equipment   string         `gorm:"type:text" json:"equipment"`
	IsActive    bool           `gorm:"default:true;not null" json:"is_active"`
	CreatedAt   time.Time      `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// ScheduleModel representa el modelo de base de datos para Schedule
type ScheduleModel struct {
	ID                     uuid.UUID                  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	AcademicGroupID        uuid.UUID                  `gorm:"type:uuid;not null;index" json:"academic_group_id"`
	AcademicGroup          *AcademicGroupModel        `gorm:"foreignKey:AcademicGroupID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"academic_group,omitempty"`
	InstructorID           uuid.UUID                  `gorm:"type:uuid;not null;index" json:"instructor_id"`
	VenueID                uuid.UUID                  `gorm:"type:uuid;not null;index" json:"venue_id"`
	Venue                  *VenueModel                `gorm:"foreignKey:VenueID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"venue,omitempty"`
	ResultadoAprendizajeID uuid.UUID                  `gorm:"type:uuid;not null;index" json:"resultado_aprendizaje_id"`
	ResultadoAprendizaje   *ResultadoAprendizajeModel `gorm:"foreignKey:ResultadoAprendizajeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"resultado_aprendizaje,omitempty"`
	Subject                string                     `gorm:"type:varchar(200)" json:"subject"` // Campo legacy
	DayOfWeek              int                        `gorm:"not null" json:"day_of_week"`
	StartTime              time.Time                  `gorm:"type:time;not null" json:"start_time"`
	EndTime                time.Time                  `gorm:"type:time;not null" json:"end_time"`
	BlockIdentifier        string                     `gorm:"type:varchar(10);not null" json:"block_identifier"`
	StartDate              time.Time                  `gorm:"type:date;not null" json:"start_date"`
	EndDate                time.Time                  `gorm:"type:date;not null" json:"end_date"`
	Shift                  string                     `gorm:"type:varchar(20)" json:"shift"`
	Status                 string                     `gorm:"type:varchar(20);default:ACTIVO" json:"status"`
	Notes                  string                     `gorm:"type:text" json:"notes"`
	IsActive               bool                       `gorm:"default:true;not null" json:"is_active"`
	CreatedAt              time.Time                  `gorm:"autoCreateTime;not null" json:"created_at"`
	UpdatedAt              time.Time                  `gorm:"autoUpdateTime;not null" json:"updated_at"`
	DeletedAt              gorm.DeletedAt             `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName especifica nombres de tabla personalizados
func (CampusModel) TableName() string               { return "campuses" }
func (AcademicProgramModel) TableName() string      { return "academic_programs" }
func (AcademicGroupModel) TableName() string        { return "academic_groups" }
func (VenueModel) TableName() string                { return "venues" }
func (ScheduleModel) TableName() string             { return "schedules" }
func (CompetenciaModel) TableName() string          { return "competencias" }
func (ResultadoAprendizajeModel) TableName() string { return "resultados_aprendizaje" }

// BeforeCreate hooks para modelos
func (c *CampusModel) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

func (ap *AcademicProgramModel) BeforeCreate(tx *gorm.DB) error {
	if ap.ID == uuid.Nil {
		ap.ID = uuid.New()
	}
	return nil
}

func (ag *AcademicGroupModel) BeforeCreate(tx *gorm.DB) error {
	if ag.ID == uuid.Nil {
		ag.ID = uuid.New()
	}
	return nil
}

func (v *VenueModel) BeforeCreate(tx *gorm.DB) error {
	if v.ID == uuid.Nil {
		v.ID = uuid.New()
	}
	return nil
}

func (s *ScheduleModel) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// Métodos de conversión entre Domain y Model

// ToEntity convierte CampusModel a entidad de dominio
func (c *CampusModel) ToEntity() *entities.Campus {
	return &entities.Campus{
		ID:        c.ID,
		Name:      c.Name,
		Code:      c.Code,
		Address:   c.Address,
		City:      c.City,
		IsActive:  c.IsActive,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}

// FromEntity convierte entidad de dominio a CampusModel
func (c *CampusModel) FromEntity(entity *entities.Campus) {
	c.ID = entity.ID
	c.Name = entity.Name
	c.Code = entity.Code
	c.Address = entity.Address
	c.City = entity.City
	c.IsActive = entity.IsActive
	c.CreatedAt = entity.CreatedAt
	c.UpdatedAt = entity.UpdatedAt
}

// ToEntity convierte AcademicProgramModel a entidad de dominio
func (ap *AcademicProgramModel) ToEntity() *entities.AcademicProgram {
	return &entities.AcademicProgram{
		ID:               ap.ID,
		Name:             ap.Name,
		Code:             ap.Code,
		Type:             entities.TipoPrograma(ap.Type),
		Version:          ap.Version,
		Duration:         ap.Duration,
		TotalHours:       ap.TotalHours,
		LectiveHours:     ap.LectiveHours,
		ProductiveHours:  ap.ProductiveHours,
		Credits:          ap.Credits,
		KnowledgeNetwork: ap.KnowledgeNetwork,
		TechnologyLine:   ap.TechnologyLine,
		IsActive:         ap.IsActive,
		Description:      ap.Description,
		CreatedAt:        ap.CreatedAt,
		UpdatedAt:        ap.UpdatedAt,
	}
}

// FromEntity convierte entidad de dominio a AcademicProgramModel
func (ap *AcademicProgramModel) FromEntity(entity *entities.AcademicProgram) {
	ap.ID = entity.ID
	ap.Name = entity.Name
	ap.Code = entity.Code
	ap.Type = string(entity.Type)
	ap.Version = entity.Version
	ap.Duration = entity.Duration
	ap.TotalHours = entity.TotalHours
	ap.LectiveHours = entity.LectiveHours
	ap.ProductiveHours = entity.ProductiveHours
	ap.Credits = entity.Credits
	ap.KnowledgeNetwork = entity.KnowledgeNetwork
	ap.TechnologyLine = entity.TechnologyLine
	ap.IsActive = entity.IsActive
	ap.Description = entity.Description
	ap.CreatedAt = entity.CreatedAt
	ap.UpdatedAt = entity.UpdatedAt
}

// ToEntity convierte AcademicGroupModel a entidad de dominio
func (ag *AcademicGroupModel) ToEntity() *entities.AcademicGroup {
	entity := &entities.AcademicGroup{
		ID:                ag.ID,
		Number:            ag.Number,
		AcademicProgramID: ag.AcademicProgramID,
		Quarter:           ag.Quarter,
		Year:              ag.Year,
		Shift:             entities.Jornada(ag.Shift),
		StartDate:         ag.StartDate,
		EndDate:           ag.EndDate,
		StudentCount:      ag.StudentCount,
		IsActive:          ag.IsActive,
		CreatedAt:         ag.CreatedAt,
		UpdatedAt:         ag.UpdatedAt,
	}

	if ag.AcademicProgram != nil {
		entity.AcademicProgram = ag.AcademicProgram.ToEntity()
	}

	return entity
}

// FromEntity convierte entidad de dominio a AcademicGroupModel
func (ag *AcademicGroupModel) FromEntity(entity *entities.AcademicGroup) {
	ag.ID = entity.ID
	ag.Number = entity.Number
	ag.AcademicProgramID = entity.AcademicProgramID
	ag.Quarter = entity.Quarter
	ag.Year = entity.Year
	ag.Shift = string(entity.Shift)
	ag.StartDate = entity.StartDate
	ag.EndDate = entity.EndDate
	ag.StudentCount = entity.StudentCount
	ag.IsActive = entity.IsActive
	ag.CreatedAt = entity.CreatedAt
	ag.UpdatedAt = entity.UpdatedAt
}

// ToEntity convierte VenueModel a entidad de dominio
func (v *VenueModel) ToEntity() *entities.Venue {
	entity := &entities.Venue{
		ID:          v.ID,
		Name:        v.Name,
		Code:        v.Code,
		Type:        entities.TipoAmbiente(v.Type),
		Capacity:    v.Capacity,
		CampusID:    v.CampusID,
		Floor:       v.Floor,
		Building:    v.Building,
		Description: v.Description,
		Equipment:   v.Equipment,
		IsActive:    v.IsActive,
		CreatedAt:   v.CreatedAt,
		UpdatedAt:   v.UpdatedAt,
	}

	if v.Campus != nil {
		entity.Campus = v.Campus.ToEntity()
	}

	return entity
}

// FromEntity convierte entidad de dominio a VenueModel
func (v *VenueModel) FromEntity(entity *entities.Venue) {
	v.ID = entity.ID
	v.Name = entity.Name
	v.Code = entity.Code
	v.Type = string(entity.Type)
	v.Capacity = entity.Capacity
	v.CampusID = entity.CampusID
	v.Floor = entity.Floor
	v.Building = entity.Building
	v.Description = entity.Description
	v.Equipment = entity.Equipment
	v.IsActive = entity.IsActive
	v.CreatedAt = entity.CreatedAt
	v.UpdatedAt = entity.UpdatedAt
}

// ToEntity convierte ScheduleModel a entidad de dominio
func (s *ScheduleModel) ToEntity() *entities.Schedule {
	entity := &entities.Schedule{
		ID:                     s.ID,
		AcademicGroupID:        s.AcademicGroupID,
		InstructorID:           s.InstructorID,
		VenueID:                s.VenueID,
		ResultadoAprendizajeID: s.ResultadoAprendizajeID,
		Subject:                s.Subject,
		DayOfWeek:              s.DayOfWeek,
		StartTime:              s.StartTime,
		EndTime:                s.EndTime,
		BlockIdentifier:        s.BlockIdentifier,
		StartDate:              s.StartDate,
		EndDate:                s.EndDate,
		Shift:                  entities.Jornada(s.Shift),
		Status:                 entities.EstadoHorario(s.Status),
		Notes:                  s.Notes,
		IsActive:               s.IsActive,
		CreatedAt:              s.CreatedAt,
		UpdatedAt:              s.UpdatedAt,
	}

	if s.AcademicGroup != nil {
		entity.AcademicGroup = s.AcademicGroup.ToEntity()
	}

	if s.Venue != nil {
		entity.Venue = s.Venue.ToEntity()
	}

	if s.ResultadoAprendizaje != nil {
		entity.ResultadoAprendizaje = s.ResultadoAprendizaje.ToEntity()
	}

	return entity
}

// FromEntity convierte entidad de dominio a ScheduleModel
func (s *ScheduleModel) FromEntity(entity *entities.Schedule) {
	s.ID = entity.ID
	s.AcademicGroupID = entity.AcademicGroupID
	s.InstructorID = entity.InstructorID
	s.VenueID = entity.VenueID
	s.ResultadoAprendizajeID = entity.ResultadoAprendizajeID
	s.Subject = entity.Subject
	s.DayOfWeek = entity.DayOfWeek
	s.StartTime = entity.StartTime
	s.EndTime = entity.EndTime
	s.BlockIdentifier = entity.BlockIdentifier
	s.StartDate = entity.StartDate
	s.EndDate = entity.EndDate
	s.Shift = string(entity.Shift)
	s.Status = string(entity.Status)
	s.Notes = entity.Notes
	s.IsActive = entity.IsActive
	s.CreatedAt = entity.CreatedAt
	s.UpdatedAt = entity.UpdatedAt
}

// Funciones de conversión estáticas

// FromCampusDomain convierte entidad Campus a modelo
func FromCampusDomain(entity *entities.Campus) *CampusModel {
	model := &CampusModel{}
	model.FromEntity(entity)
	return model
}

// FromAcademicProgramDomain convierte entidad AcademicProgram a modelo
func FromAcademicProgramDomain(entity *entities.AcademicProgram) *AcademicProgramModel {
	model := &AcademicProgramModel{}
	model.FromEntity(entity)
	return model
}

// FromAcademicGroupDomain convierte entidad AcademicGroup a modelo
func FromAcademicGroupDomain(entity *entities.AcademicGroup) *AcademicGroupModel {
	model := &AcademicGroupModel{}
	model.FromEntity(entity)
	return model
}

// FromVenueDomain convierte entidad Venue a modelo
func FromVenueDomain(entity *entities.Venue) *VenueModel {
	model := &VenueModel{}
	model.FromEntity(entity)
	return model
}

// FromScheduleDomain convierte entidad Schedule a modelo
func FromScheduleDomain(entity *entities.Schedule) *ScheduleModel {
	model := &ScheduleModel{}
	model.FromEntity(entity)
	return model
}

// =============================================================================
// MÉTODOS PARA COMPETENCIA Y RESULTADO DE APRENDIZAJE
// =============================================================================

// ToEntity convierte CompetenciaModel a entidad de dominio
func (c *CompetenciaModel) ToEntity() *entities.Competencia {
	entity := &entities.Competencia{
		ID:                c.ID,
		Codigo:            c.Codigo,
		Nombre:            c.Nombre,
		Descripcion:       c.Descripcion,
		Tipo:              entities.TipoCompetencia(c.Tipo),
		HorasEstimadas:    c.HorasEstimadas,
		AcademicProgramID: c.AcademicProgramID,
		Orden:             c.Orden,
		IsActive:          c.IsActive,
		CreatedAt:         c.CreatedAt,
		UpdatedAt:         c.UpdatedAt,
	}

	if c.AcademicProgram != nil {
		entity.AcademicProgram = c.AcademicProgram.ToEntity()
	}

	// Convertir resultados de aprendizaje si existen
	if len(c.ResultadosAprendizaje) > 0 {
		entity.ResultadosAprendizaje = make([]entities.ResultadoAprendizaje, len(c.ResultadosAprendizaje))
		for i, rap := range c.ResultadosAprendizaje {
			rapEntity := rap.ToEntity()
			entity.ResultadosAprendizaje[i] = *rapEntity
		}
	}

	return entity
}

// FromEntity convierte entidad de dominio a CompetenciaModel
func (c *CompetenciaModel) FromEntity(entity *entities.Competencia) {
	c.ID = entity.ID
	c.Codigo = entity.Codigo
	c.Nombre = entity.Nombre
	c.Descripcion = entity.Descripcion
	c.Tipo = string(entity.Tipo)
	c.HorasEstimadas = entity.HorasEstimadas
	c.AcademicProgramID = entity.AcademicProgramID
	c.Orden = entity.Orden
	c.IsActive = entity.IsActive
	c.CreatedAt = entity.CreatedAt
	c.UpdatedAt = entity.UpdatedAt
}

// ToEntity convierte ResultadoAprendizajeModel a entidad de dominio
func (r *ResultadoAprendizajeModel) ToEntity() *entities.ResultadoAprendizaje {
	entity := &entities.ResultadoAprendizaje{
		ID:             r.ID,
		Codigo:         r.Codigo,
		Nombre:         r.Nombre,
		Descripcion:    r.Descripcion,
		CompetenciaID:  r.CompetenciaID,
		HorasEstimadas: r.HorasEstimadas,
		Trimestre:      r.Trimestre,
		Orden:          r.Orden,
		IsActive:       r.IsActive,
		CreatedAt:      r.CreatedAt,
		UpdatedAt:      r.UpdatedAt,
	}

	if r.Competencia != nil {
		entity.Competencia = r.Competencia.ToEntity()
	}

	return entity
}

// FromEntity convierte entidad de dominio a ResultadoAprendizajeModel
func (r *ResultadoAprendizajeModel) FromEntity(entity *entities.ResultadoAprendizaje) {
	r.ID = entity.ID
	r.Codigo = entity.Codigo
	r.Nombre = entity.Nombre
	r.Descripcion = entity.Descripcion
	r.CompetenciaID = entity.CompetenciaID
	r.HorasEstimadas = entity.HorasEstimadas
	r.Trimestre = entity.Trimestre
	r.Orden = entity.Orden
	r.IsActive = entity.IsActive
	r.CreatedAt = entity.CreatedAt
	r.UpdatedAt = entity.UpdatedAt
}

// BeforeCreate hooks para nuevos modelos

// BeforeCreate genera UUID para Competencia
func (c *CompetenciaModel) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// BeforeCreate genera UUID para ResultadoAprendizaje
func (r *ResultadoAprendizajeModel) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// Funciones de conversión estáticas para nuevos modelos

// FromCompetenciaDomain convierte entidad Competencia a modelo
func FromCompetenciaDomain(entity *entities.Competencia) *CompetenciaModel {
	model := &CompetenciaModel{}
	model.FromEntity(entity)
	return model
}

// FromResultadoAprendizajeDomain convierte entidad ResultadoAprendizaje a modelo
func FromResultadoAprendizajeDomain(entity *entities.ResultadoAprendizaje) *ResultadoAprendizajeModel {
	model := &ResultadoAprendizajeModel{}
	model.FromEntity(entity)
	return model
}
