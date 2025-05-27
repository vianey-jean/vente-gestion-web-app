
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Flame, Clock, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { flashSaleAPI } from '@/services/flashSaleAPI';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FlashSale {
  id: string;
  title: string;
  description: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds: string[];
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  isSold: boolean;
  promotion?: number | null;
  promotionEnd?: string | null;
  stock?: number;
  dateAjout?: string;
  // Nouvelles propriétés pour la bannière flash sale
  flashSaleDiscount?: number;
  flashSaleStartDate?: string;
  flashSaleEndDate?: string;
  flashSaleTitle?: string;
  flashSaleDescription?: string;
  originalFlashPrice?: number;
  flashSalePrice?: number;
}

const FlashSalePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les données de vente flash et produits
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Début du chargement des données pour Flash Sale ID:', id);

        // Étape 1: Récupérer la vente flash par ID
        const flashSaleResponse = await flashSaleAPI.getById(id!);
        const foundFlashSale = flashSaleResponse.data;
        
        console.log('🎯 Vente flash trouvée:', foundFlashSale);

        if (!foundFlashSale) {
          console.error('❌ Aucune vente flash trouvée pour l\'ID:', id);
          setFlashSale(null);
          setIsLoading(false);
          return;
        }

        setFlashSale(foundFlashSale);

        // Étape 2: Récupérer les produits de la bannière flash sale
        const banniereResponse = await flashSaleAPI.getBanniereProducts();
        const banniereProducts = banniereResponse.data;
        
        console.log('🎊 Produits bannière récupérés:', banniereProducts);

        // Filtrer les produits qui correspondent à cette vente flash
        const filteredProducts = banniereProducts.filter(product => 
          product.flashSaleTitle === foundFlashSale.title &&
          product.flashSaleDiscount === foundFlashSale.discount
        );

        console.log('🎯 Produits filtrés pour cette vente flash:', filteredProducts);
        setFlashSaleProducts(filteredProducts);

      } catch (error) {
        console.error('💥 Erreur lors du chargement des données:', error);
        setFlashSale(null);
        setFlashSaleProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Calculer le temps restant
  useEffect(() => {
    if (!flashSale) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(flashSale.endDate).getTime();
      const difference = endTime - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [flashSale]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold">Chargement de la vente flash...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  if (!flashSale) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Flame className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Vente flash non trouvée</h2>
            <p className="text-gray-600">Cette vente flash n'existe pas ou a été supprimée.</p>
            <p className="text-sm text-gray-500 mt-2">ID recherché: {id}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isExpired) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Timer className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Vente flash expirée</h2>
            <p className="text-gray-600">Cette vente flash est terminée.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const timeUnits = [
    { label: 'Jours', value: timeLeft.days },
    { label: 'Heures', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête de la vente flash */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 text-white rounded-lg p-8 mb-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Flame className="h-8 w-8 text-yellow-300 animate-pulse" />
              <h1 className="text-3xl font-bold">{flashSale.title}</h1>
              <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-lg font-bold">
                -{flashSale.discount}%
              </span>
            </div>
            
            <p className="text-xl mb-6 opacity-90">{flashSale.description}</p>
            
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Clock className="h-5 w-5" />
              <span className="text-lg font-medium">Se termine dans:</span>
            </div>
            
            <div className="flex justify-center space-x-4">
              {timeUnits.map((time, index) => (
                <motion.div
                  key={time.label}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <motion.div
                    key={time.value}
                    initial={{ rotateX: -90 }}
                    animate={{ rotateX: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-black/30 backdrop-blur rounded-lg px-4 py-3 min-w-[70px] mb-2"
                  >
                    <div className="text-2xl font-bold">
                      {time.value.toString().padStart(2, '0')}
                    </div>
                  </motion.div>
                  <div className="text-sm opacity-80">{time.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Produits en vente flash */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Produits en vente flash ({flashSaleProducts.length})
          </h2>
          
          {flashSaleProducts.length === 0 ? (
            <div className="text-center py-12">
              <Flame className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit disponible</h3>
              <p className="text-gray-600">Les produits de cette vente flash ne sont plus disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {flashSaleProducts.map((product) => {
                // Utiliser le prix flash sale si disponible
                const displayProduct = {
                  ...product,
                  price: product.flashSalePrice || product.price,
                  originalPrice: product.originalFlashPrice || product.originalPrice || product.price,
                  promotion: product.flashSaleDiscount,
                  promotionEnd: product.flashSaleEndDate
                };
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={displayProduct} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informations de debug détaillées */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Informations sur la vente flash</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">Début:</span> {new Date(flashSale.startDate).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Fin:</span> {new Date(flashSale.endDate).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Réduction:</span> {flashSale.discount}%
            </div>
            <div>
              <span className="font-medium">Produits trouvés:</span> {flashSaleProducts.length}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FlashSalePage;
