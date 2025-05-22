const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middlewares/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Security middleware
app.use(helmet());

// Express session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Serve secure cookies
    httpOnly: true, // Prevents client side JS access
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mongoose connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/riziykboutique', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true, // Make sure to check if your MongoDB version supports this
  // useFindAndModify: false // And this one
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Vérifier et créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const reviewsRoutes = require('./routes/reviews');
const ordersRoutes = require('./routes/orders');
const panierRoutes = require('./routes/panier');
const favoritesRoutes = require('./routes/favorites');
const contactRoutes = require('./routes/contacts');
const adminChatRoutes = require('./routes/admin-chat');
const clientChatRoutes = require('./routes/client-chat');
const promoCodesRoutes = require('./routes/promo-codes'); // Nouvelle route pour les codes promo

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/admin-chat', adminChatRoutes);
app.use('/api/client-chat', clientChatRoutes);
app.use('/api/promo-codes', promoCodesRoutes); // Nouvelle route pour les codes promo

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
