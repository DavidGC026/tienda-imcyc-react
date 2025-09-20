import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slider,
  Button,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { apiClient } from '../services/authService';

// Configurar worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const Page = forwardRef(({ children, number }, ref) => {
  return (
    <div className="demo-page" ref={ref} style={{
      backgroundColor: 'white',
      color: '#000',
      border: '1px solid #ccc',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {children}
    </div>
  );
});

Page.displayName = 'Page';

const PDFFlipViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const flipBookRef = useRef();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(3);
  const [pdfPages, setPdfPages] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('Cargando...');
  const [pdfDoc, setPdfDoc] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Renderizar página del PDF como imagen
  const renderPDFPage = useCallback(async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error renderizando página:', pageNum, error);
      return null;
    }
  }, []);

  // Cargar PDF y generar páginas
  useEffect(() => {
    const loadEbook = async () => {
      try {
        setIsLoading(true);
        // Cargar el PDF usando apiClient que maneja la autenticación automáticamente
        const response = await apiClient.get(`/ebooks/pdf-viewer.php?id=${id}`, {
          responseType: 'arraybuffer'
        });
        
        const arrayBuffer = response.data;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        
        const numPages = pdf.numPages;
        setTitle('Manual de Construcción IMCYC');
        
        // Generar imágenes para todas las páginas del PDF
        const pages = [];
        
        for (let i = 1; i <= numPages; i++) {
          const pageImage = await renderPDFPage(pdf, i);
          if (pageImage) {
            pages.push(pageImage);
          }
          
          // Actualizar progreso de carga
          const progress = Math.round((i / numPages) * 100);
          setLoadingProgress(progress);
        }
        
        setPdfPages(pages);
        setTotalPages(pages.length + 1); // +1 por contraportada solamente
        
      } catch (error) {
        console.error('Error al cargar el ebook:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadEbook();
    }
  }, [id, renderPDFPage]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleNextPage = useCallback(() => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flipNext();
    }
  }, []);

  const handlePrevPage = useCallback(() => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  }, []);

  const handlePageChange = useCallback((e) => {
    setCurrentPage(e.data);
  }, []);

  const handleGoToPage = useCallback((event, newValue) => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flip(newValue);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom + 10, 200)); // Máximo 200%
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom - 10, 50)); // Mínimo 50%
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          zIndex: 1300
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
          {loadingProgress === 0 ? 'Cargando ebook...' : `Generando páginas: ${loadingProgress}%`}
        </Typography>
        {loadingProgress > 0 && (
          <Box sx={{ width: '60%', maxWidth: 400 }}>
            <LinearProgress 
              variant="determinate" 
              value={loadingProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                }
              }} 
            />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#2c2c2c',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header con controles */}
      <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={() => navigate('/mi-biblioteca')}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div" noWrap>
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Controles de zoom */}
            <IconButton color="inherit" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut />
            </IconButton>
            <Typography 
              variant="body2" 
              sx={{ minWidth: '50px', textAlign: 'center', fontSize: '0.8rem' }}
              onClick={handleResetZoom}
              style={{ cursor: 'pointer' }}
              title="Clic para restablecer zoom"
            >
              {zoom}%
            </Typography>
            <IconButton color="inherit" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn />
            </IconButton>
            
            {/* Separador */}
            <Box sx={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.3)', mx: 1 }} />
            
            {/* Controles de navegación */}
            <IconButton color="inherit" onClick={handlePrevPage}>
              <NavigateBefore />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'center' }}>
              {currentPage + 1} / {totalPages}
            </Typography>
            <IconButton color="inherit" onClick={handleNextPage}>
              <NavigateNext />
            </IconButton>
            
            {/* Separador */}
            <Box sx={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.3)', mx: 1 }} />
            
            {/* Control de pantalla completa */}
            <IconButton color="inherit" onClick={handleFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Barra de progreso */}
      <Paper sx={{ p: 2, m: 2, backgroundColor: '#333' }}>
        <Typography variant="body2" sx={{ mb: 1, color: 'white' }}>
          Progreso de lectura
        </Typography>
        <Slider
          value={currentPage}
          onChange={handleGoToPage}
          max={totalPages - 1}
          step={1}
          marks
          valueLabelDisplay="auto"
          sx={{ color: '#1976d2' }}
        />
      </Paper>

      {/* Contenedor del libro */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          overflow: 'hidden'
        }}
      >
        <HTMLFlipBook
          width={400}
          height={600}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1533}
          showCover={false}
          flippingTime={1000}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          mobileScrollSupport={false}
          onFlip={handlePageChange}
          ref={flipBookRef}
          className="demo-book"
        >
          {/* Páginas del PDF */}
          {pdfPages.map((pageImage, index) => (
            <Page key={index} number={index}>
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={pageImage}
                  alt={`Página ${index + 1}`}
                  style={{
                    maxWidth: zoom <= 100 ? '100%' : 'none',
                    maxHeight: zoom <= 100 ? '100%' : 'none',
                    width: zoom > 100 ? `${zoom}%` : 'auto',
                    height: zoom > 100 ? `${zoom}%` : 'auto',
                    objectFit: zoom <= 100 ? 'contain' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Box>
            </Page>
          ))}

          {/* Contraportada */}
          <Page number={totalPages - 1}>
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
                padding: 4,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.3s ease'
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
          </Page>
        </HTMLFlipBook>
      </Box>

      {/* Snackbar para errores */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PDFFlipViewer;