
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../config/auth');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

const router = express.Router();
const flashSalesFilePath = path.join(__dirname, '../data/flash-sales.json');

// Fonction utilitaire pour lire les flash sales
const readFlashSales = async () => {
  try {
    const data = await fs.readFile(flashSalesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Fonction utilitaire pour écrire les flash sales
const writeFlashSales = async (flashSales) => {
  await fs.writeFile(flashSalesFilePath, JSON.stringify(flashSales, null, 2));
};

// GET /api/flash-sales - Récupérer toutes les flash sales
router.get('/', async (req, res) => {
  try {
    const flashSales = await readFlashSales();
    res.json(flashSales);
  } catch (error) {
    console.error('Erreur lors de la récupération des flash sales:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/flash-sales/active - Récupérer la flash sale active
router.get('/active', async (req, res) => {
  try {
    const flashSales = await readFlashSales();
    const now = new Date();
    
    const activeFlashSale = flashSales.find(sale => 
      sale.isActive && 
      new Date(sale.startTime) <= now && 
      new Date(sale.endTime) > now
    );
    
    res.json(activeFlashSale || null);
  } catch (error) {
    console.error('Erreur lors de la récupération de la flash sale active:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/flash-sales - Créer une nouvelle flash sale
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, discount, startTime, endTime, productIds } = req.body;
    
    if (!title || !discount || !startTime || !endTime) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const flashSales = await readFlashSales();
    
    const newFlashSale = {
      id: Date.now().toString(),
      title,
      discount: Number(discount),
      startTime,
      endTime,
      productIds: productIds || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    flashSales.push(newFlashSale);
    await writeFlashSales(flashSales);

    res.status(201).json(newFlashSale);
  } catch (error) {
    console.error('Erreur lors de la création de la flash sale:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/flash-sales/:id - Modifier une flash sale
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, discount, startTime, endTime, productIds, isActive } = req.body;
    
    const flashSales = await readFlashSales();
    const flashSaleIndex = flashSales.findIndex(sale => sale.id === id);
    
    if (flashSaleIndex === -1) {
      return res.status(404).json({ message: 'Flash sale non trouvée' });
    }

    flashSales[flashSaleIndex] = {
      ...flashSales[flashSaleIndex],
      title: title || flashSales[flashSaleIndex].title,
      discount: discount !== undefined ? Number(discount) : flashSales[flashSaleIndex].discount,
      startTime: startTime || flashSales[flashSaleIndex].startTime,
      endTime: endTime || flashSales[flashSaleIndex].endTime,
      productIds: productIds || flashSales[flashSaleIndex].productIds,
      isActive: isActive !== undefined ? isActive : flashSales[flashSaleIndex].isActive,
      updatedAt: new Date().toISOString()
    };

    await writeFlashSales(flashSales);
    res.json(flashSales[flashSaleIndex]);
  } catch (error) {
    console.error('Erreur lors de la modification de la flash sale:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/flash-sales/:id - Supprimer une flash sale
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const flashSales = await readFlashSales();
    const flashSaleIndex = flashSales.findIndex(sale => sale.id === id);
    
    if (flashSaleIndex === -1) {
      return res.status(404).json({ message: 'Flash sale non trouvée' });
    }

    flashSales.splice(flashSaleIndex, 1);
    await writeFlashSales(flashSales);
    
    res.json({ message: 'Flash sale supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la flash sale:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
