/**
 * =============================================================================
 * Service de Cryptage AES-256-GCM - Haute Performance
 * =============================================================================
 * 
 * Cryptage/décryptage de toutes les données en base de données.
 * Algorithme : AES-256-GCM (authentifié, résistant aux altérations)
 * 
 * - Chaque valeur cryptée contient : iv + authTag + cipherText (en base64)
 * - Clé dérivée de ENCRYPTION_KEY via PBKDF2 (100 000 itérations)
 * - Seul le frontend avec la même clé peut décrypter
 * 
 * @module services/encryption
 */

const crypto = require('crypto');

// Clé de cryptage - DOIT être la même sur frontend et backend
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || 'gestion-vente-ultra-secure-key-2024-aes256';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = 'gestion-vente-salt-v2';

// Dériver une clé de 256 bits à partir de la clé brute via PBKDF2
let derivedKey = null;
const getDerivedKey = () => {
  if (!derivedKey) {
    derivedKey = crypto.pbkdf2Sync(ENCRYPTION_KEY_RAW, SALT, 100000, 32, 'sha512');
  }
  return derivedKey;
};

/**
 * Crypte une chaîne de caractères
 * @param {string} text - Texte à crypter
 * @returns {string} Texte crypté en format base64 (iv:authTag:cipherText)
 */
const encrypt = (text) => {
  if (text === null || text === undefined) return text;
  
  const textStr = typeof text === 'string' ? text : JSON.stringify(text);
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getDerivedKey();
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(textStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:cipherText (tout en base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
};

/**
 * Décrypte une chaîne cryptée
 * @param {string} encryptedText - Texte crypté (format iv:authTag:cipherText)
 * @returns {string} Texte décrypté
 */
const decrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
  
  // Vérifier si c'est un texte crypté (contient 2 séparateurs ':')
  const parts = encryptedText.split(':');
  if (parts.length !== 3) return encryptedText; // Pas crypté, retourner tel quel
  
  try {
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    
    const key = getDerivedKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Si le décryptage échoue, retourner le texte original (probablement pas crypté)
    return encryptedText;
  }
};

/**
 * Crypte un objet entier (toutes les valeurs string/number sont cryptées)
 * Les clés ne sont PAS cryptées pour permettre l'indexation
 * @param {object} obj - Objet à crypter
 * @returns {object} Objet avec valeurs cryptées
 */
const encryptObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => encryptObject(item));
  }
  
  if (typeof obj === 'object') {
    const encrypted = {};
    for (const [key, value] of Object.entries(obj)) {
      // Ne pas crypter l'ID (nécessaire pour les recherches)
      if (key === 'id') {
        encrypted[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        encrypted[key] = encryptObject(value);
      } else if (value !== null && value !== undefined) {
        encrypted[key] = encrypt(String(value));
      } else {
        encrypted[key] = value;
      }
    }
    return encrypted;
  }
  
  return encrypt(String(obj));
};

/**
 * Décrypte un objet entier
 * @param {object} obj - Objet crypté
 * @returns {object} Objet décrypté avec types restaurés
 */
const decryptObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => decryptObject(item));
  }
  
  if (typeof obj === 'object') {
    const decrypted = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'id') {
        decrypted[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        decrypted[key] = decryptObject(value);
      } else if (typeof value === 'string') {
        const decryptedValue = decrypt(value);
        // Essayer de restaurer le type original (number, boolean)
        decrypted[key] = tryParseOriginalType(decryptedValue);
      } else {
        decrypted[key] = value;
      }
    }
    return decrypted;
  }
  
  if (typeof obj === 'string') {
    return tryParseOriginalType(decrypt(obj));
  }
  
  return obj;
};

/**
 * Tente de restaurer le type original d'une valeur décryptée
 */
const tryParseOriginalType = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  
  // Essayer de parser comme nombre
  const num = Number(value);
  if (!isNaN(num) && value !== '' && String(num) === value) {
    return num;
  }
  
  // Essayer de parser comme JSON (pour les objets/arrays imbriqués)
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object') return parsed;
  } catch (e) {
    // Pas du JSON, retourner comme string
  }
  
  return value;
};

/**
 * Crypte les données pour envoi au frontend
 * Le frontend les décryptera avec la même clé
 * @param {any} data - Données à crypter pour le transport
 * @returns {object} { encrypted: true, data: "..." }
 */
const encryptForTransport = (data) => {
  const jsonStr = JSON.stringify(data);
  const encryptedData = encrypt(jsonStr);
  return {
    encrypted: true,
    data: encryptedData,
    timestamp: Date.now()
  };
};

/**
 * Décrypte les données reçues du frontend
 * @param {object} payload - { encrypted: true, data: "..." }
 * @returns {any} Données décryptées
 */
const decryptFromTransport = (payload) => {
  if (!payload || !payload.encrypted || !payload.data) {
    return payload;
  }
  
  const decryptedJson = decrypt(payload.data);
  try {
    return JSON.parse(decryptedJson);
  } catch (e) {
    return decryptedJson;
  }
};

module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  encryptForTransport,
  decryptFromTransport,
  tryParseOriginalType,
  ALGORITHM
};
