import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { productsAPI, codePromosAPI } from '@/services/api';
import { Heart, ShoppingCart, TruckIcon, RefreshCcw, Shield, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/reviews/StarRating';
import ProductReviews from '@/components/reviews/ProductReviews';

interface ProductDetailProps {}

const verifyCodePromo = async (code: string, productId: string) => {
  try {
    const response = await codePromosAPI.verify(code, productId);
    return response.data;
  } catch (error) {
    console.error("Error verifying code promo:", error);
    throw new Error("Failed to verify code promo");
  }
};

const ProductDetail: React.FC<ProductDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, addToCart, toggleFavorite, isFavorite } = useStore();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const product = getProductById(id || '');
        if (product) {
          setProduct(product);
        } else {
          const response = await productsAPI.getById(id || '');
          setProduct(response.data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, getProductById]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-800"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Product not found.</p>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
  };

  const isProductFavorite = isFavorite(product.id);

  const calculateDiscountedPrice = () => {
    // Make sure product.price exists and is a number
    if (!product || typeof product.price !== 'number') {
      console.error("Product price is undefined or not a number:", product);
      return "0.00";
    }
    
    if (product.promotion && product.promotion > 0) {
      return (product.price * (1 - product.promotion / 100)).toFixed(2);
    }
    return product.price.toFixed(2);
  };

  const discountedPrice = calculateDiscountedPrice();

  return (
    <Layout>
      <div className="container mx-auto mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            {product.images && product.images.length > 0 ? (
              <Tabs defaultValue={`image-${product.images[0]}`}>
                <TabsList className="flex space-x-4">
                  {product.images.map((image, index) => (
                    <TabsTrigger key={index} value={`image-${image}`} className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
                      <img
                        src={`${AUTH_BASE_URL}${image}`}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="h-16 w-16 object-cover rounded-md cursor-pointer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </TabsTrigger>
                  ))}
                </TabsList>
                {product.images.map((image, index) => (
                  <TabsContent key={index} value={`image-${image}`} className="mt-4">
                    <img
                      src={`${AUTH_BASE_URL}${image}`}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-auto rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <img
                src={`${AUTH_BASE_URL}${product.image}`}
                alt={product.name}
                className="w-full h-auto rounded-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <StarRating rating={4.5} />
              <span className="text-gray-500 ml-2">(123 avis)</span>
            </div>

            <div className="flex items-center mb-4">
              {product.promotion && product.promotion > 0 ? (
                <>
                  <span className="text-red-600 text-2xl font-bold mr-2">{discountedPrice} €</span>
                  <span className="text-gray-500 line-through">{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'} €</span>
                  <Badge className="ml-2">-{product.promotion}%</Badge>
                </>
              ) : (
                <span className="text-2xl font-bold">{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'} €</span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex items-center space-x-4 mb-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div className="mt-1">
                  <Input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.stock || 10}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="shadow-sm focus:ring-red-800 focus:border-red-800 sm:text-sm border-gray-300 rounded-md w-20"
                  />
                </div>
              </div>
              <Button onClick={handleAddToCart} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <Button variant="outline" onClick={handleToggleFavorite}>
                <Heart className="mr-2 h-4 w-4" fill={isProductFavorite ? 'currentColor' : 'none'} />
                {isProductFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            </div>

            <Separator className="mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="flex items-center space-x-4">
                  <TruckIcon className="text-red-800 h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-medium">Livraison rapide</h3>
                    <p className="text-sm text-gray-500">Livraison en 24-48h</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center space-x-4">
                  <RefreshCcw className="text-red-800 h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-medium">Retours faciles</h3>
                    <p className="text-sm text-gray-500">30 jours pour changer d'avis</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center space-x-4">
                  <Shield className="text-red-800 h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-medium">Paiement sécurisé</h3>
                    <p className="text-sm text-gray-500">Vos données sont protégées</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="mb-4" />

            {/* Product Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  {product.description}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="details">
                <AccordionTrigger>Details</AccordionTrigger>
                <AccordionContent>
                  More details about the product will be displayed here.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                <AccordionContent>
                  Information about shipping and returns.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* Product Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
