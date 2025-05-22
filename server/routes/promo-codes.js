
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const crypto = require('crypto');

const promoCodesFilePath = path.join(__dirname, '../data/codepromo.json');

// Vérifier si le fichier existe, sinon le créer
if (!fs.existsSync(promoCodesFilePath)) {
  fs.writeFileSync(promoCodesFilePath, JSON.stringify([], null, 2));
}

// Générer un code promo aléatoire (10 caractères, lettres majuscules et chiffres)
const generatePromoCode = () => {
  // Utilisation de crypto pour une génération sécurisée
  const buffer = crypto.randomBytes(5); // 5 octets donneront 10 caractères en base64
  // Convertir en base64 et supprimer les caractères spéciaux
  return buffer.toString('base64')
    .replace(/[+/=]/g, '') // supprimer les caractères spéciaux
    .toUpperCase()         // convertir en majuscules
    .slice(0, 10);         // limiter à 10 caractères
};

// Obtenir tous les codes promo (admin seulement)
router.get('/', isAuthenticated, isAdmin, (req, res) => {
  try {
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    res.json(promoCodes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des codes promo' });
  }
});

// Vérifier un code promo spécifique (accessible à tous les utilisateurs authentifiés)
router.post('/verify', isAuthenticated, (req, res) => {
  try {
    const { code, productId } = req.body;
    
    if (!code || !productId) {
      return res.status(400).json({ message: 'Code promo et identifiant de produit requis' });
    }
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const promoCode = promoCodes.find(p => p.code === code && p.productId === productId && p.quantity > 0);
    
    if (!promoCode) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Code promo invalide ou expiré' 
      });
    }
    
    res.json({ 
      valid: true, 
      discount: promoCode.discount,
      message: 'Code promo valide'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification du code promo' });
  }
});

// Créer un nouveau code promo (admin seulement)
router.post('/', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { productId, discount, quantity } = req.body;
    
    if (!productId || !discount || !quantity) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const code = generatePromoCode();
    
    // Vérifier que le code n'existe pas déjà (même si très peu probable)
    const codeExists = promoCodes.some(p => p.code === code);
    if (codeExists) {
      // Si par hasard le code existe déjà, régénérer
      return res.status(500).json({ message: 'Erreur lors de la création du code promo, veuillez réessayer' });
    }
    
    const newPromoCode = {
      id: Date.now().toString(),
      code,
      productId,
      productName: req.body.productName || "",
      discount: parseInt(discount),
      quantity: parseInt(quantity),
      createdAt: new Date().toISOString()
    };
    
    promoCodes.push(newPromoCode);
    fs.writeFileSync(promoCodesFilePath, JSON.stringify(promoCodes, null, 2));
    
    res.status(201).json(newPromoCode);
  } catch (error) {
    console.error('Erreur lors de la création du code promo:', error);
    res.status(500).json({ message: 'Erreur lors de la création du code promo' });
  }
});

// Mettre à jour un code promo (admin seulement)
router.put('/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity) {
      return res.status(400).json({ message: 'La quantité est requise' });
    }
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const index = promoCodes.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Code promo non trouvé' });
    }
    
    promoCodes[index].quantity = parseInt(quantity);
    fs.writeFileSync(promoCodesFilePath, JSON.stringify(promoCodes, null, 2));
    
    res.json(promoCodes[index]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du code promo' });
  }
});

// Supprimer un code promo (admin seulement)
router.delete('/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const initialLength = promoCodes.length;
    const filteredPromoCodes = promoCodes.filter(p => p.id !== id);
    
    if (filteredPromoCodes.length === initialLength) {
      return res.status(404).json({ message: 'Code promo non trouvé' });
    }
    
    fs.writeFileSync(promoCodesFilePath, JSON.stringify(filteredPromoCodes, null, 2));
    res.json({ message: 'Code promo supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du code promo' });
  }
});

// Utiliser un code promo (réduire la quantité de 1)
router.post('/use', isAuthenticated, (req, res) => {
  try {
    const { code, productId } = req.body;
    
    if (!code || !productId) {
      return res.status(400).json({ message: 'Code promo et identifiant de produit requis' });
    }
    
    const promoCodes = JSON.parse(fs.readFileSync(promoCodesFilePath));
    const index = promoCodes.findIndex(p => p.code === code && p.productId === productId && p.quantity > 0);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Code promo invalide ou expiré' });
    }
    
    // Réduire la quantité de 1
    promoCodes[index].quantity -= 1;
    fs.writeFileSync(promoCodesFilePath, JSON.stringify(promoCodes, null, 2));
    
    res.json({ 
      message: 'Code promo utilisé avec succès',
      remainingQuantity: promoCodes[index].quantity
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'utilisation du code promo' });
  }
});

module.exports = router;
