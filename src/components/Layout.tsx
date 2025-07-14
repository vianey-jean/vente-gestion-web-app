
/**
 * COMPOSANT LAYOUT PRINCIPAL
 * 
 * Ce composant définit la structure globale de toutes les pages :
 * - Navigation principale (Navbar)
 * - Contenu principal flexible
 * - Pied de page (Footer)
 * - Bouton de retour en haut
 * - Protection des routes privées
 * - Intégration de la synchronisation temps réel
 * 
 * FONCTIONNALITÉS:
 * - Gestion de l'authentification requise
 * - Redirection automatique si non connecté
 * - Wrapper pour la synchronisation temps réel
 * - Structure responsive adaptative
 */

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RealtimeWrapper } from './common/RealtimeWrapper';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Props du composant Layout
 */
interface LayoutProps {
  children?: React.ReactNode;
  requireAuth?: boolean; // Indique si l'authentification est requise
}

// ============================================
// COMPOSANT LAYOUT
// ============================================

/**
 * Composant Layout principal
 * Structure globale de l'application avec navigation et protection
 */
const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  // Hooks de navigation et authentification
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // ============================================
  // GESTION DE LA PROTECTION DES ROUTES
  // ============================================
  
  /**
   * Redirection si authentification requise mais utilisateur non connecté
   * Sauvegarde la route tentée pour redirection après connexion
   */
  if (requireAuth && !isLoading && !isAuthenticated) {
    console.log('🔒 Redirection vers login - Route protégée:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // ============================================
  // STRUCTURE DU LAYOUT
  // ============================================
  
  /**
   * Structure principale du layout
   * - Header fixe avec navigation
   * - Main flexible pour le contenu
   * - Footer en bas de page
   * - Bouton scroll to top flottant
   */
  const content = (
    <div className="flex flex-col min-h-screen">
      {/* En-tête avec navigation */}
      <Navbar />
      
      {/* Contenu principal flexible */}
      <main className="flex-grow">
        {/* Affichage du contenu - children ou Outlet pour les routes */}
        {children || <Outlet />}
      </main>
      
      {/* Pied de page */}
      <Footer />
      
      {/* Bouton de retour en haut (scroll to top) */}
      <ScrollToTop />
    </div>
  );
  
  // ============================================
  // WRAPPER TEMPS RÉEL POUR UTILISATEURS CONNECTÉS
  // ============================================
  
  /**
   * Si l'utilisateur est connecté, on enveloppe le contenu
   * avec le wrapper de synchronisation temps réel
   */
  if (isAuthenticated) {
    console.log('📡 Layout avec synchronisation temps réel activée');
    return (
      <RealtimeWrapper>
        {content}
      </RealtimeWrapper>
    );
  }
  
  // Layout simple pour les utilisateurs non connectés
  console.log('📄 Layout simple - Utilisateur non connecté');
  return content;
};

export default Layout;
