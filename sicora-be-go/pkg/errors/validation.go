package errors

import (
	"encoding/json"
	"fmt"
	"net/mail"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"github.com/google/uuid"
)

// ============================================================================
// VALIDATION BUILDER
// ============================================================================

// Validator provides a fluent API for validating input fields
type Validator struct {
	errors []FieldError
}

// NewValidator creates a new validator instance
func NewValidator() *Validator {
	return &Validator{
		errors: make([]FieldError, 0),
	}
}

// HasErrors returns true if there are validation errors
func (v *Validator) HasErrors() bool {
	return len(v.errors) > 0
}

// Errors returns the list of field errors
func (v *Validator) Errors() []FieldError {
	return v.errors
}

// Error returns a ValidationError if there are errors, nil otherwise
func (v *Validator) Error() error {
	if !v.HasErrors() {
		return nil
	}
	return NewValidationError(v.errors)
}

// AddError manually adds a field error
func (v *Validator) AddError(field, code, message string) *Validator {
	v.errors = append(v.errors, FieldError{
		Field:   field,
		Code:    code,
		Message: message,
	})
	return v
}

// ============================================================================
// STRING VALIDATIONS
// ============================================================================

// Required validates that a string is not empty
func (v *Validator) Required(field, value string) *Validator {
	if strings.TrimSpace(value) == "" {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "required",
			Message: fmt.Sprintf("El campo %s es obligatorio", field),
		})
	}
	return v
}

// MinLength validates minimum string length
func (v *Validator) MinLength(field, value string, min int) *Validator {
	if len(strings.TrimSpace(value)) < min {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "min_length",
			Message: fmt.Sprintf("El campo %s debe tener al menos %d caracteres", field, min),
		})
	}
	return v
}

// MaxLength validates maximum string length
func (v *Validator) MaxLength(field, value string, max int) *Validator {
	if len(value) > max {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "max_length",
			Message: fmt.Sprintf("El campo %s no puede tener más de %d caracteres", field, max),
		})
	}
	return v
}

// Length validates exact string length
func (v *Validator) Length(field, value string, length int) *Validator {
	if len(value) != length {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "length",
			Message: fmt.Sprintf("El campo %s debe tener exactamente %d caracteres", field, length),
		})
	}
	return v
}

// LengthBetween validates string length is within range
func (v *Validator) LengthBetween(field, value string, min, max int) *Validator {
	l := len(strings.TrimSpace(value))
	if l < min || l > max {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "length_between",
			Message: fmt.Sprintf("El campo %s debe tener entre %d y %d caracteres", field, min, max),
		})
	}
	return v
}

// ============================================================================
// FORMAT VALIDATIONS
// ============================================================================

// Email validates email format
func (v *Validator) Email(field, value string) *Validator {
	if value == "" {
		return v // Skip if empty (use Required for mandatory)
	}
	_, err := mail.ParseAddress(value)
	if err != nil {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "email_format",
			Message: "El formato del email no es válido",
		})
	}
	return v
}

// UUID validates UUID format
func (v *Validator) UUID(field, value string) *Validator {
	if value == "" {
		return v
	}
	if _, err := uuid.Parse(value); err != nil {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "uuid_format",
			Message: "El identificador no tiene un formato válido",
		})
	}
	return v
}

// Regex validates against a regular expression
func (v *Validator) Regex(field, value, pattern, message string) *Validator {
	if value == "" {
		return v
	}
	matched, err := regexp.MatchString(pattern, value)
	if err != nil || !matched {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "pattern",
			Message: message,
		})
	}
	return v
}

// AlphaNumeric validates that string contains only letters and numbers
func (v *Validator) AlphaNumeric(field, value string) *Validator {
	if value == "" {
		return v
	}
	for _, r := range value {
		if !unicode.IsLetter(r) && !unicode.IsNumber(r) {
			v.errors = append(v.errors, FieldError{
				Field:   field,
				Code:    "alphanumeric",
				Message: fmt.Sprintf("El campo %s solo puede contener letras y números", field),
			})
			break
		}
	}
	return v
}

// Numeric validates that string contains only numbers
func (v *Validator) Numeric(field, value string) *Validator {
	if value == "" {
		return v
	}
	for _, r := range value {
		if !unicode.IsDigit(r) {
			v.errors = append(v.errors, FieldError{
				Field:   field,
				Code:    "numeric",
				Message: fmt.Sprintf("El campo %s solo puede contener números", field),
			})
			break
		}
	}
	return v
}

