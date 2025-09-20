import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const loadCartCount = useCallback(async () => {
    try {
      const count = await cartService.getCartCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error al cargar contador del carrito:', error);
      setCartCount(0);
    }
  }, []);

  const loadCartItems = useCallback(async () => {
    try {
      const data = await cartService.getCartItems();
      setCartItems(data.items || []);
      setCartCount(data.total_items || 0);
      setTotalPrice(data.total_price || 0);
    } catch (error) {
      console.error('Error al cargar items del carrito:', error);
      setCartItems([]);
      setCartCount(0);
      setTotalPrice(0);
    }
  }, []);

  // Cargar el carrito cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadCartItems();
    } else {
      setCartCount(0);
      setCartItems([]);
      setTotalPrice(0);
    }
  }, [isAuthenticated, loadCartItems]);

  const loadCartData = useCallback(async () => {
    setLoading(true);
    try {
      await loadCartItems();
    } finally {
      setLoading(false);
    }
  }, [loadCartItems]);

  const addToCart = async (productId, section, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para agregar productos al carrito');
    }

    setLoading(true);
    try {
      const response = await cartService.addToCart(productId, section, quantity);
      
      // Actualizar el contador
      setCartCount(response.cart_total);
      
      // Recargar items del carrito para mostrar los cambios
      await loadCartItems();
      
      return {
        success: true,
        message: response.message,
        productName: response.product_name
      };
    } catch (error) {
      throw new Error(error.message || 'Error al agregar al carrito');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId, section) => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para eliminar productos del carrito');
    }

    setLoading(true);
    try {
      const response = await cartService.removeFromCart(itemId, section);
      
      // Actualizar el carrito
      await loadCartItems();
      
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar del carrito');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para limpiar el carrito');
    }

    setLoading(true);
    try {
      await cartService.clearCart();
      
      // Limpiar el estado local
      setCartCount(0);
      setCartItems([]);
      setTotalPrice(0);
      
      return {
        success: true,
        message: 'Carrito limpiado exitosamente'
      };
    } catch (error) {
      throw new Error(error.message || 'Error al limpiar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartCount,
    cartItems,
    totalPrice,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    loadCartCount,
    loadCartItems,
    refreshCart: loadCartData
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
