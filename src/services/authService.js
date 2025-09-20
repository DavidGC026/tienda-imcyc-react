import axios from 'axios';

// Configurar la URL base del API
const API_BASE_URL = window.location.origin + '/TiendaReact/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token en requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || 'test-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login.php', {
        email,
        password,
      });
      
      return {
        success: response.data.success,
        user: response.data.data?.user,
        token: response.data.data?.token,
        error: response.data.message
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error de conexión' 
      };
    }
  },

  // Registro
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register.php', userData);
      
      return {
        success: response.data.success,
        user: response.data.data?.user,
        token: response.data.data?.token,
        error: response.data.message
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error de conexión' 
      };
    }
  },

  // Verificar token
  async verifyToken(token) {
    try {
      const response = await apiClient.post('/auth/verify.php', { token });
      if (response.data.success) {
        return response.data.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return null;
    }
  },
};

export { apiClient };