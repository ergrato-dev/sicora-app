🛡️ Guía Completa: Manejo Robusto de Errores en Aplicaciones Full Stack
Backend Go + PostgreSQL + Redis | Frontend Next.js

📋 Índice

Principios Fundamentales
Backend Go - Manejo de Errores
PostgreSQL - Errores de Base de Datos
Redis - Errores de Cache
API REST - Errores HTTP
Frontend Next.js - Manejo de Errores
Logging y Monitoreo
Testing de Errores
Documentación de Errores
Checklist de Implementación


🎯 Principios Fundamentales
1. Jerarquía de Errores
Usuario Final (Mensaje amigable)
    ↑
Frontend (Error categorizado)
    ↑
API Gateway (Error normalizado)
    ↑
Backend Service (Error detallado)
    ↑
Database/Cache (Error técnico)
2. Tipos de Errores por Capa
Errores de Usuario (4xx)

Validación de entrada
Autenticación fallida
Autorización denegada
Recurso no encontrado

Errores del Sistema (5xx)

Fallo de base de datos
Servicio no disponible
Timeout
Error interno

Errores de Negocio

Reglas de negocio violadas
Estado inconsistente
Operación no permitida

3. Principios Clave
Fail Fast: Detectar errores lo antes posible
Fail Safe: Sistema degradado > sistema caído
Fail Visible: Errores logeados y monitoreados
Fail Informative: Mensajes claros y accionables

🔧 Backend Go - Manejo de Errores
1. Estructura de Errores Personalizados
1.1 Error Type System
Categorías de Errores:
AppError (Interface base)
├── ValidationError
├── DatabaseError
├── CacheError
├── BusinessError
├── AuthenticationError
├── AuthorizationError
├── NotFoundError
├── ConflictError
├── ExternalServiceError
└── InternalError
Propiedades de cada Error:

Code: Código único identificador (ej. USER_001)
Message: Mensaje técnico para logs
UserMessage: Mensaje amigable para el usuario
HTTPStatus: Código HTTP apropiado
Details: Mapa de detalles adicionales
Timestamp: Momento del error
RequestID: ID de rastreo
Stack: Stack trace (solo en desarrollo)
Retryable: Si el error puede reintentar

1.2 Error Codes Estructurados
Sistema de Códigos:
[DOMINIO]_[TIPO]_[NÚMERO]

Ejemplos:
- USER_NOT_FOUND_001
- DB_CONNECTION_001
- CACHE_TIMEOUT_001
- AUTH_INVALID_TOKEN_001
- VALID_REQUIRED_FIELD_001
Dominios:

USER: Gestión de usuarios
AUTH: Autenticación/Autorización
DB: Base de datos
CACHE: Redis/Cache
VALID: Validación
BIZ: Reglas de negocio
EXT: Servicios externos
SYS: Sistema

2. Patrones de Manejo de Errores
2.1 Error Wrapping (Envolver Errores)
Concepto: Agregar contexto sin perder el error original
Capas de Wrapping:
Layer 1 (Handler):    "failed to create user"
Layer 2 (Service):    "error validating email: invalid format"
Layer 3 (Repository): "database constraint violation"
Layer 4 (Database):   "duplicate key value violates unique constraint"
Información a agregar en cada capa:

Contexto de operación
Parámetros relevantes
Usuario/sesión afectado
Recurso involucrado

2.2 Error Recovery Strategies
Estrategias por tipo de error:
Errores Transitorios (reintentar):

Connection timeout
Deadlock detectado
Rate limit temporal
Servicio temporalmente no disponible

Configuración de Retry:

Max attempts: 3
Backoff strategy: Exponencial (1s, 2s, 4s)
Jitter: Aleatorio ±25% para evitar thundering herd
Circuit breaker: Abrir después de 5 fallos consecutivos

Errores Permanentes (no reintentar):

Validación fallida
Autenticación rechazada
Recurso no encontrado
Violación de constraints

Errores Parciales (degradación elegante):

Cache no disponible → usar DB directamente
Servicio externo caído → respuesta parcial con advertencia
Notificación fallida → guardar para reintentar después

2.3 Context Propagation
Información a propagar:

Request ID (para trazabilidad)
User ID
Tenant ID (multi-tenancy)
Correlation ID (microservicios)
Timeout deadline
Trace context (distributed tracing)

Metadata de Debug:

Versión del servicio
Servidor/pod handling
Región/zona
Environment (dev/staging/prod)

