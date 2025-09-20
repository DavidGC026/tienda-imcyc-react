<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Método no permitido', 405);
}

// Verificar autenticación
if (!isAuthenticated()) {
    apiError('No autorizado', 401);
}

try {
    $userId = getUserId();
    $pdo = getDBConnection();
    
    // Limpiar carrito de mercancía
    $stmt = $pdo->prepare("
        DELETE ci FROM carrito_items ci 
        INNER JOIN carritos c ON ci.carrito_id = c.id 
        WHERE c.user_id = ?
    ");
    $stmt->execute([$userId]);
    
    // Limpiar carrito de libros
    $stmt = $pdo->prepare("
        DELETE cil FROM carrito_items_libros cil 
        INNER JOIN carritos_libros cl ON cil.carrito_id = cl.id 
        WHERE cl.user_id = ?
    ");
    $stmt->execute([$userId]);
    
    // Limpiar carrito de ebooks
    $stmt = $pdo->prepare("
        DELETE cie FROM carrito_items_ebooks cie 
        INNER JOIN carritos_ebooks ce ON cie.carrito_id = ce.id 
        WHERE ce.user_id = ?
    ");
    $stmt->execute([$userId]);

    apiSuccess([
        'message' => 'Carrito limpiado exitosamente',
        'cart_total' => 0
    ]);

} catch (PDOException $e) {
    error_log("Cart clear error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>
