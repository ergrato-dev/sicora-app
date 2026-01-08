# 🚨 **MATRIZ DE RIESGOS - PROYECTO SICORA**

**Sistema:** SICORA - Sistema de Información de Coordinación Académica  
**Fecha:** 8 de enero de 2026  
**Versión:** 1.0  
**Estado:** ✅ Documento Activo  
**Responsable:** Equipo de Desarrollo SICORA

---

## 📊 **RESUMEN EJECUTIVO**

Este documento consolida todos los riesgos identificados en el proyecto SICORA, proporcionando una visión unificada para la gestión proactiva de riesgos y la toma de decisiones informada.

### **Dashboard de Riesgos**

| Nivel          | Total | Mitigados | Pendientes | Aceptados |
| -------------- | ----- | --------- | ---------- | --------- |
| 🔴 **Crítico** | 8     | 6         | 1          | 1         |
| 🟠 **Alto**    | 12    | 9         | 2          | 1         |
| 🟡 **Medio**   | 15    | 10        | 3          | 2         |
| 🟢 **Bajo**    | 10    | 6         | 2          | 2         |
| **TOTAL**      | 45    | 31 (69%)  | 8 (18%)    | 6 (13%)   |

---

## 🎯 **METODOLOGÍA DE EVALUACIÓN**

### **Matriz Probabilidad × Impacto**

|                    | Impacto Bajo (1) | Impacto Medio (2) | Impacto Alto (3) | Impacto Crítico (4) |
| ------------------ | ---------------- | ----------------- | ---------------- | ------------------- |
| **Prob. Alta (4)** | 🟡 Medio (4)     | 🟠 Alto (8)       | 🔴 Crítico (12)  | 🔴 Crítico (16)     |
| **Prob. Media (3)**| 🟢 Bajo (3)      | 🟡 Medio (6)      | 🟠 Alto (9)      | 🔴 Crítico (12)     |
| **Prob. Baja (2)** | 🟢 Bajo (2)      | 🟢 Bajo (4)       | 🟡 Medio (6)     | 🟠 Alto (8)         |
| **Prob. Muy Baja (1)**| 🟢 Bajo (1)   | 🟢 Bajo (2)       | 🟢 Bajo (3)      | 🟡 Medio (4)        |

### **Clasificación de Niveles**

- **🔴 Crítico (12-16):** Requiere acción inmediata, escalación a dirección
- **🟠 Alto (8-11):** Requiere plan de mitigación activo, seguimiento semanal
- **🟡 Medio (4-7):** Monitoreo regular, plan de contingencia documentado
- **🟢 Bajo (1-3):** Aceptable, revisión periódica trimestral

---

## 🔴 **RIESGOS CRÍTICOS**

### **RC-001: SQL Injection en Backend Go**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RC-001 |
| **Categoría** | Seguridad |
| **Componente** | KbService, EvalInService (Go) |
| **Probabilidad** | Alta (4) → Baja (2) ✅ |
| **Impacto** | Crítico (4) |
| **Puntuación** | 16 → 8 ✅ |
| **Estado** | ✅ MITIGADO |

**Descripción:** Vulnerabilidades de SQL Injection en cláusulas ORDER BY y funciones ts_rank por interpolación directa de parámetros de usuario.

**Vector de Ataque:**
```bash
GET /api/v1/documents?sort_by=title;DROP TABLE kb_documents;--
```

**Mitigación Implementada:**
- ✅ Whitelist estricta de campos en ORDER BY
- ✅ Uso de GORM clause.OrderByColumn (sin interpolación)
- ✅ Validación de parámetros con regex
- ✅ Prepared statements en todas las queries

**Referencia:** [AUDITORIA_SEGURIDAD_GO_2026.md](../../_docs/reportes/AUDITORIA_SEGURIDAD_GO_2026.md)

---

