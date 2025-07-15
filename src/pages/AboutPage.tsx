
/**
 * PAGE À PROPOS
 * =============
 * 
 * Cette page présente l'application de gestion de vente et ses fonctionnalités.
 * Elle fournit une interface informative avec des sections détaillées sur :
 * - Les fonctionnalités principales
 * - L'équipe de développement
 * - Les technologies utilisées
 * - Les statistiques de l'application
 * 
 * Design :
 * - Interface moderne avec animations
 * - Sections organisées en cartes
 * - Responsive design
 * - Thème sombre/clair
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Smartphone, 
  Globe,
  Code,
  Database,
  Paintbrush,
  Rocket
} from 'lucide-react';

const AboutPage = () => {
  // Ici on attend la définition des données de fonctionnalités
  const features = [
    {
      icon: ShoppingCart,
      title: "Gestion des Ventes",
      description: "Suivez et gérez toutes vos transactions commerciales en temps réel"
    },
    {
      icon: BarChart3,
      title: "Analyses Avancées",
      description: "Obtenez des insights détaillés sur vos performances commerciales"
    },
    {
      icon: TrendingUp,
      title: "Suivi des Tendances",
      description: "Analysez les tendances de marché et adaptez votre stratégie"
    },
    {
      icon: Users,
      title: "Gestion Client",
      description: "Maintenez des relations durables avec votre clientèle"
    }
  ];

  // Ici on attend la définition des technologies utilisées
  const technologies = [
    { name: "React", category: "Frontend", color: "bg-blue-500" },
    { name: "TypeScript", category: "Language", color: "bg-blue-600" },
    { name: "Tailwind CSS", category: "Styling", color: "bg-cyan-500" },
    { name: "Node.js", category: "Backend", color: "bg-green-500" },
    { name: "Express", category: "Framework", color: "bg-gray-600" },
    { name: "JSON Database", category: "Database", color: "bg-yellow-500" }
  ];

  // Ici on attend la définition des statistiques
  const stats = [
    { label: "Utilisateurs Actifs", value: "1,234", icon: Users },
    { label: "Ventes Traitées", value: "5,678", icon: ShoppingCart },
    { label: "Revenus Générés", value: "€89,012", icon: TrendingUp },
    { label: "Uptime", value: "99.9%", icon: Zap }
  ];

  // Ici on attend le rendu du composant
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        
        {/* Ici on attend la section d'en-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            À Propos de Gestion Vente
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Une solution complète pour la gestion de vos activités commerciales, 
            conçue pour optimiser vos performances et simplifier vos processus.
          </p>
        </div>

        {/* Ici on attend la section des fonctionnalités */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-4 mx-auto">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Ici on attend la section des statistiques */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Nos Performances</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Ici on attend la section des technologies */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Technologies Utilisées</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${tech.color}`}></div>
                    <div>
                      <h3 className="font-semibold text-lg">{tech.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{tech.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Ici on attend la section des valeurs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Nos Valeurs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Valeur 1: Simplicité */}
            <Card className="text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 mx-auto">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Simplicité</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Nous croyons que les outils de gestion doivent être intuitifs et faciles à utiliser, 
                  permettant à chacun de se concentrer sur son métier.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Valeur 2: Sécurité */}
            <Card className="text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 mx-auto">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  La protection de vos données est notre priorité absolue. 
                  Nous utilisons les dernières technologies de sécurité.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Valeur 3: Innovation */}
            <Card className="text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 mx-auto">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Nous évoluons constamment pour répondre aux besoins changeants 
                  du marché et de nos utilisateurs.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ici on attend la section de contact */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Prêt à Commencer ?</CardTitle>
              <CardDescription>
                Rejoignez les milliers d'entreprises qui font confiance à notre solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="secondary">Gratuit</Badge>
                <Badge variant="secondary">Facile à utiliser</Badge>
                <Badge variant="secondary">Support 24/7</Badge>
                <Badge variant="secondary">Sécurisé</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Commencez dès aujourd'hui et découvrez comment notre solution peut transformer votre entreprise.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Ici on a ajouté l'export par défaut du composant
export default AboutPage;
