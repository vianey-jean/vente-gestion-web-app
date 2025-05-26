
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { flashSalesAPI, FlashSale } from '@/services/flashSalesAPI';
import { productsAPI } from '@/services/productsAPI';
import { Product } from '@/types/product';
import { Link } from 'react-router-dom';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const FlashSaleBannerWidget: React.FC = () => {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchActiveFlashSale = async () => {
      try {
        const response = await flashSalesAPI.getActive();
        if (response.data) {
          setFlashSale(response.data);
          
          // Charger les produits de la flash sale
          const productsResponse = await productsAPI.getAll();
          const flashSaleProducts = productsResponse.data.filter(product => 
            response.data.productIds.includes(product.id)
          );
          setProducts(flashSaleProducts);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la flash sale:', error);
      }
    };

    fetchActiveFlashSale();
  }, []);

  useEffect(() => {
    if (!flashSale) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(flashSale.endTime);
      const difference = endTime.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        setIsVisible(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [flashSale]);

  if (!flashSale || !isVisible || isExpired) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 text-white overflow-hidden relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Zap className="h-8 w-8 text-yellow-300 animate-pulse" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{flashSale.title}</h2>
                  <p className="text-white/80">Offre limitée dans le temps !</p>
                </div>
                <Badge className="bg-yellow-400 text-black font-bold text-lg px-4 py-2">
                  -{flashSale.discount}%
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-medium">Se termine dans:</span>
                </div>
                
                <div className="flex space-x-2">
                  {[
                    { label: 'H', value: timeLeft.hours },
                    { label: 'M', value: timeLeft.minutes },
                    { label: 'S', value: timeLeft.seconds }
                  ].map((time, index) => (
                    <motion.div 
                      key={index} 
                      className="text-center"
                      animate={{ scale: time.label === 'S' ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 1, repeat: time.label === 'S' ? Infinity : 0 }}
                    >
                      <div className="bg-black/30 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
                        <div className="text-xl font-bold">
                          {time.value.toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div className="text-xs mt-1">{time.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {products.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {products.slice(0, 4).map((product, index) => (
                    <motion.img
                      key={product.id}
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  ))}
                  {products.length > 4 && (
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-black/30 flex items-center justify-center text-sm font-bold">
                      +{products.length - 4}
                    </div>
                  )}
                </div>
                
                <Button 
                  asChild
                  variant="secondary" 
                  className="bg-white text-red-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-full"
                >
                  <Link to="/tous-les-produits">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Voir les offres
                  </Link>
                </Button>
              </div>
            )}
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
    </AnimatePresence>
  );
};

export default FlashSaleBannerWidget;
