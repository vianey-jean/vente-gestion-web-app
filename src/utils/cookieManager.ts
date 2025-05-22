const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

const setCookie = (name: string, value: string, days: number = 365): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
};

const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  performance: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  performance: false,
  marketing: false,
};

const COOKIE_PREFERENCES_NAME = 'cookie_preferences';

const getSavedPreferences = (): CookiePreferences => {
  if (typeof localStorage === 'undefined') {
    return defaultPreferences;
  }

  const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_NAME);
  return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
};

const savePreferences = (preferences: CookiePreferences): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(COOKIE_PREFERENCES_NAME, JSON.stringify(preferences));
  }
};

const canStoreCookie = (category: string): boolean => {
  const preferences = getSavedPreferences();
  
  if (category === "essential") {
    return true; // Essential cookies are always allowed
  }
  
  // Type guard to ensure category is a valid preference key
  if (category === "functional" || category === "performance" || category === "marketing") {
    return !!preferences[category];
  }
  
  return false;
};

export { getCookie, setCookie, deleteCookie, getSavedPreferences, savePreferences, canStoreCookie, CookiePreferences, defaultPreferences };
