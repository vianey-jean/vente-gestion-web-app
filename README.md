
# Gestion de Vente - Application Frontend

Cette application React est conçue pour communiquer avec un serveur backend Node.js séparé.

## Configuration du Frontend

1. Installer les dépendances du frontend:
   ```
   npm install
   ```

2. Lancer l'application frontend:
   ```
   npm run dev
   ```

## Configuration du Backend (à créer séparément)

Pour créer le serveur backend Node.js qui fonctionnera avec cette application:

1. Créer un nouveau dossier pour le backend:
   ```
   mkdir gestion-vente-backend
   cd gestion-vente-backend
   ```

2. Initialiser un projet Node.js:
   ```
   npm init -y
   ```

3. Installer les dépendances nécessaires:
   ```
   npm install express mongoose cors dotenv multer bcryptjs jsonwebtoken morgan nodemon
   ```

4. Créer un fichier package.json avec le contenu suivant:
   ```json
   {
     "name": "gestion-vente-backend",
     "version": "1.0.0",
     "description": "Backend pour l'application de gestion de vente",
     "main": "server.js",
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "mongoose": "^7.0.0",
       "cors": "^2.8.5",
       "dotenv": "^16.0.3",
       "multer": "^1.4.5-lts.1",
       "bcryptjs": "^2.4.3",
       "jsonwebtoken": "^9.0.0",
       "morgan": "^1.10.0"
     },
     "devDependencies": {
       "nodemon": "^2.0.22"
     }
   }
   ```

5. Créer un fichier .env:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/gestion_vente
   JWT_SECRET=votre_secret_jwt
   ```

6. Créer la structure du projet:
   ```
   mkdir models routes middleware controllers config uploads
   ```

7. Créer le fichier server.js:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const mongoose = require('mongoose');
   const morgan = require('morgan');
   const path = require('path');
   require('dotenv').config();

   // Initialisation de l'application
   const app = express();

   // Middlewares
   app.use(cors());
   app.use(express.json());
   app.use(morgan('dev'));
   app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

   // Connexion à la base de données
   mongoose.connect(process.env.MONGO_URI)
     .then(() => console.log('Connexion à MongoDB établie'))
     .catch(err => console.error('Erreur de connexion à MongoDB:', err));

   // Routes
   app.use('/api/auth', require('./routes/auth'));
   app.use('/api/products', require('./routes/products'));
   app.use('/api/sales', require('./routes/sales'));

   // Route par défaut
   app.get('/', (req, res) => {
     res.send('API de Gestion de Vente');
   });

   // Démarrage du serveur
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
     console.log(`Serveur démarré sur le port ${PORT}`);
   });
   ```

8. Implémenter les modèles, routes, contrôleurs et middlewares nécessaires.

## Modèles à implémenter

### User Model (models/User.js)
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hachage du mot de passe avant sauvegarde
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### Product Model (models/Product.js)
```javascript
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
```

### Sale Model (models/Sale.js)
```javascript
const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  }
});

const SaleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [SaleItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sale', SaleSchema);
```

## API Endpoints à implémenter

1. Authentication:
   - POST /api/auth/register - Inscription
   - POST /api/auth/login - Connexion
   - POST /api/auth/verify-email - Vérifier si un email existe
   - POST /api/auth/reset-password - Réinitialiser le mot de passe

2. Produits:
   - GET /api/products - Liste tous les produits
   - GET /api/products/:id - Obtient un produit par ID
   - POST /api/products - Ajoute un nouveau produit
   - PUT /api/products/:id - Met à jour un produit
   - DELETE /api/products/:id - Supprime un produit
   - POST /api/products/:id/upload - Upload une image pour un produit

3. Ventes:
   - GET /api/sales - Liste toutes les ventes
   - GET /api/sales/:id - Obtient une vente par ID
   - GET /api/sales/user/:userId - Liste les ventes d'un utilisateur
   - POST /api/sales - Crée une nouvelle vente
   - PUT /api/sales/:id/status - Met à jour le statut d'une vente

## Middleware d'authentification

Créez un middleware pour protéger les routes qui nécessitent une authentification:

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Récupérer le token du header
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};
```

## Modification du Frontend pour l'intégration

Dans le frontend (cette application), vous devrez modifier le fichier `src/services/api.ts` pour utiliser les vrais appels API au lieu des mocks. Les commentaires dans le fichier vous guideront sur les modifications à apporter.

## Notes importantes

- Assurez-vous que le serveur backend est configuré avec CORS pour accepter les requêtes du frontend.
- Configurez correctement les variables d'environnement dans le fichier .env du backend.
- Pensez à sécuriser votre API avec des JWT et à implémenter une gestion appropriée des erreurs.
