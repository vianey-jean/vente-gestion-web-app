/**
 * Configuration de base pour l'API avec décryptage automatique
 * Toutes les réponses du backend sont cryptées en AES-256-GCM
 * et décryptées automatiquement ici avant utilisation
 */
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { decryptApiResponse, encryptForTransport } from '@/services/crypto/cryptoService';

// Configuration de l'URL de base
const getBaseURL = () => {
  return import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
};

// Create axios instance with base configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

  // Configure retry logic
  axiosRetry(instance, {
    retries: 2,
    retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000,
    retryCondition: (error) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
             (error.response?.status === 503);
    },
  });

  // Request interceptor to add auth token + encrypt body
  instance.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Crypter le body des requêtes POST/PUT/PATCH (sauf FormData/uploads)
      if (
        config.data &&
        typeof config.data === 'object' &&
        !(config.data instanceof FormData) &&
        !config.data.encrypted &&
        ['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')
      ) {
        try {
          config.data = await encryptForTransport(config.data);
        } catch (e) {
          // En cas d'erreur de cryptage, envoyer les données non cryptées
          console.warn('Encryption failed, sending unencrypted:', e);
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: décrypter automatiquement les réponses cryptées
  instance.interceptors.response.use(
    async (response) => {
      // Décrypter la réponse si elle est cryptée
      if (response.data && response.data.encrypted === true) {
        try {
          response.data = await decryptApiResponse(response.data);
        } catch (e) {
          console.error('Decryption failed:', e);
        }
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.code !== 'ERR_NETWORK') {
        console.error('API Error:', error);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

export { api, getBaseURL };
export default api;
