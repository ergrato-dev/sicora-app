package entities

import (
	"regexp"
	"strings"
)

// DomainError representa un error del dominio
type DomainError struct {
	Message string
}

func (e *DomainError) Error() string {
	return e.Message
}

// NewDomainError crea un nuevo error de dominio
func NewDomainError(message string) *DomainError {
	return &DomainError{Message: message}
}

// validateUserdata valida los datos básicos del usuario según reglas de dominio
func validateUserData(firstName, lastName, email, documentNumber string, role UserRole) error {
	if err := validateFirstName(firstName); err != nil {
		return err
	}

	if err := validateLastName(lastName); err != nil {
		return err
	}

	if err := validateEmail(email); err != nil {
		return err
	}

	if err := validateDocumentNumber(documentNumber); err != nil {
		return err
	}

	if err := validateRole(role); err != nil {
		return err
	}

	return nil
} // fin validateUserData

// validateFirstName valida el nombre del usuario
func validateFirstName(firstName string) error {
	firstName = strings.TrimSpace(firstName)
	if len(firstName) < 2 {
		return NewDomainError("El nombre debe tener al menos 2 caracteres")
	}

	if len(firstName) > 100 {
		return NewDomainError("El nombre no debe exceder los 100 caracteres")
	}

	// Solo letras, espacios y acentos

	matched, _ := regexp.MatchString(`^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$`, firstName)
	if !matched {
		return NewDomainError("El nombre solo puede contener letras, espacios y acentos")
	}

	return nil
} // fin validateFirstName

// validateLastName valida el apellido del usuario
func validateLastName(lastName string) error {
	lastName = strings.TrimSpace(lastName)
	if len(lastName) < 2 {
		return NewDomainError("El apellido debe tener al menos 2 caracteres")
	}

	if len(lastName) > 100 {
		return NewDomainError("El apellido no debe exceder los 100 caracteres")
	}

	// Solo letras, espacios y acentos
	matched, _ := regexp.MatchString(`^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$`, lastName)
	if !matched {
		return NewDomainError("El apellido solo puede contener letras, espacios y acentos")
	}

	return nil
} // fin validateLastName

// validateEmail valida el formato del email
func validateEmail(email string) error {
	email = strings.TrimSpace(strings.ToLower(email))
	if len(email) == 0 {
		return NewDomainError("El email no puede estar vacío")
	}

	if len(email) > 100 {
		return NewDomainError("El email no debe exceder los 100 caracteres")
	}

	// Validación del formato de email (acepta cualquier dominio válido)
	emailRegex := `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`
	matched, _ := regexp.MatchString(emailRegex, email)
	if !matched {
		return NewDomainError("El email no tiene un formato válido")
	}

	return nil
} // fin validateEmail

// validateDocumentNumber valida el número de documento del usuario
func validateDocumentNumber(documentNumber string) error {
	documentNumber = strings.TrimSpace(documentNumber)
	if len(documentNumber) < 7 {
		return NewDomainError("El número de documento debe tener al menos 7 caracteres")
	}

	if len(documentNumber) > 20 {
		return NewDomainError("El número de documento no debe exceder los 20 caracteres")
	}

	// Permitir números, letras y guiones (para documentos internacionales)
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9\-]+$`, documentNumber)
	if !matched {
		return NewDomainError("El número de documento solo puede contener números, letras y guiones")
	}

	return nil
} // fin validateDocumentNumber


// validateRole valida que el rol sea válido
func validateRole(role UserRole) error {
	switch role {
	case RoleAprendiz, RoleInstructor, RoleAdmin, RoleCoordinador, RoleDirectivo:
		return nil
	default:
		return NewDomainError("El rol no es válido: debe ser aprendiz, instructor, admin, coordinador o directivo")	
	}
} // fin validateRole

// ValidateFichaID valida el formato de ID de ficha
func ValidateFichaID(fichaID string) error {
	if len(fichaID) == 0 {
		return NewDomainError("El ID de ficha no puede estar vacío")
	}

	// Las fichas tienen formato numérico de 7 dígitos
	matched, _ := regexp.MatchString(`^[0-9]{7}$`, fichaID)
	if !matched {
		return NewDomainError("El ID de ficha debe tener un formato numérico de 7 dígitos")
	}

	return nil
} // fin ValidateFichaID

// ValidatePassword valida la contraseña del usuario de acuerdo con las políticas
func ValidatePassword(password string) error {
	if len(password) < 10 {
		return NewDomainError("La contraseña debe tener al menos 10 caracteres")
	}

	if len(password) > 128 {
		return NewDomainError("La contraseña no debe exceder los 128 caracteres")
	}

	// Al menos una minúscula
	if matched, _ := regexp.MatchString(`[a-z]`, password); !matched {
		return NewDomainError("La contraseña debe contener al menos una letra minúscula")
	}

	// Al menos una mayúscula
	if matched, _ := regexp.MatchString(`[A-Z]`, password); !matched {
		return NewDomainError("La contraseña debe contener al menos una letra mayúscula")
	}

	// Al menos un número
	if matched, _ := regexp.MatchString(`[0-9]`, password); !matched {
		return NewDomainError("La contraseña debe contener al menos un número")
	}

	// Al menos un carácter especial
	if matched, _ := regexp.MatchString(`[!@#$%^&*]`, password); !matched {
		return NewDomainError("La contraseña debe contener al menos un carácter especial (!@#$%^&*)")
	}

	return nil
}	 // fin ValidatePassword

// ValidateUserRole valida que el rol sea válido
func ValidateUserRole(role UserRole) error {
	return validateRole(role)
} // fin ValidateUserRole