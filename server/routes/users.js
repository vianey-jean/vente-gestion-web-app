
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Route pour l'inscription d'un utilisateur
router.post('/register', (req, res) => {
  const { nom, prenom, email, password, genre, adresse, phone } = req.body;
  
  // Vérifier si toutes les données requises sont présentes
  if (!nom || !prenom || !email || !password || !genre || !adresse || !phone) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }
  
  const result = User.save({ nom, prenom, email, password, genre, adresse, phone });
  
  if (result.success) {
    return res.status(201).json({ message: 'Utilisateur créé avec succès', user: result.user });
  } else {
    return res.status(400).json({ error: result.message });
  }
});

// Route pour la connexion d'un utilisateur
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  
  const user = User.getByEmail(email);
  
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe erroné' });
  }
  
  if (user.password !== password) {
    return res.status(401).json({ error: 'Email ou mot de passe erroné' });
  }
  
  // Dans une application réelle, nous générerions un token JWT ici
  return res.json({ message: 'Connexion réussie', user: { ...user, password: undefined } });
});

// Importation du service d'email
const { sendVerificationEmail } = require('../services/emailService');

// Stockage temporaire des codes de vérification (en production, utiliser Redis ou base de données)
const verificationCodes = new Map();

// Route pour demander un code de réinitialisation
router.post('/request-reset-code', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }
  
  // Vérifier si l'email existe
  const user = User.getByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Aucun compte associé à cet email' });
  }
  
  // Générer un code de 6 chiffres
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Stocker le code avec expiration de 24h
  verificationCodes.set(email, {
    code: code,
    expiration: Date.now() + 24 * 60 * 60 * 1000, // 24 heures
    attempts: 0
  });
  
  try {
    // Envoyer le code par email
    const emailSent = await sendVerificationEmail(email, code);
    
    if (emailSent) {
      console.log(`Code de vérification envoyé à ${email}: ${code}`);
      return res.json({ 
        message: 'Code de vérification envoyé par email',
        success: true 
      });
    } else {
      // En cas d'échec d'envoi, log le code pour le développement
      console.log(`Code de vérification (email failed) pour ${email}: ${code}`);
      return res.json({ 
        message: 'Code de vérification généré (vérifiez les logs serveur)',
        success: true 
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    // En cas d'erreur, log le code pour permettre les tests
    console.log(`Code de vérification (erreur email) pour ${email}: ${code}`);
    return res.json({ 
      message: 'Code généré - vérifiez les logs serveur',
      success: true 
    });
  }
});

// Route pour vérifier le code de réinitialisation
router.post('/verify-reset-code', (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ error: 'Email et code requis' });
  }
  
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return res.status(400).json({ error: 'Aucun code trouvé pour cet email' });
  }
  
  // Vérifier l'expiration
  if (Date.now() > stored.expiration) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'Le code a expiré' });
  }
  
  // Limiter les tentatives
  if (stored.attempts >= 3) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'Trop de tentatives. Demandez un nouveau code.' });
  }
  
  if (stored.code !== code) {
    stored.attempts++;
    return res.status(400).json({ error: 'Code incorrect' });
  }
  
  // Code valide
  stored.verified = true;
  return res.json({ 
    message: 'Code vérifié avec succès',
    success: true 
  });
});

// Route pour la réinitialisation du mot de passe avec vérification
router.post('/reset-password', (req, res) => {
  const { email, newPassword, code } = req.body;
  
  if (!email || !newPassword || !code) {
    return res.status(400).json({ error: 'Email, nouveau mot de passe et code requis' });
  }
  
  const stored = verificationCodes.get(email);
  
  if (!stored || !stored.verified) {
    return res.status(400).json({ error: 'Code non vérifié ou expiré' });
  }
  
  // Vérifier que le nouveau mot de passe respecte les critères
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const hasMinLength = newPassword.length >= 8;
  
  if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar || !hasMinLength) {
    return res.status(400).json({ 
      error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial' 
    });
  }
  
  // Vérifier que le nouveau mot de passe est différent de l'ancien
  const user = User.getByEmail(email);
  if (user && user.password === newPassword) {
    return res.status(400).json({ 
      error: 'Le nouveau mot de passe est identique à l\'ancien. Veuillez en choisir un autre.' 
    });
  }
  
  const result = User.updatePassword(email, newPassword);
  
  if (result.success) {
    // Nettoyer le code utilisé
    verificationCodes.delete(email);
    return res.json({ message: 'Mot de passe mis à jour avec succès' });
  } else {
    return res.status(400).json({ error: result.message });
  }
});

