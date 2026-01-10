-- /home/epti/Documentos/epti-dev/asiste-app/fast-rn/sicora-app-be-multistack/01-fastapi/database/init/01_init_db_users_schemas.sql

-- ###############################################
-- # UserService
-- ###############################################
-- Crear Esquema para UserService
CREATE SCHEMA IF NOT EXISTS userservice_schema;

-- Crear Usuario para UserService
CREATE USER userservice_user WITH PASSWORD 'userservice_password_placeholder'; -- COINCIDIR CON .env.example

-- Otorgar todos los privilegios sobre el esquema userservice_schema al usuario userservice_user
ALTER SCHEMA userservice_schema OWNER TO userservice_user;
GRANT ALL ON SCHEMA userservice_schema TO userservice_user;

-- Establecer el search_path por defecto para userservice_user
-- Esto significa que cuando userservice_user se conecte, buscará tablas primero en su esquema, luego en public.
ALTER ROLE userservice_user SET search_path = userservice_schema, public;

-- Otorgar permisos necesarios sobre la base de datos principal (sicora_dev se crea vía env var)
GRANT CONNECT ON DATABASE sicora_dev TO userservice_user;
GRANT USAGE ON SCHEMA public TO userservice_user; -- Por si se necesita algo de public temporalmente

-- ###############################################
-- # ScheduleService
-- ###############################################
CREATE SCHEMA IF NOT EXISTS scheduleservice_schema;
CREATE USER scheduleservice_user WITH PASSWORD 'scheduleservice_password_placeholder'; -- COINCIDIR CON .env.example
ALTER SCHEMA scheduleservice_schema OWNER TO scheduleservice_user;
GRANT ALL ON SCHEMA scheduleservice_schema TO scheduleservice_user;
ALTER ROLE scheduleservice_user SET search_path = scheduleservice_schema, public;
GRANT CONNECT ON DATABASE sicora_dev TO scheduleservice_user;
GRANT USAGE ON SCHEMA public TO scheduleservice_user;

-- ###############################################
-- # AttendanceService
-- ###############################################
CREATE SCHEMA IF NOT EXISTS attendanceservice_schema;
CREATE USER attendanceservice_user WITH PASSWORD 'attendanceservice_password_placeholder'; -- COINCIDIR CON .env.example
ALTER SCHEMA attendanceservice_schema OWNER TO attendanceservice_user;
GRANT ALL ON SCHEMA attendanceservice_schema TO attendanceservice_user;
ALTER ROLE attendanceservice_user SET search_path = attendanceservice_schema, public;
GRANT CONNECT ON DATABASE sicora_dev TO attendanceservice_user;
GRANT USAGE ON SCHEMA public TO attendanceservice_user;

-- ###############################################
-- # EvalinService
-- ###############################################
CREATE SCHEMA IF NOT EXISTS evalinservice_schema;
CREATE USER evalinservice_user WITH PASSWORD 'evalinservice_password_placeholder'; -- COINCIDIR CON .env.example
ALTER SCHEMA evalinservice_schema OWNER TO evalinservice_user;
GRANT ALL ON SCHEMA evalinservice_schema TO evalinservice_user;
ALTER ROLE evalinservice_user SET search_path = evalinservice_schema, public;
GRANT CONNECT ON DATABASE sicora_dev TO evalinservice_user;
GRANT USAGE ON SCHEMA public TO evalinservice_user;

-- ###############################################
-- # KBService
-- ###############################################
CREATE SCHEMA IF NOT EXISTS kbservice_schema;
CREATE USER kbservice_user WITH PASSWORD 'kbservice_password_placeholder'; -- COINCIDIR CON .env.example
ALTER SCHEMA kbservice_schema OWNER TO kbservice_user;
GRANT ALL ON SCHEMA kbservice_schema TO kbservice_user;
ALTER ROLE kbservice_user SET search_path = kbservice_schema, public;
GRANT CONNECT ON DATABASE sicora_dev TO kbservice_user;
GRANT USAGE ON SCHEMA public TO kbservice_user;

-- ###############################################
-- # AIService
-- ###############################################
CREATE SCHEMA IF NOT EXISTS aiservice_schema;
CREATE USER aiservice_user WITH PASSWORD 'aiservice_password_placeholder'; -- COINCIDIR CON .env.example
ALTER SCHEMA aiservice_schema OWNER TO aiservice_user;
GRANT ALL ON SCHEMA aiservice_schema TO aiservice_user;
ALTER ROLE aiservice_user SET search_path = aiservice_schema, public;
GRANT CONNECT ON DATABASE sicora_dev TO aiservice_user;
GRANT USAGE ON SCHEMA public TO aiservice_user;

