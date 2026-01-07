package usecases

import (
	"context"
	"fmt"
	"log"
	"time"

	"userservice/internal/application/dtos"
	"userservice/internal/application/security"
	"userservice/internal/domain/entities"
	"userservice/internal/domain/repositories"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// CreateUserUseCase maneja la lógica de creación de usuarios
type CreateUserUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewCreateUserUseCase crea una nueva instancia del caso de uso
func NewCreateUserUseCase(userRepo repositories.UserRepository, logger *log.Logger) *CreateUserUseCase {
	return &CreateUserUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute ejecuta el caso de uso de creación de usuario
func (uc *CreateUserUseCase) Execute(ctx context.Context, request dtos.CreateUserRequestDTO) (*dtos.UserDTO, error) {
	// 1. Validar que el email no exista
	exists, err := uc.userRepo.ExistsByEmail(ctx, request.Email)
	if err != nil {
		uc.logger.Printf("Error checking email existence: %v", err)
		return nil, err
	}
	if exists {
		return nil, entities.NewDomainError("ya existe un usuario con este email")
	}

	// 2. Validar que el documento no exista
	exists, err = uc.userRepo.ExistsByDocumento(ctx, request.Documento)
	if err != nil {
		uc.logger.Printf("Error checking document existence: %v", err)
		return nil, err
	}
	if exists {
		return nil, entities.NewDomainError("ya existe un usuario con este documento")
	}

	// 3. Validar contraseña
	if err := entities.ValidatePassword(request.Password); err != nil {
		return nil, err
	}

	userRole := entities.UserRole(request.Rol)
	// 4. Validar ficha para aprendices
	if userRole == entities.RoleAprendiz {
		if request.FichaID == nil || *request.FichaID == "" {
			return nil, entities.NewDomainError("los aprendices deben tener una ficha asignada")
		}
		if err := entities.ValidateFichaID(*request.FichaID); err != nil {
			return nil, err
		}
	} else {
		// No-aprendices no deben tener ficha
		request.FichaID = nil
	}

	// 5. Crear la entidad usuario
	user, err := entities.NewUser(
		request.Nombre,
		request.Apellido,
		request.Email,
		request.Documento,
		userRole,
		request.ProgramaFormacion,
	)
	if err != nil {
		return nil, err
	}

	// 6. Hash de la contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		uc.logger.Printf("Error hashing password: %v", err)
		return nil, entities.NewDomainError("error al procesar la contraseña")
	}
	user.Password = string(hashedPassword)

	// 7. Asignar ficha si es aprendiz
	if request.FichaID != nil && *request.FichaID != "" {
		err = user.AssignFicha(*request.FichaID)
		if err != nil {
			return nil, err
		}
	}

	// 8. Guardar en el repositorio
	err = uc.userRepo.Create(ctx, user)
	if err != nil {
		uc.logger.Printf("Error creating user: %v", err)
		return nil, err
	}

	uc.logger.Printf("User created successfully: %s (%s)", security.MaskEmail(user.Email), security.MaskUUID(user.ID.String()))

	return dtos.NewUserDTOFromEntity(user), nil
}

// GetUserUseCase maneja la lógica de obtener un usuario
type GetUserUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewGetUserUseCase crea una nueva instancia del caso de uso
func NewGetUserUseCase(userRepo repositories.UserRepository, logger *log.Logger) *GetUserUseCase {
	return &GetUserUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute obtiene un usuario por ID
// Acepta dtos.GetUserRequest que contiene el ID
func (uc *GetUserUseCase) Execute(ctx context.Context, request dtos.GetUserRequest) (*dtos.UserDTO, error) {
	user, err := uc.userRepo.GetByID(ctx, request.ID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", request.ID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	return dtos.NewUserDTOFromEntity(user), nil
}

// ListUsersUseCase maneja la lógica de listar usuarios
type ListUsersUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewListUsersUseCase crea una nueva instancia del caso de uso
func NewListUsersUseCase(userRepo repositories.UserRepository, logger *log.Logger) *ListUsersUseCase {
	return &ListUsersUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute lista usuarios con filtros y paginación
// Acepta dtos.ListUsersRequest (alias de dtos.UserListRequestDTO)
func (uc *ListUsersUseCase) Execute(ctx context.Context, request dtos.ListUsersRequest) (*dtos.UserListResponseDTO, error) {
	// Convertir dtos.ListUsersRequest a repositories.UserFilters
	filters := repositories.UserFilters{
		Page:          request.Page,
		PageSize:      request.PageSize,
		SortBy:        request.SortBy,
		SortDirection: request.SortDirection,
		IsActive:      request.IsActive,
		FichaID:       request.FichaID,
		Search:        request.Search,
		// El campo Rol en dtos.ListUsersRequest es *string, mientras que en UserFilters es *entities.UserRole.
		// Se necesita una conversión o ajuste. Por ahora, se omite o se maneja como string si el repo lo permite.
		// Si request.Rol es un string que representa el rol, se puede convertir:
		// Rol: request.Rol, // Esto asume que UserFilters.Rol puede ser *string o se ajusta el repo/DTO
	}
	if request.Rol != nil && *request.Rol != "" {
		rol := entities.UserRole(*request.Rol)
		filters.Rol = &rol
	}

	// Validar filtros (la lógica de validación ya está en el handler o aquí)
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 || filters.PageSize > 100 {
		filters.PageSize = 10 // Default page size
	}
	if filters.SortBy == "" {
		filters.SortBy = "created_at"
	}
	if filters.SortDirection != "asc" && filters.SortDirection != "desc" {
		filters.SortDirection = "desc"
	}

	paginatedResult, err := uc.userRepo.List(ctx, filters)
	if err != nil {
		uc.logger.Printf("Error listing users: %v", err)
		return nil, err
	}

	// Convertir []*entities.User a []*dtos.UserDTO
	userDTOs := make([]*dtos.UserDTO, len(paginatedResult.Users))
	for i, userEntity := range paginatedResult.Users {
		userDTOs[i] = dtos.NewUserDTOFromEntity(userEntity)
	}

	return &dtos.UserListResponseDTO{
		Users:       userDTOs,
		Total:       paginatedResult.Total,
		Page:        paginatedResult.Page,
		PageSize:    paginatedResult.PageSize,
		TotalPages:  paginatedResult.TotalPages,
		HasNext:     paginatedResult.HasNext,
		HasPrevious: paginatedResult.HasPrevious,
	}, nil
}

// AuthenticateUserUseCase maneja la lógica de autenticación de usuarios
type AuthenticateUserUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewAuthenticateUserUseCase crea una nueva instancia del caso de uso
func NewAuthenticateUserUseCase(userRepo repositories.UserRepository, logger *log.Logger) *AuthenticateUserUseCase {
	return &AuthenticateUserUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute autentica un usuario y genera tokens JWT
func (uc *AuthenticateUserUseCase) Execute(ctx context.Context, request dtos.AuthenticateUserRequest) (*dtos.AuthResponseDTO, error) {
	// 1. Buscar usuario por email
	user, err := uc.userRepo.GetByEmail(ctx, request.Email)
	if err != nil {
		uc.logger.Printf("Error getting user by email %s: %v", security.MaskEmail(request.Email), err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("credenciales inválidas")
	}

	// 2. Verificar que el usuario esté activo
	if !user.IsActive {
		return nil, entities.NewDomainError("usuario inactivo")
	}

	// 3. Verificar contraseña
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	if err != nil {
		// SECURITY: No loguear detalles del error de bcrypt
		uc.logger.Printf("Invalid password attempt for user %s", security.MaskEmail(request.Email))
		return nil, entities.NewDomainError("credenciales inválidas")
	}

	// 4. Actualizar último login
	user.MarkAsLoggedIn()
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating last login for user %s: %v", user.ID, err)
		// No retornamos error aquí, continuamos con la generación de tokens
	}

	// 5. Generar tokens JWT
	// Aquí se implementaría la generación de tokens JWT
	// Por simplicidad, usamos valores de ejemplo
	token := "jwt_token_example"
	refreshToken := "refresh_token_example"
	expiresIn := 3600 // 1 hora en segundos

	return &dtos.AuthResponseDTO{
		User:         dtos.NewUserDTOFromEntity(user),
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

// RefreshTokenUseCase maneja la lógica de renovación de tokens JWT
type RefreshTokenUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewRefreshTokenUseCase crea una nueva instancia del caso de uso
func NewRefreshTokenUseCase(userRepo repositories.UserRepository, logger *log.Logger) *RefreshTokenUseCase {
	return &RefreshTokenUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute renueva un token JWT utilizando un refresh token
func (uc *RefreshTokenUseCase) Execute(ctx context.Context, refreshToken string) (*dtos.AuthResponseDTO, error) {
	// 1. Validar el refresh token
	// Aquí se implementaría la validación del refresh token
	// Por simplicidad, asumimos que el token es válido y obtenemos el user_id
	userID := uuid.New() // En una implementación real, se extraería del token

	// 2. Buscar usuario por ID
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	// 3. Verificar que el usuario esté activo
	if !user.IsActive {
		return nil, entities.NewDomainError("usuario inactivo")
	}

	// 4. Actualizar último login
	user.MarkAsLoggedIn()
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating last login for user %s: %v", user.ID, err)
		// No retornamos error aquí, continuamos con la generación de tokens
	}

	// 5. Generar nuevo token JWT
	// Aquí se implementaría la generación del nuevo token JWT
	// Por simplicidad, usamos valores de ejemplo
	token := "new_jwt_token_example"
	expiresIn := 3600 // 1 hora en segundos

	return &dtos.AuthResponseDTO{
		User:         dtos.NewUserDTOFromEntity(user),
		Token:        token,
		RefreshToken: refreshToken, // Mantenemos el mismo refresh token
		ExpiresIn:    expiresIn,
	}, nil
}

// LogoutUseCase maneja la lógica de cierre de sesión
type LogoutUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewLogoutUseCase crea una nueva instancia del caso de uso
func NewLogoutUseCase(userRepo repositories.UserRepository, logger *log.Logger) *LogoutUseCase {
	return &LogoutUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute invalida un refresh token
func (uc *LogoutUseCase) Execute(ctx context.Context, userID uuid.UUID, refreshToken string) error {
	// 1. Validar el refresh token
	// Aquí se implementaría la validación del refresh token
	// Por simplicidad, asumimos que el token es válido

	// 2. Invalidar el refresh token
	// Aquí se implementaría la invalidación del refresh token
	// Por simplicidad, solo registramos el logout
	uc.logger.Printf("User %s logged out", userID)

	return nil
}

// ForgotPasswordUseCase maneja la lógica de solicitud de restablecimiento de contraseña
type ForgotPasswordUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewForgotPasswordUseCase crea una nueva instancia del caso de uso
func NewForgotPasswordUseCase(userRepo repositories.UserRepository, logger *log.Logger) *ForgotPasswordUseCase {
	return &ForgotPasswordUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute procesa una solicitud de restablecimiento de contraseña
func (uc *ForgotPasswordUseCase) Execute(ctx context.Context, email string) error {
	// 1. Verificar que el usuario existe
	user, err := uc.userRepo.GetByEmail(ctx, email)
	if err != nil {
		uc.logger.Printf("Error getting user by email %s: %v", security.MaskEmail(email), err)
		return err
	}

	if user == nil {
		// Por seguridad, no revelamos si el email existe o no
		uc.logger.Printf("Forgot password requested for email: %s", security.MaskEmail(email))
		return nil
	}

	// 2. Generar token de restablecimiento
	// En una implementación real, generaríamos un token seguro y lo almacenaríamos
	// Por simplicidad, asumimos que esto se hace correctamente
	resetToken := uuid.New().String()
	expirationTime := time.Now().Add(24 * time.Hour) // 24 horas de validez

	// 3. Almacenar el token en la base de datos
	// En una implementación real, esto se haría en un repositorio específico
	// Por simplicidad, asumimos que esto se hace correctamente
	// SECURITY: NUNCA loguear tokens completos
	uc.logger.Printf("Reset token generated for user %s (expires: %v)", security.MaskUUID(user.ID.String()), expirationTime)

	// 4. Enviar email con el link de restablecimiento
	// En una implementación real, esto se haría con un servicio de email
	// SECURITY: No loguear el link con token - solo confirmar envío
	_ = fmt.Sprintf("https://sicora.app/reset-password?token=%s", resetToken)
	uc.logger.Printf("Reset link sent to user %s", security.MaskUUID(user.ID.String()))

	return nil
}

// ResetPasswordUseCase maneja la lógica de restablecimiento de contraseña
type ResetPasswordUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewResetPasswordUseCase crea una nueva instancia del caso de uso
func NewResetPasswordUseCase(userRepo repositories.UserRepository, logger *log.Logger) *ResetPasswordUseCase {
	return &ResetPasswordUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute restablece la contraseña de un usuario usando un token válido
func (uc *ResetPasswordUseCase) Execute(ctx context.Context, token string, newPassword string) error {
	// 1. Validar el token
	// En una implementación real, verificaríamos el token en la base de datos
	// Por simplicidad, asumimos que el token es válido y obtenemos el user_id
	userID := uuid.New() // En una implementación real, se extraería del token

	// 2. Buscar usuario por ID
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return err
	}

	if user == nil {
		return entities.NewDomainError("token inválido o expirado")
	}

	// 3. Validar la nueva contraseña
	if err := entities.ValidatePassword(newPassword); err != nil {
		return err
	}

	// 4. Actualizar la contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		uc.logger.Printf("Error hashing password: %v", err)
		return entities.NewDomainError("error al procesar la contraseña")
	}

	user.UpdatePassword(string(hashedPassword))

	// 5. Guardar el usuario actualizado
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating user password: %v", err)
		return err
	}

	// 6. Invalidar el token de reset
	// En una implementación real, marcaríamos el token como usado
	uc.logger.Printf("Password reset successful for user %s", user.ID)

	return nil
}

// ForceChangePasswordUseCase maneja la lógica de cambio forzado de contraseña
type ForceChangePasswordUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewForceChangePasswordUseCase crea una nueva instancia del caso de uso
func NewForceChangePasswordUseCase(userRepo repositories.UserRepository, logger *log.Logger) *ForceChangePasswordUseCase {
	return &ForceChangePasswordUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute cambia la contraseña de un usuario que debe cambiarla obligatoriamente
func (uc *ForceChangePasswordUseCase) Execute(ctx context.Context, userID uuid.UUID, newPassword string) (*dtos.AuthResponseDTO, error) {
	// 1. Buscar usuario por ID
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	// 2. Verificar que el usuario debe cambiar su contraseña
	if !user.MustChangePassword {
		return nil, entities.NewDomainError("el usuario no requiere cambio de contraseña")
	}

	// 3. Validar la nueva contraseña
	if err := entities.ValidatePassword(newPassword); err != nil {
		return nil, err
	}

	// 4. Actualizar la contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		uc.logger.Printf("Error hashing password: %v", err)
		return nil, entities.NewDomainError("error al procesar la contraseña")
	}

	user.UpdatePassword(string(hashedPassword))

	// 5. Guardar el usuario actualizado
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating user password: %v", err)
		return nil, err
	}

	// 6. Generar nuevos tokens JWT
	// Aquí se implementaría la generación de tokens JWT
	// Por simplicidad, usamos valores de ejemplo
	token := "jwt_token_example"
	refreshToken := "refresh_token_example"
	expiresIn := 3600 // 1 hora en segundos

	uc.logger.Printf("Forced password change successful for user %s", user.ID)

	return &dtos.AuthResponseDTO{
		User:         dtos.NewUserDTOFromEntity(user),
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

// GetProfileUseCase maneja la lógica de obtener el perfil del usuario autenticado
type GetProfileUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewGetProfileUseCase crea una nueva instancia del caso de uso
func NewGetProfileUseCase(userRepo repositories.UserRepository, logger *log.Logger) *GetProfileUseCase {
	return &GetProfileUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute obtiene el perfil del usuario autenticado
func (uc *GetProfileUseCase) Execute(ctx context.Context, request dtos.GetProfileRequest) (*dtos.UserDTO, error) {
	// Obtener el usuario por ID (el ID se extrae del token JWT en el handler)
	user, err := uc.userRepo.GetByID(ctx, request.UserID)
	if err != nil {
		uc.logger.Printf("Error getting user profile by ID %s: %v", request.UserID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	// Convertir la entidad a DTO y devolver
	return dtos.NewUserDTOFromEntity(user), nil
}

// UpdateProfileUseCase maneja la lógica de actualización del perfil del usuario autenticado
type UpdateProfileUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewUpdateProfileUseCase crea una nueva instancia del caso de uso
func NewUpdateProfileUseCase(userRepo repositories.UserRepository, logger *log.Logger) *UpdateProfileUseCase {
	return &UpdateProfileUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute actualiza el perfil del usuario autenticado
func (uc *UpdateProfileUseCase) Execute(ctx context.Context, request dtos.UpdateProfileRequestDTO) (*dtos.UserDTO, error) {
	// 1. Obtener el usuario por ID
	user, err := uc.userRepo.GetByID(ctx, request.UserID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", request.UserID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	// 2. Verificar si se está actualizando el email y validar unicidad
	if request.Email != nil && *request.Email != user.Email {
		exists, err := uc.userRepo.ExistsByEmail(ctx, *request.Email)
		if err != nil {
			uc.logger.Printf("Error checking email existence: %v", err)
			return nil, err
		}
		if exists {
			return nil, entities.NewDomainError("ya existe un usuario con este email")
		}
		user.Email = *request.Email
	}

	// 3. Actualizar solo los campos modificados
	if request.Nombre != nil {
		user.Nombre = *request.Nombre
	}
	if request.Apellido != nil {
		user.Apellido = *request.Apellido
	}
	if request.ProgramaFormacion != nil {
		user.ProgramaFormacion = *request.ProgramaFormacion
	}

	// 4. Actualizar timestamp
	user.UpdatedAt = time.Now()

	// 5. Guardar los cambios en el repositorio	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating user profile: %v", err)
		return nil, err
	}

	uc.logger.Printf("User profile updated successfully: %s (%s)", user.Email, user.ID)

	return dtos.NewUserDTOFromEntity(user), nil
}