// Route pour vérifier si un email existe
router.get('/check-email/:email', (req, res) => {
  const { email } = req.params;
  const user = User.getByEmail(email);
  
  return res.json({ exists: !!user });
});

// Route pour obtenir les informations de l'utilisateur connecté
router.get('/profile', isAuthenticated, (req, res) => {
  // Le middleware isAuthenticated a déjà vérifié l'utilisateur
  // et l'a stocké dans req.user
  return res.json({ user: { ...req.user, password: undefined } });
});

// Route pour vérifier le mot de passe actuel
router.post('/verify-password', isAuthenticated, (req, res) => {
  const { currentPassword } = req.body;
  const user = req.user;
  
  if (!currentPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel requis' });
  }
  
  const isValid = user.password === currentPassword;
  return res.json({ valid: isValid });
});

// Route pour mettre à jour le profil utilisateur
router.put('/profile', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const { nom, prenom, email, genre, adresse, phone } = req.body;
  
  const updateData = {};
  if (nom) updateData.nom = nom;
  if (prenom) updateData.prenom = prenom;
  if (email) updateData.email = email;
  if (genre) updateData.genre = genre;
  if (adresse) updateData.adresse = adresse;
  if (phone) updateData.phone = phone;
  
  const result = User.update(userId, updateData);
  
  if (result.success) {
    return res.json({ message: 'Profil mis à jour avec succès', user: { ...result.user, password: undefined } });
  } else {
    return res.status(400).json({ error: result.message });
  }
});

// Route pour changer le mot de passe
router.put('/change-password', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
  }
  
  // Vérifier que le mot de passe actuel est correct
  const user = User.getById(userId);
  if (!user || user.password !== currentPassword) {
    return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
  }
  
  // Vérifier la force du nouveau mot de passe
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const hasMinLength = newPassword.length >= 8;
  
  if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar || !hasMinLength) {
    return res.status(400).json({ 
      error: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial' 
    });
  }
  
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit être différent de l\'ancien' });
  }
  
  const result = User.updatePassword(user.email, newPassword);
  
  if (result.success) {
    return res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } else {
    return res.status(400).json({ error: result.message });
  }
});

// Route pour supprimer le compte utilisateur
router.delete('/profile', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  
  const result = User.delete(userId);
  
  if (result.success) {
    return res.json({ success: true, message: 'Compte supprimé avec succès' });
  } else {
    return res.status(400).json({ error: result.message });
  }
});

// Routes pour les paramètres de notification
router.get('/notification-settings', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  
  // Récupérer les paramètres de notification depuis la base de données
  // Pour l'instant, on retourne des valeurs par défaut
  const defaultSettings = {
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false
  };
  
  return res.json({ settings: defaultSettings });
});

router.put('/notification-settings', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const { emailNotifications, smsNotifications, appointmentReminders, marketingEmails } = req.body;
  
  // Ici, vous pouvez sauvegarder les paramètres dans la base de données
  // Pour l'instant, on simule une sauvegarde réussie
  
  return res.json({ success: true, message: 'Paramètres de notification mis à jour' });
});

// Routes pour les paramètres de confidentialité
router.get('/privacy-settings', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  
  // Récupérer les paramètres de confidentialité depuis la base de données
  // Pour l'instant, on retourne des valeurs par défaut
  const defaultSettings = {
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    dataSharing: false
  };
  
  return res.json({ settings: defaultSettings });
});

router.put('/privacy-settings', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const { profileVisibility, showEmail, showPhone, dataSharing } = req.body;
  
  // Ici, vous pouvez sauvegarder les paramètres dans la base de données
  // Pour l'instant, on simule une sauvegarde réussie
  
  return res.json({ success: true, message: 'Paramètres de confidentialité mis à jour' });
});

module.exports = router;
