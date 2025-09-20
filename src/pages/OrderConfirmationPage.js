import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OrderConfirmationPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos del estado de navegación
  const { orderData, paymentMethod } = location.state || {};

  useEffect(() => {
    // Redirigir si no hay usuario o datos de orden
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!orderData || !paymentMethod) {
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, orderData, paymentMethod, navigate]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleBackToStore = () => {
    navigate('/dashboard');
  };

  if (!orderData || !paymentMethod) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h2>Error</h2>
          <p>No se encontraron datos de la orden</p>
          <button className="btn btn-primary" onClick={() => navigate('/cart')}>
            Volver al Carrito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm" id="receipt">
            {/* Header de confirmación */}
            <div className="card-header bg-success text-white text-center py-4">
              <h2 className="mb-2">¡Gracias por tu compra!</h2>
              <h4 className="mb-0">🎉 {user?.name || 'Cliente'}</h4>
            </div>

            <div className="card-body p-4">
              {/* Información de la orden */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>📋 Información del Pedido</h5>
                  <p className="mb-1"><strong>ID de Orden:</strong> {orderData.order_id}</p>
                  <p className="mb-1"><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                  <p className="mb-0"><strong>Total:</strong> <span className="text-success">${orderData.total}</span></p>
                </div>
                <div className="col-md-6 text-md-end">
                  <h5>💳 Método de Pago</h5>
                  <p className="mb-0">
                    {paymentMethod === 'cash' ? (
                      <><span className="badge bg-warning text-dark">💰 Pago en Efectivo</span></>
                    ) : (
                      <><span className="badge bg-info">🏦 Transferencia SPEI</span></>
                    )}
                  </p>
                </div>
              </div>

              {/* Instrucciones de pago específicas */}
              {paymentMethod === 'cash' ? (
                <div className="alert alert-warning">
                  <h5 className="alert-heading">💰 Instrucciones para Pago en Efectivo</h5>
                  <div className="row">
                    <div className="col-md-8">
                      <h6>📋 Pasos a seguir:</h6>
                      <ol className="mb-2">
                        <li>Ve a <strong>7-Eleven</strong> o <strong>Farmacias del Ahorro</strong></li>
                        <li>Proporciona la referencia al cajero</li>
                        <li>Paga el monto exacto en efectivo</li>
                        <li>Solicita tu comprobante de pago</li>
                      </ol>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center bg-light p-3 rounded">
                        <h6>Referencia de Pago:</h6>
                        <div className="display-6 text-primary font-monospace">
                          {orderData.reference || orderData.order_id}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Monto a pagar:</strong> ${orderData.total}
                    </div>
                    <div className="col-md-6">
                      <strong>Válido hasta:</strong> {orderData.expires_at || '3 días'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-info">
                  <h5 className="alert-heading">🏦 Instrucciones para Transferencia SPEI</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <h6>📋 Datos Bancarios:</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Banco:</strong></td>
                            <td>{orderData.bank || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>CLABE:</strong></td>
                            <td className="font-monospace">{orderData.clabe || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Cuenta:</strong></td>
                            <td>{orderData.account || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Beneficiario:</strong></td>
                            <td>{orderData.beneficiary || 'IMCYC'}</td>
                          </tr>
                          <tr>
                            <td><strong>Referencia:</strong></td>
                            <td className="font-monospace">{orderData.reference || orderData.order_id}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>📋 Pasos a seguir:</h6>
                      <ol className="mb-2">
                        <li>Ingresa a tu banca en línea</li>
                        <li>Selecciona "Transferencia SPEI"</li>
                        <li>Ingresa la CLABE y datos bancarios</li>
                        <li>Transfiere el monto exacto</li>
                        <li>Envía el comprobante a: 
                          <strong> cursos@imcyc.com</strong>
                        </li>
                      </ol>
                      
                      <div className="bg-light p-2 rounded">
                        <strong>Monto a transferir:</strong> ${orderData.total}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información importante */}
              <div className="alert alert-secondary">
                <h6 className="alert-heading">ℹ️ Información Importante</h6>
                <ul className="mb-0 small">
                  <li>Tu pedido será procesado después de confirmar el pago</li>
                  <li>Conserva este comprobante como respaldo de tu compra</li>
                  <li>Tiempo de procesamiento: 1-2 días hábiles después del pago</li>
                  <li>IVA incluido en mercancía y ebooks según legislación vigente</li>
                </ul>
              </div>

              {/* Resumen de productos (si está disponible) */}
              {orderData.items && orderData.items.length > 0 && (
                <div className="mt-4">
                  <h5>📦 Resumen de Productos</h5>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderData.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{item.name}</strong>
                              <br />
                              <small className="text-muted">
                                {item.tipo === 'mercancia' ? 'Mercancía' : 
                                 item.tipo === 'libro' ? 'Libro' :
                                 item.tipo === 'ebook' ? 'E-book' : 'Webinar'}
                              </small>
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-success">
                          <th colspan="2">TOTAL:</th>
                          <th className="text-end">${orderData.total}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            <div className="card-footer text-center">
              <div className="row g-2">
                <div className="col-md-4">
                  <button 
                    className="btn btn-success w-100"
                    onClick={handleBackToStore}
                  >
                    Volver a la Tienda
                  </button>
                </div>
                <div className="col-md-4">
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={handlePrintReceipt}
                  >
                    Imprimir Comprobante
                  </button>
                </div>
                <div className="col-md-4">
                  <button 
                    className="btn btn-outline-info w-100"
                    onClick={() => navigate('/orders')}
                  >
                    Ver Mis Pedidos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt, #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmationPage;