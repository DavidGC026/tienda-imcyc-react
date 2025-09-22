<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Método no permitido', 405);
}

$section = $_GET['section'] ?? 'mercancia';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$search = $_GET['search'] ?? '';

// Validar sección
$allowedSections = ['mercancia', 'libros', 'ebooks', 'webinars'];
if (!in_array($section, $allowedSections)) {
    apiError('Sección no válida');
}

try {
    $pdo = getDBConnection();
    
    $products = [];
    $totalCount = 0;
    
    switch ($section) {
        case 'mercancia':
            // Obtener productos de mercancía
            $whereClause = $search ? "WHERE (name LIKE ? OR description LIKE ?)" : "";
            $searchParam = $search ? "%$search%" : null;
            
            $countSql = "SELECT COUNT(*) FROM products $whereClause";
            $sql = "SELECT product_id as id, name as nombre, description as descripcion, price as precio, image as imagen, category as categoria, stock 
                   FROM products $whereClause 
                   ORDER BY name ASC 
                   LIMIT ? OFFSET ?";
            
            if ($search) {
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute([$searchParam, $searchParam]);
                $totalCount = $countStmt->fetchColumn();
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(2, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(3, $limit, PDO::PARAM_INT);
                $stmt->bindParam(4, $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute();
                $totalCount = $countStmt->fetchColumn();
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $limit, PDO::PARAM_INT);
                $stmt->bindParam(2, $offset, PDO::PARAM_INT);
                $stmt->execute();
            }
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        case 'libros':
            $whereClause = $search ? "WHERE (nombre LIKE ? OR descripcion LIKE ?)" : "";
            $searchParam = $search ? "%$search%" : null;
            
            $countSql = "SELECT COUNT(*) FROM libros $whereClause";
            $sql = "SELECT libro_id as id, nombre, descripcion, precio, image_url as imagen, categoria, stock 
                   FROM libros $whereClause 
                   ORDER BY nombre ASC 
                   LIMIT ? OFFSET ?";
            
            if ($search) {
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute([$searchParam, $searchParam]);
                $totalCount = $countStmt->fetchColumn();
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(2, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(3, $limit, PDO::PARAM_INT);
                $stmt->bindParam(4, $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute();
                $totalCount = $countStmt->fetchColumn();
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $limit, PDO::PARAM_INT);
                $stmt->bindParam(2, $offset, PDO::PARAM_INT);
                $stmt->execute();
            }
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        case 'ebooks':
            $whereClause = $search ? "WHERE (titulo LIKE ? OR autor LIKE ? OR descripcion LIKE ?)" : "";
            $searchParam = $search ? "%$search%" : null;
            
            $countSql = "SELECT COUNT(*) FROM ebooks $whereClause";
            $sql = "SELECT ebook_id as id, titulo as nombre, autor, descripcion, precio, imagen_url as imagen, categoria 
                   FROM ebooks $whereClause 
                   ORDER BY titulo ASC 
                   LIMIT ? OFFSET ?";
            
            if ($search) {
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute([$searchParam, $searchParam, $searchParam]);
                $totalCount = $countStmt->fetchColumn();
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(2, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(3, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(4, $limit, PDO::PARAM_INT);
                $stmt->bindParam(5, $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute();
                $totalCount = $countStmt->fetchColumn();
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $limit, PDO::PARAM_INT);
                $stmt->bindParam(2, $offset, PDO::PARAM_INT);
                $stmt->execute();
            }
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        case 'webinars':
            $whereClause = $search ? "WHERE (titulo LIKE ? OR descripcion LIKE ? OR categoria LIKE ?)" : "WHERE activo = 1";
            $searchParam = $search ? "%$search%" : null;
            
            if ($search) {
                $countSql = "SELECT COUNT(*) FROM webinars $whereClause";
                $sql = "SELECT webinar_id as id, titulo as nombre, descripcion, precio, categoria, fecha, duracion, imagen 
                       FROM webinars $whereClause 
                       ORDER BY fecha DESC 
                       LIMIT ? OFFSET ?";
                
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute([$searchParam, $searchParam, $searchParam]);
                $totalCount = $countStmt->fetchColumn();
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(2, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(3, $searchParam, PDO::PARAM_STR);
                $stmt->bindParam(4, $limit, PDO::PARAM_INT);
                $stmt->bindParam(5, $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $countSql = "SELECT COUNT(*) FROM webinars WHERE activo = 1";
                $sql = "SELECT webinar_id as id, titulo as nombre, descripcion, precio, categoria, fecha, duracion, imagen 
                       FROM webinars WHERE activo = 1 
                       ORDER BY fecha DESC 
                       LIMIT ? OFFSET ?";
                
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute();
                $totalCount = $countStmt->fetchColumn();
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $limit, PDO::PARAM_INT);
                $stmt->bindParam(2, $offset, PDO::PARAM_INT);
                $stmt->execute();
            }
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formatear fecha para webinars
            foreach ($products as &$product) {
                if (isset($product['fecha'])) {
                    $product['fecha_formateada'] = date('d/m/Y H:i', strtotime($product['fecha']));
                }
            }
            break;
    }
    
    // Formatear precios
    foreach ($products as &$product) {
        $product['precio'] = number_format((float)$product['precio'], 2, '.', '');
        $product['section'] = $section;
    }
    
    apiSuccess([
        'products' => $products,
        'section' => $section,
        'total' => $totalCount,
        'limit' => $limit,
        'offset' => $offset,
        'has_more' => ($offset + $limit) < $totalCount
    ]);
    
} catch (PDOException $e) {
    error_log("Products list error: " . $e->getMessage());
    apiError('Error interno del servidor', 500);
}
?>