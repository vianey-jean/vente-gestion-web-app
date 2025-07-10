import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, Wallet, CreditCard, Plus, ArrowUp, ArrowDown, Receipt, HandCoins, DollarSign, Sparkles, Award, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pretProduitService } from '@/service/api';
import { PretProduit } from '@/types';

const PretProduits: React.FC = () => {
  const [prets, setPrets] = useState<PretProduit[]>([]);
  const [loading, setLoading] = useState(false);
  const [demandePretDialogOpen, setDemandePretDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [nouvNom, setNouvNom] = useState('');
  const [nouvPhone, setNouvPhone] = useState('');
  const [nouvPrixVente, setNouvPrixVente] = useState('');
  const [nouvAvanceRecue, setNouvAvanceRecue] = useState('');
  const [nouvDate, setNouvDate] = useState<Date>(new Date());
  
  const { toast } = useToast();

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchPrets = async () => {
      try {
        setLoading(true);
        const data = await pretProduitService.getPretProduits();
        setPrets(data);
      } catch (error) {
        console.error('Erreur lors du chargement des prêts', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les prêts produits',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrets();
  }, [toast]);

  // Enregistrer une nouvelle demande de prêt
  const handleDemandePret = async () => {
    if (!nouvNom || !nouvPhone || !nouvPrixVente || !nouvAvanceRecue) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const newPret: Omit<PretProduit, 'id'> = {
        date: format(nouvDate, 'yyyy-MM-dd'),
        productId: selectedProduct?.id || '',
        description: selectedProduct?.description || '',
        quantityBorrowed: 1,
        borrowerName: nouvNom,
        dueDate: format(nouvDate, 'yyyy-MM-dd'),
        returned: false,
        // Propriétés supplémentaires
        datePaiement: format(nouvDate, 'yyyy-MM-dd'),
        nom: nouvNom,
        phone: nouvPhone,
        prixVente: parseFloat(nouvPrixVente),
        avanceRecue: parseFloat(nouvAvanceRecue),
        reste: parseFloat(nouvPrixVente) - parseFloat(nouvAvanceRecue),
        estPaye: parseFloat(nouvAvanceRecue) >= parseFloat(nouvPrixVente)
      };
      
      // Enregistrer via l'API
      await pretProduitService.addPretProduit(newPret);
      
      // Recharger les données
      const updatedPrets = await pretProduitService.getPretProduits();
      setPrets(updatedPrets);
      
      toast({
        title: 'Succès',
        description: 'Demande de prêt enregistrée avec succès',
        variant: 'default',
        className: 'notification-success',
      });
      
      // Réinitialiser le formulaire
      setNouvNom('');
      setNouvPhone('');
      setNouvPrixVente('');
      setNouvAvanceRecue('');
      setSelectedProduct(null);
      setSearchQuery('');
      setNouvDate(new Date());
      setDemandePretDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la demande de prêt', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la demande de prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Header avec design luxueux */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <HandCoins className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Prêts aux Produits</h2>
              <p className="text-white/80 text-lg">Gestion premium des prêts produits</p>
            </div>
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setDemandePretDialogOpen(true)} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Prêt
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau modernisé */}
      <Card className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full p-6">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Chargement des données...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Veuillez patienter</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-none hover:bg-gradient-to-r">
                    <TableHead className="font-bold text-indigo-600 dark:text-indigo-400 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-4 w-4" />
                        Nom
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center justify-end gap-2">
                        <CreditCard className="h-4 w-4" />
                        Prêt Total
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Solde Restant
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Dernier Remboursement
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center justify-end gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Date
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prets.map((pret, index) => (
                    <TableRow 
                      key={pret.id} 
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 border-b border-gray-100/50 dark:border-gray-700/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full w-10 h-10 flex items-center justify-center">
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{pret.nom}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 px-4 py-2 rounded-full inline-block">
                          <CreditCard className="inline-block mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-bold text-blue-700 dark:text-blue-300">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.prixVente)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 px-4 py-2 rounded-full inline-block">
                          <ArrowDown className="inline-block mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="font-bold text-red-700 dark:text-red-300">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.reste)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 px-4 py-2 rounded-full inline-block">
                          <ArrowUp className="inline-block mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.dernierRemboursement)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{pret.dateRemboursement}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Ligne des totaux avec design premium */}
                  <TableRow className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white border-none">
                    <TableCell className="bg-transparent">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5" />
                        <span className="font-bold text-lg">TOTAL</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right bg-transparent">
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                        <span className="font-bold text-lg text-blue-200">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prets.reduce((sum, pret) => sum + pret.prixVente, 0))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right bg-transparent">
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                        <span className="font-bold text-lg text-red-200">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prets.reduce((sum, pret) => sum + pret.reste, 0))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell colSpan={2} className="bg-transparent"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
      
      {/* Formulaire de demande de prêt */}
      <Dialog open={demandePretDialogOpen} onOpenChange={setDemandePretDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-2">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              Enregistrer une demande de prêt
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="nouvNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom de la famille</Label>
              <Input 
                id="nouvNom" 
                value={nouvNom} 
                onChange={(e) => setNouvNom(e.target.value)}
                placeholder="Nom de la famille"
                className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="nouvPretTotal" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Montant du prêt</Label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <Input 
                  id="nouvPretTotal" 
                  type="number" 
                  value={nouvPrixVente} 
                  onChange={(e) => setNouvPrixVente(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="nouvDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 hover:bg-white/70 transition-all duration-200",
                      !nouvDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-purple-500" />
                    {nouvDate ? format(nouvDate, 'PP', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={nouvDate}
                    onSelect={(date) => date && setNouvDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={handleDemandePret} 
              disabled={loading || !nouvNom || !nouvPrixVente || parseFloat(nouvPrixVente) <= 0}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Enregistrer la demande de prêt
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PretProduits;
