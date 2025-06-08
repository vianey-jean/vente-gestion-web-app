
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LuxuryCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

const LuxuryCard: React.FC<LuxuryCardProps> = ({
  children,
  className,
  hover = true,
  gradient = false,
  shadow = 'lg'
}) => {
  const shadowClasses = {
    sm: 'shadow-sm hover:shadow-md',
    md: 'shadow-md hover:shadow-lg',
    lg: 'shadow-lg hover:shadow-xl',
    xl: 'shadow-xl hover:shadow-2xl'
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-neutral-200 dark:border-neutral-800 transition-all duration-300",
        shadowClasses[shadow],
        gradient 
          ? "bg-gradient-to-br from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"
          : "bg-white dark:bg-neutral-900",
        "backdrop-blur-sm",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default LuxuryCard;
