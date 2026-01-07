# API Gateway - SICORA (Go)

API Gateway centralizado para todos los microservicios de SICORA.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│                   (Puerto: 8000)                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Auth/JWT │  │   CORS   │  │Rate Limit│  │ Logging  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Reverse Proxy                            │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ UserService   │   │ScheduleService│   │AttendanceService│
│  :8001        │   │  :8002        │   │  :8003        │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ EvalInService │   │ KBService     │   │ AIService     │
│  :8004        │   │  :8005        │   │  :8006        │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ProjectEvalSvc │   │ MEvalService  │
│  :8007        │   │  :8008        │
└───────────────┘   └───────────────┘
```

## 🚀 Inicio Rápido

### Requisitos

- Go 1.25+
- Docker (opcional, para servicios backend)

### Ejecución

```bash
# Copiar configuración
cp .env.example .env

# Descargar dependencias
go mod tidy

# Ejecutar
go run ./cmd/main.go

# O compilar y ejecutar
go build -o apigateway ./cmd/main.go
./apigateway
```

## 📁 Estructura

```
apigateway/
├── cmd/
│   └── main.go                    # Punto de entrada
├── internal/
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── config.go          # Configuración
│   │   └── logger/
│   │       └── logger.go          # Logger (zap)
│   └── presentation/
│       ├── handlers/
│       │   ├── health_handler.go  # Endpoints de salud
│       │   └── proxy_handler.go   # Proxy reverso
│       ├── middleware/
│       │   ├── auth.go            # Autenticación JWT
│       │   └── middleware.go      # RequestID, Logger, RateLimiter
│       └── routes/
│           └── routes.go          # Configuración de rutas
├── go.mod
├── go.sum
├── .env.example
└── README.md
```

## 🔧 Configuración

| Variable       | Descripción                          | Default       |
| -------------- | ------------------------------------ | ------------- |
| `PORT`         | Puerto del servidor                  | `8000`        |
| `ENVIRONMENT`  | Entorno (development/production)     | `development` |
| `LOG_LEVEL`    | Nivel de log (debug/info/warn/error) | `info`        |
| `JWT_SECRET`   | Secreto para JWT                     | -             |
| `CORS_ORIGINS` | Orígenes CORS (separados por coma)   | `*`           |
| `RATE_LIMIT`   | Límite de requests por segundo       | `100`         |

### URLs de Servicios

| Variable                 | Servicio           | Default                 |
| ------------------------ | ------------------ | ----------------------- |
| `USERSERVICE_URL`        | UserService        | `http://localhost:8001` |
| `SCHEDULESERVICE_URL`    | ScheduleService    | `http://localhost:8002` |
| `ATTENDANCESERVICE_URL`  | AttendanceService  | `http://localhost:8003` |
| `EVALINSERVICE_URL`      | EvalInService      | `http://localhost:8004` |
| `KBSERVICE_URL`          | KBService          | `http://localhost:8005` |
| `AISERVICE_URL`          | AIService          | `http://localhost:8006` |
| `PROJECTEVALSERVICE_URL` | ProjectEvalService | `http://localhost:8007` |
| `MEVALSERVICE_URL`       | MEvalService       | `http://localhost:8008` |

## 🛣️ Endpoints

### Públicos (Sin autenticación)

```
GET  /health              # Estado del gateway
GET  /ready               # Readiness check
GET  /live                # Liveness check
GET  /services            # Estado de servicios backend
GET  /swagger/*           # Documentación API

POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### Protegidos (Requieren JWT)

```
# Usuarios
GET/POST/PUT/DELETE /api/v1/users/*

# Horarios
GET/POST/PUT/DELETE /api/v1/schedules/*

# Asistencias
GET/POST/PUT /api/v1/attendance/*

# Evaluaciones
GET/POST/PUT/DELETE /api/v1/evaluations/*

# Base de Conocimiento
GET/POST/PUT/DELETE /api/v1/knowledge/*

# IA
POST /api/v1/ai/chat
POST /api/v1/ai/recommendations
POST /api/v1/ai/analyze

# Evaluación de Proyectos
GET/POST/PUT/DELETE /api/v1/projects/*

# Evaluación Móvil
GET/POST /api/v1/meval/*
```

## 🔐 Autenticación

El gateway utiliza JWT Bearer tokens:

```bash
# Header de autorización
Authorization: Bearer <token>
```

Claims del token:

```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "admin|instructor|student"
}
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:8000/health

# Status de servicios
curl http://localhost:8000/services

# Request con JWT
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/users/me
```

## 📊 Métricas

El gateway expone métricas Prometheus en `/metrics` (cuando está habilitado).

## 🔄 Middleware Pipeline

1. **Recovery** - Recuperación de panics
2. **CORS** - Cross-Origin Resource Sharing
3. **RequestID** - ID único por request
4. **Logger** - Logging de requests
5. **RateLimiter** - Limitación de requests
6. **Auth** - Validación JWT (rutas protegidas)
7. **RequireRole** - Validación de roles (rutas específicas)

## 📝 Licencia

MIT License - OneVision 2025
