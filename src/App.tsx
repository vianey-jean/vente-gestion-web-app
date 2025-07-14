
/**
 * COMPOSANT PRINCIPAL DE L'APPLICATION
 * 
 * Ce fichier configure l'application React principale avec :
 * - Configuration des routes (React Router)
 * - Providers globaux (Auth, Theme, App, Query)
 * - Gestion des erreurs (ErrorBoundary)
 * - Configuration du client de requêtes (React Query)
 * 
 * STRUCTURE:
 * - QueryClient pour la gestion des requêtes
 * - Providers imbriqués pour le contexte global
 * - Routes définies avec React Router
 * - Composant Toaster pour les notifications
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RealtimeWrapper } from '@/components/common/RealtimeWrapper';

// Importation des pages
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import TendancesPage from '@/pages/TendancesPage';
import NotFound from '@/pages/NotFound';

import './App.css';

/**
 * Configuration du client React Query
 * - 1 seul retry en cas d'échec
 * - Pas de refetch automatique au focus
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Composant principal App
 * Configure toute l'architecture de l'application
 */
function App() {
  return (
    // Gestion globale des erreurs
    <ErrorBoundary>
      {/* Client de requêtes pour la gestion des données */}
      <QueryClientProvider client={queryClient}>
        {/* Gestion des thèmes (clair/sombre) */}
        <ThemeProvider>
          {/* Contexte d'authentification */}
          <AuthProvider>
            {/* Contexte de l'application (données globales) */}
            <AppProvider>
              {/* Wrapper pour la synchronisation temps réel */}
              <RealtimeWrapper>
                <div className="App">
                  {/* Configuration du routeur */}
                  <Router>
                    <Routes>
                      {/* Routes publiques */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      
                      {/* Routes d'authentification */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      
                      {/* Routes protégées */}
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/tendances" element={<TendancesPage />} />
                      
                      {/* Gestion des erreurs 404 */}
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </Router>
                  {/* Système de notifications toast */}
                  <Toaster />
                </div>
              </RealtimeWrapper>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
