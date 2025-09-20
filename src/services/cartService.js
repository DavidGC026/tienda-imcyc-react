import { apiClient } from './authService';

export const cartService = {
  // Agregar producto al carrito
  async addToCart(productId, section, quantity = 1) {
    try {
      const response = await apiClient.post('/cart/add.php', {
        product_id: productId,
        section: section,
        quantity: quantity
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al agregar al carrito');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al agregar al carrito');
    }
  },

  // Obtener contador del carrito
  async getCartCount() {
    try {
      const response = await apiClient.get('/cart/count.php');

      if (response.data.success) {
        return response.data.data.cart_total;
      } else {
        throw new Error(response.data.message || 'Error al obtener contador del carrito');
      }
    } catch (error) {
      console.error('Error al obtener contador del carrito:', error);
      return 0;
    }
  },

  // Obtener items del carrito
  async getCartItems() {
    try {
      const response = await apiClient.get('/cart/get.php');

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener items del carrito');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al obtener items del carrito');
    }
  },

  // Eliminar item del carrito
  async removeFromCart(itemId, section) {
    try {
      const response = await apiClient.delete('/cart/remove.php', {
        data: {
          item_id: itemId,
          section: section
        }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al eliminar del carrito');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al eliminar del carrito');
    }
  },

  // Limpiar carrito completo
  async clearCart() {
    try {
      const response = await apiClient.post('/cart/clear.php');

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al limpiar el carrito');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al limpiar el carrito');
    }
  }
};
