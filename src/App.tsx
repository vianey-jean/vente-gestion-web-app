
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
// Main pages
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import OrdersPage from './pages/OrdersPage';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import CustomerServicePage from './pages/CustomerServicePage';
import ChatPage from './pages/ChatPage';
import BlogPage from './pages/BlogPage';
import FAQPage from './pages/FAQPage';
import HistoryPage from './pages/HistoryPage';
// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import AdminClientChatPage from './pages/admin/AdminClientChatPage';
import AdminPromoCodesPage from './pages/admin/AdminPromoCodesPage';
// Static pages
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import TermsPage from './pages/TermsPage';
import DeliveryPage from './pages/DeliveryPage';
import ReturnsPage from './pages/ReturnsPage';
import CarriersPage from './pages/CarriersPage';
import ProtectedRoute from './components/ProtectedRoute';
import CookieConsent from './components/prompts/CookieConsent';
// Contexts
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider } from './contexts/AuthContext';
import { VideoCallProvider } from './contexts/VideoCallContext';
import '@/App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <StoreProvider>
          <VideoCallProvider>
            <Routes>
              {/* Main Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/category/:name" element={<CategoryPage />} />
              
              {/* Info Routes */}
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/customer-service" element={<CustomerServicePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/carriers" element={<CarriersPage />} />
              
              {/* Protected Routes */}
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/order/:id" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminChatPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="chat" element={<AdminClientChatPage />} />
                <Route path="promocodes" element={<AdminPromoCodesPage />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <CookieConsent />
          </VideoCallProvider>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
