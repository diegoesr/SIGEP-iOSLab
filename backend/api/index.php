<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

// Obtener método y ruta
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'] ?? '';
$script_name = $_SERVER['SCRIPT_NAME'] ?? '';

// Obtener el path de diferentes formas
$path = parse_url($request_uri, PHP_URL_PATH);

// Si tenemos PATH_INFO, usarlo (más confiable)
if (isset($_SERVER['PATH_INFO']) && !empty($_SERVER['PATH_INFO'])) {
    $path = $_SERVER['PATH_INFO'];
} else {
    // Remover el path base del script
    $base_paths = ['/lab-ios/backend/api', '/backend/api', '/api'];
    foreach ($base_paths as $base_path) {
        if (strpos($path, $base_path) === 0) {
            $path = substr($path, strlen($base_path));
            break;
        }
    }
    
    // Si el path es el mismo que el script, está vacío
    if ($path === $script_name || empty($path) || $path === '/') {
        $path = '';
    }
}

// Limpiar el path (remover barras iniciales/finales)
$path = trim($path, '/');

// Dividir la ruta en segmentos
$segments = array_filter(explode('/', $path));
$segments = array_values($segments);

// Router simple
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

// Debug (solo en desarrollo - remover en producción)
if (isset($_GET['debug'])) {
    error_log("Request URI: " . $request_uri);
    error_log("Script Name: " . $script_name);
    error_log("PATH_INFO: " . ($_SERVER['PATH_INFO'] ?? 'N/A'));
    error_log("Path parsed: " . $path);
    error_log("Resource: " . $resource);
}

switch ($resource) {
    case 'auth':
    case 'test_login':
        if ($resource === 'test_login') {
            require_once 'test_login.php';
        } else {
            require_once 'auth.php';
        }
        break;
    
    case 'usuarios':
        require_once 'usuarios.php';
        break;
    
    case 'inventario':
        require_once 'inventario.php';
        break;
    
    case 'prestamos':
        require_once 'prestamos.php';
        break;
    
    case 'dashboard':
        require_once 'dashboard.php';
        break;
    
    case 'reportes':
        require_once 'reportes.php';
        break;
    
    case 'administradores':
        require_once 'administradores.php';
        break;
    
    case '':
        // Root endpoint
        echo json_encode([
            'success' => true,
            'message' => 'SIGEP API v1.0',
            'endpoints' => [
                '/auth',
                '/usuarios',
                '/inventario',
                '/prestamos',
                '/dashboard'
            ]
        ]);
        break;
    
    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint no encontrado'
        ]);
        break;
}
