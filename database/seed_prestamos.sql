-- Script para poblar la tabla de préstamos con datos ficticios de estudiantes de ingeniería
-- Ejecutar este script en la base de datos labios_db

USE labios_db;

-- Primero, asegurarse de que existan algunos usuarios (estudiantes de ingeniería)
INSERT IGNORE INTO usuarios (nombre, matricula, email, telefono, created_at) VALUES
('Juan Carlos Pérez García', '2023001', 'juan.perez@university.edu', '555-0101', NOW()),
('María Fernanda López Martínez', '2023002', 'maria.lopez@university.edu', '555-0102', NOW()),
('Carlos Alberto Rodríguez Sánchez', '2023003', 'carlos.rodriguez@university.edu', '555-0103', NOW()),
('Ana Sofía Hernández Torres', '2023004', 'ana.hernandez@university.edu', '555-0104', NOW()),
('Diego Alejandro Morales Ramírez', '2023005', 'diego.morales@university.edu', '555-0105', NOW()),
('Laura Patricia Gómez Díaz', '2023006', 'laura.gomez@university.edu', '555-0106', NOW()),
('Roberto Javier Silva Castro', '2023007', 'roberto.silva@university.edu', '555-0107', NOW()),
('Fernanda Alejandra Vega Ruiz', '2023008', 'fernanda.vega@university.edu', '555-0108', NOW()),
('Miguel Ángel Torres Mendoza', '2023009', 'miguel.torres@university.edu', '555-0109', NOW()),
('Valentina Isabel Jiménez Flores', '2023010', 'valentina.jimenez@university.edu', '555-0110', NOW()),
('Andrés Felipe Cruz Herrera', '2023011', 'andres.cruz@university.edu', '555-0111', NOW()),
('Daniela Alejandra Ríos Moreno', '2023012', 'daniela.rios@university.edu', '555-0112', NOW()),
('Santiago Nicolás Vargas Paredes', '2023013', 'santiago.vargas@university.edu', '555-0113', NOW()),
('Isabella Camila Medina Soto', '2023014', 'isabella.medina@university.edu', '555-0114', NOW()),
('Sebastián David Campos Núñez', '2023015', 'sebastian.campos@university.edu', '555-0115', NOW());

-- Obtener algunos IDs de usuarios y equipos para crear préstamos
-- Crear préstamos activos (recientes, aún no devueltos)
INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023001' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0001' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_ADD(NOW(), INTERVAL 7 DAY),
    'activo',
    'Préstamo para proyecto de desarrollo iOS',
    DATE_SUB(NOW(), INTERVAL 3 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0001' LIMIT 1) AND estado = 'activo');

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023002' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-IP-0001' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_ADD(NOW(), INTERVAL 9 DAY),
    'activo',
    'Uso en laboratorio de ingeniería',
    DATE_SUB(NOW(), INTERVAL 5 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-IP-0001' LIMIT 1) AND estado = 'activo');

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023003' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0002' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_ADD(NOW(), INTERVAL 10 DAY),
    'activo',
    'Proyecto académico de ingeniería de software',
    DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0002' LIMIT 1) AND estado = 'activo');

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023004' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-IP-0002' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_ADD(NOW(), INTERVAL 14 DAY),
    'activo',
    'Desarrollo de aplicación móvil',
    DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-IP-0002' LIMIT 1) AND estado = 'activo');

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023005' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0003' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    DATE_ADD(NOW(), INTERVAL 6 DAY),
    'activo',
    'Trabajo de investigación',
    DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0003' LIMIT 1) AND estado = 'activo');

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023006' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-AP-0001' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 6 DAY),
    DATE_ADD(NOW(), INTERVAL 8 DAY),
    'activo',
    'Diseño de interfaces',
    DATE_SUB(NOW(), INTERVAL 6 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-AP-0001' LIMIT 1) AND estado = 'activo');

-- Préstamos completados (ya devueltos)
INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023007' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0004' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    'completado',
    'Equipo devuelto en buen estado',
    DATE_SUB(NOW(), INTERVAL 20 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0004' LIMIT 1));

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023008' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-IP-0003' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 18 DAY),
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    'completado',
    'Proyecto completado exitosamente',
    DATE_SUB(NOW(), INTERVAL 18 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-IP-0003' LIMIT 1));

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023009' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0005' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 25 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 9 DAY),
    'completado',
    'Devolución normal',
    DATE_SUB(NOW(), INTERVAL 25 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0005' LIMIT 1));

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023010' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-MON-0001' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    'completado',
    'Equipo devuelto sin problemas',
    DATE_SUB(NOW(), INTERVAL 15 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-MON-0001' LIMIT 1));

-- Préstamos vencidos (no devueltos a tiempo)
INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023011' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0006' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    'vencido',
    'Préstamo vencido - requiere seguimiento',
    DATE_SUB(NOW(), INTERVAL 12 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0006' LIMIT 1) AND estado = 'vencido');

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023012' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-IP-0004' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    'vencido',
    'Vencido - contacto con estudiante',
    DATE_SUB(NOW(), INTERVAL 10 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-IP-0004' LIMIT 1) AND estado = 'vencido');

INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, created_at)
SELECT 
    (SELECT id FROM usuarios WHERE matricula = '2023013' LIMIT 1),
    (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0007' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    'vencido',
    'Préstamo vencido',
    DATE_SUB(NOW(), INTERVAL 8 DAY)
WHERE NOT EXISTS (SELECT 1 FROM prestamos WHERE equipo_id = (SELECT id FROM equipos WHERE codigo = 'LAB-MB-0007' LIMIT 1) AND estado = 'vencido');

-- Actualizar el estado de los equipos prestados
UPDATE equipos e
INNER JOIN prestamos p ON e.id = p.equipo_id
SET e.estado = 'prestado'
WHERE p.estado IN ('activo', 'vencido');

-- Verificar los préstamos creados
SELECT 
    p.id,
    u.nombre as usuario_nombre,
    u.matricula,
    e.codigo as equipo_codigo,
    e.nombre as equipo_nombre,
    p.fecha_prestamo,
    p.fecha_devolucion_esperada,
    p.fecha_devolucion_real,
    p.estado,
    COUNT(*) OVER() as total_prestamos
FROM prestamos p
INNER JOIN usuarios u ON p.usuario_id = u.id
INNER JOIN equipos e ON p.equipo_id = e.id
ORDER BY p.fecha_prestamo DESC;
