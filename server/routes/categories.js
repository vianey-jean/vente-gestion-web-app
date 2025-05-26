
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

const categoriesFilePath = path.join(__dirname, '../data/categories.json');

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
  if (!fs.existsSync(categoriesFilePath)) {
    fs.writeFileSync(categoriesFilePath, JSON.stringify([
      { id: '1', name: 'Perruques', createdAt: new Date().toISOString() },
      { id: '2', name: 'Tissages', createdAt: new Date().toISOString() }
    ]));
  }
  next();
};

// Obtenir toutes les catégories
router.get('/', apiLimiter, checkFileExists, (req, res) => {
  try {
    const categories = JSON.parse(fs.readFileSync(categoriesFilePath));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
  }
});

// Créer une nouvelle catégorie (admin seulement)
router.post('/', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const name = sanitizeInput(req.body.name || '').trim();
    
    if (!name) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    const categories = JSON.parse(fs.readFileSync(categoriesFilePath));
    
    // Vérifier si la catégorie existe déjà
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà' });
    }

    const newCategory = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2));
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la catégorie' });
  }
});

// Modifier une catégorie (admin seulement)
router.put('/:id', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const name = sanitizeInput(req.body.name || '').trim();
    
    if (!name) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    const categories = JSON.parse(fs.readFileSync(categoriesFilePath));
    const index = categories.findIndex(cat => cat.id === sanitizedId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    // Vérifier si une autre catégorie a déjà ce nom
    const existingCategory = categories.find((cat, i) => 
      cat.name.toLowerCase() === name.toLowerCase() && i !== index
    );
    if (existingCategory) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà' });
    }

    const oldName = categories[index].name;
    categories[index] = {
      ...categories[index],
      name,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2));

    // Mettre à jour les produits avec l'ancien nom de catégorie
    const productsFilePath = path.join(__dirname, '../data/products.json');
    if (fs.existsSync(productsFilePath)) {
      const products = JSON.parse(fs.readFileSync(productsFilePath));
      const updatedProducts = products.map(product => {
        if (product.category === oldName) {
          return { ...product, category: name };
        }
        return product;
      });
      fs.writeFileSync(productsFilePath, JSON.stringify(updatedProducts, null, 2));
    }
    
    res.json(categories[index]);
  } catch (error) {
    console.error('Erreur lors de la modification de la catégorie:', error);
    res.status(500).json({ message: 'Erreur lors de la modification de la catégorie' });
  }
});

// Supprimer une catégorie (admin seulement)
router.delete('/:id', isAuthenticated, isAdmin, checkFileExists, (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id);
    const categories = JSON.parse(fs.readFileSync(categoriesFilePath));
    const categoryToDelete = categories.find(cat => cat.id === sanitizedId);
    
    if (!categoryToDelete) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    // Vérifier s'il y a des produits dans cette catégorie
    const productsFilePath = path.join(__dirname, '../data/products.json');
    if (fs.existsSync(productsFilePath)) {
      const products = JSON.parse(fs.readFileSync(productsFilePath));
      const productsInCategory = products.filter(product => product.category === categoryToDelete.name);
      
      if (productsInCategory.length > 0) {
        return res.status(400).json({ 
          message: `Impossible de supprimer cette catégorie car ${productsInCategory.length} produit(s) y sont associés` 
        });
      }
    }

    const filteredCategories = categories.filter(cat => cat.id !== sanitizedId);
    fs.writeFileSync(categoriesFilePath, JSON.stringify(filteredCategories, null, 2));
    
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie' });
  }
});

module.exports = router;
