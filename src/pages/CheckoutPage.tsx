import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from '@/components/ui/sonner';
import CreditCardForm from '@/components/checkout/CreditCardForm';
import { ShippingAddress, codePromosAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { Percent } from 'lucide-react';

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

const CheckoutPage = () => {
  const { selectedCartItems, getCartTotal, createOrder } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [showCardForm, setShowCardForm] = useState(false);
  const [deliveryCity, setDeliveryCity] = useState<string>("");
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  
  // État pour le code promo
  const [codePromo, setCodePromo] = useState<string>('');
  const [verifyingCode, setVerifyingCode] = useState<boolean>(false);
  const [verifiedPromo, setVerifiedPromo] = useState<{
    valid: boolean;
    pourcentage: number;
    productId: string;
    code: string;
  } | null>(null);
  
  const [shippingData, setShippingData] = useState<ShippingAddress>({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
    codePostal: user?.codePostal || '',
    pays: user?.pays || 'France',
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
    console.log("Selected cart items:", selectedCartItems);
  }, [selectedCartItems]);
  
  // Si les items du panier changent, mettre à jour les informations de livraison
  useEffect(() => {
    if (user) {
      setShippingData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        adresse: user.adresse || '',
        ville: user.ville || '',
        codePostal: user.codePostal || '',
        pays: user.pays || 'France',
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
  
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (selectedCartItems.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    if (!deliveryCity) {
      toast.error("Veuillez sélectionner une ville de livraison");
      return;
    }

    if (paymentMethod === 'stripe') {
      setShowCardForm(true);
    } else if (paymentMethod === 'paypal') {
      // PayPal payment process would go here
      processOrder();
    }
  };
  
  const processOrder = async () => {
    setLoading(true);
    try {
      // Prepare the cart items for the order
      const orderItems = selectedCartItems.map(item => ({ 
        productId: item.product.id, 
        quantity: item.quantity,
        price: item.product.price
      }));

      console.log('Traitement de commande avec données:', {
        shippingAddress: shippingData,
        paymentMethod: paymentMethod,
        cartItems: orderItems,
        promoDetails: verifiedPromo ? {
          code: verifiedPromo.code,
          productId: verifiedPromo.productId,
          pourcentage: verifiedPromo.pourcentage
        } : undefined
      });
      
      // Ensure we're actually sending items to the server
      if (selectedCartItems.length === 0) {
        toast.error("Votre panier est vide. Impossible de créer la commande.");
        setLoading(false);
        return;
      }
      
      const order = await createOrder(
        shippingData, 
        paymentMethod, 
        verifiedPromo ? {
          code: verifiedPromo.code,
          productId: verifiedPromo.productId,
          pourcentage: verifiedPromo.pourcentage
        } : undefined
      );
      
      if (order) {
        toast.success("Commande effectuée avec succès !");
        navigate(`/commandes`);  // Redirect to orders page
      } else {
        toast.error("Erreur lors de la création de la commande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la validation de la commande");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log("Payment success, processing order...");
    processOrder();
  };
  
  const validateForm = () => {
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
  const orderTotal = discountedSubtotal + deliveryPrice;
  
  const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  return (
    <Layout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Finaliser la commande</h1>
        
        {showCardForm ? (
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Paiement par carte bancaire</h2>
            <CreditCardForm onSuccess={handlePaymentSuccess} />
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={() => setShowCardForm(false)}
            >
              Retour
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow pl-[9rem]">
              <h2 className="text-xl font-semibold mb-4">Informations de livraison</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="nom">Nom*</Label>
                    <Input
                      id="nom"
                      name="nom"
                      value={shippingData.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prenom">Prénom*</Label>
                    <Input
                      id="prenom"
                      name="prenom"
                      value={shippingData.prenom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="adresse">Adresse*</Label>
                  <Input
                    id="adresse"
                    name="adresse"
                    value={shippingData.adresse}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="ville">Ville de livraison*</Label>
                    <Select 
                      value={deliveryCity}
                      onValueChange={handleCityChange}
                    >
                      <SelectTrigger id="ville">
                        <SelectValue placeholder="Sélectionnez une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(DELIVERY_PRICES).sort().map(city => (
                          <SelectItem key={city} value={city}>
                            {city} {DELIVERY_PRICES[city as keyof typeof DELIVERY_PRICES] === 0 
                              ? "(Gratuit)" 
                              : `(+${DELIVERY_PRICES[city as keyof typeof DELIVERY_PRICES]}€)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="codePostal">Code postal*</Label>
                    <Input
                      id="codePostal"
                      name="codePostal"
                      value={shippingData.codePostal}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="pays">Pays*</Label>
                    <Select 
                      value={shippingData.pays}
                      onValueChange={(value) => setShippingData({...shippingData, pays: value})}
                    >
                      <SelectTrigger id="pays">
                        <SelectValue placeholder="Sélectionnez un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Belgique">Belgique</SelectItem>
                        <SelectItem value="Suisse">Suisse</SelectItem>
                        <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                        <SelectItem value="La Réunion">La Réunion</SelectItem>
                        <SelectItem value="Madagascar">Madagascar</SelectItem>
                        <SelectItem value="Mayotte">Mayotte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone*</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      value={shippingData.telephone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-4 mt-8">Mode de paiement</h2>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mb-6">
                  <div className="flex items-center space-x-2 rounded-md border p-3 mb-2">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex-grow cursor-pointer">
                      Carte bancaire
                    </Label>
                    <div className="flex space-x-1">
                      <div className="w-8 h-5 bg-blue-600 rounded"></div>
                      <div className="w-8 h-5 bg-red-500 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3 mb-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-grow cursor-pointer">
                      PayPal
                    </Label>
                    <div className="w-8 h-5 bg-blue-500 rounded"></div>
                  </div>
                </RadioGroup>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4 bg-red-800 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Traitement en cours...' : 'Confirmer la commande'}
                </Button>
                <div className="flex justify-center mt-4">
                  <Link to="/panier" className="text-brand-blue hover:underline text-sm flex items-center">
                    Annuler votre commande
                  </Link>
                </div>
              </form>
            </div>
            
            <div>
              <div className="bg-white p-6 rounded-lg shadow mb-4 pr-[9rem]">
                <h2 className="text-xl font-semibold mb-4">Récapitulatif de commande</h2>
                
                <div className="space-y-4 mb-6">
                  {selectedCartItems.map(item => (
                    <div key={item.product.id} className="flex items-center space-x-3">
                     <img 
                        src={`${AUTH_BASE_URL}${
                          item.product.images && item.product.images.length > 0 
                            ? item.product.images[0] 
                            : item.product.image
                        }`} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover rounded" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `${AUTH_BASE_URL}/uploads/placeholder.jpg`;
                        }}
                      />
                      <div className="flex-grow">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {item.product.price.toFixed(2)} €
                          {verifiedPromo && verifiedPromo.valid && item.product.id === verifiedPromo.productId && (
                            <span className="ml-2 text-red-600">
                              (-{verifiedPromo.pourcentage}%)
                            </span>
                          )}
                          {item.product.promotion && item.product.promotion > 0 && (
                            <span className="ml-2 text-green-600">
                              (Déjà en promo: -{item.product.promotion}%)
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {calculateItemPrice(item).toFixed(2)} €
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <p>Sous-total</p>
                    <p>{subtotal.toFixed(2)} €</p>
                  </div>
                  
                  {hasPromoDiscount && (
                    <div className="flex justify-between text-red-600">
                      <p>Remise code promo</p>
                      <p>-{(subtotal - discountedSubtotal).toFixed(2)} €</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <p>Frais de livraison ({deliveryCity || 'Non sélectionné'})</p>
                    <p>{deliveryPrice === 0 && !deliveryCity ? 'Non calculé' : deliveryPrice === 0 ? 'Gratuit' : `${deliveryPrice.toFixed(2)} €`}</p>
                  </div>
                  
                  {/* Section Code Promo */}
                  {!allProductsOnPromotion && hasNonPromotionProduct && (
                    <div className="py-3 border-t border-b">
                      <p className="font-medium mb-2">Code Promotion</p>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Saisir votre code promo"
                          value={codePromo}
                          onChange={(e) => setCodePromo(e.target.value)}
                          disabled={verifiedPromo !== null || verifyingCode}
                        />
                        <Button 
                          onClick={handleVerifyCodePromo}
                          disabled={!codePromo || verifiedPromo !== null || verifyingCode}
                          variant="outline"
                        >
                          {verifyingCode ? 'Vérification...' : 'Appliquer'}
                        </Button>
                      </div>
                      {verifiedPromo && verifiedPromo.valid && (
                        <div className="mt-2 flex items-center text-sm text-green-600">
                          <Percent className="h-4 w-4 mr-1" />
                          Code promo appliqué : {verifiedPromo.pourcentage}% de réduction
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <p>Total</p>
                    <p>{orderTotal.toFixed(2)} €</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Informations sur la livraison</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Livraison gratuite à partir de 50€ d'achat (frais d'expédition uniquement)</li>
                  <li>• Les frais de livraison varient selon la ville</li>
                  <li>• Livraison en 3-5 jours ouvrés</li>
                  <li>• Retours gratuits sous 30 jours</li>
                  <li>• Paiements sécurisés</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutPage;
