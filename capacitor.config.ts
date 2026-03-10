/**
 * Configuration Capacitor pour l'application mobile native
 * - appId : identifiant unique de l'application
 * - appName : nom affiché sur l'appareil
 * - webDir : dossier de build Vite
 * - server.url : URL du sandbox pour le hot-reload en développement
 */
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
