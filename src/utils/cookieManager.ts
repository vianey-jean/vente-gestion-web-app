import Cookies from 'js-cookie';

export type CookieType = "essential" | "analytics" | "marketing";

interface CookieAttributes {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

interface CookieSettings {
  name: string;
  type: CookieType;
  attributes: CookieAttributes;
}

const defaultAttributes: CookieAttributes = {
  expires: 365, // days
  path: '/',
  sameSite: 'lax',
};

const cookieSettings: CookieSettings[] = [
  {
    name: 'cookieConsent',
    type: 'essential',
    attributes: {
      ...defaultAttributes,
    }
  },
  // Add more cookies here
];

const isNotEssentialCookieType = (type: CookieType): boolean => {
  return type !== "essential";
};

export const setCookie = (name: string, value: string, attributes?: CookieAttributes) => {
  Cookies.set(name, value, { ...defaultAttributes, ...attributes });
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: defaultAttributes.path });
};

export const initializeCookies = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const consent = getCookie('cookieConsent');

  if (!consent) {
    // Show cookie consent prompt
    return;
  }

  if (consent === 'accepted') {
    // Set non-essential cookies
    cookieSettings.filter(cookie => isNotEssentialCookieType(cookie.type)).forEach(cookie => {
      setCookie(cookie.name, 'true', cookie.attributes);
    });
  }
};

export const acceptCookies = () => {
  setCookie('cookieConsent', 'accepted');
  cookieSettings.filter(cookie => isNotEssentialCookieType(cookie.type)).forEach(cookie => {
    setCookie(cookie.name, 'true', cookie.attributes);
  });
};

export const declineCookies = () => {
  setCookie('cookieConsent', 'declined');
  cookieSettings.filter(cookie => isNotEssentialCookieType(cookie.type)).forEach(cookie => {
    removeCookie(cookie.name);
  });
};
