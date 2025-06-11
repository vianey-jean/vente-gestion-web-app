
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { Toaster } from '@/components/ui/sonner';
import SecurityManager from '@/services/security/SecurityManager';
import { SmartCache } from '@/utils/performance';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Création d'un QueryClient avec optimisations avancées
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Ne pas réessayer les erreurs d'authentification
        if (error?.response?.status === 401) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Cache intelligent selon le type de requête
      structuralSharing: true,
      refetchOnMount: 'always',
    },
    mutations: {
      retry: 1,
      // Optimisation des mutations
      onError: (error: any) => {
        console.error('🚨 Erreur de mutation:', error);
        
        // Gestion spéciale des erreurs de sécurité
        if (error?.response?.status === 403) {
          console.warn('🔒 Accès refusé - Vérification de sécurité requise');
        }
      },
    },
  },
});

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Initialisation du gestionnaire de sécurité
    const security = SecurityManager.getInstance();
    
    // Validation de session au démarrage
    if (!security.validateSession()) {
      console.log('🔒 Session invalide au démarrage');
    }
    
    // Audit de sécurité en mode développement
    if (import.meta.env.DEV) {
      security.performSecurityAudit();
    }
    
    // Configuration des headers de sécurité
    const headers = security.getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = key;
      meta.content = value;
      document.head.appendChild(meta);
    });
    
    // Initialisation du cache intelligent
    const cache = SmartCache.getInstance();
    
    // Nettoyage périodique du cache
    const cleanupInterval = setInterval(() => {
      cache.clear();
      console.log('🧹 Cache nettoyé automatiquement');
    }, 30 * 60 * 1000); // Toutes les 30 minutes
    
    // Optimisation des performances au chargement
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        console.log('⚡ Optimisations de performance appliquées');
      });
    }
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          {children}
          <Toaster 
            closeButton 
            richColors 
            position="top-center"
            duration={4000}
            visibleToasts={3}
          />
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
