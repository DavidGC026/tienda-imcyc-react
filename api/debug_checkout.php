<?php
// Archivo de debug para capturar todas las requests del checkout
$log_file = '/tmp/checkout_debug.log';

function debug_log($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[$timestamp] $message\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}

debug_log("=== NUEVA REQUEST ===");
debug_log("Method: " . $_SERVER['REQUEST_METHOD']);
debug_log("URI: " . $_SERVER['REQUEST_URI']);
debug_log("Headers: " . json_encode(getallheaders()));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    debug_log("POST Data: " . $input);
    
    if (!empty($input)) {
        $data = json_decode($input, true);
        if ($data) {
            debug_log("Parsed JSON: " . print_r($data, true));
            debug_log("Cart Items Count: " . (isset($data['cart_items']) ? count($data['cart_items']) : 'N/A'));
            debug_log("Total: " . ($data['total'] ?? 'N/A'));
            debug_log("Payment Method: " . ($data['payment_method'] ?? 'N/A'));
        }
    }
}

debug_log("=== FIN REQUEST ===\n");

echo "Debug logged to: $log_file\n";
?>