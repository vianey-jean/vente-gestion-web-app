
/**
 * PAGE D'INSCRIPTION UTILISATEUR
 * =============================
 * 
 * Cette page permet aux nouveaux utilisateurs de créer un compte.
 * Elle gère la validation des données, l'affichage des erreurs,
 * et redirige vers la page de connexion après inscription réussie.
 * 
 * Fonctionnalités principales :
 * - Formulaire d'inscription avec validation
 * - Gestion des erreurs de validation
 * - Confirmation de mot de passe
 * - Acceptation des conditions d'utilisation
 * - Redirection automatique après inscription
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, MapPin, Phone } from 'lucide-react';
import Layout from '@/components/Layout';
import type { RegistrationData } from '@/types';

/**
 * Composant principal de la page d'inscription
 * Gère le formulaire d'inscription et la validation des données
 */
const RegisterPage: React.FC = () => {
  // Ici on attend l'initialisation des hooks et du state local
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  // État local pour les données du formulaire
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: 'male',
    address: '',
    phone: '',
    acceptTerms: false,
  });

  // État pour la gestion de l'affichage des mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // État pour les erreurs de validation
  const [errors, setErrors] = useState<Partial<RegistrationData>>({});
  
  // État pour le chargement du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Fonction de validation des données du formulaire
   * Vérifie tous les champs requis et leurs formats
   */
  const validateForm = (): boolean => {
    // Ici on attend la validation de tous les champs du formulaire
    const newErrors: Partial<RegistrationData> = {};

    // Validation de l'email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation de la confirmation du mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation des champs obligatoires
    if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
    if (!formData.address) newErrors.address = 'L\'adresse est requise';
    if (!formData.phone) newErrors.phone = 'Le téléphone est requis';

    // Validation de l'acceptation des conditions
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation' as any;
    }

    // Ici on a ajouté la mise à jour des erreurs
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Gestionnaire de changement des champs du formulaire
   * Met à jour l'état local avec les nouvelles valeurs
   */
  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    // Ici on attend la mise à jour des données du formulaire
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Ici on a ajouté la suppression de l'erreur pour le champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  /**
   * Gestionnaire de soumission du formulaire
   * Valide les données et effectue l'inscription
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ici on attend la validation du formulaire avant soumission
    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      return;
    }

    // Ici on attend le processus d'inscription
    setIsSubmitting(true);

    try {
      // Ici on a corrigé les données pour l'inscription (ajout des champs manquants)
      await register(formData);

      // Ici on a ajouté la notification de succès
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      });

      // Ici on a ajouté la redirection vers la page de connexion
      navigate('/login');
    } catch (error) {
      // Ici on a ajouté la gestion des erreurs d'inscription
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      // Ici on a ajouté la réinitialisation de l'état de chargement
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* En-tête de la page d'inscription */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
              <CardDescription>
                Créez votre compte pour accéder au tableau de bord
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Formulaire d'inscription */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Section informations personnelles */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Champ prénom */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Votre prénom"
                        className="pl-10"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Champ nom */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Votre nom"
                        className="pl-10"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Champ email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Section mots de passe */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Champ mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Champ confirmation mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmez votre mot de passe"
                        className="pl-10 pr-10"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Section informations additionnelles */}
                <div className="space-y-4">
                  {/* Sélection du genre */}
                  <div className="space-y-2">
                    <Label>Genre *</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                      className="flex space-x-4"
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Homme</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Femme</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Autre</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Champ adresse */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="Votre adresse"
                        className="pl-10"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address}</p>
                    )}
                  </div>

                  {/* Champ téléphone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Votre numéro de téléphone"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Case à cocher conditions d'utilisation */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    J'accepte les{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      conditions d'utilisation
                    </Link>{' '}
                    et la{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive">{String(errors.acceptTerms)}</p>
                )}

                {/* Bouton de soumission */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
                </Button>
              </form>

              {/* Lien vers la page de connexion */}
              <div className="mt-6 text-center text-sm">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
