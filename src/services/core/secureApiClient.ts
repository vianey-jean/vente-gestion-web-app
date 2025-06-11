
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';

// Configuration de sécurité
const ENCRYPTION_KEY = 'riziky-boutique-secure-key-2024';
const MAX_REQUESTS_PER_MINUTE = 60;
const REQUEST_TIMEOUT = 10000;

// Rate limiting
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;

  constructor(maxRequests: number = MAX_REQUESTS_PER_MINUTE) {
    this.maxRequests = maxRequests;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Nettoyer les anciennes requêtes
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

// Utilitaires de sécurité
export const securityUtils = {
  // Cryptage des données sensibles
  encrypt: (data: string): string => {
    try {
      return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Erreur de cryptage:', error);
      return data;
    }
  },

  // Décryptage des données
  decrypt: (encryptedData: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Erreur de décryptage:', error);
      return encryptedData;
    }
  },

  // Nettoyage XSS
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  // Validation des tokens
  validateToken: (token: string): boolean => {
    if (!token || token.length < 10) return false;
    
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  },

  // Stockage sécurisé
  setSecureItem: (key: string, value: string): void => {
    try {
      const encrypted = securityUtils.encrypt(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Erreur de stockage sécurisé:', error);
    }
  },

  getSecureItem: (key: string): string | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return securityUtils.decrypt(encrypted);
    } catch (error) {
      console.error('Erreur de récupération sécurisée:', error);
      return null;
    }
  }
};

// Instance de rate limiting
const rateLimiter = new RateLimiter();

// Client API sécurisé
const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const secureApiClient = axios.create({
  baseURL: `${AUTH_BASE_URL}/api`,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  },
});

// Intercepteur de requête avec sécurité
secureApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Vérification du rate limiting
    if (!rateLimiter.canMakeRequest()) {
      throw new Error('Trop de requêtes. Veuillez patienter.');
    }

    // Ajout du token d'authentification
    const token = securityUtils.getSecureItem('authToken');
    if (token && securityUtils.validateToken(token)) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Nettoyage des données d'entrée
    if (config.data && typeof config.data === 'object') {
      config.data = sanitizeRequestData(config.data);
    }

    // Ajout d'un timestamp pour éviter le cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    console.log(`🔒 ${config.method?.toUpperCase()} Request to ${config.url}`, 
      config.method === 'post' || config.method === 'put' 
        ? JSON.stringify(config.data)
        : config.params || {});

    return config;
  },
  (error) => {
    console.error('🚨 Request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse avec validation
secureApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ Response from ${response.config.url}:`, response.data);
    
    // Validation de la réponse
    if (response.data && typeof response.data === 'object') {
      response.data = sanitizeResponseData(response.data);
    }
    
    return response;
  },
  (error) => {
    console.error("🚨 API Error:", error.response || error);
    
    // Gestion des erreurs d'authentification
    if (error.response && error.response.status === 401 && 
        !error.config.url.includes('/auth/login') && 
        !error.config.url.includes('/auth/verify-token')) {
      console.log("🔒 Session expirée, nettoyage des données...");
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Gestion du rate limiting
    if (error.response && error.response.status === 429) {
      console.log("⏰ Rate limit atteint, veuillez patienter...");
    }
    
    return Promise.reject(error);
  }
);

// Fonction de nettoyage des données de requête
function sanitizeRequestData(data: any): any {
  if (typeof data === 'string') {
    return securityUtils.sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeRequestData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeRequestData(value);
    }
    return sanitized;
  }
  
  return data;
}

// Fonction de nettoyage des données de réponse
function sanitizeResponseData(data: any): any {
  if (typeof data === 'string') {
    return securityUtils.sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponseData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeResponseData(value);
    }
    return sanitized;
  }
  
  return data;
}

export default secureApiClient;
