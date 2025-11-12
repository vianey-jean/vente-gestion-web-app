
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernActionButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  icon?: LucideIcon;
  gradient?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo' | 'pink' | 'teal';
  isLoading?: boolean;
  buttonSize?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
}

const ModernActionButton = React.forwardRef<HTMLButtonElement, ModernActionButtonProps>(({
  icon: Icon,
  gradient = 'blue',
  isLoading = false,
  buttonSize = 'md',
  variant = 'solid',
  children,
  className,
  ...props
}, ref) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-blue-500/30',
    green: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 shadow-emerald-500/30',
    red: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 shadow-rose-500/30',
    purple: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 shadow-purple-500/30',
    orange: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 shadow-orange-500/30',
    indigo: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:via-indigo-700 hover:to-indigo-800 shadow-indigo-500/30',
    pink: 'bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 shadow-pink-500/30',
    teal: 'bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:via-teal-700 hover:to-teal-800 shadow-teal-500/30'
  };

  const outlineClasses = {
    blue: 'border-2 border-blue-500 text-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-950/30 dark:hover:to-blue-900/30 shadow-blue-500/20',
    green: 'border-2 border-emerald-500 text-emerald-600 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-950/30 dark:hover:to-emerald-900/30 shadow-emerald-500/20',
    red: 'border-2 border-rose-500 text-rose-600 hover:bg-gradient-to-br hover:from-rose-50 hover:to-rose-100 dark:hover:from-rose-950/30 dark:hover:to-rose-900/30 shadow-rose-500/20',
    purple: 'border-2 border-purple-500 text-purple-600 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-950/30 dark:hover:to-purple-900/30 shadow-purple-500/20',
    orange: 'border-2 border-orange-500 text-orange-600 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/30 dark:hover:to-orange-900/30 shadow-orange-500/20',
    indigo: 'border-2 border-indigo-500 text-indigo-600 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-950/30 dark:hover:to-indigo-900/30 shadow-indigo-500/20',
    pink: 'border-2 border-pink-500 text-pink-600 hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100 dark:hover:from-pink-950/30 dark:hover:to-pink-900/30 shadow-pink-500/20',
    teal: 'border-2 border-teal-500 text-teal-600 hover:bg-gradient-to-br hover:from-teal-50 hover:to-teal-100 dark:hover:from-teal-950/30 dark:hover:to-teal-900/30 shadow-teal-500/20'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Button
      ref={ref}
      size={buttonSize === 'sm' ? 'sm' : buttonSize === 'lg' ? 'lg' : 'default'}
      className={cn(
        'relative overflow-hidden font-semibold transition-all duration-500 transform rounded-lg',
        'hover:shadow-2xl hover:scale-105 active:scale-95',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/25 before:to-white/0',
        'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
        sizeClasses[buttonSize],
        variant === 'solid' ? `${gradientClasses[gradient]} text-white border-0 shadow-xl` :
        variant === 'outline' ? `${outlineClasses[gradient]} bg-transparent shadow-lg hover:shadow-xl` :
        'bg-transparent hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 text-gray-700 dark:text-gray-300',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
        ) : (
          Icon && <Icon className={cn(iconSizes[buttonSize], "mr-2")} />
        )}
        {children}
      </div>
    </Button>
  );
});

ModernActionButton.displayName = 'ModernActionButton';

export default ModernActionButton;
