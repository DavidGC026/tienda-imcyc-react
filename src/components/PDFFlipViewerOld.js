import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Toolbar,
  Paper,
  Fab,
  Tooltip
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Fullscreen,
  Close,
  Home
} from '@mui/icons-material';

const PDFFlipViewer = ({ ebookId, title, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [totalPdfPages, setTotalPdfPages] = useState(1);
  const totalPages = totalPdfPages + 2; // PDF pages + portada + contraportada

  // Obtener la URL del PDF
  const token = localStorage.getItem('authToken');
  const pdfUrl = `${window.location.origin}/TiendaReact/api/ebooks/pdf-viewer.php?id=${ebookId}&action=view&token=${encodeURIComponent(token)}`;

  const handlePrevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const renderPage = () => {
    if (currentPage === 0) {
      // Portada
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            padding: 4
          }}
        >
          <Typography variant="h2" sx={{ mb: 3, fontSize: '4rem' }}>
            📚
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            IMCYC - Instituto Mexicano del Cemento y del Concreto
          </Typography>
        </Box>
      );
    } else if (currentPage === totalPages - 1) {
      // Contraportada
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            color: 'white',
            textAlign: 'center',
            padding: 4
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 4 }}>
            ¡Gracias por leer!
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.4 }}>
            Esperamos que este material haya sido útil para tu aprendizaje
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            © IMCYC - Todos los derechos reservados
          </Typography>
        </Box>
      );
    } else {
      // Páginas del PDF (currentPage - 1 porque la portada es 0)
      const pdfPageNumber = currentPage;
      const pdfUrlWithPage = `${pdfUrl}#page=${pdfPageNumber}`;
      
      return (
        <Box
          sx={{
            height: '100%',
            padding: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <iframe
            src={pdfUrlWithPage}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px'
            }}
            title={`${title} - Página ${pdfPageNumber}`}
          />
        </Box>
      );
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#f5f5f5'
    }}>
      {/* Toolbar */}
      <Paper elevation={2}>
        <Toolbar>
          <IconButton onClick={onClose} edge="start">
            <Close />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            {title}
          </Typography>

          <Typography variant="body2" sx={{ mr: 2 }}>
            Página {currentPage + 1} de {totalPages}
          </Typography>

          <IconButton onClick={toggleFullscreen}>
            <Fullscreen />
          </IconButton>
        </Toolbar>
      </Paper>

      {/* Content Container */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 3,
        position: 'relative'
      }}>
        {/* Book Container */}
        <Paper
          elevation={10}
          sx={{
            width: '90%',
            maxWidth: 800,
            height: '85%',
            maxHeight: 600,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            transform: isFlipping ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }}
        >
          {/* Page Content */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              opacity: isFlipping ? 0.7 : 1,
              transition: 'opacity 0.3s ease'
            }}
          >
            {renderPage()}
          </Box>

          {/* Page Flip Effect Overlay */}
          {isFlipping && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                background: 'linear-gradient(to left, rgba(255,255,255,0.8), transparent)',
                animation: 'pageFlip 0.6s ease-in-out',
                zIndex: 10,
                '@keyframes pageFlip': {
                  '0%': {
                    transform: 'rotateY(0deg)',
                    opacity: 0
                  },
                  '50%': {
                    transform: 'rotateY(90deg)',
                    opacity: 1
                  },
                  '100%': {
                    transform: 'rotateY(180deg)',
                    opacity: 0
                  }
                }
              }}
            />
          )}
        </Paper>
      </Box>

      {/* Navigation FABs */}
      <Tooltip title="Página anterior">
        <Fab
          color="primary"
          onClick={handlePrevPage}
          disabled={currentPage <= 0 || isFlipping}
          sx={{
            position: 'fixed',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            opacity: currentPage <= 0 ? 0.3 : 1
          }}
        >
          <NavigateBefore />
        </Fab>
      </Tooltip>

      <Tooltip title="Página siguiente">
        <Fab
          color="primary"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1 || isFlipping}
          sx={{
            position: 'fixed',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            opacity: currentPage >= totalPages - 1 ? 0.3 : 1
          }}
        >
          <NavigateNext />
        </Fab>
      </Tooltip>

      {/* Page Indicators */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 1000
        }}
      >
        {[0, 1, 2].map((page) => (
          <Box
            key={page}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: currentPage === page ? '#1976d2' : 'rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: currentPage === page ? '#1565c0' : 'rgba(0,0,0,0.5)',
                transform: 'scale(1.2)'
              }
            }}
            onClick={() => {
              if (!isFlipping && page !== currentPage) {
                setIsFlipping(true);
                setTimeout(() => {
                  setCurrentPage(page);
                  setIsFlipping(false);
                }, 300);
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PDFFlipViewer;