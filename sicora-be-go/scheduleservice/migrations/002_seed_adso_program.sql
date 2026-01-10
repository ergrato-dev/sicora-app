-- =============================================================================
-- SEED DATA: Programa ADSO con Competencias y Resultados de Aprendizaje
-- Código del programa: 228118
-- Fuente: Diseño curricular oficial SENA
-- =============================================================================

-- Primero, insertar el programa académico ADSO
INSERT INTO academic_programs (
    id,
    name,
    code,
    type,
    version,
    duration,
    total_hours,
    lective_hours,
    productive_hours,
    credits,
    knowledge_network,
    technology_line,
    description,
    is_active
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Análisis y Desarrollo de Software',
    '228118',
    'TECNOLOGO',
    '2021-09-10',
    27,  -- meses
    3984,
    3120,
    864,
    83,
    'Informática, Diseño y Desarrollo de Software',
    'Tecnologías de la Información y las Comunicaciones - Gestión de la Información',
    'Programa de formación tecnológica que forma profesionales capaces de analizar, diseñar, desarrollar, implementar y controlar la calidad de soluciones de software según requerimientos del cliente. Incluye tecnologías emergentes como Cloud Computing, IoT, Blockchain y Machine Learning.',
    true
) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    version = EXCLUDED.version,
    duration = EXCLUDED.duration,
    total_hours = EXCLUDED.total_hours,
    lective_hours = EXCLUDED.lective_hours,
    productive_hours = EXCLUDED.productive_hours,
    credits = EXCLUDED.credits,
    knowledge_network = EXCLUDED.knowledge_network,
    technology_line = EXCLUDED.technology_line,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Variable para referenciar el programa
DO $$
DECLARE
    v_program_id UUID := '550e8400-e29b-41d4-a716-446655440001';
    v_comp_id UUID;
BEGIN

-- =============================================================================
-- COMPETENCIAS TÉCNICAS (7)
-- =============================================================================

