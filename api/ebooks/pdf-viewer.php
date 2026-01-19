<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

try {
    // Obtener conexión a la base de datos
    $pdo = getDBConnection();
    
    // Verificar parámetros
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de ebook requerido']);
        exit;
    }
    
    $ebookId = intval($_GET['id']);
    
    // Verificar token de autorización
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Token de autorización requerido']);
        exit;
    }
    
    $token = $matches[1];
    
    // Verificar token JWT usando funciones de config.php
    $decoded = verifyJWT($token);
    
    if ($decoded === false) {
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido']);
        exit;
    }
    
    $userId = $decoded['user_id'];
    
    // Verificar que el usuario existe y está activo
    $stmt = $pdo->prepare("SELECT id, email FROM usuarios WHERE id = ? AND status = 'active'");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Usuario no válido']);
        exit;
    }
    
    // Verificar que el usuario tiene acceso al ebook usando la misma lógica que getUserAcceptedEbooks
    $stmt = $pdo->prepare("
        SELECT DISTINCT e.archivo_url, e.titulo
        FROM pedidos p,
             JSON_TABLE(p.items, '$[*]' COLUMNS (
                ebook_id INT PATH '$.ebook_id',
                tipo VARCHAR(20) PATH '$.tipo'
             )) AS items
        JOIN ebooks e ON e.ebook_id = items.ebook_id
        WHERE p.user_id = ?
          AND p.status = 'aprobado'
          AND items.tipo = 'ebook'
          AND e.ebook_id = ?
    ");
    $stmt->execute([$userId, $ebookId]);
    $ebook = $stmt->fetch();
    
    if (!$ebook) {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes acceso a este ebook']);
        exit;
    }
    
    // Construir la ruta del archivo PDF
    $pdfPath = '/var/www/sources/libros/' . basename($ebook['archivo_url']);
    
    // Verificar que el archivo existe
    if (!file_exists($pdfPath)) {
        http_response_code(404);
        echo json_encode(['error' => 'Archivo PDF no encontrado']);
        exit;
    }
    
    // Servir el archivo PDF
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . basename($ebook['titulo']) . '.pdf"');
    header('Content-Length: ' . filesize($pdfPath));
    header('Accept-Ranges: bytes');
    
    // Cachear por 1 hora
    header('Cache-Control: private, max-age=3600');
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');
    
    readfile($pdfPath);
    
} catch (Exception $e) {
    error_log("Error en pdf-viewer.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'message' => $e->getMessage()
    ]);
}
?>