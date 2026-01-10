-- =============================================================================
-- SICORA - Cleanup UserService
-- Elimina solo datos de seed de UserService
-- =============================================================================

-- Eliminar usuarios de seed (por patrón de UUID)
DELETE FROM users WHERE id LIKE 's0%'; -- Estudiantes (30)
DELETE FROM users WHERE id LIKE 'i0%'; -- Instructores (12)
DELETE FROM users WHERE id LIKE 'c0%'; -- Coordinadores (5)
DELETE FROM users WHERE id LIKE 'a0%'; -- Admins (3)

-- Verificar
SELECT 'UserService cleanup: ' || 
    (SELECT COUNT(*) FROM users WHERE id LIKE 's0%' OR id LIKE 'i0%' OR id LIKE 'c0%' OR id LIKE 'a0%') 
    || ' registros seed restantes' as resultado;