### **RC-002: Bypass de Autenticación JWT**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RC-002 |
| **Categoría** | Seguridad |
| **Componente** | Todos los microservicios |
| **Probabilidad** | Media (3) → Muy Baja (1) ✅ |
| **Impacto** | Crítico (4) |
| **Puntuación** | 12 → 4 ✅ |
| **Estado** | ✅ MITIGADO |

**Descripción:** Posibilidad de bypass de autenticación mediante tokens malformados o expirados no validados correctamente.

**Mitigación Implementada:**
- ✅ Validación estricta de firma JWT (RS256)
- ✅ Verificación de expiración en cada request
- ✅ Blacklist de tokens revocados en Redis
- ✅ Refresh token rotation implementado

**Referencia:** [SECURITY.md](../../../SECURITY.md)

---

### **RC-003: Exposición de Datos Sensibles de Aprendices**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RC-003 |
| **Categoría** | Privacidad/Compliance |
| **Componente** | UserService, shared-data |
| **Probabilidad** | Media (3) |
| **Impacto** | Crítico (4) |
| **Puntuación** | 12 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Riesgo de exposición de datos personales de aprendices (documentos, emails, notas) por acceso no autorizado o logs inadecuados.

**Mitigación Implementada:**
- ✅ Cifrado de datos sensibles en BD (AES-256)
- ✅ Log sanitization (no se loguean datos PII)
- ✅ RBAC estricto por ficha y rol
- ✅ Auditoría de accesos a datos sensibles

**Referencia:** [SECURITY-POLICY.md](../../sicora-shared/sample-data/SECURITY-POLICY.md)

---

### **RC-004: Fallo Total de Base de Datos PostgreSQL**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RC-004 |
| **Categoría** | Disponibilidad |
| **Componente** | sicora-infra, PostgreSQL |
| **Probabilidad** | Baja (2) |
| **Impacto** | Crítico (4) |
| **Puntuación** | 8 |
| **Estado** | 🟡 PARCIALMENTE MITIGADO |

**Descripción:** Pérdida completa del servicio por fallo de PostgreSQL sin mecanismo de recuperación rápida.

**Mitigación Implementada:**
- ✅ Backups automáticos diarios
- ✅ Docker volumes persistentes
- ⏳ Replicación PostgreSQL (pendiente producción)

**Acciones Pendientes:**
- [ ] Configurar PostgreSQL streaming replication
- [ ] Implementar failover automático
- [ ] Documentar procedimiento de DR

---

### **RC-005: Carga Masiva Errónea de Aprendices**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RC-005 |
| **Categoría** | Integridad de Datos |
| **Componente** | UserService, AcadService |
| **Probabilidad** | Media (3) |
| **Impacto** | Alto (3) |
| **Puntuación** | 9 |
| **Estado** | ✅ MITIGADO (por diseño) |

**Descripción:** Error masivo en datos de aprendices por carga incorrecta de archivos CSV/Excel.

**Mitigación Implementada (Regla de Negocio):**
- ✅ Solo Instructor Director puede cargar aprendices a SU ficha
- ✅ Administrador NO puede hacer carga masiva global
- ✅ Validación preview antes de confirmar carga
- ✅ Límite de 100 registros por archivo
- ✅ Auditoría completa de cada carga

**Referencia:** [rf_gestion_fichas_aprendices.md](./rf_gestion_fichas_aprendices.md)

---

### **RC-006: Ataque DDoS al API Gateway**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RC-006 |
| **Categoría** | Disponibilidad |
| **Componente** | API Gateway (Python) |
| **Probabilidad** | Media (3) |
| **Impacto** | Crítico (4) |
| **Puntuación** | 12 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Ataque de denegación de servicio que sature el API Gateway.

**Mitigación Implementada:**
- ✅ Rate limiting por IP y usuario (100 req/min)
- ✅ Circuit breakers para servicios downstream
- ✅ Traefik como reverse proxy con protecciones
- ✅ Retry policies con backoff exponencial

