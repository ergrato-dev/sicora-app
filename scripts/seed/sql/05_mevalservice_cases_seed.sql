-- SICORA - MEvalService Student Cases Seed (Schema real)
-- Columnas: id, student_id (UUID), committee_id (UUID NOT NULL), case_type, case_status, case_description, evidence_documents (jsonb)

INSERT INTO student_cases (id, student_id, committee_id, case_type, case_status, case_description, evidence_documents, created_at, updated_at)
VALUES
('sc000001-0001-0001-0001-000000000001', '00000000-0000-0000-0004-000000000001', 'c0000001-0001-0001-0001-000000000001', 'ACADEMIC', 'RESOLVED', 'Bajo rendimiento en competencias técnicas primer trimestre', '["Reporte notas Q1"]', NOW(), NOW()),
('sc000001-0001-0001-0001-000000000002', '00000000-0000-0000-0004-000000000002', 'c0000001-0001-0001-0001-000000000001', 'ATTENDANCE', 'RESOLVED', 'Asistencia del 65% en trimestre 1', '["Control asistencia"]', NOW(), NOW()),
('sc000001-0001-0001-0001-000000000003', '00000000-0000-0000-0004-000000000003', 'c0000001-0001-0001-0001-000000000002', 'DISCIPLINARY', 'RESOLVED', 'Incidente de conducta en ambiente de formación', '["Reporte incidente"]', NOW(), NOW()),
('sc000001-0001-0001-0001-000000000004', '00000000-0000-0000-0004-000000000004', 'c0000001-0001-0001-0001-000000000003', 'ACADEMIC', 'IN_PROGRESS', 'No entrega de evidencias en 3 competencias', '["Lista competencias"]', NOW(), NOW()),
('sc000001-0001-0001-0001-000000000005', '00000000-0000-0000-0004-000000000005', 'c0000001-0001-0001-0001-000000000003', 'MIXED', 'IN_PROGRESS', 'Bajo rendimiento y asistencia irregular', '["Reporte integral"]', NOW(), NOW()),
('sc000001-0001-0001-0001-000000000006', '00000000-0000-0000-0004-000000000006', 'c0000001-0001-0001-0001-000000000004', 'ACADEMIC', 'REGISTERED', 'Pendiente de revisión en próximo comité', '[]', NOW(), NOW()),
('sc000001-0001-0001-0001-000000000007', '00000000-0000-0000-0004-000000000007', 'c0000001-0001-0001-0001-000000000004', 'DISCIPLINARY', 'REGISTERED', 'Caso reciente en investigación preliminar', '["Reporte preliminar"]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT 'Student Cases: ' || COUNT(*) FROM student_cases WHERE id::text LIKE 'sc000001%';