// Phone validates Colombian phone format (10 digits starting with 3)
func (v *Validator) Phone(field, value string) *Validator {
	if value == "" {
		return v
	}
	// Remove common separators
	clean := strings.Map(func(r rune) rune {
		if unicode.IsDigit(r) {
			return r
		}
		return -1
	}, value)

	if len(clean) != 10 || !strings.HasPrefix(clean, "3") {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "phone_format",
			Message: "El número de teléfono debe tener 10 dígitos y comenzar con 3",
		})
	}
	return v
}

// DocumentNumber validates Colombian document number (CC, TI, CE)
func (v *Validator) DocumentNumber(field, value, docType string) *Validator {
	if value == "" {
		return v
	}

	clean := strings.TrimSpace(value)
	var valid bool
	var msg string

	switch strings.ToUpper(docType) {
	case "CC": // Cédula de Ciudadanía: 6-10 digits
		if matched, _ := regexp.MatchString(`^\d{6,10}$`, clean); matched {
			valid = true
		} else {
			msg = "La cédula debe tener entre 6 y 10 dígitos"
		}
	case "TI": // Tarjeta de Identidad: 10-11 digits
		if matched, _ := regexp.MatchString(`^\d{10,11}$`, clean); matched {
			valid = true
		} else {
			msg = "La tarjeta de identidad debe tener entre 10 y 11 dígitos"
		}
	case "CE": // Cédula de Extranjería: 6-7 digits
		if matched, _ := regexp.MatchString(`^\d{6,7}$`, clean); matched {
			valid = true
		} else {
			msg = "La cédula de extranjería debe tener entre 6 y 7 dígitos"
		}
	case "PP": // Pasaporte: alphanumeric
		if matched, _ := regexp.MatchString(`^[A-Z0-9]{5,15}$`, strings.ToUpper(clean)); matched {
			valid = true
		} else {
			msg = "El pasaporte debe tener entre 5 y 15 caracteres alfanuméricos"
		}
	default:
		msg = "Tipo de documento no válido"
	}

	if !valid {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "document_format",
			Message: msg,
		})
	}
	return v
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

// PasswordStrength validates password meets security requirements
func (v *Validator) PasswordStrength(field, value string) *Validator {
	if value == "" {
		return v
	}

	var issues []string

	if len(value) < 8 {
		issues = append(issues, "mínimo 8 caracteres")
	}
	if len(value) > 128 {
		issues = append(issues, "máximo 128 caracteres")
	}

	var hasUpper, hasLower, hasNumber, hasSpecial bool
	for _, r := range value {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsDigit(r):
			hasNumber = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSpecial = true
		}
	}

	if !hasUpper {
		issues = append(issues, "al menos una mayúscula")
	}
	if !hasLower {
		issues = append(issues, "al menos una minúscula")
	}
	if !hasNumber {
		issues = append(issues, "al menos un número")
	}
	if !hasSpecial {
		issues = append(issues, "al menos un carácter especial")
	}

	if len(issues) > 0 {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "password_weak",
			Message: "La contraseña requiere: " + strings.Join(issues, ", "),
		})
	}
	return v
}

// PasswordMatch validates that two passwords match
func (v *Validator) PasswordMatch(field, password, confirmPassword string) *Validator {
	if password != confirmPassword {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "password_mismatch",
			Message: "Las contraseñas no coinciden",
		})
	}
	return v
}

// ============================================================================
// NUMBER VALIDATIONS
// ============================================================================

// Min validates minimum value
func (v *Validator) Min(field string, value, min int) *Validator {
	if value < min {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "min_value",
			Message: fmt.Sprintf("El campo %s debe ser mayor o igual a %d", field, min),
		})
	}
	return v
}

// Max validates maximum value
func (v *Validator) Max(field string, value, max int) *Validator {
	if value > max {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "max_value",
			Message: fmt.Sprintf("El campo %s debe ser menor o igual a %d", field, max),
		})
	}
	return v
}

// Between validates value is within range
func (v *Validator) Between(field string, value, min, max int) *Validator {
	if value < min || value > max {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "between",
			Message: fmt.Sprintf("El campo %s debe estar entre %d y %d", field, min, max),
		})
	}
	return v
}

// Positive validates that value is positive
func (v *Validator) Positive(field string, value int) *Validator {
	if value <= 0 {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "positive",
			Message: fmt.Sprintf("El campo %s debe ser un número positivo", field),
		})
	}
	return v
}

// ============================================================================
// COLLECTION VALIDATIONS
// ============================================================================

// InSlice validates value is in allowed list
func (v *Validator) InSlice(field, value string, allowed []string) *Validator {
	if value == "" {
		return v
	}
	for _, a := range allowed {
		if value == a {
			return v
		}
	}
	v.errors = append(v.errors, FieldError{
		Field:   field,
		Code:    "in_list",
		Message: fmt.Sprintf("El valor de %s no es válido. Valores permitidos: %s", field, strings.Join(allowed, ", ")),
	})
	return v
}

