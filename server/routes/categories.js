
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../config/auth');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

const router = express.Router();
const categoriesFilePath = path.join(__dirname, '../data/categories.json');

// Fonction utilitaire pour lire les catégories
const readCategories = async () => {
  try {
    const data = await fs.readFile(categoriesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Fonction utilitaire pour écrire les catégories
const writeCategories = async (categories) => {
  await fs.writeFile(categoriesFilePath, JSON.stringify(categories, null, 2));
};

// GET /api/categories - Récupérer toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await readCategories();
    res.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/categories - Créer une nouvelle catégorie
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    const categories = await readCategories();
    
    // Vérifier si la catégorie existe déjà
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà' });
    }

    const newCategory = {
      id: Date.now().toString(),
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    categories.push(newCategory);
    await writeCategories(categories);

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/categories/:id - Modifier une catégorie
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    const categories = await readCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    // Vérifier si le nouveau nom existe déjà pour une autre catégorie
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.id !== id);
    if (existingCategory) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà' });
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name,
      description: description || '',
      updatedAt: new Date().toISOString()
    };

    await writeCategories(categories);
    res.json(categories[categoryIndex]);
  } catch (error) {
    console.error('Erreur lors de la modification de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/categories/:id - Supprimer une catégorie
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await readCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    categories.splice(categoryIndex, 1);
    await writeCategories(categories);
    
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
