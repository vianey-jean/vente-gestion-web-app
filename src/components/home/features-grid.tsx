
import React from 'react';
import { motion } from 'framer-motion';
import LuxuryCard from '@/components/ui/luxury-card';
import { Shield, Truck, Star, Heart, Clock, Award } from 'lucide-react';

const features = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Paiement Sécurisé",
    description: "Transactions 100% sécurisées avec cryptage SSL",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <Truck className="h-8 w-8" />,
    title: "Livraison Rapide",
    description: "Livraison gratuite dès 50€ d'achat",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Star className="h-8 w-8" />,
    title: "Qualité Premium",
    description: "Produits sélectionnés avec soin",
    color: "from-amber-500 to-yellow-500"
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Service Client",
    description: "Support disponible 7j/7",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Retours Faciles",
    description: "30 jours pour changer d'avis",
    color: "from-purple-500 to-violet-500"
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Garantie Qualité",
    description: "Satisfaction garantie ou remboursé",
    color: "from-indigo-500 to-blue-500"
  }
];

const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent mb-4">
            Pourquoi Nous Choisir ?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Une expérience d'achat exceptionnelle avec des garanties solides
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <LuxuryCard className="p-6 text-center h-full" gradient>
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </LuxuryCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
