
// Importation d'Axios pour les requêtes HTTP
import axios from 'axios';

// Création d'une instance Axios avec une configuration de base
// L'URL de base est récupérée depuis les variables d'environnement
const api = axios.create({
  // Utilisation de l'URL de base de l'API depuis Vite
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://riziky-agendas.onrender.com',
  // Timeout après 10 secondes si pas de réponse du serveur
  timeout: 10000,
  // En-têtes HTTP par défaut pour toutes les requêtes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Ajout d'un intercepteur pour gérer les requêtes
api.interceptors.request.use(
  (config) => {
    // On pourrait ajouter un token d'authentification ici si nécessaire
    // Exemple: config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    // En cas d'erreur lors de la requête
    return Promise.reject(error);
  }
);

// Ajout d'un intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    // Retourne directement la réponse si tout va bien
    return response;
  },
  (error) => {
    // Gestion personnalisée des erreurs selon le code HTTP
    if (error.response) {
      // Si le serveur a répondu avec un code d'erreur
      switch (error.response.status) {
        case 401:
          // Non autorisé - déconnecter l'utilisateur
          // Exemple: AuthService.logout();
          break;
        case 404:
          // Ressource non trouvée
          console.error('Ressource non trouvée');
          break;
        default:
          // Autre type d'erreur
          console.error('Erreur de serveur', error.response.data);
      }
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse reçue
      console.error('Pas de réponse du serveur');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête', error.message);
    }
    
    // Rejette la promesse avec l'erreur pour traitement ultérieur
    return Promise.reject(error);
  }
);

// Exportation de l'instance configurée
export default api;
