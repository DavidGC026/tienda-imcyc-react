<?php
require_once __DIR__ . '/../config.php';

// Requiere autenticación
requireAuth();

$userId = getUserId();
if (!$userId) {
    apiError('No autorizado', 401);
}

// Parámetros de paginación
$page  = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

// TODO: Implementar consulta real a la base de datos cuando exista la tabla de pedidos
// Por ahora, devolver estructura vacía para no romper el frontend
$data = [
    'orders' => [],
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total_orders' => 0,
        'total_pages' => 0,
    ],
];

apiSuccess($data);
