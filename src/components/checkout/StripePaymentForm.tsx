
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Lock } from 'lucide-react';
import { stripeService, PaymentData } from '@/services/stripeService';
import { toast } from '@/components/ui/sonner';

interface StripePaymentFormProps {
  paymentData: PaymentData;
  onPaymentStart: () => void;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  paymentData,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    setLoading(true);
    onPaymentStart();

    try {
      console.log('Création de la session Stripe avec:', paymentData);
      
      const session = await stripeService.createPaymentSession(paymentData);
      
      if (session.sessionId) {
        console.log('Session créée:', session.sessionId);
        await stripeService.redirectToStripe(session.sessionId);
      } else {
        throw new Error('Aucune session ID reçue');
      }
    } catch (error) {
      console.error('Erreur paiement Stripe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de paiement';
      onPaymentError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
          <CreditCard className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Paiement Sécurisé
          </h2>
          <p className="text-gray-600 mt-1">Paiement sécurisé avec Stripe</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <span className="font-medium text-blue-800">Paiement 100% sécurisé</span>
        </div>
        <div className="text-sm text-blue-700 space-y-2">
          <div className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            <span>Chiffrement SSL 256-bit</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span>Validation 3D Secure</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <h3 className="font-semibold mb-2">Récapitulatif du paiement :</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sous-total produits</span>
            <span>{(paymentData.totalTTC - paymentData.taxAmount - paymentData.deliveryPrice).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span>TVA (20%)</span>
            <span>{paymentData.taxAmount.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span>Livraison</span>
            <span>{paymentData.deliveryPrice.toFixed(2)} €</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total TTC</span>
            <span className="text-green-600">{paymentData.totalTTC.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleStripePayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 h-14 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Redirection vers Stripe...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Payer {paymentData.totalTTC.toFixed(2)} € avec Stripe
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        En cliquant sur "Payer", vous serez redirigé vers la page de paiement sécurisée de Stripe
      </p>
    </motion.div>
  );
};

export default StripePaymentForm;
