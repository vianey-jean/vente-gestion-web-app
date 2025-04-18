
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
import { ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    user, 
    isLoading, 
    login, 
    emailExists, 
    authenticateByEmail, 
    currentEmail, 
    setCurrentEmail 
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    
    // Si un email a déjà été vérifié dans le contexte
    if (currentEmail) {
      setEmail(currentEmail);
      setShowPasswordStep(true);
      setEmailStatus('valid');
    }
  }, [user, navigate, currentEmail]);

  // Gérer la vérification de l'email
  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }

    setEmailStatus('checking');
    
    try {
      const exists = await emailExists(email);
      
      if (exists) {
        const isValid = await authenticateByEmail(email);
        
        if (isValid) {
          setEmailStatus('valid');
          setShowPasswordStep(true);
          setCurrentEmail(email);
          setSuccessMessage(`Bienvenue ! Veuillez saisir votre mot de passe.`);
          
          // Rafraîchir le message après quelques secondes
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        } else {
          setEmailStatus('invalid');
          setError('Une erreur est survenue lors de la vérification de votre email.');
        }
      } else {
        setEmailStatus('invalid');
        setError('Cet email n\'est pas enregistré.');
      }
    } catch (error) {
      setEmailStatus('invalid');
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Erreur lors de la vérification de l\'email:', error);
    }
  };

  // Gérer la connexion avec mot de passe
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!password) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
          duration: 3000
        });
        navigate('/dashboard');
      } else {
        setError('Mot de passe incorrect.');
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      console.error('Erreur de connexion:', error);
    }
  };

  // Revenir à l'étape de saisie de l'email
  const handleBackToEmail = () => {
    setShowPasswordStep(false);
    setPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Connexion</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à votre tableau de bord
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {successMessage && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Succès</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {!showPasswordStep ? (
                <form onSubmit={handleEmailCheck}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading || emailStatus === 'checking'}
                    >
                      {emailStatus === 'checking' ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification...</>
                      ) : (
                        <>Continuer <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded flex items-center justify-between">
                      <span className="text-sm text-gray-700">{email}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={handleBackToEmail}
                      >
                        Modifier
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de Passe</Label>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                          Mot de passe oublié ?
                        </Link>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion...</>
                      ) : (
                        'Se connecter'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <div className="text-sm text-gray-600">
                {emailStatus === 'invalid' ? (
                  <div>
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-app-blue hover:underline">
                      S'inscrire
                    </Link>
                  </div>
                ) : (
                  <div>
                    Vous n'avez pas de compte ?{' '}
                    <Link to="/register" className="text-app-blue hover:underline">
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
