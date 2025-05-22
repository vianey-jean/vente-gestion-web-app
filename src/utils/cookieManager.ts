
// Define type for cookie preferences
export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

// Define type for cookie preference updates that can be exported
export type CookiePreferencesUpdate = Omit<CookiePreferences, 'essential' | 'timestamp'>;

// Cookie names
const CONSENT_COOKIE_NAME = 'cookieConsent';
const FUNCTIONAL_COOKIE_NAME = 'functionalEnabled';
const ANALYTICS_COOKIE_NAME = 'analyticsEnabled';
const MARKETING_COOKIE_NAME = 'marketingEnabled';

// Set default expiration to 365 days
const COOKIE_EXPIRATION_DAYS = 365;

// Helper to set a cookie with a specific expiration
const setCookie = (name: string, value: string, days: number): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

// Helper to get a cookie value by name
const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Helper to delete a cookie
const deleteCookie = (name: string): void => {
  setCookie(name, '', -1);
};

// Check if consent has been given
export const hasConsentBeenGiven = (): boolean => {
  return getCookie(CONSENT_COOKIE_NAME) === 'true';
};

// Get current cookie preferences
export const getCookiePreferences = (): CookiePreferences => {
  return {
    essential: true, // Always true, cannot be disabled
    functional: getCookie(FUNCTIONAL_COOKIE_NAME) === 'true',
    analytics: getCookie(ANALYTICS_COOKIE_NAME) === 'true',
    marketing: getCookie(MARKETING_COOKIE_NAME) === 'true',
    timestamp: Number(getCookie('consentTimestamp') || Date.now())
  };
};

// Save cookie preferences
export const saveCookiePreferences = (preferences: CookiePreferencesUpdate): void => {
  // Essential cookies are always enabled
  const fullPreferences: CookiePreferences = {
    ...preferences,
    essential: true,
    timestamp: Date.now()
  };
  
  // Set the main consent cookie
  setCookie(CONSENT_COOKIE_NAME, 'true', COOKIE_EXPIRATION_DAYS);
  setCookie('consentTimestamp', String(fullPreferences.timestamp), COOKIE_EXPIRATION_DAYS);
  
  // Set individual feature cookies
  setCookie(FUNCTIONAL_COOKIE_NAME, String(fullPreferences.functional), COOKIE_EXPIRATION_DAYS);
  setCookie(ANALYTICS_COOKIE_NAME, String(fullPreferences.analytics), COOKIE_EXPIRATION_DAYS);
  setCookie(MARKETING_COOKIE_NAME, String(fullPreferences.marketing), COOKIE_EXPIRATION_DAYS);
  
  // If a specific type is disabled, delete related cookies
  if (!fullPreferences.functional) {
    // Delete functional cookies if functional is disabled
    // Example: deleteCookie('functionalCookie1');
  }
  
  if (!fullPreferences.analytics) {
    // Delete analytics cookies if analytics is disabled
    // Example: deleteCookie('_ga');
  }
  
  if (!fullPreferences.marketing) {
    // Delete marketing cookies if marketing is disabled
    // Example: deleteCookie('marketingCookie1');
  }
};

// Fix for the type comparison issue
export const isCookieTypeEnabled = (type: keyof Omit<CookiePreferences, 'timestamp'>): boolean => {
  if (type === "essential") return true;
  
  const cookieValue = getCookie(`${type}Enabled`);
  return cookieValue === 'true';
};

// Export types for module augmentation
export type { CookiePreferences, CookiePreferencesUpdate };
