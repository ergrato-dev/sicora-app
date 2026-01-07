# 📋 PLAN DE DESARROLLO FRONTEND - SICORA NEXT.JS

**Fecha:** 28 de junio de 2025  
**Versión:** 1.0  
**Framework:** Next.js 16 + React 19 + Tailwind v4  
**Estado:** 🚧 EN DESARROLLO

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual del Frontend

| Métrica               | Valor         | Objetivo     |
| --------------------- | ------------- | ------------ |
| **HUs Completadas**   | 6/39 (15%)    | 39/39        |
| **HUs En Desarrollo** | 2 (5%)        | -            |
| **HUs Pendientes**    | 31 (80%)      | 0            |
| **Endpoints Backend** | 85+ expuestos | 100% mapeo   |
| **Servicios Backend** | 9 activos     | 9 integrados |

### Backend Disponible para Integración

| Servicio               | Stack  | Endpoints | Estado Backend | % Completado |
| ---------------------- | ------ | --------- | -------------- | ------------ |
| **UserService**        | Python | 22        | ✅ COMPLETO    | 100%         |
| **ScheduleService**    | Python | 12        | ✅ COMPLETO    | 90%          |
| **AttendanceService**  | Python | 15        | ✅ COMPLETO    | 85%          |
| **EvalinService**      | Python | 39        | ✅ COMPLETO    | 95%          |
| **KbService**          | Python | 18        | ✅ COMPLETO    | 85%          |
| **AIService**          | Python | 6         | 🚧 PARCIAL     | 60%          |
| **MevalService**       | Go/Py  | 12        | ✅ COMPLETO    | 90%          |
| **ProjectEvalService** | Go     | 8         | ✅ COMPLETO    | 85%          |
| **APIGateway**         | Go     | Proxy     | ✅ COMPLETO    | 100%         |

---

## 🔗 INVENTARIO DE ENDPOINTS BACKEND

### 1. API Gateway (Go) - Rutas Proxy

```
# Rutas Públicas (sin auth)
POST /api/v1/auth/login        → userservice
POST /api/v1/auth/register     → userservice
POST /api/v1/auth/refresh      → userservice
POST /api/v1/auth/forgot-password → userservice
POST /api/v1/auth/reset-password  → userservice

# Rutas Protegidas (requieren JWT)
POST /api/v1/auth/logout

# Users
GET    /api/v1/users           → userservice (lista)
GET    /api/v1/users/:id       → userservice (detalle)
POST   /api/v1/users           → userservice (crear) [admin]
PUT    /api/v1/users/:id       → userservice (actualizar)
DELETE /api/v1/users/:id       → userservice (eliminar) [admin]
GET    /api/v1/users/me        → userservice (perfil actual)
PUT    /api/v1/users/me        → userservice (actualizar perfil)

# Schedules
GET    /api/v1/schedules       → scheduleservice
GET    /api/v1/schedules/:id   → scheduleservice
POST   /api/v1/schedules       → scheduleservice [admin/instructor]
PUT    /api/v1/schedules/:id   → scheduleservice [admin/instructor]
DELETE /api/v1/schedules/:id   → scheduleservice [admin]

# Attendance
GET    /api/v1/attendance          → attendanceservice
GET    /api/v1/attendance/:id      → attendanceservice
POST   /api/v1/attendance          → attendanceservice
PUT    /api/v1/attendance/:id      → attendanceservice
GET    /api/v1/attendance/reports  → attendanceservice

# Evaluations (EvalinService)
GET    /api/v1/evaluations         → evalinservice
GET    /api/v1/evaluations/:id     → evalinservice
POST   /api/v1/evaluations         → evalinservice [admin/instructor]
PUT    /api/v1/evaluations/:id     → evalinservice [admin/instructor]
DELETE /api/v1/evaluations/:id     → evalinservice [admin]

# Knowledge Base
GET    /api/v1/knowledge/articles      → kbservice
GET    /api/v1/knowledge/articles/:id  → kbservice
POST   /api/v1/knowledge/articles      → kbservice [admin/instructor]
PUT    /api/v1/knowledge/articles/:id  → kbservice [admin/instructor]
DELETE /api/v1/knowledge/articles/:id  → kbservice [admin]
GET    /api/v1/knowledge/search        → kbservice

# AI Service
POST   /api/v1/ai/chat            → aiservice
POST   /api/v1/ai/recommendations → aiservice
POST   /api/v1/ai/analyze         → aiservice

# Project Evaluation
GET    /api/v1/projects              → projectevalservice
GET    /api/v1/projects/:id          → projectevalservice
POST   /api/v1/projects              → projectevalservice [admin/instructor]
PUT    /api/v1/projects/:id          → projectevalservice [admin/instructor]
DELETE /api/v1/projects/:id          → projectevalservice [admin]
GET    /api/v1/projects/:id/submissions → projectevalservice
POST   /api/v1/projects/:id/submissions → projectevalservice

# Mobile Evaluation
GET    /api/v1/meval/forms       → mevalservice
GET    /api/v1/meval/forms/:id   → mevalservice
POST   /api/v1/meval/forms       → mevalservice [admin/instructor]
POST   /api/v1/meval/submit      → mevalservice
GET    /api/v1/meval/results     → mevalservice
```

