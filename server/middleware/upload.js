
/**
 * MIDDLEWARE DE TÉLÉCHARGEMENT DE FICHIERS
 * ========================================
 * 
 * Ce middleware gère le téléchargement et la validation des fichiers images.
 * Il utilise Multer pour le traitement des fichiers multipart/form-data.
 * 
 * Fonctionnalités principales :
 * - Configuration du stockage des fichiers
 * - Validation des types de fichiers (images uniquement)
 * - Génération de noms de fichiers uniques
 * - Limitation de la taille des fichiers (5MB max)
 * - Filtrage des extensions autorisées
 * 
 * Utilisation :
 * - Upload d'images produits
 * - Gestion des avatars utilisateurs
 * - Validation des fichiers téléchargés
 */

const multer = require('multer');
const path = require('path');

/**
 * Configuration du stockage des fichiers
 * Définit où et comment les fichiers sont sauvegardés
 */
const storage = multer.diskStorage({
  // Ici on attend la définition du dossier de destination
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  
  // Ici on attend la génération d'un nom de fichier unique
  filename: (req, file, cb) => {
    // Génère un suffixe unique basé sur timestamp + nombre aléatoire
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

/**
 * Filtre pour accepter uniquement les fichiers images
 * Valide le type MIME et l'extension du fichier
 * 
 * @param {Object} req - Objet de requête Express
 * @param {Object} file - Objet fichier Multer
 * @param {Function} cb - Callback de validation
 */
const fileFilter = (req, file, cb) => {
  // Ici on attend la définition des types autorisés
  const allowedTypes = /jpeg|jpg|png|gif/;
  
  // Ici on attend la vérification du type MIME
  const mimeOk = allowedTypes.test(file.mimetype);
  
  // Ici on attend la vérification de l'extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimeOk && extname) {
    // Ici on a accepté le fichier s'il passe les validations
    return cb(null, true);
  }
  
  // Ici on a rejeté le fichier avec une erreur explicite
  cb(new Error('Only image files are allowed!'));
};

/**
 * Configuration principale de Multer
 * Combine le stockage, les filtres et les limites
 */
const upload = multer({
  storage, // Configuration de stockage définie ci-dessus
  fileFilter, // Filtre de validation des fichiers
  limits: {
    fileSize: 1024 * 1024 * 5 // Ici on a limité la taille à 5MB maximum
  }
});

// Ici on a ajouté l'export du middleware configuré
module.exports = upload;
