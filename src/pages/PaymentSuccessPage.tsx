
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { stripeService } from '@/services/stripeService';
import { toast } from '@/components/ui/sonner';
import { motion } from 'framer-motion';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [processing, setProcessing] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast.error('Session de paiement non trouvée');
        navigate('/panier');
        return;
      }

      try {
        console.log('Vérification du paiement...', sessionId);
        const result = await stripeService.verifyPayment(sessionId);
        
        if (result.success) {
          setOrderId(result.orderId);
          toast.success('Paiement confirmé avec succès !');
        } else {
          toast.error('Échec de la vérification du paiement');
          navigate('/panier');
        }
      } catch (error) {
        console.error('Erreur vérification paiement:', error);
        toast.error('Erreur lors de la vérification du paiement');
        navigate('/panier');
      } finally {
        setProcessing(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (processing) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Vérification de votre paiement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div 
            className="bg-white p-8 rounded-3xl shadow-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Paiement Confirmé !
            </h1>
            
            <p className="text-gray-600 mb-8">
              Votre commande a été traitée avec succès. Vous recevrez un email de confirmation sous peu.
            </p>

            {orderId && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-8">
                <p className="text-sm text-blue-800">
                  <strong>Numéro de commande :</strong> {orderId}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/commandes')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 shadow-lg"
              >
                <Package className="h-5 w-5 mr-2" />
                Voir mes commandes
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/products')}
                className="px-8 py-3"
              >
                Continuer mes achats
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;
