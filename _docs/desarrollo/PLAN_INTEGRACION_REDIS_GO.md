# 🗄️ Plan de Integración Redis - Servicios Go SICORA

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Alcance:** Servicios Go + AIService Python

---

## 📊 Análisis de Datos Cacheables

### Criterios de Selección

| Criterio                  | Descripción                              |
| ------------------------- | ---------------------------------------- |
| **Frecuencia de cambio**  | Datos que cambian ≤2 veces por trimestre |
| **Frecuencia de lectura** | Alta demanda de consultas                |
| **Tamaño del dato**       | Pequeño-mediano (< 1MB)                  |
| **Criticidad**            | No requiere consistencia inmediata       |

---

## 🎯 Servicios y Datos Candidatos

### 1. ScheduleService (Go) - **PRIORIDAD ALTA**

Los datos maestros académicos son altamente estables.

| Entidad                | TTL Recomendado | Justificación                              |
| ---------------------- | --------------- | ------------------------------------------ |
| **Campus**             | 24h (86400s)    | Sedes casi nunca cambian                   |
| **AcademicProgram**    | 12h (43200s)    | Programas se crean/modifican 1-2 veces/año |
| **AcademicGroup**      | 6h (21600s)     | Fichas cambian al inicio de trimestre      |
| **Venue**              | 12h (43200s)    | Ambientes rara vez cambian                 |
| **Schedule (activos)** | 1h (3600s)      | Horarios cambian 2 veces/trimestre         |

**Patrones de caché:**

```
scheduleservice:campus:{id}           → Campus individual
scheduleservice:campus:all            → Lista completa de campus
scheduleservice:campus:active         → Solo campus activos
scheduleservice:program:{id}          → Programa individual
scheduleservice:program:all           → Lista de programas
scheduleservice:group:{id}            → Ficha individual
scheduleservice:group:program:{pid}   → Fichas por programa
scheduleservice:venue:{id}            → Ambiente individual
scheduleservice:venue:campus:{cid}    → Ambientes por campus
scheduleservice:schedule:group:{gid}  → Horarios por ficha
```

---

### 2. UserService (Go) - **PRIORIDAD ALTA**

Datos de usuario estables (aprendices no cambian datos frecuentemente).

| Entidad                  | TTL Recomendado | Justificación               |
| ------------------------ | --------------- | --------------------------- |
| **User (perfil básico)** | 30min (1800s)   | Datos demográficos estables |
| **User (roles)**         | 15min (900s)    | Roles cambian poco          |
| **Users por grupo**      | 1h (3600s)      | Asignación a fichas estable |

**Patrones de caché:**

```
userservice:user:{id}                 → Usuario individual
userservice:user:document:{doc}       → Usuario por documento
userservice:user:email:{email}        → Usuario por email
userservice:users:group:{gid}         → Usuarios de una ficha
userservice:users:role:{role}         → Usuarios por rol
userservice:instructors:active        → Instructores activos
```

---

### 3. KbService (Go) - **PRIORIDAD MEDIA**

Base de conocimiento con contenido estable.

| Entidad                 | TTL Recomendado | Justificación              |
| ----------------------- | --------------- | -------------------------- |
| **FAQ**                 | 4h (14400s)     | FAQs son contenido curado  |
| **Categorías**          | 12h (43200s)    | Categorías muy estables    |
| **Búsquedas populares** | 30min (1800s)   | Optimiza queries repetidas |

**Patrones de caché:**

```
kbservice:faq:{id}                    → FAQ individual
kbservice:faq:category:{cat}          → FAQs por categoría
kbservice:categories:all              → Todas las categorías
kbservice:search:{hash}               → Resultados de búsqueda (hash del query)
```

---

### 4. EvalinService (Go) - **PRIORIDAD MEDIA**

Formularios y criterios de evaluación son plantillas estables.

| Entidad                   | TTL Recomendado | Justificación           |
| ------------------------- | --------------- | ----------------------- |
| **Formularios plantilla** | 6h (21600s)     | Plantillas cambian poco |
| **Criterios evaluación**  | 6h (21600s)     | Criterios predefinidos  |
| **Períodos activos**      | 1h (3600s)      | Consulta frecuente      |

