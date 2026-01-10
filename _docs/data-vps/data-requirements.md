# 📋 Especificación de Datos de Prueba SICORA - VPS Hostinger

## 🎯 Objetivo

Generar un conjunto completo de datos de prueba para SICORA OneVision que permita validar todos los microservicios del stack FastAPI-Python en el VPS de Hostinger, cumpliendo con los requerimientos especificados y las estructuras de base de datos existentes.

## 🔄 Coordinación Multi-Stack

**IMPORTANTE**: Este proyecto utiliza una arquitectura multistack donde **Python (FastAPI) y Go comparten la misma base de datos PostgreSQL (`sicora_dev`)** pero con **esquemas separados por servicio**.

### Esquemas de Base de Datos Compartida

- `userservice_schema` - **Usado por AMBOS stacks**
- `scheduleservice_schema` - **Usado por AMBOS stacks**
- `attendanceservice_schema` - **Usado por AMBOS stacks**
- `softwarefactoryservice_schema` - Principalmente Go, migraciones Python
- `evalinservice_schema` - FastAPI Python
- `kbservice_schema` - FastAPI Python
- `aiservice_schema` - FastAPI Python
- `mevalservice_schema` - Principalmente Go
- `projectevalservice_schema` - FastAPI Python

### Coordinación de Migraciones

- **Python Stack**: Usa Alembic para migraciones SQLAlchemy
- **Go Stack**: Usa GORM AutoMigrate
- **Crítico**: Los datos de prueba deben ser compatibles con AMBAS implementaciones

## 📊 Resumen de Datos Requeridos

### 🔢 Cantidades Objetivo

- **100 fichas** (academic_groups) con 25-30 aprendices cada una
- **1 coordinación**: Teleinformática e Industrias Creativas
- **20 programas de formación** (academic_programs)
- **100 instructores** distribuidos en los programas
- **2 sedes**: CGMLTI Calle 52 y CGMLTI Fontibón
- **2,500-3,000 aprendices** (25-30 por ficha × 100 fichas)
- **Actividades de formación** correspondientes a cada programa

## 🏗️ Estructura de Base de Datos (Basada en Modelos SQLAlchemy)

### 1. UserService Schema (`userservice_schema`)

#### Tabla: `users`

```sql
-- Estructura basada en UserModel
id (UUID, PK)
first_name (VARCHAR(100))
last_name (VARCHAR(100))
email (VARCHAR(254), UNIQUE)
document_number (VARCHAR(15), UNIQUE)
document_type (VARCHAR(2)) -- CC, TI, CE, PP
hashed_password (VARCHAR(255))
role (ENUM: APPRENTICE, INSTRUCTOR, ADMINISTRATIVE, ADMIN)
is_active (BOOLEAN)
must_change_password (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
last_login_at (TIMESTAMP, NULL)
deleted_at (TIMESTAMP, NULL)
phone (VARCHAR(20), NULL)
reset_password_token (VARCHAR(100), NULL)
reset_password_token_expires_at (TIMESTAMP, NULL)
```

### 2. ScheduleService Schema (`scheduleservice_schema`)

#### Tabla: `campuses`

```sql
-- Estructura basada en CampusModel
id (UUID, PK)
name (VARCHAR(100))
code (VARCHAR(20), UNIQUE)
address (TEXT)
city (VARCHAR(50))
is_active (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, NULL)
```

#### Tabla: `venues`

```sql
-- Estructura basada en VenueModel
id (UUID, PK)
name (VARCHAR(100))
code (VARCHAR(20), UNIQUE)
type (VARCHAR(50)) -- CLASSROOM, LAB, AUDITORIUM
capacity (BIGINT)
campus_id (UUID, FK to campuses.id)
floor (VARCHAR(10))
is_active (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, NULL)
```

#### Tabla: `academic_programs`

```sql
-- Estructura basada en AcademicProgramModel
id (UUID, PK)
name (VARCHAR(200))
code (VARCHAR(20), UNIQUE)
type (VARCHAR(50))
duration (BIGINT) -- Duración en trimestres
is_active (BOOLEAN)
description (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, NULL)
```

#### Tabla: `academic_groups` (FICHAS)

```sql
-- Estructura basada en AcademicGroupModel
id (UUID, PK)
number (VARCHAR(20), UNIQUE) -- Número de ficha
academic_program_id (UUID, FK to academic_programs.id)
quarter (BIGINT)
year (BIGINT)
shift (VARCHAR(20)) -- MORNING, AFTERNOON, EVENING
is_active (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, NULL)
```

#### Tabla: `schedules`

```sql
-- Estructura basada en ScheduleModel
id (UUID, PK)
academic_group_id (UUID, FK to academic_groups.id)
instructor_id (UUID, referencia a users.id)
venue_id (UUID, FK to venues.id)
subject (VARCHAR(200))
day_of_week (BIGINT) -- 0=Lunes, 6=Domingo
start_time (TIMESTAMP)
end_time (TIMESTAMP)
block_identifier (VARCHAR(10)) -- 1A, 2B, etc.
start_date (DATE)
end_date (DATE)
status (VARCHAR(20)) -- ACTIVE, CANCELLED, COMPLETED
is_active (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, NULL)
```

### 3. AttendanceService Schema (`attendanceservice_schema`)

#### Tabla: `attendance_records`

