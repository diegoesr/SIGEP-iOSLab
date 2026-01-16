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

// Asegurar que el estado 'en_observacion' existe en la tabla
try {
    $stmt = $conn->query("SHOW COLUMNS FROM reportes_equipos LIKE 'estado'");
    $column = $stmt->fetch();
    if ($column && strpos($column['Type'], 'en_observacion') === false) {
        $conn->exec("
            ALTER TABLE reportes_equipos 
            MODIFY COLUMN estado ENUM('pendiente', 'en_revision', 'en_observacion', 'resuelto', 'rechazado') DEFAULT 'pendiente'
        ");
    }
} catch (PDOException $e) {
    // Ignorar si ya existe o hay algún error
}

switch ($method) {
    case 'GET':
        try {
            $stmt = $conn->prepare("
                SELECT r.*, e.codigo as equipo_codigo, e.nombre as equipo_nombre, e.marca, e.modelo
                FROM reportes_equipos r
                INNER JOIN equipos e ON r.equipo_id = e.id
                WHERE r.estado != 'resuelto'
                ORDER BY r.created_at DESC
            ");
            $stmt->execute();
            $reportes = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $reportes
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener reportes'
            ]);
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $equipo_id = $data['equipo_id'] ?? null;
        $tipo_reporte = $data['tipo_reporte'] ?? '';
        $descripcion = $data['descripcion'] ?? '';
        $fecha_incidente = $data['fecha_incidente'] ?? '';
        $observaciones = $data['observaciones'] ?? '';
        $evidencia = $data['evidencia'] ?? '';
        
        // Validaciones
        if (!$equipo_id || empty($tipo_reporte) || empty($descripcion) || empty($fecha_incidente)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos requeridos deben ser completados'
            ]);
            exit();
        }
        
        // Validar tipo de reporte
        $tipos_validos = ['dañado', 'maltratado', 'perdido', 'extraviado', 'fuera_de_uso'];
        if (!in_array($tipo_reporte, $tipos_validos)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Tipo de reporte inválido'
            ]);
            exit();
        }
        
        try {
            // Verificar que el equipo existe
            $stmt = $conn->prepare("SELECT id, codigo, nombre FROM equipos WHERE id = ?");
            $stmt->execute([$equipo_id]);
            $equipo = $stmt->fetch();
            
            if (!$equipo) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Equipo no encontrado'
                ]);
                exit();
            }
            
            // Guardar evidencia si existe
            $ruta_evidencia = null;
            if (!empty($evidencia)) {
                $ruta_evidencia = guardarImagen($evidencia, 'reportes', $equipo['codigo'] . '_' . date('YmdHis'));
            }
            
            // Insertar reporte
            $stmt = $conn->prepare("
                INSERT INTO reportes_equipos 
                (equipo_id, tipo_reporte, descripcion, fecha_incidente, observaciones, evidencia, estado, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'pendiente', NOW())
            ");
            
            $stmt->execute([
                $equipo_id,
                $tipo_reporte,
                $descripcion,
                $fecha_incidente,
                $observaciones,
                $ruta_evidencia
            ]);
            
            $reporte_id = $conn->lastInsertId();
            
            // Actualizar estado del equipo según el tipo de reporte
            $nuevo_estado = 'mantenimiento'; // Por defecto
            if ($tipo_reporte === 'perdido' || $tipo_reporte === 'extraviado') {
                $nuevo_estado = 'perdido';
            } elseif ($tipo_reporte === 'fuera_de_uso') {
                $nuevo_estado = 'fuera_de_uso';
            }
            
            $stmt = $conn->prepare("UPDATE equipos SET estado = ? WHERE id = ?");
            $stmt->execute([$nuevo_estado, $equipo_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Reporte creado exitosamente',
                'data' => ['id' => $reporte_id]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al crear el reporte: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $estado = $data['estado'] ?? '';
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de reporte es requerido'
            ]);
            exit();
        }
        
        // Validar estado
        $estados_validos = ['pendiente', 'en_revision', 'en_observacion', 'resuelto', 'rechazado'];
        if (!in_array($estado, $estados_validos)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Estado no válido'
            ]);
            exit();
        }
        
        try {
            $stmt = $conn->prepare("
                UPDATE reportes_equipos 
                SET estado = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$estado, $id]);
            
            $mensajes = [
                'pendiente' => 'Reporte marcado como pendiente',
                'en_revision' => 'Reporte marcado como en revisión',
                'en_observacion' => 'Reporte marcado como en observación',
                'resuelto' => 'Reporte marcado como atendido',
                'rechazado' => 'Reporte marcado como rechazado'
            ];
            
            echo json_encode([
                'success' => true,
                'message' => $mensajes[$estado] ?? 'Estado actualizado'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al actualizar el reporte'
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