### 2. UserService (Python FastAPI)

```
# Auth Router (/api/v1/auth)
POST /login                 → LoginResponse
POST /logout                → MessageResponse
GET  /me                    → UserResponse
POST /refresh               → RefreshTokenResponse
POST /register              → LoginResponse
PUT  /change-password       → MessageResponse
PUT  /profile               → UserResponse
POST /forgot-password       → MessageResponse
POST /reset-password        → MessageResponse
POST /force-change-password → MessageResponse

# User Router (/api/v1/users)
POST /                      → UserResponse (crear)
GET  /                      → UserListResponse (lista con paginación)
GET  /{user_id}             → UserResponse
PATCH /{user_id}/activate   → UserResponse
PATCH /{user_id}/deactivate → UserResponse
PATCH /{user_id}/change-password → MessageResponse

# Admin User Router (/api/v1/admin/users)
GET    /{user_id}           → UserDetailResponse
PUT    /{user_id}           → UserDetailResponse
DELETE /{user_id}           → DeleteUserResponse
POST   /upload              → BulkUploadResponse (carga masiva JSON)
POST   /upload-file         → BulkUploadResponse (carga masiva archivo)
```

### 3. ScheduleService (Python FastAPI)

```
# Schedule Router (/api/v1/schedules)
GET  /                      → List[ScheduleResponse] (con filtros)
GET  /{schedule_id}         → ScheduleResponse
POST /                      → ScheduleResponse
PUT  /{schedule_id}         → ScheduleResponse
DELETE /{schedule_id}       → MessageResponse

# Admin Router (/api/v1/admin)
GET  /programs              → List[AcademicProgramResponse]
POST /programs              → AcademicProgramResponse
GET  /groups                → List[AcademicGroupResponse]
POST /groups                → AcademicGroupResponse
GET  /venues                → List[VenueResponse]
POST /venues                → VenueResponse
POST /schedules/upload      → BulkUploadResultResponse
```

### 4. AttendanceService (Python FastAPI)

```
# Attendance Router (/api/v1/attendance)
POST /                      → AttendanceResponse (registrar)
GET  /                      → List[AttendanceResponse] (lista)
GET  /{attendance_id}       → AttendanceResponse
POST /bulk                  → BulkAttendanceResponse
GET  /dashboard             → DashboardResponse

# Justifications Router (/api/v1/justifications)
POST /                      → JustificationResponse
PUT  /{justification_id}    → JustificationResponse
GET  /                      → List[JustificationResponse]
GET  /{justification_id}    → JustificationResponse
DELETE /{justification_id}  → MessageResponse

# Alerts Router (/api/v1/alerts)
GET  /                      → List[AlertResponse]
GET  /{alert_id}            → AlertResponse
PUT  /{alert_id}            → AlertResponse
GET  /student/{student_id}  → List[AlertResponse]
GET  /instructor/{instructor_id} → List[AlertResponse]
```

### 5. EvalinService (Python FastAPI)