3. Validación de Entrada
3.1 Niveles de Validación
Nivel 1: Validación de Tipo

JSON malformado
Tipos de dato incorrectos
Campos requeridos faltantes

Nivel 2: Validación de Formato

Email válido
Teléfono válido
Formato de fecha
Longitud de strings
Rangos numéricos

Nivel 3: Validación de Negocio

Email único
Permisos suficientes
Estado válido para operación
Relaciones existentes

Nivel 4: Validación Cross-field

Fecha inicio < fecha fin
Contraseña == confirmar contraseña
Saldo suficiente para operación

3.2 Sanitización de Entrada
Acciones de sanitización:

Trim whitespace
Normalizar formatos (teléfonos, emails)
Escapar caracteres especiales
Remover caracteres no permitidos
Convertir a lowercase/uppercase según corresponda

Prevención de ataques:

SQL injection: Usar prepared statements
XSS: Escapar HTML
Path traversal: Validar rutas
Command injection: Validar comandos

4. Manejo de Transacciones
4.1 Transaction Patterns
Patrón Completo:
1. Begin Transaction
2. Validar precondiciones
3. Ejecutar operaciones
4. Validar postcondiciones
5. Commit / Rollback
6. Cleanup (defer)
7. Notificar resultado
Rollback Automático en:

Panic recovery
Error crítico
Violación de constraints
Timeout excedido
Context cancelado

Savepoints para operaciones complejas:

Punto de guardado intermedio
Rollback parcial
Retry de subsección

4.2 Distributed Transactions
Patrón SAGA:

Cada paso con compensación
Rollback por compensación
Log de progreso
Idempotencia en cada paso

Event Sourcing:

Eventos inmutables
Reconstrucción de estado
Replay de eventos
Snapshot periódico

5. Timeout y Deadline
5.1 Timeouts por Operación
Valores sugeridos:

Database query: 5s
Cache operation: 1s
API externa: 10s
File upload: 60s
Operación batch: 5m

Context con Deadline:

Propagar deadline desde request
Cancelar operaciones dependientes
Liberar recursos al cancelar
Loggear timeout

5.2 Graceful Degradation
Estrategias:

Si cache falla → DB (más lento pero funcional)
Si servicio externo falla → datos cacheados antiguos
Si feature falla → desactivar feature, no todo el sistema
Si DB primaria falla → replica de lectura


🗄️ PostgreSQL - Errores de Base de Datos
1. Categorización de Errores PostgreSQL
1.1 Errores de Conexión
Tipos:

connection refused: DB no disponible
too many connections: Pool agotado
connection timeout: Red lenta/firewall
authentication failed: Credenciales incorrectas

Estrategias:

Connection pooling (PgBouncer o pool nativo)
Retry con backoff exponencial
Health check periódico
Failover automático a replica

1.2 Errores de Constraint
Tipos comunes:
NOT NULL Violation:

Campo requerido faltante
Error en lógica de aplicación
Acción: Validar antes de INSERT/UPDATE

UNIQUE Violation:

Duplicado (email, username, código)
Race condition
Acción: Manejar como conflicto (409)

FOREIGN KEY Violation:

Referencia inexistente
Orden incorrecto de operaciones
Acción: Validar existencia previa

CHECK Constraint:

Valor fuera de rango
Regla de negocio violada
Acción: Validar en aplicación primero

1.3 Errores de Concurrencia
Deadlock:

Dos transacciones esperándose mutuamente
PostgreSQL detecta y mata una
Acción: Retry con backoff, ordenar locks

Serialization Failure:

Nivel de aislamiento SERIALIZABLE
Conflicto de escritura concurrente
Acción: Retry completo de transacción

Lock Timeout:

Esperando lock demasiado tiempo
Acción: Aumentar timeout o rediseñar locks

2. Query Errors
2.1 Errores de Sintaxis
Prevención:

Query builder con tipos
SQL linter
Tests de queries
Migración controlada

2.2 Errores de Performance
Detección:

Slow query log
Query timeout
Monitoring de query time
EXPLAIN ANALYZE

Acciones:

Agregar índices
Reescribir query
Particionar tabla
Cache de resultados

3. Connection Pooling
3.1 Configuración del Pool
Parámetros clave:

MaxOpenConns: Máximo de conexiones abiertas (10-100)
MaxIdleConns: Conexiones idle mantenidas (5-20)
ConnMaxLifetime: Tiempo máximo de vida (5-30 min)
ConnMaxIdleTime: Tiempo máximo idle (1-5 min)

