
/**
 * MIDDLEWARE D'AUTHENTIFICATION
 * ============================
 * 
 * Ce middleware vérifie l'authentification des requêtes API.
 * Il valide les tokens JWT et protège les routes sensibles.
 * 
 * Fonctionnalités principales :
 * - Vérification des tokens JWT
 * - Validation de l'existence utilisateur
 * - Protection des routes API
 * - Gestion des erreurs d'authentification
 * 
 * Utilisation :
 * - Appliquer sur les routes protégées
 * - Vérifier l'identité utilisateur
 * - Contrôler l'accès aux ressources
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware d'authentification pour les routes API
 * Vérifie la validité du token JWT et charge les données utilisateur
 * 
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express  
 * @param {Function} next - Fonction middleware suivante
 */
const authMiddleware = (req, res, next) => {
  try {
    // Ici on attend l'extraction du token depuis l'en-tête Authorization
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Ici on attend la vérification du token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecretkey');
    
    // Ici on attend la validation de l'existence de l'utilisateur
    const user = User.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Ici on a ajouté l'utilisateur à l'objet request pour les middlewares suivants
    req.user = user;
    next();
  } catch (error) {
    // Ici on a ajouté la gestion des erreurs de validation de token
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Ici on a ajouté l'export du middleware
module.exports = authMiddleware;
