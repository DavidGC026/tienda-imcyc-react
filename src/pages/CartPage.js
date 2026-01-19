import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider
} from '@mui/material';
import {
  ShoppingCart,
  RemoveShoppingCart,
  ShoppingBag,
  ArrowBack,
  Add,
  Remove,
  Delete
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const {
    cartItems,
    totalPrice,
    loading,
    removeFromCart,
    clearCart,
    addToCart,
    refreshCart
  } = useCart();

  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
  };

  const handleRemoveItem = async (itemId, section) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      const result = await removeFromCart(itemId, section);
      showAlert(result.message || 'Producto eliminado del carrito', 'success');
    } catch (error) {
      showAlert(error.message || 'Error al eliminar producto', 'error');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await addToCart(item.product_id, item.section, newQuantity - item.quantity);
      showAlert('Cantidad actualizada', 'success');
    } catch (error) {
      showAlert(error.message || 'Error al actualizar cantidad', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      const result = await clearCart();
      showAlert(result.message || 'Carrito limpiado', 'success');
      setClearDialogOpen(false);
    } catch (error) {
      showAlert(error.message || 'Error al limpiar carrito', 'error');
    }
  };

  const getSectionName = (section) => {
    const sections = {
      'mercancia': 'Mercancía',
      'libros': 'Libros',
      'ebooks': 'E-books',
      'webinars': 'Webinars'
    };
    return sections[section] || section;
  };

  const getSectionColor = (section) => {
    const colors = {
      'mercancia': '#f093fb',
      'libros': '#667eea',
      'ebooks': '#4facfe',
      'webinars': '#43e97b'
    };
    return colors[section] || '#667eea';
  };

  if (loading && (!cartItems || cartItems.length === 0)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando carrito...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <ShoppingCart sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '2rem' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          Mi Carrito de Compras
        </Typography>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Content */}
      {!cartItems || cartItems.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: theme.palette.background.paper,
            borderRadius: '20px'
          }}
        >
          <RemoveShoppingCart 
            sx={{ fontSize: '4rem', color: theme.palette.text.disabled, mb: 2 }} 
          />
          <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.secondary }}>
            Tu carrito está vacío
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Explora nuestros productos y agrega algunos a tu carrito.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/products')}
            sx={{
              mt: 2,
              backgroundColor: theme.palette.primary.main,
              borderRadius: '20px',
              padding: '0.8rem 2rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${theme.palette.primary.main}40`
              }
            }}
          >
            Ver Productos
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Items del carrito */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
              <Box sx={{ p: 3, backgroundColor: `${theme.palette.primary.main}08` }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Productos ({cartItems.length})
                </Typography>
              </Box>
              
              <Box sx={{ p: 2 }}>
                {cartItems.map((item, index) => (
                  <Card
                    key={`${item.section}-${item.product_id}`}
                    elevation={1}
                    sx={{
                      mb: 2,
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2} alignItems="center">
                        {/* Información del producto */}
                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Chip
                              label={getSectionName(item.section)}
                              size="small"
                              sx={{
                                background: getSectionColor(item.section),
                                color: 'white',
                                fontWeight: 600,
                                mr: 1
                              }}
                            />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ${parseFloat(item.price).toFixed(2)}
                          </Typography>
                        </Grid>

                        {/* Controles de cantidad */}
                        <Grid item xs={12} md={3}>
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <IconButton
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              size="small"
                            >
                              <Remove />
                            </IconButton>
                            <Typography variant="h6" sx={{ mx: 2, minWidth: '2rem', textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              size="small"
                            >
                              <Add />
                            </IconButton>
                          </Box>
                        </Grid>

                        {/* Subtotal y eliminar */}
                        <Grid item xs={12} md={3}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </Typography>
                            <IconButton
                              onClick={() => handleRemoveItem(item.id, item.section)}
                              disabled={removingItems.has(item.id)}
                              sx={{ color: theme.palette.error.main }}
                            >
                              {removingItems.has(item.id) ? (
                                <CircularProgress size={20} />
                              ) : (
                                <Delete />
                              )}
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Resumen del pedido */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: '20px',
                position: 'sticky',
                top: 100
              }}
            >
              <Box sx={{ p: 3, backgroundColor: `${theme.palette.primary.main}08` }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Resumen del Pedido
                </Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="600">
                    ${totalPrice.toFixed(2)}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight="700">
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="primary">
                    ${totalPrice.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    mb: 2,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '12px',
                    padding: '1rem',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${theme.palette.primary.main}66`
                    }
                  }}
                  onClick={() => navigate('/checkout')}
                >
                  Proceder al Pago
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setClearDialogOpen(true)}
                  sx={{
                    borderRadius: '12px',
                    padding: '0.8rem',
                    fontWeight: 600,
                    color: theme.palette.error.main,
                    borderColor: theme.palette.error.main,
                    '&:hover': {
                      borderColor: theme.palette.error.dark,
                      backgroundColor: `${theme.palette.error.main}08`
                    }
                  }}
                >
                  Vaciar Carrito
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Dialog de confirmación para limpiar carrito */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas vaciar todo el carrito? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleClearCart} color="error" variant="contained">
            Vaciar Carrito
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage;