import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  LocationOn,
  Email,
  Phone,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    nombreCompleto: '',
    telefono: '',
    email: '',
    direccion: {
      calle: '',
      colonia: '',
      codigoPostal: '',
      municipio: '',
      estado: ''
    }
  });

  // Estados de México para el dropdown
  const estadosMexico = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 
    'Zacatecas'
  ];

  useEffect(() => {
    // Cargar datos del usuario actual (simulado para prueba)
    if (user) {
      setProfileData({
        nombreCompleto: user.nombre || 'Usuario de Prueba',
        telefono: '5555555555',
        email: user.email || 'ruribe@imcyc.com',
        direccion: {
          calle: 'Av. Insurgentes Sur #1846',
          colonia: 'Florida',
          codigoPostal: '01030',
          municipio: 'Álvaro Obregón',
          estado: 'Ciudad de México'
        }
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Aquí irá la lógica para guardar en la API
      // await profileService.updateProfile(profileData);
      
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Recargar datos originales si es necesario
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Actualiza tu información personal
        </Typography>
      </Box>

      {/* Mensajes de estado */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header con avatar y botón editar */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                mr: 3
              }}
            >
              {profileData.nombreCompleto ? getInitials(profileData.nombreCompleto) : 'P'}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Editar Mi Perfil
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Actualiza tu información personal
              </Typography>
            </Box>

            {!isEditing ? (
              <IconButton 
                color="primary" 
                onClick={() => setIsEditing(true)}
                sx={{ 
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' }
                }}
              >
                <Edit />
              </IconButton>
            ) : null}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Información Personal */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Información Personal
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  value={profileData.nombreCompleto}
                  onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={profileData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  helperText="Formato: 5512345678 (10 dígitos sin espacios)"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Dirección */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Dirección
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Calle y Número"
                  value={profileData.direccion.calle}
                  onChange={(e) => handleInputChange('direccion.calle', e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Colonia"
                  value={profileData.direccion.colonia}
                  onChange={(e) => handleInputChange('direccion.colonia', e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código Postal"
                  value={profileData.direccion.codigoPostal}
                  onChange={(e) => handleInputChange('direccion.codigoPostal', e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Municipio/Alcaldía"
                  value={profileData.direccion.municipio}
                  onChange={(e) => handleInputChange('direccion.municipio', e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  value={profileData.direccion.estado}
                  onChange={(e) => handleInputChange('direccion.estado', e.target.value)}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                >
                  {estadosMexico.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Botones de acción */}
          {isEditing && (
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 3
            }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a42a0 90%)'
                  }
                }}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={loading}
                sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
              >
                Cancelar
              </Button>
            </Box>
          )}

          {!isEditing && (
            <Box sx={{ 
              textAlign: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 3
            }}>
              <Typography variant="body2" color="text.secondary">
                Haz clic en el botón de editar para modificar tu información
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;