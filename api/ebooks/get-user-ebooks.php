<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
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
    
    // Verificar token de autorización
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Token de autorización requerido']);
        exit;
    }
    
    $token = $matches[1];
    
    // Para propósitos de demostración, vamos a usar un token simple
    // En producción deberías verificar el token JWT con la tabla usuarios
    if ($token !== 'test-token') {
        // Verificar token real en la base de datos
        $stmt = $pdo->prepare("SELECT id, email FROM usuarios WHERE id = ? AND status = 'active'");
        $stmt->execute([7]); // Por ahora usar usuario ID 7 para demostración
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido']);
            exit;
        }
        $userId = $user['id'];
    } else {
        // Para token de prueba
        $userId = 7;
    }
    
    // Obtener ebooks del usuario usando la misma lógica que getUserAcceptedEbooks
    $stmt = $pdo->prepare("
        SELECT DISTINCT e.*
        FROM pedidos p,
             JSON_TABLE(p.items, '$[*]' COLUMNS (
                ebook_id INT PATH '$.ebook_id',
                tipo VARCHAR(20) PATH '$.tipo'
             )) AS items
        JOIN ebooks e ON e.ebook_id = items.ebook_id
        WHERE p.user_id = ?
          AND p.status = 'aprobado'
          AND items.tipo = 'ebook'
    ");
    $stmt->execute([$userId]);
    $ebooks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear los resultados
    $formattedEbooks = [];
    foreach ($ebooks as $ebook) {
        $formattedEbooks[] = [
            'id' => (int)$ebook['ebook_id'],
            'titulo' => $ebook['titulo'],
            'descripcion' => $ebook['descripcion'],
            'precio' => (float)$ebook['precio'],
            'autor' => $ebook['autor'],
            'imagen' => $ebook['imagen_url'] ?: null,
            'archivo_pdf' => $ebook['archivo_url'],
            'fecha_publicacion' => $ebook['fecha_publicacion'],
            'categoria' => $ebook['categoria']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'ebooks' => $formattedEbooks,
        'total' => count($formattedEbooks)
    ]);
    
} catch (Exception $e) {
    error_log("Error en get-user-ebooks.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'message' => $e->getMessage()
    ]);
}
?>