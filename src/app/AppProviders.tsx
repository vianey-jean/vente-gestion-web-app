
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Configuration optimisée du QueryClient avec cache amélioré
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Ne pas réessayer pour les erreurs 401/403
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: 'always',
      // Optimisation réseau
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 1;
      },
      networkMode: 'online',
    },
  },
});

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <AuthProvider>
              <StoreProvider>
                {children}
                <Toaster 
                  closeButton 
                  richColors 
                  position="top-center"
                  duration={3000}
                  visibleToasts={3}
                />
              </StoreProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default AppProviders;