```
# Evaluation Router (/api/v1/evaluations)
POST /                      → EvaluationResponseSchema
GET  /{evaluation_id}       → EvaluationResponseSchema
GET  /                      → List[EvaluationResponseSchema]
PUT  /{evaluation_id}       → EvaluationResponseSchema
DELETE /{evaluation_id}     → 204 No Content

# Question Router (/api/v1/questions)
POST /                      → QuestionResponseSchema
GET  /                      → List[QuestionResponseSchema]
GET  /{question_id}         → QuestionResponseSchema
PUT  /{question_id}         → QuestionResponseSchema
DELETE /{question_id}       → 204 No Content
POST /bulk                  → BulkQuestionResponse

# Questionnaire Router (/api/v1/questionnaires)
POST /                      → QuestionnaireResponseSchema
GET  /                      → List[QuestionnaireResponseSchema]
GET  /{questionnaire_id}    → QuestionnaireResponseSchema
PUT  /{questionnaire_id}    → QuestionnaireResponseSchema
DELETE /{questionnaire_id}  → 204 No Content
POST /{id}/questions        → QuestionnaireResponseSchema
DELETE /{id}/questions/{q_id} → 204 No Content

# Period Router (/api/v1/periods)
POST /                      → PeriodResponseSchema
GET  /                      → List[PeriodResponseSchema]
GET  /{period_id}           → PeriodResponseSchema
PUT  /{period_id}           → PeriodResponseSchema
POST /{period_id}/activate  → PeriodResponseSchema

# Report Router (/api/v1/reports)
GET  /instructor/{instructor_id}    → InstructorReportSchema
GET  /period/{period_id}            → PeriodReportSchema
POST /export/csv                    → FileResponse
POST /export/excel                  → FileResponse
GET  /analytics/instructor/{id}/trends → TrendsResponse
GET  /analytics/period/{id}/dashboard → DashboardResponse
GET  /analytics/comparative         → ComparativeResponse

# Notification Router (/api/v1/notifications)
POST /reminder/{ficha_id}           → ReminderResponseSchema

# Config Router (/api/v1/config)
GET  /                              → SystemConfigResponseSchema
```

### 6. KbService (Python FastAPI)

```
# Search Router (/api/v1/kb)
POST /search                        → SearchResponse
POST /query                         → QueryResponse
GET  /suggestions                   → SuggestionsResponse

# PDF Router (/api/v1/kb/pdf)
POST /upload-pdf                    → KnowledgeItemResponse
POST /batch-upload-pdf              → BatchUploadResponse
GET  /pdf-processing-info           → ProcessingInfoResponse
```

### 7. MevalService (Python/Go)

```
# Sanction Router (/api/v1/sanctions)
POST /                              → SanctionResponse
GET  /                              → List[SanctionResponse]
GET  /active                        → List[SanctionResponse]
GET  /appealable                    → List[SanctionResponse]
GET  /expiring-soon                 → List[SanctionResponse]
GET  /student/{student_id}          → List[SanctionResponse]
GET  /student/{student_id}/recidivism-count → RecidivismCountResponse
```

---

## 📊 MAPEO HU → ENDPOINT → PÁGINA

### Fase 1: Autenticación ✅ COMPLETADO

| HU-ID     | Descripción                   | Endpoint(s)                | Página Next.js     | Estado |
| --------- | ----------------------------- | -------------------------- | ------------------ | ------ |
| HU-FE-001 | Inicio de Sesión              | POST /auth/login           | `/login`           | ✅     |
| HU-FE-002 | Cierre de Sesión              | POST /auth/logout          | Sidebar action     | ✅     |
| HU-FE-003 | Recuperación Contraseña       | POST /auth/forgot-password | `/forgot-password` | ✅     |
| HU-FE-004 | Cambio Contraseña Obligatorio | PUT /auth/change-password  | `/change-password` | ✅     |
| HU-FE-029 | Restablecer Contraseña        | POST /auth/reset-password  | `/reset-password`  | ✅     |
| HU-FE-030 | Contexto de Autenticación     | -                          | `providers.tsx`    | ✅     |

### Fase 2: Dashboard por Rol 🚧 EN DESARROLLO

