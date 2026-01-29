# Guía: Crear Microservicio con Clean Architecture en Go

## Índice
0. [Introducción: ¿Qué es Clean Architecture?](#introducción-qué-es-clean-architecture)
1. [Parte 1: Estructura de Carpetas](#parte-1-estructura-de-carpetas)
2. [Parte 2: Capa de Dominio](#parte-2-capa-de-dominio)
3. [Parte 3: Capa de Aplicación (Use Cases)](#parte-3-capa-de-aplicación-use-cases)
4. [Parte 4: Capa de Infraestructura](#parte-4-capa-de-infraestructura)
5. [Parte 5: Capa de Interfaces (HTTP/gRPC)](#parte-5-capa-de-interfaces)
6. [Parte 6: Configuración y Arranque](#parte-6-configuración-y-arranque)
7. [Parte 7: Testing](#parte-7-testing)

---

## Introducción: ¿Qué es Clean Architecture?

### 🎯 ¿Qué es?

Clean Architecture es un patrón de diseño de software propuesto por **Robert C. Martin (Uncle Bob)** que organiza el código en capas concéntricas con dependencias que apuntan hacia adentro.

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES (HTTP/gRPC)                   │  ← Capa externa
│  ┌─────────────────────────────────────────────────────┐   │
│  │              INFRAESTRUCTURA (DB, APIs)              │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │           APLICACIÓN (Use Cases)            │    │   │
│  │  │  ┌─────────────────────────────────────┐   │    │   │
│  │  │  │      DOMINIO (Entidades)            │   │    │   │  ← Capa interna
│  │  │  │      🎯 Reglas de negocio           │   │    │   │
│  │  │  └─────────────────────────────────────┘   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 🎯 ¿Para qué sirve?

| Objetivo | Descripción |
|----------|-------------|
| **Separación de responsabilidades** | Cada capa tiene una función específica y bien definida |
| **Independencia de frameworks** | Tu lógica de negocio no depende de librerías externas |
| **Testabilidad** | Puedes probar cada capa de forma aislada con mocks |
| **Mantenibilidad** | Cambios en una capa no afectan a las demás |
| **Flexibilidad** | Puedes cambiar la base de datos o el framework HTTP sin tocar el dominio |

### 💥 ¿Cuál es el impacto?

| Sin Clean Architecture | Con Clean Architecture |
|------------------------|------------------------|
| ❌ Código espagueti difícil de mantener | ✅ Código organizado y predecible |
| ❌ Tests difíciles o imposibles | ✅ Tests unitarios simples y rápidos |
| ❌ Cambiar la BD requiere reescribir todo | ✅ Cambiar la BD solo afecta infraestructura |
| ❌ Lógica de negocio dispersa | ✅ Lógica centralizada en el dominio |
| ❌ Acoplamiento alto entre componentes | ✅ Bajo acoplamiento, alta cohesión |
| ❌ Difícil de escalar en equipo | ✅ Equipos pueden trabajar en capas separadas |

### 📊 Regla de Dependencia (LA MÁS IMPORTANTE)

```
Las dependencias SIEMPRE apuntan hacia ADENTRO
        
        Interfaces → Infraestructura → Aplicación → Dominio
        
        ❌ El Dominio NUNCA conoce las capas externas
        ❌ La Aplicación NO conoce HTTP ni bases de datos
        ✅ Solo las capas externas conocen a las internas
```

### 🔄 Flujo de una petición HTTP

```
1. HTTP Request llega
        ↓
2. [INTERFACES] Handler recibe y valida input
        ↓
3. [INTERFACES] Convierte a DTO y llama al Use Case
        ↓
4. [APLICACIÓN] Use Case orquesta la lógica
        ↓
5. [APLICACIÓN] Usa interfaces de repositorio (del dominio)
        ↓
6. [INFRAESTRUCTURA] Implementación real del repositorio ejecuta SQL
        ↓
7. [DOMINIO] Entidades validan reglas de negocio
        ↓
8. Respuesta sube por las mismas capas
        ↓
9. HTTP Response sale
```

---

## Parte 1: Estructura de Carpetas

### 📚 ¿Qué es?
La estructura de carpetas es el **esqueleto físico** del proyecto que refleja las capas de Clean Architecture en el sistema de archivos.

### 🎯 ¿Para qué sirve?

| Carpeta | Propósito |
|---------|-----------|
| `cmd/` | Puntos de entrada de la aplicación (main.go) |
| `internal/` | Código privado del módulo (no exportable) |
| `internal/domain/` | El corazón: entidades y reglas de negocio puras |
| `internal/application/` | Casos de uso que orquestan la lógica |
| `internal/infrastructure/` | Implementaciones concretas (BD, cache, APIs) |
| `internal/interfaces/` | Adaptadores de entrada (HTTP, gRPC, CLI) |
| `pkg/` | Código reutilizable entre proyectos |
| `migrations/` | Scripts de base de datos |

### 💥 Impacto

- **Navegación intuitiva**: Cualquier desarrollador encuentra rápidamente dónde está cada cosa
- **Prevención de imports circulares**: Go no permite imports circulares, esta estructura los evita
- **Convención en el equipo**: Todos saben dónde agregar código nuevo

### Orden de creación de la estructura

```bash
# Ubicación: /be/sicora-go/userservice

# 1. Crear estructura base
mkdir -p cmd/server
mkdir -p internal/{application,domain,infrastructure,interfaces}

# 2. Subcarpetas de aplicación (casos de uso)
mkdir -p internal/application/{dto,usecases}

# 3. Subcarpetas del dominio
mkdir -p internal/domain/{entities,repositories,services}

# 4. Subcarpetas de infraestructura
mkdir -p internal/infrastructure/{config,external,persistence}
mkdir -p internal/infrastructure/persistence/{postgres,redis}

# 5. Subcarpetas de interfaces
mkdir -p internal/interfaces/{grpc,http}
mkdir -p internal/interfaces/http/{handlers,middleware,routes}

# 6. Carpetas adicionales
mkdir -p pkg/{logger,validator}
mkdir -p migrations
mkdir -p configs
```

### Estructura resultante

```
userservice/
├── cmd/
│   └── server/
│       └── main.go                 # Punto de entrada
├── internal/
│   ├── domain/                     # CAPA 1: Entidades y reglas de negocio
│   │   ├── entities/
│   │   │   └── user.go
│   │   ├── repositories/           # Interfaces (contratos)
│   │   │   └── user_repository.go
│   │   └── services/               # Servicios de dominio
│   │       └── user_service.go
│   ├── application/                # CAPA 2: Casos de uso
│   │   ├── usecases/
│   │   │   ├── create_user.go
│   │   │   ├── get_user.go
│   │   │   └── update_user.go
│   │   └── dto/
│   │       ├── user_request.go
│   │       └── user_response.go
│   ├── infrastructure/             # CAPA 3: Implementaciones externas
│   │   ├── persistence/
│   │   │   ├── postgres/
│   │   │   │   └── user_repository.go
│   │   │   └── redis/
│   │   │       └── cache.go
│   │   ├── external/               # APIs externas, messaging, etc.
│   │   │   └── email_service.go
│   │   └── config/
│   │       └── config.go
│   └── interfaces/                 # CAPA 4: Adaptadores de entrada
│       ├── http/
│       │   ├── handlers/
│       │   │   └── user_handler.go
│       │   ├── middleware/
│       │   │   └── auth.go
│       │   └── routes/
│       │       └── routes.go
│       └── grpc/
│           └── user_grpc.go
├── pkg/                            # Utilidades compartidas
│   ├── logger/
│   └── validator/
├── migrations/
├── configs/
│   └── config.yaml
├── Dockerfile
├── go.mod
└── go.sum
```

---

## Parte 2: Capa de Dominio

### 📚 ¿Qué es?
El **núcleo del sistema**. Contiene las entidades de negocio, reglas de validación y contratos (interfaces). Es **100% independiente** de frameworks, bases de datos o cualquier tecnología externa.

### 🎯 ¿Para qué sirve?

| Componente | Qué contiene | Ejemplo |
|------------|--------------|---------|
| **Entidades** | Objetos con identidad y reglas de negocio | `User`, `Order`, `Product` |
| **Value Objects** | Objetos sin identidad, definidos por sus atributos | `Email`, `Money`, `Address` |
| **Interfaces de Repositorio** | Contratos de persistencia (NO implementaciones) | `UserRepository` interface |
| **Servicios de Dominio** | Lógica que involucra múltiples entidades | `TransferService` |
| **Errores de Dominio** | Errores específicos del negocio | `ErrInsufficientFunds` |

### 💥 Impacto

| Aspecto | Beneficio |
|---------|-----------|
| **Testabilidad** | Puedes probar reglas de negocio sin BD ni HTTP |
| **Portabilidad** | Si cambias de PostgreSQL a MongoDB, el dominio NO cambia |
| **Claridad** | Las reglas de negocio están en un solo lugar |
| **Longevidad** | El dominio es la parte más estable del sistema |

### ⚠️ Reglas estrictas del Dominio

```go
// ❌ PROHIBIDO en el dominio
import "database/sql"           // No BD
import "net/http"               // No HTTP
import "github.com/gin-gonic"   // No frameworks
import "github.com/lib/pq"      // No drivers

// ✅ PERMITIDO en el dominio
import "errors"                 // Librería estándar
import "time"                   // Librería estándar
import "userservice/internal/domain/entities"  // Otros paquetes del dominio
```

### Orden de implementación: EMPEZAR AQUÍ

La capa de dominio es **independiente** de todo lo demás. No importa ningún paquete externo.

### Paso 2.1: Crear entidades

```go
// internal/domain/entities/user.go
package entities

import (
	"time"
	"errors"
)

// Errores de dominio
var (
	ErrInvalidEmail    = errors.New("invalid email format")
	ErrInvalidPassword = errors.New("password must be at least 8 characters")
	ErrUserNotFound    = errors.New("user not found")
)

// User representa la entidad de usuario
type User struct {
	ID        string
	Email     string
	Password  string
	FirstName string
	LastName  string
	Role      Role
	Status    Status
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Role string

const (
	RoleAdmin  Role = "admin"
	RoleUser   Role = "user"
	RoleGuest  Role = "guest"
)

type Status string

const (
	StatusActive   Status = "active"
	StatusInactive Status = "inactive"
	StatusPending  Status = "pending"
)

// NewUser crea un nuevo usuario con validación
func NewUser(email, password, firstName, lastName string) (*User, error) {
	user := &User{
		Email:     email,
		Password:  password,
		FirstName: firstName,
		LastName:  lastName,
		Role:      RoleUser,
		Status:    StatusPending,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	if err := user.Validate(); err != nil {
		return nil, err
	}
	
	return user, nil
}

// Validate valida las reglas de negocio del usuario
func (u *User) Validate() error {
	if !isValidEmail(u.Email) {
		return ErrInvalidEmail
	}
	if len(u.Password) < 8 {
		return ErrInvalidPassword
	}
	return nil
}

func isValidEmail(email string) bool {
	// Implementar validación de email
	return len(email) > 0 && contains(email, "@")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsRune(s, substr))
}

func containsRune(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
```

### Paso 2.2: Definir interfaces de repositorio (CONTRATOS)

```go
// internal/domain/repositories/user_repository.go
package repositories

import (
	"context"
	"userservice/internal/domain/entities"
)

// UserRepository define el contrato para persistencia de usuarios
// Esta interfaz será implementada en la capa de infraestructura
type UserRepository interface {
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id string) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, offset, limit int) ([]*entities.User, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
}
```

### Paso 2.3: Servicios de dominio (opcional, para lógica compleja)

```go
// internal/domain/services/user_service.go
package services

import (
	"userservice/internal/domain/entities"
)

// UserDomainService contiene lógica de negocio compleja
// que involucra múltiples entidades o reglas complejas
type UserDomainService struct{}

func NewUserDomainService() *UserDomainService {
	return &UserDomainService{}
}

// CanChangeRole verifica si un usuario puede cambiar el rol de otro
func (s *UserDomainService) CanChangeRole(actor *entities.User, target *entities.User, newRole entities.Role) bool {
	// Solo admins pueden cambiar roles
	if actor.Role != entities.RoleAdmin {
		return false
	}
	// No puede cambiar su propio rol
	if actor.ID == target.ID {
		return false
	}
	return true
}
```

---

## Parte 3: Capa de Aplicación (Use Cases)

### 📚 ¿Qué es?
La capa de **orquestación**. Contiene los casos de uso que coordinan el flujo de datos entre las capas externas y el dominio. Aquí vive la lógica de la aplicación (no la lógica de negocio, que está en el dominio).

### 🎯 ¿Para qué sirve?

| Componente | Qué hace | Ejemplo |
|------------|----------|---------|
| **Use Cases** | Orquestan una operación completa | `CreateUserUseCase` |
| **DTOs** | Transportan datos entre capas (sin lógica) | `CreateUserRequest` |
| **Interfaces de servicios** | Contratos para servicios externos | `PasswordHasher`, `EmailSender` |

### 💥 Impacto

| Aspecto | Sin Use Cases | Con Use Cases |
|---------|---------------|---------------|
| **Controladores** | Gordos, con toda la lógica | Flacos, solo llaman al use case |
| **Reutilización** | Lógica duplicada en HTTP y gRPC | Un use case, múltiples interfaces |
| **Testing** | Necesitas levantar servidor HTTP | Testeas el use case directamente |
| **Transacciones** | Dispersas en el código | Centralizadas en el use case |

### 🔑 Anatomía de un Use Case

```go
// Un Use Case tiene:
// 1. Dependencias inyectadas (repositorios, servicios)
// 2. Un único método público: Execute()
// 3. Recibe DTOs, retorna DTOs (nunca entidades)

type CreateUserUseCase struct {
    userRepo       repositories.UserRepository  // Del dominio (interfaz)
    passwordHasher PasswordHasher               // Interfaz local
    emailService   EmailService                 // Interfaz local
}

func (uc *CreateUserUseCase) Execute(ctx context.Context, req *dto.CreateUserRequest) (*dto.UserResponse, error) {
    // 1. Validar que no exista
    // 2. Crear entidad de dominio (aquí se validan reglas de negocio)
    // 3. Hashear password
    // 4. Persistir
    // 5. Enviar email de bienvenida
    // 6. Retornar DTO
}
```

### Paso 3.1: Crear DTOs (Data Transfer Objects)

```go
// internal/application/dto/user_request.go
package dto

// CreateUserRequest DTO para crear usuario
type CreateUserRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
}

// UpdateUserRequest DTO para actualizar usuario
type UpdateUserRequest struct {
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	Status    *string `json:"status,omitempty"`
}

// LoginRequest DTO para login
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}
```

```go
// internal/application/dto/user_response.go
package dto

import (
	"time"
	"userservice/internal/domain/entities"
)

// UserResponse DTO de respuesta de usuario
type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// FromEntity convierte entidad a DTO
func FromEntity(user *entities.User) *UserResponse {
	return &UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Role:      string(user.Role),
		Status:    string(user.Status),
		CreatedAt: user.CreatedAt,
	}
}

// FromEntities convierte lista de entidades a DTOs
func FromEntities(users []*entities.User) []*UserResponse {
	result := make([]*UserResponse, len(users))
	for i, user := range users {
		result[i] = FromEntity(user)
	}
	return result
}
```

### Paso 3.2: Crear Use Cases (Casos de Uso)

```go
// internal/application/usecases/create_user.go
package usecases

import (
	"context"
	
	"userservice/internal/application/dto"
	"userservice/internal/domain/entities"
	"userservice/internal/domain/repositories"
)

// CreateUserUseCase caso de uso para crear usuario
type CreateUserUseCase struct {
	userRepo       repositories.UserRepository
	passwordHasher PasswordHasher
}

// PasswordHasher interfaz para hashear passwords
type PasswordHasher interface {
	Hash(password string) (string, error)
	Compare(hashedPassword, password string) error
}

func NewCreateUserUseCase(
	userRepo repositories.UserRepository,
	passwordHasher PasswordHasher,
) *CreateUserUseCase {
	return &CreateUserUseCase{
		userRepo:       userRepo,
		passwordHasher: passwordHasher,
	}
}

func (uc *CreateUserUseCase) Execute(ctx context.Context, req *dto.CreateUserRequest) (*dto.UserResponse, error) {
	// 1. Verificar si el email ya existe
	exists, err := uc.userRepo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrEmailAlreadyExists
	}
	
	// 2. Crear entidad de dominio
	user, err := entities.NewUser(req.Email, req.Password, req.FirstName, req.LastName)
	if err != nil {
		return nil, err
	}
	
	// 3. Hashear password
	hashedPassword, err := uc.passwordHasher.Hash(req.Password)
	if err != nil {
		return nil, err
	}
	user.Password = hashedPassword
	
	// 4. Generar ID (aquí o en el repositorio)
	user.ID = generateID() // Implementar con UUID
	
	// 5. Persistir
	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	
	// 6. Retornar DTO
	return dto.FromEntity(user), nil
}

func generateID() string {
	// Usar github.com/google/uuid
	return "generated-uuid"
}
```

```go
// internal/application/usecases/get_user.go
package usecases

import (
	"context"
	
	"userservice/internal/application/dto"
	"userservice/internal/domain/entities"
	"userservice/internal/domain/repositories"
)

type GetUserUseCase struct {
	userRepo repositories.UserRepository
}

func NewGetUserUseCase(userRepo repositories.UserRepository) *GetUserUseCase {
	return &GetUserUseCase{userRepo: userRepo}
}

func (uc *GetUserUseCase) Execute(ctx context.Context, id string) (*dto.UserResponse, error) {
	user, err := uc.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	return dto.FromEntity(user), nil
}

type ListUsersUseCase struct {
	userRepo repositories.UserRepository
}

func NewListUsersUseCase(userRepo repositories.UserRepository) *ListUsersUseCase {
	return &ListUsersUseCase{userRepo: userRepo}
}

func (uc *ListUsersUseCase) Execute(ctx context.Context, offset, limit int) ([]*dto.UserResponse, error) {
	users, err := uc.userRepo.List(ctx, offset, limit)
	if err != nil {
		return nil, err
	}
	return dto.FromEntities(users), nil
}
```

```go
// internal/application/usecases/errors.go
package usecases

import "errors"

var (
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUnauthorized       = errors.New("unauthorized")
)
```

---

## Parte 4: Capa de Infraestructura

### 📚 ¿Qué es?
La capa de **implementaciones concretas**. Aquí vive todo el código que interactúa con el mundo exterior: bases de datos, APIs externas, sistemas de archivos, colas de mensajes, etc.

### 🎯 ¿Para qué sirve?

| Componente | Qué hace | Ejemplo |
|------------|----------|---------|
| **Repositorios (impl)** | Implementan las interfaces del dominio | `PostgresUserRepository` |
| **Config** | Carga configuración del entorno | `config.Load()` |
| **External Services** | Clientes de APIs externas | `StripeClient`, `SendGridClient` |
| **Cache** | Implementación de caché | `RedisCache` |
| **Messaging** | Productores/consumidores de colas | `RabbitMQPublisher` |

### 💥 Impacto

| Escenario | Beneficio |
|-----------|-----------|
| Cambiar de PostgreSQL a MySQL | Solo cambias la implementación del repositorio |
| Cambiar de Redis a Memcached | Solo cambias la implementación del cache |
| Testing | Puedes usar implementaciones mock sin BD real |
| Desarrollo local | Puedes usar SQLite mientras producción usa PostgreSQL |

### 🔌 Patrón Adaptador en acción

```go
// La interfaz está en el DOMINIO (no sabe nada de PostgreSQL)
// internal/domain/repositories/user_repository.go
type UserRepository interface {
    Create(ctx context.Context, user *entities.User) error
    GetByID(ctx context.Context, id string) (*entities.User, error)
}

// La implementación está en INFRAESTRUCTURA (conoce PostgreSQL)
// internal/infrastructure/persistence/postgres/user_repository.go
type PostgresUserRepository struct {
    db *sql.DB  // ← Detalle de infraestructura
}

// Verifica en tiempo de compilación que implementa la interfaz
var _ repositories.UserRepository = (*PostgresUserRepository)(nil)

func (r *PostgresUserRepository) Create(ctx context.Context, user *entities.User) error {
    // SQL específico de PostgreSQL
    query := `INSERT INTO users (id, email, ...) VALUES ($1, $2, ...)`
    _, err := r.db.ExecContext(ctx, query, user.ID, user.Email, ...)
    return err
}
```

### Paso 4.1: Configuración

```go
// internal/infrastructure/config/config.go
package config

import (
	"os"
	"strconv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port string
	Host string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret     string
	Expiration int // horas
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "userservice"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "your-secret-key"),
			Expiration: getEnvAsInt("JWT_EXPIRATION", 24),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
```

### Paso 4.2: Implementación del repositorio (PostgreSQL)

```go
// internal/infrastructure/persistence/postgres/user_repository.go
package postgres

import (
	"context"
	"database/sql"
	"time"
	
	"userservice/internal/domain/entities"
	"userservice/internal/domain/repositories"
)

// Verificar que implementa la interfaz
var _ repositories.UserRepository = (*UserRepository)(nil)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *entities.User) error {
	query := `
		INSERT INTO users (id, email, password, first_name, last_name, role, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.ExecContext(ctx, query,
		user.ID,
		user.Email,
		user.Password,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Status,
		user.CreatedAt,
		user.UpdatedAt,
	)
	return err
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*entities.User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, role, status, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	user := &entities.User{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, role, status, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	user := &entities.User{}
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *entities.User) error {
	user.UpdatedAt = time.Now()
	query := `
		UPDATE users
		SET email = $2, first_name = $3, last_name = $4, role = $5, status = $6, updated_at = $7
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		user.ID,
		user.Email,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Status,
		user.UpdatedAt,
	)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *UserRepository) List(ctx context.Context, offset, limit int) ([]*entities.User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, role, status, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var users []*entities.User
	for rows.Next() {
		user := &entities.User{}
		err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.Password,
			&user.FirstName,
			&user.LastName,
			&user.Role,
			&user.Status,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, email).Scan(&exists)
	return exists, err
}
```

### Paso 4.3: Conexión a base de datos

```go
// internal/infrastructure/persistence/postgres/connection.go
package postgres

import (
	"database/sql"
	"fmt"
	
	_ "github.com/lib/pq"
	"userservice/internal/infrastructure/config"
)

func NewConnection(cfg config.DatabaseConfig) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
	)
	
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	
	if err := db.Ping(); err != nil {
		return nil, err
	}
	
	// Configurar pool de conexiones
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	
	return db, nil
}
```

---

## Parte 5: Capa de Interfaces

### 📚 ¿Qué es?
La capa de **adaptadores de entrada**. Traduce las peticiones del mundo exterior (HTTP, gRPC, CLI, eventos) a llamadas de casos de uso, y las respuestas de vuelta al formato externo.

### 🎯 ¿Para qué sirve?

| Componente | Qué hace | Ejemplo |
|------------|----------|---------|
| **Handlers** | Reciben requests, llaman use cases | `UserHandler.Create()` |
| **Middleware** | Lógica transversal (auth, logging, CORS) | `AuthMiddleware` |
| **Routes** | Mapean URLs a handlers | `/api/v1/users → UserHandler` |
| **Presenters** | Formatean respuestas (opcional) | `JSONPresenter` |

### 💥 Impacto

| Sin esta separación | Con esta separación |
|---------------------|---------------------|
| Lógica de negocio en handlers | Handlers solo traducen y delegan |
| Difícil agregar gRPC | Agregas nueva interfaz sin tocar use cases |
| Difícil de testear | Handlers simples, fáciles de mockear |
| Código duplicado | Un use case, múltiples interfaces |

### 📐 Handlers delgados (Thin Controllers)

```go
// ❌ MAL: Handler gordo con lógica de negocio
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req dto.CreateUserRequest
    json.NewDecoder(r.Body).Decode(&req)
    
    // ❌ Lógica de negocio que NO debería estar aquí
    exists, _ := h.db.Query("SELECT * FROM users WHERE email = ?", req.Email)
    if exists {
        http.Error(w, "email exists", 400)
        return
    }
    hashedPassword := bcrypt.Hash(req.Password)
    h.db.Exec("INSERT INTO users ...")
    // ...más lógica...
}

// ✅ BIEN: Handler delgado que solo delega
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req dto.CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondError(w, http.StatusBadRequest, "invalid body")
        return
    }
    
    // ✅ Toda la lógica está en el Use Case
    result, err := h.createUserUC.Execute(r.Context(), &req)
    if err != nil {
        handleUseCaseError(w, err)
        return
    }
    
    respondJSON(w, http.StatusCreated, result)
}
```

### Paso 5.1: Handlers HTTP

```go
// internal/interfaces/http/handlers/user_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	
	"userservice/internal/application/dto"
	"userservice/internal/application/usecases"
)

type UserHandler struct {
	createUserUC *usecases.CreateUserUseCase
	getUserUC    *usecases.GetUserUseCase
	listUsersUC  *usecases.ListUsersUseCase
}

func NewUserHandler(
	createUserUC *usecases.CreateUserUseCase,
	getUserUC *usecases.GetUserUseCase,
	listUsersUC *usecases.ListUsersUseCase,
) *UserHandler {
	return &UserHandler{
		createUserUC: createUserUC,
		getUserUC:    getUserUC,
		listUsersUC:  listUsersUC,
	}
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	
	user, err := h.createUserUC.Execute(r.Context(), &req)
	if err != nil {
		handleUseCaseError(w, err)
		return
	}
	
	respondJSON(w, http.StatusCreated, user)
}

func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	// Extraer ID de la URL (depende del router que uses)
	id := r.PathValue("id") // Go 1.22+ o usa chi/gorilla mux
	
	user, err := h.getUserUC.Execute(r.Context(), id)
	if err != nil {
		handleUseCaseError(w, err)
		return
	}
	
	respondJSON(w, http.StatusOK, user)
}

func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	// Parsear query params para paginación
	offset := 0
	limit := 20
	
	users, err := h.listUsersUC.Execute(r.Context(), offset, limit)
	if err != nil {
		handleUseCaseError(w, err)
		return
	}
	
	respondJSON(w, http.StatusOK, users)
}

// Helpers
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func handleUseCaseError(w http.ResponseWriter, err error) {
	switch err {
	case usecases.ErrEmailAlreadyExists:
		respondError(w, http.StatusConflict, err.Error())
	case usecases.ErrInvalidCredentials:
		respondError(w, http.StatusUnauthorized, err.Error())
	default:
		respondError(w, http.StatusInternalServerError, "internal server error")
	}
}
```

### Paso 5.2: Router y rutas

```go
// internal/interfaces/http/routes/routes.go
package routes

import (
	"net/http"
	
	"userservice/internal/interfaces/http/handlers"
	"userservice/internal/interfaces/http/middleware"
)

func Setup(userHandler *handlers.UserHandler, authMiddleware *middleware.AuthMiddleware) *http.ServeMux {
	mux := http.NewServeMux()
	
	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	
	// Public routes
	mux.HandleFunc("POST /api/v1/users", userHandler.Create)
	
	// Protected routes (ejemplo con middleware manual)
	mux.HandleFunc("GET /api/v1/users", authMiddleware.Wrap(userHandler.List))
	mux.HandleFunc("GET /api/v1/users/{id}", authMiddleware.Wrap(userHandler.GetByID))
	
	return mux
}
```

### Paso 5.3: Middleware

```go
// internal/interfaces/http/middleware/auth.go
package middleware

import (
	"context"
	"net/http"
	"strings"
)

type AuthMiddleware struct {
	jwtSecret string
}

func NewAuthMiddleware(jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{jwtSecret: jwtSecret}
}

func (m *AuthMiddleware) Wrap(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		// Validar token JWT
		userID, err := m.validateToken(tokenString)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		
		// Agregar userID al contexto
		ctx := context.WithValue(r.Context(), "userID", userID)
		next(w, r.WithContext(ctx))
	}
}

func (m *AuthMiddleware) validateToken(token string) (string, error) {
	// Implementar validación JWT
	// Usar github.com/golang-jwt/jwt/v5
	return "user-id", nil
}
```

---

## Parte 6: Configuración y Arranque

### 📚 ¿Qué es?
El **punto de unión** donde todas las capas se conectan. Aquí ocurre la **inyección de dependencias** y el arranque del servidor.

### 🎯 ¿Para qué sirve?

| Componente | Qué hace |
|------------|----------|
| `main.go` | Conecta todas las piezas y arranca el servidor |
| Inyección de dependencias | Crea instancias y las pasa a quien las necesita |
| Graceful shutdown | Cierra conexiones limpiamente al apagar |

### 💥 Impacto

| Aspecto | Beneficio |
|---------|-----------|
| **Single source of truth** | Toda la configuración de dependencias en un lugar |
| **Flexibilidad** | Fácil cambiar implementaciones (dev vs prod) |
| **Visibilidad** | Ves claramente cómo se conecta todo |
| **Testing** | En tests, inyectas mocks en lugar de implementaciones reales |

### 🔧 Inyección de Dependencias Manual

```go
// En Go, la inyección de dependencias es MANUAL (sin frameworks)
// El orden de creación importa: de adentro hacia afuera

func main() {
    // 1. Configuración (capa más externa)
    cfg := config.Load()
    
    // 2. Conexiones a infraestructura
    db, _ := postgres.NewConnection(cfg.Database)
    
    // 3. Repositorios (implementan interfaces del dominio)
    userRepo := postgres.NewUserRepository(db)
    
    // 4. Servicios de infraestructura
    passwordHasher := bcrypt.NewHasher()
    
    // 5. Use Cases (usan repositorios via interfaces)
    createUserUC := usecases.NewCreateUserUseCase(userRepo, passwordHasher)
    
    // 6. Handlers (usan use cases)
    userHandler := handlers.NewUserHandler(createUserUC, ...)
    
    // 7. Router y servidor
    mux := routes.Setup(userHandler, ...)
    http.ListenAndServe(":8080", mux)
}
```

### Paso 6.1: Archivo main.go

```go
// cmd/server/main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	
	"userservice/internal/application/usecases"
	"userservice/internal/infrastructure/config"
	"userservice/internal/infrastructure/persistence/postgres"
	"userservice/internal/interfaces/http/handlers"
	"userservice/internal/interfaces/http/middleware"
	"userservice/internal/interfaces/http/routes"
)

func main() {
	// 1. Cargar configuración
	cfg := config.Load()
	
	// 2. Conectar a base de datos
	db, err := postgres.NewConnection(cfg.Database)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()
	
	// 3. Crear repositorios (infraestructura)
	userRepo := postgres.NewUserRepository(db)
	
	// 4. Crear casos de uso (aplicación)
	// Nota: necesitas implementar passwordHasher
	createUserUC := usecases.NewCreateUserUseCase(userRepo, nil) // Pasar hasher real
	getUserUC := usecases.NewGetUserUseCase(userRepo)
	listUsersUC := usecases.NewListUsersUseCase(userRepo)
	
	// 5. Crear handlers (interfaces)
	userHandler := handlers.NewUserHandler(createUserUC, getUserUC, listUsersUC)
	
	// 6. Crear middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWT.Secret)
	
	// 7. Configurar rutas
	mux := routes.Setup(userHandler, authMiddleware)
	
	// 8. Crear servidor
	server := &http.Server{
		Addr:         cfg.Server.Host + ":" + cfg.Server.Port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
	
	// 9. Iniciar servidor en goroutine
	go func() {
		log.Printf("Server starting on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()
	
	// 10. Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	log.Println("Shutting down server...")
	
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}
	
	log.Println("Server exited properly")
}
```

### Paso 6.2: go.mod

```go
// go.mod
module userservice

go 1.22

require (
    github.com/lib/pq v1.10.9
    github.com/golang-jwt/jwt/v5 v5.2.0
    github.com/google/uuid v1.6.0
    golang.org/x/crypto v0.18.0
)
```

### Paso 6.3: Migración SQL

```sql
-- migrations/001_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

---

## Parte 7: Testing

### 📚 ¿Qué es?
La **estrategia de testing** en Clean Architecture aprovecha la separación de capas para crear tests aislados, rápidos y confiables.

### 🎯 ¿Para qué sirve?

| Tipo de Test | Qué prueba | Velocidad | Usa mocks? |
|--------------|------------|-----------|------------|
| **Unitarios (dominio)** | Entidades y reglas de negocio | ⚡ Muy rápido | No necesita |
| **Unitarios (use cases)** | Lógica de orquestación | ⚡ Muy rápido | Sí (repos) |
| **Integración** | Repositorios reales | 🐢 Lento | No |
| **E2E** | Sistema completo | 🐌 Muy lento | No |

### 💥 Impacto

| Sin Clean Architecture | Con Clean Architecture |
|------------------------|------------------------|
| Tests lentos que necesitan BD | Tests de dominio sin dependencias |
| Difícil aislar componentes | Cada capa se testea por separado |
| Mocks complicados | Interfaces claras = mocks simples |
| Cobertura baja por complejidad | Alta cobertura, tests mantenibles |

### 🧪 Pirámide de Testing

```
        /\
       /  \      E2E Tests (pocos)
      /----\     
     /      \    Integration Tests
    /--------\   
   /          \  Unit Tests (muchos)
  /__________\_\
  
  ✅ Más tests unitarios (rápidos, baratos)
  ✅ Menos tests E2E (lentos, frágiles)
```

### Paso 7.1: Tests de dominio (unitarios)

```go
// internal/domain/entities/user_test.go
package entities

import "testing"

func TestNewUser_ValidInput(t *testing.T) {
	user, err := NewUser("test@example.com", "password123", "John", "Doe")
	
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if user.Email != "test@example.com" {
		t.Errorf("expected email test@example.com, got %s", user.Email)
	}
	if user.Role != RoleUser {
		t.Errorf("expected role user, got %s", user.Role)
	}
}

func TestNewUser_InvalidEmail(t *testing.T) {
	_, err := NewUser("invalid-email", "password123", "John", "Doe")
	
	if err != ErrInvalidEmail {
		t.Errorf("expected ErrInvalidEmail, got %v", err)
	}
}

func TestNewUser_ShortPassword(t *testing.T) {
	_, err := NewUser("test@example.com", "short", "John", "Doe")
	
	if err != ErrInvalidPassword {
		t.Errorf("expected ErrInvalidPassword, got %v", err)
	}
}
```

### Paso 7.2: Tests de casos de uso (con mocks)

```go
// internal/application/usecases/create_user_test.go
package usecases

import (
	"context"
	"testing"
	
	"userservice/internal/application/dto"
	"userservice/internal/domain/entities"
)

// Mock del repositorio
type mockUserRepository struct {
	users       map[string]*entities.User
	existsEmail bool
}

func (m *mockUserRepository) Create(ctx context.Context, user *entities.User) error {
	m.users[user.ID] = user
	return nil
}

func (m *mockUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	return m.existsEmail, nil
}

// ... implementar otros métodos

// Mock del password hasher
type mockPasswordHasher struct{}

func (m *mockPasswordHasher) Hash(password string) (string, error) {
	return "hashed_" + password, nil
}

func (m *mockPasswordHasher) Compare(hashed, password string) error {
	return nil
}

func TestCreateUserUseCase_Success(t *testing.T) {
	repo := &mockUserRepository{users: make(map[string]*entities.User)}
	hasher := &mockPasswordHasher{}
	uc := NewCreateUserUseCase(repo, hasher)
	
	req := &dto.CreateUserRequest{
		Email:     "test@example.com",
		Password:  "password123",
		FirstName: "John",
		LastName:  "Doe",
	}
	
	result, err := uc.Execute(context.Background(), req)
	
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result.Email != req.Email {
		t.Errorf("expected email %s, got %s", req.Email, result.Email)
	}
}

func TestCreateUserUseCase_EmailExists(t *testing.T) {
	repo := &mockUserRepository{users: make(map[string]*entities.User), existsEmail: true}
	hasher := &mockPasswordHasher{}
	uc := NewCreateUserUseCase(repo, hasher)
	
	req := &dto.CreateUserRequest{
		Email:     "existing@example.com",
		Password:  "password123",
		FirstName: "John",
		LastName:  "Doe",
	}
	
	_, err := uc.Execute(context.Background(), req)
	
	if err != ErrEmailAlreadyExists {
		t.Errorf("expected ErrEmailAlreadyExists, got %v", err)
	}
}
```

---

## Resumen: Orden de Implementación

| Paso | Capa | Archivos |
|------|------|----------|
| 1 | Setup | Crear estructura de carpetas |
| 2 | Dominio | `entities/user.go` |
| 3 | Dominio | `repositories/user_repository.go` (interfaz) |
| 4 | Aplicación | `dto/user_request.go`, `dto/user_response.go` |
| 5 | Aplicación | `usecases/create_user.go`, etc. |
| 6 | Infraestructura | `config/config.go` |
| 7 | Infraestructura | `persistence/postgres/connection.go` |
| 8 | Infraestructura | `persistence/postgres/user_repository.go` |
| 9 | Interfaces | `http/handlers/user_handler.go` |
| 10 | Interfaces | `http/middleware/auth.go` |
| 11 | Interfaces | `http/routes/routes.go` |
| 12 | Arranque | `cmd/server/main.go` |
| 13 | DB | `migrations/*.sql` |
| 14 | Testing | Tests unitarios y de integración |

---

## Principios Clave de Clean Architecture

1. **Regla de dependencia**: Las capas internas NO conocen las externas
   - Dominio → No depende de nada
   - Aplicación → Solo depende del dominio
   - Infraestructura → Depende de dominio y aplicación
   - Interfaces → Depende de aplicación

2. **Inyección de dependencias**: Todo se conecta en `main.go`

3. **Interfaces en el dominio**: Los contratos (interfaces) viven en el dominio, las implementaciones en infraestructura

4. **DTOs para comunicación**: Nunca exponer entidades de dominio directamente a la capa de interfaces

---

## ⚠️ Errores Comunes y Cómo Evitarlos

### ❌ Error 1: Dominio con dependencias externas

```go
// ❌ MAL: Entidad que importa driver de BD
package entities

import "database/sql"  // ← PROHIBIDO

type User struct {
    db *sql.DB  // ← El dominio NO debe conocer la BD
}
```

**✅ Solución**: El dominio solo contiene lógica pura, sin imports externos.

---

### ❌ Error 2: Use Case que conoce HTTP

```go
// ❌ MAL: Use case que recibe http.Request
func (uc *CreateUserUseCase) Execute(r *http.Request) (*User, error) {
    // El use case NO debe saber que existe HTTP
}
```

**✅ Solución**: Use cases reciben DTOs, no objetos de infraestructura.

```go
// ✅ BIEN
func (uc *CreateUserUseCase) Execute(ctx context.Context, req *dto.CreateUserRequest) (*dto.UserResponse, error)
```

---

### ❌ Error 3: Handlers gordos

```go
// ❌ MAL: Toda la lógica en el handler
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
    // 50 líneas de lógica de negocio aquí
}
```

**✅ Solución**: Handlers solo parsean request → llaman use case → formatean response.

---

### ❌ Error 4: Repositorio en el dominio con implementación

```go
// ❌ MAL: Implementación concreta en el dominio
package domain

import "database/sql"

type UserRepository struct {
    db *sql.DB
}

func (r *UserRepository) Create(user *User) error {
    r.db.Exec("INSERT...")
}
```

**✅ Solución**: En dominio solo la INTERFAZ, la implementación en infraestructura.

---

### ❌ Error 5: Exponer entidades en respuestas HTTP

```go
// ❌ MAL: Retornar entidad directamente
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
    user, _ := h.repo.GetByID(id)
    json.NewEncoder(w).Encode(user)  // ← Expone password hasheado!
}
```

**✅ Solución**: Siempre usar DTOs de respuesta que controlan qué se expone.

---

## 📚 Recursos Adicionales

### Libros
- **Clean Architecture** - Robert C. Martin (el libro original)
- **Domain-Driven Design** - Eric Evans (complemento perfecto)

### Artículos
- [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Uncle Bob
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)

### Herramientas útiles para Go
| Herramienta | Propósito |
|-------------|-----------|
| `github.com/google/wire` | Inyección de dependencias en compile time |
| `github.com/golang-migrate/migrate` | Migraciones de BD |
| `github.com/stretchr/testify` | Assertions y mocks para tests |
| `github.com/go-playground/validator` | Validación de structs |

---

## 🎯 Checklist de Validación

Usa este checklist para verificar que tu microservicio sigue Clean Architecture:

- [ ] ¿El dominio tiene CERO imports de paquetes externos?
- [ ] ¿Las interfaces de repositorio están en el dominio?
- [ ] ¿Las implementaciones de repositorio están en infraestructura?
- [ ] ¿Los use cases reciben y retornan DTOs (no entidades)?
- [ ] ¿Los handlers solo parsean, delegan y formatean?
- [ ] ¿Toda la inyección de dependencias ocurre en main.go?
- [ ] ¿Puedes testear el dominio sin BD ni HTTP?
- [ ] ¿Puedes cambiar PostgreSQL por MySQL sin tocar dominio ni use cases?
