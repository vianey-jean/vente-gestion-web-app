import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernContainer } from '@/components/dashboard/forms/ModernContainer';
import { ModernCard } from '@/components/dashboard/forms/ModernCard';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Percent,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

const ProfitCalculator: React.FC = () => {
  const { allSales, products } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  // Calcul du total des ventes
  const totalSales = useMemo(() => {
    return allSales.reduce((acc, sale) => acc + sale.sellingPrice, 0);
  }, [allSales]);

  // Calcul du total des coûts
  const totalCosts = useMemo(() => {
    return allSales.reduce((acc, sale) => acc + (sale.purchasePrice * sale.quantitySold), 0);
  }, [allSales]);

  // Calcul du bénéfice brut
  const grossProfit = useMemo(() => {
    return totalSales - totalCosts;
  }, [totalSales, totalCosts]);

  // Calcul du bénéfice net (après impôts - exemple 25%)
  const netProfit = useMemo(() => {
    return grossProfit * 0.75;
  }, [grossProfit]);

  // Calcul de la marge bénéficiaire brute
  const grossProfitMargin = useMemo(() => {
    return totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  }, [grossProfit, totalSales]);

  // Calcul de la marge bénéficiaire nette
  const netProfitMargin = useMemo(() => {
    return totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
  }, [netProfit, totalSales]);

  // Top 5 des produits les plus vendus
  const topSellingProducts = useMemo(() => {
    const productSales = allSales.reduce((acc, sale) => {
      const productName = products.find(p => p.id === sale.productId)?.name || 'Inconnu';
      if (!acc[productName]) {
        acc[productName] = { name: productName, quantity: 0, revenue: 0 };
      }
      acc[productName].quantity += sale.quantitySold;
      acc[productName].revenue += sale.sellingPrice;
      return acc;
    }, {} as { [name: string]: { name: string, quantity: number, revenue: number } });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [allSales, products]);

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PremiumLoading 
        text="Calcul des Bénéfices"
        size="md"
        variant="ventes"
        showText={true}
      />
    );
  }

  return (
    <ModernContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte des Ventes Totales */}
        <ModernCard className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales.toLocaleString()} €</div>
            <p className="text-xs text-blue-100">+12% par rapport au mois dernier</p>
          </CardContent>
        </ModernCard>

        {/* Carte du Bénéfice Brut */}
        <ModernCard className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Brut</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grossProfit.toLocaleString()} €</div>
            <p className="text-xs text-green-100">Marge: {grossProfitMargin.toFixed(2)}%</p>
          </CardContent>
        </ModernCard>

        {/* Carte du Bénéfice Net */}
        <ModernCard className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net (après impôts)</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{netProfit.toLocaleString()} €</div>
            <p className="text-xs text-purple-100">Marge: {netProfitMargin.toFixed(2)}%</p>
          </CardContent>
        </ModernCard>
      </div>

      {/* Section des Produits les Plus Vendus */}
      <ModernCard className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            Top 5 des Produits les Plus Vendus
          </CardTitle>
          <CardDescription>Basé sur la quantité vendue</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-none space-y-4">
            {topSellingProducts.map((product, index) => (
              <li key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Quantité: {product.quantity}</span>
                  <span className="block text-lg font-bold text-blue-600">{product.revenue.toLocaleString()} €</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </ModernCard>
    </ModernContainer>
  );
};

export default ProfitCalculator;
