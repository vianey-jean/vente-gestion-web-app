
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/Auth/PasswordInput';
import PasswordRequirements from '../components/Auth/PasswordRequirements';
import { AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading, register, emailExists, checkPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailDebounceTimer, setEmailDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Gérer les changements dans le formulaire
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Réinitialiser les erreurs pour ce champ
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Vérification en temps réel de l'email
    if (name === 'email' && value.trim() !== '') {
      // Annuler le timer précédent s'il existe
      if (emailDebounceTimer) {
        clearTimeout(emailDebounceTimer);
      }
      
      setEmailCheckStatus('checking');
      
      // Créer un nouveau timer
      const timer = setTimeout(async () => {
        try {
          const exists = await emailExists(value);
          setEmailCheckStatus(exists ? 'taken' : 'available');
          
          if (exists) {
            setFormErrors(prev => ({
              ...prev,
              email: 'Cet email est déjà utilisé.'
            }));
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'email:', error);
          setEmailCheckStatus('idle');
        }
      }, 500);
      
      setEmailDebounceTimer(timer);
    } else if (name === 'email' && value.trim() === '') {
      setEmailCheckStatus('idle');
    }
    
    // Vérification des mots de passe
    if (name === 'password') {
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setFormErrors(prev => ({
          ...prev,
          confirmPassword: 'Les mots de passe ne correspondent pas.'
        }));
      } else if (formData.confirmPassword) {
        setFormErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
    
    if (name === 'confirmPassword') {
      if (formData.password && value !== formData.password) {
        setFormErrors(prev => ({
          ...prev,
          confirmPassword: 'Les mots de passe ne correspondent pas.'
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Vérifier l'email
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email est invalide.';
      isValid = false;
    } else if (emailCheckStatus === 'taken') {
      errors.email = 'Cet email est déjà utilisé.';
      isValid = false;
    }
    
    // Vérifier le mot de passe
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis.';
      isValid = false;
    } else if (!checkPassword(formData.password)) {
      errors.password = 'Le mot de passe ne répond pas aux exigences de sécurité.';
      isValid = false;
    }
    
    // Vérifier la confirmation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
      isValid = false;
    }
    
    // Vérifier le prénom
    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis.';
      isValid = false;
    }
    
    // Vérifier le nom
    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis.';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      if (success) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès.",
          duration: 5000
        });
        navigate('/dashboard');
      } else {
        setGeneralError('Une erreur est survenue lors de la création du compte. Veuillez réessayer.');
      }
    } catch (error) {
      setGeneralError('Une erreur système est survenue. Veuillez réessayer plus tard.');
      console.error('Erreur d\'inscription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Créer un compte</CardTitle>
              <CardDescription>
                Inscrivez-vous pour commencer à utiliser notre plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generalError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email
                      {emailCheckStatus === 'checking' && (
                        <span className="ml-2 text-xs text-gray-500">(Vérification...)</span>
                      )}
                      {emailCheckStatus === 'available' && !formErrors.email && (
                        <span className="ml-2 text-xs text-green-600">(Disponible)</span>
                      )}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={formErrors.email ? "border-red-500" : ""}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  {/* Prénom et Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={formErrors.firstName ? "border-red-500" : ""}
                        required
                      />
                      {formErrors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={formErrors.lastName ? "border-red-500" : ""}
                        required
                      />
                      {formErrors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <PasswordInput
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      isValid={!formErrors.password}
                      showValidation={true}
                      required
                      onFocus={() => setShowPasswordRequirements(true)}
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                    )}
                    {showPasswordRequirements && (
                      <PasswordRequirements password={formData.password} />
                    )}
                  </div>
                  
                  {/* Confirmation du mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isValid={!formErrors.confirmPassword}
                      showValidation={true}
                      required
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || isSubmitting || emailCheckStatus === 'checking' || emailCheckStatus === 'taken'}
                  >
                    {isSubmitting || isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inscription en cours...</>
                    ) : (
                      'S\'inscrire'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <div className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="text-app-blue hover:underline">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
