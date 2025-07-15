
/**
 * PAGE DE RÉINITIALISATION DE MOT DE PASSE
 * ========================================
 * 
 * Cette page permet aux utilisateurs de réinitialiser leur mot de passe
 * en cas d'oubli. Elle gère l'envoi d'un email de réinitialisation
 * et la saisie du nouveau mot de passe.
 * 
 * Fonctionnalités principales :
 * - Formulaire de demande de réinitialisation par email
 * - Validation des données saisies
 * - Gestion des erreurs et messages de confirmation
 * - Interface responsive et accessible
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, ArrowLeft, Key } from 'lucide-react';
import Layout from '@/components/Layout';

/**
 * Composant principal de la page de réinitialisation de mot de passe
 * Gère le processus de demande de réinitialisation
 */
const ResetPasswordPage: React.FC = () => {
  // Ici on attend l'initialisation des hooks et du state local
  const navigate = useNavigate();
  const { toast } = useToast();

  // État local pour l'email de réinitialisation
  const [email, setEmail] = useState('');
  
  // État pour les erreurs de validation
  const [emailError, setEmailError] = useState('');
  
  // État pour le chargement du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour indiquer si l'email a été envoyé
  const [isEmailSent, setIsEmailSent] = useState(false);

  /**
   * Fonction de validation de l'email
   * Vérifie le format et la présence de l'email
   */
  const validateEmail = (email: string): boolean => {
    // Ici on attend la validation de l'email
    if (!email) {
      setEmailError('L\'email est requis');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Format d\'email invalide');
      return false;
    }
    
    // Ici on a ajouté la suppression de l'erreur si l'email est valide
    setEmailError('');
    return true;
  };

  /**
   * Gestionnaire de changement de l'email
   * Met à jour l'état et supprime les erreurs
   */
  const handleEmailChange = (value: string) => {
    // Ici on attend la mise à jour de l'email
    setEmail(value);
    
    // Ici on a ajouté la suppression de l'erreur lors de la saisie
    if (emailError) {
      setEmailError('');
    }
  };

  /**
   * Gestionnaire de soumission du formulaire
   * Valide l'email et envoie la demande de réinitialisation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ici on attend la validation de l'email avant soumission
    if (!validateEmail(email)) {
      return;
    }

    // Ici on attend le processus d'envoi de l'email
    setIsSubmitting(true);

    try {
      // Simulation d'un appel API pour l'envoi de l'email de réinitialisation
      // Dans un vrai projet, cela ferait appel à un service de réinitialisation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Ici on a ajouté la mise à jour de l'état de succès
      setIsEmailSent(true);
      
      // Ici on a ajouté la notification de succès
      toast({
        title: "Email envoyé",
        description: "Un lien de réinitialisation a été envoyé à votre adresse email.",
      });
    } catch (error) {
      // Ici on a ajouté la gestion des erreurs d'envoi
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'email. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      // Ici on a ajouté la réinitialisation de l'état de chargement
      setIsSubmitting(false);
    }
  };

  /**
   * Fonction pour retourner au formulaire de demande
   * Réinitialise l'état pour permettre une nouvelle demande
   */
  const handleBackToForm = () => {
    // Ici on attend la réinitialisation de l'état
    setIsEmailSent(false);
    setEmail('');
    setEmailError('');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Bouton de retour vers la page de connexion */}
          <div className="mb-4">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour à la connexion
            </Link>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {isEmailSent ? "Email envoyé" : "Mot de passe oublié"}
              </CardTitle>
              <CardDescription>
                {isEmailSent 
                  ? "Vérifiez votre boîte email pour les instructions de réinitialisation"
                  : "Entrez votre email pour recevoir un lien de réinitialisation"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!isEmailSent ? (
                // Ici on attend l'affichage du formulaire de demande
                <>
                  {/* Formulaire de demande de réinitialisation */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Champ email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          disabled={isSubmitting}
                          autoComplete="email"
                        />
                      </div>
                      {emailError && (
                        <p className="text-sm text-destructive">{emailError}</p>
                      )}
                    </div>

                    {/* Bouton de soumission */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                    </Button>
                  </form>

                  {/* Informations supplémentaires */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Vous recevrez un email avec un lien pour créer un nouveau mot de passe.
                    </p>
                  </div>
                </>
              ) : (
                // Ici on attend l'affichage du message de confirmation
                <>
                  {/* Message de confirmation d'envoi */}
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Un email a été envoyé à <strong>{email}</strong> avec les instructions pour réinitialiser votre mot de passe.
                      </p>
                    </div>

                    {/* Instructions pour l'utilisateur */}
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Si vous ne recevez pas l'email dans les prochaines minutes :</p>
                      <ul className="list-disc list-inside space-y-1 text-left">
                        <li>Vérifiez votre dossier spam/courrier indésirable</li>
                        <li>Assurez-vous que l'adresse email est correcte</li>
                        <li>Contactez le support si le problème persiste</li>
                      </ul>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={handleBackToForm}
                        variant="outline"
                        className="w-full"
                      >
                        Essayer avec une autre adresse
                      </Button>
                      
                      <Button 
                        onClick={() => navigate('/login')}
                        className="w-full"
                      >
                        Retour à la connexion
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Liens de navigation supplémentaires */}
          {!isEmailSent && (
            <div className="mt-6 text-center text-sm">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
