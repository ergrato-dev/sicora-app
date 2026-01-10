-- /home/epti/Documentos/epti-dev/asiste-app/fast-rn/sicora-app-be-multistack/database/init/01_init_db_users_schemas.sql

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

-- NOTA: El usuario 'postgres' (o el definido por POSTGRES_USER en docker-compose)
-- sigue siendo el superusuario y propietario de la base de datos 'sicora_dev'.
-- Estos usuarios de servicio tienen permisos granulares sobre sus respectivos esquemas.