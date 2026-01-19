import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  Skeleton,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Book,
  MenuBook,
  LibraryBooks,
  OpenInNew,
  OfflinePin,
  CalendarToday,
  Person
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { ebookService } from '../services/ebookService';
import { useNavigate } from 'react-router-dom';

const MiBibliotecaPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineEbooks, setOfflineEbooks] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadUserEbooks();
    loadOfflineStatus();
  }, [isAuthenticated, navigate]);

  const loadOfflineStatus = () => {
    try {
      const offline = JSON.parse(localStorage.getItem('offlineEbooks') || '{}');
      setOfflineEbooks(offline);
    } catch {
      setOfflineEbooks({});
    }
  };

  const loadUserEbooks = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await ebookService.getUserEbooks();
      
      if (result.success) {
        setEbooks(result.ebooks || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al cargar tus ebooks');
      console.error('Error loading ebooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEbook = (ebook) => {
    if (ebook.archivo_pdf) {
      const viewerUrl = ebookService.getEbookViewerUrl(ebook.id, ebook.titulo);
      navigate(viewerUrl);
    }
  };

  const handleCacheEbook = async (ebook) => {
    try {
      setError('');
      
      // Intentar usar Service Worker primero, luego fallback al método anterior
      let result;
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          result = await ebookService.cacheEbookWithSW(ebook.id, ebook.titulo);
        } catch (swError) {
          console.log('SW method failed, falling back:', swError);
          result = await ebookService.cacheEbookForOffline(ebook.id, ebook.titulo);
        }
      } else {
        result = await ebookService.cacheEbookForOffline(ebook.id, ebook.titulo);
      }
      
      if (result.success) {
        // Actualizar estado offline y mostrar mensaje de éxito
        loadOfflineStatus();
        console.log('Ebook guardado para lectura sin conexión');
        // Opcional: podrías mostrar un toast o snackbar aquí
      } else {
        setError(`Error al preparar para lectura sin conexión: ${result.error}`);
      }
    } catch (err) {
      setError('Error al preparar el ebook para lectura sin conexión');
      console.error('Error caching ebook:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderEbookCover = (ebook) => {
    const coverUrl = ebook.imagen;

    if (coverUrl) {
      return (
        <CardMedia
          component="img"
          height="140"
          image={coverUrl}
          alt={`Portada de ${ebook.titulo}`}
          sx={{
            objectFit: 'contain',
            backgroundColor: '#f5f5f5',
            padding: 0.5
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    return (
      <Box
        sx={{
          height: 140,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 1,
          textAlign: 'center'
        }}
      >
        <MenuBook sx={{ fontSize: 30, mb: 0.5, opacity: 0.9 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1, fontSize: '0.8rem' }}>
          {ebook.titulo}
        </Typography>
      </Box>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          <LibraryBooks sx={{ mr: 2, verticalAlign: 'middle' }} />
          Mi Biblioteca
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            '@media (max-width: 1200px)': {
              gridTemplateColumns: 'repeat(3, 1fr)'
            },
            '@media (max-width: 900px)': {
              gridTemplateColumns: 'repeat(2, 1fr)'
            },
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr'
            }
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Card key={item}>
              <Skeleton variant="rectangular" height={140} />
              <CardContent>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LibraryBooks sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
            Mi Biblioteca
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Accede a todos tus ebooks adquiridos en cualquier momento
        </Typography>
        {ebooks && ebooks.length > 0 && (
          <Chip 
            icon={<Book />} 
            label={`${ebooks.length} ${ebooks.length === 1 ? 'ebook' : 'ebooks'} disponibles`}
            sx={{ 
              mt: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        )}
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Ebooks grid */}
      {(!ebooks || ebooks.length === 0) && !error ? (
        <Paper 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >
          <LibraryBooks sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            Tu biblioteca está vacía
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Aún no tienes ebooks adquiridos. Explora nuestro catálogo y comienza tu biblioteca digital.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
            sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              px: 4,
              py: 1.5
            }}
          >
            Ver Catálogo
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            '@media (max-width: 1200px)': {
              gridTemplateColumns: 'repeat(3, 1fr)'
            },
            '@media (max-width: 900px)': {
              gridTemplateColumns: 'repeat(2, 1fr)'
            },
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr'
            }
          }}
        >
          {ebooks && ebooks.map((ebook) => (
            <Card 
              key={ebook.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
                {renderEbookCover(ebook)}
                
                <CardContent sx={{ flexGrow: 1, p: 1.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1
                      }}
                    >
                      {ebook.titulo}
                    </Typography>
                    {offlineEbooks[ebook.id] && (
                      <OfflinePin 
                        sx={{ 
                          fontSize: 16, 
                          color: 'success.main',
                          flexShrink: 0,
                          mt: 0.2
                        }} 
                        titleAccess="Disponible sin conexión"
                      />
                    )}
                  </Box>
                  
                  {ebook.autor && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.4 }}>
                      <Person sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {ebook.autor}
                      </Typography>
                    </Box>
                  )}

                  {ebook.fecha_publicacion && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                      <CalendarToday sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {formatDate(ebook.fecha_publicacion)}
                      </Typography>
                    </Box>
                  )}

                  {ebook.descripcion && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                        mb: 0.8
                      }}
                    >
                      {ebook.descripcion}
                    </Typography>
                  )}
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 1.2, pt: 0.4, display: 'flex', gap: 1 }}>
                  {ebook.archivo_pdf ? (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                        onClick={() => handleOpenEbook(ebook)}
                        sx={{
                          flex: 1,
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          fontWeight: 'bold',
                          py: 0.6,
                          fontSize: '0.75rem'
                        }}
                      >
                        Leer
                      </Button>
                      <Button
                        variant={offlineEbooks[ebook.id] ? "contained" : "outlined"}
                        startIcon={<OfflinePin sx={{ fontSize: 14 }} />}
                        onClick={() => handleCacheEbook(ebook)}
                        disabled={!!offlineEbooks[ebook.id]}
                        sx={{
                          flex: 1,
                          borderColor: offlineEbooks[ebook.id] ? 'success.main' : '#667eea',
                          backgroundColor: offlineEbooks[ebook.id] ? 'success.main' : 'transparent',
                          color: offlineEbooks[ebook.id] ? 'white' : '#667eea',
                          fontWeight: 'bold',
                          py: 0.6,
                          fontSize: '0.75rem',
                          '&:hover': {
                            borderColor: offlineEbooks[ebook.id] ? 'success.dark' : '#764ba2',
                            backgroundColor: offlineEbooks[ebook.id] ? 'success.dark' : 'rgba(102, 126, 234, 0.04)'
                          },
                          '&.Mui-disabled': {
                            backgroundColor: 'success.main',
                            color: 'white'
                          }
                        }}
                      >
                        {offlineEbooks[ebook.id] ? 'Guardado' : 'Sin conexión'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      sx={{ py: 0.6, fontSize: '0.8rem' }}
                    >
                      Archivo no disponible
                    </Button>
                  )}
                </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default MiBibliotecaPage;