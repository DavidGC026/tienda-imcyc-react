import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PDFFlipViewer from '../components/PDFFlipViewer';
import { useAuth } from '../contexts/AuthContext';

const EbookViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const title = searchParams.get('title') || 'Ebook';

  // Verificar autenticación
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleClose = () => {
    navigate('/mi-biblioteca');
  };

  return (
    <PDFFlipViewer
      ebookId={id}
      title={title}
      onClose={handleClose}
    />
  );
};

export default EbookViewerPage;