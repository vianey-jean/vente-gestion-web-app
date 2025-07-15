
/**
 * CONTEXTE D'AUTHENTIFICATION
 * ===========================
 * 
 * Ce contexte gère l'état d'authentification de l'application.
 * Il fournit les fonctions et données d'authentification à tous
 * les composants enfants via le Context API de React.
 * 
 * Fonctionnalités principales :
 * - Gestion de l'état utilisateur connecté
 * - Fonctions de connexion/déconnexion
 * - Inscription d'utilisateurs
 * - Réinitialisation de mot de passe
 * - Vérification d'emails existants
 * - Persistance de session
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginCredentials, PasswordResetData, PasswordResetRequest, RegistrationData, User } from '../types';
import { authService } from '../service/api';
import { useToast } from '@/hooks/use-toast';

/**
 * Interface définissant les méthodes et données du contexte d'authentification
 * Toutes les fonctionnalités d'auth sont exposées via cette interface
 */
interface AuthContextType {
  user: User | null; // Utilisateur actuellement connecté
  isAuthenticated: boolean; // État de connexion
  isLoading: boolean; // État de chargement des opérations
  token: string | null; // Token JWT de session
  login: (credentials: LoginCredentials) => Promise<boolean>; // Fonction de connexion
  logout: () => void; // Fonction de déconnexion
  register: (data: RegistrationData) => Promise<boolean>; // Fonction d'inscription
  checkEmail: (email: string) => Promise<boolean>; // Vérification d'email
  resetPasswordRequest: (data: PasswordResetRequest) => Promise<boolean>; // Demande de reset
  resetPassword: (data: PasswordResetData) => Promise<boolean>; // Réinitialisation
}

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fournisseur du contexte d'authentification
 * Enveloppe l'application et fournit les données d'auth à tous les composants
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ici on attend l'initialisation des états d'authentification
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Effet d'initialisation au montage du composant
   * Vérifie si un utilisateur est déjà connecté via le localStorage
   */
  useEffect(() => {
    // Ici on attend la vérification de l'état de connexion existant
    const currentUser = authService.getCurrentUser();
    const storedToken = localStorage.getItem('token');
    
    setUser(currentUser);
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  /**
   * Fonction de connexion utilisateur
   * Authentifie l'utilisateur avec email/mot de passe
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Ici on attend l'activation de l'état de chargement
      setIsLoading(true);
      const result = await authService.login(credentials);
      
      if (result && result.user) {
        // Ici on a ajouté la mise à jour de l'état utilisateur
        setUser(result.user);
        setToken(result.token);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${result.user.firstName} ${result.user.lastName}`,
          className: "bg-green-500 text-white",
        });
        return true;
      } else {
        // Ici on a ajouté la gestion des erreurs de connexion
        toast({
          title: "Échec de la connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      // Ici on a ajouté la gestion des erreurs générales
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion",
        variant: "destructive",
      });
      return false;
    } finally {
      // Ici on a ajouté la désactivation du chargement
      setIsLoading(false);
    }
  };

  /**
   * Fonction de déconnexion utilisateur
   * Supprime les données de session et redirige
   */
  const logout = () => {
    // Ici on attend la réinitialisation de l'état utilisateur
    setUser(null);
    setToken(null);
    authService.setCurrentUser(null);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
    // Ici on a ajouté la redirection vers la page de connexion
    window.location.href = '/login';
  };

  /**
   * Fonction d'inscription utilisateur
   * Crée un nouveau compte utilisateur
   */
  const register = async (data: RegistrationData): Promise<boolean> => {
    try {
      // Ici on attend l'activation de l'état de chargement
      setIsLoading(true);
      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        address: data.address,
        phone: data.phone,
      };
      
      const result = await authService.register(registerData);
      
      if (result && result.user) {
        // Ici on a ajouté la mise à jour de l'état après inscription
        setUser(result.user);
        setToken(result.token);
        toast({
          title: "Inscription réussie",
          description: `Bienvenue ${result.user.firstName} ${result.user.lastName}`,
          className: "notification-success",
        });
        return true;
      } else {
        // Ici on a ajouté la gestion des erreurs d'inscription
        toast({
          title: "Échec de l'inscription",
          description: "Cet email est déjà utilisé",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      // Ici on a ajouté la gestion des erreurs générales
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
      return false;
    } finally {
      // Ici on a ajouté la désactivation du chargement
      setIsLoading(false);
    }
  };

  /**
   * Fonction de vérification d'email
   * Vérifie si un email existe déjà dans le système
   */
  const checkEmail = async (email: string): Promise<boolean> => {
    try {
      // Ici on attend la vérification de l'email
      const result = await authService.checkEmail(email);
      return result.exists;
    } catch (error) {
      // Ici on a ajouté le retour par défaut en cas d'erreur
      return false;
    }
  };

  /**
   * Fonction de demande de réinitialisation de mot de passe
   * Initie le processus de reset de mot de passe
   */
  const resetPasswordRequest = async (data: PasswordResetRequest): Promise<boolean> => {
    try {
      // Ici on attend l'activation de l'état de chargement
      setIsLoading(true);
      const exists = await authService.resetPasswordRequest(data);
      
      if (!exists) {
        // Ici on a ajouté la gestion du cas où l'email n'existe pas
        toast({
          title: "Échec de la réinitialisation",
          description: "Cet email n'existe pas dans notre système",
          variant: "destructive",
        });
      }
      
      return exists;
    } catch (error) {
      // Ici on a ajouté la gestion des erreurs de réinitialisation
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive",
      });
      return false;
    } finally {
      // Ici on a ajouté la désactivation du chargement
      setIsLoading(false);
    }
  };

  /**
   * Fonction de réinitialisation de mot de passe
   * Finalise le processus de changement de mot de passe
   */
  const resetPassword = async (data: PasswordResetData): Promise<boolean> => {
    try {
      // Ici on attend l'activation de l'état de chargement
      setIsLoading(true);
      const result = await authService.resetPassword(data.email);
      
      if (result.success) {
        // Ici on a ajouté la notification de succès
        toast({
          title: "Réinitialisation réussie",
          description: "Votre mot de passe a été réinitialisé avec succès",
          className: "notification-success",
        });
        return true;
      } else {
        // Ici on a ajouté la gestion des erreurs de validation
        toast({
          title: "Échec de la réinitialisation",
          description: "Le nouveau mot de passe doit être différent de l'ancien",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      // Ici on a ajouté la gestion des erreurs générales
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive",
      });
      return false;
    } finally {
      // Ici on a ajouté la désactivation du chargement
      setIsLoading(false);
    }
  };

  // Ici on attend la préparation de la valeur du contexte
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    token,
    login,
    logout,
    register,
    checkEmail,
    resetPasswordRequest,
    resetPassword,
  };

  // Ici on a ajouté le retour du provider avec toutes les valeurs
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * Simplifie l'accès aux données d'auth dans les composants
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
