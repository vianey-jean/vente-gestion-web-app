
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, LineChart } from 'recharts';
import { 
  BarChart as BarChartIcon, 
  Box, 
  DollarSign, 
  Loader2, 
  Package, 
  ShoppingCart, 
  Users 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Si l'état de l'authentification n'est pas encore résolu, afficher un écran de chargement
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-app-blue" />
            <span className="ml-2 text-lg text-gray-600">Chargement...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Données factices pour les widgets
  const stats = [
    {
      title: "Ventes aujourd'hui",
      value: "1,240€",
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Nouveaux clients",
      value: "34",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      change: "+5%",
      changeType: "positive"
    },
    {
      title: "Commandes",
      value: "24",
      icon: <ShoppingCart className="h-8 w-8 text-purple-500" />,
      change: "-2%",
      changeType: "negative"
    },
    {
      title: "Stock faible",
      value: "5",
      icon: <Package className="h-8 w-8 text-amber-500" />,
      change: "+1",
      changeType: "neutral"
    }
  ];
  
  // Données factices pour les graphiques
  const recentProducts = [
    { id: 1, name: "Laptop Pro", price: "1,299.99 €", stock: 10, category: "Électronique" },
    { id: 2, name: "Smartphone X", price: "899.99 €", stock: 15, category: "Électronique" },
    { id: 3, name: "Écran 4K", price: "499.99 €", stock: 8, category: "Électronique" },
  ];
  
  const recentSales = [
    { id: 1, date: "2023-04-01", customer: "Jean Dupont", amount: "1,299.99 €", status: "Complété" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user.firstName} {user.lastName} ! Voici un aperçu de vos activités récentes.
          </p>
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-full">{stat.icon}</div>
                </div>
                <div className="mt-4">
                  <span className={`text-sm ${
                    stat.changeType === "positive" ? "text-green-600" :
                    stat.changeType === "negative" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {stat.change} par rapport à hier
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Produits et Ventes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Produits récents */}
          <Card>
            <CardHeader>
              <CardTitle>Produits récents</CardTitle>
              <CardDescription>Liste des derniers produits ajoutés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2 font-medium text-gray-600">Nom</th>
                      <th className="pb-2 font-medium text-gray-600">Prix</th>
                      <th className="pb-2 font-medium text-gray-600">Stock</th>
                      <th className="pb-2 font-medium text-gray-600">Catégorie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-3">{product.name}</td>
                        <td className="py-3">{product.price}</td>
                        <td className="py-3">{product.stock}</td>
                        <td className="py-3">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Ventes récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Ventes récentes</CardTitle>
              <CardDescription>Dernières transactions effectuées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2 font-medium text-gray-600">Date</th>
                      <th className="pb-2 font-medium text-gray-600">Client</th>
                      <th className="pb-2 font-medium text-gray-600">Montant</th>
                      <th className="pb-2 font-medium text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="border-b">
                        <td className="py-3">{sale.date}</td>
                        <td className="py-3">{sale.customer}</td>
                        <td className="py-3">{sale.amount}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-app-blue text-white">
            <CardContent className="p-6 flex items-center space-x-4">
              <Box className="h-10 w-10" />
              <div>
                <h3 className="font-bold">Ajouter un produit</h3>
                <p className="text-sm opacity-80">Créer une nouvelle fiche produit</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-600 text-white">
            <CardContent className="p-6 flex items-center space-x-4">
              <ShoppingCart className="h-10 w-10" />
              <div>
                <h3 className="font-bold">Nouvelle vente</h3>
                <p className="text-sm opacity-80">Enregistrer une transaction</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-600 text-white">
            <CardContent className="p-6 flex items-center space-x-4">
              <BarChartIcon className="h-10 w-10" />
              <div>
                <h3 className="font-bold">Rapport complet</h3>
                <p className="text-sm opacity-80">Voir les statistiques détaillées</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
