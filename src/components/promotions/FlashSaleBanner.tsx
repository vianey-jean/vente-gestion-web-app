
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { flashSalesAPI, FlashSale } from '@/services/flashSalesAPI';
import { productsAPI } from '@/services/productsAPI';
import { Product } from '@/types/product';
import { useNavigate } from 'react-router-dom';

const FlashSaleBanner: React.FC = () => {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveFlashSale = async () => {
      try {
        const response = await flashSalesAPI.getActive();
        const activeFlashSale = response.data;
        
        if (activeFlashSale) {
          setFlashSale(activeFlashSale);
          setIsVisible(true);
          
          // Fetch products for this flash sale
          const productsResponse = await productsAPI.getAll();
          const allProducts = productsResponse.data || [];
          const flashSaleProducts = allProducts.filter(product => 
            activeFlashSale.productIds.includes(product.id)
          );
          setProducts(flashSaleProducts);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la vente flash:', error);
      }
    };

    fetchActiveFlashSale();
  }, []);

  useEffect(() => {
    if (!flashSale) return;

    const calculateTimeLeft = () => {
      const difference = new Date(flashSale.endTime).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        // Flash sale expired, hide banner
        setIsVisible(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [flashSale]);

  const handleViewOffers = () => {
    // Navigate to products page or show flash sale products
    navigate('/products');
  };

  if (!flashSale || !isVisible) {
    return null;
  }

  const progressPercentage = flashSale.totalItems > 0 
    ? ((flashSale.itemsSold / flashSale.totalItems) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="my-6"
    >
      <Card className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 text-white overflow-hidden relative">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-yellow-300 animate-pulse" />
              <h2 className="text-2xl font-bold">{flashSale.title}</h2>
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                -{flashSale.discount}%
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Se termine dans:</span>
              </div>
              
              <div className="flex space-x-2">
                {[
                  { label: 'H', value: timeLeft.hours },
                  { label: 'M', value: timeLeft.minutes },
                  { label: 'S', value: timeLeft.seconds }
                ].map((time, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-black/30 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
                      <div className="text-xl font-bold">
                        {time.value.toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-xs mt-1">{time.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full lg:mr-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  {products.length} produits en promotion
                </span>
                <span>Vendus: {flashSale.itemsSold}</span>
              </div>
              
              {flashSale.totalItems > 0 && (
                <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full"
                  />
                </div>
              )}
              
              {products.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {products.slice(0, 3).map((product) => (
                    <span key={product.id} className="text-xs bg-white/20 px-2 py-1 rounded">
                      {product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name}
                    </span>
                  ))}
                  {products.length > 3 && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">
                      +{products.length - 3} autres
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <Button 
              variant="secondary" 
              className="bg-white text-red-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-full"
              onClick={handleViewOffers}
            >
              Voir les offres
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Animation de fond */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default FlashSaleBanner;
