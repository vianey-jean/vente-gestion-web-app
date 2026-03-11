/**
 * =============================================================================
 * Patch Global - Interception automatique des lectures/écritures JSON
 * =============================================================================
 * 
 * Ce module intercepte automatiquement toutes les opérations fs.readFileSync
 * et fs.writeFileSync sur les fichiers .json du répertoire db/
 * pour crypter/décrypter automatiquement sans modifier les modèles existants.
 * 
 * DOIT être chargé AVANT tout autre module qui accède à la base de données.
 * 
 * @module services/dbEncryptionPatch
 */

const fs = require('fs');
const path = require('path');
const { encryptObject, decryptObject } = require('./encryption.service');

const DB_DIR = path.join(__dirname, '../db');

// Sauvegarder les fonctions originales
const originalReadFileSync = fs.readFileSync;
const originalWriteFileSync = fs.writeFileSync;

/**
 * Vérifie si un chemin est un fichier JSON dans le répertoire db/
 */
const isDbJsonFile = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return false;
  const resolved = path.resolve(filePath);
  return resolved.startsWith(path.resolve(DB_DIR)) && resolved.endsWith('.json');
};

/**
 * Vérifie si une chaîne contient des données cryptées
 */
const containsEncryptedData = (str) => {
  try {
    const data = JSON.parse(str);
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      if (typeof first === 'object' && first !== null) {
        const values = Object.entries(first)
          .filter(([key]) => key !== 'id')
          .map(([, val]) => val);
        return values.some(v => typeof v === 'string' && v.split(':').length === 3 && v.length > 30);
      }
    }
    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      const values = Object.values(data);
      return values.some(v => typeof v === 'string' && v.split(':').length === 3 && v.length > 30);
    }
  } catch (e) {}
  return false;
};

/**
 * Intercepter readFileSync pour décrypter automatiquement les fichiers db/*.json
 */
fs.readFileSync = function patchedReadFileSync(filePath, options) {
  const result = originalReadFileSync.call(fs, filePath, options);
  
  if (isDbJsonFile(filePath) && typeof result === 'string') {
    try {
      // Vérifier si les données sont cryptées
      if (containsEncryptedData(result)) {
        const parsed = JSON.parse(result);
        const decrypted = decryptObject(parsed);
        // Retourner le JSON décrypté sous forme de string
        return JSON.stringify(decrypted, null, 2);
      }
    } catch (e) {
      // En cas d'erreur, retourner les données telles quelles
      console.warn('⚠️ Erreur décryptage auto:', path.basename(filePath), e.message);
    }
  }
  
  return result;
};

/**
 * Intercepter writeFileSync pour crypter automatiquement les fichiers db/*.json
 */
fs.writeFileSync = function patchedWriteFileSync(filePath, data, options) {
  if (isDbJsonFile(filePath) && typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      const encrypted = encryptObject(parsed);
      data = JSON.stringify(encrypted, null, 2);
    } catch (e) {
      // Si le parsing échoue, écrire tel quel
      console.warn('⚠️ Erreur cryptage auto:', path.basename(filePath), e.message);
    }
  }
  
  return originalWriteFileSync.call(fs, filePath, data, options);
};

console.log('🔐 Patch de cryptage automatique activé pour db/*.json');

module.exports = {
  originalReadFileSync,
  originalWriteFileSync,
  isDbJsonFile
};
