
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Users, Plus, Euro, Clock, CheckCircle, XCircle, AlertTriangle, Banknote, Sparkles, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/service/api';
import { useToast } from '@/hooks/use-toast';
import PremiumLoading from '@/components/ui/premium-loading';

interface PretFamille {
  id: string;
  nomEmprunteur: string;
  montant: number;
  dateEmprunt: string;
  dateRemboursement?: string;
  statut: 'en_cours' | 'rembourse' | 'en_retard';
  notes?: string;
  montantRembourse?: number;
  tauxInteret?: number;
}

const PretFamilles: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    nomEmprunteur: '',
    montant: '',
    notes: '',
    tauxInteret: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const { data: prets = [], isLoading: dataLoading } = useQuery<PretFamille[]>({
    queryKey: ['pretfamilles'],
    queryFn: () => api.get('/api/pretfamilles').then(res => res.data),
    enabled: !isLoading,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<PretFamille, 'id'>) => api.post('/api/pretfamilles', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pretfamilles'] });
      toast({
        title: "Prêt enregistré",
        description: "Le prêt familial a été ajouté avec succès.",
      });
      resetForm();
      setIsDialogOpen(false);
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
    mutationFn: ({ id, statut }: { id: string; statut: PretFamille['statut'] }) => {
      const updateData = {
        statut,
        ...(statut === 'rembourse' ? { dateRemboursement: new Date().toISOString() } : {})
      };
      return api.put(`/api/pretfamilles/${id}`, updateData).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pretfamilles'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut du prêt a été modifié.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nomEmprunteur: '',
      montant: '',
      notes: '',
      tauxInteret: ''
    });
    setSelectedDate(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomEmprunteur || !formData.montant || !selectedDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const pretData: Omit<PretFamille, 'id'> = {
      nomEmprunteur: formData.nomEmprunteur,
      montant: parseFloat(formData.montant),
      dateEmprunt: selectedDate.toISOString(),
      statut: 'en_cours',
      notes: formData.notes,
      tauxInteret: formData.tauxInteret ? parseFloat(formData.tauxInteret) : undefined
    };

    createMutation.mutate(pretData);
  };

  const getStatutBadge = (statut: PretFamille['statut']) => {
    switch (statut) {
      case 'rembourse':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />Remboursé</Badge>;
      case 'en_retard':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />En retard</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3 h-3 mr-1" />En cours</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  // Calculer les statistiques
  const stats = {
    totalPrets: prets.length,
    montantTotal: prets.reduce((sum, pret) => sum + pret.montant, 0),
    montantEnCours: prets.filter(p => p.statut !== 'rembourse').reduce((sum, pret) => sum + pret.montant, 0),
    montantRembourse: prets.filter(p => p.statut === 'rembourse').reduce((sum, pret) => sum + pret.montant, 0),
    nombreEnRetard: prets.filter(p => p.statut === 'en_retard').length
  };

  if (isLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <PremiumLoading 
          text="Chargement des Prêts Familles"
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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Prêts Familiaux
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gérez les prêts accordés à votre famille et amis
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Suivi en temps réel</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prêts</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrets}</div>
            <p className="text-xs text-blue-100">
              Prêts enregistrés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <Euro className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.montantTotal)}</div>
            <p className="text-xs text-emerald-100">
              Tous prêts confondus
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.montantEnCours)}</div>
            <p className="text-xs text-orange-100">
              À rembourser
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
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-2">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Nouveau Prêt
            </CardTitle>
            <CardDescription>Enregistrer un nouveau prêt familial</CardDescription>
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
                <Label htmlFor="montant">Montant du prêt (€) *</Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  value={formData.montant}
                  onChange={(e) => setFormData(prev => ({...prev, montant: e.target.value}))}
                  placeholder="0.00"
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
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: fr }) : <span>Sélectionner une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="taux">Taux d'intérêt (%) - Optionnel</Label>
                <Input
                  id="taux"
                  type="number"
                  step="0.1"
                  value={formData.tauxInteret}
                  onChange={(e) => setFormData(prev => ({...prev, tauxInteret: e.target.value}))}
                  placeholder="0.0"
                  className="mt-1"
                />
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
                <Banknote className="h-4 w-4 text-white" />
              </div>
              Liste des Prêts
            </CardTitle>
            <CardDescription>Historique et suivi de tous les prêts familiaux</CardDescription>
          </CardHeader>
          <CardContent>
            {prets.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun prêt enregistré</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Commencez par ajouter votre premier prêt familial</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                      <TableHead className="font-bold">Emprunteur</TableHead>
                      <TableHead className="font-bold">Montant</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prets.map((pret) => (
                      <TableRow key={pret.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium">{pret.nomEmprunteur}</TableCell>
                        <TableCell className="font-bold text-emerald-600">
                          {formatCurrency(pret.montant)}
                          {pret.tauxInteret && (
                            <div className="text-xs text-gray-500">
                              {pret.tauxInteret}% d'intérêt
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(pret.dateEmprunt)}</TableCell>
                        <TableCell>{getStatutBadge(pret.statut)}</TableCell>
                        <TableCell>
                          {pret.statut !== 'rembourse' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatutMutation.mutate({ id: pret.id, statut: 'rembourse' })}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Remboursé
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

export default PretFamilles;
