# 🔧 Scripts de SICORA

## 📋 Scripts Disponibles

Esta carpeta contiene todos los scripts de automatización y utilidades del proyecto SICORA, organizados y documentados para facilitar su uso.

### 🔍 Scripts de Validación

#### `validate-programs-csv.py` ⭐ **NUEVO**

**Propósito**: Validar y cargar archivos CSV de programas de formación en SICORA

**Uso**:

```bash
# Solo validar archivo CSV
python3 scripts/validate-programs-csv.py programas_formacion.csv

# Validación con información detallada
python3 scripts/validate-programs-csv.py -v programas_formacion.csv

# Validar y cargar a backend Python (puerto 8000)
python3 scripts/validate-programs-csv.py programas_formacion.csv --upload --backend python

# Validar y cargar a backend Go (puerto 8080)
python3 scripts/validate-programs-csv.py programas_formacion.csv --upload --backend go

# Cargar con URL personalizada
python3 scripts/validate-programs-csv.py programas_formacion.csv --upload --backend python --url http://localhost:8000

# Usar plantilla de ejemplo
python3 scripts/validate-programs-csv.py sicora-shared/sample-data/templates/programas_formacion.csv --upload
```

**Características**:

- ✅ Validación completa de estructura y tipos de datos
- ✅ Verificación de reglas de negocio OneVision
- ✅ Comprobación de unicidad de códigos e IDs
- ✅ **NUEVO:** Carga automática a APIs individuales
- ✅ **NUEVO:** Soporte para backends Python y Go
- ✅ **NUEVO:** Reportes detallados de carga exitosa/fallida
- ✅ Reportes detallados de errores y advertencias
- ✅ Compatible con formato CSV estándar SICORA

### 🤖 Scripts de Automatización

#### `endpoint-automation.sh` ⭐ **NUEVO**

**Propósito**: Automatizar la gestión, monitoreo y testing de todos los endpoints backend (389 endpoints totales)

**Uso**:

```bash
# Monitorear todos los servicios y generar reportes
./scripts/endpoint-automation.sh monitor

# Verificar salud de todos los servicios
./scripts/endpoint-automation.sh health-check

# Testear servicio específico
./scripts/endpoint-automation.sh test-service userservice go

# Generar solo reportes
./scripts/endpoint-automation.sh report

# Ver ayuda completa
./scripts/endpoint-automation.sh help
```

**Funcionalidades**:

- ✅ Monitoreo automático de 16 servicios (8 Go + 8 Python)
- ✅ Health checks en tiempo real
- ✅ Conteo automático de endpoints via Swagger
- ✅ Generación de reportes y dashboards
- ✅ Testing de endpoints críticos
- ✅ Actualización automática de documentación
- ✅ Logs detallados y métricas

### 📚 Scripts de Documentación

#### `verify-docs-structure-strict.sh` ⭐ **NUEVO**

**Propósito**: Verificación estricta y completa de la estructura de documentación en todo el proyecto SICORA

**Uso**:

```bash
# Ejecutar verificación completa
./scripts/verify-docs-structure-strict.sh
```

**Funcionalidades**:

- ✅ **VERIFICACIÓN ESTRICTA**: Detecta archivos .md incorrectos en todas las raíces
- ✅ Valida estructura completa de \_docs/ en todos los módulos
- ✅ Comprueba presencia de índices README.md
- ✅ Genera reportes detallados con códigos de color
- ✅ Incluye excepciones para archivos válidos (CHANGELOG.md)
- ✅ Proporciona instrucciones de corrección automática

#### `verify-doc-structure.sh`

**Propósito**: Verificar y mantener la estructura organizada de documentación

**Uso**:

```bash
# Verificar estructura actual
./scripts/verify-doc-structure.sh

# Corregir problemas automáticamente
./scripts/verify-doc-structure.sh . fix
```

**Funcionalidades**:

- Verifica que solo README.md esté en la raíz
- Comprueba la estructura de carpetas en \_docs/
- Genera reportes automáticos de estado
- Puede corregir problemas de ubicación automáticamente

### 🏗️ Scripts de Configuración e Infraestructura

#### `create_central_repo.sh`

**Propósito**: Crear repositorio centralizado de documentación SICORA

**Uso**:

```bash
./scripts/create_central_repo.sh
```

**Funcionalidades**:

- Establece estructura base como SSOT (Single Source of Truth)
- Inicializa repositorio Git
- Crea estructura de directorios
- Configura archivos base

#### `migration_script.sh`

**Propósito**: Migrar documentación existente a repositorio centralizado

**Uso**:

```bash
./scripts/migration_script.sh
```

**Funcionalidades**:

- Migra documentación existente sin pérdida de información
- Crea backups de seguridad antes de migrar
- Preserva estructura y metadatos
- Valida integridad después de la migración

### � Scripts de Análisis de Código

#### `run-sonar-analysis.sh` ⚠️ **DESACTIVADO TEMPORALMENTE**

**Estado**: Desactivado temporalmente (Enero 2026) - Consumo excesivo de recursos durante desarrollo

**Propósito**: Ejecutar análisis SonarQube en todo el proyecto SICORA

**Uso** (cuando esté activo):

```bash
# Análisis global completo
./scripts/run-sonar-analysis.sh

# Análisis de servicio específico Go
./scripts/run-sonar-analysis.sh go userservice

# Análisis de servicio específico Python
./scripts/run-sonar-analysis.sh python apigateway

# Solo frontend
./scripts/run-sonar-analysis.sh frontend
```

**Para reactivar SonarQube**:

