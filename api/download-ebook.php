<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Método no permitido', 405);
}

// Verificar autenticación
if (!isAuthenticated()) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {
    $userId = getUserId();
    if (!$userId) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Usuario no válido']);
        exit;
    }
    
    $ebookId = intval($_GET['id'] ?? 0);
    if ($ebookId <= 0) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'ID de ebook inválido']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    // Verificar si el usuario posee este ebook
    if (!userOwnsEbook($pdo, $userId, $ebookId)) {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode(['error' => 'No tienes permiso para descargar este ebook']);
        exit;
    }
    
    // Obtener información del ebook
    $ebook = getEbookInfo($pdo, $ebookId);
    if (!$ebook) {
        header('HTTP/1.1 404 Not Found');
        echo json_encode(['error' => 'Ebook no encontrado']);
        exit;
    }
    
    // Construir ruta del archivo
    $filePath = '/var/www/html/TiendaImcyc/tienda-imcyc-react/api/ebooks/' . $ebook['pdf_filename'];
    
    if (!file_exists($filePath)) {
        header('HTTP/1.1 404 Not Found');
        echo json_encode(['error' => 'Archivo no encontrado']);
        exit;
    }
    
    // Registrar descarga
    logDownload($pdo, $userId, $ebookId);
    
    // Configurar headers para descarga
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $ebook['title'] . '.pdf"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: private');
    header('Pragma: private');
    
    // Enviar archivo
    readfile($filePath);
    exit;
    
} catch (Exception $e) {
    error_log("Error en download-ebook.php: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Error interno del servidor']);
    exit;
}

/**
 * Verifica si un usuario posee un ebook específico
 */
function userOwnsEbook($pdo, $userId, $ebookId) {
    $sql = "SELECT items FROM pedidos 
            WHERE user_id = ? 
            AND (status = 'aprobado' OR status = 'paid' OR status = 'completed')
            ORDER BY fecha DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (!empty($row['items'])) {
            $items = json_decode($row['items'], true);
            
            if (is_array($items)) {
                foreach ($items as $item) {
                    // Usar formato real de datos
                    if (isset($item['tipo']) && $item['tipo'] === 'ebook') {
                        $itemEbookId = intval($item['ebook_id'] ?? 0);
                        if ($itemEbookId === $ebookId) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    
    return false;
}

/**
 * Obtiene información de un ebook
 */
function getEbookInfo($pdo, $ebookId) {
    $stmt = $pdo->prepare("SELECT ebook_id as id, titulo as title, archivo_url as pdf_filename FROM ebooks WHERE ebook_id = ?");
    $stmt->execute([$ebookId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Registra una descarga
 */
function logDownload($pdo, $userId, $ebookId) {
    try {
        $sql = "INSERT INTO ebook_downloads (user_id, ebook_id, download_date) 
                VALUES (?, ?, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $ebookId]);
    } catch (Exception $e) {
        // Log pero no fallar si no existe la tabla de logs
        error_log("Error registrando descarga: " . $e->getMessage());
    }
}
?>