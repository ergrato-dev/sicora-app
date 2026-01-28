![SICORA - Sistema de Información de Coordinación Académica](./assets/banner-sicora.svg)

<div align="center">

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)](https://golang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📊 Backend API Statistics

> Last updated: 2025-07-04

- **Total Endpoints**: **389**
- **Go Backend**: 237 endpoints (8 services)
- **Python Backend**: 152 endpoints (7 services + API Gateway)

### Service Distribution:

- **SoftwareFactoryService (Go)**: 58 endpoints
- **EvalInService (Go)**: 42 endpoints
- **KbService (Go)**: 32 endpoints
- **UserService (Go)**: 31 endpoints
- **ScheduleService (Go)**: 28 endpoints
- **AttendanceService (Go)**: 25 endpoints
- **MevalService (Go)**: 18 endpoints
- **API Gateway (Python)**: 49 endpoints
- **EvalInService (Python)**: 28 endpoints
- **UserService (Python)**: 28 endpoints

📋 [Ver conteo completo](./_docs/reportes/CONTEO_ENDPOINTS_BACKEND_SICORA.md)

## 🏗️ Arquitectura del Sistema

![Arquitectura SICORA](./assets/arquitectura/arquitectura-sistema-sicora.svg)

_Diagrama de la arquitectura completa del sistema SICORA mostrando las capas de presentación, API Gateway, servicios backend, persistencia e infraestructura._

### Microservicios Detallados

![Microservicios SICORA](./assets/arquitectura/microservicios-sicora.svg)

_Vista detallada de la arquitectura de microservicios con tecnologías específicas, puertos y conexiones entre servicios._

## 📋 Estructura del Proyecto

```
sicora-app/
├── sicora-app-fe-next/      # Frontend Next.js 15 + TypeScript (PRINCIPAL)
├── sicora-be-go/            # Backend en Go (microservicios)
├── sicora-be-python/        # Backend en Python (AI & Analytics)
├── sicora-infra/            # Infraestructura y despliegue (Docker)
├── sicora-mcp-server/       # Servidor MCP para desarrollo asistido por IA
├── sicora-data-loader/      # Carga de datos de prueba
├── sicora-docs/             # Documentación del proyecto
├── _docs/                   # Documentación organizada por categorías
├── assets/                  # Assets visuales (logos, diagramas, SVGs)
├── scripts/                 # Scripts de automatización
└── postman-collections/     # Colecciones Postman para testing
```

## 🚀 Estado del Proyecto

### ✅ Frontend (React + TypeScript)

- **Framework**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + Componentes personalizados
- **Estado**: Zustand para gestión de estado
- **Integración**: API REST con backend Go
- **Autenticación**: JWT con refresh automático
- **Estado**: **COMPLETADO Y FUNCIONAL**

### ✅ Backend Go (UserService)

- **Framework**: Gin + Clean Architecture
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT + Refresh tokens
- **API**: REST con documentación Swagger
- **Puerto**: 8002
- **Estado**: **COMPLETADO Y FUNCIONAL**

### 🔄 Integración Frontend-Backend

- **Autenticación**: Completada ✅
- **CRUD Usuarios**: Completado ✅
- **Gestión de sesiones**: Completada ✅
- **Manejo de errores**: Completado ✅
- **Pruebas de integración**: Completadas ✅
- **Estado**: **INTEGRACIÓN COMPLETADA**

![Flujo de Datos SICORA](./assets/flujos/flujo-datos-sicora.svg)

_Diagrama del flujo de procesamiento de datos desde la entrada hasta las salidas del sistema, mostrando validación, servicios específicos y almacenamiento._

### 🤖 Servidor MCP (Model Context Protocol)

- **Herramientas**: Análisis, generación de código, integración, pruebas
- **Tecnología**: TypeScript + Node.js
- **Gestor de paquetes**: pnpm
- **Integración**: VS Code + MCP Protocol
- **Estado**: **COMPLETADO Y FUNCIONAL**

![Conceptos MCP SICORA](./assets/educativos/conceptos-mcp-sicora.svg)

_Diagrama educativo explicando qué es MCP, su arquitectura, beneficios y implementación específica en SICORA._

## 🛠️ Tecnologías Utilizadas

### Frontend

- **Next.js 15** + TypeScript (App Router)
- **React 18** con Server Components
- **Tailwind CSS** + **shadcn/ui** (componentes)
- **Zustand** (estado global)
- **Axios** (HTTP client)
- **Sistema de Loading Global** (PageLoadingBar + GlobalLoadingOverlay)
- **Vitest** + **Playwright** (testing)

### Backend Go

- Go 1.21+
- Gin (framework web)
- GORM (ORM)
- PostgreSQL (base de datos)
- JWT (autenticación)
- Docker (containerización)
- Swagger/OpenAPI (documentación)

### Backend Python

- **FastAPI** (framework async)
- **SQLAlchemy** (ORM)
- **Pydantic** (validación)
- **Uvicorn** (ASGI server)
- **Pytest** (testing)

### DevOps & Tools

- Docker & Docker Compose
- Git (control de versiones)
- Makefile (automatización)
- **K6** (performance testing)
- **Postman** (API testing)
- **SonarQube** (análisis de código)
- **pnpm** (gestor de paquetes preferido)

### MCP Server (Desarrollo Asistido por IA)

- TypeScript + Node.js
- Model Context Protocol (MCP)
- VS Code Integration
- Herramientas especializadas para SICORA
- pnpm (gestión de dependencias)

## � Documentación

Para documentación detallada, consulta la [documentación organizada](./_docs/):

### 🎯 Cumplimiento Legal (Prioridad Alta)
- [⚖️ **RESUMEN EJECUTIVO**](./_docs/desarrollo/RESUMEN_EJECUTIVO_LEGAL.md) - **80% COMPLETADO** 🟢
  - ✅ 4 Páginas legales implementadas (2,450+ líneas)
  - ✅ Backend API completo (1,400+ líneas Go)
  - ⏳ Integración de rutas (1 hora restante)
  - ⚠️ Pendiente revisión legal por asesor jurídico (BLOQUEANTE)
  - 📊 [Estado de Avance Detallado](./_docs/desarrollo/AVANCE_CUMPLIMIENTO_LEGAL.md)
  - 📖 [Análisis Legal Completo](./_docs/desarrollo/CUMPLIMIENTO_LEGAL_HABEAS_DATA.md)
  - 🔧 [Documentación Backend](./_docs/desarrollo/LEGAL_COMPLIANCE_BACKEND.md)
  - Páginas: [/privacy](./sicora-app-fe-next/src/app/privacy/page.tsx), [/terms](./sicora-app-fe-next/src/app/terms/page.tsx), [/data-treatment](./sicora-app-fe-next/src/app/data-treatment/page.tsx), [/cookies](./sicora-app-fe-next/src/app/cookies/page.tsx)

### 📂 Documentación por Categoría
- [📋 Integración](./_docs/integracion/) - Integración frontend-backend, verificaciones de conectividad
- [🤖 MCP](./_docs/mcp/) - Servidor MCP, guías para principiantes, configuración
- [⚙️ Configuración](./_docs/configuracion/) - Setup de servicios, variables de entorno
- [🔧 Desarrollo](./_docs/desarrollo/) - Guías de desarrollo, estándares de código, sistema de loading
- [📊 Reportes](./_docs/reportes/) - Reportes de estado, análisis, métricas
- [📖 Guías](./_docs/guias/) - Tutoriales, mejores prácticas, casos de uso
- [🏗️ Arquitectura](./_docs/arquitectura/) - Diagramas, patrones, decisiones técnicas
- [🚀 Deployment](./_docs/deployment/) - Estrategias de despliegue, configuraciones de producción
- [📍 Seguimiento](./_docs/seguimiento/) - Tracking de avances, sprints, hitos del proyecto

### Documentación por Componente

### Frontend

- [Setup Frontend Next.js](./sicora-app-fe-next/README.md)
- [Sistema de Loading](./sicora-app-fe-next/LOADING_SYSTEM.md) - Indicadores globales de carga
- [Configuración de Entorno](./sicora-app-fe-next/.env.local)

### Backend Go

- [UserService Documentation](./sicora-be-go/userservice/README.md)
- [API Documentation](./sicora-be-go/userservice/docs/)
- [Setup Guide](./sicora-be-go/userservice/GO-USERSERVICE-SETUP.md)

### Servidor MCP

- [Guía de uso con pnpm](./_docs/mcp/README-pnpm.md)
- [Configuración completada](./_docs/mcp/CONFIGURACION_MCP_PNPM_COMPLETADA.md)
- [Scripts de desarrollo](./sicora-mcp-server/scripts/)

## 🚀 Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd sicora-app
```

### 2. Iniciar Backend Go

```bash
cd sicora-be-go/userservice
./dev.sh
# Backend estará disponible en http://localhost:8002
```

### 3. Iniciar Frontend

```bash
cd sicora-app-fe
npm install  # o pnpm install
npm run dev  # o pnpm dev
# Frontend estará disponible en http://localhost:5173
```

### 4. Verificar Integración

```bash
cd sicora-app-fe
./scripts/verify-backend-integration.sh
```

## 🧪 Pruebas

### Pruebas de Integración Automatizadas

La aplicación incluye un panel de pruebas integrado que permite verificar:

- Conectividad con el backend
- Registro de usuarios
- Autenticación (login/logout)
- Gestión de tokens JWT
- Actualización de perfil

### Ejecución Manual

1. Abrir la aplicación frontend
2. Navegar al panel de pruebas de integración
3. Ejecutar pruebas individuales o completas
4. Revisar logs y resultados

## 📊 Características Implementadas

### ✅ Sistema de Autenticación

- Login con email/password
- Registro de nuevos usuarios
- JWT tokens con refresh automático
- Logout con limpieza de sesión
- Recuperación de contraseña
- Verificación automática de tokens

### ✅ Gestión de Usuarios

- CRUD completo de usuarios
- Perfiles de usuario
- Roles y permisos (admin, coordinador, instructor, aprendiz, directivo)
- Estados de usuario (activo, inactivo, suspendido)
- Operaciones en lote (admin)
- **Dashboard directivo** con indicadores de gestión institucional
  - 📊 Ver [Documentación completa](./_docs/desarrollo/ROL_DIRECTIVO_ESPECIFICACION.md)
  - 🏗️ ![Arquitectura Dashboard](./assets/educativos/dashboard_directivo_arquitectura.svg)

### ✅ Seguridad

- Autenticación JWT segura
- Refresh tokens automáticos
- Middleware de autorización
- Validación de datos
- Headers de seguridad

### ✅ UX/UI

- **Interfaz moderna y responsiva** con Tailwind CSS y shadcn/ui
- **Sistema de loading global**: 
  - `PageLoadingBar` para transiciones automáticas entre páginas
  - `GlobalLoadingOverlay` para operaciones largas con mensajes personalizados
  - Hook `useLoading` para integración simplificada ([ver documentación](_docs/desarrollo/LOADING_SYSTEM.md))
- **Componente LogoBrand unificado** para consistencia de marca
- **Estados de carga optimizados** con feedback visual inmediato
- **Manejo robusto de errores** con páginas dedicadas (404, 403, 500)
- **Dark mode nativo** con detección automática del sistema
- **Sistema de branding adaptable** para cualquier institución educativa

## 🔧 Configuración

### Variables de Entorno - Frontend

```env
VITE_API_BASE_URL=http://localhost:8002
VITE_USER_SERVICE_URL=http://localhost:8002
VITE_DEBUG_MODE=true
VITE_CORS_ENABLED=true
```

### Variables de Entorno - Backend

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sicora_users
DB_USER=sicora_user
DB_PASSWORD=sicora_password
JWT_SECRET=your-super-secret-key
PORT=8002
```

## 📈 Próximos Pasos

### Desarrollo Inmediato

- [ ] Integración con otros microservicios
- [ ] Tests E2E automatizados
- [ ] Optimización de rendimiento
- [ ] Mejoras de UX

### Desarrollo a Mediano Plazo

- [ ] Dashboard administrativo
- [ ] Reportes y analytics
- [ ] Notificaciones en tiempo real
- [ ] API mobile

## 🔧 Resolución de Problemas

### Problemas de Docker y Red

![Resolución de Problemas Docker](./assets/diagramas/resolucion-problemas-docker.svg)

_Diagrama completo para diagnosticar y resolver problemas comunes de Docker, incluye herramientas automáticas y scripts de reparación._

### Scripts de Diagnóstico Automático

```bash
# Diagnosticar problemas de red Docker
./scripts/diagnose-docker-network.sh

# Reparar automáticamente problemas comunes
./scripts/repair-docker-network.sh

# Verificar estado de todos los servicios
./scripts/health-check-services.sh
```

Para más información detallada: [📋 Errores de Red Docker](./_docs/configuracion/ERRORES_RED_DOCKER_SICORA.md)

## 🤝 Contribución

### Estrategia Git Progresiva

![Flujo de Desarrollo Git Progresivo](./assets/flujos/flujo-desarrollo-git-progresivo.svg)

_SICORA utiliza una estrategia de configuración Git progresiva: configuración mínima para desarrollo inicial, que evoluciona a estricta para equipos y producción._

### Workflow de Desarrollo

1. Crear rama feature desde main
2. Desarrollar y probar localmente
3. Commit con mensajes descriptivos
4. Pull request con revisión
5. Merge a main después de aprobación

### Standards de Código

- **Frontend**: ESLint + Prettier
- **Backend**: gofmt + golint
- **Commits**: Conventional Commits
- **Documentación**: README actualizado

## � Documentación Open Source

### Archivos de Proyecto Open Source

- [LICENSE](./LICENSE) - Licencia MIT
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Código de conducta de la comunidad
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guía para contribuir al proyecto
- [SECURITY.md](./SECURITY.md) - Política de seguridad y reporte de vulnerabilidades
- [CHANGELOG.md](./CHANGELOG.md) - Registro de cambios del proyecto

### Templates para Issues y PRs

- [🐛 Bug Report](./.github/ISSUE_TEMPLATE/bug_report.md)
- [✨ Feature Request](./.github/ISSUE_TEMPLATE/feature_request.md)
- [❓ Question/Help](./.github/ISSUE_TEMPLATE/question.md)
- [📝 Pull Request Template](./.github/pull_request_template.md)

### CI/CD y Automatización

- [GitHub Actions Workflow](./.github/workflows/ci-cd.yml) - Pipeline completo de CI/CD
- [Scripts de automatización](./scripts/) - Herramientas de desarrollo y deployment

## �📞 Soporte

### Contacto Técnico

- **Email**: dev@onevision.education
- **Documentación**: ./sicora-docs/
- **Issues**: GitHub Issues

### Recursos

- [Documentación API](http://localhost:8002/swagger/index.html)
- [Panel Admin](http://localhost:5173/admin)
- [Guías de Desarrollo](./sicora-docs/)

---

**SICORA** - Desarrollado con ❤️ por OneVision Open Source
_Sistema de Información de Coordinación Académica - Open Source Educational Platform_
