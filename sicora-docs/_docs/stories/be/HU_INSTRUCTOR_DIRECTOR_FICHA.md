# 📚 **HISTORIAS DE USUARIO - INSTRUCTOR DIRECTOR DE FICHA**

**Módulo:** UserService / AcadService  
**Fecha:** 12 de julio de 2025  
**Versión:** 1.0  
**Estado:** 📋 Planificación

---

## 📋 **DOCUMENTACIÓN DE REFERENCIA**

- **[RF Gestión Fichas y Aprendices](../../general/rf_gestion_fichas_aprendices.md)**: Requisitos funcionales específicos
- **[Especificación de Endpoints API](../../api/endpoints_specification.md)**: Contratos técnicos
- **[Formato CSV Programas](../../../_docs/guias/FORMATO_CSV_PROGRAMAS_FORMACION.md)**: Especificación de formatos

---

## 🎯 **ALINEACIÓN CON REQUISITOS FUNCIONALES**

Este documento implementa las historias de usuario correspondientes a los siguientes RF:

- **RF-FICHA-001**: Asignación de Instructor Director
- **RF-FICHA-002**: Carga Individual de Aprendiz
- **RF-FICHA-003**: Carga Masiva de Aprendices por Instructor
- **RF-FICHA-004**: Restricción de Carga para Administradores
- **RF-FICHA-005**: Plantilla de Carga Descargable
- **RF-FICHA-006**: Auditoría de Carga de Aprendices

---

## 📊 **PROGRESO POR CATEGORÍA**

| Categoría                      | Historias | Completadas | Progreso |
| ------------------------------ | --------- | ----------- | -------- |
| **Asignación de Director**     | 2         | 0           | 0%       |
| **Carga de Aprendices**        | 4         | 0           | 0%       |
| **Plantillas y Herramientas**  | 2         | 0           | 0%       |
| **Restricciones y Seguridad**  | 2         | 0           | 0%       |

---

## 🏗️ **ÉPICA: ASIGNACIÓN DE INSTRUCTOR DIRECTOR**

### **HU-FICHA-001: Asignación de Director de Ficha**

**Historia:**

- **Como** Coordinador Académico
- **Quiero** asignar un instructor como "Director de Ficha" para cada ficha de formación
- **Para** que tenga la responsabilidad de gestionar los aprendices de esa ficha

**Criterios de Aceptación:**

#### **AC-FICHA-001.1: Interfaz de Asignación**

- Vista de detalle de ficha con sección "Director de Ficha"
- Buscador de instructores con autocompletado
- Filtro de instructores por programa de formación
- Indicador visual de instructor actualmente asignado
- Confirmación antes de cambiar director

#### **AC-FICHA-001.2: Validaciones de Asignación**

- Solo instructores con contrato vigente pueden ser asignados
- El instructor debe pertenecer al programa de la ficha
- Una ficha solo puede tener UN director activo
- Bloquear asignación si instructor tiene más de X fichas (configurable)

#### **AC-FICHA-001.3: Notificaciones**

- Email al instructor al ser asignado como director
- Notificación in-app al instructor
- Registro en historial de la ficha

#### **AC-FICHA-001.4: Auditoría**

- Registro de quién asignó, cuándo y a quién
- Historial de cambios de director visible

**Prioridad:** 🔴 Alta  
**Estimación:** 5 story points  
**Stack:** Backend Go/Python + Frontend React

---

### **HU-FICHA-002: Visualización de Fichas Asignadas**

**Historia:**

- **Como** Instructor
- **Quiero** ver claramente las fichas donde soy director
- **Para** saber cuáles puedo gestionar y cargar aprendices

**Criterios de Aceptación:**

#### **AC-FICHA-002.1: Dashboard del Instructor**

- Widget "Mis Fichas como Director" en dashboard
- Contador de aprendices por ficha
- Estado de cada ficha (activa, finalizada, suspendida)
- Acceso rápido a gestión de cada ficha

#### **AC-FICHA-002.2: Listado de Fichas**

- Filtro "Solo mis fichas como director"
- Indicador visual distintivo en fichas donde es director
- Acciones de gestión solo habilitadas para fichas propias

**Prioridad:** 🟡 Media  
**Estimación:** 3 story points  
**Stack:** Frontend React

---

## 🏗️ **ÉPICA: CARGA DE APRENDICES**

### **HU-FICHA-003: Carga Individual de Aprendiz**

**Historia:**

- **Como** Instructor Director de Ficha
- **Quiero** agregar aprendices individualmente a mi ficha
- **Para** registrar estudiantes que se incorporan durante el trimestre

**Criterios de Aceptación:**

#### **AC-FICHA-003.1: Formulario de Registro**

- Formulario con todos los campos requeridos (documento, nombres, apellidos, email, etc.)
- Validación en tiempo real de campos
- Verificación de documento único antes de enviar
- Verificación de email único antes de enviar

#### **AC-FICHA-003.2: Tipos de Documento**

- Selección de tipo de documento: CC, TI, CE, PPT
- Validación de formato según tipo seleccionado
- Máscara de entrada para cada tipo

#### **AC-FICHA-003.3: Creación de Usuario**

- Usuario creado con rol APRENDIZ automáticamente
- Ficha_id asignada automáticamente (ficha del instructor)
- Contraseña temporal generada o link de activación
- Email de bienvenida con credenciales

#### **AC-FICHA-003.4: Confirmación y Feedback**

- Mensaje de éxito con datos del aprendiz creado
- Opción de agregar otro aprendiz inmediatamente
- Actualización del contador de aprendices en ficha

**Prioridad:** 🔴 Alta  
**Estimación:** 5 story points  
**Stack:** Backend Go/Python + Frontend React

---

### **HU-FICHA-004: Carga Masiva de Aprendices**

**Historia:**

- **Como** Instructor Director de Ficha
- **Quiero** cargar múltiples aprendices mediante archivo Excel/CSV
- **Para** registrar eficientemente la nómina completa de mi ficha al inicio del trimestre

**Criterios de Aceptación:**

#### **AC-FICHA-004.1: Interfaz de Carga**

- Pantalla dedicada "Carga Masiva de Aprendices"
- Selector de ficha (solo fichas donde es director)
- Zona de drag & drop para archivo
- Botón de selección de archivo alternativo
- Indicador de progreso de carga

#### **AC-FICHA-004.2: Formatos Soportados**

- CSV con encoding UTF-8 y BOM
- Excel .xlsx (Excel 2007+)
- Excel .xls (legacy, opcional)
- Detección automática de formato

#### **AC-FICHA-004.3: Validación Pre-carga**

- Validación de estructura del archivo
- Verificación de headers esperados
- Detección de columnas faltantes
- Preview de primeras 10 filas

#### **AC-FICHA-004.4: Validación de Registros**

- Validación de cada registro contra reglas de negocio
- Verificación de documentos únicos (archivo + BD)
- Verificación de emails únicos (archivo + BD)
- Detección de duplicados dentro del archivo
- Informe detallado de errores por fila

#### **AC-FICHA-004.5: Pantalla de Confirmación**

- Resumen de validación:
  - ✅ Registros válidos para carga
  - ⚠️ Registros con advertencias
  - ❌ Registros con errores (no se cargarán)
- Tabla con detalle de cada registro y su estado
- Opción de descargar reporte de errores
- Botón "Confirmar carga" solo si hay registros válidos

#### **AC-FICHA-004.6: Procesamiento**

- Carga transaccional (todo o nada por lote)
- O carga parcial con reporte (configurab,le)
- Progress bar durante procesamiento
- Posibilidad de cancelar si tarda demasiado

#### **AC-FICHA-004.7: Resultados**

