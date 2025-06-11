
import React, { Suspense, useEffect } from 'react';
import './App.css';
import AppProviders from './app/AppProviders';
import AppRoutes from './app/AppRoutes';
import { validateSession, apiRateLimit } from '@/utils/security';
import { PerformanceOptimizer } from '@/components/optimization/PerformanceOptimizer';

// Composant principal optimisé pour les performances
function App() {
  useEffect(() => {
    // Validation de session au démarrage
    validateSession();
    
    // Préchargement des ressources critiques
    const preloadCriticalResources = () => {
      const criticalImages = ['/images/Logo/Logo.png'];
      criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };

    // Optimisation du chargement
    if (document.readyState === 'complete') {
      preloadCriticalResources();
    } else {
      window.addEventListener('load', preloadCriticalResources);
      return () => window.removeEventListener('load', preloadCriticalResources);
    }

    // Configuration de sécurité CSP
    const metaCSP = document.createElement('meta');
    metaCSP.httpEquiv = 'Content-Security-Policy';
    metaCSP.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' http://localhost:10000 ws://localhost:10000;
      media-src 'self';
      object-src 'none';
      frame-src 'none';
    `;
    document.head.appendChild(metaCSP);

    return () => {
      document.head.removeChild(metaCSP);
    };
  }, []);

  return (
    <PerformanceOptimizer cacheKey="main-app">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </Suspense>
    </PerformanceOptimizer>
  );
}

export default App;
