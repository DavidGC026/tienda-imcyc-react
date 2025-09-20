<?php
require_once 'config.php';

// Solo para pruebas - REMOVER EN PRODUCCIÓN
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Método no permitido', 405);
}

try {
    $pdo = getDBConnection();
    
    // Obtener el primer usuario activo
    $stmt = $pdo->prepare("
        SELECT id, nombre, email, rol, telefono, created_at, status 
        FROM usuarios 
        WHERE status = 'active' 
        LIMIT 1
    ");
    
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        apiError('No hay usuarios activos', 404);
    }
    
    // Generar JWT token de prueba
    $tokenPayload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'rol' => $user['rol'] ?? 'usuario',
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ];
    
    $token = generateJWT($tokenPayload);
    
    // Preparar datos del usuario (sin contraseña)
    $user['fecha_registro'] = $user['created_at'];
    unset($user['created_at']);
    
    apiSuccess([
        'user' => $user,
        'token' => $token,
        'note' => 'TOKEN DE PRUEBA - REMOVER EN PRODUCCIÓN'
    ], 'Token de prueba generado');
    
} catch (PDOException $e) {
    error_log("Test token error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>