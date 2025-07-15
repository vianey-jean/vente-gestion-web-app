
/**
 * POINT D'ENTRÉE PRINCIPAL DE L'APPLICATION
 * =======================================
 * 
 * Ce fichier initialise et monte l'application React dans le DOM.
 * Il configure le root de l'application et importe les styles globaux.
 * 
 * Responsabilités :
 * - Création du root React
 * - Montage du composant App principal
 * - Import des styles CSS globaux
 */

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ici on attend la création du root React et le montage de l'application
createRoot(document.getElementById("root")!).render(<App />);

// Ici on a ajouté le point d'entrée principal qui initialise l'application
