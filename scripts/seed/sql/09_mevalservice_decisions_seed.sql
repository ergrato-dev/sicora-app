-- SICORA - MEvalService Committee Decisions Seed
INSERT INTO committee_decisions (id, committee_id, student_case_id, decision_number, decision_type, description, rationale, vote_count, dissenting_votes, effective_date, notification_date, created_at, updated_at)
VALUES
('cd000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000001', 'sc000001-0001-0001-0001-000000000001', 'DEC-2024-001', 'IMPROVEMENT_PLAN', 'Asignar plan de mejoramiento académico', 'Aprendiz muestra voluntad de mejora', 3, 0, '2024-03-16', '2024-03-16 15:00:00', NOW(), NOW()),
('cd000001-0001-0001-0001-000000000002', 'c0000001-0001-0001-0001-000000000001', 'sc000001-0001-0001-0001-000000000002', 'DEC-2024-002', 'SANCTION', 'Aplicar compromiso de asistencia', 'Patrón de inasistencias requiere seguimiento formal', 3, 0, '2024-03-16', '2024-03-16 15:30:00', NOW(), NOW()),
('cd000001-0001-0001-0001-000000000003', 'c0000001-0001-0001-0001-000000000002', 'sc000001-0001-0001-0001-000000000003', 'DEC-2024-003', 'SANCTION', 'Aplicar suspensión y condicionamiento', 'Gravedad del incidente amerita sanción ejemplar', 2, 1, '2024-04-11', '2024-04-11 12:00:00', NOW(), NOW()),
('cd000001-0001-0001-0001-000000000004', 'c0000001-0001-0001-0001-000000000003', 'sc000001-0001-0001-0001-000000000004', 'DEC-2024-004', 'WARNING', 'Emitir llamado de atención formal', 'Primera vez, dar oportunidad de corrección', 2, 0, '2024-05-21', '2024-05-21 16:00:00', NOW(), NOW()),
('cd000001-0001-0001-0001-000000000005', 'c0000001-0001-0001-0001-000000000003', 'sc000001-0001-0001-0001-000000000005', 'DEC-2024-005', 'IMPROVEMENT_PLAN', 'Asignar plan integral de mejoramiento', 'Caso complejo requiere intervención multidimensional', 2, 0, '2024-05-21', '2024-05-21 16:30:00', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SELECT 'Committee Decisions: ' || COUNT(*) FROM committee_decisions WHERE id::text LIKE 'cd000001%';
