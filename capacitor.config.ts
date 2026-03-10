// Configuration Capacitor pour l'application mobile native iOS/Android
// Ce fichier définit les paramètres de base pour le packaging natif

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b4bea8fede4c46cfbc64943e6e52345e',
  appName: 'vente-gestion-web-app',
  webDir: 'dist',
  server: {
    url: 'https://b4bea8fe-de4c-46cf-bc64-943e6e52345e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
