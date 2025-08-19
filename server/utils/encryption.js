const CryptoJS = require('crypto-js');

// Clé de chiffrement - doit être sécurisée en production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'gestion_vente_secret_encryption_key_2024';

class EncryptionService {
  // Crypter les données
  static encrypt(text) {
    if (!text || typeof text !== 'string') return text;
    try {
      const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Erreur de cryptage:', error);
      return text;
    }
  }

  // Décrypter les données
  static decrypt(encryptedText) {
    if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
    
    // Si le texte ne semble pas être crypté (ne contient pas de caractères cryptés), le retourner tel quel
    if (!encryptedText.includes('U2FsdGVkX1') && !encryptedText.match(/^[A-Za-z0-9+/]+=*$/)) {
      return encryptedText;
    }
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      // Si le décryptage échoue ou retourne une chaîne vide, retourner le texte original
      if (!decrypted || decrypted.length === 0) {
        return encryptedText;
      }
      
      return decrypted;
    } catch (error) {
      console.error('Erreur de décryptage:', error);
      // Retourner le texte original en cas d'erreur
      return encryptedText;
    }
  }

  // Crypter un objet avec des champs spécifiques
  static encryptObject(obj, fieldsToEncrypt) {
    if (!obj) return obj;
    const encrypted = { ...obj };
    
    fieldsToEncrypt.forEach(field => {
      if (encrypted[field] !== undefined) {
        encrypted[field] = this.encrypt(encrypted[field].toString());
      }
    });
    
    return encrypted;
  }

  // Décrypter un objet avec des champs spécifiques
  static decryptObject(obj, fieldsToDecrypt) {
    if (!obj) return obj;
    const decrypted = { ...obj };
    
    fieldsToDecrypt.forEach(field => {
      if (decrypted[field] !== undefined) {
        decrypted[field] = this.decrypt(decrypted[field]);
      }
    });
    
    return decrypted;
  }

  // Crypter un tableau d'objets
  static encryptArray(array, fieldsToEncrypt) {
    if (!Array.isArray(array)) return array;
    return array.map(item => this.encryptObject(item, fieldsToEncrypt));
  }

  // Décrypter un tableau d'objets
  static decryptArray(array, fieldsToDecrypt) {
    if (!Array.isArray(array)) return array;
    return array.map(item => this.decryptObject(item, fieldsToDecrypt));
  }
}

module.exports = EncryptionService;