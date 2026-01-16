<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../utils/upload.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

// Verificar autenticación
verificarToken();

switch ($method) {
    case 'GET':
        $estado = $_GET['estado'] ?? '';
        $usuario_id = $_GET['usuario_id'] ?? '';
        
        try {
            if (!empty($usuario_id)) {
                // Obtener préstamos de un usuario específico
                $stmt = $conn->prepare("
                    SELECT p.*, u.nombre as usuario_nombre, u.matricula, e.codigo as equipo_codigo, e.nombre as equipo_nombre, e.tipo as equipo_tipo
                    FROM prestamos p
                    INNER JOIN usuarios u ON p.usuario_id = u.id
                    INNER JOIN equipos e ON p.equipo_id = e.id
                    WHERE p.usuario_id = ?
                    ORDER BY p.fecha_prestamo DESC
                ");
                $stmt->execute([$usuario_id]);
            } else if (!empty($estado)) {
                $stmt = $conn->prepare("
                    SELECT p.*, u.nombre as usuario_nombre, u.matricula, e.codigo as equipo_codigo, e.nombre as equipo_nombre
                    FROM prestamos p
                    INNER JOIN usuarios u ON p.usuario_id = u.id
                    INNER JOIN equipos e ON p.equipo_id = e.id
                    WHERE p.estado = ?
                    ORDER BY p.fecha_prestamo DESC
                ");
                $stmt->execute([$estado]);
            } else {
                $stmt = $conn->prepare("
                    SELECT p.*, u.nombre as usuario_nombre, u.matricula, e.codigo as equipo_codigo, e.nombre as equipo_nombre
                    FROM prestamos p
                    INNER JOIN usuarios u ON p.usuario_id = u.id
                    INNER JOIN equipos e ON p.equipo_id = e.id
                    ORDER BY p.fecha_prestamo DESC
                    LIMIT 100
                ");
                $stmt->execute();
            }
            
            $prestamos = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $prestamos
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener préstamos'
            ]);
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $usuario_id = $data['usuario_id'] ?? null;
        $equipo_id = $data['equipo_id'] ?? null;
        $fecha_devolucion_esperada = $data['fecha_devolucion_esperada'] ?? '';
        $firma_digital = $data['firma_digital'] ?? '';
        $observaciones = $data['observaciones'] ?? '';
        
        if (!$usuario_id || !$equipo_id || empty($fecha_devolucion_esperada)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Usuario, equipo y fecha de devolución son requeridos'
            ]);
            exit();
        }
        
        try {
            $conn->beginTransaction();
            
            // Verificar que el equipo esté disponible
            $stmt = $conn->prepare("SELECT estado FROM equipos WHERE id = ?");
            $stmt->execute([$equipo_id]);
            $equipo = $stmt->fetch();
            
            if (!$equipo || $equipo['estado'] !== 'disponible') {
                throw new Exception('El equipo no está disponible');
            }
            
            // Crear préstamo
            $stmt = $conn->prepare("
                INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones, firma_digital, created_at)
                VALUES (?, ?, NOW(), ?, 'activo', ?, ?, NOW())
            ");
            
            $ruta_firma = null;
            if (!empty($firma_digital)) {
                $ruta_firma = guardarFirma($firma_digital, 'temp');
            }
            
            $stmt->execute([$usuario_id, $equipo_id, $fecha_devolucion_esperada, $observaciones, $ruta_firma]);
            $prestamo_id = $conn->lastInsertId();
            
            // Actualizar estado del equipo
            $stmt = $conn->prepare("UPDATE equipos SET estado = 'prestado' WHERE id = ?");
            $stmt->execute([$equipo_id]);
            
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Préstamo registrado exitosamente',
                'data' => ['id' => $prestamo_id]
            ]);
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;
    
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $action = $data['action'] ?? '';
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID es requerido'
            ]);
            exit();
        }
        
        try {
            $conn->beginTransaction();
            
            if ($action === 'devolver') {
                // Obtener préstamo
                $stmt = $conn->prepare("SELECT equipo_id FROM prestamos WHERE id = ?");
                $stmt->execute([$id]);
                $prestamo = $stmt->fetch();
                
                if (!$prestamo) {
                    throw new Exception('Préstamo no encontrado');
                }
                
                // Actualizar préstamo
                $stmt = $conn->prepare("
                    UPDATE prestamos 
                    SET estado = 'completado', fecha_devolucion_real = NOW(), updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$id]);
                
                // Actualizar equipo
                $stmt = $conn->prepare("UPDATE equipos SET estado = 'disponible' WHERE id = ?");
                $stmt->execute([$prestamo['equipo_id']]);
                
                $conn->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Equipo devuelto exitosamente'
                ]);
            }
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
        break;
}
