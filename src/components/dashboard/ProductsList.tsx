/**
 * ============================================
 * COMPOSANT LISTE DES PRODUITS
 * ============================================
 * 
 * Composant pour afficher et gérer la liste complète des produits.
 * Fonctionnalités:
 * - Affichage de tous les produits dans une table
 * - Tri par ordre alphabétique ou par catégorie
 * - Catégorisation automatique (perruques/tissages)
 * - Actions CRUD (Créer, Lire, Modifier, Supprimer)
 * - Confirmation de suppression
 * - Sauvegarde en base de données
 * 
 * @author Système de gestion des ventes
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell, TableBody } from '@/components/dashboard/forms/ModernTable';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/service/api';

// ============================================
// INTERFACES ET TYPES
// ============================================

/**
 * Interface définissant la structure d'un produit
 */
interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  imageUrl?: string;
}

/**
 * Types de tri disponibles
 */
type SortType = 'alphabetical' | 'category' | 'price' | 'quantity';

/**
 * Types de catégorie disponibles
 */
type CategoryType = 'all' | 'perruques' | 'tissages' | 'autres';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ProductsList: React.FC = () => {
  // ==============================
  // ÉTAT LOCAL DU COMPOSANT
  // ==============================
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>('alphabetical');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    purchasePrice: '',
    quantity: ''
  });

  const { toast } = useToast();

  // ==============================
  // FONCTIONS UTILITAIRES
  // ==============================

  /**
   * Détermine la catégorie d'un produit basée sur sa description
   * @param description - Description du produit
   * @returns Catégorie du produit
   */
  const getProductCategory = (description: string): string => {
    const lowercaseDesc = description.toLowerCase();
    if (lowercaseDesc.includes('perruque')) return 'perruques';
    if (lowercaseDesc.includes('tissage')) return 'tissages';
    return 'autres';
  };

  /**
   * Filtre les produits selon le terme de recherche et la catégorie
   * @param products - Liste des produits
   * @returns Produits filtrés
   */
  const getFilteredProducts = (products: Product[]): Product[] => {
    let filtered = products;

    // Filtrage par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => 
        getProductCategory(product.description) === categoryFilter
      );
    }

    return filtered;
  };

  /**
   * Trie les produits selon le type de tri sélectionné
   * @param products - Liste des produits à trier
   * @returns Produits triés
   */
  const getSortedProducts = (products: Product[]): Product[] => {
    const sorted = [...products];

    switch (sortType) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.description.localeCompare(b.description));
      case 'category':
        return sorted.sort((a, b) => {
          const catA = getProductCategory(a.description);
          const catB = getProductCategory(b.description);
          return catA.localeCompare(catB);
        });
      case 'price':
        return sorted.sort((a, b) => a.purchasePrice - b.purchasePrice);
      case 'quantity':
        return sorted.sort((a, b) => b.quantity - a.quantity);
      default:
        return sorted;
    }
  };

  // ==============================
  // GESTION DES DONNÉES
  // ==============================

  /**
   * Charge tous les produits depuis l'API
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await productService.getProducts();
      setProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Réinitialise le formulaire
   */
  const resetForm = () => {
    setFormData({ description: '', purchasePrice: '', quantity: '' });
    setEditingProduct(null);
  };

  /**
   * Ajoute un nouveau produit
   */
  const handleAddProduct = async () => {
    try {
      const productData = {
        description: formData.description,
        purchasePrice: parseFloat(formData.purchasePrice),
        quantity: parseInt(formData.quantity)
      };

      await productService.addProduct(productData);
      
      toast({
        title: "Succès",
        description: "Produit ajouté avec succès",
      });

      setIsAddDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      });
    }
  };

  /**
   * Modifie un produit existant
   */
  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      const productData = {
        id: editingProduct.id,
        description: formData.description,
        purchasePrice: parseFloat(formData.purchasePrice),
        quantity: parseInt(formData.quantity)
      };

      await productService.updateProduct(productData);
      
      toast({
        title: "Succès",
        description: "Produit modifié avec succès",
      });

      setIsEditDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Erreur lors de la modification du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le produit",
        variant: "destructive",
      });
    }
  };

  /**
   * Supprime un produit
   */
  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });

      loadProducts();
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  /**
   * Ouvre le formulaire d'édition avec les données du produit
   */
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      description: product.description,
      purchasePrice: product.purchasePrice.toString(),
      quantity: product.quantity.toString()
    });
    setIsEditDialogOpen(true);
  };

  // ==============================
  // EFFETS
  // ==============================

  /**
   * Charge les produits au montage du composant
   */
  useEffect(() => {
    loadProducts();
  }, []);

  // ==============================
  // CALCULS DÉRIVÉS
  // ==============================

  const filteredProducts = getFilteredProducts(products);
  const sortedProducts = getSortedProducts(filteredProducts);

  // ==============================
  // RENDU DU COMPOSANT
  // ==============================

  /**
   * Affichage du spinner de chargement
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Chargement des produits..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==================== HEADER AVEC STATISTIQUES ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total produits</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Perruques</Badge>
              <div>
                <p className="text-sm text-muted-foreground">Perruques</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => getProductCategory(p.description) === 'perruques').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Tissages</Badge>
              <div>
                <p className="text-sm text-muted-foreground">Tissages</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => getProductCategory(p.description) === 'tissages').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Stock bas</Badge>
              <div>
                <p className="text-sm text-muted-foreground">Quantité ≤ 2</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.quantity <= 2).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== BARRE D'OUTILS ==================== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Liste des Produits
            </CardTitle>

            {/* Bouton d'ajout */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description du produit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchasePrice">Prix d'achat</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantité</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddProduct} className="flex-1">
                      Ajouter
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortType} onValueChange={(value: SortType) => setSortType(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabétique</SelectItem>
                <SelectItem value="category">Catégorie</SelectItem>
                <SelectItem value="price">Prix</SelectItem>
                <SelectItem value="quantity">Quantité</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(value: CategoryType) => setCategoryFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="perruques">Perruques</SelectItem>
                <SelectItem value="tissages">Tissages</SelectItem>
                <SelectItem value="autres">Autres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* ==================== TABLEAU DES PRODUITS ==================== */}
        <CardContent>
          <ModernTable>
            <ModernTableHeader>
              <ModernTableRow>
                <ModernTableHead>Description</ModernTableHead>
                <ModernTableHead>Catégorie</ModernTableHead>
                <ModernTableHead>Prix d'achat</ModernTableHead>
                <ModernTableHead>Quantité</ModernTableHead>
                <ModernTableHead>Statut stock</ModernTableHead>
                <ModernTableHead className="text-right">Actions</ModernTableHead>
              </ModernTableRow>
            </ModernTableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <ModernTableRow key={product.id}>
                  <ModernTableCell className="font-medium">
                    {product.description}
                  </ModernTableCell>
                  <ModernTableCell>
                    <Badge 
                      variant={
                        getProductCategory(product.description) === 'perruques' ? 'default' :
                        getProductCategory(product.description) === 'tissages' ? 'secondary' : 'outline'
                      }
                    >
                      {getProductCategory(product.description)}
                    </Badge>
                  </ModernTableCell>
                  <ModernTableCell>
                    {product.purchasePrice.toFixed(2)} €
                  </ModernTableCell>
                  <ModernTableCell>
                    <span className={product.quantity <= 2 ? 'text-red-600 font-bold' : ''}>
                      {product.quantity}
                    </span>
                  </ModernTableCell>
                  <ModernTableCell>
                    <Badge 
                      variant={
                        product.quantity === 0 ? 'destructive' :
                        product.quantity <= 2 ? 'default' : 'secondary'
                      }
                    >
                      {product.quantity === 0 ? 'Rupture' :
                       product.quantity <= 2 ? 'Stock bas' : 'En stock'}
                    </Badge>
                  </ModernTableCell>
                  <ModernTableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {/* Bouton modifier */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {/* Bouton supprimer */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le produit "{product.description}" ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </ModernTableCell>
                </ModernTableRow>
              ))}
            </TableBody>
          </ModernTable>

          {sortedProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Aucun produit ne correspond aux critères de recherche.'
                : 'Aucun produit trouvé.'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== DIALOG DE MODIFICATION ==================== */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du produit"
              />
            </div>
            <div>
              <Label htmlFor="edit-purchasePrice">Prix d'achat</Label>
              <Input
                id="edit-purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-quantity">Quantité</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEditProduct} className="flex-1">
                Modifier
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsList;