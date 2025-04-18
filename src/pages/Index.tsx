
import React from 'react';
import Layout from '../components/Layout/Layout';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Box, ShoppingCart, Users } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: <Box className="h-8 w-8 text-app-blue" />,
      title: 'Gestion des Produits',
      description: 'Gérez facilement votre inventaire, ajoutez de nouveaux produits et suivez leur disponibilité.'
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-app-blue" />,
      title: 'Suivi des Ventes',
      description: 'Enregistrez et suivez toutes vos transactions de vente en temps réel.'
    },
    {
      icon: <Users className="h-8 w-8 text-app-blue" />,
      title: 'Gestion des Clients',
      description: 'Maintenez une base de données clients détaillée et suivez leur historique d\'achat.'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-app-blue" />,
      title: 'Rapports & Analyses',
      description: 'Générez des rapports détaillés et obtenez des insights précieux sur vos performances.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Solution Complète de Gestion de Vente
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Simplifiez la gestion de votre inventaire, suivez vos ventes et développez votre activité avec notre plateforme intuitive.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button size="lg" variant="default" className="bg-white text-blue-700 hover:bg-blue-50">
                  Créer un compte
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Notre plateforme offre tous les outils dont vous avez besoin pour gérer efficacement vos opérations de vente.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-blue-50 rounded-xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Prêt à Optimiser Votre Gestion de Vente?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Rejoignez des milliers d'entreprises qui ont amélioré leur efficacité grâce à notre solution.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-app-blue hover:bg-blue-700">
                  Commencer Maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
