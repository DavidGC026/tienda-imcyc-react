<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Método no permitido', 405);
}

$input = getJsonInput();

// Verificar si se proporciona un token en el body (para compatibilidad con el frontend)
$token = $input['token'] ?? getBearerToken();

if (!$token) {
    apiError('Token no proporcionado', 401);
}

$payload = verifyJWT($token);

if (!$payload) {
    apiError('Token inválido o expirado', 401);
}

try {
    $pdo = getDBConnection();
    
    // Obtener datos actualizados del usuario
    $stmt = $pdo->prepare("
        SELECT id, nombre, email, rol, telefono, created_at, status, last_login
        FROM usuarios 
        WHERE id = ? AND status = 'active'
    ");
    
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        apiError('Usuario no encontrado o inactivo', 401);
    }
    
    // Preparar datos del usuario (sin datos sensibles)
    $user['fecha_registro'] = $user['created_at'];
    unset($user['created_at']);
    
    apiSuccess([
        'user' => $user,
        'token_payload' => $payload
    ], 'Token válido');
    
} catch (PDOException $e) {
    error_log("Verify token error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>