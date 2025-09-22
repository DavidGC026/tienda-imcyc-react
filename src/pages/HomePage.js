import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const services = [
    {
      title: 'Libros',
      icon: 'fas fa-book',
      description: 'Consulta nuestra colección de libros técnicos y especializados.',
      action: 'Ver Libros',
      section: 'libros'
    },
    {
      title: 'E-books',
      icon: 'fas fa-tablet-alt',
      description: 'Accede a libros digitales y material descargable.',
      action: 'Ver E-books',
      section: 'ebooks'
    },
    {
      title: 'Mercancía',
      icon: 'fas fa-shopping-bag',
      description: 'Compra productos oficiales de IMCYC directamente en línea.',
      action: 'Ver Mercancía',
      section: 'mercancia'
    },
    {
      title: 'Webinars',
      icon: 'fas fa-video',
      description: 'Accede a cursos digitales continuos para tu crecimiento en la industria.',
      action: 'Ver Webinars',
      section: 'webinars'
    }
  ];

  const handleServiceClick = (section) => {
    navigate('/products', { state: { initialSection: section } });
  };

  // Cargar Font Awesome cuando el componente se monta
  useEffect(() => {
    // Verificar si Font Awesome ya está cargado
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }

    // Verificar si Inter font ya está cargado
    if (!document.querySelector('link[href*="Inter"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css?family=Inter:400,500,600,700,800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <Box
      sx={{
        background: `url('https://grabador.imcyc.com/TiendaImcyc/img/fondo.png') center center/cover no-repeat fixed`,
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '120px 0 80px',
        fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h2" 
          sx={{
            fontSize: { xs: '2.5rem', md: '3rem' },
            fontWeight: 800,
            margin: '0 0 3rem',
            textAlign: 'center',
            color: 'white',
            textShadow: '0 3px 10px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,1)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '2px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
            }
          }}
          gutterBottom
        >
          Explora Nuestros Servicios
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr', // 1 columna en móvil
              sm: '1fr 1fr', // 2 columnas en tablet  
              md: '1fr 1fr 1fr 1fr' // 4 columnas en desktop
            },
            gap: 4,
            gridAutoRows: '320px', // ALTURA FIJA ABSOLUTA
            mt: 2,
            textAlign: 'center'
          }}
        >
          {services.map((service, index) => (
            <Card 
              key={index}
              onClick={() => handleServiceClick(service.section)}
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 30, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: theme.palette.mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  transform: 'scaleX(0)',
                  transition: 'transform 0.3s ease'
                },
                '&:hover': {
                  transform: 'translateY(-15px) scale(1.02)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                  '&::before': {
                    transform: 'scaleX(1)'
                  },
                  '& .service-icon': {
                    transform: 'scale(1.1)',
                    color: theme.palette.primary.main
                  }
                }
              }}
              >
                <CardContent sx={{ 
                  padding: '1.5rem 1rem',
                  textAlign: 'center', 
                  position: 'relative', 
                  zIndex: 1,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}>
                  {/* Sección superior: icono */}
                  <Box 
                    component="i"
                    className={`service-icon ${service.icon}`}
                    sx={{
                      fontSize: '3rem',
                      color: theme.palette.primary.main,
                      marginBottom: '1rem',
                      transition: 'all 0.3s ease',
                      display: 'block',
                      height: '60px',
                      lineHeight: '60px'
                    }}
                  />
                  
                  {/* Sección media: título y descripción */}
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography 
                      variant="h5" 
                      sx={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        marginBottom: '0.8rem',
                        color: theme.palette.text.primary,
                        height: '1.8rem',
                        lineHeight: '1.3rem'
                      }}
                    >
                      {service.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        height: '4.2rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {service.description}
                    </Typography>
                  </Box>
                  
                  {/* Sección inferior: botón */}
                  <Box sx={{ mt: '1rem' }}>
                    <Button
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '0.6rem 1.5rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.8rem',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      {service.action}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
          ))}
        </Box>

        {/* Sección IMCYC Outlet */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr',  
              md: '300px' // Ancho fijo centrado
            },
            justifyContent: 'center',
            gap: 4,
            gridAutoRows: '320px',
            mt: 2
          }}
        >
          <Card 
            onClick={() => window.open('https://grabador.imcyc.com/construremates/', '_blank')}
            sx={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 30, 30, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: theme.palette.mode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transform: 'scaleX(0)',
                transition: 'transform 0.3s ease'
              },
              '&:hover': {
                transform: 'translateY(-15px) scale(1.02)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                '&::before': {
                  transform: 'scaleX(1)'
                }
              }
            }}
            >
              <CardContent sx={{ 
                padding: '1.5rem 1rem',
                textAlign: 'center', 
                position: 'relative', 
                zIndex: 1,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%'
              }}>
                {/* Logo Construremates */}
                <Box 
                  sx={{
                    width: '140px',
                    height: '100px',
                    margin: '0 auto 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '8px'
                  }}
                >
                  <img 
                    src="https://grabador.imcyc.com/construremates/images/logotipo2.png" 
                    alt="Construremates Logo" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
                
                {/* Descripción */}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                      height: '4.2rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    Construremates - Ofertas y remates en equipo y productos IMCYC.
                  </Typography>
                </Box>
                
                {/* Botón */}
                <Box sx={{ mt: '1rem' }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '0.6rem 1.2rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    VISITAR CONSTRUREMATES
                  </Button>
                </Box>
              </CardContent>
            </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;