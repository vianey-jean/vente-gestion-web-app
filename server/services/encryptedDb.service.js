/**
 * =============================================================================
 * Service de Base de Données Cryptée
 * =============================================================================
 * 
 * Remplace les lectures/écritures directes de fichiers JSON par des
 * opérations cryptées. Toutes les données sont stockées cryptées au repos
 * et décryptées à la lecture.
 * 
 * @module services/encryptedDb
 */

const fs = require('fs');
const path = require('path');
const { encryptObject, decryptObject } = require('./encryption.service');

const dbPath = path.join(__dirname, '../db');

/**
 * Lit un fichier JSON et décrypte son contenu
 * @param {string} filename - Nom du fichier (ex: 'products.json')
 * @returns {any} Données décryptées
 */
const readEncrypted = (filename) => {
  try {
    const filePath = path.join(dbPath, filename);
    if (!fs.existsSync(filePath)) {
      return filename.endsWith('.json') ? [] : {};
    }
    
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Décrypter les données
    return decryptObject(data);
  } catch (error) {
    console.error(`Erreur lecture cryptée de ${filename}:`, error.message);
    return [];
  }
};

/**
 * Crypte et écrit des données dans un fichier JSON
 * @param {string} filename - Nom du fichier (ex: 'products.json')
 * @param {any} data - Données à crypter et stocker
 */
const writeEncrypted = (filename, data) => {
  try {
    const filePath = path.join(dbPath, filename);
    
    // Crypter les données avant écriture
    const encryptedData = encryptObject(data);
    
    fs.writeFileSync(filePath, JSON.stringify(encryptedData, null, 2));
  } catch (error) {
    console.error(`Erreur écriture cryptée de ${filename}:`, error.message);
    throw error;
  }
};

/**
 * Migre un fichier JSON existant vers le format crypté
 * @param {string} filename - Nom du fichier à migrer
 * @returns {boolean} Succès de la migration
 */
const migrateToEncrypted = (filename) => {
  try {
    const filePath = path.join(dbPath, filename);
    if (!fs.existsSync(filePath)) return false;
    
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Vérifier si déjà crypté (vérifier le premier élément)
    if (isAlreadyEncrypted(data)) {
      console.log(`✅ ${filename} est déjà crypté`);
      return true;
    }
    
    // Crypter et réécrire
    const encryptedData = encryptObject(data);
    fs.writeFileSync(filePath, JSON.stringify(encryptedData, null, 2));
    
    console.log(`🔒 ${filename} migré vers le format crypté`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur migration de ${filename}:`, error.message);
    return false;
  }
};

/**
 * Vérifie si les données sont déjà cryptées
 * @param {any} data - Données à vérifier
 * @returns {boolean}
 */
const isAlreadyEncrypted = (data) => {
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (typeof firstItem === 'object' && firstItem !== null) {
      // Vérifier si les valeurs (sauf id) ressemblent à du contenu crypté
      const values = Object.entries(firstItem)
        .filter(([key]) => key !== 'id')
        .map(([, value]) => value);
      
      return values.some(v => typeof v === 'string' && v.split(':').length === 3 && v.length > 30);
    }
  }
  
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const values = Object.values(data);
    return values.some(v => typeof v === 'string' && v.split(':').length === 3 && v.length > 30);
  }
  
  return false;
};

/**
 * Migre TOUTES les bases de données vers le format crypté
 */
const migrateAllDatabases = () => {
  console.log('\n🔐 ========== MIGRATION CRYPTAGE BASE DE DONNÉES ==========');
  
  const dbFiles = [
    'products.json', 'sales.json', 'clients.json', 'users.json',
    'commandes.json', 'rdv.json', 'rdvNotifications.json', 'objectif.json',
    'nouvelle_achat.json', 'compta.json', 'remboursement.json',
    'fournisseurs.json', 'entreprise.json', 'pointage.json',
    'travailleur.json', 'tache.json', 'notes.json', 'noteColumns.json',
    'avance.json', 'benefice.json', 'depensedumois.json', 'depensefixe.json',
    'pretfamilles.json', 'pretproduits.json', 'messagerie.json', 'messages.json'
  ];
  
  let migrated = 0;
  let errors = 0;
  
  for (const file of dbFiles) {
    try {
      if (migrateToEncrypted(file)) {
        migrated++;
      }
    } catch (e) {
      errors++;
      console.error(`❌ Échec migration ${file}:`, e.message);
    }
  }
  
  console.log(`\n🔐 Migration terminée: ${migrated} fichiers cryptés, ${errors} erreurs`);
  console.log('🔐 ========================================================\n');
  
  return { migrated, errors };
};

module.exports = {
  readEncrypted,
  writeEncrypted,
  migrateToEncrypted,
  migrateAllDatabases,
  isAlreadyEncrypted
};