Manejo de pool exhausto:

Wait timeout configurado
Error claro al usuario
Alert a ops/devops
Considerar scale up/out

3.2 Health Check
Ping periódico:

Cada 30-60 segundos
Query simple: SELECT 1
Timeout corto (1s)
Recrear conexión si falla

Métricas:

Conexiones activas
Conexiones idle
Espera por conexión
Errores de conexión

4. Migrations y Schema
4.1 Migration Errors
Prevención:

Migrations reversibles
Testing en staging
Backup antes de aplicar
Migrations atómicos

Rollback Strategy:

Down migration preparado
Punto de restauración
Feature flags para nuevas columnas
Despliegue incremental

4.2 Schema Validation
Verificaciones:

Schema esperado vs real
Índices presentes
Constraints definidos
Tipos de dato correctos

Auto-healing (con cuidado):

Crear índices faltantes
Agregar columnas con default
Nunca eliminar automáticamente


🔴 Redis - Errores de Cache
1. Tipos de Errores Redis
1.1 Connection Errors
Tipos:

Connection refused
Timeout
Connection pool exhausted
Authentication failure
Cluster unreachable

Estrategias de fallback:

Cache-aside pattern: miss → DB
Stale cache: servir datos antiguos con warning
Bypass cache: directamente a DB
Fail open: continuar sin cache

1.2 Operation Errors
SET failures:

Out of memory
Disk full (AOF)
Key too large
Acción: Log y continuar sin cachear

GET failures:

Key no existe (normal)
Datos corruptos
Serialization error
Acción: Invalidar y refrescar

DEL/EXPIRE failures:

Generalmente no críticos
Log para debugging
Eventual consistency acceptable

2. Cache Patterns y sus Errores
2.1 Cache-Aside (Lazy Loading)
Flujo normal:
1. Buscar en cache
2. Si existe → retornar
3. Si no → buscar en DB
4. Guardar en cache
5. Retornar
Manejo de errores:
Redis DOWN:

Skip cache
Query DB directamente
Log incident
Alert ops

DB DOWN pero Redis UP:

Retornar cached (stale) con warning
Flag "data may be outdated"
Retry DB en background

Ambos DOWN:

Error 503 Service Unavailable
Mensaje claro al usuario
Escalate a critical

2.2 Write-Through Cache
Errores complejos:
DB write OK, Cache write FAIL:

Inconsistencia temporal
Invalidar cache entry
Background job para sync
Aceptable (eventual consistency)

DB write FAIL, Cache write OK:

Rollback cache
No dejar datos inconsistentes
Crítico: alerta inmediata

Ambos FAIL:

Rollback completo
Reintentar operación
Usuario recibe error

2.3 Write-Behind (Write-Back)
Mayor complejidad de errores:
Cache acepta pero DB rechaza:

Queue persistente de escritura
Retry con backoff
Dead letter queue después de X intentos
Manual intervention necesaria

Monitoreo crítico:

Lag entre cache y DB
Items en queue pendiente
Failed writes
Sync health

3. Cache Invalidation
3.1 Estrategias de Invalidación
Time-based (TTL):

Simple y predecible
Puede servir datos stale
Error: TTL muy corto (carga DB) o muy largo (datos viejos)

Event-based:

Invalidar al actualizar
Requiere coordinación
Error: Miss de invalidación → inconsistencia

Pattern-based:

Invalidar por patrón (ej. user:123:*)
Puede invalidar demás
Error: Pattern incorrecto

3.2 Thundering Herd
Problema:

Cache expira
N requests simultáneas
Todas van a DB
DB se sobrecarga

Soluciones:
Lock-based:

Primera request toma lock
Otras esperan
Si timeout → bypass

Probabilistic Early Expiration:

Refrescar antes de expirar
Probabilidad proporcional a TTL
Spreads load

Stale-While-Revalidate:

Servir stale inmediatamente
Refrescar en background
Mejor UX

4. Redis Cluster y Sentinel
4.1 Cluster Mode Errors
Node failure:

Automatic failover
Brief unavailability (ms-segundos)
Partial data unavailable

Split brain:

Cluster partition
Inconsistent data
Resolución manual puede ser necesaria

Resharding:

Keys temporalmente no disponibles
Redirects a clientes
Manejo de MOVED/ASK errors

4.2 Sentinel Errors
Master down:

Sentinel promote replica
Client reconfigura
Brief write unavailability

Sentinels down:

Quorum no alcanzado
No failover automático
Manual intervention

