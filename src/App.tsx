import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
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
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import SecureRoute from './components/SecureRoute';
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);
  const { checkAuth } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setLoading(false);
    };
    verifyAuth();
  }, [checkAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster richColors position="top-center" />
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:categoryName" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/politique-cookies" element={<CookiesPage />} />
              
              {/* Routes privées */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/commandes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              
              {/* Routes Admin */}
              <Route path="/admin" element={<SecureRoute allowedRoles={['admin']}><AdminLayout /></SecureRoute>} />
              <Route path="/admin/products" element={<SecureRoute allowedRoles={['admin']}><AdminProductsPage /></SecureRoute>} />
              <Route path="/admin/orders" element={<SecureRoute allowedRoles={['admin']}><AdminOrdersPage /></SecureRoute>} />
              <Route path="/admin/users" element={<SecureRoute allowedRoles={['admin']}><AdminUsersPage /></SecureRoute>} />
              <Route path="/admin/settings" element={<SecureRoute allowedRoles={['admin']}><AdminSettingsPage /></SecureRoute>} />
              <Route path="/admin/messages" element={<SecureRoute allowedRoles={['admin']}><AdminMessagesPage /></SecureRoute>} />
              <Route path="/admin/chat" element={<SecureRoute allowedRoles={['admin']}><AdminChatPage /></SecureRoute>} />
              <Route path="/admin/client-chat/:userId" element={<SecureRoute allowedRoles={['admin']}><AdminClientChatPage /></SecureRoute>} />
              <Route path="/admin/promo-codes" element={<SecureRoute allowedRoles={['admin']}><AdminPromoCodes /></SecureRoute>} />
              
              {/* Fallback pour les routes non trouvées */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </QueryClientProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default App;
