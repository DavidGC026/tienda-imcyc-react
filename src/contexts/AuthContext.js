import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Limpiar localStorage al inicializar para desarrollo
        localStorage.clear();
        
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = await authService.verifyToken(token);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
          }
        } else {
          // Usuario de prueba temporal para desarrollo
          console.log('Estableciendo usuario de prueba...');
          setUser({ id: 7, nombre: 'Usuario de Prueba', email: 'ruribe@imcyc.com' });
          setIsAuthenticated(true);
          localStorage.setItem('authToken', 'test-token');
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        localStorage.removeItem('authToken');
        // Aún así, establecer usuario de prueba
        setUser({ id: 7, nombre: 'Usuario de Prueba', email: 'ruribe@imcyc.com' });
        setIsAuthenticated(true);
        localStorage.setItem('authToken', 'test-token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.token);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.token);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};