# 📋 ProjectEval Service - FastAPI

**Sistema de Evaluación de Proyectos Formativos ADSO/PSW**  
**Stack:** FastAPI + SQLAlchemy + PostgreSQL 15 + Alembic  
**Puerto:** 8008  
**Arquitectura:** Clean Architecture  
**Estado:** ✅ 100% Documentado | 100% Implementado

---

## 🎯 **PROPÓSITO**

ProjectEval Service gestiona el **hito más importante** de los programas ADSO y PSW: la evaluación de proyectos formativos donde los aprendices desarrollan software real para stakeholders externos.

### **Funcionalidades Principales**

- 📋 **Gestión CRUD de Proyectos** formativos, productivos, de investigación e innovación
- 👥 **Gestión de Stakeholders** (industria, academia, gobierno, NGO, comunidad)
- 📊 **Evaluaciones Estructuradas** (inicial, intermedia, final, seguimiento)
- ✅ **Gestión de Criterios de Evaluación** con flujo de aprobación
- 📅 **Programación de Sesiones** de evaluación
- 🗄️ **Database VCS** con migraciones Alembic granulares
- 📈 **Analytics** y reportes de retroalimentación

---

## ✅ **ESTADO DE IMPLEMENTACIÓN**

| Componente            | Estado           | Cantidad |
| --------------------- | ---------------- | -------- |
| **Controllers**       | ✅ Completo      | 4        |
| **Endpoints**         | ✅ Completo      | 41       |
| **Use Cases**         | ✅ Completo      | 37       |
| **Tests Unitarios**   | ✅ Completo      | 36       |
| **Tests Integración** | ✅ Completo      | 26       |
| **Total Tests**       | ✅ 62/62 passing | -        |

---

## 🏗️ **ARQUITECTURA CLEAN**

![ProjectEvalService Architecture](../../assets/arquitectura/projectevalservice-architecture.svg)

```
projectevalservice/
├── app/
│   ├── domain/                 # CAPA INTERNA - Entities y Business Rules
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── application/            # CAPA CASOS DE USO
│   │   ├── use_cases/
│   │   └── dtos/
│   ├── infrastructure/         # CAPA EXTERNA - Frameworks y Drivers
│   │   ├── database/
│   │   │   └── models/        # SQLAlchemy Models
│   │   ├── external_services/
│   │   └── repositories/
│   └── presentation/           # CAPA INTERFACE ADAPTERS
│       ├── api/
│       └── schemas/
├── tests/
├── alembic/                    # Database Migrations
│   ├── versions/
│   └── env.py
└── requirements.txt
```

---

## 🗄️ **ESTRUCTURA DE BASE DE DATOS**

### **Esquema:** `projectevalservice_schema`

#### **Tablas Principales:**

##### **1. projects**

```sql
- id (VARCHAR 36, PK)                    # UUID del proyecto
- title (VARCHAR 255, NOT NULL)         # Título del proyecto
- description (TEXT, NOT NULL)          # Descripción detallada
- status (ENUM projectstatus)            # IDEA_PROPOSAL, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
- project_type (ENUM projecttype)       # FORMATIVE, PRODUCTIVE, RESEARCH, INNOVATION
- start_date (TIMESTAMP)                # Fecha de inicio
- end_date (TIMESTAMP)                  # Fecha de finalización
- budget (FLOAT)                        # Presupuesto estimado
- stakeholder_requirements (JSON)       # Requerimientos del stakeholder
- technology_stack (JSON)              # Stack tecnológico
- deliverables (JSON)                   # Entregables del proyecto
- is_active (BOOLEAN, DEFAULT TRUE)     # Estado activo
- created_at (TIMESTAMP, DEFAULT NOW)   # Fecha de creación
- updated_at (TIMESTAMP, DEFAULT NOW)   # Fecha de actualización
```

##### **2. stakeholders**

