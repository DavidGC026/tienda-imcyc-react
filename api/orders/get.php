<?php
require_once __DIR__ . '/../config.php';

// Requiere autenticación
requireAuth();

// ID del pedido
$orderId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($orderId <= 0) {
    apiError('ID de pedido inválido', 400);
}

// TODO: Implementar obtención real del pedido
apiError('Pedido no encontrado', 404);
