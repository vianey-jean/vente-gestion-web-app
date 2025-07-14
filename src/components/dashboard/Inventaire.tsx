
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import ModernCard from '@/components/dashboard/forms/ModernCard';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Euro,
  BarChart3,
  Filter,
  RefreshCcw
} from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

const Inventaire: React.FC = () => {
  const { products, allSales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Calcul du stock total
  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.quantity, 0);
  }, [products]);

  // Calcul de la valeur totale de l'inventaire (prix d'achat)
  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, product) => sum + (product.purchasePrice * product.quantity), 0);
  }, [products]);

  // Filtrage des produits en fonction du terme de recherche
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Filtrage des produits en fonction du type de filtre (tout, faible, épuisé)
  const productsToDisplay = useMemo(() => {
    switch (filterType) {
      case 'low':
        return filteredProducts.filter(product => product.quantity <= 5);
      case 'out':
        return filteredProducts.filter(product => product.quantity === 0);
      default:
        return filteredProducts;
    }
  }, [filteredProducts, filterType]);

  // Analyse des ventes par produit
  const salesAnalysis = useMemo(() => {
    return productsToDisplay.map(product => {
      const productSales = allSales.filter(sale => sale.productId === product.id);
      const totalSold = productSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      const totalRevenue = productSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
      return {
        ...product,
        totalSold,
        totalRevenue,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [productsToDisplay, allSales]);

  // Calcul des produits avec stock faible
  const lowStockCount = useMemo(() => {
    return products.filter(product => product.quantity <= 5).length;
  }, [products]);

  // Calcul des produits épuisés
  const outOfStockCount = useMemo(() => {
    return products.filter(product => product.quantity === 0).length;
  }, [products]);

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PremiumLoading 
        text="Chargement de l'Inventaire"
        size="md"
        variant="dashboard"
        showText={true}
      />
    );
  }

  return (
    <ModernContainer>
      <ModernCard>
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-500" />
            Inventaire des Produits
          </CardTitle>
          <CardDescription>
            Suivez et gérez votre stock en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStock}</div>
                <p className="text-xs text-blue-500">+3% ce mois-ci</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valeur Inventaire</CardTitle>
                <Euro className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInventoryValue.toLocaleString()} €</div>
                <p className="text-xs text-emerald-500">+5% par rapport au mois dernier</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockCount}</div>
                <p className="text-xs text-orange-500">A surveiller de près</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/30 border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rupture de Stock</CardTitle>
                <Package className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{outOfStockCount}</div>
                <p className="text-xs text-red-500">Besoin de réapprovisionnement</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-80 rounded-full shadow-sm border-gray-200 focus-ring-0 text-sm"
              />
              <Search className="h-5 w-5 text-gray-400 -ml-8" />
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="rounded-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix d'achat
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Vendu
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenu Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {salesAnalysis.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                      {product.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {product.description}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {product.purchasePrice.toLocaleString()} €
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-blue-500">
                      {product.totalSold}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-emerald-500">
                      {product.totalRevenue.toLocaleString()} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </ModernCard>
    </ModernContainer>
  );
};

export default Inventaire;
