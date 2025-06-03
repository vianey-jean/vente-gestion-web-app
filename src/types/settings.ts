
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  address: string;
  currency: string;
  language: string;
  timezone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  guestCheckoutEnabled: boolean;
  minimumOrderAmount: number;
  maxOrderQuantity: number;
  defaultShippingCost: number;
  freeShippingThreshold: number;
  taxRate: number;
  returnPeriodDays: number;
  stockWarningThreshold: number;
  autoApproveReviews: boolean;
  enableGuestReviews: boolean;
  maxReviewPhotos: number;
  defaultProductsPerPage: number;
  enableWishlist: boolean;
  enableCompareProducts: boolean;
  enableProductZoom: boolean;
  showOutOfStockProducts: boolean;
  enableCookieConsent: boolean;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export interface NotificationSettings {
  emailNotifications: {
    orderConfirmation: boolean;
    orderStatusUpdate: boolean;
    paymentConfirmation: boolean;
    shippingNotification: boolean;
    deliveryConfirmation: boolean;
    refundNotification: boolean;
    promotionalEmails: boolean;
    newsletterSubscription: boolean;
    reviewReminder: boolean;
    stockAlert: boolean;
    newProductAlert: boolean;
    flashSaleAlert: boolean;
  };
  pushNotifications: {
    browserNotifications: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    flashSales: boolean;
    newProducts: boolean;
    lowStock: boolean;
  };
  adminNotifications: {
    newOrder: boolean;
    newUser: boolean;
    newReview: boolean;
    newContact: boolean;
    lowStock: boolean;
    paymentFailed: boolean;
    refundRequest: boolean;
    systemErrors: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    orderConfirmation: boolean;
    shippingNotification: boolean;
    deliveryConfirmation: boolean;
  };
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface Settings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  updatedAt: string;
}
