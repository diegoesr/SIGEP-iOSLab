<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($data['action'] === 'login') {
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            
            if (empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Email y contraseña son requeridos'
                ]);
                exit();
            }
            
            try {
                $stmt = $conn->prepare("SELECT id, email, password_hash, nombre FROM administradores WHERE email = ?");
                $stmt->execute([$email]);
                $admin = $stmt->fetch();
                
                if ($admin && password_verify($password, $admin['password_hash'])) {
                    $token = generarToken($admin['id'], $admin['email']);
                    
                    echo json_encode([
                        'success' => true,
                        'token' => $token,
                        'usuario' => [
                            'id' => $admin['id'],
                            'email' => $admin['email'],
                            'nombre' => $admin['nombre']
                        ]
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Credenciales inválidas'
                    ]);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error en el servidor: ' . $e->getMessage()
                ]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error: ' . $e->getMessage()
                ]);
            }
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
