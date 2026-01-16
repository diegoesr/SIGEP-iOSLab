<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../utils/upload.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

// Verificar autenticación
$auth_data = verificarToken();

switch ($method) {
    case 'GET':
        // Buscar usuarios
        $search = $_GET['search'] ?? '';
        
        try {
            if (!empty($search)) {
                $stmt = $conn->prepare("
                    SELECT id, nombre, matricula, email, telefono, created_at 
                    FROM usuarios 
                    WHERE nombre LIKE ? OR matricula LIKE ? 
                    ORDER BY nombre ASC
                    LIMIT 20
                ");
                $searchTerm = "%{$search}%";
                $stmt->execute([$searchTerm, $searchTerm]);
            } else {
                $stmt = $conn->prepare("
                    SELECT id, nombre, matricula, email, telefono, created_at 
                    FROM usuarios 
                    ORDER BY created_at DESC 
                    LIMIT 50
                ");
                $stmt->execute();
            }
            
            $usuarios = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $usuarios
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al buscar usuarios'
            ]);
        }
        break;
    
    case 'POST':
        // Registrar nuevo usuario
        $data = json_decode(file_get_contents('php://input'), true);
        
        $nombre = $data['nombre'] ?? '';
        $matricula = $data['matricula'] ?? '';
        $email = $data['email'] ?? '';
        $telefono = $data['telefono'] ?? '';
        
        if (empty($nombre) || empty($matricula)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Nombre y matrícula son requeridos'
            ]);
            exit();
        }
        
        try {
            $stmt = $conn->prepare("
                INSERT INTO usuarios (nombre, matricula, email, telefono, created_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([$nombre, $matricula, $email, $telefono]);
            $usuario_id = $conn->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'data' => ['id' => $usuario_id]
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'La matrícula ya está registrada'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al registrar usuario'
                ]);
            }
        }
        break;
    
    case 'PUT':
        // Actualizar usuario
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de usuario es requerido'
            ]);
            exit();
        }
        
        try {
            $stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
            $stmt->execute([$id]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$usuario) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ]);
                exit();
            }
            
            $updates = [];
            $params = [];
            
            if (isset($data['nombre'])) {
                $updates[] = "nombre = ?";
                $params[] = $data['nombre'];
            }
            
            if (isset($data['email'])) {
                $updates[] = "email = ?";
                $params[] = $data['email'];
            }
            
            if (isset($data['telefono'])) {
                $updates[] = "telefono = ?";
                $params[] = $data['telefono'];
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'No hay campos para actualizar'
                ]);
                exit();
            }
            
            $updates[] = "updated_at = NOW()";
            $params[] = $id;
            
            $sql = "UPDATE usuarios SET " . implode(', ', $updates) . " WHERE id = ?";
            $updateStmt = $conn->prepare($sql);
            $updateStmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuario actualizado exitosamente'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al actualizar usuario: ' . $e->getMessage()
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
