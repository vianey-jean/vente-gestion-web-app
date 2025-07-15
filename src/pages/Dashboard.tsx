
/**
 * PAGE TABLEAU DE BORD PRINCIPAL
 * ==============================
 * 
 * Cette page affiche une vue d'ensemble complète des données de l'application.
 * Elle présente des statistiques détaillées, des graphiques, des tableaux
 * et des analyses pour aider à la prise de décision.
 * 
 * Fonctionnalités principales :
 * - Affichage des métriques clés de performance
 * - Graphiques et visualisations de données
 * - Tableaux récapitulatifs
 * - Filtres et options d'export
 * - Interface responsive avec navigation par onglets
 * - Actualisation en temps réel des données
 * 
 * Sections :
 * - Vue d'ensemble générale
 * - Analyse des ventes
 * - Gestion des stocks
 * - Suivi des prêts
 * - Rapports financiers
 */

import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import PremiumLoading from '@/components/ui/premium-loading';

// Ici on attend l'importation des composants spécialisés
import SalesTable from '@/components/dashboard/SalesTable';
import StatCard from '@/components/dashboard/StatCard';
import ActionButton from '@/components/dashboard/ActionButton';

const Dashboard = () => {
  // Ici on attend l'initialisation des hooks et états
  const { 
    allSales, 
    products, 
    loading, 
    refreshData 
  } = useApp();
  
  const { formatEuro } = useCurrencyFormatter();
  const isMobile = useIsMobile();

  // Ici on a ajouté les états locaux pour l'interface
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [localLoading, setLocalLoading] = useState(true);

  // Ici on attend l'effet pour simuler le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // Ici on attend la fonction de rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Ici on attend le calcul des statistiques principales
  const dashboardStats = useMemo(() => {
    // Calcul des ventes totales
    const totalSales = allSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
    
    // Calcul des bénéfices totaux
    const totalProfit = allSales.reduce((sum, sale) => sum + sale.profit, 0);
    
    // Calcul du coût total d'achat
    const totalCost = allSales.reduce((sum, sale) => sum + sale.purchasePrice, 0);
    
    // Calcul des quantités vendues
    const totalQuantitySold = allSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
    
    // Calcul du nombre de transactions
    const totalTransactions = allSales.length;
    
    // Calcul de la marge moyenne
    const averageMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
    
    // Calcul du ticket moyen
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    // Calcul du stock total
    const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
    
    // Calcul de la valeur du stock
    const stockValue = products.reduce((sum, product) => sum + (product.purchasePrice * product.quantity), 0);

    // Ici on a ajouté le retour des statistiques calculées
    return {
      totalSales,
      totalProfit,
      totalCost,
      totalQuantitySold,
      totalTransactions,
      averageMargin,
      averageTicket,
      totalStock,
      stockValue,
      totalProducts: products.length
    };
  }, [allSales, products]);

  // Ici on attend le calcul des données pour les graphiques
  const chartData = useMemo(() => {
    // Données de ventes par mois
    const salesByMonth = allSales.reduce((acc, sale) => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          sales: 0,
          profit: 0,
          transactions: 0
        };
      }
      
      acc[monthKey].sales += sale.sellingPrice;
      acc[monthKey].profit += sale.profit;
      acc[monthKey].transactions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Données des produits les plus vendus
    const productsSold = allSales.reduce((acc, sale) => {
      const productName = sale.description.length > 30 ? 
        sale.description.substring(0, 27) + '...' : 
        sale.description;
      
      if (!acc[productName]) {
        acc[productName] = {
          name: productName,
          quantity: 0,
          sales: 0,
          profit: 0
        };
      }
      
      acc[productName].quantity += sale.quantitySold;
      acc[productName].sales += sale.sellingPrice;
      acc[productName].profit += sale.profit;
      
      return acc;
    }, {} as Record<string, any>);

    // Ici on a ajouté le retour des données formatées
    return {
      monthlyData: Object.values(salesByMonth).sort((a, b) => a.month.localeCompare(b.month)),
      topProducts: Object.values(productsSold)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
    };
  }, [allSales]);

  // Ici on attend l'affichage du chargement
  if (loading || localLoading) {
    return (
      <Layout requireAuth>
        <PremiumLoading 
          variant="dashboard" 
          text="Chargement du tableau de bord..."
        />
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      {/* Ici on attend le conteneur principal */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          
          {/* Ici on a ajouté l'en-tête du dashboard */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 border border-blue-200 dark:border-blue-800">
              <BarChart3 className="h-4 w-4 mr-2 animate-pulse" />
              Analytics et Rapports
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Tableau de Bord
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Vue d'ensemble complète de vos activités et performances
            </p>
            
            {/* Ici on attend les boutons d'action */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-3d"
                variant="outline"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Actualisation..." : "Actualiser"}
              </Button>
              
              <Button className="btn-3d bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Ici on attend les cartes de statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Ventes totales */}
            <StatCard
              title="Ventes Totales"
              description="Chiffre d'affaires global"
              value={formatEuro(dashboardStats.totalSales)}
              valueClassName="text-blue-600"
            />
            
            {/* Bénéfices totaux */}
            <StatCard
              title="Bénéfices"
              description="Profit net généré"
              value={formatEuro(dashboardStats.totalProfit)}
              valueClassName="text-green-600"
            />
            
            {/* Nombre de transactions */}
            <StatCard
              title="Transactions"
              description="Nombre total de ventes"
              value={dashboardStats.totalTransactions.toString()}
              valueClassName="text-purple-600"
            />
            
            {/* Ticket moyen */}
            <StatCard
              title="Ticket Moyen"
              description="Montant moyen par vente"
              value={formatEuro(dashboardStats.averageTicket)}
              valueClassName="text-orange-600"
            />
          </div>

          {/* Ici on attend les métriques secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Marge moyenne */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Marge Moyenne
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {dashboardStats.averageMargin.toFixed(1)}%
                </div>
                <p className="text-xs text-emerald-600/80">
                  {dashboardStats.averageMargin > 25 ? 'Excellente' : dashboardStats.averageMargin > 15 ? 'Bonne' : 'À améliorer'}
                </p>
              </CardContent>
            </Card>
            
            {/* Stock total */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Stock Total
                </CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardStats.totalStock}
                </div>
                <p className="text-xs text-blue-600/80">
                  {dashboardStats.totalProducts} produits différents
                </p>
              </CardContent>
            </Card>
            
            {/* Valeur du stock */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Valeur Stock
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatEuro(dashboardStats.stockValue)}
                </div>
                <p className="text-xs text-purple-600/80">
                  Investissement en stock
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ici on attend la section des onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            
            {/* Navigation par onglets */}
            <div className={cn(
              "relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20",
              isMobile && "pt-8 pb-12"
            )}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl"></div>
              
              <TabsList className={cn(
                "relative grid w-full h-auto p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/20",
                isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-4 gap-2'
              )}>
                
                <TabsTrigger 
                  value="overview" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "overview" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Activity className="h-4 w-4" />
                  <span>Vue d'ensemble</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="sales" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "sales" 
                      ? "text-white bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Ventes</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="inventory" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "inventory" 
                      ? "text-white bg-gradient-to-r from-orange-600 to-red-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <Package className="h-4 w-4" />
                  <span>Inventaire</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="reports" 
                  className={cn(
                    "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
                    activeTab === "reports" 
                      ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg scale-105" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Rapports</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Ici on attend le contenu des onglets */}
            
            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Résumé des activités récentes */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Activité Récente
                    </CardTitle>
                    <CardDescription>
                      Résumé des dernières activités
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Ventes du jour */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Ventes aujourd'hui
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {allSales.filter(sale => {
                            const today = new Date().toDateString();
                            return new Date(sale.date).toDateString() === today;
                          }).length} transactions
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Aujourd'hui
                      </Badge>
                    </div>
                    
                    {/* Produits en stock faible */}
                    {products.filter(p => p.quantity <= 10).length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            Stock faible
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            {products.filter(p => p.quantity <= 10).length} produits
                          </p>
                        </div>
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alerte
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Actions rapides */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Actions Rapides
                    </CardTitle>
                    <CardDescription>
                      Accès direct aux fonctionnalités principales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ActionButton
                      icon={ShoppingCart}
                      variant="default"
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      onClick={() => window.location.href = '/ventes'}
                    >
                      Nouvelle Vente
                    </ActionButton>
                    
                    <ActionButton
                      icon={Package}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/inventaire'}
                    >
                      Gérer l'Inventaire
                    </ActionButton>
                    
                    <ActionButton
                      icon={BarChart3}
                      variant="outline"
                      className="w-full justify-start" 
                      onClick={() => window.location.href = '/tendances'}
                    >
                      Voir les Tendances
                    </ActionButton>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Section Ventes */}
            <TabsContent value="sales" className="space-y-6">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    Historique des Ventes
                  </CardTitle>
                  <CardDescription>
                    Liste complète de toutes les transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Ici on attend l'intégration du tableau des ventes */}
                  <SalesTable 
                    sales={allSales}
                    onRowClick={(sale) => console.log('Sale clicked:', sale)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section Inventaire */}
            <TabsContent value="inventory" className="space-y-6">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    État des Stocks
                  </CardTitle>
                  <CardDescription>
                    Vue d'ensemble de votre inventaire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Ici on attend l'affichage de la liste des produits */}
                  <div className="space-y-4">
                    {products.length > 0 ? (
                      products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {product.description}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Prix: {formatEuro(product.purchasePrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "text-lg font-bold",
                              product.quantity <= 10 ? "text-red-600" : 
                              product.quantity <= 20 ? "text-orange-600" : "text-green-600"
                            )}>
                              {product.quantity}
                            </div>
                            <p className="text-xs text-gray-500">en stock</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Aucun produit en stock
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section Rapports */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Rapport financier */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Rapport Financier
                    </CardTitle>
                    <CardDescription>
                      Analyse des performances financières
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          Revenus
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {formatEuro(dashboardStats.totalSales)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Coûts
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatEuro(dashboardStats.totalCost)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Marge Bénéficiaire
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {dashboardStats.averageMargin.toFixed(1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Rapport d'activité */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      Rapport d'Activité
                    </CardTitle>
                    <CardDescription>
                      Statistiques d'utilisation et performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Transactions totales
                        </span>
                        <span className="font-bold">
                          {dashboardStats.totalTransactions}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Produits vendus
                        </span>
                        <span className="font-bold">
                          {dashboardStats.totalQuantitySold}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Ticket moyen
                        </span>
                        <span className="font-bold">
                          {formatEuro(dashboardStats.averageTicket)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Produits en catalogue
                        </span>
                        <span className="font-bold">
                          {dashboardStats.totalProducts}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

// Ici on a ajouté l'export par défaut du composant
export default Dashboard;
