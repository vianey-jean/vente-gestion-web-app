
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernButtonProps extends ButtonProps {
  icon?: LucideIcon;
  gradient?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  isLoading?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  icon: Icon,
  gradient = 'blue',
  isLoading = false,
  children,
  className,
  ...props
}) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800',
    green: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800',
    red: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800',
    purple: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800',
    orange: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800'
  };

  return (
    <Button
      className={cn(
        'relative overflow-hidden text-white border-0 font-semibold',
        'transition-all duration-500 ease-out',
        'hover:scale-105 hover:shadow-2xl active:scale-95',
        'text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0',
        'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
        gradientClasses[gradient],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-1.5 sm:mr-2" />
        ) : (
          Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
        )}
        {children}
      </span>
    </Button>
  );
};

export default ModernButton;
