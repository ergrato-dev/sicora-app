package entities

import (
	"time"

	"github.com/google/uuid"
)

// UserMFAMethod representa los métodos de MFA configurados para un usuario
type UserMFAMethod struct {
	ID              uuid.UUID  `gorm:"column:id_user_mfa_method;type:uuid;primaryKey;default:gen_random_uuid()" json:"id_user_mfa_method"`
	UserID          uuid.UUID  `gorm:"column:user_id_user_mfa_method;type:uuid;not null;index" json:"user_id_user_mfa_method"`
	MethodType      string     `gorm:"column:method_type_user_mfa_method;type:varchar(20);not null" json:"method_type_user_mfa_method"` // 'totp', 'email_otp', 'sms', 'webauthn'
	IsPrimary       bool       `gorm:"column:is_primary_user_mfa_method;default:false" json:"is_primary_user_mfa_method"`
	IsEnabled       bool       `gorm:"column:is_enabled_user_mfa_method;default:true" json:"is_enabled_user_mfa_method"`
	SecretEncrypted *string    `gorm:"column:secret_encrypted_user_mfa_method;type:text" json:"-"` // Solo para TOTP, nunca exponer en JSON
	PhoneNumber     *string    `gorm:"column:phone_number_user_mfa_method;type:varchar(20)" json:"phone_number_user_mfa_method,omitempty"`
	EmailAddress    *string    `gorm:"column:email_address_user_mfa_method;type:varchar(255)" json:"email_address_user_mfa_method,omitempty"`
	WebAuthnData    *string    `gorm:"column:webauthn_data_user_mfa_method;type:jsonb" json:"-"` // Credenciales WebAuthn, no exponer
	LastUsedAt      *time.Time `gorm:"column:last_used_at_user_mfa_method;type:timestamptz" json:"last_used_at_user_mfa_method,omitempty"`
	CreatedAt       time.Time  `gorm:"column:created_at_user_mfa_method;type:timestamptz;not null;default:now()" json:"created_at_user_mfa_method"`
	UpdatedAt       time.Time  `gorm:"column:updated_at_user_mfa_method;type:timestamptz;not null;default:now()" json:"updated_at_user_mfa_method"`
}

// TableName especifica el nombre de la tabla
func (UserMFAMethod) TableName() string {
	return "userservice.user_mfa_methods"
}

// MFABackupCode representa códigos de recuperación de un solo uso
type MFABackupCode struct {
	ID        uuid.UUID  `gorm:"column:id_mfa_backup_code;type:uuid;primaryKey;default:gen_random_uuid()" json:"id_mfa_backup_code"`
	UserID    uuid.UUID  `gorm:"column:user_id_mfa_backup_code;type:uuid;not null;index" json:"user_id_mfa_backup_code"`
	CodeHash  string     `gorm:"column:code_hash_mfa_backup_code;type:varchar(255);not null" json:"-"` // Bcrypt hash, nunca exponer
	IsUsed    bool       `gorm:"column:is_used_mfa_backup_code;default:false" json:"is_used_mfa_backup_code"`
	UsedAt    *time.Time `gorm:"column:used_at_mfa_backup_code;type:timestamptz" json:"used_at_mfa_backup_code,omitempty"`
	CreatedAt time.Time  `gorm:"column:created_at_mfa_backup_code;type:timestamptz;not null;default:now()" json:"created_at_mfa_backup_code"`
	ExpiresAt time.Time  `gorm:"column:expires_at_mfa_backup_code;type:timestamptz;not null" json:"expires_at_mfa_backup_code"` // 1 año de validez
}

// TableName especifica el nombre de la tabla
func (MFABackupCode) TableName() string {
	return "userservice.mfa_backup_codes"
}

