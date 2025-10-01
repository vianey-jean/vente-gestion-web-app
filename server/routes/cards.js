const express = require('express');
const cardsService = require('../services/cards.service');
const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router();

// Obtenir toutes les cartes de l'utilisateur
router.get('/', isAuthenticated, (req, res) => {
  try {
    console.log('🎯 Récupération des cartes pour l\'utilisateur ID:', req.user.id);
    const cards = cardsService.getUserCards(req.user.id);
    res.json({ success: true, data: cards });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des cartes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des cartes' });
  }
});

// Obtenir une carte spécifique
router.get('/:cardId', isAuthenticated, (req, res) => {
  try {
    const card = cardsService.getCardById(req.params.cardId, req.user.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Carte non trouvée' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la carte:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération de la carte' });
  }
});

// Ajouter une nouvelle carte
router.post('/', isAuthenticated, (req, res) => {
  try {
    console.log('📥 Requête d\'ajout de carte reçue pour l\'utilisateur ID:', req.user.id);
    console.log('📋 Corps de la requête:', { 
      cardName: req.body.cardName, 
      cardNumber: req.body.cardNumber ? '****' + req.body.cardNumber.slice(-4) : 'N/A',
      expiryDate: req.body.expiryDate,
      cvv: req.body.cvv ? '***' : 'N/A',
      setAsDefault: req.body.setAsDefault
    });

    const { cardNumber, cardName, expiryDate, cvv, setAsDefault = false } = req.body;
    
    // Validation des champs requis
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis (cardNumber, cardName, expiryDate, cvv)' 
      });
    }

    const cardId = cardsService.addCard(req.user.id, {
      cardNumber,
      cardName,
      expiryDate,
      cvv
    }, setAsDefault);

    console.log('✅ Carte ajoutée avec succès, ID:', cardId);
    res.json({ 
      success: true, 
      message: 'Carte ajoutée avec succès',
      cardId 
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la carte:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'ajout de la carte: ' + error.message 
    });
  }
});

// Définir une carte comme défaut
router.put('/:cardId/default', isAuthenticated, (req, res) => {
  try {
    const success = cardsService.setDefaultCard(req.params.cardId, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Carte non trouvée' });
    }
    res.json({ success: true, message: 'Carte définie comme défaut' });
  } catch (error) {
    console.error('Erreur lors de la définition de la carte par défaut:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer une carte
router.delete('/:cardId', isAuthenticated, (req, res) => {
  try {
    const success = cardsService.deleteCard(req.params.cardId, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Carte non trouvée' });
    }
    res.json({ success: true, message: 'Carte supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Traiter le paiement avec une carte (avec Stripe)
router.post('/process-payment', isAuthenticated, async (req, res) => {
  console.log('🎯 Route /process-payment appelée');
  console.log('📋 Body:', req.body);
  console.log('👤 User:', req.user);
  
  try {
    const { cardId, amount, orderData } = req.body;
    const userId = req.user.id;

    if (!cardId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'L\'ID de la carte et le montant sont requis' 
      });
    }

    // Vérifier que la carte appartient à l'utilisateur
    const card = cardsService.getCardById(cardId, userId);
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Carte non trouvée' 
      });
    }

    console.log('💳 Carte trouvée:', { cardId, maskedNumber: card.maskedNumber, cardType: card.cardType });
    console.log('💰 Montant à payer:', amount, 'centimes');

    // Créer une session Stripe Checkout
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Créer les line items à partir de orderData
    const lineItems = orderData?.cartItems?.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Produit',
          description: `Quantité: ${item.quantity}`
        },
        unit_amount: Math.round(item.price * 100) // Convertir en centimes
      },
      quantity: item.quantity
    })) || [];

    // Ajouter les frais de livraison si présents
    if (orderData?.deliveryPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison'
          },
          unit_amount: Math.round(orderData.deliveryPrice * 100)
        },
        quantity: 1
      });
    }

    // Ajouter les taxes si présentes
    if (orderData?.taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'TVA (20%)'
          },
          unit_amount: Math.round(orderData.taxAmount * 100)
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-callback?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-callback?status=cancelled`,
      metadata: {
        userId: userId.toString(),
        cardId: cardId,
        orderId: `order_${Date.now()}`
      }
    });

    console.log('✅ Session Stripe créée:', session.id);
    console.log('🔗 URL de redirection:', session.url);

    res.json({ 
      success: true, 
      sessionId: session.id,
      checkoutUrl: session.url,
      status: 'pending',
      message: 'Redirection vers Stripe Checkout'
    });
  } catch (error) {
    console.error('❌ Erreur lors du traitement du paiement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors du traitement du paiement: ' + error.message 
    });
  }
});

module.exports = router;
