import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Fuel,
  Receipt,
  Plus,
  DollarSign,
  PiggyBank,
  BarChart3,
  Search,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import nouvelleAchatApiService from '@/services/api/nouvelleAchatApi';
import productApiService from '@/services/api/productApi';
import { ProductFormData } from '@/types/product';
import comptaApiService from '@/services/api/comptaApi';
import { NouvelleAchat, NouvelleAchatFormData, DepenseFormData, ComptabiliteData } from '@/types/comptabilite';
import { Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';

// Import des composants de graphiques stables
import { StableBarChart, StablePieChart } from './StableCharts';

interface ComptabiliteModuleProps {
  className?: string;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const ComptabiliteModule: React.FC<ComptabiliteModuleProps> = ({ className }) => {
  const { products, allSales, fetchProducts } = useApp();
  const { formatEuro } = useCurrencyFormatter();
  
  // États
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [achats, setAchats] = useState<NouvelleAchat[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAchatForm, setShowAchatForm] = useState(false);
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  
  // États du formulaire d'achat
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductList, setShowProductList] = useState(false);
  const [achatForm, setAchatForm] = useState<NouvelleAchatFormData>({
    productDescription: '',
    purchasePrice: 0,
    quantity: 0,
    fournisseur: '',
    caracteristiques: ''
  });
  
  // États du formulaire de dépense
  const [depenseForm, setDepenseForm] = useState<DepenseFormData>({
    description: '',
    montant: 0,
    type: 'autre_depense',
    categorie: 'divers'
  });

  // Ref pour éviter les appels multiples
  const loadingRef = useRef(false);

  // Filtrer les produits pour la recherche - mémorisé
  const filteredProducts = useMemo(() => {
    if (searchTerm.length < 3 || !showProductList) return [];
    return products.filter(p => 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products, showProductList]);

  // Charger les achats - mémorisé avec useCallback
  const loadAchats = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      const data = await nouvelleAchatApiService.getByMonthYear(selectedYear, selectedMonth);
      setAchats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadAchats();
  }, [loadAchats]);

  // Calculer les statistiques de comptabilité - mémorisé avec référence stable
  const comptabiliteData = useMemo<ComptabiliteData>(() => {
    // Ventes du mois
    const monthlySales = allSales.filter(sale => {
      const date = new Date(sale.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });

    const salesTotal = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalSellingPrice || 0);
      }
      return sum + (sale.sellingPrice * sale.quantitySold);
    }, 0);

    const salesCost = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalPurchasePrice || 0);
      }
      return sum + (sale.purchasePrice * sale.quantitySold);
    }, 0);

    const salesProfit = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalProfit || 0);
      }
      return sum + sale.profit;
    }, 0);

    const salesCount = monthlySales.length;

    // Achats/dépenses du mois
    const achatsProducts = achats.filter(a => a.type === 'achat_produit');
    const depenses = achats.filter(a => a.type !== 'achat_produit');

    const achatsTotal = achatsProducts.reduce((sum, a) => sum + a.totalCost, 0);
    const depensesTotal = depenses.reduce((sum, a) => sum + a.totalCost, 0);

    // Bénéfice réel = Bénéfice des ventes - (Achats + Dépenses)
    const beneficeReel = salesProfit - (achatsTotal + depensesTotal);

    // Solde Débit/Crédit
    const totalCredit = salesTotal;
    const totalDebit = achatsTotal + depensesTotal;
    const soldeNet = totalCredit - totalDebit;

    return {
      salesTotal,
      salesProfit,
      salesCost,
      salesCount,
      achatsTotal,
      depensesTotal,
      beneficeReel,
      totalDebit,
      totalCredit,
      soldeNet
    };
  }, [allSales, achats, selectedMonth, selectedYear]);

  // Sauvegarder les données de comptabilité dans la base de données
  const saveComptaData = useCallback(async () => {
    try {
      console.log(`💾 Saving compta data for ${selectedMonth}/${selectedYear}...`);
      await comptaApiService.calculateMonth(selectedYear, selectedMonth);
      console.log('✅ Compta data saved successfully');
    } catch (error) {
      console.error('❌ Error saving compta data:', error);
    }
  }, [selectedMonth, selectedYear]);

  // Sauvegarder les données de comptabilité chaque fois que les données changent
  useEffect(() => {
    if (comptabiliteData && (comptabiliteData.salesCount > 0 || achats.length > 0)) {
      saveComptaData();
    }
  }, [comptabiliteData, achats.length, saveComptaData]);

  // Données pour les graphiques mensuels - STABLE et MÉMORISÉ
  const monthlyChartData = useMemo(() => {
    const data = [];
    for (let i = 1; i <= 12; i++) {
      const monthSales = allSales.filter(sale => {
        const date = new Date(sale.date);
        return date.getMonth() + 1 === i && date.getFullYear() === selectedYear;
      });

      const profit = monthSales.reduce((sum, sale) => {
        if (sale.products && Array.isArray(sale.products)) {
          return sum + (sale.totalProfit || 0);
        }
        return sum + sale.profit;
      }, 0);

      const monthAchats = achats.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() + 1 === i;
      });

      const depenses = monthAchats.reduce((sum, a) => sum + a.totalCost, 0);
      const beneficeReel = profit - depenses;

      data.push({
        name: MONTHS[i - 1].slice(0, 3),
        beneficeVentes: profit,
        depenses: depenses,
        beneficeReel: beneficeReel
      });
    }
    return data;
  }, [allSales, achats, selectedYear]);

  // Répartition des dépenses - STABLE
  const depensesRepartition = useMemo(() => {
    const byType: Record<string, number> = {};
    achats.forEach(a => {
      const label = a.type === 'achat_produit' ? 'Achats Produits' : 
                   a.type === 'taxes' ? 'Taxes' :
                   a.type === 'carburant' ? 'Carburant' : 'Autres';
      byType[label] = (byType[label] || 0) + a.totalCost;
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [achats]);

  // Handlers mémorisés
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.description);
    setShowProductList(false); // Cacher la liste après sélection
    // Ne pas pré-remplir les champs prix et quantité - on les laisse vides
    // L'utilisateur doit entrer une nouvelle quantité obligatoirement
    // Le prix d'achat est optionnel (peut garder l'ancien)
    setAchatForm(prev => ({
      ...prev,
      productId: product.id,
      productDescription: product.description,
      purchasePrice: 0, // Vide - le nouveau prix est optionnel
      quantity: 0, // Vide - l'utilisateur doit saisir une nouvelle quantité
      fournisseur: prev.fournisseur || '',
      caracteristiques: prev.caracteristiques || product.description
    }));
  }, []);

  const handleSubmitAchat = useCallback(async () => {
    try {
      // Validation: description et quantité obligatoires, prix optionnel
      if (!achatForm.productDescription || achatForm.quantity <= 0) {
        toast({
          title: 'Erreur',
          description: 'Veuillez remplir la description et la quantité',
          variant: 'destructive'
        });
        return;
      }

      // Déterminer le prix d'achat final
      const finalPurchasePrice = achatForm.purchasePrice > 0 
        ? achatForm.purchasePrice 
        : (selectedProduct?.purchasePrice || 0);

      // Si un produit existant est sélectionné, mettre à jour products.json
      if (selectedProduct) {
        const updateData: Partial<ProductFormData> = {
          quantity: selectedProduct.quantity + achatForm.quantity // Ajouter la nouvelle quantité
        };
        
        // Si un nouveau prix est saisi, l'enregistrer aussi
        if (achatForm.purchasePrice > 0) {
          updateData.purchasePrice = achatForm.purchasePrice;
        }
        
        await productApiService.update(selectedProduct.id, updateData);
        console.log('✅ Product updated in products.json:', updateData);
      }

      // Créer l'entrée dans compta avec le prix final
      await nouvelleAchatApiService.create({
        ...achatForm,
        purchasePrice: finalPurchasePrice
      });
      
      toast({
        title: 'Succès',
        description: selectedProduct 
          ? `Stock mis à jour: +${achatForm.quantity} unités${achatForm.purchasePrice > 0 ? `, nouveau prix: ${formatEuro(achatForm.purchasePrice)}` : ''}`
          : 'Achat enregistré avec succès'
      });
      
      setAchatForm({
        productDescription: '',
        purchasePrice: 0,
        quantity: 0,
        fournisseur: '',
        caracteristiques: ''
      });
      setSelectedProduct(null);
      setSearchTerm('');
      setShowProductList(false);
      setShowAchatForm(false);
      
      loadAchats();
      fetchProducts();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer l\'achat',
        variant: 'destructive'
      });
    }
  }, [achatForm, selectedProduct, loadAchats, fetchProducts, formatEuro]);

  const handleSubmitDepense = useCallback(async () => {
    try {
      if (!depenseForm.description || depenseForm.montant <= 0) {
        toast({
          title: 'Erreur',
          description: 'Veuillez remplir tous les champs obligatoires',
          variant: 'destructive'
        });
        return;
      }

      await nouvelleAchatApiService.addDepense(depenseForm);
      
      toast({
        title: 'Succès',
        description: 'Dépense enregistrée avec succès'
      });
      
      setDepenseForm({
        description: '',
        montant: 0,
        type: 'autre_depense',
        categorie: 'divers'
      });
      setShowDepenseForm(false);
      
      loadAchats();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la dépense',
        variant: 'destructive'
      });
    }
  }, [depenseForm, loadAchats]);

  // Handlers pour les Select - mémorisés
  const handleMonthChange = useCallback((v: string) => {
    setSelectedMonth(parseInt(v));
  }, []);

  const handleYearChange = useCallback((v: string) => {
    setSelectedYear(parseInt(v));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowProductList(value.length >= 3); // Afficher la liste si 3+ caractères
    if (value.length < 3) {
      setSelectedProduct(null);
    }
  }, []);

  const handleAchatFormChange = useCallback((field: keyof NouvelleAchatFormData, value: string | number) => {
    setAchatForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDepenseFormChange = useCallback((field: keyof DepenseFormData, value: string | number) => {
    setDepenseForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec sélection de période */}
      <Card className="bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-green-900/40 border-emerald-500/30 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
              Module Comptabilité
            </CardTitle>
          </div>
          <CardDescription className="text-black-300 text-lg">
            Gérez vos achats, dépenses et analysez votre rentabilité
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Select  value={selectedMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-40 bg-white/10  border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='text-red-800'>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => setShowAchatForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Nouvel Achat
            </Button>
            
            <Button
              onClick={() => setShowDepenseForm(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Nouvelle Dépense
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400 font-medium">Total Crédit</p>
                <p className="text-2xl font-bold text-green-300">{formatEuro(comptabiliteData.totalCredit)}</p>
                <p className="text-xs text-green-400/70">Argent entrant</p>
              </div>
              <ArrowUpCircle className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400 font-medium">Total Débit</p>
                <p className="text-2xl font-bold text-red-300">{formatEuro(comptabiliteData.totalDebit)}</p>
                <p className="text-xs text-red-400/70">Argent sortant</p>
              </div>
              <ArrowDownCircle className="h-10 w-10 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400 font-medium">Bénéfice Ventes</p>
                <p className="text-2xl font-bold text-blue-300">{formatEuro(comptabiliteData.salesProfit)}</p>
                <p className="text-xs text-blue-400/70">{comptabiliteData.salesCount} ventes</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-br ${comptabiliteData.beneficeReel >= 0 ? 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30' : 'from-red-500/20 to-rose-600/20 border-red-500/30'} shadow-xl`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-400' : 'text-red-400'} font-medium`}>Bénéfice Réel</p>
                <p className={`text-2xl font-bold ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {formatEuro(comptabiliteData.beneficeReel)}
                </p>
                <p className={`text-xs ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>Après dépenses</p>
              </div>
              <Wallet className={`h-10 w-10 ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails des dépenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-400 font-medium">Achats Produits</p>
                <p className="text-xl font-bold text-indigo-300">{formatEuro(comptabiliteData.achatsTotal)}</p>
              </div>
              <Package className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 border-orange-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-400 font-medium">Autres Dépenses</p>
                <p className="text-xl font-bold text-orange-300">{formatEuro(comptabiliteData.depensesTotal)}</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/30 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400 font-medium">Solde Net</p>
                <p className={`text-xl font-bold ${comptabiliteData.soldeNet >= 0 ? 'text-cyan-600' : 'text-red-300'}`}>
                  {formatEuro(comptabiliteData.soldeNet)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <Tabs defaultValue="evolution" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-2 bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-xl h-auto p-2">
          <TabsTrigger value="evolution" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold h-12">
            <BarChart3 className="h-4 w-4 mr-2" />
            Évolution Mensuelle
          </TabsTrigger>
          <TabsTrigger value="repartition" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold h-12">
            <Calculator className="h-4 w-4 mr-2" />
            Répartition Dépenses
          </TabsTrigger>
          <TabsTrigger value="historique" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold h-12">
            <Receipt className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">Évolution Mensuelle {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <StableBarChart 
                data={monthlyChartData} 
                formatEuro={formatEuro}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repartition" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">Répartition des Dépenses - {MONTHS[selectedMonth - 1]} {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              {depensesRepartition.length > 0 ? (
                <StablePieChart 
                  data={depensesRepartition} 
                  formatEuro={formatEuro}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Aucune dépense enregistrée pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historique" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">Historique des Achats et Dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              {achats.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {achats.map((achat) => (
                    <div key={achat.id} className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          achat.type === 'achat_produit' ? 'bg-blue-500/20' :
                          achat.type === 'taxes' ? 'bg-red-500/20' :
                          achat.type === 'carburant' ? 'bg-orange-500/20' : 'bg-purple-500/20'
                        }`}>
                          {achat.type === 'achat_produit' ? <Package className="h-5 w-5 text-blue-400" /> :
                           achat.type === 'taxes' ? <Receipt className="h-5 w-5 text-red-400" /> :
                           achat.type === 'carburant' ? <Fuel className="h-5 w-5 text-orange-400" /> :
                           <DollarSign className="h-5 w-5 text-purple-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {achat.productDescription || achat.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(achat.date).toLocaleDateString('fr-FR')}
                            {achat.fournisseur && ` • ${achat.fournisseur}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-400">-{formatEuro(achat.totalCost)}</p>
                        {achat.quantity && (
                          <Badge variant="outline" className="mt-1">
                            Qté: {achat.quantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Aucun achat ou dépense pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Formulaire Achat */}
      <Dialog open={showAchatForm} onOpenChange={setShowAchatForm}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              Nouvel Achat Produit
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Enregistrez un nouvel achat de produit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Recherche de produit */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                <Search className="h-4 w-4 inline mr-2" />
                Rechercher un produit
              </Label>
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Tapez au moins 3 caractères..."
                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600"
                />
                {filteredProducts.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium">{product.description}</span>
                        <Badge variant="outline">{formatEuro(product.purchasePrice)}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedProduct && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {selectedProduct.description} sélectionné
                </Badge>
              )}
            </div>

            {/* Description produit (si nouveau) */}
            {!selectedProduct && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Ou créer un nouveau produit
                </Label>
                <Input
                  value={achatForm.productDescription}
                  onChange={(e) => handleAchatFormChange('productDescription', e.target.value)}
                  placeholder="Description du produit"
                  className="bg-white/80 dark:bg-gray-800/80"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Prix d'achat */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Prix d'achat (€)
                  </Label>
                  {selectedProduct && (
                    <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-700 flex items-center gap-1">
                      Actuel: {formatEuro(selectedProduct.purchasePrice)}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={achatForm.purchasePrice || ''}
                  onChange={(e) => handleAchatFormChange('purchasePrice', parseFloat(e.target.value) || 0)}
                  placeholder={selectedProduct ? "Nouveau prix (optionnel)" : "Prix d'achat"}
                  className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl text-lg font-medium shadow-sm transition-all duration-200"
                />
                {selectedProduct && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    💡 Laissez vide pour garder le prix actuel
                  </p>
                )}
              </div>
              
              {/* Quantité */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    Quantité à ajouter *
                  </Label>
                  {selectedProduct && (
                    <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-700 flex items-center gap-1">
                      Stock: {selectedProduct.quantity}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  min="1"
                  value={achatForm.quantity || ''}
                  onChange={(e) => handleAchatFormChange('quantity', parseInt(e.target.value) || 0)}
                  placeholder="Quantité à ajouter"
                  className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-lg font-medium shadow-sm transition-all duration-200"
                />
                {selectedProduct && achatForm.quantity > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Nouveau stock: {selectedProduct.quantity + achatForm.quantity} unités
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                  Fournisseur
                </Label>
                <Input
                  value={achatForm.fournisseur || ''}
                  onChange={(e) => handleAchatFormChange('fournisseur', e.target.value)}
                  placeholder="Nom du fournisseur"
                  className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium shadow-sm transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-indigo-500" />
                  Caractéristiques
                </Label>
                <Textarea
                  value={achatForm.caracteristiques || ''}
                  onChange={(e) => handleAchatFormChange('caracteristiques', e.target.value)}
                  placeholder="Caractéristiques du produit..."
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl font-medium shadow-sm transition-all duration-200 resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Résumé du coût */}
            {achatForm.quantity > 0 && (
              <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/30 shadow-lg">
                <CardContent className="pt-5 pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-emerald-600" />
                      <span className="font-bold text-gray-800 dark:text-gray-100">Coût total de cet achat:</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatEuro((achatForm.purchasePrice > 0 ? achatForm.purchasePrice : (selectedProduct?.purchasePrice || 0)) * achatForm.quantity)}
                    </span>
                  </div>
                  {selectedProduct && achatForm.purchasePrice === 0 && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      * Calculé avec le prix actuel du produit
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => setShowAchatForm(false)}
              className="h-12 px-6 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitAchat}
              disabled={!achatForm.productDescription || achatForm.quantity <= 0}
              className="h-12 px-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white shadow-xl rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Enregistrer l'achat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Formulaire Dépense */}
      <Dialog open={showDepenseForm} onOpenChange={setShowDepenseForm}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white via-orange-50/30 to-red-50/50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 shadow-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              Nouvelle Dépense
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Enregistrez une nouvelle dépense (taxes, carburant, autres)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Type de dépense</Label>
              <Select
                value={depenseForm.type}
                onValueChange={(v) => handleDepenseFormChange('type', v)}
              >
                <SelectTrigger className="bg-white/80 dark:bg-gray-800/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="taxes">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" /> Taxes
                    </div>
                  </SelectItem>
                  <SelectItem value="carburant">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4" /> Carburant
                    </div>
                  </SelectItem>
                  <SelectItem value="autre_depense">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Autre
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Description</Label>
              <Input
                value={depenseForm.description}
                onChange={(e) => handleDepenseFormChange('description', e.target.value)}
                placeholder="Description de la dépense"
                className="bg-white/80 dark:bg-gray-800/80"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Montant (€)</Label>
              <Input
                type="number"
                value={depenseForm.montant || ''}
                onChange={(e) => handleDepenseFormChange('montant', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="bg-white/80 dark:bg-gray-800/80"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Catégorie (optionnel)</Label>
              <Input
                value={depenseForm.categorie || ''}
                onChange={(e) => handleDepenseFormChange('categorie', e.target.value)}
                placeholder="Ex: Transport, Fournitures..."
                className="bg-white/80 dark:bg-gray-800/80"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowDepenseForm(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitDepense}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer la dépense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComptabiliteModule;
