<?php
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    $sql = "
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id_conekta VARCHAR(255) UNIQUE NOT NULL,
        items_json TEXT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        iva DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        payment_method ENUM('cash', 'spei', 'transfer') NOT NULL,
        status ENUM('pending', 'paid', 'cancelled', 'expired') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_order_id_conekta (order_id_conekta),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $pdo->exec($sql);
    echo "Tabla 'orders' creada exitosamente.\n";
    
    // Verificar que la tabla se creó correctamente
    $result = $pdo->query("DESCRIBE orders");
    echo "Estructura de la tabla 'orders':\n";
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']}: {$row['Type']}\n";
    }
    
} catch (PDOException $e) {
    echo "Error al crear la tabla: " . $e->getMessage() . "\n";
    exit(1);
}
?>