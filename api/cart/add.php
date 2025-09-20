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
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['product_id']) || !isset($data['section'])) {
        apiError('Datos faltantes: product_id y section son requeridos');
    }

    $productId = $data['product_id'];
    $section = $data['section'];
    $quantity = isset($data['quantity']) ? max(1, intval($data['quantity'])) : 1;
    $userId = getUserId();

    // Validar sección
    $allowedSections = ['mercancia', 'libros', 'ebooks', 'webinars'];
    if (!in_array($section, $allowedSections)) {
        apiError('Sección no válida');
    }

    $pdo = getDBConnection();
    
    switch ($section) {
        case 'mercancia':
            // Verificar producto existe y tiene stock
            $stmt = $pdo->prepare("SELECT product_id, name, price, stock FROM products WHERE product_id = ?");
            $stmt->execute([$productId]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$product) {
                apiError('Producto no encontrado');
            }
            
            if ($product['stock'] < $quantity) {
                apiError('Stock insuficiente');
            }
            
            // Obtener o crear carrito
            $stmt = $pdo->prepare("SELECT id FROM carritos WHERE user_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$cart) {
                $stmt = $pdo->prepare("INSERT INTO carritos (user_id) VALUES (?)");
                $stmt->execute([$userId]);
                $cartId = $pdo->lastInsertId();
            } else {
                $cartId = $cart['id'];
            }
            
            // Verificar si ya existe en el carrito
            $stmt = $pdo->prepare("SELECT id, quantity FROM carrito_items WHERE carrito_id = ? AND product_id = ?");
            $stmt->execute([$cartId, $productId]);
            $existingItem = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingItem) {
                // Actualizar cantidad
                $newQuantity = $existingItem['quantity'] + $quantity;
                if ($newQuantity > $product['stock']) {
                    apiError('La cantidad total excedería el stock disponible');
                }
                $stmt = $pdo->prepare("UPDATE carrito_items SET quantity = ? WHERE id = ?");
                $stmt->execute([$newQuantity, $existingItem['id']]);
            } else {
                // Agregar nuevo item
                $stmt = $pdo->prepare("INSERT INTO carrito_items (carrito_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
                $stmt->execute([$cartId, $productId, $quantity, $product['price']]);
            }
            
            $productName = $product['name'];
            break;

        case 'libros':
            // Verificar libro existe
            $stmt = $pdo->prepare("SELECT libro_id, nombre, precio, stock FROM libros WHERE libro_id = ?");
            $stmt->execute([$productId]);
            $libro = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$libro) {
                apiError('Libro no encontrado');
            }
            
            if ($libro['stock'] < $quantity) {
                apiError('Stock insuficiente');
            }
            
            // Obtener o crear carrito libros
            $stmt = $pdo->prepare("SELECT id FROM carritos_libros WHERE user_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$cart) {
                $stmt = $pdo->prepare("INSERT INTO carritos_libros (user_id) VALUES (?)");
                $stmt->execute([$userId]);
                $cartId = $pdo->lastInsertId();
            } else {
                $cartId = $cart['id'];
            }
            
            // Verificar si ya existe
            $stmt = $pdo->prepare("SELECT id FROM carrito_items_libros WHERE carrito_id = ? AND libro_id = ?");
            $stmt->execute([$cartId, $productId]);
            
            if ($stmt->fetch()) {
                apiError('El libro ya está en el carrito');
            }
            
            // Agregar libro
            $stmt = $pdo->prepare("INSERT INTO carrito_items_libros (carrito_id, libro_id, quantity, price) VALUES (?, ?, ?, ?)");
            $stmt->execute([$cartId, $productId, $quantity, $libro['precio']]);
            
            $productName = $libro['nombre'];
            break;

        case 'ebooks':
            // Verificar ebook existe
            $stmt = $pdo->prepare("SELECT ebook_id, titulo, precio FROM ebooks WHERE ebook_id = ?");
            $stmt->execute([$productId]);
            $ebook = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$ebook) {
                apiError('E-book no encontrado');
            }
            
            // Obtener o crear carrito ebooks
            $stmt = $pdo->prepare("SELECT id FROM carritos_ebooks WHERE user_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$cart) {
                $stmt = $pdo->prepare("INSERT INTO carritos_ebooks (user_id) VALUES (?)");
                $stmt->execute([$userId]);
                $cartId = $pdo->lastInsertId();
            } else {
                $cartId = $cart['id'];
            }
            
            // Verificar si ya existe
            $stmt = $pdo->prepare("SELECT id FROM carrito_items_ebooks WHERE carrito_id = ? AND ebook_id = ?");
            $stmt->execute([$cartId, $productId]);
            
            if ($stmt->fetch()) {
                apiError('El e-book ya está en el carrito');
            }
            
            // Agregar ebook (cantidad siempre 1)
            $stmt = $pdo->prepare("INSERT INTO carrito_items_ebooks (carrito_id, ebook_id, cantidad, precio_unitario) VALUES (?, ?, 1, ?)");
            $stmt->execute([$cartId, $productId, $ebook['precio']]);
            
            $productName = $ebook['titulo'];
            break;

        default:
            apiError('Sección no implementada');
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
        'message' => ucfirst($section === 'ebooks' ? 'E-book' : ($section === 'mercancia' ? 'Producto' : 'Libro')) . ' agregado al carrito exitosamente',
        'product_name' => $productName,
        'cart_total' => $totalItems
    ]);

} catch (PDOException $e) {
    error_log("Cart add error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>
