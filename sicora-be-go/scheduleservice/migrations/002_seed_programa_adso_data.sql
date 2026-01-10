-- ====================================================================
-- SEED DATA: Programa ADSO 228118 - Análisis y Desarrollo de Software
-- ====================================================================
-- 
-- ⚠️ DATOS DE PRODUCCIÓN - NO ELIMINAR ⚠️
-- 
-- Este archivo contiene datos REALES del programa ADSO del SENA.
-- Estos datos NO deben ser limpiados durante resets de base de datos.
-- Son datos de referencia permanentes para el sistema SICORA.
--
-- Fuente: Documentación oficial SENA - Diseño Curricular ADSO 228118
-- Versión vigente desde: 10 de septiembre de 2021
-- ====================================================================

-- ====================================================================
-- TABLA: academic_programs (Programa Académico)
-- ====================================================================
INSERT INTO academic_programs (
    id, code, name, type, duration, total_hours, academic_credits, is_active, created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '228118',
    'Análisis y Desarrollo de Software',
    'TECNOLOGO',
    27,
    3984,
    83,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    duration = EXCLUDED.duration,
    total_hours = EXCLUDED.total_hours,
    academic_credits = EXCLUDED.academic_credits,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- TABLA: competencias (Competencias Técnicas)
-- ====================================================================
-- 7 Competencias Técnicas del Programa ADSO
-- ====================================================================

-- Competencia 1: Establecer requisitos de la solución de software
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    '220501092',
    'Establecer requisitos de la solución de software',
    'Especificación de requisitos de acuerdo con estándares y procedimientos técnicos. Incluye caracterización de procesos, recolección de información, establecimiento y validación de requisitos.',
    'TECNICA',
    144,
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Competencia 2: Evaluar requisitos de la solución de software
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440002',
    '220501093',
    'Evaluar requisitos de la solución de software',
    'Análisis de requisitos según metodologías y estándares. Incluye técnicas de validación (revisiones, prototipos, casos de prueba), metodologías ágiles y tradicionales, modelado UML, diagramas de flujo y pseudocódigo.',
    'TECNICA',
    240,
    '550e8400-e29b-41d4-a716-446655440001',
    2,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Competencia 3: Estructurar propuesta técnica de servicio TI
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440003',
    '220501094',
    'Estructurar propuesta técnica de servicio TI',
    'Elaboración de propuestas técnicas según requisitos técnicos y normativa. Incluye análisis de viabilidad, presupuestos, estimaciones de costos y documentación técnica.',
    'TECNICA',
    264,
    '550e8400-e29b-41d4-a716-446655440001',
    3,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Competencia 4: Diseñar la solución de software
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440004',
    '220501095',
    'Diseñar la solución de software',
    'Diseño de software desde prototipos hasta interfaces gráficas. Incluye UML, patrones de diseño, programación orientada a objetos, y principios de usabilidad y accesibilidad.',
    'TECNICA',
    480,
    '550e8400-e29b-41d4-a716-446655440001',
    4,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Competencia 5: Desarrollar la solución de software (Mayor carga horaria)
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440005',
    '220501096',
    'Desarrollar la solución de software',
    'Competencia más extensa del programa (1,008 horas). Construcción del software incluyendo bases de datos, Front-End, Back-End, y pruebas. Cubre BD relacionales y NoSQL, múltiples lenguajes de programación y tecnologías emergentes.',
    'TECNICA',
    1008,
    '550e8400-e29b-41d4-a716-446655440001',
    5,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Competencia 6: Implementar la solución de software
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440006',
    '220501097',
    'Implementar la solución de software',
    'Implementación y despliegue del software en ambientes de producción. Configuración de servicios, elaboración de guías de despliegue, manuales de usuario, planes de capacitación y mantenimiento.',
    'TECNICA',
    840,
    '550e8400-e29b-41d4-a716-446655440001',
    6,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Competencia 7: Controlar la calidad del servicio de software
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440007',
    '220501098',
    'Controlar la calidad del servicio de software',
    'Aseguramiento de calidad según estándares ISO/IEC 25000, ISO/IEC 15504, IEEE y modelos CMMI. Verificación y mejora continua de la calidad del software.',
    'TECNICA',
    144,
    '550e8400-e29b-41d4-a716-446655440001',
    7,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- TABLA: competencias (Competencias Transversales)
-- ====================================================================
-- 12 Competencias Transversales del Programa ADSO
-- ====================================================================

-- Transversal 1: Ética y cultura de paz
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440101',
    '240201526',
    'Interactuar en el contexto productivo y social con principios éticos',
    'Construcción de una cultura de paz mediante dignidad personal, relaciones de crecimiento comunitario, uso racional de recursos naturales y estrategias de transformación de conflictos.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    101,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 2: Derechos laborales
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440102',
    '210201501',
    'Ejercer derechos fundamentales del trabajo',
    'Conocimiento del marco de la constitución política y convenios internacionales laborales.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    102,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 3: Cultura física
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440103',
    '230101507',
    'Generar hábitos saludables de vida',
    'Aplicación de programas de actividad física para mantener un estilo de vida saludable.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    103,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 4: Comunicación
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440104',
    '240201524',
    'Desarrollar procesos de comunicación eficaces y efectivos',
    'Comunicación en situaciones de orden social, personal y productivo.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    104,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 5: Ciencias naturales
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440105',
    '220201501',
    'Aplicar conocimientos de ciencias naturales',
    'Aplicación según el contexto productivo y social.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    105,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 6: Seguridad y salud en el trabajo
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440106',
    '220601501',
    'Aplicar prácticas de protección ambiental, seguridad y salud en el trabajo',
    'Estrategias de prevención y control de impactos ambientales y accidentes laborales (ATEL), seguimiento a planes y programas de SST.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    106,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 7: Emprendimiento
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440107',
    '240201525',
    'Gestionar procesos de cultura emprendedora y empresarial',
    'Integración de elementos de cultura emprendedora, caracterización de ideas de negocio, estructuración de planes de negocio y valoración de propuestas.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    107,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 8: Investigación formativa
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440108',
    '240201064',
    'Orientar investigación formativa',
    'Investigación según referentes técnicos y metodológicos.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    108,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 9: Razonamiento cuantitativo
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440109',
    '240201517',
    'Razonar cuantitativamente frente a situaciones matemáticas',
    'Aplicación de conceptos matemáticos en contextos productivos.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    109,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 10: Herramientas informáticas
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440110',
    '220501046',
    'Utilizar herramientas informáticas',
    'Uso de herramientas según necesidades de manejo de información.',
    'TRANSVERSAL',
    48,
    '550e8400-e29b-41d4-a716-446655440001',
    110,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 11: Inglés (Mayor carga horaria transversal - 360 horas)
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440111',
    '240202501',
    'Interactuar en lengua inglesa de forma oral y escrita',
    'Formación en inglés según Marco Común Europeo de Referencia para las Lenguas. Objetivo: nivel B1-B2. Mínimo 6 horas semanales de manera continua durante toda la etapa lectiva.',
    'TRANSVERSAL',
    360,
    '550e8400-e29b-41d4-a716-446655440001',
    111,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Transversal 12: Inducción
INSERT INTO competencias (
    id, codigo, nombre, descripcion, tipo, horas_asignadas, programa_id, orden, is_active, created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440112',
    '240201530',
    'Resultado de Aprendizaje de la Inducción',
    'Actividades de inducción al programa de formación.',
    'TRANSVERSAL',
    40,
    '550e8400-e29b-41d4-a716-446655440001',
    112,
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo, programa_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_asignadas = EXCLUDED.horas_asignadas,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- TABLA: resultados_aprendizaje (RAPs por Competencia Técnica)
-- ====================================================================

-- ====================================================================
-- RAPs de Competencia 220501092 - Establecer requisitos (4 RAPs)
-- ====================================================================
INSERT INTO resultados_aprendizaje (
    id, codigo, descripcion, competencia_id, orden, is_active, created_at, updated_at
) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '220501092-01', 'Caracterizar los procesos de la organización de acuerdo con el software a construir', '660e8400-e29b-41d4-a716-446655440001', 1, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440002', '220501092-02', 'Recolectar información del software a construir de acuerdo con las necesidades del cliente', '660e8400-e29b-41d4-a716-446655440001', 2, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440003', '220501092-03', 'Establecer los requisitos del software de acuerdo con la información recolectada', '660e8400-e29b-41d4-a716-446655440001', 3, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440004', '220501092-04', 'Validar el informe de requisitos de acuerdo con las necesidades del cliente', '660e8400-e29b-41d4-a716-446655440001', 4, true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- RAPs de Competencia 220501093 - Evaluar requisitos (3 RAPs)
-- ====================================================================
INSERT INTO resultados_aprendizaje (
    id, codigo, descripcion, competencia_id, orden, is_active, created_at, updated_at
) VALUES
    ('770e8400-e29b-41d4-a716-446655440005', '220501093-01', 'Planear actividades de análisis de acuerdo con la metodología seleccionada', '660e8400-e29b-41d4-a716-446655440002', 1, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440006', '220501093-02', 'Elaborar diagramas y plantillas para casos de uso', '660e8400-e29b-41d4-a716-446655440002', 2, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440007', '220501093-03', 'Resolver problemas algorítmicos con estructuras de datos', '660e8400-e29b-41d4-a716-446655440002', 3, true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- RAPs de Competencia 220501094 - Estructurar propuesta TI (3 RAPs)
-- ====================================================================
INSERT INTO resultados_aprendizaje (
    id, codigo, descripcion, competencia_id, orden, is_active, created_at, updated_at
) VALUES
    ('770e8400-e29b-41d4-a716-446655440008', '220501094-01', 'Diseñar fichas técnicas para la recolección de información', '660e8400-e29b-41d4-a716-446655440003', 1, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440009', '220501094-02', 'Especificar referentes técnicos del hardware-software y estimación de condiciones económicas', '660e8400-e29b-41d4-a716-446655440003', 2, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440010', '220501094-03', 'Elaborar propuesta técnica y económica para la implementación del proyecto', '660e8400-e29b-41d4-a716-446655440003', 3, true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- RAPs de Competencia 220501095 - Diseñar la solución (8 RAPs)
-- ====================================================================
INSERT INTO resultados_aprendizaje (
    id, codigo, descripcion, competencia_id, orden, is_active, created_at, updated_at
) VALUES
    ('770e8400-e29b-41d4-a716-446655440011', '220501095-01', 'Construir el prototipo del software según las características funcionales y de calidad', '660e8400-e29b-41d4-a716-446655440004', 1, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440012', '220501095-02', 'Diseñar modelos conceptual y lógico para el proyecto de desarrollo de software', '660e8400-e29b-41d4-a716-446655440004', 2, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440013', '220501095-03', 'Identificar y caracterizar los componentes del ciclo de vida del software', '660e8400-e29b-41d4-a716-446655440004', 3, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440014', '220501095-04', 'Evaluar artefactos de diseño de software', '660e8400-e29b-41d4-a716-446655440004', 4, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440015', '220501095-05', 'Elaborar mapa de navegación', '660e8400-e29b-41d4-a716-446655440004', 5, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440016', '220501095-06', 'Aplicar nociones de reglas de usabilidad y accesibilidad', '660e8400-e29b-41d4-a716-446655440004', 6, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440017', '220501095-07', 'Elaborar interfaz gráfica y mapa de navegación cumpliendo reglas de usabilidad y accesibilidad', '660e8400-e29b-41d4-a716-446655440004', 7, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440018', '220501095-08', 'Maquetar la interfaz gráfica en HTML/XML', '660e8400-e29b-41d4-a716-446655440004', 8, true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- RAPs de Competencia 220501096 - Desarrollar la solución (5 RAPs)
-- ====================================================================
INSERT INTO resultados_aprendizaje (
    id, codigo, descripcion, competencia_id, orden, is_active, created_at, updated_at
) VALUES
    ('770e8400-e29b-41d4-a716-446655440019', '220501096-01', 'Planear actividades de construcción del software de acuerdo con el diseño establecido', '660e8400-e29b-41d4-a716-446655440005', 1, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440020', '220501096-02', 'Construir la base de datos para el software a partir del modelo de datos', '660e8400-e29b-41d4-a716-446655440005', 2, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440021', '220501096-03', 'Crear componentes Front-End del software de acuerdo con el diseño', '660e8400-e29b-41d4-a716-446655440005', 3, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440022', '220501096-04', 'Codificar el software de acuerdo con el diseño establecido', '660e8400-e29b-41d4-a716-446655440005', 4, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440023', '220501096-05', 'Realizar pruebas al software para verificar su funcionalidad', '660e8400-e29b-41d4-a716-446655440005', 5, true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- RAPs de Competencia 220501097 - Implementar la solución (7 RAPs)
-- ====================================================================
INSERT INTO resultados_aprendizaje (
    id, codigo, descripcion, competencia_id, orden, is_active, created_at, updated_at
) VALUES
    ('770e8400-e29b-41d4-a716-446655440024', '220501097-01', 'Configurar servicios, bases de datos y software', '660e8400-e29b-41d4-a716-446655440006', 1, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440025', '220501097-05', 'Realizar configuración de servicios en ambiente de producción', '660e8400-e29b-41d4-a716-446655440006', 2, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440026', '220501097-06', 'Elaborar guía de despliegue en producción de software', '660e8400-e29b-41d4-a716-446655440006', 3, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440027', '220501097-07', 'Realizar pruebas de funcionalidad del software', '660e8400-e29b-41d4-a716-446655440006', 4, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440028', '220501097-08', 'Diseñar plan de mantenimiento y soporte del software', '660e8400-e29b-41d4-a716-446655440006', 5, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440029', '220501097-11', 'Elaborar manual de usuario', '660e8400-e29b-41d4-a716-446655440006', 6, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440030', '220501097-12', 'Elaborar plan de capacitación y pruebas de aceptación', '660e8400-e29b-41d4-a716-446655440006', 7, true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- RAPs de Competencia 220501098 - Controlar la calidad (3 RAPs)
-- ====================================================================
INSERT INTO resultados_aprendizaje (
    id, codigo, descripcion, competencia_id, orden, is_active, created_at, updated_at
) VALUES
    ('770e8400-e29b-41d4-a716-446655440031', '220501098-01', 'Incorporar actividades de aseguramiento de la calidad del software de acuerdo con estándares de la industria', '660e8400-e29b-41d4-a716-446655440007', 1, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440032', '220501098-02', 'Verificar la calidad del software de acuerdo con las prácticas asociadas en los procesos de desarrollo', '660e8400-e29b-41d4-a716-446655440007', 2, true, NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440033', '220501098-03', 'Realizar actividades de mejora de la calidad del software a partir de los resultados de la verificación', '660e8400-e29b-41d4-a716-446655440007', 3, true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- RESUMEN DE DATOS INSERTADOS
-- ====================================================================
-- 
-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  PROGRAMA ADSO 228118 - DATOS DE PRODUCCIÓN                       ║
-- ╠════════════════════════════════════════════════════════════════════╣
-- ║  • 1 Programa Académico (228118 - TECNOLOGO - 27 meses)           ║
-- ║  • 7 Competencias Técnicas (3,120 horas)                          ║
-- ║  • 12 Competencias Transversales (864 horas)                      ║
-- ║  • 33 Resultados de Aprendizaje (RAPs)                            ║
-- ╠════════════════════════════════════════════════════════════════════╣
-- ║  DISTRIBUCIÓN HORARIA TÉCNICA:                                    ║
-- ║  • 220501092 - Establecer requisitos:     144 h  (4 RAPs)        ║
-- ║  • 220501093 - Evaluar requisitos:        240 h  (3 RAPs)        ║
-- ║  • 220501094 - Estructurar propuesta:     264 h  (3 RAPs)        ║
-- ║  • 220501095 - Diseñar solución:          480 h  (8 RAPs)        ║
-- ║  • 220501096 - Desarrollar solución:    1,008 h  (5 RAPs)        ║
-- ║  • 220501097 - Implementar solución:      840 h  (7 RAPs)        ║
-- ║  • 220501098 - Controlar calidad:         144 h  (3 RAPs)        ║
-- ╠════════════════════════════════════════════════════════════════════╣
-- ║  TOTAL: 3,984 horas (3,120 lectiva + 864 productiva)              ║
-- ║  CRÉDITOS: 83 créditos académicos                                 ║
-- ╚════════════════════════════════════════════════════════════════════╝
--
-- ⚠️ ESTOS DATOS SON PERMANENTES - NO ELIMINAR DURANTE RESETS ⚠️
-- ====================================================================