```sql
- id (UUID, PK)                         # UUID del stakeholder
- name (VARCHAR 255, NOT NULL)          # Nombre/Razón social
- stakeholder_type (ENUM)               # INDUSTRY, ACADEMIC, GOVERNMENT, NGO, COMMUNITY
- status (ENUM stakeholderstatus)       # ACTIVE, INACTIVE, PENDING
- contact_person (VARCHAR 255)          # Persona de contacto
- email (VARCHAR 255, UNIQUE)           # Email principal
- phone (VARCHAR 50)                    # Teléfono de contacto
- address (TEXT)                        # Dirección física
- organization_size (VARCHAR 50)        # Tamaño de organización
- sector (VARCHAR 100)                  # Sector económico
- website (VARCHAR 500)                 # Sitio web
- capabilities (JSON)                   # Capacidades técnicas
- requirements (JSON)                   # Requerimientos específicos
- partnership_history (JSON)            # Historial de colaboraciones
- is_active (BOOLEAN, DEFAULT TRUE)     # Estado activo
- created_at (TIMESTAMP, DEFAULT NOW)   # Fecha de creación
- updated_at (TIMESTAMP, DEFAULT NOW)   # Fecha de actualización
```

##### **3. evaluations**

```sql
- id (UUID, PK)                         # UUID de la evaluación
- project_id (VARCHAR 36, FK)           # Referencia al proyecto
- evaluation_type (ENUM)                # INITIAL, INTERMEDIATE, FINAL, FOLLOW_UP
- status (ENUM evaluationstatus)        # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- evaluator_id (VARCHAR 255)            # ID del evaluador
- scheduled_date (TIMESTAMP, NOT NULL)  # Fecha programada
- completed_date (TIMESTAMP)            # Fecha de finalización
- criteria (JSON)                       # Criterios de evaluación
- scores (JSON)                         # Puntuaciones obtenidas
- feedback (TEXT)                       # Retroalimentación detallada
- recommendations (TEXT)                # Recomendaciones
- attachments (JSON)                    # Archivos adjuntos
- is_active (BOOLEAN, DEFAULT TRUE)     # Estado activo
- created_at (TIMESTAMP, DEFAULT NOW)   # Fecha de creación
- updated_at (TIMESTAMP, DEFAULT NOW)   # Fecha de actualización
```

### **Índices de Optimización:**

```sql
-- Projects
ix_projects_status, ix_projects_type, ix_projects_active
ix_projects_created_at, ix_projects_start_date, ix_projects_end_date

-- Stakeholders
ix_stakeholders_email (UNIQUE), ix_stakeholders_type, ix_stakeholders_status
ix_stakeholders_active, ix_stakeholders_sector

-- Evaluations
ix_evaluations_project_id, ix_evaluations_status, ix_evaluations_type
ix_evaluations_evaluator, ix_evaluations_scheduled_date, ix_evaluations_completed_date
ix_evaluations_active
```

### **ENUMs Definidos:**

```sql
projectstatus: IDEA_PROPOSAL, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
projecttype: FORMATIVE, PRODUCTIVE, RESEARCH, INNOVATION
evaluationstatus: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
evaluationtype: INITIAL, INTERMEDIATE, FINAL, FOLLOW_UP
stakeholderstatus: ACTIVE, INACTIVE, PENDING
stakeholdertype: INDUSTRY, ACADEMIC, GOVERNMENT, NGO, COMMUNITY
```

---

## 🚀 **CONFIGURACIÓN Y AUTOMATIZACIÓN**

### **1. Variables de Entorno**

```bash
# Base de Datos
DATABASE_URL=postgresql+asyncpg://sicora_migrator:cambia_esto_migrator@localhost:5432/sicora_dev
DATABASE_ECHO=false

# Aplicación
APP_NAME=ProjectEval Service
VERSION=1.0.0
DEBUG=true
HOST=0.0.0.0
PORT=8007

# Seguridad
SECRET_KEY=your-secret-key-here-change-in-production-projectevalservice
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Servicios Externos
USERSERVICE_URL=http://localhost:8001
SCHEDULESERVICE_URL=http://localhost:8002

# Subida de Archivos
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_EXTENSIONS=.pdf,.doc,.docx,.txt,.zip,.rar

# Redis y Tareas en Background
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:8080
```

### **2. Configuración de Base de Datos**

#### **Usuarios y Permisos Granulares:**

```sql
-- Usuario para migraciones (DDL completo)
sicora_migrator: Todos los permisos sobre projectevalservice_schema

-- Usuario para aplicación (DML limitado)
projecteval_user: SELECT, INSERT, UPDATE, DELETE sobre tablas
                  USAGE sobre secuencias, sin permisos de DDL
```

#### **Instalación y Migraciones:**

```bash
# 1. Crear entorno virtual
python3.13 -m venv venv
source venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Verificar conexión DB
docker compose up -d postgres

# 4. Ejecutar migraciones
alembic upgrade head

# 5. Verificar estado
alembic current
```