-- ###############################################
-- # SoftwareFactoryService
-- ###############################################
CREATE SCHEMA IF NOT EXISTS softwarefactoryservice_schema;
CREATE USER softwarefactoryservice_user WITH PASSWORD 'softwarefactoryservice_password_placeholder'; -- COINCIDIR CON .env.example
ALTER SCHEMA softwarefactoryservice_schema OWNER TO softwarefactoryservice_user;
GRANT ALL ON SCHEMA softwarefactoryservice_schema TO softwarefactoryservice_user;
ALTER ROLE softwarefactoryservice_user SET search_path = softwarefactoryservice_schema, public;
GRANT CONNECT ON DATABASE sicora_dev TO softwarefactoryservice_user;
GRANT USAGE ON SCHEMA public TO softwarefactoryservice_user;

-- ###############################################
-- # MevalService
-- ###############################################
CREATE SCHEMA IF NOT EXISTS mevalservice_schema;
CREATE USER mevalservice_user WITH PASSWORD 'mevalservice_password_placeholder'; -- COINCIDIR CON .env.example
ALTER SCHEMA mevalservice_schema OWNER TO mevalservice_user;
GRANT ALL ON SCHEMA mevalservice_schema TO mevalservice_user;
ALTER ROLE mevalservice_user SET search_path = mevalservice_schema, public;
GRANT CONNECT ON DATABASE sicora_dev TO mevalservice_user;
GRANT USAGE ON SCHEMA public TO mevalservice_user;

-- ###############################################
-- # ProjectEvalService
-- ###############################################
CREATE SCHEMA IF NOT EXISTS projectevalservice_schema;
CREATE USER projectevalservice_user WITH PASSWORD 'projectevalservice_password_placeholder'; -- COINCIDIR CON .env.example
ALTER SCHEMA projectevalservice_schema OWNER TO projectevalservice_user;
GRANT ALL ON SCHEMA projectevalservice_schema TO projectevalservice_user;
ALTER ROLE projectevalservice_user SET search_path = projectevalservice_schema, public;
GRANT CONNECT ON DATABASE sicora_dev TO projectevalservice_user;
GRANT USAGE ON SCHEMA public TO projectevalservice_user;

-- NOTA: El usuario 'postgres' (o el definido por POSTGRES_USER en docker-compose)
-- sigue siendo el superusuario y propietario de la base de datos 'sicora_dev'.
-- Estos usuarios de servicio tienen permisos granulares sobre sus respectivos esquemas.

-- ###############################################
-- # CONFIGURACIÓN DE PERMISOS GRANULARES
-- ###############################################

-- Revocar permisos CREATE en public para todos los usuarios de servicios
REVOKE CREATE ON SCHEMA public FROM userservice_user;
REVOKE CREATE ON SCHEMA public FROM scheduleservice_user;
REVOKE CREATE ON SCHEMA public FROM attendanceservice_user;
REVOKE CREATE ON SCHEMA public FROM evalinservice_user;
REVOKE CREATE ON SCHEMA public FROM kbservice_user;
REVOKE CREATE ON SCHEMA public FROM aiservice_user;
REVOKE CREATE ON SCHEMA public FROM softwarefactoryservice_user;
REVOKE CREATE ON SCHEMA public FROM mevalservice_user;
REVOKE CREATE ON SCHEMA public FROM projectevalservice_user;

-- Configurar permisos de solo lectura para tablas compartidas (si las hay)
-- Los usuarios no pueden crear objetos en esquemas de otros servicios

-- ###############################################
-- # OPTIMIZACIONES PARA PAGINACIÓN Y PERFORMANCE
-- ###############################################

-- Configurar parámetros de conexión para optimizar paginación
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_counts = on;
ALTER SYSTEM SET track_activities = on;
ALTER SYSTEM SET track_io_timing = on;

-- Configurar memoria para operaciones de ordenamiento (importante para paginación)
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- Configurar parámetros de paginación eficiente
ALTER SYSTEM SET random_page_cost = 1.1; -- Para SSD
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Configurar límites de conexión por schema (Connection Pooling)
ALTER ROLE userservice_user CONNECTION LIMIT 50;
ALTER ROLE scheduleservice_user CONNECTION LIMIT 50;
ALTER ROLE attendanceservice_user CONNECTION LIMIT 50;
ALTER ROLE evalinservice_user CONNECTION LIMIT 50;
ALTER ROLE kbservice_user CONNECTION LIMIT 50;
ALTER ROLE aiservice_user CONNECTION LIMIT 50;
ALTER ROLE softwarefactoryservice_user CONNECTION LIMIT 50;
ALTER ROLE mevalservice_user CONNECTION LIMIT 50;
ALTER ROLE projectevalservice_user CONNECTION LIMIT 50;

-- ###############################################
-- # CONFIGURACIÓN DE MONITOREO POR SCHEMA
-- ###############################################

-- Crear extensiones necesarias para monitoreo y performance
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Configurar estadísticas automáticas para optimización de queries
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s

-- NOTA: Aplicar configuraciones con SELECT pg_reload_conf(); después de inicializar