**Referencia:** [ADR_TRAEFIK_REVERSE_PROXY.md](../../_docs/configuracion/ADR_TRAEFIK_REVERSE_PROXY.md)

---

### **RC-007: Pérdida de Código Fuente**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RC-007 |
| **Categoría** | Continuidad |
| **Componente** | Todos los repositorios |
| **Probabilidad** | Muy Baja (1) |
| **Impacto** | Crítico (4) |
| **Puntuación** | 4 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Pérdida del código fuente por fallo de GitHub o eliminación accidental.

**Mitigación Implementada:**
- ✅ Repositorio en GitHub (origin)
- ✅ Backup en servidor VPS secundario
- ✅ Clones locales de desarrolladores
- ✅ Estrategia de respaldo VCS documentada

**Referencia:** [ESTRATEGIA_RESPALDO_VCS.md](../../_docs/desarrollo/ESTRATEGIA_RESPALDO_VCS.md)

---

### **RC-008: Compromiso de Secretos y Credenciales**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RC-008 |
| **Categoría** | Seguridad |
| **Componente** | CI/CD, Docker, Infra |
| **Probabilidad** | Baja (2) |
| **Impacto** | Crítico (4) |
| **Puntuación** | 8 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Exposición de credenciales, API keys o secretos en código o logs.

**Mitigación Implementada:**
- ✅ Variables de entorno (nunca hardcoded)
- ✅ .env en .gitignore
- ✅ GitHub secrets para CI/CD
- ✅ Rotación periódica de credenciales
- ✅ Log sanitization activo

---

## 🟠 **RIESGOS ALTOS**

### **RA-001: Integración Defectuosa Entre Microservicios**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-001 |
| **Categoría** | Técnico |
| **Componente** | Todos los servicios Go/Python |
| **Probabilidad** | Media (3) |
| **Impacto** | Alto (3) |
| **Puntuación** | 9 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Fallos en la comunicación entre microservicios por contratos de API inconsistentes.

**Mitigación Implementada:**
- ✅ OpenAPI/Swagger documentado para cada servicio
- ✅ Tests de integración end-to-end
- ✅ Postman collections para validación
- ✅ Versionado de APIs (v1, v2)

---

### **RA-002: Performance Degradada Bajo Carga**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-002 |
| **Categoría** | Rendimiento |
| **Componente** | API Gateway, UserService |
| **Probabilidad** | Media (3) |
| **Impacto** | Alto (3) |
| **Puntuación** | 9 |
| **Estado** | 🟡 PARCIALMENTE MITIGADO |

**Descripción:** Tiempos de respuesta degradados cuando hay muchos usuarios concurrentes.

**Mitigación Implementada:**
- ✅ Connection pooling en PostgreSQL
- ✅ Índices optimizados en queries frecuentes
- ⏳ Cache con Redis (parcial)

**Acciones Pendientes:**
- [ ] Load testing formal (k6/JMeter)
- [ ] Implementar cache de consultas frecuentes
- [ ] Optimizar queries N+1

---

### **RA-003: Fallo de Servicio de Notificaciones**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-003 |
| **Categoría** | Funcionalidad |
| **Componente** | NotificationService (Python) |
| **Probabilidad** | Media (3) |
| **Impacto** | Medio (2) |
| **Puntuación** | 6 |
| **Estado** | ⏳ PENDIENTE |

**Descripción:** Las notificaciones (email, SMS, push) no se entregan por fallo de proveedores externos.

**Mitigación Planificada:**
- [ ] Retry mechanisms con backoff
- [ ] Dead letter queue para fallos
- [ ] Múltiples proveedores (failover)
- [ ] Mock providers para desarrollo

**Referencia:** [PLAN_COMPLETITUD_100_PYTHON_FASTAPI.md](../../_docs/reportes/PLAN_COMPLETITUD_100_PYTHON_FASTAPI.md)

---

