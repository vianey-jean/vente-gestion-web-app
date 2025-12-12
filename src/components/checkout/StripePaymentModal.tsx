import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Package, 
  MapPin, 
  Phone,
  User,
  Lock
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import visaLogo from '@/assets/visa.png';
import mastercardLogo from '@/assets/mastercard.png';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    images?: string[];
    promotion?: number;
  };
  quantity: number;
}

interface ShippingAddress {
  nom: string;
  prenom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
}

interface CardInfo {
  id?: string;
  maskedNumber: string;
  cardType: string;
  cardName: string;
  expiryDate: string;
}

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onPaymentFailed: () => void;
  cartItems: CartItem[];
  shippingAddress: ShippingAddress;
  cardInfo: CardInfo;
  subtotal: number;
  taxAmount: number;
  deliveryPrice: number;
  orderTotal: number;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  onPaymentFailed,
  cartItems,
  shippingAddress,
  cardInfo,
  subtotal,
  taxAmount,
  deliveryPrice,
  orderTotal
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  const getCardLogo = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return visaLogo;
      case 'mastercard':
        return mastercardLogo;
      default:
        return null;
    }
  };

  const processStripePayment = async () => {
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Créer le PaymentIntent côté serveur
      const response = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          amount: Math.round(orderTotal * 100), // Stripe utilise les centimes
          currency: 'eur',
          cardId: cardInfo.id,
          orderDetails: {
            items: cartItems.map(item => ({
              productId: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            })),
            shippingAddress,
            subtotal,
            taxAmount,
            deliveryPrice,
            total: orderTotal
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la création du paiement');
      }

      const { clientSecret, paymentIntentId, simulated } = await response.json();

      // Mode simulation (Stripe non configuré côté serveur)
      if (simulated) {
        console.log('Mode simulation: Paiement simulé accepté');
        
        // Simuler un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setPaymentStatus('success');
        toast.success('Paiement accepté !');
        
        setTimeout(() => {
          onPaymentSuccess();
        }, 1500);
        return;
      }

      // Vérifier si Stripe est configuré côté client
      if (!STRIPE_PUBLISHABLE_KEY) {
        // Fallback en mode simulation
        console.log('Mode simulation: Clé Stripe non configurée côté client');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPaymentStatus('success');
        toast.success('Paiement accepté !');
        setTimeout(() => {
          onPaymentSuccess();
        }, 1500);
        return;
      }

      // Charger Stripe dynamiquement
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

      if (!stripe) {
        throw new Error('Impossible de charger Stripe');
      }

      // Confirmer le paiement avec Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: cardInfo.id
      });

      if (error) {
        setPaymentStatus('failed');
        setErrorMessage(error.message || 'Une erreur est survenue lors du paiement');
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        toast.success('Paiement accepté !');
        
        setTimeout(() => {
          onPaymentSuccess();
        }, 1500);
      } else {
        setPaymentStatus('failed');
        setErrorMessage('Le paiement n\'a pas pu être finalisé');
      }
    } catch (error: any) {
      console.error('Erreur de paiement:', error);
      setPaymentStatus('failed');
      setErrorMessage(error.message || 'Une erreur est survenue lors du paiement');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
  };

  const handleClose = () => {
    if (paymentStatus === 'processing') {
      return; // Ne pas fermer pendant le traitement
    }
    if (paymentStatus === 'failed') {
      onPaymentFailed();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Confirmation de paiement
              </span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Paiement sécurisé par Stripe
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirmez votre paiement sécurisé
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Statut du paiement */}
          <AnimatePresence mode="wait">
            {paymentStatus === 'processing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl"
              >
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Traitement en cours...</h3>
                <p className="text-gray-600">Veuillez patienter pendant la validation de votre paiement</p>
              </motion.div>
            )}

            {paymentStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">Paiement réussi !</h3>
                <p className="text-gray-600">Redirection vers vos commandes...</p>
              </motion.div>
            )}

            {paymentStatus === 'failed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl"
              >
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-red-700 mb-2">Paiement refusé</h3>
                <p className="text-gray-600 text-center px-4 mb-4">{errorMessage}</p>
                <Button onClick={handleRetry} variant="outline" className="border-red-300 hover:bg-red-50">
                  Réessayer
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {paymentStatus === 'idle' && (
            <>
              {/* Carte sélectionnée */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6" />
                    <span className="font-medium">Carte de paiement</span>
                  </div>
                  {getCardLogo(cardInfo.cardType) && (
                    <img src={getCardLogo(cardInfo.cardType)!} alt={cardInfo.cardType} className="h-8" />
                  )}
                </div>
                <div className="font-mono text-xl tracking-wider mb-2">
                  {cardInfo.maskedNumber}
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>{cardInfo.cardName}</span>
                  <span>Exp: {cardInfo.expiryDate}</span>
                </div>
              </div>

              {/* Récapitulatif de la commande */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Récapitulatif de la commande
                  </h4>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Produits */}
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images?.[0] ? (
                            <img 
                              src={`${API_BASE_URL}${item.product.images[0]}`}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.product.name}</p>
                          <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-800">
                          {(item.product.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Adresse de livraison */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h5 className="font-medium text-gray-800 flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Adresse de livraison
                    </h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {shippingAddress.prenom} {shippingAddress.nom}
                      </p>
                      <p>{shippingAddress.adresse}</p>
                      <p>{shippingAddress.codePostal} {shippingAddress.ville}</p>
                      <p>{shippingAddress.pays}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {shippingAddress.telephone}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Totaux */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>TVA (20%)</span>
                      <span>{taxAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Livraison</span>
                      <span>{deliveryPrice === 0 ? 'Gratuite' : `${deliveryPrice.toFixed(2)} €`}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total TTC</span>
                      <span className="text-primary">{orderTotal.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton de paiement */}
              <Button
                onClick={processStripePayment}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Shield className="h-5 w-5 mr-2" />
                Payer {orderTotal.toFixed(2)} € avec cette carte
              </Button>

              {/* Sécurité */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Paiement 100% sécurisé par cryptage SSL</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentModal;
