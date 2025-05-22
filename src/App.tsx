
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import SecureRoute from '@/components/SecureRoute';
import CookieConsent from '@/components/prompts/CookieConsent';

// Pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';
import ProductDetail from '@/pages/ProductDetail';
import CartPage from '@/pages/CartPage';
import FavoritesPage from '@/pages/FavoritesPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderPage from '@/pages/OrderPage';
import CheckoutPage from '@/pages/CheckoutPage';
import CategoryPage from '@/pages/CategoryPage';
import ContactPage from '@/pages/ContactPage';
import FAQPage from '@/pages/FAQPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import ReturnsPage from '@/pages/ReturnsPage';
import DeliveryPage from '@/pages/DeliveryPage';
import CarriersPage from '@/pages/CarriersPage';
import BlogPage from '@/pages/BlogPage';
import CookiesPage from '@/pages/CookiesPage';
import ChatPage from '@/pages/ChatPage';
import CustomerServicePage from '@/pages/CustomerServicePage';
import HistoryPage from '@/pages/HistoryPage';

// Admin pages
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminMessagesPage from '@/pages/admin/AdminMessagesPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminChatPage from '@/pages/admin/AdminChatPage';
import AdminClientChatPage from '@/pages/admin/AdminClientChatPage';

const App: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/carriers" element={<CarriersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/politique-cookies" element={<CookiesPage />} />
          <Route path="/histoire" element={<HistoryPage />} />
          <Route path="/service-client" element={<CustomerServicePage />} />

          {/* Routes sécurisées (avec un ID obfusqué) */}
          <Route path="/s/:secureId" element={
            <SecureRoute>
              <ProductDetail />
            </SecureRoute>
          } />

          {/* Pages protégées pour utilisateurs authentifiés */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Pages d'administration */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminChatPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminProductsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminOrdersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminMessagesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminSettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminChatPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/client-chat"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminClientChatPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Cookie Consent Banner */}
        <CookieConsent />

        {/* Toasts/Notifications */}
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
};

export default App;