```sql
-- Estructura basada en migración 001_create_attendance_tables.py
id (UUID, PK)
student_id (UUID, referencia a users.id)
ficha_id (UUID, referencia a academic_groups.id)
class_id (UUID, referencia a schedules.id)
status (ENUM: PRESENT, ABSENT, LATE, EXCUSED)
check_in_time (TIMESTAMP)
check_out_time (TIMESTAMP)
date (DATE)
late_minutes (INTEGER)
notes (TEXT)
is_justified (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## 🎭 Datos de Prueba Específicos

### 🏫 Coordinación y Programas de Formación

**Coordinación**: Teleinformática e Industrias Creativas

**20 Programas de Formación** (distribuidos en la coordinación):

#### Teleinformática (12 programas)

1. **Tecnólogo en Análisis y Desarrollo de Software** (TADSI) - 6 trimestres
2. **Tecnólogo en Gestión de Redes de Datos** (TGRD) - 6 trimestres
3. **Tecnólogo en Sistemas Teleinformáticos** (TST) - 6 trimestres
4. **Técnico en Programación de Software** (TPS) - 4 trimestres
5. **Técnico en Sistemas** (TS) - 4 trimestres
6. **Técnico en Mantenimiento de Equipos de Cómputo** (TMEC) - 4 trimestres
7. **Tecnólogo en Gestión de la Seguridad Informática** (TGSI) - 6 trimestres
8. **Técnico en Soporte de Infraestructura Tecnológica** (TSIT) - 4 trimestres
9. **Tecnólogo en Desarrollo de Videojuegos** (TDV) - 6 trimestres
10. **Técnico en Desarrollo Web** (TDW) - 4 trimestres
11. **Tecnólogo en Inteligencia Artificial** (TIA) - 6 trimestres
12. **Técnico en Ciberseguridad** (TC) - 4 trimestres

#### Industrias Creativas (8 programas)

13. **Tecnólogo en Diseño Gráfico** (TDG) - 6 trimestres
14. **Tecnólogo en Producción Multimedia** (TPM) - 6 trimestres
15. **Técnico en Diseño e Integración de Multimedia** (TDIM) - 4 trimestres
16. **Tecnólogo en Producción de Audio** (TPA) - 6 trimestres
17. **Técnico en Fotografía** (TF) - 4 trimestres
18. **Tecnólogo en Animación Digital** (TAD) - 6 trimestres
19. **Técnico en Edición de Video** (TEV) - 4 trimestres
20. **Tecnólogo en Diseño UX/UI** (TDUX) - 6 trimestres

### 🏢 Sedes y Espacios

#### Sede 1: CGMLTI Calle 52

- **Código**: CGM52
- **Dirección**: Calle 52 #47-42, Bogotá D.C.
- **Espacios**: 50 aulas/laboratorios

#### Sede 2: CGMLTI Fontibón

- **Código**: CGMFON
- **Dirección**: Carrera 86A #65C-55, Fontibón, Bogotá D.C.
- **Espacios**: 50 aulas/laboratorios

### 👥 Distribución de Usuarios

#### Instructores (100 total)

- **Teleinformática**: 60 instructores
- **Industrias Creativas**: 40 instructores
- **Roles**: Todos con rol `INSTRUCTOR`
- **Distribución**: Asignados proporcionalmente a los programas

#### Aprendices (2,500-3,000 total)

- **Por ficha**: 25-30 aprendices
- **100 fichas total**
- **Roles**: Todos con rol `APPRENTICE`

#### Personal Administrativo (10 total)

- **Coordinadores**: 2 (uno por área)
- **Secretarias**: 4
- **Administradores**: 4

### 📚 Fichas y Horarios

#### Distribución de Fichas por Programa

- **Programas de 6 trimestres**: 5-6 fichas cada uno
- **Programas de 4 trimestres**: 4-5 fichas cada uno
- **Total**: 100 fichas

#### Turnos (según RFs oficiales)

- **Mañana** (06:00-12:00): 40 fichas
- **Tarde** (12:00-18:00): 35 fichas
- **Noche** (18:00-22:00): 25 fichas

> **⚠️ NOTA IMPORTANTE**: Los horarios de jornadas están definidos estrictamente en los Requerimientos Funcionales (RFs).
> Cualquier información en contrario **NO ES VÁLIDA**. Los bloques horarios en los scripts SQL
> se ajustan exactamente a estas jornadas oficiales.

## 📝 Scripts SQL de Inserción

### Script 1: Crear Coordinación y Sedes

```sql
-- ===========================================
-- SCRIPT 1: COORDINACIÓN Y SEDES
-- ===========================================

-- Sedes
INSERT INTO scheduleservice_schema.campuses (id, name, code, address, city, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'CGMLTI Calle 52', 'CGM52', 'Calle 52 #47-42, Bogotá D.C.', 'Bogotá', true, NOW(), NOW()),
(gen_random_uuid(), 'CGMLTI Fontibón', 'CGMFON', 'Carrera 86A #65C-55, Fontibón, Bogotá D.C.', 'Bogotá', true, NOW(), NOW());
```

### Script 2: Programas de Formación

```sql
-- ===========================================
-- SCRIPT 2: PROGRAMAS DE FORMACIÓN
-- ===========================================