| HU-ID     | Descripción                     | Endpoint(s)                                    | Página Next.js | Estado |
| --------- | ------------------------------- | ---------------------------------------------- | -------------- | ------ |
| HU-FE-005 | Dashboard Aprendiz              | GET /users/me, GET /schedules, GET /attendance | `/dashboard`   | 🚧     |
| HU-FE-006 | Saludo Personalizado            | GET /users/me                                  | `/dashboard`   | ✅     |
| HU-FE-007 | Horario del Día (Aprendiz)      | GET /schedules?date=today                      | `/dashboard`   | 📋     |
| HU-FE-008 | Resumen Asistencia (Aprendiz)   | GET /attendance/dashboard                      | `/dashboard`   | 📋     |
| HU-FE-009 | Alertas Pendientes (Aprendiz)   | GET /alerts/student/{id}                       | `/dashboard`   | 📋     |
| HU-FE-010 | Acciones Rápidas (Aprendiz)     | -                                              | `/dashboard`   | 📋     |
| HU-FE-011 | Dashboard Instructor            | GET /schedules, GET /attendance                | `/dashboard`   | 🚧     |
| HU-FE-012 | Clases del Día (Instructor)     | GET /schedules?date=today                      | `/dashboard`   | 📋     |
| HU-FE-013 | Botón Registrar Asistencia      | -                                              | `/dashboard`   | 📋     |
| HU-FE-014 | Notif. Justificaciones Pend.    | GET /justifications?status=pending             | `/dashboard`   | 📋     |
| HU-FE-015 | Alertas Aprendices (Instructor) | GET /alerts                                    | `/dashboard`   | 📋     |
| HU-FE-016 | Dashboard Administrador         | Múltiples endpoints                            | `/dashboard`   | 🚧     |

### Fase 3: Gestión de Usuarios 📋 PENDIENTE

| HU-ID     | Descripción             | Endpoint(s)                 | Página Next.js           | Estado |
| --------- | ----------------------- | --------------------------- | ------------------------ | ------ |
| HU-FE-017 | Acceso Gestión Usuarios | -                           | `/usuarios`              | 📋     |
| HU-FE-022 | Perfil de Usuario       | GET /users/me, PUT /profile | `/perfil`                | 📋     |
| HU-FE-025 | Editar Perfil           | PUT /users/me               | `/perfil/editar`         | 📋     |
| HU-FE-028 | CRUD Usuarios (Admin)   | CRUD /users, /admin/users   | `/usuarios/*`            | 📋     |
| -         | Carga Masiva Usuarios   | POST /admin/users/upload    | `/usuarios/carga-masiva` | 📋     |

### Fase 4: Gestión de Horarios 📋 PENDIENTE

| HU-ID     | Descripción             | Endpoint(s)                  | Página Next.js             | Estado |
| --------- | ----------------------- | ---------------------------- | -------------------------- | ------ |
| HU-FE-018 | Acceso Gestión Horarios | -                            | `/horarios`                | 📋     |
| -         | Ver Horarios por Ficha  | GET /schedules?group_id=X    | `/horarios`                | 📋     |
| -         | Crear/Editar Horario    | POST/PUT /schedules          | `/horarios/crear`          | 📋     |
| -         | Gestión Programas       | GET/POST /admin/programs     | `/configuracion/programas` | 📋     |
| -         | Gestión Fichas          | GET/POST /admin/groups       | `/configuracion/fichas`    | 📋     |
| -         | Gestión Ambientes       | GET/POST /admin/venues       | `/configuracion/ambientes` | 📋     |
| HU-FE-019 | Carga Masiva Horarios   | POST /admin/schedules/upload | `/horarios/carga-masiva`   | 📋     |

### Fase 5: Control de Asistencia 📋 PENDIENTE

| HU-ID     | Descripción                  | Endpoint(s)             | Página Next.js                | Estado |
| --------- | ---------------------------- | ----------------------- | ----------------------------- | ------ |
| -         | Registrar Asistencia         | POST /attendance        | `/asistencia/registrar`       | 📋     |
| -         | Registrar Asistencia Masiva  | POST /attendance/bulk   | `/asistencia/registrar`       | 📋     |
| HU-FE-026 | Historial de Asistencia      | GET /attendance         | `/asistencia/historial`       | 📋     |
| HU-FE-027 | Enviar Justificación         | POST /justifications    | `/justificaciones/nueva`      | 📋     |
| -         | Revisar Justificaciones      | GET/PUT /justifications | `/justificaciones`            | 📋     |
| -         | Ver Alertas                  | GET /alerts             | `/alertas`                    | 📋     |
| HU-FE-031 | Alertas Instructores (Admin) | GET /alerts             | `/admin/alertas-instructores` | 📋     |

### Fase 6: Evaluación de Instructores 📋 PENDIENTE

