
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import LuxuryButton from '@/components/ui/luxury-button';
import { ShoppingCart, Heart, Share2, Check, Minus, Plus } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductDetailActionsProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  isProductFavorite: boolean;
  isInStock: boolean;
  addedToCart: boolean;
}

const ProductDetailActions: React.FC<ProductDetailActionsProps> = ({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  onToggleFavorite,
  onShare,
  isProductFavorite,
  isInStock,
  addedToCart
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
          Quantité:
        </span>
        <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="h-12 w-12 rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-800 border-x border-neutral-300 dark:border-neutral-700">
            <span className="text-lg font-semibold min-w-[40px] text-center block">
              {quantity}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={product.stock !== undefined && quantity >= product.stock}
            className="h-12 w-12 rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
          <span className="text-sm text-orange-600 font-medium">
            ({product.stock} disponible{product.stock > 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <LuxuryButton
          size="lg"
          onClick={onAddToCart}
          disabled={!isInStock}
          luxury={addedToCart ? "secondary" : "primary"}
          shimmer={!addedToCart}
          className="flex-1 h-14 text-lg font-semibold"
        >
          {addedToCart ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ajouter au panier
            </>
          )}
        </LuxuryButton>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleFavorite}
            className="h-14 w-14 rounded-xl border-2 hover:border-red-300 transition-all duration-300"
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                isProductFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-600'
              }`}
            />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onShare}
            className="h-14 w-14 rounded-xl border-2 hover:border-blue-300 transition-all duration-300"
          >
            <Share2 className="h-6 w-6 text-neutral-600" />
          </Button>
        </div>
      </div>

      {!isInStock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-900/30 rounded-xl"
        >
          <p className="text-red-700 dark:text-red-400 font-medium text-center">
            ⚠️ Ce produit est actuellement en rupture de stock
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProductDetailActions;
