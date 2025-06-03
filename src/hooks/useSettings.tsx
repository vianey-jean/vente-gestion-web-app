
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsAPI } from '@/services/settingsAPI';
import { Settings, GeneralSettings, NotificationSettings } from '@/types/settings';

interface SettingsContextType {
  settings: Settings | null;
  generalSettings: GeneralSettings | null;
  notificationSettings: NotificationSettings | null;
  isLoading: boolean;
  refetchSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

// Paramètres par défaut
const defaultSettings: Settings = {
  general: {
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
  },
  notifications: {
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
  },
  updatedAt: new Date().toISOString()
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const response = await settingsAPI.getSettings();
        return response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres, utilisation des valeurs par défaut:', error);
        return defaultSettings;
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
    retryDelay: 2000,
  });

  const finalSettings = settings || defaultSettings;

  return (
    <SettingsContext.Provider
      value={{
        settings: finalSettings,
        generalSettings: finalSettings.general,
        notificationSettings: finalSettings.notifications,
        isLoading,
        refetchSettings: refetch,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