| HU-ID | Descripción             | Endpoint(s)               | Página Next.js                | Estado |
| ----- | ----------------------- | ------------------------- | ----------------------------- | ------ |
| -     | Lista de Evaluaciones   | GET /evaluations          | `/evaluaciones`               | 📋     |
| -     | Responder Evaluación    | POST /evaluations         | `/evaluaciones/responder`     | 📋     |
| -     | Gestionar Cuestionarios | CRUD /questionnaires      | `/evaluaciones/cuestionarios` | 📋     |
| -     | Gestionar Preguntas     | CRUD /questions           | `/evaluaciones/preguntas`     | 📋     |
| -     | Gestionar Periodos      | CRUD /periods             | `/evaluaciones/periodos`      | 📋     |
| -     | Reportes por Instructor | GET /reports/instructor   | `/evaluaciones/reportes`      | 📋     |
| -     | Reportes por Periodo    | GET /reports/period       | `/evaluaciones/reportes`      | 📋     |
| -     | Exportar CSV/Excel      | POST /reports/export/\*   | `/evaluaciones/exportar`      | 📋     |
| -     | Dashboard Analítico     | GET /reports/analytics/\* | `/evaluaciones/analytics`     | 📋     |

### Fase 7: Knowledge Base 📋 PENDIENTE

| HU-ID | Descripción            | Endpoint(s)                  | Página Next.js      | Estado |
| ----- | ---------------------- | ---------------------------- | ------------------- | ------ |
| -     | Búsqueda de Artículos  | GET /knowledge/search        | `/kb/buscar`        | 📋     |
| -     | Ver Artículo           | GET /knowledge/articles/:id  | `/kb/articulo/[id]` | 📋     |
| -     | Crear/Editar Artículo  | POST/PUT /knowledge/articles | `/kb/crear`         | 📋     |
| -     | Subir PDF              | POST /kb/pdf/upload-pdf      | `/kb/subir-pdf`     | 📋     |
| -     | Query Natural Language | POST /kb/query               | `/kb/asistente`     | 📋     |

### Fase 8: IA y Asistente 📋 PENDIENTE

| HU-ID     | Descripción                 | Endpoint(s)              | Página Next.js            | Estado |
| --------- | --------------------------- | ------------------------ | ------------------------- | ------ |
| HU-FE-031 | Dashboard Predictivo        | POST /ai/analyze         | `/dashboard` (widget)     | 📋     |
| HU-FE-032 | Optimizador Horarios        | POST /ai/recommendations | `/horarios/optimizar`     | 📋     |
| HU-FE-033 | Consultas Lenguaje Natural  | POST /ai/chat            | `/ai/consultas`           | 📋     |
| HU-FE-034 | Validación CSV con IA       | POST /ai/analyze         | `/carga-masiva`           | 📋     |
| HU-FE-035 | Asistente Gestión Proactiva | POST /ai/recommendations | `/dashboard` (instructor) | 📋     |
| HU-FE-036 | Análisis Justificaciones IA | POST /ai/analyze         | `/justificaciones`        | 📋     |
| HU-FE-037 | Visualizador Impacto        | POST /ai/analyze         | `/reportes/impacto`       | 📋     |
| HU-FE-038 | Recomendador Momentos Lista | POST /ai/recommendations | `/dashboard` (instructor) | 📋     |

### Fase 9: Funcionalidad Offline 📋 PENDIENTE

| HU-ID               | Descripción                 | Implementación             | Estado |
| ------------------- | --------------------------- | -------------------------- | ------ |
| HU-OFFLINE-CONFIG   | Preferencias Sincronización | IndexedDB + Service Worker | 📋     |
| HU-OFFLINE-STATUS   | Indicador Estado Conexión   | Navigator.onLine + UI      | 📋     |
| HU-OFFLINE-REG      | Registro Asistencia Offline | IndexedDB Queue            | 📋     |
| HU-OFFLINE-JUST     | Crear Justificación Offline | IndexedDB + File Storage   | 📋     |
| HU-OFFLINE-SCHEDULE | Ver Horario Offline         | Cache API                  | 📋     |
| HU-OFFLINE-STORAGE  | Almacenamiento Local        | IndexedDB                  | 📋     |
| HU-OFFLINE-CONFLICT | Manejo de Conflictos        | Last-Write-Wins            | 📋     |

