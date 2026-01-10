-- =============================================================================
-- MIGRACIÓN: Agregar tablas de Competencias y Resultados de Aprendizaje
-- Fecha: 2024
-- Descripción: 
--   - Agrega las tablas competencias y resultados_aprendizaje
--   - Actualiza las tablas academic_programs, academic_groups, venues, schedules
--     con nuevos campos
-- =============================================================================

-- ============================================
-- UP: CREAR NUEVAS TABLAS Y COLUMNAS
-- ============================================

-- Agregar nuevas columnas a academic_programs
ALTER TABLE academic_programs 
ADD COLUMN IF NOT EXISTS version VARCHAR(20),
ADD COLUMN IF NOT EXISTS total_hours INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS lective_hours INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS productive_hours INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS knowledge_network VARCHAR(200),
ADD COLUMN IF NOT EXISTS technology_line VARCHAR(200);

-- Comentarios para academic_programs
COMMENT ON COLUMN academic_programs.version IS 'Versión del diseño curricular';
COMMENT ON COLUMN academic_programs.total_hours IS 'Horas totales del programa';
COMMENT ON COLUMN academic_programs.lective_hours IS 'Horas de etapa lectiva';
COMMENT ON COLUMN academic_programs.productive_hours IS 'Horas de etapa productiva';
COMMENT ON COLUMN academic_programs.credits IS 'Créditos académicos';
COMMENT ON COLUMN academic_programs.knowledge_network IS 'Red de conocimiento';
COMMENT ON COLUMN academic_programs.technology_line IS 'Línea tecnológica';

-- Agregar nuevas columnas a academic_groups
ALTER TABLE academic_groups 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0;

COMMENT ON COLUMN academic_groups.start_date IS 'Fecha de inicio de la ficha';
COMMENT ON COLUMN academic_groups.end_date IS 'Fecha estimada de finalización';
COMMENT ON COLUMN academic_groups.student_count IS 'Cantidad de aprendices';

-- Agregar nuevas columnas a venues
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS building VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS equipment TEXT;

COMMENT ON COLUMN venues.building IS 'Bloque o edificio';
COMMENT ON COLUMN venues.description IS 'Descripción del ambiente';
COMMENT ON COLUMN venues.equipment IS 'Equipamiento disponible (JSON o texto)';

-- Crear tabla de competencias
CREATE TABLE IF NOT EXISTS competencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(300) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('TECNICA', 'TRANSVERSAL')),
    horas_estimadas INTEGER NOT NULL DEFAULT 0,
    academic_program_id UUID NOT NULL,
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_competencias_program
        FOREIGN KEY (academic_program_id)
        REFERENCES academic_programs(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Índices para competencias
CREATE UNIQUE INDEX IF NOT EXISTS idx_competencias_codigo ON competencias(codigo) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_competencias_program ON competencias(academic_program_id);
CREATE INDEX IF NOT EXISTS idx_competencias_tipo ON competencias(tipo);
CREATE INDEX IF NOT EXISTS idx_competencias_deleted_at ON competencias(deleted_at);

-- Comentarios para competencias
COMMENT ON TABLE competencias IS 'Competencias de los programas de formación';
COMMENT ON COLUMN competencias.codigo IS 'Código único de la competencia (ej: 220501096)';
COMMENT ON COLUMN competencias.nombre IS 'Nombre de la competencia';
COMMENT ON COLUMN competencias.descripcion IS 'Descripción detallada';
COMMENT ON COLUMN competencias.tipo IS 'TECNICA o TRANSVERSAL';
COMMENT ON COLUMN competencias.horas_estimadas IS 'Horas estimadas para desarrollar la competencia';
COMMENT ON COLUMN competencias.orden IS 'Orden de la competencia dentro del programa';

-- Crear tabla de resultados de aprendizaje
CREATE TABLE IF NOT EXISTS resultados_aprendizaje (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(500) NOT NULL,
    descripcion TEXT,
    competencia_id UUID NOT NULL,
    horas_estimadas INTEGER NOT NULL DEFAULT 0,
    trimestre INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_rap_competencia
        FOREIGN KEY (competencia_id)
        REFERENCES competencias(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Índices para resultados_aprendizaje
CREATE UNIQUE INDEX IF NOT EXISTS idx_rap_codigo ON resultados_aprendizaje(codigo) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rap_competencia ON resultados_aprendizaje(competencia_id);
CREATE INDEX IF NOT EXISTS idx_rap_trimestre ON resultados_aprendizaje(trimestre);
CREATE INDEX IF NOT EXISTS idx_rap_deleted_at ON resultados_aprendizaje(deleted_at);

-- Comentarios para resultados_aprendizaje
COMMENT ON TABLE resultados_aprendizaje IS 'Resultados de Aprendizaje (RAPs) de las competencias';
COMMENT ON COLUMN resultados_aprendizaje.codigo IS 'Código único del RAP (ej: 220501096-01)';
COMMENT ON COLUMN resultados_aprendizaje.nombre IS 'Nombre/descripción del resultado de aprendizaje';
COMMENT ON COLUMN resultados_aprendizaje.trimestre IS 'Trimestre sugerido para desarrollar el RAP (0-10)';
COMMENT ON COLUMN resultados_aprendizaje.orden IS 'Orden del RAP dentro de la competencia';

-- Agregar columna resultado_aprendizaje_id a schedules (si no existe)
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS resultado_aprendizaje_id UUID,
ADD COLUMN IF NOT EXISTS shift VARCHAR(20),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Agregar constraint de FK para resultado_aprendizaje_id (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_schedules_rap' 
        AND table_name = 'schedules'
    ) THEN
        ALTER TABLE schedules 
        ADD CONSTRAINT fk_schedules_rap
            FOREIGN KEY (resultado_aprendizaje_id)
            REFERENCES resultados_aprendizaje(id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT;
    END IF;
END $$;

-- Índice para resultado_aprendizaje_id
CREATE INDEX IF NOT EXISTS idx_schedules_rap ON schedules(resultado_aprendizaje_id);

-- Comentarios para nuevas columnas en schedules
COMMENT ON COLUMN schedules.resultado_aprendizaje_id IS 'RAP asociado al horario';
COMMENT ON COLUMN schedules.shift IS 'Jornada del horario (DIURNA, NOCTURNA, MADRUGADA, MIXTA)';
COMMENT ON COLUMN schedules.notes IS 'Observaciones del instructor';

-- ============================================
-- DOWN: REVERTIR CAMBIOS (ejecutar manualmente si es necesario)
-- ============================================
/*
-- Eliminar columnas de schedules
ALTER TABLE schedules 
DROP COLUMN IF EXISTS resultado_aprendizaje_id,
DROP COLUMN IF EXISTS shift,
DROP COLUMN IF EXISTS notes;

-- Eliminar tablas
DROP TABLE IF EXISTS resultados_aprendizaje;
DROP TABLE IF EXISTS competencias;

-- Eliminar columnas de venues
ALTER TABLE venues 
DROP COLUMN IF EXISTS building,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS equipment;

-- Eliminar columnas de academic_groups
ALTER TABLE academic_groups 
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date,
DROP COLUMN IF EXISTS student_count;

-- Eliminar columnas de academic_programs
ALTER TABLE academic_programs 
DROP COLUMN IF EXISTS version,
DROP COLUMN IF EXISTS total_hours,
DROP COLUMN IF EXISTS lective_hours,
DROP COLUMN IF EXISTS productive_hours,
DROP COLUMN IF EXISTS credits,
DROP COLUMN IF EXISTS knowledge_network,
DROP COLUMN IF EXISTS technology_line;
*/
