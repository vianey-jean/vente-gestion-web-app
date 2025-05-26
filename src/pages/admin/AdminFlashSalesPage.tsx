
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Percent, Package } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { flashSalesAPI, FlashSale } from '@/services/flashSalesAPI';
import { productsAPI } from '@/services/productsAPI';
import { Product } from '@/types/product';

const AdminFlashSalesPage = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState<FlashSale | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    startTime: '',
    endTime: '',
    productIds: [] as string[],
    isActive: true
  });

  const fetchFlashSales = async () => {
    try {
      const response = await flashSalesAPI.getAll();
      setFlashSales(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des flash sales:', error);
      toast.error('Erreur lors du chargement des flash sales');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchFlashSales(), fetchProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const flashSaleData = {
        ...formData,
        discount: Number(formData.discount)
      };

      if (editingFlashSale) {
        await flashSalesAPI.update(editingFlashSale.id, flashSaleData);
        toast.success('Flash sale modifiée avec succès');
      } else {
        await flashSalesAPI.create(flashSaleData);
        toast.success('Flash sale créée avec succès');
      }
      
      fetchFlashSales();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (flashSale: FlashSale) => {
    setEditingFlashSale(flashSale);
    setFormData({
      title: flashSale.title,
      discount: flashSale.discount.toString(),
      startTime: new Date(flashSale.startTime).toISOString().slice(0, 16),
      endTime: new Date(flashSale.endTime).toISOString().slice(0, 16),
      productIds: flashSale.productIds,
      isActive: flashSale.isActive
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette flash sale ?')) {
      return;
    }

    try {
      await flashSalesAPI.delete(id);
      toast.success('Flash sale supprimée avec succès');
      fetchFlashSales();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (flashSale: FlashSale) => {
    try {
      await flashSalesAPI.update(flashSale.id, { isActive: !flashSale.isActive });
      toast.success('Statut mis à jour avec succès');
      fetchFlashSales();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      discount: '',
      startTime: '',
      endTime: '',
      productIds: [],
      isActive: true
    });
    setEditingFlashSale(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const isFlashSaleActive = (flashSale: FlashSale) => {
    const now = new Date();
    return flashSale.isActive && 
           new Date(flashSale.startTime) <= now && 
           new Date(flashSale.endTime) > now;
  };

  const getTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Terminée';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m restantes`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des Flash Sales</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une Flash Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFlashSale ? 'Modifier la Flash Sale' : 'Créer une nouvelle Flash Sale'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de la Flash Sale"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Pourcentage de réduction (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="99"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Date et heure de début</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Date et heure de fin</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Produits inclus</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.productIds.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                productIds: [...formData.productIds, product.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                productIds: formData.productIds.filter(id => id !== product.id)
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Activer la Flash Sale</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingFlashSale ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales.map((flashSale) => (
            <Card key={flashSale.id} className={isFlashSaleActive(flashSale) ? 'border-red-500' : ''}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <span className="block">{flashSale.title}</span>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={isFlashSaleActive(flashSale) ? 'default' : 'secondary'}>
                        <Percent className="h-3 w-3 mr-1" />
                        -{flashSale.discount}%
                      </Badge>
                      {isFlashSaleActive(flashSale) && (
                        <Badge variant="destructive">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeLeft(flashSale.endTime)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(flashSale)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(flashSale.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Statut:</span>
                    <Switch
                      checked={flashSale.isActive}
                      onCheckedChange={() => toggleActive(flashSale)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {flashSale.productIds.length} produit(s)
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Du {new Date(flashSale.startTime).toLocaleDateString('fr-FR')} au {new Date(flashSale.endTime).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {flashSales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune Flash Sale trouvée</p>
            <p className="text-gray-400">Commencez par créer votre première Flash Sale</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFlashSalesPage;
