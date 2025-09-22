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
        const token = localStorage.getItem('authToken');
        
        // Validar si es un JWT válido y no test-token
        if (token && token !== 'test-token') {
          const userData = await authService.verifyToken(token);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            return;
          } else {
            localStorage.removeItem('authToken');
          }
        }
        
        // Usuario de prueba temporal para desarrollo
        console.log('Estableciendo usuario de prueba...');
        const testUser = { id: 7, nombre: 'Usuario de Prueba', email: 'ruribe@imcyc.com' };
        setUser(testUser);
        setIsAuthenticated(true);
        // Usar JWT válido para el usuario de prueba
        const validTestToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3LCJlbWFpbCI6InJ1cmliZUBpbWN5Yy5jb20iLCJub21icmUiOiJVc3VhcmlvIGRlIFBydWViYSIsImV4cCI6MTc1ODY0MTg3N30.JKxkZ1Rr5i8FIjeYDTcm1whDWV1gm8AS6lnlfOqMhLQ';
        localStorage.setItem('authToken', validTestToken);
        
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        // En caso de error, establecer usuario de prueba
        const testUser = { id: 7, nombre: 'Usuario de Prueba', email: 'ruribe@imcyc.com' };
        setUser(testUser);
        setIsAuthenticated(true);
        // Usar JWT válido para el usuario de prueba
        const validTestToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3LCJlbWFpbCI6InJ1cmliZUBpbWN5Yy5jb20iLCJub21icmUiOiJVc3VhcmlvIGRlIFBydWViYSIsImV4cCI6MTc1ODY0MTg3N30.JKxkZ1Rr5i8FIjeYDTcm1whDWV1gm8AS6lnlfOqMhLQ';
        localStorage.setItem('authToken', validTestToken);
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