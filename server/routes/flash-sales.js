
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
const productsFilePath = path.join(__dirname, '../data/products.json');

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

// Fonction pour nettoyer les ventes flash expirées
const cleanExpiredFlashSales = () => {
  try {
    if (!fs.existsSync(flashSalesFilePath)) return;
    
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const now = new Date();
    
    const activeFlashSales = flashSales.filter(sale => {
      const endDate = new Date(sale.endDate);
      return endDate > now;
    });
    
    if (activeFlashSales.length !== flashSales.length) {
      fs.writeFileSync(flashSalesFilePath, JSON.stringify(activeFlashSales, null, 2));
      console.log(`${flashSales.length - activeFlashSales.length} ventes flash expirées supprimées`);
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des ventes flash expirées:', error);
  }
};

// Nettoyer les ventes flash expirées toutes les heures
setInterval(cleanExpiredFlashSales, 60 * 60 * 1000);

// Obtenir la vente flash active
router.get('/active', apiLimiter, checkFileExists, (req, res) => {
  try {
    cleanExpiredFlashSales(); // Nettoyer avant de récupérer
    
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const now = new Date();
    
    const activeFlashSale = flashSales.find(sale => 
      sale.isActive && 
      new Date(sale.startDate) <= now && 
      new Date(sale.endDate) > now
    );
    
    if (!activeFlashSale) {
      return res.status(404).json({ message: 'Aucune vente flash active' });
    }
    
    res.json(activeFlashSale);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la vente flash active' });
  }
});

// Obtenir toutes les ventes flash
router.get('/', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    res.json(flashSales);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des ventes flash' });
  }
});

// Obtenir une vente flash par ID
router.get('/:id', apiLimiter, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const flashSale = flashSales.find(sale => sale.id === sanitizedId);
    
    if (!flashSale) {
      return res.status(404).json({ message: 'Vente flash non trouvée' });
    }
    
    res.json(flashSale);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la vente flash' });
  }
});

// Obtenir les produits d'une vente flash
router.get('/:id/products', apiLimiter, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const flashSale = flashSales.find(sale => sale.id === sanitizedId);
    
    if (!flashSale) {
      return res.status(404).json({ message: 'Vente flash non trouvée' });
    }
    
    if (!fs.existsSync(productsFilePath)) {
      return res.json([]);
    }
    
    const products = JSON.parse(fs.readFileSync(productsFilePath));
    const flashSaleProducts = products.filter(product => 
      flashSale.productIds && flashSale.productIds.includes(product.id)
    );
    
    res.json(flashSaleProducts);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des produits de la vente flash' });
  }
});

// Créer une nouvelle vente flash
router.post('/', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const { title, description, discount, startDate, endDate, productIds } = req.body;
    
    console.log('Données reçues pour la création:', { title, description, discount, startDate, endDate, productIds });
    
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);
    
    if (!sanitizedTitle || !discount || !startDate || !endDate) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être remplis' });
    }
    
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    
    // S'assurer que productIds est un array de strings
    let processedProductIds = [];
    if (Array.isArray(productIds)) {
      processedProductIds = productIds.map(id => String(id));
    } else if (productIds && typeof productIds === 'object') {
      // Convertir l'objet en array si nécessaire
      processedProductIds = Object.values(productIds).map(id => String(id));
    }
    
    const newFlashSale = {
      id: Date.now().toString(),
      title: sanitizedTitle,
      description: sanitizedDescription,
      discount: parseInt(discount),
      startDate,
      endDate,
      productIds: processedProductIds,
      isActive: false,
      createdAt: new Date().toISOString()
    };
    
    console.log('Nouvelle vente flash créée:', newFlashSale);
    
    flashSales.push(newFlashSale);
    fs.writeFileSync(flashSalesFilePath, JSON.stringify(flashSales, null, 2));
    
    res.status(201).json(newFlashSale);
  } catch (error) {
    console.error('Erreur lors de la création de la vente flash:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la vente flash' });
  }
});

// Mettre à jour une vente flash
router.put('/:id', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const index = flashSales.findIndex(sale => sale.id === sanitizedId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Vente flash non trouvée' });
    }
    
    const updatedData = { ...req.body };
    if (updatedData.title) updatedData.title = sanitizeInput(updatedData.title);
    if (updatedData.description) updatedData.description = sanitizeInput(updatedData.description);
    
    // S'assurer que productIds est un array de strings
    if (updatedData.productIds) {
      if (Array.isArray(updatedData.productIds)) {
        updatedData.productIds = updatedData.productIds.map(id => String(id));
      } else if (typeof updatedData.productIds === 'object') {
        updatedData.productIds = Object.values(updatedData.productIds).map(id => String(id));
      }
    }
    
    console.log('Données de mise à jour reçues:', updatedData);
    
    flashSales[index] = { ...flashSales[index], ...updatedData };
    
    console.log('Vente flash mise à jour:', flashSales[index]);
    
    fs.writeFileSync(flashSalesFilePath, JSON.stringify(flashSales, null, 2));
    
    res.json(flashSales[index]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la vente flash:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la vente flash' });
  }
});

// Supprimer une vente flash
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
    res.status(500).json({ message: 'Erreur lors de la suppression de la vente flash' });
  }
});

// Activer une vente flash
router.post('/:id/activate', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    
    // Désactiver toutes les autres ventes flash
    flashSales.forEach(sale => sale.isActive = false);
    
    // Activer la vente flash sélectionnée
    const index = flashSales.findIndex(sale => sale.id === sanitizedId);
    if (index === -1) {
      return res.status(404).json({ message: 'Vente flash non trouvée' });
    }
    
    flashSales[index].isActive = true;
    fs.writeFileSync(flashSalesFilePath, JSON.stringify(flashSales, null, 2));
    
    res.json(flashSales[index]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'activation de la vente flash' });
  }
});

// Désactiver une vente flash
router.post('/:id/deactivate', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const flashSales = JSON.parse(fs.readFileSync(flashSalesFilePath));
    const index = flashSales.findIndex(sale => sale.id === sanitizedId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Vente flash non trouvée' });
    }
    
    flashSales[index].isActive = false;
    fs.writeFileSync(flashSalesFilePath, JSON.stringify(flashSales, null, 2));
    
    res.json(flashSales[index]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la désactivation de la vente flash' });
  }
});

module.exports = router;