Monitoring:

Sentinel health
Master/replica lag
Failover frequency


🌐 API REST - Errores HTTP
1. Códigos de Estado HTTP
1.1 2xx Success
200 OK:

Operación exitosa
Retorna datos

201 Created:

Recurso creado
Location header con URI
Retorna recurso creado

202 Accepted:

Procesamiento asíncrono
Retorna job ID/status URI

204 No Content:

Éxito sin body
Usado en DELETE

1.2 4xx Client Errors
400 Bad Request:

Datos inválidos
JSON malformado
Validación fallida
Body: Detalles de cada error

401 Unauthorized:

Token faltante o inválido
Sesión expirada
Header: WWW-Authenticate

403 Forbidden:

Token válido pero sin permisos
Diferente de 401
No revelar existencia de recurso

404 Not Found:

Recurso no existe
ID inválido
No revelar si por permisos o inexistente

409 Conflict:

Estado inconsistente
Duplicado (unique constraint)
Race condition
Body: Explicación del conflicto

422 Unprocessable Entity:

Sintaxis OK pero semántica inválida
Reglas de negocio violadas
Validaciones complejas

429 Too Many Requests:

Rate limit excedido
Headers: Retry-After, X-RateLimit-*

1.3 5xx Server Errors
500 Internal Server Error:

Error inesperado
Catch-all para errores no manejados
Nunca revelar stack traces en prod

502 Bad Gateway:

Servicio downstream falló
Proxy/gateway error

503 Service Unavailable:

Mantenimiento
Overload temporal
Header: Retry-After

504 Gateway Timeout:

Servicio downstream no responde
Timeout excedido

2. Estructura de Respuesta de Error
2.1 Error Response Body
Formato estándar:
json{
  "error": {
    "code": "USER_NOT_FOUND_001",
    "message": "Usuario no encontrado",
    "details": {
      "userId": "12345",
      "field": "email",
      "reason": "No existe usuario con ese email"
    },
    "timestamp": "2026-01-07T15:30:00Z",
    "path": "/api/users/12345",
    "requestId": "req_abc123def456"
  }
}
Para múltiples errores de validación:
json{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Errores de validación",
    "errors": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Email inválido"
      },
      {
        "field": "password",
        "code": "TOO_SHORT",
        "message": "Contraseña debe tener mínimo 8 caracteres"
      }
    ],
    "requestId": "req_xyz789"
  }
}
```

#### 2.2 Headers Informativos

**Incluir siempre**:
- `X-Request-ID`: Para trazabilidad
- `X-Error-Code`: Código de error específico
- `Content-Type: application/json`

**En errores de rate limit**:
- `X-RateLimit-Limit`: Límite total
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset
- `Retry-After`: Segundos hasta poder reintentar

**En errores de autenticación**:
- `WWW-Authenticate`: Esquema de auth requerido

### 3. Middleware de Manejo de Errores

#### 3.1 Global Error Handler

**Responsabilidades**:
- Catch panic/error no manejados
- Convertir error interno a HTTP response
- Sanitizar información sensible
- Loggear error con contexto
- Incrementar métricas
- Retornar respuesta estandarizada

**Nunca incluir en producción**:
- Stack traces
- Queries SQL
- Paths internos del servidor
- Configuración del sistema
- Información de infraestructura

#### 3.2 Request ID Tracking

**Generación**:
- UUID al recibir request
- Propagar en header `X-Request-ID`
- Incluir en todos los logs
- Retornar al cliente

**Correlation ID** (microservicios):
- ID único para request completo
- Propagar entre servicios
- Permite trazar request end-to-end

### 4. Retry Logic

#### 4.1 Idempotency Keys

**Para operaciones no-idempotentes**:
- Cliente genera `Idempotency-Key`
- Servidor cachea resultado
- Retries retornan mismo resultado
- Previene duplicados (ej. doble cobro)

**Implementación**:
- Key única del cliente
- TTL de 24-48 horas
- Almacenar en Redis
- Retornar 409 si key reutilizado diferente

#### 4.2 Retry-After

**Cuándo usar**:
- Rate limiting (429)
- Overload (503)
- Maintenance (503)

**Valores**:
- Segundos: `Retry-After: 120`
- Fecha: `Retry-After: Wed, 21 Oct 2026 07:28:00 GMT`

---

## ⚛️ Frontend Next.js - Manejo de Errores

### 1. Boundary de Errores

#### 1.1 Error Boundaries (React)

**Niveles de boundaries**:

**Global Boundary** (app/_error.tsx):
- Catch errores de toda la app
- Mostrar página de error genérica
- Log a servicio externo (Sentry)
- Opción de recargar

**Page Boundary**:
- Catch errores de página específica
- Navegación a otra página funcionando
- Mensaje específico al contexto

**Component Boundary**:
- Catch errores de componente
- Mostrar fallback UI
- Resto de página funcional

**Section Boundary**:
- Para secciones críticas
- Degradación elegante
- Feature flag aware

#### 1.2 Error.tsx (Next.js 13+)

**Jerarquía de error pages**:
```
app/
├── error.tsx           # Global error
├── not-found.tsx       # 404
├── dashboard/
│   ├── error.tsx       # Dashboard errors
│   └── profile/
│       └── error.tsx   # Profile errors
Props recibidos:

