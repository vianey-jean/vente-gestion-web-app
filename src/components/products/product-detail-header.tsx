
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Clock, Star } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductDetailHeaderProps {
  product: Product;
  isPromotionActive: boolean;
  remainingTime: string;
}

const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({
  product,
  isPromotionActive,
  remainingTime
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="px-3 py-1 text-sm bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 border-0">
          {product.category}
        </Badge>
        {product.dateAjout && new Date().getTime() - new Date(product.dateAjout).getTime() < 7 * 24 * 60 * 60 * 1000 && (
          <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg">
            <Star className="h-3 w-3 mr-1" />
            Nouveau
          </Badge>
        )}
      </div>
      
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 dark:from-white dark:via-neutral-200 dark:to-white bg-clip-text text-transparent leading-tight">
        {product.name}
      </h1>
      
      {isPromotionActive && remainingTime && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          <Clock className="h-4 w-4 mr-2 animate-pulse" />
          <span className="font-semibold text-sm">
            Promotion se termine dans: {remainingTime}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProductDetailHeader;
