
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { useToast } from '../components/ui/use-toast';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      // Dans une véritable application, nous enverrions une demande à l'API
      setIsSubmitting(false);
      setSubmitted(true);
      
      toast({
        title: "Demande envoyée",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.",
        duration: 5000
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
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
              
              {submitted ? (
                <div className="text-center py-6">
                  <div className="mx-auto bg-green-50 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Email envoyé !</h3>
                  <p className="text-gray-600 mb-6">
                    Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Renvoyer l'email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traitement...</>
                    ) : (
                      'Réinitialiser le mot de passe'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <Link 
                to="/login" 
                className="flex items-center text-app-blue hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la connexion
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
