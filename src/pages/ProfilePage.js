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
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  LocationOn,
  Email,
  Phone,
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
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
    },
    passwords: {
      current: '',
      new: '',
      confirm: ''
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

  const handlePasswordVisibilityToggle = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (!profileData.passwords.current || !profileData.passwords.new || !profileData.passwords.confirm) {
      setError('Todos los campos de contraseña son obligatorios');
      setLoading(false);
      return;
    }

    if (profileData.passwords.new !== profileData.passwords.confirm) {
      setError('Las nuevas contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (profileData.passwords.new.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Aquí irá la lógica para cambiar contraseña en la API
      // await profileService.changePassword(profileData.passwords);
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Contraseña actualizada correctamente');
      setIsChangingPassword(false);
      
      // Limpiar campos de contraseña
      setProfileData(prev => ({
        ...prev,
        passwords: {
          current: '',
          new: '',
          confirm: ''
        }
      }));
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setError('');
    setSuccess('');
    
    // Limpiar campos de contraseña
    setProfileData(prev => ({
      ...prev,
      passwords: {
        current: '',
        new: '',
        confirm: ''
      }
    }));
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

          {/* Seguridad - Cambio de Contraseña */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Lock sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Cambiar Contraseña
              </Typography>
            </Box>

            {!isChangingPassword ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Mantén tu cuenta segura actualizando tu contraseña regularmente
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setIsChangingPassword(true)}
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    fontWeight: 'bold',
                    px: 3,
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  Cambiar Contraseña
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña Actual"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={profileData.passwords.current}
                    onChange={(e) => handleInputChange('passwords.current', e.target.value)}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handlePasswordVisibilityToggle('current')}
                            edge="end"
                          >
                            {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={profileData.passwords.new}
                    onChange={(e) => handleInputChange('passwords.new', e.target.value)}
                    variant="outlined"
                    required
                    helperText="Mínimo 6 caracteres"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handlePasswordVisibilityToggle('new')}
                            edge="end"
                          >
                            {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Nueva Contraseña"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={profileData.passwords.confirm}
                    onChange={(e) => handleInputChange('passwords.confirm', e.target.value)}
                    variant="outlined"
                    required
                    error={profileData.passwords.new !== profileData.passwords.confirm && profileData.passwords.confirm !== ''}
                    helperText={profileData.passwords.new !== profileData.passwords.confirm && profileData.passwords.confirm !== '' ? 'Las contraseñas no coinciden' : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handlePasswordVisibilityToggle('confirm')}
                            edge="end"
                          >
                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      onClick={handleChangePassword}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        px: 4,
                        py: 1,
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8 30%, #6a42a0 90%)'
                        }
                      }}
                    >
                      {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancelPasswordChange}
                      disabled={loading}
                      sx={{ px: 4, py: 1, fontWeight: 'bold' }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
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