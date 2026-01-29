package entities

import (
	"time"

	"github.com/google/uuid"
)

// UsaerRole representa los roles disponibles en el sistema SICORA
type UserRole string

const (
	RoleAprendiz    UserRole = "aprendiz"
	RoleInstructor  UserRole = "instructor"
	RoleAdmin       UserRole = "admin"
	RoleCoordinador UserRole = "coordinador"
	RoleDirectivo   UserRole = "directivo"
)

// User representa la entidad de usuario en el dominio SICORA
// Contiene las reglas de negocio fundamentales para usuarios
type User struct {
	ID              uuid.UUID  `json:"id"`
	FirstName       string     `json:"first_name"`
	LastName        string     `json:"last_name"`
	Email           string     `json:"email"`
	DocumentNumber  string     `json:"document_number"`
	DocumentType    string     `json:"document_type"`
	Phone           *string    `json:"phone"`
	Role            UserRole   `json:"role"`
	Status          string     `json:"status"`
	Password        string     `json:"_"` // Nunca serialize un password
	IsActive        bool       `json:"is_active"`
	FichaID         *string    `json:"ficha_id,omitempty"` // Solo para aprendices
	SedeID          *uuid.UUID `json:"sede_id,omitempty"`
	EmailVerified   bool       `json:"email_verified"`
	EmailVerifiedAt *time.Time `json:"email_verified_at,omitempty"`

	// Legal Consent Fields (Ley 1582/2012 - Habeas data Colombia)
	AcceptedPrivacyPolicyAt *time.Time `json:"accepted_privacy_policy_at,omitempty"`
	AcceptedTermsAt         *time.Time `json:"accepted_terms_at,omitempty"`
	AcceptedDataTreatmentAt *time.Time `json:"accepted_data_treatment_at,omitempty"`
	PrivacyPolicyVersion    *string    `json:"privacy_policy_version,omitempty"`
	TermsVersion            *string    `json:"terms_version,omitempty"`
	DataTreatmentVersion    *string    `json:"data_treatment_version,omitempty"`
	AcceptanceIPAddress     *string    `json:"acceptance_ip_address,omitempty"`

	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	LastLogin *time.Time `json:"last_login,omitempty"`
} // fin User

// NewUser crea una nueva instancia de User con validaciones de dominio
func NewUser(firstName, lastName, email, documentNumber, documentType string, role UserRole) (*User, error) {
	if err := validateUserData(firstName, lastName, email, documentNumber, role); err != nil {
		return nil, err
	}

	now := time.Now()
	user := &User{
		ID:             uuid.New(),
		FirstName:      firstName,
		LastName:       lastName,
		Email:          email,
		DocumentNumber: documentNumber,
		DocumentType:   documentType,
		Role:           role,
		Status:         "active",
		IsActive:       true,
		EmailVerified:  false,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	return user, nil

} // fin NewUser

// GetFullname retorna el nombre completo del usuario
func (u *User) GetFullname() string {
	return u.FirstName + " " + u.LastName
}

// IsAprendiz verifica si el usuario es un aprendiz
func (u *User) IsAprendiz() bool {
	return u.Role == RoleAprendiz
}

// IsInstructor verifica si el usuario es un instructor
func (u *User) IsInstructor() bool {
	return u.Role == RoleInstructor
}

// IsAdmin verifica si el usuario es administrador
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// MarkAsLoggedIn actualiza el tiemstamp del último login
func (u *User) MarkAsLoggedIn() {
	now := time.Now()
	u.LastLogin = &now
	u.UpdatedAt = now
}

// Deactivate desactiva al usuario
func (u *User) Deactivate() {
	u.IsActive = false
	u.UpdatedAt = time.Now()
}

// Activate activa el usuario
func (u *User) Activate() {
	u.IsActive = true
	u.UpdatedAt = time.Now()
}

// AcceptLegalPolicies registra la aceptación de las políticas legales
// Cumple con Ley 1581/2012 (Habeas Data Colombia)
func (u *User) AcceptLegalPolicies(privacyVersion, termsVersion, dataVersion, ipAddress string) {
	now := time.Now()
	u.AcceptedPrivacyPolicyAt = &now
	u.AcceptedTermsAt = &now
	u.AcceptedDataTreatmentAt = &now
	u.PrivacyPolicyVersion = &privacyVersion
	u.TermsVersion = &termsVersion
	u.DataTreatmentVersion = &dataVersion
	u.AcceptanceIPAddress = &ipAddress
	u.UpdatedAt = now
} // fin AcceptLegalPolicies

// HasAcceptedAllPolicies verifica si el usuario ha aceptado todas las políticas requeridas
func (u *User) HasAcceptedAllPolicies() bool {
	return u.AcceptedPrivacyPolicyAt != nil &&
		u.AcceptedTermsAt != nil &&
		u.AcceptedDataTreatmentAt != nil
}

// NeedsPolicyUpdate verifica si el usuario necesita re-aceptar políticas por cambio de versión
func (u *User) NeedsPolicyUpdate(currentPrivacyVersion, currentTermsVersion, currentDataVersion string) bool {
	// Si no ha aceptado, necesita actualizar
	if !u.HasAcceptedAllPolicies() {
		return true
	}

	// Si alguna versión es diferente,necesita re-aceptar
	return (u.PrivacyPolicyVersion != nil && *u.PrivacyPolicyVersion != currentPrivacyVersion) ||
		(u.TermsVersion != nil && *u.TermsVersion != currentTermsVersion) ||
		(u.DataTreatmentVersion != nil && *u.DataTreatmentVersion != currentDataVersion)
} // fin NeedsPolicyUpdate

// CanAccessSystem verifica si el usuario puede acceder al sistema
func (u *User) CanAccessSystem() bool {
	return u.IsActive && u.HasAcceptedAllPolicies()
}
