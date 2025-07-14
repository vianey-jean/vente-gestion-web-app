
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Search, AlertTriangle, TrendingUp, Archive, Sparkles, BarChart3 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import PremiumLoading from '@/components/ui/premium-loading';

const Inventaire: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  
  const { products, loading } = useApp();

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  // Filtrer et trier les produits
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'low_stock') {
        return matchesSearch && product.quantity <= 10;
      } else if (filterBy === 'out_of_stock') {
        return matchesSearch && product.quantity === 0;
      } else if (filterBy === 'good_stock') {
        return matchesSearch && product.quantity > 10;
      }
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'price':
          return b.price - a.price;
        case 'low_stock':
          return a.quantity - b.quantity;
        default:
          return 0;
      }
    });

  // Calculer les statistiques
  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, product) => sum + (product.price * product.quantity), 0),
    lowStockCount: products.filter(p => p.quantity > 0 && p.quantity <= 10).length,
    outOfStockCount: products.filter(p => p.quantity === 0).length
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Rupture</Badge>;
    } else if (quantity <= 5) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200"><AlertTriangle className="w-3 h-3 mr-1" />Critique</Badge>;
    } else if (quantity <= 10) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Faible</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><Package className="w-3 h-3 mr-1" />Bon</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <PremiumLoading 
          text="Chargement de l'Inventaire"
          size="md"
          variant="dashboard"
          showText={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-4">
              <Archive className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Inventaire des Produits
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gestion complète de votre stock et valorisation
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Stock optimisé</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-emerald-100">
              Références distinctes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <BarChart3 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-blue-100">
              Valorisation totale
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
            <p className="text-xs text-orange-100">
              Nécessitent un réappro
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ruptures</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStockCount}</div>
            <p className="text-xs text-red-100">
              Produits épuisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
              <Search className="h-4 w-4 text-white" />
            </div>
            Filtres & Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="good_stock">Stock suffisant</SelectItem>
                  <SelectItem value="low_stock">Stock faible</SelectItem>
                  <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom (A-Z)</SelectItem>
                  <SelectItem value="quantity">Quantité (↓)</SelectItem>
                  <SelectItem value="price">Prix (↓)</SelectItem>
                  <SelectItem value="low_stock">Stock critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-2">
              <Package className="h-4 w-4 text-white" />
            </div>
            Stock Détaillé
          </CardTitle>
          <CardDescription>
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
            {searchTerm && ` correspondant à "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-12 w-12 text-emerald-500" />
              </div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit en stock'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Essayez une autre recherche' : 'Commencez par ajouter des produits'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                    <TableHead className="font-bold">Produit</TableHead>
                    <TableHead className="font-bold">Description</TableHead>
                    <TableHead className="font-bold text-right">Quantité</TableHead>
                    <TableHead className="font-bold text-right">Prix Unitaire</TableHead>
                    <TableHead className="font-bold text-right">Valeur Stock</TableHead>
                    <TableHead className="font-bold">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full w-8 h-8 flex items-center justify-center">
                            <Package className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.description || 'Aucune description'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-3 py-1 rounded-full inline-block">
                          <span className="font-bold text-blue-700 dark:text-blue-400">
                            {product.quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {formatCurrency(product.price)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 px-3 py-1 rounded-full inline-block">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(product.price * product.quantity)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStockBadge(product.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventaire;
