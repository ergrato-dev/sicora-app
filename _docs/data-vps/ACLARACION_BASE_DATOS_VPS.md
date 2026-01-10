# ACLARACIÓN: BASE DE DATOS CANÓNICA PARA VPS

## 🚨 SITUACIÓN ACTUAL

Basado en el análisis de la configuración del VPS, hemos identificado **CONFUSIÓN** entre dos bases de datos:

### Bases de Datos Detectadas:

1. **`onevision_testing`** - Donde hemos estado trabajando con datos poblados
2. **`sicora_dev`** - Configurada en el archivo `.env` actual
3. **`postgres`** - Base de datos por defecto del sistema

## 📋 CONFIGURACIÓN ACTUAL

### Archivo `.env` en `/sicora-infra/docker/.env`:

```env
POSTGRES_DB=sicora_dev
POSTGRES_USER=sicora_user
POSTGRES_PASSWORD=sicora_password
```

### Docker Compose en `/sicora-infra/docker/docker-compose.yml`:

- Usa: `${POSTGRES_DB:-sicora_dev}` con fallback a `sicora_dev`
- Con `.env` actual resuelve a: `sicora_dev`
- Puerto: `5433:5432` (pero el contenedor corriendo usa puerto 5432)

### Contenedor PostgreSQL Activo:

```bash
Container: sicora-postgres
Port: 5432
Environment:
  POSTGRES_USER=sicora_user
  POSTGRES_PASSWORD=sicora_password
  POSTGRES_DB=sicora_dev
```

## 🔍 ANÁLISIS DE DATOS

### Base de Datos `onevision_testing`:

- **TIENE** datos poblados históricos
- **TIENE** esquemas de microservicios
- **Es donde** hemos estado trabajando anteriormente

### Base de Datos `sicora_dev`:

- **Configurada** en .env actual
- **Sin verificar** si tiene datos poblados
- **Es la** que debería usar según configuración

## ❓ PREGUNTA CRÍTICA

**¿Cuál es la base de datos canónica para el VPS?**

### Opciones:

#### Opción A: Usar `sicora_dev` (Según .env actual)

- ✅ Coincide con configuración actual
- ❌ Requiere migrar/repoblar todos los datos
- ❌ Perdemos trabajo en `onevision_testing`

#### Opción B: Cambiar a `onevision_testing`

- ✅ Mantiene datos existentes
- ✅ Continúa trabajo previo
- ❌ Requiere cambiar configuración .env

#### Opción C: Fusionar bases de datos

- ✅ Combina lo mejor de ambas
- ❌ Proceso complejo de migración
- ❌ Riesgo de duplicación

## 🎯 RECOMENDACIÓN

**OPCIÓN B: Cambiar configuración a `onevision_testing`**

### Razones:

1. **Datos existentes**: Ya tiene información poblada
2. **Trabajo previo**: Evita perder progreso realizado
3. **Menos riesgo**: No requiere repoblar desde cero
4. **Consistencia**: Mantiene el estado actual funcional

### Acción Requerida:

```bash
# Cambiar en /sicora-infra/docker/.env
POSTGRES_DB=onevision_testing
```

## 📝 SIGUIENTE PASO

**DECISIÓN REQUERIDA**:
¿Confirmas que usemos `onevision_testing` como base de datos canónica?

Si es así, actualizaremos:

1. Archivo `.env`
2. Scripts de población
3. Documentación
4. Configuraciones de microservicios

---

**Fecha**: 21 de julio de 2025
**Estado**: PENDIENTE CONFIRMACIÓN
**Prioridad**: CRÍTICA - Bloquea poblado de datos