### **RA-004: Corrupción de Datos en MongoDB**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-004 |
| **Categoría** | Integridad |
| **Componente** | MongoDB, KbService |
| **Probabilidad** | Baja (2) |
| **Impacto** | Alto (3) |
| **Puntuación** | 6 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Pérdida o corrupción de documentos en MongoDB por fallo o error de aplicación.

**Mitigación Implementada:**
- ✅ Backups automáticos configurados
- ✅ Validación de esquemas con Mongoose/Pydantic
- ✅ Write concern majority
- ✅ Procedimientos de DR documentados

**Referencia:** [rf_mongodb_infrastructure.md](./rf_mongodb_infrastructure.md)

---

### **RA-005: Vulnerabilidades en Dependencias**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-005 |
| **Categoría** | Seguridad |
| **Componente** | Todos (Go, Python, Node.js) |
| **Probabilidad** | Alta (4) |
| **Impacto** | Medio (2) |
| **Puntuación** | 8 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Uso de dependencias con vulnerabilidades conocidas (CVEs).

**Mitigación Implementada:**
- ✅ Dependabot activo en GitHub
- ✅ SonarQube para análisis de código
- ✅ Actualizaciones regulares de dependencias
- ✅ go mod tidy / pip-audit / npm audit

---

### **RA-006: Fuga de Información en Logs**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-006 |
| **Categoría** | Seguridad/Privacidad |
| **Componente** | Todos los servicios |
| **Probabilidad** | Media (3) → Baja (2) ✅ |
| **Impacto** | Alto (3) |
| **Puntuación** | 9 → 6 ✅ |
| **Estado** | ✅ MITIGADO |

**Descripción:** Logs que exponen datos sensibles (passwords, tokens, PII).

**Mitigación Implementada:**
- ✅ Log sanitization en todos los servicios
- ✅ Middleware que filtra campos sensibles
- ✅ Structured logging (JSON) sin PII
- ✅ Audit de logs periódico

---

### **RA-007: Escalación de Privilegios**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-007 |
| **Categoría** | Seguridad |
| **Componente** | UserService, RBAC |
| **Probabilidad** | Baja (2) |
| **Impacto** | Crítico (4) |
| **Puntuación** | 8 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Usuario obtiene permisos superiores a los asignados.

**Mitigación Implementada:**
- ✅ RBAC estricto con validación en cada endpoint
- ✅ Verificación de rol en JWT + BD
- ✅ Tests de autorización por rol
- ✅ Auditoría de cambios de roles

---

### **RA-008: XSS en Frontend**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-008 |
| **Categoría** | Seguridad |
| **Componente** | sicora-app-fe (React) |
| **Probabilidad** | Baja (2) |
| **Impacto** | Alto (3) |
| **Puntuación** | 6 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Inyección de scripts maliciosos en la interfaz de usuario.

**Mitigación Implementada:**
- ✅ React escapa HTML por defecto
- ✅ CSP headers configurados
- ✅ Sanitización de inputs
- ✅ No uso de dangerouslySetInnerHTML

---

### **RA-009: CORS Misconfiguration**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-009 |
| **Categoría** | Seguridad |
| **Componente** | API Gateway, Servicios |
| **Probabilidad** | Media (3) → Baja (2) ✅ |
| **Impacto** | Alto (3) |
| **Puntuación** | 9 → 6 ✅ |
| **Estado** | ✅ MITIGADO |

**Descripción:** Configuración CORS permisiva que permite requests desde orígenes no autorizados.

**Mitigación Implementada:**
- ✅ Whitelist de orígenes permitidos
- ✅ No uso de wildcard (*) en producción
- ✅ Validación de headers Origin
- ✅ Configuración por entorno (dev/prod)

---

### **RA-010: Inconsistencia de Datos Entre Servicios**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-010 |
| **Categoría** | Integridad |
| **Componente** | Microservicios distribuidos |
| **Probabilidad** | Media (3) |
| **Impacto** | Medio (2) |
| **Puntuación** | 6 |
| **Estado** | 🟡 PARCIALMENTE MITIGADO |

