/**
 * Service de cryptage/décryptage pour les clés sensibles
 * Utilise AES-256-CBC pour un cryptage sécurisé
 */

const crypto = require('crypto');

// Clé de cryptage - en production, utilisez une variable d'environnement
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lovable-secure-key-32-chars-long!';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

/**
 * Crypte une chaîne de caractères
 * @param {string} text - Texte à crypter
 * @returns {string} - Texte crypté en format base64
 */
const encrypt = (text) => {
  if (!text) return '';
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retourne IV + texte crypté en base64
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Erreur lors du cryptage:', error);
    throw new Error('Échec du cryptage');
  }
};

/**
 * Décrypte une chaîne de caractères
 * @param {string} encryptedText - Texte crypté en format base64
 * @returns {string} - Texte décrypté
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      // Si le format n'est pas correct, c'est probablement une clé non cryptée
      return encryptedText;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erreur lors du décryptage:', error);
    // Si le décryptage échoue, retourner la valeur originale (peut être non cryptée)
    return encryptedText;
  }
};

module.exports = {
  encrypt,
  decrypt
};
