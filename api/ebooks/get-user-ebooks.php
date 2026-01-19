<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Método no permitido', 405);
}

// Verificar autenticación
if (!isAuthenticated()) {
    apiError('No autorizado', 401);
}

try {
    $userId = getUserId();
    if (!$userId) {
        apiError('Usuario no válido', 401);
    }
    
    $pdo = getDBConnection();
    
    // Obtener IDs de ebooks que posee el usuario
    $ownedEbookIds = getOwnedEbooks($pdo, $userId);
    
    if (empty($ownedEbookIds)) {
        apiSuccess([
            'success' => true,
            'ebooks' => [],
            'total' => 0
        ]);
        return;
    }
    
    // Obtener detalles de los ebooks
    $ebooksDetails = getEbooksDetails($pdo, $ownedEbookIds);
    
    apiSuccess([
        'success' => true,
        'ebooks' => $ebooksDetails,
        'total' => count($ebooksDetails)
    ]);
    
} catch (Exception $e) {
    error_log("Error en get-user-ebooks.php: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}

/**
 * Obtiene los ebooks que posee un usuario
 */
function getOwnedEbooks($pdo, $userId) {
    // Buscar en pedidos aprobados/pagados
    $sql = "SELECT items FROM pedidos 
            WHERE user_id = ? 
            AND (status = 'aprobado' OR status = 'paid' OR status = 'completed')
            ORDER BY fecha DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    
    $ownedEbooks = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (!empty($row['items'])) {
            $items = json_decode($row['items'], true);
            
            if (is_array($items)) {
                foreach ($items as $item) {
                    // Verificar si es un ebook - usar formato real de datos
                    if (isset($item['tipo']) && $item['tipo'] === 'ebook') {
                        // Usar ebook_id del formato real
                        $ebookId = intval($item['ebook_id'] ?? 0);
                        
                        if ($ebookId > 0 && !in_array($ebookId, $ownedEbooks)) {
                            $ownedEbooks[] = $ebookId;
                        }
                    }
                }
            }
        }
    }
    
    return $ownedEbooks;
}

/**
 * Obtiene los detalles de los ebooks especificados
 */
function getEbooksDetails($pdo, $ebookIds) {
    if (empty($ebookIds)) {
        return [];
    }
    
    $placeholders = str_repeat('?,', count($ebookIds) - 1) . '?';
    $sql = "SELECT 
                ebook_id as id,
                titulo,
                autor,
                descripcion,
                precio,
                imagen_url as imagen,
                archivo_url as archivo_pdf,
                archivo_url as pdf_filename,
                fecha_publicacion,
                created_at
            FROM ebooks 
            WHERE ebook_id IN ($placeholders)
            ORDER BY titulo ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($ebookIds);
    
    $ebooks = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Procesar la imagen
        if (!empty($row['imagen'])) {
            // Si la imagen es una ruta relativa, convertirla a URL completa
            if (strpos($row['imagen'], 'http') !== 0) {
                $row['imagen'] = '/api/uploads/' . $row['imagen'];
            }
        }
        
        // Verificar si existe el archivo PDF
        if (!empty($row['pdf_filename'])) {
            $pdfPath = '/var/www/html/TiendaImcyc/tienda-imcyc-react/api/ebooks/' . $row['pdf_filename'];
            $row['archivo_pdf'] = file_exists($pdfPath) ? $row['pdf_filename'] : null;
        } else {
            $row['archivo_pdf'] = null;
        }
        
        $ebooks[] = $row;
    }
    
    return $ebooks;
}
?>