**Descripción:** Datos desincronizados entre microservicios por eventual consistency.

**Mitigación Implementada:**
- ✅ Transacciones donde es posible
- ✅ Idempotencia en operaciones críticas
- ⏳ Event sourcing (futuro)

**Acciones Pendientes:**
- [ ] Implementar saga pattern para transacciones distribuidas
- [ ] Mecanismo de reconciliación de datos

---

### **RA-011: Fallo de Autenticación con Proveedores Externos**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-011 |
| **Categoría** | Disponibilidad |
| **Componente** | UserService (OAuth futuro) |
| **Probabilidad** | Baja (2) |
| **Impacto** | Alto (3) |
| **Puntuación** | 6 |
| **Estado** | 🟢 ACEPTADO |

**Descripción:** Fallo de Google/Microsoft OAuth impide login de usuarios.

**Mitigación:**
- ✅ Autenticación local como fallback principal
- OAuth es funcionalidad opcional futura

---

### **RA-012: Pérdida de Sesión de Usuario**

| Atributo | Valor |
| -------- | ----- |
| **ID** | RA-012 |
| **Categoría** | UX |
| **Componente** | Frontend, UserService |
| **Probabilidad** | Baja (2) |
| **Impacto** | Medio (2) |
| **Puntuación** | 4 |
| **Estado** | ✅ MITIGADO |

**Descripción:** Usuario pierde sesión inesperadamente durante uso normal.

**Mitigación Implementada:**
- ✅ Refresh tokens con rotación automática
- ✅ Token expiry de 15 min con refresh de 7 días
- ✅ Persistencia de sesión en localStorage
- ✅ Renovación silenciosa de tokens

---

## 🟡 **RIESGOS MEDIOS**

### **RM-001 a RM-015: Resumen**

| ID | Descripción | Puntuación | Estado |
| -- | ----------- | ---------- | ------ |
| RM-001 | Complejidad de mantenimiento multi-stack | 6 | ✅ Mitigado (docs) |
| RM-002 | Documentación desactualizada | 4 | 🟡 Parcial |
| RM-003 | Falta de tests de carga | 6 | ⏳ Pendiente |
| RM-004 | Configuración inconsistente entre entornos | 4 | ✅ Mitigado |
| RM-005 | Timeout en operaciones largas | 4 | ✅ Mitigado |
| RM-006 | Error en validación de formatos CSV | 6 | ✅ Mitigado |
| RM-007 | Fallo de health checks | 4 | ✅ Mitigado |
| RM-008 | Logs excesivos llenando disco | 4 | ✅ Mitigado |
| RM-009 | Conflictos de merge en desarrollo | 3 | ✅ Mitigado |
| RM-010 | Falta de alertas de monitoreo | 6 | ⏳ Pendiente |
| RM-011 | Backup sin verificación | 4 | 🟡 Parcial |
| RM-012 | Versiones de dependencias no fijadas | 4 | ✅ Mitigado |
| RM-013 | Falta de throttling en uploads | 6 | ⏳ Pendiente |
| RM-014 | Errores silenciosos en background jobs | 4 | ✅ Mitigado |
| RM-015 | Migración de BD sin rollback | 6 | 🟡 Parcial |

---

## 🟢 **RIESGOS BAJOS**

### **RB-001 a RB-010: Resumen**

