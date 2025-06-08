
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LuxuryButtonProps extends ButtonProps {
  luxury?: 'primary' | 'secondary' | 'gold' | 'gradient';
  shimmer?: boolean;
}

const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  children,
  className,
  luxury = 'primary',
  shimmer = false,
  ...props
}) => {
  const luxuryStyles = {
    primary: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gradient-to-r from-neutral-100 to-neutral-200 hover:from-neutral-200 hover:to-neutral-300 text-neutral-900 shadow-md hover:shadow-lg dark:from-neutral-800 dark:to-neutral-700 dark:text-white",
    gold: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl",
    gradient: "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl"
  };

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="inline-block">
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300 border-0 font-semibold",
          luxuryStyles[luxury],
          shimmer && "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default LuxuryButton;
