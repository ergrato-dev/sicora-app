# 📚 KbService - Servicio de Base de Conocimiento

> **Estado:** ✅ 100% Funcional | **Tests:** 37/37 ✅ | **Endpoints:** 22

## 📋 Descripción

KbService es el microservicio de Base de Conocimiento para el Sistema de Información de Coordinación Académica (SICORA). Proporciona gestión completa de contenido educativo, búsqueda semántica con IA, y soporte para procesamiento de documentos PDF.

## 🏗️ Arquitectura

```
kbservice/
├── main.py                          # Punto de entrada FastAPI
├── app/
│   ├── config.py                    # Configuración del servicio
│   ├── dependencies.py              # Inyección de dependencias
│   ├── presentation/
│   │   ├── routers/
│   │   │   ├── kb_router.py         # CRUD Knowledge Base (389 líneas)
│   │   │   ├── search_router.py     # Búsqueda y consultas (238 líneas)
│   │   │   ├── admin_router.py      # Endpoints administrativos
│   │   │   └── pdf_router.py        # Procesamiento PDF (252 líneas)
│   │   └── schemas/
│   │       └── kb_schemas.py        # Schemas Pydantic (523 líneas)
│   ├── application/
│   │   └── use_cases/
│   │       └── kb_use_cases.py      # Casos de uso (566 líneas)
│   ├── domain/
│   │   ├── entities/
│   │   │   └── kb_entities.py       # Entidades de dominio
│   │   ├── repositories/
│   │   │   └── kb_repositories.py   # Interfaces de repositorios
│   │   ├── services/
│   │   │   └── kb_domain_services.py
│   │   ├── value_objects/
│   │   │   └── kb_value_objects.py
│   │   └── exceptions/
│   │       └── kb_exceptions.py     # Excepciones personalizadas
│   └── infrastructure/
│       ├── config/
│       │   └── database.py          # Configuración SQLAlchemy async
│       ├── models/
│       │   └── kb_models.py         # Modelos ORM
│       ├── repositories/
│       │   └── kb_repositories_impl.py
│       ├── services/
│       │   └── kb_services_impl.py  # Servicios (embeddings, búsqueda)
│       └── pdf_processing.py        # Procesamiento de PDFs
└── tests/
    ├── unit/                        # 30 tests unitarios
    │   ├── test_knowledge_item_entity.py
    │   ├── test_hybrid_search_service.py
    │   └── test_openai_embedding_service.py
    └── integration/                 # 7 tests de integración
        └── test_kb_api.py
```

## 🔌 Endpoints API

### Knowledge Base CRUD

| Método   | Endpoint                            | Descripción                | Auth  |
| -------- | ----------------------------------- | -------------------------- | ----- |
| `POST`   | `/api/v1/kb/items`                  | Crear item de conocimiento | Admin |
| `GET`    | `/api/v1/kb/items`                  | Listar items               | ✅    |
| `GET`    | `/api/v1/kb/items/{id}`             | Obtener item por ID        | ✅    |
| `PUT`    | `/api/v1/kb/items/{id}`             | Actualizar item            | Admin |
| `DELETE` | `/api/v1/kb/items/{id}`             | Eliminar item              | Admin |
| `POST`   | `/api/v1/kb/feedback`               | Enviar feedback            | ✅    |
| `GET`    | `/api/v1/kb/items/{id}/suggestions` | Obtener sugerencias        | ✅    |
| `GET`    | `/api/v1/kb/categories`             | Listar categorías          | ✅    |

### Búsqueda y Consultas

| Método | Endpoint                 | Descripción                          | Auth |
| ------ | ------------------------ | ------------------------------------ | ---- |
| `POST` | `/api/v1/kb/search`      | Búsqueda híbrida (texto + semántica) | ✅   |
| `POST` | `/api/v1/kb/query`       | Consulta inteligente con IA          | ✅   |
| `GET`  | `/api/v1/kb/suggestions` | Sugerencias de búsqueda              | ✅   |

### Procesamiento PDF

| Método | Endpoint                          | Descripción           | Auth  |
| ------ | --------------------------------- | --------------------- | ----- |
| `POST` | `/api/v1/pdf/upload-pdf`          | Subir y procesar PDF  | Admin |
| `POST` | `/api/v1/pdf/batch-upload-pdf`    | Subir múltiples PDFs  | Admin |
| `GET`  | `/api/v1/pdf/pdf-processing-info` | Info de procesamiento | ✅    |

### Administración

| Método | Endpoint                   | Descripción           | Auth  |
| ------ | -------------------------- | --------------------- | ----- |
| `GET`  | `/api/v1/kb/admin/health`  | Estado del servicio   | Admin |
| `GET`  | `/api/v1/kb/admin/metrics` | Métricas del servicio | Admin |

### Sistema

