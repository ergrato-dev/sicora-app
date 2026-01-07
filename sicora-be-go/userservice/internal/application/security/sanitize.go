package security

import (
	"strings"
)

// maskString enmascara una cadena mostrando solo los primeros n caracteres
func maskString(s string, showChars int) string {
	if len(s) <= showChars {
		return s + "***"
	}
	return s[:showChars] + "***"
}

// MaskEmail enmascara un email para logging seguro
// ejemplo: "usuario@dominio.com" -> "us***@do***.com"
func MaskEmail(email string) string {
	if email == "" {
		return ""
	}

	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return "***@***"
	}

	local := parts[0]
	domain := parts[1]

	// Enmascarar parte local
	maskedLocal := maskString(local, 2)

	// Enmascarar dominio (antes del TLD)
	domainParts := strings.Split(domain, ".")
	if len(domainParts) >= 2 {
		maskedDomain := maskString(domainParts[0], 2)
		tld := strings.Join(domainParts[1:], ".")
		return maskedLocal + "@" + maskedDomain + "." + tld
	}

	return maskedLocal + "@" + maskString(domain, 2)
}

// MaskToken enmascara un token para logging seguro
// ejemplo: "abc123def456" -> "abc***456"
func MaskToken(token string) string {
	if token == "" {
		return ""
	}

	if len(token) <= 6 {
		return "***"
	}

	return token[:3] + "***" + token[len(token)-3:]
}

// MaskUUID enmascara un UUID para logging seguro
// ejemplo: "550e8400-e29b-41d4-a716-446655440000" -> "550e***0000"
func MaskUUID(id string) string {
	if id == "" {
		return ""
	}

	if len(id) <= 8 {
		return "***"
	}

	return id[:4] + "***" + id[len(id)-4:]
}

// MaskIP enmascara una IP para logging seguro
// ejemplo: "192.168.1.100" -> "192.168.***"
func MaskIP(ip string) string {
	if ip == "" {
		return ""
	}

	parts := strings.Split(ip, ".")
	if len(parts) == 4 {
		return parts[0] + "." + parts[1] + ".***"
	}

	// IPv6 o formato desconocido
	if len(ip) > 8 {
		return ip[:8] + "***"
	}

	return "***"
}

// SanitizeError limpia mensajes de error para no exponer información sensible
func SanitizeError(err error) string {
	if err == nil {
		return ""
	}

	msg := err.Error()

	// Patrones sensibles a ocultar
	sensitivePatterns := []string{
		"password",
		"token",
		"secret",
		"key",
		"credential",
	}

	lowMsg := strings.ToLower(msg)
	for _, pattern := range sensitivePatterns {
		if strings.Contains(lowMsg, pattern) {
			return "error procesando solicitud"
		}
	}

	return msg
}
