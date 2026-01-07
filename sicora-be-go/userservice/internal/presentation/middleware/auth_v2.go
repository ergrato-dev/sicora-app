package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"userservice/internal/infrastructure/auth"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Permission constants
const (
	PermUserCreate     = "user.create"
	PermUserRead       = "user.read"
	PermUserUpdate     = "user.update"
	PermUserDelete     = "user.delete"
	PermUserBulkCreate = "user.bulk.create"
	PermUserBulkUpdate = "user.bulk.update"
	PermUserBulkDelete = "user.bulk.delete"
	PermUserManage     = "user.manage"
	PermSystemAdmin    = "system.admin"
	PermScheduleRead   = "schedule.read"
	PermScheduleManage = "schedule.manage"
	PermProfileRead    = "profile.read"
	PermProfileUpdate  = "profile.update"
)

// AuthConfig configuración del middleware de autenticación
type AuthConfig struct {
	JWTService      *auth.JWTService
	SkipPaths       []string // Rutas que no requieren autenticación
	CacheTTL        time.Duration
	EnableBlacklist bool
}

// AuthMiddlewareV2 middleware optimizado para JWT authentication
func AuthMiddlewareV2(config *AuthConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verificar si la ruta debe ser omitida
		if shouldSkipAuth(c.Request.URL.Path, config.SkipPaths) {
			c.Next()
			return
		}

		// Extraer token del header
		token, err := extractTokenFromHeader(c)
		if err != nil {
			respondWithError(c, http.StatusUnauthorized, "MISSING_TOKEN", err.Error())
			return
		}

		// Validar token
		claims, err := config.JWTService.ValidateToken(token)
		if err != nil {
			respondWithError(c, http.StatusUnauthorized, "INVALID_TOKEN", "Token validation failed")
			return
		}

		// Verificar si el usuario está activo
		if !claims.IsActive {
			respondWithError(c, http.StatusForbidden, "USER_INACTIVE", "User account is deactivated")
			return
		}

		// Verificar si el usuario debe cambiar contraseña
		if claims.MustChangePassword && !isPasswordChangeEndpoint(c.Request.URL.Path) {
			respondWithError(c, http.StatusForbidden, "PASSWORD_CHANGE_REQUIRED", "User must change password")
			return
		}

		// Establecer información del usuario en el contexto
		setUserContext(c, claims)

		c.Next()
	}
}

// RoleMiddlewareV2 middleware optimizado para autorización basada en roles
func RoleMiddlewareV2(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			respondWithError(c, http.StatusForbidden, "MISSING_ROLE", "User role not found")
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			respondWithError(c, http.StatusForbidden, "INVALID_ROLE", "Invalid role format")
			return
		}

		// Verificar permisos
		if !hasRequiredRole(roleStr, allowedRoles) {
			respondWithError(c, http.StatusForbidden, "INSUFFICIENT_PERMISSIONS",
				"User does not have required permissions")
			return
		}

		c.Next()
	}
}

// PermissionMiddleware middleware para permisos específicos
func PermissionMiddleware(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			respondWithError(c, http.StatusForbidden, "MISSING_ROLE", "User role not found")
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			respondWithError(c, http.StatusForbidden, "INVALID_ROLE", "Invalid role format")
			return
		}

		// Verificar permisos específicos basados en rol
		if !hasPermission(roleStr, permission) {
			respondWithError(c, http.StatusForbidden, "INSUFFICIENT_PERMISSIONS",
				"User does not have required permission: "+permission)
			return
		}

		c.Next()
	}
}

// OptionalAuthMiddleware middleware que permite acceso con o sin autenticación
func OptionalAuthMiddleware(jwtService *auth.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractTokenFromHeader(c)
		if err != nil {
			// No hay token, continuar sin autenticación
			c.Next()
			return
		}

		claims, err := jwtService.ValidateToken(token)
		if err != nil {
			// Token inválido, continuar sin autenticación
			c.Next()
			return
		}

		// Token válido, establecer contexto de usuario
		setUserContext(c, claims)
		c.Next()
	}
}

// RequireRoleMiddleware verifica si el usuario tiene uno de los roles requeridos
func RequireRoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verificar si el usuario está autenticado
		userRole, exists := c.Get("user_role")
		if !exists {
			respondWithError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
			return
		}

		role, ok := userRole.(string)
		if !ok {
			respondWithError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Invalid user role format")
			return
		}

		// Verificar si el usuario tiene uno de los roles permitidos
		if !hasRequiredRole(role, allowedRoles) {
			respondWithError(c, http.StatusForbidden, "INSUFFICIENT_PERMISSIONS",
				fmt.Sprintf("User role '%s' is not authorized for this action", role))
			return
		}

		c.Next()
	}
}

// RequirePermissionMiddleware verifica si el usuario tiene un permiso específico
func RequirePermissionMiddleware(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verificar si el usuario está autenticado
		userRole, exists := c.Get("user_role")
		if !exists {
			respondWithError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
			return
		}

		role, ok := userRole.(string)
		if !ok {
			respondWithError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Invalid user role format")
			return
		}

		// Verificar si el usuario tiene el permiso requerido
		if !hasPermission(role, permission) {
			respondWithError(c, http.StatusForbidden, "INSUFFICIENT_PERMISSIONS",
				fmt.Sprintf("User role '%s' does not have permission '%s'", role, permission))
			return
		}

		c.Next()
	}
}

