import { apiClient } from './authService';

export const productService = {
  // Obtener productos por sección
  async getProducts(section = 'mercancia', params = {}) {
    try {
      const queryParams = new URLSearchParams({
        section: section,
        ...params,
      });
      
      const response = await apiClient.get(`/products/list.php?${queryParams}`);
      
      if (response.data.success) {
        return {
          success: true,
          products: response.data.data.products || [],
          total: response.data.data.total || 0,
          hasMore: response.data.data.has_more || false
        };
      }
      
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  // Buscar productos
  async searchProducts(query, section = 'all') {
    try {
      const params = { search: query };
      if (section !== 'all') {
        params.section = section;
      }
      
      return await this.getProducts(section === 'all' ? 'mercancia' : section, params);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },
};