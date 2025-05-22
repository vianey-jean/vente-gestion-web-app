
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cookiePreferencesAPI, CookiePreferences } from '@/services/api';

const CookiePreferencesForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    performance: true,
    functional: true,
    marketing: false
  });

  // Charger les préférences de cookies existantes
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Essayer d'abord de charger depuis le localStorage
        try {
          const storedPrefs = localStorage.getItem('cookie-preferences');
          if (storedPrefs) {
            const parsedPrefs = JSON.parse(storedPrefs);
            setPreferences(parsedPrefs);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des préférences locales:", error);
        }
        
        // Puis essayer de charger depuis la base de données
        try {
          const response = await cookiePreferencesAPI.get(user.id);
          if (response.data) {
            setPreferences(response.data);
            // Mettre à jour également le localStorage
            localStorage.setItem('cookie-preferences', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error("Erreur lors du chargement des préférences depuis la BDD:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadPreferences();
  }, [user]);

  const handleCheckboxChange = (key: keyof CookiePreferences) => {
    // Ne pas permettre de désactiver les cookies essentiels
    if (key === 'essential') return;
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = async () => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour enregistrer vos préférences");
      return;
    }
    
    setLoading(true);
    try {
      // Enregistrer dans le localStorage
      localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
      localStorage.setItem('cookie-consent', 'custom');
      
      // Enregistrer dans la base de données
      await cookiePreferencesAPI.save(user.id, preferences);
      
      toast.success('Préférences de cookies enregistrées avec succès');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement des préférences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences de cookies</CardTitle>
        <CardDescription>Gérez vos préférences de confidentialité concernant les cookies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="essentialCookies" 
              checked={preferences.essential}
              className="mt-1"
              disabled={true}
            />
            <div>
              <Label htmlFor="essentialCookies" className="font-medium">Cookies essentiels (obligatoires)</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="performanceCookies" 
              checked={preferences.performance}
              className="mt-1"
              onCheckedChange={() => handleCheckboxChange('performance')}
            />
            <div>
              <Label htmlFor="performanceCookies" className="font-medium">Cookies de performance</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ces cookies nous permettent d'analyser l'utilisation du site afin de mesurer et améliorer ses performances.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="functionalCookies" 
              checked={preferences.functional}
              className="mt-1"
              onCheckedChange={() => handleCheckboxChange('functional')}
            />
            <div>
              <Label htmlFor="functionalCookies" className="font-medium">Cookies fonctionnels</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation de votre expérience.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="marketingCookies" 
              checked={preferences.marketing}
              className="mt-1"
              onCheckedChange={() => handleCheckboxChange('marketing')}
            />
            <div>
              <Label htmlFor="marketingCookies" className="font-medium">Cookies marketing</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ces cookies sont utilisés pour suivre les visiteurs sur les sites web afin d'afficher des publicités pertinentes.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleSavePreferences} 
            className="mt-6"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CookiePreferencesForm;
