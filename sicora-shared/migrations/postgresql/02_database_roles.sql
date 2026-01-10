-- Script de roles y permisos para SICORA
-- Crear rol para migraciones (usado solo por FastAPI)
CREATE ROLE sicora_migrator LOGIN PASSWORD 'cambia_esto_migrator';
GRANT CREATE, CONNECT, TEMPORARY ON DATABASE sicora_dev TO sicora_migrator;

-- Crear rol para servicios Go (solo acceso a datos, sin permisos de DDL)
CREATE ROLE sicora_app_rw LOGIN PASSWORD 'cambia_esto_rw';
GRANT CONNECT ON DATABASE sicora_dev TO sicora_app_rw;

-- Otorgar permisos de uso y acceso a los esquemas necesarios
GRANT USAGE ON SCHEMA public TO sicora_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sicora_app_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sicora_app_rw;

-- Para futuros objetos
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sicora_app_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO sicora_app_rw;

-- Revocar permisos peligrosos
REVOKE CREATE ON SCHEMA public FROM sicora_app_rw;
REVOKE ALL ON DATABASE sicora_dev FROM PUBLIC;
