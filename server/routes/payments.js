/**
 * Routes de paiement Stripe
 * Gère la création des PaymentIntents pour les paiements par carte bancaire
 * Utilise la clé secrète cryptée stockée dans la base de données
 */

const express = require('express');
const router = express.Router();
const { getStripeSecretKey } = require('../services/stripeKeys.service');

/**
 * Initialise Stripe avec la clé secrète récupérée et décryptée
 * @returns {Promise<object|null>} Instance Stripe ou null
 */
const getStripeInstance = async () => {
  try {
    const secretKey = await getStripeSecretKey();
    
    if (!secretKey) {
      console.warn('⚠️ Aucune clé secrète Stripe configurée - Mode simulation activé');
      return null;
    }
    
    const stripe = require('stripe')(secretKey);
    console.log('✅ Stripe initialisé avec la clé cryptée');
    return stripe;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Stripe:', error.message);
    return null;
  }
};

/**
 * POST /api/payments/create-intent
 * Crée un PaymentIntent Stripe pour le paiement
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur', cardId, orderDetails } = req.body;

    // Validation des données
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }

    // Récupérer l'instance Stripe avec la clé décryptée
    const stripe = await getStripeInstance();

    // Mode simulation si Stripe n'est pas configuré
    if (!stripe) {
      console.log('Mode simulation: Création d\'un PaymentIntent simulé');
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Générer un ID simulé
      const simulatedPaymentIntentId = `pi_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const simulatedClientSecret = `${simulatedPaymentIntentId}_secret_simulated`;
      
      return res.json({
        success: true,
        clientSecret: simulatedClientSecret,
        paymentIntentId: simulatedPaymentIntentId,
        simulated: true,
        message: 'PaymentIntent simulé créé (Stripe non configuré)'
      });
    }

    // Créer le PaymentIntent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe utilise les centimes
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderDetails: JSON.stringify(orderDetails || {}),
        createdAt: new Date().toISOString()
      }
    });

    console.log(`✅ PaymentIntent créé: ${paymentIntent.id}`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      simulated: false
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du PaymentIntent:', error);
    
    // Erreurs Stripe spécifiques
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: 'Requête invalide: ' + error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      error: error.message
    });
  }
});

/**
 * POST /api/payments/confirm
 * Confirme un paiement (webhook ou confirmation manuelle)
 */
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'PaymentIntent ID requis'
      });
    }

    // Récupérer l'instance Stripe
    const stripe = await getStripeInstance();

    // Mode simulation
    if (!stripe || paymentIntentId.includes('simulated')) {
      return res.json({
        success: true,
        status: 'succeeded',
        simulated: true
      });
    }

    // Récupérer le statut du PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('❌ Erreur lors de la confirmation du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement'
    });
  }
});

/**
 * GET /api/payments/status/:id
 * Récupère le statut d'un paiement
 */
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer l'instance Stripe
    const stripe = await getStripeInstance();

    // Mode simulation
    if (!stripe || id.includes('simulated')) {
      return res.json({
        success: true,
        status: 'succeeded',
        simulated: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut'
    });
  }
});

module.exports = router;
