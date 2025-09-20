import { apiClient } from './authService';

export const ebookService = {
  // Obtener ebooks del usuario
  async getUserEbooks() {
    try {
      const response = await apiClient.get('/ebooks/get-user-ebooks.php');
      
      if (response.data.success) {
        return {
          success: true,
          ebooks: response.data.ebooks,
          total: response.data.total
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error desconocido'
      };
    } catch (error) {
      console.error('Error al obtener ebooks del usuario:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  },

  // Obtener URL del visor de ebook
  getEbookViewerUrl(ebookId, title) {
    return `/ebook/${ebookId}?title=${encodeURIComponent(title)}`;
  }
};