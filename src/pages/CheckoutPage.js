import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/authService';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcular totales
  const subtotal = totalPrice;
  const iva = subtotal * 0.16; // 16% IVA
  const total = subtotal + iva;

  useEffect(() => {
    // Redirigir si no hay usuario o carrito vacío
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, cartItems, navigate]);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    setIsProcessing(true);

    try {
      const endpoint = selectedPaymentMethod === 'cash' 
        ? '/process-cash-payment.php'
        : '/process-transfer-payment.php';

      const response = await apiClient.post(endpoint, {
        cart_items: cartItems,
        user_id: user?.id || 1,
        payment_method: selectedPaymentMethod,
        subtotal: subtotal,
        iva: iva,
        total: total
      });

      const result = response.data;

      if (result.success) {
        // Limpiar carrito
        clearCart();
        
        // Redirigir a página de confirmación con datos de pago
        navigate('/order-confirmation', { 
          state: { 
            orderData: result.data,
            paymentMethod: selectedPaymentMethod
          } 
        });
      } else {
        alert('Error al procesar el pago: ' + (result.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Error al conectar con el servidor';
      alert('Error al procesar el pago: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-page" style={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        color: theme.palette.text.primary 
      }}>
        <div className="checkout-header">
          <div className="checkout-container text-center">
            <h1>🛒 Checkout</h1>
            <p className="subtitle">Finaliza tu compra de manera segura</p>
          </div>
        </div>
        <div className="checkout-container">
          <div className="empty-cart" style={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 25px rgba(0, 0, 0, 0.5)' 
              : '0 8px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: theme.palette.text.secondary }}>🛒 Tu carrito está vacío</h2>
            <p style={{ color: theme.palette.text.secondary }}>Agrega algunos productos antes de proceder al pago</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main
              }}
            >
              <i className="bi bi-shop me-2"></i>Ir a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={{ 
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      color: theme.palette.text.primary 
    }}>
      {/* Header */}
      <div className="checkout-header">
        <div className="checkout-container text-center">
          <h1>🛒 Checkout</h1>
          <p className="subtitle">Finaliza tu compra de manera segura</p>
        </div>
      </div>

      <div className="checkout-container">
        <div className="row">
          {/* Resumen del pedido */}
          <div className="col-lg-7 mb-4">
            <div className="checkout-card" style={{
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 25px rgba(0, 0, 0, 0.5)' 
                : '0 8px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="checkout-card-header">
                <h4 className="mb-0">📦 Resumen del Pedido</h4>
              </div>
              <div className="checkout-card-body">
              {cartItems.map((item) => (
                <div key={`${item.section}-${item.product_id}`} className="cart-item row align-items-center" style={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary
                }}>
                  <div className="col-md-8">
                    <h6 className="mb-1" style={{ color: theme.palette.text.primary }}>{item.name}</h6>
                    <span className="category-badge badge bg-secondary">
                      {item.section === 'mercancia' ? '📦 Mercancía' : 
                       item.section === 'libros' ? '📚 Libro' :
                       item.section === 'ebooks' ? '💻 E-book' : '🎥 Webinar'}
                    </span>
                  </div>
                  <div className="col-md-2 text-center">
                    <span className="quantity-badge">{item.quantity}</span>
                  </div>
                  <div className="col-md-2 text-end">
                    <div className="price-display" style={{ color: theme.palette.success.main }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}

              {/* Totales */}
              <div className="row mt-4">
                <div className="col-md-6 offset-md-6">
                  <div className="totals-table" style={{
                    backgroundColor: theme.palette.mode === 'dark' ? '#333333' : '#f8f9fa',
                    color: theme.palette.text.primary
                  }}>
                    <table className="table table-borderless">
                      <tbody>
                        <tr className="subtotal-row" style={{ color: theme.palette.text.secondary }}>
                          <td><strong>Subtotal:</strong></td>
                          <td className="text-end"><strong>${subtotal.toFixed(2)}</strong></td>
                        </tr>
                        <tr className="iva-row" style={{ color: theme.palette.text.secondary }}>
                          <td><strong>IVA (16%):</strong></td>
                          <td className="text-end"><strong>${iva.toFixed(2)}</strong></td>
                        </tr>
                        <tr className="total-row">
                          <td><strong>TOTAL:</strong></td>
                          <td className="text-end"><strong>${total.toFixed(2)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="col-lg-5">
          <div className="checkout-card" style={{
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 25px rgba(0, 0, 0, 0.5)' 
              : '0 8px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="checkout-card-header">
              <h4 className="mb-0">💳 Selecciona tu método de pago</h4>
            </div>
            <div className="checkout-card-body">
              
              {/* Pago en Efectivo */}
              <div className="payment-method mb-3">
                <div 
                  className={`payment-method-card ${selectedPaymentMethod === 'cash' ? 'selected-cash' : ''}`}
                  onClick={() => handlePaymentMethodSelect('cash')}
                  style={{
                    background: theme.palette.background.paper,
                    borderColor: selectedPaymentMethod === 'cash' ? theme.palette.success.main : theme.palette.divider,
                    color: theme.palette.text.primary
                  }}
                >
                  <div className="payment-method-header">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cash" 
                      checked={selectedPaymentMethod === 'cash'}
                      onChange={() => handlePaymentMethodSelect('cash')}
                      className="payment-method-radio"
                    />
                    <div className="flex-grow-1">
                      <h5 className="payment-method-title">
                        💰 Pago en Efectivo
                      </h5>
                      <p className="payment-method-description">
                        Paga en 7-Eleven o Farmacias del Ahorro
                      </p>
                    </div>
                  </div>
                  
                  {selectedPaymentMethod === 'cash' && (
                    <div className="payment-details" style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white'}}>
                      <h6 className="mb-3">✅ Ventajas:</h6>
                      <ul className="mb-3 ps-3">
                        <li>Sin necesidad de tarjeta bancaria</li>
                        <li>Pago en tiendas de conveniencia</li>
                        <li>Referencia válida por 3 días</li>
                      </ul>
                      
                      <h6 className="mb-3">📋 Instrucciones:</h6>
                      <ol className="mb-3 ps-3">
                        <li>Recibirás una referencia de pago</li>
                        <li>Ve a 7-Eleven o Farmacias del Ahorro</li>
                        <li>Proporciona la referencia al cajero</li>
                        <li>Paga el monto exacto</li>
                      </ol>
                      
                      <div className="payment-stores">
                        <small>Acepta pagos en:</small>
                        <div className="d-flex gap-2">
                          <span className="store-badge">7-Eleven</span>
                          <span className="store-badge">Farmacias del Ahorro</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transferencia SPEI */}
              <div className="payment-method mb-3">
                <div 
                  className={`payment-method-card ${selectedPaymentMethod === 'transfer' ? 'selected-transfer' : ''}`}
                  onClick={() => handlePaymentMethodSelect('transfer')}
                  style={{
                    background: theme.palette.background.paper,
                    borderColor: selectedPaymentMethod === 'transfer' ? theme.palette.primary.main : theme.palette.divider,
                    color: theme.palette.text.primary
                  }}
                >
                  <div className="payment-method-header">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="transfer" 
                      checked={selectedPaymentMethod === 'transfer'}
                      onChange={() => handlePaymentMethodSelect('transfer')}
                      className="payment-method-radio"
                    />
                    <div className="flex-grow-1">
                      <h5 className="payment-method-title">
                        🏦 Transferencia SPEI
                      </h5>
                      <p className="payment-method-description">
                        Transfiere desde tu banco en línea
                      </p>
                    </div>
                  </div>

                  {selectedPaymentMethod === 'transfer' && (
                    <div className="payment-details" style={{background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', color: 'white'}}>
                      <h6 className="mb-3">✅ Ventajas:</h6>
                      <ul className="mb-3 ps-3">
                        <li>Pago inmediato desde tu banco</li>
                        <li>Seguro y confiable</li>
                        <li>Disponible 24/7</li>
                      </ul>
                      
                      <h6 className="mb-3">📋 Instrucciones:</h6>
                      <ol className="mb-3 ps-3">
                        <li>Recibirás datos bancarios (CLABE, cuenta)</li>
                        <li>Ingresa a tu banca en línea</li>
                        <li>Realiza la transferencia SPEI</li>
                        <li>Envía comprobante a cursos@imcyc.com</li>
                      </ol>
                      
                      <div className="text-center">
                        <small>Compatible con todos los bancos de México</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de procesar pago */}
              <div className="action-buttons d-grid gap-2 mt-4">
                <button 
                  className={`process-payment-btn ${selectedPaymentMethod === 'cash' ? 'btn-success' : 
                             selectedPaymentMethod === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={processPayment}
                  disabled={!selectedPaymentMethod || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading-spinner"></span>
                      Procesando...
                    </>
                  ) : (
                    `Procesar Pago - $${total.toFixed(2)}`
                  )}
                </button>
                
                <button 
                  className="back-to-cart-btn btn btn-outline-secondary"
                  onClick={() => navigate('/cart')}
                  disabled={isProcessing}
                >
                  ← Volver al Carrito
                </button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="info-card" style={{
            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff3cd',
            borderColor: theme.palette.mode === 'dark' ? '#555' : '#f0c674',
            color: theme.palette.text.primary
          }}>
            <div className="card-body">
              <h6 className="card-title" style={{ color: theme.palette.text.primary }}>ℹ️ Información Importante</h6>
              <ul className="list-unstyled mb-0">
                <li style={{ color: theme.palette.text.secondary }}>Mercancía y E-books incluyen IVA del 16%</li>
                <li style={{ color: theme.palette.text.secondary }}>Libros y Webinars están exentos de IVA</li>
                <li style={{ color: theme.palette.text.secondary }}>Los pedidos se procesan después de confirmar el pago</li>
                <li style={{ color: theme.palette.text.secondary }}>Conserva tu comprobante de pago</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CheckoutPage;