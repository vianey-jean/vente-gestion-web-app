
import React, { useEffect } from 'react';
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

// Components
import SecureRoute from './components/SecureRoute';
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
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/category/:name" element={<CategoryPage />} />

              {/* Customer Service Routes */}
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/service-client" element={<CustomerServicePage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/blog" element={<BlogPage />} />

              {/* Info Pages */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/carriers" element={<CarriersPage />} />
              <Route path="/history" element={<HistoryPage />} />

              {/* Protected Customer Routes */}
              <Route path="/panier" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/favoris" element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/commandes" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/commande/:id" element={
                <ProtectedRoute>
                  <OrderPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProductsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminUsersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/messages" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminMessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/chat" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminChatPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/client-chat" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminClientChatPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/promo-codes" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPromoCodesPage />
                </ProtectedRoute>
              } />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Toaster for notifications */}
            <Toaster richColors position="top-right" />
            
            {/* Cookie consent banner */}
            <CookieConsent />
          </VideoCallProvider>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
