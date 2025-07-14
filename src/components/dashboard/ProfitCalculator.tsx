
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, DollarSign, Percent, Target, Sparkles, BarChart3 } from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

const ProfitCalculator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [calculations, setCalculations] = useState({
    purchasePrice: '',
    sellingPrice: '',
    quantity: '1',
    desiredMargin: ''
  });

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setCalculations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetCalculations = () => {
    setCalculations({
      purchasePrice: '',
      sellingPrice: '',
      quantity: '1',
      desiredMargin: ''
    });
  };

  // Calculs automatiques
  const purchasePrice = parseFloat(calculations.purchasePrice) || 0;
  const sellingPrice = parseFloat(calculations.sellingPrice) || 0;
  const quantity = parseInt(calculations.quantity) || 1;
  const desiredMargin = parseFloat(calculations.desiredMargin) || 0;

  // Calculs des résultats
  const totalPurchasePrice = purchasePrice * quantity;
  const totalSellingPrice = sellingPrice * quantity;
  const unitProfit = sellingPrice - purchasePrice;
  const totalProfit = unitProfit * quantity;
  const marginPercentage = purchasePrice > 0 ? ((unitProfit / purchasePrice) * 100) : 0;
  const marginOnSale = sellingPrice > 0 ? ((unitProfit / sellingPrice) * 100) : 0;
  
  // Prix de vente suggéré basé sur la marge souhaitée
  const suggestedSellingPrice = purchasePrice > 0 && desiredMargin > 0 
    ? purchasePrice * (1 + desiredMargin / 100)
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PremiumLoading 
          text="Chargement du Calculateur"
          size="md"
          variant="ventes"
          showText={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-4">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Calculateur de Bénéfices
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Optimisez vos prix de vente et marges bénéficiaires
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-teal-500 animate-pulse" />
            <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">Calculs automatiques</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de calcul */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full p-2">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              Paramètres de Calcul
            </CardTitle>
            <CardDescription>Saisissez vos données pour calculer automatiquement vos bénéfices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="purchasePrice" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Prix d'achat unitaire (€)
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={calculations.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sellingPrice" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Prix de vente unitaire (€)
                </Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={calculations.sellingPrice}
                  onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Quantité
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={calculations.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="1"
                  className="mt-1"
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="desiredMargin" className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                  Marge souhaitée (%) - Optionnel
                </Label>
                <Input
                  id="desiredMargin"
                  type="number"
                  step="0.1"
                  value={calculations.desiredMargin}
                  onChange={(e) => handleInputChange('desiredMargin', e.target.value)}
                  placeholder="ex: 50"
                  className="mt-1 border-teal-200 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Entrez une marge pour obtenir le prix de vente suggéré
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={resetCalculations}
                variant="outline"
                className="flex-1"
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="space-y-6">
          {/* Résultats principaux */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-2">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Résultats du Calcul
              </CardTitle>
              <CardDescription>Bénéfices et marges calculés automatiquement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bénéfice unitaire</span>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">
                    {formatCurrency(unitProfit)}
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bénéfice total</span>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {formatCurrency(totalProfit)}
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Marge sur coût</span>
                    <Percent className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">
                    {formatPercentage(marginPercentage)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Par rapport au prix d'achat
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Marge sur vente</span>
                    <Target className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mt-1">
                    {formatPercentage(marginOnSale)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Par rapport au prix de vente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prix suggéré */}
          {suggestedSellingPrice > 0 && (
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-2">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  Prix de Vente Suggéré
                </CardTitle>
                <CardDescription>
                  Basé sur une marge de {formatPercentage(desiredMargin)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-600 mb-2">
                      {formatCurrency(suggestedSellingPrice)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Prix de vente unitaire recommandé
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Bénéfice unitaire: {formatCurrency(suggestedSellingPrice - purchasePrice)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Détails financiers */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-full p-2">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                Détails Financiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prix d'achat total</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalPurchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prix de vente total</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalSellingPrice)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quantité</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{quantity} unité{quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-3 rounded-lg">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Bénéfice net total</span>
                  <span className="font-bold text-xl text-emerald-600">{formatCurrency(totalProfit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;
