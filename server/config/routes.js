
const express = require('express');
const cors = require('cors');

// Import des routes
const authRoutes = require('../routes/auth');
const productsRoutes = require('../routes/products');
const categoriesRoutes = require('../routes/categories');
const favoritesRoutes = require('../routes/favorites');
const panierRoutes = require('../routes/panier');
const ordersRoutes = require('../routes/orders');
const reviewsRoutes = require('../routes/reviews');
const contactsRoutes = require('../routes/contacts');
const usersRoutes = require('../routes/users');
const chatRoutes = require('../routes/client-chat');
const adminChatRoutes = require('../routes/admin-chat');
const visitorsRoutes = require('../routes/visitors');
const salesNotificationsRoutes = require('../routes/sales-notifications');
const codePromosRoutes = require('../routes/code-promos');
const pubLayoutRoutes = require('../routes/pub-layout');
const remboursementsRoutes = require('../routes/remboursements');
const flashSalesRoutes = require('../routes/flash-sales');
const settingsRoutes = require('../routes/settings');

module.exports = (app) => {
  // Configuration CORS pour toutes les routes
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://riziky-boutic.vercel.app',
      /\.lovable\.app$/,
      /\.lovableproject\.com$/,
      /localhost:\d+$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
  }));

  // Middleware pour parser le JSON
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Routes de l'API
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/panier', panierRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/contacts', contactsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/client-chat', chatRoutes);
  app.use('/api/admin-chat', adminChatRoutes);
  app.use('/api/visitors', visitorsRoutes);
  app.use('/api/sales-notifications', salesNotificationsRoutes);
  app.use('/api/code-promos', codePromosRoutes);
  app.use('/api/pub-layout', pubLayoutRoutes);
  app.use('/api/remboursements', remboursementsRoutes);
  app.use('/api/flash-sales', flashSalesRoutes);
  app.use('/api/settings', settingsRoutes);

  // Route pour servir les images
  app.use('/uploads', express.static('uploads'));

  // Route de test
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  // Gestion des erreurs 404
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
};
