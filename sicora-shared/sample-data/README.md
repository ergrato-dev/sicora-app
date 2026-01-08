# 📊 Shared Data - Carga Masiva Multistack

**Propósito**: Directorio compartido para carga masiva de datos accesible por todos los 6 stacks tecnológicos del proyecto SICORA-APP Backend Multistack.

**Última actualización**: 15 de junio de 2025

---

## 🎯 **OBJETIVOS**

### **Consistencia Multistack**
- Todos los stacks acceden a los mismos archivos de datos
- Formato estandarizado de importación/exportación
- Validaciones consistentes independientemente del stack
- Esquemas unificados para todas las entidades

### **Centralización de Datos**
- Única fuente de verdad para datos de prueba
- Templates reutilizables para carga masiva
- Samples consistentes para desarrollo
- Esquemas validados para todas las tecnologías

---

## 📁 **ESTRUCTURA DEL DIRECTORIO**

```
shared-data/
├── 📂 imports/           # Archivos para importación masiva
│   ├── users/           # Datos de usuarios
│   ├── schedules/       # Datos de horarios
│   ├── attendance/      # Datos de asistencia
│   ├── evaluations/     # Datos de evaluaciones
│   ├── knowledge-base/  # Documentos para KB
│   └── ai-training/     # Datos para entrenamiento IA
├── 📂 templates/        # Plantillas CSV/JSON con headers
│   ├── users.csv
│   ├── schedules.csv
│   ├── attendance.csv
│   └── evaluations.csv
├── 📂 exports/          # Datos exportados (por stack)
│   ├── fastapi/
│   ├── go/
│   ├── express/
│   ├── nextjs/
│   ├── java/
│   └── kotlin/
├── 📂 samples/          # Datos de ejemplo para desarrollo
│   ├── small/          # Datasets pequeños (10-100 registros)
│   ├── medium/         # Datasets medianos (1K-10K registros)
│   └── large/          # Datasets grandes (100K+ registros)
├── 📂 schemas/          # Esquemas de validación
│   ├── json-schema/    # JSON Schema para validaciones
│   ├── csv-specs/      # Especificaciones CSV
│   └── api-contracts/  # Contratos de API para bulk operations
└── 📋 README.md         # Este archivo
```

---

## 🔧 **TECNOLOGÍAS SOPORTADAS**

### **Formatos de Datos**
- **CSV**: Importación/exportación masiva
- **JSON**: APIs y intercambio de datos
- **Excel**: Compatibilidad con herramientas de oficina
- **XML**: Sistemas legacy y estándares
- **Parquet**: Datos grandes y análisis

### **Validaciones**
- **JSON Schema**: Validación de estructura
- **CSV Schema**: Validación de archivos CSV
- **Data Types**: Validación de tipos por stack
- **Business Rules**: Reglas de negocio consistentes

---

## 📊 **ENTIDADES SOPORTADAS**

### **🔐 Usuarios (UserService)**
- **Archivos**: `users.csv`, `users.json`
- **Campos**: id, nombre, apellido, email, documento, rol, contraseña, ficha_id, programa
- **Validaciones**: Email único, documento único, políticas de contraseña
- **Reglas OneVision específicas**: 
  - **Aprendices**: OBLIGATORIO ficha_id (7 dígitos), un aprendiz solo puede estar en una ficha
  - **Instructores/Admin/Coordinadores**: ficha_id debe ser null, programa indica especialización
- **Volumen**: Hasta 100K usuarios

> ⚠️ **REGLA DE NEGOCIO CRÍTICA - CARGA DE APRENDICES**
> 
> La carga trimestral de aprendices por ficha la realizará **ÚNICAMENTE el Instructor Director de Ficha** asignado por la Coordinación Académica.
> 
> - ❌ **El Administrador del Sistema NO puede realizar cargas masivas globales de aprendices**
> - ✅ Cada Instructor Director SÍ puede hacer carga masiva de aprendices para SUS fichas asignadas
> - 📄 Formatos permitidos: Excel (.xlsx) o CSV UTF-8 con formato preestablecido
> 
> Ver documentación completa: [RF Gestión Fichas y Aprendices](../../sicora-docs/_docs/general/rf_gestion_fichas_aprendices.md)

