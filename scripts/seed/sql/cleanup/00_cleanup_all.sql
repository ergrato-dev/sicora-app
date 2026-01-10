-- =============================================================================
-- SICORA - Cleanup ALL Services
-- Elimina TODOS los datos de seed de todos los servicios
-- PRECAUCIÓN: Esta operación es irreversible
-- =============================================================================

-- IMPORTANTE: Ejecutar en orden inverso de dependencias

-- 1. ProjectEvalService (primero por dependencias)
DELETE FROM project_evaluations WHERE id LIKE '9c%';
DELETE FROM presentation_sessions WHERE id LIKE '9d%';
DELETE FROM project_submissions WHERE id LIKE '9b%';
DELETE FROM evaluation_rubrics WHERE id LIKE '9a%';
DELETE FROM work_group_members WHERE id LIKE '99%';
DELETE FROM work_groups WHERE id LIKE '98%';
DELETE FROM projects WHERE id LIKE '97%';

-- 2. MEvalService
DELETE FROM improvement_plans WHERE id LIKE '96%';
DELETE FROM appeals WHERE id LIKE '95%';
DELETE FROM sanctions WHERE id LIKE '94%';
DELETE FROM student_cases WHERE id LIKE '93%';
DELETE FROM committee_members WHERE id LIKE '921%';
DELETE FROM committees WHERE id LIKE '920%';

-- 3. KBService
DELETE FROM kb_faqs WHERE id LIKE '91%';
DELETE FROM kb_documents WHERE id LIKE '90%';

-- 4. EvalinService
DELETE FROM evaluations WHERE id LIKE '80%';
DELETE FROM evaluation_periods WHERE id LIKE '81%';
DELETE FROM questions WHERE id LIKE '71%';
DELETE FROM questionnaires WHERE id LIKE '70%';

-- 5. AttendanceService
DELETE FROM alerts WHERE id LIKE '60%';
DELETE FROM justifications WHERE id LIKE '50%';
DELETE FROM attendance_records WHERE id LIKE '40%';

-- 6. ScheduleService
DELETE FROM schedules WHERE id LIKE '35%';
DELETE FROM venues WHERE id LIKE '34%';
DELETE FROM academic_groups WHERE id LIKE '30%';
DELETE FROM programs WHERE id LIKE '10%';
DELETE FROM campuses WHERE id LIKE '20%';

-- 7. UserService (último por ser referencia de otros)
DELETE FROM users WHERE id LIKE 's0%'; -- Estudiantes
DELETE FROM users WHERE id LIKE 'i0%'; -- Instructores
DELETE FROM users WHERE id LIKE 'c0%'; -- Coordinadores
DELETE FROM users WHERE id LIKE 'a0%'; -- Admins

-- Verificar limpieza
SELECT 'Cleanup completado - Verificando conteo de registros seed:' as status;
SELECT 
    (SELECT COUNT(*) FROM users WHERE id LIKE 's0%' OR id LIKE 'i0%' OR id LIKE 'c0%' OR id LIKE 'a0%') as seed_users,
    (SELECT COUNT(*) FROM schedules WHERE id LIKE '35%') as seed_schedules,
    (SELECT COUNT(*) FROM attendance_records WHERE id LIKE '40%') as seed_attendance,
    (SELECT COUNT(*) FROM questionnaires WHERE id LIKE '70%') as seed_questionnaires,
    (SELECT COUNT(*) FROM kb_documents WHERE id LIKE '90%') as seed_documents,
    (SELECT COUNT(*) FROM student_cases WHERE id LIKE '93%') as seed_cases,
    (SELECT COUNT(*) FROM projects WHERE id LIKE '97%') as seed_projects;
