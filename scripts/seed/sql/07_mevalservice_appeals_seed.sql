-- SICORA - MEvalService Appeals Seed
INSERT INTO appeals (id, sanction_id, student_id, submission_date, appeal_grounds, supporting_documents, status, reviewed_by, review_date, review_notes, resolution, created_at, updated_at)
VALUES
('ap000001-0001-0001-0001-000000000001', 'sn000001-0001-0001-0001-000000000003', 'stud-003', '2024-04-12', 'Solicito revisión de la suspensión. Los hechos fueron malinterpretados.', '["Declaración personal", "Testigos"]', 'REJECTED', 'coord-001', '2024-04-14', 'Evidencia confirma los hechos reportados', 'Se mantiene la sanción original', NOW(), NOW()),
('ap000001-0001-0001-0001-000000000002', 'sn000001-0001-0001-0001-000000000004', 'stud-003', '2024-04-16', 'Apelo el condicionamiento. Me comprometo a mejorar mi conducta.', '["Carta de compromiso", "Plan de mejora propuesto"]', 'PENDING', NULL, NULL, NULL, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SELECT 'Appeals: ' || COUNT(*) FROM appeals WHERE id::text LIKE 'ap000001%';
