const API_BASE_URL = window.location.origin + '/TiendaReact/api';

class OrdersService {
  // Obtener el token JWT del localStorage
  getAuthToken() {
    // Compatibilidad: usar 'token' (nuevo) o 'authToken' (legacy)
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  }

  // Headers por defecto para las peticiones autenticadas
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Obtener lista de pedidos del usuario
  async getOrders(page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/list.php?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener los pedidos');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  // Obtener detalles de un pedido específico
  async getOrderDetails(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/get.php?id=${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener los detalles del pedido');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting order details:', error);
      throw error;
    }
  }

  // Formatear fecha para mostrar
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Formatear precio
  formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  // Obtener color del estado
  getStatusColor(status) {
    const statusColors = {
      'pendiente': '#ff9800',
      'procesando': '#2196f3',
      'enviado': '#9c27b0',
      'entregado': '#4caf50',
      'completado': '#4caf50',
      'aprobado': '#4caf50',
      'cancelado': '#f44336',
      'rechazado': '#f44336'
    };

    return statusColors[status] || '#757575';
  }

  // Obtener icono del estado
  getStatusIcon(status) {
    const statusIcons = {
      'pendiente': 'schedule',
      'procesando': 'autorenew',
      'enviado': 'local_shipping',
      'entregado': 'done_all',
      'completado': 'check_circle',
      'aprobado': 'check_circle',
      'cancelado': 'cancel',
      'rechazado': 'error'
    };

    return statusIcons[status] || 'help';
  }
}

export default new OrdersService();