- Pantalla de resultados con resumen
- Lista de aprendices creados exitosamente
- Lista de registros fallidos con motivo
- Descarga de reporte completo en Excel
- Email con resumen al instructor

**Prioridad:** 🔴 Alta  
**Estimación:** 13 story points  
**Stack:** Backend Go/Python + Frontend React

---

### **HU-FICHA-005: Descarga de Plantilla de Carga**

**Historia:**

- **Como** Instructor Director de Ficha
- **Quiero** descargar una plantilla con el formato correcto para carga masiva
- **Para** asegurar que mis archivos sean compatibles con el sistema

**Criterios de Aceptación:**

#### **AC-FICHA-005.1: Botón de Descarga**

- Botón "Descargar Plantilla" visible en pantalla de carga masiva
- Selector de formato (CSV / Excel)
- Descarga inmediata sin navegación

#### **AC-FICHA-005.2: Contenido de Plantilla CSV**

```csv
tipo_documento,documento,nombres,apellidos,email,telefono,fecha_nacimiento
CC,1234567890,Juan Carlos,García López,juan.garcia@ejemplo.com,3001234567,2005-03-15
```

- Primera fila con headers exactos
- Segunda fila con ejemplo de datos válidos
- Encoding UTF-8 con BOM

#### **AC-FICHA-005.3: Contenido de Plantilla Excel**

- Hoja "Datos" con headers y ejemplo
- Hoja "Instrucciones" con guía detallada
- Validaciones de datos en celdas:
  - Lista desplegable para tipo_documento
  - Formato de fecha en columna fecha_nacimiento
  - Formato de email en columna email

**Prioridad:** 🟡 Media  
**Estimación:** 3 story points  
**Stack:** Backend Go/Python

---

### **HU-FICHA-006: Historial de Cargas**

**Historia:**

- **Como** Instructor Director de Ficha
- **Quiero** ver el historial de cargas de aprendices que he realizado
- **Para** auditar mis operaciones y resolver discrepancias

**Criterios de Aceptación:**

#### **AC-FICHA-006.1: Vista de Historial**

- Listado de operaciones de carga ordenadas por fecha
- Filtros por tipo (individual/masiva), fecha, ficha
- Información mostrada:
  - Fecha y hora
  - Ficha destino
  - Tipo de operación
  - Registros procesados / exitosos / fallidos
  - Archivo origen (si aplica)

#### **AC-FICHA-006.2: Detalle de Carga**

- Click en registro muestra detalle completo
- Lista de aprendices cargados en esa operación
- Errores registrados (si hubo)
- Opción de descargar reporte original

**Prioridad:** 🟢 Baja  
**Estimación:** 5 story points  
**Stack:** Backend Go/Python + Frontend React

---

## 🏗️ **ÉPICA: RESTRICCIONES Y SEGURIDAD**

### **HU-FICHA-007: Restricción de Carga para Administrador**

**Historia:**

- **Como** Administrador del Sistema
- **Quiero** NO tener acceso a carga de aprendices
- **Para** mantener la segregación de responsabilidades y evitar errores masivos

**Criterios de Aceptación:**

#### **AC-FICHA-007.1: Menú sin Opción de Carga**

- Rol ADMIN no ve menú "Carga de Aprendices"
- Rol ADMIN no ve botón "Agregar Aprendiz" en vistas de ficha
- Rol ADMIN no ve opción "Carga Masiva"

#### **AC-FICHA-007.2: Protección de API**

- Endpoints de carga rechazan requests de rol ADMIN
- Respuesta 403 Forbidden con mensaje claro
- Log de intento de acceso no autorizado

#### **AC-FICHA-007.3: Permisos de Solo Lectura**

- ADMIN puede ver listado de fichas
- ADMIN puede ver detalle de ficha y sus aprendices
- ADMIN puede ver reportes de carga
- ADMIN NO puede modificar asignaciones de aprendices

