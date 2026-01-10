package usecases

import (
	"context"
	"fmt"
	"log"

	"scheduleservice/internal/application/dtos"
	"scheduleservice/internal/domain/entities"
	"scheduleservice/internal/domain/repositories"

	"github.com/google/uuid"
)

// Consolidated use cases structs for handlers

// AcademicProgramUseCase agrupa todos los casos de uso para programas académicos
type AcademicProgramUseCase struct {
	CreateUseCase *CreateAcademicProgramUseCase
	ListUseCase   *ListAcademicProgramsUseCase
	GetUseCase    *GetAcademicProgramUseCase
	UpdateUseCase *UpdateAcademicProgramUseCase
	DeleteUseCase *DeleteAcademicProgramUseCase
}

// AcademicGroupUseCase agrupa todos los casos de uso para grupos académicos
type AcademicGroupUseCase struct {
	CreateUseCase *CreateAcademicGroupUseCase
	ListUseCase   *ListAcademicGroupsUseCase
	GetUseCase    *GetAcademicGroupUseCase
	UpdateUseCase *UpdateAcademicGroupUseCase
	DeleteUseCase *DeleteAcademicGroupUseCase
}

// VenueUseCase agrupa todos los casos de uso para venues
type VenueUseCase struct {
	CreateUseCase *CreateVenueUseCase
	ListUseCase   *ListVenuesUseCase
	GetUseCase    *GetVenueUseCase
	UpdateUseCase *UpdateVenueUseCase
	DeleteUseCase *DeleteVenueUseCase
}

// CampusUseCase agrupa todos los casos de uso para campus
type CampusUseCase struct {
	CreateUseCase *CreateCampusUseCase
	ListUseCase   *ListCampusesUseCase
	GetUseCase    *GetCampusUseCase
	UpdateUseCase *UpdateCampusUseCase
	DeleteUseCase *DeleteCampusUseCase
}

// CreateAcademicProgramUseCase caso de uso para crear programas académicos
type CreateAcademicProgramUseCase struct {
	programRepo repositories.AcademicProgramRepository
	logger      *log.Logger
}

