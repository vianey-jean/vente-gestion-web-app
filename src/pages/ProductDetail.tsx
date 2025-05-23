
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { productsAPI, Product } from '@/services/api';
import { useStore } from '@/contexts/StoreContext';
import { Heart, ShoppingCart, ArrowLeft, Share, CalendarClock, Check } from 'lucide-react';
import ProductReviews from '@/components/reviews/ProductReviews';
import { toast } from '@/components/ui/sonner';

// URL de base pour les images
const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isFavorite, toggleFavorite } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        console.log('Fetching product with ID:', id);
        const response = await productsAPI.getById(id);
        const fetchedProduct = response.data;
        console.log('Fetched product:', fetchedProduct);
        setProduct(fetchedProduct);
        
        // Set the first image as the current image
        if (fetchedProduct.images && fetchedProduct.images.length > 0) {
          setCurrentImage(fetchedProduct.images[0]);
        } else if (fetchedProduct.image) {
          setCurrentImage(fetchedProduct.image);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => {
      const newValue = prev + change;
      if (newValue < 1) return 1;
      if (product?.stock !== undefined && newValue > product.stock) {
        toast.error(`Quantité limitée à ${product.stock}`);
        return product.stock;
      }
      return newValue;
    });
  };

  const handleImageClick = (image: string) => {
    setCurrentImage(image);
  };

  const handleFavoriteToggle = () => {
    if (product) {
      toggleFavorite(product);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Produit',
        text: product?.description || 'Découvrez ce produit',
        url: window.location.href
      }).catch(err => console.error('Erreur lors du partage:', err));
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  const calculateDiscountedPrice = (product: Product): number => {
    if (!product || product.price === undefined) {
      console.log('Warning: Product or product price is undefined');
      return 0;
    }
    
    if (product.promotion && product.promotion > 0) {
      return product.price * (1 - product.promotion / 100);
    }
    return product.price;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Chargement du produit...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Produit non trouvé</h2>
            <Link to="/" className="text-blue-500 hover:underline">Retour à l'accueil</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const discountedPrice = calculateDiscountedPrice(product);
  const inStock = product.stock === undefined || product.stock > 0;
  const isPromotional = product.promotion && product.promotion > 0;
  
  // Image path handling
  const mainImageUrl = currentImage 
    ? `${AUTH_BASE_URL}${currentImage.startsWith('/') ? currentImage : `/${currentImage}`}`
    : `${AUTH_BASE_URL}/uploads/placeholder.jpg`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour aux produits
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Product Images */}
          <div>
            <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={mainImageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `${AUTH_BASE_URL}/uploads/placeholder.jpg`;
                }} 
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer ${
                      currentImage === image ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleImageClick(image)}
                  >
                    <img 
                      src={`${AUTH_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`} 
                      alt={`${product.name} - Vue ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `${AUTH_BASE_URL}/uploads/placeholder.jpg`;
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-semibold">
                {discountedPrice.toFixed(2)} €
              </span>
              {isPromotional && (
                <span className="text-gray-500 line-through text-sm">
                  {product.price !== undefined ? product.price.toFixed(2) : '0.00'} €
                </span>
              )}
              {isPromotional && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  -{product.promotion}%
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            {/* Product Availability */}
            <div className="flex items-center mb-6">
              {inStock ? (
                <div className="flex items-center text-green-600">
                  <Check className="w-5 h-5 mr-1" />
                  <span className="font-medium">En stock</span>
                  {product.stock !== undefined && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({product.stock} disponibles)
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-red-600 font-medium">Rupture de stock</span>
              )}
            </div>
            
            {/* Promotion Info */}
            {isPromotional && product.promotionEnd && (
              <div className="flex items-center mb-6 bg-amber-50 p-3 rounded-md">
                <CalendarClock className="w-5 h-5 mr-2 text-amber-600" />
                <span className="text-sm">
                  Promotion valable jusqu'au <strong>{formatDate(product.promotionEnd)}</strong>
                </span>
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <span className="mr-4">Quantité:</span>
              <div className="flex items-center border rounded-md">
                <button 
                  onClick={() => handleQuantityChange(-1)} 
                  className="px-3 py-1 border-r"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)} 
                  className="px-3 py-1 border-l"
                  disabled={product.stock !== undefined && quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button 
                onClick={handleAddToCart} 
                className="flex-1"
                disabled={!inStock}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ajouter au panier
              </Button>
              
              <Button 
                onClick={handleFavoriteToggle} 
                variant={isFavorite(product.id) ? "default" : "outline"}
                className={isFavorite(product.id) ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <Heart className={`w-4 h-4 ${isFavorite(product.id) ? "fill-current" : ""}`} />
              </Button>
              
              <Button 
                onClick={handleShare} 
                variant="outline"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Additional Info */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex">
                <span className="font-medium w-24">Catégorie:</span>
                <Link to={`/categorie/${product.category}`} className="text-blue-600 hover:underline">
                  {product.category}
                </Link>
              </div>
              <div className="flex">
                <span className="font-medium w-24">Marque:</span>
                <span>{product.brand || 'Non spécifié'}</span>
              </div>
              {product.sku && (
                <div className="flex">
                  <span className="font-medium w-24">Référence:</span>
                  <span>{product.sku}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Avis clients</h2>
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
