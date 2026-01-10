# 🌱 SICORA - Sistema de Seed de Datos

Sistema modular para poblar la base de datos con datos de prueba significativos.

## 📋 Descripción

Este sistema genera datos de prueba para todos los microservicios de SICORA, permitiendo:

- **Probar paginación**: 50 usuarios, 30 horarios, 25 FAQs, etc.
- **Verificar búsquedas**: Datos variados con diferentes estados y categorías
- **Testear flujos completos**: Casos de comité con sanciones y apelaciones
- **Validar integraciones**: Referencias cruzadas entre servicios

## 🚀 Uso Rápido

```bash
# Dar permisos de ejecución
chmod +x scripts/seed/seed-data.sh

# Sembrar todos los datos
./scripts/seed/seed-data.sh seed-all

# Limpiar todos los datos
./scripts/seed/seed-data.sh clean-all

# Ver estado actual
./scripts/seed/seed-data.sh status
```

## 📁 Estructura

```
scripts/seed/
├── seed-data.sh              # Script orquestador principal
├── README.md                 # Esta documentación
└── sql/
    ├── 01_userservice_seed.sql       # 50 usuarios
    ├── 02_scheduleservice_seed.sql   # Sedes, programas, horarios
    ├── 03_attendanceservice_seed.sql # Asistencias, justificaciones
    ├── 04_evalinservice_seed.sql     # Cuestionarios, evaluaciones
    ├── 05_kbservice_seed.sql         # Documentos y FAQs
    ├── 06_mevalservice_seed.sql      # Comités y sanciones
    ├── 07_projectevalservice_seed.sql # Proyectos y entregas
    └── cleanup/
        ├── 00_cleanup_all.sql
        ├── 01_userservice_cleanup.sql
        ├── 02_scheduleservice_cleanup.sql
        ├── 03_attendanceservice_cleanup.sql
        ├── 04_evalinservice_cleanup.sql
        ├── 05_kbservice_cleanup.sql
        ├── 06_mevalservice_cleanup.sql
        └── 07_projectevalservice_cleanup.sql
```

## 📊 Datos Generados por Servicio

### UserService (01)
| Entidad | Cantidad | Descripción |
|---------|----------|-------------|
| Admins | 3 | Administradores del sistema |
| Coordinadores | 5 | Coordinadores de programa |
| Instructores | 12 | Instructores de formación |
| Estudiantes | 30 | 15 ADSO + 15 PSW |
| **Total** | **50** | |

### ScheduleService (02)
| Entidad | Cantidad |
|---------|----------|
| Sedes | 3 |
| Programas | 5 |
| Grupos académicos | 8 |
| Ambientes | 11 |
| Horarios | 30 |

### AttendanceService (03)
| Entidad | Cantidad |
|---------|----------|
| Registros de asistencia | 35 |
| Justificaciones | 3 |
| Alertas | 4 |

### EvalinService (04)
| Entidad | Cantidad |
|---------|----------|
| Cuestionarios | 2 |
| Preguntas | 25 |
| Periodos de evaluación | 3 |
| Evaluaciones | 15 |

### KBService (05)
| Entidad | Cantidad |
|---------|----------|
| Documentos | 17 |
| FAQs | 25 |

### MEvalService (06)
| Entidad | Cantidad |
|---------|----------|
| Comités | 3 |
| Miembros de comité | 10 |
| Casos de estudiantes | 15 |
| Sanciones | 11 |
| Apelaciones | 5 |
| Planes de mejora | 8 |

### ProjectEvalService (07)
| Entidad | Cantidad |
|---------|----------|
| Proyectos | 14 |
| Grupos de trabajo | 18 |
| Miembros de grupo | 15 |
| Rúbricas | 13 |
| Entregas | 15 |
| Evaluaciones | 15 |
| Sesiones | 6 |

## 🔑 Patrones de UUID

Los UUIDs siguen un patrón predecible para fácil identificación:

| Prefijo | Tipo |
|---------|------|
| `a0%` | Administradores |
| `c0%` | Coordinadores |
| `i0%` | Instructores |
| `s0%` | Estudiantes |
| `10%` | Programas |
| `20%` | Sedes |
| `30%` | Grupos académicos |
| `40%` | Registros de asistencia |
| `70%` | Cuestionarios |
| `90%` | Documentos KB |
| `91%` | FAQs |
| `93%` | Casos de estudiantes |
| `97%` | Proyectos |

## 🧹 Limpieza Reversible

Los scripts de cleanup eliminan **únicamente** los datos de seed identificados por su patrón de UUID, preservando cualquier dato real.

```bash
# Limpiar servicio específico
./scripts/seed/seed-data.sh clean userservice

# Limpiar todo (con confirmación)
./scripts/seed/seed-data.sh clean-all
```

## ⚙️ Variables de Entorno

```bash
DB_HOST=localhost     # Host de PostgreSQL
DB_PORT=5433          # Puerto (5433 para desarrollo)
DB_NAME=sicora_dev    # Base de datos
DB_USER=sicora_user   # Usuario
DB_PASSWORD=sicora_password  # Contraseña
```

## 🔒 Credenciales de Prueba

**Usuario admin de prueba:**
- Email: `admin1@onevision.edu.co`
- Password: `Test123!`

**Usuarios disponibles:**
| Rol | Emails |
|-----|--------|
| Admin | admin1-3@onevision.edu.co |
| Coordinador | coord1-5@onevision.edu.co |
| Instructor | instructor1-12@onevision.edu.co |
| Estudiante | student1-30@onevision.edu.co |

## ⚠️ Precauciones

1. **NO ejecutar en producción** sin revisar los scripts primero
2. Los datos incluyen fechas relativas (`NOW()`) que se ajustan al momento de ejecución
3. La limpieza respeta foreign keys ejecutando en orden inverso
4. El script usa `ON CONFLICT DO NOTHING` para ser idempotente

## 🐛 Troubleshooting

### Error de conexión
```bash
# Verificar que PostgreSQL está corriendo
docker compose -f sicora-infra/docker/docker-compose.yml ps postgres

# Probar conexión manual
psql -h localhost -p 5433 -U sicora_user -d sicora_dev
```

### Error de permisos
```bash
chmod +x scripts/seed/seed-data.sh
```

### Tablas no existen
Asegúrate de que las migraciones se han ejecutado antes del seed.
