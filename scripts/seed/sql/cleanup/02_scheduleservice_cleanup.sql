-- =============================================================================
-- SICORA - Cleanup ScheduleService
-- Elimina solo datos de seed de ScheduleService
-- =============================================================================

-- Eliminar en orden de dependencias
DELETE FROM schedules WHERE id LIKE '35%';
DELETE FROM venues WHERE id LIKE '34%';
DELETE FROM academic_groups WHERE id LIKE '30%';
DELETE FROM programs WHERE id LIKE '10%';
DELETE FROM campuses WHERE id LIKE '20%';

-- Verificar
SELECT 'ScheduleService cleanup: ' || 
    (SELECT COUNT(*) FROM campuses WHERE id LIKE '20%') || ' sedes, ' ||
    (SELECT COUNT(*) FROM programs WHERE id LIKE '10%') || ' programas, ' ||
    (SELECT COUNT(*) FROM academic_groups WHERE id LIKE '30%') || ' grupos, ' ||
    (SELECT COUNT(*) FROM venues WHERE id LIKE '34%') || ' ambientes, ' ||
    (SELECT COUNT(*) FROM schedules WHERE id LIKE '35%') || ' horarios restantes'
    as resultado;
