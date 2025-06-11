
import React, { Suspense } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PromoBanner from './PromoBanner';
import BenefitsSection from './BenefitsSection';
import PaymentBadges from './PaymentBadges';
import LayoutPrompts from './LayoutPrompts';
import ClientServiceChatWidget from '@/components/chat/ClientServiceChatWidget';
import AdminServiceChatWidget from '@/components/chat/AdminServiceChatWidget';
import ScrollToTop from '@/components/ui/ScrollToTop';
import PerformanceOptimizer from '@/components/optimization/PerformanceOptimizer';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/contexts/StoreContext';
import { productsAPI } from '@/services/api';
import pubLayoutAPI, { PubLayout } from '@/services/pubLayoutAPI';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import { SmartCache } from '@/utils/performance';
import { Skeleton } from '@/components/ui/skeleton';

interface LayoutProps {
  children: React.ReactNode;
  hidePrompts?: boolean;
}

// Composant de chargement optimisé
const LayoutSkeleton = () => (
  <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <header className="sticky top-0 z-50">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-10 w-full" />
    </header>
    <main className="flex-grow p-4">
      <Skeleton className="h-32 w-full mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </main>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children, hidePrompts = false }) => {
  const cache = React.useMemo(() => SmartCache.getInstance(), []);

  const { data: trendingProducts } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async (): Promise<Product[]> => {
      // Vérifier le cache intelligent
      const cached = cache.get('trending-products');
      if (cached) return cached;

      try {
        const response = await productsAPI.getMostFavorited();
        const data = response.data || [];
        
        // Mettre en cache avec TTL de 10 minutes
        cache.set('trending-products', data, 10 * 60 * 1000);
        return data;
      } catch (error) {
        console.error('Erreur lors du chargement des produits populaires:', error);
        return [];
      }
    },
    enabled: !hidePrompts,
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data: pubLayoutItems = [], isLoading: isLoadingPubLayout } = useQuery({
    queryKey: ['pub-layout'],
    queryFn: async (): Promise<PubLayout[]> => {
      // Vérifier le cache intelligent
      const cached = cache.get('pub-layout');
      if (cached) return cached;

      try {
        const data = await pubLayoutAPI.getAll();
        cache.set('pub-layout', data, 30 * 1000); // Cache 30 secondes
        return data;
      } catch (error) {
        console.error('Erreur lors du chargement des publicités:', error);
        const fallback = [
          { id: "1", icon: "ThumbsUp", text: "Livraison gratuite à partir de 50€ d'achat" },
          { id: "2", icon: "Gift", text: "-10% sur votre première commande avec le code WELCOME10" },
          { id: "3", icon: "Clock", text: "Satisfait ou remboursé sous 30 jours" }
        ];
        cache.set('pub-layout', fallback, 30 * 1000);
        return fallback;
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const hasScrolled = useScrollDetection(200, hidePrompts);

  // Images à précharger
  const preloadImages = React.useMemo(() => [
    '/images/Logo/Logo.png',
    '/assets/visa.png',
    '/assets/mastercard.png',
    '/assets/paypal.png'
  ], []);

  return (
    <PerformanceOptimizer 
      preloadImages={preloadImages}
      cacheKey="layout-main"
      enableLazyLoading={true}
    >
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <header className="sticky top-0 z-50">
          <Suspense fallback={<Skeleton className="h-16 w-full" />}>
            <Navbar />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <PromoBanner pubLayoutItems={pubLayoutItems} isLoading={isLoadingPubLayout} />
          </Suspense>
        </header>
        
        <main className="flex-grow" role="main">
          <Suspense fallback={<LayoutSkeleton />}>
            {children}
          </Suspense>
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <BenefitsSection />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-16 w-full" />}>
            <PaymentBadges />
          </Suspense>
        </main>
        
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <Footer />
        </Suspense>
        
        <Suspense fallback={null}>
          <LayoutPrompts 
            hidePrompts={hidePrompts}
            trendingProducts={trendingProducts}
            hasScrolled={hasScrolled}
          />
        </Suspense>

        <Suspense fallback={null}>
          <ClientServiceChatWidget />
        </Suspense>
        <Suspense fallback={null}>
          <AdminServiceChatWidget />
        </Suspense>
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
      </div>
    </PerformanceOptimizer>
  );
};

export default React.memo(Layout);
