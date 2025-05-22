
// Cookie manager functions

// Type for cookie preferences
export interface CookiePreference {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
}

// Cookie names
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';
const ESSENTIAL_KEY = 'essential';

// Default cookie settings
const DEFAULT_PREFERENCES: CookiePreference = {
  essential: true, // Essential is always true
  performance: false,
  functional: false,
  marketing: false,
};

// Function to save cookie preferences
export const saveCookiePreferences = (preferences: CookiePreference): void => {
  // Ensure essential is always true
  const finalPreferences: CookiePreference = {
    ...preferences,
    essential: true, // Essential cookies can't be disabled
  };

  // Save preferences to localStorage
  try {
    localStorage.setItem(
      COOKIE_PREFERENCES_KEY,
      JSON.stringify(finalPreferences)
    );
  } catch (err) {
    console.error('Failed to save cookie preferences:', err);
  }
};

// Function to get cookie preferences
export const getCookiePreferences = (): CookiePreference => {
  try {
    // Try to get from localStorage
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (savedPreferences) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPreferences) };
    }
  } catch (err) {
    console.error('Failed to retrieve cookie preferences:', err);
  }

  // Return default if not found or error
  return DEFAULT_PREFERENCES;
};

// Function to check if a specific cookie type is allowed
export const isCookieAllowed = (type: keyof CookiePreference): boolean => {
  if (type === 'essential') return true; // Essential cookies are always allowed

  const preferences = getCookiePreferences();
  return preferences[type];
};

// Function to check if cookie consent has been given
export const hasCookieConsent = (): boolean => {
  try {
    return localStorage.getItem(COOKIE_PREFERENCES_KEY) !== null;
  } catch {
    return false;
  }
};

// Update cookie preferences
export const updateCookiePreference = (
  type: 'performance' | 'functional' | 'marketing',
  value: boolean
): void => {
  const current = getCookiePreferences();
  
  // Essential cookies cannot be disabled
  if (type === 'essential' && value === false) {
    return;
  }
  
  // Update the specific preference type
  const updated = {
    ...current,
    [type]: value,
  };
  
  saveCookiePreferences(updated);
};

// Type for cookie preferences update
export type CookiePreferenceUpdate = Partial<{
  performance: boolean;
  functional: boolean;
  marketing: boolean;
}>;

// Function to update multiple preferences at once
export const updateMultipleCookiePreferences = (updates: CookiePreferenceUpdate): void => {
  const current = getCookiePreferences();
  
  // Apply all updates except essential (which must remain true)
  const updated = {
    ...current,
    ...updates,
    essential: true, // Always keep essential as true
  };
  
  saveCookiePreferences(updated);
};

// Reset all cookie preferences to default
export const resetCookiePreferences = (): void => {
  saveCookiePreferences(DEFAULT_PREFERENCES);
};

// Export CookiePreference type for use in other files
export type { CookiePreference as CookiePreferences };
export type { CookiePreferenceUpdate as CookiePreferencesUpdate };
