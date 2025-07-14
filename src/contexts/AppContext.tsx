
/**
 * CONTEXTE PRINCIPAL DE L'APPLICATION
 * 
 * Ce fichier gère l'état global des données métier :
 * - Gestion des produits (inventaire)
 * - Gestion des ventes
 * - Synchronisation des données
 * - État de chargement global
 * - Rafraîchissement des données
 * 
 * FONCTIONNALITÉS:
 * - Hook useApp pour accéder aux données
 * - AppProvider pour encapsuler les composants
 * - Gestion centralisée des produits et ventes
 * - Fonctions CRUD pour les données
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale } from '@/types';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface du contexte de l'application
 * Définit toutes les données et méthodes disponibles
 */
export interface AppContextType {
  // Données principales
  products: Product[];
  sales: Sale[];
  allSales: Sale[];
  
  // États de chargement
  loading: boolean;
  isDataLoaded: boolean;
  
  // Méthodes de gestion des produits
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Méthodes de gestion des ventes
  setSales: (sales: Sale[]) => void;
  addSale: (sale: Sale) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  
  // Méthodes utilitaires
  refreshData: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getSalesByProductId: (productId: string) => Sale[];
}

/**
 * Props du provider de l'application
 */
interface AppProviderProps {
  children: ReactNode;
}

// ============================================
// DONNÉES MOCKÉES POUR LE DÉVELOPPEMENT
// ============================================

/**
 * Produits mockés pour les tests et développement
 */
const mockProducts: Product[] = [
  {
    id: '1',
    description: 'Perruque Lace Front Premium',
    purchasePrice: 45.00,
    quantity: 12,
    sellingPrice: 85.00,
    profit: 40.00
  },
  {
    id: '2',
    description: 'Tissage Brésilien 20 pouces',
    purchasePrice: 32.00,
    quantity: 8,
    sellingPrice: 65.00,
    profit: 33.00
  }
];

/**
 * Ventes mockées pour les tests et développement
 */
const mockSales: Sale[] = [
  {
    id: '1',
    productId: '1',
    description: 'Perruque Lace Front Premium',
    date: new Date().toISOString(),
    quantitySold: 1,
    purchasePrice: 45.00,
    sellingPrice: 85.00,
    profit: 40.00,
    clientName: 'Marie Dubois',
    clientPhone: '+33123456789'
  },
  {
    id: '2',
    productId: '2',
    description: 'Tissage Brésilien 20 pouces',
    date: new Date(Date.now() - 86400000).toISOString(), // Hier
    quantitySold: 2,
    purchasePrice: 64.00,
    sellingPrice: 130.00,
    profit: 66.00,
    clientName: 'Sophie Martin'
  }
];

// ============================================
// CRÉATION DU CONTEXTE
// ============================================

/**
 * Contexte principal de l'application
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================
// PROVIDER DE L'APPLICATION
// ============================================

/**
 * Provider principal de l'application
 * Gère l'état global des données métier
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // États locaux
  const [products, setProductsState] = useState<Product[]>([]);
  const [sales, setSalesState] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // ============================================
  // INITIALISATION DES DONNÉES
  // ============================================

  /**
   * Initialise les données au chargement du contexte
   * Charge les données mockées ou depuis une API
   */
  useEffect(() => {
    console.log('📊 AppContext - Initialisation des données');
    
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Simulation d'un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Chargement des données mockées
        setProductsState(mockProducts);
        setSalesState(mockSales);
        
        setIsDataLoaded(true);
        console.log('✅ Données initialisées avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des données:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // ============================================
  // MÉTHODES DE GESTION DES PRODUITS
  // ============================================

  /**
   * Met à jour la liste complète des produits
   */
  const setProducts = (newProducts: Product[]): void => {
    console.log('🛍️ Mise à jour de la liste des produits');
    setProductsState(newProducts);
  };

  /**
   * Ajoute un nouveau produit
   */
  const addProduct = (product: Product): void => {
    console.log('➕ Ajout d\'un nouveau produit:', product.description);
    setProductsState(prev => [...prev, product]);
  };

  /**
   * Met à jour un produit existant
   */
  const updateProduct = (id: string, updatedProduct: Partial<Product>): void => {
    console.log('✏️ Mise à jour du produit ID:', id);
    setProductsState(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updatedProduct } : product
      )
    );
  };

  /**
   * Supprime un produit
   */
  const deleteProduct = (id: string): void => {
    console.log('🗑️ Suppression du produit ID:', id);
    setProductsState(prev => prev.filter(product => product.id !== id));
  };

  // ============================================
  // MÉTHODES DE GESTION DES VENTES
  // ============================================

  /**
   * Met à jour la liste complète des ventes
   */
  const setSales = (newSales: Sale[]): void => {
    console.log('💰 Mise à jour de la liste des ventes');
    setSalesState(newSales);
  };

  /**
   * Ajoute une nouvelle vente
   */
  const addSale = (sale: Sale): void => {
    console.log('➕ Ajout d\'une nouvelle vente:', sale.description);
    setSalesState(prev => [...prev, sale]);
  };

  /**
   * Met à jour une vente existante
   */
  const updateSale = (id: string, updatedSale: Partial<Sale>): void => {
    console.log('✏️ Mise à jour de la vente ID:', id);
    setSalesState(prev => 
      prev.map(sale => 
        sale.id === id ? { ...sale, ...updatedSale } : sale
      )
    );
  };

  /**
   * Supprime une vente
   */
  const deleteSale = (id: string): void => {
    console.log('🗑️ Suppression de la vente ID:', id);
    setSalesState(prev => prev.filter(sale => sale.id !== id));
  };

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Rafraîchit toutes les données
   */
  const refreshData = async (): Promise<void> => {
    console.log('🔄 Rafraîchissement des données');
    
    try {
      setLoading(true);
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Ici on ferait appel à une vraie API
      // const [productsData, salesData] = await Promise.all([
      //   fetchProducts(),
      //   fetchSales()
      // ]);
      
      console.log('✅ Données rafraîchies');
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Trouve un produit par son ID
   */
  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  /**
   * Récupère toutes les ventes d'un produit spécifique
   */
  const getSalesByProductId = (productId: string): Sale[] => {
    return sales.filter(sale => sale.productId === productId);
  };

  // ============================================
  // VALEURS DU CONTEXTE
  // ============================================

  /**
   * Valeurs exposées par le contexte
   */
  const contextValue: AppContextType = {
    // Données
    products,
    sales,
    allSales: sales, // Alias pour compatibilité
    
    // États
    loading,
    isDataLoaded,
    
    // Méthodes produits
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Méthodes ventes
    setSales,
    addSale,
    updateSale,
    deleteSale,
    
    // Utilitaires
    refreshData,
    getProductById,
    getSalesByProductId
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// ============================================
// HOOK D'UTILISATION
// ============================================

/**
 * Hook pour utiliser le contexte de l'application
 * Vérifie que le hook est utilisé dans un AppProvider
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  
  return context;
};
