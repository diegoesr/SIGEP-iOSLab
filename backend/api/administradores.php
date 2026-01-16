<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

// Verificar autenticación
verificarToken();

// Función para asegurar que las columnas existan
function asegurarColumnas($conn) {
    try {
        $stmt = $conn->query("SHOW COLUMNS FROM administradores");
        $existingColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $alterStatements = [];
        
        if (!in_array('rol', $existingColumns)) {
            $alterStatements[] = "ADD COLUMN rol ENUM('super_admin', 'admin', 'viewer') DEFAULT 'admin'";
        }
        
        if (!in_array('puede_editar', $existingColumns)) {
            $alterStatements[] = "ADD COLUMN puede_editar BOOLEAN DEFAULT TRUE";
        }
        
        if (!in_array('ultimo_login', $existingColumns)) {
            $alterStatements[] = "ADD COLUMN ultimo_login DATETIME NULL";
        }
        
        if (!empty($alterStatements)) {
            $sql = "ALTER TABLE administradores " . implode(', ', $alterStatements);
            $conn->exec($sql);
            
            // Agregar índice si la columna rol fue creada
            if (!in_array('rol', $existingColumns)) {
                try {
                    $conn->exec("ALTER TABLE administradores ADD INDEX idx_rol (rol)");
                } catch (PDOException $e) {
                    // Ignorar si el índice ya existe
                }
            }
        }
    } catch (PDOException $e) {
        // Si hay error, continuar de todas formas
        error_log("Error al asegurar columnas: " . $e->getMessage());
    }
}

// Asegurar columnas al inicio
asegurarColumnas($conn);

switch ($method) {
    case 'GET':
        try {
            $stmt = $conn->prepare("
                SELECT id, nombre, email, rol, puede_editar, ultimo_login, created_at
                FROM administradores
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $administradores = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $administradores
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener administradores: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $nombre = $data['nombre'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $rol = $data['rol'] ?? 'admin';
        // Solo super_admin y admin pueden editar
        $puede_editar = ($rol === 'super_admin' || $rol === 'admin') ? 1 : 0;
        
        if (empty($nombre) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Nombre, email y contraseña son requeridos'
            ]);
            exit();
        }
        
        // Validar rol
        $roles_validos = ['super_admin', 'admin', 'viewer'];
        if (!in_array($rol, $roles_validos)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Rol no válido'
            ]);
            exit();
        }
        
        try {
            // Verificar si el email ya existe
            $stmt = $conn->prepare("SELECT id FROM administradores WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'El email ya está registrado'
                ]);
                exit();
            }
            
            // Hash de la contraseña
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            // Insertar con todas las columnas (asegurarColumnas ya las creó si no existían)
            $stmt = $conn->prepare("
                INSERT INTO administradores (nombre, email, password_hash, rol, puede_editar, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$nombre, $email, $password_hash, $rol, $puede_editar]);
            
            $admin_id = $conn->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Administrador creado exitosamente',
                'data' => ['id' => $admin_id]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al crear administrador: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de administrador es requerido'
            ]);
            exit();
        }
        
        try {
            $updates = [];
            $params = [];
            
            if (isset($data['nombre'])) {
                $updates[] = "nombre = ?";
                $params[] = $data['nombre'];
            }
            
            if (isset($data['rol'])) {
                $roles_validos = ['super_admin', 'admin', 'viewer'];
                if (!in_array($data['rol'], $roles_validos)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Rol no válido'
                    ]);
                    exit();
                }
                $updates[] = "rol = ?";
                $params[] = $data['rol'];
                // Actualizar puede_editar automáticamente basado en el rol
                $puede_editar_valor = ($data['rol'] === 'super_admin' || $data['rol'] === 'admin') ? 1 : 0;
                $updates[] = "puede_editar = ?";
                $params[] = $puede_editar_valor;
            }
            
            if (isset($data['password']) && !empty($data['password'])) {
                $updates[] = "password_hash = ?";
                $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
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
            
            $sql = "UPDATE administradores SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'Administrador actualizado exitosamente'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al actualizar administrador: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de administrador es requerido'
            ]);
            exit();
        }
        
        try {
            // No permitir eliminar el último administrador
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM administradores");
            $stmt->execute();
            $result = $stmt->fetch();
            
            if ($result['total'] <= 1) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'No se puede eliminar el último administrador'
                ]);
                exit();
            }
            
            $stmt = $conn->prepare("DELETE FROM administradores WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Administrador eliminado exitosamente'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al eliminar administrador: ' . $e->getMessage()
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
