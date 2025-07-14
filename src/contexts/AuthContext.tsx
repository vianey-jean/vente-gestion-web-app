
/**
 * CONTEXTE D'AUTHENTIFICATION
 * 
 * Ce fichier gère l'état d'authentification global de l'application :
 * - État de connexion utilisateur
 * - Tokens d'authentification
 * - Fonctions de connexion/déconnexion
 * - Protection des routes privées
 * - Gestion automatique de la déconnexion
 * 
 * FONCTIONNALITÉS:
 * - Hook useAuth pour accéder au contexte
 * - AuthProvider pour encapsuler l'application
 * - Persistance de la session via localStorage
 * - Gestion des erreurs d'authentification
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '@/types';
import { useAutoLogout } from '@/hooks/use-auto-logout';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface du contexte d'authentification
 * Définit toutes les méthodes et propriétés disponibles
 */
interface AuthContextType {
  // État de l'utilisateur
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Méthodes d'authentification
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => void;
  
  // Méthodes de gestion utilisateur
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

/**
 * Props du provider d'authentification
 */
interface AuthProviderProps {
  children: ReactNode;
}

// ============================================
// CRÉATION DU CONTEXTE
// ============================================

/**
 * Contexte d'authentification avec valeur par défaut
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER D'AUTHENTIFICATION
// ============================================

/**
 * Provider d'authentification principal
 * Gère l'état global d'authentification de l'application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // États locaux
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hook pour la déconnexion automatique
  useAutoLogout();

  // ============================================
  // INITIALISATION
  // ============================================

  /**
   * Initialise l'état d'authentification au chargement
   * Vérifie si un token existe en localStorage
   */
  useEffect(() => {
    console.log('🔐 AuthContext - Initialisation');
    const initAuth = () => {
      try {
        // Récupération du token stocké
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('userData');

        if (storedToken && storedUser) {
          console.log('✅ Token et données utilisateur trouvés');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          console.log('❌ Aucun token ou données utilisateur trouvés');
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
        // Nettoyage en cas d'erreur
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      } finally {
        // Fin du chargement
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ============================================
  // MÉTHODES D'AUTHENTIFICATION
  // ============================================

  /**
   * Fonction de connexion
   * Simule une connexion avec des données mockées
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    console.log('🔑 Tentative de connexion pour:', credentials.email);
    setIsLoading(true);

    try {
      // Simulation d'une authentification (à remplacer par une vraie API)
      if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
        // Données utilisateur mockées
        const mockUser: User = {
          id: '1',
          email: credentials.email,
          firstName: 'Admin',
          lastName: 'User',
          gender: 'other',
          address: '123 Rue Example',
          phone: '+33123456789'
        };

        // Token mocké
        const mockToken = 'mock-jwt-token-' + Date.now();

        // Stockage des données
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userData', JSON.stringify(mockUser));

        // Mise à jour de l'état
        setToken(mockToken);
        setUser(mockUser);

        console.log('✅ Connexion réussie');
      } else {
        throw new Error('Identifiants invalides');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fonction d'inscription
   * Simule une inscription avec validation basique
   */
  const register = async (userData: RegisterCredentials): Promise<void> => {
    console.log('📝 Tentative d\'inscription pour:', userData.email);
    setIsLoading(true);

    try {
      // Simulation d'une inscription
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        address: userData.address,
        phone: userData.phone
      };

      // Token pour le nouvel utilisateur
      const newToken = 'mock-jwt-token-' + Date.now();

      // Stockage des données
      localStorage.setItem('token', newToken);
      localStorage.setItem('userData', JSON.stringify(newUser));

      // Mise à jour de l'état
      setToken(newToken);
      setUser(newUser);

      console.log('✅ Inscription réussie');
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fonction de déconnexion
   * Nettoie tous les états et le stockage local
   */
  const logout = (): void => {
    console.log('🚪 Déconnexion en cours');
    
    // Nettoyage du stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Réinitialisation de l'état
    setToken(null);
    setUser(null);
    
    console.log('✅ Déconnexion terminée');
  };

  // ============================================
  // MÉTHODES DE GESTION UTILISATEUR
  // ============================================

  /**
   * Mise à jour du profil utilisateur
   */
  const updateProfile = async (updatedData: Partial<User>): Promise<void> => {
    console.log('👤 Mise à jour du profil utilisateur');
    
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // Fusion des données existantes avec les nouvelles
      const updatedUser = { ...user, ...updatedData };
      
      // Mise à jour du stockage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Mise à jour de l'état
      setUser(updatedUser);
      
      console.log('✅ Profil mis à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  };

  /**
   * Changement de mot de passe
   */
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    console.log('🔒 Changement de mot de passe');
    
    try {
      // Ici on simule le changement (à remplacer par une vraie API)
      // Vérification du mot de passe actuel...
      // Mise à jour avec le nouveau mot de passe...
      
      console.log('✅ Mot de passe changé');
    } catch (error) {
      console.error('❌ Erreur changement mot de passe:', error);
      throw error;
    }
  };

  // ============================================
  // VALEURS DU CONTEXTE
  // ============================================

  /**
   * Valeurs exposées par le contexte
   */
  const contextValue: AuthContextType = {
    // État
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    
    // Méthodes
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK D'UTILISATION
// ============================================

/**
 * Hook pour utiliser le contexte d'authentification
 * Vérifie que le hook est utilisé dans un AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  
  return context;
};
