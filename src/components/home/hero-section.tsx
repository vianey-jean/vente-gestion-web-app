
import React from 'react';
import { motion } from 'framer-motion';
import LuxuryHero from '@/components/layout/luxury-hero';
import { Sparkles } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <LuxuryHero
      title="Riziky Boutique"
      subtitle="Spécialiste Produits Capillaires Premium"
      description="Votre destination beauté pour des produits de qualité premium qui subliment votre style naturel."
      icon={<Sparkles className="h-8 w-8 text-white" />}
    />
  );
};

export default HeroSection;
