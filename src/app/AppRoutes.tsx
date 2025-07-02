
import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SecureRoute from '@/components/SecureRoute';
import { initSecureRoutes, getSecureRoute } from '@/services/secureIds';
import MaintenanceChecker from './MaintenanceChecker';
import RegistrationChecker from './RegistrationChecker';
import LoadingFallback from './LoadingFallback';

// Chargement paresseux des pages pour optimiser les performances
const HomePage = lazy(() => import('@/pages/HomePage'));
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));
const MaintenanceLoginPage = lazy(() => import('@/pages/MaintenanceLoginPage'));
const RegisterBlockPage = lazy(() => import('@/pages/RegisterBlockPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const DeliveryPage = lazy(() => import('@/pages/DeliveryPage'));
const ReturnsPage = lazy(() => import('@/pages/ReturnsPage'));
const AllProductsPage = lazy(() => import('@/pages/AllProductsPage'));
const PromotionalProductsPage = lazy(() => import('@/pages/PromotionalProductsPage'));
const NewArrivalsPage = lazy(() => import('@/pages/NewArrivalsPage'));
const PopularityPage = lazy(() => import('@/pages/PopularityPage'));
const CustomerServicePage = lazy(() => import('@/pages/CustomerServicePage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const CarriersPage = lazy(() => import('@/pages/CarriersPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const CookiesPage = lazy(() => import('@/pages/CookiesPage'));
const MentionsLegalesPage = lazy(() => import('@/pages/MentionsLegalesPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage'));
const PaymentFailurePage = lazy(() => import('@/pages/PaymentFailurePage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderPage = lazy(() => import('@/pages/OrderPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ProfilPage = lazy(() => import('@/pages/ProfilPage'));
const FlashSalePage = lazy(() => import('@/pages/FlashSalePage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Pages Admin avec lazy loading
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminMessagesPage = lazy(() => import('@/pages/admin/AdminMessagesPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminChatPage = lazy(() => import('@/pages/admin/AdminChatPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminClientChatPage = lazy(() => import('@/pages/admin/AdminClientChatPage'));
const AdminCodePromosPage = lazy(() => import('@/pages/admin/AdminCodePromosPage'));
const AdminPubLayoutPage = lazy(() => import('@/pages/admin/AdminPubLayoutPage'));
const AdminRemboursementsPage = lazy(() => import('@/pages/admin/AdminRemboursementsPage'));
const AdminRefundsPage = lazy(() => import('@/pages/admin/AdminRefundsPage'));
const AdminFlashSalesPage = lazy(() => import('@/pages/admin/AdminFlashSalesPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'));

// Initialiser les routes sécurisées
const secureRoutes = initSecureRoutes();

const AppRoutes: React.FC = () => {
  const location = useLocation();
  
  // Remonter la page au changement de route
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("Navigation vers:", location.pathname);
  }, [location.pathname]);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Route sécurisée pour la page de maintenance-login */}
        <Route path={secureRoutes.get('/maintenance-login')?.substring(1)} element={<MaintenanceLoginPage />} />
        <Route path="/maintenance-login" element={<Navigate to={secureRoutes.get('/maintenance-login') || '/'} replace />} />
        
        {/* Route principale avec vérification de maintenance */}
        <Route path="/" element={
          <MaintenanceChecker>
            <HomePage />
          </MaintenanceChecker>
        } />
        
        {/* Routes d'authentification sécurisées */}
        <Route path={secureRoutes.get('/login')?.substring(1)} element={
          <MaintenanceChecker>
            <LoginPage />
          </MaintenanceChecker>
        } />
        <Route path="/login" element={<Navigate to={secureRoutes.get('/login') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/register')?.substring(1)} element={
          <MaintenanceChecker>
            <RegistrationChecker>
              <RegisterPage />
            </RegistrationChecker>
          </MaintenanceChecker>
        } />
        <Route path="/register" element={<Navigate to={secureRoutes.get('/register') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/forgot-password')?.substring(1)} element={
          <MaintenanceChecker>
            <ForgotPasswordPage />
          </MaintenanceChecker>
        } />
        <Route path="/forgot-password" element={<Navigate to={secureRoutes.get('/forgot-password') || '/'} replace />} />
        
        {/* Routes produits */}
        <Route path="/products" element={
          <MaintenanceChecker>
            <AllProductsPage />
          </MaintenanceChecker>
        } />
        
        <Route path="/category/:categoryName" element={
          <MaintenanceChecker>
            <CategoryPage />
          </MaintenanceChecker>
        } />
        
        <Route path="/product/:productId" element={
          <MaintenanceChecker>
            <ProductDetail />
          </MaintenanceChecker>
        } />
        
        <Route path="/nouveautes" element={
          <MaintenanceChecker>
            <NewArrivalsPage />
          </MaintenanceChecker>
        } />
        
        <Route path="/popularite" element={
          <MaintenanceChecker>
            <PopularityPage />
          </MaintenanceChecker>
        } />
        
        <Route path="/promotions" element={
          <MaintenanceChecker>
            <PromotionalProductsPage />
          </MaintenanceChecker>
        } />
        
        {/* Route sécurisée pour les ventes flash */}
        <Route path={secureRoutes.get('/flash-sale')?.substring(1)} element={
          <MaintenanceChecker>
            <FlashSalePage />
          </MaintenanceChecker>
        } />
        <Route path="/flash-sale" element={<Navigate to={secureRoutes.get('/flash-sale') || '/'} replace />} />
        
        {/* Routes utilisateur protégées */}
        <Route path={secureRoutes.get('/panier')?.substring(1)} element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        <Route path="/panier" element={<Navigate to={secureRoutes.get('/panier') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/checkout')?.substring(1)} element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        <Route path="/checkout" element={<Navigate to={secureRoutes.get('/checkout') || '/'} replace />} />
        
        {/* Routes de paiement sécurisées */}
        <Route path={secureRoutes.get('/paiement/succes')?.substring(1)} element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <PaymentSuccessPage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        <Route path="/paiement/succes" element={<Navigate to={secureRoutes.get('/paiement/succes') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/paiement/echec')?.substring(1)} element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <PaymentFailurePage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        <Route path="/paiement/echec" element={<Navigate to={secureRoutes.get('/paiement/echec') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/commandes')?.substring(1)} element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        <Route path="/commandes" element={<Navigate to={secureRoutes.get('/commandes') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/favoris')?.substring(1)} element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        <Route path="/favoris" element={<Navigate to={secureRoutes.get('/favoris') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/profile')?.substring(1)} element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        <Route path="/profile" element={<Navigate to={secureRoutes.get('/profile') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/profil')?.substring(1)} element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <ProfilPage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        <Route path="/profil" element={<Navigate to={secureRoutes.get('/profil') || '/'} replace />} />
        
        {/* Routes informatives */}
        <Route path={secureRoutes.get('/contact')?.substring(1)} element={
          <MaintenanceChecker>
            <ContactPage />
          </MaintenanceChecker>
        } />
        <Route path="/contact" element={<Navigate to={secureRoutes.get('/contact') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/service-client')?.substring(1)} element={
          <MaintenanceChecker>
            <CustomerServicePage />
          </MaintenanceChecker>
        } />
        <Route path="/service-client" element={<Navigate to={secureRoutes.get('/service-client') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/chat')?.substring(1)} element={
          <MaintenanceChecker>
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          </MaintenanceChecker>
        } />
        <Route path="/chat" element={<Navigate to={secureRoutes.get('/chat') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/faq')?.substring(1)} element={
          <MaintenanceChecker>
            <FAQPage />
          </MaintenanceChecker>
        } />
        <Route path="/faq" element={<Navigate to={secureRoutes.get('/faq') || '/'} replace />} />
        
        <Route path="/blog" element={
          <MaintenanceChecker>
            <BlogPage />
          </MaintenanceChecker>
        } />
        
        <Route path={secureRoutes.get('/histoire')?.substring(1)} element={
          <MaintenanceChecker>
            <HistoryPage />
          </MaintenanceChecker>
        } />
        <Route path="/histoire" element={<Navigate to={secureRoutes.get('/histoire') || '/'} replace />} />
        
        {/* Routes légales */}
        <Route path={secureRoutes.get('/terms')?.substring(1)} element={
          <MaintenanceChecker>
            <TermsPage />
          </MaintenanceChecker>
        } />
        <Route path="/terms" element={<Navigate to={secureRoutes.get('/terms') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/privacy')?.substring(1)} element={
          <MaintenanceChecker>
            <PrivacyPage />
          </MaintenanceChecker>
        } />
        <Route path="/privacy" element={<Navigate to={secureRoutes.get('/privacy') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/cookies')?.substring(1)} element={
          <MaintenanceChecker>
            <CookiesPage />
          </MaintenanceChecker>
        } />
        <Route path="/cookies" element={<Navigate to={secureRoutes.get('/cookies') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/mentions-legales')?.substring(1)} element={
          <MaintenanceChecker>
            <MentionsLegalesPage />
          </MaintenanceChecker>
        } />
        <Route path="/mentions-legales" element={<Navigate to={secureRoutes.get('/mentions-legales') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/returns')?.substring(1)} element={
          <MaintenanceChecker>
            <ReturnsPage />
          </MaintenanceChecker>
        } />
        <Route path="/returns" element={<Navigate to={secureRoutes.get('/returns') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/delivery')?.substring(1)} element={
          <MaintenanceChecker>
            <DeliveryPage />
          </MaintenanceChecker>
        } />
        <Route path="/delivery" element={<Navigate to={secureRoutes.get('/delivery') || '/'} replace />} />
        
        <Route path={secureRoutes.get('/carriers')?.substring(1)} element={
          <MaintenanceChecker>
            <CarriersPage />
          </MaintenanceChecker>
        } />
        <Route path="/carriers" element={<Navigate to={secureRoutes.get('/carriers') || '/'} replace />} />
        
        {/* Routes admin protégées avec lazy loading */}
        <Route 
          path={`${secureRoutes.get('/admin')?.substring(1)}/*`}
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SecureRoute>
                <ProtectedRoute requireAdmin>
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
                </ProtectedRoute>
              </SecureRoute>
            </Suspense>
          } 
        />
        <Route path="/admin/*" element={<Navigate to={secureRoutes.get('/admin') || '/'} replace />} />
        
        {/* Route dynamique pour les commandes sécurisées */}
        <Route path="/:secureOrderId" element={
          <MaintenanceChecker>
            <SecureRoute>
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            </SecureRoute>
          </MaintenanceChecker>
        } />
        
        {/* Route 404 */}
        <Route path="/page/notfound" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
