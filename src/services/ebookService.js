import { apiClient } from './authService';

export const ebookService = {
  // Obtener ebooks del usuario
  async getUserEbooks() {
    try {
      const response = await apiClient.get('/ebooks/get-user-ebooks.php');
      
      if (response.data.success) {
        // El backend devuelve los datos envueltos en response.data.data
        const ebooksData = response.data.data;
        return {
          success: true,
          ebooks: ebooksData.ebooks || [],
          total: ebooksData.total || 0
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Error desconocido'
      };
    } catch (error) {
      console.error('Error al obtener ebooks del usuario:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión'
      };
    }
  },

  // Verificar si el usuario posee ebooks específicos
  async checkOwnedEbooks(ebookIds = null) {
    try {
      const response = await apiClient.post('/check-owned-ebooks.php', {
        ebook_ids: ebookIds
      });
      
      if (response.data.success) {
        // El backend devuelve los datos envueltos en response.data.data
        const ebooksData = response.data.data;
        return {
          success: true,
          owned_ebooks: ebooksData.owned_ebooks || [],
          user_id: ebooksData.user_id
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Error desconocido'
      };
    } catch (error) {
      console.error('Error al verificar ebooks:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión'
      };
    }
  },

  // Descargar un ebook
  async downloadEbook(ebookId) {
    try {
      const response = await apiClient.get(`/download-ebook.php?id=${ebookId}`, {
        responseType: 'blob' // Para manejar archivos binarios
      });
      
      return {
        success: true,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      console.error('Error al descargar ebook:', error);
      
      if (error.response) {
        // Si hay respuesta del servidor, intentar leer el error
        try {
          const errorText = await error.response.data.text();
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            error: errorData.error || 'Error de descarga'
          };
        } catch {
          return {
            success: false,
            error: 'Error de descarga desconocido'
          };
        }
      }
      
      return {
        success: false,
        error: 'Error de conexión'
      };
    }
  },

  // Función para cachear ebook para lectura sin conexión
  async cacheEbookForOffline(ebookId, title) {
    try {
      // Verificar si el navegador soporta Cache API
      if (!('caches' in window)) {
        return {
          success: false,
          error: 'Tu navegador no soporta lectura sin conexión'
        };
      }

      const result = await this.downloadEbook(ebookId);
      
      if (!result.success) {
        return result;
      }

      // Crear respuesta desde el blob
      const response = new Response(result.data, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': result.data.size
        }
      });

      // Si hay Service Worker, usar su funcionalidad de caché
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Enviar ebook al Service Worker para cacheado
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_EBOOK',
          ebookData: {
            id: ebookId,
            title: title,
            blob: result.data
          }
        });
      }
      
      // También usar Cache API directamente como fallback
      const cache = await caches.open('ebooks-offline');
      const cacheKey = `/offline-ebook/${ebookId}`;
      await cache.put(cacheKey, response);
      
      // Guardar metadatos en localStorage
      const offlineEbooks = JSON.parse(localStorage.getItem('offlineEbooks') || '{}');
      offlineEbooks[ebookId] = {
        title: title,
        cachedAt: new Date().toISOString(),
        cacheKey: cacheKey
      };
      localStorage.setItem('offlineEbooks', JSON.stringify(offlineEbooks));
      
      return {
        success: true,
        message: 'Ebook preparado para lectura sin conexión'
      };
    } catch (error) {
      console.error('Error al cachear ebook:', error);
      return {
        success: false,
        error: 'Error al preparar el ebook para lectura sin conexión'
      };
    }
  },

  // Función para verificar si un ebook está disponible offline
  isEbookAvailableOffline(ebookId) {
    try {
      const offlineEbooks = JSON.parse(localStorage.getItem('offlineEbooks') || '{}');
      return !!offlineEbooks[ebookId];
    } catch {
      return false;
    }
  },

  // Función para obtener ebook desde caché
  async getOfflineEbook(ebookId) {
    try {
      const cache = await caches.open('ebooks-offline');
      const cacheKey = `/offline-ebook/${ebookId}`;
      const response = await cache.match(cacheKey);
      
      if (response) {
        return {
          success: true,
          data: await response.blob()
        };
      } else {
        return {
          success: false,
          error: 'Ebook no disponible sin conexión'
        };
      }
    } catch (error) {
      console.error('Error al obtener ebook offline:', error);
      return {
        success: false,
        error: 'Error al acceder al ebook sin conexión'
      };
    }
  },

  // Generar URL del visor de ebooks
  getEbookViewerUrl(ebookId, title = '') {
    // Generar URL para el visor de PDF
    const encodedTitle = encodeURIComponent(title || `Ebook ${ebookId}`);
    return `/ebook/${ebookId}?title=${encodedTitle}`;
  },

  // Enviar mensaje al Service Worker con canal de comunicación
  async sendMessageToSW(message) {
    return new Promise((resolve, reject) => {
      if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
        reject(new Error('Service Worker no disponible'));
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    });
  },

  // Cachear ebook usando Service Worker con respuesta
  async cacheEbookWithSW(ebookId, title) {
    try {
      // Primero descargar el ebook
      const result = await this.downloadEbook(ebookId);
      
      if (!result.success) {
        return result;
      }

      // Convertir blob a ArrayBuffer para envío al SW
      const arrayBuffer = await result.data.arrayBuffer();
      
      // Enviar al Service Worker para cacheo
      await this.sendMessageToSW({
        type: 'CACHE_EBOOK',
        ebookData: {
          id: ebookId,
          title: title,
          arrayBuffer: arrayBuffer,
          size: result.data.size
        }
      });

      // Actualizar metadatos en localStorage
      const offlineEbooks = JSON.parse(localStorage.getItem('offlineEbooks') || '{}');
      offlineEbooks[ebookId] = {
        title: title,
        cachedAt: new Date().toISOString(),
        cacheKey: `/offline-ebook/${ebookId}`
      };
      localStorage.setItem('offlineEbooks', JSON.stringify(offlineEbooks));

      return {
        success: true,
        message: 'Ebook cacheado exitosamente por Service Worker'
      };
    } catch (error) {
      console.error('Error al cachear ebook con SW:', error);
      // Fallback a método anterior
      return await this.cacheEbookForOffline(ebookId, title);
    }
  }

};

export default ebookService;
