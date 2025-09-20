<?php
// API Configuration for TiendaReact
header('Content-Type: application/json; charset=utf-8');

// CORS Configuration
$allowed_origins = [
    'http://localhost',
    'http://localhost/TiendaReact',
    'http://localhost:3000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Configuration
define('DB_DSN', 'mysql:host=localhost;dbname=tienda;charset=utf8mb4');
define('DB_USER', 'admin');
define('DB_PASS', 'Imc590923cz4#');

// JWT Secret Key
define('JWT_SECRET', 'imcyc_secret_key_2024');

// API Response Functions
function apiResponse($success, $data = null, $message = '', $code = 200) {
    // Limpiar cualquier salida previa
    if (ob_get_level()) {
        ob_clean();
    }
    
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

function apiError($message, $code = 400) {
    apiResponse(false, null, $message, $code);
}

function apiSuccess($data = null, $message = '') {
    apiResponse(true, $data, $message);
}

// Simple JWT Functions
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $headerEncoded = base64url_encode($header);
    $payloadEncoded = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
    $signatureEncoded = base64url_encode($signature);
    
    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

function verifyJWT($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
    
    $signature = base64url_decode($signatureEncoded);
    $expectedSignature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
    
    if (!hash_equals($expectedSignature, $signature)) {
        return false;
    }
    
    $payload = json_decode(base64url_decode($payloadEncoded), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

// Get JWT from Authorization header
function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

// Authentication functions
function isAuthenticated() {
    $token = getBearerToken();
    if (!$token) {
        return false;
    }
    
    $payload = verifyJWT($token);
    return $payload !== false;
}

function getUserId() {
    $token = getBearerToken();
    if (!$token) {
        return null;
    }
    
    $payload = verifyJWT($token);
    return $payload ? $payload['user_id'] : null;
}

function requireAuth() {
    if (!isAuthenticated()) {
        apiError('No autorizado', 401);
    }
}

// Database connection helper
function getDBConnection() {
    try {
        $pdo = new PDO(DB_DSN, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec("SET NAMES utf8mb4");
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        apiError('Error de conexión a la base de datos', 500);
    }
}

// Input validation functions
function getJsonInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        apiError('JSON inválido');
    }
    
    return $data;
}

function validateRequired($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
            apiError("El campo '$field' es requerido");
        }
    }
}

function sanitizeString($string) {
    return htmlspecialchars(trim($string), ENT_QUOTES, 'UTF-8');
}
?>
