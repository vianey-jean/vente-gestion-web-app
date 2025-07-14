import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ModernContainer } from '@/components/dashboard/forms/ModernContainer';
import { ModernCard } from '@/components/dashboard/forms/ModernCard';
import { ModernButton } from '@/components/dashboard/forms/ModernButton';
import { toast } from '@/hooks/use-toast';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Phone
} from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

const PretProduits: React.FC = () => {
  const { pretProduits, products, addPretProduit, updatePretProduit, deletePretProduit } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPretProduit, setSelectedPretProduit] = useState<any>(null);
  const [nom, setNom] = useState('');
  const [productId, setProductId] = useState('');
  const [montant, setMontant] = useState('');
  const [datePret, setDatePret] = useState('');
  const [dateRetour, setDateRetour] = useState('');
  const [telephone, setTelephone] = useState('');
  const [nomClient, setNomClient] = useState('');

  const handleAddClick = () => {
    setIsAdding(true);
    setNom('');
    setProductId('');
    setMontant('');
    setDatePret('');
    setDateRetour('');
    setTelephone('');
    setNomClient('');
  };

  const handleEditClick = (pretProduit: any) => {
    setIsEditing(true);
    setSelectedPretProduit(pretProduit);
    setNom(pretProduit.nom);
    setProductId(pretProduit.productId);
    setMontant(pretProduit.montant);
    setDatePret(pretProduit.datePret);
    setDateRetour(pretProduit.dateRetour);
    setTelephone(pretProduit.telephone);
    setNomClient(pretProduit.nomClient);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setSelectedPretProduit(null);
    setNom('');
    setProductId('');
    setMontant('');
    setDatePret('');
    setDateRetour('');
    setTelephone('');
    setNomClient('');
  };

  const handleAddPretProduit = async () => {
    if (!nom || !productId || !montant || !datePret || !dateRetour || !telephone || !nomClient) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPretProduit({
        nom,
        productId,
        montant: parseFloat(montant),
        datePret,
        dateRetour,
        telephone,
        nomClient
      });
      toast({
        title: "Succès",
        description: "Prêt de produit ajouté avec succès.",
      });
      setIsAdding(false);
      setNom('');
      setProductId('');
      setMontant('');
      setDatePret('');
      setDateRetour('');
      setTelephone('');
      setNomClient('');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout du prêt de produit.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePretProduit = async () => {
    if (!nom || !productId || !montant || !datePret || !dateRetour || !telephone || !nomClient) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPretProduit) {
      toast({
        title: "Erreur",
        description: "Aucun prêt de produit sélectionné pour la mise à jour.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePretProduit(selectedPretProduit.id, {
        nom,
        productId,
        montant: parseFloat(montant),
        datePret,
        dateRetour,
        telephone,
        nomClient
      });
      toast({
        title: "Succès",
        description: "Prêt de produit mis à jour avec succès.",
      });
      setIsEditing(false);
      setSelectedPretProduit(null);
      setNom('');
      setProductId('');
      setMontant('');
      setDatePret('');
      setDateRetour('');
      setTelephone('');
      setNomClient('');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du prêt de produit.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deletePretProduit(id);
      toast({
        title: "Succès",
        description: "Prêt de produit supprimé avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du prêt de produit.",
        variant: "destructive",
      });
    }
  };

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PremiumLoading 
        text="Chargement des Prêts Produits"
        size="md"
        variant="dashboard"
        showText={true}
      />
    );
  }

  return (
    <ModernContainer>
      <ModernCard>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Package className="mr-2 h-5 w-5 text-gray-500" />
            Prêts de Produits
          </CardTitle>
          <ModernButton onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </ModernButton>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {pretProduits.length === 0 ? (
              <div className="text-center py-4">
                <AlertTriangle className="mx-auto h-6 w-6 text-gray-500" />
                <p className="text-sm text-gray-500">Aucun prêt de produit enregistré.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pretProduits.map((pretProduit: any) => (
                  <Card key={pretProduit.id} className="bg-white shadow-md rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">{pretProduit.nom}</CardTitle>
                        <CardDescription className="text-gray-500">
                          Client: {pretProduit.nomClient} - Tél: {pretProduit.telephone}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <ModernButton size="sm" onClick={() => handleEditClick(pretProduit)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </ModernButton>
                        <ModernButton size="sm" variant="destructive" onClick={() => handleDeleteClick(pretProduit.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </ModernButton>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary">Montant: {pretProduit.montant} €</Badge>
                      <Badge variant="outline" className="ml-2">
                        Prévu pour le: {new Date(pretProduit.dateRetour).toLocaleDateString()}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </ModernCard>

      {(isAdding || isEditing) && (
        <ModernCard>
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              {isAdding ? 'Ajouter un Prêt de Produit' : 'Modifier un Prêt de Produit'}
            </CardTitle>
            <CardDescription>
              {isAdding ? 'Enregistrez un nouveau prêt de produit' : 'Modifiez les détails du prêt de produit sélectionné'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nom">Nom du prêt</Label>
                <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="nomClient">Nom du Client</Label>
                <Input id="nomClient" value={nomClient} onChange={(e) => setNomClient(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone du Client</Label>
                <Input type="tel" id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="productId">Produit</Label>
                <Select value={productId} onValueChange={(value) => setProductId(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="montant">Montant (€)</Label>
                <Input type="number" id="montant" value={montant} onChange={(e) => setMontant(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="datePret">Date du prêt</Label>
                <Input type="date" id="datePret" value={datePret} onChange={(e) => setDatePret(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="dateRetour">Date de retour prévue</Label>
                <Input type="date" id="dateRetour" value={dateRetour} onChange={(e) => setDateRetour(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <ModernButton variant="ghost" onClick={handleCancel}>
                Annuler
              </ModernButton>
              <ModernButton onClick={isAdding ? handleAddPretProduit : handleUpdatePretProduit}>
                {isAdding ? 'Ajouter' : 'Mettre à jour'}
              </ModernButton>
            </div>
          </CardContent>
        </ModernCard>
      )}
    </ModernContainer>
  );
};

export default PretProduits;
