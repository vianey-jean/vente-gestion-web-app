
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ModernCardProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
  headerActions
}) => {
  return (
    <Card className={`card-3d border-0 rounded-xl bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 ${className}`} style={{ boxShadow: 'var(--shadow-elegant)' }}>
      {(title || Icon || headerActions) && (
        <CardHeader className="pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {Icon && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shrink-0 shadow-lg shadow-blue-500/30">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              )}
              {title && (
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                  {title}
                </CardTitle>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-1.5 sm:space-x-2 w-full xs:w-auto">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-4 sm:pt-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default ModernCard;
