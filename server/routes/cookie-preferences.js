
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { isAuthenticated } = require('../middlewares/auth');

const cookiePreferencesFilePath = path.join(__dirname, '../data/cookie-preferences.json');

// S'assurer que le fichier cookie-preferences.json existe
if (!fs.existsSync(cookiePreferencesFilePath)) {
  fs.writeFileSync(cookiePreferencesFilePath, JSON.stringify([], null, 2));
}

// Obtenir les préférences de cookies d'un utilisateur
router.get('/:userId', (req, res) => {
  try {
    const cookiePreferences = JSON.parse(fs.readFileSync(cookiePreferencesFilePath));
    const userPreferences = cookiePreferences.find(p => p.userId === req.params.userId);
    
    if (!userPreferences) {
      // Si aucune préférence n'est trouvée, renvoyer les préférences par défaut
      return res.json({
        essential: true,
        performance: true,
        functional: true,
        marketing: false
      });
    }
    
    res.json(userPreferences.preferences);
  } catch (error) {
    console.error("Erreur lors de la récupération des préférences de cookies:", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des préférences de cookies' });
  }
});

// Sauvegarder les préférences de cookies d'un utilisateur
router.post('/:userId', (req, res) => {
  try {
    const cookiePreferences = JSON.parse(fs.readFileSync(cookiePreferencesFilePath));
    const index = cookiePreferences.findIndex(p => p.userId === req.params.userId);
    
    // Valider que les données requises sont présentes
    const { essential, performance, functional, marketing } = req.body;
    
    if (essential === undefined) {
      return res.status(400).json({ message: 'Les cookies essentiels sont obligatoires' });
    }
    
    const preferences = {
      essential: essential === undefined ? true : Boolean(essential), // Les cookies essentiels sont obligatoires
      performance: performance === undefined ? false : Boolean(performance),
      functional: functional === undefined ? false : Boolean(functional),
      marketing: marketing === undefined ? false : Boolean(marketing)
    };
    
    if (index === -1) {
      // Ajouter de nouvelles préférences
      cookiePreferences.push({
        userId: req.params.userId,
        preferences,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Mettre à jour les préférences existantes
      cookiePreferences[index] = {
        userId: req.params.userId,
        preferences,
        updatedAt: new Date().toISOString()
      };
    }
    
    fs.writeFileSync(cookiePreferencesFilePath, JSON.stringify(cookiePreferences, null, 2));
    res.json({ message: 'Préférences de cookies mises à jour avec succès', preferences });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des préférences de cookies:", error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement des préférences de cookies' });
  }
});

module.exports = router;
