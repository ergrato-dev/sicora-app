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

// ChangePasswordUseCase maneja el cambio de contraseña del usuario autenticado
type ChangePasswordUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewChangePasswordUseCase crea una nueva instancia del caso de uso
func NewChangePasswordUseCase(userRepo repositories.UserRepository, logger *log.Logger) *ChangePasswordUseCase {
	return &ChangePasswordUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute ejecuta el cambio de contraseña
func (uc *ChangePasswordUseCase) Execute(ctx context.Context, userID uuid.UUID, request dtos.ChangePasswordRequestDTO) error {
	// 1. Obtener el usuario
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return err
	}

	if user == nil {
		return entities.NewDomainError("usuario no encontrado")
	}

	// 2. Verificar contraseña actual
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.CurrentPassword))
	if err != nil {
		uc.logger.Printf("Invalid current password for user %s", user.ID)
		return entities.NewDomainError("contraseña actual incorrecta")
	}

	// 3. Validar nueva contraseña
	if err := entities.ValidatePassword(request.NewPassword); err != nil {
		return err
	}

	// 4. Hash de la nueva contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		uc.logger.Printf("Error hashing new password: %v", err)
		return entities.NewDomainError("error al procesar la nueva contraseña")
	}

	// 5. Actualizar la contraseña
	user.UpdatePassword(string(hashedPassword))

	// 6. Guardar en el repositorio
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating password for user %s: %v", user.ID, err)
		return err
	}

	uc.logger.Printf("Password updated successfully for user: %s", user.ID)

	return nil
}

// DeleteUserUseCase maneja la eliminación lógica de usuarios (Admin)
type DeleteUserUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewDeleteUserUseCase crea una nueva instancia del caso de uso
func NewDeleteUserUseCase(userRepo repositories.UserRepository, logger *log.Logger) *DeleteUserUseCase {
	return &DeleteUserUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute ejecuta la eliminación lógica del usuario
func (uc *DeleteUserUseCase) Execute(ctx context.Context, userID uuid.UUID) error {
	// 1. Verificar que el usuario existe
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return err
	}

	if user == nil {
		return entities.NewDomainError("usuario no encontrado")
	}

	// 2. Realizar eliminación lógica (soft delete)
	user.Deactivate()

	// 3. Actualizar en el repositorio
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error deactivating user %s: %v", security.MaskUUID(userID.String()), err)
		return err
	}

	uc.logger.Printf("User deactivated successfully: %s (%s)", security.MaskEmail(user.Email), security.MaskUUID(user.ID.String()))

	return nil
}

// AdminResetPasswordUseCase maneja el restablecimiento de contraseña por admin
type AdminResetPasswordUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewAdminResetPasswordUseCase crea una nueva instancia del caso de uso
func NewAdminResetPasswordUseCase(userRepo repositories.UserRepository, logger *log.Logger) *AdminResetPasswordUseCase {
	return &AdminResetPasswordUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute ejecuta el restablecimiento de contraseña por admin
func (uc *AdminResetPasswordUseCase) Execute(ctx context.Context, userID uuid.UUID, request dtos.AdminResetPasswordRequestDTO) (*dtos.AdminResetPasswordResponseDTO, error) {
	// 1. Obtener el usuario
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	// 2. Generar nueva contraseña temporal si no se proporciona
	newPassword := request.NewPassword
	if newPassword == "" {
		newPassword = generateTemporaryPassword()
	} else {
		// Validar contraseña proporcionada
		if err := entities.ValidatePassword(newPassword); err != nil {
			return nil, err
		}
	}

	// 3. Hash de la nueva contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		uc.logger.Printf("Error hashing new password: %v", err)
		return nil, entities.NewDomainError("error al procesar la nueva contraseña")
	}

	// 4. Actualizar la contraseña y marcar como debe cambiar
	user.Password = string(hashedPassword)
	user.MustChangePassword = true
	user.UpdatedAt = time.Now()

	// 5. Guardar en el repositorio
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating password for user %s: %v", user.ID, err)
		return nil, err
	}

	uc.logger.Printf("Password reset by admin for user: %s", user.ID)

	response := &dtos.AdminResetPasswordResponseDTO{
		UserID:             user.ID,
		TemporaryPassword:  newPassword,
		MustChangePassword: user.MustChangePassword,
	}

	return response, nil
}

// AssignRoleUseCase maneja la asignación de roles por admin
type AssignRoleUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewAssignRoleUseCase crea una nueva instancia del caso de uso
func NewAssignRoleUseCase(userRepo repositories.UserRepository, logger *log.Logger) *AssignRoleUseCase {
	return &AssignRoleUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute ejecuta la asignación de rol
func (uc *AssignRoleUseCase) Execute(ctx context.Context, userID uuid.UUID, request dtos.AssignRoleRequestDTO) (*dtos.UserDTO, error) {
	// 1. Obtener el usuario
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	// 2. Validar el nuevo rol
	newRole := entities.UserRole(request.NewRole)
	if err := entities.ValidateUserRole(newRole); err != nil {
		return nil, err
	}

	// 3. Actualizar el rol
	oldRole := user.Rol
	user.Rol = newRole

	// 4. Gestionar ficha según el rol
	if newRole == entities.RoleAprendiz {
		if request.FichaID != nil && *request.FichaID != "" {
			if err := entities.ValidateFichaID(*request.FichaID); err != nil {
				return nil, err
			}
			err = user.AssignFicha(*request.FichaID)
			if err != nil {
				return nil, err
			}
		}
	} else {
		// No-aprendices no deben tener ficha
		user.FichaID = nil
	}

	user.UpdatedAt = time.Now()

	// 5. Guardar en el repositorio
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating role for user %s: %v", user.ID, err)
		return nil, err
	}

	uc.logger.Printf("Role updated for user %s: %s -> %s", user.ID, oldRole, newRole)

	return dtos.NewUserDTOFromEntity(user), nil
}