// RequireActiveUserMiddleware verifica si el usuario está activo
func RequireActiveUserMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userActive, exists := c.Get("user_active")
		if !exists {
			respondWithError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
			return
		}

		isActive, ok := userActive.(bool)
		if !ok {
			respondWithError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Invalid user status format")
			return
		}

		if !isActive {
			respondWithError(c, http.StatusForbidden, "ACCOUNT_DISABLED", "User account is disabled")
			return
		}

		c.Next()
	}
}

// RequirePasswordChangeMiddleware verifica si el usuario debe cambiar su contraseña
func RequirePasswordChangeMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		mustChange, exists := c.Get("must_change_password")
		if !exists {
			respondWithError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
			return
		}

		mustChangePassword, ok := mustChange.(bool)
		if !ok {
			respondWithError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Invalid password change status format")
			return
		}

		// Si el usuario debe cambiar la contraseña y no está en un endpoint de cambio de contraseña
		if mustChangePassword && !isPasswordChangeEndpoint(c.Request.URL.Path) {
			respondWithError(c, http.StatusForbidden, "PASSWORD_CHANGE_REQUIRED",
				"Password change is required before accessing this resource")
			return
		}

		c.Next()
	}
}

// Helper functions

func extractTokenFromHeader(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", errors.New("authorization header is required")
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return "", errors.New("authorization header must start with Bearer")
	}

	return strings.TrimPrefix(authHeader, "Bearer "), nil
}

func shouldSkipAuth(path string, skipPaths []string) bool {
	for _, skipPath := range skipPaths {
		// SECURITY: Usar exact matching para prevenir bypass
		// Ejemplo: "/api/v1/auth" NO debe matchear "/api/v1/auth-bypass"
		if path == skipPath || strings.HasPrefix(path, skipPath+"/") {
			return true
		}
	}
	return false
}

func isPasswordChangeEndpoint(path string) bool {
	passwordChangeEndpoints := []string{
		"/api/v1/auth/change-password",
		"/api/v1/auth/force-change-password",
		"/api/v1/users/profile/change-password",
	}

	for _, endpoint := range passwordChangeEndpoints {
		if path == endpoint {
			return true
		}
	}
	return false
}

func setUserContext(c *gin.Context, claims *auth.UserClaims) {
	c.Set("user_id", claims.UserID.String())
	c.Set("user_uuid", claims.UserID)
	c.Set("user_email", claims.Email)
	c.Set("user_role", claims.Role)
	c.Set("user_active", claims.IsActive)
	c.Set("must_change_password", claims.MustChangePassword)
	c.Set("token_issued_at", claims.IssuedAt.Time)
	c.Set("token_expires_at", claims.ExpiresAt.Time)
}

func hasRequiredRole(userRole string, allowedRoles []string) bool {
	for _, allowedRole := range allowedRoles {
		if userRole == allowedRole {
			return true
		}
	}
	return false
}

func hasPermission(role, permission string) bool {
	// Definir permisos por rol usando constantes
	rolePermissions := map[string][]string{
		"admin": {
			PermUserCreate, PermUserRead, PermUserUpdate, PermUserDelete,
			PermUserBulkCreate, PermUserBulkUpdate, PermUserBulkDelete,
			PermUserManage, PermSystemAdmin,
		},
		"coordinador": {
			PermUserCreate, PermUserRead, PermUserUpdate,
			PermUserBulkCreate, PermUserBulkUpdate,
			PermUserManage,
		},
		"instructor": {
			PermUserRead, PermScheduleRead, PermScheduleManage,
		},
		"aprendiz": {
			PermProfileRead, PermProfileUpdate, PermScheduleRead,
		},
	}

	permissions, exists := rolePermissions[role]
	if !exists {
		return false
	}

	for _, perm := range permissions {
		if perm == permission {
			return true
		}
	}

	return false
}

func respondWithError(c *gin.Context, statusCode int, errorCode, message string) {
	c.JSON(statusCode, gin.H{
		"error":   errorCode,
		"message": message,
		"path":    c.Request.URL.Path,
		"method":  c.Request.Method,
	})
	c.Abort()
}

// GetUserID helper para extraer UUID del usuario del contexto
func GetUserID(c *gin.Context) (uuid.UUID, error) {
	userUUID, exists := c.Get("user_uuid")
	if !exists {
		return uuid.Nil, errors.New("user ID not found in context")
	}

	userID, ok := userUUID.(uuid.UUID)
	if !ok {
		return uuid.Nil, errors.New("invalid user ID format")
	}

	return userID, nil
}

// GetUserRole helper para extraer el rol del usuario del contexto
func GetUserRole(c *gin.Context) (string, error) {
	role, exists := c.Get("user_role")
	if !exists {
		return "", errors.New("user role not found in context")
	}

	roleStr, ok := role.(string)
	if !ok {
		return "", errors.New("invalid role format")
	}

	return roleStr, nil
}

// IsAdmin verifica si el usuario actual es admin
func IsAdmin(c *gin.Context) bool {
	role, err := GetUserRole(c)
	if err != nil {
		return false
	}
	return role == "admin"
}

// IsCoordinador verifica si el usuario actual es coordinador
func IsCoordinador(c *gin.Context) bool {
	role, err := GetUserRole(c)
	if err != nil {
		return false
	}
	return role == "coordinador"
}

// CanManageUsers verifica si el usuario puede gestionar otros usuarios
func CanManageUsers(c *gin.Context) bool {
	role, err := GetUserRole(c)
	if err != nil {
		return false
	}
	return role == "admin" || role == "coordinador"
}
