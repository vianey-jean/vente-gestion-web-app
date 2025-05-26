
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { VideoCallProvider } from './contexts/VideoCallContext';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import AllProductsPage from './pages/AllProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import OrdersPage from './pages/OrdersPage';
import OrderPage from './pages/OrderPage';
import ContactPage from './pages/ContactPage';
import ChatPage from './pages/ChatPage';
import CustomerServicePage from './pages/CustomerServicePage';
import HistoryPage from './pages/HistoryPage';
import BlogPage from './pages/BlogPage';
import NotFound from './pages/NotFound';

// Legal pages
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import CookiesPage from './pages/CookiesPage';
import DeliveryPage from './pages/DeliveryPage';
import ReturnsPage from './pages/ReturnsPage';
import CarriersPage from './pages/CarriersPage';
import FAQPage from './pages/FAQPage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminFlashSalesPage from './pages/admin/AdminFlashSalesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminClientChatPage from './pages/admin/AdminClientChatPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import AdminCodePromosPage from './pages/admin/AdminCodePromosPage';
import AdminPromoCodesPage from './pages/admin/AdminPromoCodesPage';
import AdminPubLayoutPage from './pages/admin/AdminPubLayoutPage';
import AdminRemboursementsPage from './pages/admin/AdminRemboursementsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Route protection
import ProtectedRoute from './components/ProtectedRoute';
import SecureRoute from './components/SecureRoute';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <VideoCallProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <Router>
                <div className="App">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/category/:categoryName" element={<CategoryPage />} />
                    <Route path="/products" element={<AllProductsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/customer-service" element={<CustomerServicePage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    
                    {/* Legal pages */}
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
                    <Route path="/cookies" element={<CookiesPage />} />
                    <Route path="/delivery" element={<DeliveryPage />} />
                    <Route path="/returns" element={<ReturnsPage />} />
                    <Route path="/carriers" element={<CarriersPage />} />
                    <Route path="/faq" element={<FAQPage />} />

                    {/* Protected routes */}
                    <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                    <Route path="/order/:id" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

                    {/* Admin routes */}
                    <Route path="/admin" element={<SecureRoute><AdminLayout /></SecureRoute>}>
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="categories" element={<AdminCategoriesPage />} />
                      <Route path="flash-sales" element={<AdminFlashSalesPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="messages" element={<AdminMessagesPage />} />
                      <Route path="client-chat" element={<AdminClientChatPage />} />
                      <Route path="chat" element={<AdminChatPage />} />
                      <Route path="code-promos" element={<AdminCodePromosPage />} />
                      <Route path="promo-codes" element={<AdminPromoCodesPage />} />
                      <Route path="pub-layout" element={<AdminPubLayoutPage />} />
                      <Route path="remboursements" element={<AdminRemboursementsPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </ThemeProvider>
          </VideoCallProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
