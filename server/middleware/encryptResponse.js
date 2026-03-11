/**
 * =============================================================================
 * Middleware de Cryptage des Réponses API
 * =============================================================================
 * 
 * Intercepte toutes les réponses JSON et les crypte avec AES-256-GCM
 * avant envoi au frontend. Seul le frontend avec la clé peut décrypter.
 * 
 * @module middleware/encryptResponse
 */

const { encryptForTransport, decryptFromTransport } = require('../services/encryption.service');

/**
 * Middleware qui crypte automatiquement les réponses JSON
 */
const encryptResponseMiddleware = (req, res, next) => {
  // Sauvegarder la méthode json originale
  const originalJson = res.json.bind(res);
  
  // Remplacer res.json pour crypter automatiquement
  res.json = (data) => {
    try {
      // Ne pas crypter les erreurs (status >= 400)
      if (res.statusCode >= 400) {
        return originalJson(data);
      }
      
      // Ne pas crypter les réponses SSE/streaming
      if (req.path.includes('/events') || req.path.includes('/sync/events')) {
        return originalJson(data);
      }
      
      // Crypter les données pour le transport
      const encryptedResponse = encryptForTransport(data);
      return originalJson(encryptedResponse);
    } catch (error) {
      console.error('Erreur cryptage réponse:', error.message);
      // En cas d'erreur de cryptage, envoyer les données non cryptées
      return originalJson(data);
    }
  };
  
  next();
};

/**
 * Middleware qui décrypte automatiquement les requêtes cryptées du frontend
 */
const decryptRequestMiddleware = (req, res, next) => {
  try {
    if (req.body && req.body.encrypted === true && req.body.data) {
      req.body = decryptFromTransport(req.body);
    }
  } catch (error) {
    console.error('Erreur décryptage requête:', error.message);
  }
  next();
};

module.exports = {
  encryptResponseMiddleware,
  decryptRequestMiddleware
};
