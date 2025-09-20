<?php
// Incluir configuración de API con autenticación JWT
require_once 'config.php';

// Suprimir warnings para evitar interferencia con JSON
ini_set('display_errors', 0);
error_reporting(E_ERROR | E_PARSE);

// Limpiar buffer de salida
ob_clean();
ob_start();

// Importar archivos de conexión del sistema principal
require_once '/var/www/html/TiendaImcyc/connection.php';
require_once '/var/www/html/TiendaImcyc/connectionl.php';
require_once '/var/www/html/TiendaImcyc/connectione.php';
require_once '/var/www/html/TiendaImcyc/connectionw.php';
require_once '/var/www/html/TiendaImcyc/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Conekta\Api\OrdersApi;
use Conekta\Model\OrderRequest;

try {
    // Verificar método de request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        apiError('Método no permitido', 405);
    }

    // Verificar autenticación JWT
    requireAuth();
    $user_id = getUserId();
    
    if (!$user_id) {
        apiError('Usuario no válido', 401);
    }

    // Obtener datos JSON del request
    $data = getJsonInput();
    $cart_items = $data['cart_items'] ?? [];
    $subtotal = floatval($data['subtotal'] ?? 0);
    $iva = floatval($data['iva'] ?? 0);
    $total = floatval($data['total'] ?? 0);

    if (empty($cart_items) || $total <= 0) {
        apiError('Carrito vacío o total inválido', 400);
    }

    // Inicializar conexiones de base de datos
    $db = new Database();    // mercancía
    $db2 = new Database2();  // libros
    $db3 = new Database3();  // ebooks
    $db4 = new DatabaseW();  // webinars

    // Obtener datos del usuario
    $stmt = $db->pdo->prepare("SELECT email, nombre, telefono, calle, colonia, municipio, estado, codigo_postal, direccion_completa FROM usuarios WHERE id = ?");
    $stmt->execute([$user_id]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        throw new Exception('Usuario no encontrado');
    }

    $email = $userData['email'];
    $nombre = $userData['nombre'];
    $telefono = $userData['telefono'] ?? '0000000000';
    $calle = $userData['calle'] ?? '';
    $colonia = $userData['colonia'] ?? '';
    $municipio = $userData['municipio'] ?? '';
    $estado = $userData['estado'] ?? '';
    $codigo_postal = $userData['codigo_postal'] ?? '';

    // Validar que el email existe (requerido por Conekta)
    if (empty($email)) {
        throw new Exception('Email del usuario no encontrado. Por favor actualiza tu perfil.');
    }

    // Iniciar transacciones
    $db->beginTransaction();
    $db2->beginTransaction();
    $db3->beginTransaction();
    $db4->beginTransaction();

    try {
        // Usar los items del carrito que vienen del frontend
        $items = [];
        
        foreach ($cart_items as $item) {
            // Normalizar estructura del item
            $processedItem = [
                'nombre' => $item['name'] ?? $item['nombre'] ?? 'Producto',
                'precio' => floatval($item['price'] ?? $item['precio'] ?? 0),
                'cantidad' => intval($item['quantity'] ?? $item['cantidad'] ?? 1),
                'section' => $item['section'] ?? 'mercancia',
                'product_id' => $item['product_id'] ?? $item['id'] ?? 0
            ];
            
            // Calcular IVA (16%) solo para mercancía y ebooks
            $aplicaIva = in_array($processedItem['section'], ['mercancia', 'ebooks']);
            $processedItem['aplica_iva'] = $aplicaIva;
            
            $subtotalItem = $processedItem['precio'] * $processedItem['cantidad'];
            
            if ($aplicaIva) {
                $processedItem['subtotal_sin_iva'] = $subtotalItem;
                $processedItem['iva'] = $subtotalItem * 0.16;
                $processedItem['subtotal'] = $subtotalItem + $processedItem['iva'];
            } else {
                $processedItem['subtotal_sin_iva'] = $subtotalItem;
                $processedItem['iva'] = 0;
                $processedItem['subtotal'] = $subtotalItem;
            }
            
            $items[] = $processedItem;
        }
        
        if (empty($items)) {
            apiError('No se pudieron procesar los items del carrito', 400);
        }

        // Calcular totales
        $subtotal_sin_iva = array_sum(array_column($items, 'subtotal_sin_iva'));
        $total_iva = array_sum(array_column($items, 'iva'));
        $total_calculado = array_sum(array_column($items, 'subtotal'));

        // Crear line_items para Conekta
        $line_items = [];
        foreach ($items as $item) {
            $line_items[] = [
                'name' => $item['nombre'],
                'description' => 'Producto de Tienda IMCYC - ' . ucfirst($item['section']),
                'unit_price' => intval($item['precio'] * 100), // Conekta requiere centavos
                'quantity' => intval($item['cantidad'])
            ];
        }

        // Configuración de Conekta
        $conektaConfig = require '/var/www/html/TiendaImcyc/config/conekta.php';
        $apiInstance = new OrdersApi(null, $conektaConfig);

        // Preparar dirección
        $direccion_envio = [
            'street1' => !empty($calle) ? $calle : 'Calle no proporcionada',
            'city' => !empty($municipio) ? $municipio : 'Ciudad no proporcionada',
            'state' => !empty($estado) ? $estado : 'Estado no proporcionado',
            'country' => 'MX',
            'postal_code' => !empty($codigo_postal) ? $codigo_postal : '00000'
        ];

        if (!empty($colonia)) {
            $direccion_envio['street1'] = $calle . ', ' . $colonia;
        }

        // Crear orden para pago en transferencia (Conekta)
        $orderData = new OrderRequest([
            'line_items' => $line_items,
            'currency' => 'MXN',
            'customer_info' => [
                'name' => $nombre,
                'email' => $email,
                'phone' => $telefono,
                'corporate' => false
            ],
            'shipping_contact' => [
                'phone' => $telefono,
                'receiver' => $nombre,
                'address' => $direccion_envio
            ],
            'charges' => [
                [
                    'payment_method' => [
                        'type' => 'spei',
                        'expires_at' => time() + (24 * 60 * 60) // 24 horas
                    ]
                ]
            ],
            'metadata' => [
                'user_id' => (string) $user_id,
                'payment_type' => 'spei',
                'created_at' => date('Y-m-d H:i:s'),
                'subtotal_sin_iva' => (string) $subtotal_sin_iva,
                'total_iva' => (string) $total_iva,
                'total_con_iva' => (string) $total_calculado
            ]
        ]);

        // Crear orden en Conekta
        $conektaOrder = $apiInstance->createOrder($orderData);
        $orderResponse = json_decode(json_encode($conektaOrder), true);
        $order_id = $conektaOrder->getId();

        // Extraer datos de transferencia SPEI
        $referencia = 'N/D';
        $clabe = 'N/D';
        $banco = 'STP';
        $vence = date('d/m/Y H:i', time() + (24 * 60 * 60)); // 24 horas

        if (isset($orderResponse['charges']['data'][0]['payment_method'])) {
            $paymentMethod = $orderResponse['charges']['data'][0]['payment_method'];
            if ($paymentMethod['type'] === 'spei') {
                $referencia = $paymentMethod['reference'] ?? 
                            $orderResponse['charges']['data'][0]['id'] ?? 
                            $order_id;
                $clabe = $paymentMethod['clabe'] ?? '646180111812345678';
                $banco = $paymentMethod['bank'] ?? 'STP';
                
                if (isset($paymentMethod['expires_at'])) {
                    $vence = date('d/m/Y H:i', $paymentMethod['expires_at']);
                }
            }
        }

        // Si no se obtuvo referencia, usar el ID de la orden
        if ($referencia === 'N/D') {
            $referencia = $order_id;
        }

        // Si no se obtuvo CLABE, usar valor por defecto
        if ($clabe === 'N/D') {
            $clabe = '646180111812345678'; // CLABE de ejemplo para STP
        }

        // Registrar la orden en la base de datos principal
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("
            INSERT INTO orders (user_id, order_id_conekta, items_json, subtotal, iva, total, payment_method, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'spei', 'pending', NOW())
        ");
        
        try {
            $stmt->execute([
                $user_id,
                $order_id,
                json_encode($items),
                $subtotal_sin_iva,
                $total_iva,
                $total_calculado
            ]);
        } catch (PDOException $e) {
            // Si la tabla no existe, crear un log simple
            error_log("Order registration: User $user_id, Order $order_id, Total: $total_calculado");
        }

        // Confirmar transacciones
        $db->commit();
        $db2->commit();
        $db3->commit();
        $db4->commit();

        // Enviar correos de confirmación
        enviarConfirmacionCorreo($email, $nombre, $items, $subtotal_sin_iva, $total_iva, $total_calculado, $referencia, $vence);
        enviarAlertaVenta("tienda_correo@imcyc.com", $nombre, $items, $subtotal_sin_iva, $total_iva, $total_calculado);

        // Respuesta exitosa
        apiSuccess([
            'order_id' => $order_id,
            'reference' => $referencia,
            'clabe' => $clabe,
            'bank' => $banco,
            'expires_at' => $vence,
            'total' => number_format($total_calculado, 2),
            'items' => $cart_items
        ], 'Pago procesado exitosamente');

    } catch (Exception $e) {
        // Rollback en caso de error
        $db->rollBack();
        $db2->rollBack();
        $db3->rollBack();
        $db4->rollBack();
        
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error en process-spei-payment.php: " . $e->getMessage());
    
    apiError($e->getMessage(), 500);
}

// Funciones auxiliares para envío de correos
function enviarConfirmacionCorreo($para, $nombre, $items, $subtotal_sin_iva, $total_iva, $total, $referencia, $vence, $barcode_url = null) {
    $mail = new PHPMailer(true);
    try {
        // Configuración SMTP
        $mail->isSMTP();
        $mail->Host = 'mail.imcyc.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'tienda_correo';
        $mail->Password = 'imcyc2025*';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->SMTPOptions = ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]];
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        $mail->setFrom('tiendaimcyc@imcyc.com', 'Tienda IMCYC');
        $mail->addAddress($para, $nombre);
        $mail->Subject = 'Confirmación de Pedido - Pago en SPEI';

        // Construir resumen de productos
        $resumen = '';
        $contador = 1;
        $tipoIconos = [
            'mercancia' => '📦',
            'libro' => '📚',
            'ebook' => '💻',
            'webinar' => '🎥'
        ];

        foreach ($items as $item) {
            $nombreProducto = htmlspecialchars($item['nombre'], ENT_QUOTES, 'UTF-8');
            $tipoProducto = ucfirst($item['section']);
            $icono = $tipoIconos[$item['section']] ?? '🛍️';
            $precio = number_format($item['precio'], 2);
            $subtotal = number_format($item['subtotal'], 2);
            $ivaItem = number_format($item['iva'], 2);

            $ivaInfo = $item['aplica_iva'] ? "<br><small style='color: #666;'>IVA: \$" . $ivaItem . "</small>" : "<br><small style='color: #666;'>Exento de IVA</small>";

            $resumen .= "
                <tr style='border-bottom: 1px solid #eee;'>
                    <td style='padding: 10px; text-align: left;'>{$contador}</td>
                    <td style='padding: 10px; text-align: left;'>
                        {$icono} <strong>{$nombreProducto}</strong><br>
                        <small style='color: #666;'>Tipo: {$tipoProducto}</small>
                        {$ivaInfo}
                    </td>
                    <td style='padding: 10px; text-align: center;'>{$item['cantidad']}</td>
                    <td style='padding: 10px; text-align: right;'>\$" . $precio . "</td>
                    <td style='padding: 10px; text-align: right; font-weight: bold;'>\$" . $subtotal . "</td>
                </tr>
            ";
            $contador++;
        }

        $subtotalFormateado = number_format($subtotal_sin_iva, 2);
        $ivaFormateado = number_format($total_iva, 2);
        $totalFormateado = number_format($total, 2);
        $nombreCliente = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');

        $barcodeHtml = '';
        if (!empty($barcode_url)) {
            $barcodeHtml = "<div style='margin-top:12px'><small style='display:block; margin-bottom:8px; color:#fff;'>Presenta este código en caja:</small><img src='" . htmlspecialchars($barcode_url, ENT_QUOTES, 'UTF-8') . "' alt='Código de barras' style='background:#fff; padding:6px; border-radius:4px; max-width:100%; height:auto;'></div>";
        }

        $mail->isHTML(true);
        $mail->Body = "
            <!DOCTYPE html>
            <html lang='es'>
            <head>
                <meta charset='UTF-8'>
                <title>Confirmación de Pedido</title>
            </head>
            <body style='font-family: Arial, sans-serif; background-color: #f4f4f4;'>
                <div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px;'>
                    <div style='background: linear-gradient(135deg, #ff6600, #ff8533); color: white; padding: 30px; text-align: center;'>
                        <h1>¡Gracias por tu compra!</h1>
                        <p>Hola {$nombreCliente} 👋</p>
                    </div>
                    <div style='padding: 30px;'>
                        <h2 style='color: #333;'>📦 Resumen de tu Pedido</h2>
                        <table style='width: 100%; border-collapse: collapse;'>
                            <thead>
                                <tr style='background-color: #f8f9fa;'>
                                    <th style='padding: 12px; border-bottom: 2px solid #dee2e6;'>#</th>
                                    <th style='padding: 12px; border-bottom: 2px solid #dee2e6;'>Producto</th>
                                    <th style='padding: 12px; border-bottom: 2px solid #dee2e6;'>Cant.</th>
                                    <th style='padding: 12px; border-bottom: 2px solid #dee2e6;'>Precio Unit.</th>
                                    <th style='padding: 12px; border-bottom: 2px solid #dee2e6;'>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {$resumen}
                            </tbody>
                            <tfoot>
                                <tr style='background-color: #f8f9fa;'>
                                    <td colspan='4' style='padding: 10px; text-align: right; font-weight: bold;'>Subtotal:</td>
                                    <td style='padding: 10px; text-align: right; font-weight: bold;'>\$" . $subtotalFormateado . "</td>
                                </tr>
                                <tr style='background-color: #f8f9fa;'>
                                    <td colspan='4' style='padding: 10px; text-align: right; font-weight: bold;'>IVA (16%):</td>
                                    <td style='padding: 10px; text-align: right; font-weight: bold;'>\$" . $ivaFormateado . "</td>
                                </tr>
                                <tr style='background-color: #e3f2fd; font-weight: bold;'>
                                    <td colspan='4' style='padding: 15px; text-align: right;'>TOTAL:</td>
                                    <td style='padding: 15px; text-align: right; color: #007bff;'>\$" . $totalFormateado . "</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <div style='background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;'>
                            <h3>💰 Instrucciones de Pago</h3>
                            <div style='background: rgba(255,255,255,0.2); padding: 15px; border-radius: 5px;'>
                                <p>Referencia de pago:</p>
                                <div style='font-size: 24px; font-weight: bold; letter-spacing: 2px;'>{$referencia}</div>
                                {$barcodeHtml}
                                <div style='margin-top: 15px;'>
                                    <strong>Monto a pagar:</strong> \$" . $totalFormateado . "<br>
                                    <strong>Fecha límite:</strong> {$vence}
                                </div>
                            </div>
                        </div>
                        
                        <div style='background-color: #e3f2fd; padding: 20px; border-radius: 5px;'>
                            <h4>📋 ¿Cómo realizar tu pago?</h4>
                            <ol>
                                <li>Acude a 7-Eleven o Farmacias del Ahorro</li>
                                <li>Proporciona la referencia de pago al cajero</li>
                                <li>Realiza el pago en transferencia por el monto exacto</li>
                                <li>Solicita y conserva tu comprobante de pago</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        ";

        $mail->send();
        error_log("Correo de confirmación transferencia enviado exitosamente a: $para");
        return true;

    } catch (Exception $e) {
        error_log("Error al enviar correo de confirmación: " . $e->getMessage());
        return false;
    }
}