### **3. Scripts de Automatización**

#### **Script de Inicialización: `setup.sh`**

```bash
#!/bin/bash
set -e

echo "🚀 Inicializando ProjectEval Service..."

# Verificar PostgreSQL
if ! docker compose ps postgres | grep -q "Up"; then
    echo "📦 Iniciando PostgreSQL..."
    docker compose up -d postgres
    sleep 5
fi

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
alembic upgrade head

# Verificar estado
echo "✅ Verificando estado de migraciones..."
alembic current

echo "🎉 ProjectEval Service listo!"
```

#### **Script de Desarrollo: `dev.sh`**

```bash
#!/bin/bash
# Ejecutar en modo desarrollo con recarga automática
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8007 --reload
```

#### **Script de Monitoreo: `monitor.sh`**

```bash
#!/bin/bash
# Monitoreo de rendimiento de consultas
docker exec -it sicora_postgres psql -U postgres -d sicora_dev -c "
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables
WHERE schemaname = 'projectevalservice_schema'
ORDER BY seq_scan DESC;
"
```

---

## 📋 **ENDPOINTS PRINCIPALES (41 Total)**

### **🏗️ Project Controller (8 endpoints)**

| Endpoint                           | Método | Descripción                     | RF    |
| ---------------------------------- | ------ | ------------------------------- | ----- |
| `/api/v1/projects`                 | POST   | Crear nuevo proyecto            | RF-01 |
| `/api/v1/projects/{id}`            | GET    | Obtener proyecto específico     | RF-01 |
| `/api/v1/projects/{id}`            | PUT    | Actualizar proyecto             | RF-01 |
| `/api/v1/projects`                 | GET    | Listar proyectos (paginado)     | RF-01 |
| `/api/v1/projects/{id}/submit`     | POST   | Enviar proyecto para evaluación | RF-02 |
| `/api/v1/projects/{id}/archive`    | POST   | Archivar proyecto (soft delete) | RF-01 |
| `/api/v1/projects/{id}/reactivate` | POST   | Reactivar proyecto archivado    | RF-01 |
| `/api/v1/projects/stats`           | GET    | Estadísticas de proyectos       | RF-12 |

### **📊 Evaluation Controller (10 endpoints)**

| Endpoint                            | Método | Descripción                     | RF    |
| ----------------------------------- | ------ | ------------------------------- | ----- |
| `/api/v1/evaluations`               | POST   | Crear evaluación                | RF-08 |
| `/api/v1/evaluations/{id}`          | GET    | Obtener evaluación específica   | RF-08 |
| `/api/v1/evaluations/{id}`          | PUT    | Actualizar evaluación           | RF-08 |
| `/api/v1/evaluations`               | GET    | Listar evaluaciones (filtros)   | RF-08 |
| `/api/v1/evaluations/{id}/submit`   | POST   | Enviar evaluación para revisión | RF-08 |
| `/api/v1/evaluations/{id}/approve`  | POST   | Aprobar evaluación              | RF-11 |
| `/api/v1/evaluations/{id}/reject`   | POST   | Rechazar evaluación             | RF-11 |
| `/api/v1/evaluations/{id}/scores`   | POST   | Registrar puntuaciones          | RF-09 |
| `/api/v1/evaluations/{id}/feedback` | POST   | Agregar retroalimentación       | RF-10 |
| `/api/v1/evaluations/stats`         | GET    | Estadísticas de evaluaciones    | RF-12 |

### **✅ Criterion Controller (9 endpoints)**

| Endpoint                                    | Método | Descripción                  | RF    |
| ------------------------------------------- | ------ | ---------------------------- | ----- |
| `/api/v1/criteria`                          | POST   | Crear criterio de evaluación | RF-13 |
| `/api/v1/criteria/{id}`                     | GET    | Obtener criterio específico  | RF-13 |
| `/api/v1/criteria`                          | GET    | Listar criterios (filtros)   | RF-13 |
| `/api/v1/criteria/{id}/submit-for-approval` | POST   | Enviar para aprobación       | RF-13 |
| `/api/v1/criteria/{id}/approve`             | POST   | Aprobar criterio             | RF-13 |
| `/api/v1/criteria/{id}/reject`              | POST   | Rechazar criterio            | RF-13 |
| `/api/v1/criteria/{id}/history`             | GET    | Historial de cambios         | RF-13 |
| `/api/v1/criteria/{id}/deactivate`          | POST   | Desactivar criterio          | RF-13 |
| `/api/v1/criteria/stats/summary`            | GET    | Estadísticas de criterios    | RF-13 |