**Prioridad:** 🔴 Alta  
**Estimación:** 3 story points  
**Stack:** Backend Go/Python + Frontend React

---

### **HU-FICHA-008: Validación de Propiedad de Ficha**

**Historia:**

- **Como** Sistema
- **Quiero** validar que el instructor solo pueda cargar aprendices a sus fichas asignadas
- **Para** prevenir acceso no autorizado a otras fichas

**Criterios de Aceptación:**

#### **AC-FICHA-008.1: Validación en Backend**

- Toda operación de carga valida que usuario sea director de la ficha
- Comparación entre user_id del token y director_id de la ficha
- Rechazo con 403 si no coincide

#### **AC-FICHA-008.2: Validación en Frontend**

- Solo mostrar fichas donde usuario es director
- Deshabilitar selectores de fichas no propias
- Mensaje claro si intenta acceder vía URL

#### **AC-FICHA-008.3: Logging de Intentos**

- Registrar intentos de acceso a fichas no propias
- Alertar a seguridad si hay patrones sospechosos

**Prioridad:** 🔴 Alta  
**Estimación:** 3 story points  
**Stack:** Backend Go/Python

---

## 🔗 **DEPENDENCIAS TÉCNICAS**

### **APIs Requeridas (Backend Go):**

```
POST   /api/v1/fichas/{id}/director          # Asignar director
GET    /api/v1/instructor/fichas             # Fichas del instructor actual
POST   /api/v1/fichas/{id}/aprendices        # Carga individual
POST   /api/v1/fichas/{id}/aprendices/bulk   # Carga masiva
GET    /api/v1/fichas/{id}/aprendices/template # Descargar plantilla
GET    /api/v1/instructor/cargas             # Historial de cargas
```

### **APIs Requeridas (Backend Python):**

```
POST   /api/v1/admin/fichas/{id}/director
GET    /api/v1/instructor/fichas
POST   /api/v1/fichas/{id}/aprendices
POST   /api/v1/fichas/{id}/aprendices/upload
GET    /api/v1/fichas/{id}/aprendices/template
GET    /api/v1/instructor/cargas
```

### **Componentes Frontend Requeridos:**

- `FichaDirectorAssignment.tsx` - Asignación de director
- `InstructorFichasWidget.tsx` - Widget dashboard
- `AprendizForm.tsx` - Formulario individual
- `BulkUploadAprendices.tsx` - Carga masiva
- `UploadPreview.tsx` - Preview de carga
- `CargaHistorial.tsx` - Historial de cargas

---

## 📝 **NOTAS DE IMPLEMENTACIÓN**

### **Formato CSV Estándar:**

```csv
tipo_documento,documento,nombres,apellidos,email,telefono,fecha_nacimiento
CC,1234567890,Juan Carlos,García López,juan.garcia@email.com,3001234567,2005-03-15
TI,987654321,María Fernanda,Rodríguez Pérez,maria.rodriguez@email.com,3109876543,2006-08-22
```

### **Respuesta de Validación (JSON):**

```json
{
  "total_registros": 50,
  "validos": 45,
  "con_errores": 5,
  "duplicados": 2,
  "errores": [
    {
      "fila": 3,
      "campo": "documento",
      "valor": "123",
      "error": "Documento ya existe en sistema"
    },
    {
      "fila": 7,
      "campo": "email",
      "valor": "invalido",
      "error": "Formato de email inválido"
    }
  ]
}
```

---

## 📊 **DIAGRAMA DE FLUJO**

Ver diagrama completo en: [flujo-carga-aprendices-ficha.svg](../../../assets/flujos/flujo-carga-aprendices-ficha.svg)

---

## 📝 **HISTORIAL DE CAMBIOS**

| Versión | Fecha      | Autor               | Cambios                    |
| ------- | ---------- | ------------------- | -------------------------- |
| 1.0     | 2025-07-12 | Copilot + Equipo TI | Documento inicial          |
