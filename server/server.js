const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_default_secret',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './server/data' }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport initialization
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Vérification et création du dossier et fichier "public/uploads"
const uploadsDirectory = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// Vérification et création du dossier "server/data"
const dataDirectory = path.join(__dirname, 'data');
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const reviewsRoutes = require('./routes/reviews');
const panierRoutes = require('./routes/panier');
const favoritesRoutes = require('./routes/favorites');
const adminChatRoutes = require('./routes/admin-chat');
const clientChatRoutes = require('./routes/client-chat');
const contactsRoutes = require('./routes/contacts');
const ordersRoutes = require('./routes/orders');
const cookiePreferencesRoutes = require('./routes/cookie-preferences');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/admin-chat', adminChatRoutes);
app.use('/api/client-chat', clientChatRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/cookie-preferences', cookiePreferencesRoutes);

app.get('/', (req, res) => {
  res.send('Serveur Node.js fonctionne!');
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

module.exports = app;
