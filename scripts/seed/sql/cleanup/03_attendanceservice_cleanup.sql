-- =============================================================================
-- SICORA - Cleanup AttendanceService
-- Elimina solo datos de seed de AttendanceService
-- =============================================================================

-- Eliminar en orden de dependencias
DELETE FROM alerts WHERE id LIKE '60%';
DELETE FROM justifications WHERE id LIKE '50%';
DELETE FROM attendance_records WHERE id LIKE '40%';

-- Verificar
SELECT 'AttendanceService cleanup: ' || 
    (SELECT COUNT(*) FROM attendance_records WHERE id LIKE '40%') || ' registros, ' ||
    (SELECT COUNT(*) FROM justifications WHERE id LIKE '50%') || ' justificaciones, ' ||
    (SELECT COUNT(*) FROM alerts WHERE id LIKE '60%') || ' alertas restantes'
    as resultado;
