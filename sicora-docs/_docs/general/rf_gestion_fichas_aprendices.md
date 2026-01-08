# 📋 **REQUISITOS FUNCIONALES - GESTIÓN DE FICHAS Y APRENDICES**

**Sistema:** SICORA - Sistema de Información de Coordinación Académica  
**Módulo:** UserService / AcadService  
**Fecha:** 12 de julio de 2025  
**Versión:** 1.0  
**Estado:** ✅ Aprobado

---

## 🎯 **RESUMEN EJECUTIVO**

Este documento define los requisitos funcionales para la gestión de fichas de formación y la carga de aprendices en el sistema SICORA, estableciendo las responsabilidades de cada rol y los mecanismos de carga masiva permitidos.

---

## 📜 **REGLAS DE NEGOCIO FUNDAMENTALES**

### **RN-FICHA-001: Responsabilidad de Carga Trimestral**

> **La carga trimestral de aprendices por ficha la realizará ÚNICAMENTE el instructor asignado como "Director de Ficha" por la Coordinación Académica.**

#### **Justificación:**

- Descentralización de la gestión de aprendices
- Responsabilidad directa del instructor sobre su grupo
- Reducción de errores por conocimiento directo del contexto
- Trazabilidad clara de acciones por ficha

### **RN-FICHA-002: Prohibición de Carga Masiva Global**

> **El Administrador del Sistema NO puede realizar cargas masivas globales de aprendices para todas las fichas.**

#### **Justificación:**

- Prevención de errores masivos en datos de aprendices
- Segregación de responsabilidades
- Control granular por ficha
- Auditoría y trazabilidad mejoradas

### **RN-FICHA-003: Alcance de Carga Masiva por Instructor**

> **Cada Instructor Director de Ficha SÍ puede realizar carga masiva de aprendices, pero ÚNICAMENTE para las fichas asignadas a él.**

#### **Formatos permitidos:**

- Excel (.xlsx, .xls)
- CSV con formato preestablecido UTF-8

---

## 🏗️ **REQUISITOS FUNCIONALES**

### **RF-FICHA-001: Asignación de Instructor Director**

**Descripción:** El sistema debe permitir a la Coordinación Académica asignar un instructor como "Director de Ficha" para cada ficha de formación.

**Actores:** Coordinador Académico

**Precondiciones:**

- Ficha creada y activa en el sistema
- Instructor con rol válido y estado activo
- Usuario autenticado con rol COORDINADOR

**Flujo Principal:**

1. Coordinador selecciona ficha desde listado
2. Sistema muestra detalles de la ficha
3. Coordinador busca y selecciona instructor
4. Sistema asigna instructor como director
5. Sistema notifica al instructor asignado
6. Sistema registra en auditoría

**Postcondiciones:**

- Ficha tiene instructor director asignado
- Instructor recibe permiso de carga de aprendices para esa ficha
- Registro en auditoría con timestamp, usuario y ficha

**Validaciones:**

- Una ficha solo puede tener UN instructor director activo
- El instructor debe pertenecer al programa de formación de la ficha
- El instructor debe tener contrato vigente

---

### **RF-FICHA-002: Carga Individual de Aprendiz**

**Descripción:** El sistema debe permitir al Instructor Director agregar aprendices individualmente a su ficha asignada.

**Actores:** Instructor Director de Ficha

**Precondiciones:**

- Instructor autenticado con rol INSTRUCTOR
- Instructor es director de la ficha destino
- Ficha en estado activo y con cupo disponible

**Flujo Principal:**

1. Instructor accede a gestión de su ficha
2. Sistema valida que es director de esa ficha
3. Instructor ingresa datos del aprendiz
4. Sistema valida datos (documento único, email único, formato)
5. Sistema crea usuario con rol APRENDIZ y ficha_id asignado
6. Sistema registra en auditoría

**Datos Requeridos:**

