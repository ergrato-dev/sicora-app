-- ====================================================================
-- SEED DATA: Lista de Chequeo MODERNA para Proyectos ADSO 2026
-- ====================================================================
-- 
-- ⚠️ DATOS DE PRODUCCIÓN - NO ELIMINAR ⚠️
-- 
-- Basado en: Lista_Chequeo_MODERNA_Proyecto_ADSO_2026.md
-- Filosofía: Software funcionando + preparación para mercado laboral real
-- Docker: Incluido desde T2-T3 (básico → avanzado)
--
-- Fuente: _docs/adso/adso/Lista_Chequeo_MODERNA_Proyecto_ADSO_2026.md
-- ====================================================================

-- ====================================================================
-- CHECKLIST: TRIMESTRE 2 - DISCOVERY & RESEARCH
-- "Entender el problema antes de saltar a la solución"
-- ====================================================================
INSERT INTO checklists (
    id, name, description, version, trimester, project_type, program, status, created_by, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'Lista Chequeo ADSO T2 - Discovery & Research',
    'Validación del problema, especificación ágil de requisitos, stack tecnológico moderno y setup profesional. Docker: Introducción a conceptos básicos.',
    '2.0',
    2,
    'FORMATIVO',
    'ADSO',
    'ACTIVO',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = NOW();

-- Criterios T2: Validación del Problema (30%)
INSERT INTO checklist_criteria (
    id, checklist_id, name, description, category, weight, max_score, is_required, "order", rubric, examples, common_mistakes
) VALUES
    -- Validación del Problema
    ('b0000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
     'Problema real identificado', 
     'El equipo ha validado que existe un problema/necesidad REAL (no inventada)',
     'FUNCIONAL', 10, 100, true, 1,
     'Nivel 5: Problema validado con datos cuantitativos. Nivel 3: Problema identificado pero sin validación. Nivel 1: Problema inventado sin sustento.',
     'Encuestas a usuarios, análisis de mercado, entrevistas',
     'Inventar problemas sin investigación'),

    ('b0000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
     'Investigación de usuarios',
     'Han hablado con usuarios potenciales (mínimo 5 personas) y documentado insights',
     'FUNCIONAL', 10, 100, true, 2,
     'Nivel 5: 10+ entrevistas documentadas. Nivel 3: 5 entrevistas. Nivel 1: Sin entrevistas.',
     'Formularios, entrevistas grabadas, journey maps',
     'Asumir sin preguntar a usuarios reales'),

    ('b0000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
     'Análisis de competencia',
     'Investigaron si ya existe solución similar y qué la hace diferente',
     'FUNCIONAL', 5, 100, true, 3,
     'Nivel 5: Benchmark completo con diferenciadores. Nivel 3: Lista de competidores. Nivel 1: Sin análisis.',
     'Matriz comparativa, análisis FODA de competidores',
     'Ignorar soluciones existentes'),

    ('b0000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002',
     'Value Proposition',
     'Pueden explicar QUÉ problema resuelven y PARA QUIÉN en 1 minuto',
     'PRESENTACION', 5, 100, true, 4,
     'Nivel 5: Pitch claro y convincente. Nivel 3: Explicación básica. Nivel 1: Confuso.',
     'Elevator pitch, canvas de propuesta de valor',
     'Descripciones técnicas sin valor para el usuario'),

    -- Especificación Ágil de Requisitos (40%)
    ('b0000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002',
     'User Stories funcionales',
     'Tienen 15-25 historias de usuario bien escritas (formato: Como [rol] quiero [acción] para [beneficio])',
     'DOCUMENTACION', 15, 100, true, 5,
     'Nivel 5: 25+ HU correctas. Nivel 3: 15 HU. Nivel 1: <10 HU o mal escritas.',
     'Product backlog en Jira/Trello/Linear',
     'Requisitos técnicos en lugar de historias de usuario'),

    ('b0000001-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002',
     'Criterios de aceptación',
     'Cada historia tiene 3-5 criterios de aceptación verificables',
     'DOCUMENTACION', 10, 100, true, 6,
     'Nivel 5: Criterios Given-When-Then. Nivel 3: Criterios básicos. Nivel 1: Sin criterios.',
     'BDD, Gherkin syntax',
     'Criterios ambiguos o no verificables'),

    ('b0000001-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002',
     'Priorización MoSCoW',
     'Las historias están priorizadas (Must/Should/Could/Wont)',
     'DOCUMENTACION', 5, 100, true, 7,
     'Nivel 5: Priorización clara con justificación. Nivel 3: Priorizadas sin justificación. Nivel 1: Sin priorizar.',
     'Matriz MoSCoW, backlog ordenado',
     'Todo es "Must have"'),

    ('b0000001-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002',
     'MVP definido',
     'Han identificado qué funcionalidades son INDISPENSABLES para el MVP',
     'FUNCIONAL', 10, 100, true, 8,
     'Nivel 5: MVP mínimo viable claro. Nivel 3: MVP definido pero amplio. Nivel 1: Sin MVP claro.',
     'Lista de features del MVP, scope statement',
     'MVP demasiado ambicioso'),

    -- Stack Tecnológico Moderno (20%)
    ('b0000001-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002',
     'Decisiones justificadas',
     'La selección de tecnologías tiene justificación técnica (no "porque el instructor dijo")',
     'ARQUITECTURA', 10, 100, true, 9,
     'Nivel 5: ADR documentado con pros/cons. Nivel 3: Justificación básica. Nivel 1: Sin justificación.',
     'Architecture Decision Records (ADR)',
     'Elegir tecnología sin investigar alternativas'),

    ('b0000001-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002',
     'Stack actual 2026',
     'Usan tecnologías relevantes en 2026 (React/Vue/Svelte, Node/Python/Go, PostgreSQL/MongoDB)',
     'TECNICO', 5, 100, true, 10,
     'Nivel 5: Stack moderno justificado. Nivel 3: Stack aceptable. Nivel 1: Tecnologías obsoletas.',
     'React 18+, Vue 3, Node 20+, PostgreSQL, TailwindCSS',
     'Usar tecnologías obsoletas sin justificación'),

    -- Setup Profesional + Docker Básico (10%)
    ('b0000001-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002',
     'Repositorio configurado',
     'GitHub/GitLab con README, .gitignore, estructura básica',
     'VERSIONADO', 5, 100, true, 11,
     'Nivel 5: README completo, .gitignore, estructura clara. Nivel 3: Básico funcional. Nivel 1: Sin configurar.',
     'README.md con descripción, setup, tech stack',
     'Subir node_modules, .env, o secretos'),

    ('b0000001-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002',
     'Docker: Conocimiento básico',
     'Entienden qué es Docker, contenedores vs VMs, y casos de uso. Dockerfile básico conceptual.',
     'DOCKER', 5, 100, false, 12,
     'Nivel 5: Pueden explicar Docker y sus beneficios. Nivel 3: Conocimiento básico. Nivel 1: Sin conocimiento.',
     'Docker conceptual, ventajas de contenedores, Docker Hub',
     'Confundir Docker con máquinas virtuales')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    weight = EXCLUDED.weight,
    rubric = EXCLUDED.rubric,
    updated_at = NOW();

-- ====================================================================
-- CHECKLIST: TRIMESTRE 3 - DISEÑO & ARQUITECTURA
-- "Diseñar para escalar, no solo para funcionar"
-- ====================================================================
INSERT INTO checklists (
    id, name, description, version, trimester, project_type, program, status, created_by, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'Lista Chequeo ADSO T3 - Diseño & Arquitectura',
    'Arquitectura moderna, UX/UI centrado en usuario, seguridad desde diseño. Docker: Dockerfile funcional y docker-compose básico.',
    '2.0',
    3,
    'FORMATIVO',
    'ADSO',
    'ACTIVO',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = NOW();

-- Criterios T3: Arquitectura Moderna (35%)
INSERT INTO checklist_criteria (
    id, checklist_id, name, description, category, weight, max_score, is_required, "order", rubric, examples, common_mistakes
) VALUES
    ('b0000002-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
     'Arquitectura definida',
     'Han elegido patrón arquitectónico apropiado (Monolito modular, Microservicios, Serverless) con justificación',
     'ARQUITECTURA', 10, 100, true, 1,
     'Nivel 5: Arquitectura justificada con ADR. Nivel 3: Arquitectura definida. Nivel 1: Sin arquitectura clara.',
     'Clean Architecture, Hexagonal, Microservicios (si justificado)',
     'Microservicios sin necesidad'),

    ('b0000002-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003',
     'API-First Design',
     'Diseñaron primero las APIs (OpenAPI/Swagger spec) antes de implementar',
     'ARQUITECTURA', 10, 100, true, 2,
     'Nivel 5: OpenAPI completo con ejemplos. Nivel 3: Swagger básico. Nivel 1: Sin documentación API.',
     'OpenAPI 3.0, Swagger UI, Postman collection',
     'Implementar sin diseñar primero'),

    ('b0000002-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',
     'Base de datos moderna',
     'Modelo de datos normalizado + justificación SQL vs NoSQL vs híbrido',
     'TECNICO', 10, 100, true, 3,
     'Nivel 5: Modelo normalizado con justificación. Nivel 3: Modelo funcional. Nivel 1: Sin normalizar.',
     'PostgreSQL, MongoDB (si justificado), migraciones',
     'NoSQL sin necesidad o SQL mal normalizado'),

    -- Docker en T3 (10%)
    ('b0000002-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003',
     'Docker: Dockerfile funcional',
     'Tienen Dockerfile que construye la aplicación correctamente',
     'DOCKER', 5, 100, true, 4,
     'Nivel 5: Multi-stage build optimizado. Nivel 3: Dockerfile básico funcional. Nivel 1: No funciona.',
     'FROM, COPY, RUN, EXPOSE, CMD, multi-stage builds',
     'Copiar node_modules, no usar .dockerignore'),

    ('b0000002-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003',
     'Docker: docker-compose básico',
     'Tienen docker-compose.yml para desarrollo local con al menos app + base de datos',
     'DOCKER', 5, 100, true, 5,
     'Nivel 5: Compose con app, db, y volúmenes. Nivel 3: Compose básico funcional. Nivel 1: No funciona.',
     'services, volumes, networks, environment variables',
     'Hardcodear credenciales en compose'),

    -- UX/UI (30%)
    ('b0000002-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003',
     'Wireframes/Mockups',
     'Diseños de interfaces en Figma/Adobe XD con sistema de diseño básico',
     'USABILIDAD', 10, 100, true, 6,
     'Nivel 5: Sistema de diseño completo. Nivel 3: Mockups principales. Nivel 1: Bocetos básicos.',
     'Figma, design tokens, componentes reutilizables',
     'Diseñar mientras codifican'),

    ('b0000002-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003',
     'Mobile-First',
     'Los diseños priorizan experiencia móvil',
     'USABILIDAD', 5, 100, true, 7,
     'Nivel 5: Mobile-first con breakpoints. Nivel 3: Responsive básico. Nivel 1: Solo desktop.',
     'Breakpoints, touch targets, viewport meta',
     'Diseñar solo para desktop'),

    ('b0000002-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003',
     'Accesibilidad (WCAG)',
     'Consideraron contraste, navegación por teclado, alt text desde diseño',
     'USABILIDAD', 5, 100, true, 8,
     'Nivel 5: WCAG AA compliance. Nivel 3: Consideraciones básicas. Nivel 1: Sin accesibilidad.',
     'Contraste 4.5:1, focus visible, aria-labels',
     'Ignorar accesibilidad'),

    -- Seguridad (20%)
    ('b0000002-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003',
     'Autenticación moderna',
     'Planificaron JWT/OAuth2/Auth0 (no sesiones server-side antiguas)',
     'SEGURIDAD', 7, 100, true, 9,
     'Nivel 5: OAuth2/OIDC con refresh tokens. Nivel 3: JWT básico. Nivel 1: Sesiones inseguras.',
     'JWT, refresh tokens, Auth.js, Clerk',
     'Guardar passwords en plain text'),

    ('b0000002-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003',
     'Manejo de secretos',
     'Diseñaron cómo manejar API keys, passwords (variables de entorno, vault)',
     'SEGURIDAD', 7, 100, true, 10,
     'Nivel 5: Vault/secrets manager. Nivel 3: .env correctamente. Nivel 1: Secretos en código.',
     '.env, .env.example, GitHub Secrets',
     'Commitear .env o secretos'),

    ('b0000002-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003',
     'OWASP Top 10',
     'Consideraron al menos 5 vulnerabilidades del OWASP Top 10',
     'SEGURIDAD', 6, 100, true, 11,
     'Nivel 5: Plan de mitigación documentado. Nivel 3: Conocen las vulnerabilidades. Nivel 1: Sin conocimiento.',
     'SQLi, XSS, CSRF, broken auth, security misconfiguration',
     'Ignorar seguridad hasta el final'),

    -- Documentación C4 (10%)
    ('b0000002-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000003',
     'C4 Model diagrams',
     'Tienen diagrama de contexto y contenedores (no diagramas UML obsoletos)',
     'DOCUMENTACION', 10, 100, true, 12,
     'Nivel 5: C4 completo (Context + Container + Component). Nivel 3: Context + Container. Nivel 1: Sin diagramas.',
     'C4 Model, Structurizr, Mermaid, PlantUML',
     'Diagramas UML complejos que nadie lee')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    weight = EXCLUDED.weight,
    rubric = EXCLUDED.rubric,
    updated_at = NOW();

-- ====================================================================
-- CHECKLIST: TRIMESTRE 4 - DESARROLLO DEL MVP
-- "Ship early, ship often, iterate fast"
-- ====================================================================
INSERT INTO checklists (
    id, name, description, version, trimester, project_type, program, status, created_by, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000004',
    'Lista Chequeo ADSO T4 - Desarrollo del MVP',
    'Desarrollo con IA como copiloto, calidad de código, database, frontend moderno. Docker: Ambiente de desarrollo completo.',
    '2.0',
    4,
    'FORMATIVO',
    'ADSO',
    'ACTIVO',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = NOW();

-- Criterios T4
INSERT INTO checklist_criteria (
    id, checklist_id, name, description, category, weight, max_score, is_required, "order", rubric, examples, common_mistakes
) VALUES
    -- IA como Copiloto (20%)
    ('b0000003-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004',
     'Uso responsable de IA',
     'Usan GitHub Copilot/ChatGPT/Claude para acelerar, pero ENTIENDEN el código generado',
     'IA', 10, 100, true, 1,
     'Nivel 5: Documentan uso de IA y pueden explicar todo. Nivel 3: Usan IA correctamente. Nivel 1: Copian sin entender.',
     'Prompts documentados, code review de código IA',
     'Copiar código de IA sin entenderlo'),

    ('b0000003-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004',
     'Code reviews humanos',
     'Aunque usen IA, hacen peer review de TODO el código',
     'VERSIONADO', 10, 100, true, 2,
     'Nivel 5: PRs con reviews completos. Nivel 3: Reviews básicos. Nivel 1: Sin reviews.',
     'Pull requests, review comments, approvals',
     'Mergear sin review'),

    -- Calidad de Código (25%)
    ('b0000003-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004',
     'Clean Code',
     'Código legible, funciones pequeñas, nombres descriptivos',
     'CALIDAD', 10, 100, true, 3,
     'Nivel 5: Código ejemplar. Nivel 3: Código legible. Nivel 1: Código espagueti.',
     'Funciones <50 líneas, nombres descriptivos, DRY',
     'Variables a, b, c, funciones de 200+ líneas'),

    ('b0000003-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
     'Linter configurado',
     'ESLint/Prettier/Black configurado y pasando en CI',
     'CALIDAD', 5, 100, true, 4,
     'Nivel 5: Linter + formatter en CI. Nivel 3: Linter local. Nivel 1: Sin linter.',
     'ESLint, Prettier, Black, golangci-lint',
     'Ignorar warnings del linter'),

    ('b0000003-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004',
     'TypeScript/Type hints',
     'Usan tipado estático donde es posible',
     'CALIDAD', 5, 100, true, 5,
     'Nivel 5: TypeScript strict o type hints completos. Nivel 3: Tipado básico. Nivel 1: Sin tipos.',
     'TypeScript, Python type hints, Go interfaces',
     'any en todas partes'),

    -- Docker en T4 (10%)
    ('b0000003-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004',
     'Docker: Ambiente desarrollo completo',
     'docker-compose up levanta TODO el ambiente de desarrollo (app, db, cache si aplica)',
     'DOCKER', 5, 100, true, 6,
     'Nivel 5: Hot reload, volúmenes, múltiples servicios. Nivel 3: Ambiente funcional. Nivel 1: Parcialmente funcional.',
     'docker-compose.dev.yml, bind mounts, watch mode',
     'Rebuilds constantes por no usar volúmenes'),

    ('b0000003-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004',
     'Docker: .dockerignore configurado',
     'Tienen .dockerignore optimizado (node_modules, .git, etc.)',
     'DOCKER', 5, 100, true, 7,
     'Nivel 5: .dockerignore completo. Nivel 3: Básico. Nivel 1: Sin .dockerignore.',
     'node_modules, .git, .env, coverage, dist',
     'Copiar todo al contenedor'),

    -- Database & Backend (20%)
    ('b0000003-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004',
     'ORM moderno',
     'Usan Prisma/SQLAlchemy/GORM (no SQL crudo sin justificación)',
     'TECNICO', 5, 100, true, 8,
     'Nivel 5: ORM con migraciones automatizadas. Nivel 3: ORM básico. Nivel 1: SQL crudo everywhere.',
     'Prisma, Drizzle, SQLAlchemy, GORM',
     'SQL strings concatenados (SQL injection)'),

    ('b0000003-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004',
     'Migraciones',
     'Base de datos versionada con migraciones (Alembic/Prisma Migrate)',
     'TECNICO', 5, 100, true, 9,
     'Nivel 5: Migraciones up/down testeadas. Nivel 3: Migraciones básicas. Nivel 1: Sin migraciones.',
     'Prisma migrate, Alembic, golang-migrate',
     'Modificar tablas manualmente'),

    ('b0000003-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004',
     'API RESTful',
     'APIs siguen convenciones REST (códigos HTTP correctos, versionado)',
     'TECNICO', 5, 100, true, 10,
     'Nivel 5: REST maturity level 3. Nivel 3: REST básico correcto. Nivel 1: Todo POST 200.',
     'GET/POST/PUT/DELETE correctos, códigos 2xx/4xx/5xx',
     'Todo con POST, siempre 200'),

    ('b0000003-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000004',
     'Validación de datos',
     'Validación con Zod/Pydantic/Joi en backend',
     'SEGURIDAD', 5, 100, true, 11,
     'Nivel 5: Validación completa con mensajes claros. Nivel 3: Validación básica. Nivel 1: Sin validación.',
     'Zod, Pydantic, Joi, go-playground/validator',
     'Confiar en datos del frontend')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    weight = EXCLUDED.weight,
    rubric = EXCLUDED.rubric,
    updated_at = NOW();

-- ====================================================================
-- CHECKLIST: TRIMESTRE 5 - FEATURES & INTEGRACIONES
-- "Construir sobre bases sólidas"
-- ====================================================================
INSERT INTO checklists (
    id, name, description, version, trimester, project_type, program, status, created_by, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000005',
    'Lista Chequeo ADSO T5 - Features & Integraciones',
    'Features avanzados, integraciones modernas, testing automatizado, CI/CD. Docker: Multi-stage builds y optimización.',
    '2.0',
    5,
    'FORMATIVO',
    'ADSO',
    'ACTIVO',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = NOW();

-- Criterios T5
INSERT INTO checklist_criteria (
    id, checklist_id, name, description, category, weight, max_score, is_required, "order", rubric, examples, common_mistakes
) VALUES
    -- Features (25%)
    ('b0000004-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005',
     'Autenticación completa',
     'Login, registro, recuperación de contraseña funcionando',
     'FUNCIONAL', 10, 100, true, 1,
     'Nivel 5: OAuth + MFA. Nivel 3: JWT básico funcional. Nivel 1: Login inseguro.',
     'JWT, refresh tokens, password reset flow',
     'Guardar passwords sin hashear'),

    ('b0000004-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005',
     'CRUD completo',
     'Al menos 3 entidades con Create, Read, Update, Delete',
     'FUNCIONAL', 10, 100, true, 2,
     'Nivel 5: CRUD optimizado con paginación. Nivel 3: CRUD básico funcional. Nivel 1: CRUD incompleto.',
     'Paginación, filtros, soft delete',
     'Delete físico sin confirmación'),

    ('b0000004-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005',
     'APIs de terceros',
     'Integración con al menos 1 API externa (pagos, mapas, email, SMS)',
     'TECNICO', 5, 100, true, 3,
     'Nivel 5: Múltiples integraciones robustas. Nivel 3: 1 integración funcional. Nivel 1: Sin integraciones.',
     'Stripe, SendGrid, Google Maps, Twilio',
     'API keys hardcodeadas'),

    -- Testing (30%)
    ('b0000004-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005',
     'Tests unitarios',
     'Cobertura mínima 40% en lógica de negocio (Jest/Pytest/Vitest)',
     'TESTING', 10, 100, true, 4,
     'Nivel 5: >60% coverage con mocks. Nivel 3: 40% coverage. Nivel 1: <20% coverage.',
     'Jest, Vitest, Pytest, testing-library',
     'Solo tests de componentes UI'),

    ('b0000004-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005',
     'Tests de integración',
     'API endpoints principales testeados (Supertest/Pytest)',
     'TESTING', 10, 100, true, 5,
     'Nivel 5: Todos los endpoints críticos. Nivel 3: Endpoints principales. Nivel 1: Pocos tests.',
     'Supertest, httpx, testcontainers',
     'Testear contra DB de producción'),

    ('b0000004-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005',
     'Tests E2E',
     'Al menos 5 flujos críticos con Playwright/Cypress',
     'TESTING', 10, 100, true, 6,
     'Nivel 5: Happy paths + edge cases. Nivel 3: 5 flujos básicos. Nivel 1: <3 tests.',
     'Playwright, Cypress, flujos de usuario',
     'Tests flaky que fallan aleatoriamente'),

    -- CI/CD (15%)
    ('b0000004-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005',
     'GitHub Actions/GitLab CI',
     'Pipeline que corre tests automáticamente',
     'CI_CD', 10, 100, true, 7,
     'Nivel 5: CI con tests, lint, build. Nivel 3: Tests en CI. Nivel 1: CI básico.',
     'GitHub Actions, GitLab CI, workflows',
     'CI que siempre pasa (sin tests reales)'),

    ('b0000004-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005',
     'Pre-commit hooks',
     'Husky + lint-staged configurado',
     'CI_CD', 5, 100, true, 8,
     'Nivel 5: Pre-commit completo. Nivel 3: Husky básico. Nivel 1: Sin hooks.',
     'Husky, lint-staged, commitlint',
     'Saltarse hooks con --no-verify'),

    -- Docker Avanzado (15%)
    ('b0000004-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005',
     'Docker: Multi-stage build',
     'Dockerfile optimizado con multi-stage para producción',
     'DOCKER', 8, 100, true, 9,
     'Nivel 5: <100MB imagen final. Nivel 3: Multi-stage funcional. Nivel 1: Single stage grande.',
     'AS builder, COPY --from, alpine base',
     'Imagen de 1GB+ con dependencias de desarrollo'),

    ('b0000004-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005',
     'Docker: Tests en container',
     'Tests corren dentro de Docker (para CI consistency)',
     'DOCKER', 7, 100, true, 10,
     'Nivel 5: Tests + coverage en Docker. Nivel 3: Tests básicos en Docker. Nivel 1: Tests solo local.',
     'docker-compose.test.yml, testcontainers',
     'Tests que pasan local pero fallan en CI'),

    -- Real-time (15%)
    ('b0000004-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000005',
     'WebSockets/Real-time',
     'Chat, notificaciones o actualizaciones en tiempo real (Socket.io/Pusher)',
     'TECNICO', 10, 100, false, 11,
     'Nivel 5: Real-time con reconexión. Nivel 3: WebSocket básico. Nivel 1: Polling.',
     'Socket.io, Pusher, Server-Sent Events',
     'Sin manejo de desconexiones'),

    ('b0000004-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000005',
     'Emails transaccionales',
     'SendGrid/Resend para confirmaciones, notificaciones',
     'TECNICO', 5, 100, false, 12,
     'Nivel 5: Templates HTML + queue. Nivel 3: Emails básicos. Nivel 1: Sin emails.',
     'SendGrid, Resend, email templates',
     'Emails en texto plano sin formato')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    weight = EXCLUDED.weight,
    rubric = EXCLUDED.rubric,
    updated_at = NOW();

-- ====================================================================
-- CHECKLIST: TRIMESTRE 6 - DEPLOYMENT & OBSERVABILIDAD
-- "Si no está en producción, no existe"
-- ====================================================================
INSERT INTO checklists (
    id, name, description, version, trimester, project_type, program, status, created_by, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000006',
    'Lista Chequeo ADSO T6 - Deployment & Observabilidad',
    'Deploy en cloud real, monitoring, performance. Docker: Producción con orquestación básica.',
    '2.0',
    6,
    'FORMATIVO',
    'ADSO',
    'ACTIVO',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = NOW();

-- Criterios T6
INSERT INTO checklist_criteria (
    id, checklist_id, name, description, category, weight, max_score, is_required, "order", rubric, examples, common_mistakes
) VALUES
    -- Deployment (35%)
    ('b0000005-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006',
     'Desplegado en cloud',
     'Vercel/Netlify/Railway/Render (NO "localhost")',
     'CLOUD', 15, 100, true, 1,
     'Nivel 5: CI/CD automático a producción. Nivel 3: Deploy manual funcional. Nivel 1: Solo localhost.',
     'Vercel, Railway, Render, Fly.io',
     '"Funciona en mi máquina"'),

    ('b0000005-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006',
     'Base de datos remota',
     'PostgreSQL/MongoDB en Supabase/PlanetScale/MongoDB Atlas',
     'CLOUD', 10, 100, true, 2,
     'Nivel 5: DB con backups automáticos. Nivel 3: DB cloud funcional. Nivel 1: SQLite en producción.',
     'Supabase, Neon, PlanetScale, MongoDB Atlas',
     'Usar SQLite en producción'),

    ('b0000005-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006',
     'Variables de entorno',
     'Secrets manejados correctamente (no committed en Git)',
     'SEGURIDAD', 5, 100, true, 3,
     'Nivel 5: Secrets en vault/platform. Nivel 3: .env correctos. Nivel 1: Secretos en código.',
     'Railway secrets, Vercel env, GitHub Secrets',
     '.env commiteado'),

    ('b0000005-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000006',
     'HTTPS habilitado',
     'Certificado SSL configurado',
     'SEGURIDAD', 5, 100, true, 4,
     'Nivel 5: HTTPS + security headers. Nivel 3: HTTPS básico. Nivel 1: HTTP.',
     'Let''s Encrypt, Cloudflare SSL',
     'Mixed content warnings'),

    -- Monitoring (25%)
    ('b0000005-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006',
     'Error tracking',
     'Sentry/LogRocket/Rollbar configurado',
     'MONITOREO', 10, 100, true, 5,
     'Nivel 5: Alertas + sourcemaps. Nivel 3: Errores capturados. Nivel 1: Console.log.',
     'Sentry, LogRocket, Bugsnag',
     'Solo console.error'),

    ('b0000005-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006',
     'Logging estructurado',
     'Logs útiles (no solo console.log) con Winston/Pino',
     'MONITOREO', 5, 100, true, 6,
     'Nivel 5: Logs JSON con correlation IDs. Nivel 3: Logs estructurados. Nivel 1: Console.log.',
     'Winston, Pino, structured logging',
     'console.log("error") en producción'),

    ('b0000005-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000006',
     'Health checks',
     'Endpoint /health que verifica estado del sistema',
     'MONITOREO', 5, 100, true, 7,
     'Nivel 5: Health + readiness + liveness. Nivel 3: /health básico. Nivel 1: Sin health check.',
     '/health, /ready, dependency checks',
     'Health check que siempre retorna OK'),

    ('b0000005-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006',
     'Performance monitoring',
     'Métricas básicas (response time, error rate)',
     'MONITOREO', 5, 100, true, 8,
     'Nivel 5: Dashboard con alertas. Nivel 3: Métricas visibles. Nivel 1: Sin métricas.',
     'Vercel Analytics, New Relic, Datadog',
     'Sin visibilidad de performance'),

    -- Performance (20%)
    ('b0000005-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006',
     'Lighthouse score',
     '>80 en Performance, >90 en Accessibility',
     'RENDIMIENTO', 10, 100, true, 9,
     'Nivel 5: >90 performance. Nivel 3: >80 performance. Nivel 1: <70.',
     'Chrome Lighthouse, PageSpeed Insights',
     'Imágenes sin optimizar'),

    ('b0000005-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000006',
     'Lazy loading',
     'Imágenes y componentes cargados bajo demanda',
     'RENDIMIENTO', 5, 100, true, 10,
     'Nivel 5: Code splitting + lazy images. Nivel 3: Lazy loading básico. Nivel 1: Todo upfront.',
     'React.lazy, next/image, Intersection Observer',
     'Bundle de 5MB inicial'),

    ('b0000005-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006',
     'Caching',
     'Headers de cache configurados, React Query/SWR para datos',
     'RENDIMIENTO', 5, 100, true, 11,
     'Nivel 5: CDN + API cache + SWR. Nivel 3: Cache headers. Nivel 1: Sin cache.',
     'Cache-Control, React Query, SWR, stale-while-revalidate',
     'Cache infinito sin invalidación'),

    -- Docker Producción (20%)
    ('b0000005-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000006',
     'Docker: Imagen de producción',
     'Imagen optimizada <200MB, non-root user, security hardening',
     'DOCKER', 10, 100, true, 12,
     'Nivel 5: <100MB, non-root, healthcheck. Nivel 3: <200MB funcional. Nivel 1: >500MB.',
     'Alpine base, USER node, HEALTHCHECK',
     'Correr como root'),

    ('b0000005-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000006',
     'Docker: docker-compose.prod.yml',
     'Compose de producción con restart policies, limits, healthchecks',
     'DOCKER', 10, 100, true, 13,
     'Nivel 5: Limits, healthchecks, logging driver. Nivel 3: Prod compose funcional. Nivel 1: Mismo que dev.',
     'restart: unless-stopped, mem_limit, healthcheck',
     'Usar compose de desarrollo en producción')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    weight = EXCLUDED.weight,
    rubric = EXCLUDED.rubric,
    updated_at = NOW();

-- ====================================================================
-- CHECKLIST: TRIMESTRE 7 - POLISH & PRESENTACIÓN
-- "El último 10% que marca la diferencia"
-- ====================================================================
INSERT INTO checklists (
    id, name, description, version, trimester, project_type, program, status, created_by, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000007',
    'Lista Chequeo ADSO T7 - Polish & Presentación',
    'UX pulida, seguridad hardening, calidad final, documentación completa, presentación técnica.',
    '2.0',
    7,
    'FORMATIVO',
    'ADSO',
    'ACTIVO',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = NOW();

-- Criterios T7
INSERT INTO checklist_criteria (
    id, checklist_id, name, description, category, weight, max_score, is_required, "order", rubric, examples, common_mistakes
) VALUES
    -- UX Pulida (25%)
    ('b0000006-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007',
     'Loading states',
     'Spinners, skeletons en TODAS las acciones asíncronas',
     'USABILIDAD', 5, 100, true, 1,
     'Nivel 5: Skeletons contextuales. Nivel 3: Spinners en acciones. Nivel 1: Congelamiento sin feedback.',
     'Skeleton loaders, progress indicators',
     'Pantalla congelada mientras carga'),

    ('b0000006-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007',
     'Error handling UX',
     'Mensajes de error útiles (no "Error 500")',
     'USABILIDAD', 5, 100, true, 2,
     'Nivel 5: Errores con acciones sugeridas. Nivel 3: Mensajes claros. Nivel 1: "Error".',
     'Toast notifications, error boundaries, retry buttons',
     '"Ha ocurrido un error" sin contexto'),

    ('b0000006-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007',
     'Empty states',
     'Pantallas vacías con CTAs claros',
     'USABILIDAD', 5, 100, true, 3,
     'Nivel 5: Empty states con ilustraciones y CTAs. Nivel 3: Mensaje y CTA. Nivel 1: Pantalla vacía.',
     'Ilustraciones, "No hay datos, crea el primero"',
     'Lista vacía sin explicación'),

    ('b0000006-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007',
     'Micro-interacciones',
     'Feedback visual en clicks, hovers, transiciones suaves',
     'USABILIDAD', 5, 100, true, 4,
     'Nivel 5: Animaciones pulidas. Nivel 3: Transiciones básicas. Nivel 1: Sin feedback visual.',
     'Framer Motion, CSS transitions, hover states',
     'Botones sin feedback de click'),

    ('b0000006-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000007',
     'Responsive perfeccionado',
     'Funciona perfectamente en todos los dispositivos',
     'USABILIDAD', 5, 100, true, 5,
     'Nivel 5: Probado en múltiples dispositivos reales. Nivel 3: Responsive funcional. Nivel 1: Roto en móvil.',
     'Chrome DevTools, BrowserStack, dispositivos reales',
     'Solo probado en laptop'),

    -- Seguridad Hardening (20%)
    ('b0000006-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007',
     'OWASP verificado',
     'Testearon contra OWASP Top 10',
     'SEGURIDAD', 5, 100, true, 6,
     'Nivel 5: Pentest básico documentado. Nivel 3: Checklist OWASP. Nivel 1: Sin verificar.',
     'OWASP ZAP, Burp Suite básico, checklist manual',
     'Asumir que está seguro'),

    ('b0000006-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007',
     'Rate limiting',
     'Protección contra brute force en login/registro',
     'SEGURIDAD', 5, 100, true, 7,
     'Nivel 5: Rate limit + CAPTCHA. Nivel 3: Rate limit básico. Nivel 1: Sin protección.',
     'express-rate-limit, Redis rate limiting',
     'Login sin límite de intentos'),

    ('b0000006-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007',
     'Input sanitization',
     'Protección contra XSS, SQL injection',
     'SEGURIDAD', 5, 100, true, 8,
     'Nivel 5: WAF + sanitization + CSP. Nivel 3: Sanitization básico. Nivel 1: Vulnerable.',
     'DOMPurify, parameterized queries, CSP headers',
     'innerHTML con user input'),

    ('b0000006-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000007',
     'Security headers',
     'Helmet.js/equivalente configurado',
     'SEGURIDAD', 5, 100, true, 9,
     'Nivel 5: A+ en securityheaders.com. Nivel 3: Headers principales. Nivel 1: Sin headers.',
     'Helmet.js, CSP, HSTS, X-Frame-Options',
     'Sin Content-Security-Policy'),

    -- Documentación (15%)
    ('b0000006-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000007',
     'README profesional',
     'Logo, descripción, screenshots, features, tech stack, setup',
     'DOCUMENTACION', 5, 100, true, 10,
     'Nivel 5: README de proyecto open source. Nivel 3: README completo. Nivel 1: README vacío.',
     'Shields.io badges, GIFs de demo, installation steps',
     'README por defecto de create-react-app'),

    ('b0000006-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000007',
     'API documentation',
     'Postman collection o Swagger UI público',
     'DOCUMENTACION', 5, 100, true, 11,
     'Nivel 5: Swagger UI + Postman exportable. Nivel 3: Swagger funcional. Nivel 1: Sin documentación.',
     'Swagger UI, Postman public workspace',
     'Endpoints no documentados'),

    ('b0000006-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000007',
     'User guide',
     'Video de 2-3 min mostrando cómo usar el producto',
     'DOCUMENTACION', 5, 100, true, 12,
     'Nivel 5: Video profesional con narración. Nivel 3: Screencast básico. Nivel 1: Sin video.',
     'Loom, OBS, YouTube unlisted',
     'Video de 20 minutos sin editar'),

    -- Presentación (25%)
    ('b0000006-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000007',
     'Demo en vivo',
     'Muestran el producto funcionando EN VIVO (no slides)',
     'PRESENTACION', 10, 100, true, 13,
     'Nivel 5: Demo fluida con escenarios reales. Nivel 3: Demo funcional. Nivel 1: Solo slides.',
     'Datos reales (no "test123"), flujo completo',
     'Demo con errores, datos de prueba'),

    ('b0000006-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000007',
     'Storytelling técnico',
     'Explican PORQUÉ tomaron decisiones técnicas, no solo QUÉ hicieron',
     'PRESENTACION', 5, 100, true, 14,
     'Nivel 5: Narrativa de trade-offs y aprendizajes. Nivel 3: Justificaciones básicas. Nivel 1: Solo listado.',
     '"Elegimos PostgreSQL porque..." con pros/cons',
     '"Usamos React porque es popular"'),

    ('b0000006-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000007',
     'Conocimiento profundo',
     'Cada miembro puede explicar cualquier parte del código',
     'PRESENTACION', 5, 100, true, 15,
     'Nivel 5: Todos dominan todo. Nivel 3: Cada uno domina su parte. Nivel 1: Solo 1 persona sabe.',
     'Preguntas cruzadas durante presentación',
     '"Eso lo hizo mi compañero"'),

    ('b0000006-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000007',
     'Lecciones aprendidas',
     'Comparten qué harían diferente en el próximo proyecto',
     'PRESENTACION', 5, 100, true, 16,
     'Nivel 5: Retrospectiva honesta con aprendizajes. Nivel 3: Menciona mejoras. Nivel 1: "Todo perfecto".',
     'Errores que cometimos, qué aprendimos',
     'No reconocer áreas de mejora')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    weight = EXCLUDED.weight,
    rubric = EXCLUDED.rubric,
    updated_at = NOW();

-- ====================================================================
-- RESUMEN DE CRITERIOS POR CATEGORÍA
-- ====================================================================
-- 
-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  DISTRIBUCIÓN DE DOCKER POR TRIMESTRE                             ║
-- ╠════════════════════════════════════════════════════════════════════╣
-- ║  T2: Docker conceptual básico (5%)                                ║
-- ║  T3: Dockerfile + docker-compose dev (10%)                        ║
-- ║  T4: Ambiente desarrollo completo + .dockerignore (10%)           ║
-- ║  T5: Multi-stage builds + tests en container (15%)                ║
-- ║  T6: Producción optimizada + compose prod (20%)                   ║
-- ║  T7: (Incluido en deployment/cloud criteria)                      ║
-- ╠════════════════════════════════════════════════════════════════════╣
-- ║  PROGRESIÓN DOCKER:                                               ║
-- ║  Conceptos → Dockerfile → Compose Dev → Optimización → Producción ║
-- ╚════════════════════════════════════════════════════════════════════╝
--
-- ⚠️ DATOS DE REFERENCIA - ACTUALIZAR SEGÚN VERSIÓN DE LISTA CHEQUEO ⚠️
-- ====================================================================
