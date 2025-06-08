
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, ShoppingCart, Check, Truck, ArrowLeft, Share2, Shield, Clock, Zap, Star, Eye, Package } from 'lucide-react';
import FeaturedProductsSlider from '@/components/products/FeaturedProductsSlider';
import ProductReviews from '@/components/reviews/ProductReviews';
import { getRealId, isValidSecureId, getEntityType } from '@/services/secureIds';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetail = () => {
  const { productId: secureProductId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, addToCart, toggleFavorite, isFavorite } = useStore();
  const { isAuthenticated } = useAuth();
  const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const PLACEHOLDER_IMAGE = '/placeholder.svg';
  
  console.log('ProductDetail - Secure ID:', secureProductId);
  
  // Récupérer l'ID réel à partir de l'ID sécurisé
  const productId = secureProductId ? getRealId(secureProductId) : undefined;
  
  console.log('ProductDetail - Real ID:', productId);
  
  // Définir tous les useState au début du composant
  const [product, setProduct] = useState(products.find(p => p.id === productId));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [isValidId, setIsValidId] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Valider l'ID sécurisé et rediriger si invalide
  useEffect(() => {
    setIsLoading(true);
    
    if (!secureProductId) {
      setIsValidId(false);
      toast.error("Produit non trouvé");
      navigate('/page/notfound', { replace: true });
      return;
    }
    
    const isValid = isValidSecureId(secureProductId);
    const entityType = getEntityType(secureProductId);
    
    console.log('ProductDetail - Validation:', { isValid, entityType, productId });
    
    if (!isValid) {
      setIsValidId(false);
      toast.error("Ce lien n'est plus valide");
      navigate('/page/notfound', { replace: true });
    } else {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        setIsValidId(true);
      } else {
        console.log('ProductDetail - Produit non trouvé:', productId);
        setIsValidId(false);
        toast.error("Produit introuvable");
        navigate('/page/notfound', { replace: true });
      }
    }
    
    setIsLoading(false);
  }, [secureProductId, productId, products, navigate]);

  useEffect(() => {
    if (product && product.promotion && product.promotionEnd) {
      const updateRemainingTime = () => {
        const end = new Date(product.promotionEnd!);
        const now = new Date();
        const diffInMs = end.getTime() - now.getTime();
        
        if (diffInMs <= 0) {
          setRemainingTime("Promotion expirée");
          return;
        }
        
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffInMins = Math.floor((diffInMs % (1000 * 60)) / (1000 * 60));
        const diffInSecs = Math.floor((diffInMs % (1000 * 60)) / 1000);

        if (diffInDays > 0) {
          setRemainingTime(`${diffInDays}j ${diffInHours}h ${diffInMins}m ${diffInSecs}s`);
        } else {
          setRemainingTime(`${diffInHours}h ${diffInMins}m ${diffInSecs}s`);
        }
      };
      
      updateRemainingTime();
      const interval = setInterval(updateRemainingTime, 1000);
      
      return () => clearInterval(interval);
    }
  }, [product]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && (product?.stock === undefined || newQuantity <= product.stock)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour ajouter un produit au panier", {
        style: { backgroundColor: '#EF4444', color: 'white', fontWeight: 'bold' },
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setAddedToCart(true);
      toast.success(`${quantity} ${quantity > 1 ? 'exemplaires' : 'exemplaire'} ajouté${quantity > 1 ? 's' : ''} au panier`);
      
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    }
  };
  
  // Si le produit est en cours de chargement, afficher un indicateur
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <Skeleton className="w-full h-[400px] rounded-xl mb-4" />
              <div className="flex justify-center space-x-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md" />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <Skeleton className="w-3/4 h-8 mb-3" />
              <Skeleton className="w-1/2 h-6 mb-6" />
              <Skeleton className="w-1/4 h-5 mb-8" />
              <Skeleton className="w-full h-32 mb-6" />
              <div className="flex space-x-4">
                <Skeleton className="w-1/3 h-10" />
                <Skeleton className="w-1/3 h-10" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Si le produit n'est pas trouvé ou l'ID invalide, afficher un message
  if (!isValidId || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-6">Produit non trouvé</h1>
          <p className="mb-8 text-gray-600 max-w-md mx-auto">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button asChild>
            <a href="/">Retour à l'accueil</a>
          </Button>
        </div>
      </Layout>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 8);

  const isProductFavorite = productId ? isFavorite(productId) : false;
  const isPromotionActive = product.promotion && 
    product.promotionEnd && 
    new Date(product.promotionEnd) > new Date();
  const isInStock = product.isSold && (product.stock === undefined || product.stock > 0);

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
        
  // Fonction pour construire l'URL de l'image de manière sécurisée
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    
    // Si l'image commence déjà par http, c'est une URL complète
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Sinon, on ajoute le BASE_URL
    return `${AUTH_BASE_URL}${imagePath}`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-black">
        <div className="container mx-auto px-4 py-10">
          {/* Enhanced Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="ghost" 
              className="mb-8 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full px-6 py-3 transition-all duration-300" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </motion.div>

          <div className="flex flex-col xl:flex-row gap-12">
            {/* Enhanced Images Section */}
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl overflow-hidden shadow-2xl mb-6">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImageIndex}
                    src={getImageUrl(productImages[selectedImageIndex])}
                    alt={product.name}
                    className="w-full h-[600px] object-contain p-8"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    onError={(e) => {
                      console.log("Erreur de chargement d'image détaillée, utilisation du placeholder");
                      const target = e.target as HTMLImageElement;
                      target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </AnimatePresence>
                
                {/* Enhanced Promotional Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  {isPromotionActive && (
                    <motion.div
                      initial={{ scale: 0, rotate: -12 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="relative"
                    >
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 text-lg font-bold rounded-full shadow-xl">
                        <Zap className="h-5 w-5 mr-2" />
                        -{product.promotion}% OFF
                      </Badge>
                    </motion.div>
                  )}
                  
                  {product.dateAjout && new Date().getTime() - new Date(product.dateAjout).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-lg font-bold rounded-full shadow-xl">
                      ✨ Nouveau
                    </Badge>
                  )}
                </div>

                {/* Enhanced Timer */}
                {isPromotionActive && remainingTime && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 right-6 bg-black/90 text-white px-4 py-3 rounded-2xl text-sm flex items-center backdrop-blur-sm shadow-xl"
                  >
                    <Clock className="h-4 w-4 mr-2 animate-pulse text-red-400" />
                    <span className="font-semibold">{remainingTime}</span>
                  </motion.div>
                )}
              </div>

              {/* Enhanced Image Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex justify-center flex-wrap gap-4">
                  {productImages.map((image, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-24 h-24 overflow-hidden rounded-2xl cursor-pointer border-3 transition-all duration-300 shadow-lg hover:shadow-xl ${
                        index === selectedImageIndex 
                          ? 'border-red-500 ring-4 ring-red-200 dark:ring-red-800' 
                          : 'border-transparent hover:border-red-300'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} - image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Enhanced Product Information */}
            <motion.div 
              className="flex-1 xl:max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Enhanced Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="px-4 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 border-gray-200 dark:border-neutral-600 rounded-full">
                    {product.category}
                  </Badge>
                  {product.dateAjout && new Date().getTime() - new Date(product.dateAjout).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                      Nouveau
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl xl:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                  {product.name}
                </h1>
              </div>
              
              {/* Enhanced Price Section */}
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-lg">
                {isPromotionActive ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <p className="text-2xl text-gray-500 line-through">
                        {typeof product.originalPrice === 'number'
                          ? product.originalPrice.toFixed(2)
                          : product.price.toFixed(2)}{' '}
                        €
                      </p>
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 text-lg font-bold rounded-full shadow-md">
                        -{product.promotion}%
                      </Badge>
                    </div>
                    <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                      {product.price.toFixed(2)} €
                    </p>
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <Check className="h-5 w-5" />
                      <span>Vous économisez {((typeof product.originalPrice === 'number' ? product.originalPrice : product.price) - product.price).toFixed(2)} €</span>
                    </div>
                    {remainingTime && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <div className="flex items-center text-red-700 dark:text-red-400">
                          <Clock className="h-5 w-5 mr-2 animate-pulse" />
                          <span className="font-semibold">Promotion se termine dans: {remainingTime}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {product.price.toFixed(2)} €
                  </p>
                )}
              </div>

              {/* Enhanced Tabs Section */}
              <Tabs defaultValue="description" className="mb-8">
                <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-100 dark:bg-neutral-800 rounded-2xl p-1">
                  <TabsTrigger value="description" className="rounded-xl font-semibold">Description</TabsTrigger>
                  <TabsTrigger value="details" className="rounded-xl font-semibold">Détails</TabsTrigger>
                  <TabsTrigger value="delivery" className="rounded-xl font-semibold">Livraison</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900 rounded-2xl mt-4 border border-gray-200 dark:border-neutral-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg">
                    {product.description}
                  </p>
                </TabsContent>
                
                <TabsContent value="details" className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900 rounded-2xl mt-4 border border-gray-200 dark:border-neutral-700">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-xl">
                      <span className="font-semibold text-gray-900 dark:text-white">Catégorie:</span>
                      <span className="text-gray-700 dark:text-gray-300">{product.category}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-xl">
                      <span className="font-semibold text-gray-900 dark:text-white">Disponibilité:</span>
                      <span className={`font-bold ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                        {isInStock ? '✅ En stock' : '❌ Rupture de stock'}
                      </span>
                    </div>
                    {product.stock !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-xl">
                        <span className="font-semibold text-gray-900 dark:text-white">Stock:</span>
                        <span className="text-blue-600 font-bold">{product.stock} unité{product.stock > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {product.dateAjout && (
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-xl">
                        <span className="font-semibold text-gray-900 dark:text-white">Date d'ajout:</span>
                        <span className="text-gray-700 dark:text-gray-300">{new Date(product.dateAjout).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="delivery" className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900 rounded-2xl mt-4 border border-gray-200 dark:border-neutral-700">
                  <div className="space-y-4">
                    <div className="flex items-start p-4 bg-white dark:bg-neutral-800 rounded-xl">
                      <Truck className="h-6 w-6 mr-4 text-green-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Livraison standard</p>
                        <p className="text-gray-600 dark:text-gray-400">3-5 jours ouvrés • Gratuite dès 50€</p>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-white dark:bg-neutral-800 rounded-xl">
                      <Shield className="h-6 w-6 mr-4 text-blue-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Retours gratuits</p>
                        <p className="text-gray-600 dark:text-gray-400">30 jours pour changer d'avis</p>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-white dark:bg-neutral-800 rounded-xl">
                      <Package className="h-6 w-6 mr-4 text-purple-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Emballage sécurisé</p>
                        <p className="text-gray-600 dark:text-gray-400">Protection optimale de vos produits</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Enhanced Quantity & Actions */}
              <div className="space-y-6">
                {/* Enhanced Quantity Selector */}
                <div className="flex items-center gap-6">
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">Quantité:</span>
                  <div className="flex items-center border-2 border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                    >
                      -
                    </button>
                    <span className="px-8 py-3 border-x-2 border-gray-200 dark:border-neutral-700 min-w-[80px] text-center font-bold text-lg bg-gray-50 dark:bg-neutral-750">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={product.stock !== undefined && quantity >= product.stock}
                      className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                    >
                      +
                    </button>
                  </div>
                  {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
                    <span className="text-orange-600 font-semibold">
                      ⚠️ Plus que {product.stock} disponible{product.stock > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    className={`flex-1 h-16 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
                      addedToCart 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    } disabled:opacity-50`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="mr-3 h-6 w-6" />
                        Ajouté au panier
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-3 h-6 w-6" />
                        Ajouter au panier
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 w-16 border-2 border-gray-300 dark:border-neutral-700 rounded-2xl hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 transition-all duration-300"
                    onClick={() => toggleFavorite(product)}
                  >
                    <Heart
                      className={`h-6 w-6 ${isProductFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'} transition-colors`}
                    />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 w-16 border-2 border-gray-300 dark:border-neutral-700 rounded-2xl hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 transition-all duration-300"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Lien copié dans le presse-papier");
                    }}
                  >
                    <Share2 className="h-6 w-6 text-gray-600" />
                  </Button>
                </div>

                {/* Enhanced Stock Warning */}
                {!isInStock && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-900/30 rounded-2xl"
                  >
                    <div className="flex items-center text-red-700 dark:text-red-400">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Ce produit est actuellement en rupture de stock.</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Enhanced Reviews Section */}
          <motion.div 
            className="mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="border-b border-gray-200 dark:border-neutral-800 mb-10 pb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Avis clients
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Découvrez ce que pensent nos clients de ce produit</p>
            </div>
            {productId && (
              <ProductReviews productId={productId} />
            )}
          </motion.div>

          {/* Enhanced Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <FeaturedProductsSlider 
                products={relatedProducts} 
                title="Produits similaires" 
                description="Vous pourriez également aimer ces produits dans la même catégorie"
                seeAllLink={`/categorie/${product.category}`}
                slidesToShow={4}
              />
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