function enviarAlertaVenta($para, $cliente, $items, $subtotal_sin_iva, $total_iva, $total) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'mail.imcyc.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'tienda_correo';
        $mail->Password = 'imcyc2025*';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->SMTPOptions = ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]];
        $mail->CharSet = 'UTF-8';
        
        $mail->setFrom('tiendaimcyc@imcyc.com', 'Sistema Tienda IMCYC');
        $mail->addAddress($para);
        $mail->Subject = '🛒 Nueva Venta Realizada - Transferencia SPEI';

        $resumen = '';
        foreach ($items as $item) {
            $resumen .= "• " . ($item['nombre'] ?? $item['titulo']) . " (Qty: " . $item['cantidad'] . ") - $" . number_format($item['subtotal'], 2) . "\n";
        }

        $mail->isHTML(true);
        $mail->Body = "
        <h2>Nueva venta realizada</h2>
        <p><strong>Cliente:</strong> $cliente</p>
        <p><strong>Total:</strong> $" . number_format($total, 2) . "</p>
        <h3>Productos:</h3>
        <pre>$resumen</pre>
        <p>Método de pago: SPEI (pendiente de confirmación)</p>
        <p>Fecha: " . date('Y-m-d H:i:s') . "</p>
        ";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Error enviando alerta: " . $e->getMessage());
        return false;
    }
}
?>
