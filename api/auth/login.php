<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Método no permitido', 405);
}

$input = getJsonInput();
validateRequired($input, ['email', 'password']);

$email = sanitizeString($input['email']);
$password = $input['password'];

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT id, nombre, email, password, rol, telefono, created_at, status 
        FROM usuarios 
        WHERE email = ? AND status = 'active'
    ");
    
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        apiError('Credenciales inválidas', 401);
    }
    
    // Verificar contraseña
    if (!password_verify($password, $user['password'])) {
        // Compatibilidad con hashes MD5 existentes (temporal)
        if (md5($password) !== $user['password']) {
            apiError('Credenciales inválidas', 401);
        }
    }
    
    // Generar JWT token
    $tokenPayload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'rol' => $user['rol'] ?? 'usuario',
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ];
    
    $token = generateJWT($tokenPayload);
    
    // Preparar datos del usuario (sin contraseña)
    unset($user['password']);
    $user['fecha_registro'] = $user['created_at'];
    unset($user['created_at']);
    
    // Registrar último login
    $updateStmt = $pdo->prepare("UPDATE usuarios SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);
    
    apiSuccess([
        'user' => $user,
        'token' => $token
    ], 'Login exitoso');
    
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>