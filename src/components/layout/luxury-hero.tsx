
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, TrendingUp } from 'lucide-react';

interface LuxuryHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundGradient?: string;
  icon?: React.ReactNode;
}

const LuxuryHero: React.FC<LuxuryHeroProps> = ({
  title,
  subtitle,
  description,
  backgroundGradient = "from-red-500/10 via-rose-500/10 to-pink-500/10",
  icon
}) => {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${backgroundGradient} dark:from-red-500/5 dark:via-rose-500/5 dark:to-pink-500/5`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-neutral-100/50 dark:bg-grid-neutral-800/50" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center justify-center mb-6"
            >
              <div className="bg-gradient-to-r from-red-500 to-rose-500 p-3 rounded-2xl shadow-xl">
                {icon}
              </div>
            </motion.div>
          )}
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-6"
          >
            {title}
          </motion.h1>
          
          {subtitle && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-4"
            >
              {subtitle}
            </motion.h2>
          )}
          
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed"
            >
              {description}
            </motion.p>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-8 text-sm text-neutral-500 dark:text-neutral-400"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-red-500" />
              <span>Qualité Premium</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Service Excellence</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Tendances 2025</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LuxuryHero;
