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
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => true,
                'data' => $usuarios
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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
        $raw_input = file_get_contents('php://input');
        $data = json_decode($raw_input, true);
        
        // Asegurar que los datos estén en UTF-8
        $nombre = mb_convert_encoding($data['nombre'] ?? '', 'UTF-8', 'UTF-8');
        $matricula = mb_convert_encoding($data['matricula'] ?? '', 'UTF-8', 'UTF-8');
        $email = mb_convert_encoding($data['email'] ?? '', 'UTF-8', 'UTF-8');
        $telefono = mb_convert_encoding($data['telefono'] ?? '', 'UTF-8', 'UTF-8');
        
        // Limpiar y normalizar
        $nombre = trim($nombre);
        $matricula = trim($matricula);
        $email = trim($email);
        $telefono = trim($telefono);
        
        if (empty($nombre) || empty($matricula)) {
            http_response_code(400);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'message' => 'Nombre y matrícula son requeridos'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        try {
            // Asegurar que la conexión use UTF-8 antes de insertar
            $conn->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
            
            $stmt = $conn->prepare("
                INSERT INTO usuarios (nombre, matricula, email, telefono, created_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([$nombre, $matricula, $email, $telefono]);
            $usuario_id = $conn->lastInsertId();
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'data' => ['id' => $usuario_id]
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(400);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'La matrícula ya está registrada'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al registrar usuario'
                ], JSON_UNESCAPED_UNICODE);
            }
        }
        break;
    
    case 'PUT':
        // Actualizar usuario
        $raw_input = file_get_contents('php://input');
        $data = json_decode($raw_input, true);
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'message' => 'ID de usuario es requerido'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        try {
            // Asegurar que la conexión use UTF-8 antes de consultar/actualizar
            $conn->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
            
            $stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
            $stmt->execute([$id]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$usuario) {
                http_response_code(404);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }
            
            $updates = [];
            $params = [];
            
            if (isset($data['nombre'])) {
                $nombre = mb_convert_encoding($data['nombre'], 'UTF-8', 'UTF-8');
                $nombre = trim($nombre);
                $updates[] = "nombre = ?";
                $params[] = $nombre;
            }
            
            if (isset($data['email'])) {
                $email = mb_convert_encoding($data['email'], 'UTF-8', 'UTF-8');
                $email = trim($email);
                $updates[] = "email = ?";
                $params[] = $email;
            }
            
            if (isset($data['telefono'])) {
                $telefono = mb_convert_encoding($data['telefono'], 'UTF-8', 'UTF-8');
                $telefono = trim($telefono);
                $updates[] = "telefono = ?";
                $params[] = $telefono;
            }
            
            if (empty($updates)) {
                http_response_code(400);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'No hay campos para actualizar'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }
            
            $updates[] = "updated_at = NOW()";
            $params[] = $id;
            
            $sql = "UPDATE usuarios SET " . implode(', ', $updates) . " WHERE id = ?";
            $updateStmt = $conn->prepare($sql);
            $updateStmt->execute($params);
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => true,
                'message' => 'Usuario actualizado exitosamente'
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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
