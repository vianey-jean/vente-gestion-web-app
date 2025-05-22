
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/services/api';
import { toast } from '@/components/ui/sonner';

// Interface pour les préférences de cookies
interface CookiePreferences {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { user } = useAuth();
  
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Toujours obligatoire
    performance: true,
    functional: true,
    marketing: false,
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
        // Charger les préférences sauvegardées
        const savedPreferences = JSON.parse(localStorage.getItem('cookie-preferences') || '{}');
        if (Object.keys(savedPreferences).length > 0) {
          setPreferences({
            ...preferences,
            ...savedPreferences
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des préférences de cookies:", error);
      }
    }
  }, []);
  
  // Enregistrer les préférences dans la base de données si l'utilisateur est connecté
  const saveCookiePreferencesToDb = async () => {
    if (!user?.id) return;
    
    try {
      await API.post(`/cookie-preferences/${user.id}`, preferences);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences de cookies:", error);
    }
  };
  
  const acceptAll = () => {
    const allPreferences = {
      essential: true,
      performance: true,
      functional: true,
      marketing: true
    };
    
    localStorage.setItem('cookie-consent', 'all');
    localStorage.setItem('cookie-preferences', JSON.stringify(allPreferences));
    setPreferences(allPreferences);
    setShowConsent(false);
    
    // Enregistrer dans la base de données si l'utilisateur est connecté
    if (user?.id) {
      saveCookiePreferencesToDb();
    }
    
    toast.success("Vos préférences de cookies ont été enregistrées");
  };
  
  const acceptSelected = () => {
    // L'essentiel est toujours obligatoire
    const updatedPreferences = {
      ...preferences,
      essential: true
    };
    
    localStorage.setItem('cookie-consent', 'custom');
    localStorage.setItem('cookie-preferences', JSON.stringify(updatedPreferences));
    setPreferences(updatedPreferences);
    setShowConsent(false);
    
    // Enregistrer dans la base de données si l'utilisateur est connecté
    if (user?.id) {
      saveCookiePreferencesToDb();
    }
    
    toast.success("Vos préférences de cookies ont été enregistrées");
  };
  
  const acceptEssential = () => {
    const essentialOnly = {
      essential: true,
      performance: false,
      functional: false,
      marketing: false
    };
    
    localStorage.setItem('cookie-consent', 'essential');
    localStorage.setItem('cookie-preferences', JSON.stringify(essentialOnly));
    setPreferences(essentialOnly);
    setShowConsent(false);
    
    // Enregistrer dans la base de données si l'utilisateur est connecté
    if (user?.id) {
      saveCookiePreferencesToDb();
    }
    
    toast.success("Vos préférences de cookies ont été enregistrées");
  };
  
  const dismiss = () => {
    setShowConsent(false);
  };
  
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  const handleCheckboxChange = (key: keyof CookiePreferences) => {
    // Ne pas permettre de désactiver les cookies essentiels
    if (key === 'essential') return;
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
                  médias sociaux et analyser notre trafic. Nous partageons également des informations 
                  sur votre utilisation de notre site avec nos partenaires.
                </p>
                
                {showOptions && (
                  <div className="mb-6 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Personnaliser les cookies</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="essential" 
                          checked={preferences.essential}
                          className="mt-1"
                          disabled={true}
                        />
                        <div>
                          <Label htmlFor="essential" className="font-medium">Cookies essentiels (obligatoires)</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="performance" 
                          checked={preferences.performance}
                          className="mt-1"
                          onCheckedChange={() => handleCheckboxChange('performance')}
                        />
                        <div>
                          <Label htmlFor="performance" className="font-medium">Cookies de performance</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ces cookies nous permettent d'analyser l'utilisation du site afin de mesurer et améliorer ses performances.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="functional" 
                          checked={preferences.functional}
                          className="mt-1"
                          onCheckedChange={() => handleCheckboxChange('functional')}
                        />
                        <div>
                          <Label htmlFor="functional" className="font-medium">Cookies fonctionnels</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation de votre expérience.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="marketing" 
                          checked={preferences.marketing}
                          className="mt-1"
                          onCheckedChange={() => handleCheckboxChange('marketing')}
                        />
                        <div>
                          <Label htmlFor="marketing" className="font-medium">Cookies marketing</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ces cookies sont utilisés pour suivre les visiteurs sur les sites web afin d'afficher des publicités pertinentes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <Button 
                    variant="default" 
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700" 
                    onClick={acceptAll}
                  >
                    Accepter tous les cookies
                  </Button>
                  
                  {showOptions ? (
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto" 
                      onClick={acceptSelected}
                    >
                      Enregistrer mes choix
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto" 
                      onClick={acceptEssential}
                    >
                      Accepter uniquement les cookies essentiels
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1"
                    onClick={toggleOptions}
                  >
                    {showOptions ? (
                      <>
                        Masquer les options
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Personnaliser
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
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
