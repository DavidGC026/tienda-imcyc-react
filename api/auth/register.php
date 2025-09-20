<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Método no permitido', 405);
}

$input = getJsonInput();
validateRequired($input, ['nombre', 'email', 'password']);

$nombre = sanitizeString($input['nombre']);
$email = sanitizeString($input['email']);
$password = $input['password'];
$telefono = isset($input['telefono']) ? sanitizeString($input['telefono']) : null;

// Validaciones
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    apiError('Email inválido');
}

if (strlen($password) < 6) {
    apiError('La contraseña debe tener al menos 6 caracteres');
}

try {
    $pdo = getDBConnection();
    
    // Verificar si el email ya existe
    $checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $checkStmt->execute([$email]);
    
    if ($checkStmt->fetch()) {
        apiError('El email ya está registrado', 409);
    }
    
    // Hash de la contraseña
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar nuevo usuario
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (nombre, email, password, telefono, rol, status, created_at) 
        VALUES (?, ?, ?, ?, 'usuario', 'active', NOW())
    ");
    
    $stmt->execute([$nombre, $email, $hashedPassword, $telefono]);
    $userId = $pdo->lastInsertId();
    
    // Obtener el usuario recién creado
    $userStmt = $pdo->prepare("
        SELECT id, nombre, email, rol, telefono, created_at 
        FROM usuarios 
        WHERE id = ?
    ");
    
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    // Generar JWT token
    $tokenPayload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'rol' => $user['rol'],
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ];
    
    $token = generateJWT($tokenPayload);
    
    $user['fecha_registro'] = $user['created_at'];
    unset($user['created_at']);
    
    apiSuccess([
        'user' => $user,
        'token' => $token
    ], 'Usuario registrado exitosamente');
    
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>