
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Flame, Clock, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

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

        // Étape 1: Récupérer les ventes flash
        const flashSaleResponse = await fetch('/server/data/flash-sales.json');
        if (!flashSaleResponse.ok) {
          throw new Error('Impossible de charger les ventes flash');
        }
        const flashSales: FlashSale[] = await flashSaleResponse.json();
        console.log('📦 Toutes les ventes flash récupérées:', flashSales);

        // Étape 2: Trouver la vente flash par ID
        const foundFlashSale = flashSales.find(sale => sale.id === id);
        console.log('🎯 Vente flash trouvée pour ID', id, ':', foundFlashSale);

        if (!foundFlashSale) {
          console.error('❌ Aucune vente flash trouvée pour l\'ID:', id);
          setFlashSale(null);
          setIsLoading(false);
          return;
        }

        setFlashSale(foundFlashSale);

        // Étape 3: Extraire les IDs des produits (enlever les guillemets et nettoyer)
        const productIds = foundFlashSale.productIds.map(productId => {
          // Enlever les guillemets et espaces si présents
          const cleanId = productId.toString().replace(/['"]/g, '').trim();
          return cleanId;
        });
        
        console.log('🔢 IDs des produits nettoyés:', productIds);
        console.log('📊 Nombre d\'IDs à rechercher:', productIds.length);

        // Étape 4: Récupérer tous les produits
        const productsResponse = await fetch('/server/data/products.json');
        if (!productsResponse.ok) {
          throw new Error('Impossible de charger les produits');
        }
        const allProducts: Product[] = await productsResponse.json();
        console.log('📚 Tous les produits récupérés:', allProducts);
        console.log('📊 Nombre total de produits disponibles:', allProducts.length);

        // Étape 5: Filtrer et récupérer les produits correspondants
        const matchingProducts: Product[] = [];
        
        productIds.forEach(targetId => {
          console.log(`🔍 Recherche du produit avec ID: "${targetId}"`);
          
          const foundProduct = allProducts.find(product => {
            const productIdClean = product.id.toString().trim();
            const isMatch = productIdClean === targetId;
            console.log(`   Comparaison: "${productIdClean}" === "${targetId}" -> ${isMatch}`);
            return isMatch;
          });
          
          if (foundProduct) {
            console.log(`✅ Produit trouvé:`, {
              id: foundProduct.id,
              name: foundProduct.name,
              price: foundProduct.price,
              category: foundProduct.category,
              image: foundProduct.image
            });
            matchingProducts.push(foundProduct);
          } else {
            console.log(`❌ Aucun produit trouvé pour l'ID: "${targetId}"`);
          }
        });

        console.log('🎯 Produits correspondants trouvés:', matchingProducts);
        console.log('📊 Nombre de produits trouvés:', matchingProducts.length);

        // Étape 6: Appliquer la réduction et préparer les données finales
        const discountPercentage = foundFlashSale.discount;
        console.log(`💰 Réduction à appliquer: ${discountPercentage}%`);

        const productsWithDiscount = matchingProducts.map(product => {
          const originalPrice = product.price;
          const discountAmount = (originalPrice * discountPercentage) / 100;
          const discountedPrice = +(originalPrice - discountAmount).toFixed(2);
          
          console.log(`💸 Calcul de réduction pour "${product.name}":`, {
            prixOriginal: originalPrice,
            reduction: `${discountPercentage}%`,
            montantReduction: discountAmount,
            prixReduit: discountedPrice
          });
          
          return {
            ...product,
            originalPrice: originalPrice,
            price: discountedPrice,
            promotion: discountPercentage,
            promotionEnd: foundFlashSale.endDate,
          };
        });

        console.log('🎊 Produits finaux avec réductions appliquées:', productsWithDiscount);
        setFlashSaleProducts(productsWithDiscount);

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
              <p className="text-sm text-gray-500 mt-2">
                IDs recherchés: {flashSale.productIds.join(', ')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {flashSaleProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
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
          
          {/* Informations de debug détaillées */}
          <div className="mt-4 p-4 bg-blue-100 rounded">
            <p className="font-medium text-blue-900 mb-2">Informations de debug:</p>
            <p className="text-xs text-blue-700 mb-1">ID de la vente flash: {flashSale.id}</p>
            <p className="text-xs text-blue-700 mb-1">IDs des produits dans flash-sale: {flashSale.productIds.join(', ')}</p>
            <p className="text-xs text-blue-700 mb-1">Nombre de produits attendus: {flashSale.productIds.length}</p>
            <p className="text-xs text-blue-700 mb-1">Nombre de produits trouvés: {flashSaleProducts.length}</p>
            
            {flashSaleProducts.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-blue-700 font-medium">Produits récupérés:</p>
                {flashSaleProducts.map((product, index) => (
                  <p key={product.id} className="text-xs text-blue-600 ml-2">
                    {index + 1}. {product.name} - Prix original: {product.originalPrice}€ - Prix réduit: {product.price}€
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FlashSalePage;