### **👥 Stakeholder Controller (14 endpoints)**

| Endpoint                                            | Método | Descripción                      | RF    |
| --------------------------------------------------- | ------ | -------------------------------- | ----- |
| `/api/v1/stakeholders`                              | POST   | Registrar stakeholder            | RF-06 |
| `/api/v1/stakeholders/{id}`                         | GET    | Obtener stakeholder              | RF-06 |
| `/api/v1/stakeholders/{id}`                         | PATCH  | Actualizar stakeholder           | RF-06 |
| `/api/v1/stakeholders`                              | GET    | Listar stakeholders              | RF-06 |
| `/api/v1/stakeholders/{id}/document-expectations`   | POST   | Documentar expectativas          | RF-06 |
| `/api/v1/stakeholders/{id}/acknowledge-limitations` | POST   | Reconocer limitaciones           | RF-07 |
| `/api/v1/stakeholders/{id}/establish-communication` | POST   | Establecer canal de comunicación | RF-06 |
| `/api/v1/stakeholders/{id}/scope-change-request`    | POST   | Solicitar cambio de alcance      | RF-07 |
| `/api/v1/stakeholders/{id}/suspend`                 | POST   | Suspender stakeholder            | RF-06 |
| `/api/v1/stakeholders/{id}/reactivate`              | POST   | Reactivar stakeholder            | RF-06 |
| `/api/v1/stakeholders/{id}/collaboration-readiness` | GET    | Evaluación de colaboración       | RF-06 |
| `/api/v1/stakeholders/stats/summary`                | GET    | Estadísticas stakeholders        | RF-06 |
| `/health`                                           | GET    | Health check del servicio        | -     |
| `/`                                                 | GET    | Información del servicio         | -     |

---

## 🔍 **MONITOREO Y RENDIMIENTO**

### **Consultas de Monitoreo:**

#### **1. Estadísticas de Tablas**

```sql
SELECT
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    seq_scan as table_scans,
    idx_scan as index_scans,
    seq_tup_read / NULLIF(seq_scan, 0) as avg_seq_read
FROM pg_stat_user_tables
WHERE schemaname = 'projectevalservice_schema';
```

#### **2. Índices Más Utilizados**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as usage_count,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'projectevalservice_schema'
ORDER BY idx_scan DESC;
```

#### **3. Consultas Lentas (si pg_stat_statements está habilitado)**

```sql
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE query LIKE '%projectevalservice_schema%'
ORDER BY mean_time DESC
LIMIT 10;
```

### **Alertas de Rendimiento:**

- Más de 1000 sequential scans por hora
- Queries con mean_time > 100ms
- Índices no utilizados (idx_scan = 0)
- Tablas con más de 10% de updates vs selects

---

## 🧪 **TESTING Y VALIDACIÓN**

### **Tests de Integración con Otros Stacks:**

```bash
# Test de conectividad con UserService
curl -X GET http://localhost:8001/api/v1/users/health

# Test de conectividad con ScheduleService
curl -X GET http://localhost:8002/api/v1/schedules/health

# Test de ProjectEval Service
curl -X GET http://localhost:8007/api/v1/health
```

### **Tests de Base de Datos:**

```bash
# Verificar permisos granulares
./scripts/test_permissions.sh

# Test de rendimiento de consultas
./scripts/performance_test.sh

# Verificar integridad referencial
./scripts/integrity_check.sh
```

---

## 🔧 **DESARROLLO**

### **Estructura de Comandos:**

```bash
# Desarrollo
make dev                    # Iniciar en modo desarrollo
make test                   # Ejecutar tests
make lint                   # Verificar código
make format                 # Formatear código

# Base de Datos
make db-up                  # Iniciar PostgreSQL
make db-migrate            # Ejecutar migraciones
make db-downgrade          # Hacer rollback
make db-reset              # Reiniciar DB completa

