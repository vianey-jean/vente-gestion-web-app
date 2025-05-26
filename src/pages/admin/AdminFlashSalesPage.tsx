
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { Plus, Zap, Clock, Package, Trash2, StopCircle } from 'lucide-react';
import { flashSalesAPI, FlashSale } from '@/services/flashSalesAPI';
import { productsAPI } from '@/services/productsAPI';
import { Product } from '@/types/product';
import CountdownTimer from '@/components/promotions/CountdownTimer';

const AdminFlashSalesPage = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    durationHours: '24',
    selectedProducts: [] as string[]
  });

  const fetchFlashSales = async () => {
    try {
      const response = await flashSalesAPI.getAll();
      setFlashSales(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes flash:', error);
      toast.error('Erreur lors du chargement des ventes flash');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, []);

  const handleCreateFlashSale = async () => {
    if (!formData.title.trim() || !formData.discount || formData.selectedProducts.length === 0) {
      toast.error('Tous les champs sont requis');
      return;
    }

    const discount = parseInt(formData.discount);
    if (discount <= 0 || discount > 90) {
      toast.error('La remise doit être entre 1 et 90%');
      return;
    }

    try {
      await flashSalesAPI.create({
        title: formData.title.trim(),
        discount,
        productIds: formData.selectedProducts,
        durationHours: parseInt(formData.durationHours)
      });
      
      toast.success('Vente flash créée avec succès');
      setFormData({
        title: '',
        discount: '',
        durationHours: '24',
        selectedProducts: []
      });
      setIsCreateOpen(false);
      fetchFlashSales();
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la vente flash');
    }
  };

  const handleDeactivateFlashSale = async (flashSale: FlashSale) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver "${flashSale.title}" ?`)) {
      return;
    }

    try {
      await flashSalesAPI.deactivate(flashSale.id);
      toast.success('Vente flash désactivée');
      fetchFlashSales();
    } catch (error: any) {
      console.error('Erreur lors de la désactivation:', error);
      toast.error('Erreur lors de la désactivation de la vente flash');
    }
  };

  const handleDeleteFlashSale = async (flashSale: FlashSale) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${flashSale.title}" ?`)) {
      return;
    }

    try {
      await flashSalesAPI.delete(flashSale.id);
      toast.success('Vente flash supprimée');
      fetchFlashSales();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la vente flash');
    }
  };

  const handleProductSelection = (productId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: checked 
        ? [...prev.selectedProducts, productId]
        : prev.selectedProducts.filter(id => id !== productId)
    }));
  };

  const getFlashSaleProducts = (flashSale: FlashSale) => {
    return products.filter(product => flashSale.productIds.includes(product.id));
  };

  const isFlashSaleActive = (flashSale: FlashSale) => {
    const now = new Date();
    return flashSale.isActive && 
           new Date(flashSale.startTime) <= now && 
           new Date(flashSale.endTime) > now;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Ventes Flash</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos offres flash avec compte à rebours
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Vente Flash
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle vente flash</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de la vente flash</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: VENTE FLASH - Électronique"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Remise (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="90"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="Ex: 50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Durée (heures)</Label>
                  <Select 
                    value={formData.durationHours} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, durationHours: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 heure</SelectItem>
                      <SelectItem value="3">3 heures</SelectItem>
                      <SelectItem value="6">6 heures</SelectItem>
                      <SelectItem value="12">12 heures</SelectItem>
                      <SelectItem value="24">24 heures</SelectItem>
                      <SelectItem value="48">48 heures</SelectItem>
                      <SelectItem value="72">72 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Produits à inclure</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={formData.selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                      />
                      <label htmlFor={`product-${product.id}`} className="text-sm flex-1 cursor-pointer">
                        {product.name} - {product.price}€
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.selectedProducts.length} produit(s) sélectionné(s)
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateFlashSale}>
                  Créer la Vente Flash
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {flashSales.map((flashSale) => {
          const isActive = isFlashSaleActive(flashSale);
          const flashSaleProducts = getFlashSaleProducts(flashSale);
          
          return (
            <Card key={flashSale.id} className={isActive ? 'border-orange-500' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center">
                      <Zap className={`h-5 w-5 mr-2 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                      {flashSale.title}
                      <span className="ml-2 text-lg font-bold text-red-600">
                        -{flashSale.discount}%
                      </span>
                      {isActive && (
                        <span className="ml-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                          ACTIVE
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivateFlashSale(flashSale)}
                      >
                        <StopCircle className="h-4 w-4 mr-1" />
                        Désactiver
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFlashSale(flashSale)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {isActive && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <CountdownTimer 
                      endTime={new Date(flashSale.endTime)}
                      title="Temps restant"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Période</p>
                      <p className="text-muted-foreground">
                        {new Date(flashSale.startTime).toLocaleString('fr-FR')} - 
                        {new Date(flashSale.endTime).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Produits</p>
                      <p className="text-muted-foreground">
                        {flashSale.productIds.length} produits inclus
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Statut</p>
                      <p className={isActive ? 'text-green-600' : 'text-gray-500'}>
                        {isActive ? 'En cours' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                {flashSaleProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Produits inclus:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {flashSaleProducts.map((product) => (
                        <div key={product.id} className="bg-gray-50 p-2 rounded text-sm">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-muted-foreground">
                            Prix normal: {product.price}€ - 
                            Prix flash: {(product.price * (1 - flashSale.discount / 100)).toFixed(2)}€
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {flashSales.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune vente flash</h3>
            <p className="text-muted-foreground text-center mb-4">
              Créez votre première vente flash pour attirer les clients
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une vente flash
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFlashSalesPage;