| Método | Endpoint        | Descripción           |
| ------ | --------------- | --------------------- |
| `GET`  | `/`             | Info del servicio     |
| `GET`  | `/health`       | Health check          |
| `GET`  | `/docs`         | Documentación Swagger |
| `GET`  | `/redoc`        | Documentación ReDoc   |
| `GET`  | `/openapi.json` | Schema OpenAPI        |

## 🔧 Configuración

### Variables de Entorno

```bash
# Base de datos
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/sicora_kb

# OpenAI (para embeddings semánticos)
OPENAI_API_KEY=sk-xxx  # Opcional, usa mock si no está configurado
OPENAI_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# Servicio
SERVICE_PORT=8006
LOG_LEVEL=INFO
```

### Archivo `.env.example`

```bash
cp .env.example .env
# Editar .env con tus valores
```

## 🚀 Ejecución

### Desarrollo

```bash
cd sicora-be-python/kbservice
source ../.venv/bin/activate
uvicorn main:app --port 8006 --reload
```

### Docker

```bash
docker compose -f docker-compose.dev.yml up kbservice
```

### Tests

```bash
# Todos los tests
python -m pytest tests/ -v

# Solo unitarios
python -m pytest tests/unit/ -v

# Con cobertura
python -m pytest tests/ --cov=app --cov-report=html
```

## 📦 Dependencias Principales

| Paquete                           | Uso                     |
| --------------------------------- | ----------------------- |
| `fastapi`                         | Framework web async     |
| `uvicorn`                         | Servidor ASGI           |
| `sqlalchemy[asyncio]`             | ORM async               |
| `asyncpg`                         | Driver PostgreSQL async |
| `pydantic`                        | Validación de datos     |
| `openai`                          | Embeddings y IA         |
| `PyPDF2`, `pdfplumber`, `PyMuPDF` | Procesamiento PDF       |
| `pytesseract`                     | OCR                     |
| `python-magic`                    | Detección MIME          |
| `numpy`                           | Operaciones vectoriales |

## 🔐 Autenticación

El servicio utiliza JWT Bearer tokens. Los endpoints protegidos requieren:

```http
Authorization: Bearer <token>
```

### Roles

- **admin**: Acceso completo (CRUD, métricas, PDF upload)
- **instructor**: Lectura + búsqueda
- **student**: Solo lectura de contenido publicado

## 📊 Entidades de Dominio

### KnowledgeItem

```python
class KnowledgeItem:
    id: UUID
    title: str
    content: str
    content_type: ContentType  # article, faq, guide, procedure, tutorial, policy
    category: str
    target_audience: TargetAudience  # all, admin, instructor, student
    status: ContentStatus  # draft, published, archived, under_review
    tags: List[str]
    embedding: Vector  # 1536 dimensiones
    author_id: UUID
    view_count: int
    helpful_count: int
    unhelpful_count: int
    created_at: datetime
    updated_at: datetime
```

### Métodos de Dominio

- `is_accessible_by(role)`: Verifica si el contenido es accesible
- `can_be_edited_by(user_id, role)`: Verifica permisos de edición
- `increment_view_count()`: Incrementa contador de vistas
- `add_helpful_feedback()`: Registra feedback positivo

## 🔍 Búsqueda

### Tipos de Búsqueda

1. **Texto**: Búsqueda tradicional por palabras clave
2. **Semántica**: Búsqueda por similitud de embeddings
3. **Híbrida**: Combinación de texto + semántica (recomendado)

### Ejemplo de Búsqueda

```json
POST /api/v1/kb/search
{
  "query": "cómo registrar asistencia",
  "search_type": "hybrid",
  "limit": 10,
  "filters": {
    "category": "asistencia",
    "status": "published"
  }
}
```

## 📈 Métricas

El endpoint `/api/v1/kb/admin/metrics` proporciona:

- Total de items
- Items por categoría
- Items por estado
- Búsquedas recientes
- Feedback promedio

## 🧪 Cobertura de Tests

| Módulo                 | Tests  | Estado |
| ---------------------- | ------ | ------ |
| Entidades de dominio   | 10     | ✅     |
| Servicios de búsqueda  | 10     | ✅     |
| Servicio de embeddings | 10     | ✅     |
| Integración API        | 7      | ✅     |
| **Total**              | **37** | **✅** |

## 📝 Changelog

### v1.0.0 (Enero 2026)

- ✅ Implementación completa de Clean Architecture
- ✅ 22 endpoints funcionales
- ✅ Búsqueda híbrida (texto + semántica)
- ✅ Procesamiento de PDFs con OCR
- ✅ Sistema de feedback
- ✅ Integración OpenAI embeddings (con modo mock)
- ✅ 37 tests pasando
- ✅ Documentación completa

---

**Servicio:** KbService  
**Puerto:** 8006  
**Stack:** Python 3.14 + FastAPI + SQLAlchemy Async  
**Proyecto:** SICORA - Sistema de Información de Coordinación Académica
