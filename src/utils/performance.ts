
import { useCallback, useMemo, useRef, useEffect } from 'react';

// Service de préchargement des ressources
export class ResourcePreloader {
  private static instance: ResourcePreloader;
  private preloadedResources = new Set<string>();

  static getInstance(): ResourcePreloader {
    if (!ResourcePreloader.instance) {
      ResourcePreloader.instance = new ResourcePreloader();
    }
    return ResourcePreloader.instance;
  }

  // Précharger une image
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Précharger plusieurs images
  async preloadImages(sources: string[]): Promise<void> {
    const promises = sources.map(src => this.preloadImage(src));
    await Promise.allSettled(promises);
  }

  // Précharger une route
  preloadRoute(routePath: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = routePath;
    document.head.appendChild(link);
  }

  // Précharger du CSS
  preloadCSS(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  }
}

// Hook de throttling
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastExecRef = useRef(0);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();

      if (now - lastExecRef.current > delay) {
        func(...args);
        lastExecRef.current = now;
      } else {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          func(...args);
          lastExecRef.current = Date.now();
        }, delay - (now - lastExecRef.current));
      }
    }) as T,
    [func, delay]
  );
}

// Hook de debouncing
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: any[]) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => func(...args), delay);
    }) as T,
    [func, delay]
  );
}

// Hook de mémorisation avancée
export function useAdvancedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: { maxAge?: number } = {}
): T {
  const { maxAge = 300000 } = options; // 5 minutes par défaut
  const cacheRef = useRef<{ value: T; timestamp: number; deps: React.DependencyList } | null>(null);

  return useMemo(() => {
    const now = Date.now();
    
    // Vérifier si le cache est valide
    if (cacheRef.current) {
      const { value, timestamp, deps: cachedDeps } = cacheRef.current;
      
      // Vérifier l'âge du cache
      if (now - timestamp < maxAge) {
        // Vérifier si les dépendances ont changé
        if (cachedDeps.length === deps.length && 
            cachedDeps.every((dep, index) => dep === deps[index])) {
          return value;
        }
      }
    }

    // Recalculer la valeur
    const value = factory();
    cacheRef.current = { value, timestamp: now, deps: [...deps] };
    return value;
  }, deps);
}

// Cache intelligent pour les requêtes
export class SmartCache {
  private static instance: SmartCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 300000; // 5 minutes

  static getInstance(): SmartCache {
    if (!SmartCache.instance) {
      SmartCache.instance = new SmartCache();
    }
    return SmartCache.instance;
  }

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Nettoyage automatique après expiration
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const { data, timestamp, ttl } = cached;
    const now = Date.now();
    
    if (now - timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Méthode pour invalider le cache selon un pattern
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Hook pour la détection de la vitesse de connexion
export function useNetworkSpeed() {
  const [networkSpeed, setNetworkSpeed] = React.useState<'slow' | 'fast'>('fast');

  useEffect(() => {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const updateSpeed = () => {
        const effectiveType = connection.effectiveType;
        setNetworkSpeed(effectiveType === '4g' ? 'fast' : 'slow');
      };

      updateSpeed();
      connection.addEventListener('change', updateSpeed);
      
      return () => connection.removeEventListener('change', updateSpeed);
    }
  }, []);

  return networkSpeed;
}

// Optimisation d'images selon la connexion
export function getOptimizedImageUrl(baseUrl: string, networkSpeed: 'slow' | 'fast'): string {
  if (networkSpeed === 'slow') {
    // Réduire la qualité pour les connexions lentes
    return baseUrl.replace(/\.(jpg|jpeg|png)$/i, '_compressed.$1');
  }
  return baseUrl;
}

// Hook de lazy loading
export function useLazyLoading(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default {
  ResourcePreloader,
  SmartCache,
  useThrottle,
  useDebounce,
  useAdvancedMemo,
  useNetworkSpeed,
  getOptimizedImageUrl,
  useLazyLoading
};
