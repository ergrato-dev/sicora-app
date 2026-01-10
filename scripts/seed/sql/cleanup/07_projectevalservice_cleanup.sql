-- =============================================================================
-- SICORA - Cleanup ProjectEvalService
-- Elimina solo datos de seed de ProjectEvalService
-- =============================================================================

-- Eliminar en orden de dependencias
DELETE FROM project_evaluations WHERE id LIKE '9c%';
DELETE FROM presentation_sessions WHERE id LIKE '9d%';
DELETE FROM project_submissions WHERE id LIKE '9b%';
DELETE FROM evaluation_rubrics WHERE id LIKE '9a%';
DELETE FROM work_group_members WHERE id LIKE '99%';
DELETE FROM work_groups WHERE id LIKE '98%';
DELETE FROM projects WHERE id LIKE '97%';

-- Verificar
SELECT 'ProjectEvalService cleanup: ' || 
    (SELECT COUNT(*) FROM projects WHERE id LIKE '97%') || ' proyectos, ' ||
    (SELECT COUNT(*) FROM work_groups WHERE id LIKE '98%') || ' grupos, ' ||
    (SELECT COUNT(*) FROM work_group_members WHERE id LIKE '99%') || ' miembros, ' ||
    (SELECT COUNT(*) FROM evaluation_rubrics WHERE id LIKE '9a%') || ' rúbricas, ' ||
    (SELECT COUNT(*) FROM project_submissions WHERE id LIKE '9b%') || ' entregas, ' ||
    (SELECT COUNT(*) FROM project_evaluations WHERE id LIKE '9c%') || ' evaluaciones, ' ||
    (SELECT COUNT(*) FROM presentation_sessions WHERE id LIKE '9d%') || ' sesiones restantes'
    as resultado;
