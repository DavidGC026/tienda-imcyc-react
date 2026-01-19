# 📚 Tienda IMCYC React

Sistema de tienda online para el Instituto Mexicano del Cemento y del Concreto (IMCYC) desarrollado en React.js con funcionalidades avanzadas de comercio electrónico y biblioteca digital.

## 🚀 Características Principales

### 📖 Biblioteca Digital (Mi Biblioteca)
- **Visor PDF Avanzado**: Implementado con `react-pageflip` para efecto de volteo de páginas realista
- **Renderizado Dinámico**: Conversión de páginas PDF a imágenes usando `pdfjs-dist`
- **Controles Completos**: Navegación, zoom (50%-200%), pantalla completa
- **Interfaz Intuitiva**: Grid responsive 4x4 con portadas profesionales
- **Progreso de Lectura**: Barra deslizante para navegación rápida

### 🛒 Comercio Electrónico
- **Catálogo de Productos**: Libros físicos y ebooks técnicos
- **Carrito de Compras**: Sistema completo de gestión
- **Checkout**: Proceso de pago integrado
- **Autenticación**: Sistema JWT con contexto React

### 🎨 Diseño y UX
- **Material-UI**: Componentes modernos y responsivos
- **Temas Personalizados**: Branding IMCYC con gradientes profesionales
- **Responsive**: Optimizado para móviles, tablets y desktop
- **Loading States**: Indicadores de progreso elegantes

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Librería principal
- **Material-UI (MUI)** - Componentes de interfaz
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **react-pageflip** - Efecto de volteo de páginas
- **pdfjs-dist** - Renderizado de PDFs

### Backend APIs
- **PHP** - APIs RESTful
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Apache** - Servidor web

## 📁 Estructura del Proyecto

```
/src
├── components/
│   ├── layout/           # Layout principal y navegación
│   └── PDFFlipViewer.js  # Visor avanzado de PDFs
├── pages/
│   ├── MiBibliotecaPage.js  # Biblioteca digital
│   ├── ProductsPage.js      # Catálogo de productos  
│   └── CheckoutPage.js      # Proceso de compra
├── services/
│   ├── authService.js    # Gestión de autenticación
│   └── ebookService.js   # APIs de ebooks
├── contexts/
│   └── AuthContext.js    # Contexto de autenticación
└── api/                  # APIs PHP del backend
    ├── auth/            # Autenticación
    ├── ebooks/          # Gestión de ebooks
    └── products/        # Gestión de productos
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- PHP 8.0+
- MySQL 8.0+
- Apache 2.4+

### Configuración

1. **Clonar el repositorio**
```bash
git clone https://github.com/DavidGC026/tienda-imcyc-react.git
cd tienda-imcyc-react
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
- Importar esquema de base de datos
- Configurar credenciales en `api/config.php`

4. **Desarrollo**
```bash
npm start  # Servidor de desarrollo en puerto 3000
```

5. **Producción**
```bash
npm run build  # Build optimizado
# Copiar archivos build/ y api/ al servidor
```

## 📊 Datos del Sistema

- **📚 19 Ebooks**: Biblioteca digital completa
- **📖 59 Libros**: Catálogo físico profesional
- **🖼️ 140 Imágenes**: Portadas de alta calidad (3MB promedio)
- **✅ 100% Cobertura**: Todas las imágenes verificadas y funcionales

## 🌟 Funcionalidades Destacadas

### Visor PDF con react-pageflip
```jsx
// Efecto de volteo realista
<HTMLFlipBook
  width={400}
  height={600}
  showCover={false}
  flippingTime={1000}
>
  {/* Páginas renderizadas dinámicamente */}
</HTMLFlipBook>
```

### Sistema de Zoom Inteligente
- **50-100%**: `objectFit: 'contain'` para vista completa
- **100-200%**: Escalado fijo con scroll interno para detalles
- **Reset rápido**: Click en porcentaje para volver a 100%

### Renderizado PDF Optimizado
```javascript
// Conversión PDF → Canvas → DataURL
const viewport = page.getViewport({ scale: 2 });
const canvas = document.createElement('canvas');
page.render({ canvasContext: context, viewport }).promise;
return canvas.toDataURL('image/png');
```

## 🔧 APIs Backend

### Autenticación
- `POST /api/auth/login.php` - Inicio de sesión
- `POST /api/auth/register.php` - Registro
- `POST /api/auth/verify.php` - Verificación de token

### Ebooks
- `GET /api/ebooks/get-user-ebooks.php` - Obtener biblioteca del usuario
- `GET /api/ebooks/pdf-viewer.php?id=N` - Servir PDF seguro

### Productos
- `GET /api/products/list.php` - Catálogo completo
- `POST /api/cart/add.php` - Agregar al carrito

## 📱 Responsive Design

- **Desktop**: Grid 4x4 de ebooks/libros
- **Tablet**: Grid 3x3 adaptativo
- **Móvil**: Grid 2x2 o columna única
- **Controles táctiles**: Optimizados para touch

## 🎨 Theming

Colores del branding IMCYC:
```css
/* Gradientes principales */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Estados de carga */
--primary-blue: #667eea;
--secondary-purple: #764ba2;
--success-green: #4caf50;
```

## 🚦 Estado del Proyecto

- ✅ **Frontend**: Completo y funcional
- ✅ **Backend APIs**: Implementadas y seguras
- ✅ **Base de datos**: Optimizada y poblada
- ✅ **Imágenes**: 100% verificadas y operativas
- ✅ **Visor PDF**: StPageFlip implementado
- ✅ **Responsive**: Multi-dispositivo

## 👨‍💻 Desarrollador

**David Guzmán Cordero**
- GitHub: [@DavidGC026](https://github.com/DavidGC026)
- Email: davidguzmanc026@gmail.com

## 📄 Licencia

Proyecto propietario para IMCYC - Instituto Mexicano del Cemento y del Concreto

---

*Desarrollado con ❤️ para IMCYC*
## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