### **📅 Horarios (ScheduleService)**
- **Archivos**: `schedules.csv`, `schedules.json`
- **Campos**: id, instructor_id, curso, fecha_inicio, fecha_fin, salon
- **Validaciones**: Conflictos de horario, disponibilidad de instructor
- **Volumen**: Hasta 50K horarios

### **📝 Asistencia (AttendanceService)**
- **Archivos**: `attendance.csv`, `attendance.json`
- **Campos**: id, schedule_id, student_id, timestamp, status
- **Validaciones**: Estudiante matriculado, horario válido
- **Volumen**: Hasta 1M registros de asistencia

### **📊 Evaluaciones (EvalinService)**
- **Archivos**: `evaluations.csv`, `evaluations.json`
- **Campos**: id, instructor_id, student_id, criteria, scores, comments
- **Validaciones**: Criterios válidos, rangos de puntuación
- **Volumen**: Hasta 500K evaluaciones

### **📚 Base de Conocimiento (KbService)**
- **Archivos**: `documents/`, `categories.csv`
- **Campos**: id, title, content, category, tags, embeddings
- **Validaciones**: Contenido válido, categorías existentes
- **Volumen**: Hasta 100K documentos

### **🤖 Datos IA (AiService)**
- **Archivos**: `training-data/`, `prompts.json`
- **Campos**: id, input, expected_output, category, quality_score
- **Validaciones**: Calidad de datos, formato de prompts
- **Volumen**: Hasta 1M puntos de entrenamiento

---

## 🚀 **INTEGRACIÓN POR STACK**

### **🐍 FastAPI (Python)**
```python
# Ejemplo de uso
import pandas as pd
from pathlib import Path

SHARED_DATA = Path("../../shared-data")
users_df = pd.read_csv(SHARED_DATA / "imports" / "users" / "users.csv")
```

### **⚡ Go**
```go
// Ejemplo de uso
import (
    "encoding/csv"
    "path/filepath"
)

sharedDataPath := "../../shared-data"
usersFile := filepath.Join(sharedDataPath, "imports", "users", "users.csv")
```

### **📱 Express (Node.js)**
```javascript
// Ejemplo de uso
const path = require('path');
const csv = require('csv-parser');

const sharedDataPath = path.join(__dirname, '../../shared-data');
const usersFile = path.join(sharedDataPath, 'imports', 'users', 'users.csv');
```

### **🚀 Next.js**
```typescript
// Ejemplo de uso
import path from 'path';
import { readFileSync } from 'fs';

const sharedDataPath = path.join(process.cwd(), '../../shared-data');
const usersFile = path.join(sharedDataPath, 'imports', 'users', 'users.csv');
```

### **☕ Java (Spring Boot)**
```java
// Ejemplo de uso
import java.nio.file.Path;
import java.nio.file.Paths;

Path sharedDataPath = Paths.get("../../shared-data");
Path usersFile = sharedDataPath.resolve("imports/users/users.csv");
```

### **🔮 Kotlin (Spring Boot)**
```kotlin
// Ejemplo de uso
import java.nio.file.Path
import java.nio.file.Paths

val sharedDataPath: Path = Paths.get("../../shared-data")
val usersFile = sharedDataPath.resolve("imports/users/users.csv")
```

---

## 📋 **CONVENCIONES DE ARCHIVOS**

### **Nomenclatura**
- **Entidades**: Singular en inglés (`user.csv`, no `users.csv`)
- **Timestamps**: ISO 8601 UTC (`2025-06-15T18:30:00Z`)
- **IDs**: UUID v4 format
- **Fichas SENA**: 7 dígitos numéricos (ej. `2826503`)
- **Encoding**: UTF-8 con BOM
- **Line Endings**: LF (Unix style)

### **Estructura CSV**
```csv
# Header obligatorio
id,nombre,apellido,email,documento,rol,ficha_id,programa,created_at
# Datos con separador coma
uuid-v4,string,string,email,string,enum,7-digits|null,string,iso-datetime
```

