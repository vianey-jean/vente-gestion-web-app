
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import ShippingForm from '@/components/checkout/ShippingForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import LoadingOrderState from '@/components/checkout/LoadingOrderState';
import { ShippingAddress, codePromosAPI } from '@/services/api';
import { stripeService, PaymentData } from '@/services/stripeService';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

// Définition des prix de livraison par ville
const DELIVERY_PRICES = {
  "Saint-Benoît": 20,
  "Saint-Denis": 0,
  "Saint-Pierre": 20,
  "Bras-Panon": 25,
  "Entre-Deux": 20,
  "Etang-Salé": 25,
  "Petite-Île": 20,
  "Le Port": 0,
  "La Possession": 0,
  "Saint-André": 10,
  "Saint Joseph": 25,
  "Saint-Leu": 15,
  "Saint-Louis": 15,
  "Saint-Paul": 0,
  "Saint-Philippe": 25,
  "Sainte-Marie": 0,
  "Sainte-Rose": 25,
  "Sainte-Suzanne": 0,
  "Salazie": 25,
  "Tampon": 20,
  "Trois-Bassins": 20
};

// Constante pour le taux de taxe (20% de TVA)
const TAX_RATE = 0.20;

const CheckoutPage = () => {
  const { selectedCartItems, getCartTotal } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deliveryCity, setDeliveryCity] = useState<string>("");
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  
  // État pour le code promo
  const [codePromo, setCodePromo] = useState<string>('');
  const [verifyingCode, setVerifyingCode] = useState<boolean>(false);
  const [verifiedPromo, setVerifiedPromo] = useState<{
    valid: boolean;
    pourcentage: number;
    productId: string;
    code: string;
  } | null>(null);
  
  // Formulaire d'adresse
  const [shippingData, setShippingData] = useState<ShippingAddress>({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
    codePostal: user?.codePostal || '',
    pays: user?.pays || 'La Réunion',
    telephone: user?.telephone || '',
  });
  
  // Vérifier si tous les produits sont en promotion
  const allProductsOnPromotion = selectedCartItems.every(item => 
    item.product.promotion && item.product.promotion > 0
  );
  
  // Vérifier s'il y a au moins un produit sans promotion
  const hasNonPromotionProduct = selectedCartItems.some(item => 
    !item.product.promotion || item.product.promotion <= 0
  );

  useEffect(() => {
    // Rediriger si le panier est vide
    if (selectedCartItems.length === 0) {
      toast.error("Votre panier est vide. Veuillez ajouter des produits avant de procéder au paiement.");
      navigate('/panier');
    }
  }, [selectedCartItems, navigate]);
  
  // Si les items du panier changent, mettre à jour les informations de livraison
  useEffect(() => {
    if (user) {
      setShippingData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        adresse: user.adresse || '',
        ville: user.ville || '',
        codePostal: user.codePostal || '',
        pays: user.pays || 'La Réunion',
        telephone: user.telephone || '',
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
  };

  // Mettre à jour la ville et le prix de livraison
  const handleCityChange = (city: string) => {
    setDeliveryCity(city);
    setShippingData(prev => ({ ...prev, ville: city }));
    
    const price = DELIVERY_PRICES[city as keyof typeof DELIVERY_PRICES] || 0;
    setDeliveryPrice(price);
  };
  
  // Vérifier le code promo
  const handleVerifyCodePromo = async () => {
    if (!codePromo.trim()) {
      toast.error("Veuillez saisir un code promo");
      return;
    }
    
    // Rechercher le premier produit sans promotion pour appliquer le code promo
    const nonPromoProduct = selectedCartItems.find(item => 
      !item.product.promotion || item.product.promotion <= 0
    );
    
    if (!nonPromoProduct) {
      toast.error("Aucun produit éligible pour un code promo");
      return;
    }
    
    setVerifyingCode(true);
    try {
      const response = await codePromosAPI.verify(codePromo, nonPromoProduct.product.id);
      const data = response.data;
      
      if (data.valid && data.pourcentage) {
        setVerifiedPromo({
          valid: true,
          pourcentage: data.pourcentage,
          productId: nonPromoProduct.product.id,
          code: codePromo
        });
        toast.success(`Code promo valide ! ${data.pourcentage}% de réduction appliquée`);
      } else {
        setVerifiedPromo(null);
        toast.error(data.message || "Code promo invalide");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du code promo:", error);
      setVerifiedPromo(null);
      toast.error("Erreur lors de la vérification du code promo");
    } finally {
      setVerifyingCode(false);
    }
  };
  
  const handleShippingSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateShippingForm()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (!deliveryCity) {
      toast.error("Veuillez sélectionner une ville de livraison");
      return;
    }

    // Passer à l'étape suivante
    setStep('payment');
    window.scrollTo(0, 0);
  };
  
  const validateShippingForm = () => {
    return (
      shippingData.nom.trim() !== '' &&
      shippingData.prenom.trim() !== '' &&
      shippingData.adresse.trim() !== '' &&
      deliveryCity !== '' &&
      shippingData.codePostal.trim() !== '' &&
      shippingData.pays.trim() !== '' &&
      shippingData.telephone.trim() !== ''
    );
  };
  
  // Calculer le total en tenant compte du code promo
  const calculateItemPrice = (item: typeof selectedCartItems[0]) => {
    if (verifiedPromo && verifiedPromo.valid && item.product.id === verifiedPromo.productId) {
      return item.product.price * (1 - verifiedPromo.pourcentage / 100) * item.quantity;
    }
    return item.product.price * item.quantity;
  };
  
  const subtotal = getCartTotal();
  
  // Calculer le total avec remise code promo
  const discountedSubtotal = selectedCartItems.reduce((total, item) => {
    return total + calculateItemPrice(item);
  }, 0);
  
  const hasPromoDiscount = subtotal !== discountedSubtotal;
  
  // Calcul des taxes (20% de TVA)
  const taxAmount = discountedSubtotal * TAX_RATE;
  
  const orderTotal = discountedSubtotal + deliveryPrice + taxAmount;
  
  // Préparer les données pour Stripe
  const paymentData: PaymentData = {
    amount: Math.round(orderTotal * 100), // Montant en centimes
    currency: 'eur',
    customerEmail: user?.email || '',
    customerName: `${user?.prenom || ''} ${user?.nom || ''}`.trim(),
    items: selectedCartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    })),
    shippingAddress: shippingData,
    totalTTC: orderTotal,
    taxAmount: taxAmount,
    deliveryPrice: deliveryPrice,
    codePromo: verifiedPromo ? {
      code: verifiedPromo.code,
      productId: verifiedPromo.productId,
      pourcentage: verifiedPromo.pourcentage
    } : undefined
  };
  
  // Si aucun élément n'est sélectionné, retourner au panier
  if (selectedCartItems.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-gray-500 mb-6">Ajoutez des produits à votre panier pour commander</p>
            <Button asChild>
              <Link to="/panier">Retour au panier</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (loading) {
    return (
      <Layout>
        <LoadingOrderState />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <CheckoutHeader 
            title="Finaliser votre commande"
            subtitle="Quelques étapes simples vous séparent de vos produits préférés"
          />

          <CheckoutSteps currentStep={step} />
        
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div 
              className="lg:col-span-8 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {step === 'shipping' && (
                <ShippingForm
                  shippingData={shippingData}
                  deliveryCity={deliveryCity}
                  deliveryPrices={DELIVERY_PRICES}
                  onShippingDataChange={handleChange}
                  onCityChange={handleCityChange}
                  onSubmit={handleShippingSubmit}
                  onBackToCart={() => navigate('/panier')}
                />
              )}
              
              {step === 'payment' && (
                <div className="space-y-6">
                  <StripePaymentForm
                    paymentData={paymentData}
                    onPaymentStart={() => setLoading(true)}
                    onPaymentSuccess={() => {
                      toast.success('Paiement initié avec succès !');
                      // La redirection vers Stripe se fait automatiquement
                    }}
                    onPaymentError={(error) => {
                      toast.error(error);
                      setLoading(false);
                    }}
                  />
                  
                  <div className="flex justify-start">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep('shipping')}
                      className="px-8 py-4 h-14 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                    >
                      Retour aux informations
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
            
            <OrderSummary
              selectedCartItems={selectedCartItems}
              subtotal={subtotal}
              discountedSubtotal={discountedSubtotal}
              hasPromoDiscount={hasPromoDiscount}
              taxAmount={taxAmount}
              deliveryPrice={deliveryPrice}
              deliveryCity={deliveryCity}
              orderTotal={orderTotal}
              codePromo={codePromo}
              verifyingCode={verifyingCode}
              verifiedPromo={verifiedPromo}
              step={step}
              allProductsOnPromotion={allProductsOnPromotion}
              hasNonPromotionProduct={hasNonPromotionProduct}
              calculateItemPrice={calculateItemPrice}
              onCodePromoChange={setCodePromo}
              onVerifyCodePromo={handleVerifyCodePromo}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
