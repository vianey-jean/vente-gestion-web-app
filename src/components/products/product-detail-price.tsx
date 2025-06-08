
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingDown } from 'lucide-react';
import { Product } from '@/types/product';
import LuxuryCard from '@/components/ui/luxury-card';

interface ProductDetailPriceProps {
  product: Product;
  isPromotionActive: boolean;
}

const ProductDetailPrice: React.FC<ProductDetailPriceProps> = ({
  product,
  isPromotionActive
}) => {
  const originalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : product.price;
  const savings = isPromotionActive ? (originalPrice - product.price) : 0;

  if (isPromotionActive) {
    return (
      <LuxuryCard className="p-6 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/20 dark:via-rose-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xl text-neutral-500 line-through">
                {originalPrice.toFixed(2)} €
              </p>
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-lg">
                <Zap className="h-3 w-3 inline mr-1" />
                -{product.promotion}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {product.price.toFixed(2)} €
            </p>
            <div className="text-right">
              <div className="flex items-center text-green-600 font-semibold">
                <TrendingDown className="h-4 w-4 mr-1" />
                Vous économisez
              </div>
              <p className="text-2xl font-bold text-green-600">
                {savings.toFixed(2)} €
              </p>
            </div>
          </div>
        </motion.div>
      </LuxuryCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
        {product.price.toFixed(2)} €
      </p>
    </motion.div>
  );
};

export default ProductDetailPrice;