### **Reglas de Validación OneVision**
- **Aprendices**: ficha_id OBLIGATORIO (7 dígitos), programa = nombre del programa de formación
- **Instructores**: ficha_id = null, programa = área de especialización
- **Admin/Coordinadores**: ficha_id = null, programa = rol específico
- **Unicidad**: Un aprendiz solo puede estar matriculado en una ficha

> 📋 **IMPORTANTE**: La carga de aprendices solo puede ser realizada por el Instructor Director de cada ficha, NO por el Administrador del sistema. Ver [RF Gestión Fichas](../../sicora-docs/_docs/general/rf_gestion_fichas_aprendices.md).

### **Estructura JSON**
```json
{
  "metadata": {
    "version": "1.0",
    "created_at": "2025-06-15T18:30:00Z",
    "total_records": 1000,
    "schema_version": "users_v1.0"
  },
  "data": [
    {
      "id": "uuid-v4",
      "nombre": "string",
      "apellido": "string",
      "email": "email",
      "documento": "string",
      "rol": "enum",
      "created_at": "iso-datetime"
    }
  ]
}
```

---

## 🔍 **VALIDACIONES COMUNES**

### **Pre-importación**
1. **Formato de archivo**: CSV/JSON válido
2. **Schema compliance**: Estructura correcta
3. **Data types**: Tipos de datos correctos
4. **Required fields**: Campos obligatorios presentes
5. **Unique constraints**: Validación de unicidad

### **Durante importación**
1. **Business rules**: Reglas de negocio
2. **Foreign keys**: Referencias válidas
3. **Data integrity**: Integridad referencial
4. **Batch size**: Procesamiento por lotes
5. **Error handling**: Manejo de errores

### **Post-importación**
1. **Data verification**: Verificación de datos
2. **Counts validation**: Validación de conteos
3. **Quality checks**: Verificaciones de calidad
4. **Audit logging**: Registro de auditoría
5. **Performance metrics**: Métricas de rendimiento

---

## 🛠️ **HERRAMIENTAS DE DESARROLLO**

### **Generadores de Datos**
- **Faker libraries**: Datos sintéticos realistas
- **Data generators**: Herramientas específicas por stack
- **Sample creators**: Creadores de datasets de prueba

### **Validadores**
- **CSV Validator**: Validación de archivos CSV
- **JSON Schema Validator**: Validación de JSON
- **Data Quality Checker**: Verificador de calidad

### **Convertidores**
- **CSV ↔ JSON**: Conversión entre formatos
- **Excel → CSV**: Importación desde Excel
- **Database → CSV**: Exportación desde BD

---

## 📈 **MÉTRICAS Y MONITOREO**

### **Performance**
- **Import speed**: Velocidad de importación por stack
- **Memory usage**: Uso de memoria durante carga
- **Error rates**: Tasas de error por tipo de dato
- **Processing time**: Tiempo de procesamiento total

### **Quality**
- **Data accuracy**: Precisión de datos importados
- **Completeness**: Completitud de datasets
- **Consistency**: Consistencia entre stacks
- **Validation success**: Éxito de validaciones

---

## 🚀 **PRIMEROS PASOS**

### **1. Configurar acceso a shared-data**
```bash
# Desde cualquier stack
cd 01-fastapi  # o 02-go, 03-express, etc.
ls -la ../shared-data/  # Verificar acceso
```

### **2. Usar templates**
```bash
# Copiar template para personalizar
cp ../shared-data/templates/users.csv ./data/my-users.csv
```

### **3. Implementar carga masiva**
```bash
# Cada stack implementa su propio bulk loader
# que lee desde shared-data/imports/
```

### **4. Validar importación**
```bash
# Usar esquemas de shared-data/schemas/
# para validar antes de importar
```

---

## 📞 **SOPORTE Y CONTRIBUCIÓN**

### **Agregar nuevas entidades**
1. Crear directorio en `imports/`
2. Agregar template en `templates/`
3. Definir schema en `schemas/`
4. Crear samples en `samples/`
5. Documentar en este README

### **Reportar problemas**
- **Issues de formato**: Esquemas incorrectos
- **Performance**: Carga lenta en algún stack
- **Inconsistencias**: Comportamiento diferente entre stacks

---

**Este directorio es la base común para toda la funcionalidad de carga masiva del proyecto multistack.**