// NewCreateAcademicProgramUseCase constructor
func NewCreateAcademicProgramUseCase(programRepo repositories.AcademicProgramRepository, logger *log.Logger) *CreateAcademicProgramUseCase {
	return &CreateAcademicProgramUseCase{
		programRepo: programRepo,
		logger:      logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *CreateAcademicProgramUseCase) Execute(ctx context.Context, req *dtos.CreateAcademicProgramRequest) (*dtos.AcademicProgramResponse, error) {
	// Verificar que no existe un programa con el mismo código
	existingProgram, err := uc.programRepo.GetByCode(ctx, req.Code)
	if err != nil {
		uc.logger.Printf("Error al verificar código del programa %s: %v", req.Code, err)
		return nil, fmt.Errorf("error al verificar código del programa: %w", err)
	}
	if existingProgram != nil {
		return nil, fmt.Errorf("ya existe un programa académico con el código: %s", req.Code)
	}

	// Crear entidad
	program := &entities.AcademicProgram{
		Name:        req.Name,
		Code:        req.Code,
		Type:        entities.TipoPrograma(req.Type),
		Duration:    req.Duration,
		Description: req.Description,
		IsActive:    true,
	}

	// Guardar en base de datos
	createdProgram, err := uc.programRepo.Create(ctx, program)
	if err != nil {
		uc.logger.Printf("Error al crear programa académico: %v", err)
		return nil, fmt.Errorf("error al crear programa académico: %w", err)
	}

	uc.logger.Printf("Programa académico creado exitosamente: %s", createdProgram.ID)

	// Convertir a DTO de respuesta
	return &dtos.AcademicProgramResponse{
		ID:          createdProgram.ID,
		Name:        createdProgram.Name,
		Code:        createdProgram.Code,
		Type:        string(createdProgram.Type),
		Duration:    createdProgram.Duration,
		Description: createdProgram.Description,
		IsActive:    createdProgram.IsActive,
		CreatedAt:   createdProgram.CreatedAt,
		UpdatedAt:   createdProgram.UpdatedAt,
	}, nil
}

// CreateAcademicGroupUseCase caso de uso para crear fichas/grupos
type CreateAcademicGroupUseCase struct {
	groupRepo   repositories.AcademicGroupRepository
	programRepo repositories.AcademicProgramRepository
	logger      *log.Logger
}

// NewCreateAcademicGroupUseCase constructor
func NewCreateAcademicGroupUseCase(
	groupRepo repositories.AcademicGroupRepository,
	programRepo repositories.AcademicProgramRepository,
	logger *log.Logger,
) *CreateAcademicGroupUseCase {
	return &CreateAcademicGroupUseCase{
		groupRepo:   groupRepo,
		programRepo: programRepo,
		logger:      logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *CreateAcademicGroupUseCase) Execute(ctx context.Context, req *dtos.CreateAcademicGroupRequest) (*dtos.AcademicGroupResponse, error) {
	// Verificar que no existe una ficha con el mismo número
	existingGroup, err := uc.groupRepo.GetByNumber(ctx, req.Number)
	if err != nil {
		uc.logger.Printf("Error al verificar número de ficha %s: %v", req.Number, err)
		return nil, fmt.Errorf("error al verificar número de ficha: %w", err)
	}
	if existingGroup != nil {
		return nil, fmt.Errorf("ya existe una ficha con el número: %s", req.Number)
	}

	// Verificar que el programa académico existe
	program, err := uc.programRepo.GetByID(ctx, req.AcademicProgramID)
	if err != nil {
		uc.logger.Printf("Error al buscar programa académico %s: %v", req.AcademicProgramID, err)
		return nil, fmt.Errorf("error al buscar programa académico: %w", err)
	}
	if program == nil {
		return nil, fmt.Errorf("programa académico no encontrado: %s", req.AcademicProgramID)
	}

	// Crear entidad
	group := &entities.AcademicGroup{
		Number:            req.Number,
		AcademicProgramID: req.AcademicProgramID,
		Quarter:           req.Quarter,
		Year:              req.Year,
		Shift:             entities.Jornada(req.Shift),
		IsActive:          true,
	}

	// Guardar en base de datos
	createdGroup, err := uc.groupRepo.Create(ctx, group)
	if err != nil {
		uc.logger.Printf("Error al crear ficha académica: %v", err)
		return nil, fmt.Errorf("error al crear ficha académica: %w", err)
	}

	uc.logger.Printf("Ficha académica creada exitosamente: %s", createdGroup.ID)

	// Convertir a DTO de respuesta
	return &dtos.AcademicGroupResponse{
		ID:                createdGroup.ID,
		Number:            createdGroup.Number,
		AcademicProgramID: createdGroup.AcademicProgramID,
		Quarter:           createdGroup.Quarter,
		Year:              createdGroup.Year,
		Shift:             string(createdGroup.Shift),
		IsActive:          createdGroup.IsActive,
		CreatedAt:         createdGroup.CreatedAt,
		UpdatedAt:         createdGroup.UpdatedAt,
		AcademicProgram: &dtos.AcademicProgramResponse{
			ID:          program.ID,
			Name:        program.Name,
			Code:        program.Code,
			Type:        string(program.Type),
			Duration:    program.Duration,
			Description: program.Description,
			IsActive:    program.IsActive,
			CreatedAt:   program.CreatedAt,
			UpdatedAt:   program.UpdatedAt,
		},
	}, nil
}

// CreateVenueUseCase caso de uso para crear ambientes/aulas
type CreateVenueUseCase struct {
	venueRepo  repositories.VenueRepository
	campusRepo repositories.CampusRepository
	logger     *log.Logger
}

// NewCreateVenueUseCase constructor
func NewCreateVenueUseCase(
	venueRepo repositories.VenueRepository,
	campusRepo repositories.CampusRepository,
	logger *log.Logger,
) *CreateVenueUseCase {
	return &CreateVenueUseCase{
		venueRepo:  venueRepo,
		campusRepo: campusRepo,
		logger:     logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *CreateVenueUseCase) Execute(ctx context.Context, req *dtos.CreateVenueRequest) (*dtos.VenueResponse, error) {
	// Verificar que no existe un ambiente con el mismo código
	existingVenue, err := uc.venueRepo.GetByCode(ctx, req.Code)
	if err != nil {
		uc.logger.Printf("Error al verificar código del ambiente %s: %v", req.Code, err)
		return nil, fmt.Errorf("error al verificar código del ambiente: %w", err)
	}
	if existingVenue != nil {
		return nil, fmt.Errorf("ya existe un ambiente con el código: %s", req.Code)
	}

	// Verificar que la sede existe
	campus, err := uc.campusRepo.GetByID(ctx, req.CampusID)
	if err != nil {
		uc.logger.Printf("Error al buscar sede %s: %v", req.CampusID, err)
		return nil, fmt.Errorf("error al buscar sede: %w", err)
	}
	if campus == nil {
		return nil, fmt.Errorf("sede no encontrada: %s", req.CampusID)
	}

	// Crear entidad
	venue := &entities.Venue{
		Name:     req.Name,
		Code:     req.Code,
		Type:     entities.TipoAmbiente(req.Type),
		Capacity: req.Capacity,
		CampusID: req.CampusID,
		Floor:    req.Floor,
		IsActive: true,
	}

	// Guardar en base de datos
	createdVenue, err := uc.venueRepo.Create(ctx, venue)
	if err != nil {
		uc.logger.Printf("Error al crear ambiente: %v", err)
		return nil, fmt.Errorf("error al crear ambiente: %w", err)
	}

	uc.logger.Printf("Ambiente creado exitosamente: %s", createdVenue.ID)

	// Convertir a DTO de respuesta
	return &dtos.VenueResponse{
		ID:        createdVenue.ID,
		Name:      createdVenue.Name,
		Code:      createdVenue.Code,
		Type:      string(createdVenue.Type),
		Capacity:  createdVenue.Capacity,
		CampusID:  createdVenue.CampusID,
		Floor:     createdVenue.Floor,
		IsActive:  createdVenue.IsActive,
		CreatedAt: createdVenue.CreatedAt,
		UpdatedAt: createdVenue.UpdatedAt,
		Campus: &dtos.CampusResponse{
			ID:        campus.ID,
			Name:      campus.Name,
			Code:      campus.Code,
			Address:   campus.Address,
			City:      campus.City,
			IsActive:  campus.IsActive,
			CreatedAt: campus.CreatedAt,
			UpdatedAt: campus.UpdatedAt,
		},
	}, nil
}

// CreateCampusUseCase caso de uso para crear sedes
type CreateCampusUseCase struct {
	campusRepo repositories.CampusRepository
	logger     *log.Logger
}

// NewCreateCampusUseCase constructor
func NewCreateCampusUseCase(campusRepo repositories.CampusRepository, logger *log.Logger) *CreateCampusUseCase {
	return &CreateCampusUseCase{
		campusRepo: campusRepo,
		logger:     logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *CreateCampusUseCase) Execute(ctx context.Context, req *dtos.CreateCampusRequest) (*dtos.CampusResponse, error) {
	// Verificar que no existe una sede con el mismo código
	existingCampus, err := uc.campusRepo.GetByCode(ctx, req.Code)
	if err != nil {
		uc.logger.Printf("Error al verificar código de sede %s: %v", req.Code, err)
		return nil, fmt.Errorf("error al verificar código de sede: %w", err)
	}
	if existingCampus != nil {
		return nil, fmt.Errorf("ya existe una sede con el código: %s", req.Code)
	}

	// Crear entidad
	campus := &entities.Campus{
		Name:     req.Name,
		Code:     req.Code,
		Address:  req.Address,
		City:     req.City,
		IsActive: true,
	}

	// Guardar en base de datos
	createdCampus, err := uc.campusRepo.Create(ctx, campus)
	if err != nil {
		uc.logger.Printf("Error al crear sede: %v", err)
		return nil, fmt.Errorf("error al crear sede: %w", err)
	}

	uc.logger.Printf("Sede creada exitosamente: %s", createdCampus.ID)

	// Convertir a DTO de respuesta
	return &dtos.CampusResponse{
		ID:        createdCampus.ID,
		Name:      createdCampus.Name,
		Code:      createdCampus.Code,
		Address:   createdCampus.Address,
		City:      createdCampus.City,
		IsActive:  createdCampus.IsActive,
		CreatedAt: createdCampus.CreatedAt,
		UpdatedAt: createdCampus.UpdatedAt,
	}, nil
}

// ListAcademicProgramsUseCase caso de uso para listar programas académicos
type ListAcademicProgramsUseCase struct {
	programRepo repositories.AcademicProgramRepository
	logger      *log.Logger
}

// NewListAcademicProgramsUseCase constructor
func NewListAcademicProgramsUseCase(programRepo repositories.AcademicProgramRepository, logger *log.Logger) *ListAcademicProgramsUseCase {
	return &ListAcademicProgramsUseCase{
		programRepo: programRepo,
		logger:      logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *ListAcademicProgramsUseCase) Execute(ctx context.Context, filter repositories.BaseFilter) (*dtos.PaginatedResponse[*dtos.AcademicProgramResponse], error) {
	// Establecer valores por defecto
	filter.SetDefaults()

	// Obtener programas y total
	programs, total, err := uc.programRepo.List(ctx, filter)
	if err != nil {
		uc.logger.Printf("Error al listar programas académicos: %v", err)
		return nil, fmt.Errorf("error al listar programas académicos: %w", err)
	}

	// Convertir a DTOs
	programResponses := make([]*dtos.AcademicProgramResponse, len(programs))
	for i, program := range programs {
		programResponses[i] = &dtos.AcademicProgramResponse{
			ID:          program.ID,
			Name:        program.Name,
			Code:        program.Code,
			Type:        string(program.Type),
			Duration:    program.Duration,
			Description: program.Description,
			IsActive:    program.IsActive,
			CreatedAt:   program.CreatedAt,
			UpdatedAt:   program.UpdatedAt,
		}
	}

	// Crear metadatos de paginación
	pages := dtos.CalculatePages(total, filter.PageSize)
	pagination := dtos.PaginationMeta{
		Page:     filter.Page,
		PageSize: filter.PageSize,
		Total:    total,
		Pages:    pages,
		HasNext:  filter.Page < pages,
		HasPrev:  filter.Page > 1,
	}

	return &dtos.PaginatedResponse[*dtos.AcademicProgramResponse]{
		Data:       programResponses,
		Pagination: pagination,
	}, nil
}

// ListAcademicGroupsUseCase caso de uso para listar fichas/grupos
type ListAcademicGroupsUseCase struct {
	groupRepo repositories.AcademicGroupRepository
	logger    *log.Logger
}

// NewListAcademicGroupsUseCase constructor
func NewListAcademicGroupsUseCase(groupRepo repositories.AcademicGroupRepository, logger *log.Logger) *ListAcademicGroupsUseCase {
	return &ListAcademicGroupsUseCase{
		groupRepo: groupRepo,
		logger:    logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *ListAcademicGroupsUseCase) Execute(ctx context.Context, filter repositories.AcademicGroupFilter) (*dtos.PaginatedResponse[*dtos.AcademicGroupResponse], error) {
	// Establecer valores por defecto
	filter.SetDefaults()

	// Obtener fichas y total
	groups, total, err := uc.groupRepo.List(ctx, filter)
	if err != nil {
		uc.logger.Printf("Error al listar fichas académicas: %v", err)
		return nil, fmt.Errorf("error al listar fichas académicas: %w", err)
	}

	// Convertir a DTOs
	groupResponses := make([]*dtos.AcademicGroupResponse, len(groups))
	for i, group := range groups {
		groupResponses[i] = &dtos.AcademicGroupResponse{
			ID:                group.ID,
			Number:            group.Number,
			AcademicProgramID: group.AcademicProgramID,
			Quarter:           group.Quarter,
			Year:              group.Year,
			Shift:             string(group.Shift),
			IsActive:          group.IsActive,
			CreatedAt:         group.CreatedAt,
			UpdatedAt:         group.UpdatedAt,
		}

		// Incluir programa académico si está cargado
		if group.AcademicProgram != nil {
			groupResponses[i].AcademicProgram = &dtos.AcademicProgramResponse{
				ID:          group.AcademicProgram.ID,
				Name:        group.AcademicProgram.Name,
				Code:        group.AcademicProgram.Code,
				Type:        string(group.AcademicProgram.Type),
				Duration:    group.AcademicProgram.Duration,
				Description: group.AcademicProgram.Description,
				IsActive:    group.AcademicProgram.IsActive,
				CreatedAt:   group.AcademicProgram.CreatedAt,
				UpdatedAt:   group.AcademicProgram.UpdatedAt,
			}
		}
	}

	// Crear metadatos de paginación
	pages := dtos.CalculatePages(total, filter.PageSize)
	pagination := dtos.PaginationMeta{
		Page:     filter.Page,
		PageSize: filter.PageSize,
		Total:    total,
		Pages:    pages,
		HasNext:  filter.Page < pages,
		HasPrev:  filter.Page > 1,
	}

	return &dtos.PaginatedResponse[*dtos.AcademicGroupResponse]{
		Data:       groupResponses,
		Pagination: pagination,
	}, nil
}

// ListVenuesUseCase caso de uso para listar ambientes/aulas
type ListVenuesUseCase struct {
	venueRepo repositories.VenueRepository
	logger    *log.Logger
}

// NewListVenuesUseCase constructor
func NewListVenuesUseCase(venueRepo repositories.VenueRepository, logger *log.Logger) *ListVenuesUseCase {
	return &ListVenuesUseCase{
		venueRepo: venueRepo,
		logger:    logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *ListVenuesUseCase) Execute(ctx context.Context, filter repositories.VenueFilter) (*dtos.PaginatedResponse[*dtos.VenueResponse], error) {
	// Establecer valores por defecto
	filter.SetDefaults()

	// Obtener ambientes y total
	venues, total, err := uc.venueRepo.List(ctx, filter)
	if err != nil {
		uc.logger.Printf("Error al listar ambientes: %v", err)
		return nil, fmt.Errorf("error al listar ambientes: %w", err)
	}

	// Convertir a DTOs
	venueResponses := make([]*dtos.VenueResponse, len(venues))
	for i, venue := range venues {
		venueResponses[i] = &dtos.VenueResponse{
			ID:        venue.ID,
			Name:      venue.Name,
			Code:      venue.Code,
			Type:      string(venue.Type),
			Capacity:  venue.Capacity,
			CampusID:  venue.CampusID,
			Floor:     venue.Floor,
			IsActive:  venue.IsActive,
			CreatedAt: venue.CreatedAt,
			UpdatedAt: venue.UpdatedAt,
		}

		// Incluir sede si está cargada
		if venue.Campus != nil {
			venueResponses[i].Campus = &dtos.CampusResponse{
				ID:        venue.Campus.ID,
				Name:      venue.Campus.Name,
				Code:      venue.Campus.Code,
				Address:   venue.Campus.Address,
				City:      venue.Campus.City,
				IsActive:  venue.Campus.IsActive,
				CreatedAt: venue.Campus.CreatedAt,
				UpdatedAt: venue.Campus.UpdatedAt,
			}
		}
	}

	// Crear metadatos de paginación
	pages := dtos.CalculatePages(total, filter.PageSize)
	pagination := dtos.PaginationMeta{
		Page:     filter.Page,
		PageSize: filter.PageSize,
		Total:    total,
		Pages:    pages,
		HasNext:  filter.Page < pages,
		HasPrev:  filter.Page > 1,
	}

	return &dtos.PaginatedResponse[*dtos.VenueResponse]{
		Data:       venueResponses,
		Pagination: pagination,
	}, nil
}

// ListCampusesUseCase caso de uso para listar sedes
type ListCampusesUseCase struct {
	campusRepo repositories.CampusRepository
	logger     *log.Logger
}

// NewListCampusesUseCase constructor
func NewListCampusesUseCase(campusRepo repositories.CampusRepository, logger *log.Logger) *ListCampusesUseCase {
	return &ListCampusesUseCase{
		campusRepo: campusRepo,
		logger:     logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *ListCampusesUseCase) Execute(ctx context.Context, filter repositories.BaseFilter) (*dtos.PaginatedResponse[*dtos.CampusResponse], error) {
	// Establecer valores por defecto
	filter.SetDefaults()

	// Obtener sedes y total
	campuses, total, err := uc.campusRepo.List(ctx, filter)
	if err != nil {
		uc.logger.Printf("Error al listar sedes: %v", err)
		return nil, fmt.Errorf("error al listar sedes: %w", err)
	}

	// Convertir a DTOs
	campusResponses := make([]*dtos.CampusResponse, len(campuses))
	for i, campus := range campuses {
		campusResponses[i] = &dtos.CampusResponse{
			ID:        campus.ID,
			Name:      campus.Name,
			Code:      campus.Code,
			Address:   campus.Address,
			City:      campus.City,
			IsActive:  campus.IsActive,
			CreatedAt: campus.CreatedAt,
			UpdatedAt: campus.UpdatedAt,
		}
	}

	// Crear metadatos de paginación
	pages := dtos.CalculatePages(total, filter.PageSize)
	pagination := dtos.PaginationMeta{
		Page:     filter.Page,
		PageSize: filter.PageSize,
		Total:    total,
		Pages:    pages,
		HasNext:  filter.Page < pages,
		HasPrev:  filter.Page > 1,
	}

	return &dtos.PaginatedResponse[*dtos.CampusResponse]{
		Data:       campusResponses,
		Pagination: pagination,
	}, nil
}

// Get Use Cases

// GetAcademicProgramUseCase caso de uso para obtener un programa académico por ID
type GetAcademicProgramUseCase struct {
	programRepo repositories.AcademicProgramRepository
	logger      *log.Logger
}

// NewGetAcademicProgramUseCase constructor
func NewGetAcademicProgramUseCase(programRepo repositories.AcademicProgramRepository, logger *log.Logger) *GetAcademicProgramUseCase {
	return &GetAcademicProgramUseCase{
		programRepo: programRepo,
		logger:      logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *GetAcademicProgramUseCase) Execute(ctx context.Context, id uuid.UUID) (*dtos.AcademicProgramResponse, error) {
	program, err := uc.programRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al obtener programa académico %s: %v", id, err)
		return nil, fmt.Errorf("error al obtener programa académico: %w", err)
	}

	if program == nil {
		return nil, fmt.Errorf("programa académico no encontrado")
	}

	return &dtos.AcademicProgramResponse{
		ID:          program.ID,
		Name:        program.Name,
		Code:        program.Code,
		Type:        string(program.Type),
		Duration:    program.Duration,
		Description: program.Description,
		IsActive:    program.IsActive,
		CreatedAt:   program.CreatedAt,
		UpdatedAt:   program.UpdatedAt,
	}, nil
}

// GetAcademicGroupUseCase caso de uso para obtener un grupo académico por ID
type GetAcademicGroupUseCase struct {
	groupRepo repositories.AcademicGroupRepository
	logger    *log.Logger
}

// NewGetAcademicGroupUseCase constructor
func NewGetAcademicGroupUseCase(groupRepo repositories.AcademicGroupRepository, logger *log.Logger) *GetAcademicGroupUseCase {
	return &GetAcademicGroupUseCase{
		groupRepo: groupRepo,
		logger:    logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *GetAcademicGroupUseCase) Execute(ctx context.Context, id uuid.UUID) (*dtos.AcademicGroupResponse, error) {
	group, err := uc.groupRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al obtener grupo académico %s: %v", id, err)
		return nil, fmt.Errorf("error al obtener grupo académico: %w", err)
	}

	if group == nil {
		return nil, fmt.Errorf("grupo académico no encontrado")
	}

	return &dtos.AcademicGroupResponse{
		ID:                group.ID,
		Number:            group.Number,
		AcademicProgramID: group.AcademicProgramID,
		Quarter:           group.Quarter,
		Year:              group.Year,
		Shift:             string(group.Shift),
		IsActive:          group.IsActive,
		CreatedAt:         group.CreatedAt,
		UpdatedAt:         group.UpdatedAt,
	}, nil
}

// GetVenueUseCase caso de uso para obtener un venue por ID
type GetVenueUseCase struct {
	venueRepo repositories.VenueRepository
	logger    *log.Logger
}

// NewGetVenueUseCase constructor
func NewGetVenueUseCase(venueRepo repositories.VenueRepository, logger *log.Logger) *GetVenueUseCase {
	return &GetVenueUseCase{
		venueRepo: venueRepo,
		logger:    logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *GetVenueUseCase) Execute(ctx context.Context, id uuid.UUID) (*dtos.VenueResponse, error) {
	venue, err := uc.venueRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al obtener venue %s: %v", id, err)
		return nil, fmt.Errorf("error al obtener venue: %w", err)
	}

	if venue == nil {
		return nil, fmt.Errorf("venue no encontrado")
	}

	return &dtos.VenueResponse{
		ID:        venue.ID,
		Name:      venue.Name,
		Code:      venue.Code,
		Type:      string(venue.Type),
		Capacity:  venue.Capacity,
		CampusID:  venue.CampusID,
		Floor:     venue.Floor,
		IsActive:  venue.IsActive,
		CreatedAt: venue.CreatedAt,
		UpdatedAt: venue.UpdatedAt,
	}, nil
}

// GetCampusUseCase caso de uso para obtener un campus por ID
type GetCampusUseCase struct {
	campusRepo repositories.CampusRepository
	logger     *log.Logger
}

// NewGetCampusUseCase constructor
func NewGetCampusUseCase(campusRepo repositories.CampusRepository, logger *log.Logger) *GetCampusUseCase {
	return &GetCampusUseCase{
		campusRepo: campusRepo,
		logger:     logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *GetCampusUseCase) Execute(ctx context.Context, id uuid.UUID) (*dtos.CampusResponse, error) {
	campus, err := uc.campusRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al obtener campus %s: %v", id, err)
		return nil, fmt.Errorf("error al obtener campus: %w", err)
	}

	if campus == nil {
		return nil, fmt.Errorf("campus no encontrado")
	}

	return &dtos.CampusResponse{
		ID:        campus.ID,
		Name:      campus.Name,
		Code:      campus.Code,
		Address:   campus.Address,
		City:      campus.City,
		IsActive:  campus.IsActive,
		CreatedAt: campus.CreatedAt,
		UpdatedAt: campus.UpdatedAt,
	}, nil
}

// Update Use Cases

// UpdateAcademicProgramUseCase caso de uso para actualizar programas académicos
type UpdateAcademicProgramUseCase struct {
	programRepo repositories.AcademicProgramRepository
	logger      *log.Logger
}

// NewUpdateAcademicProgramUseCase constructor
func NewUpdateAcademicProgramUseCase(programRepo repositories.AcademicProgramRepository, logger *log.Logger) *UpdateAcademicProgramUseCase {
	return &UpdateAcademicProgramUseCase{
		programRepo: programRepo,
		logger:      logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *UpdateAcademicProgramUseCase) Execute(ctx context.Context, id uuid.UUID, req *dtos.UpdateAcademicProgramRequest) (*dtos.AcademicProgramResponse, error) {
	// Buscar programa existente
	program, err := uc.programRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar programa %s: %v", id, err)
		return nil, fmt.Errorf("error al buscar programa: %w", err)
	}

	if program == nil {
		return nil, fmt.Errorf("programa académico no encontrado")
	}

	// Verificar código único si se está cambiando
	if req.Code != nil && *req.Code != program.Code {
		existingProgram, err := uc.programRepo.GetByCode(ctx, *req.Code)
		if err != nil {
			uc.logger.Printf("Error al verificar código %s: %v", *req.Code, err)
			return nil, fmt.Errorf("error al verificar código: %w", err)
		}
		if existingProgram != nil {
			return nil, fmt.Errorf("ya existe un programa con el código: %s", *req.Code)
		}
		program.Code = *req.Code
	}

	// Actualizar campos
	if req.Name != nil {
		program.Name = *req.Name
	}
	if req.Type != nil {
		program.Type = entities.TipoPrograma(*req.Type)
	}
	if req.Duration != nil {
		program.Duration = *req.Duration
	}
	if req.Description != nil {
		program.Description = *req.Description
	}
	if req.IsActive != nil {
		program.IsActive = *req.IsActive
	}

	// Guardar cambios
	updatedProgram, err := uc.programRepo.Update(ctx, program)
	if err != nil {
		uc.logger.Printf("Error al actualizar programa %s: %v", id, err)
		return nil, fmt.Errorf("error al actualizar programa: %w", err)
	}

	return &dtos.AcademicProgramResponse{
		ID:          updatedProgram.ID,
		Name:        updatedProgram.Name,
		Code:        updatedProgram.Code,
		Type:        string(updatedProgram.Type),
		Duration:    updatedProgram.Duration,
		Description: updatedProgram.Description,
		IsActive:    updatedProgram.IsActive,
		CreatedAt:   updatedProgram.CreatedAt,
		UpdatedAt:   updatedProgram.UpdatedAt,
	}, nil
}

// UpdateAcademicGroupUseCase caso de uso para actualizar grupos académicos
type UpdateAcademicGroupUseCase struct {
	groupRepo repositories.AcademicGroupRepository
	logger    *log.Logger
}

// NewUpdateAcademicGroupUseCase constructor
func NewUpdateAcademicGroupUseCase(groupRepo repositories.AcademicGroupRepository, logger *log.Logger) *UpdateAcademicGroupUseCase {
	return &UpdateAcademicGroupUseCase{
		groupRepo: groupRepo,
		logger:    logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *UpdateAcademicGroupUseCase) Execute(ctx context.Context, id uuid.UUID, req *dtos.UpdateAcademicGroupRequest) (*dtos.AcademicGroupResponse, error) {
	// Buscar grupo existente
	group, err := uc.groupRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar grupo %s: %v", id, err)
		return nil, fmt.Errorf("error al buscar grupo: %w", err)
	}

	if group == nil {
		return nil, fmt.Errorf("grupo académico no encontrado")
	}

	// Actualizar campos
	if req.Number != nil {
		group.Number = *req.Number
	}
	if req.AcademicProgramID != nil {
		group.AcademicProgramID = *req.AcademicProgramID
	}
	if req.Quarter != nil {
		group.Quarter = *req.Quarter
	}
	if req.Year != nil {
		group.Year = *req.Year
	}
	if req.Shift != nil {
		group.Shift = entities.Jornada(*req.Shift)
	}
	if req.IsActive != nil {
		group.IsActive = *req.IsActive
	}

	// Guardar cambios
	updatedGroup, err := uc.groupRepo.Update(ctx, group)
	if err != nil {
		uc.logger.Printf("Error al actualizar grupo %s: %v", id, err)
		return nil, fmt.Errorf("error al actualizar grupo: %w", err)
	}

	return &dtos.AcademicGroupResponse{
		ID:                updatedGroup.ID,
		Number:            updatedGroup.Number,
		AcademicProgramID: updatedGroup.AcademicProgramID,
		Quarter:           updatedGroup.Quarter,
		Year:              updatedGroup.Year,
		Shift:             string(updatedGroup.Shift),
		IsActive:          updatedGroup.IsActive,
		CreatedAt:         updatedGroup.CreatedAt,
		UpdatedAt:         updatedGroup.UpdatedAt,
	}, nil
}

// UpdateVenueUseCase caso de uso para actualizar venues
type UpdateVenueUseCase struct {
	venueRepo repositories.VenueRepository
	logger    *log.Logger
}

// NewUpdateVenueUseCase constructor
func NewUpdateVenueUseCase(venueRepo repositories.VenueRepository, logger *log.Logger) *UpdateVenueUseCase {
	return &UpdateVenueUseCase{
		venueRepo: venueRepo,
		logger:    logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *UpdateVenueUseCase) Execute(ctx context.Context, id uuid.UUID, req *dtos.UpdateVenueRequest) (*dtos.VenueResponse, error) {
	// Buscar venue existente
	venue, err := uc.venueRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar venue %s: %v", id, err)
		return nil, fmt.Errorf("error al buscar venue: %w", err)
	}

	if venue == nil {
		return nil, fmt.Errorf("venue no encontrado")
	}

	// Actualizar campos
	if req.Name != nil {
		venue.Name = *req.Name
	}
	if req.Type != nil {
		venue.Type = entities.TipoAmbiente(*req.Type)
	}
	if req.Capacity != nil {
		venue.Capacity = *req.Capacity
	}
	if req.CampusID != nil {
		venue.CampusID = *req.CampusID
	}
	if req.Floor != nil {
		venue.Floor = *req.Floor
	}
	if req.IsActive != nil {
		venue.IsActive = *req.IsActive
	}

	// Guardar cambios
	updatedVenue, err := uc.venueRepo.Update(ctx, venue)
	if err != nil {
		uc.logger.Printf("Error al actualizar venue %s: %v", id, err)
		return nil, fmt.Errorf("error al actualizar venue: %w", err)
	}

	return &dtos.VenueResponse{
		ID:        updatedVenue.ID,
		Name:      updatedVenue.Name,
		Code:      updatedVenue.Code,
		Type:      string(updatedVenue.Type),
		Capacity:  updatedVenue.Capacity,
		CampusID:  updatedVenue.CampusID,
		Floor:     updatedVenue.Floor,
		IsActive:  updatedVenue.IsActive,
		CreatedAt: updatedVenue.CreatedAt,
		UpdatedAt: updatedVenue.UpdatedAt,
	}, nil
}

// UpdateCampusUseCase caso de uso para actualizar campus
type UpdateCampusUseCase struct {
	campusRepo repositories.CampusRepository
	logger     *log.Logger
}

// NewUpdateCampusUseCase constructor
func NewUpdateCampusUseCase(campusRepo repositories.CampusRepository, logger *log.Logger) *UpdateCampusUseCase {
	return &UpdateCampusUseCase{
		campusRepo: campusRepo,
		logger:     logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *UpdateCampusUseCase) Execute(ctx context.Context, id uuid.UUID, req *dtos.UpdateCampusRequest) (*dtos.CampusResponse, error) {
	// Buscar campus existente
	campus, err := uc.campusRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar campus %s: %v", id, err)
		return nil, fmt.Errorf("error al buscar campus: %w", err)
	}

	if campus == nil {
		return nil, fmt.Errorf("campus no encontrado")
	}

	// Actualizar campos
	if req.Name != nil {
		campus.Name = *req.Name
	}
	if req.Code != nil {
		campus.Code = *req.Code
	}
	if req.Address != nil {
		campus.Address = *req.Address
	}
	if req.City != nil {
		campus.City = *req.City
	}
	if req.IsActive != nil {
		campus.IsActive = *req.IsActive
	}

	// Guardar cambios
	updatedCampus, err := uc.campusRepo.Update(ctx, campus)
	if err != nil {
		uc.logger.Printf("Error al actualizar campus %s: %v", id, err)
		return nil, fmt.Errorf("error al actualizar campus: %w", err)
	}

	return &dtos.CampusResponse{
		ID:        updatedCampus.ID,
		Name:      updatedCampus.Name,
		Code:      updatedCampus.Code,
		Address:   updatedCampus.Address,
		City:      updatedCampus.City,
		IsActive:  updatedCampus.IsActive,
		CreatedAt: updatedCampus.CreatedAt,
		UpdatedAt: updatedCampus.UpdatedAt,
	}, nil
}

// Delete Use Cases

// DeleteAcademicProgramUseCase caso de uso para eliminar programas académicos
type DeleteAcademicProgramUseCase struct {
	programRepo repositories.AcademicProgramRepository
	logger      *log.Logger
}

// NewDeleteAcademicProgramUseCase constructor
func NewDeleteAcademicProgramUseCase(programRepo repositories.AcademicProgramRepository, logger *log.Logger) *DeleteAcademicProgramUseCase {
	return &DeleteAcademicProgramUseCase{
		programRepo: programRepo,
		logger:      logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *DeleteAcademicProgramUseCase) Execute(ctx context.Context, id uuid.UUID) error {
	// Verificar que existe
	program, err := uc.programRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar programa %s: %v", id, err)
		return fmt.Errorf("error al buscar programa: %w", err)
	}

	if program == nil {
		return fmt.Errorf("programa académico no encontrado")
	}

	// Eliminar (soft delete)
	err = uc.programRepo.Delete(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al eliminar programa %s: %v", id, err)
		return fmt.Errorf("error al eliminar programa: %w", err)
	}

	return nil
}

// DeleteAcademicGroupUseCase caso de uso para eliminar grupos académicos
type DeleteAcademicGroupUseCase struct {
	groupRepo repositories.AcademicGroupRepository
	logger    *log.Logger
}

// NewDeleteAcademicGroupUseCase constructor
func NewDeleteAcademicGroupUseCase(groupRepo repositories.AcademicGroupRepository, logger *log.Logger) *DeleteAcademicGroupUseCase {
	return &DeleteAcademicGroupUseCase{
		groupRepo: groupRepo,
		logger:    logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *DeleteAcademicGroupUseCase) Execute(ctx context.Context, id uuid.UUID) error {
	// Verificar que existe
	group, err := uc.groupRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar grupo %s: %v", id, err)
		return fmt.Errorf("error al buscar grupo: %w", err)
	}

	if group == nil {
		return fmt.Errorf("grupo académico no encontrado")
	}

	// Eliminar (soft delete)
	err = uc.groupRepo.Delete(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al eliminar grupo %s: %v", id, err)
		return fmt.Errorf("error al eliminar grupo: %w", err)
	}

	return nil
}

// DeleteVenueUseCase caso de uso para eliminar venues
type DeleteVenueUseCase struct {
	venueRepo repositories.VenueRepository
	logger    *log.Logger
}

// NewDeleteVenueUseCase constructor
func NewDeleteVenueUseCase(venueRepo repositories.VenueRepository, logger *log.Logger) *DeleteVenueUseCase {
	return &DeleteVenueUseCase{
		venueRepo: venueRepo,
		logger:    logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *DeleteVenueUseCase) Execute(ctx context.Context, id uuid.UUID) error {
	// Verificar que existe
	venue, err := uc.venueRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar venue %s: %v", id, err)
		return fmt.Errorf("error al buscar venue: %w", err)
	}

	if venue == nil {
		return fmt.Errorf("venue no encontrado")
	}

	// Eliminar (soft delete)
	err = uc.venueRepo.Delete(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al eliminar venue %s: %v", id, err)
		return fmt.Errorf("error al eliminar venue: %w", err)
	}

	return nil
}

// DeleteCampusUseCase caso de uso para eliminar campus
type DeleteCampusUseCase struct {
	campusRepo repositories.CampusRepository
	logger     *log.Logger
}

// NewDeleteCampusUseCase constructor
func NewDeleteCampusUseCase(campusRepo repositories.CampusRepository, logger *log.Logger) *DeleteCampusUseCase {
	return &DeleteCampusUseCase{
		campusRepo: campusRepo,
		logger:     logger,
	}
}

// Execute ejecuta el caso de uso
func (uc *DeleteCampusUseCase) Execute(ctx context.Context, id uuid.UUID) error {
	// Verificar que existe
	campus, err := uc.campusRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al buscar campus %s: %v", id, err)
		return fmt.Errorf("error al buscar campus: %w", err)
	}

	if campus == nil {
		return fmt.Errorf("campus no encontrado")
	}

	// Eliminar (soft delete)
	err = uc.campusRepo.Delete(ctx, id)
	if err != nil {
		uc.logger.Printf("Error al eliminar campus %s: %v", id, err)
		return fmt.Errorf("error al eliminar campus: %w", err)
	}

	return nil
}
