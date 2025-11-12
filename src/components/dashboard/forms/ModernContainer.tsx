
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernContainerProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  gradient?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo' | 'pink' | 'neutral';
}

const ModernContainer: React.FC<ModernContainerProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
  headerActions,
  gradient = 'neutral'
}) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-blue-950/20',
    green: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/20 dark:via-gray-900 dark:to-emerald-950/20',
    red: 'bg-gradient-to-br from-rose-50 via-white to-rose-50 dark:from-rose-950/20 dark:via-gray-900 dark:to-rose-950/20',
    purple: 'bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-purple-950/20 dark:via-gray-900 dark:to-purple-950/20',
    orange: 'bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-orange-950/20 dark:via-gray-900 dark:to-orange-950/20',
    indigo: 'bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-indigo-950/20 dark:via-gray-900 dark:to-indigo-950/20',
    pink: 'bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-pink-950/20 dark:via-gray-900 dark:to-pink-950/20',
    neutral: 'bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800'
  };

  const iconGradients = {
    blue: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/30',
    green: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-lg shadow-emerald-500/30',
    red: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 shadow-lg shadow-rose-500/30',
    purple: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-lg shadow-purple-500/30',
    orange: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-lg shadow-orange-500/30',
    indigo: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/30',
    pink: 'bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 shadow-lg shadow-pink-500/30',
    neutral: 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 shadow-lg shadow-gray-500/30'
  };

  return (
    <Card className={cn(
      'relative overflow-hidden border-0 transition-all duration-500 rounded-xl',
      'hover:translate-y-[-4px]',
      gradientClasses[gradient],
      className
    )} style={{ boxShadow: 'var(--shadow-elegant)' }}>
      {/* Effet de brillance subtile */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
      
      {(title || Icon || headerActions) && (
        <CardHeader className="relative z-10 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {Icon && (
                <div className={cn(
                  'p-3 rounded-xl text-white',
                  iconGradients[gradient]
                )}>
                  <Icon className="h-6 w-6" />
                </div>
              )}
              {title && (
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                  {title}
                </CardTitle>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-3">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="relative z-10 pt-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default ModernContainer;