```bash
# Reactivar configuración
mv sonar-project.properties.disabled sonar-project.properties

# Levantar servidor SonarQube
cd sicora-infra/docker && docker compose -f docker-compose.sonarqube.yml up -d
```

**Nota**: SonarQube será reactivado al final del proyecto para análisis completo de calidad de código.

#### `configure-sonarqube.sh`

**Propósito**: Configurar SonarQube para el proyecto (también desactivado temporalmente)

---

### �🔒 Scripts de Respaldo y VCS

#### `setup-vcs-backup-strategy.sh` ⭐ **NUEVO**

**Propósito**: Implementación automática completa de la estrategia de respaldo VCS para SICORA

**Características**:

- ✅ Configuración automática de estructura de respaldos
- ✅ Scripts de mirror de repositorios Git
- ✅ Backup de base de datos PostgreSQL
- ✅ Respaldo de configuraciones y secrets
- ✅ Backup de collections Postman
- ✅ Programación automática con cron jobs
- ✅ Verificación de integridad de respaldos

**Uso**:

```bash
# Instalación completa automática
./scripts/setup-vcs-backup-strategy.sh

# Verificar estado después de instalación
ls -la /backup/sicora/

# Ejecutar backup manual
/backup/sicora/scripts/daily-backup.sh
```

**Documentación**: Ver [README-backup-vcs.md](./README-backup-vcs.md) para guía completa

#### `backup-docs.sh`

**Propósito**: Backup automático específico de documentación SICORA

**Uso**:

```bash
# Ejecutar backup de documentación
./scripts/backup-docs.sh

# Restaurar desde backup
./scripts/backup-docs.sh restore

# Ver estado de backups
./scripts/backup-docs.sh status
```

**Funcionalidades**:

- Respaldo automático de cambios en documentación
- Opción de restaurar a partir de backups
- Verificación de estado e integridad de backups
- Integración con la estrategia de respaldo VCS

## 🎯 Principios de Organización

### 1. **Centralización**

- Todos los scripts están en `/scripts/` (no en la raíz)
- Documentación clara del propósito de cada script
- Versionado y mantenimiento centralizado

### 2. **Nomenclatura Consistente**

- Nombres descriptivos en inglés
- Guiones para separar palabras (`script-name.sh`)
- Extensión `.sh` para scripts de bash

### 3. **Documentación**

- Cada script tiene comentarios explicativos
- Ejemplos de uso en este README
- Parámetros y opciones documentadas

### 4. **Mantenibilidad**

- Scripts modulares y reutilizables
- Manejo de errores implementado
- Logs y output informativos

## 📖 Cómo Usar los Scripts

### Permisos de Ejecución

Antes de usar cualquier script, asegúrate de que sea ejecutable:

```bash
chmod +x scripts/nombre-del-script.sh
```

### Ejecución desde la Raíz del Proyecto

Todos los scripts están diseñados para ejecutarse desde la raíz del proyecto:

```bash
# Desde /sicora-app/
./scripts/verify-doc-structure.sh
./scripts/create_central_repo.sh
./scripts/migration_script.sh
```

### Ayuda y Documentación

La mayoría de scripts incluyen ayuda integrada:

```bash
./scripts/nombre-del-script.sh --help
# o
./scripts/nombre-del-script.sh help
```

## 🔄 Mantenimiento de Scripts

### Agregar Nuevos Scripts

1. Crear el script en `/scripts/`
2. Hacer ejecutable: `chmod +x scripts/nuevo-script.sh`
3. Documentar en este README
4. Incluir comentarios explicativos en el script
5. Probar desde la raíz del proyecto

### Modificar Scripts Existentes

1. Mantener compatibilidad hacia atrás cuando sea posible
2. Actualizar documentación si cambian parámetros
3. Probar en entorno de desarrollo antes de commit
4. Mantener formato consistente de logs

### Eliminar Scripts

1. Verificar que no sea usado por otros scripts o procesos
2. Actualizar este README
3. Considerar deprecación gradual para scripts críticos

## 🚨 Buenas Prácticas

### Para Desarrolladores

- **Siempre ejecutar desde la raíz**: Los scripts asumen esta ubicación
- **Revisar logs**: Los scripts proporcionan información detallada
- **Hacer backup**: Especialmente al usar scripts de migración
- **Probar en desarrollo**: Antes de ejecutar en producción

### Para Administradores

- **Monitorear ejecuciones**: Especialmente scripts automatizados
- **Mantener permisos**: Solo usuarios autorizados deben ejecutar ciertos scripts
- **Revisar logs regularmente**: Para detectar problemas temprano

## 📝 Historial de Cambios

### v1.0.0 (3 de julio de 2025)

- Organización inicial de scripts en carpeta dedicada
- Creación de documentación unificada
- Movimiento de scripts de la raíz a /scripts/
- Establecimiento de principios de organización

## 🔗 Scripts Relacionados en Otros Módulos

### Frontend (`sicora-app-fe/scripts/`)

- Scripts específicos del frontend React
- Herramientas de desarrollo y build
- Scripts de verificación de integración

### Backend Go (`sicora-be-go/userservice/scripts/`)

- Scripts de desarrollo para Go
- Herramientas de testing y deployment
- Scripts de base de datos

### Servidor MCP (`sicora-mcp-server/scripts/`)

- Scripts de configuración MCP
- Herramientas de desarrollo MCP
- Scripts de setup automático

---

**Nota**: Esta organización sigue los mismos principios aplicados a la documentación SICORA, manteniendo la raíz del proyecto limpia y organizando recursos por funcionalidad.
