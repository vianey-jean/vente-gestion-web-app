/**
 * Routes pour la gestion sécurisée des clés Stripe
 */

const express = require('express');
const router = express.Router();
const { 
  saveStripePublicKey, 
  saveStripeSecretKey, 
  hasStripePublicKey, 
  hasStripeSecretKey,
  getStripePublicKey 
} = require('../services/stripeKeys.service');

/**
 * POST /api/stripe-keys/public
 * Sauvegarde la clé publique Stripe (cryptée)
 */
router.post('/public', async (req, res) => {
  try {
    const { publicKey } = req.body;
    
    if (!publicKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Clé publique requise' 
      });
    }
    
    await saveStripePublicKey(publicKey);
    
    res.json({ 
      success: true, 
      message: 'Clé publique Stripe sauvegardée avec succès (cryptée)' 
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la clé publique Stripe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la sauvegarde de la clé publique' 
    });
  }
});

/**
 * POST /api/stripe-keys/secret
 * Sauvegarde la clé secrète Stripe (cryptée)
 */
router.post('/secret', async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    if (!secretKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Clé secrète requise' 
      });
    }
    
    await saveStripeSecretKey(secretKey);
    
    res.json({ 
      success: true, 
      message: 'Clé secrète Stripe sauvegardée avec succès (cryptée)' 
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la clé secrète Stripe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la sauvegarde de la clé secrète' 
    });
  }
});

/**
 * GET /api/stripe-keys/public
 * Récupère la clé publique Stripe décryptée (pour le frontend)
 */
router.get('/public', async (req, res) => {
  try {
    const publicKey = await getStripePublicKey();
    
    res.json({ 
      success: true, 
      publicKey: publicKey || ''
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé publique Stripe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération' 
    });
  }
});

/**
 * GET /api/stripe-keys/status
 * Vérifie si les clés sont configurées (sans les révéler)
 */
router.get('/status', async (req, res) => {
  try {
    const hasPublic = await hasStripePublicKey();
    const hasSecret = await hasStripeSecretKey();
    
    res.json({ 
      success: true, 
      hasPublicKey: hasPublic,
      hasSecretKey: hasSecret 
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des clés Stripe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification' 
    });
  }
});

module.exports = router;