// MFASession representa sesiones de verificación MFA
type MFASession struct {
	ID          uuid.UUID  `gorm:"column:id_mfa_session;type:uuid;primaryKey;default:gen_random_uuid()" json:"id_mfa_session"`
	UserID      uuid.UUID  `gorm:"column:user_id_mfa_session;type:uuid;not null;index" json:"user_id_mfa_session"`
	MethodType  string     `gorm:"column:method_type_mfa_session;type:varchar(20);not null" json:"method_type_mfa_session"`
	CodeHash    *string    `gorm:"column:code_hash_mfa_session;type:varchar(255)" json:"-"` // Para Email/SMS OTP
	IsVerified  bool       `gorm:"column:is_verified_mfa_session;default:false" json:"is_verified_mfa_session"`
	VerifiedAt  *time.Time `gorm:"column:verified_at_mfa_session;type:timestamptz" json:"verified_at_mfa_session,omitempty"`
	Attempts    int        `gorm:"column:attempts_mfa_session;default:0" json:"attempts_mfa_session"`
	MaxAttempts int        `gorm:"column:max_attempts_mfa_session;default:3" json:"max_attempts_mfa_session"`
	IPAddress   string     `gorm:"column:ip_address_mfa_session;type:varchar(45)" json:"ip_address_mfa_session"` // IPv4 o IPv6
	UserAgent   string     `gorm:"column:user_agent_mfa_session;type:text" json:"user_agent_mfa_session"`
	CreatedAt   time.Time  `gorm:"column:created_at_mfa_session;type:timestamptz;not null;default:now()" json:"created_at_mfa_session"`
	ExpiresAt   time.Time  `gorm:"column:expires_at_mfa_session;type:timestamptz;not null" json:"expires_at_mfa_session"` // 5 minutos para OTP
}

// TableName especifica el nombre de la tabla
func (MFASession) TableName() string {
	return "userservice.mfa_sessions"
}

// IsExpired verifica si la sesión MFA ha expirado
func (s *MFASession) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}

// HasExceededAttempts verifica si se excedieron los intentos permitidos
func (s *MFASession) HasExceededAttempts() bool {
	return s.Attempts >= s.MaxAttempts
}

// MFAEnforcementPolicy define políticas de MFA por rol
type MFAEnforcementPolicy struct {
	ID                 uuid.UUID `gorm:"column:id_mfa_enforcement_policy;type:uuid;primaryKey;default:gen_random_uuid()" json:"id_mfa_enforcement_policy"`
	RoleName           string    `gorm:"column:role_name_mfa_enforcement_policy;type:varchar(50);not null;uniqueIndex" json:"role_name_mfa_enforcement_policy"`
	PrimaryMethods     []string  `gorm:"column:primary_methods_mfa_enforcement_policy;type:text[];not null" json:"primary_methods_mfa_enforcement_policy"`          // ['totp', 'webauthn']
	AlternativeMethods []string  `gorm:"column:alternative_methods_mfa_enforcement_policy;type:text[]" json:"alternative_methods_mfa_enforcement_policy"`           // ['email_otp', 'sms']
	EnforcementLevel   string    `gorm:"column:enforcement_level_mfa_enforcement_policy;type:varchar(20);not null" json:"enforcement_level_mfa_enforcement_policy"` // 'mandatory', 'recommended', 'optional'
	GracePeriodDays    int       `gorm:"column:grace_period_days_mfa_enforcement_policy;default:0" json:"grace_period_days_mfa_enforcement_policy"`
	RequireBackupCodes bool      `gorm:"column:require_backup_codes_mfa_enforcement_policy;default:true" json:"require_backup_codes_mfa_enforcement_policy"`
	CreatedAt          time.Time `gorm:"column:created_at_mfa_enforcement_policy;type:timestamptz;not null;default:now()" json:"created_at_mfa_enforcement_policy"`
	UpdatedAt          time.Time `gorm:"column:updated_at_mfa_enforcement_policy;type:timestamptz;not null;default:now()" json:"updated_at_mfa_enforcement_policy"`
}

// TableName especifica el nombre de la tabla
func (MFAEnforcementPolicy) TableName() string {
	return "userservice.mfa_enforcement_policies"
}