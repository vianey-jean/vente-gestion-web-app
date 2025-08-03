
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { initializeWebSocket } = require('./websocket');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();
const server = http.createServer(app);

// Initialiser WebSocket
initializeWebSocket(server);

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dossier pour les fichiers uploadés
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Créer le fichier messages.json s'il n'existe pas
const messagesFile = path.join(dataDir, 'messages.json');
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, '[]', 'utf-8');
}

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/appointments', require('./routes/appointements'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api/messages', require('./routes/messages'));

// Route de base pour vérifier si le serveur fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de Riziky-Agendas' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Lancement du serveur
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
