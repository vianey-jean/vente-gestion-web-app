const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const fs = require('fs');
const path = require('path');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const sanitizeHtml = require('sanitize-html');

const User = require('../models/User');

// Fonction pour nettoyer les entrées de l'utilisateur
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

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('nom', 'Name is required').not().isEmpty(),
    check('prenom', 'First name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, prenom, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        nom,
        prenom,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Obtenir un utilisateur par ID (admin seulement)
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Mettre à jour un utilisateur (admin seulement)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { nom, prenom, email, role, adresse, ville, codePostal, pays, telephone } = req.body;

    // Sanitisation des entrées utilisateur
    const sanitizedNom = sanitizeInput(nom);
    const sanitizedPrenom = sanitizeInput(prenom);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedAdresse = sanitizeInput(adresse);
    const sanitizedVille = sanitizeInput(ville);
    const sanitizedCodePostal = sanitizeInput(codePostal);
    const sanitizedPays = sanitizeInput(pays);
    const sanitizedTelephone = sanitizeInput(telephone);

    const userFields = {};
    if (sanitizedNom) userFields.nom = sanitizedNom;
    if (sanitizedPrenom) userFields.prenom = sanitizedPrenom;
    if (sanitizedEmail) userFields.email = sanitizedEmail;
    if (role) userFields.role = role;
    if (sanitizedAdresse) userFields.adresse = sanitizedAdresse;
    if (sanitizedVille) userFields.ville = sanitizedVille;
    if (sanitizedCodePostal) userFields.codePostal = sanitizedCodePostal;
    if (sanitizedPays) userFields.pays = sanitizedPays;
    if (sanitizedTelephone) userFields.telephone = sanitizedTelephone;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await user.remove();

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Mettre à jour les préférences utilisateur (y compris les préférences de cookies)
router.post('/preferences', isAuthenticated, async (req, res) => {
  try {
    const { userId, cookiePreferences } = req.body;
    
    // Vérifier que l'utilisateur est bien celui qui est connecté
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const preferencesFilePath = path.join(__dirname, '../data/preferences.json');
    let preferences = [];
    
    // Lire les préférences existantes
    if (fs.existsSync(preferencesFilePath)) {
      preferences = JSON.parse(fs.readFileSync(preferencesFilePath));
    }
    
    // Vérifier si l'utilisateur a déjà des préférences
    const userIndex = preferences.findIndex(p => p.userId === userId);
    
    if (userIndex !== -1) {
      // Mettre à jour les préférences existantes
      preferences[userIndex].cookiePreferences = cookiePreferences;
      preferences[userIndex].updatedAt = new Date().toISOString();
    } else {
      // Créer de nouvelles préférences
      preferences.push({
        userId,
        cookiePreferences,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Enregistrer les préférences
    fs.writeFileSync(preferencesFilePath, JSON.stringify(preferences, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des préférences' });
  }
});

// Obtenir les préférences d'un utilisateur
router.get('/preferences', isAuthenticated, (req, res) => {
  try {
    const preferencesFilePath = path.join(__dirname, '../data/preferences.json');
    
    if (!fs.existsSync(preferencesFilePath)) {
      return res.json({ cookiePreferences: null });
    }
    
    const preferences = JSON.parse(fs.readFileSync(preferencesFilePath));
    const userPreferences = preferences.find(p => p.userId === req.user.id);
    
    if (!userPreferences) {
      return res.json({ cookiePreferences: null });
    }
    
    res.json({ cookiePreferences: userPreferences.cookiePreferences });
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des préférences' });
  }
});

module.exports = router;
