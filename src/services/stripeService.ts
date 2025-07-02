
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface PaymentData {
  amount: number; // Montant en centimes
  currency: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: any;
  totalTTC: number;
  taxAmount: number;
  deliveryPrice: number;
  codePromo?: any;
}

export const stripeService = {
  async createPaymentSession(paymentData: PaymentData) {
    try {
      const response = await fetch('/api/stripe/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Erreur Stripe:', error);
      throw error;
    }
  },

  async redirectToStripe(sessionId: string) {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe non initialisé');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    if (error) {
      throw error;
    }
  },

  async verifyPayment(sessionId: string) {
    try {
      const response = await fetch('/api/stripe/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur de vérification:', error);
      throw error;
    }
  }
};