error: Objeto de error
reset: Función para reintentar

2. Manejo de Errores de API
2.1 Fetch Wrapper
Wrapper centralizado para todas las llamadas API:
Responsabilidades:

Agregar headers comunes (auth, content-type)
Manejo de respuestas
Parse de errores
Retry logic
Timeout
Logging

Casos a manejar:
Network Error:

No hay conexión
Mostrar mensaje offline
Queue requests para cuando vuelva conexión

Timeout:

Request tarda mucho
Cancelar y mostrar error
Permitir retry

4xx Errors:

Parse error body
Mostrar mensaje específico
No reintentar automáticamente

5xx Errors:

Problema del servidor
Reintentar con backoff
Mostrar mensaje genérico

Abort/Cancel:

Usuario navegó fuera
Cancelar requests pendientes
Cleanup

2.2 Interceptores
Request Interceptor:

Agregar auth token
Agregar request ID
Agregar metadata
Log request (debug)

Response Interceptor:

Parse respuesta
Manejo centralizado de errores
Refresh token si 401
Transform data
Log response (debug)

Error Interceptor:

Normalizar estructura de error
Extraer mensaje de usuario
Log error
Enviar a monitoring
Trigger notificaciones

3. Validación en Cliente
3.1 Validación en Tiempo Real
Niveles:
onChange:

Validación instantánea
Solo mostrar error después de blur
No bloquear escritura

onBlur:

Validación al salir del campo
Mostrar error si existe
Focus en siguiente campo

onSubmit:

Validación completa
Prevenir envío si hay errores
Focus en primer error
Scroll a campo con error

3.2 Validación Schema
Biblioteca sugerida: Zod, Yup, Joi
Beneficios:

Validación consistente cliente/servidor
Type-safe
Mensajes de error estandarizados
Validaciones complejas

Tipos de validaciones:

Required
Type checking
Format (email, URL, phone)
Length (min, max)
Pattern (regex)
Custom validators
Cross-field validation

4. Estados de Carga y Error
4.1 Loading States
Tipos de loaders:
Skeleton Screen:

Forma del contenido final
Mejor UX que spinner
Muestra estructura

Spinner/Progress:

Operaciones cortas
Centro de pantalla o inline
Con texto descriptivo

Progress Bar:

Operaciones con progreso medible
Upload de archivos
Operaciones batch

Optimistic Updates:

UI actualizada inmediatamente
Rollback si falla
Mejor percepción de velocidad

4.2 Error States
Inline Errors:

Campo específico
Debajo del input
Icono + texto + color

Toast/Snackbar:

Feedback rápido
Auto-dismiss
No bloquea UI
Para errores no críticos

Modal de Error:

Errores críticos
Requiere acción del usuario
Bloquea UI hasta resolver

Banner de Error:

Errores persistentes
No bloquea pero visible
Ej: "Modo offline", "Conexión lenta"

Página de Error:

Error catastrófico
404, 500, etc
Opciones de recuperación

5. Manejo de Errores Asíncronos
5.1 Server Actions (Next.js)
Error handling pattern:

Try/catch en server action
Retornar objeto con error
Cliente verifica resultado
Mostrar error apropiadamente

