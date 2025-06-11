
import { nanoid } from 'nanoid';

// CSP Nonce pour la sécurité
export const generateNonce = (): string => {
  return nanoid(16);
};

// Validation et nettoyage des entrées utilisateur
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .replace(/javascript:/gi, '') // Supprimer les liens javascript
    .replace(/on\w+=/gi, '') // Supprimer les gestionnaires d'événements
    .trim();
};

// Validation des URLs
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Protection contre les attaques XSS
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Throttling pour limiter les requêtes
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Validation de session sécurisée
export const validateSession = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = Date.now() >= payload.exp * 1000;
    
    if (isExpired) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return false;
    }
    
    return true;
  } catch {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return false;
  }
};

// Cryptage basique pour le stockage local
export const encryptStorage = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

export const decryptStorage = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return '';
  }
};

// Rate limiting pour les requêtes API
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimit {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.config.windowMs);
    
    if (this.requests.length >= this.config.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

export const apiRateLimit = new RateLimit({ maxRequests: 100, windowMs: 60000 });
