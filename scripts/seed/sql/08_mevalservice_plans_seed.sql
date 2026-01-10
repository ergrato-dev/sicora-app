-- SICORA - MEvalService Improvement Plans Seed
INSERT INTO improvement_plans (id, student_id, student_case_id, plan_type, objectives, activities, start_date, end_date, status, progress_percentage, mentor_id, created_at, updated_at)
VALUES
('ip000001-0001-0001-0001-000000000001', 'stud-001', 'sc000001-0001-0001-0001-000000000001', 'ACADEMIC', '["Mejorar competencias técnicas", "Aprobar evaluaciones pendientes"]', '[{"actividad": "Tutorías", "horas": 10}, {"actividad": "Proyecto extra", "horas": 20}]', '2024-03-17', '2024-05-17', 'COMPLETED', 100, 'inst-001', NOW(), NOW()),
('ip000001-0001-0001-0001-000000000002', 'stud-002', 'sc000001-0001-0001-0001-000000000002', 'ATTENDANCE', '["Alcanzar 90% de asistencia", "Comunicar ausencias con anticipación"]', '[{"actividad": "Seguimiento semanal", "semanas": 8}, {"actividad": "Reporte mensual", "meses": 2}]', '2024-03-17', '2024-06-17', 'IN_PROGRESS', 65, 'inst-001', NOW(), NOW()),
('ip000001-0001-0001-0001-000000000003', 'stud-003', 'sc000001-0001-0001-0001-000000000003', 'BEHAVIORAL', '["Mejorar conducta en ambientes", "Cumplir reglamento"]', '[{"actividad": "Taller convivencia", "horas": 8}, {"actividad": "Servicio social", "horas": 20}]', '2024-04-15', '2024-10-15', 'IN_PROGRESS', 30, 'coord-001', NOW(), NOW()),
('ip000001-0001-0001-0001-000000000004', 'stud-005', 'sc000001-0001-0001-0001-000000000005', 'COMPREHENSIVE', '["Mejorar rendimiento académico", "Regularizar asistencia", "Compromiso integral"]', '[{"actividad": "Plan integral", "componentes": 3}, {"actividad": "Seguimiento quincenal", "sesiones": 8}]', '2024-05-21', '2024-08-21', 'NOT_STARTED', 0, 'inst-003', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SELECT 'Improvement Plans: ' || COUNT(*) FROM improvement_plans WHERE id::text LIKE 'ip000001%';
