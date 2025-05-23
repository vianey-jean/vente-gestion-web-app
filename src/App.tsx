
import React from 'react';
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
    <AuthProvider>
      <StoreProvider>
        <VideoCallProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/produit/:id" element={<ProductDetail />} />
            <Route path="/categorie/:name" element={<CategoryPage />} />
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/panier" element={<CartPage />} />
              <Route path="/favoris" element={<FavoritesPage />} />
              <Route path="/paiement" element={<CheckoutPage />} />
              <Route path="/commandes" element={<OrdersPage />} />
              <Route path="/commande/:id" element={<OrderPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
            
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/service-client" element={<CustomerServicePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/histoire" element={<HistoryPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminProductsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="chat" element={<AdminChatPage />} />
              <Route path="client/:id" element={<AdminClientChatPage />} />
              <Route path="code-promos" element={<AdminPromoCodesPage />} />
            </Route>
            
            {/* Static pages */}
            <Route path="/confidentialite" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/conditions" element={<TermsPage />} />
            <Route path="/livraison" element={<DeliveryPage />} />
            <Route path="/retours" element={<ReturnsPage />} />
            <Route path="/transporteurs" element={<CarriersPage />} />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <CookieConsent />
          <Toaster />
        </VideoCallProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
