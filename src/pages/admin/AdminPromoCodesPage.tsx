
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Plus, Trash, Edit } from 'lucide-react';
import { promoAPI, PromoCode, Product } from '@/services/api';
import { useDebounce } from '@/hooks/use-debounce';

const AdminPromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  
  const [percentage, setPercentage] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);
  const [productSearch, setProductSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const debouncedSearchTerm = useDebounce(productSearch, 500);
  const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch all promo codes on component mount
  useEffect(() => {
    fetchPromoCodes();
  }, []);
  
  // Handle product search
  useEffect(() => {
    if (debouncedSearchTerm.length >= 3) {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);
  
  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await promoAPI.getAll();
      setPromoCodes(response.data);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Erreur lors du chargement des codes promo');
    } finally {
      setLoading(false);
    }
  };
  
  const searchProducts = async () => {
    try {
      setSearchLoading(true);
      const response = await promoAPI.searchProducts(debouncedSearchTerm);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleCreatePromoCode = async () => {
    if (!selectedProduct) {
      toast.error('Veuillez sélectionner un produit');
      return;
    }
    
    if (percentage < 1 || percentage > 99) {
      toast.error('Le pourcentage doit être compris entre 1 et 99');
      return;
    }
    
    if (quantity < 1) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }
    
    try {
      const response = await promoAPI.create({
        productId: selectedProduct.id,
        percentage,
        quantity
      });
      
      setPromoCodes([...promoCodes, response.data]);
      toast.success('Code promo créé avec succès');
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast.error('Erreur lors de la création du code promo');
    }
  };
  
  const handleUpdatePromoCode = async () => {
    if (!selectedPromoCode) return;
    
    if (quantity < 0) {
      toast.error('La quantité ne peut pas être négative');
      return;
    }
    
    try {
      const response = await promoAPI.update(selectedPromoCode.id, quantity);
      
      setPromoCodes(promoCodes.map(promo => 
        promo.id === selectedPromoCode.id ? response.data : promo
      ));
      
      toast.success('Quantité mise à jour avec succès');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating promo code:', error);
      toast.error('Erreur lors de la mise à jour du code promo');
    }
  };
  
  const handleDeletePromoCode = async () => {
    if (!selectedPromoCode) return;
    
    try {
      await promoAPI.delete(selectedPromoCode.id);
      setPromoCodes(promoCodes.filter(promo => promo.id !== selectedPromoCode.id));
      toast.success('Code promo supprimé avec succès');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('Erreur lors de la suppression du code promo');
    }
  };
  
  const resetForm = () => {
    setPercentage(10);
    setQuantity(1);
    setProductSearch('');
    setSearchResults([]);
    setSelectedProduct(null);
  };
  
  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchResults([]);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Gestion des Codes Promo</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Créer un code promo
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Liste des codes promo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <p>Chargement des codes promo...</p>
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Aucun code promo disponible.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Réduction</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map(promo => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                      <TableCell>{promo.productName}</TableCell>
                      <TableCell>{promo.percentage}%</TableCell>
                      <TableCell>{promo.quantity}</TableCell>
                      <TableCell>{format(new Date(promo.createdAt), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          promo.isActive && promo.quantity > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {promo.isActive && promo.quantity > 0 ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setSelectedPromoCode(promo);
                              setQuantity(promo.quantity);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPromoCode(promo);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Create Promo Code Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer un nouveau code promo</DialogTitle>
            <DialogDescription>
              Entrez les détails du code promo pour un produit spécifique.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="productSearch">Rechercher un produit</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="productSearch"
                  placeholder="Rechercher un produit (min. 3 caractères)"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {searchLoading && productSearch.length >= 3 && (
                <p className="text-sm text-muted-foreground">Recherche en cours...</p>
              )}
              
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                  {searchResults.map(product => (
                    <div 
                      key={product.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                      onClick={() => selectProduct(product)}
                    >
                      {product.image && (
                        <img 
                          src={`${AUTH_BASE_URL}${product.image}`} 
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `${AUTH_BASE_URL}/uploads/placeholder.jpg`;
                          }}
                        />
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.price.toFixed(2)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedProduct && (
                <div className="border rounded-md p-3 mt-2">
                  <div className="flex items-center space-x-3">
                    {selectedProduct.image && (
                      <img 
                        src={`${AUTH_BASE_URL}${selectedProduct.image}`} 
                        alt={selectedProduct.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `${AUTH_BASE_URL}/uploads/placeholder.jpg`;
                        }}
                      />
                    )}
                    <div>
                      <p className="font-medium">{selectedProduct.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.price.toFixed(2)} €</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="percentage">Pourcentage de réduction (%)</Label>
              <Input
                id="percentage"
                type="number"
                min="1"
                max="99"
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité disponible</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              resetForm();
            }}>
              Annuler
            </Button>
            <Button onClick={handleCreatePromoCode} disabled={!selectedProduct}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Promo Code Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la quantité</DialogTitle>
            <DialogDescription>
              Mettez à jour la quantité disponible pour ce code promo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedPromoCode && (
              <>
                <div>
                  <p className="text-sm font-medium">Code promo</p>
                  <p className="font-mono font-bold">{selectedPromoCode.code}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Produit</p>
                  <p>{selectedPromoCode.productName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Réduction</p>
                  <p>{selectedPromoCode.percentage}%</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantité disponible</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdatePromoCode}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Ce code promo sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePromoCode}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPromoCodesPage;
