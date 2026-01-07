# 🐘 Configuración PostgreSQL 18 - SICORA

## 📋 Resumen

A partir de **Enero 2026**, SICORA utiliza **PostgreSQL 18** de forma unificada en todos los entornos.

## 🔧 Imagen Docker Utilizada

```yaml
image: postgres:18-alpine
```

**¿Por qué Alpine?**

- Imagen más ligera (~80MB vs ~400MB)
- Menor superficie de ataque
- Tiempos de pull más rápidos
- Suficiente para entornos de desarrollo y producción

## 📦 Archivos Actualizados

### Docker Compose Files

| Archivo                       | Ubicación                           |
| ----------------------------- | ----------------------------------- |
| docker-compose.prod.yml       | `/sicora-app/`                      |
| docker-compose.test.yml       | `/sicora-app/`                      |
| docker-compose.yml            | `/sicora-be-python/`                |
| docker-compose.staging.yml    | `/sicora-be-python/deployment/`     |
| docker-compose.production.yml | `/sicora-be-python/deployment/`     |
| docker-compose.yml            | `/sicora-be-go/`                    |
| docker-compose.infra.yml      | `/sicora-be-go/`                    |
| docker-compose.yml            | `/sicora-be-go/attendanceservice/`  |
| docker-compose.yml            | `/sicora-infra/docker/`             |
| docker-compose.yml            | `/sicora-infra/docker/development/` |
| docker-compose.base.yml       | `/sicora-infra/docker/development/` |

### CI/CD Workflows

| Archivo                       | Jobs Actualizados                    |
| ----------------------------- | ------------------------------------ |
| `.github/workflows/ci-cd.yml` | test-backend-go, test-backend-python |

## 🆕 Novedades PostgreSQL 18

### Mejoras de Rendimiento

- **Mejoras en paralelismo** para consultas complejas
- **Optimización de índices** B-tree y GiST
- **Mejor gestión de memoria** para grandes datasets

### Nuevas Características

- **Soporte mejorado para JSON/JSONB**
- **Funciones de ventana extendidas**
- **Mejor compresión de datos**

### Compatibilidad

- Totalmente compatible con SQLAlchemy 2.x
- Soporte completo para asyncpg
- Compatible con todas las migraciones Alembic existentes

## 🔄 Migraciones

### Verificación de Compatibilidad

Las migraciones de SICORA utilizan operaciones estándar de SQLAlchemy/Alembic:

```python
# Operaciones compatibles con PostgreSQL 18
op.add_column('table', sa.Column(...))
op.alter_column('table', 'column', ...)
op.drop_column('table', 'column')
op.create_index(...)
op.create_foreign_key(...)
```

**✅ No se requieren cambios en las migraciones existentes**

### Migraciones Existentes

| Servicio    | Archivos de Migración                              |
| ----------- | -------------------------------------------------- |
| userservice | `0ae0543a8c9e_initial_user_table.py`               |
| userservice | `84dd0011bf4f_add_phone_and_deleted_at_fields.py`  |
| userservice | `4c86f6243723_mark_complete_userservice_schema.py` |

## 🚀 Migración desde PostgreSQL 15

### Para Desarrollo Local

```bash
# 1. Detener contenedores actuales
docker compose down

# 2. Eliminar volumen de datos (⚠️ SOLO EN DESARROLLO)
docker volume rm sicora_postgres_data

# 3. Reiniciar con PostgreSQL 18
docker compose up -d postgres

# 4. Ejecutar migraciones
cd sicora-be-python/userservice
alembic upgrade head
```

### Para Producción

```bash
# 1. Crear backup completo
pg_dump -h localhost -U sicora_user -d sicora_prod > backup_pre_pg18.sql

# 2. Detener servicios
docker compose down

# 3. Actualizar imagen en docker-compose.yml
# image: postgres:18-alpine

# 4. Iniciar nuevo contenedor
docker compose up -d postgres

# 5. Restaurar datos
psql -h localhost -U sicora_user -d sicora_prod < backup_pre_pg18.sql

# 6. Verificar
psql -h localhost -U sicora_user -d sicora_prod -c "SELECT version();"
```

## ⚙️ Configuración Recomendada

### Variables de Entorno

```bash
# Base de datos
POSTGRES_DB=sicora_dev
POSTGRES_USER=sicora_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Conexión asyncpg (Python)
DATABASE_URL=postgresql+asyncpg://sicora_user:password@postgres:5432/sicora_dev

# Conexión pgx (Go)
DATABASE_URL=postgres://sicora_user:password@postgres:5432/sicora_dev
```

### Configuración de Pool (Python)

```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,           # Conexiones base
    max_overflow=20,        # Conexiones adicionales
    pool_timeout=30,        # Timeout de espera
    pool_recycle=1800,      # Reciclar cada 30 min
    pool_pre_ping=True,     # Verificar conexiones
)
```

## 🧪 Verificación

### Comprobar Versión

```bash
# En el contenedor
docker exec -it sicora-postgres psql -U sicora_user -d sicora_dev -c "SELECT version();"

# Debería mostrar: PostgreSQL 18.x
```

### Test de Conexión (Python)

```python
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_connection():
    engine = create_async_engine("postgresql+asyncpg://...")
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT version()"))
        print(result.scalar())

asyncio.run(test_connection())
```

## 📊 Comparativa de Versiones

| Característica      | PostgreSQL 15 | PostgreSQL 18 |
| ------------------- | ------------- | ------------- |
| Compresión LZ4      | ✅            | ✅ Mejorada   |
| Parallel Query      | ✅            | ✅ Optimizada |
| JSON/JSONB          | ✅            | ✅ Extendido  |
| Logical Replication | ✅            | ✅ Mejorada   |
| Partitioning        | ✅            | ✅ Optimizado |

## 🔗 Scripts de Utilidad

### Enforcement Script

```bash
# Ubicación: /sicora-infra/scripts/enforce-postgresql18.sh
./enforce-postgresql18.sh
```

Este script actualiza todas las referencias a PostgreSQL 18 en el proyecto.

---

**Fecha de actualización**: 6 de Enero 2026  
**Versión PostgreSQL**: 18 (Alpine)  
**Compatibilidad**: Python 3.14+, Go 1.21+, Node.js 20+
