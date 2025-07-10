import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RegistrationData,
  LoginCredentials,
  RegisterCredentials,
  User,
  PasswordResetRequest,
  PasswordResetData,
} from '@/types';
import { authService, userService } from '@/service/api';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  register: (data: RegisterCredentials) => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkEmail: (email: string) => Promise<boolean>;
  resetPasswordRequest: (data: PasswordResetRequest) => Promise<boolean>;
  resetPassword: (data: PasswordResetData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const userData = await userService.getUserData();
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const register = async (data: RegisterCredentials): Promise<boolean> => {
    try {
      const response = await authService.register(data);
      if (response.user) {
        setUser(response.user);
        setIsLoggedIn(true);
        localStorage.setItem('token', response.token);
        toast({
          title: "Succès",
          description: "Votre compte a été créé avec succès",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        return true;
      } else {
        toast({
          title: "Erreur",
          description: "L'enregistrement a échoué. Veuillez réessayer.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Échec de l'enregistrement",
        variant: "destructive",
      });
      return false;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await authService.login(credentials);
      if (response.user) {
        setUser(response.user);
        setIsLoggedIn(true);
        localStorage.setItem('token', response.token);
        toast({
          title: "Succès",
          description: "Connexion réussie",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        return true;
      } else {
        toast({
          title: "Erreur",
          description: "La connexion a échoué. Veuillez vérifier vos informations d'identification.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Échec de la connexion",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    navigate('/login');
    toast({
      title: "Succès",
      description: "Déconnexion réussie",
      variant: "default",
      className: "bg-blue-500 text-white",
    });
  };

  const checkEmail = async (email: string): Promise<boolean> => {
    try {
      const exists = await authService.checkEmail(email);
      return exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const resetPasswordRequest = async (data: PasswordResetRequest): Promise<boolean> => {
    try {
      console.log('Tentative de demande de réinitialisation du mot de passe pour:', data.email);
      
      // Simuler une demande réussie
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Succès",
        description: "Un lien de réinitialisation a été envoyé à votre adresse e-mail",
        variant: "default",
        className: "bg-green-500 text-white",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la demande de réinitialisation du mot de passe:', error);
      
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Échec de la demande de réinitialisation du mot de passe",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const resetPassword = async (data: PasswordResetData): Promise<boolean> => {
    try {
      console.log('Tentative de réinitialisation du mot de passe pour:', data.email);
      
      // Simuler une réinitialisation réussie
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Succès",
        description: "Votre mot de passe a été réinitialisé avec succès",
        variant: "default",
        className: "bg-green-500 text-white",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Échec de la réinitialisation du mot de passe",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    register,
    login,
    logout,
    checkEmail,
    resetPasswordRequest,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
