import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Skeleton
} from '@mui/material';
import { ShoppingCart, Visibility } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Componente para manejar imágenes de producto con fallback
const ProductImage = ({ src, alt, height = 250 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (error || !src) {
    return (
      <Box 
        sx={{ 
          height: height,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'grey.500'
        }}
      >
        <Visibility sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="caption">Sin imagen</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: height }}>
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            zIndex: 1
          }}
        >
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
      )}
      <CardMedia
        component="img"
        image={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        sx={{
          height: height,
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </Box>
  );
};

const ProductsPage = () => {
  const location = useLocation();
  const initialSection = location.state?.initialSection || 'mercancia';
  const { isAuthenticated } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sections = [
    { value: 'mercancia', label: 'Mercancía' },
    { value: 'libros', label: 'Libros' },
    { value: 'ebooks', label: 'E-books' }
  ];

  useEffect(() => {
    loadProducts();
  }, [currentSection]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await productService.getProducts(currentSection);
      
      if (response.success) {
        setProducts(response.products);
      } else {
        setError(response.error || 'Error al cargar productos');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (event, newValue) => {
    setCurrentSection(newValue);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    if (!product.stock || product.stock === 0) {
      alert('Producto sin stock disponible');
      return;
    }

    try {
      const result = await addToCart(product.id, currentSection, 1);
      alert(`${result.productName} agregado al carrito exitosamente`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
          Catálogo de Productos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explora nuestra amplia selección de productos especializados
        </Typography>
      </Box>
      
      {/* Tabs para secciones */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={currentSection} onChange={handleSectionChange} centered>
          {sections.map((section) => (
            <Tab key={section.value} value={section.value} label={section.label} />
          ))}
        </Tabs>
      </Box>
      
      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', // 1 columna en móvil
                sm: '1fr 1fr', // 2 columnas en tablet
                md: '1fr 1fr 1fr', // 3 columnas en desktop
                lg: '1fr 1fr 1fr 1fr' // 4 columnas en pantallas grandes
              },
              gap: 3,
              gridAutoRows: '500px', // ALTURA FIJA ABSOLUTA
            }}
          >
            {products.map((product, index) => (
              <Card 
                key={product.id}
                sx={{ 
                  width: '100%',
                  height: '100%', // Toma toda la altura del grid
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  }
                }}
              >
                  {/* Imagen del producto */}
                  <Box sx={{ height: '180px', overflow: 'hidden' }}>
                    <ProductImage 
                      src={product.imagen}
                      alt={product.nombre}
                      height={180}
                    />
                  </Box>
                  
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 1.5, 
                    display: 'flex',
                    flexDirection: 'column',
                    height: '250px', // Altura fija para el contenido
                    maxHeight: '250px',
                    minHeight: '250px',
                    overflow: 'hidden'
                  }}>
                    {/* Sección superior: categoría y nombre */}
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        label={product.categoria || 'Sin categoría'}
                        size="small"
                        sx={{ 
                          mb: 1,
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontSize: '0.7rem',
                          textTransform: 'capitalize'
                        }}
                      />
                      
                      {/* Nombre del producto - altura fija */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'text.primary',
                          lineHeight: 1.1,
                          height: '2.2em', // Altura fija exacta más pequeña
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.9rem',
                          mb: 0.5
                        }}
                      >
                        {product.nombre}
                      </Typography>
                    </Box>
                    
                    {/* Sección media: autor y descripción */}
                    <Box sx={{ height: '6em', mb: 0.5, overflow: 'hidden' }}>
                      {product.autor && (
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary" 
                          sx={{ 
                            fontStyle: 'italic', 
                            mb: 0.3, 
                            fontSize: '0.7rem',
                            height: '1em',
                            overflow: 'hidden'
                          }}
                        >
                          Por: {product.autor}
                        </Typography>
                      )}
                      
                      {/* Descripción - altura fija */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          height: product.autor ? '4.5em' : '5.5em', // Ajustar según si hay autor
                          display: '-webkit-box',
                          WebkitLineClamp: product.autor ? 4 : 5,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.7rem',
                          lineHeight: 1.1
                        }}
                      >
                        {product.descripcion && product.descripcion.trim() ? product.descripcion : 'Sin descripción disponible'}
                      </Typography>
                    </Box>
                    
                    {/* Sección inferior: stock y precio */}
                    <Box sx={{ height: '4em', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Stock: {product.stock || 0}
                        </Typography>
                        <Chip 
                          label={product.stock > 10 ? 'Disponible' : product.stock > 0 ? 'Pocos' : 'Agotado'}
                          size="small"
                          color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: '18px' }}
                        />
                      </Box>
                      
                      {/* Precio */}
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'secondary.main',
                          textAlign: 'center',
                          fontSize: '1.1rem'
                        }}
                      >
                        ${parseFloat(product.precio).toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ 
                    p: 1, 
                    pt: 0.5, 
                    height: '70px', 
                    maxHeight: '70px',
                    minHeight: '70px',
                    display: 'flex', 
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      startIcon={<ShoppingCart />}
                      disabled={!product.stock || product.stock === 0 || cartLoading}
                      onClick={() => handleAddToCart(product)}
                      sx={{
                        background: product.stock > 0 
                          ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' 
                          : 'grey.400',
                        fontWeight: 'bold',
                        py: 0.8,
                        fontSize: '0.75rem',
                        '&:hover': {
                          background: product.stock > 0 
                            ? 'linear-gradient(45deg, #5a6fd8 30%, #6a42a0 90%)' 
                            : 'grey.400'
                        }
                      }}
                    >
                      {cartLoading ? 'Agregando...' : (product.stock > 0 ? 'Agregar al Carrito' : 'Agotado')}
                    </Button>
                  </CardActions>
                </Card>
            ))}
          </Box>
          
          {products.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron productos en esta sección
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductsPage;