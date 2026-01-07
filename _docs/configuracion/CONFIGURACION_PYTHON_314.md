# ⚙️ Configuración Python 3.14+ - SICORA Backend

## 📋 Resumen

A partir de **Enero 2026**, el backend Python de SICORA requiere **Python 3.14 o superior**.

## 🔧 Archivos de Configuración Actualizados

### `.python-version`

```
3.14
```

### `pyproject.toml`

```toml
requires-python = ">=3.14"

[tool.black]
target-version = ["py314"]

[tool.isort]
py_version = 314

[tool.mypy]
python_version = "3.14"
```

### `requirements.txt`

- Todas las dependencias usan versiones flexibles (`>=`) para mejor compatibilidad con Python 3.14

## 🐳 Dockerfiles

Todos los servicios usan la imagen base `python:3.14-slim`:

| Servicio           | Imagen             |
| ------------------ | ------------------ |
| userservice        | `python:3.14-slim` |
| scheduleservice    | `python:3.14-slim` |
| attendanceservice  | `python:3.14-slim` |
| evalinservice      | `python:3.14-slim` |
| projectevalservice | `python:3.14-slim` |
| kbservice          | `python:3.14-slim` |
| aiservice          | `python:3.14-slim` |
| apigateway         | `python:3.14-slim` |

## ⚠️ Cambios de Compatibilidad Python 3.14

### Dataclasses - Orden de Campos Estricto

Python 3.14 es más estricto con el orden de campos en dataclasses:

- **Campos sin valor por defecto** deben ir **antes** de campos con valor por defecto

**❌ Incorrecto (Python < 3.14 permitía esto):**

```python
@dataclass
class Entity:
    name: str
    optional_field: str = None  # Con default
    created_at: datetime        # Sin default - ERROR en 3.14
```

**✅ Correcto (Python 3.14+):**

```python
@dataclass
class Entity:
    name: str
    created_at: datetime        # Sin default primero
    optional_field: str = None  # Con default después
```

### Servicios Corregidos

Los siguientes archivos fueron actualizados para compatibilidad Python 3.14:

- `projectevalservice/app/domain/entities/stakeholder.py`
- `projectevalservice/app/domain/entities/deliverable.py`
- `projectevalservice/app/domain/entities/change_request.py`

## 📦 Dependencias Principales

| Paquete    | Versión Mínima | Notas                        |
| ---------- | -------------- | ---------------------------- |
| fastapi    | >=0.128.0      | Soporte completo Python 3.14 |
| pydantic   | >=2.10.3       | Validación moderna           |
| sqlalchemy | >=2.0.36       | ORM async completo           |
| uvicorn    | >=0.34.0       | Servidor ASGI                |
| pytest     | >=8.3.4        | Testing async                |

## 🚀 Instalación Local

```bash
# Verificar versión de Python
python3 --version  # Debe ser 3.14+

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

## 🔄 Migración desde Python 3.13

Si estás migrando desde Python 3.13:

1. **Actualizar Python** a 3.14+
2. **Recrear entorno virtual** (los venv no son portables entre versiones)
3. **Verificar dataclasses** - Asegurar orden correcto de campos
4. **Ejecutar tests** - Validar compatibilidad

```bash
# Eliminar venv antiguo
rm -rf venv

# Crear nuevo con Python 3.14
python3.14 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Verificar
pytest tests/ -v
```

---

**Fecha de actualización**: 6 de Enero 2026  
**Versión Python requerida**: 3.14+
