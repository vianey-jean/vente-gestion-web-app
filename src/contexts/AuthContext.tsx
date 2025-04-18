
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../models/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  emailExists: (email: string) => Promise<boolean>;
  authenticateByEmail: (email: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'role' | 'createdAt'>) => Promise<boolean>;
  currentEmail: string;
  setCurrentEmail: (email: string) => void;
  checkPassword: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { authService } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');

  // Vérifier si l'utilisateur est déjà connecté (à partir du localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.login(email, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const emailExists = async (email: string): Promise<boolean> => {
    try {
      return await authService.checkEmailExists(email);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return false;
    }
  };

  const authenticateByEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await authService.authenticateByEmail(email);
      return !!user;
    } catch (error) {
      console.error('Erreur lors de l\'authentification par email:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(userData);
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour vérifier la complexité du mot de passe
  const checkPassword = (password: string): boolean => {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    emailExists,
    authenticateByEmail,
    register,
    currentEmail,
    setCurrentEmail,
    checkPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
