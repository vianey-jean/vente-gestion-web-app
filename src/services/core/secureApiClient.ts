
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiRateLimit, sanitizeInput, validateSession } from '@/utils/security';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Client API sécurisé avec protection avancée
export const secureApiClient = axios.create({
  baseURL: `${AUTH_BASE_URL}/api`,
  timeout: 15000,
  maxRedirects: 0,
  withCredentials: false,
});

// Intercepteur de requête sécurisé
secureApiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Vérification du rate limiting
    if (!apiRateLimit.isAllowed()) {
      throw new Error('Trop de requêtes. Veuillez patienter.');
    }

    // Validation de session
    if (!validateSession() && !config.url?.includes('/auth/')) {
      throw new Error('Session expirée');
    }

    // Ajout du token d'authentification
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Sécurisation des paramètres
    if (config.params) {
      Object.keys(config.params).forEach(key => {
        if (typeof config.params[key] === 'string') {
          config.params[key] = sanitizeInput(config.params[key]);
        }
      });
    }

    // Sécurisation des données
    if (config.data && typeof config.data === 'object' && !config.data instanceof FormData) {
      const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
          return sanitizeInput(obj);
        }
        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          Object.keys(obj).forEach(key => {
            sanitized[key] = sanitizeObject(obj[key]);
          });
          return sanitized;
        }
        return obj;
      };
      config.data = sanitizeObject(config.data);
    }

    // Headers de sécurité
    config.headers = {
      ...config.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };

    // Cache busting pour les requêtes GET
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
        _nonce: Math.random().toString(36).substring(7),
      };
    }

    console.log(`🔒 Secure ${config.method?.toUpperCase()} Request to ${config.url}`);

    return config;
  },
  (error) => {
    console.error('🚨 Secure Request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse sécurisé
secureApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Validation de la réponse
    if (response.data && typeof response.data === 'object') {
      // Log sécurisé sans exposer de données sensibles
      console.log(`✅ Secure Response from ${response.config.url}: Status ${response.status}`);
    }

    return response;
  },
  (error) => {
    console.error("🚨 Secure API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    
    // Gestion sécurisée des erreurs d'authentification
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login') && 
        !error.config?.url?.includes('/auth/verify-token')) {
      console.log("🔐 Session expirée, nettoyage sécurisé...");
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('maintenanceAdminBypass');
      
      // Redirection sécurisée
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    
    return Promise.reject(error);
  }
);

export default secureApiClient;