| Campo           | Tipo   | Obligatorio | Validación                                    |
| --------------- | ------ | ----------- | --------------------------------------------- |
| tipo_documento  | String | ✅          | CC, TI, CE, PPT                               |
| documento       | String | ✅          | Único en sistema, formato según tipo          |
| nombres         | String | ✅          | Min 2 caracteres                              |
| apellidos       | String | ✅          | Min 2 caracteres                              |
| email           | String | ✅          | Formato email válido, único en sistema        |
| telefono        | String | ❌          | Formato válido Colombia                       |
| fecha_nacimiento| Date   | ✅          | Edad mínima según normativa OneVision         |

**Postcondiciones:**

- Aprendiz creado con rol APRENDIZ
- Aprendiz asignado a la ficha del instructor
- Credenciales generadas (contraseña temporal o link de activación)

---

### **RF-FICHA-003: Carga Masiva de Aprendices por Instructor**

**Descripción:** El sistema debe permitir al Instructor Director cargar múltiples aprendices mediante archivo Excel/CSV para su ficha asignada.

**Actores:** Instructor Director de Ficha

**Precondiciones:**

- Instructor autenticado con rol INSTRUCTOR
- Instructor es director de la ficha destino
- Ficha en estado activo
- Archivo en formato válido (CSV UTF-8 o Excel)

**Flujo Principal:**

1. Instructor accede a "Carga Masiva" de su ficha
2. Sistema muestra solo fichas donde es director
3. Instructor selecciona ficha destino
4. Sistema valida que instructor es director
5. Instructor sube archivo Excel/CSV
6. Sistema valida formato del archivo
7. Sistema muestra preview de datos a cargar
8. Sistema valida cada registro:
   - Documento único en sistema
   - Email único en sistema
   - Formato de datos correcto
9. Sistema muestra resumen de validación:
   - Registros válidos para carga
   - Registros con errores (detalle de cada error)
   - Registros duplicados
10. Instructor confirma carga
11. Sistema procesa registros válidos
12. Sistema genera reporte de resultados
13. Sistema registra en auditoría

**Formato CSV Requerido:**

```csv
tipo_documento,documento,nombres,apellidos,email,telefono,fecha_nacimiento
CC,1234567890,Juan Carlos,García López,juan.garcia@email.com,3001234567,2005-03-15
TI,987654321,María Fernanda,Rodríguez Pérez,maria.rodriguez@email.com,3109876543,2006-08-22
```

**Validaciones Batch:**

- Máximo 100 registros por archivo (ajustable por config)
- No duplicados dentro del mismo archivo
- No duplicados contra base de datos existente
- Todos los campos obligatorios presentes
- Formatos de datos correctos

**Postcondiciones:**

- Aprendices válidos creados en sistema
- Todos asignados a la ficha del instructor
- Reporte de carga disponible para descarga
- Registro en auditoría con detalle de carga

**Manejo de Errores:**

- Archivo vacío → Error 400, mensaje descriptivo
- Formato inválido → Error 400, indicar formato esperado
- Duplicados → Lista de registros duplicados, NO se cargan
- Errores parciales → Carga lo válido, reporta lo inválido

---

### **RF-FICHA-004: Restricción de Carga para Administradores**

**Descripción:** El sistema debe IMPEDIR que usuarios con rol Administrador realicen cargas masivas de aprendices para fichas.

**Actores:** Administrador del Sistema

**Flujo:**

1. Administrador NO tiene opción de "Carga Masiva de Aprendices" en su menú
2. Si intenta acceder vía URL directa, sistema deniega acceso
3. API valida que el rol no sea ADMIN para endpoint de carga masiva

**Permisos de Administrador sobre Fichas:**

| Acción                                | Permitido |
| ------------------------------------- | --------- |
| Ver listado de fichas                 | ✅        |
| Ver detalle de ficha                  | ✅        |
| Crear ficha                           | ✅        |
| Editar ficha (datos generales)        | ✅        |
| Asignar instructor director           | ❌ (Solo Coordinador) |
| Cargar aprendices individualmente     | ❌        |
| Carga masiva de aprendices            | ❌        |
| Eliminar aprendiz de ficha            | ❌        |
| Ver reportes de fichas                | ✅        |

---

