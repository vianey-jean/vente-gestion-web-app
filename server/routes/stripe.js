
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');
const { isAuthenticated } = require('../middlewares/auth');

const ordersFilePath = path.join(__dirname, '../data/orders.json');
const productsFilePath = path.join(__dirname, '../data/products.json');
const panierFilePath = path.join(__dirname, '../data/panier.json');

// Créer une session de paiement Stripe
router.post('/create-payment-session', isAuthenticated, async (req, res) => {
  try {
    const { 
      amount, 
      currency, 
      customerEmail, 
      customerName, 
      items, 
      shippingAddress, 
      totalTTC, 
      taxAmount, 
      deliveryPrice, 
      codePromo 
    } = req.body;

    console.log('Création session Stripe avec:', {
      amount: totalTTC * 100, // Convertir en centimes
      currency: currency || 'eur',
      customerEmail,
      items: items.length
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: items.map(item => ({
        price_data: {
          currency: currency || 'eur',
          product_data: {
            name: item.name,
            metadata: {
              productId: item.productId,
            }
          },
          unit_amount: Math.round(item.price * 100), // Prix en centimes
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/paiement/echec`,
      metadata: {
        userId: req.user.id,
        totalTTC: totalTTC.toString(),
        taxAmount: taxAmount.toString(),
        deliveryPrice: deliveryPrice.toString(),
        codePromo: codePromo ? JSON.stringify(codePromo) : null,
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify(items)
      }
    });

    console.log('Session Stripe créée:', session.id);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vérifier le paiement et traiter la commande
router.post('/verify-payment', isAuthenticated, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    console.log('Vérification paiement session:', sessionId);
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      console.log('Paiement confirmé, traitement de la commande...');
      
      // Récupérer les métadonnées
      const metadata = session.metadata;
      const userId = metadata.userId;
      const items = JSON.parse(metadata.items);
      const shippingAddress = JSON.parse(metadata.shippingAddress);
      const totalTTC = parseFloat(metadata.totalTTC);
      const taxAmount = parseFloat(metadata.taxAmount);
      const deliveryPrice = parseFloat(metadata.deliveryPrice);
      const codePromo = metadata.codePromo ? JSON.parse(metadata.codePromo) : null;

      // Créer la commande
      const orders = JSON.parse(fs.readFileSync(ordersFilePath));
      const products = JSON.parse(fs.readFileSync(productsFilePath));
      
      const newOrder = {
        id: `ORD-${Date.now()}`,
        userId: userId,
        userName: req.user.nom + ' ' + req.user.prenom,
        userEmail: req.user.email,
        items: items.map(item => ({
          ...item,
          subtotal: item.price * item.quantity
        })),
        totalAmount: totalTTC,
        shippingAddress,
        paymentMethod: 'stripe',
        codePromoUsed: codePromo,
        status: 'confirmée',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtotalProduits: totalTTC - taxAmount - deliveryPrice,
        taxRate: 0.20,
        taxAmount: taxAmount,
        deliveryPrice: deliveryPrice,
        stripeSessionId: sessionId
      };

      orders.push(newOrder);
      fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));

      // Mettre à jour le stock des produits
      items.forEach(item => {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1 && products[productIndex].stock !== undefined) {
          products[productIndex].stock = Math.max(0, products[productIndex].stock - item.quantity);
        }
      });
      fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

      // Supprimer les produits du panier
      const paniers = JSON.parse(fs.readFileSync(panierFilePath));
      const panierIndex = paniers.findIndex(p => p.userId === userId);
      
      if (panierIndex !== -1) {
        items.forEach(item => {
          paniers[panierIndex].items = paniers[panierIndex].items.filter(
            cartItem => cartItem.productId !== item.productId
          );
        });
        fs.writeFileSync(panierFilePath, JSON.stringify(paniers, null, 2));
      }

      console.log('Commande créée avec succès:', newOrder.id);
      res.json({ success: true, orderId: newOrder.id, order: newOrder });
    } else {
      console.log('Paiement non confirmé:', session.payment_status);
      res.json({ success: false, message: 'Paiement non confirmé' });
    }
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
