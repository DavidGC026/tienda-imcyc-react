import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MiBibliotecaPage from './pages/MiBibliotecaPage';
import EbookViewerPage from './pages/EbookViewerPage';
import ProfilePage from './pages/ProfilePage';
import MisPedidosPage from './pages/MisPedidosPage';

// Components
import Layout from './components/layout/Layout';

// Styles
import './styles/global.css';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#f093fb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
});

// Create QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <Router basename="/TiendaReact">
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/mi-biblioteca" element={<MiBibliotecaPage />} />
                  <Route path="/ebook/:id" element={<EbookViewerPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/mis-pedidos" element={<MisPedidosPage />} />
                </Routes>
              </Layout>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
