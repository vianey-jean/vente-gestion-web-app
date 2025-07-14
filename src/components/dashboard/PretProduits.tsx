
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Package, Plus, CheckCircle, XCircle, AlertTriangle, Clock, Sparkles, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/service/api';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import PremiumLoading from '@/components/ui/premium-loading';

interface PretProduit {
  id: string;
  nomEmprunteur: string;
  produitId: string;
  nomProduit: string;
  quantite: number;
  datePret: string;
  dateRetourPrevue: string;
  dateRetourEffective?: string;
  statut: 'en_cours' | 'retourne' | 'en_retard';
  notes?: string;
}

const PretProduits: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDatePret, setSelectedDatePret] = useState<Date>();
  const [selectedDateRetour, setSelectedDateRetour] = useState<Date>();
  const [formData, setFormData] = useState({
    nomEmprunteur: '',
    produitId: '',
    quantite: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { products } = useApp();

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  const { data: prets = [], isLoading: dataLoading } = useQuery<PretProduit[]>({
    queryKey: ['pretproduits'],
    queryFn: () => api.get('/api/pretproduits').then(res => res.data),
    enabled: !isLoading,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<PretProduit, 'id'>) => api.post('/api/pretproduits', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pretproduits'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Prêt enregistré",
        description: "Le prêt de produit a été ajouté avec succès.",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    }
  });

  const updateStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: PretProduit['statut'] }) => {
      const updateData = {
        statut,
        ...(statut === 'retourne' ? { dateRetourEffective: new Date().toISOString() } : {})
      };
      return api.put(`/api/pretproduits/${id}`, updateData).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pretproduits'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut du prêt a été modifié.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nomEmprunteur: '',
      produitId: '',
      quantite: '',
      notes: ''
    });
    setSelectedDatePret(undefined);
    setSelectedDateRetour(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomEmprunteur || !formData.produitId || !formData.quantite || !selectedDatePret || !selectedDateRetour) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const selectedProduct = products.find(p => p.id === formData.produitId);
    if (!selectedProduct) {
      toast({
        title: "Erreur",
        description: "Produit non trouvé.",
        variant: "destructive",
      });
      return;
    }

    const pretData: Omit<PretProduit, 'id'> = {
      nomEmprunteur: formData.nomEmprunteur,
      produitId: formData.produitId,
      nomProduit: selectedProduct.name,
      quantite: parseInt(formData.quantite),
      datePret: selectedDatePret.toISOString(),
      dateRetourPrevue: selectedDateRetour.toISOString(),
      statut: 'en_cours',
      notes: formData.notes
    };

    createMutation.mutate(pretData);
  };

  const getStatutBadge = (statut: PretProduit['statut']) => {
    switch (statut) {
      case 'retourne':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />Retourné</Badge>;
      case 'en_retard':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />En retard</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3 h-3 mr-1" />En cours</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  // Calculer les statistiques
  const stats = {
    totalPrets: prets.length,
    produitsEnCours: prets.filter(p => p.statut === 'en_cours').reduce((sum, pret) => sum + pret.quantite, 0),
    produitsRetournes: prets.filter(p => p.statut === 'retourne').reduce((sum, pret) => sum + pret.quantite, 0),
    nombreEnRetard: prets.filter(p => p.statut === 'en_retard').length
  };

  if (isLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <PremiumLoading 
          text="Chargement des Prêts Produits"
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
      <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Prêts de Produits
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Suivez les produits prêtés et leur retour
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Gestion optimisée</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prêts</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrets}</div>
            <p className="text-xs text-purple-100">
              Prêts enregistrés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.produitsEnCours}</div>
            <p className="text-xs text-blue-100">
              Produits prêtés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retournés</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.produitsRetournes}</div>
            <p className="text-xs text-emerald-100">
              Produits récupérés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nombreEnRetard}</div>
            <p className="text-xs text-red-100">
              Nécessitent un suivi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire d'ajout */}
        <Card className="lg:col-span-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Nouveau Prêt
            </CardTitle>
            <CardDescription>Enregistrer un nouveau prêt de produit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'emprunteur *</Label>
                <Input
                  id="nom"
                  value={formData.nomEmprunteur}
                  onChange={(e) => setFormData(prev => ({...prev, nomEmprunteur: e.target.value}))}
                  placeholder="Nom complet"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="produit">Produit *</Label>
                <Select value={formData.produitId} onValueChange={(value) => setFormData(prev => ({...prev, produitId: value}))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Stock: {product.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantite">Quantité *</Label>
                <Input
                  id="quantite"
                  type="number"
                  min="1"
                  value={formData.quantite}
                  onChange={(e) => setFormData(prev => ({...prev, quantite: e.target.value}))}
                  placeholder="1"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Date du prêt *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !selectedDatePret && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDatePret ? format(selectedDatePret, "dd/MM/yyyy", { locale: fr }) : <span>Date du prêt</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDatePret}
                      onSelect={setSelectedDatePret}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Date de retour prévue *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !selectedDateRetour && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDateRetour ? format(selectedDateRetour, "dd/MM/yyyy", { locale: fr }) : <span>Date de retour</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDateRetour}
                      onSelect={setSelectedDateRetour}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Informations complémentaires..."
                  className="mt-1"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer le Prêt'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des prêts */}
        <Card className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-2">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              Liste des Prêts
            </CardTitle>
            <CardDescription>Historique et suivi de tous les prêts de produits</CardDescription>
          </CardHeader>
          <CardContent>
            {prets.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-12 w-12 text-purple-500" />
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun prêt enregistré</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Commencez par ajouter votre premier prêt de produit</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                      <TableHead className="font-bold">Emprunteur</TableHead>
                      <TableHead className="font-bold">Produit</TableHead>
                      <TableHead className="font-bold">Quantité</TableHead>
                      <TableHead className="font-bold">Date Prêt</TableHead>
                      <TableHead className="font-bold">Retour Prévu</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prets.map((pret) => (
                      <TableRow key={pret.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium">{pret.nomEmprunteur}</TableCell>
                        <TableCell>{pret.nomProduit}</TableCell>
                        <TableCell className="font-bold text-purple-600">{pret.quantite}</TableCell>
                        <TableCell>{formatDate(pret.datePret)}</TableCell>
                        <TableCell>{formatDate(pret.dateRetourPrevue)}</TableCell>
                        <TableCell>{getStatutBadge(pret.statut)}</TableCell>
                        <TableCell>
                          {pret.statut !== 'retourne' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatutMutation.mutate({ id: pret.id, statut: 'retourne' })}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Retourné
                              </Button>
                              {pret.statut !== 'en_retard' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatutMutation.mutate({ id: pret.id, statut: 'en_retard' })}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  En retard
                                </Button>
                              )}
                            </div>
                          )}
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
    </div>
  );
};

export default PretProduits;
