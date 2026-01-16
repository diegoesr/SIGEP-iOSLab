<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

// Verificar autenticación
verificarToken();

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit();
}

try {
    // Estadísticas de equipos
    $stmt = $conn->query("
        SELECT 
            estado,
            COUNT(*) as total
        FROM equipos
        GROUP BY estado
    ");
    $equipos_por_estado = $stmt->fetchAll();
    
    // Estadísticas de préstamos activos
    $stmt = $conn->query("
        SELECT COUNT(*) as total
        FROM prestamos
        WHERE estado = 'activo'
    ");
    $prestamos_activos = $stmt->fetch()['total'];
    
    // Préstamos vencidos
    $stmt = $conn->query("
        SELECT COUNT(*) as total
        FROM prestamos
        WHERE estado = 'activo' AND fecha_devolucion_esperada < NOW()
    ");
    $prestamos_vencidos = $stmt->fetch()['total'];
    
    // Total de usuarios
    $stmt = $conn->query("SELECT COUNT(*) as total FROM usuarios");
    $total_usuarios = $stmt->fetch()['total'];
    
    // Usuarios más frecuentes
    $stmt = $conn->query("
        SELECT u.id, u.nombre, u.matricula, COUNT(p.id) as total_prestamos
        FROM usuarios u
        INNER JOIN prestamos p ON u.id = p.usuario_id
        GROUP BY u.id, u.nombre, u.matricula
        ORDER BY total_prestamos DESC
        LIMIT 5
    ");
    $usuarios_frecuentes = $stmt->fetchAll();
    
    // Préstamos recientes
    $stmt = $conn->query("
        SELECT p.*, u.nombre as usuario_nombre, u.matricula, e.codigo as equipo_codigo, e.nombre as equipo_nombre, e.estado as equipo_estado
        FROM prestamos p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        INNER JOIN equipos e ON p.equipo_id = e.id
        ORDER BY p.fecha_prestamo DESC
        LIMIT 10
    ");
    $prestamos_recientes = $stmt->fetchAll();
    
    // Equipos por categoría (últimos 30 días) - usando 'tipo' como categoría
    try {
        $stmt = $conn->query("
            SELECT 
                e.tipo as categoria,
                COUNT(DISTINCT p.equipo_id) as total_prestamos,
                COUNT(p.id) as veces_prestado
            FROM prestamos p
            INNER JOIN equipos e ON p.equipo_id = e.id
            WHERE p.fecha_prestamo >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY e.tipo
            ORDER BY veces_prestado DESC
        ");
        $equipos_por_categoria = $stmt->fetchAll();
    } catch (PDOException $e) {
        // Si hay error, devolver array vacío
        $equipos_por_categoria = [];
    }
    
    // Total de reportes
    try {
        $stmt = $conn->query("SELECT COUNT(*) as total FROM reportes_equipos");
        $total_reportes = $stmt->fetch()['total'];
    } catch (PDOException $e) {
        $total_reportes = 0;
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'equipos_por_estado' => $equipos_por_estado,
            'prestamos_activos' => $prestamos_activos,
            'prestamos_vencidos' => $prestamos_vencidos,
            'total_usuarios' => $total_usuarios,
            'usuarios_frecuentes' => $usuarios_frecuentes,
            'prestamos_recientes' => $prestamos_recientes,
            'equipos_por_categoria' => $equipos_por_categoria,
            'total_reportes' => $total_reportes
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener estadísticas'
    ]);
}
