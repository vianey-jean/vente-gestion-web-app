
/**
 * PAGE D'ACCUEIL PRINCIPALE
 * ========================
 * 
 * Cette page représente le tableau de bord principal de l'application.
 * Elle affiche un aperçu des statistiques clés, des actions rapides,
 * et un résumé des données importantes pour l'utilisateur.
 * 
 * Fonctionnalités :
 * - Affichage des statistiques de ventes
 * - Cartes de navigation rapide
 * - Graphiques de tendances
 * - Notifications et alertes
 * - Interface responsive
 * 
 * Structure :
 * - Header avec statistiques principales
 * - Grille de cartes d'actions
 * - Section graphiques et tendances
 * - Alertes et notifications
 */

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
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
  AlertTriangle,
  Star,
  Target,
  BarChart3,
  PieChart,
  ArrowRight,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import PremiumLoading from '@/components/ui/premium-loading';

const Home = () => {
  // Ici on attend l'initialisation des hooks et états
  const navigate = useNavigate();
  const { formatEuro } = useCurrencyFormatter();
  const { allSales, products, loading, refreshData } = useApp();
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ici on a ajouté l'état de chargement local pour les interactions
  const [localLoading, setLocalLoading] = useState(true);

  // Ici on attend l'effet pour simuler le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Ici on attend la fonction de rafraîchissement des données
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
  const stats = React.useMemo(() => {
    // Calcul du total des ventes
    const totalSales = allSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
    
    // Calcul du total des bénéfices
    const totalProfit = allSales.reduce((sum, sale) => sum + sale.profit, 0);
    
    // Calcul du nombre total de produits vendus
    const totalProductsSold = allSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
    
    // Calcul du nombre de produits en stock
    const totalProducts = products.length;
    
    // Calcul du stock total
    const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
    
    // Calcul de la marge moyenne
    const averageMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    // Ici on a ajouté le retour des statistiques calculées
    return {
      totalSales,
      totalProfit,
      totalProductsSold,
      totalProducts,
      totalStock,
      averageMargin
    };
  }, [allSales, products]);

  // Ici on attend la définition des cartes d'actions rapides
  const quickActions = [
    {
      title: "Nouvelle Vente",
      description: "Enregistrer une vente",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-500",
      action: () => navigate('/ventes'),
      badge: "Action"
    },
    {
      title: "Gérer Stock",
      description: "Inventaire et produits",
      icon: Package,
      color: "from-green-500 to-emerald-500",
      action: () => navigate('/inventaire'),
      badge: "Gestion"
    },
    {
      title: "Prêts Familles",
      description: "Suivi des prêts",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      action: () => navigate('/pret-familles'),
      badge: "Prêts"
    },
    {
      title: "Calculateur",
      description: "Calcul des bénéfices",
      icon: Target,
      color: "from-orange-500 to-red-500",
      action: () => navigate('/profit-calculator'),
      badge: "Calcul"
    },
    {
      title: "Tendances",
      description: "Analytics avancées",
      icon: TrendingUp,
      color: "from-indigo-500 to-purple-500",
      action: () => navigate('/tendances'),
      badge: "Analytics"
    },
    {
      title: "Rapports",
      description: "Vue d'ensemble détaillée",
      icon: BarChart3,
      color: "from-teal-500 to-cyan-500",
      action: () => navigate('/dashboard'),
      badge: "Rapports"
    }
  ];

  // Ici on attend l'affichage du composant de chargement
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
      {/* Ici on attend le conteneur principal avec fond dégradé */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          
          {/* Ici on a ajouté l'en-tête de bienvenue */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 border border-blue-200 dark:border-blue-800">
              <Star className="h-4 w-4 mr-2 animate-pulse" />
              Tableau de bord en temps réel
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Bienvenue sur votre Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Gérez vos ventes, suivez vos performances et optimisez votre business
            </p>
            
            {/* Ici on attend le bouton de rafraîchissement */}
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-4 btn-3d"
              variant="outline"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Actualisation..." : "Actualiser"}
            </Button>
          </div>

          {/* Ici on attend les cartes de statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Carte des ventes totales */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl card-3d">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEuro(stats.totalSales)}</div>
                <p className="text-xs text-blue-100">
                  {allSales.length} transactions
                </p>
                <div className="mt-2">
                  <Progress value={Math.min((stats.totalSales / 10000) * 100, 100)} className="bg-blue-400" />
                </div>
              </CardContent>
            </Card>

            {/* Carte des bénéfices */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-xl card-3d">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bénéfices</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEuro(stats.totalProfit)}</div>
                <p className="text-xs text-green-100">
                  Marge: {stats.averageMargin.toFixed(1)}%
                </p>
                <div className="mt-2">
                  <Progress value={Math.min(stats.averageMargin, 100)} className="bg-green-400" />
                </div>
              </CardContent>
            </Card>

            {/* Carte des produits vendus */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-xl card-3d">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits Vendus</CardTitle>
                <ShoppingCart className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProductsSold}</div>
                <p className="text-xs text-purple-100">
                  {stats.totalProducts} produits en stock
                </p>
                <div className="mt-2">
                  <Progress value={Math.min((stats.totalProductsSold / 1000) * 100, 100)} className="bg-purple-400" />
                </div>
              </CardContent>
            </Card>

            {/* Carte du stock total */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-xl card-3d">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
                <Package className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStock}</div>
                <p className="text-xs text-orange-100">
                  Produits disponibles
                </p>
                <div className="mt-2">
                  <Progress value={Math.min((stats.totalStock / 500) * 100, 100)} className="bg-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ici on attend les actions rapides */}
          <Card className={cn(
            "relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20",
            isMobile && "p-4"
          )}>
            {/* Arrière-plan avec dégradé */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Actions Rapides
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Accédez rapidement aux fonctionnalités principales
                  </p>
                </div>
                <Badge variant="secondary" className="hidden md:flex">
                  {quickActions.length} actions
                </Badge>
              </div>

              {/* Ici on attend la grille des actions rapides */}
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
              )}>
                {quickActions.map((action, index) => (
                  <Card 
                    key={index} 
                    className="group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer card-3d"
                    onClick={action.action}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-3 rounded-xl bg-gradient-to-r shadow-lg group-hover:scale-110 transition-transform duration-300",
                          action.color
                        )}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {action.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardTitle className="text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-sm mb-3">
                        {action.description}
                      </CardDescription>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        <span>Accéder</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Ici on attend la section des alertes si nécessaire */}
          {stats.totalStock < 50 && (
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-5 w-5" />
                  Alerte Stock Faible
                </CardTitle>
                <CardDescription>
                  Votre stock total est inférieur à 50 unités. Pensez à vous réapprovisionner.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Stock actuel: <span className="font-bold text-red-600">{stats.totalStock} unités</span>
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/inventaire')}
                    variant="destructive"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir l'inventaire
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ici on a ajouté la section de résumé rapide */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Résumé des performances */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Résumé des Performances
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble de vos activités récentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Ventes aujourd'hui</p>
                    <p className="text-lg font-bold text-blue-600">
                      {allSales.filter(sale => {
                        const today = new Date().toDateString();
                        return new Date(sale.date).toDateString() === today;
                      }).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Marge moyenne</span>
                    <span className="font-medium">{stats.averageMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Produits actifs</span>
                    <span className="font-medium">{stats.totalProducts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Stock moyen/produit</span>
                    <span className="font-medium">
                      {stats.totalProducts > 0 ? Math.round(stats.totalStock / stats.totalProducts) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions suggérées */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Actions Suggérées
                </CardTitle>
                <CardDescription>
                  Recommandations basées sur vos données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Suggestion conditionnelle basée sur les données */}
                {allSales.length === 0 && (
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Plus className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Enregistrer votre première vente
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Commencez à suivre vos performances
                      </p>
                    </div>
                  </div>
                )}
                
                {products.length === 0 && (
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Ajouter des produits à l'inventaire
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Gérez votre stock efficacement
                      </p>
                    </div>
                  </div>
                )}
                
                {stats.averageMargin > 0 && stats.averageMargin < 20 && (
                  <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Optimiser vos marges
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Marge actuelle: {stats.averageMargin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
                
                {allSales.length > 0 && products.length > 0 && (
                  <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Analyser vos tendances
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Découvrez des insights précieux
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Ici on a ajouté l'export par défaut du composant
export default Home;