| ID | Descripción | Puntuación | Estado |
| -- | ----------- | ---------- | ------ |
| RB-001 | Cambios en APIs de terceros | 3 | 🟢 Aceptado |
| RB-002 | Rotación de equipo de desarrollo | 2 | ✅ Mitigado (docs) |
| RB-003 | Cambios de requerimientos frecuentes | 3 | 🟢 Aceptado |
| RB-004 | Incompatibilidad de navegadores | 2 | ✅ Mitigado |
| RB-005 | Problemas de accesibilidad (WCAG) | 3 | ✅ Mitigado |
| RB-006 | Internacionalización incompleta | 2 | 🟢 Aceptado |
| RB-007 | Límites de GitHub Actions | 2 | ✅ Mitigado |
| RB-008 | Cambios en políticas de OneVision | 2 | 🟢 Aceptado |
| RB-009 | Falta de dark mode completo | 1 | ✅ Mitigado |
| RB-010 | Complejidad de onboarding | 3 | ✅ Mitigado |

---

## 📋 **PLAN DE ACCIÓN PRIORIZADO**

### **Acciones Inmediatas (Próximas 2 semanas)**

| # | Riesgo | Acción | Responsable | Fecha Límite |
| - | ------ | ------ | ----------- | ------------ |
| 1 | RC-004 | Configurar PostgreSQL replication | DevOps | 2026-01-22 |
| 2 | RA-002 | Implementar cache Redis completo | Backend | 2026-01-22 |
| 3 | RA-003 | Implementar retry en NotificationService | Backend | 2026-01-22 |

### **Acciones a Corto Plazo (1 mes)**

| # | Riesgo | Acción | Responsable | Fecha Límite |
| - | ------ | ------ | ----------- | ------------ |
| 4 | RM-003 | Load testing con k6 | QA | 2026-02-08 |
| 5 | RM-010 | Configurar alertas Prometheus/Grafana | DevOps | 2026-02-08 |
| 6 | RA-010 | Implementar saga pattern | Backend | 2026-02-08 |

### **Acciones a Mediano Plazo (3 meses)**

| # | Riesgo | Acción | Responsable | Fecha Límite |
| - | ------ | ------ | ----------- | ------------ |
| 7 | RM-015 | Automatizar rollback de migraciones | Backend | 2026-04-08 |
| 8 | RM-002 | Sprint de actualización de docs | Todos | 2026-04-08 |

---

## 🔄 **PROCESO DE GESTIÓN DE RIESGOS**

### **Identificación**

1. Revisión semanal en daily/weekly
2. Post-mortem de incidentes
3. Auditorías de seguridad trimestrales
4. Feedback de usuarios

### **Evaluación**

1. Clasificar probabilidad (1-4)
2. Clasificar impacto (1-4)
3. Calcular puntuación (P × I)
4. Asignar nivel (Crítico/Alto/Medio/Bajo)

### **Tratamiento**

| Estrategia | Descripción | Cuándo usar |
| ---------- | ----------- | ----------- |
| **Mitigar** | Reducir probabilidad o impacto | Riesgos críticos/altos |
| **Transferir** | Pasar a terceros (seguros, SLA) | Riesgos externos |
| **Aceptar** | Asumir el riesgo documentado | Riesgos bajos o inevitables |
| **Evitar** | Eliminar la causa raíz | Riesgos con alternativas claras |

### **Monitoreo**

- **Revisión mensual:** Todos los riesgos
- **Revisión semanal:** Riesgos críticos y altos
- **Actualización inmediata:** Nuevos incidentes

---

## 📊 **MAPA DE CALOR DE RIESGOS**

Ver diagrama completo en: [mapa-calor-riesgos-sicora.svg](../../../assets/diagramas/mapa-calor-riesgos-sicora.svg)

---

## 📝 **HISTORIAL DE CAMBIOS**

| Versión | Fecha | Autor | Cambios |
| ------- | ----- | ----- | ------- |
| 1.0 | 2026-01-08 | Equipo SICORA | Documento inicial - consolidación de riesgos dispersos |

---

## ✅ **APROBACIONES**

| Rol | Nombre | Fecha | Estado |
| --- | ------ | ----- | ------ |
| Líder Técnico | - | - | ⏳ |
| Product Owner | - | - | ⏳ |
| Seguridad | - | - | ⏳ |
