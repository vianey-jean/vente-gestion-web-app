import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import FeaturedProductsSlider from '@/components/products/FeaturedProductsSlider';
import ProductReviews from '@/components/reviews/ProductReviews';
import ProductDetailHeader from '@/components/products/product-detail-header';
import ProductDetailPrice from '@/components/products/product-detail-price';
import ProductDetailActions from '@/components/products/product-detail-actions';
import SEOHead from '@/components/seo/SEOHead';
import LuxuryCard from '@/components/ui/luxury-card';
import { getRealId, isValidSecureId, getEntityType } from '@/services/secureIds';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from '@/types/product';

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
    
    // Vérifier si l'ID existe
    if (!secureProductId) {
      setIsValidId(false);
      toast.error("Produit non trouvé");
      navigate('/page/notfound', { replace: true });
      return;
    }
    
    // Vérifier si c'est un ID produit valide
    const isValid = isValidSecureId(secureProductId);
    const entityType = getEntityType(secureProductId);
    
    console.log('ProductDetail - Validation:', { isValid, entityType, productId });
    
    if (!isValid) {
      setIsValidId(false);
      toast.error("Ce lien n'est plus valide");
      navigate('/page/notfound', { replace: true });
    } else {
      // Trouver le produit correspondant à l'ID réel
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

  // Timer pour les promotions
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <Skeleton className="w-full h-[300px] rounded-xl mb-3" />
              <div className="flex justify-center space-x-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-16 h-16 rounded-md" />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <Skeleton className="w-3/4 h-6 mb-2" />
              <Skeleton className="w-1/2 h-5 mb-4" />
              <Skeleton className="w-1/4 h-4 mb-6" />
              <Skeleton className="w-full h-24 mb-4" />
              <div className="flex space-x-4">
                <Skeleton className="w-1/3 h-8" />
                <Skeleton className="w-1/3 h-8" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isValidId || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <p className="mb-6 text-gray-600 max-w-md mx-auto">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
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
        
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${AUTH_BASE_URL}${imagePath}`;
  };

  return (
    <HelmetProvider>
      <SEOHead
        title={product.name}
        description={product.description}
        keywords={`${product.category}, ${product.name}, produits capillaires`}
        type="product"
        price={product.price}
        availability={isInStock ? 'in_stock' : 'out_of_stock'}
        image={getImageUrl(productImages[0])}
      />
      
      <Layout>
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            className="mb-3 flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images Section */}
            <LuxuryCard className="p-3" gradient>
              <div className="mb-2 relative bg-neutral-50 dark:bg-neutral-900 rounded-xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImageIndex}
                    src={getImageUrl(productImages[selectedImageIndex])}
                    alt={product.name}
                    className="w-full h-[300px] object-contain rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </AnimatePresence>
                
                {isPromotionActive && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    -{product.promotion}%
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex justify-center flex-wrap gap-1 mt-2">
                  {productImages.map((image, index) => (
                    <div
                      key={index}
                      className={`w-14 h-14 overflow-hidden rounded-lg cursor-pointer border-2 transition-all duration-300 ${
                        index === selectedImageIndex 
                          ? 'border-red-500 shadow-lg ring-2 ring-red-200' 
                          : 'border-transparent hover:border-red-300'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} - image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </LuxuryCard>

            {/* Product Info Section */}
            <div className="space-y-4">
              <ProductDetailHeader 
                product={product}
                isPromotionActive={isPromotionActive}
                remainingTime={remainingTime}
              />
              
              <ProductDetailPrice 
                product={product}
                isPromotionActive={isPromotionActive}
              />

              <LuxuryCard className="p-3" gradient>
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-neutral-100 dark:bg-neutral-800">
                    <TabsTrigger value="description" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 text-xs">
                      Description
                    </TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 text-xs">
                      Détails
                    </TabsTrigger>
                    <TabsTrigger value="delivery" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 text-xs">
                      Livraison
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg mt-2">
                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line text-xs">
                      {product.description}
                    </p>
                  </TabsContent>
                  <TabsContent value="details" className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg mt-2">
                    <ul className="space-y-1 text-neutral-700 dark:text-neutral-300 text-xs">
                      <li className="flex items-start">
                        <span className="font-medium w-20">Catégorie:</span>
                        <span>{product.category}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium w-20">Disponibilité:</span>
                        <span className={isInStock ? 'text-green-600' : 'text-red-600'}>
                          {isInStock ? 'En stock' : 'Rupture de stock'}
                        </span>
                      </li>
                      {product.stock !== undefined && (
                        <li className="flex items-start">
                          <span className="font-medium w-20">Stock:</span>
                          <span>{product.stock} unité{product.stock > 1 ? 's' : ''}</span>
                        </li>
                      )}
                      {product.dateAjout && (
                        <li className="flex items-start">
                          <span className="font-medium w-20">Date d'ajout:</span>
                          <span>{new Date(product.dateAjout).toLocaleDateString('fr-FR')}</span>
                        </li>
                      )}
                    </ul>
                  </TabsContent>
                  <TabsContent value="delivery" className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg mt-2">
                    <ul className="space-y-1">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck h-3 w-3 mr-2 text-green-600 shrink-0 mt-0.5"><rect width="18" height="9" x="3" y="8" rx="2" ry="2"/><path d="M5 14H3v5h2"/><path d="M19 14h2v5h-2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>
                        <div>
                          <p className="font-medium text-xs">Livraison standard</p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">3-5 jours ouvrés</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield h-3 w-3 mr-2 text-green-600 shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <div>
                          <p className="font-medium text-xs">Retours</p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Retours gratuits sous 30 jours</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3 mr-2 text-green-600 shrink-0 mt-0.5"><path d="M20 6 9 17 4 12"/></svg>
                        <div>
                          <p className="font-medium text-xs">Livraison gratuite</p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Pour les commandes supérieures à 50€</p>
                        </div>
                      </li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </LuxuryCard>

              <ProductDetailActions
                product={product}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                onAddToCart={handleAddToCart}
                onToggleFavorite={() => toggleFavorite(product)}
                onShare={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Lien copié dans le presse-papier");
                }}
                isProductFavorite={isProductFavorite}
                isInStock={isInStock}
                addedToCart={addedToCart}
              />
            </div>
          </div>
          
          {/* Reviews Section */}
          <LuxuryCard className="mt-6 p-4" gradient>
            <div className="border-b border-neutral-200 dark:border-neutral-800 mb-3">
              <h2 className="text-lg font-bold mb-2 bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                Avis clients
              </h2>
            </div>
            {productId && <ProductReviews productId={productId} />}
          </LuxuryCard>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-6">
              <FeaturedProductsSlider 
                products={relatedProducts} 
                title="Produits similaires" 
                description="Vous pourriez également aimer ces produits dans la même catégorie"
                seeAllLink={`/categorie/${product.category}`}
                slidesToShow={4}
              />
            </div>
          )}
        </div>
      </Layout>
    </HelmetProvider>
  );
};

export default ProductDetail;