**Patrones de caché:**

```
evalinservice:form:template:{id}      → Plantilla de formulario
evalinservice:criteria:all            → Criterios de evaluación
evalinservice:period:active           → Período actual activo
```

---

### 5. MevalService (Go) - **PRIORIDAD BAJA**

Datos de comité disciplinario más dinámicos.

| Entidad            | TTL Recomendado | Justificación          |
| ------------------ | --------------- | ---------------------- |
| **Tipos de falta** | 12h (43200s)    | Catálogo estable       |
| **Configuración**  | 6h (21600s)     | Parámetros del sistema |

**Patrones de caché:**

```
mevalservice:fault:types              → Tipos de falta
mevalservice:config                   → Configuración general
```

---

### 6. AttendanceService (Go) - **NO CACHEAR DATOS PRINCIPALES**

⚠️ Los registros de asistencia son **datos transaccionales** que cambian constantemente.

**Solo cachear:**
| Entidad | TTL Recomendado | Justificación |
|---------|-----------------|---------------|
| **Configuración** | 1h (3600s) | Tolerancias, horarios |

```
attendanceservice:config              → Configuración de asistencia
```

---

### 7. AIService (Python) - **YA IMPLEMENTADO** ✅

Tiene RedisAdapter completo en `sicora-be-python/aiservice/app/infrastructure/adapters/redis_adapter.py`

| Entidad           | TTL Recomendado | Justificación                     |
| ----------------- | --------------- | --------------------------------- |
| **Respuestas IA** | 15min (900s)    | Evita llamadas repetidas a OpenAI |
| **Embeddings**    | 24h (86400s)    | Vectores estables                 |

---

## 🏗️ Arquitectura de Implementación

### Estructura de Carpetas (Go)

```
sicora-be-go/
├── shared/
│   └── cache/
│       ├── redis_client.go      # Cliente Redis reutilizable
│       ├── cache_interface.go   # Interface abstracta
│       └── cache_keys.go        # Constantes de keys
│
└── [service]/
    └── internal/
        └── infrastructure/
            └── cache/
                └── redis_cache.go  # Implementación específica
```

### Interface Base (Go)

```go
// shared/cache/cache_interface.go
package cache

import (
    "context"
    "time"
)

type CacheInterface interface {
    Get(ctx context.Context, key string) ([]byte, error)
    Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
    Delete(ctx context.Context, key string) error
    Exists(ctx context.Context, key string) (bool, error)
    GetMany(ctx context.Context, keys []string) (map[string][]byte, error)
    DeletePattern(ctx context.Context, pattern string) error
    Close() error
}
```

### Cliente Redis Compartido

```go
// shared/cache/redis_client.go
package cache

import (
    "context"
    "time"

    "github.com/redis/go-redis/v9"
)

type RedisClient struct {
    client *redis.Client
    prefix string
}

func NewRedisClient(url, prefix string) (*RedisClient, error) {
    opts, err := redis.ParseURL(url)
    if err != nil {
        return nil, err
    }

    client := redis.NewClient(opts)

    // Verify connection
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := client.Ping(ctx).Err(); err != nil {
        return nil, err
    }

    return &RedisClient{
        client: client,
        prefix: prefix,
    }, nil
}
```

---

## 📋 Plan de Implementación

### Fase 1: Infraestructura Base (2-3 días)

| Tarea                               | Archivos                  | Prioridad |
| ----------------------------------- | ------------------------- | --------- |
| Crear `shared/cache/`               | Interface + Cliente Redis | ALTA      |
| Agregar `go-redis/v9` a go.mod      | go.mod                    | ALTA      |
| Actualizar docker-compose con Redis | docker-compose.yml        | ALTA      |

### Fase 2: ScheduleService (3-4 días)