### **RF-FICHA-005: Plantilla de Carga Descargable**

**Descripción:** El sistema debe proporcionar plantillas descargables para la carga masiva de aprendices.

**Actores:** Instructor Director de Ficha

**Funcionalidad:**

1. Botón "Descargar Plantilla" en pantalla de carga masiva
2. Disponible en formatos:
   - CSV UTF-8 con BOM
   - Excel (.xlsx)
3. Plantilla incluye:
   - Headers con nombres de campos
   - Fila de ejemplo con datos ficticios
   - Instrucciones en hoja separada (Excel)
   - Validaciones en Excel (listas desplegables para tipo_documento)

---

### **RF-FICHA-006: Auditoría de Carga de Aprendices**

**Descripción:** El sistema debe registrar toda operación de carga de aprendices para trazabilidad.

**Datos de Auditoría:**

| Campo             | Descripción                              |
| ----------------- | ---------------------------------------- |
| timestamp         | Fecha y hora UTC                         |
| usuario_id        | ID del instructor que realizó la carga   |
| ficha_id          | ID de la ficha destino                   |
| tipo_operacion    | CARGA_INDIVIDUAL / CARGA_MASIVA          |
| cantidad_total    | Registros procesados                     |
| cantidad_exitosos | Registros cargados exitosamente          |
| cantidad_fallidos | Registros con errores                    |
| archivo_origen    | Nombre del archivo (si aplica)           |
| ip_origen         | IP del cliente                           |
| detalle_errores   | JSON con errores por registro            |

---

## 🔐 **MATRIZ DE PERMISOS POR ROL**

| Funcionalidad                       | Admin | Coordinador | Instructor Director | Instructor | Aprendiz |
| ----------------------------------- | ----- | ----------- | ------------------- | ---------- | -------- |
| Ver listado de fichas               | ✅    | ✅          | Solo asignadas      | ❌         | ❌       |
| Crear ficha                         | ✅    | ✅          | ❌                  | ❌         | ❌       |
| Asignar instructor director         | ❌    | ✅          | ❌                  | ❌         | ❌       |
| Carga individual aprendiz           | ❌    | ❌          | ✅ (sus fichas)     | ❌         | ❌       |
| Carga masiva aprendices             | ❌    | ❌          | ✅ (sus fichas)     | ❌         | ❌       |
| Descargar plantilla                 | ❌    | ❌          | ✅                  | ❌         | ❌       |
| Ver reportes de carga               | ✅    | ✅          | ✅ (sus fichas)     | ❌         | ❌       |
| Eliminar aprendiz de ficha          | ❌    | ✅          | ✅ (sus fichas)     | ❌         | ❌       |
| Transferir aprendiz entre fichas    | ❌    | ✅          | ❌                  | ❌         | ❌       |

---

## 📊 **DIAGRAMA DE FLUJO DE CARGA**

Ver diagrama completo en: [flujo-carga-aprendices-ficha.svg](../../../assets/flujos/flujo-carga-aprendices-ficha.svg)

---

## 🔗 **DEPENDENCIAS**

### **Microservicios Involucrados:**

- **UserService**: Gestión de usuarios, roles y autenticación
- **AcadService**: Gestión de fichas y programas de formación
- **NotificationService**: Notificaciones a instructores y aprendices

### **Integraciones:**

- Validación de documento contra registraduría (futuro)
- Integración con sistema de correo para credenciales
- Exportación de datos a sistemas externos OneVision

---

## 📝 **HISTORIAL DE CAMBIOS**

| Versión | Fecha      | Autor               | Cambios                    |
| ------- | ---------- | ------------------- | -------------------------- |
| 1.0     | 2025-07-12 | Copilot + Equipo TI | Documento inicial aprobado |

---

## ✅ **APROBACIONES**

| Rol                  | Nombre | Fecha      | Estado |
| -------------------- | ------ | ---------- | ------ |
| Product Owner        | -      | -          | ⏳     |
| Coordinación Académica | -    | -          | ⏳     |
| Líder Técnico        | -      | -          | ⏳     |