Tipos de retorno:
typescripttype ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code: string }
```

#### 5.2 React Query / SWR

**Error handling integrado**:
- `error` state automático
- Retry automático configurable
- Error boundary compatible
- Stale-while-revalidate

**Configuración sugerida**:
- Retry: 3 veces
- Retry delay: Exponencial
- Cache time: 5 minutos
- Stale time: 1 minuto

### 6. Offline Support

#### 6.1 Service Worker

**Estrategias**:

**Network First**:
- Intentar red primero
- Fallback a cache
- Para datos dinámicos

**Cache First**:
- Cache primero
- Actualizar en background
- Para assets estáticos

**Stale While Revalidate**:
- Servir cache inmediatamente
- Actualizar en background
- Mejor de ambos mundos

#### 6.2 Background Sync

**Queue de operaciones offline**:
- Guardar operaciones fallidas
- Reintentar al reconectar
- Mostrar estado de sync
- Resolver conflictos

**Indicadores**:
- Badge "Sin conexión"
- Lista de pendientes
- Progress de sync

### 7. User Feedback

#### 7.1 Mensajes de Error

**Características**:

**Claro y Específico**:
- ❌ "Error"
- ✅ "El email ya está registrado"

**Accionable**:
- ❌ "Error de servidor"
- ✅ "No pudimos guardar. Por favor intenta nuevamente"

**Empático**:
- ❌ "Invalid input"
- ✅ "Por favor verifica el formato del email"

**Sin Jerga Técnica**:
- ❌ "HTTP 422 Unprocessable Entity"
- ✅ "Algunos campos tienen errores, revisa el formulario"

#### 7.2 Internacionalización de Errores

**Error keys**:
- Código de error mapea a mensaje
- Soporte multi-idioma
- Fallback a idioma default
- Variables en mensajes

**Ejemplo**:
```
errors.user.not_found.es = "Usuario no encontrado"
errors.user.not_found.en = "User not found"

📊 Logging y Monitoreo
1. Structured Logging
1.1 Niveles de Log
DEBUG:

Solo en desarrollo
Información muy detallada
Variables, flow control

INFO:

Eventos normales importantes
Request completado
Usuario login
Operación exitosa

WARN:

Problemas potenciales
Uso de deprecated API
Fallback ejecutado
Threshold excedido

ERROR:

Errores manejados
Operación falló
Requiere atención
Usuario puede ver mensaje

FATAL:

Error no recuperable
Servicio no puede continuar
Alerta inmediata
Intervención manual necesaria

