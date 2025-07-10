
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, Sale } from '@/types';
import ProductSearchInput from '../ProductSearchInput';
import SaleQuantityInput from './SaleQuantityInput';

interface FormData {
  date: string;
  description: string;
  productId: string;
  sellingPriceUnit: string;
  quantitySold: string;
  purchasePriceUnit: string;
  profit: string;
  // Nouveaux champs client
  customerName: string;
  customerAddress: string;
  customerPhone: string;
}

interface SaleFormFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  selectedProduct: Product | null;
  editSale?: Sale;
  onProductSelect: (product: Product) => void;
  onSellingPriceChange: (price: string) => void;
  onQuantityChange: (quantity: string) => void;
  maxQuantity: number;
  isSubmitting: boolean;
  isOutOfStock: boolean;
  isAdvanceProduct: boolean;
  isProfitNegative: boolean;
}

const SaleFormFields: React.FC<SaleFormFieldsProps> = ({
  formData,
  setFormData,
  selectedProduct,
  editSale,
  onProductSelect,
  onSellingPriceChange,
  onQuantityChange,
  maxQuantity,
  isSubmitting,
  isOutOfStock,
  isAdvanceProduct,
  isProfitNegative
}) => {
  return (
    <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
      {/* Date de vente */}
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium text-gray-700">Date de vente</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          className="w-full"
        />
      </div>

      {/* Informations Client - Section moderne */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Informations Client
        </h3>
        
        <div className="grid gap-4">
          {/* Nom du client */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
              Nom du client *
            </Label>
            <Input
              id="customerName"
              name="customerName"
              type="text"
              placeholder="Nom complet du client"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              className="w-full"
              required
            />
          </div>

          {/* Adresse du client */}
          <div className="space-y-2">
            <Label htmlFor="customerAddress" className="text-sm font-medium text-gray-700">
              Adresse
            </Label>
            <Input
              id="customerAddress"
              name="customerAddress"
              type="text"
              placeholder="Adresse complète du client"
              value={formData.customerAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Numéro de téléphone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700">
              Numéro de téléphone
            </Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              placeholder="Ex: 0692198701"
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Sélection du produit */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Produit</Label>
        {editSale ? (
          <Input
            id="description"
            name="description"
            value={formData.description}
            readOnly
            disabled
            className="bg-gray-50"
          />
        ) : (
          <ProductSearchInput 
            onProductSelect={onProductSelect}
            selectedProduct={selectedProduct}
          />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Prix d'achat unitaire */}
        <div className="space-y-2">
          <Label htmlFor="purchasePriceUnit" className="text-sm font-medium text-gray-700">
            Prix d'achat unitaire (€)
          </Label>
          <Input
            id="purchasePriceUnit"
            name="purchasePriceUnit"
            type="number"
            step="0.01"
            value={formData.purchasePriceUnit}
            readOnly
            disabled
            className="bg-gray-50"
          />
        </div>
        
        {/* Prix de vente unitaire */}
        <div className="space-y-2">
          <Label htmlFor="sellingPriceUnit" className="text-sm font-medium text-gray-700">
            Prix de vente unitaire (€)
          </Label>
          <Input
            id="sellingPriceUnit"
            name="sellingPriceUnit"
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPriceUnit}
            onChange={(e) => onSellingPriceChange(e.target.value)}
            disabled={isSubmitting}
            className={isProfitNegative ? "border-red-500" : ""}
          />
          {isProfitNegative && (
            <p className="text-xs text-red-500">
              Le prix de vente est trop bas, vous allez faire une perte !
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Quantité vendue */}
        <SaleQuantityInput
          quantity={formData.quantitySold}
          maxQuantity={maxQuantity}
          onChange={onQuantityChange}
          disabled={isSubmitting || isOutOfStock || isAdvanceProduct}
          showAvailableStock={!!selectedProduct && !isAdvanceProduct}
        />
        
        {/* Bénéfice calculé */}
        <div className="space-y-2">
          <Label htmlFor="profit" className="text-sm font-medium text-gray-700">Bénéfice (€)</Label>
          <Input
            id="profit"
            name="profit"
            type="number"
            step="0.01"
            value={formData.profit}
            readOnly
            disabled
            className={isProfitNegative ? "border-red-500 bg-red-50" : "bg-gray-50"}
          />
          {isAdvanceProduct && (
            <p className="text-xs text-amber-600">
              Pour les produits d'avance, le bénéfice est calculé sans tenir compte de la quantité.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleFormFields;
