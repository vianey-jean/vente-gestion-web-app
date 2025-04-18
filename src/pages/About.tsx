
import React from 'react';
import Layout from '../components/Layout/Layout';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, Clock, Coffee, Headphones, LineChart, Shield, Star, ThumbsUp, Users, Zap } from 'lucide-react';

const About = () => {
  // Données pour la section Fonctionnalités
  const features = [
    {
      icon: <LineChart className="h-6 w-6 text-app-blue" />,
      title: "Rapports en temps réel",
      description: "Suivez vos performances commerciales avec des tableaux de bord actualisés en temps réel."
    },
    {
      icon: <Shield className="h-6 w-6 text-app-blue" />,
      title: "Sécurité avancée",
      description: "Protection des données avec un chiffrement de bout en bout et des sauvegardes automatiques."
    },
    {
      icon: <Zap className="h-6 w-6 text-app-blue" />,
      title: "Performance optimisée",
      description: "Interface rapide et réactive pour gérer vos ventes sans aucun délai."
    },
    {
      icon: <Users className="h-6 w-6 text-app-blue" />,
      title: "Multi-utilisateurs",
      description: "Autorisations personnalisables pour chaque membre de votre équipe."
    },
    {
      icon: <Clock className="h-6 w-6 text-app-blue" />,
      title: "Disponibilité 24/7",
      description: "Accédez à votre plateforme à tout moment, où que vous soyez."
    },
    {
      icon: <Headphones className="h-6 w-6 text-app-blue" />,
      title: "Support dédié",
      description: "Assistance technique réactive pour répondre à toutes vos questions."
    }
  ];

  // Données pour la section Témoignages
  const testimonials = [
    {
      name: "Marie Leroy",
      position: "Directrice commerciale, TechStore",
      quote: "Gestion Vente a complètement transformé notre façon de gérer notre inventaire et nos ventes. Nous avons augmenté notre efficacité de 30% dès le premier mois.",
      rating: 5
    },
    {
      name: "Thomas Durand",
      position: "Propriétaire, Boutique Mode Paris",
      quote: "Interface intuitive et rapports détaillés. C'est exactement ce dont j'avais besoin pour développer mon commerce.",
      rating: 5
    },
    {
      name: "Sophie Martin",
      position: "Responsable Boutique, Électro Plus",
      quote: "Le support client est exceptionnel. Toujours disponible pour répondre à nos questions et nous aider à optimiser l'utilisation du logiciel.",
      rating: 4
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">À propos de Gestion Vente</h1>
            <p className="text-xl text-gray-600 mb-8">
              Nous simplifions la gestion des ventes pour les entreprises de toutes tailles depuis 2020. Notre mission est de vous aider à optimiser votre activité commerciale grâce à des outils puissants et intuitifs.
            </p>
          </div>
        </div>
      </section>
      
      {/* Notre Histoire */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Notre Histoire</h2>
            <div className="prose max-w-none text-gray-600">
              <p className="mb-4">
                Gestion Vente est né d'une observation simple : de nombreuses petites et moyennes entreprises peinent à gérer efficacement leurs ventes et leur inventaire avec les outils traditionnels.
              </p>
              <p className="mb-4">
                Fondée en 2020 par une équipe d'experts en développement logiciel et en gestion commerciale, notre société s'est donnée pour mission de créer une solution complète qui répond aux besoins réels des commerçants.
              </p>
              <p className="mb-4">
                Après des mois de recherche et développement, en étroite collaboration avec des commerçants de différents secteurs, nous avons lancé la première version de notre plateforme en 2021. Depuis, nous n'avons cessé d'améliorer notre produit en fonction des retours utilisateurs.
              </p>
              <p>
                Aujourd'hui, Gestion Vente est utilisé par des centaines d'entreprises à travers la France et continue d'évoluer pour offrir les meilleures fonctionnalités à ses utilisateurs.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Notre Équipe */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-gray-800 text-center">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Membre 1 */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-1">Alexandre Dupont</h3>
              <p className="text-app-blue mb-2">Fondateur & CEO</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                Expert en technologies web avec plus de 15 ans d'expérience dans le développement de solutions SaaS.
              </p>
            </div>
            
            {/* Membre 2 */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-1">Claire Moreau</h3>
              <p className="text-app-blue mb-2">Directrice Produit</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                Passionnée d'UX/UI, Claire veille à ce que notre plateforme reste intuitive et agréable à utiliser.
              </p>
            </div>
            
            {/* Membre 3 */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-1">Michel Laurent</h3>
              <p className="text-app-blue mb-2">Responsable Support Client</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                Expert en satisfaction client, Michel dirige notre équipe de support technique avec passion.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Nos Valeurs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-gray-800 text-center">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Valeur 1 */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                  <ThumbsUp className="h-8 w-8 text-app-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Qualité</h3>
                <p className="text-gray-600">
                  Nous ne faisons jamais de compromis sur la qualité de nos produits et services. Chaque fonctionnalité est soigneusement développée et testée.
                </p>
              </CardContent>
            </Card>
            
            {/* Valeur 2 */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                  <Coffee className="h-8 w-8 text-app-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Simplicité</h3>
                <p className="text-gray-600">
                  Nous croyons en la puissance de la simplicité. Notre interface est conçue pour être intuitive et accessible à tous, sans nécessiter de formation complexe.
                </p>
              </CardContent>
            </Card>
            
            {/* Valeur 3 */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                  <Star className="h-8 w-8 text-app-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-gray-600">
                  Nous sommes constamment à la recherche de nouvelles façons d'améliorer notre produit et de répondre aux besoins évolutifs de nos clients.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Fonctionnalités */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-gray-800 text-center">Nos Fonctionnalités</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Témoignages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-gray-800 text-center">Témoignages Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.position}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