---

## 🏗️ ESTRUCTURA DE CARPETAS PROPUESTA

```
sicora-app-fe-next/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Grupo rutas auth (sin layout)
│   │   │   ├── login/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── change-password/page.tsx
│   │   │
│   │   ├── (dashboard)/               # Grupo rutas dashboard (con layout)
│   │   │   ├── layout.tsx             # DashboardLayout
│   │   │   ├── dashboard/page.tsx     # Dashboard por rol
│   │   │   │
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx           # Lista usuarios
│   │   │   │   ├── [id]/page.tsx      # Detalle usuario
│   │   │   │   ├── crear/page.tsx
│   │   │   │   └── carga-masiva/page.tsx
│   │   │   │
│   │   │   ├── horarios/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── crear/page.tsx
│   │   │   │   └── carga-masiva/page.tsx
│   │   │   │
│   │   │   ├── asistencia/
│   │   │   │   ├── page.tsx           # Dashboard asistencia
│   │   │   │   ├── registrar/page.tsx
│   │   │   │   └── historial/page.tsx
│   │   │   │
│   │   │   ├── justificaciones/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── nueva/page.tsx
│   │   │   │
│   │   │   ├── alertas/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── evaluaciones/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── responder/[id]/page.tsx
│   │   │   │   ├── cuestionarios/
│   │   │   │   ├── preguntas/
│   │   │   │   ├── periodos/
│   │   │   │   ├── reportes/page.tsx
│   │   │   │   └── analytics/page.tsx
│   │   │   │
│   │   │   ├── kb/
│   │   │   │   ├── page.tsx           # Búsqueda KB
│   │   │   │   ├── articulo/[id]/page.tsx
│   │   │   │   ├── crear/page.tsx
│   │   │   │   └── asistente/page.tsx
│   │   │   │
│   │   │   ├── perfil/
│   │   │   │   ├── page.tsx
│   │   │   │   └── editar/page.tsx
│   │   │   │
│   │   │   └── configuracion/
│   │   │       ├── page.tsx
│   │   │       ├── programas/page.tsx
│   │   │       ├── fichas/page.tsx
│   │   │       └── ambientes/page.tsx
│   │   │
│   │   ├── layout.tsx                 # Root layout
│   │   ├── globals.css
│   │   ├── providers.tsx
│   │   └── page.tsx                   # Redirect to /dashboard
│   │
│   ├── components/
│   │   ├── ui/                        # Componentes base (Button, Input, Card, etc.)
│   │   ├── layout/                    # Sidebar, Header, DashboardLayout
│   │   ├── auth/                      # LoginForm, etc.
│   │   ├── dashboard/                 # StatCard, ActivityList, QuickActions
│   │   ├── usuarios/                  # UserTable, UserForm, BulkUpload
│   │   ├── horarios/                  # ScheduleCalendar, ScheduleForm
│   │   ├── asistencia/                # AttendanceTable, AttendanceForm
│   │   ├── evaluaciones/              # EvaluationForm, QuestionnaireBuilder
│   │   └── kb/                        # ArticleCard, SearchBar, ChatInterface
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # Axios/fetch wrapper
│   │   │   ├── auth.ts                # Auth endpoints
│   │   │   ├── users.ts               # User endpoints
│   │   │   ├── schedules.ts           # Schedule endpoints
│   │   │   ├── attendance.ts          # Attendance endpoints
│   │   │   ├── evaluations.ts         # Evaluation endpoints
│   │   │   └── kb.ts                  # Knowledge base endpoints
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useUsers.ts
│   │   │   ├── useSchedules.ts
│   │   │   ├── useAttendance.ts
│   │   │   └── useEvaluations.ts
│   │   │
│   │   └── utils/
│   │       ├── auth.ts                # Token management
│   │       ├── dates.ts               # Date formatting
│   │       └── validation.ts          # Zod schemas
│   │
│   ├── stores/
│   │   ├── auth-store.ts              # Zustand auth state
│   │   ├── ui-store.ts                # UI state (sidebar, theme)
│   │   └── offline-store.ts           # Offline queue state
│   │
│   └── types/
│       ├── auth.types.ts
│       ├── user.types.ts
│       ├── schedule.types.ts
│       ├── attendance.types.ts
│       └── evaluation.types.ts
│
├── public/
│   └── icons/
│
└── next.config.ts
```

