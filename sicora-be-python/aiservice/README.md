# AIService - Servicio de Inteligencia Artificial SICORA

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/Tests-52%20passed-brightgreen.svg)](tests/)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](tests/)

## 📋 Descripción

AIService es el microservicio de Inteligencia Artificial del sistema SICORA (Sistema de Información de Coordinación Académica). Proporciona capacidades de chat mejorado con integración a la base de conocimiento (KbService) para responder consultas de estudiantes, instructores y administrativos.

## 🏗️ Arquitectura

```
aiservice/
├── main.py                          # Entry point FastAPI
├── app/
│   ├── __init__.py
│   ├── config.py                    # Configuración global
│   ├── dependencies.py              # Inyección de dependencias
│   ├── application/
│   │   ├── dtos/                    # Data Transfer Objects
│   │   │   └── ai_dtos.py
│   │   ├── services/                # Servicios de aplicación
│   │   │   └── enhanced_chat_service.py
│   │   └── use_cases/               # Casos de uso
│   ├── domain/
│   │   ├── entities/                # Entidades de dominio
│   │   └── exceptions/              # Excepciones personalizadas
│   │       └── ai_exceptions.py
│   ├── infrastructure/
│   │   ├── adapters/                # Adaptadores de IA (OpenAI, Anthropic, HuggingFace)
│   │   ├── config/                  # Configuración de infraestructura
│   │   ├── external/                # Clientes externos
│   │   │   └── simple_openai_client.py
│   │   ├── integrations/            # Integraciones con otros servicios
│   │   │   └── kb_integration.py
│   │   └── models/                  # Modelos SQLAlchemy
│   └── presentation/
│       ├── routers/                 # Routers FastAPI
│       │   └── enhanced_chat_router_simple.py
│       └── schemas/                 # Schemas Pydantic
│           └── chat_schemas.py
├── tests/
│   ├── conftest.py                  # Fixtures compartidos
│   ├── unit/                        # Tests unitarios
│   │   ├── test_simple_openai_client.py
│   │   ├── test_enhanced_chat_service.py
│   │   └── test_kb_integration.py
│   └── integration/                 # Tests de integración
│       └── test_chat_api.py
└── venv/                            # Entorno virtual
```

## 🚀 Endpoints API

### Chat Mejorado

| Método | Endpoint                    | Descripción             |
| ------ | --------------------------- | ----------------------- |
| POST   | `/api/v1/chat/enhanced`     | Chat con contexto de KB |
| POST   | `/api/v1/chat/quick-answer` | Respuestas rápidas FAQ  |
| POST   | `/api/v1/chat/search`       | Búsqueda en KB          |
| GET    | `/api/v1/chat/health`       | Health check del chat   |

### Endpoints Base

| Método | Endpoint        | Descripción              |
| ------ | --------------- | ------------------------ |
| GET    | `/`             | Información del servicio |
| GET    | `/health`       | Health check general     |
| GET    | `/docs`         | Swagger UI               |
| GET    | `/redoc`        | ReDoc                    |
| GET    | `/openapi.json` | Schema OpenAPI           |

## 📡 Detalles de Endpoints

### POST /api/v1/chat/enhanced

Chat mejorado con integración a la base de conocimiento.

**Request:**

```json
{
  "message": "¿Cuáles son mis derechos como aprendiz?",
  "use_knowledge_base": true,
  "search_categories": ["reglamento"],
  "context_limit": 5,
  "model_name": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**

```json
{
  "message": "Según el Reglamento del Aprendiz...",
  "conversation_id": "uuid",
  "model_used": "gpt-4",
  "tokens_used": 150,
  "processing_time": 0.5,
  "knowledge_sources_used": 2,
  "context_categories": ["reglamento"],
  "timestamp": "2026-01-06T10:00:00Z"
}
```

### POST /api/v1/chat/quick-answer

Respuestas rápidas para preguntas frecuentes.

**Request:**

```json
{
  "question": "¿Cuál es la política de asistencia?",
  "category": "asistencia"
}
```

**Response:**

```json
{
  "answer": "La asistencia es obligatoria...",
  "confidence": 0.95,
  "category": "asistencia",
  "sources": [
    {
      "id": "uuid",
      "title": "Política de Asistencia",
      "type": "faq"
    }
  ]
}
```

### POST /api/v1/chat/search

Búsqueda directa en la base de conocimiento.

**Request:**

```json
{
  "query": "reglamento aprendiz derechos",
  "limit": 5
}
```

**Response:**

```json
{
  "query": "reglamento aprendiz derechos",
  "total_results": 3,
  "results": [
    {
      "id": "uuid",
      "title": "Capítulo 2 - Derechos del Aprendiz",
      "content": "El aprendiz tiene derecho a...",
      "score": 0.95,
      "type": "article",
      "category": "reglamento"
    }
  ]
}
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Servicio
SERVICE_NAME=aiservice
SERVICE_PORT=8007
DEBUG=true

