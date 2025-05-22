
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Search, PlusCircle, XCircle, Edit, Trash2, Tag } from 'lucide-react';
import { Product, productsAPI } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';

// Interface pour le produit avec promotion typée correctement
interface ExtendedProduct extends Omit<Product, 'promotion'> {
  promotion: number | null;
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [promoValue, setPromoValue] = useState<number>(0);
  const [promoDuration, setPromoDuration] = useState<number>(7);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data as ExtendedProduct[]);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 4); // Limiter à 4 images
      setSelectedImages(filesArray);
      
      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(previewUrls);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('category', data.category);
      formData.append('stock', data.stock || '10');
      
      if (selectedImages.length > 0) {
        selectedImages.forEach(image => {
          formData.append('images', image);
        });
      }
      
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formData);
        toast.success('Produit mis à jour avec succès');
      } else {
        await productsAPI.create(formData);
        toast.success('Produit ajouté avec succès');
      }
      
      closeDialog();
      loadProducts();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du produit:', error);
      toast.error('Erreur lors de l\'enregistrement du produit');
    }
  };

  const closeDialog = () => {
    setEditingProduct(null);
    setShowAddProduct(false);
    setSelectedImages([]);
    setImagePreviewUrls([]);
    reset();
  };

  const handleEdit = (product: ExtendedProduct) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('category', product.category);
    setValue('stock', product.stock || 10);
    setImagePreviewUrls(product.images || [product.image].filter(Boolean));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await productsAPI.delete(id);
        toast.success('Produit supprimé avec succès');
        loadProducts();
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        toast.error('Impossible de supprimer le produit');
      }
    }
  };

  const openPromoDialog = (productId: string) => {
    setSelectedProductId(productId);
    setShowPromoDialog(true);
  };

  const applyPromotion = async () => {
    if (!selectedProductId) return;
    
    try {
      await productsAPI.applyPromotion(selectedProductId, promoValue, promoDuration);
      toast.success('Promotion appliquée avec succès');
      setShowPromoDialog(false);
      loadProducts();
    } catch (error) {
      console.error('Erreur lors de l\'application de la promotion:', error);
      toast.error('Impossible d\'appliquer la promotion');
    }
  };

  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des produits</CardTitle>
          <Button onClick={() => setShowAddProduct(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Rechercher un produit..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Promo</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.images?.[0] || product.image || '/placeholder.svg'} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-md" 
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price.toFixed(2)} €</TableCell>
                      <TableCell>
                        {product.promotion ? (
                          <span className="text-green-600 font-medium">-{product.promotion}%</span>
                        ) : (
                          <span className="text-gray-400">Aucune</span>
                        )}
                      </TableCell>
                      <TableCell>{product.stock || 'N/A'}</TableCell>
                      <TableCell>
                        {product.dateAjout ? 
                          format(new Date(product.dateAjout), 'dd/MM/yyyy', { locale: fr }) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openPromoDialog(product.id)}>
                            <Tag size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour ajouter/modifier un produit */}
      <Dialog open={showAddProduct || editingProduct !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input id="name" {...register('name', { required: true })} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€)</Label>
                <Input id="price" type="number" step="0.01" {...register('price', { required: true })} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select onValueChange={(value) => setValue('category', value)} defaultValue={editingProduct?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vêtements">Vêtements</SelectItem>
                    <SelectItem value="accessoires">Accessoires</SelectItem>
                    <SelectItem value="chaussures">Chaussures</SelectItem>
                    <SelectItem value="sacs">Sacs</SelectItem>
                    <SelectItem value="bijoux">Bijoux</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('category', { required: true })} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock disponible</Label>
                <Input id="stock" type="number" {...register('stock')} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} {...register('description', { required: true })} />
            </div>
            
            <div className="space-y-2">
              <Label>Images du produit (max 4)</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Preview ${index}`} className="w-24 h-24 object-cover rounded-md" />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
                      onClick={() => {
                        setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
                        setSelectedImages(selectedImages.filter((_, i) => i !== index));
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
                
                {imagePreviewUrls.length < 4 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <PlusCircle className="text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">Formats acceptés: JPG, PNG, GIF. Taille max: 5MB</p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button type="submit">
                {editingProduct ? 'Mettre à jour' : 'Ajouter le produit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour ajouter une promotion */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appliquer une promotion</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promoValue">Pourcentage de réduction</Label>
              <div className="flex items-center">
                <Input
                  id="promoValue"
                  type="number"
                  min="0"
                  max="90"
                  value={promoValue}
                  onChange={(e) => setPromoValue(parseInt(e.target.value))}
                />
                <span className="ml-2">%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promoDuration">Durée (jours)</Label>
              <Input
                id="promoDuration"
                type="number"
                min="1"
                value={promoDuration}
                onChange={(e) => setPromoDuration(parseInt(e.target.value))}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPromoDialog(false)}>
                Annuler
              </Button>
              <Button onClick={applyPromotion}>
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductsPage;