---

## 📅 CRONOGRAMA DE DESARROLLO

### Sprint 1-2: Infraestructura y Auth (ACTUAL)

**Duración:** 2 semanas  
**Estado:** 🚧 EN DESARROLLO

- [x] Setup Next.js 16 + React 19
- [x] Configurar Tailwind v4 con colores OneVision
- [x] DashboardLayout (Sidebar + Header)
- [x] Páginas placeholder
- [ ] Auth store con Zustand
- [ ] API client con interceptors
- [ ] Protección de rutas

### Sprint 3-4: Dashboard y Usuarios

**Duración:** 2 semanas

- [ ] Dashboard dinámico por rol
- [ ] Integración GET /users/me
- [ ] Widget horario del día
- [ ] Widget resumen asistencia
- [ ] CRUD Usuarios completo
- [ ] Carga masiva usuarios

### Sprint 5-6: Horarios y Asistencia

**Duración:** 2 semanas

- [ ] Calendario de horarios
- [ ] Gestión de horarios (admin)
- [ ] Registro de asistencia
- [ ] Historial de asistencia
- [ ] Sistema de alertas

### Sprint 7-8: Justificaciones y Evaluaciones

**Duración:** 2 semanas

- [ ] Crear/revisar justificaciones
- [ ] Sistema de evaluaciones
- [ ] Cuestionarios dinámicos
- [ ] Reportes y exportación

### Sprint 9-10: Knowledge Base e IA

**Duración:** 2 semanas

- [ ] Búsqueda de artículos
- [ ] Visor de artículos
- [ ] Chat con IA
- [ ] Integración asistente

### Sprint 11-12: Offline y Optimización

**Duración:** 2 semanas

- [ ] Service Worker
- [ ] IndexedDB para datos offline
- [ ] Sincronización background
- [ ] Testing E2E
- [ ] Optimización rendimiento

---

## 📋 REQUISITOS NO FUNCIONALES

### Performance

| Métrica                      | Objetivo | Herramienta      |
| ---------------------------- | -------- | ---------------- |
| FCP (First Contentful Paint) | < 1.5s   | Lighthouse       |
| TTI (Time to Interactive)    | < 3s     | Lighthouse       |
| Bundle Size                  | < 500KB  | Next.js Analyzer |
| Lighthouse Score             | > 90     | Lighthouse       |

### Seguridad

- ✅ HTTPS obligatorio
- ✅ JWT con refresh automático
- ✅ Sanitización de inputs
- ✅ CORS restrictivo
- 📋 CSP headers

### Accesibilidad

- 📋 WCAG 2.1 Nivel AA
- 📋 Soporte screen readers
- 📋 Navegación por teclado
- 📋 Contraste de colores

### Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- 📋 PWA installable

---

## 🔄 DEPENDENCIAS TÉCNICAS

### Paquetes Principales

```json
{
  "dependencies": {
    "next": "^16.1.1",
    "react": "^19.2.0",
    "@tanstack/react-query": "^5.x",
    "zustand": "^5.x",
    "axios": "^1.x",
    "zod": "^3.x",
    "date-fns": "^4.x",
    "recharts": "^2.x",
    "lucide-react": "^0.x"
  }
}
```

### Backend Requerido

- API Gateway corriendo en `http://localhost:8002`
- Todos los microservicios registrados
- PostgreSQL + Redis operativos

---

## 🎯 CRITERIOS DE ÉXITO

### Por Fase

1. **Fase 1-2**: Login funcional, dashboard carga sin errores
2. **Fase 3-4**: CRUD usuarios completo, dashboard con datos reales
3. **Fase 5-6**: Flujo de asistencia end-to-end
4. **Fase 7-8**: Evaluaciones operativas
5. **Fase 9-10**: KB y IA integrados
6. **Fase 11-12**: PWA instalable, funciona offline

### Métricas Finales

| Métrica                | Objetivo |
| ---------------------- | -------- |
| HUs Completadas        | 39/39    |
| Cobertura Backend      | 100%     |
| Test Coverage          | > 80%    |
| Lighthouse Performance | > 90     |
| Accessibility          | WCAG AA  |

---

**Documento generado el:** 28 de junio de 2025  
**Próxima revisión:** Sprint 2 (15 de julio de 2025)
