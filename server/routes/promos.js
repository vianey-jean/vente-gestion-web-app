
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

const promoCodesFilePath = path.join(__dirname, '../data/codepromo.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// Ensure codepromo.json exists
if (!fs.existsSync(promoCodesFilePath)) {
  fs.writeFileSync(promoCodesFilePath, JSON.stringify([], null, 2));
}

// Generate a random promo code
const generatePromoCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get all promo codes (admin only)
router.get('/', isAuthenticated, isAdmin, (req, res) => {
  try {
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    res.json(promoCodes);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des codes promo' });
  }
});

// Create new promo code (admin only)
router.post('/', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { productId, percentage, quantity } = req.body;
    
    if (!productId || !percentage || !quantity) {
      return res.status(400).json({ message: 'Tous les champs sont requis (productId, percentage, quantity)' });
    }
    
    // Verify product exists
    const products = JSON.parse(fs.readFileSync(productsFilePath));
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    // Generate unique promo code
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    let code;
    let codeExists = true;
    
    // Generate a unique code
    while (codeExists) {
      code = generatePromoCode();
      codeExists = promoCodes.some(promo => promo.code === code);
    }
    
    const newPromoCode = {
      id: `PROMO-${Date.now()}`,
      code,
      productId,
      productName: product.name,
      percentage: Number(percentage),
      quantity: Number(quantity),
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    promoCodes.push(newPromoCode);
    fs.writeFileSync(promoCodesFilePath, JSON.stringify(promoCodes, null, 2));
    
    res.status(201).json(newPromoCode);
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ message: 'Erreur lors de la création du code promo' });
  }
});

// Update promo code quantity (admin only)
router.put('/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;
    
    if (quantity === undefined) {
      return res.status(400).json({ message: 'La quantité est requise' });
    }
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const promoIndex = promoCodes.findIndex(promo => promo.id === id);
    
    if (promoIndex === -1) {
      return res.status(404).json({ message: 'Code promo non trouvé' });
    }
    
    promoCodes[promoIndex].quantity = Number(quantity);
    promoCodes[promoIndex].isActive = Number(quantity) > 0;
    
    fs.writeFileSync(promoCodesFilePath, JSON.stringify(promoCodes, null, 2));
    
    res.json(promoCodes[promoIndex]);
  } catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du code promo' });
  }
});

// Delete promo code (admin only)
router.delete('/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const filteredPromoCodes = promoCodes.filter(promo => promo.id !== id);
    
    if (promoCodes.length === filteredPromoCodes.length) {
      return res.status(404).json({ message: 'Code promo non trouvé' });
    }
    
    fs.writeFileSync(promoCodesFilePath, JSON.stringify(filteredPromoCodes, null, 2));
    
    res.json({ message: 'Code promo supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du code promo' });
  }
});

// Verify promo code
router.post('/verify', isAuthenticated, (req, res) => {
  try {
    const { code, productId } = req.body;
    
    if (!code || !productId) {
      return res.status(400).json({ message: 'Code promo et ID du produit requis' });
    }
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const promoCode = promoCodes.find(p => 
      p.code === code && 
      p.productId === productId &&
      p.quantity > 0 &&
      p.isActive
    );
    
    if (!promoCode) {
      return res.status(404).json({ 
        message: 'Code promo invalide, expiré ou non applicable à ce produit',
        valid: false
      });
    }
    
    res.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        percentage: promoCode.percentage,
        productId: promoCode.productId
      }
    });
  } catch (error) {
    console.error('Error verifying promo code:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du code promo' });
  }
});

// Use promo code (decrease quantity by 1)
router.post('/use', isAuthenticated, (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Code promo requis' });
    }
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const promoIndex = promoCodes.findIndex(p => p.code === code && p.quantity > 0);
    
    if (promoIndex === -1) {
      return res.status(404).json({ message: 'Code promo invalide ou expiré' });
    }
    
    // Decrease quantity
    promoCodes[promoIndex].quantity -= 1;
    
    // If quantity reaches 0, mark as inactive
    if (promoCodes[promoIndex].quantity === 0) {
      promoCodes[promoIndex].isActive = false;
    }
    
    fs.writeFileSync(promoCodesFilePath, JSON.stringify(promoCodes, null, 2));
    
    res.json({ 
      message: 'Code promo utilisé avec succès',
      remaining: promoCodes[promoIndex].quantity 
    });
  } catch (error) {
    console.error('Error using promo code:', error);
    res.status(500).json({ message: 'Erreur lors de l\'utilisation du code promo' });
  }
});

// Search for products (used for admin panel)
router.get('/search-products', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({ message: 'La recherche doit contenir au moins 3 caractères' });
    }
    
    const products = JSON.parse(fs.readFileSync(productsFilePath));
    const searchResults = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.id.toLowerCase().includes(query.toLowerCase())
    );
    
    // Return limited product info
    const limitedResults = searchResults.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null)
    }));
    
    res.json(limitedResults);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche de produits' });
  }
});

module.exports = router;
