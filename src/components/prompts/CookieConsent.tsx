
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const { user } = useAuth();
  
  // Options de cookies
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Toujours requis, ne peut pas être désactivé
    analytics: true,
    marketing: false,
    personalisation: true,
  });
  
  // Vérifier si l'utilisateur a déjà donné son consentement
  useEffect(() => {
    const consentGiven = localStorage.getItem('cookie-consent');
    if (!consentGiven) {
      // Afficher la bannière après un petit délai pour éviter de l'afficher immédiatement au chargement
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      try {
        // Récupérer les préférences sauvegardées
        const savedPreferences = JSON.parse(consentGiven);
        if (savedPreferences && typeof savedPreferences === 'object') {
          setCookiePreferences(prev => ({
            ...prev,
            ...savedPreferences
          }));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des préférences de cookies:", error);
      }
    }
  }, []);
  
  // Sauvegarder les préférences en base de données si l'utilisateur est connecté
  const saveCookiePreferencesToDB = async (preferences: typeof cookiePreferences) => {
    if (user && user.id) {
      try {
        await axios.post('/api/users/preferences', { 
          userId: user.id,
          cookiePreferences: preferences
        });
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des préférences de cookies:", error);
      }
    }
  };
  
  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      personalisation: true,
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    saveCookiePreferencesToDB(allAccepted);
    setShowConsent(false);
  };
  
  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      ...cookiePreferences,
      essential: true // Toujours obligatoire
    }));
    
    saveCookiePreferencesToDB({
      ...cookiePreferences,
      essential: true
    });
    
    setShowConsent(false);
  };
  
  const handlePreferenceChange = (key: keyof typeof cookiePreferences) => {
    setCookiePreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const dismiss = () => {
    setShowConsent(false);
  };
  
  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 p-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-start">
              <div className="hidden sm:flex h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 items-center justify-center flex-shrink-0 mr-4">
                <Cookie className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold mb-2">Notre site utilise des cookies</h3>
                  <button onClick={dismiss} className="text-neutral-400 hover:text-neutral-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                  Nous utilisons des cookies pour améliorer votre expérience de navigation, 
                  personnaliser le contenu et les publicités, fournir des fonctionnalités de 
                  médias sociaux et analyser notre trafic. Vous pouvez choisir les cookies que vous acceptez.
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="essential" 
                      checked={cookiePreferences.essential} 
                      disabled={true}
                    />
                    <Label htmlFor="essential" className="font-medium">
                      Cookies essentiels (obligatoires)
                    </Label>
                  </div>
                  <p className="text-sm text-neutral-500 ml-6">
                    Nécessaires au bon fonctionnement du site
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="analytics" 
                      checked={cookiePreferences.analytics} 
                      onCheckedChange={() => handlePreferenceChange('analytics')}
                    />
                    <Label htmlFor="analytics" className="font-medium">
                      Cookies analytiques
                    </Label>
                  </div>
                  <p className="text-sm text-neutral-500 ml-6">
                    Pour analyser le trafic et comprendre comment vous utilisez notre site
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="marketing" 
                      checked={cookiePreferences.marketing} 
                      onCheckedChange={() => handlePreferenceChange('marketing')}
                    />
                    <Label htmlFor="marketing" className="font-medium">
                      Cookies marketing
                    </Label>
                  </div>
                  <p className="text-sm text-neutral-500 ml-6">
                    Pour afficher des publicités pertinentes sur notre site et d'autres sites web
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="personalisation" 
                      checked={cookiePreferences.personalisation} 
                      onCheckedChange={() => handlePreferenceChange('personalisation')}
                    />
                    <Label htmlFor="personalisation" className="font-medium">
                      Cookies de personnalisation
                    </Label>
                  </div>
                  <p className="text-sm text-neutral-500 ml-6">
                    Pour vous proposer une expérience personnalisée sur notre site
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <Button 
                    variant="default" 
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700" 
                    onClick={acceptAll}
                  >
                    Accepter tous les cookies
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto" 
                    onClick={savePreferences}
                  >
                    Enregistrer mes préférences
                  </Button>
                  
                  <Link 
                    to="/politique-cookies" 
                    className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 underline"
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