// ToggleUserStatusUseCase maneja la activación/desactivación de usuarios
type ToggleUserStatusUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewToggleUserStatusUseCase crea una nueva instancia del caso de uso
func NewToggleUserStatusUseCase(userRepo repositories.UserRepository, logger *log.Logger) *ToggleUserStatusUseCase {
	return &ToggleUserStatusUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute ejecuta el cambio de estado del usuario
func (uc *ToggleUserStatusUseCase) Execute(ctx context.Context, userID uuid.UUID) (*dtos.UserDTO, error) {
	// 1. Obtener el usuario
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	// 2. Cambiar el estado
	if user.IsActive {
		user.Deactivate()
	} else {
		user.Activate()
	}

	// 3. Guardar en el repositorio
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error toggling status for user %s: %v", user.ID, err)
		return nil, err
	}

	uc.logger.Printf("Status toggled for user %s: %t", user.ID, user.IsActive)

	return dtos.NewUserDTOFromEntity(user), nil
}

// generateTemporaryPassword genera una contraseña temporal segura
func generateTemporaryPassword() string {
	// Implementación simple - en producción debería ser más robusta
	return fmt.Sprintf("Temp%d#", time.Now().Unix()%10000+1000)
}

// UpdateUserUseCase maneja la actualización de usuarios por admin
type UpdateUserUseCase struct {
	userRepo repositories.UserRepository
	logger   *log.Logger
}

// NewUpdateUserUseCase crea una nueva instancia del caso de uso
func NewUpdateUserUseCase(userRepo repositories.UserRepository, logger *log.Logger) *UpdateUserUseCase {
	return &UpdateUserUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Execute ejecuta la actualización de usuario por admin
func (uc *UpdateUserUseCase) Execute(ctx context.Context, userID uuid.UUID, request dtos.UpdateUserRequestDTO) (*dtos.UserDTO, error) {
	// 1. Obtener el usuario existente
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Printf("Error getting user by ID %s: %v", userID, err)
		return nil, err
	}

	if user == nil {
		return nil, entities.NewDomainError("usuario no encontrado")
	}

	// 2. Validar email único si se está actualizando
	if request.Email != "" && request.Email != user.Email {
		exists, err := uc.userRepo.ExistsByEmail(ctx, request.Email)
		if err != nil {
			uc.logger.Printf("Error checking email existence: %v", err)
			return nil, err
		}
		if exists {
			return nil, entities.NewDomainError("ya existe un usuario con este email")
		}
		user.Email = request.Email
	}

	// 3. Validar documento único si se está actualizando
	if request.Documento != "" && request.Documento != user.Documento {
		exists, err := uc.userRepo.ExistsByDocumento(ctx, request.Documento)
		if err != nil {
			uc.logger.Printf("Error checking documento existence: %v", err)
			return nil, err
		}
		if exists {
			return nil, entities.NewDomainError("ya existe un usuario con este documento")
		}
		user.Documento = request.Documento
	}

	// 4. Actualizar campos básicos
	if request.Nombre != "" {
		user.Nombre = request.Nombre
	}
	if request.Apellido != "" {
		user.Apellido = request.Apellido
	}
	if request.ProgramaFormacion != "" {
		user.ProgramaFormacion = request.ProgramaFormacion
	}

	// 5. Actualizar rol si se especifica
	if request.Rol != "" {
		user.Rol = entities.UserRole(request.Rol)

		// Validar ficha para aprendices
		if user.Rol == entities.RoleAprendiz {
			if request.FichaID == nil || *request.FichaID == "" {
				if user.FichaID == nil || *user.FichaID == "" {
					return nil, entities.NewDomainError("los aprendices deben tener una ficha asignada")
				}
			} else {
				user.FichaID = request.FichaID
			}
		} else {
			// No-aprendices no deben tener ficha
			user.FichaID = nil
		}
	}

	// 6. Actualizar ficha si se especifica (solo para aprendices)
	if request.FichaID != nil {
		if user.Rol == entities.RoleAprendiz {
			user.FichaID = request.FichaID
		} else {
			return nil, entities.NewDomainError("solo los aprendices pueden tener ficha asignada")
		}
	}

	// 7. Actualizar estado si se especifica
	if request.IsActive != nil {
		if *request.IsActive {
			user.Activate()
		} else {
			user.Deactivate()
		}
	}

	// 8. Actualizar timestamp
	user.UpdatedAt = time.Now()

	// 9. Guardar en el repositorio
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		uc.logger.Printf("Error updating user %s: %v", security.MaskUUID(user.ID.String()), err)
		return nil, err
	}

	uc.logger.Printf("User updated successfully by admin: %s (%s)", security.MaskEmail(user.Email), security.MaskUUID(user.ID.String()))

	return dtos.NewUserDTOFromEntity(user), nil
}
