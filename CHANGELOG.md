# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Sin publicar]

### Añadido

- Sistema completo de templates para issues y pull requests
- Código de conducta para la comunidad
- Documentación open source completa
- 11 diagramas SVG educativos organizados por categorías
- Estructura de assets organizada por tipo de contenido
- Scripts automáticos de diagnóstico Docker
- Configuración Git progresiva (mínima a estricta)
- Servidor MCP completamente funcional
- 389 endpoints de API distribuidos entre Go y Python
- ProjectEvalService Python completado al 100% (41 endpoints, 62 tests)
- SVG de arquitectura para ProjectEvalService

### Cambiado

- **PostgreSQL 18 como versión unificada** para toda la infraestructura SICORA
- Todos los docker-compose actualizados a `postgres:18-alpine`
- CI/CD workflows actualizados para usar PostgreSQL 18
- Scripts de enforcement renombrados a `enforce-postgresql18.sh`
- **Python 3.14+ como versión mínima requerida** para sicora-be-python
- Todos los Dockerfiles Python actualizados a `python:3.14-slim`
- pyproject.toml actualizado con `requires-python = ">=3.14"`
- Herramientas (black, isort, mypy) configuradas para Python 3.14
- requirements.txt con versiones flexibles (`>=`) para mejor compatibilidad
- Dataclasses corregidos para compatibilidad Python 3.14 (orden de campos)
- Migración completa de SENA a OneVision branding
- Reorganización de documentación en estructura `_docs/`
- Mejora en la organización de assets con subcarpetas temáticas
- Actualización de todos los README con nuevos diagramas SVG

### Reparado

- Problemas de red Docker con scripts automáticos de reparación
- Conflictos de puertos PostgreSQL (5432 → 5433)
- Referencias rotas en documentación
- Configuración de MongoDB en Docker Compose

## [1.0.0] - 2025-08-03

### Añadido

#### Frontend (sicora-app-fe)

- ✅ Aplicación React 18 con TypeScript completamente funcional
- ✅ Sistema de autenticación JWT con refresh tokens
- ✅ CRUD completo de usuarios con roles y permisos
- ✅ Interface moderna con TailwindCSS
- ✅ Panel de pruebas de integración automatizado
- ✅ Manejo de errores y validación de formularios
- ✅ Navegación protegida por roles
- ✅ Tests de integración con backend

#### Backend Go (sicora-be-go)

- ✅ 8 microservicios completamente implementados:

  - **UserService** (8001): Gestión de usuarios y autenticación
  - **ScheduleService** (8002): Gestión de horarios académicos
  - **AttendanceService** (8003): Control de asistencia
  - **KbService** (8004): Base de conocimientos
  - **EvalInService** (8005): Evaluaciones y calificaciones
  - **MevalService** (8006): Métricas de evaluación
  - **SoftwareFactoryService** (8007): Gestión de proyectos
  - **ProjectEvalService** (8008): Evaluación de proyectos

- ✅ Clean Architecture implementada
- ✅ Documentación Swagger automática
- ✅ Middleware de autenticación y autorización
- ✅ Conexión PostgreSQL con GORM
- ✅ Health checks y métricas
- ✅ Docker containerización completa

#### Backend Python (sicora-be-python)

- ✅ 7 microservicios implementados:

  - **API Gateway** (8101): Enrutamiento y balanceeo
  - **UserService** (8102): Gestión de usuarios Python
  - **EvalInService** (8103): Evaluaciones Python
  - **ProjectEvalService** (8104): Evaluación de proyectos
  - **SoftwareFactoryService** (8105): Fábrica de software
  - **NotificationService** (8106): Sistema de notificaciones
  - **AnalyticsService** (8107): Analytics y reportes

- ✅ FastAPI con documentación automática
- ✅ SQLAlchemy ORM
- ✅ Sistema de autenticación integrado
- ✅ Validación con Pydantic
- ✅ Tests automatizados

#### Infraestructura (sicora-infra)

- ✅ Docker Compose para desarrollo local
- ✅ PostgreSQL (puerto 5433) configurado
- ✅ MongoDB (puerto 27017) configurado
- ✅ Redis para caché y sesiones
- ✅ Scripts de inicialización de base de datos
- ✅ Configuración de red Docker robusta
- ✅ Health checks automáticos

#### MCP Server (sicora-mcp-server)

- ✅ Servidor MCP completamente funcional (puerto 3000)
- ✅ Herramientas de análisis del proyecto
- ✅ Generación automática de componentes
- ✅ Verificación de estado de integración
- ✅ Ejecución de tests automatizada
- ✅ Actualización de documentación automática
- ✅ Integración con VS Code

#### Documentación

- ✅ Documentación completa en estructura `_docs/`
- ✅ 11 diagramas SVG educativos
- ✅ Guías de instalación y configuración
- ✅ Documentación de arquitectura
- ✅ Tutoriales paso a paso
- ✅ Guías de resolución de problemas

#### Scripts y Herramientas

- ✅ Scripts de diagnóstico Docker automático
- ✅ Scripts de reparación de red
- ✅ Health checks de servicios
- ✅ Configuración Git progresiva
- ✅ Backup automático de documentación
- ✅ Validación de estructura de proyecto

### Características Técnicas

#### Seguridad

- ✅ Autenticación JWT segura
- ✅ Refresh tokens automáticos
- ✅ Middleware de autorización
- ✅ Validación de datos en todas las capas
- ✅ Headers de seguridad configurados
- ✅ Protección CORS

#### Performance

- ✅ Conexiones de base de datos optimizadas
- ✅ Caché Redis implementado
- ✅ Lazy loading en frontend
- ✅ Consultas optimizadas
- ✅ Build optimizado con Vite

#### Calidad de Código

- ✅ ESLint y Prettier configurados
- ✅ gofmt y golint para Go
- ✅ Tests automatizados
- ✅ Cobertura de código
- ✅ Conventional Commits
- ✅ CI/CD pipelines

#### Observabilidad

- ✅ Logs estructurados
- ✅ Health checks en todos los servicios
- ✅ Métricas de rendimiento
- ✅ Monitoreo de errores
- ✅ Dashboard de estado del sistema

### Migración y Compatibilidad

#### De SENA a OneVision

- ✅ Todos los dominios y referencias actualizadas
- ✅ Branding completamente migrado
- ✅ Logos y assets actualizados
- ✅ Documentación actualizada

#### Estructura de Proyecto

- ✅ Organización modular por microservicios
- ✅ Separación clara de responsabilidades
- ✅ Configuración centralizada
- ✅ Assets organizados por categorías

---

## Política de Versionado

Este proyecto utiliza [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nueva funcionalidad compatible hacia atrás
- **PATCH**: Corrección de bugs compatible hacia atrás

## Tipos de Cambios

- **Añadido**: para nuevas características
- **Cambiado**: para cambios en funcionalidad existente
- **Depreciado**: para características que serán removidas próximamente
- **Removido**: para características removidas
- **Reparado**: para corrección de bugs
- **Seguridad**: para vulnerabilidades de seguridad

---

**SICORA** - Sistema Integral de Control de Recursos Académicos
Desarrollado con ❤️ por OneVision Open Source
