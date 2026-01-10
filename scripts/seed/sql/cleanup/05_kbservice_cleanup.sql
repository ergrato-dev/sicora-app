-- =============================================================================
-- SICORA - Cleanup KBService
-- Elimina solo datos de seed de KBService
-- =============================================================================

-- Eliminar documentos y FAQs
DELETE FROM kb_faqs WHERE id LIKE '91%';
DELETE FROM kb_documents WHERE id LIKE '90%';

-- Verificar
SELECT 'KBService cleanup: ' || 
    (SELECT COUNT(*) FROM kb_documents WHERE id LIKE '90%') || ' documentos, ' ||
    (SELECT COUNT(*) FROM kb_faqs WHERE id LIKE '91%') || ' FAQs restantes'
    as resultado;
