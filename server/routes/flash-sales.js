
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const sanitizeHtml = require('sanitize-html');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

const flashSalesFilePath = path.join(__dirname, '../data/flash-sales.json');

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return sanitizeHtml(input, {
      allowedTags: [], 
      allowedAttributes: {},
      disallowedTagsMode: 'recursiveEscape'
    });
  }
  return input;
};

const checkFileExists = (req, res, next) => {
  if (!fs.existsSync(flashSalesFilePath)) {
    fs.writeFileSync(flashSalesFilePath, JSON.stringify([]));
  }
  next();
};

// Obtenir la vente flash active
router.get('/active', apiLimiter, checkFileExists, (req, res) => {
  try {
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const now = new Date();
    
    const activeFlashSale = flashSales.find(sale => 
      new Date(sale.startTime) <= now && 
      new Date(sale.endTime) > now &&
      sale.isActive
    );
    
    if (activeFlashSale) {
      res.json(activeFlashSale);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la vente flash:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la vente flash' });
  }
});

// Obtenir toutes les ventes flash (admin)
router.get('/', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    res.json(flashSales);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des ventes flash' });
  }
});

// Créer une nouvelle vente flash (admin seulement)
router.post('/', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const title = sanitizeInput(req.body.title || '').trim();
    const discount = parseInt(req.body.discount) || 0;
    const productIds = req.body.productIds || [];
    const durationHours = parseInt(req.body.durationHours) || 24;
    
    if (!title || discount <= 0 || discount > 90 || productIds.length === 0) {
      return res.status(400).json({ 
        message: 'Titre, remise (1-90%), et produits sont requis' 
      });
    }

    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    
    // Désactiver les ventes flash actives
    flashSales.forEach(sale => {
      sale.isActive = false;
    });

    const now = new Date();
    const endTime = new Date(now.getTime() + (durationHours * 60 * 60 * 1000));

    const newFlashSale = {
      id: Date.now().toString(),
      title,
      discount,
      productIds,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      isActive: true,
      totalItems: productIds.length,
      itemsSold: 0,
      createdAt: now.toISOString()
    };

    flashSales.push(newFlashSale);
    fs.writeFileSync(flashSalesFilePath, JSON.stringify(flashSales, null, 2));
    
    res.status(201).json(newFlashSale);
  } catch (error) {
    console.error('Erreur lors de la création de la vente flash:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la vente flash' });
  }
});

// Désactiver une vente flash (admin seulement)
router.put('/:id/deactivate', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const index = flashSales.findIndex(sale => sale.id === sanitizedId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Vente flash non trouvée' });
    }

    flashSales[index].isActive = false;
    flashSales[index].endTime = new Date().toISOString();
    
    fs.writeFileSync(flashSalesFilePath, JSON.stringify(flashSales, null, 2));
    res.json(flashSales[index]);
  } catch (error) {
    console.error('Erreur lors de la désactivation de la vente flash:', error);
    res.status(500).json({ message: 'Erreur lors de la désactivation de la vente flash' });
  }
});

// Supprimer une vente flash (admin seulement)
router.delete('/:id', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const filteredFlashSales = flashSales.filter(sale => sale.id !== sanitizedId);
    
    if (filteredFlashSales.length === flashSales.length) {
      return res.status(404).json({ message: 'Vente flash non trouvée' });
    }
    
    fs.writeFileSync(flashSalesFilePath, JSON.stringify(filteredFlashSales, null, 2));
    res.json({ message: 'Vente flash supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la vente flash:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la vente flash' });
  }
});

module.exports = router;
