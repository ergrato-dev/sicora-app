package usecases

import (
	"context"
	"fmt"

	"userservice/internal/application/dtos"
	"userservice/internal/domain/entities"
	"userservice/internal/domain/repositories"

	"github.com/go-playground/validator/v10"
)

// BulkUserUseCases maneja las operaciones masivas de usuarios
type BulkUserUseCases struct {
	userRepo  repositories.UserRepository
	validator *validator.Validate
}

// NewBulkUserUseCases crea una nueva instancia de BulkUserUseCases
func NewBulkUserUseCases(userRepo repositories.UserRepository, validator *validator.Validate) *BulkUserUseCases {
	return &BulkUserUseCases{
		userRepo:  userRepo,
		validator: validator,
	}
}

// BulkCreateUsers crea múltiples usuarios en una operación
func (uc *BulkUserUseCases) BulkCreateUsers(ctx context.Context, request *dtos.BulkCreateUserRequest) (*dtos.BulkOperationResponse, error) {
	if err := uc.validator.Struct(request); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	response := &dtos.BulkOperationResponse{
		TotalProcessed: len(request.Users),
		Results:        make([]dtos.BulkUserResult, 0, len(request.Users)),
	}

	users := make([]*entities.User, 0, len(request.Users))

	// Pre-validación y conversión
	for _, userReq := range request.Users {
		if err := uc.validator.Struct(&userReq); err != nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   userReq.Email,
				Success: false,
				Message: fmt.Sprintf("validation error: %v", err),
			})
			continue
		}

		// Verificar si el usuario ya existe
		existingUser, err := uc.userRepo.GetByEmail(ctx, userReq.Email)
		if err != nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   userReq.Email,
				Success: false,
				Message: fmt.Sprintf("error checking existing user: %v", err),
			})
			continue
		}

		if existingUser != nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   userReq.Email,
				Success: false,
				Message: "user already exists",
			})
			continue
		}

		// Verificar documento único
		existingByDoc, err := uc.userRepo.GetByDocumento(ctx, userReq.Documento)
		if err != nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   userReq.Email,
				Success: false,
				Message: fmt.Sprintf("error checking existing document: %v", err),
			})
			continue
		}

		if existingByDoc != nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   userReq.Email,
				Success: false,
				Message: "document number already exists",
			})
			continue
		}

		// Crear entidad
		user, err := entities.NewUser(
			userReq.Nombre,
			userReq.Apellido,
			userReq.Email,
			userReq.Documento,
			entities.UserRole(userReq.Rol),
			userReq.ProgramaFormacion,
		)
		if err != nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   userReq.Email,
				Success: false,
				Message: fmt.Sprintf("error creating user entity: %v", err),
			})
			continue
		}

		// Asignar ficha si es aprendiz
		if userReq.FichaID != nil && *userReq.FichaID != "" {
			user.FichaID = userReq.FichaID
		}

		users = append(users, user)
		response.Results = append(response.Results, dtos.BulkUserResult{
			Email:   userReq.Email,
			Success: true,
			Message: "prepared for creation",
		})
	}

	// Crear usuarios en masa
	if len(users) > 0 {
		if err := uc.userRepo.BulkCreate(ctx, users); err != nil {
			// Si falla la creación en masa, marcar todos como fallidos
			for _, user := range users {
				for j := range response.Results {
					if response.Results[j].Email == user.Email && response.Results[j].Success {
						response.Results[j].Success = false
						response.Results[j].Message = fmt.Sprintf("bulk creation failed: %v", err)
						response.FailureCount++
						response.SuccessCount = max(0, response.SuccessCount-1)
						break
					}
				}
			}
		} else {
			// Actualizar resultados exitosos con IDs
			for _, user := range users {
				for j := range response.Results {
					if response.Results[j].Email == user.Email && response.Results[j].Success {
						response.Results[j].UserID = &user.ID
						response.Results[j].Message = "user created successfully"
						response.SuccessCount++
						break
					}
				}
			}
		}
	}

	response.Message = fmt.Sprintf("Processed %d users: %d success, %d failed",
		response.TotalProcessed, response.SuccessCount, response.FailureCount)

	return response, nil
}

