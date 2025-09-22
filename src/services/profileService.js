const API_BASE_URL = 'http://localhost/TiendaImcyc/api';

class ProfileService {
  // Obtener el token JWT del localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Headers por defecto para las peticiones autenticadas
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Obtener los datos del perfil del usuario
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/get.php`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener el perfil');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  // Actualizar el perfil del usuario
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/update.php`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }

      return data.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Cambiar contraseña del usuario
  async changePassword(passwordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/change-password.php`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
          confirmPassword: passwordData.confirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Error al cambiar la contraseña');
      }

      return data.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default new ProfileService();