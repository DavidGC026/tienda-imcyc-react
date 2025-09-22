import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Badge
} from '@mui/material';
import { 
  AccountCircle, 
  Logout, 
  ExpandMore,
  Home,
  ShoppingBag,
  Book,
  MenuBook,
  School,
  Assignment,
  ShoppingCart,
  LibraryBooks,
  Person
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [servicesAnchorEl, setServicesAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleServicesMenuOpen = (event) => {
    setServicesAnchorEl(event.currentTarget);
  };

  const handleServicesMenuClose = () => {
    setServicesAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleProfileMenuClose();
  };

  const handleServiceNavigation = (section) => {
    navigate('/products', { state: { initialSection: section } });
    handleServicesMenuClose();
  };

  return (
    <>
      <AppBar position="sticky" sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#2d3748'
      }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: '#2d3748',
              fontWeight: 800,
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            IMCYC Tienda
          </Typography>
          
          {/* Menú Principal */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/"
              startIcon={<Home />}
              sx={{
                color: '#4a5568',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Inicio
            </Button>
            
            {/* Mi Biblioteca (solo si está logueado) */}
            {isAuthenticated && (
              <Button 
                color="inherit" 
                component={Link}
                to="/mi-biblioteca"
                startIcon={<LibraryBooks />}
                sx={{
                  color: '#4a5568',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Mi Biblioteca
              </Button>
            )}
            
            {/* Mis Pedidos (solo si está logueado) */}
            {isAuthenticated && (
              <Button 
                color="inherit" 
                startIcon={<Assignment />}
                sx={{
                  color: '#4a5568',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    transform: 'translateY(-1px)'
                  }
                }}
                onClick={() => console.log('Ir a pedidos')}
              >
                Mis Pedidos
              </Button>
            )}
            
            {/* Menú Servicios */}
            <Button 
              color="inherit" 
              endIcon={<ExpandMore />}
              onClick={handleServicesMenuOpen}
              sx={{
                color: '#4a5568',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Servicios
            </Button>
            <Menu
              anchorEl={servicesAnchorEl}
              open={Boolean(servicesAnchorEl)}
              onClose={handleServicesMenuClose}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '12px',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  mt: 1
                }
              }}
            >
              <MenuItem onClick={() => handleServiceNavigation('libros')} sx={{ py: 1.5, px: 2 }}>
                <Book sx={{ mr: 2, color: '#667eea' }} />
                <Typography>Libros</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleServiceNavigation('ebooks')} sx={{ py: 1.5, px: 2 }}>
                <MenuBook sx={{ mr: 2, color: '#667eea' }} />
                <Typography>E-books</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleServiceNavigation('mercancia')} sx={{ py: 1.5, px: 2 }}>
                <ShoppingBag sx={{ mr: 2, color: '#667eea' }} />
                <Typography>Mercancía</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleServiceNavigation('webinars')} sx={{ py: 1.5, px: 2 }}>
                <School sx={{ mr: 2, color: '#667eea' }} />
                <Typography>Webinars</Typography>
              </MenuItem>
            </Menu>

            {/* Carrito de compras */}
            {isAuthenticated && (
              <IconButton
                component={Link}
                to="/cart"
                sx={{
                  color: '#4a5568',
                  ml: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Badge 
                  badgeContent={cartCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      minWidth: '18px',
                      height: '18px'
                    }
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
            )}
          
            {/* Autenticación */}
            {isAuthenticated ? (
              <>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="profile-menu"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  sx={{
                    ml: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Avatar sx={{ 
                    width: 36, 
                    height: 36, 
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    fontWeight: 'bold'
                  }}>
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  id="profile-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: '12px',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(20px)',
                      mt: 1
                    }
                  }}
                >
                  <MenuItem disabled sx={{ py: 1.5, px: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2d3748' }}>                    
                      {user?.nombre}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    component={Link} 
                    to="/profile" 
                    onClick={handleProfileMenuClose}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <Person sx={{ mr: 2, color: '#667eea' }} />
                    <Typography>Mi Perfil</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2, color: '#e53e3e' }}>
                    <Logout sx={{ mr: 2 }} />
                    <Typography>Cerrar Sesión</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                <Button 
                  variant="outlined"
                  component={Link} 
                  to="/login"
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    borderRadius: '20px',
                    padding: '0.5rem 1.5rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      background: 'rgba(102, 126, 234, 0.05)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  variant="contained"
                  component={Link} 
                  to="/register"
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    borderRadius: '20px',
                    padding: '0.5rem 1.5rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  Registrarse
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: 4,
          mt: 4,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="body2">
            © {new Date().getFullYear()} IMCYC. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default Layout;