1.2 Log Structure
Campos estándares:
json{
  "timestamp": "2026-01-07T15:30:00.000Z",
  "level": "ERROR",
  "message": "Failed to create user",
  "service": "user-service",
  "version": "v1.2.3",
  "environment": "production",
  "requestId": "req_abc123",
  "userId": "user_789",
  "error": {
    "code": "DB_CONSTRAINT_001",
    "message": "duplicate key value",
    "stack": "...",
    "cause": "..."
  },
  "context": {
    "operation": "CreateUser",
    "duration_ms": 1250,
    "email": "user@example.com"
  },
  "metadata": {
    "ip": "192.168.1.1",
    "userAgent": "...",
    "referer": "..."
  }
}
```

#### 1.3 Sensitive Data

**NUNCA loggear**:
- Contraseñas
- Tokens de acceso
- Números de tarjeta
- SSN / documento identidad
- Información médica
- Datos personales sensibles

**Redactar/Mask**:
- Email: `u***@example.com`
- Teléfono: `***-***-1234`
- Tarjeta: `****-****-****-1234`
- Token: `abc...xyz` (primeros y últimos chars)

### 2. Distributed Tracing

#### 2.1 Trace Context

**Información a propagar**:
- Trace ID: Identificador único de request completo
- Span ID: Identificador de operación específica
- Parent Span ID: Jerarquía de operaciones
- Sampled: Si este trace se está registrando

**Headers estándar**:
- `traceparent`: W3C Trace Context
- `tracestate`: Vendor-specific data

#### 2.2 Spans

**Crear span para**:
- HTTP request
- Database query
- Cache operation
- External API call
- Background job
- Heavy computation

**Span attributes**:
- Operation name
- Start/end time
- Status (OK, ERROR)
- Tags (metadata)
- Logs (events dentro del span)

### 3. Métricas

#### 3.1 RED Metrics

**Rate**:
- Requests por segundo
- Por endpoint
- Por usuario/tenant

**Errors**:
- Error rate
- Por tipo de error
- Por endpoint

**Duration**:
- Latencia promedio
- P50, P95, P99
- Por endpoint

#### 3.2 Database Metrics

**Connection Pool**:
- Active connections
- Idle connections
- Wait time
- Utilization %

**Query Performance**:
- Query time (P95, P99)
- Slow queries (> threshold)
- Queries per second
- Cache hit rate

**Errors**:
- Connection errors
- Query errors
- Deadlocks
- Constraint violations

#### 3.3 Cache Metrics

**Hit/Miss Rate**:
- Cache hit ratio
- Miss rate
- Por tipo de clave

**Performance**:
- GET latency
- SET latency
- Eviction rate

**Health**:
- Memory usage
- Connection errors
- Replication lag (si aplica)

### 4. Alerting

#### 4.1 Alert Levels

**Critical (P1)**:
- Servicio completamente caído
- Pérdida de datos
- Seguridad comprometida
- Página inmediata, call

**High (P2)**:
- Funcionalidad mayor afectada
- Error rate > threshold
- Performance degradada
- Página, 15 min SLA

**Medium (P3)**:
- Feature específica afectada
- Algunos usuarios impactados
- Email/Slack, 1 hora SLA

**Low (P4)**:
- Minor issues
- No urgente
- Ticket, next business day

#### 4.2 Alert Conditions

**Error Rate**:
- > 5% error rate por 5 min
- > 50% para endpoint específico

**Latency**:
- P95 > 2x baseline
- P99 > 5 segundos

**Availability**:
- Health check falla 3 veces consecutivas
- Uptime < 99.9% en ventana

**Resource Usage**:
- CPU > 80% por 10 min
- Memory > 90%
- Disk > 85%
- DB connections > 90% pool

### 5. Error Reporting Services

#### 5.1 Sentry (recomendado)

**Características**:
- Automatic error grouping
- Stack traces
- Breadcrumbs (eventos previos)
- User context
- Release tracking
- Performance monitoring

**Configuración**:
- Environment tags
- Release versions
- User identification
- Custom tags/context
- Error sampling (no enviar todo)

#### 5.2 Alternative Services

**Datadog**:
- APM completo
- Logs + Metrics + Traces
- Dashboards poderosos
- Alertas avanzadas

**New Relic**:
- Full observability platform
- Real user monitoring
- Synthetic monitoring

**Prometheus + Grafana**:
- Open source
- Self-hosted
- Métricas time-series
- Alertmanager integration

---

## 🧪 Testing de Errores

### 1. Unit Tests

#### 1.1 Test de Error Paths

**Para cada función, testear**:
- Happy path (éxito)
- Error paths (cada tipo de error posible)
- Edge cases
- Invalid inputs

**Ejemplo de cobertura**:
```
CreateUser function:
✓ Success case
✓ Invalid email format
✓ Duplicate email
✓ Database connection error
✓ Validation error (multiple fields)
✓ Transaction rollback
1.2 Mock de Dependencias
Simular errores de:

Database (connection, query, constraint)
Cache (timeout, unavailable)
External API (timeout, 4xx, 5xx)
File system (permission, not found)

Herramientas:

Go: testify/mock, gomock
Next.js: Jest, React Testing Library
PostgreSQL: sqlmock, testcontainers

2. Integration Tests
2.1 Test de Flujos Completos
Escenarios:

Usuario registra → login → operación → logout
Con error en cada paso
Rollback de transacciones
Consistencia de datos

2.2 Test de Concurrencia
Race conditions:

Múltiples requests simultáneos
Deadlocks
Unique constraint violations
Optimistic locking

Herramientas:

Go race detector: go test -race
Load testing: k6, Apache Bench

3. End-to-End Tests
3.1 Chaos Engineering
Inyectar fallos:

Matar servicios aleatoriamente
Introducir latencia
Cortar red
Llenar disco
Agotar memoria

Validar:

Sistema se recupera
Datos consistentes
Usuarios ven mensajes apropiados
Logs correctos

3.2 Smoke Tests
Tests críticos en producción:

Health check
Login flow
Operación clave
Cada 5-15 minutos


📖 Documentación de Errores
1. Error Catalog
Documento centralizado con todos los errores:
Por cada error:

Código: USER_NOT_FOUND_001
Nombre: "Usuario no encontrado"
HTTP Status: 404
Mensaje usuario: "No encontramos ese usuario"
Mensaje técnico: "User with ID {id} not found in database"
Causas posibles:

ID inválido
Usuario eliminado
Base de datos inconsistente


Resolución:

Verificar ID
Validar que usuario existe antes de operar


Retryable: No
Logs: Nivel INFO
Alerta: No

2. API Documentation
OpenAPI/Swagger con:

Todos los posibles error responses
Ejemplos de error bodies
Cuándo ocurre cada error
Cómo manejarlo en cliente

3. Runbooks
Para operaciones (DevOps):
Por cada tipo de error crítico:

