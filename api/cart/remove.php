<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    apiError('Método no permitido', 405);
}

// Verificar autenticación
if (!isAuthenticated()) {
    apiError('No autorizado', 401);
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['item_id']) || !isset($data['section'])) {
        apiError('Datos faltantes: item_id y section son requeridos');
    }

    $itemId = $data['item_id'];
    $section = $data['section'];
    $userId = getUserId();

    $pdo = getDBConnection();
    
    switch ($section) {
        case 'mercancia':
            $stmt = $pdo->prepare("
                DELETE ci FROM carrito_items ci 
                INNER JOIN carritos c ON ci.carrito_id = c.id 
                WHERE ci.id = ? AND c.user_id = ?
            ");
            break;
            
        case 'libros':
            $stmt = $pdo->prepare("
                DELETE cil FROM carrito_items_libros cil 
                INNER JOIN carritos_libros cl ON cil.carrito_id = cl.id 
                WHERE cil.id = ? AND cl.user_id = ?
            ");
            break;
            
        case 'ebooks':
            $stmt = $pdo->prepare("
                DELETE cie FROM carrito_items_ebooks cie 
                INNER JOIN carritos_ebooks ce ON cie.carrito_id = ce.id 
                WHERE cie.id = ? AND ce.user_id = ?
            ");
            break;
            
        default:
            apiError('Sección no válida');
    }
    
    $stmt->execute([$itemId, $userId]);
    
    if ($stmt->rowCount() === 0) {
        apiError('Item no encontrado o no autorizado', 404);
    }
    
    // Contar items totales del carrito
    $totalItems = 0;
    
    // Contar mercancía
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(ci.quantity), 0) as total 
        FROM carritos c 
        LEFT JOIN carrito_items ci ON c.id = ci.carrito_id 
        WHERE c.user_id = ?
    ");
    $stmt->execute([$userId]);
    $totalItems += intval($stmt->fetchColumn());
    
    // Contar libros
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(cil.quantity), 0) as total 
        FROM carritos_libros cl 
        LEFT JOIN carrito_items_libros cil ON cl.id = cil.carrito_id 
        WHERE cl.user_id = ?
    ");
    $stmt->execute([$userId]);
    $totalItems += intval($stmt->fetchColumn());
    
    // Contar ebooks
    $stmt = $pdo->prepare("
        SELECT COALESCE(COUNT(*), 0) as total 
        FROM carritos_ebooks ce 
        LEFT JOIN carrito_items_ebooks cie ON ce.id = cie.carrito_id 
        WHERE ce.user_id = ?
    ");
    $stmt->execute([$userId]);
    $totalItems += intval($stmt->fetchColumn());

    apiSuccess([
        'message' => 'Item eliminado del carrito exitosamente',
        'cart_total' => $totalItems
    ]);

} catch (PDOException $e) {
    error_log("Cart remove error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>
