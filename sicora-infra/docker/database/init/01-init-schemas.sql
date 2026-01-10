-- =============================================================================
-- SICORA - Inicialización de Base de Datos Unificada
-- =============================================================================
-- Este script crea la estructura base para todos los microservicios
-- Una sola base de datos (sicora_dev) con esquemas individuales por servicio
-- =============================================================================
-- SERVICIOS IMPLEMENTADOS:
--   Go: userservice, scheduleservice, attendanceservice, evalinservice,
--       kbservice, mevalservice, projectevalservice, apigateway
--   Python: aiservice
-- =============================================================================

-- Crear base de datos sicora_dev si no existe (ejecutar como postgres)
-- CREATE DATABASE sicora_dev;

-- Crear usuario sicora_user si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sicora_user') THEN
        CREATE ROLE sicora_user WITH LOGIN PASSWORD 'sicora_password';
    END IF;
END
$$;

-- Dar permisos de conexión
GRANT CONNECT ON DATABASE sicora_dev TO sicora_user;

-- =============================================================================
-- Crear esquemas para cada microservicio IMPLEMENTADO
-- =============================================================================

-- User Service (Go - Puerto 8001)
CREATE SCHEMA IF NOT EXISTS userservice;
COMMENT ON SCHEMA userservice IS 'Gestión de usuarios, autenticación y roles';

-- Schedule Service (Go - Puerto 8002)
CREATE SCHEMA IF NOT EXISTS scheduleservice;
COMMENT ON SCHEMA scheduleservice IS 'Gestión de horarios y programación';

-- Attendance Service (Go - Puerto 8003)
CREATE SCHEMA IF NOT EXISTS attendanceservice;
COMMENT ON SCHEMA attendanceservice IS 'Registro y control de asistencia';

-- Evalin Service (Go - Puerto 8004)
CREATE SCHEMA IF NOT EXISTS evalinservice;
COMMENT ON SCHEMA evalinservice IS 'Evaluaciones individuales de aprendices';

-- KB Service (Go - Puerto 8005)
CREATE SCHEMA IF NOT EXISTS kbservice;
COMMENT ON SCHEMA kbservice IS 'Base de conocimiento y documentación';

-- MEval Service (Go - Puerto 8006)
CREATE SCHEMA IF NOT EXISTS mevalservice;
COMMENT ON SCHEMA mevalservice IS 'Evaluación de métodos de enseñanza';

-- AI Service (Python - Puerto 8007)
CREATE SCHEMA IF NOT EXISTS aiservice;
COMMENT ON SCHEMA aiservice IS 'Servicios de inteligencia artificial';

-- Project Eval Service (Go - Puerto 8008)
CREATE SCHEMA IF NOT EXISTS projectevalservice;
COMMENT ON SCHEMA projectevalservice IS 'Evaluación de proyectos formativos';

-- API Gateway (Go - Puerto 8000)
CREATE SCHEMA IF NOT EXISTS apigateway;
COMMENT ON SCHEMA apigateway IS 'Configuración y logs del API Gateway';

-- =============================================================================
-- Otorgar permisos a sicora_user
-- =============================================================================

-- Permisos sobre todos los esquemas
GRANT ALL PRIVILEGES ON SCHEMA userservice TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA scheduleservice TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA attendanceservice TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA evalinservice TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA kbservice TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA mevalservice TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA aiservice TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA projectevalservice TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA apigateway TO sicora_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO sicora_user;

-- Permisos por defecto para nuevas tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA userservice GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA scheduleservice GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA attendanceservice GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA evalinservice GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA kbservice GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA mevalservice GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA aiservice GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA projectevalservice GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA apigateway GRANT ALL ON TABLES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sicora_user;

-- Permisos para secuencias
ALTER DEFAULT PRIVILEGES IN SCHEMA userservice GRANT ALL ON SEQUENCES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA scheduleservice GRANT ALL ON SEQUENCES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA attendanceservice GRANT ALL ON SEQUENCES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA evalinservice GRANT ALL ON SEQUENCES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA kbservice GRANT ALL ON SEQUENCES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA mevalservice GRANT ALL ON SEQUENCES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA aiservice GRANT ALL ON SEQUENCES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA projectevalservice GRANT ALL ON SEQUENCES TO sicora_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA apigateway GRANT ALL ON SEQUENCES TO sicora_user;

-- =============================================================================
-- Habilitar extensiones útiles
-- =============================================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Búsqueda de texto completo mejorada
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Vector embeddings para AI/RAG (si pgvector está disponible)
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================================
-- Verificación
-- =============================================================================

SELECT 
    schema_name,
    schema_owner
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY schema_name;
