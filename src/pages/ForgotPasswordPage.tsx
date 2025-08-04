/**
 * ============================================================================
 * PAGE DE RÉINITIALISATION DE MOT DE PASSE - PROCESSUS COMPLET
 * ============================================================================
 * 
 * Cette page gère le processus complet de réinitialisation de mot de passe en 3 étapes :
 * 1. Saisie et vérification de l'email
 * 2. Saisie et vérification du code de 6 chiffres envoyé par email
 * 3. Définition du nouveau mot de passe avec validation sécurisée
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * - Vérification d'email existant dans la base de données
 * - Génération et envoi d'un code de vérification par email
 * - Validation du code avec limitation des tentatives
 * - Formulaire sécurisé de nouveau mot de passe
 * - Vérification que le nouveau mot de passe est différent de l'ancien
 * - Interface utilisateur moderne avec animations et feedback
 * 
 * SÉCURITÉ :
 * - Code valide pendant 24h uniquement
 * - Maximum 3 tentatives de saisie du code
 * - Validation stricte du mot de passe (8+ caractères, maj/min/chiffre/spécial)
 * - Vérification de non-identité avec l'ancien mot de passe
 * 
 * @author Riziky Agendas Team
 * @version 2.0.0
 * @lastModified 2024
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Shield, KeyRound, Sparkles, RotateCcw, Hash, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

// Schéma de validation pour l'email
const emailSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

// Schéma de validation pour le code de vérification
const codeSchema = z.object({
  code: z.string().length(6, {
    message: "Le code doit contenir exactement 6 chiffres.",
  }).regex(/^\d+$/, {
    message: "Le code ne doit contenir que des chiffres.",
  }),
});

// Schéma de validation pour le mot de passe avec critères de complexité
const passwordSchema = z.object({
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Doit contenir au moins un caractère spécial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

// Composant principal de réinitialisation de mot de passe
const ForgotPasswordPage = () => {
  // États pour gérer les étapes du processus
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { requestResetCode, verifyResetCode, resetPassword, checkEmail } = useAuth();
  
  // Formulaire pour l'email (étape 1)
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  
  // Formulaire pour le code (étape 2)
  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });
  
  // Formulaire pour le mot de passe (étape 3)
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  // Étape 1 : Vérification de l'email et envoi du code
  const onSubmitEmail = async (values: z.infer<typeof emailSchema>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Vérifier si l'email existe
      const emailExists = await checkEmail(values.email);
      
      if (!emailExists) {
        setError("Cette adresse email n'est pas enregistrée dans notre système.");
        setIsSubmitting(false);
        return;
      }
      
      // Demander l'envoi du code
      const codeRequested = await requestResetCode(values.email);
      
      if (codeRequested) {
        setEmail(values.email);
        setStep('code');
        toast.success("Un code de vérification a été envoyé à votre adresse email", {
          className: "bg-green-600 text-white border-green-500"
        });
      }
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      console.error('Erreur lors de la demande de code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Étape 2 : Vérification du code
  const onSubmitCode = async (values: z.infer<typeof codeSchema>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const codeVerified = await verifyResetCode(email, values.code);
      
      if (codeVerified) {
        setVerificationCode(values.code);
        setStep('password');
      } else {
        setError("Code incorrect ou expiré. Vérifiez votre saisie.");
      }
    } catch (error) {
      setError("Erreur lors de la vérification du code.");
      console.error('Erreur lors de la vérification du code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Étape 3 : Définition du nouveau mot de passe
  const onSubmitPassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const passwordReset = await resetPassword(email, values.password, verificationCode);
      
      if (passwordReset) {
        toast.success("Mot de passe réinitialisé avec succès !", {
          className: "bg-green-600 text-white border-green-500"
        });
        navigate('/connexion');
      }
    } catch (error) {
      setError("Erreur lors de la réinitialisation du mot de passe.");
      console.error('Erreur lors de la réinitialisation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la validation du mot de passe
  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };

  // Gestion du changement de mot de passe pour la validation temps réel
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    passwordForm.setValue('password', newPassword, { shouldValidate: true });
  };

  // Fonction pour revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (step === 'code') {
      setStep('email');
    } else if (step === 'password') {
      setStep('code');
    }
    setError(null);
  };

  // Fonction pour redemander un code
  const resendCode = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await requestResetCode(email);
      toast.success("Nouveau code envoyé !", {
        className: "bg-blue-600 text-white border-blue-500"
      });
    } catch (error) {
      setError("Erreur lors de l'envoi du nouveau code.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fonction pour obtenir le titre selon l'étape
  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Votre email';
      case 'code': return 'Code de vérification';
      case 'password': return 'Nouveau mot de passe';
      default: return 'Réinitialisation';
    }
  };

  // Fonction pour obtenir la description selon l'étape
  const getStepDescription = () => {
    switch (step) {
      case 'email': return 'Saisissez votre adresse email pour recevoir un code de vérification';
      case 'code': return `Code envoyé à ${email}`;
      case 'password': return 'Définissez votre nouveau mot de passe sécurisé';
      default: return '';
    }
  };
  
  return (
    <div className="mt-[80px] min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl mb-4 relative">
            <KeyRound className="w-8 h-8 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-gray-600">Réinitialisez votre mot de passe en toute sécurité</p>
          
          {/* Indicateur d'étapes */}
          <div className="flex justify-center mt-6 space-x-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'email' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'code' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'password' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
          <CardHeader className="text-center relative z-10 pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {getStepTitle()}
              </CardTitle>
              <Sparkles className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-600">{getStepDescription()}</p>
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Affichage des erreurs */}
            {error && (
              <Alert variant="destructive" className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ÉTAPE 1 : Email */}
            {step === 'email' && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-500" />
                          Adresse email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="votre@email.com" 
                              autoComplete="email"
                              className="pl-12 h-12 bg-white/50 backdrop-blur-sm border-2 border-gray-200/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 transition-all duration-300 rounded-xl"
                              {...field} 
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Vérification...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Envoyer le code
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* ÉTAPE 2 : Code de vérification */}
            {step === 'code' && (
              <Form {...codeForm}>
                <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl mb-4">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-500" />
                      Saisissez le code de 6 chiffres envoyé à <span className="font-medium text-blue-600">{email}</span>
                    </p>
                  </div>

                  <FormField
                    control={codeForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Hash className="w-4 h-4 text-orange-500" />
                          Code de vérification
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="123456" 
                              maxLength={6}
                              className="pl-12 h-12 bg-white/50 backdrop-blur-sm border-2 border-gray-200/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 transition-all duration-300 rounded-xl text-center text-2xl tracking-widest"
                              {...field} 
                            />
                            <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep} 
                      className="flex-1 h-12 border-2 border-gray-200/50 hover:border-gray-300 bg-white/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:shadow-md"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Vérification...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Vérifier
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={isSubmitting}
                      className="text-sm text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
                    >
                      Renvoyer le code
                    </button>
                  </div>
                </form>
              </Form>
            )}

            {/* ÉTAPE 3 : Nouveau mot de passe */}
            {step === 'password' && (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl mb-4">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Définissez un nouveau mot de passe sécurisé pour <span className="font-medium text-green-600">{email}</span>
                    </p>
                  </div>
                  
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-orange-500" />
                          Nouveau mot de passe
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Votre nouveau mot de passe" 
                              autoComplete="new-password"
                              className="pl-12 pr-12 h-12 bg-white/50 backdrop-blur-sm border-2 border-gray-200/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 transition-all duration-300 rounded-xl"
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                handlePasswordChange(e);
                              }}
                            />
                            <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <PasswordStrengthIndicator 
                          password={password} 
                          onValidityChange={handlePasswordValidityChange}
                        />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-gray-700">Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="Confirmez votre mot de passe" 
                              autoComplete="new-password"
                              className="pl-12 pr-12 h-12 bg-white/50 backdrop-blur-sm border-2 border-gray-200/50 focus:border-red-400 focus:ring-2 focus:ring-red-200/50 transition-all duration-300 rounded-xl"
                              {...field} 
                            />
                            <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep} 
                      className="flex-1 h-12 border-2 border-gray-200/50 hover:border-gray-300 bg-white/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:shadow-md"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                      disabled={isSubmitting || !isPasswordValid}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Finalisation...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4" />
                          Réinitialiser
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                <Link to="/connexion" className="font-medium text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Retour à la connexion
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;