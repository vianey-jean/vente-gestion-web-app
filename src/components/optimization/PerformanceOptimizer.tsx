
import React, { Suspense, memo, useMemo, useCallback, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ResourcePreloader, SmartCache, useNetworkSpeed } from '@/utils/performance';
import { Skeleton } from '@/components/ui/skeleton';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  preloadImages?: string[];
  cacheKey?: string;
  enableLazyLoading?: boolean;
}

// Composant d'erreur optimisé
const ErrorFallback = memo(({ error, resetErrorBoundary }: any) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <h2 className="text-red-800 font-semibold mb-2">Une erreur s'est produite</h2>
    <p className="text-red-600 text-sm mb-3">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
    >
      Réessayer
    </button>
  </div>
));

ErrorFallback.displayName = 'ErrorFallback';

// Composant de chargement optimisé
const OptimizedLoader = memo(() => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
  </div>
));

OptimizedLoader.displayName = 'OptimizedLoader';

// HOC pour l'optimisation des composants
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  optimizationOptions: {
    memoize?: boolean;
    preloadImages?: string[];
    cacheKey?: string;
  } = {}
) {
  const { memoize = true, preloadImages = [], cacheKey } = optimizationOptions;

  const OptimizedComponent = (props: P) => {
    const networkSpeed = useNetworkSpeed();
    const preloader = useMemo(() => ResourcePreloader.getInstance(), []);
    const cache = useMemo(() => SmartCache.getInstance(), []);

    // Préchargement des images
    useEffect(() => {
      if (preloadImages.length > 0 && networkSpeed === 'fast') {
        preloader.preloadImages(preloadImages);
      }
    }, [preloader, networkSpeed]);

    // Gestion du cache
    const cachedProps = useMemo(() => {
      if (!cacheKey) return props;
      
      const cached = cache.get(cacheKey);
      if (cached) return cached;
      
      cache.set(cacheKey, props);
      return props;
    }, [props, cache, cacheKey]);

    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Suspense fallback={<OptimizedLoader />}>
          <Component {...cachedProps} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  OptimizedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;

  return memoize ? memo(OptimizedComponent) : OptimizedComponent;
}

// Composant principal d'optimisation
const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = memo(({
  children,
  preloadImages = [],
  cacheKey,
  enableLazyLoading = true
}) => {
  const networkSpeed = useNetworkSpeed();
  const preloader = useMemo(() => ResourcePreloader.getInstance(), []);

  // Préchargement des ressources critiques
  useEffect(() => {
    if (preloadImages.length > 0) {
      // Précharger immédiatement pour les connexions rapides
      if (networkSpeed === 'fast') {
        preloader.preloadImages(preloadImages);
      } else {
        // Précharger avec délai pour les connexions lentes
        setTimeout(() => {
          preloader.preloadImages(preloadImages.slice(0, 3)); // Limiter le nombre
        }, 2000);
      }
    }
  }, [preloader, preloadImages, networkSpeed]);

  // Optimisation du rendu selon la vitesse de connexion
  const optimizedChildren = useMemo(() => {
    if (networkSpeed === 'slow' && enableLazyLoading) {
      return (
        <Suspense fallback={<OptimizedLoader />}>
          {children}
        </Suspense>
      );
    }
    return children;
  }, [children, networkSpeed, enableLazyLoading]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {optimizedChildren}
    </ErrorBoundary>
  );
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

// Hook pour l'optimisation des listes
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
    
    return {
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleCount, items.length);
        
        return {
          items: items.slice(startIndex, endIndex),
          startIndex,
          offsetTop: startIndex * itemHeight
        };
      },
      totalHeight: items.length * itemHeight
    };
  }, [items, itemHeight, containerHeight]);
}

// Hook pour l'optimisation des callbacks
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

export default PerformanceOptimizer;