| Tarea                         | Archivos                  | TTL |
| ----------------------------- | ------------------------- | --- |
| Cache Campus                  | `cache/campus_cache.go`   | 24h |
| Cache AcademicProgram         | `cache/program_cache.go`  | 12h |
| Cache AcademicGroup           | `cache/group_cache.go`    | 6h  |
| Cache Venue                   | `cache/venue_cache.go`    | 12h |
| Cache Schedule                | `cache/schedule_cache.go` | 1h  |
| Invalidación en Create/Update | Repository wrappers       | -   |

### Fase 3: UserService (2-3 días)

| Tarea                 | Archivos                     | TTL   |
| --------------------- | ---------------------------- | ----- |
| Cache User            | `cache/user_cache.go`        | 30min |
| Cache Users por grupo | `cache/group_users_cache.go` | 1h    |
| Cache por rol         | `cache/role_cache.go`        | 1h    |

### Fase 4: KbService (2 días)

| Tarea            | Archivos                  | TTL   |
| ---------------- | ------------------------- | ----- |
| Cache FAQ        | `cache/faq_cache.go`      | 4h    |
| Cache Categorías | `cache/category_cache.go` | 12h   |
| Cache Búsquedas  | `cache/search_cache.go`   | 30min |

### Fase 5: EvalinService + MevalService (2 días)

| Tarea             | Archivos                     | TTL |
| ----------------- | ---------------------------- | --- |
| Cache Plantillas  | `cache/template_cache.go`    | 6h  |
| Cache Criterios   | `cache/criteria_cache.go`    | 6h  |
| Cache Tipos Falta | `cache/fault_types_cache.go` | 12h |

---

## 🔄 Estrategia de Invalidación

### Write-Through con TTL

```go
// Al actualizar un registro
func (r *CachedRepository) Update(ctx context.Context, entity *Entity) error {
    // 1. Actualizar en DB
    if err := r.dbRepo.Update(ctx, entity); err != nil {
        return err
    }

    // 2. Invalidar caché
    r.cache.Delete(ctx, r.makeKey(entity.ID))

    // 3. Invalidar listas relacionadas
    r.cache.DeletePattern(ctx, r.prefix + ":list:*")

    return nil
}
```

### Eventos de Invalidación

| Evento                | Acción                                 |
| --------------------- | -------------------------------------- |
| `CREATE`              | Invalidar listas (`*:all`, `*:active`) |
| `UPDATE`              | Invalidar entidad + listas             |
| `DELETE`              | Invalidar entidad + listas             |
| `Cambio de trimestre` | Flush `scheduleservice:*`              |

---

## 📊 Métricas y Monitoreo

### Keys de Métricas

```
sicora:cache:hits:{service}           → Counter de hits
sicora:cache:misses:{service}         → Counter de misses
sicora:cache:latency:{service}        → Histograma de latencia
```

### Dashboard Prometheus

- Cache Hit Rate por servicio
- Latencia P50/P95/P99
- Memoria utilizada
- Keys por servicio

---

## ⚙️ Configuración de Entorno

### Variables de Entorno

```bash
# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_MAX_RETRIES=3
REDIS_POOL_SIZE=10

# Cache TTLs (sobrescribir defaults)
CACHE_TTL_CAMPUS=86400
CACHE_TTL_PROGRAM=43200
CACHE_TTL_GROUP=21600
CACHE_TTL_USER=1800
```

---

## 📈 Impacto Esperado

| Métrica             | Sin Cache | Con Cache | Mejora            |
| ------------------- | --------- | --------- | ----------------- |
| Latencia GET Campus | ~50ms     | ~5ms      | **90%**           |
| Latencia GET User   | ~40ms     | ~5ms      | **87%**           |
| Carga DB lecturas   | 100%      | ~30%      | **70%**           |
| Costo por request   | Alto      | Bajo      | **Significativo** |

---

## ✅ Checklist Pre-Implementación

- [ ] Redis 7 disponible en docker-compose
- [ ] Dependencia `github.com/redis/go-redis/v9` agregada
- [ ] Variables de entorno configuradas
- [ ] Tests de conexión Redis
- [ ] Monitoreo Prometheus configurado

---

_Documento de planificación para integración Redis en Backend Go SICORA_
