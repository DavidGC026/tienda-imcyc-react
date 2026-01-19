import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  TablePagination,
  Collapse,
  Skeleton
} from '@mui/material';
import {
  ShoppingBag,
  Receipt,
  Schedule,
  CheckCircle,
  Cancel,
  LocalShipping,
  ExpandMore,
  ExpandLess,
  Visibility,
  MenuBook,
  AutoStories,
  VideoLibrary
} from '@mui/icons-material';
import ordersService from '../services/ordersService';

const MisPedidosPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [page, rowsPerPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await ordersService.getOrders(page + 1, rowsPerPage);
      setOrders(data.orders || []);
      setTotalOrders(data.pagination?.total_orders || 0);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (order) => {
    try {
      const orderDetails = await ordersService.getOrderDetails(order.id);
      setSelectedOrder(orderDetails);
      setDialogOpen(true);
    } catch (err) {
      console.error('Error loading order details:', err);
      setError('Error al cargar los detalles del pedido');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleExpandClick = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':
        return <Schedule />;
      case 'aprobado':
      case 'completado':
        return <CheckCircle />;
      case 'enviado':
        return <LocalShipping />;
      case 'cancelado':
      case 'rechazado':
        return <Cancel />;
      default:
        return <Receipt />;
    }
  };

  const getProductIcon = (tipo) => {
    switch (tipo) {
      case 'ebook':
        return <MenuBook sx={{ fontSize: 40 }} />;
      case 'libro':
        return <AutoStories sx={{ fontSize: 40 }} />;
      case 'webinar':
        return <VideoLibrary sx={{ fontSize: 40 }} />;
      default:
        return <ShoppingBag sx={{ fontSize: 40 }} />;
    }
  };

  const OrderSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Skeleton variant="rectangular" width={60} height={24} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Skeleton variant="text" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Skeleton variant="text" />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Skeleton variant="rectangular" width={80} height={36} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Mis Pedidos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulta el historial de tus compras y el estado de tus pedidos
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        // Skeleton loading state
        <>
          {[1, 2, 3].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </>
      ) : orders.length === 0 ? (
        // Empty state
        <Paper
          sx={{
            py: 8,
            textAlign: 'center',
            bgcolor: 'grey.50',
            borderRadius: 3
          }}
        >
          <ShoppingBag sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No tienes pedidos aún
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cuando realices tu primera compra, aparecerá aquí
          </Typography>
        </Paper>
      ) : (
        // Orders list
        <>
          {orders.map((order) => (
            <Card
              key={order.id}
              sx={{
                mb: 2,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  {/* Order Info */}
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      #{order.order_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ordersService.formatDate(order.fecha)}
                    </Typography>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12} sm={2}>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status_label}
                      sx={{
                        bgcolor: ordersService.getStatusColor(order.status),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>

                  {/* Items Count */}
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" color="text.secondary">
                      {order.total_items} {order.total_items === 1 ? 'artículo' : 'artículos'}
                    </Typography>
                  </Grid>

                  {/* Total */}
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {ordersService.formatPrice(order.total)}
                    </Typography>
                  </Grid>

                  {/* Actions */}
                  <Grid item xs={12} sm={2}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleExpandClick(order.id)}
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        {expandedOrder === order.id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleOrderClick(order)}
                        sx={{ minWidth: 'auto' }}
                      >
                        Ver
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                {/* Expanded Items Preview */}
                <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Artículos en este pedido:
                  </Typography>
                  <List dense>
                    {order.items.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            {getProductIcon(item.tipo)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.titulo}
                          secondary={`${item.autor} • Cantidad: ${item.cantidad} • ${ordersService.formatPrice(item.subtotal)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          <Paper sx={{ mt: 3 }}>
            <TablePagination
              component="div"
              count={totalOrders}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Pedidos por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </Paper>
        </>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              Detalles del Pedido #{selectedOrder?.order_id}
            </Typography>
            <Chip
              icon={getStatusIcon(selectedOrder?.status)}
              label={selectedOrder?.status_label}
              sx={{
                bgcolor: ordersService.getStatusColor(selectedOrder?.status),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha del pedido:
                  </Typography>
                  <Typography variant="body1">
                    {ordersService.formatDate(selectedOrder.fecha)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total:
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {ordersService.formatPrice(selectedOrder.total)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom fontWeight="bold">
                Productos
              </Typography>

              <List>
                {selectedOrder.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                          {getProductIcon(item.tipo)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.titulo}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.autor}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2">
                                Cantidad: {item.cantidad}
                              </Typography>
                              <Typography variant="body2">
                                Precio unitario: {ordersService.formatPrice(item.precio_unitario)}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                Subtotal: {ordersService.formatPrice(item.subtotal)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < selectedOrder.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MisPedidosPage;