<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

// Verificar autenticación
verificarToken();

switch ($method) {
    case 'GET':
        $estado = $_GET['estado'] ?? '';
        $search = $_GET['search'] ?? '';
        
        try {
            $whereConditions = [];
            $params = [];
            
            if (!empty($estado)) {
                $whereConditions[] = "estado = ?";
                $params[] = $estado;
            }
            
            if (!empty($search)) {
                $searchTerm = "%{$search}%";
                $whereConditions[] = "(codigo LIKE ? OR nombre LIKE ? OR tipo LIKE ? OR marca LIKE ? OR modelo LIKE ?)";
                $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            }
            
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
            
            $stmt = $conn->prepare("
                SELECT * FROM equipos 
                {$whereClause}
                ORDER BY codigo ASC
            ");
            $stmt->execute($params);
            
            $equipos = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $equipos
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener inventario'
            ]);
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $codigo = $data['codigo'] ?? '';
        $nombre = $data['nombre'] ?? '';
        $tipo = $data['tipo'] ?? '';
        $marca = $data['marca'] ?? '';
        $modelo = $data['modelo'] ?? '';
        $descripcion = $data['descripcion'] ?? '';
        
        if (empty($codigo) || empty($nombre) || empty($tipo)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Código, nombre y tipo son requeridos'
            ]);
            exit();
        }
        
        try {
            $stmt = $conn->prepare("
                INSERT INTO equipos (codigo, nombre, tipo, marca, modelo, descripcion, estado, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'disponible', NOW())
            ");
            
            $stmt->execute([$codigo, $nombre, $tipo, $marca, $modelo, $descripcion]);
            $equipo_id = $conn->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Equipo registrado exitosamente',
                'data' => ['id' => $equipo_id]
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'El código ya está registrado'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al registrar equipo'
                ]);
            }
        }
        break;
    
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $estado = $data['estado'] ?? null;
        
        if (!$id || !$estado) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID y estado son requeridos'
            ]);
            exit();
        }
        
        try {
            $stmt = $conn->prepare("
                UPDATE equipos 
                SET estado = ?, updated_at = NOW()
                WHERE id = ?
            ");
            
            $stmt->execute([$estado, $id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Estado actualizado exitosamente'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al actualizar equipo'
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
