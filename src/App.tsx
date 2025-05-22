
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Profile from './pages/ProfilePage';
import Products from './pages/ProductDetail';
import ProductDetails from './pages/ProductDetail';
import Cart from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ContactPage from './pages/ContactPage';
import CookiesPage from './pages/CookiesPage';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import AdminClientChatPage from './pages/admin/AdminClientChatPage';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import SecureRoute from './components/SecureRoute';
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import ProtectedRoute from './components/ProtectedRoute';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Simple loading effect for improved UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:categoryName" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/politique-cookies" element={<CookiesPage />} />
        <Route path="/favoris" element={<FavoritesPage />} />
        
        {/* Routes privées */}
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/commandes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        
        {/* Routes Admin */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requireAdmin={true}><AdminProductsPage /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute requireAdmin={true}><AdminOrdersPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requireAdmin={true}><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute requireAdmin={true}><AdminMessagesPage /></ProtectedRoute>} />
        <Route path="/admin/chat" element={<ProtectedRoute requireAdmin={true}><AdminChatPage /></ProtectedRoute>} />
        <Route path="/admin/client-chat/:userId" element={<ProtectedRoute requireAdmin={true}><AdminClientChatPage /></ProtectedRoute>} />
        <Route path="/admin/promo-codes" element={<ProtectedRoute requireAdmin={true}><AdminPromoCodes /></ProtectedRoute>} />
        
        {/* Fallback pour les routes non trouvées */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
