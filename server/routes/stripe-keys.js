/**
 * Routes pour la gestion sécurisée des clés Stripe
 */

const express = require('express');
const router = express.Router();
const { saveStripeSecretKey, hasStripeSecretKey } = require('../services/stripeKeys.service');

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
    console.error('Erreur lors de la sauvegarde de la clé Stripe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la sauvegarde de la clé secrète' 
    });
  }
});

/**
 * GET /api/stripe-keys/status
 * Vérifie si une clé secrète est configurée (sans la révéler)
 */
router.get('/status', async (req, res) => {
  try {
    const hasKey = await hasStripeSecretKey();
    
    res.json({ 
      success: true, 
      hasSecretKey: hasKey 
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de la clé Stripe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification' 
    });
  }
});

module.exports = router;