// NotInSlice validates value is not in disallowed list
func (v *Validator) NotInSlice(field, value string, disallowed []string) *Validator {
	for _, d := range disallowed {
		if value == d {
			v.errors = append(v.errors, FieldError{
				Field:   field,
				Code:    "not_in_list",
				Message: fmt.Sprintf("El valor de %s no está permitido", field),
			})
			break
		}
	}
	return v
}

// SliceNotEmpty validates that a slice is not empty
func (v *Validator) SliceNotEmpty(field string, length int) *Validator {
	if length == 0 {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "slice_empty",
			Message: fmt.Sprintf("El campo %s debe contener al menos un elemento", field),
		})
	}
	return v
}

// SliceMaxLength validates slice doesn't exceed max length
func (v *Validator) SliceMaxLength(field string, length, max int) *Validator {
	if length > max {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "slice_max_length",
			Message: fmt.Sprintf("El campo %s no puede tener más de %d elementos", field, max),
		})
	}
	return v
}

// ============================================================================
// CONDITIONAL VALIDATIONS
// ============================================================================

// RequiredIf validates field is required if condition is true
func (v *Validator) RequiredIf(field, value string, condition bool) *Validator {
	if condition && strings.TrimSpace(value) == "" {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "required_if",
			Message: fmt.Sprintf("El campo %s es obligatorio", field),
		})
	}
	return v
}

// RequiredUnless validates field is required unless condition is true
func (v *Validator) RequiredUnless(field, value string, condition bool) *Validator {
	return v.RequiredIf(field, value, !condition)
}

// RequiredWith validates field is required when another field has value
func (v *Validator) RequiredWith(field, value, otherField, otherValue string) *Validator {
	return v.RequiredIf(field, value, strings.TrimSpace(otherValue) != "")
}

// ============================================================================
// JSON VALIDATION
// ============================================================================

// ValidJSON validates that a string is valid JSON
func (v *Validator) ValidJSON(field, value string) *Validator {
	if value == "" {
		return v
	}
	if !json.Valid([]byte(value)) {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "json_format",
			Message: "El formato JSON no es válido",
		})
	}
	return v
}

// ============================================================================
// CUSTOM VALIDATION
// ============================================================================

// Custom allows custom validation logic
func (v *Validator) Custom(field string, validate func() (bool, string)) *Validator {
	valid, message := validate()
	if !valid {
		v.errors = append(v.errors, FieldError{
			Field:   field,
			Code:    "custom",
			Message: message,
		})
	}
	return v
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// Validate creates a validator and returns the error
// Useful for simple one-liner validations
func Validate(fn func(*Validator)) error {
	v := NewValidator()
	fn(v)
	return v.Error()
}

// MustValidate panics if validation fails (for testing/development)
func MustValidate(fn func(*Validator)) {
	if err := Validate(fn); err != nil {
		panic(err)
	}
}

// ValidateStruct validates a struct using tags (simplified version)
// For full struct validation, consider using github.com/go-playground/validator
func ValidateStruct(s interface{}) error {
	// This is a placeholder for struct validation
	// In production, integrate with go-playground/validator
	return nil
}

// ============================================================================
// QUICK VALIDATORS (single field checks)
// ============================================================================

// IsValidEmail checks if email format is valid
func IsValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

// IsValidUUID checks if UUID format is valid
func IsValidUUID(id string) bool {
	_, err := uuid.Parse(id)
	return err == nil
}

// IsValidPhone checks if phone format is valid (Colombian)
func IsValidPhone(phone string) bool {
	clean := strings.Map(func(r rune) rune {
		if unicode.IsDigit(r) {
			return r
		}
		return -1
	}, phone)
	return len(clean) == 10 && strings.HasPrefix(clean, "3")
}

// IsValidPassword checks if password meets strength requirements
func IsValidPassword(password string) bool {
	if len(password) < 8 || len(password) > 128 {
		return false
	}

	var hasUpper, hasLower, hasNumber, hasSpecial bool
	for _, r := range password {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsDigit(r):
			hasNumber = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSpecial = true
		}
	}
	return hasUpper && hasLower && hasNumber && hasSpecial
}

// ParseInt safely parses an integer from string
func ParseInt(value string, defaultVal int) int {
	if v, err := strconv.Atoi(value); err == nil {
		return v
	}
	return defaultVal
}

// ParseBool safely parses a boolean from string
func ParseBool(value string, defaultVal bool) bool {
	if v, err := strconv.ParseBool(value); err == nil {
		return v
	}
	return defaultVal
}