-- Competencia 1: 220501092 - Establecer requisitos de la solución de software (144 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220501092',
    'Establecer requisitos de la solución de software',
    'Especificación de requisitos de acuerdo con estándares y procedimientos técnicos. Incluye caracterización de procesos, recolección de información, establecimiento y validación de requisitos.',
    'TECNICA',
    144,
    v_program_id,
    1,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP
RETURNING id INTO v_comp_id;

-- RAPs de competencia 220501092
INSERT INTO resultados_aprendizaje (codigo, nombre, descripcion, competencia_id, horas_estimadas, trimestre, orden, is_active) VALUES
('220501092-01', 'Caracterizar los procesos de la organización de acuerdo con el software a construir', 'Identificar y documentar los procesos organizacionales que serán soportados por el software', v_comp_id, 36, 1, 1, true),
('220501092-02', 'Recolectar información del software a construir de acuerdo con las necesidades del cliente', 'Aplicar técnicas de levantamiento de información: entrevistas, cuestionarios, observación directa', v_comp_id, 36, 1, 2, true),
('220501092-03', 'Establecer los requisitos del software de acuerdo con la información recolectada', 'Documentar requisitos funcionales y no funcionales usando estándares IEEE 830', v_comp_id, 36, 1, 3, true),
('220501092-04', 'Validar el informe de requisitos de acuerdo con las necesidades del cliente', 'Verificar con el cliente que los requisitos documentados reflejan sus necesidades reales', v_comp_id, 36, 1, 4, true)
ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    trimestre = EXCLUDED.trimestre,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia 2: 220501093 - Evaluar requisitos de la solución de software (240 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220501093',
    'Evaluar requisitos de la solución de software',
    'Análisis de requisitos según metodologías y estándares. Incluye técnicas de validación (revisiones, prototipos, casos de prueba), metodologías ágiles y tradicionales, modelado UML, diagramas de flujo y pseudocódigo.',
    'TECNICA',
    240,
    v_program_id,
    2,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP
RETURNING id INTO v_comp_id;

-- RAPs de competencia 220501093
INSERT INTO resultados_aprendizaje (codigo, nombre, descripcion, competencia_id, horas_estimadas, trimestre, orden, is_active) VALUES
('220501093-01', 'Planear actividades de análisis de acuerdo con la metodología seleccionada', 'Definir plan de análisis usando metodologías ágiles (Scrum, Kanban) o tradicionales (RUP, cascada)', v_comp_id, 80, 2, 1, true),
('220501093-02', 'Elaborar diagramas y plantillas para casos de uso', 'Crear diagramas UML de casos de uso, secuencia y actividades con herramientas como StarUML, Enterprise Architect', v_comp_id, 80, 2, 2, true),
('220501093-03', 'Resolver problemas algorítmicos con estructuras de datos', 'Aplicar lógica de programación, estructuras de datos (arrays, listas, pilas, colas, árboles) y algoritmos de ordenamiento y búsqueda', v_comp_id, 80, 2, 3, true)
ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    trimestre = EXCLUDED.trimestre,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia 3: 220501094 - Estructurar propuesta técnica de servicio TI (264 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220501094',
    'Estructurar propuesta técnica de servicio TI',
    'Elaboración de propuestas técnicas según requisitos técnicos y normativa, incluyendo análisis de viabilidad, presupuestos, estimaciones de costos y documentación técnica.',
    'TECNICA',
    264,
    v_program_id,
    3,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP
RETURNING id INTO v_comp_id;

-- RAPs de competencia 220501094
INSERT INTO resultados_aprendizaje (codigo, nombre, descripcion, competencia_id, horas_estimadas, trimestre, orden, is_active) VALUES
('220501094-01', 'Diseñar fichas técnicas para la recolección de información', 'Crear instrumentos de recolección de información técnica sobre infraestructura y recursos', v_comp_id, 88, 2, 1, true),
('220501094-02', 'Especificar referentes técnicos del hardware-software y estimación de condiciones económicas', 'Definir especificaciones técnicas de equipos, software y estimar costos del proyecto', v_comp_id, 88, 2, 2, true),
('220501094-03', 'Elaborar propuesta técnica y económica para la implementación del proyecto', 'Documentar propuesta integral incluyendo alcance, cronograma, recursos y presupuesto', v_comp_id, 88, 3, 3, true)
ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    trimestre = EXCLUDED.trimestre,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia 4: 220501095 - Diseñar la solución de software (480 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220501095',
    'Diseñar la solución de software',
    'Diseño de software desde prototipos hasta interfaces gráficas, con enfoque en UML, patrones de diseño, programación orientada a objetos, y principios de usabilidad y accesibilidad.',
    'TECNICA',
    480,
    v_program_id,
    4,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP
RETURNING id INTO v_comp_id;

-- RAPs de competencia 220501095
INSERT INTO resultados_aprendizaje (codigo, nombre, descripcion, competencia_id, horas_estimadas, trimestre, orden, is_active) VALUES
('220501095-01', 'Construir el prototipo del software según las características funcionales y de calidad', 'Crear prototipos de baja y alta fidelidad usando herramientas como Figma, Adobe XD, Balsamiq', v_comp_id, 60, 3, 1, true),
('220501095-02', 'Diseñar modelos conceptual y lógico para el proyecto de desarrollo de software', 'Crear diagramas ER, modelos de clases y diseño de base de datos normalizada', v_comp_id, 60, 3, 2, true),
('220501095-03', 'Identificar y caracterizar los componentes del ciclo de vida del software', 'Comprender y aplicar metodologías SDLC, DevOps, CI/CD', v_comp_id, 60, 3, 3, true),
('220501095-04', 'Evaluar artefactos de diseño de software', 'Revisar y validar diagramas, prototipos y documentación de diseño', v_comp_id, 60, 3, 4, true),
('220501095-05', 'Elaborar mapa de navegación', 'Diseñar flujos de navegación y arquitectura de información del sistema', v_comp_id, 60, 3, 5, true),
('220501095-06', 'Aplicar nociones de reglas de usabilidad y accesibilidad', 'Implementar principios WCAG, heurísticas de Nielsen y diseño centrado en el usuario', v_comp_id, 60, 4, 6, true),
('220501095-07', 'Elaborar interfaz gráfica y mapa de navegación cumpliendo reglas de usabilidad y accesibilidad', 'Diseñar UI/UX responsive siguiendo principios de accesibilidad web', v_comp_id, 60, 4, 7, true),
('220501095-08', 'Maquetar la interfaz gráfica en HTML/XML', 'Convertir diseños a código HTML5, CSS3 con frameworks como Bootstrap o Tailwind', v_comp_id, 60, 4, 8, true)
ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    trimestre = EXCLUDED.trimestre,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia 5: 220501096 - Desarrollar la solución de software (1,008 horas) - NÚCLEO DEL PROGRAMA
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220501096',
    'Desarrollar la solución de software',
    'Competencia más extensa del programa (1,008 horas) dedicada a la construcción del software. Incluye bases de datos relacionales y NoSQL, múltiples lenguajes de programación, frameworks front-end y back-end, servicios web, APIs, y tecnologías emergentes como IoT, Blockchain, Big Data y Machine Learning.',
    'TECNICA',
    1008,
    v_program_id,
    5,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP
RETURNING id INTO v_comp_id;

-- RAPs de competencia 220501096
INSERT INTO resultados_aprendizaje (codigo, nombre, descripcion, competencia_id, horas_estimadas, trimestre, orden, is_active) VALUES
('220501096-01', 'Planear actividades de construcción del software de acuerdo con el diseño establecido', 'Crear plan de desarrollo, sprints, historias de usuario y estimación de esfuerzo', v_comp_id, 200, 4, 1, true),
('220501096-02', 'Construir la base de datos para el software a partir del modelo de datos', 'Implementar BD con motores como PostgreSQL, MySQL, SQL Server, MongoDB. Crear scripts DDL, DML, procedimientos almacenados y triggers', v_comp_id, 200, 4, 2, true),
('220501096-03', 'Crear componentes Front-End del software de acuerdo con el diseño', 'Desarrollar interfaces con HTML5, CSS3, JavaScript, React, Angular, Vue.js aplicando diseño responsivo', v_comp_id, 200, 5, 3, true),
('220501096-04', 'Codificar el software de acuerdo con el diseño establecido', 'Implementar lógica de negocio con Java, Python, C#, PHP, Node.js usando patrones de diseño y principios SOLID', v_comp_id, 208, 5, 4, true),
('220501096-05', 'Realizar pruebas al software para verificar su funcionalidad', 'Ejecutar pruebas unitarias, integración y funcionales con frameworks como JUnit, pytest, Jest', v_comp_id, 200, 6, 5, true)
ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    trimestre = EXCLUDED.trimestre,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia 6: 220501097 - Implementar la solución de software (840 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220501097',
    'Implementar la solución de software',
    'Implementación y despliegue del software en ambientes de producción. Incluye configuración de servicios, bases de datos, ambientes de producción, pruebas de funcionalidad, planes de mantenimiento y documentación.',
    'TECNICA',
    840,
    v_program_id,
    6,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP
RETURNING id INTO v_comp_id;

-- RAPs de competencia 220501097
INSERT INTO resultados_aprendizaje (codigo, nombre, descripcion, competencia_id, horas_estimadas, trimestre, orden, is_active) VALUES
('220501097-01', 'Configurar servicios, bases de datos y software', 'Instalar y configurar servidores de aplicaciones, bases de datos y servicios en ambientes de desarrollo y testing', v_comp_id, 120, 6, 1, true),
('220501097-05', 'Realizar configuración de servicios en ambiente de producción', 'Desplegar aplicaciones en servidores cloud (AWS, Azure, GCP) o on-premise con Docker/Kubernetes', v_comp_id, 120, 6, 2, true),
('220501097-06', 'Elaborar guía de despliegue en producción de software', 'Documentar proceso de despliegue, configuraciones, variables de entorno y procedimientos de rollback', v_comp_id, 120, 6, 3, true),
('220501097-07', 'Realizar pruebas de funcionalidad del software', 'Ejecutar pruebas de aceptación, rendimiento, carga y estrés en ambiente de producción', v_comp_id, 120, 6, 4, true),
('220501097-08', 'Diseñar plan de mantenimiento y soporte del software', 'Crear plan de mantenimiento correctivo, preventivo y evolutivo con SLAs definidos', v_comp_id, 120, 7, 5, true),
('220501097-11', 'Elaborar manual de usuario', 'Crear documentación de usuario final incluyendo guías de uso, FAQs y videos tutoriales', v_comp_id, 120, 7, 6, true),
('220501097-12', 'Elaborar plan de capacitación y pruebas de aceptación', 'Diseñar programa de capacitación para usuarios y criterios de aceptación del sistema', v_comp_id, 120, 7, 7, true)
ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    trimestre = EXCLUDED.trimestre,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia 7: 220501098 - Controlar la calidad del servicio de software (144 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220501098',
    'Controlar la calidad del servicio de software',
    'Aseguramiento de calidad basado en estándares ISO/IEC 25000, ISO/IEC 15504, IEEE, y modelos CMMI. Incluye verificación, validación y mejora continua de la calidad del software.',
    'TECNICA',
    144,
    v_program_id,
    7,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP
RETURNING id INTO v_comp_id;

-- RAPs de competencia 220501098
INSERT INTO resultados_aprendizaje (codigo, nombre, descripcion, competencia_id, horas_estimadas, trimestre, orden, is_active) VALUES
('220501098-01', 'Incorporar actividades de aseguramiento de la calidad del software de acuerdo con estándares de la industria', 'Implementar procesos de QA basados en ISO 25000 (SQuaRE) e ISO 15504 (SPICE)', v_comp_id, 48, 7, 1, true),
('220501098-02', 'Verificar la calidad del software de acuerdo con las prácticas asociadas en los procesos de desarrollo', 'Realizar revisiones de código, inspecciones y auditorías de calidad', v_comp_id, 48, 7, 2, true),
('220501098-03', 'Realizar actividades de mejora de la calidad del software a partir de los resultados de la verificación', 'Identificar y corregir defectos, implementar mejoras según métricas de calidad y feedback', v_comp_id, 48, 7, 3, true)
ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    trimestre = EXCLUDED.trimestre,
    updated_at = CURRENT_TIMESTAMP;

-- =============================================================================
-- COMPETENCIAS TRANSVERSALES (12)
-- =============================================================================

-- Competencia Transversal 1: 240201526 - Ética y cultura de paz (48 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '240201526',
    'Interactuar en el contexto productivo y social con principios éticos para la construcción de una cultura de paz',
    'Competencia institucional obligatoria enfocada en ética, valores y construcción de cultura de paz.',
    'TRANSVERSAL',
    48,
    v_program_id,
    8,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 2: 210201501 - Derechos laborales (48 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '210201501',
    'Ejercer derechos fundamentales del trabajo en el marco de la constitución política y convenios internacionales',
    'Competencia institucional obligatoria sobre derechos laborales y normatividad.',
    'TRANSVERSAL',
    48,
    v_program_id,
    9,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 3: 230101507 - Cultura física (48 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '230101507',
    'Generar hábitos saludables de vida mediante la aplicación de programas de actividad física',
    'Competencia institucional obligatoria sobre hábitos saludables y actividad física.',
    'TRANSVERSAL',
    48,
    v_program_id,
    10,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 4: 240201524 - Comunicación (48 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '240201524',
    'Desarrollar procesos de comunicación eficaces y efectivos en situaciones de orden social, personal y productivo',
    'Competencia institucional obligatoria sobre comunicación efectiva.',
    'TRANSVERSAL',
    48,
    v_program_id,
    11,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 5: 220201501 - Ciencias naturales (48 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220201501',
    'Aplicar conocimientos de ciencias naturales según el contexto productivo y social',
    'Aplicación de conocimientos científicos al contexto laboral.',
    'TRANSVERSAL',
    48,
    v_program_id,
    12,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 6: 220601501 - Seguridad y salud en el trabajo (48 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220601501',
    'Aplicar prácticas de protección ambiental, seguridad y salud en el trabajo',
    'Prevención de accidentes laborales, protección ambiental y cumplimiento de normatividad SST.',
    'TRANSVERSAL',
    48,
    v_program_id,
    13,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 7: 240201525 - Emprendimiento (48 horas)
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '240201525',
    'Gestionar procesos de cultura emprendedora y empresarial',
    'Desarrollo de cultura emprendedora, identificación de oportunidades de negocio y estructuración de planes de negocio.',
    'TRANSVERSAL',
    48,
    v_program_id,
    14,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 8: 240201064 - Investigación formativa
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '240201064',
    'Orientar investigación formativa según referentes técnicos',
    'Desarrollo de habilidades de investigación aplicada al contexto de formación.',
    'TRANSVERSAL',
    48,
    v_program_id,
    15,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 9: 240201517 - Razonamiento cuantitativo
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '240201517',
    'Razonar cuantitativamente frente a situaciones matemáticas',
    'Aplicación de conocimientos matemáticos y pensamiento lógico a situaciones prácticas.',
    'TRANSVERSAL',
    48,
    v_program_id,
    16,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 10: 220501046 - Herramientas informáticas
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '220501046',
    'Utilizar herramientas informáticas según necesidades de manejo de información',
    'Uso de herramientas ofimáticas, sistemas de gestión de información y plataformas digitales.',
    'TRANSVERSAL',
    48,
    v_program_id,
    17,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 11: 240202501 - Inglés (360 horas) - MÁS EXTENSA
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '240202501',
    'Interactuar en lengua inglesa de forma oral y escrita según Marco Común Europeo',
    'Formación intensiva en inglés (360 horas) con objetivo de alcanzar nivel B1-B2 según el Marco Común Europeo de Referencia para las Lenguas. Programada mínimo 6 horas semanales durante toda la etapa lectiva.',
    'TRANSVERSAL',
    360,
    v_program_id,
    18,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

-- Competencia Transversal 12: 240201530 - Inducción
INSERT INTO competencias (id, codigo, nombre, descripcion, tipo, horas_estimadas, academic_program_id, orden, is_active)
VALUES (
    gen_random_uuid(),
    '240201530',
    'Resultado de Aprendizaje de la Inducción',
    'Inducción al programa, al SENA y a la metodología de formación por competencias.',
    'TRANSVERSAL',
    40,
    v_program_id,
    19,
    true
) ON CONFLICT (codigo) WHERE deleted_at IS NULL DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_estimadas = EXCLUDED.horas_estimadas,
    updated_at = CURRENT_TIMESTAMP;

END $$;

-- Verificación de datos insertados
SELECT 'Programa ADSO:' as info, count(*) as total FROM academic_programs WHERE code = '228118';
SELECT 'Competencias técnicas:' as info, count(*) as total FROM competencias c 
JOIN academic_programs ap ON c.academic_program_id = ap.id 
WHERE ap.code = '228118' AND c.tipo = 'TECNICA' AND c.deleted_at IS NULL;
SELECT 'Competencias transversales:' as info, count(*) as total FROM competencias c 
JOIN academic_programs ap ON c.academic_program_id = ap.id 
WHERE ap.code = '228118' AND c.tipo = 'TRANSVERSAL' AND c.deleted_at IS NULL;
SELECT 'RAPs:' as info, count(*) as total FROM resultados_aprendizaje ra
JOIN competencias c ON ra.competencia_id = c.id
JOIN academic_programs ap ON c.academic_program_id = ap.id
WHERE ap.code = '228118' AND ra.deleted_at IS NULL;
