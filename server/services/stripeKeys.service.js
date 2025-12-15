/**
 * Service pour la gestion sécurisée des clés Stripe
 * Les clés (publique et secrète) sont stockées cryptées dans keysecret.json
 */

const fs = require('fs').promises;
const path = require('path');
const { encrypt, decrypt } = require('./encryption.service');

const keysPath = path.join(__dirname, '../data/keysecret.json');

/**
 * Lecture du fichier de clés
 */
const readKeysFile = async () => {
  try {
    const data = await fs.readFile(keysPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { stripePublicKey: '', stripeSecretKey: '' };
  }
};

/**
 * Écriture du fichier de clés
 */
const writeKeysFile = async (keys) => {
  await fs.writeFile(keysPath, JSON.stringify(keys, null, 2));
};

/**
 * Récupère la clé publique Stripe décryptée
 * @returns {Promise<string>} - Clé publique décryptée
 */
const getStripePublicKey = async () => {
  try {
    const keys = await readKeysFile();
    if (keys.stripePublicKey) {
      return decrypt(keys.stripePublicKey);
    }
    return '';
  } catch (error) {
    console.error('Erreur lors de la lecture de la clé publique Stripe:', error);
    return '';
  }
};

/**
 * Récupère la clé secrète Stripe décryptée
 * @returns {Promise<string>} - Clé secrète décryptée
 */
const getStripeSecretKey = async () => {
  try {
    const keys = await readKeysFile();
    if (keys.stripeSecretKey) {
      return decrypt(keys.stripeSecretKey);
    }
    return process.env.STRIPE_SECRET_KEY || '';
  } catch (error) {
    console.error('Erreur lors de la lecture de la clé secrète Stripe:', error);
    return process.env.STRIPE_SECRET_KEY || '';
  }
};

/**
 * Sauvegarde la clé publique Stripe cryptée
 * @param {string} publicKey - Clé publique à sauvegarder
 */
const saveStripePublicKey = async (publicKey) => {
  try {
    const keys = await readKeysFile();
    keys.stripePublicKey = encrypt(publicKey);
    await writeKeysFile(keys);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la clé publique Stripe:', error);
    throw error;
  }
};

/**
 * Sauvegarde la clé secrète Stripe cryptée
 * @param {string} secretKey - Clé secrète à sauvegarder
 */
const saveStripeSecretKey = async (secretKey) => {
  try {
    const keys = await readKeysFile();
    keys.stripeSecretKey = encrypt(secretKey);
    await writeKeysFile(keys);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la clé secrète Stripe:', error);
    throw error;
  }
};

/**
 * Vérifie si une clé publique Stripe est configurée
 */
const hasStripePublicKey = async () => {
  try {
    const key = await getStripePublicKey();
    return !!key && key.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Vérifie si une clé secrète Stripe est configurée
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
  getStripePublicKey,
  getStripeSecretKey,
  saveStripePublicKey,
  saveStripeSecretKey,
  hasStripePublicKey,
  hasStripeSecretKey
};
