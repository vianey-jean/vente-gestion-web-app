
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailurePage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div 
            className="bg-white p-8 rounded-3xl shadow-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <XCircle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Paiement Annulé
            </h1>
            
            <p className="text-gray-600 mb-8">
              Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/paiement')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 shadow-lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Réessayer le paiement
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/panier')}
                className="px-8 py-3"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour au panier
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentFailurePage;
