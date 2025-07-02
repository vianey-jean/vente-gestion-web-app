
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SecureRoute from '@/components/SecureRoute';
import LoadingFallback from './LoadingFallback';

// Pages publiques
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import RegisterBlockPage from '@/pages/RegisterBlockPage';
import MaintenancePage from '@/pages/MaintenancePage';
import MaintenanceLoginPage from '@/pages/MaintenanceLoginPage';
import NotFound from '@/pages/NotFound';

// Pages produits
import AllProductsPage from '@/pages/AllProductsPage';
import CategoryPage from '@/pages/CategoryPage';
import ProductDetail from '@/pages/ProductDetail';
import NewArrivalsPage from '@/pages/NewArrivalsPage';
import PopularityPage from '@/pages/PopularityPage';
import PromotionalProductsPage from '@/pages/PromotionalProductsPage';
import FlashSalePage from '@/pages/FlashSalePage';

// Pages utilisateur
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PaymentFailurePage from '@/pages/PaymentFailurePage';
import OrdersPage from '@/pages/OrdersPage';
import OrderPage from '@/pages/OrderPage';
import FavoritesPage from '@/pages/FavoritesPage';
import ProfilePage from '@/pages/ProfilePage';
import ProfilPage from '@/pages/ProfilPage';

// Pages informatives
import ContactPage from '@/pages/ContactPage';
import CustomerServicePage from '@/pages/CustomerServicePage';
import ChatPage from '@/pages/ChatPage';
import FAQPage from '@/pages/FAQPage';
import BlogPage from '@/pages/BlogPage';
import HistoryPage from '@/pages/HistoryPage';

// Pages légales
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import CookiesPage from '@/pages/CookiesPage';
import MentionsLegalesPage from '@/pages/MentionsLegalesPage';
import ReturnsPage from '@/pages/ReturnsPage';
import DeliveryPage from '@/pages/DeliveryPage';
import CarriersPage from '@/pages/CarriersPage';

// Pages admin
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminMessagesPage from '@/pages/admin/AdminMessagesPage';
import AdminFlashSalesPage from '@/pages/admin/AdminFlashSalesPage';
import AdminCodePromosPage from '@/pages/admin/AdminCodePromosPage';
import AdminRemboursementsPage from '@/pages/admin/AdminRemboursementsPage';
import AdminRefundsPage from '@/pages/admin/AdminRefundsPage';
import AdminChatPage from '@/pages/admin/AdminChatPage';
import AdminClientChatPage from '@/pages/admin/AdminClientChatPage';
import AdminPubLayoutPage from '@/pages/admin/AdminPubLayoutPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register-block" element={<RegisterBlockPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/maintenance-login" element={<MaintenanceLoginPage />} />
      
      {/* Routes produits */}
      <Route path="/products" element={<AllProductsPage />} />
      <Route path="/category/:categoryName" element={<CategoryPage />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route path="/nouveautes" element={<NewArrivalsPage />} />
      <Route path="/popularite" element={<PopularityPage />} />
      <Route path="/promotions" element={<PromotionalProductsPage />} />
      <Route path="/flash-sale" element={<FlashSalePage />} />
      
      {/* Routes utilisateur protégées */}
      <Route path="/panier" element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />
      <Route path="/paiement/succes" element={
        <ProtectedRoute>
          <PaymentSuccessPage />
        </ProtectedRoute>
      } />
      <Route path="/paiement/echec" element={
        <ProtectedRoute>
          <PaymentFailurePage />
        </ProtectedRoute>
      } />
      <Route path="/commandes" element={
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      } />
      <Route path="/commande/:orderId" element={
        <ProtectedRoute>
          <OrderPage />
        </ProtectedRoute>
      } />
      <Route path="/favoris" element={
        <ProtectedRoute>
          <FavoritesPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profil" element={
        <ProtectedRoute>
          <ProfilPage />
        </ProtectedRoute>
      } />
      
      {/* Routes informatives */}
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/service-client" element={<CustomerServicePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/histoire" element={<HistoryPage />} />
      
      {/* Routes légales */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/returns" element={<ReturnsPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/carriers" element={<CarriersPage />} />
      
      {/* Routes admin protégées */}
      <Route 
        path="/admin/*" 
        element={
          <SecureRoute>
            <AdminLayout>
              <Routes>
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="flash-sales" element={<AdminFlashSalesPage />} />
                <Route path="code-promos" element={<AdminCodePromosPage />} />
                <Route path="remboursements" element={<AdminRemboursementsPage />} />
                <Route path="refunds" element={<AdminRefundsPage />} />
                <Route path="chat" element={<AdminChatPage />} />
                <Route path="client-chat" element={<AdminClientChatPage />} />
                <Route path="pub-layout" element={<AdminPubLayoutPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Routes>
            </AdminLayout>
          </SecureRoute>
        } 
      />
      
      {/* Route 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
