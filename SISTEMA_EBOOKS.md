# Sistema de Ebooks - Documentación

## Descripción General
Se ha implementado un sistema completo de gestión de ebooks digitales que incluye:
- Verificación de posesión de ebooks por usuario
- Descarga segura de archivos PDF
- Protección contra acceso no autorizado
- Interfaz de usuario mejorada

## Componentes Implementados

### 1. Endpoints Backend (PHP)

#### `/api/check-owned-ebooks.php`
- **Método**: POST
- **Función**: Verifica qué ebooks posee un usuario específico
- **Autenticación**: Requerida
- **Parámetros**: 
  - `ebook_ids` (opcional): Array de IDs específicos a verificar
- **Respuesta**: Lista de IDs de ebooks poseídos

#### `/api/download-ebook.php`
- **Método**: GET
- **Función**: Descarga segura de archivos PDF de ebooks
- **Autenticación**: Requerida
- **Parámetros**: 
  - `id`: ID del ebook a descargar
- **Validaciones**:
  - Usuario autenticado
  - Usuario posee el ebook
  - Archivo PDF existe
- **Respuesta**: Archivo PDF o error JSON

#### `/api/ebooks/get-user-ebooks.php`
- **Método**: GET
- **Función**: Obtiene todos los ebooks que posee un usuario
- **Autenticación**: Requerida
- **Respuesta**: Lista completa de ebooks con metadatos

### 2. Seguridad Implementada

#### Directorio Protegido
- Ubicación: `/api/ebooks/`
- Archivo `.htaccess` que bloquea acceso directo
- Solo accesible mediante scripts PHP autorizados

#### Validaciones de Acceso
- Verificación de autenticación JWT
- Validación de posesión de ebook
- Verificación de existencia de archivo

### 3. Frontend (React)

#### Servicio Actualizado (`ebookService.js`)
- `checkOwnedEbooks()`: Verifica ebooks poseídos
- `downloadEbook()`: Descarga archivo PDF
- `downloadAndSaveEbook()`: Descarga y guarda automáticamente

#### Página Mi Biblioteca (`MiBibliotecaPage.js`)
- Botón "Leer" para visualizar en navegador
- Botón "Descargar" para obtener archivo PDF
- Interfaz mejorada con iconos y gradientes

#### Página Productos (`ProductsPage.js`)
- Verificación automática de ebooks poseídos
- Botón "Ya poseído" para ebooks adquiridos
- Prevención de compras duplicadas

## Flujo de Funcionamiento

### 1. Compra de Ebook
1. Usuario navega a catálogo de ebooks
2. Sistema verifica ebooks ya poseídos
3. Muestra botón "Comprar" o "Ya poseído" según corresponda
4. Usuario completa compra si no posee el ebook
5. Ebook se añade a pedidos con status "aprobado/paid"

### 2. Acceso a Biblioteca
1. Usuario va a "Mi Biblioteca"
2. Sistema consulta pedidos aprobados del usuario
3. Extrae ebooks de items JSON en pedidos
4. Muestra ebooks con opciones de lectura y descarga

### 3. Descarga Segura
1. Usuario hace clic en "Descargar"
2. Frontend llama a `/api/download-ebook.php`
3. Backend verifica autenticación y posesión
4. Envía archivo PDF si está autorizado
5. Frontend procesa y guarda archivo localmente

## Estructura de Datos

### Pedidos (tabla `pedidos`)
```sql
- id: INT
- user_id: INT
- items: JSON -- Contiene array de productos
- status: VARCHAR -- 'aprobado', 'paid', 'completed'
- fecha: DATETIME
```

### Items JSON Structure
```json
{
  "product_id": 123,
  "section": "ebooks",
  "nombre": "Nombre del Ebook",
  "precio": 29.99,
  "cantidad": 1
}
```

### Ebooks (tabla `ebooks`)
```sql
- id: INT
- titulo: VARCHAR
- autor: VARCHAR
- descripcion: TEXT
- precio: DECIMAL
- imagen: VARCHAR
- pdf_filename: VARCHAR
- fecha_publicacion: DATE
```

## Archivos y Ubicaciones

### Backend
- `/api/check-owned-ebooks.php` - Verificación de posesión
- `/api/download-ebook.php` - Descarga segura
- `/api/ebooks/get-user-ebooks.php` - Lista de ebooks del usuario
- `/api/ebooks/.htaccess` - Protección del directorio
- `/api/ebooks/ejemplo.pdf` - Archivo PDF de prueba

### Frontend
- `/src/services/ebookService.js` - Servicio de ebooks
- `/src/pages/MiBibliotecaPage.js` - Página de biblioteca
- `/src/pages/ProductsPage.js` - Catálogo con verificación

## Características de Seguridad

1. **Autenticación**: Todos los endpoints requieren JWT válido
2. **Autorización**: Verificación de posesión antes de descarga
3. **Protección de archivos**: `.htaccess` bloquea acceso directo
4. **Validación de archivos**: Verificación de existencia antes de envío
5. **Logging**: Registro opcional de descargas (tabla `ebook_downloads`)

## Pruebas y Verificación

El sistema ha sido probado con:
- Acceso no autorizado (correctamente bloqueado)
- Verificación de archivos existentes
- Respuestas JSON apropiadas para errores
- Funcionalidad de descarga protegida

## Próximos Pasos

1. **Añadir ebooks a la base de datos** con `pdf_filename` válidos
2. **Configurar pedidos de prueba** con status "aprobado"
3. **Probar flujo completo** con usuario autenticado
4. **Implementar tabla de logs** para seguimiento de descargas
5. **Añadir watermarks** o protección adicional a PDFs

## Notas Técnicas

- El sistema es compatible con la estructura existente de pedidos
- No requiere cambios en la base de datos actual
- Utiliza el sistema de autenticación JWT existente
- Es extensible para otros tipos de contenido digital