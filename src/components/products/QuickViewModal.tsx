
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, X, Star, Share2, Eye, Zap, Clock, Shield, Truck } from 'lucide-react';
import { Product } from '@/types/product';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getSecureProductId } from '@/services/secureIds';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const { isAuthenticated } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (!product) return null;

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image ? [product.image] : [];

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.svg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour ajouter un produit au panier");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${quantity} ${quantity > 1 ? 'exemplaires ajoutés' : 'exemplaire ajouté'} au panier`);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour ajouter aux favoris");
      return;
    }
    toggleFavorite(product);
    toast.success(isFavorite(product.id) ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  const isPromotionActive = product.promotion && 
    product.promotionEnd && 
    new Date(product.promotionEnd) > new Date();

  const isInStock = product.isSold && (product.stock === undefined || product.stock > 0);

  const getPromotionTimeLeft = (endDate: string) => {
    if (!endDate) return "";
    
    const end = new Date(endDate);
    const now = new Date();
    const diffInMs = end.getTime() - now.getTime();
    
    if (diffInMs <= 0) return "Expirée";
    
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffInDays > 0) {
      return `${diffInDays}j ${diffInHours}h`;
    } else {
      const diffInMins = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffInHours}h ${diffInMins}m`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-black border-0 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full"
        >
          {/* Images Section - Enhanced */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 lg:hidden backdrop-blur-sm"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
            
            <div className="relative mb-6 rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={getImageUrl(productImages[selectedImageIndex])}
                  alt={product.name}
                  className="w-full h-96 object-contain p-4"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </AnimatePresence>
              
              {/* Enhanced Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isPromotionActive && (
                  <motion.div
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="relative"
                  >
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 text-sm font-bold rounded-full shadow-lg">
                      <Zap className="h-4 w-4 mr-1" />
                      -{product.promotion}%
                    </Badge>
                  </motion.div>
                )}
                
                {product.dateAjout && new Date().getTime() - new Date(product.dateAjout).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 text-sm font-bold rounded-full shadow-lg">
                    Nouveau
                  </Badge>
                )}
              </div>

              {/* Timer for promotions */}
              {isPromotionActive && product.promotionEnd && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-full text-sm flex items-center backdrop-blur-sm shadow-lg"
                >
                  <Clock className="h-4 w-4 mr-2 animate-pulse" />
                  {getPromotionTimeLeft(product.promotionEnd)}
                </motion.div>
              )}
            </div>

            {/* Enhanced Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3 justify-center overflow-x-auto pb-2">
                {productImages.slice(0, 5).map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 shadow-md hover:shadow-lg ${
                      index === selectedImageIndex 
                        ? 'border-red-500 ring-2 ring-red-200' 
                        : 'border-transparent hover:border-red-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information - Enhanced */}
          <div className="p-8 overflow-y-auto bg-white dark:bg-neutral-900">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full shadow-lg transition-all duration-300 hidden lg:block"
            >
              <X className="h-5 w-5" />
            </button>

            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="px-3 py-1 text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 border-gray-200 dark:border-neutral-600">
                  {product.category}
                </Badge>
                {product.dateAjout && new Date().getTime() - new Date(product.dateAjout).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-md">
                    Nouveau
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Enhanced Price Section */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900 border border-gray-100 dark:border-neutral-700">
              {isPromotionActive ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-xl text-gray-500 line-through">
                      {typeof product.originalPrice === 'number'
                        ? product.originalPrice.toFixed(2)
                        : product.price.toFixed(2)}{' '}
                      €
                    </p>
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-md">
                      -{product.promotion}% OFF
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                    {product.price.toFixed(2)} €
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Vous économisez {((typeof product.originalPrice === 'number' ? product.originalPrice : product.price) - product.price).toFixed(2)} €
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.price.toFixed(2)} €
                </p>
              )}
            </div>

            {/* Enhanced Description */}
            <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Description</h4>
              <div className="max-h-32 overflow-y-auto text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </div>
            </div>

            {/* Enhanced Stock & Features */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isInStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="font-medium text-gray-900 dark:text-white">Disponibilité:</span>
                </div>
                <span className={`font-bold ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                  {isInStock ? 'En stock' : 'Rupture de stock'}
                </span>
              </div>

              {product.stock !== undefined && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <span className="font-medium text-gray-900 dark:text-white">Stock disponible:</span>
                  <span className="font-bold text-blue-600">
                    {product.stock} unité{product.stock !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-neutral-800">
                  <Truck className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Livraison rapide</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-neutral-800">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Paiement sécurisé</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-neutral-800">
                  <Heart className="h-5 w-5 mx-auto mb-1 text-red-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Garantie qualité</span>
                </div>
              </div>
            </div>

            {/* Enhanced Quantity Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="font-medium text-gray-900 dark:text-white">Quantité:</span>
              <div className="flex items-center border-2 border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-2 border-x-2 border-gray-200 dark:border-neutral-700 min-w-[60px] text-center font-medium bg-gray-50 dark:bg-neutral-750">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stock !== undefined && quantity >= product.stock}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-3">
                <Button 
                  onClick={handleAddToCart} 
                  disabled={!isInStock}
                  className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Ajouter au panier
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className="h-12 w-12 rounded-xl border-2 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 transition-all duration-300"
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'} transition-colors`}
                  />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const url = window.location.origin + `/${getSecureProductId(product.id, 'product')}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Lien copié!");
                  }}
                  className="h-12 w-12 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 transition-all duration-300"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                </Button>
              </div>

              <Button variant="link" asChild className="w-full text-gray-600 hover:text-red-600 transition-colors">
                <Link to={`/${getSecureProductId(product.id, 'product')}`} className="flex items-center justify-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir la page produit complète
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
