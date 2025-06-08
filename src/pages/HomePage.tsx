
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import ProductCatalogGrid from '@/components/products/ProductGrid';
import CustomerTestimonialSection from '@/components/reviews/TestimonialSection';
import DataRetryLoader from '@/components/data-loading/DataRetryLoader';
import HeroSection from '@/components/home/hero-section';
import FeaturesGrid from '@/components/home/features-grid';
import FeaturedProductsCarousel from '@/components/home/FeaturedProductsCarousel';
import PromotionalProductsGrid from '@/components/home/PromotionalProductsGrid';
import FlashSaleBanner from '@/components/flash-sale/FlashSaleBanner';
import SEOHead from '@/components/seo/SEOHead';
import LuxuryCard from '@/components/ui/luxury-card';
import { useHomePageData } from '@/hooks/useHomePageData';
import { useCarouselAutoplay } from '@/hooks/useCarouselAutoplay';
import SalesNotification from '@/components/engagement/SalesNotification';
import LiveVisitorCounter from '@/components/engagement/LiveVisitorCounter';
import { TrendingUp, Star, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const {
    featuredProductCatalog,
    newArrivalProducts,
    promotionalProducts,
    completeProductCatalog,
    filteredProductCatalog,
    dataLoadingComplete,
    setFilteredProductCatalog,
    loadEcommerceProductData,
    handleDataLoadingSuccess,
    handleMaxRetriesReached
  } = useHomePageData();

  useCarouselAutoplay(!searchParams.get('q'), dataLoadingComplete, featuredProductCatalog.length);

  React.useEffect(() => {
    const searchQuery = searchParams.get('q');
    
    if (searchQuery && searchQuery.length >= 3) {
      const filteredResults = completeProductCatalog.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProductCatalog(filteredResults);
    } else {
      setFilteredProductCatalog(completeProductCatalog);
    }
  }, [searchParams, completeProductCatalog, setFilteredProductCatalog]);

  return (
    <HelmetProvider>
      <SEOHead
        title="Accueil"
        description="Riziky Boutique - Spécialiste en produits capillaires premium. Découvrez notre collection de perruques, tissages, et accessoires de beauté de qualité exceptionnelle."
        keywords="produits capillaires, perruques, tissages, accessoires beauté, cosmétiques, soins cheveux"
        type="website"
      />
      
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
          <HeroSection />
          
          <div className="container mx-auto px-4 py-8 space-y-16">
            <DataRetryLoader
              fetchFunction={loadEcommerceProductData}
              onSuccess={handleDataLoadingSuccess}
              onMaxRetriesReached={handleMaxRetriesReached}
              maxRetries={6}
              retryInterval={5000}
              errorMessage="Erreur de chargement des produits"
              loadingComponent={
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                  <h2 className="text-xl text-blue-700 font-bold mb-2">
                    <strong>Chargement de votre boutique...</strong>
                  </h2>
                  <p className="text-red-900 font-bold">Connexion au serveur en cours...</p>
                </div>
              }
            >
              {searchParams.get('q') && (
                <LuxuryCard className="p-8" gradient>
                  <ProductCatalogGrid
                    products={filteredProductCatalog}
                    title={`Résultats de recherche : "${searchParams.get('q')}"`}
                  />
                </LuxuryCard>
              )}

              {!searchParams.get('q') && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FlashSaleBanner />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <LuxuryCard className="p-8" gradient shadow="xl">
                      <FeaturedProductsCarousel products={featuredProductCatalog} />
                    </LuxuryCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <LuxuryCard className="p-8" gradient shadow="xl">
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl shadow-lg">
                            <TrendingUp className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          Promotions Exceptionnelles
                        </h2>
                      </div>
                      <PromotionalProductsGrid products={promotionalProducts} />
                    </LuxuryCard>
                  </motion.div>

                  <FeaturesGrid />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <LuxuryCard className="p-8" gradient shadow="xl">
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-2xl shadow-lg">
                            <Star className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Dernières Nouveautés
                        </h2>
                      </div>
                      <ProductCatalogGrid products={newArrivalProducts} title="" />
                    </LuxuryCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <LuxuryCard className="p-8" gradient shadow="xl">
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                            <ShoppingBag className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Notre Catalogue Complet
                        </h2>
                      </div>
                      <ProductCatalogGrid 
                        products={completeProductCatalog} 
                        title="" 
                        showViewAllButton={true}
                      />
                    </LuxuryCard>
                  </motion.div>

                  <LuxuryCard className="p-8" gradient shadow="xl">
                    <CustomerTestimonialSection />
                  </LuxuryCard>
                </>
              )}
            </DataRetryLoader>
          </div>

          <SalesNotification />
          <LiveVisitorCounter />
        </div>
      </Layout>
    </HelmetProvider>
  );
};

export default HomePage;