// BulkUpdateUsers actualiza múltiples usuarios
func (uc *BulkUserUseCases) BulkUpdateUsers(ctx context.Context, request *dtos.BulkUpdateUserRequest) (*dtos.BulkOperationResponse, error) {
	if err := uc.validator.Struct(request); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	response := &dtos.BulkOperationResponse{
		TotalProcessed: len(request.Users),
		Results:        make([]dtos.BulkUserResult, 0, len(request.Users)),
	}

	updates := make(map[string]*entities.User)

	// Pre-validación y preparación
	for _, updateReq := range request.Users {
		if err := uc.validator.Struct(&updateReq); err != nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   updateReq.Email,
				Success: false,
				Message: fmt.Sprintf("validation error: %v", err),
			})
			continue
		}

		// Obtener usuario existente
		existingUser, err := uc.userRepo.GetByEmail(ctx, updateReq.Email)
		if err != nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   updateReq.Email,
				Success: false,
				Message: fmt.Sprintf("error getting user: %v", err),
			})
			continue
		}

		if existingUser == nil {
			response.FailureCount++
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   updateReq.Email,
				Success: false,
				Message: "user not found",
			})
			continue
		}

		// Aplicar actualizaciones
		updatedUser := *existingUser
		if updateReq.Nombre != nil {
			updatedUser.Nombre = *updateReq.Nombre
		}
		if updateReq.Apellido != nil {
			updatedUser.Apellido = *updateReq.Apellido
		}
		if updateReq.Documento != nil {
			updatedUser.Documento = *updateReq.Documento
		}
		if updateReq.FichaID != nil {
			updatedUser.FichaID = updateReq.FichaID
		}
		if updateReq.ProgramaFormacion != nil {
			updatedUser.ProgramaFormacion = *updateReq.ProgramaFormacion
		}
		if updateReq.IsActive != nil {
			updatedUser.IsActive = *updateReq.IsActive
		}

		updates[updateReq.Email] = &updatedUser
		response.Results = append(response.Results, dtos.BulkUserResult{
			Email:   updateReq.Email,
			Success: true,
			Message: "prepared for update",
		})
	}

	// Ejecutar actualizaciones
	if len(updates) > 0 {
		bulkResult, err := uc.userRepo.BulkUpdate(ctx, updates)
		if err != nil {
			return nil, fmt.Errorf("bulk update failed: %w", err)
		}

		response.SuccessCount = bulkResult.Success
		response.FailureCount += bulkResult.Failed

		// Actualizar resultados con errores específicos
		for _, repoError := range bulkResult.Errors {
			for i := range response.Results {
				if response.Results[i].Email == repoError.User {
					response.Results[i].Success = false
					response.Results[i].Message = repoError.Error
					break
				}
			}
		}
	}

	response.Message = fmt.Sprintf("Processed %d users: %d success, %d failed",
		response.TotalProcessed, response.SuccessCount, response.FailureCount)

	return response, nil
}

// BulkDeleteUsers elimina múltiples usuarios
func (uc *BulkUserUseCases) BulkDeleteUsers(ctx context.Context, request *dtos.BulkDeleteRequest) (*dtos.BulkOperationResponse, error) {
	if err := uc.validator.Struct(request); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	response := &dtos.BulkOperationResponse{
		TotalProcessed: len(request.Emails),
		Results:        make([]dtos.BulkUserResult, 0, len(request.Emails)),
	}

	bulkResult, err := uc.userRepo.BulkDelete(ctx, request.Emails)
	if err != nil {
		return nil, fmt.Errorf("bulk delete failed: %w", err)
	}

	response.SuccessCount = bulkResult.Success
	response.FailureCount = bulkResult.Failed

	// Preparar resultados detallados
	errorMap := make(map[string]string)
	for _, repoError := range bulkResult.Errors {
		errorMap[repoError.User] = repoError.Error
	}

	for _, email := range request.Emails {
		if errorMsg, hasError := errorMap[email]; hasError {
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   email,
				Success: false,
				Message: errorMsg,
			})
		} else {
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   email,
				Success: true,
				Message: "user deleted successfully",
			})
		}
	}

	response.Message = fmt.Sprintf("Processed %d users: %d success, %d failed",
		response.TotalProcessed, response.SuccessCount, response.FailureCount)

	return response, nil
}

// BulkChangeStatus cambia el estado de múltiples usuarios
func (uc *BulkUserUseCases) BulkChangeStatus(ctx context.Context, request *dtos.BulkStatusRequest) (*dtos.BulkOperationResponse, error) {
	if err := uc.validator.Struct(request); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	response := &dtos.BulkOperationResponse{
		TotalProcessed: len(request.Emails),
		Results:        make([]dtos.BulkUserResult, 0, len(request.Emails)),
	}

	bulkResult, err := uc.userRepo.BulkStatusChange(ctx, request.Emails, request.IsActive)
	if err != nil {
		return nil, fmt.Errorf("bulk status change failed: %w", err)
	}

	response.SuccessCount = bulkResult.Success
	response.FailureCount = bulkResult.Failed

	// Preparar resultados detallados
	errorMap := make(map[string]string)
	for _, repoError := range bulkResult.Errors {
		errorMap[repoError.User] = repoError.Error
	}

	statusText := "activated"
	if !request.IsActive {
		statusText = "deactivated"
	}

	for _, email := range request.Emails {
		if errorMsg, hasError := errorMap[email]; hasError {
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   email,
				Success: false,
				Message: errorMsg,
			})
		} else {
			response.Results = append(response.Results, dtos.BulkUserResult{
				Email:   email,
				Success: true,
				Message: fmt.Sprintf("user %s successfully", statusText),
			})
		}
	}

	response.Message = fmt.Sprintf("Processed %d users: %d success, %d failed",
		response.TotalProcessed, response.SuccessCount, response.FailureCount)

	return response, nil
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
