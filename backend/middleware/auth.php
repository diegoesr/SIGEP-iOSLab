<?php
function verificarToken() {
    // Obtener headers de todas las formas posibles
    $headers = getallheaders();
    if (!$headers) {
        $headers = [];
    }
    
    $token = null;

    // Buscar token en headers (diferentes formas)
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    // También buscar en $_SERVER (Apache puede ponerlo aquí)
    if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    // También buscar en $_SERVER con diferentes nombres (algunos servidores)
    if (!$token && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    // Si aún no hay token, buscar en el input stream (último recurso)
    if (!$token) {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        if (isset($data['token'])) {
            $token = $data['token'];
        }
    }

    if (!$token) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Token no proporcionado'
        ]);
        exit();
    }

    // Decodificar token simple (en producción usar JWT real)
    try {
        $decoded = json_decode(base64_decode($token), true);
        if ($decoded && isset($decoded['usuario_id']) && isset($decoded['exp'])) {
            if ($decoded['exp'] > time()) {
                return $decoded;
            }
        }
    } catch (Exception $e) {
        // Token inválido
    }

    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Token inválido o expirado'
    ]);
    exit();
}

function generarToken($usuario_id, $email) {
    return base64_encode(json_encode([
        'usuario_id' => $usuario_id,
        'email' => $email,
        'exp' => time() + (24 * 60 * 60) // 24 horas
    ]));
}
