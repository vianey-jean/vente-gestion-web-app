
/**
 * COMPOSANT NAVBAR - NAVIGATION PRINCIPALE
 * 
 * Ce composant gère la barre de navigation principale :
 * - Menu de navigation responsive
 * - Gestion de l'état de connexion
 * - Boutons d'action (connexion/déconnexion)
 * - Menu mobile avec hamburger
 * - Indicateur de thème (clair/sombre)
 * - Liens vers les pages principales
 * 
 * FONCTIONNALITÉS:
 * - Navigation adaptive mobile/desktop
 * - Affichage conditionnel selon l'authentification
 * - Intégration du système de thème
 * - Menu déroulant pour mobile
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Info, Mail, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

// ============================================
// COMPOSANT NAVBAR
// ============================================

/**
 * Composant de navigation principal
 * Gère l'affichage de tous les liens et actions de navigation
 */
const Navbar: React.FC = () => {
  // Hooks et états
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { ThemeToggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================
  // GESTION DES ACTIONS
  // ============================================

  /**
   * Gère la déconnexion utilisateur
   * Ferme le menu mobile et redirige vers l'accueil
   */
  const handleLogout = (): void => {
    console.log('🚪 Déconnexion depuis la navbar');
    setIsMenuOpen(false);
    logout();
    navigate('/');
  };

  /**
   * Ferme le menu mobile lors du clic sur un lien
   */
  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  /**
   * Vérifie si un lien est actif basé sur la route actuelle
   */
  const isActiveLink = (path: string): boolean => {
    return location.pathname === path;
  };

  // ============================================
  // DÉFINITION DES LIENS DE NAVIGATION
  // ============================================

  /**
   * Liens de navigation publics (toujours visibles)
   */
  const publicLinks = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/about', label: 'À propos', icon: Info },
    { path: '/contact', label: 'Contact', icon: Mail }
  ];

  /**
   * Liens de navigation privés (utilisateurs connectés seulement)
   */
  const privateLinks = [
    { path: '/dashboard', label: 'Tableau de bord', icon: Settings },
    { path: '/tendances', label: 'Tendances', icon: BarChart3 }
  ];

  // ============================================
  // RENDU DU COMPOSANT
  // ============================================

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ============================================ */}
          {/* LOGO ET MARQUE */}
          {/* ============================================ */}
          
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={closeMenu}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span>Business Hub</span>
            </Link>
          </div>

          {/* ============================================ */}
          {/* NAVIGATION DESKTOP */}
          {/* ============================================ */}
          
          <div className="hidden md:flex items-center space-x-1">
            {/* Liens publics */}
            {publicLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActiveLink(path) 
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}

            {/* Liens privés (si connecté) */}
            {isAuthenticated && privateLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActiveLink(path) 
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* ============================================ */}
          {/* ACTIONS UTILISATEUR (DESKTOP) */}
          {/* ============================================ */}
          
          <div className="hidden md:flex items-center space-x-3">
            {/* Toggle de thème */}
            <ThemeToggle />

            {isAuthenticated ? (
              /* Utilisateur connecté - Affichage du nom et déconnexion */
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  <span>Bonjour, {user?.firstName}</span>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            ) : (
              /* Utilisateur non connecté - Boutons de connexion */
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  size="sm"
                >
                  Connexion
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Inscription
                </Button>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* BOUTON MENU MOBILE */}
          {/* ============================================ */}
          
          <div className="md:hidden flex items-center space-x-2">
            {/* Toggle de thème pour mobile */}
            <ThemeToggle />
            
            {/* Bouton hamburger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* ============================================ */}
        {/* MENU MOBILE (DROPDOWN) */}
        {/* ============================================ */}
        
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div className="flex flex-col space-y-2">
              
              {/* Liens publics mobile */}
              {publicLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    isActiveLink(path) 
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* Liens privés mobile (si connecté) */}
              {isAuthenticated && privateLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    isActiveLink(path) 
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* Séparateur */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              {/* Actions utilisateur mobile */}
              {isAuthenticated ? (
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <User className="h-4 w-4" />
                    <span>Connecté en tant que {user?.firstName}</span>
                  </div>
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <Button 
                    onClick={() => { navigate('/login'); closeMenu(); }}
                    variant="outline"
                    className="w-full"
                  >
                    Connexion
                  </Button>
                  <Button 
                    onClick={() => { navigate('/register'); closeMenu(); }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    Inscription
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
