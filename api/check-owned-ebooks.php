<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Método no permitido', 405);
}

// Verificar autenticación
if (!isAuthenticated()) {
    apiError('No autorizado', 401);
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $userId = getUserId();
    if (!$userId) {
        apiError('Usuario no válido', 401);
    }
    
    $pdo = getDBConnection();
    
    // Si se especifican ebook_ids, verificar solo esos
    if (isset($data['ebook_ids']) && is_array($data['ebook_ids'])) {
        $ebookIds = array_map('intval', $data['ebook_ids']);
        $ownedEbooks = getOwnedEbooks($pdo, $userId, $ebookIds);
    } else {
        // Si no se especifican, devolver todos los ebooks que posee el usuario
        $ownedEbooks = getOwnedEbooks($pdo, $userId);
    }
    
    apiSuccess([
        'owned_ebooks' => $ownedEbooks,
        'user_id' => $userId
    ]);
    
} catch (Exception $e) {
    error_log("Error en check-owned-ebooks.php: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}

/**
 * Obtiene los ebooks que posee un usuario
 */
function getOwnedEbooks($pdo, $userId, $specificIds = null) {
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
                        
                        if ($ebookId > 0) {
                            // Si se especificaron IDs específicos, filtrar
                            if ($specificIds === null || in_array($ebookId, $specificIds)) {
                                if (!in_array($ebookId, $ownedEbooks)) {
                                    $ownedEbooks[] = $ebookId;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return $ownedEbooks;
}
?>