/**
 * Service pour la gestion sécurisée des clés Stripe
 * Les clés secrètes sont stockées cryptées dans keysecret.json
 */

const fs = require('fs').promises;
const path = require('path');
const { encrypt, decrypt } = require('./encryption.service');

const keysPath = path.join(__dirname, '../data/keysecret.json');

/**
 * Récupère la clé secrète Stripe décryptée
 * @returns {Promise<string>} - Clé secrète décryptée
 */
const getStripeSecretKey = async () => {
  try {
    const data = await fs.readFile(keysPath, 'utf8');
    const keys = JSON.parse(data);
    
    if (keys.stripeSecretKey) {
      return decrypt(keys.stripeSecretKey);
    }
    
    // Fallback sur la variable d'environnement si pas de clé en BDD
    return process.env.STRIPE_SECRET_KEY || '';
  } catch (error) {
    console.error('Erreur lors de la lecture de la clé Stripe:', error);
    // Fallback sur la variable d'environnement
    return process.env.STRIPE_SECRET_KEY || '';
  }
};

/**
 * Sauvegarde la clé secrète Stripe cryptée
 * @param {string} secretKey - Clé secrète à sauvegarder
 * @returns {Promise<boolean>} - Succès de l'opération
 */
const saveStripeSecretKey = async (secretKey) => {
  try {
    let keys = { stripeSecretKey: '' };
    
    try {
      const data = await fs.readFile(keysPath, 'utf8');
      keys = JSON.parse(data);
    } catch (e) {
      // Fichier n'existe pas, on le crée
    }
    
    // Crypter la clé avant de la sauvegarder
    keys.stripeSecretKey = encrypt(secretKey);
    
    await fs.writeFile(keysPath, JSON.stringify(keys, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la clé Stripe:', error);
    throw error;
  }
};

/**
 * Vérifie si une clé secrète Stripe est configurée
 * @returns {Promise<boolean>}
 */
const hasStripeSecretKey = async () => {
  try {
    const key = await getStripeSecretKey();
    return !!key && key.length > 0;
  } catch (error) {
    return false;
  }
};

module.exports = {
  getStripeSecretKey,
  saveStripeSecretKey,
  hasStripeSecretKey
};
