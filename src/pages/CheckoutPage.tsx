
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
import { ShippingAddress } from '@/services/api';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Discount, Tag } from 'lucide-react';

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
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
  const [promoError, setPromoError] = useState<string>("");
  const [promoLoading, setPromoLoading] = useState<boolean>(false);
  const [promoProductId, setPromoProductId] = useState<string | null>(null);
  const [hasPromotion, setHasPromotion] = useState<boolean>(false);
  const [hasNonPromotionProduct, setHasNonPromotionProduct] = useState<boolean>(false);
  
  const [shippingData, setShippingData] = useState<ShippingAddress>({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
    codePostal: user?.codePostal || '',
    pays: user?.pays || 'France',
    telephone: user?.telephone || '',
  });
  
  useEffect(() => {
    // Vérifier s'il y a des produits en promotion et des produits sans promotion
    const hasPromotionItems = selectedCartItems.some(item => item.product.promotion && item.product.promotion > 0);
    const hasNonPromotionItems = selectedCartItems.some(item => !item.product.promotion || item.product.promotion <= 0);
    
    setHasPromotion(hasPromotionItems);
    setHasNonPromotionProduct(hasNonPromotionItems);
  }, [selectedCartItems]);
  
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
  const verifyPromoCode = async (productId: string) => {
    if (promoCode.trim().length === 0) return;
    
    setPromoLoading(true);
    setPromoError("");
    setPromoDiscount(null);
    
    try {
      const response = await axios.post('/api/promo-codes/verify', {
        code: promoCode,
        productId
      });
      
      if (response.data && response.data.valid) {
        setPromoDiscount(response.data.discount);
        setPromoProductId(productId);
        toast.success(`Code promo appliqué: -${response.data.discount}%`);
      } else {
        setPromoError("Code promo invalide ou expiré");
      }
    } catch (error: any) {
      console.error("Erreur lors de la vérification du code promo:", error);
      setPromoError(error?.response?.data?.message || "Code promo invalide ou expiré");
    } finally {
      setPromoLoading(false);
    }
  };
  
  // Vérifier le code promo pour chaque article sans promotion
  const handlePromoCodeVerify = async () => {
    if (promoCode.trim().length === 0) return;
    
    // Trouver le premier produit sans promotion
    const firstNonPromotionItem = selectedCartItems.find(item => !item.product.promotion);
    
    if (firstNonPromotionItem) {
      await verifyPromoCode(firstNonPromotionItem.product.id);
    } else {
      setPromoError("Aucun produit éligible pour ce code promo");
    }
  };
  
  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value.toUpperCase());
    setPromoError("");
    setPromoDiscount(null);
    setPromoProductId(null);
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
  
  const processOrder = async (orderId?: string) => {
    setLoading(true);
    try {
      // Si un code promo est appliqué, utiliser le code
      if (promoDiscount !== null && promoProductId !== null) {
        try {
          await axios.post('/api/promo-codes/use', {
            code: promoCode,
            productId: promoProductId
          });
          console.log("Code promo utilisé avec succès");
        } catch (error) {
          console.error("Erreur lors de l'utilisation du code promo:", error);
        }
      }
      
      const order = await createOrder(shippingData, paymentMethod);
      
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
  
  // Calculer le total avec remise si un code promo est appliqué
  const calculateTotal = () => {
    let total = selectedCartItems.reduce((sum, item) => {
      // Si le produit a une promotion appliquée ou n'est pas celui avec le code promo, utiliser le prix normal
      if (item.product.id !== promoProductId) {
        return sum + (item.product.price * item.quantity);
      }
      
      // Si le produit est celui avec code promo, appliquer la remise
      if (promoDiscount !== null) {
        const discountFactor = 1 - (promoDiscount / 100);
        return sum + (item.product.price * item.quantity * discountFactor);
      }
      
      // Cas par défaut
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    return total;
  };
  
  // Prix total avant remise
  const subtotal = getCartTotal();
  
  // Prix total avec remise si applicable
  const total = calculateTotal();
  
  // Prix total avec livraison
  const orderTotal = total + deliveryPrice;
  
  // Interface pour voir si un code promo peut être appliqué
  const canApplyPromoCode = () => {
    // Si tous les produits sont en promotion, désactiver le champ de code promo
    if (hasPromotion && !hasNonPromotionProduct) {
      return false;
    }
    
    // Si au moins un produit n'est pas en promotion, activer le champ de code promo
    return true;
  };
  
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
            <div className="bg-white p-6 rounded-lg shadow">
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
              <div className="bg-white p-6 rounded-lg shadow mb-4">
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
                        <div className="flex items-center">
                          <p className="font-medium">{item.product.name}</p>
                          {item.product.promotion ? (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              -{item.product.promotion}%
                            </span>
                          ) : promoProductId === item.product.id && promoDiscount ? (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Code: -{promoDiscount}%
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {item.product.price.toFixed(2)} €
                        </p>
                      </div>
                      <p className="font-semibold">
                        {(item.quantity * item.product.price).toFixed(2)} €
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <p>Sous-total</p>
                    <p>{subtotal.toFixed(2)} €</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Frais de livraison ({deliveryCity || 'Non sélectionné'})</p>
                    <p>{deliveryPrice === 0 && !deliveryCity ? 'Non calculé' : deliveryPrice === 0 ? 'Gratuit' : `${deliveryPrice.toFixed(2)} €`}</p>
                  </div>
                  
                  {/* Zone de code promo */}
                  <div className="py-2">
                    <Label htmlFor="promoCode" className="flex items-center gap-1 mb-1">
                      <Discount className="h-4 w-4" />
                      Code promo
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="promoCode"
                        placeholder="Saisir un code promo"
                        value={promoCode}
                        onChange={handlePromoCodeChange}
                        className="uppercase"
                        disabled={!canApplyPromoCode() || promoLoading || promoDiscount !== null}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!canApplyPromoCode() || !promoCode || promoLoading || promoDiscount !== null}
                        onClick={handlePromoCodeVerify}
                        className="whitespace-nowrap"
                      >
                        Appliquer
                      </Button>
                    </div>
                    
                    {promoError && (
                      <p className="text-sm text-red-500 mt-1">{promoError}</p>
                    )}
                    
                    {promoDiscount !== null && (
                      <p className="text-sm text-green-600 mt-1 flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        Code promo appliqué: -{promoDiscount}%
                      </p>
                    )}
                    
                    {!canApplyPromoCode() && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Les codes promo ne peuvent pas être utilisés avec des produits déjà en promotion.
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
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
