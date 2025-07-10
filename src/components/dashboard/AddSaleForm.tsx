
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Product, Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import ProductSearchInput from './ProductSearchInput';
import SalePriceInput from './forms/SalePriceInput';
import SaleQuantityInput from './forms/SaleQuantityInput';
import ConfirmDeleteDialog from './forms/ConfirmDeleteDialog';
import { useSaleForm } from './forms/hooks/useSaleForm';
import { calculateSaleProfit } from './forms/utils/saleCalculations';
import SaleFormFields from './forms/SaleFormFields';

interface AddSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
}

/**
 * Formulaire pour ajouter ou modifier une vente
 */
const AddSaleForm: React.FC<AddSaleFormProps> = ({ isOpen, onClose, editSale }) => {
  const { products, addSale, updateSale, deleteSale } = useApp();
  const { toast } = useToast();
  
  // Initialisation du formulaire avec les nouveaux champs
  const initialFormData = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    productId: '',
    sellingPriceUnit: '',
    quantitySold: '1',
    purchasePriceUnit: '',
    profit: '0.00',
    // Nouveaux champs client
    customerName: '',
    customerAddress: '',
    customerPhone: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAdvanceProduct, setIsAdvanceProduct] = useState(false);

  // Initialiser le formulaire pour l'édition
  useEffect(() => {
    if (isOpen && editSale) {
      const product = products.find(p => p.id === editSale.productId);
      if (product) {
        setSelectedProduct(product);
        setMaxQuantity(product.quantity + editSale.quantitySold);
        
        const isAdvance = editSale.description.toLowerCase().includes('avance');
        setIsAdvanceProduct(isAdvance);
        
        setFormData({
          date: editSale.date,
          description: editSale.description,
          productId: editSale.productId,
          sellingPriceUnit: isAdvance 
            ? editSale.sellingPrice.toString()
            : (editSale.sellingPrice / (editSale.quantitySold || 1)).toFixed(2),
          quantitySold: editSale.quantitySold.toString(),
          purchasePriceUnit: isAdvance
            ? editSale.purchasePrice.toString()
            : (editSale.purchasePrice / (editSale.quantitySold || 1)).toFixed(2),
          profit: editSale.profit.toFixed(2),
          // Nouveaux champs client
          customerName: editSale.customerName || '',
          customerAddress: editSale.customerAddress || '',
          customerPhone: editSale.customerPhone || ''
        });
      }
    } else if (isOpen && !editSale) {
      // Réinitialiser pour une nouvelle vente
      setFormData(initialFormData);
      setSelectedProduct(null);
      setMaxQuantity(0);
      setIsAdvanceProduct(false);
    }
  }, [isOpen, editSale, products]);

  const isOutOfStock = maxQuantity === 0 && !isAdvanceProduct;

  // Gestion de la sélection de produit
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setMaxQuantity(product.quantity);
    
    const isAdvance = product.description.toLowerCase().includes('avance');
    setIsAdvanceProduct(isAdvance);
    
    setFormData(prev => ({
      ...prev,
      description: product.description,
      productId: product.id,
      purchasePriceUnit: product.purchasePrice.toFixed(2),
      sellingPriceUnit: '',
      quantitySold: isAdvance ? '0' : '1',
      profit: '0.00'
    }));
  };

  // Fonction pour calculer le profit selon la nouvelle logique
  const updateProfit = (priceUnit: string, quantity: string, purchasePriceUnit: string) => {
    if (isAdvanceProduct) {
      // Pour les produits d'avance : profit = prix de vente - prix d'achat (sans quantité)
      const profit = Number(priceUnit || 0) - Number(purchasePriceUnit || 0);
      setFormData(prev => ({
        ...prev,
        profit: profit.toFixed(2),
      }));
    } else {
      // Pour les autres produits : profit normal
      const profit = calculateSaleProfit(priceUnit, quantity, purchasePriceUnit);
      setFormData(prev => ({
        ...prev,
        profit: profit,
      }));
    }
  };

  // Gestionnaire pour le changement de prix de vente unitaire
  const handleSellingPriceChange = (price: string) => {
    setFormData(prev => ({
      ...prev,
      sellingPriceUnit: price,
    }));
    updateProfit(price, formData.quantitySold, formData.purchasePriceUnit);
  };

  // Gestionnaire pour le changement de quantité
  const handleQuantityChange = (quantity: string) => {
    if (!isAdvanceProduct) {
      setFormData(prev => ({
        ...prev,
        quantitySold: quantity,
      }));
      updateProfit(formData.sellingPriceUnit, quantity, formData.purchasePriceUnit);
    }
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.customerName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du client est obligatoire.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isAdvanceProduct && isOutOfStock) {
      toast({
        title: "Erreur",
        description: "Stock épuisé. Impossible d'ajouter cette vente.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const quantity = isAdvanceProduct ? 0 : Number(formData.quantitySold);
      const purchasePriceUnit = Number(formData.purchasePriceUnit);
      const sellingPriceUnit = Number(formData.sellingPriceUnit);
      
      let purchasePrice, sellingPrice;
      
      if (isAdvanceProduct) {
        // Pour les produits d'avance
        // purchasePrice = prix d'achat du produit (pas unitaire)
        // sellingPrice = prix de vente unitaire saisi par l'utilisateur
        purchasePrice = purchasePriceUnit; // Le prix d'achat est directement le prix du produit
        sellingPrice = sellingPriceUnit;   // Le prix de vente est ce que l'utilisateur a saisi
      } else {
        // Pour les autres produits
        // A = Prix d'achat unitaire * Quantité
        // V = Prix de vente unitaire * Quantité
        purchasePrice = purchasePriceUnit * quantity;
        sellingPrice = sellingPriceUnit * quantity;
      }
      
      const profit = Number(formData.profit);
      
      console.log('📊 Données calculées pour la vente:', {
        isAdvanceProduct,
        quantity,
        purchasePriceUnit,
        sellingPriceUnit,
        purchasePrice,
        sellingPrice,
        profit
      });
      
      const saleData = {
        date: formData.date,
        productId: formData.productId,
        description: formData.description,
        sellingPrice: sellingPrice,
        quantitySold: quantity,
        purchasePrice: purchasePrice,
        profit: profit,
        // Informations client
        customerName: formData.customerName.trim(),
        customerAddress: formData.customerAddress.trim(),
        customerPhone: formData.customerPhone.trim(),
      };

      let success: boolean | Sale = false;
      
      if (editSale && updateSale) {
        success = await updateSale({ ...saleData, id: editSale.id });
      } else if (addSale) {
        success = await addSale(saleData);
      }
      
      if (success) {
        toast({
          title: "Succès",
          description: editSale ? "Vente mise à jour avec succès" : "Vente ajoutée avec succès",
          variant: "default",
          className: "notification-success",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour gérer la suppression
  const handleDelete = async () => {
    if (!editSale || !deleteSale) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteSale(editSale.id);
      if (success) {
        toast({
          title: "Succès",
          description: "La vente a été supprimée avec succès",
          variant: "default",
          className: "notification-success",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isProfitNegative = Number(formData.profit) < 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editSale ? 'Modifier la vente' : 'Ajouter une vente'}</DialogTitle>
            <DialogDescription>
              {editSale ? 'Modifiez les détails de la vente.' : 'Enregistrez une nouvelle vente avec les informations client.'}
              {isAdvanceProduct && (
                <div className="mt-2 text-amber-600 text-sm font-medium">
                  Produit d'avance détecté - La quantité sera automatiquement fixée à 0.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <SaleFormFields
              formData={formData}
              setFormData={setFormData}
              selectedProduct={selectedProduct}
              editSale={editSale}
              onProductSelect={handleProductSelect}
              onSellingPriceChange={handleSellingPriceChange}
              onQuantityChange={handleQuantityChange}
              maxQuantity={maxQuantity}
              isSubmitting={isSubmitting}
              isOutOfStock={isOutOfStock}
              isAdvanceProduct={isAdvanceProduct}
              isProfitNegative={isProfitNegative}
            />
            
            <DialogFooter>
              {editSale && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                className="bg-app-green hover:bg-opacity-90"
                disabled={isSubmitting || (!editSale && (!selectedProduct || (isOutOfStock && !isAdvanceProduct) || !formData.customerName.trim()))}
              >
                {isSubmitting 
                  ? "Enregistrement..." 
                  : isOutOfStock && !isAdvanceProduct && !editSale
                    ? "Stock épuisé" 
                    : editSale 
                      ? "Mettre à jour" 
                      : "Ajouter"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la vente"
        description="Êtes-vous sûr de vouloir supprimer cette vente ? Cette action ne peut pas être annulée."
      />
    </>
  );
};

export default AddSaleForm;