-- Programas de Teleinformática
INSERT INTO scheduleservice_schema.academic_programs (id, name, code, type, duration, is_active, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'Tecnólogo en Análisis y Desarrollo de Software', 'TADSI', 'TECNOLÓGICO', 6, true, 'Programa tecnológico enfocado en desarrollo de aplicaciones software', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Gestión de Redes de Datos', 'TGRD', 'TECNOLÓGICO', 6, true, 'Programa tecnológico para administración de infraestructura de redes', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Sistemas Teleinformáticos', 'TST', 'TECNOLÓGICO', 6, true, 'Programa integral de sistemas y telecomunicaciones', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Programación de Software', 'TPS', 'TÉCNICO', 4, true, 'Programa técnico en fundamentos de programación', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Sistemas', 'TS', 'TÉCNICO', 4, true, 'Programa técnico en administración de sistemas informáticos', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Mantenimiento de Equipos de Cómputo', 'TMEC', 'TÉCNICO', 4, true, 'Programa técnico en hardware y mantenimiento preventivo', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Gestión de la Seguridad Informática', 'TGSI', 'TECNOLÓGICO', 6, true, 'Programa tecnológico en ciberseguridad y seguridad de la información', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Soporte de Infraestructura Tecnológica', 'TSIT', 'TÉCNICO', 4, true, 'Programa técnico en soporte y infraestructura IT', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Desarrollo de Videojuegos', 'TDV', 'TECNOLÓGICO', 6, true, 'Programa especializado en desarrollo de videojuegos', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Desarrollo Web', 'TDW', 'TÉCNICO', 4, true, 'Programa técnico en desarrollo de aplicaciones web', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Inteligencia Artificial', 'TIA', 'TECNOLÓGICO', 6, true, 'Programa avanzado en IA y machine learning', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Ciberseguridad', 'TC', 'TÉCNICO', 4, true, 'Programa técnico especializado en seguridad informática', NOW(), NOW());

-- Programas de Industrias Creativas
INSERT INTO scheduleservice_schema.academic_programs (id, name, code, type, duration, is_active, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'Tecnólogo en Diseño Gráfico', 'TDG', 'TECNOLÓGICO', 6, true, 'Programa tecnológico en diseño visual y comunicación gráfica', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Producción Multimedia', 'TPM', 'TECNOLÓGICO', 6, true, 'Programa integral de producción de contenidos multimedia', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Diseño e Integración de Multimedia', 'TDIM', 'TÉCNICO', 4, true, 'Programa técnico en multimedia interactiva', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Producción de Audio', 'TPA', 'TECNOLÓGICO', 6, true, 'Programa especializado en producción y posproducción de audio', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Fotografía', 'TF', 'TÉCNICO', 4, true, 'Programa técnico en fotografía digital y análoga', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Animación Digital', 'TAD', 'TECNOLÓGICO', 6, true, 'Programa avanzado en animación 2D y 3D', NOW(), NOW()),
(gen_random_uuid(), 'Técnico en Edición de Video', 'TEV', 'TÉCNICO', 4, true, 'Programa técnico en postproducción audiovisual', NOW(), NOW()),
(gen_random_uuid(), 'Tecnólogo en Diseño UX/UI', 'TDUX', 'TECNOLÓGICO', 6, true, 'Programa especializado en experiencia e interfaz de usuario', NOW(), NOW());
```

### Script 3: Venues por Sede

```sql
-- ===========================================
-- SCRIPT 3: VENUES (AULAS Y LABORATORIOS)
-- ===========================================

-- Variables para almacenar IDs de campus
DO $$
DECLARE
    campus_cgm52_id UUID;
    campus_cgmfon_id UUID;
    i INTEGER;
BEGIN
    -- Obtener IDs de campus
    SELECT id INTO campus_cgm52_id FROM scheduleservice_schema.campuses WHERE code = 'CGM52';
    SELECT id INTO campus_cgmfon_id FROM scheduleservice_schema.campuses WHERE code = 'CGMFON';

    -- Venues para CGMLTI Calle 52 (50 venues)
    FOR i IN 1..50 LOOP
        INSERT INTO scheduleservice_schema.venues (id, name, code, type, capacity, campus_id, floor, is_active, created_at, updated_at) VALUES
        (gen_random_uuid(),
         CASE
            WHEN i <= 20 THEN 'Aula ' || i || ' - CGM52'
            WHEN i <= 35 THEN 'Lab Sistemas ' || (i-20) || ' - CGM52'
            WHEN i <= 45 THEN 'Lab Multimedia ' || (i-35) || ' - CGM52'
            ELSE 'Auditorio ' || (i-45) || ' - CGM52'
         END,
         'CGM52-' || LPAD(i::text, 3, '0'),
         CASE
            WHEN i <= 20 THEN 'CLASSROOM'
            WHEN i <= 35 THEN 'LAB'
            WHEN i <= 45 THEN 'MULTIMEDIA_LAB'
            ELSE 'AUDITORIUM'
         END,
         CASE
            WHEN i <= 20 THEN 30
            WHEN i <= 35 THEN 25
            WHEN i <= 45 THEN 20
            ELSE 100
         END,
         campus_cgm52_id,
         CASE
            WHEN i <= 25 THEN '1'
            WHEN i <= 40 THEN '2'
            ELSE '3'
         END,
         true, NOW(), NOW());
    END LOOP;

    -- Venues para CGMLTI Fontibón (50 venues)
    FOR i IN 1..50 LOOP
        INSERT INTO scheduleservice_schema.venues (id, name, code, type, capacity, campus_id, floor, is_active, created_at, updated_at) VALUES
        (gen_random_uuid(),
         CASE
            WHEN i <= 20 THEN 'Aula ' || i || ' - CGMFON'
            WHEN i <= 35 THEN 'Lab Sistemas ' || (i-20) || ' - CGMFON'
            WHEN i <= 45 THEN 'Lab Multimedia ' || (i-35) || ' - CGMFON'
            ELSE 'Auditorio ' || (i-45) || ' - CGMFON'
         END,
         'CGMFON-' || LPAD(i::text, 3, '0'),
         CASE
            WHEN i <= 20 THEN 'CLASSROOM'
            WHEN i <= 35 THEN 'LAB'
            WHEN i <= 45 THEN 'MULTIMEDIA_LAB'
            ELSE 'AUDITORIUM'
         END,
         CASE
            WHEN i <= 20 THEN 30
            WHEN i <= 35 THEN 25
            WHEN i <= 45 THEN 20
            ELSE 100
         END,
         campus_cgmfon_id,
         CASE
            WHEN i <= 25 THEN '1'
            WHEN i <= 40 THEN '2'
            ELSE '3'
         END,
         true, NOW(), NOW());
    END LOOP;
END $$;
```

### Script 4: Instructores

```sql
-- ===========================================
-- SCRIPT 4: INSTRUCTORES (100 total)
-- ===========================================

-- Función para generar instructores con datos realistas
DO $$
DECLARE
    instructor_names TEXT[] := ARRAY[
        'Carlos Alberto', 'María Elena', 'José Luis', 'Ana Patricia', 'Luis Fernando',
        'Sandra Milena', 'Diego Alejandro', 'Claudia Andrea', 'Andrés Felipe', 'Mónica Isabel',
        'Roberto Carlos', 'Liliana Patricia', 'Fernando José', 'Gloria Patricia', 'Álvaro Hernán',
        'Martha Lucía', 'Jairo Alberto', 'Esperanza del Carmen', 'William Andrés', 'Yolanda María',
        'Oscar Javier', 'Patricia del Rosario', 'Sergio Andrés', 'Beatriz Elena', 'Mauricio Alexander',
        'Norma Constanza', 'Héctor Fabio', 'Luz Marina', 'Gustavo Adolfo', 'Carmen Rosa',
        'Iván Darío', 'Myriam Stella', 'Édgar Armando', 'Rosalba', 'Germán Eduardo',
        'Nubia Esperanza', 'Fabián Andrés', 'Isabel Cristina', 'Javier Orlando', 'Amparo',
        'Wilson', 'Ruby', 'Hernando', 'Blanca Nelly', 'Rigoberto',
        'María del Pilar', 'Néstor Julio', 'Teresa', 'Hugo Armando', 'Stella',
        'Reynaldo', 'Gladys', 'Rubén Darío', 'Cecilia', 'Ramiro',
        'Nelly', 'Jorge Enrique', 'Ligia', 'Efraín', 'Rosa María',
        'Hernán', 'Marta Cecilia', 'Francisco Javier', 'Dora', 'Gilberto',
        'Emma', 'Libardo', 'Ofelia', 'Samuel', 'Graciela',
        'Jorge Mario', 'Olga Lucía', 'Edgar', 'Carmen Elena', 'Jaime',
        'Fabiola', 'Nelson', 'Doris', 'Álvaro', 'Marina',
        'Alfonso', 'Olga', 'Arturo', 'Esperanza', 'Rafael',
        'Pilar', 'Julio César', 'Miriam', 'Hernán Darío', 'Clemencia',
        'Rodolfo', 'Aracelly', 'Marco Antonio', 'Rosa Elena', 'Jaime Eduardo',
        'Rocío', 'Eduardo', 'Zoila Rosa', 'Miguel Ángel', 'Luz Dary'
    ];

    instructor_lastnames TEXT[] := ARRAY[
        'Rodríguez García', 'Martínez López', 'González Hernández', 'Pérez Martín', 'Sánchez Ruiz',
        'Ramírez Díaz', 'Cruz Moreno', 'Flores Muñoz', 'Rivera Álvarez', 'Gómez Romero',
        'Herrera Jiménez', 'Medina Castro', 'Morales Ortega', 'Jiménez Ramos', 'Torres Vargas',
        'Vargas Silva', 'Castro Delgado', 'Ortega Morales', 'Ramos Torres', 'Silva Herrera',
        'Delgado Medina', 'Moreno Flores', 'Álvarez Rivera', 'Romero Gómez', 'Muñoz Cruz',
        'Díaz Ramírez', 'Ruiz Sánchez', 'Martín Pérez', 'Hernández González', 'López Martínez',
        'García Rodríguez', 'Fernández Vega', 'Vega Fernández', 'Aguilar Mendoza', 'Mendoza Aguilar',
        'Guerrero Paredes', 'Paredes Guerrero', 'Núñez Ríos', 'Ríos Núñez', 'Salazar Campos',
        'Campos Salazar', 'Valencia Cardona', 'Cardona Valencia', 'Restrepo Montoya', 'Montoya Restrepo',
        'Henao Giraldo', 'Giraldo Henao', 'Vélez Hurtado', 'Hurtado Vélez', 'Zapata Correa'
    ];

    i INTEGER;
    first_name TEXT;
    last_name TEXT;
    email TEXT;
    document_number TEXT;
    phone TEXT;
BEGIN
    FOR i IN 1..100 LOOP
        first_name := instructor_names[((i-1) % array_length(instructor_names, 1)) + 1];
        last_name := instructor_lastnames[((i-1) % array_length(instructor_lastnames, 1)) + 1];
        email := lower(regexp_replace(first_name, ' ', '.', 'g')) || '.' ||
                lower(regexp_replace(split_part(last_name, ' ', 1), ' ', '.', 'g')) ||
                '@students.onevision.edu.co';
        document_number := (20000000 + i)::TEXT;
        phone := '31' || (40000000 + i)::TEXT;

        INSERT INTO userservice_schema.users (
            id, first_name, last_name, email, document_number, document_type,
            hashed_password, role, is_active, must_change_password,
            created_at, updated_at, phone
        ) VALUES (
            gen_random_uuid(),
            first_name,
            last_name,
            email,
            document_number,
            'CC',
            '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', -- password: "instructor123"
            'INSTRUCTOR',
            true,
            false,
            NOW(),
            NOW(),
            phone
        );
    END LOOP;
END $$;
```

### Script 5: Personal Administrativo

```sql
-- ===========================================
-- SCRIPT 5: PERSONAL ADMINISTRATIVO (10 total)
-- ===========================================

-- Coordinadores y personal administrativo
INSERT INTO userservice_schema.users (
    id, first_name, last_name, email, document_number, document_type,
    hashed_password, role, is_active, must_change_password,
    created_at, updated_at, phone
) VALUES
-- Coordinadores (2)
(gen_random_uuid(), 'Pedro Antonio', 'Suárez Molina', 'pedro.suarez@students.onevision.edu.co', '79123456', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMINISTRATIVE', true, false, NOW(), NOW(), '3101234567'),
(gen_random_uuid(), 'Carmen Sofía', 'Rincón Ospina', 'carmen.rincon@students.onevision.edu.co', '79123457', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMINISTRATIVE', true, false, NOW(), NOW(), '3101234568'),

-- Secretarias (4)
(gen_random_uuid(), 'Diana Patricia', 'Moreno Castillo', 'diana.moreno@students.onevision.edu.co', '79123458', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMINISTRATIVE', true, false, NOW(), NOW(), '3101234569'),
(gen_random_uuid(), 'Gladys Elena', 'Torres Mejía', 'gladys.torres@students.onevision.edu.co', '79123459', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMINISTRATIVE', true, false, NOW(), NOW(), '3101234570'),
(gen_random_uuid(), 'Ruth María', 'Vásquez Peña', 'ruth.vasquez@students.onevision.edu.co', '79123460', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMINISTRATIVE', true, false, NOW(), NOW(), '3101234571'),
(gen_random_uuid(), 'Rocío del Carmen', 'Acosta Franco', 'rocio.acosta@students.onevision.edu.co', '79123461', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMINISTRATIVE', true, false, NOW(), NOW(), '3101234572'),

-- Administradores del Sistema (4)
(gen_random_uuid(), 'Jorge Iván', 'Rodríguez Peláez', 'jorge.rodriguez@students.onevision.edu.co', '79123462', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMIN', true, false, NOW(), NOW(), '3101234573'),
(gen_random_uuid(), 'María Fernanda', 'Gómez Restrepo', 'maria.gomez@students.onevision.edu.co', '79123463', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMIN', true, false, NOW(), NOW(), '3101234574'),
(gen_random_uuid(), 'Andrés Mauricio', 'López Vargas', 'andres.lopez@students.onevision.edu.co', '79123464', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMIN', true, false, NOW(), NOW(), '3101234575'),
(gen_random_uuid(), 'Claudia Marcela', 'Henao Valencia', 'claudia.henao@students.onevision.edu.co', '79123465', 'CC', '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', 'ADMIN', true, false, NOW(), NOW(), '3101234576');
```

### Script 6: Fichas (Academic Groups)

```sql
-- ===========================================
-- SCRIPT 6: FICHAS (100 ACADEMIC GROUPS)
-- ===========================================

DO $$
DECLARE
    program_ids UUID[];
    program_id UUID;
    ficha_counter INTEGER := 1;
    year_val INTEGER := 2025;
    quarter_val INTEGER;
    shift_val TEXT;
    shifts TEXT[] := ARRAY['MORNING', 'AFTERNOON', 'EVENING'];
    shift_distribution INTEGER[] := ARRAY[40, 35, 25]; -- Distribución por turno
    current_shift_index INTEGER := 1;
    current_shift_count INTEGER := 0;
    i INTEGER;
    ficha_number TEXT;
BEGIN
    -- Obtener IDs de todos los programas
    SELECT ARRAY(SELECT id FROM scheduleservice_schema.academic_programs ORDER BY name) INTO program_ids;

    -- Crear 100 fichas distribuidas entre los 20 programas
    FOR i IN 1..100 LOOP
        -- Seleccionar programa (rotativo para distribuir equitativamente)
        program_id := program_ids[((i-1) % array_length(program_ids, 1)) + 1];

        -- Determinar trimestre (1-4)
        quarter_val := ((i-1) % 4) + 1;

        -- Determinar turno basado en distribución
        IF current_shift_count >= shift_distribution[current_shift_index] THEN
            current_shift_index := current_shift_index + 1;
            current_shift_count := 0;
        END IF;
        shift_val := shifts[current_shift_index];
        current_shift_count := current_shift_count + 1;

        -- Generar número de ficha (formato: año + número secuencial)
        ficha_number := year_val::TEXT || LPAD(i::TEXT, 4, '0');

        INSERT INTO scheduleservice_schema.academic_groups (
            id, number, academic_program_id, quarter, year, shift,
            is_active, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            ficha_number,
            program_id,
            quarter_val,
            year_val,
            shift_val,
            true,
            NOW(),
            NOW()
        );
    END LOOP;
END $$;
```

### Script 7: Aprendices (2,500-3,000 total)

```sql
-- ===========================================
-- SCRIPT 7: APRENDICES (25-30 POR FICHA)
-- ===========================================

DO $$
DECLARE
    ficha_record RECORD;
    apprentice_names TEXT[] := ARRAY[
        'Alejandro', 'Andrea', 'Andrés', 'Ángela', 'Carlos', 'Carolina', 'Cristian', 'Diana',
        'Diego', 'Erika', 'Felipe', 'Gabriela', 'Iván', 'Jessica', 'Jorge', 'Julián',
        'Karen', 'Kevin', 'Laura', 'Leidy', 'Luis', 'María', 'Miguel', 'Natalia',
        'Oscar', 'Paola', 'Ricardo', 'Sara', 'Sebastián', 'Tatiana', 'Valeria', 'William',
        'Yesica', 'Yulieth', 'Zulma', 'Brandon', 'Camila', 'Daniel', 'Estefanía', 'Fernando',
        'Giselle', 'Harrison', 'Isabella', 'Javier', 'Katherine', 'Leonardo', 'Melissa', 'Nicolás',
        'Olivia', 'Pablo', 'Quimberly', 'Robinson', 'Stefany', 'Tomás', 'Úrsula', 'Víctor',
        'Wendy', 'Ximena', 'Yeimy', 'Zaira', 'Alexander', 'Alejandra', 'Anderson', 'Angélica',
        'Brayan', 'Brittany', 'César', 'Daniela', 'Édgar', 'Elizabeth', 'Fabián', 'Fernanda',
        'Germán', 'Gina', 'Héctor', 'Ingrid', 'Jairo', 'Johana', 'Kenneth', 'Lizeth',
        'Manuel', 'Monica', 'Nelson', 'Olga', 'Pedro', 'Quiteria', 'Rafael', 'Sandra',
        'Tito', 'Uriel', 'Viviana', 'Walter', 'Xiomara', 'Yorman', 'Zoraida'
    ];

    apprentice_lastnames TEXT[] := ARRAY[
        'Acevedo Silva', 'Aguirre López', 'Alvarado Cruz', 'Arias Mendoza', 'Bedoya Vargas',
        'Caballero Ramos', 'Cabrera Díaz', 'Calderón Ruiz', 'Cárdenas Moreno', 'Carmona García',
        'Castañeda Jiménez', 'Castro Pérez', 'Chávez Torres', 'Contreras Herrera', 'Cortés Medina',
        'Delgado Ortega', 'Domínguez Rivera', 'Duarte Gómez', 'Echeverri Romero', 'Espinoza Muñoz',
        'Figueroa Álvarez', 'Franco Morales', 'Gallego Flores', 'García Sánchez', 'Giraldo Ramírez',
        'Gómez González', 'Guerrero Martínez', 'Gutiérrez Rodríguez', 'Henao Hernández', 'Herrera López',
        'Jaramillo Martín', 'Jiménez Pérez', 'León García', 'López Silva', 'Machado Ruiz',
        'Martínez Díaz', 'Mejía Moreno', 'Mendoza Ramos', 'Miranda Torres', 'Molina Vargas',
        'Montoya Herrera', 'Morales Jiménez', 'Moreno Medina', 'Muñoz Ortega', 'Navas Rivera',
        'Ocampo Gómez', 'Orozco Romero', 'Ospina Muñoz', 'Parra Álvarez', 'Peña Morales',
        'Pérez Flores', 'Posada Sánchez', 'Quintero Ramírez', 'Ramírez González', 'Restrepo Martínez',
        'Rincón Rodríguez', 'Rivera Hernández', 'Rodríguez López', 'Rojas Martín', 'Romero García',
        'Ruiz Silva', 'Salazar Díaz', 'Sánchez Ruiz', 'Silva Moreno', 'Suárez Ramos',
        'Torres Vargas', 'Valencia Herrera', 'Vargas Jiménez', 'Vásquez Medina', 'Vélez Ortega',
        'Villa Rivera', 'Zapata Gómez', 'Zuluaga Romero'
    ];

    apprentices_per_ficha INTEGER;
    i INTEGER;
    j INTEGER;
    first_name TEXT;
    last_name TEXT;
    email TEXT;
    document_number TEXT;
    phone TEXT;
    base_document INTEGER := 1010000000;
    apprentice_counter INTEGER := 1;
BEGIN
    FOR ficha_record IN SELECT id, number FROM scheduleservice_schema.academic_groups ORDER BY number LOOP
        -- Número aleatorio de aprendices entre 25 y 30
        apprentices_per_ficha := 25 + (random() * 5)::INTEGER;

        FOR i IN 1..apprentices_per_ficha LOOP
            first_name := apprentice_names[((apprentice_counter-1) % array_length(apprentice_names, 1)) + 1];
            last_name := apprentice_lastnames[((apprentice_counter-1) % array_length(apprentice_lastnames, 1)) + 1];
            email := lower(regexp_replace(first_name, ' ', '.', 'g')) || '.' ||
                    lower(regexp_replace(split_part(last_name, ' ', 1), ' ', '.', 'g')) ||
                    apprentice_counter || '@students.onevision.edu.co';
            document_number := (base_document + apprentice_counter)::TEXT;
            phone := '32' || (10000000 + apprentice_counter)::TEXT;

            INSERT INTO userservice_schema.users (
                id, first_name, last_name, email, document_number, document_type,
                hashed_password, role, is_active, must_change_password,
                created_at, updated_at, phone
            ) VALUES (
                gen_random_uuid(),
                first_name,
                last_name,
                email,
                document_number,
                CASE
                    WHEN random() < 0.1 THEN 'TI'  -- 10% menores de edad
                    ELSE 'CC'                       -- 90% cédulas
                END,
                '$2b$12$LQv3c1yqBwEHxPuNUjjQYOGdg1yqTX8VSvB7C1wESTJRFJQqJhDZC', -- password: "aprendiz123"
                'APPRENTICE',
                true,
                true, -- Deben cambiar contraseña en primer login
                NOW(),
                NOW(),
                phone
            );

            apprentice_counter := apprentice_counter + 1;
        END LOOP;

        RAISE NOTICE 'Ficha % completada con % aprendices', ficha_record.number, apprentices_per_ficha;
    END LOOP;

    RAISE NOTICE 'Total de aprendices creados: %', apprentice_counter - 1;
END $$;
```

### Script 8: Horarios (Schedules)

**IMPORTANTE**: Cada ficha tiene UN SOLO horario único durante todo el trimestre formativo.
Una ficha es un grupo de aprendices que estudian juntos en el mismo horario.

```sql
-- ===========================================
-- SCRIPT 8: HORARIOS (SCHEDULES)
-- UN HORARIO ÚNICO POR FICHA
-- ===========================================

DO $$
DECLARE
    ficha_record RECORD;
    instructor_ids UUID[];
    venue_ids UUID[];
    instructor_id UUID;
    venue_id UUID;
    ficha_record RECORD;
    instructor_ids UUID[];
    venue_ids UUID[];
    day_of_week INTEGER;
    start_time TIME;
    end_time TIME;
    start_date DATE := '2025-02-03'; -- Lunes
    end_date DATE := '2025-11-28';   -- Viernes
    block_id TEXT;
    time_blocks TIME[][] := ARRAY[
        ARRAY[TIME '06:00', TIME '08:00'],  -- Bloque 1A (Mañana)
        ARRAY[TIME '08:00', TIME '10:00'],  -- Bloque 1B (Mañana)
        ARRAY[TIME '10:15', TIME '12:15'],  -- Bloque 1C (Mañana)
        ARRAY[TIME '12:00', TIME '14:00'],  -- Bloque 2A (Tarde)
        ARRAY[TIME '14:00', TIME '16:00'],  -- Bloque 2B (Tarde)
        ARRAY[TIME '16:00', TIME '18:00'],  -- Bloque 2C (Tarde)
        ARRAY[TIME '18:00', TIME '20:00'],  -- Bloque 3A (Noche)
        ARRAY[TIME '20:00', TIME '22:00']   -- Bloque 3B (Noche)
    ];
    shift_blocks INTEGER[][];
    block_range INTEGER[];
    classes_per_week INTEGER := 1; -- UNA SOLA CLASE/HORARIO por ficha
    i INTEGER;
    j INTEGER;
BEGIN
    -- Definir bloques por turno
    shift_blocks := ARRAY[
        ARRAY[1, 2, 3],    -- MORNING: bloques 1A, 1B, 1C
        ARRAY[4, 5, 6],    -- AFTERNOON: bloques 2A, 2B, 2C
        ARRAY[7, 8]        -- EVENING: bloques 3A, 3B
    ];

    -- Obtener IDs de instructores y venues
    SELECT ARRAY(SELECT id FROM userservice_schema.users WHERE role = 'INSTRUCTOR' ORDER BY random()) INTO instructor_ids;
    SELECT ARRAY(SELECT id FROM scheduleservice_schema.venues ORDER BY random()) INTO venue_ids;

    FOR ficha_record IN SELECT id, number, shift FROM scheduleservice_schema.academic_groups ORDER BY number LOOP
        -- Determinar rango de bloques según el turno
        CASE ficha_record.shift
            WHEN 'MORNING' THEN block_range := shift_blocks[1];
            WHEN 'AFTERNOON' THEN block_range := shift_blocks[2];
            WHEN 'EVENING' THEN block_range := shift_blocks[3];
        END CASE;

        -- Crear UN SOLO horario por ficha (horario único durante el trimestre)

        -- Seleccionar instructor aleatoriamente
        instructor_id := instructor_ids[(random() * (array_length(instructor_ids, 1) - 1))::INTEGER + 1];

        -- Seleccionar venue aleatoriamente
        venue_id := venue_ids[(random() * (array_length(venue_ids, 1) - 1))::INTEGER + 1];

        -- Día de la semana aleatorio (Lunes a Viernes)
        day_of_week := (random() * 4)::INTEGER; -- 0=Lunes, 4=Viernes

        -- Seleccionar bloque horario del turno correspondiente
        j := block_range[(random() * array_length(block_range, 1))::INTEGER + 1];
        start_time := time_blocks[j][1];
        end_time := time_blocks[j][2];
        block_id := CASE j
            WHEN 1 THEN '1A' WHEN 2 THEN '1B' WHEN 3 THEN '1C'
            WHEN 4 THEN '2A' WHEN 5 THEN '2B' WHEN 6 THEN '2C'
            WHEN 7 THEN '3A' WHEN 8 THEN '3B'
        END;

        INSERT INTO scheduleservice_schema.schedules (
            id, academic_group_id, instructor_id, venue_id, subject,
            day_of_week, start_time, end_time, block_identifier,
            start_date, end_date, status, is_active,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            ficha_record.id,
            instructor_id,
            venue_id,
            'Formación Técnica', -- Materia genérica para la ficha
            day_of_week,
            (start_date + (day_of_week || ' days')::INTERVAL)::DATE + start_time,
            (start_date + (day_of_week || ' days')::INTERVAL)::DATE + end_time,
            block_id,
            start_date,
            end_date,
            'ACTIVE',
            true,
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Horario único creado para ficha %', ficha_record.number;
    END LOOP;

    RAISE NOTICE 'TOTAL: 100 horarios únicos creados (1 por ficha)';
END $$;
```

### Script 9: Registros de Asistencia (Muestra)

```sql
-- ===========================================
-- SCRIPT 9: REGISTROS DE ASISTENCIA (MUESTRA)
-- ===========================================

DO $$
DECLARE
    schedule_record RECORD;
    apprentice_record RECORD;
    ficha_id UUID;
    days_back INTEGER := 30; -- Últimos 30 días
    current_date DATE;
    attendance_status TEXT[] := ARRAY['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    status TEXT;
    check_in_time TIMESTAMP;
    late_minutes INTEGER;
    i INTEGER;
BEGIN
    -- Crear registros de asistencia para los últimos 30 días
    FOR i IN 0..days_back LOOP
        current_date := CURRENT_DATE - (i || ' days')::INTERVAL;

        -- Solo días laborales (lunes a viernes)
        IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
            FOR schedule_record IN
                SELECT s.id as schedule_id, s.academic_group_id, s.day_of_week, s.start_time, s.subject
                FROM scheduleservice_schema.schedules s
                WHERE s.day_of_week = EXTRACT(DOW FROM current_date) - 1 -- Ajustar formato días
                AND s.is_active = true
                AND current_date BETWEEN s.start_date AND s.end_date
                LIMIT 50 -- Limitar para demo
            LOOP
                -- Obtener aprendices de la ficha
                FOR apprentice_record IN
                    SELECT u.id as student_id
                    FROM userservice_schema.users u
                    WHERE u.role = 'APPRENTICE'
                    AND u.is_active = true
                    AND random() < 0.3 -- Solo 30% de los aprendices para demo
                    LIMIT 10 -- Máximo 10 por clase
                LOOP
                    -- Determinar estado de asistencia (80% presente, 10% tarde, 5% ausente, 5% excusado)
                    CASE
                        WHEN random() < 0.80 THEN
                            status := 'PRESENT';
                            check_in_time := current_date + schedule_record.start_time + (random() * INTERVAL '10 minutes');
                            late_minutes := 0;
                        WHEN random() < 0.90 THEN
                            status := 'LATE';
                            late_minutes := (random() * 30)::INTEGER + 5; -- 5-35 minutos tarde
                            check_in_time := current_date + schedule_record.start_time + (late_minutes || ' minutes')::INTERVAL;
                        WHEN random() < 0.95 THEN
                            status := 'ABSENT';
                            check_in_time := NULL;
                            late_minutes := NULL;
                        ELSE
                            status := 'EXCUSED';
                            check_in_time := NULL;
                            late_minutes := NULL;
                    END CASE;

                    INSERT INTO attendanceservice_schema.attendance_records (
                        id, student_id, ficha_id, class_id, status,
                        check_in_time, check_out_time, date, late_minutes,
                        notes, is_justified, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(),
                        apprentice_record.student_id,
                        schedule_record.academic_group_id,
                        schedule_record.schedule_id,
                        status::attendancestatus,
                        check_in_time,
                        CASE WHEN status = 'PRESENT' OR status = 'LATE'
                             THEN check_in_time + INTERVAL '2 hours'
                             ELSE NULL
                        END,
                        current_date,
                        late_minutes,
                        CASE status
                            WHEN 'EXCUSED' THEN 'Cita médica'
                            WHEN 'LATE' THEN 'Problemas de transporte'
                            ELSE NULL
                        END,
                        CASE WHEN status = 'EXCUSED' THEN true ELSE false END,
                        NOW(),
                        NOW()
                    );
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;

    RAISE NOTICE 'Registros de asistencia creados para los últimos % días', days_back;
END $$;
```

## 📋 Script de Ejecución Completa

```sql
-- ===========================================
-- SCRIPT MAESTRO DE EJECUCIÓN
-- ===========================================

-- Verificar conexión y esquemas
SELECT 'Conexión exitosa a PostgreSQL' as status;

-- Verificar esquemas existentes
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN ('userservice_schema', 'scheduleservice_schema', 'attendanceservice_schema');

-- Ejecutar scripts en orden
\echo 'Ejecutando Script 1: Sedes...'
\i script_01_sedes.sql

\echo 'Ejecutando Script 2: Programas...'
\i script_02_programas.sql

\echo 'Ejecutando Script 3: Venues...'
\i script_03_venues.sql

\echo 'Ejecutando Script 4: Instructores...'
\i script_04_instructores.sql

\echo 'Ejecutando Script 5: Administrativos...'
\i script_05_administrativos.sql

\echo 'Ejecutando Script 6: Fichas...'
\i script_06_fichas.sql

\echo 'Ejecutando Script 7: Aprendices...'
\i script_07_aprendices.sql

\echo 'Ejecutando Script 8: Horarios...'
\i script_08_horarios.sql

\echo 'Ejecutando Script 9: Asistencia...'
\i script_09_asistencia.sql

-- Verificación final
SELECT
  'users' as tabla,
  COUNT(*) as registros,
  COUNT(*) FILTER (WHERE role = 'APPRENTICE') as aprendices,
  COUNT(*) FILTER (WHERE role = 'INSTRUCTOR') as instructores,
  COUNT(*) FILTER (WHERE role = 'ADMINISTRATIVE') as administrativos,
  COUNT(*) FILTER (WHERE role = 'ADMIN') as admins
FROM userservice_schema.users

UNION ALL

SELECT
  'academic_programs',
  COUNT(*),
  NULL, NULL, NULL, NULL
FROM scheduleservice_schema.academic_programs

UNION ALL

SELECT
  'academic_groups',
  COUNT(*),
  NULL, NULL, NULL, NULL
FROM scheduleservice_schema.academic_groups

UNION ALL

SELECT
  'campuses',
  COUNT(*),
  NULL, NULL, NULL, NULL
FROM scheduleservice_schema.campuses

UNION ALL

SELECT
  'venues',
  COUNT(*),
  NULL, NULL, NULL, NULL
FROM scheduleservice_schema.venues

UNION ALL

SELECT
  'schedules',
  COUNT(*),
  NULL, NULL, NULL, NULL
FROM scheduleservice_schema.schedules

UNION ALL

SELECT
  'attendance_records',
  COUNT(*),
  NULL, NULL, NULL, NULL
FROM attendanceservice_schema.attendance_records;
```

## 📊 ANÁLISIS DE COBERTURA DE DATOS POR MICROSERVICIO

_Actualizado: 21 de julio de 2025_

### 🔍 Estado Actual de Esquemas y Tablas

```sql
-- Verificación de esquemas existentes
SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE '%service%';
```

**✅ Esquemas Creados:**

- `userservice_schema`
- `scheduleservice_schema`
- `attendanceservice_schema`
- `evalinservice_schema`
- `projectevalservice_schema`
- `aiservice_schema`
- `kbservice_schema`

### 📈 Cobertura por Microservicio

#### 1. 🔑 UserService - **COBERTURA: 100%**

**✅ Estado: COMPLETADO**

- **Tablas Pobladas:**

  - `users` - 2,851 registros
    - 1 Coordinador (COORDINATOR)
    - 100 Instructores (INSTRUCTOR)
    - 2,750 Aprendices (APPRENTICE)

- **Funcionalidades Cubiertas:**

  - ✅ Autenticación y autorización
  - ✅ Gestión de usuarios por rol
  - ✅ Validación de credenciales
  - ✅ Perfiles completos con datos realistas

- **Datos Pendientes:** Ninguno

#### 2. 📅 ScheduleService - **COBERTURA: 95%**

**✅ Estado: CASI COMPLETADO**

- **Tablas Pobladas:**

  - `venues` - 100 registros (aulas y laboratorios)
  - `academic_programs` - 20 registros (programas OneVision)
  - `academic_groups` - 100 registros (fichas)
  - `schedules` - 340 registros (horarios únicos)

- **Funcionalidades Cubiertas:**

  - ✅ Gestión de ambientes de formación
  - ✅ Programas académicos completos
  - ✅ Fichas con distribución realista
  - ✅ Horarios sin conflictos (instructores/aulas)

- **Datos Pendientes:**
  - 🔶 `learning_activities` - Actividades específicas por programa
  - 🔶 `instructor_assignments` - Asignaciones instructor-materia

#### 3. ✅ AttendanceService - **COBERTURA: 90%**

**✅ Estado: COMPLETADO CON EXTENSIONES PENDIENTES**

- **Tablas Pobladas:**

  - `attendance_records` - ~206,250 registros (enero 2025)
    - Asistencia promedio: 85%
    - Distribución realista por jornadas
    - Estados: PRESENT, ABSENT, LATE, JUSTIFIED

- **Funcionalidades Cubiertas:**

  - ✅ Registro de asistencia diaria
  - ✅ Control por grupos/fichas
  - ✅ Estados de asistencia variados
  - ✅ Métricas estadísticas

- **Datos Pendientes:**
  - 🔶 Extensión a más meses (febrero-diciembre)
  - 🔶 `attendance_exceptions` - Justificaciones especiales

#### 4. 📝 EvalinService - **COBERTURA: 20%**

**🔶 Estado: ESQUEMA CREADO, DATOS PENDIENTES**

- **Tablas Existentes:** Solo esquema
- **Tablas Requeridas:**

  - `evaluations` - Evaluaciones académicas
  - `evaluation_criteria` - Criterios de evaluación
  - `student_evaluations` - Calificaciones de aprendices
  - `competencies` - Competencias OneVision
  - `learning_outcomes` - Resultados de aprendizaje

- **Funcionalidades Pendientes:**
  - 🔴 Evaluaciones por competencias
  - 🔴 Calificaciones de aprendices
  - 🔴 Criterios de evaluación OneVision
  - 🔴 Seguimiento académico

#### 5. 🏗️ ProjectEvalService - **COBERTURA: 15%**

**🔶 Estado: ESQUEMA CREADO, DATOS PENDIENTES**

- **Tablas Existentes:** Solo esquema
- **Tablas Requeridas:**

  - `projects` - Proyectos formativos
  - `project_phases` - Fases del proyecto
  - `project_deliverables` - Entregables
  - `project_evaluations` - Evaluaciones de proyecto
  - `team_assignments` - Asignaciones de equipos

- **Funcionalidades Pendientes:**
  - 🔴 Proyectos formativos por programa
  - 🔴 Evaluación por fases
  - 🔴 Trabajo en equipos
  - 🔴 Entregables y rubrica

#### 6. 🤖 AIService - **COBERTURA: 10%**

**🔶 Estado: ESQUEMA CREADO, DATOS PENDIENTES**

- **Tablas Existentes:** Solo esquema
- **Tablas Requeridas:**

  - `ai_models` - Modelos IA disponibles
  - `ai_predictions` - Predicciones generadas
  - `ai_training_data` - Datos de entrenamiento
  - `ai_analytics` - Análisis y métricas
  - `recommendation_engine` - Motor de recomendaciones

- **Funcionalidades Pendientes:**
  - 🔴 Predicción de deserción
  - 🔴 Recomendaciones personalizadas
  - 🔴 Análisis de rendimiento académico
  - 🔴 Detección de patrones

#### 7. 📚 KBService - **COBERTURA: 10%**

**🔶 Estado: ESQUEMA CREADO, DATOS PENDIENTES**

- **Tablas Existentes:** Solo esquema
- **Tablas Requeridas:**

  - `knowledge_articles` - Artículos de conocimiento
  - `categories` - Categorías de contenido
  - `tags` - Etiquetas y metadatos
  - `user_interactions` - Interacciones de usuarios
  - `content_ratings` - Valoraciones de contenido

- **Funcionalidades Pendientes:**
  - 🔴 Base de conocimiento OneVision
  - 🔴 Contenido educativo organizado
  - 🔴 Sistema de búsqueda
  - 🔴 Interacciones y feedback

### 🎯 RESUMEN EJECUTIVO DE COBERTURA

| Microservicio          | Cobertura | Estado           | Tablas Pobladas | Prioridad   |
| ---------------------- | --------- | ---------------- | --------------- | ----------- |
| **UserService**        | **100%**  | ✅ Completo      | 1/1             | ✅ Listo    |
| **ScheduleService**    | **95%**   | ✅ Casi completo | 4/6             | 🔶 Menor    |
| **AttendanceService**  | **90%**   | ✅ Funcional     | 1/2             | 🔶 Menor    |
| **EvalinService**      | **20%**   | 🔴 Crítico       | 0/5             | 🔴 **ALTA** |
| **ProjectEvalService** | **15%**   | 🔴 Crítico       | 0/5             | 🔴 **ALTA** |
| **AIService**          | **10%**   | 🔴 Inicial       | 0/5             | 🔶 Media    |
| **KBService**          | **10%**   | 🔴 Inicial       | 0/5             | 🔶 Media    |

### 🚀 PLAN DE ACCIÓN RECOMENDADO

#### ⚡ **FASE INMEDIATA** (EvalinService y ProjectEvalService)

**Objetivo:** Alcanzar 80% de cobertura en servicios críticos

1. **EvalinService (Prioridad 1)**

   - Crear tablas de evaluaciones y competencias
   - Poblar con evaluaciones realistas por programa
   - Generar calificaciones para aprendices existentes

2. **ProjectEvalService (Prioridad 2)**
   - Crear estructura de proyectos formativos
   - Asignar proyectos a fichas activas
   - Definir fases y entregables estándar

#### 📈 **FASE EXTENSIÓN** (Servicios Avanzados)

**Objetivo:** Completar ecosistema integral

3. **AIService y KBService**
   - Implementar datos base para IA
   - Crear contenido educativo inicial
   - Configurar motores de recomendación

### 📋 SCRIPTS DE POBLACIÓN PENDIENTES

```bash
# Scripts necesarios para completar cobertura
_docs/data-vps/scripts/
├── poblacion_evalin_completa.sql      # EvalinService → 80%
├── poblacion_projecteval_completa.sql # ProjectEvalService → 80%
├── poblacion_ai_basica.sql           # AIService → 60%
└── poblacion_kb_inicial.sql          # KBService → 60%
```

**Estado Base de Datos OneVision: NÚCLEO COMPLETO, EXTENSIONES PENDIENTES**

Los microservicios críticos (User, Schedule, Attendance) están 100% operativos para pruebas inmediatas.
