
// Cookie type definitions
export interface CookiePreferences {
  essential: boolean; // Always true, can't be disabled
  performance: boolean;
  functional: boolean;
  marketing: boolean;
}

export interface SavedCookiePreferences extends CookiePreferences {
  userId: string;
  updatedAt: string;
}

// Default cookie preferences
export const defaultCookiePreferences: CookiePreferences = {
  essential: true, // Cannot be disabled
  performance: false,
  functional: false,
  marketing: false
};

// Set a cookie with a name, value, and optional days to expiration
export const setCookie = (name: string, value: string, days: number = 365): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
};

// Get a cookie value by name
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Check if a cookie exists
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

// Delete a cookie by name
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

// Save user cookie preferences
export const saveCookiePreferences = (preferences: CookiePreferences): void => {
  setCookie('cookiePreferences', JSON.stringify(preferences));
};

// Get user cookie preferences
export const getCookiePreferences = (): CookiePreferences => {
  const preferencesStr = getCookie('cookiePreferences');
  if (preferencesStr) {
    try {
      return JSON.parse(preferencesStr);
    } catch (e) {
      console.error('Error parsing cookie preferences:', e);
      return { ...defaultCookiePreferences };
    }
  }
  return { ...defaultCookiePreferences };
};

// Check if a specific cookie type is allowed
export const isCookieTypeAllowed = (type: keyof CookiePreferences): boolean => {
  // Essential cookies are always allowed
  if (type === 'essential') return true;
  
  const preferences = getCookiePreferences();
  return preferences[type] === true;
};
