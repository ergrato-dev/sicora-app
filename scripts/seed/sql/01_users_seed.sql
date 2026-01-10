-- SICORA - Users Seed (UUIDs para compatibilidad con MEvalService FK)
-- Admins (3)
INSERT INTO users (id, name, email, role, avatar) VALUES
('00000000-0000-0000-0001-000000000001', 'Carlos Admin', 'admin1@sicora.edu.co', 'ADMIN', NULL),
('00000000-0000-0000-0001-000000000002', 'Diana Admin', 'admin2@sicora.edu.co', 'ADMIN', NULL),
('00000000-0000-0000-0001-000000000003', 'Eduardo Admin', 'admin3@sicora.edu.co', 'ADMIN', NULL)
ON CONFLICT (id) DO NOTHING;

-- Coordinators (5)
INSERT INTO users (id, name, email, role, avatar) VALUES
('00000000-0000-0000-0002-000000000001', 'Ana Coordinadora', 'coord1@sicora.edu.co', 'COORDINATOR', NULL),
('00000000-0000-0000-0002-000000000002', 'Pedro Coordinador', 'coord2@sicora.edu.co', 'COORDINATOR', NULL),
('00000000-0000-0000-0002-000000000003', 'Laura Coordinadora', 'coord3@sicora.edu.co', 'COORDINATOR', NULL),
('00000000-0000-0000-0002-000000000004', 'Roberto Coordinador', 'coord4@sicora.edu.co', 'COORDINATOR', NULL),
('00000000-0000-0000-0002-000000000005', 'Carmen Coordinadora', 'coord5@sicora.edu.co', 'COORDINATOR', NULL)
ON CONFLICT (id) DO NOTHING;

-- Instructors (12)
INSERT INTO users (id, name, email, role, avatar) VALUES
('00000000-0000-0000-0003-000000000001', 'Instructor Fernando', 'inst01@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000002', 'Instructor Diana', 'inst02@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000003', 'Instructor Andrés', 'inst03@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000004', 'Instructor Patricia', 'inst04@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000005', 'Instructor Miguel', 'inst05@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000006', 'Instructor Sandra', 'inst06@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000007', 'Instructor Javier', 'inst07@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000008', 'Instructor Marcela', 'inst08@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000009', 'Instructor Gabriel', 'inst09@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000010', 'Instructor Claudia', 'inst10@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000011', 'Instructor Ricardo', 'inst11@sicora.edu.co', 'INSTRUCTOR', NULL),
('00000000-0000-0000-0003-000000000012', 'Instructor Valentina', 'inst12@sicora.edu.co', 'INSTRUCTOR', NULL)
ON CONFLICT (id) DO NOTHING;

-- Students (30)
INSERT INTO users (id, name, email, role, avatar) VALUES
('00000000-0000-0000-0004-000000000001', 'Estudiante 01', 'stud01@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000002', 'Estudiante 02', 'stud02@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000003', 'Estudiante 03', 'stud03@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000004', 'Estudiante 04', 'stud04@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000005', 'Estudiante 05', 'stud05@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000006', 'Estudiante 06', 'stud06@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000007', 'Estudiante 07', 'stud07@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000008', 'Estudiante 08', 'stud08@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000009', 'Estudiante 09', 'stud09@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000010', 'Estudiante 10', 'stud10@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000011', 'Estudiante 11', 'stud11@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000012', 'Estudiante 12', 'stud12@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000013', 'Estudiante 13', 'stud13@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000014', 'Estudiante 14', 'stud14@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000015', 'Estudiante 15', 'stud15@sicora.edu.co', 'STUDENT', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, role, avatar) VALUES
('00000000-0000-0000-0004-000000000016', 'Estudiante 16', 'stud16@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000017', 'Estudiante 17', 'stud17@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000018', 'Estudiante 18', 'stud18@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000019', 'Estudiante 19', 'stud19@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000020', 'Estudiante 20', 'stud20@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000021', 'Estudiante 21', 'stud21@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000022', 'Estudiante 22', 'stud22@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000023', 'Estudiante 23', 'stud23@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000024', 'Estudiante 24', 'stud24@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000025', 'Estudiante 25', 'stud25@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000026', 'Estudiante 26', 'stud26@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000027', 'Estudiante 27', 'stud27@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000028', 'Estudiante 28', 'stud28@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000029', 'Estudiante 29', 'stud29@sicora.edu.co', 'STUDENT', NULL),
('00000000-0000-0000-0004-000000000030', 'Estudiante 30', 'stud30@sicora.edu.co', 'STUDENT', NULL)
ON CONFLICT (id) DO NOTHING;

SELECT 'Users seed: ' || COUNT(*) || ' usuarios' FROM users WHERE id LIKE '00000000-0000-0000-%';
