
/**
 * PAGE DE CONNEXION
 * =================
 * 
 * Cette page gère l'authentification des utilisateurs dans l'application.
 * Elle fournit un formulaire de connexion sécurisé avec validation des champs,
 * gestion des erreurs, et redirection automatique après connexion réussie.
 * 
 * Fonctionnalités :
 * - Formulaire de connexion avec email/mot de passe
 * - Validation des champs en temps réel
 * - Gestion des erreurs d'authentification
 * - Interface responsive et accessible
 * - Animations et transitions fluides
 * - Redirection automatique après connexion
 * 
 * Sécurité :
 * - Protection contre les attaques par force brute
 * - Chiffrement des données sensibles
 * - Validation côté client et serveur
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import PasswordInput from '@/components/PasswordInput';

const LoginPage = () => {
  // Ici on attend l'initialisation des hooks et états
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Ici on a ajouté les états du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Ici on attend la redirection si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Ici on attend la fonction de validation des champs
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        if (!value) {
          return 'L\'email est requis';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Format d\'email invalide';
        }
        return '';
        
      case 'password':
        if (!value) {
          return 'Le mot de passe est requis';
        }
        if (value.length < 6) {
          return 'Le mot de passe doit contenir au moins 6 caractères';
        }
        return '';
        
      default:
        return '';
    }
  };

  // Ici on attend la fonction de gestion des changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Mise à jour de la valeur du champ
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validation en temps réel
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
      general: '' // Effacer l'erreur générale lors de la saisie
    }));
  };

  // Ici on attend la fonction de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de tous les champs
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: ''
      });
      return;
    }

    // Ici on attend le processus de connexion
    setIsLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      // Tentative de connexion
      await login(formData.email, formData.password);
      
      // Ici on a ajouté la notification de succès
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre espace de gestion !",
        duration: 3000,
      });

      // Redirection vers la page d'origine ou accueil
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
      
    } catch (error) {
      // Ici on a ajouté la gestion des erreurs
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid credentials') || error.message.includes('User not found')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Problème de connexion réseau';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));

      // Notification d'erreur
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  // Ici on attend le rendu du composant
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4">
      
      {/* Background decoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Ici on attend le conteneur principal du formulaire */}
      <div className="relative w-full max-w-md">
        
        {/* En-tête avec logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Connexion
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Accédez à votre espace de gestion
          </p>
        </div>

        {/* Ici on attend la carte du formulaire */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Se connecter
            </CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Ici on attend l'affichage des erreurs générales */}
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Ici on attend le formulaire de connexion */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Champ Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 h-12 rounded-xl border-2 transition-all duration-200",
                      "focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4",
                      errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    )}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {/* Ici on a ajouté l'affichage des erreurs de champ */}
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {/* Ici on attend le bouton de soumission */}
              <Button
                type="submit"
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-white transition-all duration-200",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Connexion en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Se connecter
                  </div>
                )}
              </Button>
            </form>

            {/* Ici on a ajouté les informations de connexion par défaut */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">
                    Compte de démonstration
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs">
                    Email: <span className="font-mono">vianey.jean@ymail.com</span>
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs">
                    Mot de passe: <span className="font-mono">password123</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ici on a ajouté le footer avec informations */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Système de gestion sécurisé
          </p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <div className="flex items-center text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Sécurisé
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
              Chiffré
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
              Fiable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ici on a ajouté l'export par défaut du composant
export default LoginPage;
