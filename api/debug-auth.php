<?php
require_once 'config.php';

try {
    echo "=== DEBUG AUTENTICACIÓN ===\n\n";
    
    // 1. Verificar headers
    $headers = getallheaders();
    echo "Headers recibidos:\n";
    foreach ($headers as $name => $value) {
        if (strtolower($name) === 'authorization') {
            echo "  $name: " . substr($value, 0, 50) . "...\n";
        } else {
            echo "  $name: $value\n";
        }
    }
    
    // 2. Obtener token
    $token = getBearerToken();
    echo "\nToken extraído: " . ($token ? substr($token, 0, 50) . "..." : "NINGUNO") . "\n";
    
    // 3. Verificar autenticación
    $isAuth = isAuthenticated();
    echo "¿Está autenticado?: " . ($isAuth ? "SÍ" : "NO") . "\n";
    
    if ($isAuth) {
        // 4. Obtener user ID
        $userId = getUserId();
        echo "User ID obtenido: $userId\n";
        
        // 5. Verificar token manualmente
        if ($token) {
            $payload = verifyJWT($token);
            echo "Payload del token:\n";
            print_r($payload);
        }
        
        // 6. Obtener info del usuario
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, nombre, email FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo "\nDatos del usuario:\n";
            echo "  ID: {$user['id']}\n";
            echo "  Nombre: {$user['nombre']}\n";
            echo "  Email: {$user['email']}\n";
        }
        
        // 7. Contar ebooks del usuario
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total_pedidos,
                   SUM(CASE WHEN status IN ('aprobado', 'paid', 'completed') THEN 1 ELSE 0 END) as pedidos_pagados
            FROM pedidos WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "\nEstadísticas de pedidos:\n";
        echo "  Total pedidos: {$stats['total_pedidos']}\n";
        echo "  Pedidos pagados: {$stats['pedidos_pagados']}\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>