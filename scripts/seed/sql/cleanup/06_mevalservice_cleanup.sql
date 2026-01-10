-- =============================================================================
-- SICORA - Cleanup MEvalService
-- Elimina solo datos de seed de MEvalService
-- =============================================================================

-- Eliminar en orden de dependencias
DELETE FROM improvement_plans WHERE id LIKE '96%';
DELETE FROM appeals WHERE id LIKE '95%';
DELETE FROM sanctions WHERE id LIKE '94%';
DELETE FROM student_cases WHERE id LIKE '93%';
DELETE FROM committee_members WHERE id LIKE '921%';
DELETE FROM committees WHERE id LIKE '920%';

-- Verificar
SELECT 'MEvalService cleanup: ' || 
    (SELECT COUNT(*) FROM committees WHERE id LIKE '920%') || ' comités, ' ||
    (SELECT COUNT(*) FROM committee_members WHERE id LIKE '921%') || ' miembros, ' ||
    (SELECT COUNT(*) FROM student_cases WHERE id LIKE '93%') || ' casos, ' ||
    (SELECT COUNT(*) FROM sanctions WHERE id LIKE '94%') || ' sanciones, ' ||
    (SELECT COUNT(*) FROM appeals WHERE id LIKE '95%') || ' apelaciones, ' ||
    (SELECT COUNT(*) FROM improvement_plans WHERE id LIKE '96%') || ' planes restantes'
    as resultado;
