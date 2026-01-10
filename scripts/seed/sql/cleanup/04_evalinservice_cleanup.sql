-- =============================================================================
-- SICORA - Cleanup EvalinService
-- Elimina solo datos de seed de EvalinService
-- =============================================================================

-- Eliminar en orden de dependencias
DELETE FROM evaluations WHERE id LIKE '80%';
DELETE FROM evaluation_periods WHERE id LIKE '81%';
DELETE FROM questions WHERE id LIKE '71%';
DELETE FROM questionnaires WHERE id LIKE '70%';

-- Verificar
SELECT 'EvalinService cleanup: ' || 
    (SELECT COUNT(*) FROM questionnaires WHERE id LIKE '70%') || ' cuestionarios, ' ||
    (SELECT COUNT(*) FROM questions WHERE id LIKE '71%') || ' preguntas, ' ||
    (SELECT COUNT(*) FROM evaluation_periods WHERE id LIKE '81%') || ' periodos, ' ||
    (SELECT COUNT(*) FROM evaluations WHERE id LIKE '80%') || ' evaluaciones restantes'
    as resultado;
