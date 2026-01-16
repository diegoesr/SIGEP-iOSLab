<?php
// Endpoint directo de autenticación sin router
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Use POST.'
    ]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['action']) || $data['action'] !== 'login') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Acción no especificada. Use action: "login"'
    ]);
    exit();
}

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
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT id, email, password_hash, nombre FROM administradores WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
        exit();
    }
    
    $passwordMatch = password_verify($password, $admin['password_hash']);
    
    if (!$passwordMatch) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Contraseña incorrecta'
        ]);
        exit();
    }
    
    // Actualizar último login
    $stmt = $conn->prepare("UPDATE administradores SET ultimo_login = NOW() WHERE id = ?");
    $stmt->execute([$admin['id']]);
    
    // Generar token
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
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
