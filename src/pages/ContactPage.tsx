
/**
 * PAGE DE CONTACT
 * ===============
 * 
 * Cette page permet aux utilisateurs de contacter l'équipe de support.
 * Elle fournit un formulaire de contact avec validation et différentes
 * méthodes de communication.
 * 
 * Fonctionnalités :
 * - Formulaire de contact avec validation
 * - Informations de contact multiples
 * - Interface responsive
 * - Animations et design moderne
 * - Gestion des erreurs et succès
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Globe,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';

const ContactPage = () => {
  // Ici on attend l'initialisation des hooks
  const { toast } = useToast();

  // Ici on attend les états du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ici on attend les informations de contact
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@gestionvente.com",
      description: "Réponse sous 24h"
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: "+33 1 23 45 67 89",
      description: "Lun-Ven 9h00-18h00"
    },
    {
      icon: MapPin,
      title: "Adresse",
      value: "123 Rue de la Gestion, 75001 Paris",
      description: "Siège social"
    },
    {
      icon: Clock,
      title: "Horaires",
      value: "Lun-Ven 9h00-18h00",
      description: "Support technique"
    }
  ];

  // Ici on attend les réseaux sociaux
  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "#" },
    { icon: Twitter, name: "Twitter", url: "#" },
    { icon: Linkedin, name: "LinkedIn", url: "#" },
    { icon: Globe, name: "Site Web", url: "#" }
  ];

  // Ici on attend la fonction de validation
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        return !value ? 'Le nom est requis' : '';
      case 'email':
        if (!value) return 'L\'email est requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format d\'email invalide';
        return '';
      case 'subject':
        return !value ? 'Le sujet est requis' : '';
      case 'message':
        if (!value) return 'Le message est requis';
        if (value.length < 10) return 'Le message doit contenir au moins 10 caractères';
        return '';
      default:
        return '';
    }
  };

  // Ici on attend la gestion des changements
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Mise à jour de la valeur
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validation en temps réel
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Ici on attend la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation complète
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      subject: validateField('subject', formData.subject),
      message: validateField('message', formData.message)
    };

    setErrors(newErrors);

    // Vérification des erreurs
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    // Ici on attend l'envoi du message
    setIsSubmitting(true);

    try {
      // Simulation d'envoi (remplacer par vraie API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici on a ajouté la notification de succès
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
        duration: 5000,
      });

      // Réinitialisation du formulaire
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      // Ici on a ajouté la gestion d'erreur
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ici on attend le rendu du composant
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Ici on attend l'en-tête de la page */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contactez-Nous
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter pour toute question ou assistance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Ici on attend le formulaire de contact */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Envoyez-nous un message
              </CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Champ Nom */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Votre nom complet"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Champ Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Champ Sujet */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Sujet de votre message"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={errors.subject ? "border-red-500" : ""}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Champ Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Décrivez votre demande en détail..."
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={5}
                    className={errors.message ? "border-red-500" : ""}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Bouton d'envoi */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Ici on attend les informations de contact */}
          <div className="space-y-6">
            
            {/* Informations de contact */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Informations de Contact</CardTitle>
                <CardDescription>
                  Plusieurs façons de nous joindre
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <info.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{info.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{info.value}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Réseaux sociaux */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Suivez-nous</CardTitle>
                <CardDescription>
                  Restez connecté avec nous sur les réseaux sociaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow duration-200"
                      title={social.name}
                    >
                      <social.icon className="h-5 w-5 text-white" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ rapide */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Questions Fréquentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Quel est le délai de réponse ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Nous répondons généralement sous 24h pendant les jours ouvrables.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Le support est-il gratuit ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Oui, le support par email est entièrement gratuit pour tous nos utilisateurs.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Puis-je demander une démonstration ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Absolument ! Contactez-nous pour planifier une démonstration personnalisée.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ici on a ajouté l'export par défaut du composant
export default ContactPage;
