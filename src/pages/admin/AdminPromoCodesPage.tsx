
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Edit } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { codePromosAPI, Product } from '@/services/api';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AdminPromoCodesPage = () => {
  const [codePromos, setCodePromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [pourcentage, setPourcentage] = useState('');
  const [quantite, setQuantite] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCodePromos();
  }, []);

  const fetchCodePromos = async () => {
    try {
      setLoading(true);
      const response = await codePromosAPI.getAll();
      if (Array.isArray(response.data)) {
        setCodePromos(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des codes promo:', error);
      toast.error('Erreur lors du chargement des codes promo');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (term) => {
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/search?term=${encodeURIComponent(term)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Erreur lors de la recherche des produits:', error);
      toast.error('Erreur lors de la recherche des produits');
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchProducts(term);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchResults([]);
    setSearchTerm(product.name);
  };

  const handleOpenDialog = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setPourcentage(promo.pourcentage.toString());
      setQuantite(promo.quantite.toString());
      
      // Find the product for this promo
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${promo.productId}`)
        .then(response => response.json())
        .then(data => {
          setSelectedProduct(data);
          setSearchTerm(data.name);
        })
        .catch(error => {
          console.error('Erreur lors de la récupération du produit:', error);
        });
    } else {
      setEditingPromo(null);
      setPourcentage('');
      setQuantite('');
      setSelectedProduct(null);
      setSearchTerm('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Veuillez sélectionner un produit');
      return;
    }

    if (!pourcentage || !quantite) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const pourcentageValue = parseInt(pourcentage);
    const quantiteValue = parseInt(quantite);

    if (isNaN(pourcentageValue) || pourcentageValue <= 0 || pourcentageValue > 100) {
      toast.error('Le pourcentage doit être compris entre 1 et 100');
      return;
    }

    if (isNaN(quantiteValue) || quantiteValue <= 0) {
      toast.error('La quantité doit être un nombre positif');
      return;
    }

    try {
      let response;
      const promoData = {
        pourcentage: pourcentageValue,
        quantite: quantiteValue,
        productId: selectedProduct.id
      };

      if (editingPromo) {
        response = await codePromosAPI.update(editingPromo.id, promoData);
        toast.success('Code promo mis à jour avec succès');
      } else {
        response = await codePromosAPI.create(promoData);
        toast.success('Code promo créé avec succès');
      }

      fetchCodePromos();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du code promo:', error);
      toast.error('Erreur lors de l\'enregistrement du code promo');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo?')) {
      return;
    }

    try {
      await codePromosAPI.delete(id);
      toast.success('Code promo supprimé avec succès');
      fetchCodePromos();
    } catch (error) {
      console.error('Erreur lors de la suppression du code promo:', error);
      toast.error('Erreur lors de la suppression du code promo');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des codes promo</h1>
        <Button onClick={() => handleOpenDialog()} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Nouveau code promo
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : (
        <Table>
          <TableCaption>Liste des codes promo</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Pourcentage</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codePromos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Aucun code promo disponible</TableCell>
              </TableRow>
            ) : (
              codePromos.map(promo => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.code}</TableCell>
                  <TableCell>{promo.pourcentage}%</TableCell>
                  <TableCell>{promo.quantite}</TableCell>
                  <TableCell>{promo.productId}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(promo)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Modifier le code promo' : 'Créer un nouveau code promo'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="product">Produit</Label>
              <div className="relative">
                <Input
                  type="text"
                  id="product"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map(product => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleProductSelect(product)}
                      >
                        {product.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="pourcentage">Pourcentage de réduction</Label>
              <Input
                type="number"
                id="pourcentage"
                min="1"
                max="100"
                value={pourcentage}
                onChange={e => setPourcentage(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="quantite">Quantité</Label>
              <Input
                type="number"
                id="quantite"
                min="1"
                value={quantite}
                onChange={e => setQuantite(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button type="submit">
                {editingPromo ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPromoCodesPage;
