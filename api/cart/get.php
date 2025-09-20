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
    
    $cartItems = [];
    $totalPrice = 0;
    
    // Obtener mercancía del carrito
    $stmt = $pdo->prepare("
        SELECT 
            ci.id,
            ci.quantity,
            ci.price,
            p.product_id,
            p.name,
            p.image,
            'mercancia' as section
        FROM carritos c 
        INNER JOIN carrito_items ci ON c.id = ci.carrito_id 
        INNER JOIN products p ON ci.product_id = p.product_id
        WHERE c.user_id = ?
    ");
    $stmt->execute([$userId]);
    $merchandiseItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($merchandiseItems as $item) {
        $item['subtotal'] = $item['price'] * $item['quantity'];
        $totalPrice += $item['subtotal'];
        $cartItems[] = $item;
    }
    
    // Obtener libros del carrito
    $stmt = $pdo->prepare("
        SELECT 
            cil.id,
            cil.quantity,
            cil.price,
            l.libro_id as product_id,
            l.nombre as name,
            l.image_url as image,
            'libros' as section
        FROM carritos_libros cl 
        INNER JOIN carrito_items_libros cil ON cl.id = cil.carrito_id 
        INNER JOIN libros l ON cil.libro_id = l.libro_id
        WHERE cl.user_id = ?
    ");
    $stmt->execute([$userId]);
    $bookItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($bookItems as $item) {
        $item['subtotal'] = $item['price'] * $item['quantity'];
        $totalPrice += $item['subtotal'];
        $cartItems[] = $item;
    }
    
    // Obtener ebooks del carrito
    $stmt = $pdo->prepare("
        SELECT 
            cie.id,
            1 as quantity,
            cie.precio_unitario as price,
            e.ebook_id as product_id,
            e.titulo as name,
            e.imagen_url as image,
            'ebooks' as section
        FROM carritos_ebooks ce 
        INNER JOIN carrito_items_ebooks cie ON ce.id = cie.carrito_id 
        INNER JOIN ebooks e ON cie.ebook_id = e.ebook_id
        WHERE ce.user_id = ?
    ");
    $stmt->execute([$userId]);
    $ebookItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($ebookItems as $item) {
        $item['subtotal'] = $item['price'];
        $totalPrice += $item['subtotal'];
        $cartItems[] = $item;
    }

    apiSuccess([
        'items' => $cartItems,
        'total_price' => $totalPrice,
        'total_items' => count($cartItems)
    ]);

} catch (PDOException $e) {
    error_log("Cart get error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>
