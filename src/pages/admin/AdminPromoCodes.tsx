
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Trash2, Edit, Percent, Tag, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { productsAPI } from '@/services/api';
import axios from 'axios';
import { Product } from '@/contexts/StoreContext';

const AdminPromoCodes: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discount, setDiscount] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Charger les codes promo
  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/promo-codes');
      setPromoCodes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des codes promo:', error);
      toast.error('Erreur lors du chargement des codes promo');
    } finally {
      setLoading(false);
    }
  };

  // Recherche de produits
  const handleSearch = async () => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await productsAPI.search(searchTerm);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.length >= 3) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Sélectionner un produit
  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setSearchResults([]);
  };

  // Créer un code promo
  const handleCreatePromoCode = async () => {
    if (!selectedProduct) {
      toast.error('Veuillez sélectionner un produit');
      return;
    }

    if (!discount || isNaN(Number(discount)) || Number(discount) <= 0 || Number(discount) > 100) {
      toast.error('Veuillez entrer un pourcentage valide (entre 1 et 100)');
      return;
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error('Veuillez entrer une quantité valide');
      return;
    }

    try {
      const response = await axios.post('/api/promo-codes', {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        discount: Number(discount),
        quantity: Number(quantity)
      });

      toast.success(`Code promo ${response.data.code} créé avec succès`);
      setSelectedProduct(null);
      setDiscount('');
      setQuantity('');
      setSearchTerm('');
      fetchPromoCodes();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du code promo:', error);
      toast.error('Erreur lors de la création du code promo');
    }
  };

  // Mettre à jour un code promo
  const handleUpdatePromoCode = async () => {
    if (!editingCode || !newQuantity || isNaN(Number(newQuantity)) || Number(newQuantity) < 0) {
      toast.error('Veuillez entrer une quantité valide');
      return;
    }

    try {
      await axios.put(`/api/promo-codes/${editingCode}`, {
        quantity: Number(newQuantity)
      });

      toast.success('Code promo mis à jour avec succès');
      setEditingCode(null);
      setNewQuantity('');
      fetchPromoCodes();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du code promo:', error);
      toast.error('Erreur lors de la mise à jour du code promo');
    }
  };

  // Supprimer un code promo
  const handleDeletePromoCode = async (id: string) => {
    try {
      await axios.delete(`/api/promo-codes/${id}`);
      toast.success('Code promo supprimé avec succès');
      fetchPromoCodes();
    } catch (error) {
      console.error('Erreur lors de la suppression du code promo:', error);
      toast.error('Erreur lors de la suppression du code promo');
    }
  };

  // Fonctions pour les modales
  const startEditing = (codeId: string, currentQuantity: number) => {
    setEditingCode(codeId);
    setNewQuantity(currentQuantity.toString());
  };

  const cancelEditing = () => {
    setEditingCode(null);
    setNewQuantity('');
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des codes promo</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Créer un code promo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouveau code promo</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="productSearch">Rechercher un produit</Label>
                  <div className="relative">
                    <Input
                      id="productSearch"
                      placeholder="Rechercher un produit (min. 3 caractères)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {searchLoading && (
                    <p className="text-sm text-muted-foreground">Recherche en cours...</p>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          onClick={() => selectProduct(product)}
                        >
                          <span className="truncate">{product.name}</span>
                          <span className="text-sm text-muted-foreground">{product.price}€</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedProduct && (
                  <div className="border rounded-md p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Produit sélectionné:</span>
                      <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-gray-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm">{selectedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">Prix: {selectedProduct.price}€</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="discount">Pourcentage de réduction</Label>
                  <div className="relative">
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Ex: 20 pour 20%"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="pr-10"
                    />
                    <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Nombre de codes disponibles</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="Ex: 100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter className="sm:justify-between">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
                </DialogClose>
                <Button 
                  type="button" 
                  onClick={handleCreatePromoCode}
                  disabled={!selectedProduct || !discount || !quantity}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Créer le code promo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Liste des codes promo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Chargement des codes promo...</p>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Aucun code promo</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Créez votre premier code promo en cliquant sur le bouton ci-dessus.
                </p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-center">Réduction</TableHead>
                      <TableHead className="text-center">Quantité restante</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-medium">{code.code}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{code.productName}</TableCell>
                        <TableCell className="text-center">{code.discount}%</TableCell>
                        <TableCell className="text-center">
                          {editingCode === code.id ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                value={newQuantity}
                                onChange={(e) => setNewQuantity(e.target.value)}
                                className="w-20 text-center"
                              />
                              <button onClick={handleUpdatePromoCode} className="text-green-600 hover:text-green-800">
                                <Check className="h-5 w-5" />
                              </button>
                              <button onClick={cancelEditing} className="text-red-600 hover:text-red-800">
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            code.quantity
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingCode !== code.id && (
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(code.id, code.quantity)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePromoCode(code.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
    </AdminLayout>
  );
};

export default AdminPromoCodes;
