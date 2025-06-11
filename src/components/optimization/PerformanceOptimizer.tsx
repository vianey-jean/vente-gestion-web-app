
import React, { memo, useMemo, useCallback } from 'react';
import { throttle } from '@/utils/security';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  cacheKey?: string;
  throttleMs?: number;
}

// HOC pour l'optimisation des performances
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  options: { memo?: boolean; throttleProps?: (keyof P)[] } = {}
) => {
  const OptimizedComponent = memo((props: P) => {
    const memoizedProps = useMemo(() => {
      if (options.throttleProps) {
        const throttledProps = { ...props };
        options.throttleProps.forEach(propKey => {
          if (typeof props[propKey] === 'function') {
            throttledProps[propKey] = throttle(props[propKey] as any, 300) as any;
          }
        });
        return throttledProps;
      }
      return props;
    }, [props]);

    return <Component {...memoizedProps} />;
  });

  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`;
  
  return OptimizedComponent;
};

// Composant pour l'optimisation générale
export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = memo(({ 
  children, 
  cacheKey,
  throttleMs = 100 
}) => {
  const memoizedChildren = useMemo(() => {
    return children;
  }, [children, cacheKey]);

  return <>{memoizedChildren}</>;
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

// Hook pour l'optimisation des callbacks
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  throttleMs: number = 300
): T => {
  const throttledCallback = useMemo(
    () => throttle(callback, throttleMs),
    deps
  );

  return useCallback(throttledCallback as T, [throttledCallback]);
};

// Hook pour l'optimisation des valeurs
export const useOptimizedValue = <T>(
  value: T,
  computeValue?: () => T,
  deps?: React.DependencyList
): T => {
  return useMemo(() => {
    return computeValue ? computeValue() : value;
  }, deps ? [value, ...deps] : [value]);
};