Síntomas
Diagnostico rápido
Pasos de mitigación inmediata
Pasos de resolución permanente
Escalation path
Post-mortem template


✅ Checklist de Implementación
Backend Go

 Error types personalizados definidos
 Error wrapping con contexto
 Validación de input en múltiples niveles
 Manejo de transacciones con rollback
 Timeouts en todas las operaciones
 Retry con backoff exponencial
 Circuit breaker implementado
 Context propagation (request ID, user ID)
 Structured logging
 Panic recovery
 Graceful shutdown
 Health check endpoints

PostgreSQL

 Connection pooling configurado
 Manejo de constraint violations
 Deadlock detection y retry
 Query timeout configurado
 Slow query logging
 Prepared statements para prevenir SQL injection
 Migrations con rollback
 Database health monitoring
 Backup y restore procedures
 Índices apropiados

Redis

 Connection pooling
 Timeout configurado
 Fallback cuando Redis down
 Cache invalidation strategy
 Thundering herd mitigation
 Stale-while-revalidate
 Memory eviction policy configurado
 Persistence (AOF/RDB) según necesidad
 Cluster/Sentinel para HA
 Monitoring de hit rate

API REST

 Códigos HTTP apropiados
 Estructura de error estandarizada
 Request ID tracking
 Rate limiting
 CORS configurado
 Error sanitization (no leak info)
 Idempotency keys
 API versioning
 OpenAPI documentation
 Request/response logging

Frontend Next.js

 Error boundaries en múltiples niveles
 Fetch wrapper centralizado
 Retry logic en cliente
 Timeout en requests
 Validación con schema (Zod/Yup)
 Loading states
 Error states (inline, toast, modal, page)
 Offline detection
 Service worker con cache strategy
 User-friendly error messages
 Error logging a servicio externo
 Optimistic updates con rollback

Observability

 Structured logging implementado
 Log levels apropiados
 Sensitive data redaction
 Distributed tracing
 RED metrics (Rate, Errors, Duration)
 Database metrics
 Cache metrics
 Custom business metrics
 Alerting configurado
 Dashboard de monitoring
 Error aggregation (Sentry/similar)
 On-call rotation definido

Testing

 Unit tests para error paths
 Integration tests con errores
 E2E tests incluyendo fallos
 Load testing
 Chaos engineering (opcional)
 Error scenarios documentados
 Test coverage > 80%

Documentación

 Error catalog completo
 API errors documentados
 Runbooks para errores críticos
 User-facing error guide
 Developer guide para error handling
 Post-mortem template


🎯 Mejores Prácticas Generales
1. Principios SOLID en Errores
Single Responsibility:

Cada función maneja un tipo de error
Separar detección, logging, respuesta

Open/Closed:

Extensible para nuevos tipos de error
Sin modificar código existente

Liskov Substitution:

Errors implementan interface común
Intercambiables en handling

Interface Segregation:

Interfaces específicas por tipo de error
No forzar métodos no usados

Dependency Inversion:

Depender de abstracciones
No de implementaciones concretas

2. Fail Fast, Fail Loud

Detectar errores lo antes posible
No silenciar errores
Log inmediato
Alert si es crítico
No asumir que "probablemente está bien"

3. Defensive Programming

Validar todas las entradas
No confiar en datos externos
Verificar precondiciones
Assert invariantes
Fail gracefully

4. Error Budget
Concepto SRE:

Definir uptime objetivo (99.9%, 99.95%)
Error budget = 100% - uptime objetivo
Budget consumido por downtime/errors
Si budget agotado: priorizar reliability sobre features

5. Blameless Post-Mortems
Después de incidente:

Documentar qué pasó
Por qué pasó (root cause)
Cómo se detectó
Cómo se resolvió
Qué se aprende
Acción items para prevenir
Sin culpar personas


📚 Recursos y Referencias
Libros

"Release It!" - Michael Nygard (resilience patterns)
"Site Reliability Engineering" - Google
"The Phoenix Project" - Gene Kim

Standards

RFC 7807: Problem Details for HTTP APIs
OpenAPI 3.0: Error response specification
W3C Trace Context: Distributed tracing standard

Tools

Sentry: Error tracking
Datadog/New Relic: APM
Prometheus+Grafana: Metrics
Jaeger/Zipkin: Distributed tracing
PagerDuty/OpsGenie: Incident management


Este documento proporciona una guía completa para implementar manejo robusto de errores en tu stack. ¿