# Producción
make build                  # Construir imagen Docker
make deploy                # Desplegar servicio
```

---

## 🧪 **TESTING**

### **Suite de Tests Completa (62 tests)**

| Archivo                         | Tests  | Tipo        | Cobertura             |
| ------------------------------- | ------ | ----------- | --------------------- |
| `test_stakeholder_use_cases.py` | 22     | Unitario    | Use cases stakeholder |
| `test_criteria_use_cases.py`    | 14     | Unitario    | Use cases criterios   |
| `test_stakeholder_api.py`       | 12     | Integración | Endpoints stakeholder |
| `test_criteria_api.py`          | 14     | Integración | Endpoints criterios   |
| **Total**                       | **62** | -           | -                     |

### **Ejecutar Tests**

```bash
# Tests unitarios
pytest tests/unit/ -v

# Tests de integración (requiere DB)
pytest tests/integration/ -v

# Cobertura completa
pytest --cov=app --cov-report=html tests/

# Tests específicos
pytest tests/unit/test_stakeholder_use_cases.py -v
pytest tests/unit/test_criteria_use_cases.py -v
```

### **Fixtures Disponibles**

- `mock_stakeholder_repository` - Repositorio mock para stakeholders
- `mock_criterion_repository` - Repositorio mock para criterios
- `sample_stakeholder` - Stakeholder de prueba
- `sample_criterion` - Criterio de evaluación de prueba
- `async_client` - Cliente HTTP async para tests API

### **Tests de API**

```bash
# Funcionalidades CRUD
pytest tests/api/test_criteria_crud.py -v

# Notas de voz
pytest tests/api/test_voice_notes.py -v

# Evaluaciones
pytest tests/api/test_evaluations.py -v
```

---

## 🗄️ **BASE DE DATOS**

### **Esquema Principal**

- `evaluation_criteria` - Criterios de evaluación versionados
- `project_ideas` - Ideas propuestas por grupos
- `evaluation_sessions` - Sesiones de seguimiento
- `voice_notes` - Grabaciones de evaluadores
- `transcriptions` - Transcripciones automáticas
- `evaluation_results` - Resultados de evaluaciones

### **Migraciones**

```bash
# Crear nueva migración
alembic revision --autogenerate -m "descripcion_del_cambio"

# Aplicar migraciones
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 📊 **MONITOREO**

### **Health Checks**

- `GET /health` - Estado del servicio
- `GET /health/db` - Conexión a base de datos
- `GET /health/external` - Servicios externos

### **Métricas**

- Tiempo de respuesta por endpoint
- % éxito en transcripciones
- Uso de almacenamiento de notas de voz
- Tiempo de procesamiento de IA

---

## 🎯 **CARACTERÍSTICAS ÚNICAS FastAPI**

- ✅ **Async/await nativo** para procesamiento concurrente
- ✅ **Pydantic validation** automática de criterios y schemas
- ✅ **OpenAPI docs** automáticos en `/docs`
- ✅ **Type hints** completos para domain entities
- ✅ **Background tasks** para procesamiento asíncrono
- ✅ **Dependency injection** para Clean Architecture
- ✅ **Tests completos** 62/62 passing

---

## 📊 **REQUERIMIENTOS FUNCIONALES IMPLEMENTADOS**

| RF    | Descripción                         | Estado |
| ----- | ----------------------------------- | ------ |
| RF-01 | Registrar Proyecto Productivo       | ✅     |
| RF-02 | Asignar Proyecto a Ficha            | ✅     |
| RF-06 | Gestión de Stakeholders             | ✅     |
| RF-07 | Documentar Limitaciones             | ✅     |
| RF-08 | Crear Evaluación de Proyecto        | ✅     |
| RF-09 | Registrar Puntuaciones por Criterio | ✅     |
| RF-10 | Calcular Calificación Final         | ✅     |
| RF-11 | Aprobar/Rechazar Evaluación         | ✅     |
| RF-12 | Generar Reportes de Evaluación      | ✅     |
| RF-13 | Gestión de Criterios de Evaluación  | ✅     |

---

## 🔄 **INTEGRACIÓN MULTISTACK**

Este servicio implementa las mismas historias de usuario que los otros stacks:

- **02-go**: Mismo esquema de BD, performance optimizada
- **03-express**: Mismo esquema, ecosistema NPM
- **04-nextjs**: API Routes optimizadas para edge
- **05-java**: Spring Boot con JPA
- **06-kotlin**: Spring Boot con Coroutines

---

**ProjectEval Service - El corazón del proceso formativo ADSO/PSW**  
**Versión:** 1.0 | **Fecha:** Enero 2026  
**Estado:** ✅ 100% Documentado | ✅ 100% Implementado | ✅ 62 Tests Passing  
**Preparado para:** 168 criterios sistematizados + IA + DevOps completo
