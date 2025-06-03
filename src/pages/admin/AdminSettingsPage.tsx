
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from './AdminLayout';
import GeneralSettingsForm from '@/components/admin/GeneralSettingsForm';
import NotificationSettingsForm from '@/components/admin/NotificationSettingsForm';
import { settingsAPI } from '@/services/settingsAPI';
import { GeneralSettings, NotificationSettings } from '@/types/settings';

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Paramètres par défaut
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'Riziky-Boutic',
    siteDescription: 'Votre boutique en ligne de confiance pour tous vos besoins',
    siteUrl: 'https://riziky-boutic.vercel.app',
    contactEmail: 'contact@riziky-boutic.com',
    supportEmail: 'support@riziky-boutic.com',
    phoneNumber: '+33 1 23 45 67 89',
    address: '123 Rue du Commerce, 75001 Paris, France',
    currency: 'EUR',
    language: 'fr',
    timezone: 'Europe/Paris',
    maintenanceMode: false,
    registrationEnabled: true,
    guestCheckoutEnabled: true,
    minimumOrderAmount: 10,
    maxOrderQuantity: 99,
    defaultShippingCost: 5.99,
    freeShippingThreshold: 50,
    taxRate: 20,
    returnPeriodDays: 30,
    stockWarningThreshold: 10,
    autoApproveReviews: false,
    enableGuestReviews: true,
    maxReviewPhotos: 5,
    defaultProductsPerPage: 12,
    enableWishlist: true,
    enableCompareProducts: true,
    enableProductZoom: true,
    showOutOfStockProducts: true,
    enableCookieConsent: true,
    googleAnalyticsId: '',
    facebookPixelId: '',
    metaTitle: 'Riziky-Boutic - Votre boutique en ligne',
    metaDescription: 'Découvrez notre large sélection de produits de qualité à prix abordables',
    metaKeywords: 'boutique, en ligne, e-commerce, produits, qualité'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: {
      orderConfirmation: true,
      orderStatusUpdate: true,
      paymentConfirmation: true,
      shippingNotification: true,
      deliveryConfirmation: true,
      refundNotification: true,
      promotionalEmails: false,
      newsletterSubscription: false,
      reviewReminder: true,
      stockAlert: true,
      newProductAlert: false,
      flashSaleAlert: true,
    },
    pushNotifications: {
      browserNotifications: true,
      orderUpdates: true,
      promotions: false,
      flashSales: true,
      newProducts: false,
      lowStock: true,
    },
    adminNotifications: {
      newOrder: true,
      newUser: true,
      newReview: true,
      newContact: true,
      lowStock: true,
      paymentFailed: true,
      refundRequest: true,
      systemErrors: true,
    },
    smsNotifications: {
      enabled: false,
      orderConfirmation: false,
      shippingNotification: false,
      deliveryConfirmation: false,
    },
    notificationFrequency: 'immediate',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await settingsAPI.getSettings();
      if (response.data.general) {
        setGeneralSettings(response.data.general);
      }
      if (response.data.notifications) {
        setNotificationSettings(response.data.notifications);
      }
    } catch (error) {
      console.log('Paramètres par défaut utilisés - premier démarrage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneralSettings = async (settings: Partial<GeneralSettings>) => {
    setIsSaving(true);
    try {
      await settingsAPI.updateGeneralSettings(settings);
      setGeneralSettings(prev => ({ ...prev, ...settings }));
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres généraux ont été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres généraux.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    setIsSaving(true);
    try {
      await settingsAPI.updateNotificationSettings(settings);
      setNotificationSettings(prev => ({ ...prev, ...settings }));
      toast({
        title: "Notifications sauvegardées",
        description: "Les paramètres de notification ont été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres de notification.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    setIsLoading(true);
    try {
      await settingsAPI.resetToDefaults();
      await loadSettings();
      toast({
        title: "Paramètres réinitialisés",
        description: "Tous les paramètres ont été remis aux valeurs par défaut.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement des paramètres...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Settings className="h-6 w-6" />
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Paramètres Généraux</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Généraux</CardTitle>
              </CardHeader>
              <CardContent>
                <GeneralSettingsForm
                  settings={generalSettings}
                  onSave={handleSaveGeneralSettings}
                  isLoading={isSaving}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationSettingsForm
                  settings={notificationSettings}
                  onSave={handleSaveNotificationSettings}
                  isLoading={isSaving}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
