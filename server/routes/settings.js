
const express = require('express');
const router = express.Router();
const database = require('../core/database');

// Paramètres par défaut
const defaultSettings = {
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

// GET /api/settings - Récupérer tous les paramètres
router.get('/', (req, res) => {
  try {
    let settings = database.read('settings.json');
    
    // Si aucun paramètre n'existe, retourner les paramètres par défaut
    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      settings = defaultSettings;
      database.write('settings.json', settings);
    } else {
      settings = settings[0] || defaultSettings;
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des paramètres',
      error: error.message 
    });
  }
});

// PUT /api/settings/general - Mettre à jour les paramètres généraux
router.put('/general', (req, res) => {
  try {
    let settings = database.read('settings.json');
    
    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      settings = { ...defaultSettings };
    } else {
      settings = settings[0] || defaultSettings;
    }
    
    // Mettre à jour les paramètres généraux
    settings.general = { ...settings.general, ...req.body };
    settings.updatedAt = new Date().toISOString();
    
    database.write('settings.json', settings);
    
    res.json(settings.general);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres généraux:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour des paramètres généraux',
      error: error.message 
    });
  }
});

// PUT /api/settings/notifications - Mettre à jour les paramètres de notifications
router.put('/notifications', (req, res) => {
  try {
    let settings = database.read('settings.json');
    
    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      settings = { ...defaultSettings };
    } else {
      settings = settings[0] || defaultSettings;
    }
    
    // Mettre à jour les paramètres de notifications
    settings.notifications = { ...settings.notifications, ...req.body };
    settings.updatedAt = new Date().toISOString();
    
    database.write('settings.json', settings);
    
    res.json(settings.notifications);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de notifications:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour des paramètres de notifications',
      error: error.message 
    });
  }
});

// POST /api/settings/reset - Réinitialiser aux paramètres par défaut
router.post('/reset', (req, res) => {
  try {
    const resetSettings = { 
      ...defaultSettings, 
      updatedAt: new Date().toISOString() 
    };
    
    database.write('settings.json', resetSettings);
    
    res.json({ 
      message: 'Paramètres réinitialisés aux valeurs par défaut',
      settings: resetSettings 
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la réinitialisation des paramètres',
      error: error.message 
    });
  }
});

module.exports = router;
