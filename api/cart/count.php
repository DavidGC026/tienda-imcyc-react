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
    $pdo = getDBConnection();
    
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
        'cart_total' => $totalItems
    ]);

} catch (PDOException $e) {
    error_log("Cart count error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>
