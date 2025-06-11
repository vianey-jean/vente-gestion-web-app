
import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { productsAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { SmartCache, useAdvancedMemo } from '@/utils/performance';
import SecurityManager from '@/services/security/SecurityManager';

export const useProducts = (categoryName?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const cache = useMemo(() => SmartCache.getInstance(), []);
  const security = useMemo(() => SecurityManager.getInstance(), []);

  const fetchProducts = useAdvancedMemo(
    () => async (categoryName?: string) => {
      setLoading(true);
      
      // Vérifier la session avant la requête
      if (!security.validateSession()) {
        console.warn('Session invalide, arrêt du chargement des produits');
        setLoading(false);
        return;
      }

      try {
        const cacheKey = categoryName ? `products-category-${categoryName}` : 'products-all';
        
        // Vérifier le cache intelligent
        const cached = cache.get(cacheKey);
        if (cached) {
          setProducts(cached);
          setLoading(false);
          return;
        }

        let response;
        if (categoryName) {
          response = await productsAPI.getByCategory(security.sanitizeInput(categoryName));
        } else {
          response = await productsAPI.getAll();
        }
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Format de données incorrect pour les produits');
        }
        
        // Nettoyer les données de sécurité
        const sanitizedProducts = response.data.map(product => ({
          ...product,
          name: security.sanitizeInput(product.name || ''),
          description: security.sanitizeInput(product.description || ''),
        }));
        
        // Mettre en cache avec TTL de 5 minutes
        cache.set(cacheKey, sanitizedProducts, 5 * 60 * 1000);
        setProducts(sanitizedProducts);
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
        toast.error('Erreur lors du chargement des produits');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [categoryName, cache, security],
    { maxAge: 5 * 60 * 1000 }
  );

  useEffect(() => {
    fetchProducts(categoryName);
  }, [fetchProducts, categoryName]);

  // Vérification périodique des promotions expirées avec optimisation
  useEffect(() => {
    const checkPromotions = () => {
      const now = new Date();
      const updatedProducts = products.map(product => {
        if (product.promotion && product.promotionEnd && new Date(product.promotionEnd) < now) {
          return {
            ...product,
            price: product.originalPrice || product.price,
            promotion: null,
            promotionEnd: null
          };
        }
        return product;
      });
      
      if (JSON.stringify(updatedProducts) !== JSON.stringify(products)) {
        setProducts(updatedProducts);
        
        // Invalider le cache pour forcer la mise à jour
        const cacheKey = categoryName ? `products-category-${categoryName}` : 'products-all';
        cache.delete(cacheKey);
      }
    };
    
    // Vérifier seulement si on a des produits avec promotions
    const hasPromotions = products.some(p => p.promotion && p.promotionEnd);
    if (hasPromotions) {
      const interval = setInterval(checkPromotions, 60000);
      return () => clearInterval(interval);
    }
  }, [products, categoryName, cache]);

  const getProductById = useMemo(
    () => (id: string) => {
      const sanitizedId = security.sanitizeInput(id);
      return products.find(p => p.id === sanitizedId);
    },
    [products, security]
  );

  // Invalidation intelligente du cache
  const invalidateCache = useMemo(
    () => () => {
      cache.invalidatePattern(/^products-/);
      console.log('🗑️ Cache des produits invalidé');
    },
    [cache]
  );

  return {
    products,
    loading,
    fetchProducts,
    getProductById,
    invalidateCache
  };
};