# Base de Datos
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5433/sicora_dev

# OpenAI (opcional - usa mock client si no está configurado)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# KbService
KB_SERVICE_URL=http://kbservice:8006/api/v1
KB_SERVICE_TIMEOUT=30

# Redis (opcional - para caché)
REDIS_URL=redis://localhost:6379
```

### Archivo .env.example

```bash
cp .env.example .env
# Editar .env con configuración local
```

## 🔧 Desarrollo

### Crear entorno virtual

```bash
cd sicora-be-python/aiservice
python3 -m venv venv
source venv/bin/activate
```

### Instalar dependencias

```bash
pip install -r requirements.txt
```

### Ejecutar servidor

```bash
# Desarrollo
uvicorn main:app --reload --port 8007

# Producción
uvicorn main:app --host 0.0.0.0 --port 8007 --workers 4
```

### Ejecutar tests

```bash
# Todos los tests
python -m pytest tests/ -v

# Solo tests unitarios
python -m pytest tests/unit/ -v

# Solo tests de integración
python -m pytest tests/integration/ -v

# Con cobertura
python -m pytest tests/ --cov=app --cov-report=html
```

## 🐳 Docker

### Build

```bash
docker build -t sicora-aiservice:latest .
```

### Run

```bash
docker run -d \
    --name aiservice \
    -p 8007:8007 \
    -e DATABASE_URL=postgresql+asyncpg://... \
    -e KB_SERVICE_URL=http://kbservice:8006/api/v1 \
    sicora-aiservice:latest
```

### Docker Compose

```bash
docker compose up -d aiservice
```

## 🧪 Tests

El servicio cuenta con **52 tests** organizados en:

### Tests Unitarios (36 tests)

- `test_simple_openai_client.py` - 11 tests

  - Inicialización del cliente mock
  - Chat completion con diferentes parámetros
  - Manejo de keywords especiales
  - Tokens y uso
  - Disponibilidad

- `test_enhanced_chat_service.py` - 16 tests

  - Generación de respuestas con/sin KB
  - Construcción de prompts contextuales
  - Búsqueda regulatoria con caché
  - Respuestas rápidas
  - Health checks

- `test_kb_integration.py` - 9 tests
  - Búsqueda de conocimiento
  - Filtros por categoría
  - Manejo de errores
  - Health checks

### Tests de Integración (16 tests)

- `test_chat_api.py` - 16 tests
  - Endpoints root y health
  - Validación de schemas
  - Estructura de rutas API
  - OpenAPI spec

## 📊 Integración con KbService

AIService se comunica con KbService para:

1. **Búsqueda de conocimiento** - Obtiene contexto relevante
2. **Respuestas FAQ** - Busca respuestas predefinidas
3. **Contexto regulatorio** - Acceso al Reglamento del Aprendiz

```
┌──────────────┐     HTTP     ┌──────────────┐
│  AIService   │◄────────────►│  KbService   │
│   :8007      │   /api/v1    │    :8006     │
└──────────────┘              └──────────────┘
       │
       │ Mock Client
       ▼
┌──────────────┐
│SimpleOpenAI  │
│   Client     │
└──────────────┘
```

## 🔐 Seguridad

- Autenticación via JWT (integrado con AuthService)
- Validación de esquemas con Pydantic
- Sanitización de inputs
- Rate limiting (configurable)

## 📈 Monitoreo

- Health check endpoints
- Logging estructurado
- Métricas de uso de tokens
- Tiempos de procesamiento

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es parte del sistema SICORA de OneVision.

---

**AIService** - Microservicio de IA para SICORA | Puerto: 8007
