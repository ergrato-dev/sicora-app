package middleware

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Permission constants para ScheduleService
const (
	PermScheduleCreate     = "schedule.create"
	PermScheduleRead       = "schedule.read"
	PermScheduleUpdate     = "schedule.update"
	PermScheduleDelete     = "schedule.delete"
	PermScheduleBulkCreate = "schedule.bulk.create"
	PermScheduleBulkUpdate = "schedule.bulk.update"
	PermScheduleBulkDelete = "schedule.bulk.delete"
	PermScheduleManage     = "schedule.manage"
	PermMasterDataRead     = "master.read"
	PermMasterDataCreate   = "master.create"
	PermMasterDataUpdate   = "master.update"
	PermMasterDataDelete   = "master.delete"
	PermMasterDataManage   = "master.manage"
	PermSystemAdmin        = "system.admin"
)

// UserClaims estructura de claims JWT
type UserClaims struct {
	UserID      uuid.UUID `json:"user_id"`
	Email       string    `json:"email"`
	Role        string    `json:"role"`
	Permissions []string  `json:"permissions"`
	FichaID     *string   `json:"ficha_id,omitempty"`
	jwt.RegisteredClaims
}

// AuthConfig configuración del middleware de autenticación
type AuthConfig struct {
	SecretKey string
	SkipPaths []string
	CacheTTL  time.Duration
}

// AuthMiddleware struct para gestionar autenticación
type AuthMiddleware struct {
	config *AuthConfig
}

// NewAuthMiddleware constructor
func NewAuthMiddleware(config *AuthConfig) *AuthMiddleware {
	return &AuthMiddleware{
		config: config,
	}
}

// Middleware retorna el middleware gin handler
func (am *AuthMiddleware) Middleware() gin.HandlerFunc {
	return CreateAuthMiddleware(am.config)
}

// AuthenticateJWT método para autenticación JWT
func (am *AuthMiddleware) AuthenticateJWT() gin.HandlerFunc {
	return CreateAuthMiddleware(am.config)
}

// RequirePermission método para verificar permisos
func (am *AuthMiddleware) RequirePermission(permissions ...string) gin.HandlerFunc {
	return RequirePermissions(permissions...)
}

// CreateAuthMiddleware middleware para JWT authentication
func CreateAuthMiddleware(config *AuthConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verificar si la ruta debe ser omitida
		if shouldSkipAuth(c.Request.URL.Path, config.SkipPaths) {
			c.Next()
			return
		}

		// Extraer token del header
		token, err := extractToken(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"message": err.Error(),
			})
			c.Abort()
			return
		}

		// Validar y parsear token
		claims, err := parseToken(token, config.SecretKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid token",
				"message": err.Error(),
			})
			c.Abort()
			return
		}

		// Agregar claims al contexto
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("user_permissions", claims.Permissions)
		c.Set("user_ficha_id", claims.FichaID)
		c.Set("user_claims", claims)

		c.Next()
	}
}

// RequirePermissions middleware que requiere permisos específicos
func RequirePermissions(permissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userPermissions, exists := c.Get("user_permissions")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"message": "No permissions found in context",
			})
			c.Abort()
			return
		}

		userPerms, ok := userPermissions.([]string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal error",
				"message": "Invalid permissions format",
			})
			c.Abort()
			return
		}

		// Verificar si el usuario tiene alguno de los permisos requeridos
		if !hasAnyPermission(userPerms, permissions) {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Insufficient permissions",
				"message": "You don't have permission to access this resource",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireRole middleware que requiere un rol específico
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"message": "No role found in context",
			})
			c.Abort()
			return
		}

		role, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal error",
				"message": "Invalid role format",
			})
			c.Abort()
			return
		}

		// Verificar si el usuario tiene alguno de los roles requeridos
		for _, requiredRole := range roles {
			if role == requiredRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Insufficient privileges",
			"message": "You don't have the required role to access this resource",
		})
		c.Abort()
	}
}

// RequireAdmin middleware que requiere rol de administrador
func RequireAdmin() gin.HandlerFunc {
	return RequireRole("admin")
}

// Helper functions

// shouldSkipAuth verifica si una ruta debe ser omitida de la autenticación
// SECURITY: Usa exact matching para prevenir bypass de autenticación
func shouldSkipAuth(path string, skipPaths []string) bool {
	for _, skipPath := range skipPaths {
		// Exact match o subruta válida (path == "/api/auth" o path == "/api/auth/...")
		if path == skipPath || strings.HasPrefix(path, skipPath+"/") {
			return true
		}
	}
	return false
}

// extractToken extrae el token JWT del header Authorization
func extractToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", errors.New("authorization header is required")
	}

	// Verificar formato "Bearer <token>"
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", errors.New("authorization header format must be Bearer <token>")
	}

	return parts[1], nil
}

// parseToken parsea y valida el token JWT
func parseToken(tokenString, secretKey string) (*UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validar algoritmo de signing
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*UserClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

// hasAnyPermission verifica si el usuario tiene alguno de los permisos requeridos
func hasAnyPermission(userPermissions, requiredPermissions []string) bool {
	// Admin siempre tiene todos los permisos
	for _, perm := range userPermissions {
		if perm == PermSystemAdmin {
			return true
		}
	}

	// Verificar permisos específicos
	for _, required := range requiredPermissions {
		for _, userPerm := range userPermissions {
			if userPerm == required {
				return true
			}
		}
	}

	return false
}

// GetUserID obtiene el ID del usuario del contexto
func GetUserID(c *gin.Context) (uuid.UUID, error) {
	userID, exists := c.Get("user_id")
	if !exists {
		return uuid.Nil, errors.New("user ID not found in context")
	}

	id, ok := userID.(uuid.UUID)
	if !ok {
		return uuid.Nil, errors.New("invalid user ID format")
	}

	return id, nil
}

// GetUserRole obtiene el rol del usuario del contexto
func GetUserRole(c *gin.Context) (string, error) {
	userRole, exists := c.Get("user_role")
	if !exists {
		return "", errors.New("user role not found in context")
	}

	role, ok := userRole.(string)
	if !ok {
		return "", errors.New("invalid user role format")
	}

	return role, nil
}

// GetUserPermissions obtiene los permisos del usuario del contexto
func GetUserPermissions(c *gin.Context) ([]string, error) {
	userPermissions, exists := c.Get("user_permissions")
	if !exists {
		return nil, errors.New("user permissions not found in context")
	}

	permissions, ok := userPermissions.([]string)
	if !ok {
		return nil, errors.New("invalid user permissions format")
	}

	return permissions, nil
}

// GetUserFichaID obtiene el ficha ID del usuario del contexto (puede ser nil)
func GetUserFichaID(c *gin.Context) *string {
	userFichaID, exists := c.Get("user_ficha_id")
	if !exists {
		return nil
	}

	fichaID, ok := userFichaID.(*string)
	if !ok {
		return nil
	}

	return fichaID
}

// IsAdmin verifica si el usuario es administrador
func IsAdmin(c *gin.Context) bool {
	role, err := GetUserRole(c)
	if err != nil {
		return false
	}
	return role == "admin"
}

// HasPermission verifica si el usuario tiene un permiso específico
func HasPermission(c *gin.Context, permission string) bool {
	permissions, err := GetUserPermissions(c)
	if err != nil {
		return false
	}

	return hasAnyPermission(permissions, []string{permission})
}
